/**
 * Record a PMH reviewer's sign-off (CONTENT_REVIEW.md, "How a review happens", step 4).
 *
 * Run by the PMH reviewer or content owner, never by an AI assistant (CLAUDE.md rule 3).
 *
 *   npm run record-approval -- --reviewer "ชื่อ นามสกุล (ตำแหน่ง)" --date 2026-11-10 \
 *       --ref "บันทึกข้อความ ที่ ... ลงวันที่ ..." --all
 *   npm run record-approval -- --reviewer "..." --date ... --ref "..." --risk high
 *   npm run record-approval -- --reviewer "..." --date ... --ref "..." MCH68-K-005 MCH68-CH-001
 *
 * For each chosen lesson that is DRAFT or MEDICAL_REVIEW, and the video attached to it:
 *   status -> APPROVED, medicalReviewer, reviewDate, version -> next major (0.x -> 1.0.0),
 *   and a history entry naming the reviewer and the written approval reference.
 * Then it runs content validation. Add --dry-run to see what would change, --commit to commit
 * the change with a message that names the reviewer.
 */
import { execFileSync } from "node:child_process";
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

const root = resolve(import.meta.dirname, "../..");
const content = join(root, "content");

const args = process.argv.slice(2);
const flag = (name: string) => {
  const i = args.indexOf(`--${name}`);
  if (i < 0) return undefined;
  const v = args[i + 1];
  if (!v || v.startsWith("--")) fail(`--${name} needs a value`);
  args.splice(i, 2);
  return v;
};
const bool = (name: string) => {
  const i = args.indexOf(`--${name}`);
  if (i >= 0) args.splice(i, 1);
  return i >= 0;
};
function fail(msg: string): never {
  console.error(`record-approval: ${msg}`);
  process.exit(1);
}

const reviewer = flag("reviewer")?.trim();
const date = flag("date");
const ref = flag("ref")?.trim();
const risk = flag("risk");
const all = bool("all");
const dryRun = bool("dry-run");
const commit = bool("commit");
const ids = args.filter((a) => !a.startsWith("--"));
const unknown = args.filter((a) => a.startsWith("--"));

if (unknown.length) fail(`unknown option ${unknown.join(" ")}`);
if (!reviewer) fail('--reviewer "name (role)" is required');
if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(date)))
  fail("--date YYYY-MM-DD is required (the date the reviewer signed)");
if (!ref) fail('--ref "<written approval reference>" is required (memo / email kept in PMH records)');
if (risk && !["low", "medium", "high"].includes(risk)) fail("--risk must be low, medium or high");
if (!all && !risk && !ids.length) fail("choose lessons: --all, --risk <level>, or lesson ids");

type Json = Record<string, any>;
const read = (p: string): Json => JSON.parse(readFileSync(p, "utf8"));
const write = (p: string, d: Json) => writeFileSync(p, JSON.stringify(d, null, 2) + "\n");
const files = (d: string) =>
  readdirSync(join(content, d))
    .filter((f) => f.endsWith(".json"))
    .map((f) => join(content, d, f));

const lessons = files("lessons").map((path) => ({ path, data: read(path) }));
const videos = files("videos").map((path) => ({ path, data: read(path) }));

for (const id of ids) if (!lessons.some((l) => l.data.id === id)) fail(`no lesson ${id}`);

const chosen = lessons.filter(
  (l) =>
    (all || ids.includes(l.data.id) || (risk && l.data.editorial.clinicalRisk === risk)) &&
    ["DRAFT", "MEDICAL_REVIEW"].includes(l.data.editorial.status),
);
if (!chosen.length) fail("nothing to approve (chosen lessons are already APPROVED/PUBLISHED)");

const nextMajor = (v: string) => `${Math.max(1, Number(v.split(".")[0]) + 1)}.0.0`;
const editorial = (e: Json) => ({ ...e, status: "APPROVED", medicalReviewer: reviewer, reviewDate: date });
const touched: string[] = [];

for (const l of chosen) {
  const d = l.data;
  const version = nextMajor(d.version);
  console.log(`${d.id}  ${d.editorial.status} -> APPROVED  v${d.version} -> v${version}`);
  d.version = version;
  d.editorial = editorial(d.editorial);
  d.history.push({
    version,
    date,
    author: reviewer,
    change: `Medically reviewed and approved by ${reviewer} on ${date}. Written approval: ${ref}.`,
  });
  touched.push(l.path);
  for (const v of videos.filter((v) => v.data.lessonId === d.id)) {
    if (!["DRAFT", "MEDICAL_REVIEW"].includes(v.data.editorial.status)) continue;
    console.log(`  video ${v.data.id}  ${v.data.editorial.status} -> APPROVED`);
    v.data.editorial = editorial(v.data.editorial);
    touched.push(v.path);
  }
}

if (dryRun) {
  console.log(`\n(dry run) ${chosen.length} lesson(s) would be approved; nothing written.`);
  process.exit(0);
}

for (const p of touched) {
  const item = [...lessons, ...videos].find((x) => x.path === p)!;
  write(p, item.data);
}
console.log(`\nRecorded approval for ${chosen.length} lesson(s). Validating…`);
execFileSync("npx", ["tsx", "scripts/validate-content.ts"], { cwd: join(root, "app"), stdio: "inherit" });

if (commit) {
  execFileSync("git", ["add", ...touched], { cwd: root, stdio: "inherit" });
  execFileSync(
    "git",
    [
      "commit",
      "-m",
      `Approve ${chosen.length} lesson(s): reviewed by ${reviewer} on ${date}`,
      "-m",
      `Written approval: ${ref}\nLessons: ${chosen.map((l) => l.data.id).join(", ")}`,
    ],
    { cwd: root, stdio: "inherit" },
  );
  console.log("Committed. Push to main (or open a PR) to publish.");
} else {
  console.log("Not committed. Review the diff, then commit with a message that names the reviewer (or rerun with --commit).");
}
