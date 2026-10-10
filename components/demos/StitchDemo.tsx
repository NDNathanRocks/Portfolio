"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { loadOpenCV, type CV } from "@/lib/opencv";
import { DemoFrame, ErrorNote, Progress, Stat, btn, btnPrimary, mono } from "./ui";

// Port of PanoramicStitching.m: grayscale at 300px, ORB (ScaleFactor 1.01, 3 levels), binary-feature
// matching, a RANSAC *similarity* transform (estimateGeometricTransform2D "similarity"), then the second
// image is warped onto the first with a binary mask.
const WORK = 300;
const SCENES = [
  { id: "guitar", label: "Guitar", ref: "/demos/stitch/guitar-panorama.jpg" },
  { id: "backyard", label: "Backyard", ref: "/demos/stitch/backyard-panorama.jpg" },
  { id: "forestwalk", label: "Forest walk", ref: null },
] as const;

type Pt = [number, number];
type Sim = { a: number; b: number; tx: number; ty: number };
type Report = {
  kp1: number;
  kp2: number;
  matches: number;
  inliers: number;
  orbMs: number;
  totalMs: number;
};

function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// q = s*p + t with s a complex number (rotation + uniform scale), fitted by RANSAC then refit on inliers.
function similarityRansac(src: Pt[], dst: Pt[], thresh = 3, iters = 3000): { m: Sim; mask: boolean[] } | null {
  const n = src.length;
  if (n < 4) return null;
  const rnd = mulberry32(7);
  const apply = (m: Sim, p: Pt): Pt => [m.a * p[0] - m.b * p[1] + m.tx, m.b * p[0] + m.a * p[1] + m.ty];
  let best: { m: Sim; count: number } | null = null;
  for (let it = 0; it < iters; it++) {
    const i = Math.floor(rnd() * n);
    const j = Math.floor(rnd() * n);
    if (i === j) continue;
    const dpx = src[i][0] - src[j][0];
    const dpy = src[i][1] - src[j][1];
    const den = dpx * dpx + dpy * dpy;
    if (den < 100) continue;
    const dqx = dst[i][0] - dst[j][0];
    const dqy = dst[i][1] - dst[j][1];
    const a = (dqx * dpx + dqy * dpy) / den;
    const b = (dqy * dpx - dqx * dpy) / den;
    const scale = Math.hypot(a, b);
    if (scale < 0.5 || scale > 2) continue;
    const m: Sim = { a, b, tx: dst[i][0] - (a * src[i][0] - b * src[i][1]), ty: dst[i][1] - (b * src[i][0] + a * src[i][1]) };
    let count = 0;
    for (let k = 0; k < n; k++) {
      const q = apply(m, src[k]);
      if (Math.hypot(q[0] - dst[k][0], q[1] - dst[k][1]) < thresh) count++;
    }
    if (!best || count > best.count) best = { m, count };
  }
  if (!best || best.count < 6) return null;
  let mask = src.map((p, k) => {
    const q = apply(best!.m, p);
    return Math.hypot(q[0] - dst[k][0], q[1] - dst[k][1]) < thresh;
  });
  // Least-squares refit on the inliers.
  const idx = mask.flatMap((v, k) => (v ? [k] : []));
  const pc: Pt = [0, 0];
  const qc: Pt = [0, 0];
  for (const k of idx) {
    pc[0] += src[k][0] / idx.length;
    pc[1] += src[k][1] / idx.length;
    qc[0] += dst[k][0] / idx.length;
    qc[1] += dst[k][1] / idx.length;
  }
  let nr = 0;
  let ni = 0;
  let dn = 0;
  for (const k of idx) {
    const px = src[k][0] - pc[0];
    const py = src[k][1] - pc[1];
    const qx = dst[k][0] - qc[0];
    const qy = dst[k][1] - qc[1];
    nr += px * qx + py * qy;
    ni += px * qy - py * qx;
    dn += px * px + py * py;
  }
  const a = nr / dn;
  const b = ni / dn;
  const m: Sim = { a, b, tx: qc[0] - (a * pc[0] - b * pc[1]), ty: qc[1] - (b * pc[0] + a * pc[1]) };
  mask = src.map((p, k) => {
    const q = apply(m, p);
    return Math.hypot(q[0] - dst[k][0], q[1] - dst[k][1]) < thresh;
  });
  return { m, mask };
}

function loadImage(src: string | File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = typeof src === "string" ? src : URL.createObjectURL(src);
    img.onload = () => {
      if (typeof src !== "string") URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      if (typeof src !== "string") URL.revokeObjectURL(url);
      reject(new Error("That file couldn't be read as an image. Try a JPG or PNG."));
    };
    img.src = url;
  });
}

function toCanvas(img: HTMLImageElement, w: number, h: number) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  c.getContext("2d", { willReadFrequently: true })!.drawImage(img, 0, 0, w, h);
  return c;
}

export default function StitchDemo() {
  const engineRef = useRef<CV | null>(null);
  const matchRef = useRef<HTMLCanvasElement>(null);
  const panoRef = useRef<HTMLCanvasElement>(null);
  const runId = useRef(0);

  const [scene, setScene] = useState<string>("guitar");
  const [custom, setCustom] = useState<{ a?: File; b?: File }>({});
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<Report | null>(null);
  const [done, setDone] = useState(false);

  const run = useCallback(
    async (sceneId: string, files?: { a?: File; b?: File }) => {
      const id = ++runId.current;
      setError(null);
      setReport(null);
      setDone(false);
      try {
        let cv = engineRef.current as CV | null;
        if (!cv) {
          setBusy("Loading OpenCV.js");
          cv = await loadOpenCV();
          engineRef.current = cv;
        }
        setBusy("Stitching");
        const [i1, i2] = await Promise.all(
          sceneId === "custom"
            ? [loadImage(files!.a!), loadImage(files!.b!)]
            : [loadImage(`/demos/stitch/${sceneId}-im1.jpg`), loadImage(`/demos/stitch/${sceneId}-im2.jpg`)],
        );
        // Let the "Stitching" label paint before the synchronous OpenCV work blocks the thread.
        await new Promise((r) => requestAnimationFrame(() => setTimeout(r, 30)));
        if (id !== runId.current) return;

        const fit = (img: HTMLImageElement) => {
          const s = WORK / Math.max(img.naturalWidth, img.naturalHeight);
          return { w: Math.round(img.naturalWidth * s), h: Math.round(img.naturalHeight * s) };
        };
        const s1 = fit(i1);
        const s2 = fit(i2);
        const c1 = toCanvas(i1, s1.w, s1.h);
        const c2 = toCanvas(i2, s2.w, s2.h);

        const t0 = performance.now();
        const p1: Pt[] = [];
        const p2: Pt[] = [];
        let nk1 = 0;
        let nk2 = 0;
        let orbMs = 0;
        // Everything native is tracked here and freed in finally, even if a call throws.
        const owned: { delete(): void }[] = [];
        const own = <T extends { delete(): void }>(o: T): T => (owned.push(o), o);
        try {
          const g1 = own(new cv.Mat());
          const g2 = own(new cv.Mat());
          const m1 = own(cv.imread(c1));
          const m2 = own(cv.imread(c2));
          cv.cvtColor(m1, g1, cv.COLOR_RGBA2GRAY);
          cv.cvtColor(m2, g2, cv.COLOR_RGBA2GRAY);

          const orb = own(new cv.ORB(1500, 1.01, 3));
          const kp1 = own(new cv.KeyPointVector());
          const kp2 = own(new cv.KeyPointVector());
          const d1 = own(new cv.Mat());
          const d2 = own(new cv.Mat());
          const none = own(new cv.Mat());
          const tOrb = performance.now();
          orb.detectAndCompute(g1, none, kp1, d1);
          orb.detectAndCompute(g2, none, kp2, d2);
          orbMs = performance.now() - tOrb;

          const matcher = own(new cv.BFMatcher(cv.NORM_HAMMING, true));
          const matches = own(new cv.DMatchVector());
          if (d1.rows > 0 && d2.rows > 0) matcher.match(d1, d2, matches);

          for (let i = 0; i < matches.size(); i++) {
            const m = matches.get(i);
            const a = kp1.get(m.queryIdx).pt;
            const b = kp2.get(m.trainIdx).pt;
            p1.push([a.x, a.y]);
            p2.push([b.x, b.y]);
          }
          nk1 = kp1.size();
          nk2 = kp2.size();
        } finally {
          owned.forEach((o) => o.delete());
        }

        // Transform that maps image 2 onto image 1, as in estimateGeometricTransform2D(matched2, matched1).
        const fitRes = similarityRansac(p2, p1);
        const totalMs = performance.now() - t0;
        if (id !== runId.current) return;
        if (!fitRes) {
          setReport({ kp1: nk1, kp2: nk2, matches: p1.length, inliers: 0, orbMs, totalMs });
          setError("Couldn't find a reliable alignment. These two photos need to overlap and share some texture.");
          setBusy(null);
          return;
        }
        const { m, mask } = fitRes;

        // 1. Match visualisation on the 300px working images.
        const mc = matchRef.current!;
        const gap = 12;
        mc.width = s1.w + s2.w + gap;
        mc.height = Math.max(s1.h, s2.h);
        const mx = mc.getContext("2d")!;
        mx.fillStyle = "#0a0a0a";
        mx.fillRect(0, 0, mc.width, mc.height);
        mx.drawImage(c1, 0, 0);
        mx.drawImage(c2, s1.w + gap, 0);
        // Draw a readable subset: every match would turn into a solid blob.
        const thin = (flag: boolean, max: number) => {
          const all = mask.flatMap((v, k) => (v === flag ? [k] : []));
          const step = Math.max(1, Math.ceil(all.length / max));
          return all.filter((_, i) => i % step === 0).map((k) => [flag, k] as const);
        };
        for (const [ok, k] of [...thin(false, 30), ...thin(true, 70)]) {
          mx.strokeStyle = ok ? "rgba(214,255,63,0.85)" : "rgba(244,63,94,0.3)";
          mx.lineWidth = ok ? 1.2 : 0.8;
          mx.beginPath();
          mx.moveTo(p1[k][0], p1[k][1]);
          mx.lineTo(s1.w + gap + p2[k][0], p2[k][1]);
          mx.stroke();
        }

        // 2. Panorama: place image 1, then warp image 2 over it with the similarity transform.
        const corners: Pt[] = [
          [0, 0],
          [s2.w, 0],
          [s2.w, s2.h],
          [0, s2.h],
        ].map(([x, y]) => [m.a * x - m.b * y + m.tx, m.b * x + m.a * y + m.ty]);
        const xs = [0, s1.w, ...corners.map((c) => c[0])];
        const ys = [0, s1.h, ...corners.map((c) => c[1])];
        const xMin = Math.min(...xs);
        const yMin = Math.min(...ys);
        const W = Math.max(...xs) - xMin;
        const H = Math.max(...ys) - yMin;
        const k = Math.min(3, 760 / Math.max(W, H)); // render sharper than the 300px working size
        const pc = panoRef.current!;
        pc.width = Math.round(W * k);
        pc.height = Math.round(H * k);
        const px = pc.getContext("2d")!;
        px.fillStyle = "#0a0a0a";
        px.fillRect(0, 0, pc.width, pc.height);
        px.imageSmoothingQuality = "high";
        const big = (img: HTMLImageElement, s: { w: number; h: number }) => toCanvas(img, Math.round(s.w * k), Math.round(s.h * k));
        px.setTransform(1, 0, 0, 1, -xMin * k, -yMin * k);
        px.drawImage(big(i1, s1), 0, 0);
        px.setTransform(m.a, m.b, -m.b, m.a, k * (m.tx - xMin), k * (m.ty - yMin));
        px.drawImage(big(i2, s2), 0, 0);
        px.setTransform(1, 0, 0, 1, 0, 0);

        setReport({ kp1: nk1, kp2: nk2, matches: p1.length, inliers: mask.filter(Boolean).length, orbMs, totalMs });
        setDone(true);
        setBusy(null);
      } catch (e) {
        if (id !== runId.current) return;
        setBusy(null);
        setError(e instanceof Error ? e.message : "Stitching failed.");
      }
    },
    [],
  );

  useEffect(() => () => void (runId.current = -1), []);

  const current = SCENES.find((s) => s.id === scene);
  const ready = scene !== "custom" || (custom.a && custom.b);

  return (
    <DemoFrame label="Live demo · ORB panorama stitching" privacy="Runs in your browser, photos are never uploaded">
      <div className="flex flex-wrap items-center gap-3">
        {SCENES.map((s) => (
          <button
            key={s.id}
            type="button"
            aria-pressed={scene === s.id}
            onClick={() => {
              setScene(s.id);
              if (done || busy || error) run(s.id);
            }}
            className={`${btn} ${scene === s.id ? "!border-accent !text-accent" : ""}`}
          >
            {s.label}
          </button>
        ))}
        <button
          type="button"
          aria-pressed={scene === "custom"}
          onClick={() => setScene("custom")}
          className={`${btn} ${scene === "custom" ? "!border-accent !text-accent" : ""}`}
        >
          Your photos
        </button>
      </div>

      {scene === "custom" && (
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {(["a", "b"] as const).map((key) => (
            <label key={key} className={`flex cursor-pointer items-center justify-between gap-4 rounded-sm border border-paper/15 px-4 py-3 hover:border-accent focus-within:border-accent ${mono}`}>
              <span className="text-paper/60">{key === "a" ? "Left photo" : "Right photo"}</span>
              <span className="truncate text-paper">{custom[key]?.name ?? "Choose file"}</span>
              <input type="file" accept="image/*" className="sr-only" onChange={(e) => setCustom((c) => ({ ...c, [key]: e.target.files?.[0] }))} />
            </label>
          ))}
          <p className="text-sm text-paper/50 sm:col-span-2">Pick two photos taken from the same spot, turning slightly, with about 30% overlap.</p>
        </div>
      )}

      <div className="mt-5 flex items-center gap-4">
        <button type="button" disabled={!!busy || !ready} onClick={() => run(scene, custom)} className={btnPrimary}>
          {done ? "Run again" : "Stitch panorama"}
        </button>
        {busy && <Progress label={busy} />}
      </div>

      {error && (
        <div className="mt-5">
          <ErrorNote>{error}</ErrorNote>
        </div>
      )}

      <div className={`mt-8 grid gap-8 ${done || report ? "" : "hidden"}`}>
        <figure>
          <figcaption className={`mb-2 text-paper/50 ${mono}`}>1 · ORB matches (lime = inliers kept by RANSAC)</figcaption>
          <canvas ref={matchRef} className="max-h-[420px] w-full rounded-sm border border-paper/10 object-contain" aria-label="Matched features between the two photos" />
        </figure>
        <figure className={done ? "" : "hidden"}>
          <figcaption className={`mb-2 text-paper/50 ${mono}`}>2 · Stitched panorama (similarity transform, binary mask)</figcaption>
          <canvas ref={panoRef} className="max-h-[560px] w-full rounded-sm border border-paper/10 object-contain" aria-label="Stitched panorama" />
        </figure>
      </div>

      {report && (
        <dl className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-6">
          <Stat label="Keypoints" value={`${report.kp1} / ${report.kp2}`} />
          <Stat label="Matches" value={String(report.matches)} />
          <Stat label="Inliers" value={String(report.inliers)} />
          <Stat label="ORB time" value={`${report.orbMs.toFixed(1)} ms`} />
          <Stat label="Pipeline" value={`${report.totalMs.toFixed(0)} ms`} />
        </dl>
      )}

      {done && current?.ref && (
        <figure className="mt-8 max-w-xs">
          <figcaption className={`mb-2 text-paper/50 ${mono}`}>Original MATLAB output</figcaption>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={current.ref} alt={`${current.label} panorama produced by the original MATLAB script`} className="w-full rounded-sm border border-paper/10" />
        </figure>
      )}

      <p className="mt-8 max-w-[70ch] text-sm text-paper/50">
        The 14× figure on this project is a historical benchmark from the MATLAB version (ORB feature detection vs SURF). SURF isn&rsquo;t available in the browser build of
        OpenCV, so this demo reports only the live ORB time measured on your device.
      </p>
    </DemoFrame>
  );
}
