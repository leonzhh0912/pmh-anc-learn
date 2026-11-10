# Progress log and next steps

Read this first at the start of every working session. Add a dated entry at the end of each one.

## Session 1 — 2026-11-09 (on-site at PMH, day 1)

### Done and verified

- **Environment:** macOS 27.2 on Apple M4, Node 26.8.1, npm 11.19, ffmpeg present. Remotion, frontend-design
  and Playwright plugins available in Claude Code.
- **Handbook verified.** The official page (anamai.moph.go.th) links to a 68-page PDF, which is the
  **2nd printing (เมษายน 2569, 480,000 เล่ม)**, sha256 `174f424c…e0c5`. The copy that was in
  `~/Downloads` is the **1st printing (กรกฎาคม 2568)**, and the two differ on many pages: fetal-movement
  counting from 28 weeks (was 32), choking first aid, PCV schedule, head-circumference referral lines,
  exercise minutes, and more. The official 2nd printing is the only source. See CURRICULUM.md for all changes.
- **Full extraction:** every one of the 68 pages was read from page images, classified, and transcribed
  verbatim (`handbook/extraction/pages-*.md`).
- **Curriculum map:** CURRICULUM.md and `content/curriculum.json`: 58 planned lessons; every PDF page 1–68
  accounted for (only the back cover has no lesson). Risk: 16 low, 23 medium, 19 high. Releases: R1 15,
  R2 30, R3 13. Generated from `handbook/tools/gen_curriculum/` so the two files never disagree.
  Staff coverage tracker in the app at `/curriculum` (linked from "เกี่ยวกับแอป").
- **Source-rule fix:** the first video script borrowed fuller wording from the 1st printing for some
  items. Re-aligned to the 2nd-printing p67 wording (script v0.2.0, lesson v0.1.1) and re-rendered.
- **Remotion pipeline:** smoke test rendered (3 s H.264). First lesson video `V-OVR-001` rendered (v0.2.0):
  161 s, 1280×720 H.264 + AAC 48 kHz, decodes end-to-end, narration audible (mean −17 dB on first render).
  A burned-in-captions copy was also rendered for sharing. Thai WebVTT captions are generated from the same script.
- **App:** mobile-first PWA with handbook-tab home, section pages, lesson step player, timeline, tap-to-sort
  activity, quiz (feedback per option, retry or show answer, no score), takeaways with family note,
  video with captions, local progress, 3 text sizes, permanent draft label, offline support.
- **First lesson:** `MCH68-OVR-001` "15 ข้อ เพื่อแม่ลูกสุขภาพดี" (PDF p67), DRAFT.
- **Tests:** `validate:content` 0 errors. Playwright 12/12 passing (phone + desktop).
- **Docs:** README, CLAUDE.md, DEVELOPMENT.md, CURRICULUM.md, DEPLOYMENT.md, CONTENT_REVIEW.md.

### Not done / not verified

- No PMH staff have seen it yet. **Next on-site task: demo and collect feedback.**
- Narration pronunciation not checked by a Thai speaker. Draft voice only.
- Not tested on a real low-end Android phone or on iOS Safari (only Playwright emulation).
- Pushed to the private GitHub repo `leonzhh0912/pmh-anc-learn` (branch `main`). No PMH collaborator added yet.
- The "Smart ANC" PMH presentation mentioned in the brief was not provided; the PMH proposal context is not yet captured.

## Handbook issues for PMH clinical reviewers (found during extraction)

- Trimester boundaries differ inside the handbook: p23–25 say 13–27 / 28–40 weeks, p27 says 13–26 / 27–40.
- Reduced fetal movement: p15 says "see a doctor", p26 says "come to hospital immediately". The urgency differs.
- Night feeding after 6 months: p29 says it is not needed and p64 counts night milk as a caries risk, which
  sits awkwardly with breastfeeding on demand.
- p45 growth-result table: two rows have overlapping printed text. Check against a paper copy.
- p19 EPDS item 10: the top-score answer is printed "ค่อนข้างน้อย", which looks wrong.
- p18–19 mental-health screens carry the ♡ (parent may fill in) icon but are clinical tools. PMH needs a policy
  on how the app treats them. Current plan: awareness lessons only, never the items or scoring.
- The handbook gives no safe-sleep position guidance and no crisis phone line; PMH must decide local additions.
- p22 (ธงโภชนาการ คืออะไร): the definition says nutrition helps 'ป้องกันโรคติดต่อเรื้อรัง' (chronic *communicable* disease), probably a misprint for 'โรคไม่ติดต่อเรื้อรัง'. Omitted from lesson K-001 until a nutritionist confirms.
- p56 (first foods): the table shows three foods on days 1–2, while คำแนะนำ 1 on the same page says one food at a time, 2–3 days apart. Both shown as printed in GROW-005.
- p66 (toothpaste): "เท่าเมล็ดข้าวโพด" is printed for both the under-3 and 3–<6 groups. Dentist to confirm the amount for under-3s.
- p27 (exercise): minutes have no "per session/per day"; week 12 falls between trimester 1 (<12) and 2 (13–26).
- p28 (milk storage): "ละลายในช่องธรรมดา" is undefined; the ice-box row gives "15" °C with no "ไม่เกิน".
- p14 says "ครบ 5 หมู่" while p22 says "6 กลุ่ม". p28 misspells "ผูกพันธ์" (app writes ผูกพัน).
- p4 (Parenting School): a stray overlaid text layer labels Volumes 2–3 as "13-17 สัปดาห์", conflicting with the table's 13–27.
- p56–57 (7–11 months): the 10–11-month cell says "ไข่ทั้งฟอง สลับกับ ตับ" while note 6 says whole egg at least half a day.
- p58: the 12–23-month flag shows milk 2 glasses, but the bubble says plain milk 2 glasses only if growth is below standard.
- p29 vs p59: 1–2 years = 11–14 h (p29) but 2–5 years = 10–13 h (p59), so a 2-year-old fits both; p29 has no 2–3-year row.
- p31: a child of exactly 2 is covered by neither car-seat label (<2 / >2); "ตามลำพัง" (motorcycle, 2–6 years) undefined.
- p44: instructions say the horizontal axis is age, but the weight-for-height example uses height.
- QR codes in the handbook have not been decoded or checked yet.

## Open decisions

| # | Decision | Owner | Notes |
|---|---|---|---|
| 1 | ~~GitHub repository owner~~ **Decided 2026-11-09:** private repo on the developer's personal account, https://github.com/leonzhh0912/pmh-anc-learn | developer | To keep PMH independent: add at least one PMH staff member as a collaborator, and before handover either transfer the repo to a PMH organisation (GitHub keeps redirects) or give PMH a full clone |
| 2 | **Remotion licence** | PMH | Remotion is free only for individuals, non-profits and companies of ≤3 people. Government/public-sector bodies do **not** qualify without Remotion's written permission. If PMH owns and runs the video code, a Company License is needed ("Creators" ≈ US$25 per seat per month at time of checking; the v5 terms say they take effect with Remotion 5.0). Options: buy a seat, ask Remotion for written permission, or keep rendering with the developer as an independent creator delivering MP4s (check the terms first). Prototyping counts as evaluation. |
| 3 | ~~Permission from กรมอนามัย to adapt handbook content~~ **Approved** (reported by the developer, 2026-11-09): MOPH approved the adaptation and requested the project; the PMH hospital director approved the project | developer | File a copy of the written approval or letter (number and date) with PMH records, and note the reference here. Third-party artwork co-branded on some pages (UNICEF, สสส., WHO-based charts) is still recreated, not copied; see CURRICULUM.md §7 |
| 4 | ~~Production narration voice~~ **Decided 2026-11-09:** ElevenLabs only, `eleven_v3`, voice `MYZYcGOqrkYQcwDunXl7` | developer | Still needed per video: Thai-speaking PMH reviewer approves pronunciation. For handover, PMH needs its own ElevenLabs subscription with the same voice (docs/VOICE.md) |
| 5 | Staging hosting and access control | PMH IT | See DEPLOYMENT.md |
| 6 | Medical reviewers and their capacity per month | PMH | Sets the real pace of Phase 2 |
| 7 | ~~Local contacts and extra clinical detail for high-risk lessons~~ **Decided 2026-11-10 by the PMH director (in line with MOPH):** the app digitises the handbook and adds no information | developer | Where the handbook is silent (local phone numbers, routes, doses, products), the app is silent. Only numbers printed in the handbook (e.g. 1669) appear. CLAUDE.md rule 8. docs/PMH-INPUT-NEEDED.md withdrawn |

## Next steps checklist

**On-site (days 2–3)**
- [ ] Demo on staff phones over hospital Wi-Fi (`cd app && npm run dev`, open the LAN URL)
- [ ] Collect staff feedback (note it in this file)
- [ ] Get decisions 1–6 above, or at least named owners
- [ ] Identify medical and Thai-language reviewers. Review `MCH68-OVR-001` and `V-OVR-001` with them
- [x] ~~Ask for PMH-specific local info~~ not needed: book-only scope (decision 7)
- [ ] Get the Smart ANC presentation and record what it requires
- [x] Create private GitHub repo and push (leonzhh0912/pmh-anc-learn)
- [ ] Add a PMH staff collaborator; agree how and when the repo is transferred to PMH

**Remote (Phase 2), in release order — see CURRICULUM.md**
- [ ] R1 lessons (P1), each: lesson JSON → video script → narrate → render → review pack
- [ ] Replace draft narration with recorded or approved voice
- [ ] Real-device testing (low-end Android, iPhone); Lighthouse accessibility/performance audit
- [ ] Review recommendations ("review this again") from first-try quiz results
- [ ] Printable one-page summary per lesson (optional download)
- [ ] Staging environment for reviewers
- [ ] Git-based CMS for staff edits once the content shape stabilises

## Session 2 — 2026-11-09 (remote/continuing)

### Done and verified
- **Voice research** for Google Chirp 3 HD, ElevenLabs and BOTNOI: docs/VOICE.md (prices, licensing,
  data handling, API limits, recommended voices).
- **Provider-neutral TTS** in the video pipeline (`video/scripts/tts/`): Google, ElevenLabs, BOTNOI and
  the macOS draft voice behind one interface. Keys only from git-ignored `video/.env.local`.
  Every clip is trimmed and loudness-normalised (verified −15.7 LUFS on the draft voice).
- **Voice test script** (`content/voice-tests/voice-test-th-v1.json`, 645 chars) and
  `npm run voice-samples` (dry-run cost estimate, side-by-side listening page). Baseline sample
  generated with the draft voice. Cloud samples not generated yet (no keys, no spend approved).
- **Safety guard:** `publish-to-app` refuses an MP4 whose length doesn't match the current narration timing,
  which would otherwise desync captions. V-OVR-001 was re-rendered (158.2 s) after silence trimming; MP4 and
  timing agree within 0.02 s.
- **Lesson K-001** "ธงโภชนาการ คืออะไร? อาหาร 6 กลุ่ม" (PDF p22) drafted with a new tappable nutrition-flag
  interaction and a 6-group sorting activity. A likely misprint on p22 is flagged (see Handbook issues).
- Dev server now watches `content/` (new lesson files appear without restarting).
- Tests: validate:content 0 errors; Playwright 14/14.

### Approvals recorded
- PMH hospital director approved the project; MOPH (กรมอนามัย) approved adapting the handbook and requested
  the project (reported by the developer, 2026-11-09). Written reference to be added.
- Still per item: clinical sign-off of each lesson/video (reviewer name + date) before it is marked APPROVED.

### Waiting on the user / PMH
- Provider choice for voice samples, and accounts/keys plus approval of any charge.

## Session 3 — 2026-11-09

### Done and verified
- **All 15 first-release (R1) lessons drafted**, each ending with an end-of-lesson quiz (4–5 questions:
  multiple choice, true/false and at least one everyday scenario; feedback on every option) followed by a
  summary and a family note. New: OVR-002, INFO-002, REC-002, ASSESS-003, K-002, K-004, K-006, K-007, K-008,
  CH-006, GROW-005, DEV-005, DENT-001. All DRAFT, no videos yet.
- Every lesson lists what was added beyond the handbook in `editorial.reviewNotes` for reviewers.
- Spot-checked against page images: p23 trimester-1 flag (all 12 values), p27 exercise minutes, p28 milk-storage
  table (all 7 rows), p56 first-foods table (cell spans included). All matched.
- The build now **requires** every lesson to end with a quiz of ≥3 questions (only a summary may follow).
- New Playwright walk-through test covers every lesson automatically (each step, every interactive, every
  quiz answer, no sideways scrolling at 360 px, no console errors). 44/44 tests pass.
- Fixed: timeline items with the same number in different stages opened/closed together. Sorting activity
  wording made generic, boxes laid out in two columns and scrolled into view on phones.
- Home screen suggests the next unfinished lesson in handbook order.
- PMH staff confirmed the ElevenLabs narration of V-OVR-001 sounds correct (reviewer name still to record).

### Next
- Clinical review of the 15 R1 lessons (reviewers per CONTENT_REVIEW.md); answer the HANDBOOK ISSUE notes.
- Videos for R1 lessons (ElevenLabs, ≈1,400 characters each).
- R2 lessons (high-risk: danger signs, first aid, vaccines) need PMH's local emergency contacts first.

## Session 4 — 2026-11-09 (videos, second and third release)

### Done and verified
- **39 lesson videos, one for every drafted lesson** (15 R1 + 13 R2 + 11 R3), narrated with the chosen
  ElevenLabs voice: 74.3 minutes in total. Every MP4 checked: decodes end to end, video length equals the narration/caption timing (±0.15 s),
  attached to its lesson as step 2, narration = ElevenLabs. Plain and captions-burned-in versions rendered.
- **13 R2 lessons drafted** (low/medium risk, no emergency contacts needed): INFO-001, ANC-001, REC-001, K-009,
  K-012, K-013, K-014, K-015, GROW-001, GROW-006, GROW-007, DEV-001, DEV-002.
- **11 R3 lessons drafted** (record explainers, development 13–78 months): INFO-003, ANC-003, CH-002, CH-003,
  CH-007, K-011, DEV-003, DEV-004, DENT-003, DENT-004, GROW-004. **39 of 58 lessons drafted; the other 19 are
  all high-risk and wait for PMH input** (docs/PMH-INPUT-NEEDED.md).
  Spot-checked against page images: p29 sleep table, p31 road/water safety, p58 child flag. All matched.
- Video template generalised (title chips, family-facing page labels, part prefix, hideNumbers), 44 original
  icons (reference: `npx remotion still IconSheet`), automatic video registration, script checker, batch runner
  with retries and per-request timeouts (survived a network outage mid-run without paying twice).
- Generated **docs/REVIEW-PACK.md** (per-lesson reviewer checklist and sign-off table) and
  **docs/PMH-INPUT-NEEDED.md** (49 questions blocking the 19 high-risk lessons).
- Authoring guides for future lessons and videos: docs/LESSON-AUTHORING-GUIDE.md, docs/VIDEO-SCRIPT-GUIDE.md.
- GitHub Actions CI added (validation, type-checks, video-script check, full Playwright suite on every PR).
- ElevenLabs usage so far ≈ 44,000 characters (all 39 video scripts = 42,830 characters, plus tests;
  ≈ US$3.48 of plan allowance).
- Fixed: two same-type steps in a row (e.g. two nutrition flags) shared component state and crashed; each step
  now gets its own state. Icons remapped where a stand-in icon could mislead (10 new icons: warning, motorcycle…).
- Render reliability: retries, 90 s TTS timeout, 50 % render concurrency and 120 s frame timeout (renders had
  timed out while the Mac was busy). Tests: 92/92 passing (39 lesson walk-throughs on phone and desktop).

### Next
- ~~PMH: answer docs/PMH-INPUT-NEEDED.md~~ withdrawn in session 5 (book-only scope).
- PMH reviewers: work through docs/REVIEW-PACK.md (39 lessons, 39 videos).
- Media is 244 MB in Git; move MP4s to Git LFS or a CDN before the library grows further.

## Session 5 — 2026-11-10 (book-only scope, high-risk lessons)

### Decided
- **Book-only scope** (PMH director, in line with MOPH): the app digitises the handbook and adds no information.
  No local phone numbers, routes, doses or products unless printed (e.g. 1669). CLAUDE.md rule 8; decision 7
  above. docs/PMH-INPUT-NEEDED.md withdrawn; the curriculum's local-information requests are kept only as history.

### Done and verified
- **All 58 lessons are now drafted** (DRAFT, awaiting clinical sign-off). The 19 high-risk lessons were written from
  the handbook alone: ANC-002, REC-003, REC-004, ASSESS-001, ASSESS-002, K-003, K-005, K-010, K-016, K-017,
  K-018, K-019, CH-001, CH-004, CH-005, GROW-002, GROW-003, GROW-008, DENT-002.
  - Danger signs verbatim, in printed count and order, with the printed action. Quizzes test recall only: no
    question or feedback says a symptom can wait or is normal.
  - Screening tools (ST-5, 2Q plus, EPDS): no items, scores or cut-offs and no self-scoring; the lessons explain
    what the pages are for.
  - No doses or products (iron, iodine, folic acid, child iron syrup, antipyretics): none are printed.
  - First aid and CPR: steps in printed order, every number as printed, no technique drawings.
  - Stool colour: described as printed ("ซีด"), no swatches or colour names (none are printed).
  - Unreadable text on p45 (two rows printed on top of each other) is left out and flagged.
- **Independent fact-check** of every new lesson and script against the 2nd-printing page images (a second agent
  per batch, without the author's notes). All numbers, ages, windows, ratios and correct answers matched; wording
  problems it found were fixed (an unprinted stool-colour sentence removed, speak/caption mismatches aligned,
  unprinted inferences removed or listed in reviewNotes, the reduced-fetal-movement quiz now quotes both p13 and p24).
- **19 videos** narrated with the ElevenLabs voice (17,681 characters ≈ US$1.4 of plan allowance) and attached.

### Handbook issues found in this round (also in each lesson's reviewNotes)
- p15 vs p26: fewer than 3 movements/hour → "แนะนำให้พบแพทย์" (p15) but reduced movements are under
  "ต้องมาโรงพยาบาลทันที" (p26). Both are quoted with their page.
- p45: the meanings of the "ตามเกณฑ์" and "น้อย" rows (weight-for-age) are overprinted and unreadable.
- p46–47: chart footnote truncated ("ข้อม :"). p39: "Lived attenuated"; stray ")" in the COVID-19 box (p40).
- p7: "ap หรือ aP"; Tdap defined as "ไร้เซลล์แบบ cellular"; footnote 2 says influenza timing is being adjusted.
- p32: heel of hand for infant chest thrusts (choking) vs 2 fingers (CPR) on the same page; exactly-1-year-olds
  not covered; age scope of "ห้าม!! … ใช้นิ้วล้วง" not stated.
- p33 vs p35: "ไข้ ซึม" as one sign vs fever alone under 1 month → doctor "ทันที".
- p66: "เท่าเมล็ดข้าวโพด" for both under-3 and 3–6; p66 1,500 ppm for 6+ vs p64 "under dental advice".
- p67 says "วิตามินเสริม (เหล็ก/โฟลิก)" without iodine; p23–25 say iron, iodine and folic acid.

### Next
- PMH reviewers: docs/REVIEW-PACK.md now covers all 58 lessons and videos.
- Media size keeps growing (58 videos); move MP4s to Git LFS or a CDN.

## Session 6 — 2026-11-10 (release readiness and hosting)

- The director reports that the PMH reviewer has reviewed and signed off all content. The sign-off is not yet
  recorded in the repository: by rule, only the reviewer or content owner records it.
- **`npm run record-approval`** (app/scripts/record-approval.ts): records reviewer, date and written-approval
  reference for chosen lessons and their videos (APPROVED, version 1.0.0, history entry), validates, and with
  `--commit` commits with a message naming the reviewer. Tested: after a trial run, `validate --production`
  passed for all 58 lessons and 58 videos (trial reverted).
- **Hosting: GitHub Pages** via `.github/workflows/deploy.yml`, production build only, so nothing is published
  before approval is recorded. Tested a sub-path build (`/pmh-anc-learn/`) with a Pages-like server: deep links
  (404.html fallback), video with Thai captions, staff page, service worker and offline deep links on a phone.
- **Smaller first download**: patients' build no longer contains review notes, history, objectives or reviewer
  names (content/ files unchanged); the staff coverage page loads on demand. Main JS 345 KB → 224 KB gzipped.
- Checks: validate 0 errors, tsc (app, video), oxlint clean, check-scripts 58 ok, e2e 130 passed.

### To go live
1. Repo owner: Settings → Pages → Source: GitHub Actions (private repo needs a paid plan, or make it public).
2. Reviewer: `npm run record-approval -- --reviewer … --date … --ref … --all --commit`, then push to main.
3. Publish workflow deploys; tag the release `v1.0.0` (DEPLOYMENT.md).
