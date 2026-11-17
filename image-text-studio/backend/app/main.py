"""واجهة API لمنصة استبدال النصوص في الصور (FastAPI).

نقاط النهاية الأساسية:
  POST /api/detect                       رفع صورة -> اكتشاف وتحليل كل الكتل النصية
  POST /api/replace                      (image_id + edits) -> الصورة الناتجة بنفس الدقة
وأخرى للمحرر: جلب الجلسة، إضافة كتلة يدويًا، الخطوط، البحث والاستبدال، المعالجة الدفعية.
التوثيق التفاعلي (OpenAPI): /docs
"""
from __future__ import annotations

import io
import logging
import zipfile
from contextlib import asynccontextmanager
from pathlib import Path
from typing import Literal

import numpy as np
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse, Response
from PIL import Image, ImageOps
from pydantic import BaseModel, Field

from . import config
from .fonts import library
from .pipeline.engine import Engine, rules_to_edits
from .store import NotFound, Store

log = logging.getLogger("its")
Image.MAX_IMAGE_PIXELS = config.MAX_PIXELS

@asynccontextmanager
async def lifespan(_app: FastAPI):
    n = store.cleanup()
    if n:
        log.info("cleaned %d expired sessions", n)
    yield


app = FastAPI(
    lifespan=lifespan,
    title="Image Text Studio API",
    description="اكتشاف النصوص داخل الصور واستبدالها في نفس الموضع وبنفس الشكل البصري.",
    version="1.0.0",
)
app.add_middleware(CORSMiddleware, allow_origins=config.CORS_ORIGINS, allow_methods=["*"], allow_headers=["*"],
                   expose_headers=["X-Render-Ms", "Content-Disposition"])

store = Store(config.DATA_DIR)
engine = Engine(store)


# ------------------------------------------------------------------ نماذج البيانات
class ShadowIn(BaseModel):
    dx_px: float = 2
    dy_px: float = 2
    blur_px: float = 0
    color: str = "#000000"
    opacity: float = 0.8


class GradientIn(BaseModel):
    from_: str = Field("#ffffff", alias="from")
    to: str = "#000000"
    axis: Literal["v", "h"] = "v"

    model_config = {"populate_by_name": True}


class Edit(BaseModel):
    block_id: str
    text: str = ""
    remove: bool = False
    font_id: str | None = None
    size_px: float | None = Field(None, gt=0, le=4000)
    color: str | None = Field(None, pattern=r"^#[0-9a-fA-F]{6}$")
    gradient: GradientIn | None = None
    stroke_width_px: float | None = Field(None, ge=0, le=200)
    stroke_color: str | None = Field(None, pattern=r"^#[0-9a-fA-F]{6}$")
    shadow: ShadowIn | None = None
    blur_px: float | None = Field(None, ge=0, le=50)
    opacity: float | None = Field(None, ge=0, le=1)
    align: Literal["left", "right", "center"] | None = None
    fit: Literal["shrink", "fill", "none"] | None = None
    hscale: float | None = Field(None, ge=0.3, le=3)
    width_factor: float | None = Field(None, ge=0.2, le=5)
    dx: float = 0
    dy: float = 0
    grain: bool = True

    def to_engine(self) -> dict:
        d = self.model_dump(exclude_unset=True, by_alias=True)
        d["block_id"] = self.block_id
        d["text"] = self.text
        return d


class ReplaceIn(BaseModel):
    image_id: str
    edits: list[Edit] = []
    format: Literal["png", "jpeg", "jpg", "webp"] = "png"
    quality: int = Field(95, ge=30, le=100)
    max_side: int | None = Field(None, ge=64, le=16000, description="للمعاينة السريعة: تصغير الناتج")


class Rule(BaseModel):
    find: str
    replace: str = ""
    case_sensitive: bool = False
    whole_word: bool = False


class FindReplaceIn(BaseModel):
    image_id: str
    rules: list[Rule]
    edits: list[Edit] = []


class BatchIn(BaseModel):
    image_ids: list[str] = Field(..., min_length=1, max_length=100)
    rules: list[Rule] = Field(..., min_length=1)
    format: Literal["png", "jpeg", "jpg", "webp"] = "png"
    quality: int = Field(95, ge=30, le=100)


class BlockIn(BaseModel):
    quad: list[list[float]] = Field(..., min_length=4, max_length=4, description="[[x,y] x4] بترتيب tl,tr,br,bl")


# ------------------------------------------------------------------ أدوات
def _load_image(data: bytes) -> tuple[np.ndarray, np.ndarray | None]:
    try:
        im = Image.open(io.BytesIO(data))
        im = ImageOps.exif_transpose(im)
    except Image.DecompressionBombError as e:
        raise HTTPException(413, "الصورة كبيرة جدًا (الحد الأقصى 8K تقريبًا)") from e
    except Exception as e:  # noqa: BLE001
        raise HTTPException(415, "ملف صورة غير صالح. الصيغ المدعومة: PNG / JPG / WEBP") from e
    if im.width * im.height > config.MAX_PIXELS:
        raise HTTPException(413, "الصورة كبيرة جدًا (الحد الأقصى 8K تقريبًا)")
    alpha = None
    if im.mode in ("RGBA", "LA") or (im.mode == "P" and "transparency" in im.info):
        im = im.convert("RGBA")
        a = np.asarray(im)[..., 3]
        if a.min() < 255:
            alpha = a.copy()
    rgb = np.asarray(im.convert("RGB"))
    return np.ascontiguousarray(rgb[..., ::-1]), alpha


def _meta_or_404(image_id: str) -> dict:
    try:
        return store.meta(image_id)
    except NotFound as e:
        raise HTTPException(404, "الجلسة غير موجودة أو انتهت صلاحيتها") from e


def _public_meta(meta: dict) -> dict:
    out = dict(meta)
    out["blocks"] = [{k: v for k, v in b.items() if k not in ("background", "frame")} for b in meta["blocks"]]
    return out


def _filename(image_id: str, fmt: str) -> str:
    stem = Path(store.name(image_id)).stem or "image"
    ext = "jpg" if fmt in ("jpg", "jpeg") else fmt
    return f"{stem}-edited.{ext}"


# ------------------------------------------------------------------ نقاط النهاية
@app.get("/api/health")
def health() -> dict:
    return {"status": "ok", "fonts": len(library().fonts), "lama": bool(config.LAMA_ONNX_PATH),
            "google_vision": bool(config.GOOGLE_VISION_API_KEY)}


@app.post("/api/detect", summary="رفع صورة واكتشاف كل النصوص وأنماطها")
async def detect(file: UploadFile = File(...)) -> dict:
    data = await file.read()
    if len(data) > config.MAX_UPLOAD_MB * 1024 * 1024:
        raise HTTPException(413, f"حجم الملف يتجاوز {config.MAX_UPLOAD_MB}MB")
    bgr, alpha = _load_image(data)
    image_id = store.new_id()
    store.save_original(image_id, bgr, alpha, file.filename or "image.png")
    try:
        from starlette.concurrency import run_in_threadpool

        meta = await run_in_threadpool(engine.analyze_image, image_id)
    except Exception as e:  # noqa: BLE001
        log.exception("analysis failed")
        store.delete(image_id)
        raise HTTPException(500, f"فشل تحليل الصورة: {e}") from e
    return _public_meta(meta)


@app.get("/api/images/{image_id}", summary="بيانات جلسة صورة")
def get_image(image_id: str) -> dict:
    return _public_meta(_meta_or_404(image_id))


@app.get("/api/images/{image_id}/original", summary="الصورة الأصلية")
def get_original(image_id: str, max_side: int | None = None):
    _meta_or_404(image_id)
    img = store.original(image_id)
    data, mime = engine.encode(image_id, img, "jpeg" if max_side else "png", 90, max_side)
    return Response(data, media_type=mime, headers={"Cache-Control": "private, max-age=86400"})


@app.delete("/api/images/{image_id}")
def delete_image(image_id: str) -> dict:
    _meta_or_404(image_id)
    store.delete(image_id)
    return {"ok": True}


@app.post("/api/images/{image_id}/blocks", summary="إضافة كتلة يدويًا لنص لم يُكتشف")
def add_block(image_id: str, body: BlockIn) -> dict:
    _meta_or_404(image_id)
    b = engine.add_block(image_id, body.quad)
    return {k: v for k, v in b.items() if k not in ("background", "frame")}


@app.delete("/api/images/{image_id}/blocks/{block_id}")
def delete_block(image_id: str, block_id: str) -> dict:
    _meta_or_404(image_id)
    engine.delete_block(image_id, block_id)
    return {"ok": True}


@app.post("/api/replace", summary="تطبيق الاستبدالات وإرجاع الصورة الناتجة")
def replace(body: ReplaceIn):
    import time

    _meta_or_404(body.image_id)
    t = time.time()
    img = engine.render(body.image_id, [e.to_engine() for e in body.edits])
    data, mime = engine.encode(body.image_id, img, body.format, body.quality, body.max_side)
    headers = {"X-Render-Ms": str(int((time.time() - t) * 1000))}
    if not body.max_side:
        headers["Content-Disposition"] = f'attachment; filename="{_filename(body.image_id, body.format)}"'
    return Response(data, media_type=mime, headers=headers)


@app.post("/api/find-replace", summary="بحث واستبدال: يحوّل القواعد إلى تعديلات")
def find_replace(body: FindReplaceIn) -> dict:
    meta = _meta_or_404(body.image_id)
    edits = rules_to_edits(meta["blocks"], [r.model_dump() for r in body.rules],
                           [e.to_engine() for e in body.edits])
    return {"edits": edits, "changed": len(edits)}


@app.post("/api/batch", summary="معالجة دفعية: نفس قواعد الاستبدال على عدة صور -> ملف ZIP")
def batch(body: BatchIn):
    buf = io.BytesIO()
    report = []
    with zipfile.ZipFile(buf, "w", zipfile.ZIP_STORED) as z:
        for iid in body.image_ids:
            meta = _meta_or_404(iid)
            edits = rules_to_edits(meta["blocks"], [r.model_dump() for r in body.rules])
            img = engine.render(iid, edits)
            data, _ = engine.encode(iid, img, body.format, body.quality)
            name = _filename(iid, body.format)
            z.writestr(name, data)
            report.append({"image_id": iid, "file": name, "changed_blocks": len(edits)})
        import json

        z.writestr("report.json", json.dumps(report, ensure_ascii=False, indent=1))
    return Response(buf.getvalue(), media_type="application/zip",
                    headers={"Content-Disposition": 'attachment; filename="batch-edited.zip"'})


@app.get("/api/fonts", summary="مكتبة الخطوط")
def fonts() -> list[dict]:
    return [f.public() for f in sorted(library().fonts.values(), key=lambda f: (f.script != "arabic", f.family, f.weight))]


@app.get("/api/fonts/{font_id}/file", summary="ملف الخط (لمعاينة الواجهة)")
def font_file(font_id: str):
    f = library().fonts.get(font_id)
    if not f:
        raise HTTPException(404, "الخط غير موجود")
    return FileResponse(f.path, media_type="font/ttf", headers={"Cache-Control": "public, max-age=604800"})


@app.post("/api/fonts", summary="رفع خط مخصص TTF/OTF")
async def upload_font(file: UploadFile = File(...)) -> dict:
    data = await file.read()
    if len(data) > 30 * 1024 * 1024:
        raise HTTPException(413, "ملف الخط كبير جدًا")
    try:
        return library().add_custom(data, file.filename or "font.ttf").public()
    except ValueError as e:
        raise HTTPException(400, str(e)) from e


@app.exception_handler(NotFound)
def _nf(_, __):
    return JSONResponse({"detail": "غير موجود"}, status_code=404)
