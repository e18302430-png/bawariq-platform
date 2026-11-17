"""تخزين الجلسات: كل صورة مرفوعة لها مجلد يحتوي الأصل والتحليل والأقنعة وذاكرة إعادة البناء.

التخزين محلي على القرص (مناسب لخادم واحد/حاوية). لتوزيع على عدة خوادم اجعل ITS_DATA_DIR
على تخزين مشترك (NFS / volume)، أو استبدل هذه الطبقة بـ Supabase Storage.
"""
from __future__ import annotations

import json
import re
import shutil
import threading
import time
import uuid
from collections import OrderedDict
from pathlib import Path

import cv2
import numpy as np

from . import config

_ID_RE = re.compile(r"^[a-f0-9]{16}$")


class NotFound(Exception):
    pass


class Store:
    def __init__(self, root: Path):
        self.root = root
        self.root.mkdir(parents=True, exist_ok=True)
        self._img_cache: OrderedDict[str, np.ndarray] = OrderedDict()
        self._lock = threading.Lock()

    def new_id(self) -> str:
        return uuid.uuid4().hex[:16]

    def dir(self, image_id: str) -> Path:
        if not _ID_RE.match(image_id or ""):
            raise NotFound(image_id)
        d = self.root / image_id
        return d

    def exists(self, image_id: str) -> bool:
        try:
            return (self.dir(image_id) / "meta.json").exists()
        except NotFound:
            return False

    # ---------- الصورة الأصلية
    def save_original(self, image_id: str, bgr: np.ndarray, alpha: np.ndarray | None, name: str) -> None:
        d = self.dir(image_id)
        (d / "masks").mkdir(parents=True, exist_ok=True)
        (d / "clean").mkdir(parents=True, exist_ok=True)
        cv2.imwrite(str(d / "original.png"), bgr, [cv2.IMWRITE_PNG_COMPRESSION, 1])
        if alpha is not None:
            cv2.imwrite(str(d / "alpha.png"), alpha)
        (d / "name.txt").write_text(name, encoding="utf-8")

    def original(self, image_id: str) -> np.ndarray:
        with self._lock:
            if image_id in self._img_cache:
                self._img_cache.move_to_end(image_id)
                return self._img_cache[image_id]
        p = self.dir(image_id) / "original.png"
        if not p.exists():
            raise NotFound(image_id)
        img = cv2.imread(str(p), cv2.IMREAD_COLOR)
        with self._lock:
            self._img_cache[image_id] = img
            while len(self._img_cache) > 6:
                self._img_cache.popitem(last=False)
        return img

    def alpha(self, image_id: str) -> np.ndarray | None:
        p = self.dir(image_id) / "alpha.png"
        return cv2.imread(str(p), cv2.IMREAD_GRAYSCALE) if p.exists() else None

    def name(self, image_id: str) -> str:
        p = self.dir(image_id) / "name.txt"
        return p.read_text(encoding="utf-8") if p.exists() else "image"

    # ---------- التحليل
    def save_meta(self, image_id: str, meta: dict) -> None:
        p = self.dir(image_id) / "meta.json"
        tmp = p.with_suffix(".tmp")
        tmp.write_text(json.dumps(meta, ensure_ascii=False), encoding="utf-8")
        tmp.replace(p)

    def meta(self, image_id: str) -> dict:
        p = self.dir(image_id) / "meta.json"
        if not p.exists():
            raise NotFound(image_id)
        return json.loads(p.read_text(encoding="utf-8"))

    def save_mask(self, image_id: str, block_id: str, glyph: np.ndarray) -> None:
        np.savez_compressed(self.dir(image_id) / "masks" / f"{block_id}.npz", glyph=glyph.astype(np.float16))

    def mask(self, image_id: str, block_id: str) -> np.ndarray:
        return np.load(self.dir(image_id) / "masks" / f"{block_id}.npz")["glyph"]

    # ---------- ذاكرة إعادة بناء الخلفية لكل كتلة
    def clean(self, image_id: str, block_id: str) -> dict | None:
        p = self.dir(image_id) / "clean" / f"{block_id}.npz"
        if not p.exists():
            return None
        z = np.load(p)
        return {"roi": tuple(int(v) for v in z["roi"]), "fill": z["fill"], "alpha": z["alpha"],
                "method": str(z["method"])}

    def save_clean(self, image_id: str, block_id: str, c: dict) -> None:
        np.savez(self.dir(image_id) / "clean" / f"{block_id}.npz", roi=np.array(c["roi"]), fill=c["fill"],
                 alpha=c["alpha"], method=np.array(c["method"]))

    def drop_clean(self, image_id: str, block_id: str) -> None:
        (self.dir(image_id) / "clean" / f"{block_id}.npz").unlink(missing_ok=True)

    def delete(self, image_id: str) -> None:
        shutil.rmtree(self.dir(image_id), ignore_errors=True)
        with self._lock:
            self._img_cache.pop(image_id, None)

    def cleanup(self, ttl_hours: float = config.SESSION_TTL_HOURS) -> int:
        cutoff = time.time() - ttl_hours * 3600
        n = 0
        for d in self.root.iterdir():
            if d.is_dir() and _ID_RE.match(d.name) and d.stat().st_mtime < cutoff:
                shutil.rmtree(d, ignore_errors=True)
                n += 1
        return n
