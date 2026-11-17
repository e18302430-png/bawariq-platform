"""تحليل الكتلة النصية: فصل النص عن الخلفية واستخراج نمطه البصري كاملًا.

لكل كتلة (سطر) نستخرج داخل الإطار المقوَّم:
  1. نموذج الخلفية: سطح متعدد حدود من الدرجة الثانية في فضاء Lab، يُلائَم بشكل متين (robust)
     على حلقة البكسلات المحيطة بالنص — يدعم الخلفيات السادة والمتدرجة.
  2. قناع النص: المسافة اللونية ΔE عن الخلفية المقدَّرة + عتبة Otsu/ضجيج. للخلفيات المزدحمة
     نستخدم K-means ونختار العنقود الموجود داخل النص وغائب عن المحيط.
  3. فصل الحشو (fill) عن الحدود (stroke) بـ K-means + عمق تحويل المسافة، ورفض حواف التنعيم.
  4. الظل: البحث عن إزاحة نسخة من شكل الحروف تفسر البكسلات المتبقية.
  5. اللون الدقيق (وسيط البكسلات الداخلية) والتدرج اللوني (انحدار خطي عمودي/أفقي).
  6. OCR على القناع النظيف، ثم مطابقة الخط بصريًا مع المكتبة، ثم حساب الحجم وخط الأساس
     بحيث يتطابق النص المعاد رسمه مع الأصلي بكسلًا ببكسل، ثم تقدير التمويه.
"""
from __future__ import annotations

import cv2
import numpy as np

from ..fonts import FontLibrary, has_arabic
from . import ocr
from .geometry import Frame, order_quad, quad_angle, quad_size
from .render import Placement, TextStyle, ink_bbox, render_layer, shape_mask


# ---------------------------------------------------------------- أدوات لونية
def bgr_to_lab(img_bgr_u8: np.ndarray) -> np.ndarray:
    return cv2.cvtColor(img_bgr_u8.astype(np.float32) / 255.0, cv2.COLOR_BGR2Lab)


def lab_to_rgb(lab: np.ndarray) -> tuple[int, int, int]:
    px = np.asarray(lab, np.float32).reshape(1, 1, 3)
    bgr = cv2.cvtColor(px, cv2.COLOR_Lab2BGR)[0, 0]
    b, g, r = (np.clip(bgr, 0, 1) * 255).round().astype(int)
    return int(r), int(g), int(b)


def _rgb_to_lab(rgb) -> np.ndarray:
    px = np.array([[[rgb[2], rgb[1], rgb[0]]]], np.float32) / 255.0
    return cv2.cvtColor(px, cv2.COLOR_BGR2Lab)[0, 0]


def rgb_hex(rgb) -> str:
    return "#{:02x}{:02x}{:02x}".format(*[int(c) for c in rgb])


def hex_rgb(h: str) -> tuple[int, int, int]:
    h = h.lstrip("#")
    return int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16)


def _poly_feats(u: np.ndarray, v: np.ndarray) -> np.ndarray:
    return np.stack([np.ones_like(u), u, v, u * u, u * v, v * v], axis=-1)


def fit_background(lab: np.ndarray, ring: np.ndarray) -> tuple[np.ndarray, np.ndarray, float]:
    """يلائم سطحًا تربيعيًا لكل قناة Lab على بكسلات الحلقة. يرجع (الخلفية المقدرة، المعاملات، الضجيج)."""
    h, w = ring.shape
    vv, uu = np.mgrid[0:h, 0:w].astype(np.float32)
    uu /= max(w, 1)
    vv /= max(h, 1)
    ys, xs = np.nonzero(ring)
    if len(ys) > 6000:
        sel = np.random.default_rng(0).choice(len(ys), 6000, replace=False)
        ys, xs = ys[sel], xs[sel]
    A = _poly_feats(uu[ys, xs], vv[ys, xs])
    Y = lab[ys, xs]
    keep = np.ones(len(ys), bool)
    coef = np.zeros((6, 3), np.float32)
    for _ in range(4):
        if keep.sum() < 12:
            break
        coef, *_ = np.linalg.lstsq(A[keep], Y[keep], rcond=None)
        res = np.linalg.norm(A @ coef - Y, axis=1)
        keep = res <= np.quantile(res, 0.75) * 1.5 + 1.0
    full = _poly_feats(uu, vv) @ coef
    res = np.linalg.norm(A[keep] @ coef - Y[keep], axis=1) if keep.any() else np.array([0.0])
    noise = float(np.median(res) * 1.4826) if len(res) else 0.0
    return full.astype(np.float32), coef.astype(np.float32), noise


def _kmeans(x: np.ndarray, k: int, seed: int = 0) -> tuple[np.ndarray, np.ndarray]:
    x = np.asarray(x, np.float32)
    crit = (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 30, 0.2)
    cv2.setRNGSeed(seed)
    _, labels, centers = cv2.kmeans(x, k, None, crit, 3, cv2.KMEANS_PP_CENTERS)
    return labels.ravel(), centers


def _remove_small(mask: np.ndarray, min_area: int, keep_region: np.ndarray) -> np.ndarray:
    n, lab, stats, _ = cv2.connectedComponentsWithStats(mask.astype(np.uint8), connectivity=8)
    out = np.zeros_like(mask, bool)
    for i in range(1, n):
        if stats[i, cv2.CC_STAT_AREA] < min_area:
            continue
        comp = lab == i
        if (comp & keep_region).any():
            out |= comp
    return out


# ---------------------------------------------------------------- التحليل الرئيسي
def analyze_block(img_bgr: np.ndarray, quad: np.ndarray, fonts: FontLibrary,
                  img_center_x: float | None = None) -> tuple[dict, dict]:
    q = order_quad(quad)
    qw, qh = quad_size(q)
    scale = float(np.clip(72.0 / max(qh, 1), 1.0, 4.0))
    scale = min(scale, 5000.0 / max(qw + qh, 1))
    mx, my = 0.6 * qh + 3, 0.5 * qh + 3
    fr = Frame.from_quad(q, mx, my, max(scale, 0.25))
    crop = fr.sample(img_bgr)
    lab = bgr_to_lab(crop)
    H, W = crop.shape[:2]
    u0, v0, u1, v1 = fr.core
    ch = v1 - v0

    vv, uu = np.mgrid[0:H, 0:W]
    core = (uu >= u0) & (uu < u1) & (vv >= v0) & (vv < v1)
    zone = (uu >= u0 - 0.3 * ch) & (uu < u1 + 0.3 * ch) & (vv >= v0 - 0.35 * ch) & (vv < v1 + 0.35 * ch)
    ring = ~((uu >= u0 - 0.12 * ch) & (uu < u1 + 0.12 * ch) & (vv >= v0 - 0.12 * ch) & (vv < v1 + 0.12 * ch))

    bg_lab, bg_coef, noise = fit_background(lab, ring)
    dist = np.linalg.norm(lab - bg_lab, axis=2)
    textured = noise > 9.0

    if not textured:
        d8 = np.clip(dist[zone] * 2.0, 0, 255).astype(np.uint8)
        otsu, _ = cv2.threshold(d8.reshape(-1, 1), 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
        # عتبة منخفضة عمدًا حتى تلتقط الحدود (stroke) منخفضة التباين مع الخلفية
        thr = max(3.0 * noise + 8.0, min(otsu / 2.0, 18.0))
        fg = (dist > thr) & zone
        lo, hi = max(thr * 0.45, 2 * noise + 2), thr * 1.6
    else:
        # خلفية مزدحمة: عنقود النص هو الأكثر حضورًا داخل الصندوق والأقل في المحيط
        zl = lab[zone]
        k = 4
        labels_z, centers = _kmeans(zl[:: max(1, len(zl) // 20000)], k)
        dists = np.linalg.norm(lab[..., None, :] - centers[None, None], axis=3)
        lab_all = np.argmin(dists, axis=2)
        scores = []
        for c in range(k):
            in_core = (lab_all[core] == c).mean()
            in_ring = (lab_all[ring] == c).mean()
            scores.append(in_core - 1.5 * in_ring)
        best = int(np.argmax(scores))
        fg = (lab_all == best) & zone
        tc = centers[best]
        # قناع ناعم: القرب من مركز عنقود النص مقابل أقرب عنقود آخر
        other = np.min(np.delete(dists, best, axis=2), axis=2)
        dist = other - dists[..., best]  # موجب = أقرب للنص
        thr, lo, hi = 0.0, -4.0, 6.0
        _ = tc

    # الحد الأدنى لمساحة المكوّن نسبةً لارتفاع النص — يحافظ على نقاط الحروف العربية والتشكيل
    min_area = max(3, int((0.045 * ch) ** 2))
    kr = max(3, int(0.12 * ch) | 1)
    keep_region = cv2.dilate(core.astype(np.uint8), np.ones((kr, kr), np.uint8)).astype(bool)
    fg = _remove_small(fg, min_area, keep_region)
    # أجزاء الحروف التي تتجاوز صندوق الاكتشاف (ذيول الحروف العربية، الحدود العريضة):
    # نضم أي مكوّن متصل بالنص خارج المنطقة الأساسية ضمن الإطار
    if not textured and fg.any():
        fg_frame = (dist > thr)
        n_c, lab_c = cv2.connectedComponents(fg_frame.astype(np.uint8), connectivity=8)
        touching = np.unique(lab_c[fg & fg_frame])
        touching = touching[touching > 0]
        if len(touching):
            ext = np.isin(lab_c, touching)
            border = np.zeros_like(ext)
            border[[0, -1], :] = True
            border[:, [0, -1]] = True
            # لا نضم مكونًا يمتد حتى حافة الإطار (غالبًا عنصر خلفية وليس جزءًا من حرف)
            bad = np.unique(lab_c[ext & border])
            ext &= ~np.isin(lab_c, bad[bad > 0])
            fg |= ext
    soft = np.clip((dist - lo) / max(hi - lo, 1e-3), 0, 1).astype(np.float32)
    soft = np.where(cv2.dilate(fg.astype(np.uint8), np.ones((3, 3), np.uint8)) > 0, soft, 0)

    result_masks: dict = {}
    if fg.sum() < 10:
        block = _empty_block(q, fr, noise, bg_coef, textured, fonts)
        result_masks["glyph"] = np.zeros((H, W), np.float16)
        return block, result_masks

    # ------------------------------------------ فصل الحشو عن الحدود
    fg_u8 = fg.astype(np.uint8)
    dt = cv2.distanceTransform(fg_u8, cv2.DIST_L2, 3)
    fill, stroke = fg.copy(), np.zeros_like(fg)
    stroke_w, stroke_rgb = 0.0, (0, 0, 0)
    pix = lab[fg]
    if len(pix) > 40:
        sub = pix[:: max(1, len(pix) // 20000)]
        lbl_s, cen = _kmeans(sub, 2)
        lbl = np.argmin(np.linalg.norm(pix[:, None] - cen[None], axis=2), axis=1)
        depth = [dt[fg][lbl == c].mean() if (lbl == c).any() else 0 for c in range(2)]
        inner, outer = (0, 1) if depth[0] >= depth[1] else (1, 0)
        frac_outer = (lbl == outer).mean()
        de = float(np.linalg.norm(cen[0] - cen[1]))
        # هل اللون الخارجي مجرد مزج بين الحشو والخلفية (تنعيم حواف)؟
        bgc = np.median(bg_lab[fg], axis=0)
        seg = cen[inner] - bgc
        t = float(np.clip(np.dot(cen[outer] - bgc, seg) / max(np.dot(seg, seg), 1e-6), 0, 1))
        off_line = float(np.linalg.norm(cen[outer] - (bgc + t * seg)))
        is_blend = off_line < max(10.0, 0.25 * de)
        if de > 22 and 0.12 < frac_outer < 0.85 and not is_blend:
            m_outer = np.zeros_like(fg)
            m_outer[fg] = lbl == outer
            m_inner = fg & ~m_outer
            m_inner = _remove_small(m_inner, max(2, min_area // 2), keep_region)
            if m_inner.sum() > 0.1 * fg.sum():
                edge = m_inner & ~cv2.erode(m_inner.astype(np.uint8), np.ones((3, 3), np.uint8)).astype(bool)
                sw = float(np.median(dt[edge])) if edge.any() else 0.0
                if sw >= 1.2:
                    fill, stroke = m_inner, m_outer
                    stroke_w = sw
                    stroke_rgb = lab_to_rgb(np.median(lab[m_outer & (dt >= 1)], axis=0)
                                            if (m_outer & (dt >= 1)).any() else cen[outer])

    # ------------------------------------------ الظل
    glyph = fill | stroke
    shadow = None
    residual = fg & ~cv2.dilate(glyph.astype(np.uint8), np.ones((3, 3), np.uint8)).astype(bool)
    if residual.sum() > 0.08 * fill.sum():
        best, best_s = None, 0.0
        g8 = glyph.astype(np.uint8)
        rng = int(max(2, 0.3 * ch))
        step = max(1, rng // 10)
        for dy in range(-rng, rng + 1, step):
            for dx in range(-rng, rng + 1, step):
                if dx == 0 and dy == 0:
                    continue
                sh = cv2.warpAffine(g8, np.float32([[1, 0, dx], [0, 1, dy]]), (W, H)).astype(bool)
                s = (sh & residual).sum() / max(residual.sum(), 1)
                if s > best_s:
                    best_s, best = s, (dx, dy)
        if best and best_s > 0.45:
            dx, dy = best
            sh_mask = residual & cv2.warpAffine(glyph.astype(np.uint8), np.float32([[1, 0, dx], [0, 1, dy]]),
                                                (W, H)).astype(bool)
            shadow = {"dx": float(dx), "dy": float(dy), "blur": 0.0,
                      "color": lab_to_rgb(np.median(lab[sh_mask], axis=0)), "opacity": 0.9}

    # ------------------------------------------ اللون والتدرج
    dt_fill = cv2.distanceTransform(fill.astype(np.uint8), cv2.DIST_L2, 3)
    deep = fill & (dt_fill >= max(1.0, np.percentile(dt_fill[fill], 50)))
    if deep.sum() < 5:
        deep = fill
    fill_lab = np.median(lab[deep], axis=0)
    fpx = crop[deep].astype(np.float32)
    fill_noise = float(np.median(np.abs(fpx - np.median(fpx, axis=0))) * 1.4826) if len(fpx) > 20 else 0.0
    color = lab_to_rgb(fill_lab)
    gradient = None
    ys, xs = np.nonzero(deep)
    if len(ys) > 50:
        best_axis, best_r2, best_fit = None, 0.0, None
        for axis, coord in (("v", ys), ("h", xs)):
            c = (coord - coord.min()) / max(np.ptp(coord), 1)
            A = np.stack([np.ones_like(c, dtype=np.float32), c.astype(np.float32)], 1)
            Y = lab[ys, xs]
            coef, *_ = np.linalg.lstsq(A, Y, rcond=None)
            r2 = 1 - ((A @ coef - Y) ** 2).sum() / max(((Y - Y.mean(0)) ** 2).sum(), 1e-6)
            if r2 > best_r2:
                best_axis, best_r2, best_fit = axis, r2, coef
        if best_fit is not None and best_r2 > 0.55 and np.linalg.norm(best_fit[1]) > 14:
            gradient = {"from": lab_to_rgb(best_fit[0]), "to": lab_to_rgb(best_fit[0] + best_fit[1]),
                        "axis": best_axis}

    # ------------------------------------------ الحافة الحقيقية للحروف (تغطية 50%)
    # القناع الثنائي بعتبة منخفضة يكون أسمك من الحرف الفعلي (يلتقط بكسلات التنعيم)، وهذا يحرف
    # مطابقة الخط نحو الأوزان الأثقل. نسقط كل بكسل على الخط الواصل بين لون "ما تحته" ولون
    # الحشو ونأخذ نقطة المنتصف: هذه هي حافة الحرف الحقيقية بدقة دون البكسل.
    near = cv2.dilate(fg.astype(np.uint8), np.ones((3, 3), np.uint8)).astype(bool)
    under = (np.broadcast_to(_rgb_to_lab(stroke_rgb), lab.shape) if stroke.any() else bg_lab)
    vec = fill_lab[None, None, :] - under
    t_fill = ((lab - under) * vec).sum(2) / np.maximum((vec * vec).sum(2), 1e-3)
    fill50 = (t_fill > 0.5) & near & cv2.dilate(fill.astype(np.uint8), np.ones((3, 3), np.uint8)).astype(bool)
    fill50 = _remove_small(fill50, max(2, min_area // 2), keep_region)
    if fill50.sum() > 0.5 * fill.sum():
        fill = fill50
    if stroke.any():
        vs = _rgb_to_lab(stroke_rgb)[None, None, :] - bg_lab
        t_st = ((lab - bg_lab) * vs).sum(2) / np.maximum((vs * vs).sum(2), 1e-3)
        stroke = ((t_st > 0.5) & near & ~fill) | (stroke & ~near)
    glyph = fill | stroke

    # ------------------------------------------ OCR
    pad = int(0.15 * ch)
    cy0, cy1 = max(int(v0) - pad, 0), min(int(v1) + pad, H)
    cx0, cx1 = max(int(u0) - pad, 0), min(int(u1) + pad, W)
    rec = ocr.recognize(crop[cy0:cy1, cx0:cx1], fill.astype(np.float32))
    text = rec["text"]

    # ------------------------------------------ مطابقة الخط والحجم وخط الأساس
    ib = ink_bbox(fill.astype(np.float32))
    tx0, ty0, tx1, ty1 = ib
    Ht, Wt = ty1 - ty0, tx1 - tx0
    candidates = _match_fonts(text, fill[ty0:ty1, tx0:tx1], fonts) if text else []
    font = fonts.get(candidates[0]["id"]) if candidates else fonts.default_for(text)
    size, hscale = _fit_size(text, font.path, Ht, Wt, rec["confidence"], fill[ty0:ty1, tx0:tx1])

    direction = "rtl" if has_arabic(text) else "ltr"
    cx_img = fr.to_image(np.float32([[(tx0 + tx1) / 2, (ty0 + ty1) / 2]]))[0][0]
    if img_center_x is not None and abs(cx_img - img_center_x) < 0.04 * 2 * img_center_x:
        align = "center"
    else:
        align = "right" if direction == "rtl" else "left"

    baseline_y = float(ty1)
    if text:
        m, (ox, oy) = shape_mask(text, font.path, size, 0)
        mb = ink_bbox(m)
        if mb:
            baseline_y = float(ty0 - (oy + mb[1]))
    anchor_x = {"left": tx0, "right": tx1, "center": (tx0 + tx1) / 2}[align]

    st = TextStyle(font.path, size, color, gradient, stroke_w, stroke_rgb, None, 1.0, 0.0, hscale)
    pl = Placement(align, float(anchor_x), baseline_y)
    if text:
        st, pl = _refine_alignment(text, st, pl, glyph, H, W)
        size, anchor_x, baseline_y = st.size, pl.anchor_x, pl.baseline_y
    blur, match = 0.0, 0.0
    if text:
        match = _iou(_paint_alpha(text, st, pl, H, W) > 0.5, glyph)
        if rec["confidence"] >= 0.55 and match >= 0.6:
            blur, sw_fit = _fit_by_synthesis(text, st, pl, crop, bg_lab, glyph, fr.scale)
            if sw_fit is not None:
                stroke_w = sw_fit

    # ------------------------------------------ تجميع
    glyph_all = glyph.copy()
    if shadow:
        glyph_all |= residual
    soft_all = np.maximum(soft * cv2.dilate(glyph_all.astype(np.uint8), np.ones((5, 5), np.uint8)),
                          glyph_all.astype(np.float32))
    result_masks["glyph"] = soft_all.astype(np.float16)

    s = fr.scale
    block = {
        "quad": fr.core_quad().round(2).tolist(),
        "outline": fr.outline().round(2).tolist(),
        "angle": round(quad_angle(q), 2),
        "text": text,
        "ocr": {"confidence": rec["confidence"], "engine": rec["engine"], "script": rec["script"]},
        "direction": direction,
        "style": {
            "font_id": font.id,
            "font_candidates": candidates,
            "size_px": round(size / s, 2),
            "color": rgb_hex(color),
            "gradient": {**gradient, "from": rgb_hex(gradient["from"]), "to": rgb_hex(gradient["to"])}
            if gradient else None,
            "stroke_width_px": round(stroke_w / s, 2),
            "stroke_color": rgb_hex(stroke_rgb),
            "shadow": {"dx_px": round(shadow["dx"] / s, 2), "dy_px": round(shadow["dy"] / s, 2),
                       "blur_px": 0.0, "color": rgb_hex(shadow["color"]), "opacity": shadow["opacity"]}
            if shadow else None,
            "blur_px": round(blur / s, 3),
            "align": align,
            "hscale": round(hscale, 3),
            "opacity": 1.0,
        },
        "frame": fr.to_dict(),
        "placement": {"anchor_x": float(anchor_x), "baseline_y": baseline_y, "align": align,
                      "ink": [int(tx0), int(ty0), int(tx1), int(ty1)]},
        "background": {"noise": round(noise, 2), "textured": bool(textured), "coef": bg_coef.tolist()},
        "match_score": round(match, 3),
        "grain": round(fill_noise if not gradient else min(fill_noise, 3.0), 2),
    }
    return block, result_masks


def _empty_block(q, fr: Frame, noise, coef, textured, fonts: FontLibrary) -> dict:
    f = fonts.default_for("")
    u0, v0, u1, v1 = fr.core
    return {
        "quad": fr.core_quad().round(2).tolist(), "outline": fr.outline().round(2).tolist(),
        "angle": round(quad_angle(q), 2), "text": "", "ocr": {"confidence": 0, "engine": "none", "script": "latin"},
        "direction": "ltr",
        "style": {"font_id": f.id, "font_candidates": [], "size_px": round((v1 - v0) * 0.8 / fr.scale, 2),
                  "color": "#000000", "gradient": None, "stroke_width_px": 0, "stroke_color": "#000000",
                  "shadow": None, "blur_px": 0, "align": "left", "hscale": 1.0, "opacity": 1.0},
        "frame": fr.to_dict(),
        "placement": {"anchor_x": u0, "baseline_y": v1 - 0.2 * (v1 - v0), "align": "left",
                      "ink": [int(u0), int(v0), int(u1), int(v1)]},
        "background": {"noise": round(noise, 2), "textured": bool(textured), "coef": coef.tolist()},
        "match_score": 0.0,
        "grain": 0.0,
    }


def _norm_h(m: np.ndarray, h: int = 40) -> np.ndarray:
    s = h / max(m.shape[0], 1)
    return cv2.resize(m.astype(np.float32), (max(1, int(round(m.shape[1] * s))), h), interpolation=cv2.INTER_AREA)


def _match_fonts(text: str, target: np.ndarray, fonts: FontLibrary, top: int = 5) -> list[dict]:
    """مطابقة بصرية: نرسم نفس النص بكل خط مرشح ونقارن الشكل (IoU ناعم) ونسبة العرض للارتفاع."""
    if target.size == 0 or target.sum() < 10:
        return []
    tgt = _norm_h(target)
    th, tw = tgt.shape
    sw_t = _stroke_ratio(target)
    scores = []
    for f in fonts.candidates(text):
        try:
            m, _ = shape_mask(text, f.path, 48)
        except Exception:  # noqa: BLE001
            continue
        bb = ink_bbox(m)
        if not bb:
            continue
        r = _norm_h(m[bb[1]:bb[3], bb[0]:bb[2]])
        ar = r.shape[1] / max(tw, 1)
        sw_r = _stroke_ratio(m[bb[1]:bb[3], bb[0]:bb[2]] > 0.5)
        r = cv2.resize(r, (tw, th), interpolation=cv2.INTER_AREA)
        iou = float(np.minimum(r, tgt).sum() / max(np.maximum(r, tgt).sum(), 1e-6))
        # الوزن (سماكة الخط نسبةً للارتفاع) لا يعتمد على صحة نص الـ OCR — يحمي من أخطاء التعرف
        wpen = float(np.exp(-2.5 * abs(np.log(max(sw_r, 1e-3) / max(sw_t, 1e-3)))))
        score = iou * float(np.exp(-2.0 * abs(np.log(max(ar, 1e-3))))) * wpen
        scores.append((score, f))
    scores.sort(key=lambda x: -x[0])
    return [{"id": f.id, "family": f.family, "weight": f.weight, "score": round(s, 3)} for s, f in scores[:top]]


def _stroke_ratio(mask: np.ndarray) -> float:
    """متوسط سماكة الخط / ارتفاع الحبر (عبر تحويل المسافة على هيكل الحروف)."""
    m = (np.asarray(mask) > 0.5).astype(np.uint8)
    if m.sum() < 10:
        return 0.1
    dt = cv2.distanceTransform(m, cv2.DIST_L2, 3)
    # قمم تحويل المسافة (المحور الأوسط) تقريبًا = نصف السماكة
    peaks = (dt >= cv2.dilate(dt, np.ones((3, 3), np.uint8))) & (dt > 0.5)
    th = 2.0 * float(np.median(dt[peaks])) if peaks.any() else 1.0
    return th / max(m.shape[0], 1)


def _body_band(mask: np.ndarray) -> float:
    """ارتفاع "جسم" السطر: الصفوف ذات كثافة الحبر العالية (لا يتأثر بالنقاط والصواعد والنوازل)."""
    rows = (np.asarray(mask) > 0.5).sum(axis=1).astype(np.float32)
    if rows.max() <= 0:
        return 0.0
    return float((rows > 0.35 * rows.max()).sum())


def _fit_size(text: str, font_path: str, Ht: int, Wt: int, conf: float,
              target: np.ndarray | None = None) -> tuple[float, float]:
    """الحجم = وسيط ثلاثة تقديرات (الارتفاع الكلي، ارتفاع الجسم، العرض) — يقاوم أخطاء الـ OCR."""
    if not text:
        return max(4.0, Ht / 0.72), 1.0
    m, _ = shape_mask(text, font_path, 100)
    bb = ink_bbox(m)
    if not bb:
        return max(4.0, Ht / 0.72), 1.0
    h100, w100 = bb[3] - bb[1], bb[2] - bb[0]
    est = [100.0 * Ht / max(h100, 1)]
    if target is not None and target.size:
        bt = _body_band(target)
        br = _body_band(m[bb[1]:bb[3], bb[0]:bb[2]])
        if bt > 2 and br > 2:
            est.append(100.0 * bt / br)
    est.append(100.0 * Wt / max(w100, 1))
    size = float(np.median(est)) if len(est) == 3 else est[0]
    # تحسين: أعد القياس عند الحجم المقدّر (التلميح hinting يغير النسب قليلًا)
    m2, _ = shape_mask(text, font_path, size)
    bb2 = ink_bbox(m2)
    if bb2 and bb2[3] - bb2[1] > 0:
        w_at = bb2[2] - bb2[0]
    else:
        w_at = w100 * size / 100
    hscale = float(np.clip(Wt / max(w_at, 1), 0.85, 1.18)) if conf >= 0.7 else 1.0
    return float(size), hscale


def _paint_alpha(text: str, st: TextStyle, pl: Placement, H: int, W: int) -> np.ndarray:
    base, (ox, oy) = render_layer(text, st, pl)
    alpha = np.zeros((H, W), np.float32)
    x0, y0 = int(round(ox)), int(round(oy))
    a = base[..., 3]
    sx0, sy0 = max(0, -x0), max(0, -y0)
    dx0, dy0 = max(0, x0), max(0, y0)
    w = min(a.shape[1] - sx0, W - dx0)
    h = min(a.shape[0] - sy0, H - dy0)
    if w > 0 and h > 0:
        alpha[dy0:dy0 + h, dx0:dx0 + w] = a[sy0:sy0 + h, sx0:sx0 + w]
    return alpha


def _refine_alignment(text: str, st: TextStyle, pl: Placement, glyph: np.ndarray, H: int, W: int):
    """ضبط دقيق: نبحث عن أفضل حجم وإزاحة (دون البكسل بعد الإسقاط) تطابق النص المعاد رسمه مع الأصل."""
    from dataclasses import replace

    g = glyph.astype(np.float32)
    if g.sum() < 10:
        return st, pl

    def score(a: np.ndarray) -> float:
        return float(np.minimum(a, g).sum() / max(np.maximum(a, g).sum(), 1e-6))

    ys = np.nonzero(g > 0.5)[0]
    cyg = (ys.min() + ys.max() + 1) / 2 if len(ys) else pl.baseline_y
    best = (score(_paint_alpha(text, st, pl, H, W)), st, pl)
    for f in (0.96, 0.98, 1.02, 1.04):
        st2 = replace(st, size=st.size * f)
        pl2 = replace(pl, baseline_y=cyg + (pl.baseline_y - cyg) * f)
        sc = score(_paint_alpha(text, st2, pl2, H, W))
        if sc > best[0]:
            best = (sc, st2, pl2)
    sc0, st, pl = best
    a = _paint_alpha(text, st, pl, H, W)
    r = 4
    ap = np.pad(a, r)
    best_s, best_d = sc0, (0, 0)
    for dy in range(-r, r + 1):
        for dx in range(-r, r + 1):
            sh = ap[r - dy:r - dy + H, r - dx:r - dx + W]
            sc = score(sh)
            if sc > best_s + 1e-4:
                best_s, best_d = sc, (dx, dy)
    dx, dy = best_d
    return st, replace(pl, anchor_x=pl.anchor_x + dx, baseline_y=pl.baseline_y + dy)


def _iou(a: np.ndarray, b: np.ndarray) -> float:
    return float((a & b).sum() / max((a | b).sum(), 1))


def _fit_by_synthesis(text: str, st: TextStyle, pl: Placement, crop: np.ndarray, bg_lab: np.ndarray,
                      glyph: np.ndarray, frame_scale: float) -> tuple[float, float | None]:
    """تحليل بالتركيب: نركّب النص المعاد رسمه فوق نموذج الخلفية ونقارن بالبكسلات الفعلية،
    ونختار تمويه الحواف (وسماكة الحدود إن وجدت) الأقل خطأً."""
    from dataclasses import replace

    H, W = glyph.shape
    bg = np.clip(cv2.cvtColor(bg_lab, cv2.COLOR_Lab2BGR), 0, 1)[..., ::-1]  # RGB
    actual = crop[..., ::-1].astype(np.float32) / 255
    k = max(3, int(0.15 * H) | 1)
    region = cv2.dilate(glyph.astype(np.uint8), np.ones((k, k), np.uint8)).astype(bool)
    if region.sum() < 20:
        return 0.0, None

    def canvas(stx: TextStyle) -> np.ndarray:
        base, (ox, oy) = render_layer(text, stx, pl)
        out = np.zeros((H, W, 4), np.float32)
        x0, y0 = int(round(ox)), int(round(oy))
        sx0, sy0, dx0, dy0 = max(0, -x0), max(0, -y0), max(0, x0), max(0, y0)
        w, h = min(base.shape[1] - sx0, W - dx0), min(base.shape[0] - sy0, H - dy0)
        if w > 0 and h > 0:
            out[dy0:dy0 + h, dx0:dx0 + w] = base[sy0:sy0 + h, sx0:sx0 + w]
        return out

    def lum(x: np.ndarray) -> np.ndarray:
        return x[..., 0] * 0.299 + x[..., 1] * 0.587 + x[..., 2] * 0.114

    sc = 1.0 / max(frame_scale, 1.0)

    def sharp(img_rgb: np.ndarray) -> float:
        """حدة الحواف بالدقة الأصلية للصورة: المئين 95 لشدة التدرج داخل منطقة النص."""
        im, reg = img_rgb, region
        if sc < 0.999:
            im = cv2.resize(img_rgb, None, fx=sc, fy=sc, interpolation=cv2.INTER_AREA)
            reg = cv2.resize(region.astype(np.uint8), (im.shape[1], im.shape[0]),
                             interpolation=cv2.INTER_NEAREST).astype(bool)
        L = lum(im).astype(np.float32)
        gx = cv2.Sobel(L, cv2.CV_32F, 1, 0, ksize=3)
        gy = cv2.Sobel(L, cv2.CV_32F, 0, 1, ksize=3)
        g = np.sqrt(gx * gx + gy * gy)[reg]
        return float(np.percentile(g, 95)) if g.size else 0.0

    # 1) سماكة الحدود: أقل خطأ تركيب (بدون تمويه)
    sw_best = None
    rgba = canvas(replace(st, blur=0.0))
    if st.stroke_width > 0:
        errs = []
        for sf in (0.7, 0.8, 0.9, 1.0, 1.1):
            r = canvas(replace(st, blur=0.0, stroke_width=st.stroke_width * sf))
            syn = r[..., :3] + bg * (1 - r[..., 3:])
            errs.append((float(np.mean((syn[region] - actual[region]) ** 2)), sf, r))
        e1 = next(e for e in errs if e[1] == 1.0)[0]
        e_best, sf_best, r_best = min(errs, key=lambda e: e[0])
        if e_best < e1 * 0.97:
            sw_best, rgba = st.stroke_width * sf_best, r_best

    # 2) التمويه: طابق حدة الحواف (مستقل عن أخطاء المحاذاة الطفيفة)
    target = sharp(actual)
    best_sig, best_d = 0.0, np.inf
    for sig in (0.0, 0.35, 0.6, 0.9, 1.2, 1.6, 2.2, 3.0):
        sig_f = sig / max(sc, 1e-3)  # بكسلات صورة -> بكسلات إطار
        r = cv2.GaussianBlur(rgba, (0, 0), sig_f) if sig > 0 else rgba
        syn = r[..., :3] + bg * (1 - r[..., 3:])
        d = abs(sharp(syn) - target)
        if d < best_d - 1e-4:
            best_sig, best_d = sig_f, d
    return best_sig, sw_best


def _fit_blur(text: str, st: TextStyle, pl: Placement, soft: np.ndarray, glyph: np.ndarray,
              H: int, W: int) -> tuple[float, float]:
    """يقدّر تمويه الحواف بمقارنة النص المعاد رسمه مع الأصلي، ويعيد درجة التطابق (IoU)."""
    try:
        alpha = _paint_alpha(text, st, pl, H, W)
    except Exception:  # noqa: BLE001
        return 0.0, 0.0
    iou = float(np.minimum(alpha > 0.5, glyph).sum() / max(np.maximum(alpha > 0.5, glyph).sum(), 1))
    best_s, best_c, c0 = 0.0, -1.0, None
    sel = soft > 0
    sel |= alpha > 0
    if sel.sum() < 10:
        return 0.0, iou
    for s in (0.0, 0.5, 0.8, 1.2, 1.7, 2.4, 3.2):
        b = cv2.GaussianBlur(alpha, (0, 0), s) if s > 0 else alpha
        c = float(np.corrcoef(b[sel], soft[sel])[0, 1])
        if c0 is None:
            c0 = c
        if c > best_c + 0.004:
            best_s, best_c = s, c
    # لا نقبل التمويه إلا إذا حسّن التطابق فعليًا (لا نعوّض عدم المحاذاة بالتمويه)
    if c0 is not None and best_c - c0 < 0.02:
        best_s = 0.0
    return best_s, iou
