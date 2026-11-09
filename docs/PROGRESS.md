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
- QR codes in the handbook have not been decoded or checked yet.

## Open decisions

| # | Decision | Owner | Notes |
|---|---|---|---|
| 1 | ~~GitHub repository owner~~ **Decided 2026-11-09:** private repo on the developer's personal account, https://github.com/leonzhh0912/pmh-anc-learn | developer | To keep PMH independent: add at least one PMH staff member as a collaborator, and before handover either transfer the repo to a PMH organisation (GitHub keeps redirects) or give PMH a full clone |
| 2 | **Remotion licence** | PMH | Remotion is free only for individuals, non-profits and companies of ≤3 people. Government/public-sector bodies do **not** qualify without Remotion's written permission. If PMH owns and runs the video code, a Company License is needed ("Creators" ≈ US$25 per seat per month at time of checking; the v5 terms say they take effect with Remotion 5.0). Options: buy a seat, ask Remotion for written permission, or keep rendering with the developer as an independent creator delivering MP4s (check the terms first). Prototyping counts as evaluation. |
| 3 | Permission from กรมอนามัย to adapt handbook content | PMH | Back cover: "สงวนลิขสิทธิ์โดยกรมอนามัย ห้ามคัดลอก ดัดแปลง พิมพ์ซ้ำ… เพื่อการค้าโดยเด็ดขาด". Non-commercial hospital education appears compatible, but a written OK is recommended before publishing, especially if any handbook illustration is reused (currently none). |
| 4 | Production narration voice | PMH | macOS "Kanya" is draft-only: Apple's licence limits system voices to personal, non-commercial use. Options: (a) record PMH staff voices — free, most trusted, pipeline already supports it; (b) a paid cloud Thai TTS (Google Cloud or Azure, priced per character, roughly a few US$ per 100 lessons; get a current quote and approval before use). |
| 5 | Staging hosting and access control | PMH IT | See DEPLOYMENT.md |
| 6 | Medical reviewers and their capacity per month | PMH | Sets the real pace of Phase 2 |

## Next steps checklist

**On-site (days 2–3)**
- [ ] Demo on staff phones over hospital Wi-Fi (`cd app && npm run dev`, open the LAN URL)
- [ ] Collect staff feedback (note it in this file)
- [ ] Get decisions 1–6 above, or at least named owners
- [ ] Identify medical and Thai-language reviewers. Review `MCH68-OVR-001` and `V-OVR-001` with them
- [ ] Ask for PMH-specific local info: where to go for danger signs, phone numbers, ANC schedule, Parenting School times
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
