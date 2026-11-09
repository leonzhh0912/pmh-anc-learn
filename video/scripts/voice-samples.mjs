#!/usr/bin/env node
/**
 * Generate voice-comparison samples.
 *
 *   npm run voice-samples -- --dry-run          # show characters + estimated cost, call nothing
 *   npm run voice-samples                       # all candidates whose API key is set
 *   npm run voice-samples -- el-xxx g-yyy       # only these candidate ids
 *
 * Reads content/voice-tests/voice-test-th-v1.json (the text) and
 * content/voice-tests/candidates.json (the voices). Writes, per candidate,
 * out/voice-samples/<candidate>.mp3 plus out/voice-samples/index.html, a local
 * page to listen to all candidates side by side with the script text.
 */
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { missingKey, synthesize } from "./tts/index.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const videoRoot = resolve(here, "..");
const repoRoot = resolve(videoRoot, "..");
const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const only = args.filter((a) => !a.startsWith("--"));

const test = JSON.parse(readFileSync(join(repoRoot, "content/voice-tests/voice-test-th-v1.json"), "utf8"));
const { candidates, pricing } = JSON.parse(readFileSync(join(repoRoot, "content/voice-tests/candidates.json"), "utf8"));
const chosen = candidates.filter((c) => only.length === 0 || only.includes(c.id));

const chars = test.segments.reduce((n, s) => n + [...s.text].length, 0);
console.log(`Test script: ${test.segments.length} segments, ${chars} characters\n`);

const outDir = join(videoRoot, "out/voice-samples");
mkdirSync(outDir, { recursive: true });
const results = [];

for (const c of chosen) {
  const p = pricing[c.engine];
  const cost = p ? `≈ ${(chars * p.perCharUsd).toFixed(4)} USD (${p.note})` : "free (local)";
  const key = missingKey(c.engine);
  console.log(`${c.id.padEnd(22)} ${c.engine.padEnd(10)} ${cost}${key ? `  [skip: ${key} not set]` : ""}`);
  if (dryRun || key) continue;

  const parts = [];
  for (const seg of test.segments) {
    const wav = join(outDir, `${c.id}-${seg.id}.wav`);
    if (!existsSync(wav)) await synthesize(c.voice, seg.text, wav);
    parts.push(wav);
  }
  // join with 0.6 s pauses into one MP3 per candidate
  const gap = join(outDir, "_gap.wav");
  execFileSync("ffmpeg", ["-v", "error", "-y", "-f", "lavfi", "-i", "anullsrc=r=48000:cl=mono", "-t", "0.6", gap]);
  const list = join(outDir, `${c.id}.txt`);
  writeFileSync(list, parts.flatMap((f) => [`file '${f}'`, `file '${gap}'`]).join("\n"));
  const mp3 = join(outDir, `${c.id}.mp3`);
  execFileSync("ffmpeg", ["-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", list, "-c:a", "libmp3lame", "-q:a", "3", mp3]);
  rmSync(list);
  const dur = Number(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", mp3]).toString());
  results.push({ ...c, file: `${c.id}.mp3`, dur });
  console.log(`  -> out/voice-samples/${c.id}.mp3 (${dur.toFixed(1)} s)`);
}

if (!dryRun) {
  // list every candidate that has a sample on disk, not only this run's
  results.length = 0;
  for (const c of candidates) {
    const mp3 = join(outDir, `${c.id}.mp3`);
    if (!existsSync(mp3)) continue;
    const dur = Number(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", mp3]).toString());
    results.push({ ...c, file: `${c.id}.mp3`, dur });
  }
  const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
  const html = `<!doctype html><html lang="th"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Voice samples</title>
<style>body{font-family:Sarabun,system-ui,sans-serif;max-width:760px;margin:24px auto;padding:0 16px;line-height:1.7;color:#34182b;background:#fff7f9}
.c{background:#fff;border:1px solid #ecd3dd;border-radius:12px;padding:12px 16px;margin:12px 0}audio{width:100%}small{color:#6a5262}</style>
<h1>เปรียบเทียบเสียงบรรยาย</h1><p><small>${esc(test.purpose)}</small></p>
${results.map((r) => `<div class="c"><b>${esc(r.label)}</b> <small>${esc(r.engine)} / ${esc(String(r.voice.voice))}${r.voice.model ? " / " + esc(r.voice.model) : ""} / ${r.dur.toFixed(1)} s</small><audio controls preload="none" src="${r.file}"></audio></div>`).join("\n")}
<h2>สิ่งที่ควรฟัง</h2><ul>${test.listenFor.map((l) => `<li>${esc(l)}</li>`).join("")}</ul>
<h2>บทที่ใช้ทดสอบ</h2><ol>${test.segments.map((s) => `<li>${esc(s.text)}</li>`).join("")}</ol></html>`;
  writeFileSync(join(outDir, "index.html"), html);
  console.log(`\nOpen out/voice-samples/index.html to compare (${results.length} candidate(s)).`);
}
