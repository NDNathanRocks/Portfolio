import CountUp from "../CountUp";
import type { Metric } from "@/lib/content";

const mono = "font-mono text-xs uppercase tracking-[0.14em]";

// A row of headline numbers for a project. Generic, unlike ImpactPanel (which tells RFP's before/after story).
export default function StatStrip({ stats }: { stats: Metric[] }) {
  return (
    <dl className="grid grid-cols-2 gap-x-6 gap-y-10 border-y border-paper/15 py-10 md:grid-cols-4">
      {stats.map((s) => (
        <div key={s.label} className="flex flex-col-reverse">
          <dt className={`mt-3 text-mute ${mono}`}>{s.label}</dt>
          <dd className="font-display text-[clamp(2.75rem,6vw,4.5rem)] font-light leading-none tracking-[-0.03em]">
            <CountUp value={s.value} prefix={s.prefix} suffix={s.suffix} />
          </dd>
        </div>
      ))}
    </dl>
  );
}
