// A soft backing behind text that sits over the animated background: the page colour at about 78%, fading to nothing,
// so body copy keeps its contrast without a visible box. Place it inside a relatively positioned parent.
export default function Scrim({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute -z-10 ${className}`}
      style={{ background: "radial-gradient(closest-side, color-mix(in srgb, var(--ink) 78%, transparent) 55%, transparent)" }}
    />
  );
}
