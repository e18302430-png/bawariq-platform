"""مكتبة الخطوط: الخطوط المبنية مسبقًا (scripts/build_fonts.py) + خطوط النظام + الخطوط المرفوعة."""
from __future__ import annotations

import json
import re
import threading
import uuid
from dataclasses import asdict, dataclass
from functools import lru_cache
from pathlib import Path

from fontTools.ttLib import TTFont
from PIL import ImageFont

from . import config

ARABIC_RE = re.compile(r"[؀-ۿݐ-ݿࢠ-ࣿﭐ-﷿ﹰ-﻿]")
LATIN_RE = re.compile(r"[A-Za-zÀ-ɏ]")


def has_arabic(text: str) -> bool:
    return bool(ARABIC_RE.search(text or ""))


@dataclass
class FontInfo:
    id: str
    family: str
    weight: int
    script: str  # arabic | latin
    path: str
    custom: bool = False

    def public(self) -> dict:
        d = asdict(self)
        d.pop("path")
        return d


class FontLibrary:
    def __init__(self, fonts_dir: Path, custom_dir: Path):
        self.fonts_dir = fonts_dir
        self.custom_dir = custom_dir
        self._lock = threading.Lock()
        self.fonts: dict[str, FontInfo] = {}
        self.reload()

    def reload(self) -> None:
        fonts: dict[str, FontInfo] = {}
        idx = self.fonts_dir / "fonts.json"
        if idx.exists():
            for e in json.loads(idx.read_text(encoding="utf-8")):
                p = Path(e["file"])
                if not p.is_absolute():
                    p = self.fonts_dir / p
                if p.exists():
                    fonts[e["id"]] = FontInfo(e["id"], e["family"], int(e["weight"]), e["script"], str(p))
        cidx = self.custom_dir / "fonts.json"
        if cidx.exists():
            for e in json.loads(cidx.read_text(encoding="utf-8")):
                p = self.custom_dir / e["file"]
                if p.exists():
                    fonts[e["id"]] = FontInfo(e["id"], e["family"], int(e["weight"]), e["script"], str(p), True)
        if not fonts:
            raise RuntimeError(
                f"لا توجد خطوط في {self.fonts_dir}. شغّل: python scripts/build_fonts.py")
        self.fonts = fonts

    def get(self, font_id: str | None) -> FontInfo:
        if font_id and font_id in self.fonts:
            return self.fonts[font_id]
        return self.default_for("")

    def default_for(self, text: str) -> FontInfo:
        prefer = ["cairo-700", "noto-kufi-arabic-700", "amiri-400"] if has_arabic(text) else \
                 ["roboto-700", "inter-700", "cairo-700", "dejavu-sans-400"]
        for fid in prefer:
            if fid in self.fonts:
                return self.fonts[fid]
        return next(iter(self.fonts.values()))

    def candidates(self, text: str) -> list[FontInfo]:
        """الخطوط القادرة على رسم النص: العربية تحتاج خطًا عربيًا، واللاتيني يُرسم بكل الخطوط."""
        if has_arabic(text):
            fs = [f for f in self.fonts.values() if f.script == "arabic" or (f.custom and supports(f.path, text))]
        else:
            fs = [f for f in self.fonts.values() if supports(f.path, text)]
        return fs or list(self.fonts.values())

    def add_custom(self, data: bytes, filename: str) -> FontInfo:
        self.custom_dir.mkdir(parents=True, exist_ok=True)
        ext = Path(filename).suffix.lower()
        if ext not in (".ttf", ".otf"):
            raise ValueError("الصيغ المدعومة: TTF / OTF")
        fid = f"custom-{uuid.uuid4().hex[:8]}"
        path = self.custom_dir / f"{fid}{ext}"
        path.write_bytes(data)
        try:
            tt = TTFont(str(path))
            name = tt["name"].getDebugName(1) or Path(filename).stem
            weight = int(getattr(tt.get("OS/2"), "usWeightClass", 400) or 400)
            cmap = tt.getBestCmap() or {}
            script = "arabic" if any(0x0627 <= c <= 0x064A for c in cmap) else "latin"
            ImageFont.truetype(str(path), 20)
        except Exception as e:  # noqa: BLE001
            path.unlink(missing_ok=True)
            raise ValueError(f"ملف الخط غير صالح: {e}") from e
        info = FontInfo(fid, name, weight, script, str(path), True)
        with self._lock:
            cidx = self.custom_dir / "fonts.json"
            entries = json.loads(cidx.read_text(encoding="utf-8")) if cidx.exists() else []
            entries.append({"id": fid, "family": name, "weight": weight, "script": script, "file": path.name})
            cidx.write_text(json.dumps(entries, ensure_ascii=False, indent=1), encoding="utf-8")
            self.fonts[fid] = info
        return info


@lru_cache(maxsize=64)
def _cmap(path: str) -> frozenset[int]:
    try:
        return frozenset((TTFont(path, lazy=True).getBestCmap() or {}).keys())
    except Exception:  # noqa: BLE001
        return frozenset()


def supports(path: str, text: str) -> bool:
    cm = _cmap(path)
    chars = {ord(c) for c in text if not c.isspace()}
    if not chars:
        return True
    return len(chars - cm) <= max(0, len(chars) // 20)


@lru_cache(maxsize=512)
def load_font(path: str, size: int) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(path, max(1, int(size)), layout_engine=ImageFont.Layout.RAQM)


_library: FontLibrary | None = None


def library() -> FontLibrary:
    global _library
    if _library is None:
        _library = FontLibrary(config.FONTS_DIR, config.CUSTOM_FONTS_DIR)
    return _library
