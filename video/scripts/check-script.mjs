#!/usr/bin/env node
/**
 * Checks video scripts before spending TTS characters.
 *   node scripts/check-script.mjs            # all scripts
 *   node scripts/check-script.mjs V-K-001    # one script
 * Exit 1 on any error.
 */
import { readdirSync, readFileSync, existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const repo = resolve(here, "../..");
const dir = join(repo, "content/video-scripts");
const iconSrc = readFileSync(join(repo, "video/src/lesson/Icon.tsx"), "utf8");
const icons = new Set([...iconSrc.matchAll(/^ {2}([a-z]+): /gm)].map((m) => m[1]));

const only = process.argv.slice(2);
const files = readdirSync(dir).filter((f) => f.endsWith(".json") && (only.length === 0 || only.includes(f.slice(0, -5))));
let failed = 0;

for (const f of files) {
  const errs = [];
  const warn = [];
  const s = JSON.parse(readFileSync(join(dir, f), "utf8"));
  const id = f.slice(0, -5);
  if (s.id !== id) errs.push(`id "${s.id}" must equal file name`);
  if (!existsSync(join(repo, "content/lessons", `${s.lessonId}.json`))) errs.push(`lesson ${s.lessonId} not found`);
  if (s.voice?.engine !== "elevenlabs") warn.push(`voice engine is ${s.voice?.engine}`);
  if (s.editorial?.status !== "DRAFT" && !s.editorial?.medicalReviewer) errs.push("non-DRAFT status needs medicalReviewer");
  const kinds = s.scenes.map((x) => x.kind);
  if (kinds[0] !== "title") errs.push("first scene must be title");
  if (kinds.at(-1) !== "summary") errs.push("last scene must be summary");
  let chars = 0;
  const seenN = new Set();
  for (const sc of s.scenes) {
    if (!sc.segments?.length) errs.push(`${sc.id}: no segments`);
    for (const g of sc.segments ?? []) {
      chars += [...g.speak].length;
      if (/[0-9]/.test(g.speak)) errs.push(`${sc.id}: digits in speak (write numbers as Thai words): "${g.speak.slice(0, 50)}"`);
      if (/[A-Za-z]{2,}/.test(g.speak)) warn.push(`${sc.id}: Latin letters in speak, check pronunciation: "${g.speak.slice(0, 50)}"`);
      if ([...g.caption].length > 110) warn.push(`${sc.id}: long caption (${[...g.caption].length} chars)`);
    }
    if (sc.kind === "stage") {
      if (sc.segments[0]?.reveal !== 0) errs.push(`${sc.id}: first segment must have reveal 0 (stage intro)`);
      if ([...sc.label].length > 26) warn.push(`${sc.id}: long label`);
      for (const it of sc.items) {
        if (seenN.has(it.n)) errs.push(`${sc.id}: item number ${it.n} repeats (number items 1..N across the video)`);
        seenN.add(it.n);
        if (!icons.has(it.icon)) errs.push(`${sc.id}: unknown icon "${it.icon}"`);
        if ([...it.text].length > 46) warn.push(`${sc.id}: item ${it.n} text is long (${[...it.text].length} chars)`);
        if (!sc.segments.some((g) => g.reveal === it.n)) errs.push(`${sc.id}: no segment reveals item ${it.n}`);
      }
      if (sc.items.length > 6) errs.push(`${sc.id}: max 6 items per stage`);
    }
    if (sc.kind === "summary") {
      if (sc.segments[0]?.reveal !== 0) errs.push(`${sc.id}: first summary segment must have reveal 0`);
      sc.points.forEach((p, i) => {
        if (!sc.segments.some((g) => g.reveal === i + 1)) errs.push(`${sc.id}: no segment reveals point ${i + 1}`);
        if ([...p].length > 40) warn.push(`${sc.id}: point ${i + 1} is long`);
      });
    }
  }
  if (chars > 1600) errs.push(`narration is ${chars} characters (limit 1600 to control cost)`);
  const status = errs.length ? "FAIL" : "ok  ";
  console.log(`${status} ${id}  ${chars} chars`);
  errs.forEach((e) => console.log(`     ERROR ${e}`));
  warn.forEach((w) => console.log(`     warn  ${w}`));
  if (errs.length) failed++;
}
process.exit(failed ? 1 : 0);
