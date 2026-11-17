"""بناء مكتبة الخطوط المحلية من حزم @fontsource على npm.

كل حزمة fontsource تأتي مقسّمة إلى subsets (arabic / latin / latin-ext) بصيغة WOFF.
هذا السكربت يدمج الـ subsets لكل وزن في ملف TTF واحد كامل يدعم العربية واللاتينية معًا،
ويكتب فهرس fonts.json الذي يقرؤه الخادم.

الاستخدام:
    python scripts/build_fonts.py            # يكتب إلى backend/fonts
    python scripts/build_fonts.py --out DIR
"""
from __future__ import annotations

import argparse
import json
import subprocess
import tarfile
import tempfile
from pathlib import Path

from fontTools.merge import Merger
from fontTools.ttLib import TTFont

# (حزمة npm, الاسم المعروض, نوع الكتابة الأساسي, الأوزان المطلوبة)
FAMILIES = [
    ("cairo", "Cairo", "arabic", [400, 700, 900]),
    ("tajawal", "Tajawal", "arabic", [400, 700, 900]),
    ("almarai", "Almarai", "arabic", [400, 700, 800]),
    ("ibm-plex-sans-arabic", "IBM Plex Sans Arabic", "arabic", [400, 700]),
    ("readex-pro", "Readex Pro", "arabic", [400, 700]),
    ("changa", "Changa", "arabic", [400, 700]),
    ("el-messiri", "El Messiri", "arabic", [400, 700]),
    ("lalezar", "Lalezar", "arabic", [400]),
    ("reem-kufi", "Reem Kufi", "arabic", [400, 700]),
    ("harmattan", "Harmattan", "arabic", [400, 700]),
    ("markazi-text", "Markazi Text", "arabic", [400, 700]),
    ("noto-kufi-arabic", "Noto Kufi Arabic", "arabic", [400, 700, 900]),
    ("roboto", "Roboto", "latin", [400, 700, 900]),
    ("inter", "Inter", "latin", [400, 700, 900]),
    ("montserrat", "Montserrat", "latin", [400, 700, 900]),
    ("poppins", "Poppins", "latin", [400, 700, 900]),
    ("open-sans", "Open Sans", "latin", [400, 700]),
    ("lato", "Lato", "latin", [400, 700, 900]),
    ("oswald", "Oswald", "latin", [400, 700]),
    ("playfair-display", "Playfair Display", "latin", [400, 700]),
    ("bebas-neue", "Bebas Neue", "latin", [400]),
    ("anton", "Anton", "latin", [400]),
]

# خطوط نظام اختيارية (تُثبَّت عبر apt في Docker) تُضاف للفهرس إن وُجدت
SYSTEM_FONTS = [
    ("/usr/share/fonts/truetype/fonts-hosny-amiri/Amiri-Regular.ttf", "Amiri", "arabic", 400),
    ("/usr/share/fonts/truetype/fonts-hosny-amiri/Amiri-Bold.ttf", "Amiri", "arabic", 700),
    ("/usr/share/fonts/truetype/noto/NotoNaskhArabic-Regular.ttf", "Noto Naskh Arabic", "arabic", 400),
    ("/usr/share/fonts/truetype/noto/NotoNaskhArabic-Bold.ttf", "Noto Naskh Arabic", "arabic", 700),
    ("/usr/share/fonts/truetype/noto/NotoSansArabic-Regular.ttf", "Noto Sans Arabic", "arabic", 400),
    ("/usr/share/fonts/truetype/noto/NotoSansArabic-Bold.ttf", "Noto Sans Arabic", "arabic", 700),
    ("/usr/share/fonts/truetype/kacst/KacstPoster.ttf", "KacstPoster", "arabic", 700),
    ("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", "DejaVu Sans", "latin", 400),
    ("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", "DejaVu Sans", "latin", 700),
]

SUBSETS = ["arabic", "latin", "latin-ext"]


def _to_ttf(src: Path, dst: Path) -> Path:
    font = TTFont(str(src))
    font.flavor = None
    font.save(str(dst))
    return dst


def _merge_save(parts: list[Path], dst: Path) -> bool:
    """يدمج الـ subsets. إن تجاوز جدول GPOS حدود الإزاحة نُسقط latin-ext ثم نكتفي بالأول."""
    attempts = [parts, [p for p in parts if "latin-ext" not in p.name], parts[:1]]
    for group in attempts:
        if not group:
            continue
        try:
            font = Merger().merge([str(p) for p in group]) if len(group) > 1 else TTFont(str(group[0]))
            font.save(str(dst))
            return True
        except Exception:  # noqa: BLE001 - OTLOffsetOverflowError وأشباهه
            continue
    return False


def build(out: Path, cache: Path) -> list[dict]:
    out.mkdir(parents=True, exist_ok=True)
    cache.mkdir(parents=True, exist_ok=True)
    index: list[dict] = []
    for pkg, name, script, weights in FAMILIES:
        tgz = next(cache.glob(f"fontsource-{pkg}-*.tgz"), None)
        if tgz is None:
            subprocess.run(["npm", "pack", "-q", f"@fontsource/{pkg}"], cwd=cache, check=True,
                           stdout=subprocess.DEVNULL)
            tgz = next(cache.glob(f"fontsource-{pkg}-*.tgz"))
        with tempfile.TemporaryDirectory() as tmp:
            tmpd = Path(tmp)
            with tarfile.open(tgz) as tf:
                tf.extractall(tmpd, filter="data")
            files = tmpd / "package" / "files"
            for w in weights:
                parts = []
                for sub in SUBSETS:
                    src = files / f"{pkg}-{sub}-{w}-normal.woff"
                    if src.exists():
                        parts.append(_to_ttf(src, tmpd / f"{sub}-{w}.ttf"))
                if not parts:
                    print(f"  ! {pkg} {w}: لا توجد ملفات")
                    continue
                dst = out / f"{pkg}-{w}.ttf"
                if not _merge_save(parts, dst):
                    print(f"  ! {pkg} {w}: فشل الدمج")
                    continue
                index.append({"id": f"{pkg}-{w}", "family": name, "weight": w, "script": script,
                              "file": dst.name})
                print(f"  ✓ {dst.name}")
    for path, name, script, w in SYSTEM_FONTS:
        p = Path(path)
        if p.exists():
            fid = f"{name.lower().replace(' ', '-')}-{w}"
            index.append({"id": fid, "family": name, "weight": w, "script": script, "file": str(p)})
    (out / "fonts.json").write_text(json.dumps(index, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"تم: {len(index)} خط")
    return index


if __name__ == "__main__":
    here = Path(__file__).resolve().parent.parent
    ap = argparse.ArgumentParser()
    ap.add_argument("--out", type=Path, default=here / "fonts")
    ap.add_argument("--cache", type=Path, default=here / ".font-cache")
    a = ap.parse_args()
    build(a.out, a.cache)
