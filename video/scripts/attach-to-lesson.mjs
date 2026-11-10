#!/usr/bin/env node
/**
 * Adds the video step to its lesson (after the first text step), if missing.
 *   node scripts/attach-to-lesson.mjs V-K-001
 * Bumps the lesson's patch version and records it in history.
 * Lesson text is not changed.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repo = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const id = process.argv[2];
const script = JSON.parse(readFileSync(join(repo, "content/video-scripts", `${id}.json`), "utf8"));
const lessonPath = join(repo, "content/lessons", `${script.lessonId}.json`);
const lesson = JSON.parse(readFileSync(lessonPath, "utf8"));

if (lesson.steps.some((s) => s.type === "video" && s.videoId === id)) {
  console.log(`${script.lessonId}: already has ${id}`);
  process.exit(0);
}
const firstText = lesson.steps.findIndex((s) => s.type === "text");
lesson.steps.splice(firstText + 1, 0, { type: "video", heading: "ดูวิดีโอสรุป", videoId: id });
const [maj, min, patch] = lesson.version.split(".").map(Number);
lesson.version = `${maj}.${min}.${patch + 1}`;
lesson.history.push({
  version: lesson.version,
  date: new Date().toISOString().slice(0, 10),
  author: "Claude Code (AI draft)",
  change: `Added video step ${id} (narration derived from this lesson; no text changes).`,
});
writeFileSync(lessonPath, JSON.stringify(lesson, null, 2) + "\n");
console.log(`${script.lessonId}: added ${id} as step ${firstText + 2}, version ${lesson.version}`);
