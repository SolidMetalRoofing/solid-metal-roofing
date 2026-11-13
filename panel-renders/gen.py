"""Generate panel profile files for pt.c, run it, and post-process."""
import math, subprocess, sys, os
import numpy as np
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
EXPO = 1.0
TH = 0.036  # visual sheet thickness (in)


def fillet(pts, r, n=9):
    """Round interior corners of an open polyline."""
    out = [pts[0]]
    for i in range(1, len(pts) - 1):
        A, B, C = np.array(pts[i - 1], float), np.array(pts[i], float), np.array(pts[i + 1], float)
        u, w = A - B, C - B
        lu, lw = np.linalg.norm(u), np.linalg.norm(w)
        if lu < 1e-9 or lw < 1e-9:
            continue
        u, w = u / lu, w / lw
        cosang = float(np.clip(u @ w, -1, 1)); ang = math.acos(cosang)
        if abs(math.pi - ang) < 0.02:
            out.append(tuple(B)); continue
        d = min(r / math.tan(ang / 2), 0.45 * lu, 0.45 * lw)
        rr = d * math.tan(ang / 2)
        T1, T2 = B + u * d, B + w * d
        bis = (u + w); bis /= np.linalg.norm(bis)
        Cn = B + bis * (rr / math.sin(ang / 2))
        a1 = math.atan2(T1[1] - Cn[1], T1[0] - Cn[0]); a2 = math.atan2(T2[1] - Cn[1], T2[0] - Cn[0])
        da = a2 - a1
        while da > math.pi: da -= 2 * math.pi
        while da < -math.pi: da += 2 * math.pi
        for k in range(n + 1):
            a = a1 + da * k / n
            out.append((Cn[0] + rr * math.cos(a), Cn[1] + rr * math.sin(a)))
    out.append(pts[-1])
    return out


def trap(c, base, top, h):
    return [(c - base / 2, 0), (c - top / 2, h), (c + top / 2, h), (c + base / 2, 0)]


def rib(c, half):
    """Symmetric rib from a half-profile [(dx, z) from outer base up to the top edge]."""
    L = [(c - dx, z) for dx, z in half]
    R = [(c + dx, z) for dx, z in reversed(half)]
    return L + R


# Geometry below follows the VersaFrame Inc. "Profiles" sheet drawings.
H936 = [(0.875, 0), (0.46, 0.56), (0.33, 0.585), (0.25, 0.75)]   # bell-top 3/4" rib


def P_936():
    p = [(-1.0, 0)]
    for c in (0, 9, 18, 27):
        p += rib(c, H936)
        for m in (3, 6):
            p += trap(c + m, 0.95, 0.5, 0.17)
    p += rib(36, H936) + [(37.35, 0)]
    sc = [(c + 1.65, TH / 2) for c in (0, 9, 18, 27)] + [(36 - 1.65, TH / 2)]
    return [fillet(p, 0.06)], sc, [3.5, 27.5]


H1236 = [(2.0, 0), (1.86, 0.24), (1.58, 0.24), (0.625, 1.5)]      # 1.5" rib, 1.25" top, base shelf


def P_1236():
    p = [(-1.32, 0.58), (-0.625, 1.5), (0.625, 1.5), (1.58, 0.24), (1.86, 0.24), (2.0, 0)]
    for c in (0, 12, 24):
        if c:
            p += rib(c, H1236)
        for m in (4.5, 7.5):
            p += trap(c + m, 1.05, 0.55, 0.24)
    p += rib(36, H1236) + [(38.6, 0)]
    sc = [(c + 3.0, TH / 2) for c in (0, 12, 24)] + [(c - 3.0, TH / 2) for c in (12, 24, 36)]
    return [fillet(p, 0.09)], sc, [3.5, 27.5]


def P_corr():
    pitch, amp = 2.6667, 0.4375
    xs = np.linspace(-0.55, 36.6, 1600)
    p = []
    for x in xs:
        c = math.cos(2 * math.pi * (x - 2.0) / pitch)
        c = math.copysign(abs(c) ** 0.78, c)        # slightly rounder than a pure sine, as drawn
        p.append((float(x), float(amp * (1 - c))))
    sc = [(2.0 + pitch * 3 * k, TH / 2) for k in range(5)]
    return [p], sc, [3.5, 27.5]


HDIA = [(1.25, 0), (0.5, 0.75)]                                     # 3/4" rib, 1" top, 2.5" base


def P_diamond():
    p = [(-1.45, 0)]
    for c in (0, 6, 12, 18, 24, 30):
        p += rib(c, HDIA)
        for m in (2.42, 3.58):
            p += trap(c + m, 0.95, 0.62, 0.14)
    p += rib(36, HDIA) + [(37.45, 0)]
    sc = [(c + 1.6, TH / 2) for c in (0, 12, 24)] + [(36 - 1.6, TH / 2)]
    return [fillet(p, 0.07)], sc, [3.5, 27.5]


def ss_pan(a, b, first=False, last=False):
    """Pan between seams: raised shelf beside each leg, two pencil ribs at the thirds."""
    pts = []
    x0 = a if first else a + 0.95
    x1 = b if last else b - 0.95
    span = b - a
    for f in (1 / 3, 2 / 3):
        c = a + span * f
        if x0 + 0.7 < c < x1 - 0.7:
            pts += trap(c, 1.15, 0.8, 0.11)
    return pts


def P_ss():
    """1-1/2" mechanically seamed standing seam, 16" pans (shown seamed)."""
    H, SH = 1.5, 0.12
    head = lambda s: [(s - 0.7, SH), (s, SH), (s, H), (s + 0.15, H), (s + 0.15, H - 0.6), (s + 0.09, H - 0.6)]
    foot = lambda s: [(s + 0.075, H - 0.09), (s + 0.075, SH), (s + 0.7, SH), (s + 0.95, 0)]
    curves = []
    c0 = [(-1.6, 0), (2.0 - 0.95, 0)] + head(2.0)
    curves.append(fillet(c0, 0.035, 6))
    for a, b in ((2.0, 18.0), (18.0, 34.0)):
        c = foot(a) + ss_pan(a, b) + [(b - 0.95, 0)] + head(b)
        curves.append(fillet(c, 0.035, 6))
    curves.append(fillet(foot(34.0) + [(37.6, 0)], 0.035, 6))
    return curves, [], []


def P_snap():
    """1" snap-lock: rounded seam, three wide shallow ribs per 16" pan."""
    p = [(-1.6, 0)]
    prev = None
    for s in (2.0, 18.0, 34.0):
        if prev is not None:
            a, b = prev + 0.45, s - 0.47
            for f in (0.2, 0.5, 0.8):
                p += trap(a + (b - a) * f, 3.0, 1.7, 0.11)
        p += [(s - 0.47, 0), (s - 0.47, 0.07), (s - 0.42, 0.09), (s - 0.13, 1.0), (s + 0.13, 1.0), (s + 0.45, 0)]
        prev = s
    p += [(37.6, 0)]
    return [fillet(p, 0.13, 10)], [], []


PROFILES = {
    '9-36': P_936, '12-36': P_1236, 'corrugated': P_corr,
    'diamond-rib': P_diamond, 'standing-seam': P_ss, 'snaplock': P_snap,
}
WAVY = {'standing-seam': 0.005, 'snaplock': 0.003}
PAINT = (0.150, 0.158, 0.168)   # neutral slate grey, linear


def write_profile(name, path, length=50.0):
    curves, screws, rows = PROFILES[name]()
    segs = []
    for c in curves:
        for i in range(len(c) - 1):
            fl = (1 if i == 0 else 0) | (2 if i == len(c) - 2 else 0)
            segs.append((c[i][0], c[i][1], c[i + 1][0], c[i + 1][1], fl))
    zmax = max(max(s[1], s[3]) for s in segs)
    cam = (-15.5, -27.0, 15.0 + zmax * 2.2)
    tgt = (17.5, 14.5, 0.2)
    foc = (10.0, 4.0, zmax * 0.5)
    with open(path, 'w') as f:
        f.write(f'{length} {TH} {WAVY.get(name, 0)}\n')
        f.write('%g %g %g\n' % PAINT)
        f.write('%g %g %g %g %g %g %g %g %g %g %g\n' % (*cam, *tgt, 34.0, 0.16, *foc))
        f.write(f'{len(screws)}\n')
        for x, z in screws:
            f.write(f'{x} {z}\n')
        f.write(f'{len(rows)}\n' + ' '.join(str(r) for r in rows) + '\n')
        f.write(f'{len(segs)}\n')
        for s in segs:
            f.write('%.6f %.6f %.6f %.6f %d\n' % s)


def post(raw, W, H, out, bg=(10, 10, 10)):
    import cv2
    a = np.fromfile(raw, dtype=np.float32).reshape(H, W, 3).astype(np.float64)
    a = a * EXPO
    a = (a * (2.51 * a + 0.03)) / (a * (2.43 * a + 0.59) + 0.14)   # ACES-style curve
    a = np.clip(a, 0, 1)
    s = np.where(a <= 0.0031308, a * 12.92, 1.055 * np.power(a, 1 / 2.4) - 0.055)
    img = (np.clip(s, 0, 1) * 255).astype(np.uint8)
    img = cv2.fastNlMeansDenoisingColored(img, None, 3, 3, 5, 15)
    c0, c1 = int(H * 0.13), int(H * 0.97)
    img = img[c0:c1]; H = img.shape[0]
    # fade the edges into the card colour so the image sits seamlessly in its card
    yy, xx = np.mgrid[0:H, 0:W]
    ex = np.minimum(xx, W - 1 - xx) / (W * 0.10); ey = np.minimum(yy, H - 1 - yy) / (H * 0.12)
    m = np.clip(np.minimum(ex, ey), 0, 1); m = m * m * (3 - 2 * m)
    res = img * m[..., None] + np.array(bg)[None, None] * (1 - m[..., None])
    Image.fromarray(res.astype(np.uint8)).save(out, quality=90)


if __name__ == '__main__':
    out_dir, W, H, SPP = sys.argv[1], int(sys.argv[2]), int(sys.argv[3]), int(sys.argv[4])
    names = sys.argv[5:] or list(PROFILES)
    os.makedirs(out_dir, exist_ok=True)
    for n in names:
        pf = os.path.join(out_dir, n + '.txt'); raw = os.path.join(out_dir, n + '.raw')
        write_profile(n, pf)
        r = subprocess.run([os.path.join(HERE, 'pt'), pf, raw, str(W), str(H), str(SPP)], capture_output=True, text=True)
        print(n, r.stderr.strip(), r.returncode, flush=True)
        if r.returncode == 0:
            post(raw, W, H, os.path.join(out_dir, n + '.jpg'))
