"""المحرك: يربط الاكتشاف والتحليل وإعادة بناء الخلفية والرسم في عمليتين:

  analyze_image(img)        -> قائمة الكتل النصية بأنماطها (تُحفظ في الجلسة)
  render(image_id, edits)   -> الصورة بعد الاستبدال بنفس الدقة الأصلية

التعديلات (edits) عديمة الحالة: كل طلب رسم يحمل قائمة التعديلات كاملة، فيصبح التراجع والإعادة
في الواجهة مجرد تبديل للقائمة. إعادة بناء الخلفية لكل كتلة تُحسب مرة واحدة وتُخزن.
"""
from __future__ import annotations

import io
import re
import time
from concurrent.futures import ThreadPoolExecutor

import cv2
import numpy as np
from PIL import Image

from ..fonts import FontLibrary, has_arabic, library
from ..store import Store
from .analyze import analyze_block, hex_rgb
from .detect import detect_text
from .geometry import Frame, order_quad, warp_layer_to_image
from .inpaint import clean_block
from .render import Placement, TextStyle, ink_bbox, render_layer, shape_mask

FIT_MODES = ("shrink", "fill", "none")


class Engine:
    def __init__(self, store: Store, fonts: FontLibrary | None = None, workers: int = 4):
        self.store = store
        self.fonts = fonts or library()
        self.pool = ThreadPoolExecutor(max_workers=workers)

    # ------------------------------------------------------------ التحليل
    def analyze_image(self, image_id: str) -> dict:
        t0 = time.time()
        img = self.store.original(image_id)
        h, w = img.shape[:2]
        quads = detect_text(img)
        t_det = time.time() - t0
        results = list(self.pool.map(lambda q: analyze_block(img, q, self.fonts, w / 2), quads))
        blocks = []
        for i, (b, masks) in enumerate(results):
            b["id"] = f"b{i}"
            b["manual"] = False
            self.store.save_mask(image_id, b["id"], masks["glyph"])
            blocks.append(b)
        infer_paragraphs(blocks)
        meta = {"image_id": image_id, "width": w, "height": h, "name": self.store.name(image_id),
                "blocks": blocks, "timing": {"detect": round(t_det, 3), "total": round(time.time() - t0, 3)}}
        self.store.save_meta(image_id, meta)
        # احسب إعادة بناء الخلفية مسبقًا في الخلفية لتسريع أول استبدال
        for b in blocks:
            self.pool.submit(self._ensure_clean, image_id, b)
        return meta

    def add_block(self, image_id: str, quad: list[list[float]]) -> dict:
        """إضافة كتلة يدويًا (عندما يرسم المستخدم مربعًا حول نص لم يُكتشف)."""
        img = self.store.original(image_id)
        meta = self.store.meta(image_id)
        b, masks = analyze_block(img, order_quad(np.float32(quad)), self.fonts, img.shape[1] / 2)
        n = max([int(x["id"][1:]) for x in meta["blocks"]] + [-1]) + 1
        b["id"] = f"b{n}"
        b["manual"] = True
        b["paragraph"] = f"p{n}m"
        self.store.save_mask(image_id, b["id"], masks["glyph"])
        meta["blocks"].append(b)
        self.store.save_meta(image_id, meta)
        return b

    def delete_block(self, image_id: str, block_id: str) -> None:
        meta = self.store.meta(image_id)
        meta["blocks"] = [b for b in meta["blocks"] if b["id"] != block_id]
        self.store.save_meta(image_id, meta)
        self.store.drop_clean(image_id, block_id)

    def _ensure_clean(self, image_id: str, block: dict) -> dict | None:
        c = self.store.clean(image_id, block["id"])
        if c is None:
            img = self.store.original(image_id)
            c = clean_block(img, block, self.store.mask(image_id, block["id"]).astype(np.float32))
            if c is not None:
                self.store.save_clean(image_id, block["id"], c)
        return c

    # ------------------------------------------------------------ الرسم
    def render(self, image_id: str, edits: list[dict]) -> np.ndarray:
        img = self.store.original(image_id).copy()
        meta = self.store.meta(image_id)
        blocks = {b["id"]: b for b in meta["blocks"]}
        active = [(blocks[e["block_id"]], e) for e in edits if e.get("block_id") in blocks]
        if not active:
            return img
        cleans = list(self.pool.map(lambda be: self._ensure_clean(image_id, be[0]), active))
        for c in cleans:
            if c is None:
                continue
            x0, y0, x1, y1 = c["roi"]
            a = (c["alpha"].astype(np.float32) / 255)[..., None]
            reg = img[y0:y1, x0:x1].astype(np.float32)
            img[y0:y1, x0:x1] = np.clip(reg * (1 - a) + c["fill"].astype(np.float32) * a, 0, 255).astype(np.uint8)
        for b, e in active:
            if e.get("remove") or not (e.get("text") or "").strip():
                continue
            self._draw(img, b, e)
        return img

    def _draw(self, img: np.ndarray, b: dict, e: dict) -> None:
        fr = Frame.from_dict(b["frame"])
        s = fr.scale
        st0, pl0 = b["style"], b["placement"]
        text = e["text"]
        font_id = e.get("font_id") or st0["font_id"]
        font = self.fonts.get(font_id)
        if has_arabic(text) and font.script != "arabic" and not font.custom:
            font = self.fonts.default_for(text)  # الخط المختار لا يحتوي حروفًا عربية
        size = float(e["size_px"]) * s if e.get("size_px") else st0["size_px"] * s
        hscale = float(e.get("hscale", st0.get("hscale", 1.0)))
        fit = e.get("fit") or ("none" if e.get("size_px") else "shrink")
        align = e.get("align") or pl0["align"]
        tx0, ty0, tx1, ty1 = pl0["ink"]
        avail = (tx1 - tx0) * float(e.get("width_factor", 1.0))

        # الملاءمة التلقائية داخل نفس المساحة
        factor = 1.0
        if fit != "none":
            m, _ = shape_mask(text, font.path, size)
            bb = ink_bbox(m)
            w_new = (bb[2] - bb[0]) * hscale if bb else 0
            if w_new > 0:
                r = avail / w_new
                if fit == "shrink" and r < 1.0:
                    factor = max(r, 0.3)
                elif fit == "fill":
                    factor = float(np.clip(r, 0.3, 1.3))
                    rest = r / factor
                    hscale *= float(np.clip(rest, 0.85, 1.15))
        size *= factor
        cy = (ty0 + ty1) / 2
        baseline = cy + (pl0["baseline_y"] - cy) * factor
        anchor = {"left": tx0, "right": tx1, "center": (tx0 + tx1) / 2}[align]

        grad = e["gradient"] if "gradient" in e else st0.get("gradient")
        shadow = e["shadow"] if "shadow" in e else st0.get("shadow")
        style = TextStyle(
            font_path=font.path,
            size=size,
            color=hex_rgb(e.get("color") or st0["color"]),
            gradient={"from": hex_rgb(grad["from"]), "to": hex_rgb(grad["to"]), "axis": grad.get("axis", "v")}
            if grad else None,
            stroke_width=float(e.get("stroke_width_px", st0["stroke_width_px"])) * s * (factor if fit != "none" else 1),
            stroke_color=hex_rgb(e.get("stroke_color") or st0["stroke_color"]),
            shadow={"dx": shadow.get("dx_px", 0) * s, "dy": shadow.get("dy_px", 0) * s,
                    "blur": shadow.get("blur_px", 0) * s, "color": hex_rgb(shadow.get("color", "#000000")),
                    "opacity": float(shadow.get("opacity", 0.8))} if shadow else None,
            opacity=float(e.get("opacity", st0.get("opacity", 1.0))),
            blur=float(e.get("blur_px", st0.get("blur_px", 0.0))) * s,
            hscale=hscale,
        )
        layer, (ox, oy) = render_layer(text, style, Placement(align, float(anchor), float(baseline)))
        dx, dy = float(e.get("dx", 0)), float(e.get("dy", 0))
        Ti = np.array([[1, 0, dx], [0, 1, dy], [0, 0, 1]], np.float64)
        Tf = np.array([[1, 0, ox], [0, 1, oy], [0, 0, 1]], np.float64)
        layer_bgr = np.dstack([layer[..., 2], layer[..., 1], layer[..., 0], layer[..., 3]])
        res = warp_layer_to_image(layer_bgr, Ti @ fr.H @ Tf, img.shape[:2])
        if res is None:
            return
        warped, (x0, y0, x1, y1) = res
        a = warped[..., 3:4]
        reg = img[y0:y1, x0:x1].astype(np.float32) / 255
        out = warped[..., :3] + reg * (1 - a)
        grain = float(b.get("grain", 0.0))
        if grain > 0.6 and e.get("grain", True):
            noise = np.random.default_rng(7).normal(0, grain / 255, out.shape).astype(np.float32)
            out += noise * a
        img[y0:y1, x0:x1] = np.clip(out * 255 + 0.5, 0, 255).astype(np.uint8)

    # ------------------------------------------------------------ أدوات
    def encode(self, image_id: str, img: np.ndarray, fmt: str = "png", quality: int = 95,
               max_side: int | None = None) -> tuple[bytes, str]:
        alpha = self.store.alpha(image_id)
        if max_side and max(img.shape[:2]) > max_side:
            s = max_side / max(img.shape[:2])
            img = cv2.resize(img, None, fx=s, fy=s, interpolation=cv2.INTER_AREA)
            if alpha is not None:
                alpha = cv2.resize(alpha, (img.shape[1], img.shape[0]), interpolation=cv2.INTER_AREA)
        rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        fmt = fmt.lower()
        buf = io.BytesIO()
        if fmt in ("jpg", "jpeg"):
            Image.fromarray(rgb).save(buf, "JPEG", quality=int(quality), subsampling=0, optimize=True)
            return buf.getvalue(), "image/jpeg"
        pil = Image.fromarray(np.dstack([rgb, alpha]) if alpha is not None else rgb)
        if fmt == "webp":
            pil.save(buf, "WEBP", quality=int(quality), lossless=quality >= 100, method=4)
            return buf.getvalue(), "image/webp"
        pil.save(buf, "PNG", compress_level=1 if max_side else 6)
        return buf.getvalue(), "image/png"


def rules_to_edits(blocks: list[dict], rules: list[dict], base: list[dict] | None = None) -> list[dict]:
    """بحث واستبدال: يحوّل قواعد {"find","replace","whole_word","case_sensitive"} إلى تعديلات على الكتل."""
    edits = {e["block_id"]: dict(e) for e in (base or [])}
    for b in blocks:
        cur = edits.get(b["id"], {}).get("text", b["text"])
        new = cur
        for r in rules:
            f = r.get("find", "")
            if not f:
                continue
            flags = 0 if r.get("case_sensitive") else re.IGNORECASE
            pat = re.escape(f)
            if r.get("whole_word"):
                pat = rf"(?<!\w){pat}(?!\w)"
            new = re.sub(pat, lambda _m, rep=r.get("replace", ""): rep, new, flags=flags)
        if new != cur:
            e = edits.setdefault(b["id"], {"block_id": b["id"]})
            e["text"] = new
    return list(edits.values())


def infer_paragraphs(blocks: list[dict]) -> None:
    """يجمع الأسطر المتتالية المتشابهة في فقرات، ويستنتج محاذاة الفقرة (يمين/يسار/وسط)."""
    n = len(blocks)
    parent = list(range(n))

    def find(i):
        while parent[i] != i:
            parent[i] = parent[parent[i]]
            i = parent[i]
        return i

    geo = []
    for b in blocks:
        q = np.array(b["quad"])
        hh = float(np.linalg.norm(q[3] - q[0]))
        geo.append((q[:, 0].min(), q[:, 0].max(), q[:, 1].mean(), hh, b["angle"], b["style"]["font_id"]))
    for i in range(n):
        for j in range(i + 1, n):
            a, c = geo[i], geo[j]
            if abs(a[4] - c[4]) > 2 or max(a[3], c[3]) / max(min(a[3], c[3]), 1) > 1.3:
                continue
            if abs(a[2] - c[2]) > 2.2 * max(a[3], c[3]):
                continue
            if min(a[1], c[1]) - max(a[0], c[0]) < 0.2 * min(a[1] - a[0], c[1] - c[0]):
                continue
            parent[find(j)] = find(i)
    groups: dict[int, list[int]] = {}
    for i in range(n):
        groups.setdefault(find(i), []).append(i)
    for gi, idx in enumerate(groups.values()):
        for i in idx:
            blocks[i]["paragraph"] = f"p{gi}"
        if len(idx) < 2:
            continue
        lefts = np.array([geo[i][0] for i in idx])
        rights = np.array([geo[i][1] for i in idx])
        centers = (lefts + rights) / 2
        hmean = float(np.mean([geo[i][3] for i in idx]))
        stds = {"left": lefts.std(), "right": rights.std(), "center": centers.std()}
        align = min(stds, key=stds.get)
        if stds[align] > 0.35 * hmean:
            continue
        for i in idx:
            b = blocks[i]
            tx0, _, tx1, _ = b["placement"]["ink"]
            b["placement"]["align"] = align
            b["placement"]["anchor_x"] = float({"left": tx0, "right": tx1, "center": (tx0 + tx1) / 2}[align])
            b["style"]["align"] = align
