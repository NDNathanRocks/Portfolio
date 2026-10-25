"use client";

import { useEffect, useState, type CSSProperties, type ReactNode } from "react";

// Looping drawings of what each project does, shown on its corridor card while that card is in focus. Pure SVG + CSS
// (see `.pv` in globals.css): no iframes, no assets, nothing fetched. Every drawing's resting state is its finished
// frame, so a card that is out of focus (or reduced motion) shows a clean still.

const LOOP = 6000;
const HI = "text-accent group-hover:text-[#0a0a0a]";
const at = (d: number, t?: number) => ({ "--d": `${d}s`, ...(t ? { "--t": `${t}s` } : {}) }) as CSSProperties;

const Svg = ({ children }: { children: ReactNode }) => (
  <svg viewBox="0 0 400 170" fill="none" stroke="currentColor" strokeWidth="1.2" className="h-full w-full">
    {children}
  </svg>
);
const Label = ({ x, y, children, anchor = "start", dim = false, ...rest }: { x: number; y: number; children: ReactNode; anchor?: "start" | "middle" | "end"; dim?: boolean } & React.SVGProps<SVGTextElement>) => (
  <text x={x} y={y} textAnchor={anchor} fill="currentColor" stroke="none" fontSize="9" letterSpacing="1.4" opacity={dim ? 0.6 : 1} className="font-mono" {...rest}>
    {children}
  </text>
);

function Aegis() {
  const nodes = [
    [60, "RETRIEVE"],
    [140, "ROUTE"],
    [220, "CRITIC"],
    [300, "ANSWER"],
  ] as const;
  return (
    <Svg>
      <Label x={20} y={36} dim>NAIVE LLM</Label>
      <Label x={380} y={36} anchor="end" dim className="pv-pulse font-mono">thinking…</Label>
      <rect x={20} y={46} width={360} height={4} rx={2} fill="currentColor" stroke="none" opacity={0.15} />
      <rect x={20} y={46} width={360} height={4} rx={2} fill="currentColor" stroke="none" opacity={0.6} className="pv-ol pv-slowbar" />
      <Label x={20} y={96} dim>AEGIS PIPELINE</Label>
      <g className={HI}>
        <rect x={20} y={106} width={360} height={4} rx={2} fill="currentColor" stroke="none" opacity={0.15} />
        <rect x={20} y={106} width={360} height={4} rx={2} fill="currentColor" stroke="none" className="pv-ol pv-grow" style={at(0.2, 2.6)} />
        {nodes.map(([x, name], i) => (
          <g key={name}>
            <circle cx={x} cy={108} r={7} fill="currentColor" stroke="none" className="pv-pop" style={at(0.5 + i * 0.65)} />
            <Label x={x} y={136} anchor="middle" dim>{name}</Label>
          </g>
        ))}
        <Label x={380} y={96} anchor="end" className="pv-up font-mono" style={at(3.1)}>7.3 ms cache hit ✓</Label>
      </g>
    </Svg>
  );
}

function Clarity() {
  const ys = [40, 65, 90, 115, 140];
  const clean = [150, 138, 150, 108, 128];
  return (
    <Svg>
      <Label x={20} y={20} dim>BEFORE</Label>
      <Label x={230} y={20} dim>AFTER</Label>
      {ys.map((y, i) => (
        <path
          key={y}
          d={`M20 ${y} l14 -5 l12 7 l14 -6 l12 6 l16 -7 l14 6 l${i % 2 ? 22 : 34} -4`}
          strokeDasharray="3 2"
          className="pv-dim"
          style={at(1.4)}
        />
      ))}
      <path d="M190 85 h22 m-7 -6 l7 6 l-7 6" className="pv-fade" style={at(1.4)} />
      <g className={HI}>
        {ys.map((y, i) => (
          <rect key={y} x={230} y={y - 2} width={clean[i]} height={4} rx={2} fill="currentColor" stroke="none" className="pv-ol pv-grow" style={at(1.8 + i * 0.28, 0.5)} />
        ))}
      </g>
    </Svg>
  );
}

function BinIt() {
  const bins = [230, 275, 320];
  const names = ["RECYCLE", "COMPOST", "GARBAGE"];
  return (
    <Svg>
      <g className="pv-item">
        <rect x={50} y={55} width={60} height={60} rx={6} fill="currentColor" fillOpacity={0.08} />
        <path d="M74 70 h12 v8 l5 8 v22 h-22 v-22 l5 -8 z" />
      </g>
      <g className={`${HI} pv-bracket`}>
        <rect x={42} y={47} width={76} height={76} rx={3} strokeDasharray="14 62" strokeWidth={2} />
      </g>
      <Label x={50} y={142} className="pv-up font-mono" style={at(1.4)}>bottle 94%</Label>
      <rect x={50} y={150} width={60} height={3} rx={1.5} fill="currentColor" stroke="none" opacity={0.15} />
      <g className={HI}>
        <rect x={50} y={150} width={56} height={3} rx={1.5} fill="currentColor" stroke="none" className="pv-ol pv-grow" style={at(1.5, 0.8)} />
      </g>
      {bins.map((x, i) => (
        <g key={x}>
          <rect x={x} y={60} width={38} height={60} rx={4} />
          {i === 0 && (
            <g className={HI}>
              <rect x={x} y={60} width={38} height={60} rx={4} fill="currentColor" stroke="none" opacity={0.3} className="pv-binfill" />
            </g>
          )}
          <Label x={x + 19} y={136} anchor="middle" dim fontSize="7" letterSpacing="0.6">{names[i]}</Label>
        </g>
      ))}
    </Svg>
  );
}

function Smile() {
  return (
    <Svg>
      <circle cx={200} cy={85} r={58} opacity={0.7} />
      <circle cx={180} cy={72} r={4} fill="currentColor" stroke="none" />
      <circle cx={220} cy={72} r={4} fill="currentColor" stroke="none" />
      <path d="M172 105 Q200 128 228 105" strokeWidth={2} strokeLinecap="round" className="pv-ot pv-mouth" style={at(1.3, 0.9)} />
      <g className={HI}>
        <rect x={132} y={20} width={136} height={130} rx={4} strokeDasharray="6 4" className="pv-lock" style={at(0.3)} />
        <rect x={164} y={60} width={32} height={22} rx={2} className="pv-fade" style={at(0.8)} />
        <rect x={204} y={60} width={32} height={22} rx={2} className="pv-fade" style={at(1)} />
        <rect x={164} y={100} width={72} height={34} rx={2} className="pv-fade" style={at(2.2)} />
        <Label x={200} y={165} anchor="middle" className="pv-up font-mono" style={at(2.4)}>SMILE DETECTED</Label>
      </g>
    </Svg>
  );
}

function Panoramic() {
  return (
    <Svg>
      <rect x={40} y={50} width={190} height={90} rx={4} fill="currentColor" fillOpacity={0.06} />
      <path d="M40 140 L90 92 L120 115 L160 72 L230 140" opacity={0.6} />
      <g className="pv-align">
        <rect x={170} y={50} width={190} height={90} rx={4} fill="currentColor" fillOpacity={0.06} />
        <path d="M170 140 L215 100 L255 82 L300 114 L360 140" opacity={0.6} />
      </g>
      <g className={HI}>
        {[
          [188, 78],
          [205, 104],
          [220, 126],
        ].map(([x, y], i) => (
          <g key={x}>
            <circle cx={x} cy={y} r={3} fill="currentColor" stroke="none" className="pv-pop" style={at(0.3 + i * 0.2)} />
            <line x1={x} y1={y} x2={x + 26} y2={y + 16} strokeDasharray="2 2" className="pv-match" />
          </g>
        ))}
        <rect x={40} y={44} width={320} height={102} rx={6} strokeDasharray="6 4" className="pv-fade" style={at(3)} />
        <Label x={200} y={163} anchor="middle" className="pv-up font-mono" style={at(3.2)}>PANORAMA</Label>
      </g>
    </Svg>
  );
}

function Rfp() {
  const ys = [52, 68, 84, 100, 116];
  const w = [108, 96, 108, 80, 100];
  return (
    <Svg>
      <rect x={130} y={14} width={140} height={142} rx={4} />
      <rect x={146} y={28} width={60} height={5} rx={2.5} fill="currentColor" stroke="none" opacity={0.7} />
      {ys.map((y, i) => (
        <rect key={y} x={146} y={y} width={w[i]} height={4} rx={2} fill="currentColor" stroke="none" opacity={0.35} />
      ))}
      {[0, 2, 3].map((i, n) => (
        <rect key={i} x={144} y={ys[i] - 2} width={w[i] + 4} height={8} fill="currentColor" stroke="none" className="pv-ol pv-grow" style={at(0.6 + n * 0.45, 0.4)} />
      ))}
      <g className={`${HI} pv-stamp`}>
        <rect x={142} y={126} width={116} height={22} rx={3} strokeWidth={1.6} />
        <Label x={200} y={141} anchor="middle" fontSize="10" fontWeight="600">CONFIDENTIAL</Label>
      </g>
    </Svg>
  );
}

const previews: Record<string, () => ReactNode> = {
  "aegis-ai-race": Aegis,
  clarity: Clarity,
  binit: BinIt,
  smile: Smile,
  panoramic: Panoramic,
  rfp: Rfp,
};

export const hasPreview = (id: string) => id in previews;

export default function CardPreview({ id, live }: { id: string; live: boolean }) {
  const [run, setRun] = useState(0);
  // Replay from the start whenever the card comes into focus, and every LOOP ms while it stays there.
  useEffect(() => {
    if (!live) return;
    setRun((r) => r + 1);
    const timer = setInterval(() => setRun((r) => r + 1), LOOP);
    return () => clearInterval(timer);
  }, [live]);

  const Drawing = previews[id];
  if (!Drawing) return null;
  return (
    <div aria-hidden data-live={live} className="pv min-h-0 flex-1 py-3">
      <div key={run} className="pv-run h-full w-full">
        <Drawing />
      </div>
    </div>
  );
}
