"""مولّد صور اختبار اصطناعية مع حقيقة أرضية (ground truth) دقيقة.

كل حالة تعطي: الصورة، الخلفية الأصلية بدون نص، وقائمة النصوص بمواقعها وخطوطها وأحجامها وألوانها.
هذا يتيح قياس دقة الاكتشاف والمسح والرسم كأرقام وليس انطباعًا.
"""
from __future__ import annotations

from dataclasses import dataclass, field

import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

from app.fonts import library, load_font


@dataclass
class GT:
    text: str
    font_id: str
    size: int
    color: tuple
    quad: np.ndarray  # حدود الحبر في الصورة (tl,tr,br,bl)
    stroke: int = 0
    stroke_color: tuple = (0, 0, 0)
    shadow: tuple | None = None
    angle: float = 0.0


@dataclass
class Case:
    name: str
    image: np.ndarray  # BGR
    background: np.ndarray  # BGR بدون نص
    texts: list[GT] = field(default_factory=list)


def _bg(kind: str, w: int, h: int, seed: int = 0) -> np.ndarray:
    rng = np.random.default_rng(seed)
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    if kind == "flat":
        img = np.zeros((h, w, 3), np.float32) + np.array([245, 240, 232], np.float32)
    elif kind == "gradient":
        t = (yy / h)[..., None]
        img = np.array([40, 30, 110], np.float32) * (1 - t) + np.array([200, 120, 60], np.float32) * t
    elif kind == "dark":
        img = np.zeros((h, w, 3), np.float32) + np.array([28, 32, 40], np.float32)
    elif kind == "stripes":
        img = np.zeros((h, w, 3), np.float32) + np.array([230, 225, 210], np.float32)
        band = (((xx + yy * 0.6) // 28) % 2 == 0)
        img[band] = [190, 205, 225]
    elif kind == "noise":
        base = rng.normal(0, 1, (h // 8 + 1, w // 8 + 1, 3)).astype(np.float32)
        base = cv2.resize(base, (w, h), interpolation=cv2.INTER_CUBIC)
        img = 140 + base * 35
        img += rng.normal(0, 4, (h, w, 3))
    else:
        raise ValueError(kind)
    return np.clip(img, 0, 255).astype(np.uint8)


def _place(im: Image.Image, text: str, font_id: str, size: int, color, xy, anchor: str,
           angle: float = 0.0, stroke: int = 0, stroke_color=(0, 0, 0), shadow=None) -> np.ndarray:
    """يرسم النص (مع دوران اختياري) ويرجع رباعي حدود الحبر في الصورة."""
    f = library().get(font_id)
    font = load_font(f.path, size)
    direction = "rtl" if any("؀" <= c <= "ۿ" for c in text) else "ltr"
    W, H = im.size
    layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    if shadow:
        sh = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        ImageDraw.Draw(sh).text((xy[0] + shadow[0], xy[1] + shadow[1]), text, font=font, fill=shadow[2] + (255,),
                                anchor=anchor, direction=direction, stroke_width=stroke,
                                stroke_fill=shadow[2] + (255,))
        layer = Image.alpha_composite(layer, sh)
        d = ImageDraw.Draw(layer)
    d.text(xy, text, font=font, fill=tuple(color) + (255,), anchor=anchor, direction=direction,
           stroke_width=stroke, stroke_fill=tuple(stroke_color) + (255,))
    mask = Image.new("L", (W, H), 0)
    ImageDraw.Draw(mask).text(xy, text, font=font, fill=255, anchor=anchor, direction=direction)
    if angle:
        layer = layer.rotate(angle, center=xy, resample=Image.BICUBIC)
        mask = mask.rotate(angle, center=xy, resample=Image.BICUBIC)
    im.alpha_composite(layer)
    m = np.asarray(mask) > 127
    ys, xs = np.nonzero(m)
    pts = np.stack([xs, ys], 1).astype(np.float32)
    rect = cv2.minAreaRect(pts)
    from app.pipeline.geometry import order_quad

    return order_quad(cv2.boxPoints(rect))


def make_cases() -> list[Case]:
    specs = [
        ("flat-ar-headline", "flat", (1000, 500), [
            dict(text="عرض خاص لفترة محدودة", font_id="cairo-900", size=72, color=(200, 20, 40), xy=(940, 140), anchor="rs"),
            dict(text="اطلب الآن واحصل على هدية", font_id="tajawal-400", size=40, color=(40, 40, 40), xy=(940, 260), anchor="rs"),
            dict(text="Free Delivery", font_id="roboto-700", size=44, color=(20, 90, 200), xy=(60, 400), anchor="ls"),
        ]),
        ("gradient-stroke", "gradient", (1100, 520), [
            dict(text="تخفيضات الصيف", font_id="lalezar-400", size=110, color=(255, 210, 40), xy=(1040, 200), anchor="rs",
                 stroke=4, stroke_color=(20, 20, 20)),
            dict(text="SUMMER SALE 2026", font_id="montserrat-900", size=60, color=(255, 255, 255), xy=(60, 380), anchor="ls"),
        ]),
        ("dark-shadow", "dark", (1000, 420), [
            dict(text="مطعم الذواقة", font_id="el-messiri-700", size=86, color=(240, 200, 120), xy=(500, 170), anchor="ms",
                 shadow=(4, 4, (0, 0, 0))),
            dict(text="Open daily 9AM - 11PM", font_id="poppins-400", size=38, color=(230, 230, 230), xy=(500, 320), anchor="ms"),
        ]),
        ("rotated", "flat", (1000, 600), [
            dict(text="توصيل مجاني لكل الطلبات", font_id="tajawal-700", size=54, color=(30, 120, 60), xy=(500, 300),
                 anchor="ms", angle=10),
            dict(text="LIMITED", font_id="oswald-700", size=64, color=(180, 30, 30), xy=(120, 520), anchor="ls", angle=-6),
        ]),
        ("stripes-textured", "stripes", (1000, 460), [
            dict(text="أفضل الأسعار", font_id="noto-kufi-arabic-700", size=80, color=(20, 40, 90), xy=(940, 180), anchor="rs"),
            dict(text="Best Prices", font_id="inter-700", size=56, color=(120, 20, 60), xy=(60, 360), anchor="ls"),
        ]),
        ("noise-small", "noise", (1200, 500), [
            dict(text="رقم التواصل ٠٥٥١٢٣٤٥٦٧", font_id="ibm-plex-sans-arabic-700", size=30, color=(255, 255, 255),
                 xy=(1140, 120), anchor="rs"),
            dict(text="www.example.com", font_id="lato-700", size=24, color=(255, 255, 0), xy=(60, 420), anchor="ls"),
            dict(text="جودة عالية وأسعار منافسة", font_id="almarai-800", size=48, color=(10, 10, 10), xy=(1140, 280),
                 anchor="rs"),
        ]),
    ]
    cases = []
    for i, (name, bgk, (w, h), items) in enumerate(specs):
        bg = _bg(bgk, w, h, seed=i)
        im = Image.fromarray(bg[..., ::-1]).convert("RGBA")
        gts = []
        for it in items:
            q = _place(im, it["text"], it["font_id"], it["size"], it["color"], it["xy"], it["anchor"],
                       it.get("angle", 0.0), it.get("stroke", 0), it.get("stroke_color", (0, 0, 0)), it.get("shadow"))
            gts.append(GT(it["text"], it["font_id"], it["size"], it["color"], q, it.get("stroke", 0),
                          it.get("stroke_color", (0, 0, 0)), it.get("shadow"), it.get("angle", 0.0)))
        img = np.asarray(im.convert("RGB"))[..., ::-1].copy()
        cases.append(Case(name, img, bg, gts))
    return cases


def blur_jpeg(img: np.ndarray, sigma: float = 0.8, q: int = 80) -> np.ndarray:
    """تحويل واقعي: تمويه خفيف + ضغط JPEG (لاختبار الصور الحقيقية)."""
    im = Image.fromarray(img[..., ::-1]).filter(ImageFilter.GaussianBlur(sigma))
    ok, buf = cv2.imencode(".jpg", np.asarray(im)[..., ::-1], [cv2.IMWRITE_JPEG_QUALITY, q])
    return cv2.imdecode(buf, cv2.IMREAD_COLOR)
