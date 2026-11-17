"""مسح النص الأصلي وإعادة بناء الخلفية خلفه (Inpainting).

ثلاث استراتيجيات تُختار تلقائيًا حسب الخلفية:
  1. خلفية سادة/متدرجة: نموذج الخلفية التربيعي المستخرج في التحليل + ضجيج مطابق لحبيبات الصورة.
     فوري ودقيق بلا أي بقع.
  2. خلفية مزدحمة/منقوشة: LaMa (ONNX) إن وُفّر ملف النموذج عبر LAMA_ONNX_PATH،
     وإلا Shift-Map من OpenCV (يعيد بناء النقوش والخطوط بنسخ رقع من الصورة نفسها).
  3. أقنعة صغيرة جدًا: Telea السريع.
القناع يُبنى من بكسلات الحروف فقط (حشو + حدود + ظل) مع توسيع خفيف يشمل حواف التنعيم.
"""
from __future__ import annotations

import threading

import cv2
import numpy as np

from .. import config
from .geometry import Frame, warp_layer_to_image

_lama = None
_lama_lock = threading.Lock()


def _lama_session():
    global _lama
    if not config.LAMA_ONNX_PATH:
        return None
    with _lama_lock:
        if _lama is None:
            import onnxruntime as ort

            _lama = ort.InferenceSession(config.LAMA_ONNX_PATH, providers=ort.get_available_providers())
    return _lama


def _lama_inpaint(region: np.ndarray, mask: np.ndarray) -> np.ndarray | None:
    """LaMa بصيغة ONNX (مثل lama_fp32.onnx بمدخل 512x512). يرجع None إن لم يتوفر."""
    sess = _lama_session()
    if sess is None:
        return None
    h, w = mask.shape
    S = 512
    img = cv2.resize(region, (S, S), interpolation=cv2.INTER_AREA)[..., ::-1].astype(np.float32) / 255
    m = (cv2.resize(mask, (S, S), interpolation=cv2.INTER_NEAREST) > 0).astype(np.float32)
    inputs = sess.get_inputs()
    feeds = {inputs[0].name: img.transpose(2, 0, 1)[None], inputs[1].name: m[None, None]}
    out = sess.run(None, feeds)[0][0].transpose(1, 2, 0)
    if out.max() <= 1.5:
        out = out * 255
    out = np.clip(out, 0, 255).astype(np.uint8)[..., ::-1]
    return cv2.resize(out, (w, h), interpolation=cv2.INTER_CUBIC)


def _lab_coef_to_bgr(coef: np.ndarray, w: int, h: int) -> np.ndarray:
    vv, uu = np.mgrid[0:h, 0:w].astype(np.float32)
    uu /= max(w, 1)
    vv /= max(h, 1)
    F = np.stack([np.ones_like(uu), uu, vv, uu * uu, uu * vv, vv * vv], axis=-1)
    lab = (F @ coef).astype(np.float32)
    return np.clip(cv2.cvtColor(lab, cv2.COLOR_Lab2BGR) * 255, 0, 255).astype(np.float32)


def build_image_mask(block: dict, glyph: np.ndarray, img_shape: tuple[int, int]):
    """قناع بكسلات النص في إحداثيات الصورة: (قناع ROI ثنائي، (x0,y0,x1,y1))."""
    fr = Frame.from_dict(block["frame"])
    u0, v0, u1, v1 = fr.core
    ch = v1 - v0
    m = (glyph.astype(np.float32) > 0.12).astype(np.uint8)
    k = max(3, int(round(0.07 * ch)) | 1)
    m = cv2.dilate(m, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (k, k))).astype(np.float32)
    res = warp_layer_to_image(m, fr.H, img_shape, pad=4)
    if res is None:
        return None
    mi, roi = res
    mi = (mi > 0.08).astype(np.uint8)
    k2 = max(3, int(round(1.5 / max(fr.scale, 1e-3) + 2)) | 1)
    mi = cv2.dilate(mi, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (k2, k2)))
    return mi, roi


def clean_block(img_bgr: np.ndarray, block: dict, glyph: np.ndarray) -> dict | None:
    """يرجع {"roi": (x0,y0,x1,y1), "fill": BGR uint8, "alpha": uint8} لإعادة البناء."""
    H_img, W_img = img_bgr.shape[:2]
    bm = build_image_mask(block, glyph, (H_img, W_img))
    if bm is None:
        return None
    mi, (x0, y0, x1, y1) = bm
    if mi.sum() == 0:
        return None
    fr = Frame.from_dict(block["frame"])
    text_h = (fr.core[3] - fr.core[1]) / fr.scale
    pad = int(max(10, 0.8 * text_h))
    X0, Y0 = max(0, x0 - pad), max(0, y0 - pad)
    X1, Y1 = min(W_img, x1 + pad), min(H_img, y1 + pad)
    region = img_bgr[Y0:Y1, X0:X1]
    mask = np.zeros(region.shape[:2], np.uint8)
    mask[y0 - Y0:y1 - Y0, x0 - X0:x1 - X0] = mi

    fill = None
    method = ""
    bg = block.get("background", {})
    if not bg.get("textured") and bg.get("noise", 99) < 5.0:
        coef = np.array(bg["coef"], np.float32)
        bgf = _lab_coef_to_bgr(coef, fr.w, fr.h)
        T = np.array([[1, 0, -X0], [0, 1, -Y0], [0, 0, 1]], np.float64)
        model = cv2.warpPerspective(bgf, T @ fr.H, (X1 - X0, Y1 - Y0), flags=cv2.INTER_LINEAR,
                                    borderMode=cv2.BORDER_REPLICATE)
        # تحقق: هل النموذج يطابق الخلفية الفعلية حول القناع؟
        ring = cv2.dilate(mask, np.ones((9, 9), np.uint8)) & (1 - cv2.dilate(mask, np.ones((3, 3), np.uint8)))
        inside = cv2.warpPerspective(np.ones((fr.h, fr.w), np.uint8), T @ fr.H, (X1 - X0, Y1 - Y0)) > 0
        sel = (ring > 0) & inside
        if sel.sum() > 20:
            diff = region[sel].astype(np.float32) - model[sel]
            err = float(np.abs(np.median(diff, axis=0)).max())
            spread = float(np.median(np.abs(diff - np.median(diff, axis=0)))) * 1.4826
            if err < 6 and spread < 8:
                model += np.median(diff, axis=0)  # تصحيح انحراف بسيط
                rng = np.random.default_rng(1)
                noise = rng.normal(0, max(spread, 0.0), model.shape).astype(np.float32)
                if spread > 0.8:
                    noise = cv2.GaussianBlur(noise, (0, 0), 0.6) * 1.6
                fill = np.clip(model + noise, 0, 255).astype(np.uint8)
                method = "model"
    if fill is None:
        area = int(mask.sum())
        fill = _lama_inpaint(region, mask)
        method = "lama" if fill is not None else ""
        if fill is None and area < 60:
            fill = cv2.inpaint(region, mask * 255, 3, cv2.INPAINT_TELEA)
            method = "telea"
        if fill is None:
            fill = _shiftmap(region, mask)
            method = "shiftmap"
    alpha = cv2.GaussianBlur(mask.astype(np.float32), (0, 0), 0.8)
    alpha = np.maximum(alpha, mask.astype(np.float32))
    return {"roi": (X0, Y0, X1, Y1), "fill": fill, "alpha": (alpha * 255).astype(np.uint8), "method": method}


def _shiftmap(region: np.ndarray, mask: np.ndarray) -> np.ndarray:
    """Shift-Map مع تصغير للمناطق الكبيرة للحفاظ على السرعة، ثم دمج التفاصيل بدقة كاملة."""
    h, w = mask.shape
    s = min(1.0, (350_000 / max(h * w, 1)) ** 0.5)
    if s < 1:
        r = cv2.resize(region, None, fx=s, fy=s, interpolation=cv2.INTER_AREA)
        m = (cv2.resize(mask, (r.shape[1], r.shape[0]), interpolation=cv2.INTER_NEAREST) > 0).astype(np.uint8)
        m = cv2.dilate(m, np.ones((3, 3), np.uint8))
    else:
        r, m = region, mask
    dst = np.zeros_like(r)
    try:
        cv2.xphoto.inpaint(r, (1 - m) * 255, dst, cv2.xphoto.INPAINT_SHIFTMAP)
    except Exception:  # noqa: BLE001
        dst = cv2.inpaint(r, m * 255, 5, cv2.INPAINT_TELEA)
    if s < 1:
        dst = cv2.resize(dst, (w, h), interpolation=cv2.INTER_CUBIC)
    return dst
