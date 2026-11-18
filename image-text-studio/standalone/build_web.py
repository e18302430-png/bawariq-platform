"""يبني نسخة الرابط (web/) من text-studio.html: صفحة بدون غلاف html/head/body + ملفات المحرك بجانبها.

الاستخدام:  python build_web.py <مجلد node_modules الذي يحتوي tesseract.js و tesseract.js-core و @tesseract.js-data>
"""
import re, shutil, sys
from pathlib import Path

here = Path(__file__).parent
nm = Path(sys.argv[1])
out = here / "web"
out.mkdir(exist_ok=True)
s = (here / "text-studio.html").read_text(encoding="utf-8")
s = re.sub(r"<!doctype html>\s*", "", s, flags=re.I)
s = re.sub(r"<html[^>]*>\s*|</html>\s*|<head>\s*|</head>\s*|<body>\s*|</body>\s*", "", s)
s = re.sub(r'<meta charset="utf-8">\s*|<meta name="viewport"[^>]*>\s*', "", s)
# اتجاه الصفحة واللغة (كانا على وسم html)
s = s.replace("<title>", '<script>document.documentElement.lang="ar";document.documentElement.dir="rtl";</script>\n<title>', 1)
(out / "index.html").write_text(s, encoding="utf-8")
files = {
    "tesseract.min.js": nm / "tesseract.js/dist/tesseract.min.js",
    "worker.min.js": nm / "tesseract.js/dist/worker.min.js",
    "tesseract-core-lstm.wasm.js": nm / "tesseract.js-core/tesseract-core-lstm.wasm.js",
    "tesseract-core-simd-lstm.wasm.js": nm / "tesseract.js-core/tesseract-core-simd-lstm.wasm.js",
    "ara.traineddata.gz.wasm": nm / "@tesseract.js-data/ara/4.0.0_best_int/ara.traineddata.gz",
    "eng.traineddata.gz.wasm": nm / "@tesseract.js-data/eng/4.0.0_best_int/eng.traineddata.gz",
    "heic2any.min.js": nm / "heic2any/dist/heic2any.min.js",
}
for name, src in files.items():
    shutil.copyfile(src, out / name)
    print(f"{name:34} {src.stat().st_size/1e6:6.2f} MB")
