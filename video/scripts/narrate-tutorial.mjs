#!/usr/bin/env node
/**
 * Narration + timing for the app-use tutorial video (APP-TUTORIAL). Kept apart from the 58 handbook
 * videos: reads content/app-tutorial/video-script.json, writes src/generated/app-tutorial/, and never
 * touches content/video-scripts, content/videos or the lesson registry.
 *
 *   node scripts/narrate-tutorial.mjs           (uses the script's voice block; cached per sentence)
 *
 * Same TTS layer as the lesson videos (scripts/tts). The draft voice (macOS "Kanya") costs nothing; an
 * ElevenLabs voice would bill characters to the hospital's plan, so switching needs approval first.
 */
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { synthesize } from "./tts/index.mjs";

const videoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const repoRoot = resolve(videoRoot, "..");
const FPS = 30;
const SCENE_LEAD_IN = 0.35, SEGMENT_GAP = 0.35, SCENE_TAIL = 0.6;
const id = "APP-TUTORIAL";

const script = JSON.parse(readFileSync(join(repoRoot, "content/app-tutorial/video-script.json"), "utf8"));
const audioDir = join(videoRoot, "public/audio", id);
mkdirSync(audioDir, { recursive: true });
const toFrames = (s) => Math.round(s * FPS);
const duration = (f) => Number(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f]).toString().trim());

let cursor = 0;
let chars = 0;
const scenes = [];
const cues = [];
for (const scene of script.scenes) {
  const from = cursor;
  let t = toFrames(SCENE_LEAD_IN);
  const segments = [];
  for (const [i, seg] of scene.segments.entries()) {
    const hash = createHash("sha1").update(JSON.stringify([seg.speak, script.voice])).digest("hex").slice(0, 10);
    const name = `${scene.id}-${i + 1}-${hash}.wav`;
    const abs = join(audioDir, name);
    if (!existsSync(abs)) {
      await synthesize(script.voice, seg.speak, abs);
      chars += seg.speak.length;
    }
    const dur = toFrames(duration(abs));
    segments.push({ file: `audio/${id}/${name}`, from: t, durationInFrames: dur, caption: seg.caption, screen: seg.screen, focus: seg.focus ?? null });
    cues.push({ start: from + t, end: from + t + dur, text: seg.caption });
    t += dur + toFrames(SEGMENT_GAP);
  }
  const durationInFrames = t - toFrames(SEGMENT_GAP) + toFrames(SCENE_TAIL);
  scenes.push({ id: scene.id, title: scene.title, from, durationInFrames, segments });
  cursor += durationInFrames;
}

const timing = {
  id,
  version: script.version,
  fps: FPS,
  durationInFrames: cursor,
  narration: script.voice.engine === "macos-say" ? "draft-tts" : "cloud-tts",
  scenes,
};
const outDir = join(videoRoot, "src/generated/app-tutorial");
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, "timing.json"), JSON.stringify(timing, null, 2) + "\n");

const ts = (f) => {
  const s = f / FPS;
  return `${String(Math.floor(s / 3600)).padStart(2, "0")}:${String(Math.floor((s % 3600) / 60)).padStart(2, "0")}:${(s % 60).toFixed(3).padStart(6, "0")}`;
};
mkdirSync(join(videoRoot, "out"), { recursive: true });
writeFileSync(
  join(videoRoot, "out", `${id}.th.vtt`),
  "WEBVTT\n\n" + cues.map((c, i) => `${i + 1}\n${ts(c.start)} --> ${ts(c.end)}\n${c.text}\n`).join("\n"),
);
console.log(`${id}: ${scenes.length} scenes, ${cues.length} segments, ${(cursor / FPS).toFixed(1)} s, narration=${timing.narration}, new TTS characters=${chars}`);
