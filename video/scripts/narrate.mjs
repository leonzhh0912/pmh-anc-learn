#!/usr/bin/env node
/**
 * Step 1 of the video pipeline: narration + timing.
 *
 *   node scripts/narrate.mjs V-OVR-001
 *
 * Reads content/video-scripts/<id>.json and, for every segment:
 *  - produces a WAV in public/audio/<id>/ (draft TTS via macOS `say`, or a
 *    recorded file if one is supplied, see below),
 *  - measures its duration with ffprobe,
 * then writes src/generated/<id>.timing.json, which the Remotion composition
 * uses to size every scene to its narration, and a Thai WebVTT caption file.
 *
 * Recorded narration: put a file at public/audio/<id>/recorded/<sceneId>-<n>.wav
 * (n = 1-based segment index) and it is used instead of TTS. This is how
 * reviewed human narration replaces the draft voice without code changes.
 */
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync, rmSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const videoRoot = resolve(here, "..");
const repoRoot = resolve(videoRoot, "..");

const FPS = 30;
const SCENE_LEAD_IN = 0.6; // s of silence before first segment in a scene
const SEGMENT_GAP = 0.45; // s between segments
const SCENE_TAIL = 0.9; // s after last segment

const id = process.argv[2];
if (!id) {
  console.error("usage: node scripts/narrate.mjs <video-script-id>");
  process.exit(1);
}

const script = JSON.parse(
  readFileSync(join(repoRoot, "content/video-scripts", `${id}.json`), "utf8"),
);
const audioDir = join(videoRoot, "public/audio", id);
const recordedDir = join(audioDir, "recorded");
mkdirSync(audioDir, { recursive: true });

function duration(file) {
  const out = execFileSync("ffprobe", [
    "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", file,
  ]).toString();
  return Number(out.trim());
}

function synth(text, outWav) {
  const { engine, voice, rate } = script.voice;
  if (engine !== "macos-say") throw new Error(`unsupported TTS engine ${engine}`);
  const aiff = outWav.replace(/\.wav$/, ".aiff");
  execFileSync("say", ["-v", voice, "-r", String(rate), "-o", aiff, text]);
  execFileSync("ffmpeg", ["-v", "error", "-y", "-i", aiff, "-ar", "48000", "-ac", "1", outWav]);
  rmSync(aiff);
}

const toFrames = (s) => Math.round(s * FPS);
let cursor = 0; // frames, absolute
const scenes = [];
const cues = [];
let usedRecorded = 0;

for (const scene of script.scenes) {
  const sceneStart = cursor;
  let t = toFrames(SCENE_LEAD_IN);
  const segments = [];
  scene.segments.forEach((seg, i) => {
    const recorded = join(recordedDir, `${scene.id}-${i + 1}.wav`);
    let file;
    if (existsSync(recorded)) {
      file = `audio/${id}/recorded/${scene.id}-${i + 1}.wav`;
      usedRecorded++;
    } else {
      const hash = createHash("sha1")
        .update(JSON.stringify([seg.speak, script.voice]))
        .digest("hex")
        .slice(0, 10);
      const name = `${scene.id}-${i + 1}-${hash}.wav`;
      const abs = join(audioDir, name);
      if (!existsSync(abs)) synth(seg.speak, abs);
      file = `audio/${id}/${name}`;
    }
    const dur = toFrames(duration(join(videoRoot, "public", file)));
    segments.push({ file, from: t, durationInFrames: dur, caption: seg.caption, reveal: seg.reveal ?? null });
    cues.push({ start: sceneStart + t, end: sceneStart + t + dur, text: seg.caption });
    t += dur + toFrames(SEGMENT_GAP);
  });
  const durationInFrames = t - toFrames(SEGMENT_GAP) + toFrames(SCENE_TAIL);
  scenes.push({ id: scene.id, from: sceneStart, durationInFrames, segments });
  cursor += durationInFrames;
}

const timing = {
  id,
  version: script.version,
  fps: FPS,
  durationInFrames: cursor,
  narration: usedRecorded === 0 ? "draft-tts" : usedRecorded === cues.length ? "recorded" : "mixed",
  scenes,
};

mkdirSync(join(videoRoot, "src/generated"), { recursive: true });
writeFileSync(join(videoRoot, "src/generated", `${id}.timing.json`), JSON.stringify(timing, null, 2));

// WebVTT for the web player (captions toggleable, not burned in)
const ts = (f) => {
  const s = f / FPS;
  const hh = String(Math.floor(s / 3600)).padStart(2, "0");
  const mm = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
  const ss = (s % 60).toFixed(3).padStart(6, "0");
  return `${hh}:${mm}:${ss}`;
};
const vtt =
  "WEBVTT\n\n" +
  cues.map((c, i) => `${i + 1}\n${ts(c.start)} --> ${ts(c.end)}\n${c.text}\n`).join("\n");
const vttOut = join(videoRoot, "out", `${id}.th.vtt`);
mkdirSync(dirname(vttOut), { recursive: true });
writeFileSync(vttOut, vtt);

console.log(
  `${id}: ${scenes.length} scenes, ${cues.length} segments, ${(cursor / FPS).toFixed(1)} s, narration=${timing.narration}`,
);
