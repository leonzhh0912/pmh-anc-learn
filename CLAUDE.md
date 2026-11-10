# CLAUDE.md — rules for AI assistants on PMH Smart ANC Learn

This is real patient-education software for Phimai Hospital, Thailand. Accuracy beats speed.

## Non-negotiable content rules

1. The only syllabus is the official handbook described in `content/handbook-source.json`
   (2nd printing, April 2569, sha256 `174f424c…e0c5`). Page-by-page text is in `handbook/extraction/`.
   If something is unclear, view the page image rather than guessing.
2. Never invent medical advice, doses, thresholds, danger signs, schedules or anatomy. Every lesson
   statement must trace to a handbook page (`handbookRef.pdfPages`). Anything you add that is not in the
   handbook (framing, scenarios, family notes) must be listed in `editorial.reviewNotes`.
3. New or changed content is always `"status": "DRAFT"`. Only a human PMH reviewer may set
   `MEDICAL_REVIEW → APPROVED → PUBLISHED` (see CONTENT_REVIEW.md). Never edit `medicalReviewer`/`reviewDate`.
4. The app must not diagnose, triage, or tell a user whether they need emergency care. Danger-sign lessons
   say "go to hospital / contact staff", exactly as the handbook does, plus PMH-approved local contacts.
5. Never collect patient data. Progress stays in `localStorage`. No accounts, analytics or HIS integration.
6. The earlier 1st-printing PDF (sha256 `5f5cc4f7…`) must not be used as a source.
7. Do not copy handbook illustrations. Draw original graphics (see `video/src/lesson/Icon.tsx`).

## Page numbers

`pdfPages` = page index in the official 68-page PDF. Printed page = PDF − 2 for PDF p3–p66.
`app/src/lib/pages.ts` converts for display.

## Where things are

- Content JSON: `content/lessons/`, `content/video-scripts/`, `content/videos/`, `content/sections.json`,
  `content/curriculum.json` (lesson plan + status)
- Schema (single source for types and validation): `app/src/content/schema.ts`
- Validation: `cd app && npm run validate:content` (must pass before any commit)
- Video pipeline: `video/scripts/narrate.mjs` → `remotion render` → `video/scripts/publish.mjs`
- Video scenes: `video/src/lesson/` (new videos register automatically when narrated)
- Many videos at once: `cd video && npm run batch -- V-K-001 …` (check → narrate → render → publish → attach)
- Authoring guides: `docs/LESSON-AUTHORING-GUIDE.md`, `docs/VIDEO-SCRIPT-GUIDE.md`
- Reviewer checklist: `cd app && npm run review-pack` → `docs/REVIEW-PACK.md`

## Working method

Inspect → implement a small piece → run → test (`npm run test:e2e`) → look at it (screenshots at 360–390 px
width) → fix → update `docs/PROGRESS.md`. Keep Thai copy plain and adult; avoid childish gamification.
Use the frontend-design, Remotion and Playwright plugins when available.

## Commands

```bash
cd app && npm run dev | npm run build | npm run validate:content | npm run test:e2e
cd video && npm run dev            # Remotion Studio
cd video && npm run video <id>     # narrate + render + publish into app
```
