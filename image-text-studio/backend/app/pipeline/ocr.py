"""التعرّف على النص (OCR) بأسلوب ensemble:

- Tesseract (ara / eng) على قناع النص النظيف (أسود على أبيض) المستخرج في analyze.py —
  إزالة الخلفية والحدود والظل قبل التعرف ترفع الدقة كثيرًا، خصوصًا للعربية.
- PP-OCR (rapidocr) على القصاصة الملونة المقوَّمة — ممتاز للاتينية والأرقام.
- Google Cloud Vision (اختياري عند ضبط GOOGLE_VISION_API_KEY) للحالات منخفضة الثقة.
نختار النتيجة الأعلى ثقة مع مراعاة نوع الكتابة.
"""
from __future__ import annotations

import base64
import os

os.environ.setdefault("OMP_THREAD_LIMIT", "1")  # تشغيل Tesseract المتوازي بدون تنافس OpenMP (يسرّع ~100x)
import json
import re
import urllib.request

import cv2
import numpy as np
import pytesseract

from .. import config
from ..fonts import ARABIC_RE, LATIN_RE
from .detect import get_recognizer

_TATWEEL = "ـ"


def _tesseract(img_gray: np.ndarray, lang: str) -> tuple[str, float]:
    try:
        d = pytesseract.image_to_data(img_gray, lang=lang, config="--psm 7 --oem 1",
                                      output_type=pytesseract.Output.DICT)
    except Exception:  # noqa: BLE001
        return "", 0.0
    words = [(w, float(c)) for w, c in zip(d["text"], d["conf"]) if str(w).strip() and float(c) >= 0]
    if not words:
        return "", 0.0
    text = " ".join(w for w, _ in words)
    conf = float(np.average([c for _, c in words], weights=[len(w) for w, _ in words])) / 100.0
    return _clean(text), conf


def _clean(t: str) -> str:
    t = t.replace(_TATWEEL, "").replace("‏", "").replace("‎", "")
    return re.sub(r"\s+", " ", t).strip()


def _script_ratio(t: str) -> tuple[float, float]:
    letters = [c for c in t if c.isalpha()]
    if not letters:
        return 0.0, 0.0
    ar = sum(1 for c in letters if ARABIC_RE.match(c)) / len(letters)
    la = sum(1 for c in letters if LATIN_RE.match(c)) / len(letters)
    return ar, la


def prepare_binary(mask: np.ndarray, target_h: int = 56) -> np.ndarray | None:
    """قناع النص (0..1) -> صورة رمادية أسود على أبيض بارتفاع مناسب لـ Tesseract."""
    ys, xs = np.nonzero(mask > 0.4)
    if len(xs) < 8:
        return None
    crop = mask[ys.min():ys.max() + 1, xs.min():xs.max() + 1]
    s = target_h / max(crop.shape[0], 1)
    crop = cv2.resize(crop, None, fx=s, fy=s, interpolation=cv2.INTER_CUBIC if s > 1 else cv2.INTER_AREA)
    img = (255 - np.clip(crop, 0, 1) * 255).astype(np.uint8)
    pad = target_h // 3
    return cv2.copyMakeBorder(img, pad, pad, pad, pad, cv2.BORDER_CONSTANT, value=255)


def _google_vision(img_bgr: np.ndarray) -> tuple[str, float]:
    if not config.GOOGLE_VISION_API_KEY:
        return "", 0.0
    ok, buf = cv2.imencode(".png", img_bgr)
    body = json.dumps({"requests": [{
        "image": {"content": base64.b64encode(buf.tobytes()).decode()},
        "features": [{"type": "TEXT_DETECTION"}],
        "imageContext": {"languageHints": ["ar", "en"]}}]}).encode()
    req = urllib.request.Request(
        f"https://vision.googleapis.com/v1/images:annotate?key={config.GOOGLE_VISION_API_KEY}",
        data=body, headers={"Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=10) as r:
            res = json.loads(r.read())["responses"][0]
        text = res.get("fullTextAnnotation", {}).get("text", "")
        return _clean(text), 0.9 if text else 0.0
    except Exception:  # noqa: BLE001
        return "", 0.0


def recognize(color_crop_bgr: np.ndarray, text_mask: np.ndarray) -> dict:
    """يرجع {"text", "confidence", "engine", "script"}."""
    cands: list[tuple[str, float, str]] = []
    binimg = prepare_binary(text_mask)
    if binimg is not None:
        ta, ca = _tesseract(binimg, "ara")
        ar, _ = _script_ratio(ta)
        if ta and ar >= 0.5:
            cands.append((ta, ca * (0.85 + 0.15 * ar), "tesseract-ara"))
        te, ce = _tesseract(binimg, "eng")
        _, la = _script_ratio(te)
        if te and (la >= 0.5 or not any(c.isalpha() for c in te)):
            cands.append((te, ce * 0.95, "tesseract-eng"))
    try:
        res = get_recognizer()([color_crop_bgr])
        rec = res[0] if isinstance(res, tuple) else res
        if rec and rec[0]:
            tr, cr = rec[0][0], float(rec[0][1])
            ar, la = _script_ratio(tr)
            # نموذج PP-OCR هنا صيني/لاتيني: لا نثق به إلا للاتينية والأرقام
            if tr and ar == 0 and not re.search(r"[一-鿿]", tr):
                cands.append((_clean(tr), cr * (1.0 if la >= 0.5 or not any(c.isalpha() for c in tr) else 0.6),
                              "ppocr"))
    except Exception:  # noqa: BLE001
        pass

    best = max(cands, key=lambda c: c[1]) if cands else ("", 0.0, "none")
    if best[1] < 0.6 and config.GOOGLE_VISION_API_KEY:
        tg, cg = _google_vision(color_crop_bgr)
        if tg and cg > best[1]:
            best = (tg.replace("\n", " "), cg, "google-vision")
    ar, la = _script_ratio(best[0])
    return {"text": best[0], "confidence": round(best[1], 3), "engine": best[2],
            "script": "arabic" if ar >= la and ar > 0 else "latin"}
