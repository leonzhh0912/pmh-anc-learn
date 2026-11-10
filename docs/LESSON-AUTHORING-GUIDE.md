# Brief: drafting lessons for PMH Smart ANC Learn

Real patient-education app for Phimai Hospital, Thailand (pregnant women, families, older caregivers, some with
limited literacy). Every lesson is DRAFT and will be clinically reviewed, but you must still be exact.

## Read first
- CLAUDE.md (content rules — non-negotiable)
- Schema: app/src/content/schema.ts (Lesson, Step, Question)
- Two finished examples to copy the style and structure of:
  content/lessons/MCH68-OVR-001.json and MCH68-K-001.json
- Your lesson's plan entry (title, pages, objectives, interactivity ideas, risk, PMH clarifications):
  content/curriculum.json (find by lessonId)
- Handbook text, verbatim, page by page:
  handbook/extraction/pages-01-24.md, pages-25-46.md, pages-47-68.md
  Page images (official 2nd printing) when wording, numbers or tables are unclear:
  (render the page from the official PDF: see DEVELOPMENT.md; or open handbook/source/MCH-2568-official.pdf)
  (NN = PDF page, two digits). ALWAYS open the page image for any number, dose, time, threshold or table you use.

## Content rules
1. Every statement must come from the cited handbook pages. Numbers, times, amounts, ages: copy exactly.
   No outside medical knowledge, no "common sense" health tips, no new advice.
2. Plain, natural, adult Thai. Short sentences. Neutral voice (avoid ค่ะ/ครับ). Never blame. Never assume a
   husband/partner exists — say "คนในครอบครัว" or "คนที่ดูแล" unless quoting the handbook.
3. Danger signs / "go to hospital" content: repeat the handbook wording exactly; don't soften or extend it.
4. Anything you add that is not literally in the handbook (framing, scenarios, family notes, examples,
   "ask staff" pointers) must be listed in `editorial.reviewNotes`, with what to check.
5. If the handbook looks wrong, contradictory or ambiguous: do not fix it — omit or quote it, and add a
   clear reviewNote starting "HANDBOOK ISSUE:".
6. Cross-references to other handbook pages use PRINTED page numbers (printed = PDF − 2 for PDF p3–p66).

## Lesson structure (in this order)
1. 1–3 `text` steps (2–4 short paragraphs each)
2. At least one interactive step that fits the content: `timeline` (stages + tappable items), `sort`
   (tap card → tap bucket; 5–8 cards, 2–6 buckets; card text must be unique), or `flag` (only for nutrition
   flags). Use the curriculum entry's interactivity ideas where the existing step types allow. Do NOT invent
   new step types.
3. **End-of-lesson quiz** (`quiz` step, heading "ทบทวนความเข้าใจ"): 4–5 questions. Mix kinds: mcq, truefalse,
   and at least one `scenario` (a short everyday situation). Every option has its own kind, specific
   `feedback`; every question has an `explanation` that ties back to the handbook and a `source` with
   pdfPages + printedPages. Vary the position of the correct option. No trick questions.
4. `takeaways` step (heading "สรุปสิ่งสำคัญ", 3–5 items) with a `familyNote` for partners, grandparents or
   caregivers (inclusive wording).
Do NOT add a `video` step (videos are produced separately).

## Metadata
- id = the lessonId; file name content/lessons/<id>.json; version "0.1.0"; minutes = realistic (4–8).
- sectionId from curriculum.json; stages / audience from the schema enums.
- objectives: 2–4, start with "ผู้เรียน…", taken from or close to the curriculum entry.
- handbookRef: edition "MCH-2568", pdfPages, printedPages (strings), note.
- editorial: status "DRAFT", author "Claude Code (AI draft) for PMH developer", medicalReviewer null,
  reviewDate null, clinicalRisk from curriculum.json, reviewNotes (see rules 4–5; also copy any
  pmhClarificationNeeded items that apply).
- history: [{ "version": "0.1.0", "date": "2026-11-09", "author": "Claude Code (AI draft)", "change": "First draft from official handbook PDF p…" }]

## Files and checks
- Write ONLY your own files in content/lessons/. Do not edit any
  other file (not curriculum.json, not code, not docs). Do not run git, Playwright, or dev servers.
- After writing, run: `cd app && npm run validate:content`
  and fix any error that mentions your lessons (other agents are writing other lessons at the same time;
  ignore errors about files that aren't yours).
- Final reply: per lesson — steps used, number of quiz questions, every reviewNote in one line each, and any
  HANDBOOK ISSUE found. Keep it compact.
