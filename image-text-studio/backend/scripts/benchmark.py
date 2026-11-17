"""قياس جودة الـ Pipeline على صور اصطناعية بحقيقة أرضية.

يطبع لكل حالة: نسبة الاكتشاف، دقة التعرف (CER)، مطابقة الخط، خطأ الحجم، خطأ الموضع،
وبقايا المسح (الفرق عن الخلفية الحقيقية داخل منطقة النص)، وزمن التحليل والاستبدال.
الاستخدام:  python scripts/benchmark.py [--save DIR]
"""
from __future__ import annotations

import argparse
import shutil
import sys
import tempfile
import time
from pathlib import Path

import cv2
import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "tests"))

from synth import make_cases  # noqa: E402

from app.fonts import library  # noqa: E402
from app.pipeline.detect import _iou_quads  # noqa: E402
from app.pipeline.engine import Engine  # noqa: E402
from app.store import Store  # noqa: E402


def cer(a: str, b: str) -> float:
    a, b = a.replace(" ", ""), b.replace(" ", "")
    d = list(range(len(b) + 1))
    for i, ca in enumerate(a, 1):
        prev, d[0] = d[0], i
        for j, cb in enumerate(b, 1):
            prev, d[j] = d[j], min(d[j] + 1, d[j - 1] + 1, prev + (ca != cb))
    return d[len(b)] / max(len(a), 1)


def ink_quad_error(gt_q: np.ndarray, det_q: np.ndarray) -> float:
    """متوسط المسافة بين زوايا الرباعيين (بكسل)."""
    return float(np.mean(np.linalg.norm(gt_q - det_q, axis=1)))


def run(save: Path | None = None) -> dict:
    tmp = Path(tempfile.mkdtemp())
    store = Store(tmp)
    eng = Engine(store)
    fonts = library()
    rows, totals = [], {"gt": 0, "found": 0, "font_top1": 0, "font_top5": 0, "cer": [], "size_err": [],
                        "pos_err": [], "residual": [], "t_an": [], "t_re": []}
    for case in make_cases():
        iid = store.new_id()
        store.save_original(iid, case.image, None, case.name + ".png")
        t = time.time()
        meta = eng.analyze_image(iid)
        t_an = time.time() - t
        blocks = meta["blocks"]
        matched = []
        for g in case.texts:
            best, best_iou = None, 0.0
            for b in blocks:
                iou = _iou_quads(np.float32(b["quad"]), g.quad)
                if iou > best_iou:
                    best, best_iou = b, iou
            totals["gt"] += 1
            if best is None or best_iou < 0.3:
                rows.append((case.name, g.text, "MISSED", "", "", "", ""))
                continue
            totals["found"] += 1
            matched.append((g, best))
            gt_family = fonts.get(g.font_id).family
            cands = [c["id"] for c in best["style"]["font_candidates"]]
            fam = [fonts.get(c).family for c in cands]
            top1 = bool(fam) and fam[0] == gt_family
            top5 = gt_family in fam
            totals["font_top1"] += top1
            totals["font_top5"] += top5
            c = cer(g.text, best["text"])
            totals["cer"].append(c)
            se = abs(best["style"]["size_px"] - g.size) / g.size
            totals["size_err"].append(se)
            rows.append((case.name, g.text, best["text"], f"{c:.2f}", f"{fam[0] if fam else '-'}{'✓' if top1 else ('~' if top5 else '✗')}",
                         f"{se * 100:.1f}%", f"{best_iou:.2f}"))
        # إعادة الرسم بنفس النص الصحيح: الموضع يجب أن يطابق
        edits = [{"block_id": b["id"], "text": g.text} for g, b in matched]
        t = time.time()
        out = eng.render(iid, edits)
        t_re = time.time() - t
        erased = eng.render(iid, [{"block_id": b["id"], "remove": True} for g, b in matched])
        for g, b in matched:
            # خطأ الموضع: قارن رباعي الحبر في الصورة الأصلية والصورة المعاد رسمها
            m0 = _ink_mask(case.image, case.background)
            m1 = _ink_mask(out, case.background)
            poly = cv2.fillConvexPoly(np.zeros(m0.shape, np.uint8), _expand(g.quad, 6).astype(np.int32), 1).astype(bool)
            q0, q1 = _minrect(m0 & poly), _minrect(m1 & poly)
            if q0 is not None and q1 is not None:
                totals["pos_err"].append(_center_err(q0, q1))
            # بقايا المسح: الفرق عن الخلفية الحقيقية داخل منطقة النص
            region = cv2.dilate(poly.astype(np.uint8), np.ones((5, 5), np.uint8)).astype(bool)
            totals["residual"].append(float(np.abs(erased[region].astype(int) - case.background[region].astype(int)).mean()))
        totals["t_an"].append(t_an)
        totals["t_re"].append(t_re)
        if save:
            save.mkdir(parents=True, exist_ok=True)
            cv2.imwrite(str(save / f"{case.name}.png"), np.vstack([case.image, erased, out]))
    shutil.rmtree(tmp, ignore_errors=True)

    print(f"{'case':18} {'gt text':28} {'ocr':28} {'CER':>5} {'font':>22} {'size':>6} {'IoU':>5}")
    for r in rows:
        print(f"{r[0]:18} {r[1][:28]:28} {r[2][:28]:28} {r[3]:>5} {r[4]:>22} {r[5]:>6} {r[6]:>5}")
    summary = {
        "detection_recall": totals["found"] / max(totals["gt"], 1),
        "font_top1": totals["font_top1"] / max(totals["found"], 1),
        "font_top5": totals["font_top5"] / max(totals["found"], 1),
        "mean_cer": float(np.mean(totals["cer"])) if totals["cer"] else 1.0,
        "mean_size_err": float(np.mean(totals["size_err"])) if totals["size_err"] else 1.0,
        "mean_pos_err_px": float(np.mean(totals["pos_err"])) if totals["pos_err"] else 99.0,
        "max_pos_err_px": float(np.max(totals["pos_err"])) if totals["pos_err"] else 99.0,
        "mean_erase_residual": float(np.mean(totals["residual"])) if totals["residual"] else 99.0,
        "mean_analyze_s": float(np.mean(totals["t_an"])),
        "mean_render_s": float(np.mean(totals["t_re"])),
    }
    print()
    for k, v in summary.items():
        print(f"  {k:22} {v:.3f}")
    return summary


def _expand(q: np.ndarray, px: float) -> np.ndarray:
    c = q.mean(0)
    v = q - c
    n = np.linalg.norm(v, axis=1, keepdims=True)
    return c + v * (1 + px / np.maximum(n, 1))


def _ink_mask(img: np.ndarray, bg: np.ndarray) -> np.ndarray:
    return np.abs(img.astype(int) - bg.astype(int)).sum(2) > 60


def _minrect(m: np.ndarray):
    ys, xs = np.nonzero(m)
    if len(xs) < 10:
        return None
    return cv2.boxPoints(cv2.minAreaRect(np.stack([xs, ys], 1).astype(np.float32)))


def _center_err(a: np.ndarray, b: np.ndarray) -> float:
    return float(np.linalg.norm(a.mean(0) - b.mean(0)))


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--save", type=Path)
    a = ap.parse_args()
    run(a.save)
