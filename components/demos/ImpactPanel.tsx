"use client";

import { motion } from "framer-motion";
import CountUp from "../CountUp";
import type { Metric } from "@/lib/content";

const mono = "font-mono text-xs uppercase tracking-[0.14em]";

const steps = [
  { label: "Input", detail: "Invoices" },
  { label: "ETL pipeline", detail: "Extract and organize" },
  { label: "Output", detail: "Organized records" },
];

export default function ImpactPanel({ impact, stack }: { impact: Metric[]; stack: string[] }) {
  return (
    <div className="grid grid-cols-1 gap-x-6 gap-y-16 lg:grid-cols-12">
      <div className="lg:col-span-6">
        <p className={`mb-8 text-accent ${mono}`}>Business impact</p>
        <div className="flex flex-col gap-6">
          {impact.map((m, i) => (
            <div key={m.label} className="flex flex-col gap-6">
              <div>
                <CountUp
                  value={m.value}
                  prefix={m.prefix}
                  suffix={m.suffix}
                  className="block font-display text-[clamp(3.5rem,8vw,7rem)] font-medium leading-none tracking-[-0.04em]"
                />
                <span className={`mt-3 block text-paper/60 ${mono}`}>{m.label}</span>
              </div>
              {i < impact.length - 1 && (
                <span aria-hidden className="font-display text-5xl leading-none text-accent">&darr;</span>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="lg:col-span-6">
        <p className={`mb-8 text-accent ${mono}`}>Architecture</p>
        <ol className="space-y-3">
          {steps.map((s, i) => (
            <motion.li
              key={s.label}
              initial={{ opacity: 0, x: -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.7, delay: i * 0.15, ease: [0.2, 0.7, 0.2, 1] }}
              className="relative flex items-center justify-between rounded-sm border border-paper/15 px-6 py-5"
            >
              <span className="font-display text-2xl font-light">{s.label}</span>
              <span className={`text-paper/60 ${mono}`}>{s.detail}</span>
              {i < steps.length - 1 && (
                <span aria-hidden className="absolute -bottom-3 left-8 z-10 h-3 w-px bg-accent" />
              )}
            </motion.li>
          ))}
        </ol>
        <ul className={`mt-6 flex flex-wrap gap-x-5 gap-y-2 text-paper/60 ${mono}`}>
          {stack.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
        <p className={`mt-6 text-paper/40 ${mono}`}>Internal details intentionally omitted.</p>
      </div>
    </div>
  );
}
