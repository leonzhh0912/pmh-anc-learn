# PMH Smart ANC Learn — Curriculum-to-Lesson Map

Machine-readable version: [`content/curriculum.json`](content/curriculum.json) (one object per lesson). This document is generated from the same data. If the two disagree, `curriculum.json` is correct.

**Scope rule.** The only syllabus is the official handbook named below. No topic from outside the handbook is added, and no medical content is invented. The app digitises the handbook to make it easier to learn and adds no information (decision of the PMH director, in line with MOPH, 2026-11-10). Where the handbook is silent (local phone numbers, where to go, clinic days, doses, products), the app is silent too; only numbers printed in the handbook (e.g. 1669) appear. Families are never taught to self-score the clinical screening tools.

**At a glance:** {{TOTAL}} lessons · risk: {{RISK}} · priority: {{PRI}} · release: {{REL}} · content type: {{TYPE}}.

---

## 1. Source identification

| Item | Value |
|---|---|
| Title | **สมุดบันทึกสุขภาพแม่และเด็ก ฉบับปรับปรุงใหม่ พ.ศ. 2568** (Maternal and Child Health Handbook, revised 2025 edition) |
| Publisher | กรมอนามัย กระทรวงสาธารณสุข (Department of Health, Ministry of Public Health, Thailand) |
| Printing | พิมพ์ครั้งที่ 2 : เมษายน 2569 จำนวน 480,000 เล่ม (2nd printing, April 2569 / 2026) — back cover, PDF p68 |
| Printer | ศูนย์สื่อและสิ่งพิมพ์แก้วเจ้าจอม มหาวิทยาลัยราชภัฏสวนสุนันทา |
| Landing page | https://multimedia.anamai.moph.go.th/ebooks/maternal-and-child-health-handbook-2568/ |
| PDF | https://multimedia.anamai.moph.go.th/oawoocha/2025/07/Maternal-and-Child-Health-Handbook-2568.pdf |
| PDF retrieved | 2026-11-09 (Last-Modified header: Tue, 16 Jun 2026 04:23:06 GMT) |
| SHA-256 | `174f424c57c150434da234f87003a28dae0fe25463523ffecf4a8ba983d9e0c5` |
| Length | 68 PDF pages |
| Working extraction | `handbook/extraction/pages-01-24.md`, `pages-25-46.md`, `pages-47-68.md` (verbatim, page by page) |

**Page numbering rule.** For PDF pages 3–66, printed page = PDF page − 2 (PDF p3 = printed 1 … PDF p66 = printed 64). PDF p1–2 (front cover and inside cover) and p67–68 (summary infographic and back cover) have no printed number. In this document "p" means the PDF page unless it says "printed".

**Copyright notice (PDF p68, verbatim):**

> แจกฟรี ห้ามจำหน่าย
>
> สงวนลิขสิทธิ์โดยกรมอนามัย ห้ามคัดลอก ดัดแปลง พิมพ์ซ้ำทั้งหมดหรือส่วนหนึ่งส่วนใดเพื่อการค้าโดยเด็ดขาด
>
> จัดพิมพ์โดย: กรมอนามัย กระทรวงสาธารณสุข
>
> ปีที่พิมพ์: พิมพ์ครั้งที่ 2 : เมษายน 2569 จำนวน 480,000 เล่ม

**Superseded file — do not use.** An older PDF of the same title exists. It is the 1st printing (กรกฎาคม 2568, 530,000 copies; PDF created 2025-06-23; SHA-256 `5f5cc4f7b131aa6ed4b321574f960ba7ef1b937eade057077acfb967276ab957`). It differs on many pages (see §5): it has a contents page at p67, and the "คุณลักษณะที่พึงประสงค์สำหรับคุณแม่" list sits on p4 instead of the parenting-school page. It must not be used as a source for any lesson, script or quiz. Copies held by staff or families may be either printing, so lessons should cite printed page numbers of the **2nd printing** only.

---

## 2. Table of contents of the handbook

Section tabs follow `content/sections.json`. Page types: **EDUCATIONAL** (teaching content for families), **RECORD-FORM** (a form or chart to be filled in), **STAFF-ONLY** (clinical tool completed by health staff), **MIXED** (form plus teaching content), **COVER/ADMIN** (covers). "♡" pages are the ones the handbook says parents can study and fill in themselves.

{{TOC}}

---

## 3. Page coverage (every PDF page 1–68)

Lesson IDs are shown without the `MCH68-` prefix. A page can feed several lessons. The notes column says which parts of a page are deliberately **not** turned into lesson content and why.

{{COVERAGE}}

**Pages with no lesson at all:** PDF p68 only — record form – no lesson (back cover with distribution, copyright and printing data; it is the source citation, not teaching content).
**Record-form parts with no lesson** (covered only by an explainer, or not at all): the keepsake photo/message area on p34, the blank appointment table on p41, all plotting grids p46–55 (explained by GROW-004), the staff screening/scoring tools on p8–9, p10 (OGTT/GCT table), p18–19 (ST-5, 2Q plus, EPDS), p36, p42–43, p64–65.

---

## 4. Lesson map by section

Columns: ID · Thai title / English · PDF and printed pages · content type · objectives (Thai, from page content only) · interactivity · video treatment · clinical risk · priority / release (status). Review requirements and planning notes for each lesson are in `curriculum.json` and summarised in §6.

{{LESSONS}}

---

## 5. Changes vs the 1st printing

All differences flagged in the extraction files. The 1st printing must not be used. These items show why any older material (slides, handouts, earlier scripts) must be re-checked against the 2nd printing.

| PDF p (printed) | Change in the 2nd printing | Affects |
|---|---|---|
| p4 (2) | Page is now **โรงเรียนพ่อแม่ : Parenting School** (7-session log). It replaces the 1st printing's "คุณลักษณะที่พึงประสงค์สำหรับคุณแม่" 15-point list, which now appears as an infographic on p67. | INFO-002, OVR-001 |
| p12 (10) | Nipple check now has two categories only (normal / retracted nipple). The 1st printing's three nipple-type drawings were removed. | REC-001 |
| p15 (13) | Fetal-movement counting starts at **28 weeks** (1st printing: 32 weeks). | REC-003 |
| p26 (24) | The 9 eating rules became an icon infographic with the สำนักโภชนาการ logo. Some example lists were dropped (processed-fruit examples, high-fat/high-sodium food examples, brown-rice emphasis). Each danger sign now has a medical icon. | K-004, K-005 |
| p27 (25) | Redesigned. Trimester-3 aerobic exercise is now **10-15 นาที** (was 10-20). Trimester-2 weight training gains examples "เช่น ยกน้ำหนัก ยางยืด". A pictorial "ข้อควรระวัง" box was added. The long paragraph on sex in pregnancy became one line. "อย่างน้อย" is not printed before "150 นาที/สัปดาห์". | K-006 |
| p30 (28) | Screen time for children 2 years and over adds "และไม่เกิน 2 ครั้ง/วัน (มีผู้ดูแล)". The brain-development intro and "(หรือนานกว่า)" were removed. Injury prevention is now 6 cards; "ยึดเฟอร์นิเจอร์ให้มั่นคง" replaces longer text about TVs, fridges and shelves. | K-012, K-013 |
| p31 (29) | New: "เด็กอายุ 2-6 ปี ไม่แนะนำให้โดยสารหลังผู้ขับขี่ตามลำพัง". Removed: helmet line for children over 2, the rear-seat/airbag rationale, and "barrier gap ≤6 cm". Car-seat wording is now "หันหน้าเข้าหาเบาะ". | K-014, K-015 |
| p32 (30) | Choking, child over 1 year: **5 back blows alternating with 5 abdominal thrusts** (1st printing: abdominal thrusts only). The "responsive" branch now also leads to the over-1-year box. CPR adds depth "1/3 ของความหนาทรวงอก" and full chest recoil. | K-016, K-017 |
| p33 (31) | Febrile-seizure first aid is now 6 numbered icon steps. The rationale about choking on objects was removed. | K-018 |
| p34 (32) | "9 ย่างเพื่อสร้างลูก" service is now via **Line OA หมอพร้อม** and the หมอพร้อม app (1st printing: Line @9yangth). Scope now includes pregnant women. | OVR-002 |
| p36 (34) | Metabolic screening is now **"ตรวจ IEM 40 โรค"** (was ตรวจ PKU). The jaundice block adds DOL fields, "(เกณฑ์ < )" boxes and a treatment column (Phototherapy / Exchange transfusion). | CH-002 |
| p37 (35) | Adds a "หมู่เลือด" field. | CH-003 |
| p38 (36) | Hepatitis B abbreviation is now "(HB)" and the combination is "DTP - HB - Hib" (was HBV). | CH-004 |
| p39 (37) | Re-organised: PCV and influenza open the page. PCV now reads "ฉีด 2+1 ที่ 2, 4 เดือน และกระตุ้นที่ 12-15 เดือน" with a footnote on an extra 6-month dose for at-risk children. Hepatitis A lists only the killed vaccine; the live 1-dose line was removed. | CH-004, CH-005 |
| p40 (38) | Vaccine advice uses pictogram bullets instead of numbers; the text is unchanged. | CH-006 |
| p45 (43) | Head-circumference referral is now "แนวโน้มเริ่มสูงกว่าเส้น 85th หรือเริ่มต่ำกว่าเส้น 15th" (was > P90 or < P10). | GROW-003 |
| p66 (64) | Toothpaste amount for first tooth to under 3 years: **"เท่าเมล็ดข้าวโพด"** (was "เท่าเมล็ดข้าวสาร"). | DENT-002 |
| p67 (—) | New summary infographic "คุณลักษณะที่พึงประสงค์สำหรับคุณแม่ เพื่อลูกสุขภาพดี" (15 steps in 3 stages). In the 1st printing p67 was a contents page. | OVR-001 |
| p68 (—) | Back cover: พิมพ์ครั้งที่ 2 เมษายน 2569, 480,000 copies (was พิมพ์ครั้งที่ 1 กรกฎาคม 2568, 530,000 copies). | Source citation |

No changes were flagged for p47–p65 apart from those listed. The extraction for p1–p24 flags only p4, p12 and p15.

**Open item for the pilot lesson:** the draft video script `content/video-scripts/V-OVR-001.json` says that items 6 and 8 follow "the fuller text list in the 1st printing (July 2568, p4)". This conflicts with the source rule. The script must be re-aligned to the p67 wording of the 2nd printing before review.

---

## 6. Clinical review notes

### 6a. Local instructions: not added (decided 2026-11-10)

An earlier plan asked PMH to supply local details the handbook does not print (emergency routes and numbers,
clinic days, which vaccines or tablets PMH uses, doses, crisis lines, plain-language test purposes). The PMH
director decided the app adds no information, so none of these are added. Danger-sign lessons say "go to
hospital" exactly as the handbook does. The `pmhClarificationNeeded` lists in `curriculum.json` are kept as
planning history; only their handbook problems (typos, contradictions, unclear text) still need a reviewer.

### 6b. Handbook ambiguities and internal inconsistencies (clinical review needed)

1. **Trimester boundaries differ:** p23–25 use < 12 / 13–27 / 28–40 weeks; p27 uses < 12 / 13–26 / 27–40 weeks (K-002, K-006).
2. **p8 anaemia threshold unit** is printed "Hb < 11 mg/dL" (staff tool; not reproduced).
3. **p19 EPDS item 10**: the score-3 label is printed "ค่อนข้างน้อย", which reads oddly for the highest score (staff tool; check against the official Thai EPDS).
4. **p7 influenza footnote**: timing of influenza vaccination in pregnancy is "being adjusted" by NHSO. PMH must confirm current practice before ANC-002 is released.
5. **p16–17 Vallop curve**: zone boundaries are not printed as numbers, and the "²" after "Vallop curve" has no footnote. Source data are needed before any digital chart (REC-004).
6. **p27 exercise**: contraindications ("ข้อห้าม") and the "อาการผิดปกติ" that mean stop are not listed. "อย่างน้อย" is not printed before 150 minutes.
7. **p29 sleep**: "ไม่จำเป็นต้องกินนมในตอนกลางคืนแล้ว" after 6 months, and p64's caries-risk item "ดื่มนมมื้อดึก", need to be reconciled with breastfeeding on demand (K-009, DENT-003). The handbook has no safe-sleep position guidance (only "ที่นอนไม่นิ่มจนยุบ", p31).
8. **p32 CPR ratios** (30:2 single rescuer, 15:2 with helper; rate 120/min; depth 1/3): confirm against current Thai lay-rescuer guidance.
9. **p39** JE line spelled "Lived attenuated"; COVID-19 inset has a stray ")" and may be out of date. PCV and influenza appear at the top of the EPI-style page, before the optional box; confirm their national status.
10. **p42–43** well-child screening schedule exists only as cell shading, with no printed rule (Hct 9 m and 4 y; vision from 9 m; hearing birth–6 m; developmental screening 9 m, 1 y 6 m, 2 y 6 m, 3 y 6 m, 5 y; autism screening 1 y 6 m, 2 y, 2 y 6 m; oral exam from 9 m; iron from 6 m).
11. **p45** shows overlapping text from a hidden text layer in the weight-for-age "ตามเกณฑ์" and "น้อย" rows. The extraction reads "การเจริญเติบโตดี ควรคงน้ำหนักอยู่ในระดับนี้" and "ขาดอาหาร", but this must be checked against a physical 2nd-printing copy. Section 4 (weight-for-height) prints no SD cut-offs.
12. **p46–47** footnote truncated ("ข้อม"); **p51, p54, p55** have no source footnote; **p49, p53** titles say "ติดตามน้ำหนักของลูก" on height charts.
13. **p64** typo "รบการรักษา"; the note that 1,400–1,500 ppm toothpaste should be used under dental advice "หากฟลูออไรด์ในน้ำดื่มน้อยกว่า 0.5 ppm" needs the local water-fluoride level. **p66** gives "เท่าเมล็ดข้าวโพด" for both the < 3 and the 3–6 age groups; dentist to confirm.
14. **p61–62** some DSPM speech bubbles were unreadable in the extraction ([อ่านไม่ออก]); the item text itself was read.
15. **p4** hidden text layer labels manual Volumes 2 and 3 both "อายุครรภ์ 13-17 สัปดาห์" (artefact; the visible page is used).
16. **p67** hidden text layer still contains the old "@9yangth" Line ID; it is not visible and must not be used.

---

## 7. Content needing permission before reuse

The copyright notice forbids copying, adapting or reprinting any part "เพื่อการค้า" (for commercial purposes). PMH Smart ANC Learn is non-commercial.

**Status (2026-11-09): MOPH (กรมอนามัย) has approved adapting the handbook for this project and requested it; the PMH hospital director has approved the project** (reported by the developer; file the written reference in docs/PROGRESS.md). Some artwork in the handbook is co-branded with or sourced from third parties (UNICEF, สสส., WHO-based charts, partner institutions), so the project keeps recreating visuals rather than copying them, and the items below should be checked with MOPH if any original artwork is to be reused.

**Illustrations and graphics**
- Cartoon family and character artwork used throughout (cover p1, section mascots, pregnant-woman figures, p67 infographic figures).
- Food-guide flags and food photographs (p22–25, p58–59), co-branded กรมอนามัย สำนักโภชนาการ and **UNICEF**.
- UNICEF breast-milk vs formula comparison graphic (p28).
- Infant stool-colour photographs (p29). Do not copy; use a validated colour card.
- First-aid drawings for choking and CPR (p32) and seizure icons (p33). Any redraw needs expert review of hand and body positions.
- Physical-activity infographic (p27), co-branded กรมอนามัย, สสส., TPAK and two institutions.
- Vallop curve weight-gain charts (p16–17).
- WHO 2006 growth standards as adapted by สำนักโภชนาการ (p46–55): permission plus exact source data for any digital chart.
- DSPM pictograms and the DSPM / DAIM manual covers (p60–63).
- Dental diagrams: primary-tooth arch, Mombelli plaque-index drawing (p65), toothbrush photographs (p66); p64 risk table cites ทันตแพทยสมาคมแห่งประเทศไทย.
- Logos: กระทรวงสาธารณสุข, กรมอนามัย, สปสช., หมอพร้อม, "๙ย่าง เพื่อสร้างลูก", Smart Hybrid Parenting School, UNICEF, สสส., TPAK. Do not use logos in a way that suggests the app is an official product of these bodies.

**Long passages and tables** (reproduce only with permission; otherwise paraphrase and cite)
- Portion tables (p23–25, p56–59), breast-milk storage table (p28), DSPM item lists (p60–63), vaccine schedules (p7, p38–40; source credited to กองโรคติดต่อทั่วไป กรมควบคุมโรค), growth-chart interpretation tables (p45).
- **Validated screening instruments: ST-5 and 2Q plus (กรมสุขภาพจิต) and the Thai EPDS (p18–19).** These must not be reproduced in the app at all without permission. Even with permission, policy is that families do not self-score them in the app.

**QR-linked external resources** (QR targets were not decoded during extraction; verify each target and its licence, and link out rather than embed)
- p1: MOPH QR (no caption) · p2: introductory video on using the handbook + feedback form.
- p4: คู่มือโรงเรียนพ่อแม่ (9 volumes).
- p9: details of each risk group.
- p16: คำแนะนำโภชนาการหญิงตั้งครรภ์.
- p23–25: ตัวอย่างทัพพีของผัก; ตัวอย่างส่วนของผลไม้; ธงโภชนาการสำหรับหญิงตั้งครรภ์ ไตรมาสที่ 1-3 และหญิงให้นมบุตร 6 เดือนแรก; อาหารแลกเปลี่ยนตามธงโภชนาการ.
- p27: กิจกรรมทางกายสำหรับหญิงตั้งครรภ์และหลังคลอด.
- p33 "รวมคลังความรู้": คู่มือช่วยตัดสินใจเลือกวิธีคลอด; อุบัติเหตุในหญิงตั้งครรภ์; โรคที่ถ่ายทอดทางพันธุกรรม เช่น ดาวน์ซินโดรม ธาลัสซีเมีย; คู่มือทันตกรรมในเด็ก; พัฒนาการเด็กที่ต้องเฝ้าระวัง; การเลี้ยงดูลูกเชิงบวก.
- p34: Line OA หมอพร้อม "9 ย่างเพื่อสร้างลูก" registration.
- p56: ดูตัวอย่างอาหารทารกเพิ่มเติม · p58–59: food flags and exchange lists for children.
- p63: คู่มือ DSPM; คลิปวิดีโอแสดงวิธีการประเมิน; รู้ใจวัยจิ๋ว; คู่มือ DAIM.

---

## 8. Proposed releases

Releases are ordered by readiness and risk, not by date. Every lesson, whatever its release, needs the named reviewer sign-off in `curriculum.json` before publication.

### R1 — core, low-to-medium-risk lessons for pregnancy and the newborn period ({{R1N}} lessons)

**Rationale.** These lessons give the widest benefit for women attending PMH ANC and early postnatal care. They contain no danger-sign triage, first aid, screening cut-offs or vaccine schedules, so one reviewer per discipline can sign them off quickly. They also do not depend on local emergency instructions. INFO-002 is included so that the app can be introduced at parenting-school sessions, its natural delivery channel. OVR-001 is the pilot and is already drafted.

{{R1}}

### R2 — high-risk safety lessons and the rest of the core ({{R2N}} lessons)

**Rationale.** These lessons hold danger signs, first aid and CPR, vaccine windows, supplement and medicine schedules, mental-health awareness with suicide-risk safe messaging, and the remaining infant feeding, growth and development content. Each one needs (a) named clinical sign-off on every threshold and step, and (b) the PMH-specific instructions in §6a, above all emergency contact routes, before release. First-aid lessons should go live together with an offer of hands-on practice.

{{R2}}

### R3 — record explainers, staff-only awareness and later-childhood detail ({{R3N}} lessons)

**Rationale.** These lessons explain record pages and staff tools ("why the nurse does this"), or cover older-child detail. They matter less for early use, and several depend on unresolved items: the shading-derived well-child schedule (p42–43), chart redraw permissions (p46–55), and plain-language test purposes that PMH has to write.

{{R3}}
