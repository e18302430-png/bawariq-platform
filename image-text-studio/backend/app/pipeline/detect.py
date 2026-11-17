"""اكتشاف مواقع النصوص (Text Detection) بنموذج DBNet من PP-OCRv3 عبر ONNX Runtime.

النموذج مضمَّن داخل حزمة rapidocr-onnxruntime (لا يحتاج تنزيلًا وقت التشغيل)، ويعمل على CPU
ويستفيد من GPU تلقائيًا إن ثُبّت onnxruntime-gpu. يكتشف النص بغض النظر عن اللغة، بما فيها
العربية والمائل والمشوه بالمنظور، ويعطي رباعيًا (polygon) لكل مقطع.

بعد الاكتشاف ندمج المقاطع المتجاورة على نفس السطر في سطر واحد قابل للتعديل.
"""
from __future__ import annotations

import threading

import cv2
import numpy as np

from .geometry import order_quad, quad_angle, quad_size

_lock = threading.Lock()
_engine = None


def _get_engine():
    global _engine
    with _lock:
        if _engine is None:
            from rapidocr_onnxruntime import RapidOCR

            _engine = RapidOCR()
    return _engine


def get_recognizer():
    """مُعرِّف PP-OCR (ممتاز للاتينية والأرقام) — يُستخدم ضمن الـ ensemble في ocr.py."""
    return _get_engine().text_recognizer


def _run_det(img_bgr: np.ndarray, max_side: int) -> list[np.ndarray]:
    det = _get_engine().text_detector
    h, w = img_bgr.shape[:2]
    s = min(1.0, max_side / max(h, w))
    small = cv2.resize(img_bgr, None, fx=s, fy=s, interpolation=cv2.INTER_AREA) if s < 1 else img_bgr
    boxes, _ = det(small)
    if boxes is None:
        return []
    return [order_quad(np.asarray(b, dtype=np.float32) / s) for b in boxes]


def _iou_quads(a: np.ndarray, b: np.ndarray) -> float:
    inter, _ = cv2.intersectConvexConvex(a.astype(np.float32), b.astype(np.float32))
    if inter <= 0:
        return 0.0
    ua = cv2.contourArea(a.astype(np.float32)) + cv2.contourArea(b.astype(np.float32)) - inter
    return float(inter / max(ua, 1e-6))


def _overlap_frac(a: np.ndarray, b: np.ndarray) -> float:
    inter, _ = cv2.intersectConvexConvex(a.astype(np.float32), b.astype(np.float32))
    return float(max(inter, 0) / max(min(cv2.contourArea(a), cv2.contourArea(b)), 1e-6))


def detect_text(img_bgr: np.ndarray) -> list[np.ndarray]:
    """يرجع رباعيات أسطر النص في إحداثيات الصورة الأصلية.

    تمريرتان: عامة (حتى 1920px) لالتقاط العناوين، وتمريرة عالية الدقة للصور الكبيرة
    لالتقاط النصوص الصغيرة جدًا. ثم إزالة التكرار ودمج المقاطع على نفس السطر.
    """
    h, w = img_bgr.shape[:2]
    quads = _run_det(img_bgr, 1920)
    if max(h, w) > 2200:
        quads += _run_det(img_bgr, 3600)
    # إزالة التكرار بين التمريرتين: نحتفظ بالأكبر
    quads.sort(key=lambda q: -cv2.contourArea(q))
    kept: list[np.ndarray] = []
    for q in quads:
        if all(_iou_quads(q, k) < 0.5 for k in kept):
            kept.append(q)
    kept = [q for q in kept if quad_size(q)[1] >= 6 and quad_size(q)[0] >= 6]
    return merge_line_fragments(kept)


def merge_line_fragments(quads: list[np.ndarray]) -> list[np.ndarray]:
    """يدمج المقاطع التي تقع على نفس خط الأساس وبنفس الارتفاع والزاوية وبينها فراغ صغير."""
    n = len(quads)
    if n < 2:
        return quads
    info = []
    for q in quads:
        w, h = quad_size(q)
        ang = quad_angle(q)
        c = q.mean(axis=0)
        t = np.array([np.cos(np.radians(ang)), np.sin(np.radians(ang))])  # اتجاه السطر
        nrm = np.array([-t[1], t[0]])
        proj = (q - c) @ t
        info.append((w, h, ang, c, t, nrm, proj.min(), proj.max()))

    parent = list(range(n))

    def find(i: int) -> int:
        while parent[i] != i:
            parent[i] = parent[parent[i]]
            i = parent[i]
        return i

    for i in range(n):
        wi, hi, ai, ci, ti, ni, lo_i, hi_i = info[i]
        for j in range(i + 1, n):
            wj, hj, aj, cj, tj, nj, lo_j, hi_j = info[j]
            # الكلمات العربية تختلف ارتفاعاتها (ألف ولام صاعدة، عين وتاء مربوطة نازلة)،
            # لذا نقارن تداخل الامتداد العمودي بدل تطابق الارتفاع والمركز
            if _iou_quads(quads[i], quads[j]) > 0 or _overlap_frac(quads[i], quads[j]) > 0.05:
                if abs(ai - aj) <= 12:  # مقطعان متداخلان من نفس السطر بزاويتين مختلفتين قليلًا
                    parent[find(j)] = find(i)
                    continue
            if abs(ai - aj) > 5 or max(hi, hj) / max(min(hi, hj), 1) > 1.9:
                continue
            vi = (quads[i] - ci) @ ni
            vj = (quads[j] - ci) @ ni
            overlap = min(vi.max(), vj.max()) - max(vi.min(), vj.min())
            if overlap < 0.55 * min(hi, hj):
                continue
            pj = (quads[j] - ci) @ ti
            gap = max(pj.min() - hi_i, lo_i - pj.max())
            if gap < 1.1 * min(hi, hj):
                parent[find(j)] = find(i)

    groups: dict[int, list[int]] = {}
    for i in range(n):
        groups.setdefault(find(i), []).append(i)
    out = []
    for idx in groups.values():
        if len(idx) == 1:
            out.append(quads[idx[0]])
            continue
        pts = np.concatenate([quads[i] for i in idx]).astype(np.float32)
        rect = cv2.minAreaRect(pts)
        box = order_quad(cv2.boxPoints(rect))
        out.append(box)
    # ترتيب القراءة: من الأعلى للأسفل
    out.sort(key=lambda q: (round(float(q[:, 1].mean()) / 10), float(q[:, 0].mean())))
    return out
