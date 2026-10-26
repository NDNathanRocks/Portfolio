import Decode from "../Decode";
import { acts } from "@/lib/story";

const pad = (n: number) => String(n).padStart(2, "0");

// "Act 04, The Path" label plus a one-line tagline. The colour classes are overridable for the lime contact block.
export default function ActKicker({
  index,
  line,
  className = "",
  kickerClass = "text-accent",
  lineClass = "text-soft",
}: {
  index: number;
  line: string;
  className?: string;
  kickerClass?: string;
  lineClass?: string;
}) {
  return (
    <div className={className} data-tour-beat="0.3">
      <p className={`font-mono text-xs uppercase tracking-[0.14em] ${kickerClass}`}>
        <Decode text={`Act ${pad(index + 1)} — ${acts[index].label}`} />
      </p>
      <p className={`mt-2 text-base md:text-lg ${lineClass}`}>{line}</p>
    </div>
  );
}
