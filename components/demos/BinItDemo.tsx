"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { DemoFrame, ErrorNote, Progress, btn, fetchWithProgress, mono } from "./ui";
import useReduced from "@/lib/useReduced";

// Port of BinIt's backend (app.py + obj_detect.py): classify with an ImageNet model, then take the first
// of the top-10 predictions that is one of the nine items the app knows, and map it to a bin.
const MODEL_URL = "/demos/models/mobilenetv2-12.onnx";
const CLASSES_URL = "/demos/models/imagenet_classes.txt";
const ORT_URL = "/demos/ort/ort.wasm.min.mjs";

const BIN_SORT: Record<string, "green" | "blue" | "black" | "yellow"> = {
  broccoli: "green",
  "wooden spoon": "green",
  "band aid": "black",
  "plastic bag": "black",
  "toilet tissue, toilet paper, bathroom tissue": "yellow",
  "paper towel": "yellow",
  "diaper, nappy, napkin": "black",
  "beer bottle": "blue",
  cup: "green",
};
const SHORT: Record<string, string> = {
  "toilet tissue, toilet paper, bathroom tissue": "toilet paper",
  "diaper, nappy, napkin": "diaper",
};
const BINS = {
  green: { label: "Compost", color: "#4ade80", ink: "#052e16" },
  blue: { label: "Recycling", color: "#60a5fa", ink: "#0b1e3f" },
  black: { label: "Landfill", color: "#3f3f46", ink: "#fafafa" },
  yellow: { label: "Paper", color: "#facc15", ink: "#2b2100" },
} as const;

const SAMPLES = [
  { src: "/demos/binit/broccoli.jpg", label: "Broccoli" },
  { src: "/demos/binit/bottle.jpg", label: "Beer bottle" },
  { src: "/demos/binit/tissue.jpg", label: "Toilet paper" },
  { src: "/demos/binit/bag.jpg", label: "Plastic bag" },
];

const MEAN = [0.485, 0.456, 0.406];
const STD = [0.229, 0.224, 0.225];

type Result = { bin: keyof typeof BINS | null; item: string | null; top: { name: string; p: number }[]; ms: number };
/* eslint-disable @typescript-eslint/no-explicit-any */
type Session = { ort: any; session: any; classes: string[] };

function preprocess(img: HTMLImageElement): Float32Array {
  // Resize to 256x256 like the original, centre-crop 224 (the torchvision transform), normalise, NCHW.
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const ctx = c.getContext("2d", { willReadFrequently: true })!;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, 0, 0, 256, 256);
  const { data } = ctx.getImageData(16, 16, 224, 224);
  const out = new Float32Array(3 * 224 * 224);
  const plane = 224 * 224;
  for (let i = 0; i < plane; i++) {
    for (let ch = 0; ch < 3; ch++) out[ch * plane + i] = (data[i * 4 + ch] / 255 - MEAN[ch]) / STD[ch];
  }
  return out;
}

function softmax(v: Float32Array): Float32Array {
  let max = -Infinity;
  for (const x of v) if (x > max) max = x;
  const e = new Float32Array(v.length);
  let sum = 0;
  for (let i = 0; i < v.length; i++) {
    e[i] = Math.exp(v[i] - max);
    sum += e[i];
  }
  for (let i = 0; i < e.length; i++) e[i] /= sum;
  return e;
}

export default function BinItDemo() {
  const reduced = useReduced();
  const engine = useRef<Session | null>(null);
  const loading = useRef<Promise<Session> | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  const [loadProgress, setLoadProgress] = useState<number | undefined>(0);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [thinking, setThinking] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [drag, setDrag] = useState(false);

  const load = useCallback((): Promise<Session> => {
    if (loading.current) return loading.current;
    loading.current = (async () => {
      const [ort, classesText, model] = await Promise.all([
        import(/* webpackIgnore: true */ /* turbopackIgnore: true */ ORT_URL as string),
        fetch(CLASSES_URL).then((r) => r.text()),
        fetchWithProgress(MODEL_URL, setLoadProgress),
      ]);
      ort.env.wasm.wasmPaths = "/demos/ort/";
      ort.env.wasm.numThreads = 1; // single-threaded avoids needing cross-origin isolation
      const session = await ort.InferenceSession.create(model, { executionProviders: ["wasm"] });
      const s = { ort, session, classes: classesText.split("\n").map((l) => l.trim()).filter(Boolean) };
      engine.current = s;
      setReady(true);
      return s;
    })().catch((e) => {
      loading.current = null;
      throw e;
    });
    return loading.current;
  }, []);

  const classify = useCallback(
    async (img: HTMLImageElement) => {
      setThinking(true);
      setError(null);
      try {
        const { ort, session, classes } = await load();
        const t0 = performance.now();
        const input = new ort.Tensor("float32", preprocess(img), [1, 3, 224, 224]);
        const out = await session.run({ [session.inputNames[0]]: input });
        const logits = out[session.outputNames[0]].data as Float32Array;
        const probs = softmax(logits);
        const top = Array.from(probs.keys())
          .sort((a, b) => probs[b] - probs[a])
          .slice(0, 10)
          .map((i) => ({ name: classes[i].toLowerCase(), p: probs[i] }));
        const hit = top.find((t) => t.name in BIN_SORT);
        setResult({ bin: hit ? BIN_SORT[hit.name] : null, item: hit?.name ?? null, top: top.slice(0, 5), ms: performance.now() - t0 });
      } catch (e) {
        setError(e instanceof Error ? e.message : "The classifier failed to run.");
      } finally {
        setThinking(false);
      }
    },
    [load],
  );

  const pickImage = useCallback(
    (src: string | File) => {
      setResult(null);
      setError(null);
      const url = typeof src === "string" ? src : URL.createObjectURL(src);
      const img = new Image();
      img.onload = () => {
        imgRef.current = img;
        setPreview(url);
        classify(img);
      };
      img.onerror = () => setError("That file couldn't be read as an image.");
      img.src = url;
    },
    [classify],
  );

  // Start downloading the model as soon as the visitor has opted in by launching the demo.
  useEffect(() => {
    load().catch((e) => setError(e instanceof Error ? `Could not load the model: ${e.message}` : "Could not load the model."));
  }, [load]);

  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const f = Array.from(e.clipboardData?.files ?? []).find((x) => x.type.startsWith("image/"));
      if (f) pickImage(f);
    };
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [pickImage]);

  useEffect(
    () => () => {
      engine.current?.session?.release?.();
      engine.current = null;
    },
    [],
  );

  const bin = result?.bin ? BINS[result.bin] : null;

  return (
    <DemoFrame label="Live demo · BinIt waste classifier" privacy="Images are classified on your device, never uploaded">
      <p className="mb-6 rounded-sm border border-paper/15 bg-paper/[0.04] px-4 py-3 text-sm text-paper/70">
        <span className="text-accent">Lighter model.</span> The original app runs ResNet152 (about 230&nbsp;MB) on a Flask server. This web demo uses MobileNetV2 (about 14&nbsp;MB) so it can
        run in your browser. Same labels and bin rules, slightly different confidence.
      </p>

      <div className="grid gap-8 lg:grid-cols-2">
        <div>
          <label
            onDragOver={(e) => {
              e.preventDefault();
              setDrag(true);
            }}
            onDragLeave={() => setDrag(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDrag(false);
              const f = e.dataTransfer.files[0];
              if (f) pickImage(f);
            }}
            className={`relative flex aspect-[4/3] cursor-pointer items-center justify-center overflow-hidden rounded-sm border border-dashed transition-colors focus-within:border-accent ${drag ? "border-accent bg-accent/10" : "border-paper/25 hover:border-accent"}`}
          >
            {preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview} alt="Image being classified" className="h-full w-full object-contain" />
            ) : (
              <span className="max-w-[28ch] p-6 text-center text-paper/60">Drop a photo here, click to choose one, or paste from your clipboard.</span>
            )}
            <input type="file" accept="image/*" className="sr-only" onChange={(e) => e.target.files?.[0] && pickImage(e.target.files[0])} />
          </label>

          <p className={`mb-3 mt-6 text-paper/50 ${mono}`}>Or try a sample</p>
          <ul className="flex flex-wrap gap-3">
            {SAMPLES.map((s) => (
              <li key={s.src}>
                <button type="button" onClick={() => pickImage(s.src)} className={`${btn} min-h-11 !px-4 !py-2`}>
                  {s.label}
                </button>
              </li>
            ))}
          </ul>

          {!ready && !error && (
            <div className="mt-6">
              <Progress label="Downloading model" value={loadProgress} />
            </div>
          )}
        </div>

        <div aria-live="polite">
          {error && <ErrorNote>{error}</ErrorNote>}

          {!error && !result && (
            <div className="flex h-full min-h-[200px] items-center rounded-sm border border-paper/10 p-6 text-paper/50">
              {thinking ? "Classifying" : "The bin will show up here."}
            </div>
          )}

          {result && (
            <motion.div
              key={`${preview}-${result.ms}`}
              initial={reduced ? false : { opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="rounded-sm p-6" style={bin ? { background: bin.color, color: bin.ink } : { background: "#1a1a1a", color: "#f4efe6" }}>
                <p className={`${mono} opacity-70`}>{bin ? "Put it in the" : "Hmm"}</p>
                <p className="mt-1 font-display text-5xl font-light leading-none md:text-6xl">{bin ? `${bin.label}` : "Not found!"}</p>
                <p className="mt-4 opacity-80">
                  {bin && result.item
                    ? `Spotted: ${SHORT[result.item] ?? result.item} (${result.bin} bin)`
                    : "None of the model's top 10 guesses is something BinIt knows. Try one of the items below."}
                </p>
              </div>

              <p className={`mb-3 mt-6 text-paper/50 ${mono}`}>Model&rsquo;s top guesses · <span className="tabular-nums">{result.ms.toFixed(0)}</span> ms</p>
              <ul className="space-y-2">
                {result.top.map((t) => (
                  <li key={t.name} className="grid grid-cols-[minmax(0,1fr)_3.5rem] items-center gap-3 text-sm">
                    <div>
                      <div className={`mb-1 truncate ${t.name in BIN_SORT ? "text-accent" : "text-paper/80"}`}>{t.name.split(",")[0]}</div>
                      <div className="h-[3px] bg-paper/10">
                        <div className={`h-full ${t.name in BIN_SORT ? "bg-accent" : "bg-paper/40"}`} style={{ width: `${Math.max(1, t.p * 100)}%` }} />
                      </div>
                    </div>
                    <span className="text-right tabular-nums text-paper/60">{(t.p * 100).toFixed(1)}%</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          )}

          <p className={`mb-3 mt-8 text-paper/50 ${mono}`}>BinIt knows these nine items</p>
          <ul className="flex flex-wrap gap-2 text-sm">
            {Object.entries(BIN_SORT).map(([name, b]) => (
              <li key={name} className="flex items-center gap-2 rounded-full border border-paper/15 px-3 py-1">
                <span aria-hidden className="h-2.5 w-2.5 rounded-full" style={{ background: BINS[b].color, boxShadow: b === "black" ? "0 0 0 1px #888" : undefined }} />
                {SHORT[name] ?? name}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <p className="mt-8 text-xs text-paper/40">Sample photos: Wikimedia Commons, CC0.</p>
    </DemoFrame>
  );
}
