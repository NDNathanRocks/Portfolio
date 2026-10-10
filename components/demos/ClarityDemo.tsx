"use client";

import { useState } from "react";
import { DemoFrame, btn, mono } from "./ui";

// The real Clarity app (Expo / React Native), exported for the web, running in a same-origin frame.
// Its network layer is swapped for an in-browser mock, so there is no server, no API key and no cost.
const SRC = "/demos/clarity";

export default function ClarityDemo() {
  const [run, setRun] = useState(0);
  const [loaded, setLoaded] = useState(false);

  return (
    <DemoFrame label="Live demo · Clarity app" privacy="Sample data only. Task titles you break down may go to an AI service">
      <div className="grid items-start gap-10 lg:grid-cols-[400px_minmax(0,1fr)]">
        <div className="mx-auto w-full max-w-[400px]">
          <div className="rounded-[2.5rem] border border-paper/25 bg-ink p-2 sm:p-3 shadow-[0_30px_80px_-30px_rgba(167,139,250,0.45)]">
            <div className="relative aspect-[9/18.5] w-full overflow-hidden rounded-[1.9rem] bg-white">
              {!loaded && (
                <div role="status" className={`absolute inset-0 flex items-center justify-center bg-ink text-paper/60 ${mono}`}>
                  Loading app
                </div>
              )}
              <iframe
                key={run}
                src={SRC}
                title="Clarity app demo"
                sandbox="allow-scripts allow-same-origin"
                loading="lazy"
                onLoad={() => setLoaded(true)}
                className="h-full w-full border-0"
              />
            </div>
          </div>
        </div>

        <div className="space-y-8 lg:pt-4">
          <p className="max-w-[48ch] font-display text-2xl font-light leading-snug md:text-3xl">
            This is the actual app, not a mock-up. Add a task, accept an AI breakdown, then schedule it.
          </p>

          <ul className="max-w-[56ch] space-y-3 text-paper/70">
            <li>
              <span className="text-accent">Try:</span> tap the add-task field, type &ldquo;Write a report for work&rdquo; and watch the estimate and the step-by-step breakdown appear.
            </li>
            <li>
              <span className="text-accent">Try:</span> open the chat tab and say &ldquo;schedule call the bank tomorrow at 3pm&rdquo;, then open the calendar tab.
            </li>
            <li>
              <span className="text-accent">Try:</span> schedule a task and check it appears in the calendar.
            </li>
          </ul>

          <p className="max-w-[56ch] rounded-sm border border-paper/15 bg-paper/[0.04] px-4 py-3 text-sm text-paper/70">
            <span className="text-accent">Demo mode.</span> The app&rsquo;s Django server is replaced by a small in-browser stand-in. Task breakdowns ask a live AI model through a rate-limited proxy and fall back to built-in rules when it is
            unavailable. Estimates and chat replies are always rule-based here. The real app uses Claude for all of them.
          </p>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => {
                setLoaded(false);
                setRun((n) => n + 1);
              }}
              className={btn}
            >
              Reset demo
            </button>
            <a href={SRC} target="_blank" rel="noopener noreferrer" className={`${btn} inline-block`}>
              Open full screen ↗
            </a>
          </div>
        </div>
      </div>
    </DemoFrame>
  );
}
