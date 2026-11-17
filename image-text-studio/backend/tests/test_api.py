"""اختبارات واجهة الـ API من البداية للنهاية."""
from __future__ import annotations

import io
import os
import tempfile
import zipfile

import cv2
import numpy as np
import pytest

os.environ.setdefault("ITS_DATA_DIR", tempfile.mkdtemp())

from fastapi.testclient import TestClient  # noqa: E402

from app.main import app  # noqa: E402
from synth import make_cases  # noqa: E402

client = TestClient(app)


@pytest.fixture(scope="module")
def uploaded():
    case = make_cases()[0]
    ok, buf = cv2.imencode(".png", case.image)
    r = client.post("/api/detect", files={"file": ("poster.png", buf.tobytes(), "image/png")})
    assert r.status_code == 200, r.text
    return r.json(), case


def test_health():
    r = client.get("/api/health")
    assert r.status_code == 200 and r.json()["fonts"] > 20


def test_detect_returns_blocks(uploaded):
    meta, case = uploaded
    assert meta["width"] == case.image.shape[1] and meta["height"] == case.image.shape[0]
    assert len(meta["blocks"]) >= len(case.texts)
    b = meta["blocks"][0]
    for k in ("id", "quad", "text", "style", "placement", "angle", "direction"):
        assert k in b
    assert len(b["quad"]) == 4
    assert b["style"]["font_candidates"]


def test_replace_full_resolution(uploaded):
    meta, case = uploaded
    edits = [{"block_id": meta["blocks"][0]["id"], "text": "نص جديد تمامًا"}]
    r = client.post("/api/replace", json={"image_id": meta["image_id"], "edits": edits, "format": "png"})
    assert r.status_code == 200
    img = cv2.imdecode(np.frombuffer(r.content, np.uint8), cv2.IMREAD_COLOR)
    assert img.shape == case.image.shape
    assert "attachment" in r.headers.get("content-disposition", "")


def test_replace_preview_and_formats(uploaded):
    meta, _ = uploaded
    for fmt, mime in (("jpeg", "image/jpeg"), ("webp", "image/webp")):
        r = client.post("/api/replace", json={"image_id": meta["image_id"], "edits": [], "format": fmt,
                                              "max_side": 400})
        assert r.status_code == 200 and r.headers["content-type"] == mime


def test_style_overrides(uploaded):
    meta, _ = uploaded
    bid = meta["blocks"][0]["id"]
    r = client.post("/api/replace", json={"image_id": meta["image_id"], "edits": [{
        "block_id": bid, "text": "Test", "font_id": "roboto-700", "size_px": 40, "color": "#00ff00",
        "stroke_width_px": 2, "stroke_color": "#000000", "shadow": {"dx_px": 3, "dy_px": 3},
        "align": "center", "fit": "none"}]})
    assert r.status_code == 200


def test_find_replace(uploaded):
    meta, _ = uploaded
    r = client.post("/api/find-replace", json={"image_id": meta["image_id"],
                                               "rules": [{"find": "Delivery", "replace": "Shipping"}]})
    assert r.status_code == 200
    edits = r.json()["edits"]
    assert any("Shipping" in e["text"] for e in edits)


def test_manual_block(uploaded):
    meta, case = uploaded
    q = case.texts[1].quad.tolist()
    r = client.post(f"/api/images/{meta['image_id']}/blocks", json={"quad": q})
    assert r.status_code == 200 and r.json()["manual"] is True


def test_batch_zip(uploaded):
    meta, _ = uploaded
    r = client.post("/api/batch", json={"image_ids": [meta["image_id"]],
                                        "rules": [{"find": "Free", "replace": "Fast"}]})
    assert r.status_code == 200
    z = zipfile.ZipFile(io.BytesIO(r.content))
    assert "report.json" in z.namelist() and len(z.namelist()) == 2


def test_fonts_and_upload():
    r = client.get("/api/fonts")
    assert r.status_code == 200
    fonts = r.json()
    assert any(f["script"] == "arabic" for f in fonts) and any(f["script"] == "latin" for f in fonts)
    assert client.get(f"/api/fonts/{fonts[0]['id']}/file").status_code == 200
    bad = client.post("/api/fonts", files={"file": ("x.ttf", b"not a font", "font/ttf")})
    assert bad.status_code == 400


def test_errors():
    assert client.get("/api/images/0000000000000000").status_code == 404
    assert client.get("/api/images/../../etc").status_code == 404
    r = client.post("/api/detect", files={"file": ("x.png", b"garbage", "image/png")})
    assert r.status_code == 415


def test_transparent_png_keeps_alpha():
    img = np.zeros((200, 400, 4), np.uint8)
    cv2.putText(img, "HELLO", (40, 130), cv2.FONT_HERSHEY_DUPLEX, 3, (255, 255, 255, 255), 6)
    ok, buf = cv2.imencode(".png", img)
    r = client.post("/api/detect", files={"file": ("t.png", buf.tobytes(), "image/png")})
    assert r.status_code == 200
    iid = r.json()["image_id"]
    r = client.post("/api/replace", json={"image_id": iid, "edits": [], "format": "png"})
    out = cv2.imdecode(np.frombuffer(r.content, np.uint8), cv2.IMREAD_UNCHANGED)
    assert out.shape[2] == 4
