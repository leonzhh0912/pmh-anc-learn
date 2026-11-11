# AGENTS.md — rules for AI assistants on PMH Smart ANC Learn

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
   say "go to hospital / contact staff", exactly as the handbook does. Phone numbers only if printed in the
   handbook (e.g. 1669).
8. Scope: the app digitises the handbook to make it easier to learn; it adds no information (decision of the
   PMH director, in line with MOPH). Where the handbook is silent (local contacts, doses, product names,
   follow-up routes), the app is silent too. Do not ask PMH to supply extra content.
5. Accounts and data (rule narrowed on 2026-11-11 by the PMH hospital executive; see docs/ACCOUNTS-SCOPE.md):
   - Allowed: learner sign-in (staff-issued ID + password; phone/email one-time codes built but off), a display
     name, account status, account-linked learning activity in this app (lesson steps and completion, quiz
     answers given in the app, video playback coverage, tutorial progress), staff/admin accounts, and audit
     records of privileged actions.
   - Never collect: diagnoses, pregnancy histories, symptoms, national ID numbers, hospital medical records,
     location, or anything for advertising or third-party behavioural analytics. No HIS integration.
   - Sign-in before learning (developer for PMH, 2026-11-11): when accounts are on, lessons need sign-in
     (`VITE_REQUIRE_LOGIN`, default on); sign-in, Lesson 0, help, privacy and about stay open. The public
     build without an account server stays open to everyone. Guest progress already on a device is never
     uploaded or merged without the learner's explicit choice.
   - Sign-in for the PMH setup: staff-issued learner ID + password (no SMS/email budget); one sign-in page for
     learners, staff and admins. Staff/admin authenticator code: a server setting, OFF by default (developer
     for PMH, 2026-11-11: old phones; `private.settings.require_staff_mfa`).
   - Roles are enforced by the database (RLS + checked functions), never by the browser. Staff see only
     learners assigned to them. Public sign-up always creates a learner.
   - Real-user data collection stays OFF until PMH's privacy/IT approval and an approved hosting and
     email/SMS setup. Never put secrets, private records or exports in the frontend, public folders or Git.
   - An administrator role gives no authority to approve or edit clinical content.
9. The app-use tutorial ("Lesson 0", `content/app-tutorial/`) is software instruction, not a handbook lesson:
   it is stored apart from the 58 lessons, has no handbook citations, and is not counted in the curriculum.
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
- Accounts backend: `backend/supabase/migrations/` (schema, RLS, functions), `backend/tests/` (database/API
  security tests: `cd backend && npm run db:start && npm test`), docs in `docs/ACCOUNTS-*.md`

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
