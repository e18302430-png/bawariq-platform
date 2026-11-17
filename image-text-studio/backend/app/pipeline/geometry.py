"""هندسة الكتل النصية: الرباعيات (quads) والإطار المُقوَّم (Frame).

كل كتلة نصية تُمثَّل برباعي (tl, tr, br, bl) في إحداثيات الصورة.
الإطار المقوَّم Frame هو مستطيل محلي (u, v) مرتبط بالصورة عبر Homography:
  image_xy = H @ frame_uv
كل التحليل (القناع، اللون، الخط) والرسم يتم داخل الإطار المقوَّم، ثم يُعاد إسقاطه
على الصورة بنفس التحويل — وهذا ما يضمن أن النص الجديد يرث الدوران والمنظور تمامًا.
"""
from __future__ import annotations

from dataclasses import dataclass

import cv2
import numpy as np


def order_quad(pts: np.ndarray) -> np.ndarray:
    """يرتب 4 نقاط إلى (tl, tr, br, bl) بحيث تكون الحافة العليا من اليسار لليمين."""
    pts = np.asarray(pts, dtype=np.float32).reshape(4, 2)
    c = pts.mean(axis=0)
    ang = np.arctan2(pts[:, 1] - c[1], pts[:, 0] - c[0])
    pts = pts[np.argsort(ang)]  # ترتيب مع عقارب الساعة (y للأسفل) يبدأ من الأعلى-يسار تقريبًا
    # ابدأ من النقطة ذات أصغر (x+y) مع الحفاظ على الترتيب الدائري
    start = int(np.argmin(pts.sum(axis=1)))
    pts = np.roll(pts, -start, axis=0)
    # تأكد أن الحافة الأولى (tl->tr) هي الأطول نسبيًا (أفقية)، وإلا فالرباعي مدوَّر 90°
    e0 = np.linalg.norm(pts[1] - pts[0])
    e1 = np.linalg.norm(pts[2] - pts[1])
    if e1 > e0 * 1.6:  # نص عمودي/مقلوب: اجعل الحافة الطويلة هي الأعلى
        pts = np.roll(pts, -1, axis=0)
    return pts


def quad_size(q: np.ndarray) -> tuple[float, float]:
    w = (np.linalg.norm(q[1] - q[0]) + np.linalg.norm(q[2] - q[3])) / 2
    h = (np.linalg.norm(q[3] - q[0]) + np.linalg.norm(q[2] - q[1])) / 2
    return float(w), float(h)


def quad_angle(q: np.ndarray) -> float:
    """زاوية الحافة العليا بالدرجات (موجبة = مع عقارب الساعة في إحداثيات الصورة)."""
    d = (q[1] - q[0]) + (q[2] - q[3])
    return float(np.degrees(np.arctan2(d[1], d[0])))


@dataclass
class Frame:
    """إطار مقوَّم: مصفوفة H تحول (u,v) في الإطار إلى (x,y) في الصورة."""

    H: np.ndarray  # 3x3
    w: int
    h: int
    scale: float  # بكسلات الإطار لكل بكسل صورة
    core: tuple[float, float, float, float]  # (u0, v0, u1, v1) مستطيل الرباعي الأصلي داخل الإطار

    @classmethod
    def from_quad(cls, quad: np.ndarray, margin_x: float, margin_y: float, scale: float) -> "Frame":
        q = order_quad(quad)
        qw, qh = quad_size(q)
        cw, ch = qw * scale, qh * scale
        mx, my = margin_x * scale, margin_y * scale
        src = np.float32([[0, 0], [cw, 0], [cw, ch], [0, ch]])
        Hcore = cv2.getPerspectiveTransform(src, q.astype(np.float32))  # core-uv -> image
        T = np.array([[1, 0, -mx], [0, 1, -my], [0, 0, 1]], dtype=np.float64)
        H = Hcore @ T
        w = int(round(cw + 2 * mx))
        h = int(round(ch + 2 * my))
        return cls(H=H, w=w, h=h, scale=scale, core=(mx, my, mx + cw, my + ch))

    # --- تحويلات ---
    def sample(self, img: np.ndarray, interp: int = cv2.INTER_CUBIC) -> np.ndarray:
        """يقتطع منطقة الإطار من الصورة مقوَّمة."""
        return cv2.warpPerspective(img, self.H, (self.w, self.h), flags=interp | cv2.WARP_INVERSE_MAP,
                                   borderMode=cv2.BORDER_REPLICATE)

    def to_image(self, pts_uv: np.ndarray) -> np.ndarray:
        p = np.asarray(pts_uv, dtype=np.float64).reshape(-1, 1, 2)
        return cv2.perspectiveTransform(p, self.H).reshape(-1, 2)

    def outline(self) -> np.ndarray:
        return self.to_image(np.float32([[0, 0], [self.w, 0], [self.w, self.h], [0, self.h]]))

    def core_quad(self) -> np.ndarray:
        u0, v0, u1, v1 = self.core
        return self.to_image(np.float32([[u0, v0], [u1, v0], [u1, v1], [u0, v1]]))

    def to_dict(self) -> dict:
        return {"H": self.H.tolist(), "w": self.w, "h": self.h, "scale": self.scale, "core": list(self.core)}

    @classmethod
    def from_dict(cls, d: dict) -> "Frame":
        return cls(H=np.array(d["H"], dtype=np.float64), w=int(d["w"]), h=int(d["h"]),
                   scale=float(d["scale"]), core=tuple(d["core"]))


def warp_layer_to_image(layer: np.ndarray, H: np.ndarray, img_shape: tuple[int, int],
                        pad: int = 2) -> tuple[np.ndarray, tuple[int, int, int, int]] | None:
    """يسقط طبقة (h,w,C) من إحداثيات الإطار إلى الصورة داخل أصغر ROI ممكن.

    يرجع (الطبقة المسقطة، (x0,y0,x1,y1)) أو None إذا كانت خارج الصورة.
    """
    lh, lw = layer.shape[:2]
    corners = cv2.perspectiveTransform(
        np.float64([[0, 0], [lw, 0], [lw, lh], [0, lh]]).reshape(-1, 1, 2), H).reshape(-1, 2)
    H_img, W_img = img_shape
    x0 = max(int(np.floor(corners[:, 0].min())) - pad, 0)
    y0 = max(int(np.floor(corners[:, 1].min())) - pad, 0)
    x1 = min(int(np.ceil(corners[:, 0].max())) + pad, W_img)
    y1 = min(int(np.ceil(corners[:, 1].max())) + pad, H_img)
    if x1 <= x0 or y1 <= y0:
        return None
    T = np.array([[1, 0, -x0], [0, 1, -y0], [0, 0, 1]], dtype=np.float64)
    out = cv2.warpPerspective(layer, T @ H, (x1 - x0, y1 - y0), flags=cv2.INTER_LINEAR,
                              borderMode=cv2.BORDER_CONSTANT, borderValue=0)
    return out, (x0, y0, x1, y1)
