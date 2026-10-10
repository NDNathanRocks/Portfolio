"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { loadOpenCV, mountFile, type CV } from "@/lib/opencv";
import { DemoFrame, ErrorNote, Progress, Stat, btn, btnPrimary, mono } from "./ui";

// Port of AISmileDetector.py: the same two Haar cascades and the same detectMultiScale parameters.
const FACE_PARAMS = { original: 6, tuned: 1.2 } as const; // scaleFactor; minNeighbors stays 7
const SMILE_SCALE = 1.7;
const SMILE_NEIGHBORS = 20;
const MAX_CAPTURES = 10; // the script stops saving after 10 pictures
const MAX_WIDTH = 640;

type Range = keyof typeof FACE_PARAMS;
type Rect = { x: number; y: number; width: number; height: number };
type Result = { faces: { box: Rect; smiles: Rect[] }[]; ms: number };

export default function SmileDemo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number>(0);
  const engineRef = useRef<{ cv: CV; face: CV; smile: CV } | null>(null);
  const rangeRef = useRef<Range>("tuned");
  const lastCaptureRef = useRef(0);
  const capturesRef = useRef(0);
  const runningRef = useRef(false);
  const mountedRef = useRef(true);

  const [busy, setBusy] = useState<string | null>(null);
  const [progress, setProgress] = useState<number | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [live, setLive] = useState(false);
  const [range, setRange] = useState<Range>("tuned");
  const [status, setStatus] = useState<string>("");
  const [stats, setStats] = useState({ fps: 0, ms: 0, faces: 0 });
  const [captures, setCaptures] = useState<string[]>([]);

  const ensureEngine = useCallback(async () => {
    if (engineRef.current) return engineRef.current;
    setBusy("Loading OpenCV.js");
    setProgress(undefined);
    const cv = await loadOpenCV();
    setBusy("Loading cascades");
    await mountFile(cv, "/demos/opencv/haarcascade_frontalface_default.xml", "face.xml");
    await mountFile(cv, "/demos/opencv/haarcascade_smile.xml", "smile.xml");
    const face = new cv.CascadeClassifier();
    const smile = new cv.CascadeClassifier();
    if (!face.load("face.xml") || !smile.load("smile.xml")) throw new Error("Could not load the Haar cascades");
    if (!mountedRef.current) {
      face.delete();
      smile.delete();
      throw new Error("closed");
    }
    engineRef.current = { cv, face, smile };
    setBusy(null);
    return engineRef.current;
  }, []);

  // Runs the script's two-stage detection on whatever is currently drawn on the canvas.
  const detect = useCallback((): Result | null => {
    const eng = engineRef.current;
    const canvas = canvasRef.current;
    if (!eng || !canvas) return null;
    const { cv, face, smile } = eng;
    const t0 = performance.now();
    // Every native object is freed in finally, so a throw mid-frame can't leak WASM heap.
    const src = cv.imread(canvas);
    const gray = new cv.Mat();
    const faces = new cv.RectVector();
    const out: Result["faces"] = [];
    try {
      cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);
      face.detectMultiScale(gray, faces, FACE_PARAMS[rangeRef.current], 7, 0);
      for (let i = 0; i < faces.size(); i++) {
        const r = faces.get(i);
        const roi = gray.roi(r);
        const smiles = new cv.RectVector();
        try {
          smile.detectMultiScale(roi, smiles, SMILE_SCALE, SMILE_NEIGHBORS, 0);
          const list: Rect[] = [];
          for (let j = 0; j < smiles.size(); j++) {
            const s = smiles.get(j);
            list.push({ x: r.x + s.x, y: r.y + s.y, width: s.width, height: s.height });
          }
          out.push({ box: { x: r.x, y: r.y, width: r.width, height: r.height }, smiles: list });
        } finally {
          roi.delete();
          smiles.delete();
        }
      }
    } finally {
      src.delete();
      gray.delete();
      faces.delete();
    }
    return { faces: out, ms: performance.now() - t0 };
  }, []);

  const overlay = useCallback((res: Result) => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    ctx.lineWidth = 3;
    ctx.font = "600 16px ui-monospace, monospace";
    for (const f of res.faces) {
      ctx.strokeStyle = "#3b82f6"; // the script draws the face box in blue
      ctx.strokeRect(f.box.x, f.box.y, f.box.width, f.box.height);
      ctx.strokeStyle = "#d946ef"; // and the smile box in magenta
      for (const s of f.smiles) ctx.strokeRect(s.x, s.y, s.width, s.height);
      if (f.smiles.length) {
        ctx.fillStyle = "#d6ff3f";
        ctx.fillText("Smiling", f.box.x, f.box.y + f.box.height + 24);
      }
    }
  }, []);

  const stop = useCallback(() => {
    runningRef.current = false;
    cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setLive(false);
  }, []);

  const startCamera = async () => {
    setError(null);
    stop(); // never hold two streams
    if (!navigator.mediaDevices?.getUserMedia) {
      setError("This browser can't access a camera here. Use the photo option instead.");
      return;
    }
    try {
      await ensureEngine();
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: "user" }, audio: false });
      if (!mountedRef.current) {
        // Demo was closed while the permission prompt was open: release the camera immediately.
        stream.getTracks().forEach((t) => t.stop());
        return;
      }
      streamRef.current = stream;
      const video = videoRef.current!;
      video.srcObject = stream;
      await video.play();
      capturesRef.current = 0;
      setCaptures([]);
      runningRef.current = true;
      setLive(true);
      setStatus("Looking for a face");

      let last = 0;
      let frames = 0;
      let lastStat = performance.now();
      let msSum = 0;
      const loop = (now: number) => {
        if (!runningRef.current) return;
        rafRef.current = requestAnimationFrame(loop);
        if (now - last < 70 || document.hidden || video.readyState < 2) return;
        last = now;
        const scale = Math.min(1, MAX_WIDTH / video.videoWidth);
        const canvas = canvasRef.current!;
        const w = Math.round(video.videoWidth * scale);
        const h = Math.round(video.videoHeight * scale);
        if (canvas.width !== w || canvas.height !== h) {
          canvas.width = w;
          canvas.height = h;
        }
        const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
        ctx.drawImage(video, 0, 0, w, h);
        const res = detect();
        if (!res) return;
        const smiling = res.faces.some((f) => f.smiles.length > 0);
        // Capture the clean frame before the boxes are drawn, like the script saves the raw frame.
        if (smiling && capturesRef.current < MAX_CAPTURES && now - lastCaptureRef.current > 1500) {
          lastCaptureRef.current = now;
          capturesRef.current += 1;
          const thumb = canvas.toDataURL("image/jpeg", 0.85);
          setCaptures((c) => [...c, thumb]);
        }
        overlay(res);
        setStatus(res.faces.length === 0 ? "Looking for a face" : smiling ? "Smiling" : "Face found, no smile yet");
        frames++;
        msSum += res.ms;
        if (now - lastStat > 700) {
          setStats({ fps: Math.round((frames * 1000) / (now - lastStat)), ms: Math.round(msSum / frames), faces: res.faces.length });
          frames = 0;
          msSum = 0;
          lastStat = now;
        }
      };
      rafRef.current = requestAnimationFrame(loop);
    } catch (e) {
      stop();
      if (!mountedRef.current) return;
      setBusy(null);
      const name = (e as DOMException)?.name;
      setError(
        name === "NotAllowedError"
          ? "Camera permission was denied. Allow it in the address bar, or use a photo instead."
          : name === "NotFoundError"
            ? "No camera was found. Use a photo instead."
            : e instanceof Error
              ? e.message
              : "Something went wrong starting the camera.",
      );
    }
  };

  const onPhoto = async (file: File | undefined) => {
    if (!file) return;
    setError(null);
    stop();
    let url = "";
    try {
      await ensureEngine();
      url = URL.createObjectURL(file);
      const img = new Image();
      await new Promise<void>((res, rej) => {
        img.onload = () => res();
        img.onerror = () => rej(new Error("That file couldn't be read as an image. Try a JPG or PNG."));
        img.src = url;
      });
      const scale = Math.min(1, MAX_WIDTH / img.naturalWidth);
      const canvas = canvasRef.current!;
      canvas.width = Math.round(img.naturalWidth * scale);
      canvas.height = Math.round(img.naturalHeight * scale);
      canvas.getContext("2d", { willReadFrequently: true })!.drawImage(img, 0, 0, canvas.width, canvas.height);
      const res = detect();
      if (res) {
        overlay(res);
        const smiling = res.faces.some((f) => f.smiles.length > 0);
        setStatus(res.faces.length === 0 ? "No face found" : smiling ? "Smiling" : "Face found, no smile");
        setStats({ fps: 0, ms: Math.round(res.ms), faces: res.faces.length });
      }
    } catch (e) {
      if (!mountedRef.current) return;
      setBusy(null);
      setError(e instanceof Error ? e.message : "Could not analyse that image.");
    } finally {
      if (url) URL.revokeObjectURL(url);
    }
  };

  useEffect(() => {
    rangeRef.current = range;
  }, [range]);

  useEffect(() => {
    mountedRef.current = true;
    const release = () => streamRef.current?.getTracks().forEach((t) => t.stop());
    window.addEventListener("pagehide", release);
    return () => window.removeEventListener("pagehide", release);
  }, []);

  useEffect(
    () => () => {
      mountedRef.current = false;
      runningRef.current = false;
      cancelAnimationFrame(rafRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
      const eng = engineRef.current;
      if (eng) {
        eng.face.delete();
        eng.smile.delete();
        engineRef.current = null;
      }
    },
    [],
  );

  return (
    <DemoFrame label="Live demo · Haar cascade smile detection" privacy="Your camera and photos never leave this device">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,18rem)]">
        <div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-sm border border-paper/10 bg-ink">
            <canvas ref={canvasRef} className="h-full w-full object-contain" aria-label="Detection preview" />
            <video ref={videoRef} playsInline muted className="hidden" />
            {!live && !status && !busy && (
              <div className="absolute inset-0 flex items-center justify-center p-6 text-center text-paper/60">
                Start your camera or analyse a photo. Faces get a blue box, smiles a magenta one.
              </div>
            )}
            {busy && (
              <div className="absolute inset-0 flex items-center justify-center bg-ink/80 p-6">
                <Progress label={busy} value={progress} />
              </div>
            )}
            {status && !busy && (
              <div className={`absolute left-3 top-3 rounded-full bg-ink/80 px-3 py-1.5 ${status === "Smiling" ? "text-accent" : "text-paper/80"} ${mono}`} role="status">
                {status}
              </div>
            )}
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            {live ? (
              <button type="button" onClick={stop} className={btn}>
                Stop camera
              </button>
            ) : (
              <button type="button" onClick={startCamera} disabled={!!busy} className={btnPrimary}>
                Start camera
              </button>
            )}
            <label className={`${btn} cursor-pointer ${busy ? "pointer-events-none opacity-40" : ""}`}>
              Analyse a photo
              <input type="file" accept="image/*" className="sr-only" onChange={(e) => onPhoto(e.target.files?.[0])} />
            </label>
          </div>
          {error && (
            <div className="mt-4">
              <ErrorNote>{error}</ErrorNote>
            </div>
          )}
        </div>

        <div className="space-y-8">
          <dl className="grid grid-cols-3 gap-4">
            <Stat label="FPS" value={live ? String(stats.fps) : "–"} />
            <Stat label="ms" value={stats.ms ? String(stats.ms) : "–"} />
            <Stat label="Faces" value={status ? String(stats.faces) : "–"} />
          </dl>

          <fieldset>
            <legend className={`mb-3 text-paper/50 ${mono}`}>Face detector range</legend>
            <div className="space-y-2 text-sm">
              {(["tuned", "original"] as const).map((r) => (
                <label key={r} className="flex cursor-pointer items-start gap-3">
                  <input type="radio" name="range" checked={range === r} onChange={() => setRange(r)} className="mt-1 accent-[#d6ff3f]" />
                  <span>
                    <span className="block">{r === "tuned" ? "Wide (scaleFactor 1.2)" : "Original script (scaleFactor 6)"}</span>
                    <span className="block text-paper/50">
                      {r === "tuned" ? "Finds faces at most distances." : "Exact parameters from the repo. Needs your face about 140px wide."}
                    </span>
                  </span>
                </label>
              ))}
            </div>
            <p className="mt-3 text-sm text-paper/50">Smile stage always uses the script&rsquo;s scaleFactor 1.7 and minNeighbors 20.</p>
          </fieldset>

          <div>
            <p className={`mb-3 text-paper/50 ${mono}`}>
              Auto-captured · {captures.length}/{MAX_CAPTURES}
            </p>
            {captures.length === 0 ? (
              <p className="text-sm text-paper/50">Smile at the camera. Like the script, it saves a picture (up to 10).</p>
            ) : (
              <>
                <ul className="grid grid-cols-5 gap-2">
                  {captures.map((src, i) => (
                    <li key={i}>
                      <a href={src} download={`smile-${i + 1}.jpg`} title="Download">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={src} alt={`Captured smile ${i + 1}`} className="aspect-square w-full rounded-sm object-cover" />
                      </a>
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  onClick={() => {
                    capturesRef.current = 0;
                    setCaptures([]);
                  }}
                  className={`mt-3 text-paper/60 underline-offset-4 hover:underline ${mono}`}
                >
                  Clear
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </DemoFrame>
  );
}
