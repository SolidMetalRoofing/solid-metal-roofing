// Small SDF path tracer for extruded sheet-metal panel profiles.
// Usage: pt profile.txt out.raw W H SPP
#include <stdio.h>
#include <stdlib.h>
#include <math.h>
#include <string.h>
#include <stdint.h>
#include <omp.h>

typedef struct { double x, y, z; } V;
static inline V v3(double x, double y, double z) { V a = {x, y, z}; return a; }
static inline V add(V a, V b) { return v3(a.x + b.x, a.y + b.y, a.z + b.z); }
static inline V sub(V a, V b) { return v3(a.x - b.x, a.y - b.y, a.z - b.z); }
static inline V mul(V a, double s) { return v3(a.x * s, a.y * s, a.z * s); }
static inline V mulv(V a, V b) { return v3(a.x * b.x, a.y * b.y, a.z * b.z); }
static inline double dot(V a, V b) { return a.x * b.x + a.y * b.y + a.z * b.z; }
static inline V cross(V a, V b) { return v3(a.y * b.z - a.z * b.y, a.z * b.x - a.x * b.z, a.x * b.y - a.y * b.x); }
static inline double len(V a) { return sqrt(dot(a, a)); }
static inline V nrm(V a) { double l = len(a); return l > 0 ? mul(a, 1.0 / l) : a; }
static inline double clampd(double x, double a, double b) { return x < a ? a : (x > b ? b : x); }

// ---------- profile ----------
static int NS; static double *AX, *AZ, *BX, *BZ; static int *SF;
static double PL, TH, WAV, PX0, PX1, PZ0, PZ1;
static int NSC; static double SCX[64], SCZ[64]; static int NROW; static double ROWY[16];
static V PAINT;
// grid
static double GX0, GZ0, GH = 0.006; static int GNX, GNZ; static float *GD; static unsigned char *GSD;
#define MAXD 0.6

static void build_grid(void) {
    double m = 0.56;
    GX0 = PX0 - m; GZ0 = PZ0 - m;
    GNX = (int)((PX1 - PX0 + 2 * m) / GH) + 2; GNZ = (int)((PZ1 - PZ0 + 2 * m) / GH) + 2;
    GD = malloc(sizeof(float) * (size_t)GNX * GNZ); GSD = malloc((size_t)GNX * GNZ);
    double BW = 0.5; int NB = (int)((PX1 - PX0 + 2 * m) / BW) + 2;
    int *cnt = calloc(NB, sizeof(int));
    for (int s = 0; s < NS; s++) {
        double lo = fmin(AX[s], BX[s]) - MAXD, hi = fmax(AX[s], BX[s]) + MAXD;
        int b0 = (int)floor((lo - GX0) / BW), b1 = (int)floor((hi - GX0) / BW);
        if (b0 < 0) b0 = 0; if (b1 >= NB) b1 = NB - 1;
        for (int b = b0; b <= b1; b++) cnt[b]++;
    }
    int **lst = malloc(sizeof(int *) * NB);
    for (int b = 0; b < NB; b++) { lst[b] = malloc(sizeof(int) * (cnt[b] + 1)); cnt[b] = 0; }
    for (int s = 0; s < NS; s++) {
        double lo = fmin(AX[s], BX[s]) - MAXD, hi = fmax(AX[s], BX[s]) + MAXD;
        int b0 = (int)floor((lo - GX0) / BW), b1 = (int)floor((hi - GX0) / BW);
        if (b0 < 0) b0 = 0; if (b1 >= NB) b1 = NB - 1;
        for (int b = b0; b <= b1; b++) lst[b][cnt[b]++] = s;
    }
    #pragma omp parallel for schedule(dynamic, 8)
    for (int j = 0; j < GNZ; j++) {
        double z = GZ0 + j * GH;
        for (int i = 0; i < GNX; i++) {
            double x = GX0 + i * GH;
            int b = (int)floor((x - GX0) / BW); if (b >= NB) b = NB - 1;
            double best = MAXD * MAXD, bperp = 0; int side = 1, cap = 0;
            for (int k = 0; k < cnt[b]; k++) {
                int s = lst[b][k];
                double ex = BX[s] - AX[s], ez = BZ[s] - AZ[s], wx = x - AX[s], wz = z - AZ[s];
                double l2 = ex * ex + ez * ez; double t = l2 > 0 ? (wx * ex + wz * ez) / l2 : 0;
                double tc = clampd(t, 0, 1);
                double dx = wx - ex * tc, dz = wz - ez * tc; double d2 = dx * dx + dz * dz;
                double cr = ex * wz - ez * wx; double perp = fabs(cr) / sqrt(l2 > 0 ? l2 : 1);
                if (d2 < best - 1e-12 || (fabs(d2 - best) <= 1e-12 && perp > bperp)) {
                    best = d2; bperp = perp; side = cr > 0;
                    cap = 0;
                    if ((t < 0 && (SF[s] & 1)) || (t > 1 && (SF[s] & 2))) {
                        double along = fabs(wx * ex + wz * ez - (t > 1 ? l2 : 0)) / sqrt(l2);
                        if (along > 0.6 * sqrt(d2)) cap = 1;
                    }
                }
            }
            GD[(size_t)j * GNX + i] = (float)sqrt(best);
            GSD[(size_t)j * GNX + i] = cap ? 2 : (side ? 1 : 0);
        }
    }
}

static inline double gridD(double x, double z) {
    double fx = (x - GX0) / GH, fz = (z - GZ0) / GH;
    if (fx < 0 || fz < 0 || fx > GNX - 1.001 || fz > GNZ - 1.001) {
        double x1 = GX0 + (GNX - 1) * GH, z1 = GZ0 + (GNZ - 1) * GH;
        double dx = fmax(fmax(GX0 - x, x - x1), 0), dz = fmax(fmax(GZ0 - z, z - z1), 0);
        return sqrt(dx * dx + dz * dz) + 0.3;
    }
    int i = (int)fx, j = (int)fz; double u = fx - i, w = fz - j;
    const float *g = GD + (size_t)j * GNX + i;
    return (g[0] * (1 - u) + g[1] * u) * (1 - w) + (g[GNX] * (1 - u) + g[GNX + 1] * u) * w;
}
static inline int gridS(double x, double z) {
    int i = (int)((x - GX0) / GH + 0.5), j = (int)((z - GZ0) / GH + 0.5);
    if (i < 0 || j < 0 || i >= GNX || j >= GNZ) return 1;
    return GSD[(size_t)j * GNX + i];
}

static inline double wav(double x, double y) {
    if (WAV <= 0) return 0;
    return WAV * (sin(x * 0.55 + 0.7) * sin(y * 0.21 + x * 0.13) + 0.6 * sin(y * 0.097 + 1.3) * cos(x * 0.31));
}

static inline double sdScrew(V q, int idx, int *part) {
    double a = idx * 2.399; double ca = cos(a), sa = sin(a);
    double qx = q.x * ca - q.y * sa, qy = q.x * sa + q.y * ca;
    double r = sqrt(qx * qx + qy * qy);
    double d1 = fmax(r - 0.305, fabs(q.z - 0.02) - 0.02) - 0.004;         // EPDM
    double wx = r - 0.262, wz = fabs(q.z - 0.064) - 0.022;
    double d2 = fmin(fmax(wx, wz), 0) + hypot(fmax(wx, 0), fmax(wz, 0)) - 0.014; // steel washer
    double fx = r - 0.165, fz = fabs(q.z - 0.095) - 0.016;
    double d4 = fmin(fmax(fx, fz), 0) + hypot(fmax(fx, 0), fmax(fz, 0)) - 0.008; // flange
    double ax = fabs(qx), ay = fabs(qy);
    double dh = fmax(ax * 0.8660254 + ay * 0.5, ay) - 0.118, hz = fabs(q.z - 0.175) - 0.07;
    double d3 = fmin(fmax(dh, hz), 0) + hypot(fmax(dh, 0), fmax(hz, 0)) - 0.014;  // hex
    double d = d1; *part = 3;
    if (d2 < d) { d = d2; *part = 4; }
    if (d4 < d) { d = d4; *part = 4; }
    if (d3 < d) { d = d3; *part = 4; }
    return d;
}

static double SCZMAX;
static inline double map(V p, int *mat) {
    double z = p.z - wav(p.x, p.y);
    double d = gridD(p.x, z) - TH * 0.5;
    double ds = fabs(p.y - PL * 0.5) - PL * 0.5;
    if (ds > d) d = ds;
    *mat = 0;
    if (NSC > 0 && p.z - SCZMAX - 0.27 < d) {
        int bi = 0; double bd = 1e9;
        for (int i = 0; i < NSC; i++) { double dx = fabs(p.x - SCX[i]); if (dx < bd) { bd = dx; bi = i; } }
        int bj = 0; bd = 1e9;
        for (int j = 0; j < NROW; j++) { double dy = fabs(p.y - ROWY[j]); if (dy < bd) { bd = dy; bj = j; } }
        int part; double dsr = sdScrew(v3(p.x - SCX[bi], p.y - ROWY[bj], p.z - SCZ[bi]), bi * 7 + bj * 3, &part);
        if (dsr < d) { d = dsr; *mat = part; }
    }
    return d;
}

static V BMIN, BMAX; static double ZG;
static int trace(V ro, V rd, double tmax, double *tout, int *mat) {
    double t0 = 0, t1 = tmax;
    double o[3] = {ro.x, ro.y, ro.z}, d[3] = {rd.x, rd.y, rd.z}, lo[3] = {BMIN.x, BMIN.y, BMIN.z}, hi[3] = {BMAX.x, BMAX.y, BMAX.z};
    for (int a = 0; a < 3; a++) {
        if (fabs(d[a]) < 1e-12) { if (o[a] < lo[a] || o[a] > hi[a]) return 0; continue; }
        double ta = (lo[a] - o[a]) / d[a], tb = (hi[a] - o[a]) / d[a];
        if (ta > tb) { double s = ta; ta = tb; tb = s; }
        if (ta > t0) t0 = ta; if (tb < t1) t1 = tb;
        if (t0 > t1) return 0;
    }
    double t = t0; int m;
    for (int i = 0; i < 600; i++) {
        V p = add(ro, mul(rd, t));
        double dd = map(p, &m);
        if (dd < 6e-4) { *tout = t; *mat = m; return 1; }
        t += dd;
        if (t > t1) return 0;
    }
    return 0;
}
static V normalAt(V p) {
    const double h = 0.0025; int m;
    double dx = map(v3(p.x + h, p.y, p.z), &m) - map(v3(p.x - h, p.y, p.z), &m);
    double dy = map(v3(p.x, p.y + h, p.z), &m) - map(v3(p.x, p.y - h, p.z), &m);
    double dz = map(v3(p.x, p.y, p.z + h), &m) - map(v3(p.x, p.y, p.z - h), &m);
    return nrm(v3(dx, dy, dz));
}

// ---------- lights ----------
typedef struct { V c, u, w, n; double area; V Le; } Light;
static Light LT[4]; static int NL = 0;
static void addLight(V c, V u, V w, V Le) {
    Light *l = &LT[NL++]; l->c = c; l->u = u; l->w = w; l->n = nrm(cross(u, w)); l->area = 4 * len(u) * len(w); l->Le = Le;
}
static int hitLight(V ro, V rd, double tmax, double *tout, int *li) {
    int found = 0; double best = tmax;
    for (int i = 0; i < NL; i++) {
        double dn = dot(rd, LT[i].n); if (dn >= -1e-9) continue; // one-sided
        double t = dot(sub(LT[i].c, ro), LT[i].n) / dn; if (t <= 1e-6 || t >= best) continue;
        V p = sub(add(ro, mul(rd, t)), LT[i].c);
        double a = dot(p, LT[i].u) / dot(LT[i].u, LT[i].u), b = dot(p, LT[i].w) / dot(LT[i].w, LT[i].w);
        if (fabs(a) <= 1 && fabs(b) <= 1) { best = t; *li = i; found = 1; }
    }
    if (found) *tout = best;
    return found;
}

// ---------- rng ----------
typedef struct { uint64_t s; } Rng;
static inline double rnd(Rng *r) { r->s ^= r->s >> 12; r->s ^= r->s << 25; r->s ^= r->s >> 27; return (double)((r->s * 0x2545F4914F6CDD1DULL) >> 11) / 9007199254740992.0; }

static inline void frame(V n, V *t, V *b) {
    V a = fabs(n.z) < 0.9 ? v3(0, 0, 1) : v3(1, 0, 0);
    *t = nrm(cross(a, n)); *b = cross(n, *t);
}
static V sampleVNDF(V Ve, double a, double u1, double u2) {
    V Vh = nrm(v3(a * Ve.x, a * Ve.y, Ve.z));
    double l2 = Vh.x * Vh.x + Vh.y * Vh.y;
    V T1 = l2 > 1e-12 ? mul(v3(-Vh.y, Vh.x, 0), 1 / sqrt(l2)) : v3(1, 0, 0);
    V T2 = cross(Vh, T1);
    double r = sqrt(u1), phi = 2 * M_PI * u2; double t1 = r * cos(phi), t2 = r * sin(phi); double s = 0.5 * (1 + Vh.z);
    t2 = (1 - s) * sqrt(fmax(0, 1 - t1 * t1)) + s * t2;
    V Nh = add(add(mul(T1, t1), mul(T2, t2)), mul(Vh, sqrt(fmax(0, 1 - t1 * t1 - t2 * t2))));
    return nrm(v3(a * Nh.x, a * Nh.y, fmax(1e-6, Nh.z)));
}
static inline double G1(double nz, double a) { return 2 * nz / (nz + sqrt(a * a + (1 - a * a) * nz * nz)); }

typedef struct { V alb; double F0, rough; int metal; } Mat;
static Mat matOf(int m, V p, V n) {
    Mat M; M.metal = 0;
    if (m == 5) { M.alb = v3(0.013, 0.013, 0.014); M.F0 = 0.04; M.rough = 0.5; return M; }
    if (m == 3) { M.alb = v3(0.012, 0.012, 0.012); M.F0 = 0.04; M.rough = 0.5; return M; }
    if (m == 4) { M.alb = mul(PAINT, 0.95); M.F0 = 0.045; M.rough = 0.2; return M; }
    // sheet: cut ends, side edges, underside, painted top
    int endface = (p.y < 0.004 || p.y > PL - 0.004) && fabs(n.y) > 0.6;
    int s = gridS(p.x, p.z - wav(p.x, p.y));
    if (endface || s == 2) { M.alb = v3(0.78, 0.79, 0.80); M.F0 = 0.78; M.rough = 0.34; M.metal = 1; return M; }
    if (s == 0) { M.alb = v3(0.55, 0.56, 0.55); M.F0 = 0.04; M.rough = 0.5; return M; }
    M.alb = PAINT; M.F0 = 0.045; M.rough = 0.23; return M;
}

static V ENV;
static inline double ggxD(double nh, double a) { double a2 = a * a; double d = nh * nh * (a2 - 1) + 1; return a2 / (M_PI * d * d); }
// BSDF * cos and combined sampling pdf, local frame (z = normal)
static void evalBSDF(const Mat *M, V Ve, V Li, double ps, V *f, double *pdf) {
    if (Li.z <= 1e-6 || Ve.z <= 1e-6) { *f = v3(0, 0, 0); *pdf = 0; return; }
    double a = M->rough * M->rough;
    V h = nrm(add(Ve, Li)); double vh = fmax(dot(Ve, h), 0), nh = h.z;
    double D = ggxD(nh, a), Gv = G1(Ve.z, a), Gl = G1(Li.z, a);
    double sch = pow(1 - vh, 5);
    V F = M->metal ? add(M->alb, mul(sub(v3(1, 1, 1), M->alb), sch)) : v3(M->F0 + (1 - M->F0) * sch, M->F0 + (1 - M->F0) * sch, M->F0 + (1 - M->F0) * sch);
    double sp = D * Gv * Gl / (4 * Ve.z);          // spec * cos(l)
    double Fm = M->F0 + (1 - M->F0) * pow(1 - Ve.z, 5);
    V fd = M->metal ? v3(0, 0, 0) : mul(M->alb, (1 - Fm) / M_PI * Li.z);
    *f = add(mul(F, sp), fd);
    *pdf = ps * Gv * D / (4 * Ve.z) + (1 - ps) * Li.z / M_PI;
}
static V radiance(V ro, V rd, Rng *R) {
    V L = v3(0, 0, 0), thr = v3(1, 1, 1); double lastpdf = -1;
    for (int depth = 0; depth < 6; depth++) {
        double t = 1e9, tl; int m = -1, li;
        int h = trace(ro, rd, 1e9, &t, &m);
        if (rd.z < -1e-9) { double tg = (ZG - ro.z) / rd.z; if (tg > 1e-6 && (!h || tg < t)) { t = tg; m = 5; h = 1; } }
        if (hitLight(ro, rd, h ? t : 1e9, &tl, &li)) {
            double w = 1;
            if (lastpdf >= 0) { double cl = -dot(LT[li].n, rd); double pl = tl * tl / (cl * LT[li].area) / NL; w = lastpdf / (lastpdf + pl); }
            L = add(L, mul(mulv(thr, LT[li].Le), w)); break;
        }
        if (!h) { L = add(L, mulv(thr, ENV)); break; }
        V p = add(ro, mul(rd, t));
        V n = m == 5 ? v3(0, 0, 1) : normalAt(p);
        if (dot(n, rd) > 0) n = mul(n, -1);
        Mat M = matOf(m, p, n);
        V vo = mul(rd, -1);
        V tx, by; frame(n, &tx, &by);
        V Ve = v3(dot(vo, tx), dot(vo, by), fmax(dot(vo, n), 1e-4));
        double Fm = M.F0 + (1 - M.F0) * pow(1 - Ve.z, 5);
        double ps = M.metal ? 1.0 : clampd(0.25 + 0.75 * Fm, 0.25, 0.95);
        V po = add(p, mul(n, 0.003));
        {   // light sampling with MIS
            int k = (int)(rnd(R) * NL); if (k >= NL) k = NL - 1;
            Light *l = &LT[k];
            V lp = add(l->c, add(mul(l->u, 2 * rnd(R) - 1), mul(l->w, 2 * rnd(R) - 1)));
            V ld = sub(lp, po); double d2 = dot(ld, ld), d = sqrt(d2); ld = mul(ld, 1 / d);
            double cs = dot(n, ld), cl = -dot(l->n, ld);
            if (cs > 1e-6 && cl > 1e-6) {
                double ts; int ms;
                if (!trace(po, ld, d - 0.01, &ts, &ms)) {
                    V Ll = v3(dot(ld, tx), dot(ld, by), cs); V f; double pb;
                    evalBSDF(&M, Ve, Ll, ps, &f, &pb);
                    double pl = d2 / (cl * l->area) / NL;
                    double w = pl / (pl + pb);
                    L = add(L, mul(mulv(mulv(thr, f), l->Le), w / pl));
                }
            }
        }
        V Li;
        if (rnd(R) < ps) {
            V hh = sampleVNDF(Ve, M.rough * M.rough, rnd(R), rnd(R));
            Li = sub(mul(hh, 2 * dot(Ve, hh)), Ve);
        } else {
            double u1 = rnd(R), u2 = rnd(R); double r = sqrt(u1), ph = 2 * M_PI * u2;
            Li = v3(r * cos(ph), r * sin(ph), sqrt(fmax(0, 1 - u1)));
        }
        if (Li.z <= 1e-5) break;
        V f; double pb; evalBSDF(&M, Ve, Li, ps, &f, &pb);
        if (pb <= 1e-9) break;
        thr = mulv(thr, mul(f, 1 / pb)); lastpdf = pb;
        rd = nrm(add(add(mul(tx, Li.x), mul(by, Li.y)), mul(n, Li.z)));
        ro = po;
        if (depth >= 2) { double q = fmax(thr.x, fmax(thr.y, thr.z)); if (q < 1) { if (rnd(R) > q) break; thr = mul(thr, 1 / q); } }
    }
    double mx = fmax(L.x, fmax(L.y, L.z)); if (mx > 12) L = mul(L, 12 / mx);
    return L;
}

int main(int argc, char **argv) {
    if (argc < 6) { fprintf(stderr, "usage\n"); return 1; }
    FILE *f = fopen(argv[1], "r"); if (!f) return 2;
    int W = atoi(argv[3]), H = atoi(argv[4]), SPP = atoi(argv[5]);
    double cam[3], tgt[3], fov, lensr, foc[3], pr, pg, pb;
    if (fscanf(f, "%lf %lf %lf", &PL, &TH, &WAV) != 3) return 3;
    if (fscanf(f, "%lf %lf %lf", &pr, &pg, &pb) != 3) return 3; PAINT = v3(pr, pg, pb);
    if (fscanf(f, "%lf %lf %lf %lf %lf %lf %lf %lf %lf %lf %lf", &cam[0], &cam[1], &cam[2], &tgt[0], &tgt[1], &tgt[2], &fov, &lensr, &foc[0], &foc[1], &foc[2]) != 11) return 3;
    if (fscanf(f, "%d", &NSC) != 1) return 3;
    for (int i = 0; i < NSC; i++) if (fscanf(f, "%lf %lf", &SCX[i], &SCZ[i]) != 2) return 3;
    if (fscanf(f, "%d", &NROW) != 1) return 3;
    for (int i = 0; i < NROW; i++) if (fscanf(f, "%lf", &ROWY[i]) != 1) return 3;
    if (fscanf(f, "%d", &NS) != 1) return 3;
    AX = malloc(8 * NS); AZ = malloc(8 * NS); BX = malloc(8 * NS); BZ = malloc(8 * NS); SF = malloc(sizeof(int) * NS);
    PX0 = PZ0 = 1e9; PX1 = PZ1 = -1e9;
    for (int i = 0; i < NS; i++) {
        if (fscanf(f, "%lf %lf %lf %lf %d", &AX[i], &AZ[i], &BX[i], &BZ[i], &SF[i]) != 5) return 3;
        PX0 = fmin(PX0, fmin(AX[i], BX[i])); PX1 = fmax(PX1, fmax(AX[i], BX[i]));
        PZ0 = fmin(PZ0, fmin(AZ[i], BZ[i])); PZ1 = fmax(PZ1, fmax(AZ[i], BZ[i]));
    }
    fclose(f);
    build_grid();
    SCZMAX = -1e9; for (int i = 0; i < NSC; i++) SCZMAX = fmax(SCZMAX, SCZ[i]);
    double wm = fabs(WAV) * 2 + 0.03;
    BMIN = v3(PX0 - TH - 0.02, -0.002, PZ0 - TH - wm); BMAX = v3(PX1 + TH + 0.02, PL + 0.002, fmax(PZ1 + TH + wm, SCZMAX + 0.3));
    ZG = PZ0 - TH * 0.5 - 0.002;
    // studio lights: big overhead softbox, long strip from the right rear, low fill from front-left
    V pc = v3((PX0 + PX1) / 2, PL * 0.45, 0);
    addLight(v3(pc.x - 6, pc.y + 4, 78), v3(0, 34, 0), v3(44, 0, 0), v3(3.0, 3.05, 3.2));
    { V c = v3(pc.x + 46, pc.y + 14, 30); V n = nrm(sub(v3(pc.x, pc.y, 0), c)); V u = v3(0, 46, 0); V w = mul(nrm(cross(u, n)), 5.5); if (dot(cross(u, w), n) < 0) w = mul(w, -1); addLight(c, u, w, v3(11, 10.6, 10)); }
    { V c = v3(pc.x - 50, pc.y - 52, 20); V n = nrm(sub(v3(pc.x, pc.y, 0), c)); V u = mul(nrm(cross(n, v3(0, 0, 1))), 22); V w = mul(nrm(cross(u, n)), 10); if (dot(cross(u, w), n) < 0) w = mul(w, -1); addLight(c, u, w, v3(1.0, 1.1, 1.3)); }
    ENV = v3(0.018, 0.019, 0.021);
    V C = v3(cam[0], cam[1], cam[2]), T = v3(tgt[0], tgt[1], tgt[2]);
    V fw = nrm(sub(T, C)), rt = nrm(cross(fw, v3(0, 0, 1))), up = cross(rt, fw);
    double th = tan(fov * M_PI / 360.0), asp = (double)W / H;
    double fd = dot(sub(v3(foc[0], foc[1], foc[2]), C), fw);
    float *img = calloc((size_t)W * H * 3, sizeof(float));
    double t0 = omp_get_wtime();
    #pragma omp parallel for schedule(dynamic, 2)
    for (int y = 0; y < H; y++) {
        Rng R; R.s = 0x9E3779B97F4A7C15ULL * (uint64_t)(y + 1) + 0x1234567ULL;
        for (int k = 0; k < 8; k++) rnd(&R);
        for (int x = 0; x < W; x++) {
            V acc = v3(0, 0, 0);
            for (int s = 0; s < SPP; s++) {
                double px = ((x + rnd(&R)) / W * 2 - 1) * th * asp, py = (1 - (y + rnd(&R)) / H * 2) * th;
                V dir = nrm(add(fw, add(mul(rt, px), mul(up, py))));
                V fp = add(C, mul(dir, fd / dot(dir, fw)));
                double lr = lensr * sqrt(rnd(&R)), la = 2 * M_PI * rnd(&R);
                V o = add(C, add(mul(rt, lr * cos(la)), mul(up, lr * sin(la))));
                acc = add(acc, radiance(o, nrm(sub(fp, o)), &R));
            }
            img[((size_t)y * W + x) * 3 + 0] = (float)(acc.x / SPP);
            img[((size_t)y * W + x) * 3 + 1] = (float)(acc.y / SPP);
            img[((size_t)y * W + x) * 3 + 2] = (float)(acc.z / SPP);
        }
    }
    fprintf(stderr, "render %.1fs grid %dx%d segs %d\n", omp_get_wtime() - t0, GNX, GNZ, NS);
    FILE *o = fopen(argv[2], "wb"); fwrite(img, sizeof(float), (size_t)W * H * 3, o); fclose(o);
    return 0;
}
