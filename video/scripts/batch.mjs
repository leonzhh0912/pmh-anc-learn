#!/usr/bin/env node
/**
 * Produce several lesson videos end to end, one at a time:
 *   check script -> narrate (TTS, cached) -> render (+ captioned) -> publish -> attach to lesson
 *
 *   npm run batch -- V-K-001 V-K-002 ...
 *
 * Each step is retried up to 3 times; after that the batch stops (e.g. TTS quota
 * exhausted) so no money is spent on a broken run.
 */
import { execFileSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const videoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const ids = process.argv.slice(2);
if (!ids.length) throw new Error("usage: npm run batch -- <video id> ...");

// Each step is retried (network blips, a headless-browser crash during render).
// Narration is cached per sentence, so a retry never pays twice for the same audio.
const RETRIES = 3;
const run = (cmd, args) => {
  for (let attempt = 1; ; attempt++) {
    try {
      return execFileSync(cmd, args, { cwd: videoRoot, stdio: "inherit" });
    } catch (e) {
      if (attempt >= RETRIES) throw e;
      console.log(`  ! ${cmd} ${args[0]} failed (attempt ${attempt}/${RETRIES}), retrying in ${attempt * 20} s`);
      execFileSync("sleep", [String(attempt * 20)]);
    }
  }
};
const npx = (args) => run("npx", args);

for (const id of ids) {
  const t0 = Date.now();
  console.log(`\n=== ${id} ===`);
  run("node", ["scripts/check-script.mjs", id]);
  run("node", ["--env-file-if-exists=.env.local", "scripts/narrate.mjs", id]);
  // moderate parallelism + generous frame timeout: renders stay reliable while the Mac is in use
  const renderFlags = ["--crf=26", "--log=error", "--concurrency=50%", "--timeout=120000"];
  npx(["remotion", "render", id, `out/${id}.mp4`, ...renderFlags]);
  npx(["remotion", "render", `${id}-captioned`, `out/${id}-captioned.mp4`, ...renderFlags]);
  run("node", ["scripts/publish.mjs", id]);
  run("node", ["scripts/attach-to-lesson.mjs", id]);
  console.log(`=== ${id} done in ${Math.round((Date.now() - t0) / 1000)} s ===`);
}
console.log(`\nAll ${ids.length} video(s) produced.`);
