"""إعدادات المنصة (قابلة للتغيير عبر متغيرات البيئة)."""
from __future__ import annotations

import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = Path(os.environ.get("ITS_DATA_DIR", BASE_DIR / "data"))
FONTS_DIR = Path(os.environ.get("ITS_FONTS_DIR", BASE_DIR / "fonts"))
CUSTOM_FONTS_DIR = DATA_DIR / "custom-fonts"

# أقصى عدد بكسلات للصورة (8K = 7680x4320 ≈ 33MP)، مع هامش
MAX_PIXELS = int(os.environ.get("ITS_MAX_PIXELS", 40_000_000))
MAX_UPLOAD_MB = int(os.environ.get("ITS_MAX_UPLOAD_MB", 60))

# Google Cloud Vision كمُعرِّف احتياطي (اختياري): ضع مفتاح API لتفعيله
GOOGLE_VISION_API_KEY = os.environ.get("GOOGLE_VISION_API_KEY", "")

# نموذج LaMa بصيغة ONNX (اختياري): مسار الملف لتفعيل الـ inpainting العصبي للخلفيات المعقدة
LAMA_ONNX_PATH = os.environ.get("LAMA_ONNX_PATH", "")

# أصول CORS المسموحة للواجهة (مفصولة بفواصل)
CORS_ORIGINS = [o.strip() for o in os.environ.get("ITS_CORS_ORIGINS", "*").split(",") if o.strip()]

# مدة الاحتفاظ بالجلسات (ساعات) قبل التنظيف التلقائي
SESSION_TTL_HOURS = float(os.environ.get("ITS_SESSION_TTL_HOURS", 48))
