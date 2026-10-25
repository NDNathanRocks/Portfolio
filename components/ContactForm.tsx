"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion, type Variants } from "framer-motion";

type Status = "idle" | "sending" | "sent" | "error";

const rect = "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)";
const plane = "polygon(0% 15%, 100% 50%, 0% 85%, 35% 50%)";

const card: Variants = {
  idle: { scale: 1, rotate: 0, x: 0, y: 0, opacity: 1, clipPath: rect },
  fly: {
    scale: [1, 0.55, 0.28],
    rotate: [0, -6, -14],
    x: [0, 0, "55vw"],
    y: [0, 0, "-45vh"],
    opacity: [1, 1, 0],
    clipPath: [rect, plane, plane],
    transition: { duration: 1.5, times: [0, 0.35, 1], ease: "easeInOut" },
  },
};
const fields: Variants = {
  idle: { opacity: 1 },
  fly: { opacity: 0, transition: { duration: 0.3 } },
};

const label = "mb-2 block font-mono text-xs uppercase tracking-[0.14em] text-mute";
const input =
  "w-full border-0 border-b border-paper/30 bg-transparent py-3 text-lg text-paper outline-none transition-colors placeholder:text-mute focus:border-accent";

export default function ContactForm() {
  const reduced = useReducedMotion();
  const startedAt = useRef(Date.now());
  const [status, setStatus] = useState<Status>("idle");
  const [landed, setLanded] = useState(false);
  const [error, setError] = useState("");
  const [values, setValues] = useState({ name: "", email: "", other: "", message: "", hp: "" });

  const set = (key: keyof typeof values) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setValues((v) => ({ ...v, [key]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === "sending") return;
    setStatus("sending");
    setError("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, elapsed: Date.now() - startedAt.current }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Something went wrong. Please try again.");
      setStatus("sent");
      if (reduced) setLanded(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setStatus("error");
    }
  };

  const reset = () => {
    setValues({ name: "", email: "", other: "", message: "", hp: "" });
    setStatus("idle");
    setLanded(false);
    startedAt.current = Date.now();
  };

  return (
    <div className="relative min-h-[560px]">
      <AnimatePresence mode="wait">
        {landed ? (
          <motion.div
            key="done"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            role="status"
            className="flex min-h-[560px] flex-col items-start justify-center gap-6 rounded-sm bg-ink p-8 text-paper md:p-10"
          >
            <svg aria-hidden viewBox="0 0 24 24" className="h-12 w-12 text-accent" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M3 11.5 21 3l-6.5 18-3.2-7.3L3 11.5Z" strokeLinejoin="round" />
              <path d="m11.3 13.7 4.2-4.2" strokeLinecap="round" />
            </svg>
            <p className="font-display text-4xl font-light leading-tight tracking-[-0.02em] md:text-5xl">
              Message sent.
            </p>
            <p className="max-w-[36ch] text-lg text-soft">
              Thanks{values.name ? `, ${values.name.split(" ")[0]}` : ""}. I&rsquo;ll reply to {values.email}.
            </p>
            <button
              type="button"
              onClick={reset}
              className="font-mono text-xs uppercase tracking-[0.14em] text-accent underline-offset-4 hover:underline"
            >
              Send another
            </button>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            variants={card}
            initial="idle"
            animate={status === "sent" ? "fly" : "idle"}
            onAnimationComplete={(def) => def === "fly" && setLanded(true)}
            onSubmit={submit}
            className="rounded-sm bg-ink p-8 text-paper md:p-10"
          >
            <motion.div variants={fields} className="space-y-8">
              <div>
                <label htmlFor="cf-name" className={label}>Your name</label>
                <input id="cf-name" required maxLength={100} autoComplete="name" value={values.name} onChange={set("name")} className={input} placeholder="Jane Doe" />
              </div>
              <div>
                <label htmlFor="cf-email" className={label}>Your email (so I can reply)</label>
                <input id="cf-email" type="email" required maxLength={200} autoComplete="email" value={values.email} onChange={set("email")} className={input} placeholder="jane@company.com" />
              </div>
              <div>
                <label htmlFor="cf-other" className={label}>Other way to reach you (optional)</label>
                <input id="cf-other" maxLength={200} value={values.other} onChange={set("other")} className={input} placeholder="LinkedIn URL, phone, or handle" />
              </div>
              <div>
                <label htmlFor="cf-message" className={label}>Message</label>
                <textarea id="cf-message" required minLength={10} maxLength={4000} rows={5} value={values.message} onChange={set("message")} className={`${input} resize-none`} placeholder="What would you like to talk about?" />
                <p className="mt-2 text-right font-mono text-xs text-mute">{values.message.length}/4000</p>
              </div>

              <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
                <label>
                  Leave this field empty
                  <input tabIndex={-1} autoComplete="off" value={values.hp} onChange={set("hp")} name="hp" />
                </label>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4">
                <button
                  type="submit"
                  disabled={status === "sending" || status === "sent"}
                  className="rounded-full bg-accent px-8 py-3.5 font-mono text-xs font-medium uppercase tracking-[0.14em] text-ink transition-transform hover:scale-[1.04] focus-visible:scale-[1.04] disabled:opacity-60"
                >
                  {status === "sending" ? "Sending..." : "Send message"}
                </button>
                <p role="alert" className="min-h-5 max-w-[32ch] text-sm text-[#ff8a7a]">
                  {status === "error" ? error : ""}
                </p>
              </div>
            </motion.div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
