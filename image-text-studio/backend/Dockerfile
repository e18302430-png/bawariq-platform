# ---- مرحلة 1: تنزيل حزم الخطوط من npm (@fontsource) ----
FROM node:22-slim AS fonts
WORKDIR /cache
COPY scripts/build_fonts.py /tmp/build_fonts.py
RUN for p in $(grep -oP '^\s*\("\K[a-z0-9-]+(?=", ")' /tmp/build_fonts.py); do npm pack -q "@fontsource/$p" >/dev/null; done; ls | wc -l

# ---- مرحلة 2: الخادم ----
# Ubuntu 24.04: نفس إصدارات Tesseract 5.3 و libraqm التي اختُبرت عليها المنصة
FROM ubuntu:24.04
ENV DEBIAN_FRONTEND=noninteractive PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1 OMP_THREAD_LIMIT=1 \
    ITS_DATA_DIR=/data ITS_FONTS_DIR=/app/fonts PATH=/opt/venv/bin:$PATH
RUN apt-get update && apt-get install -y --no-install-recommends \
        python3 python3-venv ca-certificates \
        tesseract-ocr tesseract-ocr-ara tesseract-ocr-eng libraqm0 libfribidi0 \
        fonts-hosny-amiri fonts-noto-core fonts-kacst fonts-dejavu-core \
    && rm -rf /var/lib/apt/lists/* && python3 -m venv /opt/venv
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
COPY --from=fonts /cache /app/.font-cache
RUN python scripts/build_fonts.py && rm -rf .font-cache \
    && python -c "from rapidocr_onnxruntime import RapidOCR; RapidOCR()"
VOLUME /data
EXPOSE 8000
HEALTHCHECK --interval=30s --timeout=5s CMD python -c "import urllib.request;urllib.request.urlopen('http://127.0.0.1:8000/api/health')"
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "2"]
