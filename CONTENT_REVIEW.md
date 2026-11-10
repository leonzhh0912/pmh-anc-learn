# Content review and approval

Every lesson, quiz and video is patient-facing health information. It goes through four states:

```
DRAFT ──► MEDICAL_REVIEW ──► APPROVED ──► PUBLISHED
  ▲             │
  └── changes ──┘
```

| State | Who sets it | Meaning | Shown to patients? |
|---|---|---|---|
| `DRAFT` | author (developer / AI-assisted) | written from the handbook, not checked | prototype only, with a permanent "ฉบับร่าง" label |
| `MEDICAL_REVIEW` | author, when submitting | waiting for PMH reviewers | prototype only, labelled |
| `APPROVED` | PMH medical reviewer | clinically checked, Thai language checked | yes, in pilot/production |
| `PUBLISHED` | PMH content owner | live in a production release | yes |

The production build (`npm run build:production`) refuses any lesson or video that is not APPROVED or
PUBLISHED, and any video still using draft TTS narration.

## Required metadata (enforced by the schema)

Every lesson JSON has: unique `id`, `handbookRef` (edition + PDF pages), `objectives`, `version`,
`editorial.author`, `editorial.medicalReviewer`, `editorial.reviewDate`, `editorial.status`,
`editorial.clinicalRisk`, `editorial.reviewNotes`, and `history[]` (version history).
APPROVED/PUBLISHED without a reviewer name and date fails validation.

## Who reviews what

| Content | Minimum reviewer(s) |
|---|---|
| Pregnancy care, ANC schedule, nutrition in pregnancy | ANC nurse / midwife + obstetric doctor for anything clinical |
| Danger signs, urgent-care instructions, first aid, CPR, choking, seizures | doctor (obstetric or paediatric as relevant) — **high risk** |
| Breastfeeding, newborn care, stool colour | lactation nurse / paediatric nurse, paediatrician for warning signs |
| Vaccines (mother and child) | EPI nurse / doctor |
| Growth charts, complementary food, nutrition flags | nutritionist / paediatric nurse |
| Development (DSPM) | child development nurse |
| Dental | dentist / dental nurse |
| Mental health (ST-5, 2Q, EPDS explanations) | psychiatric nurse / doctor |
| Thai language, narration pronunciation | at least one Thai-speaking reviewer from the target community |

## Review checklist (per lesson)

- [ ] Every statement matches the cited handbook page (open the PDF page, not the extraction)
- [ ] No added medical advice, numbers or thresholds that are not in the handbook
- [ ] Items in `reviewNotes` resolved (accepted, changed, or removed)
- [ ] Nothing added that the handbook does not print (no local phone numbers, routes, doses or schedules; book-only scope)
- [ ] Quiz: correct answers right, every option's feedback and explanation correct and kind
- [ ] Language: plain Thai, adult tone, no blame, no assumption that every mother has a partner
- [ ] Video: script matches lesson, captions match narration, pronunciation checked by a Thai speaker
- [ ] Images are original or licensed; nothing copied from the handbook without permission

## How a review happens (now: simple; later: CMS)

**Now (prototype):**
1. Author sets `status: "MEDICAL_REVIEW"`, generates a reviewer pack (lesson preview link on staging,
   rendered MP4, the handbook page), and sends it to the reviewer.
2. Reviewer comments in writing (paper or a shared document is fine). Comments go into `reviewNotes`.
3. Author fixes, bumps `version`, adds a `history` entry.
4. Reviewer confirms. The reviewer (or PMH content owner) records the sign-off with one command, which
   sets `APPROVED`, `medicalReviewer`, `reviewDate`, bumps the version, adds a history entry, validates,
   and commits with a message that names the reviewer:

   ```bash
   cd app
   npm run record-approval -- --reviewer "ชื่อ นามสกุล (ตำแหน่ง)" --date 2026-11-10 \
     --ref "เลขที่บันทึกข้อความ/อีเมลอนุมัติ" --all --commit
   ```

   Use `--risk high` or lesson ids instead of `--all` when different reviewers signed different lessons;
   `--dry-run` shows what would change. Push to `main`: the Publish workflow deploys the site.
   Keep the reviewer's written approval (email/memo) in PMH records.

**Later (Git-based CMS):** reviewers comment and approve via pull requests; merging = approval.

## Changing approved content

Any edit to an APPROVED lesson returns it to `DRAFT` with a new version and history entry. For videos, the
draft badge in the picture follows the approval recorded in `content/videos/<id>.json`: an unchanged
re-render after approval is published with `node scripts/publish.mjs <id> --media-only`; a changed video
needs `--reopen` (its record goes back to DRAFT) and is rendered again so the badge returns. A wording-only
fix still needs a reviewer confirmation. If the Department of Health issues a new handbook printing,
compare page by page (see how the 1st→2nd printing differences were found in CURRICULUM.md) and send
every affected lesson back to review.
