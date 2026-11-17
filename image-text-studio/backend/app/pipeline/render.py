"""محرك رسم النص: تشكيل عربي صحيح (Raqm = HarfBuzz + FriBidi) مع الحدود والظل والتدرج.

الرسم يتم في إحداثيات الإطار المقوَّم للكتلة، ثم يُسقط على الصورة بنفس الـ Homography،
فيرث النص الجديد الدوران والمنظور الأصليين تلقائيًا.
"""
from __future__ import annotations

from dataclasses import dataclass, field

import cv2
import numpy as np
from PIL import Image, ImageDraw

from ..fonts import has_arabic, load_font


def text_direction(text: str) -> str:
    return "rtl" if has_arabic(text) else "ltr"


def shape_mask(text: str, font_path: str, size: float, stroke: int = 0,
               direction: str | None = None) -> tuple[np.ndarray, tuple[int, int]]:
    """يرسم النص كقناع (float 0..1). يرجع (القناع، موضع زاويته العليا-اليسرى نسبةً لنقطة الأصل على خط الأساس)."""
    direction = direction or text_direction(text)
    f = load_font(font_path, int(round(size)))
    x0, y0, x1, y1 = f.getbbox(text, anchor="ls", direction=direction, stroke_width=stroke)
    pad = 2 + stroke
    w, h = int(x1 - x0) + 2 * pad, int(y1 - y0) + 2 * pad
    im = Image.new("L", (max(w, 1), max(h, 1)), 0)
    ImageDraw.Draw(im).text((-x0 + pad, -y0 + pad), text, font=f, fill=255, anchor="ls",
                            direction=direction, stroke_width=stroke, stroke_fill=255)
    return np.asarray(im, dtype=np.float32) / 255.0, (int(x0 - pad), int(y0 - pad))


def ink_bbox(mask: np.ndarray, thr: float = 0.35) -> tuple[int, int, int, int] | None:
    ys, xs = np.nonzero(mask > thr)
    if len(xs) == 0:
        return None
    return int(xs.min()), int(ys.min()), int(xs.max()) + 1, int(ys.max()) + 1


@dataclass
class TextStyle:
    font_path: str
    size: float  # بكسلات الإطار
    color: tuple[int, int, int] = (0, 0, 0)
    gradient: dict | None = None  # {"from": rgb, "to": rgb, "axis": "v"|"h"}
    stroke_width: float = 0.0
    stroke_color: tuple[int, int, int] = (0, 0, 0)
    shadow: dict | None = None  # {"dx","dy","blur","color","opacity"} بكسلات الإطار
    opacity: float = 1.0
    blur: float = 0.0
    hscale: float = 1.0  # تمديد/ضغط أفقي (للملاءمة الدقيقة)
    extra: dict = field(default_factory=dict)


@dataclass
class Placement:
    """أين يوضع النص في الإطار: محاذاة الحبر على مرساة أفقية + خط أساس عمودي."""

    align: str  # left | right | center
    anchor_x: float
    baseline_y: float


def render_layer(text: str, st: TextStyle, pl: Placement) -> tuple[np.ndarray, tuple[float, float]]:
    """يرسم الطبقة المنسقة كاملة. يرجع (RGBA مسبق الضرب float32، إزاحة الزاوية العليا-اليسرى في الإطار)."""
    direction = text_direction(text)
    sw = int(round(st.stroke_width))
    fill, (fx, fy) = shape_mask(text, st.font_path, st.size, 0, direction)
    if sw > 0:
        stroke, (sx, sy) = shape_mask(text, st.font_path, st.size, sw, direction)
    else:
        stroke, (sx, sy) = fill, (fx, fy)
    # ضع القناعين على لوحة موحدة (المرجع: لوحة الحدود لأنها الأكبر)
    H, W = stroke.shape
    fill_full = np.zeros_like(stroke)
    oy, ox = fy - sy, fx - sx
    fill_full[oy:oy + fill.shape[0], ox:ox + fill.shape[1]] = fill
    glyph = np.maximum(fill_full, stroke) if sw > 0 else fill_full

    if st.hscale and abs(st.hscale - 1) > 1e-3:
        nw = max(1, int(round(W * st.hscale)))
        fill_full = cv2.resize(fill_full, (nw, H), interpolation=cv2.INTER_AREA)
        glyph = cv2.resize(glyph, (nw, H), interpolation=cv2.INTER_AREA)
        sx = sx * st.hscale
        W = nw

    bb = ink_bbox(fill_full) or (0, 0, W, H)
    # محاذاة الحبر (وليس صندوق التقدم) على المرساة
    if pl.align == "right":
        left = pl.anchor_x - bb[2]
    elif pl.align == "center":
        left = pl.anchor_x - (bb[0] + bb[2]) / 2
    else:
        left = pl.anchor_x - bb[0]
    top = pl.baseline_y + sy  # sy سالب: المسافة من خط الأساس لأعلى اللوحة

    # هامش للظل والتمويه
    sh = st.shadow
    margin = int(np.ceil(3 * st.blur)) + 2
    if sh:
        margin += int(np.ceil(abs(sh.get("dx", 0)) + abs(sh.get("dy", 0)) + 3 * sh.get("blur", 0)))
    Hc, Wc = H + 2 * margin, W + 2 * margin

    def place(a: np.ndarray) -> np.ndarray:
        out = np.zeros((Hc, Wc), np.float32)
        out[margin:margin + a.shape[0], margin:margin + a.shape[1]] = a
        return out

    a_fill, a_glyph = place(fill_full), place(glyph)
    rgba = np.zeros((Hc, Wc, 4), np.float32)

    def over(color: np.ndarray, alpha: np.ndarray) -> None:
        a = alpha[..., None]
        rgba[..., :3] = color * a + rgba[..., :3] * (1 - a)
        rgba[..., 3:] = a + rgba[..., 3:] * (1 - a)

    if sh:
        op = float(sh.get("opacity", 0.8))
        M = np.float32([[1, 0, sh.get("dx", 0)], [0, 1, sh.get("dy", 0)]])
        a_sh = cv2.warpAffine(a_glyph, M, (Wc, Hc), flags=cv2.INTER_LINEAR)
        if sh.get("blur", 0) > 0.3:
            a_sh = cv2.GaussianBlur(a_sh, (0, 0), sh["blur"])
        over(np.array(sh.get("color", (0, 0, 0)), np.float32) / 255, a_sh * op)
    if sw > 0:
        over(np.array(st.stroke_color, np.float32) / 255, a_glyph)
    if st.gradient:
        g = st.gradient
        c0 = np.array(g["from"], np.float32) / 255
        c1 = np.array(g["to"], np.float32) / 255
        ys, xs = np.nonzero(a_fill > 0.3)
        if len(ys):
            if g.get("axis", "v") == "v":
                lo, hi = ys.min(), ys.max()
                t = (np.arange(Hc, dtype=np.float32)[:, None] - lo) / max(hi - lo, 1)
                t = np.repeat(t, Wc, axis=1)
            else:
                lo, hi = xs.min(), xs.max()
                t = (np.arange(Wc, dtype=np.float32)[None, :] - lo) / max(hi - lo, 1)
                t = np.repeat(t, Hc, axis=0)
            t = np.clip(t, 0, 1)[..., None]
            over(c0 * (1 - t) + c1 * t, a_fill)
    else:
        over(np.array(st.color, np.float32) / 255, a_fill)

    if st.blur > 0.25:
        rgba = cv2.GaussianBlur(rgba, (0, 0), st.blur)
    if st.opacity < 1:
        rgba *= st.opacity
    return rgba, (left - margin, top - margin)
