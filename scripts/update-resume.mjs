#!/usr/bin/env node
// Swap in a new resume PDF, commit it and push, so the host redeploys with it.
//   npm run resume -- ~/Downloads/resume.pdf            (commit + push)
//   npm run resume -- ~/Downloads/resume.pdf --no-push  (commit only)
// Only people who can push to the repo can change the live resume: there is no upload page to attack.
import { execFileSync } from "node:child_process";
import { copyFileSync, existsSync, openSync, readSync, closeSync, statSync } from "node:fs";
import { resolve } from "node:path";

const TARGET = "public/Nathan_DSouza_Resume.pdf";
const MAX_BYTES = 5 * 1024 * 1024;

const args = process.argv.slice(2);
const push = !args.includes("--no-push");
const source = args.find((a) => !a.startsWith("--"));

const fail = (msg) => {
  console.error(`✗ ${msg}`);
  process.exit(1);
};
const git = (...a) => execFileSync("git", a, { encoding: "utf8" }).trim();

if (!source) fail("Usage: npm run resume -- <path/to/resume.pdf> [--no-push]");
const path = resolve(source.replace(/^~(?=[/\\])/, process.env.HOME ?? process.env.USERPROFILE ?? "~"));
if (!existsSync(path)) fail(`No file at ${path}`);

const { size } = statSync(path);
if (size > MAX_BYTES) fail(`That PDF is ${(size / 1024 / 1024).toFixed(1)} MB; keep it under 5 MB so it downloads fast.`);
const head = Buffer.alloc(5);
const fd = openSync(path, "r");
readSync(fd, head, 0, 5, 0);
closeSync(fd);
if (head.toString("latin1") !== "%PDF-") fail("That file isn't a PDF (it doesn't start with %PDF-).");

copyFileSync(path, TARGET);
if (!git("status", "--porcelain", "--", TARGET)) {
  console.log("✓ That's the same file that's already live. Nothing to do.");
  process.exit(0);
}

const date = new Date().toISOString().slice(0, 10);
git("add", "--", TARGET);
// Commit only the resume, even if other files are staged.
git("commit", "-m", `chore: update resume (${date})`, "--", TARGET);
console.log(`✓ Committed the new resume (${(size / 1024).toFixed(0)} KB).`);

const branch = git("rev-parse", "--abbrev-ref", "HEAD");
if (!push) {
  console.log("  Skipped push (--no-push). Run `git push` when ready.");
} else {
  execFileSync("git", ["push", "origin", branch], { stdio: "inherit" });
  console.log(`✓ Pushed ${branch}.`);
}
if (branch !== "main") console.log(`! You're on "${branch}". The live site updates once this reaches main.`);
