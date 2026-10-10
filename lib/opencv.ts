/* eslint-disable @typescript-eslint/no-explicit-any */
// Lazy, self-hosted OpenCV.js loader shared by the AISmileDetector and Panoramic Stitching demos.
// The ~10 MB build is only fetched after a visitor launches a demo, and is cached by the browser.

export type CV = any;

const SRC = "/demos/opencv/opencv.js";
let loading: Promise<CV> | null = null;

export function loadOpenCV(): Promise<CV> {
  if (loading) return loading;
  loading = new Promise<CV>((resolve, reject) => {
    const w = window as any;
    const ready = (cv: any) => {
      // The 4.x build exposes a thenable; resolving with it directly would recurse forever.
      if (cv && typeof cv.then === "function") {
        cv.then((real: any) => {
          delete real.then;
          resolve(real);
        }, reject);
      } else {
        resolve(cv);
      }
    };
    if (w.cv && w.cv.Mat) return ready(w.cv);

    const script = document.createElement("script");
    script.src = SRC;
    script.async = true;
    script.onerror = () => {
      loading = null;
      reject(new Error("Could not download OpenCV.js"));
    };
    script.onload = () => {
      const cv = w.cv;
      if (!cv) return reject(new Error("OpenCV.js did not initialise"));
      if (cv.Mat) return ready(cv);
      if (typeof cv.then === "function") return ready(cv);
      cv.onRuntimeInitialized = () => ready(w.cv);
    };
    document.head.appendChild(script);
  });
  return loading;
}

// Copies a file from /public into OpenCV's virtual filesystem so a CascadeClassifier can load it.
// Idempotent: the virtual filesystem outlives the demo component, and creating a file twice throws.
const mounted = new Set<string>();

export async function mountFile(cv: CV, url: string, name: string): Promise<string> {
  if (mounted.has(name)) return name;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Could not download ${name}`);
  const data = new Uint8Array(await res.arrayBuffer());
  cv.FS_createDataFile("/", name, data, true, false, false);
  mounted.add(name);
  return name;
}
