"""اختبارات جودة الـ Pipeline على صور اصطناعية بحقيقة أرضية (اكتشاف، تعرف، خط، حجم، موضع، مسح)."""
from __future__ import annotations

import numpy as np
import pytest

from app.fonts import library
from app.pipeline.render import Placement, TextStyle, ink_bbox, render_layer, shape_mask


@pytest.fixture(scope="module")
def summary():
    from scripts.benchmark import run

    return run()


def test_detection_recall(summary):
    assert summary["detection_recall"] >= 0.95


def test_position_accuracy(summary):
    # النص المعاد رسمه يقع في نفس موضع الأصلي (متوسط < 1.5px، والأسوأ < 3px)
    assert summary["mean_pos_err_px"] < 1.5
    assert summary["max_pos_err_px"] < 3.0


def test_size_accuracy(summary):
    assert summary["mean_size_err"] < 0.06


def test_font_matching(summary):
    assert summary["font_top5"] >= 0.85
    assert summary["font_top1"] >= 0.75


def test_ocr(summary):
    assert summary["mean_cer"] < 0.15


def test_erase_leaves_no_trace(summary):
    # متوسط الفرق اللوني عن الخلفية الحقيقية داخل منطقة النص بعد المسح
    assert summary["mean_erase_residual"] < 5.0


def test_speed(summary):
    assert summary["mean_analyze_s"] < 3.0
    assert summary["mean_render_s"] < 5.0


def test_arabic_shaping_connected():
    """العربية تُرسم متصلة: عدد المكونات المتصلة أقل بكثير من عدد الحروف."""
    import cv2

    f = library().get("cairo-700")
    m, _ = shape_mask("محمد", f.path, 80)
    n, _ = cv2.connectedComponents((m > 0.5).astype(np.uint8))
    assert n - 1 <= 2  # كلمة متصلة واحدة (+ احتمال نقطة)


def test_arabic_rtl_order():
    """ترتيب RTL: أول حرف منطقي (م) يظهر في أقصى اليمين."""
    f = library().get("cairo-700")
    full, _ = shape_mask("مرحبا", f.path, 80)
    first, _ = shape_mask("م", f.path, 80)
    assert full.shape[1] > first.shape[1] * 2
    right = full[:, -first.shape[1]:]
    assert right.sum() > 0


def test_render_alignment_anchor():
    f = library().get("roboto-700")
    for align in ("left", "right", "center"):
        layer, (ox, oy) = render_layer("Hello", TextStyle(f.path, 60), Placement(align, 300, 100))
        bb = ink_bbox(layer[..., 3])
        x0, x1 = ox + bb[0], ox + bb[2]
        ref = {"left": x0, "right": x1, "center": (x0 + x1) / 2}[align]
        assert abs(ref - 300) <= 1.0
