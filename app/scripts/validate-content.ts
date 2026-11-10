/**
 * Validates every content file against the schema and cross-checks references.
 *   npm run validate:content
 * Exit code 1 on any problem, so it can gate CI and deployments.
 *
 *   --production   additionally fails if any lesson or video is not APPROVED/PUBLISHED
 */
import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { Lesson, Section, Video } from "../src/content/schema";

const root = resolve(import.meta.dirname, "../..");
const contentDir = join(root, "content");
const production = process.argv.includes("--production");
const errors: string[] = [];
const warnings: string[] = [];

const readJson = (p: string) => JSON.parse(readFileSync(p, "utf8"));
const dir = (d: string) =>
  existsSync(join(contentDir, d))
    ? readdirSync(join(contentDir, d)).filter((f) => f.endsWith(".json")).map((f) => join(contentDir, d, f))
    : [];

const sections = Section.array().safeParse(readJson(join(contentDir, "sections.json")));
if (!sections.success) errors.push(`sections.json: ${sections.error.message}`);
const sectionIds = new Set(sections.success ? sections.data.map((s) => s.id) : []);

const videos = dir("videos").map((f) => {
  const r = Video.safeParse(readJson(f));
  if (!r.success) errors.push(`${f}: ${r.error.message}`);
  return r.success ? r.data : null;
});
const videoIds = new Set(videos.filter(Boolean).map((v) => v!.id));

for (const v of videos) {
  if (!v) continue;
  for (const asset of [v.mp4, v.captionsVtt, v.poster].filter(Boolean) as string[]) {
    if (!existsSync(join(root, "app/public", asset))) errors.push(`video ${v.id}: missing asset app/public/${asset}`);
  }
  if (production && v.editorial.status !== "APPROVED" && v.editorial.status !== "PUBLISHED")
    errors.push(`video ${v.id}: status ${v.editorial.status} is not allowed in production`);
  if (production && (v.narration === "draft-tts" || v.narration === "mixed"))
    errors.push(`video ${v.id}: draft (macOS) TTS narration not allowed in production`);
}

const seen = new Set<string>();
for (const f of dir("lessons")) {
  const r = Lesson.safeParse(readJson(f));
  if (!r.success) {
    errors.push(`${f}: ${r.error.message}`);
    continue;
  }
  const l = r.data;
  if (!f.endsWith(`${l.id}.json`)) errors.push(`${f}: file name must match id ${l.id}`);
  if (seen.has(l.id)) errors.push(`duplicate lesson id ${l.id}`);
  seen.add(l.id);
  if (!sectionIds.has(l.sectionId)) errors.push(`${l.id}: unknown sectionId ${l.sectionId}`);
  for (const s of l.steps) {
    if (s.type === "video" && !videoIds.has(s.videoId)) errors.push(`${l.id}: unknown videoId ${s.videoId}`);
    if (s.type === "quiz")
      for (const q of s.questions) {
        if (!q.options.some((o) => o.id === q.correctOptionId))
          errors.push(`${l.id}/${q.id}: correctOptionId ${q.correctOptionId} not among options`);
      }
    if (s.type === "sort")
      for (const it of s.items)
        if (!s.buckets.some((b) => b.id === it.bucketId)) errors.push(`${l.id}/${it.id}: unknown bucket ${it.bucketId}`);
  }
  // every lesson ends with a quiz (optionally followed by a takeaways summary)
  const types = l.steps.map((s) => s.type);
  const quizIdx = types.lastIndexOf("quiz");
  const tail = types.slice(quizIdx + 1);
  if (quizIdx < 0) errors.push(`${l.id}: missing end-of-lesson quiz`);
  else if (tail.some((t) => t !== "takeaways")) errors.push(`${l.id}: quiz must be the last step (only a takeaways summary may follow)`);
  else {
    const qs = (l.steps[quizIdx] as Extract<(typeof l.steps)[number], { type: "quiz" }>).questions;
    if (qs.length < 3) errors.push(`${l.id}: end-of-lesson quiz needs at least 3 questions (has ${qs.length})`);
    const ids = new Set<string>();
    for (const q of qs) {
      if (ids.has(q.id)) errors.push(`${l.id}: duplicate question id ${q.id}`);
      ids.add(q.id);
      if (new Set(q.options.map((o) => o.text)).size !== q.options.length) errors.push(`${l.id}/${q.id}: duplicate option text`);
    }
  }
  for (const s of l.steps) {
    if (s.type === "sort" && new Set(s.items.map((i) => i.text)).size !== s.items.length)
      errors.push(`${l.id}: sort card texts must be unique`);
  }

  const approved = l.editorial.status === "APPROVED" || l.editorial.status === "PUBLISHED";
  if (approved && (!l.editorial.medicalReviewer || !l.editorial.reviewDate))
    errors.push(`${l.id}: ${l.editorial.status} requires medicalReviewer and reviewDate`);
  if (production && !approved) errors.push(`${l.id}: status ${l.editorial.status} is not allowed in production`);
  if (!approved) warnings.push(`${l.id}: ${l.editorial.status}`);
}

// curriculum plan: unique ids, known sections, every built lesson is in the plan
const curriculumPath = join(contentDir, "curriculum.json");
if (!existsSync(curriculumPath)) {
  errors.push("content/curriculum.json missing");
} else {
  const plan = readJson(curriculumPath) as { lessonId: string; sectionId: string; pdfPages: number[] }[];
  const planIds = new Set<string>();
  for (const e of plan) {
    if (planIds.has(e.lessonId)) errors.push(`curriculum: duplicate ${e.lessonId}`);
    planIds.add(e.lessonId);
    if (!sectionIds.has(e.sectionId)) errors.push(`curriculum ${e.lessonId}: unknown section ${e.sectionId}`);
    if (!e.pdfPages?.length || e.pdfPages.some((p) => p < 1 || p > 68))
      errors.push(`curriculum ${e.lessonId}: bad pdfPages`);
  }
  for (const id of seen) if (!planIds.has(id)) errors.push(`lesson ${id} is not in content/curriculum.json`);
  console.log(`curriculum: ${plan.length} planned lessons`);
}

for (const w of warnings) console.log(`note  ${w}`);
for (const e of errors) console.error(`ERROR ${e}`);
console.log(`${seen.size} lessons, ${videoIds.size} videos, ${sectionIds.size} sections — ${errors.length} error(s)`);
process.exit(errors.length ? 1 : 0);
