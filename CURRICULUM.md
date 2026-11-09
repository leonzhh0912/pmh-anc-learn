# PMH Smart ANC Learn — Curriculum-to-Lesson Map

Machine-readable version: [`content/curriculum.json`](content/curriculum.json) (one object per lesson). This document is generated from the same data. If the two disagree, `curriculum.json` is correct.

**Scope rule.** The only syllabus is the official handbook named below. No topic from outside the handbook is added, and no medical content is invented. Where a lesson needs local instructions (phone numbers, where to go, clinic days) or plain-language wording that the handbook does not print, it is listed under *PMH clarification* and must be written and approved by Phimai Hospital (PMH). Families are never taught to self-score the clinical screening tools.

**At a glance:** 58 lessons · risk: 16 low, 23 medium, 19 high · priority: 14 P1, 31 P2, 13 P3 · release: 15 R1, 30 R2, 13 R3 · content type: 44 educational, 9 record-explainer, 5 staff-only-awareness.

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

**Front matter (no section tab)**

| PDF p | Printed p | Page title | Page type |
|---|---|---|---|
| 1 | — | สมุดบันทึกสุขภาพแม่และเด็ก (ปกหน้า) | COVER/ADMIN |
| 2 | — | ภาพแรกของหนู (ภาพอัลตราซาวนด์); คำแนะนำสมุดบันทึกสุขภาพแม่และเด็ก | MIXED |

**ข้อมูลแม่และเด็ก (`info`)**

| PDF p | Printed p | Page title | Page type |
|---|---|---|---|
| 3 | 1 | ข้อมูลครอบครัว | RECORD-FORM |
| 4 | 2 | โรงเรียนพ่อแม่ : Parenting School | RECORD-FORM |
| 5 | 3 | ประวัติสุขภาพของหญิงตั้งครรภ์และครอบครัว | RECORD-FORM |

**ข้อมูลฝากครรภ์ (`anc`)**

| PDF p | Printed p | Page title | Page type |
|---|---|---|---|
| 6 | 4 | ประวัติการตั้งครรภ์ปัจจุบัน; รายงานการตรวจเลือด; การตรวจภาวะดาวน์ซินโดรม | RECORD-FORM |
| 7 | 5 | ประวัติวัคซีนหญิงตั้งครรภ์ | RECORD-FORM (with clinical footnotes) |
| 8 | 6 | ประเมินความเสี่ยงของหญิงตั้งครรภ์ ฝากครรภ์ ครั้งที่ 1 | STAFF-ONLY |
| 9 | 7 | ติดตามความเสี่ยงของหญิงตั้งครรภ์เมื่อมาฝากครรภ์; ประเมินความเสี่ยงของหญิงตั้งครรภ์เพื่อพิจารณาสถานที่ฝากครรภ์ | STAFF-ONLY |

**บันทึกการตรวจครรภ์ (`record`)**

| PDF p | Printed p | Page title | Page type |
|---|---|---|---|
| 10 | 8 | บันทึกการตรวจครรภ์ 1/2; การคัดกรองเบาหวาน | RECORD-FORM |
| 11 | 9 | วันกำหนดคลอด (EDC); ผลการตรวจอัลตราซาวนด์ | RECORD-FORM |
| 12 | 10 | บันทึกการตรวจครรภ์ 2/2; การตรวจหัวนม | RECORD-FORM |
| 13 | 11 | ความผิดปกติที่พบระหว่างฝากครรภ์/ความเสี่ยงที่พบ; หมายเหตุ | RECORD-FORM |
| 14 | 12 | การตรวจสุขภาพช่องปาก; การดูแลฟันแม่ | MIXED |
| 15 | 13 | การนับลูกดิ้น | MIXED |
| 16 | 14 | กราฟการเพิ่มขึ้นของน้ำหนักหญิงตั้งครรภ์ (Vallop curve) | MIXED |
| 17 | 15 | ตารางบันทึกการเพิ่มขึ้นของน้ำหนักขณะตั้งครรภ์ (+ กราฟ 3-4) | MIXED |

**แบบประเมินระหว่างตั้งครรภ์และหลังคลอด (`assess`)**

| PDF p | Printed p | Page title | Page type |
|---|---|---|---|
| 18 | 16 | แบบประเมินสุขภาพจิตหญิงตั้งครรภ์และหลังคลอด: ST-5; 2Q plus | STAFF-ONLY (♡ — self-report screening) |
| 19 | 17 | การประเมินการดื่มสุรา; แบบประเมินภาวะซึมเศร้าหลังคลอด (EPDS) | STAFF-ONLY (♡ — self-report screening) |
| 20 | 18 | การบันทึกผลการประเมินภาวะสุขภาพจิตและการดูแลช่วยเหลือ — บันทึกสำหรับหญิงตั้งครรภ์ | RECORD-FORM |
| 21 | 19 | บันทึกสุขภาพจิตมารดา หลังคลอด 4-6 สัปดาห์; หลังคลอดมากกว่า 6 สัปดาห์ | RECORD-FORM |

**ความรู้สู่การปฏิบัติเพื่อแม่ลูกสุขภาพดี (`knowledge`)**

| PDF p | Printed p | Page title | Page type |
|---|---|---|---|
| 22 | 20 | ธงโภชนาการ คืออะไร? | EDUCATIONAL |
| 23 | 21 | ธงโภชนาการหญิงตั้งครรภ์ ไตรมาสที่ 1 | EDUCATIONAL |
| 24 | 22 | ธงโภชนาการหญิงตั้งครรภ์ ไตรมาสที่ 2 | EDUCATIONAL |
| 25 | 23 | ธงโภชนาการหญิงตั้งครรภ์ ไตรมาสที่ 3 และหญิงให้นมบุตร 6 เดือนแรก | EDUCATIONAL |
| 26 | 24 | ข้อปฏิบัติการกินเพื่อสุขภาพที่ดี สำหรับหญิงตั้งครรภ์และหญิงให้นมบุตร; อาการผิดปกติที่แม่ท้อง ต้องมาโรงพยาบาลทันที | EDUCATIONAL |
| 27 | 25 | ข้อแนะนำกิจกรรมทางกาย สำหรับหญิงตั้งครรภ์และหญิงหลังคลอด | EDUCATIONAL |
| 28 | 26 | การเลี้ยงลูกด้วยนมแม่; 3 ดูด กระตุ้นนมแม่; สูตรนมแม่ต่อเนื่อง; การเก็บน้ำนมแม่ | EDUCATIONAL |
| 29 | 27 | ฝึกลูกเข้านอน; การขับถ่าย | EDUCATIONAL |
| 30 | 28 | สื่อหน้าจอกับพัฒนาการเด็ก; การป้องกันการบาดเจ็บในเด็ก | EDUCATIONAL |
| 31 | 29 | การป้องกันการบาดเจ็บทางจราจร; การป้องกันการจมน้ำ; การป้องกันการอุดกั้นทางเดินหายใจ | EDUCATIONAL |
| 32 | 30 | การช่วยเหลือเมื่อมีสิ่งแปลกปลอมหลุดเข้าทางเดินหายใจ; กู้ชีพโดยการกดหัวใจ | EDUCATIONAL |
| 33 | 31 | การปฐมพยาบาลเมื่อเด็กชัก; อาการที่ต้องพาทารกไปพบแพทย์; รวมคลังความรู้ในการดูแลแม่และเด็ก | EDUCATIONAL |

**ประวัติสุขภาพเด็กและบันทึกวัคซีน (`childhealth`)**

| PDF p | Printed p | Page title | Page type |
|---|---|---|---|
| 34 | 32 | ติดรูป / ข้อความจากคุณแม่คุณพ่อ....ถึงลูกน้อย; บริการ "9 ย่างเพื่อสร้างลูก" | RECORD-FORM (keepsake + service info) |
| 35 | 33 | บันทึกการคลอด; บันทึกการเยี่ยมหลังคลอด | STAFF-ONLY (with parent-relevant danger-sign list) |
| 36 | 34 | บันทึกทารกแรกเกิด | STAFF-ONLY |
| 37 | 35 | บันทึกสุขภาพเด็ก | RECORD-FORM |
| 38 | 36 | บันทึกการรับวัคซีน — วัคซีนตามแผนงานสร้างเสริมภูมิคุ้มกันโรค (EPI) | RECORD-FORM |
| 39 | 37 | บันทึกการรับวัคซีน (ต่อ); วัคซีนเสริมอื่นๆ (Optional vaccine) | RECORD-FORM |
| 40 | 38 | บันทึกการรับวัคซีน (ต่อ); คำแนะนำเกี่ยวกับการได้รับวัคซีน | MIXED |
| 41 | 39 | นัดหมายการรับวัคซีน | RECORD-FORM |
| 42 | 40 | บันทึกการตรวจสุขภาพเด็กปฐมวัย (ซ้าย) | STAFF-ONLY |
| 43 | 41 | บันทึกการตรวจสุขภาพเด็กปฐมวัย (ขวา) | STAFF-ONLY (one parent-assessed column) |

**การเจริญเติบโต + อาหารตามวัย (`growth`)**

| PDF p | Printed p | Page title | Page type |
|---|---|---|---|
| 44 | 42 | การใช้กราฟแสดงการเจริญเติบโต; คำแนะนำการลงข้อมูลในกราฟ | EDUCATIONAL |
| 45 | 43 | การแปลผลกราฟติดตามการเจริญเติบโตของเด็ก | EDUCATIONAL |
| 46 | 44 | กราฟเส้นรอบวงศีรษะสำหรับเด็กชาย | RECORD-FORM |
| 47 | 45 | กราฟเส้นรอบวงศีรษะสำหรับเด็กหญิง | RECORD-FORM |
| 48 | 46 | กราฟน้ำหนักตามเกณฑ์อายุ แรกเกิด - 5 ปี เพศชาย | RECORD-FORM |
| 49 | 47 | กราฟความยาว/ส่วนสูงตามเกณฑ์อายุ แรกเกิด - 5 ปี เพศชาย | RECORD-FORM |
| 50 | 48 | กราฟน้ำหนักตามเกณฑ์ความยาว แรกเกิด - 2 ปี เพศชาย | RECORD-FORM |
| 51 | 49 | กราฟน้ำหนักตามเกณฑ์ความยาว (ส่วนสูง) 2 ปีขึ้นไป เพศชาย | RECORD-FORM |
| 52 | 50 | กราฟน้ำหนักตามเกณฑ์อายุ แรกเกิด - 5 ปี เพศหญิง | RECORD-FORM |
| 53 | 51 | กราฟความยาว/ส่วนสูงตามเกณฑ์อายุ แรกเกิด - 5 ปี เพศหญิง | RECORD-FORM |
| 54 | 52 | กราฟน้ำหนักตามเกณฑ์ความยาว แรกเกิด - 2 ปี เพศหญิง | RECORD-FORM |
| 55 | 53 | กราฟน้ำหนักตามเกณฑ์ความยาว (ส่วนสูง) 2 ปีขึ้นไป เพศหญิง | RECORD-FORM |
| 56 | 54 | อาหารที่แนะนำใน 1 วัน สำหรับทารกแรกเกิด - 11 เดือน 29 วัน (1/2) | EDUCATIONAL |
| 57 | 55 | อาหารที่แนะนำใน 1 วัน สำหรับทารกแรกเกิด - 11 เดือน 29 วัน (2/2) | EDUCATIONAL |
| 58 | 56 | ธงโภชนาการ สำหรับเด็กอายุ 12 - 23 เดือน | EDUCATIONAL |
| 59 | 57 | ธงโภชนาการ สำหรับเด็กอายุ 2 - 5 ปี | EDUCATIONAL |

**พัฒนาการเด็ก (`dev`)**

| PDF p | Printed p | Page title | Page type |
|---|---|---|---|
| 60 | 58 | DSPM: แรกเกิด - 12 เดือน | RECORD-FORM (parent checklist) |
| 61 | 59 | DSPM: 13 - 41 เดือน | RECORD-FORM (parent checklist) |
| 62 | 60 | DSPM: 42 - 72 เดือน | RECORD-FORM (parent checklist) |
| 63 | 61 | DSPM: 73 - 78 เดือน; คู่มือ DSPM / DAIM | MIXED |

**บันทึกการตรวจฟัน (`dental`)**

| PDF p | Printed p | Page title | Page type |
|---|---|---|---|
| 64 | 62 | การประเมินความเสี่ยงต่อสุขภาพช่องปาก | STAFF-ONLY |
| 65 | 63 | บันทึกการตรวจฟันเด็ก โดยทันตบุคลากร | STAFF-ONLY |
| 66 | 64 | บันทึกการขึ้นและหลุดของฟันเด็ก โดยผู้ปกครอง; เฝ้าดูฟัน 6 ขวบปีแรก | MIXED |

**ภาพรวม 15 ข้อ เพื่อแม่ลูกสุขภาพดี (`overview`) — unnumbered page**

| PDF p | Printed p | Page title | Page type |
|---|---|---|---|
| 67 | — | คุณลักษณะที่พึงประสงค์สำหรับคุณแม่ เพื่อลูกสุขภาพดี | EDUCATIONAL |

**Back matter**

| PDF p | Printed p | Page title | Page type |
|---|---|---|---|
| 68 | — | ปกหลัง (ข้อมูลการพิมพ์และลิขสิทธิ์) | COVER/ADMIN |


---

## 3. Page coverage (every PDF page 1–68)

Lesson IDs are shown without the `MCH68-` prefix. A page can feed several lessons. The notes column says which parts of a page are deliberately **not** turned into lesson content and why.

| PDF p | Printed p | Type | Lesson ID(s) | Notes (parts with no lesson) |
|---|---|---|---|---|
| 1 | — | COVER/ADMIN | OVR-002 | Cover only; tab layout used in OVR-002 |
| 2 | — | MIXED | OVR-002 |  |
| 3 | 1 | RECORD-FORM | INFO-001 | Form itself is filled with staff; lesson explains it |
| 4 | 2 | RECORD-FORM | INFO-002 | Attendance log signed by staff; lesson explains schedule |
| 5 | 3 | RECORD-FORM | INFO-003 | History form filled with staff |
| 6 | 4 | RECORD-FORM | ANC-001 | Lab results recorded by staff; no result interpretation taught |
| 7 | 5 | RECORD-FORM (with clinical footnotes) | ANC-002 |  |
| 8 | 6 | STAFF-ONLY | ANC-003, ASSESS-003 | Staff checklist & colour codes NOT shown to families |
| 9 | 7 | STAFF-ONLY | ANC-003 | Staff grid NOT shown; only the 4-tier care-level idea |
| 10 | 8 | RECORD-FORM | REC-001 | OGTT/GCT cut-off table is staff-only — not taught |
| 11 | 9 | RECORD-FORM | REC-001 | Visit/ultrasound table filled by staff |
| 12 | 10 | RECORD-FORM | REC-001, K-007 |  |
| 13 | 11 | RECORD-FORM | REC-001 | Free-text record; only the travel tip is taught |
| 14 | 12 | MIXED | REC-002, DENT-001 |  |
| 15 | 13 | MIXED | REC-003, K-005 |  |
| 16 | 14 | MIXED | REC-004 | Vallop band boundaries need source data |
| 17 | 15 | MIXED | REC-004 |  |
| 18 | 16 | STAFF-ONLY (♡ — self-report screening) | ASSESS-001 | ST-5 / 2Q plus items and scoring NOT reproduced (no self-scoring) |
| 19 | 17 | STAFF-ONLY (♡ — self-report screening) | ASSESS-002, ASSESS-003 | EPDS items and scoring NOT reproduced (no self-scoring) |
| 20 | 18 | RECORD-FORM | ASSESS-001, ASSESS-003 | Result log filled by staff |
| 21 | 19 | RECORD-FORM | ASSESS-002 | Result log filled by staff |
| 22 | 20 | EDUCATIONAL | K-001, K-002, K-003 |  |
| 23 | 21 | EDUCATIONAL | K-002, K-003 |  |
| 24 | 22 | EDUCATIONAL | K-002, K-003 |  |
| 25 | 23 | EDUCATIONAL | K-002, K-003 |  |
| 26 | 24 | EDUCATIONAL | REC-003, ASSESS-003, K-004, K-005 |  |
| 27 | 25 | EDUCATIONAL | K-006 |  |
| 28 | 26 | EDUCATIONAL | K-007, K-008 |  |
| 29 | 27 | EDUCATIONAL | K-009, K-010, K-011 |  |
| 30 | 28 | EDUCATIONAL | K-012, K-013 |  |
| 31 | 29 | EDUCATIONAL | K-014, K-015 |  |
| 32 | 30 | EDUCATIONAL | K-016, K-017 |  |
| 33 | 31 | EDUCATIONAL | K-018, K-019, DEV-005 | 6 QR resources ('รวมคลังความรู้') — link-out list only, no lesson |
| 34 | 32 | RECORD-FORM (keepsake + service info) | OVR-002, DEV-005 | Keepsake photo/message page — record form, no lesson (personal keepsake); service text and tip used |
| 35 | 33 | STAFF-ONLY (with parent-relevant danger-sign list) | K-019, CH-001, DENT-001 | Delivery record (บันทึกการคลอด) is staff-only |
| 36 | 34 | STAFF-ONLY | CH-002 | Staff form; jaundice thresholds blank |
| 37 | 35 | RECORD-FORM | CH-003 |  |
| 38 | 36 | RECORD-FORM | CH-004, CH-006 |  |
| 39 | 37 | RECORD-FORM | CH-004, CH-005, CH-006 |  |
| 40 | 38 | MIXED | CH-005, CH-006 |  |
| 41 | 39 | RECORD-FORM | CH-006 | Appointment log — record form, no lesson (blank appointment table); only the margin tip is used |
| 42 | 40 | STAFF-ONLY | CH-007, GROW-008 | Staff-filled; schedule derived from shading |
| 43 | 41 | STAFF-ONLY (one parent-assessed column) | CH-007, GROW-008 | Staff-filled; schedule derived from shading |
| 44 | 42 | EDUCATIONAL | GROW-001, GROW-004 |  |
| 45 | 43 | EDUCATIONAL | GROW-002, GROW-003 |  |
| 46 | 44 | RECORD-FORM | GROW-003, GROW-004 | Plotting chart (record form) |
| 47 | 45 | RECORD-FORM | GROW-003, GROW-004 | Plotting chart (record form) |
| 48 | 46 | RECORD-FORM | GROW-004 | Plotting chart (record form) |
| 49 | 47 | RECORD-FORM | GROW-004 | Plotting chart (record form); title says 'น้ำหนัก' on a height chart |
| 50 | 48 | RECORD-FORM | GROW-004 | Plotting chart (record form) |
| 51 | 49 | RECORD-FORM | GROW-004 | Plotting chart (record form); no source footnote |
| 52 | 50 | RECORD-FORM | GROW-004 | Plotting chart (record form) |
| 53 | 51 | RECORD-FORM | GROW-004 | Plotting chart (record form); title says 'น้ำหนัก' on a height chart |
| 54 | 52 | RECORD-FORM | GROW-004 | Plotting chart (record form); no source footnote |
| 55 | 53 | RECORD-FORM | GROW-004 | Plotting chart (record form); no source footnote |
| 56 | 54 | EDUCATIONAL | K-007, GROW-005 |  |
| 57 | 55 | EDUCATIONAL | GROW-004, GROW-006, GROW-008 |  |
| 58 | 56 | EDUCATIONAL | K-009, GROW-007, GROW-008, DEV-005 |  |
| 59 | 57 | EDUCATIONAL | K-009, GROW-007, GROW-008, DEV-005 |  |
| 60 | 58 | RECORD-FORM (parent checklist) | DEV-001, DEV-002 |  |
| 61 | 59 | RECORD-FORM (parent checklist) | DEV-001, DEV-003 |  |
| 62 | 60 | RECORD-FORM (parent checklist) | DEV-001, DEV-004 |  |
| 63 | 61 | MIXED | DEV-001, DEV-004, DEV-005 | DSPM/DAIM manual covers & QR — link-out only |
| 64 | 62 | STAFF-ONLY | DENT-001, DENT-002, DENT-003 | Colour-band scoring and fluoride-varnish rules stay staff-only |
| 65 | 63 | STAFF-ONLY | DENT-004 | Dental charting and Mombelli plaque index are staff-only |
| 66 | 64 | MIXED | DENT-001, DENT-002, DENT-004 |  |
| 67 | — | EDUCATIONAL | OVR-001, K-003, DEV-005 |  |
| 68 | — | COVER/ADMIN | **none** | record form – no lesson (back cover: free-distribution and copyright notice, publisher and printing data; cited as the source in CURRICULUM.md) |

**Pages with no lesson at all:** PDF p68 only — record form – no lesson (back cover with distribution, copyright and printing data; it is the source citation, not teaching content).
**Record-form parts with no lesson** (covered only by an explainer, or not at all): the keepsake photo/message area on p34, the blank appointment table on p41, all plotting grids p46–55 (explained by GROW-004), the staff screening/scoring tools on p8–9, p10 (OGTT/GCT table), p18–19 (ST-5, 2Q plus, EPDS), p36, p42–43, p64–65.

---

## 4. Lesson map by section

Columns: ID · Thai title / English · PDF and printed pages · content type · objectives (Thai, from page content only) · interactivity · video treatment · clinical risk · priority / release (status). Review requirements and PMH clarifications for each lesson are in `curriculum.json` and summarised in §6.

### ภาพรวม 15 ข้อ เพื่อแม่ลูกสุขภาพดี (`overview`, PDF p67–67) — 2 lesson(s)

| ID | Thai title / English | Pages | Type | Objectives | Interactivity | Video | Risk | Priority / Release |
|---|---|---|---|---|---|---|---|---|
| MCH68-OVR-001 | **15 ข้อ เพื่อแม่ลูกสุขภาพดี**<br>15 steps for a healthy mother and baby | PDF 67<br>(printed —) | educational | 1. ผู้เรียนสามารถบอกการปฏิบัติตัว 3 ช่วง (ก่อนและเริ่มตั้งครรภ์ / ระหว่างตั้งครรภ์ / หลังคลอดและการดูแลลูก) ได้<br>2. ผู้เรียนสามารถบอกสิ่งที่ควรทำก่อนตั้งครรภ์ ได้แก่ รับประทานวิตามินเสริม (เหล็ก/โฟลิก) อย่างน้อย 3 เดือนก่อนตั้งครรภ์ และเว้นช่วงการมีบุตรแต่ละคนให้ห่างอย่างน้อย 2 ปี<br>3. ผู้เรียนสามารถบอกได้ว่าควรฝากครรภ์ทันที (ก่อน 12 สัปดาห์) พร้อมสามี และมาตามนัด<br>4. ผู้เรียนสามารถบอกเป้าหมายหลังคลอด: นมแม่อย่างเดียว 6 เดือน (ไม่ต้องให้น้ำ) เริ่มอาหารตามวัยเมื่อลูกครบ 6 เดือน และรับวัคซีนครบตามเกณฑ์ทั้งแม่และเด็ก | • sort-the-cards: drag the 15 step cards into the 3 life stages<br>• tap-to-reveal each step's icon with the exact p67 wording<br>• 3-question check: ANC before 12 weeks / exclusive breastfeeding 6 months without water / complementary food at 6 months | ~2-min animated summary of the 3 stages and 15 steps (draft V-OVR-001 rendered; macOS 'Kanya' synthetic voice is draft-only) | low | P1 / R1 (DRAFT) |
| MCH68-OVR-002 | **รู้จักสมุดบันทึกสุขภาพแม่และเด็ก**<br>Getting to know your MCH handbook | PDF 1, 2, 34<br>(printed 32) | educational | 1. ผู้เรียนสามารถบอกได้ว่าสมุดบันทึกสุขภาพแม่และเด็กเป็นเอกสารของครอบครัว ใช้บันทึกข้อมูลร่วมกับเจ้าหน้าที่สาธารณสุข ตั้งแต่ตั้งครรภ์จนเด็กอายุ 6 ปี<br>2. ผู้เรียนสามารถบอกได้ว่าต้องนำสมุดไปพบบุคลากรทางสาธารณสุขทุกครั้งที่เข้ารับการรักษาพยาบาล<br>3. ผู้เรียนสามารถอธิบายความหมายของหน้าที่มีเครื่องหมาย "♡" ว่าเป็นหน้าที่ผู้ปกครองศึกษาและบันทึกข้อมูลได้ด้วยตนเอง<br>4. ผู้เรียนสามารถหาหมวดทั้ง 9 แถบสีในสมุดได้ | • tab-finder game: a question appears (e.g. 'where are the vaccine records?') and the learner taps the matching coloured side tab<br>• spot-the-heart: swipe through page thumbnails and tap pages that carry the ♡ icon<br>• 'bring the handbook to every visit' checklist card | 45-60 s animation: a family opens the pink handbook, the 9 tabs light up one by one, the ♡ icon is explained | low | P1 / R1 (NOT_STARTED) |

### ข้อมูลแม่และเด็ก (`info`, PDF p3–5) — 3 lesson(s)

| ID | Thai title / English | Pages | Type | Objectives | Interactivity | Video | Risk | Priority / Release |
|---|---|---|---|---|---|---|---|---|
| MCH68-INFO-001 | **ข้อมูลครอบครัว และการแจ้งเกิดภายใน 15 วัน**<br>Family details page and birth registration within 15 days | PDF 3<br>(printed 1) | record-explainer | 1. ผู้เรียนสามารถบอกข้อมูลที่กรอกในหน้าข้อมูลครอบครัว (มารดา บิดา บุตร และที่อยู่ปัจจุบัน)<br>2. ผู้เรียนสามารถบอกได้ว่าคุณพ่อคุณแม่ต้องไปแจ้งเกิดและเพิ่มชื่อในทะเบียนบ้าน ณ อำเภอ เทศบาล หรือเขตที่เป็นท้องที่ที่เกิด ภายใน 15 วัน | • labelled walkthrough of the form: tap each block to see what goes there (no data entry in the app)<br>• scenario quiz: 'baby born on 3 March — what is the last day to register the birth?' | none – interactive only | low | P2 / R2 (NOT_STARTED) |
| MCH68-INFO-002 | **โรงเรียนพ่อแม่ 7 ครั้ง**<br>Parenting school: the 7 sessions | PDF 4<br>(printed 2) | record-explainer | 1. ผู้เรียนสามารถบอกช่วงเวลาเข้าร่วมกิจกรรมโรงเรียนพ่อแม่ทั้ง 7 ครั้ง (คลินิกฝากครรภ์ 3 ครั้ง หลังคลอด 1 ครั้ง คลินิกเด็กสุขภาพดี 3 ครั้ง)<br>2. ผู้เรียนสามารถบอกได้ว่าเมื่อเข้าร่วมกิจกรรมครบ 7 ครั้ง จะได้รับใบประกาศนียบัตร<br>3. ผู้เรียนสามารถบอกได้ว่าหากมีข้อสงสัยในการดูแลตนเองขณะตั้งครรภ์หรือการดูแลลูก ไม่ควรใช้วิธีลองถูกลองผิดด้วยตนเอง แต่ควรปรึกษาแพทย์หรือบุคลากรทางสาธารณสุข | • timeline tracker: 7 session milestones from early pregnancy to 18 months; tap each for setting and age window<br>• match game: session number ↔ age window (1-12 wk, 13-27 wk, ≥28 wk, newborn, 4 / 9 / 18 months) | 30-45 s animated timeline from the ANC clinic to the well-child clinic | low | P2 / R1 (NOT_STARTED) |
| MCH68-INFO-003 | **ทำไมต้องเล่าประวัติสุขภาพและการตั้งครรภ์ที่ผ่านมาให้ครบ**<br>Why your past pregnancies and health history matter | PDF 5<br>(printed 3) | record-explainer | 1. ผู้เรียนสามารถบอกหัวข้อประวัติที่เจ้าหน้าที่จะบันทึก (ประวัติการตั้งครรภ์ โรคประจำตัว ประวัติแพ้ยา ประวัติแพ้อาหาร และการเจ็บป่วยของบุคคลในครอบครัว)<br>2. ผู้เรียนสามารถอธิบายได้ว่าการให้ข้อมูลเกี่ยวกับการตั้งครรภ์ที่ผ่านมาอย่างครบถ้วนถูกต้อง ช่วยป้องกันความเสี่ยงต่อภาวะแทรกซ้อนในการตั้งครรภ์ปัจจุบัน<br>3. ผู้เรียนสามารถเตรียมชื่อยาที่แพ้และอาการที่แพ้ก่อนมาฝากครรภ์ | • pre-visit checklist (nothing stored): tick what you can bring — past delivery dates, birth weights, names of drugs you are allergic to<br>• flip cards: each history block → why the nurse asks (p5 tip only) | none – interactive only | low | P3 / R3 (NOT_STARTED) |

### ข้อมูลฝากครรภ์ (`anc`, PDF p6–9) — 3 lesson(s)

| ID | Thai title / English | Pages | Type | Objectives | Interactivity | Video | Risk | Priority / Release |
|---|---|---|---|---|---|---|---|---|
| MCH68-ANC-001 | **ผลตรวจเลือดตอนฝากครรภ์ของแม่และสามี**<br>Antenatal blood tests for mother and partner | PDF 6<br>(printed 4) | record-explainer | 1. ผู้เรียนสามารถบอกได้ว่าหญิงตั้งครรภ์และสามีได้รับการตรวจเลือด 2 ครั้ง และผลบันทึกไว้ในตาราง "รายงานการตรวจเลือด"<br>2. ผู้เรียนสามารถบอกชื่อรายการตรวจที่บันทึกในสมุด (Blood group ABO/Rh, Hct/Hb, MCV/OF, DCIP, Hb Typing, Hepatitis B, Syphilis, Anti-HIV)<br>3. ผู้เรียนสามารถบอกได้ว่าโรคติดต่อทางเพศสัมพันธ์สามารถป้องกันไม่ให้ติดต่อไปสู่ทารกได้ หากให้ยาป้องกันที่ถูกต้องและทันท่วงที<br>4. ผู้เรียนสามารถบอกวิธีตรวจภาวะดาวน์ซินโดรมที่ระบุในสมุด (Quadruple test, NIPT, Amniocentesis) | • tap-to-reveal: each row of the blood-report table shows the test's full name (no result interpretation)<br>• true/false: 'the partner is tested too' / 'STI can be prevented from passing to the baby with correct, timely medicine' | none – interactive only | medium | P2 / R2 (NOT_STARTED) |
| MCH68-ANC-002 | **วัคซีนสำหรับหญิงตั้งครรภ์**<br>Vaccines in pregnancy (dT, pertussis, influenza) | PDF 7<br>(printed 5) | educational | 1. ผู้เรียนสามารถบอกวัคซีนสำหรับหญิงตั้งครรภ์ที่ระบุในสมุด ได้แก่ คอตีบ-บาดทะยัก (dT) ไอกรน (ap หรือ aP) และไข้หวัดใหญ่<br>2. ผู้เรียนสามารถบอกได้ว่าการได้รับวัคซีนในหญิงตั้งครรภ์ ช่วยส่งต่อภูมิคุ้มกันโรคไปยังทารก<br>3. ผู้เรียนสามารถบอกช่วงอายุครรภ์ที่แนะนำ: ไอกรน ฉีด 1 ครั้งทุกการตั้งครรภ์ แนะนำที่ 20-32 สัปดาห์ (ให้ได้ตั้งแต่ 16 สัปดาห์ขึ้นไป) และไข้หวัดใหญ่ ฉีด 1 ครั้งทุกการตั้งครรภ์ แนะนำที่ 12-20 สัปดาห์ (ให้ได้ตลอดการตั้งครรภ์)<br>4. ผู้เรียนสามารถบอกได้ว่าควรแจ้งประวัติการฉีดวัคซีน dT ที่ผ่านมาให้เจ้าหน้าที่ เพื่อพิจารณาว่าต้องฉีดในครรภ์นี้หรือไม่ | • pregnancy timeline slider (weeks 0-40) highlighting the printed windows for pertussis and influenza<br>• 'Do I need dT this pregnancy?' explainer showing the three printed options and ending with 'your nurse decides' (no self-decision tool) | 60 s animation: antibodies passing from mother to baby, then a timeline of the recommended weeks | high | P2 / R2 (NOT_STARTED) |
| MCH68-ANC-003 | **ทำไมเจ้าหน้าที่ประเมินความเสี่ยงการตั้งครรภ์ทุกครั้งที่มาฝากครรภ์**<br>Why staff assess pregnancy risk at every visit | PDF 8, 9<br>(printed 6, 7) | staff-only-awareness | 1. ผู้เรียนสามารถบอกได้ว่าเจ้าหน้าที่ประเมินความเสี่ยงจากประวัติอดีต ประวัติปัจจุบัน และโรคทางอายุรกรรม ในการฝากครรภ์ครั้งที่ 1 และติดตามบางข้อในการฝากครรภ์ครั้งต่อ ๆ ไป<br>2. ผู้เรียนสามารถอธิบายได้ว่าระดับความเสี่ยงใช้พิจารณาสถานที่ฝากครรภ์และผู้ดูแล (รพ.สต. รพช. รพท./รพศ.)<br>3. ผู้เรียนสามารถบอกได้ว่าหญิงที่มีโรคประจำตัวบางโรค เมื่อตั้งครรภ์อาการของโรคอาจเพิ่มมากขึ้น ควรปรึกษาแพทย์หรือบุคลากรทางสาธารณสุข<br>4. ผู้เรียนสามารถอธิบายได้ว่าภาวะแทรกซ้อนอาจพบได้ตลอดการตั้งครรภ์ การมาฝากครรภ์สม่ำเสมอจะช่วยลดความเสี่ยง | • diagram: 4 care levels (Low Risk → High Risk 3) mapped to facility types and who provides ANC — no individual scoring, no checklist items shown<br>• myth/fact card: 'I was low risk at my first visit, so I can skip visits' → fact from the p9 tip | none – interactive only | medium | P3 / R3 (NOT_STARTED) |

### บันทึกการตรวจครรภ์ (`record`, PDF p10–17) — 4 lesson(s)

| ID | Thai title / English | Pages | Type | Objectives | Interactivity | Video | Risk | Priority / Release |
|---|---|---|---|---|---|---|---|---|
| MCH68-REC-001 | **มาฝากครรภ์ตามนัด: แต่ละครั้งเจ้าหน้าที่ตรวจอะไรบ้าง**<br>ANC visits: what is checked each time | PDF 10, 11, 12, 13<br>(printed 8, 9, 10, 11) | record-explainer | 1. ผู้เรียนสามารถบอกรายการที่เจ้าหน้าที่ตรวจและบันทึกทุกครั้งที่ฝากครรภ์ (น้ำหนัก ตรวจปัสสาวะ ความดันโลหิต ขนาดของมดลูก ท่าเด็ก/ส่วนนำ เสียงหัวใจเด็ก เด็กดิ้น)<br>2. ผู้เรียนสามารถอธิบายได้ว่าวันกำหนดคลอด (EDC) กำหนดจากประจำเดือนครั้งสุดท้าย (LMP) หรืออัลตราซาวนด์ และอัลตราซาวนด์ประเมินความผิดปกติของทารกได้เบื้องต้น แต่บางอย่างต้องประเมินหลังทารกเกิด<br>3. ผู้เรียนสามารถบอกได้ว่าแนะนำตรวจคัดกรองเบาหวานที่อายุครรภ์ 24-28 สัปดาห์ และการตรวจหัวนมเป็นการเตรียมความพร้อมสำหรับการให้นมแม่<br>4. ผู้เรียนสามารถบอกได้ว่าเมื่อใกล้ถึงกำหนดคลอด ควรหลีกเลี่ยงการเดินทางไกล เช่น เครื่องบิน หากจำเป็นควรปรึกษาแพทย์ | • interactive visit card: tap each column of the visit table to see what it is (purpose wording approved by ANC nurse)<br>• pregnancy-week timeline marking GDM screening at 24-28 weeks and fetal-movement counting from 28 weeks<br>• quiz: 'Why should I come regularly and bring the handbook?' (p8, p10 tips) | 45-60 s animation of a typical ANC visit, station by station | medium | P2 / R2 (NOT_STARTED) |
| MCH68-REC-002 | **การดูแลฟันแม่ขณะตั้งครรภ์**<br>Dental care during pregnancy | PDF 14<br>(printed 12) | educational | 1. ผู้เรียนสามารถอธิบายได้ว่าโรคเหงือกอักเสบพบได้บ่อยในหญิงตั้งครรภ์จากการเปลี่ยนแปลงของฮอร์โมน และถ้าเป็นมากจนเป็นโรคปริทันต์ อาจเสี่ยงคลอดก่อนกำหนดและเด็กมีน้ำหนักแรกเกิดน้อย<br>2. ผู้เรียนสามารถปฏิบัติตามข้อปฏิบัติขณะตั้งครรภ์ 3 ข้อ: กินอาหารครบ 5 หมู่และเลี่ยงน้ำตาลบ่อย ๆ; แปรงฟันวันละ 2 ครั้ง เช้าและก่อนนอน ด้วยยาสีฟันผสมฟลูออไรด์ ใช้ไหมขัดฟันทุกวัน และบ้วนปากหลังอาหาร; บ้วนปากด้วยน้ำมาก ๆ หรือน้ำผสมเบกกิ้งโซดาเมื่อคลื่นไส้อาเจียน<br>3. ผู้เรียนสามารถบอกได้ว่าเชื้อฟันผุถ่ายทอดจากแม่สู่ลูกได้ผ่านการเป่าอาหาร จูบ และใช้ภาชนะร่วมกัน<br>4. ผู้เรียนสามารถบอกได้ว่าหญิงตั้งครรภ์สามารถทำฟันได้ทุกช่วงของการตั้งครรภ์ | • daily-routine builder: drag brushing / flossing / rinsing into morning, after-meal and bedtime slots<br>• myth-or-fact: 'pregnant women should not see a dentist' (p14 tip)<br>• tap-to-reveal: 3 ways caries bacteria pass from mother to baby | 60 s animation: hormones → gum inflammation; brushing/flossing routine; rinsing after morning sickness | low | P1 / R1 (NOT_STARTED) |
| MCH68-REC-003 | **การนับลูกดิ้น**<br>Counting your baby's movements | PDF 15, 26<br>(printed 13, 24) | educational | 1. ผู้เรียนสามารถบอกได้ว่าควรนับลูกดิ้นตั้งแต่อายุครรภ์ 28 สัปดาห์จนกระทั่งคลอด และควรปฏิบัติทุกวัน<br>2. ผู้เรียนสามารถนับลูกดิ้นหลังมื้ออาหาร (เช้า เที่ยง เย็น) ครั้งละ 1 ชั่วโมง และบันทึกในตารางของสมุด<br>3. ผู้เรียนสามารถบอกได้ว่าถ้าลูกดิ้นน้อยกว่า 3 ครั้งต่อชั่วโมง ควรพบแพทย์ และ "เด็กดิ้นน้อยลง หรือไม่ดิ้น" เป็นอาการที่ต้องมาโรงพยาบาลทันที | • practice tally counter with a 1-hour timer (demo; shows only the printed rule)<br>• worked example: read the printed 'ตัวอย่าง' row (5 / 3 / 6) and decide whether each count reaches 3<br>• scenario quiz: 'after lunch you counted 2 movements in 1 hour — what do you do?' | 45 s animation: mother rests after a meal, tally marks appear, clear on-screen rule '< 3 ครั้ง/ชั่วโมง → พบแพทย์' | high | P2 / R2 (NOT_STARTED) |
| MCH68-REC-004 | **น้ำหนักที่เพิ่มขึ้นขณะตั้งครรภ์ และกราฟ Vallop curve**<br>Weight gain in pregnancy and the Vallop curve | PDF 16, 17<br>(printed 14, 15) | educational | 1. ผู้เรียนสามารถคำนวณ BMI ก่อนตั้งครรภ์จากสูตร น้ำหนัก (กิโลกรัม) / ส่วนสูง (เมตร)² และเลือกกราฟ 1 ใน 4 กราฟตาม BMI ก่อนตั้งครรภ์<br>2. ผู้เรียนสามารถคำนวณน้ำหนักที่เพิ่มขึ้นจาก (B) - (A) และจุดลงกราฟตามอายุครรภ์<br>3. ผู้เรียนสามารถอ่านโซนบนกราฟ (น้ำหนักเพิ่มมาก / น้ำหนักเพิ่มดี / น้ำหนักเพิ่มน้อย) และนำผลไปปรึกษาเจ้าหน้าที่<br>4. ผู้เรียนสามารถอธิบายได้ว่าน้ำหนักที่เพิ่มขึ้นอย่างเหมาะสมส่งผลต่อสุขภาพที่ดีของทารก และน้ำหนักที่เพิ่มมากเกินส่งผลให้เกิดภาวะแทรกซ้อน | • BMI calculator with a worked example (example values only, nothing stored) that highlights which of the 4 printed charts to tick<br>• plot-a-point practice on a sample chart: weight gain (B − A) against gestational week<br>• zone quiz with sample points | 60 s animation: the BMI formula, choosing the chart, plotting the gain at each visit | high | P2 / R2 (NOT_STARTED) |

### แบบประเมินระหว่างตั้งครรภ์และหลังคลอด (`assess`, PDF p18–21) — 3 lesson(s)

| ID | Thai title / English | Pages | Type | Objectives | Interactivity | Video | Risk | Priority / Release |
|---|---|---|---|---|---|---|---|---|
| MCH68-ASSESS-001 | **ดูแลใจระหว่างตั้งครรภ์: ความเครียดและการผ่อนคลาย**<br>Mental wellbeing in pregnancy: stress, coping and why staff ask | PDF 18, 20<br>(printed 16, 18) | staff-only-awareness | 1. ผู้เรียนสามารถอธิบายได้ว่าการประเมินภาวะสุขภาพจิตช่วยให้มองเห็นปัญหาและหาทางช่วยเหลือให้แม่และลูกมีสุขภาพกายใจที่สมบูรณ์ และสุขภาพจิตของแม่ส่งผลต่อทารกในครรภ์<br>2. ผู้เรียนสามารถบอกได้ว่าเจ้าหน้าที่จะสอบถามเรื่องความเครียด อารมณ์เศร้า และการดื่มสุรา ระหว่างการฝากครรภ์ (บันทึกได้ถึง 8 ครั้ง) และควรตอบตามความรู้สึกจริง<br>3. ผู้เรียนสามารถบอกวิธีผ่อนคลายความเครียดตามสมุด: พูดคุยหรือปรึกษาหารือกับคนใกล้ชิด หายใจเข้าออกลึก ๆ ช้า ๆ หลายครั้ง หรือใช้หลักการทางศาสนา<br>4. ผู้เรียนสามารถบอกได้ว่าหากรู้สึกทุกข์ใจจนไม่อยากมีชีวิตอยู่ ต้องบอกเจ้าหน้าที่หรือขอความช่วยเหลือทันที | • guided slow-breathing exercise (animated circle) based on the printed coping advice — no scoring<br>• 'who can I talk to?' card: family + PMH contacts (PMH to fill)<br>• explainer carousel 'why the nurse asks these questions' — topics in general terms only; ST-5 / 2Q plus items and scores are NOT reproduced | 60 s gentle animation: mood changes in pregnancy are common, the nurse's questions are a way to help, slow-breathing demo | high | P2 / R2 (NOT_STARTED) |
| MCH68-ASSESS-002 | **ภาวะซึมเศร้าหลังคลอด เกิดขึ้นได้กับทุกคน**<br>Postpartum depression can happen to anyone | PDF 19, 21<br>(printed 17, 19) | staff-only-awareness | 1. ผู้เรียนสามารถบอกได้ว่าภาวะซึมเศร้าหลังคลอดเกิดขึ้นได้กับทุกคน โดยไม่จำเป็นต้องเคยมีประวัติซึมเศร้ามาก่อน และฮอร์โมนที่เปลี่ยนแปลงส่งผลต่ออารมณ์ได้มาก<br>2. ผู้เรียนสามารถบอกได้ว่าเจ้าหน้าที่จะประเมินภาวะซึมเศร้าหลังคลอดในระยะ 4-6 สัปดาห์หลังคลอด และประเมินสุขภาพจิตอีกครั้งเมื่อหลังคลอดมากกว่า 6 สัปดาห์<br>3. ผู้เรียน (ครอบครัว) สามารถบอกได้ว่าเมื่อแม่รู้สึกเศร้า ทุกข์ใจ หรือมีความคิดทำร้ายตนเอง ควรพาไปขอรับคำปรึกษาจากบุคลากรสาธารณสุขโดยเร็ว | • family scenario: 'three weeks after the birth your partner is often tearful — what helps?' (answers limited to talking and seeking health-staff counselling)<br>• postpartum timeline showing when mood is checked (4-6 weeks; after 6 weeks) | 60 s animation addressed to partner and family: postpartum depression is common and not a weakness; the 4-6 week check | high | P2 / R2 (NOT_STARTED) |
| MCH68-ASSESS-003 | **งดสุราและบุหรี่ ระหว่างตั้งครรภ์และให้นมลูก**<br>Alcohol and smoking in pregnancy and breastfeeding | PDF 8, 19, 20, 26<br>(printed 6, 17, 18, 24) | educational | 1. ผู้เรียนสามารถบอกได้ว่าควรงดเครื่องดื่มที่มีแอลกอฮอล์ทุกชนิด (เช่น เบียร์ เหล้า สาโท กะแช่ วิสกี้ สปาย ไวน์) เพราะการดื่มสุรามีผลต่อสุขภาพของมารดาและการเลี้ยงลูก<br>2. ผู้เรียนสามารถบอกผลเสียของการสูบบุหรี่ระหว่างตั้งครรภ์ตามสมุด: ลูกในครรภ์ตัวเล็กผิดปกติ เสี่ยงต่อโรคปอดและปัญหาทางเดินหายใจ<br>3. ผู้เรียนสามารถบอกได้ว่าการสูบบุหรี่หรือบุหรี่ไฟฟ้าของหญิงตั้งครรภ์หรือคนใกล้ชิด เป็นความเสี่ยงที่เจ้าหน้าที่ประเมิน<br>4. ผู้เรียนสามารถอธิบายได้ว่าเจ้าหน้าที่ถามเรื่องการดื่มสุราในรอบ 1 ปีที่ผ่านมา เพื่อให้การดูแลเพิ่มเติม จึงควรตอบตามจริง | • sort game: drag drinks into 'contains alcohol' using the printed list (เบียร์ เหล้า สาโท กะแช่ วิสกี้ สปาย ไวน์)<br>• family pledge card: smoke-free home, including e-cigarettes<br>• 'why we ask' explainer for the alcohol question | 45 s animation: smoke and alcohol reaching the baby; the family keeps an alcohol-free, smoke-free home | low | P1 / R1 (NOT_STARTED) |

### ความรู้สู่การปฏิบัติเพื่อแม่ลูกสุขภาพดี (`knowledge`, PDF p22–33) — 19 lesson(s)

| ID | Thai title / English | Pages | Type | Objectives | Interactivity | Video | Risk | Priority / Release |
|---|---|---|---|---|---|---|---|---|
| MCH68-K-001 | **ธงโภชนาการ คืออะไร? อาหาร 6 กลุ่ม**<br>What is the food guide flag? The 6 food groups | PDF 22<br>(printed 20) | educational | 1. ผู้เรียนสามารถบอกอาหาร 6 กลุ่มตามธงโภชนาการ (ข้าว-แป้ง ผัก ผลไม้ นม ไขมัน น้ำตาล เกลือ และเนื้อสัตว์)<br>2. ผู้เรียนสามารถอธิบายการอ่านธงโภชนาการ: ฐานบนสุดให้กินปริมาณมาก ปลายธงให้กินปริมาณน้อย<br>3. ผู้เรียนสามารถบอกประโยชน์ของการกินอย่างถูกต้องสำหรับคุณแม่ตั้งครรภ์และหญิงให้นมบุตร<br>4. ผู้เรียนสามารถบอกได้ว่าธงโภชนาการนี้เหมาะกับคนที่ไม่มีโรคประจำตัว หากมีโรคประจำตัวควรได้รับคำแนะนำเพิ่มเติมจากแพทย์ที่ดูแล | • tap-to-reveal food groups on the nutrition flag (each tier shows the foods pictured on p22)<br>• drag food pictures (only foods shown on p22-25) into the 6 groups | 45 s animation: the inverted triangle fills tier by tier | low | P1 / R1 (DRAFT) |
| MCH68-K-002 | **กินอย่างไรในแต่ละไตรมาส และช่วงให้นมลูก**<br>Daily food amounts by trimester and while breastfeeding | PDF 22, 23, 24, 25<br>(printed 20, 21, 22, 23) | educational | 1. ผู้เรียนสามารถเลือกธงโภชนาการให้ตรงกับช่วงอายุครรภ์ (ไตรมาสที่ 1 น้อยกว่า 12 สัปดาห์ / ไตรมาสที่ 2 13-27 สัปดาห์ / ไตรมาสที่ 3 28-40 สัปดาห์) และช่วงให้นมลูก (6 เดือนแรกเท่ากับไตรมาส 3, 6 เดือนขึ้นไปเท่ากับไตรมาส 2)<br>2. ผู้เรียนสามารถเลือกปริมาณอาหารตามสีสัญลักษณ์การดื่มนม (ไม่ดื่มนม / ดื่มนม 1 แก้ว / ดื่มนม 2 แก้ว)<br>3. ผู้เรียนสามารถบอกปริมาณอาหารที่แนะนำใน 1 วันของตนเอง ดื่มน้ำวันละ 8-10 แก้ว และใช้ไขมัน น้ำตาล เกลือ แต่น้อยเท่าที่จำเป็น | • selector: stage (T1 / T2 / T3 / breastfeeding 0-6 m / >6 m) + milk glasses (0 / 1 / 2) → animated flag shows the printed daily portions<br>• portion-size visuals: what 1 ทัพพี / 1 ช้อนกินข้าว / 1 ส่วน looks like (approved photos needed)<br>• quiz: 'breastfeeding a 3-month-old — which flag do I use?' | 60 s animation: the flag grows from T1 to T3; the breastfeeding mother maps to T3, then T2 | medium | P1 / R1 (NOT_STARTED) |
| MCH68-K-003 | **ยาเม็ดเสริมธาตุเหล็ก ไอโอดีน และโฟลิก ทุกวัน**<br>Daily iron, iodine and folic acid tablets | PDF 22, 23, 24, 25, 67<br>(printed 20, 21, 22, 23) | educational | 1. ผู้เรียนสามารถบอกได้ว่าหญิงตั้งครรภ์ต้องกินยาเม็ดเสริมธาตุเหล็ก ไอโอดีน และโฟลิก ทุกวันตลอดการตั้งครรภ์<br>2. ผู้เรียนสามารถบอกประโยชน์ตามสมุด: วิตามินเสริมระหว่างฝากครรภ์ช่วยเสริมสารอาหารที่จำเป็น และธาตุเหล็กช่วยป้องกันภาวะซีดในหญิงตั้งครรภ์<br>3. ผู้เรียนสามารถบอกได้ว่าควรเริ่มรับประทานวิตามินเสริม (เหล็ก/โฟลิก) อย่างน้อย 3 เดือนก่อนตั้งครรภ์ | • daily habit tracker demo (tick a calendar; local-only)<br>• true/false: 'take the tablets only in the first trimester' (false — every day throughout pregnancy) | 30 s animation of the supplement bottle and a daily routine cue | high | P2 / R2 (NOT_STARTED) |
| MCH68-K-004 | **ข้อปฏิบัติการกินเพื่อสุขภาพที่ดี 9 ข้อ สำหรับหญิงตั้งครรภ์และหญิงให้นมบุตร**<br>9 healthy-eating rules for pregnancy and breastfeeding | PDF 26<br>(printed 24) | educational | 1. ผู้เรียนสามารถบอกข้อปฏิบัติการกินเพื่อสุขภาพที่ดี 9 ข้อ สำหรับหญิงตั้งครรภ์และหญิงให้นมบุตร<br>2. ผู้เรียนสามารถยกตัวอย่างอาหารที่มีแคลเซียมสูง (โยเกิร์ตรสธรรมชาติ ปลาเล็กปลาน้อย เต้าหู้ขาวแข็ง ปลาซาร์ดีน) และถั่วเมล็ดแห้ง (ถั่วเหลือง ถั่วเขียว ถั่วดำ ถั่วแดง)<br>3. ผู้เรียนสามารถระบุผลไม้รสหวานจัดที่ควรหลีกเลี่ยง (ลำไย มะขามหวาน ขนุน ละมุด ทุเรียน และผลไม้แปรรูป) และบอกได้ว่าควรงดเครื่องดื่มที่มีแอลกอฮอล์และหลีกเลี่ยงอาหารหมักดอง | • swipe cards: 'eat regularly' vs 'avoid', using only foods named on p26<br>• 9-rule checklist with icons; tap each for the handbook sentence | 60 s animation: the 9 icons appear in sequence | low | P1 / R1 (NOT_STARTED) |
| MCH68-K-005 | **อาการผิดปกติที่แม่ท้องต้องมาโรงพยาบาลทันที**<br>Danger signs in pregnancy: come to hospital now | PDF 15, 26<br>(printed 13, 24) | educational | 1. ผู้เรียนสามารถบอกอาการผิดปกติ 7 อาการที่แม่ท้องต้องมาโรงพยาบาลทันที<br>2. ผู้เรียนสามารถปฏิบัติได้ถูกต้องเมื่อมีน้ำใส ๆ ไหลจากช่องคลอด: ใส่ผ้าอนามัยไว้ แล้วรีบมาโรงพยาบาล<br>3. ผู้เรียนสามารถบอกได้ว่าเวียนศีรษะ ตาพร่า ขาบวม อาจเกิดจากภาวะครรภ์เป็นพิษ<br>4. ผู้เรียน (ครอบครัว) สามารถบอกได้ว่าจะไปที่ใดและติดต่อใครเมื่อพบอาการเหล่านี้ ตามข้อมูลของโรงพยาบาลพิมาย | • scenario quiz: 8 short scenarios → 'go to hospital now' vs 'mention at next visit' (only the 7 printed signs count as 'now')<br>• tap-to-reveal body map with the 7 icons<br>• one-tap PMH emergency contact card (PMH to supply) | 60 s calm animation: each sign with its icon, ending on the PMH where-to-go card | high | P2 / R2 (NOT_STARTED) |
| MCH68-K-006 | **ออกกำลังกายระหว่างตั้งครรภ์และหลังคลอด**<br>Physical activity in pregnancy and after birth | PDF 27<br>(printed 25) | educational | 1. ผู้เรียนสามารถบอกเป้าหมายกิจกรรมทางกาย 150 นาที/สัปดาห์ ระดับปานกลาง<br>2. ผู้เรียนสามารถเลือกกิจกรรมที่เหมาะกับแต่ละไตรมาสและระยะหลังคลอดตามสมุด (เช่น เดินหรือย่ำเท้าอยู่กับที่ แอโรบิค ยืดเหยียด บริหารกล้ามเนื้ออุ้งเชิงกราน)<br>3. ผู้เรียนสามารถบอกข้อควรระวัง 6 ข้อ (หลีกเลี่ยงนอนหงายเป็นเวลานาน ไม่หักโหม ลดแรงกระแทก/เสียดสี หยุดทันทีหากมีอาการผิดปกติ ดื่มน้ำเพียงพอ เลี่ยงอากาศร้อน)<br>4. ผู้เรียนสามารถบอกได้ว่าการตั้งครรภ์ไม่ได้เป็นข้อห้ามในการออกกำลังกาย และเพศสัมพันธ์ระหว่างตั้งครรภ์ทำได้ถ้าไม่มีข้อห้าม โดยปรับท่าให้เหมาะสม ไม่กดทับหน้าท้อง | • stage wheel: tap T1 / T2 / T3 / postpartum to see the printed activities and minutes<br>• caution flip cards: the 6 printed cautions with icons<br>• weekly-minutes bar (demo, local-only) | 60-90 s animation of safe example moves for each stage plus the caution list (moves must be approved by a physiotherapist) | medium | P1 / R1 (NOT_STARTED) |
| MCH68-K-007 | **เลี้ยงลูกด้วยนมแม่: ทำไมสำคัญ และ 3 ดูด**<br>Breastfeeding: why it matters and the '3 suckles' | PDF 12, 28, 56<br>(printed 10, 26, 54) | educational | 1. ผู้เรียนสามารถบอกประโยชน์ของนมแม่ต่อลูก (สารอาหารเหมาะสม สารภูมิคุ้มกันโรค) และต่อแม่ (ความผูกพัน ผ่อนคลาย ลดโอกาสตกเลือดหลังคลอด ลดความเสี่ยงมะเร็งเต้านม มะเร็งรังไข่ ภาวะกระดูกพรุน ประหยัดค่าใช้จ่าย)<br>2. ผู้เรียนสามารถอธิบายหลัก 3 ดูด: ดูดเร็ว (ภายใน 1 ชั่วโมงหลังคลอด) ดูดบ่อย (เฉลี่ยวันละ 8 ครั้งขึ้นไป) ดูดถูกวิธี (ดูดให้เกลี้ยงเต้า ได้นมทั้งส่วนหน้าและส่วนหลัง)<br>3. ผู้เรียนสามารถบอกสูตรนมแม่ต่อเนื่อง 1-6-2 และบอกได้ว่าไม่ต้องเสริมน้ำเปล่าก่อน 6 เดือน เพราะนมแม่มีน้ำกว่า 70% | • 1-6-2 timeline: tap each pin to reveal its meaning<br>• tap-to-reveal comparison of breast-milk vs formula components (recreated, not the UNICEF graphic)<br>• quiz: 'Does a 2-month-old need water on a hot day?' | 60-90 s animation: first-hour feed, frequent feeding, foremilk and hindmilk | medium | P1 / R1 (NOT_STARTED) |
| MCH68-K-008 | **การเก็บและละลายน้ำนมแม่**<br>Storing and thawing breast milk | PDF 28<br>(printed 26) | educational | 1. ผู้เรียนสามารถบอกระยะเวลาเก็บน้ำนมแม่ตามสถานที่เก็บและอุณหภูมิตามตารางในสมุด<br>2. ผู้เรียนสามารถละลายนมแช่แข็งได้ถูกวิธี: นำมาละลายในช่องธรรมดาล่วงหน้า 12 ชั่วโมง และละลายแล้วไม่กลับไปแช่ซ้ำ<br>3. ผู้เรียนสามารถบอกได้ว่าไม่ควรอุ่นนมในไมโครเวฟหรือน้ำร้อนจัด เพราะเสียคุณค่าสารอาหาร | • matching game: storage place ↔ storage time (the 7 rows of the table)<br>• fridge diagram: tap room / ice box / fridge / freezer types to reveal times<br>• scenario: 'I thawed milk yesterday and didn't use it — can I refreeze it?' | 45 s animation of a fridge with labelled compartments and the thaw-don't-refreeze rule | medium | P1 / R1 (NOT_STARTED) |
| MCH68-K-009 | **ฝึกลูกเข้านอน: ชั่วโมงนอนตามวัย**<br>Sleep: how much children need and learning to settle | PDF 29, 58, 59<br>(printed 27, 56, 57) | educational | 1. ผู้เรียนสามารถบอกระยะเวลาการนอนที่เหมาะสมตามช่วงวัย (แรกเกิด-3 เดือน 14-17 ชั่วโมง; 4 เดือน-1 ปี 12-16 ชั่วโมง; 1-2 ปี 11-14 ชั่วโมง; 3-5 ปี 10-13 ชั่วโมง)<br>2. ผู้เรียนสามารถอธิบายได้ว่าการนอนที่ดีส่งผลต่อการหลั่งโกรทฮอร์โมน ความจำ และสมาธิในการเรียนรู้<br>3. ผู้เรียนสามารถจัดบรรยากาศการนอน (มืด เงียบ อากาศถ่ายเท) และอธิบายการฝึกนอนยาวด้วยตนเองหลังอายุ 6 เดือน ตามวงจรการนอนหลับ | • age slider → printed sleep-hour range<br>• animated sleep-cycle graph (light sleep → deep sleep → waking → back to sleep, 45-50 min)<br>• scenario: 'your 8-month-old stirs at night' → watch without touching; children usually settle within 30 minutes | 45 s animation of the sleep-cycle chart | low | P2 / R2 (NOT_STARTED) |
| MCH68-K-010 | **สีอุจจาระทารก: สีซีดต้องรีบพบกุมารแพทย์**<br>Baby stool colour: pale stool needs urgent review | PDF 29<br>(printed 27) | educational | 1. ผู้เรียนสามารถแยกสีอุจจาระทารกปกติและผิดปกติ (สีซีด) จากบัตรเทียบสี<br>2. ผู้เรียนสามารถบอกได้ว่าหากอุจจาระทารกมีสีซีดผิดปกติ ต้องพาไปพบกุมารแพทย์โดยเร็ว แม้จะไม่มีอาการอื่น<br>3. ผู้เรียนสามารถอธิบายเหตุผลได้ว่าอาจเกิดจากโรคท่อน้ำดีตีบตัน ซึ่งต้องรักษาเร่งด่วนก่อนอายุ 2 เดือน | • scenario quiz: which stool colour needs a doctor (calibrated colour swatches, not copied photos)<br>• tap-to-reveal: why treatment must happen before 2 months | 30-45 s animation with a calibrated colour card | high | P2 / R2 (NOT_STARTED) |
| MCH68-K-011 | **ฝึกขับถ่าย และการขับถ่ายรดที่นอน**<br>Toilet training and bed-wetting | PDF 29<br>(printed 27) | educational | 1. ผู้เรียนสามารถบอกความพร้อมในการฝึกขับถ่ายเมื่ออายุ 2 ปีขึ้นไป (นั่งทรงตัวได้มั่นคง ดึงกางเกงลงเองได้ บอกความต้องการพื้นฐานได้)<br>2. ผู้เรียนสามารถอธิบายวิธีฝึก: ฝึกนั่งกระโถนหลังมื้อเช้า หรือใช้ฝารองนั่งสำหรับเด็กที่มีบันไดเพื่อให้เท้าไม่ลอย<br>3. ผู้เรียนสามารถบอกได้ว่าควรใช้แรงเสริมทางบวก ไม่ใช้วิธีที่รุนแรง และควรพาไปพบกุมารแพทย์หากอุจจาระรดหลัง 4 ปี หรือปัสสาวะรดหลัง 5 ปี | • readiness checklist (the 3 printed signs)<br>• scenario: choose a positive vs a harsh response to an accident | none – interactive only | medium | P3 / R3 (NOT_STARTED) |
| MCH68-K-012 | **สื่อหน้าจอกับพัฒนาการเด็ก**<br>Screens and child development | PDF 30<br>(printed 28) | educational | 1. ผู้เรียนสามารถบอกได้ว่าเด็กอายุน้อยกว่า 2 ปี ห้ามใช้สื่อหน้าจอ (ยกเว้นวิดีโอคอล)<br>2. ผู้เรียนสามารถบอกข้อจำกัดสำหรับเด็กอายุ 2 ปีขึ้นไป: จำกัด 1 ชม./ครั้ง และไม่เกิน 2 ครั้ง/วัน โดยมีผู้ดูแล<br>3. ผู้เรียนสามารถบอกช่วงที่ควรหลีกเลี่ยงหน้าจอ (ระหว่างมื้ออาหาร และช่วงก่อนนอน 1 ชั่วโมง) และบอกได้ว่าไม่ควรให้เด็กใช้สื่อหน้าจอตามลำพังหรือเปิดจอทิ้งไว้ | • scenario quiz: 5 everyday situations (video call with grandma, cartoon at dinner, …) → OK / not OK<br>• family screen-plan card (parents as role models) | 30-45 s animation using the 4 picture cards | low | P2 / R2 (NOT_STARTED) |
| MCH68-K-013 | **ป้องกันการบาดเจ็บในบ้าน**<br>Preventing injuries at home | PDF 30<br>(printed 28) | educational | 1. ผู้เรียนสามารถบอกวิธีป้องกันการบาดเจ็บในเด็ก 6 ข้อตามสมุด<br>2. ผู้เรียนสามารถตรวจบ้านตามเกณฑ์ในสมุด: ช่องห่างราวบันไดน้อยกว่า 9 เซนติเมตร หน้าต่างสูงจากพื้นมากกว่า 1 เมตร และยึดเฟอร์นิเจอร์ให้มั่นคง<br>3. ผู้เรียนสามารถบอกได้ว่าไม่ปล่อยเด็กบนที่สูงลำพัง ไม่ใช้รถหัดเดิน และดูแลใกล้ชิดเมื่อใช้บันไดเลื่อน/ลิฟต์ | • spot-the-hazard illustrated home scene (hazards drawn only from the 6 cards)<br>• home-safety checklist | 45 s animated walk-through of a home | low | P2 / R2 (NOT_STARTED) |
| MCH68-K-014 | **ปลอดภัยบนท้องถนน: ที่นั่งนิรภัย รถจักรยานยนต์ และไม่ทิ้งเด็กในรถ**<br>Road safety: car seats, motorcycles and never leaving a child in the car | PDF 31<br>(printed 29) | educational | 1. ผู้เรียนสามารถบอกได้ว่าต้องใช้ที่นั่งนิรภัยทุกครั้ง และเด็กอายุน้อยกว่า 2 ปีให้หันหน้าเข้าหาเบาะ<br>2. ผู้เรียนสามารถบอกได้ว่าเด็กอายุน้อยกว่า 2 ปีห้ามโดยสารรถจักรยานยนต์ และเด็กอายุ 2-6 ปีไม่แนะนำให้โดยสารหลังผู้ขับขี่ตามลำพัง<br>3. ผู้เรียนสามารถบอกวิธีป้องกันเด็กติดในรถ: ห้ามทิ้งเด็กในรถ สอนบีบแตร และตรวจรอบรถก่อนขับรถทุกครั้ง | • car-seat direction picker by age (<2 years rear-facing, >2 years forward-facing)<br>• scenario quiz on motorcycle travel<br>• pre-drive walk-around checklist | 45 s animation of rear-facing vs forward-facing seats and checking around the car | medium | P2 / R2 (NOT_STARTED) |
| MCH68-K-015 | **ป้องกันการจมน้ำและการอุดกั้นทางเดินหายใจ**<br>Preventing drowning and suffocation | PDF 31<br>(printed 29) | educational | 1. ผู้เรียนสามารถบอกวิธีป้องกันการจมน้ำ: สวมชูชีพ ผู้ปกครองดูแลใกล้ชิด กั้นรั้วรอบแหล่งน้ำ และระวังน้ำในภาชนะ<br>2. ผู้เรียนสามารถบอกได้ว่าน้ำเพียง 1-2 นิ้ว สามารถทำให้เด็กจมน้ำได้<br>3. ผู้เรียนสามารถบอกวิธีป้องกันการอุดกั้นทางเดินหายใจ: ที่นอนไม่นิ่มจนยุบ ไม่ปล่อยให้เล่นของเล่นชิ้นเล็ก เลี่ยงของเล่นสายยาวและถุงพลาสติก | • spot-the-hazard: yard and bathroom scene with buckets, jars and a pond<br>• toy sort: safe vs choking / strangling hazard | 45 s animation: water in a bucket, a fenced pond, a firm mattress | low | P2 / R2 (NOT_STARTED) |
| MCH68-K-016 | **สิ่งแปลกปลอมติดคอ: วิธีช่วยเหลือเด็ก**<br>Choking: first aid for babies and children | PDF 32<br>(printed 30) | educational | 1. ผู้เรียนสามารถบอกอาการที่สงสัยว่ามีสิ่งแปลกปลอมอุดทางเดินหายใจ (เด็กไม่สามารถส่งเสียงได้ ดูซีด เขียว หายใจลำบาก) และโทร 1669<br>2. ผู้เรียนสามารถอธิบายขั้นตอนช่วยเหลือเด็กอายุน้อยกว่า 1 ปี (ตบกลางหลังสลับกดกลางหน้าอก อย่างละ 5 ครั้ง) และเด็กอายุมากกว่า 1 ปี (ตบกลางหลัง 5 ครั้ง สลับกับดันที่ลิ้นปี่ 5 ครั้ง) ทำซ้ำจนวัตถุออกมา<br>3. ผู้เรียนสามารถบอกได้ว่าห้ามใช้นิ้วล้วงเข้าไปในปาก และหากเด็กไม่ตอบสนอง/ไม่รู้สึกตัว ต้องกู้ชีพโดยการกดหัวใจ | • step-through animation of choking first aid as a decision tree (responsive? under or over 1 year?)<br>• sequence-ordering quiz<br>• prompt to practise on a manikin with PMH staff (PMH to supply booking details) | 60-90 s step-by-step animation, reviewed frame by frame by a resuscitation instructor | high | P2 / R2 (NOT_STARTED) |
| MCH68-K-017 | **กู้ชีพเด็กโดยการกดหัวใจ**<br>CPR for babies and children | PDF 32<br>(printed 30) | educational | 1. ผู้เรียนสามารถบอกลำดับการช่วยเหลือเมื่อพบเด็กหมดสติ ไม่มีการตอบสนอง ไม่หายใจ: ตบฝ่าเท้า/ร้องเรียก โทร 1669 และดูการเคลื่อนไหวของหน้าอกและหน้าท้อง (หากไม่แน่ใจ ให้เริ่มกดหน้าอกเลย)<br>2. ผู้เรียนสามารถบอกหลักการกดหน้าอก: กด 30 : เป่า 2 (มีผู้ช่วยใช้ กด 15 : เป่า 2) ความเร็ว 120 ครั้ง/นาที ลึก 1/3 ของความหนาทรวงอก และปล่อยให้หน้าอกยกคืนก่อนกดครั้งต่อไป<br>3. ผู้เรียนสามารถบอกตำแหน่งกด (เด็กทารกใช้ 2 นิ้ว เด็กใช้อุ้งมือ กดกลางกระดูกหน้าอก) และวิธีเป่าปาก (ยกคาง เงยศีรษะ ประกบปาก เป่าจนหน้าอกยกขึ้น)<br>4. ผู้เรียนสามารถอธิบายได้ว่าสมองทนต่อการขาดอากาศได้ไม่เกิน 4 นาที จึงต้องเริ่มช่วยทันที | • metronome at 120/min with tap-along compression practice<br>• step-through animation of the sequence<br>• ordering quiz | 90 s animation; must say clearly that hands-on training is needed | high | P2 / R2 (NOT_STARTED) |
| MCH68-K-018 | **ปฐมพยาบาลเมื่อลูกชักจากไข้สูง**<br>First aid for febrile seizures | PDF 33<br>(printed 31) | educational | 1. ผู้เรียนสามารถบอกได้ว่าเด็กเล็ก โดยเฉพาะอายุต่ำกว่า 5 ปี เมื่อมีไข้สูงอาจเกิดอาการชัก เกร็ง กระตุกได้<br>2. ผู้เรียนสามารถเรียงขั้นตอนปฐมพยาบาล 6 ขั้นได้ถูกต้อง (ตะโกนขอความช่วยเหลือหรือโทร 1669; จับนอนตะแคง; ห้ามล้วง/ใส่วัตถุในปาก; ห้ามเขย่า/กระแทก; เช็ดตัวลดไข้ด้วยน้ำอุณหภูมิปกติ; เมื่อตื่นรู้ตัวป้อนยาลดไข้)<br>3. ผู้เรียนสามารถระบุการกระทำที่ห้ามทำขณะเด็กชัก | • step-through animation of the 6 steps<br>• do / don't swipe cards<br>• ordering quiz | 60 s animation of the 6 icon steps | high | P2 / R2 (NOT_STARTED) |
| MCH68-K-019 | **อาการที่ต้องพาทารกไปพบแพทย์**<br>Signs that a baby needs a doctor | PDF 33, 35<br>(printed 31, 33) | educational | 1. ผู้เรียนสามารถบอกอาการ 7 อาการที่ต้องพาทารกไปพบแพทย์<br>2. ผู้เรียนสามารถนับการหายใจของทารกใน 1 นาที และบอกได้ว่าหายใจเร็วมากกว่า 60 ครั้งต่อนาทีเป็นอาการที่ต้องพบแพทย์<br>3. ผู้เรียนสามารถบอกได้ว่าทารกอายุน้อยกว่า 1 เดือนหากมีไข้ต้องไปพบแพทย์ทันที และไม่ปัสสาวะใน 6-8 ชั่วโมงเป็นอาการที่ต้องพบแพทย์ | • 60-second breathing-count practice timer with an animated baby<br>• scenario quiz: which baby needs a doctor today?<br>• tap-to-reveal ring of the 7 signs | 60 s animation with the 7 signs around a crying baby | high | P2 / R2 (NOT_STARTED) |

### ประวัติสุขภาพเด็กและบันทึกวัคซีน (`childhealth`, PDF p34–43) — 7 lesson(s)

| ID | Thai title / English | Pages | Type | Objectives | Interactivity | Video | Risk | Priority / Release |
|---|---|---|---|---|---|---|---|---|
| MCH68-CH-001 | **หลังคลอด: อาการผิดปกติของแม่ที่ต้องพบแพทย์ทันที และการเยี่ยมหลังคลอด**<br>After birth: maternal danger signs and postnatal visits | PDF 35<br>(printed 33) | educational | 1. ผู้เรียนสามารถบอกอาการผิดปกติหลังคลอด 6 อาการที่ต้องพบแพทย์หรือเจ้าหน้าที่สาธารณสุขทันที<br>2. ผู้เรียนสามารถบอกช่วงเวลาเยี่ยมหลังคลอด 3 ครั้ง (ภายในสัปดาห์แรก วันที่ 8-15 และวันที่ 16-42 หลังคลอด)<br>3. ผู้เรียนสามารถบอกหัวข้อคำแนะนำหลังคลอดในสมุด: การคุมกำเนิด การดูแลเหงือกและฟัน การไม่ส่งผ่านเชื้อฟันผุสู่เด็ก นัดตรวจช่องปากแม่และลูก 6 เดือนหลังคลอด และนมแม่อย่างเดียวโดยไม่ต้องป้อนน้ำเปล่าในทารก 6 เดือนแรก | • postpartum day timeline (day 0-42) with the 3 visit windows<br>• scenario quiz on the 6 danger signs (e.g. 'lochia still red after 2 weeks')<br>• PMH contact card | 60 s animation for mother and family | high | P2 / R2 (NOT_STARTED) |
| MCH68-CH-002 | **ลูกแรกเกิดได้รับการตรวจคัดกรองอะไรบ้าง**<br>Newborn screening: what your baby is checked for | PDF 36<br>(printed 34) | staff-only-awareness | 1. ผู้เรียนสามารถบอกรายการที่บันทึกในหน้าบันทึกทารกแรกเกิด (APGAR น้ำหนัก ความยาว รอบศีรษะ วิตามินเค และการคัดกรองไทรอยด์ IEM 40 โรค การได้ยิน โรคหัวใจพิการชนิดเขียวรุนแรง ภาวะเหลือง)<br>2. ผู้เรียนสามารถอธิบายได้ว่าเมื่อได้รับแจ้ง "เรียกติดตาม" ต้องพาลูกกลับมาตรวจตามนัด<br>3. ผู้เรียนสามารถบอกได้ว่าลูกที่เกิดจากแม่ที่ติดเชื้อไวรัสตับอักเสบบี ต้องได้รับวัคซีนป้องกันเพิ่มเติมนอกเหนือจากวัคซีนของเด็กปกติ | • checklist explainer: tap each screening name → one-line purpose (PMH-approved text)<br>• 'what to do if you are called back' card | none – interactive only | medium | P3 / R3 (NOT_STARTED) |
| MCH68-CH-003 | **บันทึกสุขภาพเด็ก: แพ้ยา แพ้อาหาร และการเจ็บป่วยสำคัญ**<br>Child health record: allergies and important illnesses | PDF 37<br>(printed 35) | record-explainer | 1. ผู้เรียนสามารถบอกข้อมูลที่บันทึกในหน้าบันทึกสุขภาพเด็ก (ประวัติแพ้ยา แพ้อาหาร โรคประจำตัว ยาที่ใช้ประจำ หมู่เลือด)<br>2. ผู้เรียนสามารถอธิบายได้ว่าการจดบันทึกประวัติการเจ็บป่วย เช่น ไข้สูงแล้วชัก และหลอดลมตีบ เป็นประโยชน์ต่อการวินิจฉัยโรคของแพทย์ในอนาคต<br>3. ผู้เรียนสามารถบอกได้ว่าควรแจ้งโรคทางพันธุกรรมในครอบครัวให้เจ้าหน้าที่บันทึก | • labelled form walkthrough<br>• quiz: 'your child had a febrile seizure — where is it recorded and who signs?' | none – interactive only | low | P3 / R3 (NOT_STARTED) |
| MCH68-CH-004 | **วัคซีนพื้นฐานของลูก (EPI)**<br>Your child's routine vaccines (EPI) | PDF 38, 39<br>(printed 36, 37) | educational | 1. ผู้เรียนสามารถบอกวัคซีนตามแผนงานสร้างเสริมภูมิคุ้มกันโรคของประเทศไทยและอายุที่แนะนำตามสมุด<br>2. ผู้เรียนสามารถอ่านหน้าบันทึกการรับวัคซีนในสมุดและหาวัคซีนครั้งถัดไปของลูกได้<br>3. ผู้เรียนสามารถบอกได้ว่าวัคซีนโรต้าให้ครั้งแรกไม่เร็วกว่าอายุ 6 สัปดาห์ และครั้งสุดท้ายไม่ช้ากว่าอายุ 8 เดือน จึงต้องมาตามนัด<br>4. ผู้เรียนสามารถบอกได้ว่าเด็กที่เกิดจากแม่ติดเชื้อไวรัสตับอักเสบบีจะได้รับ HBIg และเจาะเลือดตรวจที่อายุ 9-12 เดือน | • age timeline (birth → 12 years) with vaccine chips at the printed ages; tap a chip for the disease name<br>• 'find the next vaccine' exercise using a sample completed record<br>• quiz on why the rotavirus window must not be missed | 60 s animation: timeline of childhood vaccines | high | P2 / R2 (NOT_STARTED) |
| MCH68-CH-005 | **วัคซีนเสริม (ทางเลือก)**<br>Optional vaccines | PDF 39, 40<br>(printed 37, 38) | educational | 1. ผู้เรียนสามารถบอกวัคซีนเสริมที่ระบุในสมุด (มือเท้าปากชนิดรุนแรง EV71 สุกใส ตับอักเสบเอ โควิด-19 ไข้เลือดออก) และอายุที่แนะนำ<br>2. ผู้เรียนสามารถแยกวัคซีนตามแผนงาน (EPI) และวัคซีนเสริมในหน้าบันทึกวัคซีนของสมุดได้ | • two-column sort: EPI vs optional<br>• tap-to-reveal ages and dose intervals | none – interactive only | high | P3 / R3 (NOT_STARTED) |
| MCH68-CH-006 | **ก่อนและหลังพาลูกไปรับวัคซีน**<br>Before and after vaccination | PDF 38, 39, 40, 41<br>(printed 36, 37, 38, 39) | educational | 1. ผู้เรียนสามารถบอกได้ว่าเด็กที่เจ็บป่วยเล็กน้อย เช่น หวัด ไอ หรือไข้ต่ำ ๆ สามารถรับวัคซีนได้ และต้องแจ้งแพทย์หากเด็กเคยแพ้ยาหรือมีอาการรุนแรงจากผลข้างเคียงของวัคซีน<br>2. ผู้เรียนสามารถดูแลไข้หลังรับวัคซีน (เช็ดตัวลดไข้ และกินยาลดไข้ได้ตามคำแนะนำของแพทย์) และบอกได้ว่าไม่ควรกินยาลดไข้ดักไว้ก่อน<br>3. ผู้เรียนสามารถดูแลแผลวัคซีนวัณโรค: อาจเป็นฝีขนาดเล็กนาน 3-4 สัปดาห์ ไม่ต้องใส่ยาหรือปิดแผล ใช้สำลีสะอาดชุบน้ำต้มสุกที่เย็นแล้วเช็ดรอบ ๆ แผล<br>4. ผู้เรียนสามารถบอกได้ว่าหากขาดนัดควรรีบมาติดตาม วัคซีนส่วนใหญ่เลยกำหนดฉีดต่อได้โดยไม่ต้องเริ่มใหม่ และต้องเก็บสมุดไว้เป็นหลักฐาน | • myth / fact cards (prophylactic antipyretic; vaccinating with a mild cold; missed dose)<br>• BCG-site care step-through<br>• appointment-keeping explainer (no push reminders unless PMH approves) | 45-60 s animation of the 6 pictogram bullets | medium | P1 / R1 (NOT_STARTED) |
| MCH68-CH-007 | **ตรวจสุขภาพเด็กปฐมวัยตามนัด: แต่ละช่วงอายุตรวจอะไร**<br>Well-child check-ups: what is checked at each age | PDF 42, 43<br>(printed 40, 41) | record-explainer | 1. ผู้เรียนสามารถบอกช่วงอายุที่พาลูกมาตรวจสุขภาพตามตารางในสมุด (แรกเกิดถึง 6 ปี)<br>2. ผู้เรียนสามารถบอกได้ว่าการตรวจแต่ละครั้งมีการชั่งน้ำหนัก วัดความยาว/ส่วนสูง รอบศีรษะ และตรวจอื่น ๆ ตามวัย (ความเข้มข้นเลือด สายตา การได้ยิน พัฒนาการ ช่องปาก)<br>3. ผู้เรียนสามารถอธิบายได้ว่าภาวะซีดจากการขาดธาตุเหล็กส่งผลต่อสติปัญญาของเด็ก จึงควรได้รับการคัดกรองภาวะซีดตามกำหนด<br>4. ผู้เรียนสามารถบอกได้ว่าผู้ปกครองเป็นผู้เฝ้าระวังพัฒนาการทุกช่วงอายุ ส่วนเจ้าหน้าที่คัดกรองพัฒนาการในบางช่วงอายุ | • visit timeline (14 ages): tap an age to see which checks are open in the record (derived from shading, PMH-verified)<br>• quiz: 'At which visits is Hct checked?' | none – interactive only | medium | P3 / R3 (NOT_STARTED) |

### การเจริญเติบโต + อาหารตามวัย (`growth`, PDF p44–59) — 8 lesson(s)

| ID | Thai title / English | Pages | Type | Objectives | Interactivity | Video | Risk | Priority / Release |
|---|---|---|---|---|---|---|---|---|
| MCH68-GROW-001 | **การใช้กราฟการเจริญเติบโตของลูก**<br>Using your child's growth chart | PDF 44<br>(printed 42) | educational | 1. ผู้เรียนสามารถอธิบายได้ว่าการประเมินการเจริญเติบโตต้องดูแนวโน้มการเปลี่ยนแปลงตามระยะเวลา ไม่ใช้การวัด ณ จุดใดจุดหนึ่ง<br>2. ผู้เรียนสามารถเลือกกราฟให้ถูกเพศของเด็ก และอ่านเส้นแนวนอน (อายุ) และเส้นแนวตั้ง (เส้นรอบศีรษะ น้ำหนัก หรือความยาว/ส่วนสูง)<br>3. ผู้เรียนสามารถจุดข้อมูลตัวอย่างในสมุด (เด็กหญิงสดใส อายุ 3 ปี 6 เดือน = 42 เดือน น้ำหนัก 16 กิโลกรัม สูง 100 เซนติเมตร) ลงกราฟได้ถูกต้อง | • plot-a-point exercise replicating the สดใส example with drag-to-intersect guides<br>• age-to-months conversion practice (3 ปี 6 เดือน = 42 เดือน) | 60 s animation of the worked example | medium | P2 / R2 (NOT_STARTED) |
| MCH68-GROW-002 | **แปลผลกราฟน้ำหนัก ส่วนสูง และรูปร่างของลูก**<br>Reading weight, height and body-shape results | PDF 45<br>(printed 43) | educational | 1. ผู้เรียนสามารถบอกระดับน้ำหนักตามเกณฑ์อายุ 5 ระดับและความหมายตามสมุด<br>2. ผู้เรียนสามารถบอกระดับส่วนสูงตามเกณฑ์อายุ 5 ระดับและความหมาย (เตี้ย = ขาดอาหารเรื้อรัง ส่งผลต่อสติปัญญา ทำให้เจ็บป่วยบ่อย)<br>3. ผู้เรียนสามารถบอกระดับน้ำหนักตามเกณฑ์ส่วนสูง 6 ระดับ (อ้วน เริ่มอ้วน ท้วม สมส่วน ค่อนข้างผอม ผอม) และความหมาย | • band explorer: tap each colour band to reveal its printed meaning<br>• matching: band name ↔ meaning | 45 s animation of the funnel-shaped band tables | high | P2 / R2 (NOT_STARTED) |
| MCH68-GROW-003 | **เส้นรอบศีรษะและกระหม่อมของลูก**<br>Head circumference and fontanelles | PDF 45, 46, 47<br>(printed 43, 44, 45) | educational | 1. ผู้เรียนสามารถบอกได้ว่าโดยเฉลี่ยเด็กแรกเกิดมีเส้นรอบศีรษะประมาณ 35 ซม.<br>2. ผู้เรียนสามารถบอกได้ว่ากระหม่อมหลังปิดอย่างช้าไม่เกิน 4 เดือน และกระหม่อมหน้าปิดอย่างช้าไม่เกิน 1 ปีครึ่ง<br>3. ผู้เรียนสามารถบอกได้ว่าเมื่อแนวโน้มเส้นรอบศีรษะเริ่มสูงกว่าเส้น 85th หรือเริ่มต่ำกว่าเส้น 15th ควรปรึกษาบุคลากรทางสาธารณสุข และเลือกกราฟตามเพศ (p44 ชาย / p45 หญิง ตามเลขหน้าพิมพ์) | • sample chart with a trend line drifting above the 85th curve → 'what should you do?'<br>• fontanelle closure timeline | none – interactive only | high | P3 / R3 (NOT_STARTED) |
| MCH68-GROW-004 | **บันทึกกราฟการเจริญเติบโตของลูกในสมุด (ชาย/หญิง)**<br>Recording growth in the handbook charts (boys/girls) | PDF 44, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 57<br>(printed 42, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 55) | record-explainer | 1. ผู้เรียนสามารถเลือกกราฟที่ถูกต้องตามเพศและอายุ (น้ำหนักตามเกณฑ์อายุ แรกเกิด-5 ปี; ความยาว 0-24 เดือน / ส่วนสูง 24-72 เดือน; น้ำหนักตามเกณฑ์ความยาว แรกเกิด-2 ปี; น้ำหนักตามเกณฑ์ส่วนสูง 2 ปีขึ้นไป; เส้นรอบวงศีรษะ)<br>2. ผู้เรียนสามารถบันทึกวัน เดือน ปี อายุ ค่าที่วัด และภาวะการเจริญเติบโตในตาราง "ผลการวัด"<br>3. ผู้เรียนสามารถบอกได้ว่าควรร่วมกับเจ้าหน้าที่สาธารณสุขบันทึกการเจริญเติบโตอย่างต่อเนื่อง และติดตามโดยชั่งน้ำหนักและวัดความยาวทุก 3 เดือน | • chart-picker wizard: sex + age → which handbook page to use<br>• fill-in practice for one 'ผลการวัด' row using sample data | none – interactive only | medium | P3 / R3 (NOT_STARTED) |
| MCH68-GROW-005 | **นมแม่อย่างเดียว 6 เดือน และอาหารมื้อแรกของลูก**<br>Exclusive breastfeeding to 6 months and baby's first food | PDF 56<br>(printed 54) | educational | 1. ผู้เรียนสามารถบอกได้ว่าทารกแรกเกิดถึง 6 เดือนควรกินนมแม่อย่างเดียว โดยไม่ต้องให้อาหารอื่น แม้แต่น้ำ<br>2. ผู้เรียนสามารถบอกได้ว่าอาหารมื้อแรกของลูกเริ่มได้ตั้งแต่อายุ 6 เดือน โดยไม่ต้องรอให้ฟันขึ้นก่อน<br>3. ผู้เรียนสามารถเริ่มอาหารตามวัยเดือนที่ 6 ตามตาราง (บดละเอียด ข้าวต้ม ไข่แดง เนื้อสัตว์ ผัก กล้วย) และค่อย ๆ เพิ่มปริมาณ<br>4. ผู้เรียนสามารถสังเกตการยอมรับอาหารและอาการแพ้อาหาร โดยเริ่มอาหารทีละอย่าง ครั้งละ 1-2 ช้อนชา และเว้นระยะ 2-3 วันก่อนเริ่มอาหารชนิดใหม่ | • stepper for month 6 (day 1-2 / day 3-7 / weeks 2-4) showing the printed amounts<br>• texture slider 'บดละเอียด' with approved photos<br>• new-food planner demo: one new food every 2-3 days | 60-90 s animation of the first month of complementary feeding | medium | P1 / R1 (NOT_STARTED) |
| MCH68-GROW-006 | **อาหารตามวัย 7-11 เดือน**<br>Complementary food from 7 to 11 months | PDF 57<br>(printed 55) | educational | 1. ผู้เรียนสามารถบอกจำนวนมื้ออาหารตามวัย (7 เดือน 1 แล้วเพิ่มเป็น 2 มื้อ; 8-9 เดือน 2 มื้อ; 10-11 เดือน 3 มื้อ) และลักษณะอาหาร (บดหยาบ สับละเอียด หั่นชิ้นเล็ก)<br>2. ผู้เรียนสามารถบอกปริมาณข้าว เนื้อสัตว์ ไข่ ตับ ผัก และผลไม้ตามช่วงอายุในตาราง<br>3. ผู้เรียนสามารถบอกได้ว่าไม่ควรปรุงแต่งรสอาหาร และต้องรักษาความสะอาดของวัตถุดิบ ภาชนะ และมือของผู้ปรุงและป้อนอาหาร<br>4. ผู้เรียนสามารถบอกได้ว่าควรกินนมแม่ควบคู่กับอาหารทารกตามวัยจนเด็กอายุ 2 ปี หรือนานกว่านั้น | • age selector (7 m wk 1-2 / 7 m wk 3-4 / 8-9 m / 10-11 m) → animated plate with printed amounts<br>• texture progression slider<br>• egg / liver 'สลับกับ' alternation calendar | 60 s animation | medium | P2 / R2 (NOT_STARTED) |
| MCH68-GROW-007 | **ธงโภชนาการสำหรับเด็ก 1-5 ปี**<br>Food guide flags for children aged 1-5 | PDF 58, 59<br>(printed 56, 57) | educational | 1. ผู้เรียนสามารถบอกปริมาณอาหารที่แนะนำใน 1 วันสำหรับเด็กอายุ 12-23 เดือน และ 2-5 ปี ตามธงโภชนาการ<br>2. ผู้เรียนสามารถบอกได้ว่าควรกินนมแม่ต่อเนื่องถึง 2 ปี และหากภาวะการเจริญเติบโตไม่เป็นไปตามเกณฑ์ ให้เสริมนมจืดวันละ 2 แก้ว<br>3. ผู้เรียนสามารถบอกพฤติกรรมเสริมตามสมุด: เล่นกับลูก นอนให้เพียงพอ กินอาหารรสธรรมชาติหรือปรุงแต่น้อย และพ่อแม่ร่วมรับประทานอาหารพร้อมกับเด็ก | • selector 12-23 m vs 2-5 y → animated flag with printed amounts<br>• build-a-day-menu game using the flag portions<br>• unit explainer: ช้อนกินข้าว (12-23 m flag) vs ทัพพี (2-5 y flag) | 60 s animation | medium | P2 / R2 (NOT_STARTED) |
| MCH68-GROW-008 | **ยาน้ำเสริมธาตุเหล็กสำหรับเด็ก 6 เดือน - 5 ปี**<br>Weekly iron syrup for children aged 6 months to 5 years | PDF 42, 43, 57, 58, 59<br>(printed 40, 41, 55, 56, 57) | educational | 1. ผู้เรียนสามารถบอกได้ว่าเด็กอายุ 6 เดือน - 5 ปี ทุกคน ต้องกินยาน้ำเสริมธาตุเหล็ก สัปดาห์ละ 1 ครั้ง<br>2. ผู้เรียนสามารถบอกได้ว่าควรกินไข่ทุกวัน หรือกินไข่สลับกับตับ ซึ่งเป็นแหล่งสำคัญของวิตามินเอและโฟเลต ร่วมด้วย<br>3. ผู้เรียนสามารถอธิบายได้ว่าภาวะซีดจากการขาดธาตุเหล็กส่งผลต่อสติปัญญาของเด็ก และยาน้ำเสริมธาตุเหล็กช่วยให้เด็กเจริญอาหาร | • weekly reminder demo (choose a weekday; local-only)<br>• true / false quiz | 30 s animation | high | P2 / R2 (NOT_STARTED) |

### พัฒนาการเด็ก (`dev`, PDF p60–63) — 5 lesson(s)

| ID | Thai title / English | Pages | Type | Objectives | Interactivity | Video | Risk | Priority / Release |
|---|---|---|---|---|---|---|---|---|
| MCH68-DEV-001 | **เฝ้าระวังพัฒนาการลูกด้วยคู่มือ DSPM**<br>Watching your child's development with DSPM | PDF 60, 61, 62, 63<br>(printed 58, 59, 60, 61) | educational | 1. ผู้เรียนสามารถอธิบายได้ว่าเครื่องมือประเมินพัฒนาการ DSPM จัดทำเพื่อให้พ่อแม่ผู้ดูแลประเมินพัฒนาการของเด็กอย่างต่อเนื่อง ใน 5 ด้าน (GM FM RL EL PS)<br>2. ผู้เรียนสามารถบอกช่วงอายุที่เจ้าหน้าที่สาธารณสุขช่วยคัดกรองพัฒนาการ (9, 18, 30, 42 และ 60 เดือน)<br>3. ผู้เรียนสามารถบอกได้ว่าเมื่อประเมินแล้วพบว่าสงสัยล่าช้า จำเป็นต้องเข้ารับการฝึกกระตุ้นตามนัด<br>4. ผู้เรียนสามารถบอกได้ว่าเด็กกลุ่มเสี่ยง (น้ำหนักแรกเกิดน้อยกว่า 2,500 กรัม หรือมีภาวะขาดออกซิเจนขณะคลอด) ใช้คู่มือ DAIM ในการประเมินแทน | • 5-domain wheel: tap a domain for its Thai/English name and one printed example item<br>• timeline of the staff screening ages<br>• explainer of how the checkboxes in the handbook are used | 60 s animation introducing the 5 domains and the parent's role | medium | P2 / R2 (NOT_STARTED) |
| MCH68-DEV-002 | **พัฒนาการตามวัย แรกเกิด - 12 เดือน**<br>Development milestones: birth to 12 months | PDF 60<br>(printed 58) | educational | 1. ผู้เรียนสามารถบอกพัฒนาการที่สมุดระบุในแต่ละช่วงอายุ แรกเกิด - 12 เดือน ทั้ง 5 ด้าน<br>2. ผู้เรียนสามารถหาช่องรายการพัฒนาการตามอายุลูกในสมุดและทำเครื่องหมายเมื่อลูกทำได้<br>3. ผู้เรียนสามารถบอกได้ว่าอายุ 9 เดือนเป็นช่วงที่เจ้าหน้าที่คัดกรองพัฒนาการ | • age × domain grid browser with recreated pictograms; tap to read the printed item<br>• flashcards: match a milestone to its age band | 60 s animated montage of the milestones (pictograms recreated with permission) | medium | P2 / R2 (NOT_STARTED) |
| MCH68-DEV-003 | **พัฒนาการตามวัย 13 - 41 เดือน**<br>Development milestones: 13 to 41 months | PDF 61<br>(printed 59) | educational | 1. ผู้เรียนสามารถบอกพัฒนาการที่สมุดระบุในแต่ละช่วงอายุ 13 - 41 เดือน ทั้ง 5 ด้าน<br>2. ผู้เรียนสามารถหาช่องรายการพัฒนาการตามอายุลูกในสมุดได้<br>3. ผู้เรียนสามารถบอกได้ว่าอายุ 18 และ 30 เดือนเป็นช่วงที่เจ้าหน้าที่คัดกรองพัฒนาการ | • age × domain grid browser with recreated pictograms<br>• flashcards: match a milestone to its age band | none – interactive only | medium | P3 / R3 (NOT_STARTED) |
| MCH68-DEV-004 | **พัฒนาการตามวัย 42 - 78 เดือน**<br>Development milestones: 42 to 78 months | PDF 62, 63<br>(printed 60, 61) | educational | 1. ผู้เรียนสามารถบอกพัฒนาการที่สมุดระบุในแต่ละช่วงอายุ 42 - 78 เดือน ทั้ง 5 ด้าน<br>2. ผู้เรียนสามารถหาช่องรายการพัฒนาการตามอายุลูกในสมุดได้<br>3. ผู้เรียนสามารถบอกได้ว่าอายุ 42 และ 60 เดือนเป็นช่วงที่เจ้าหน้าที่คัดกรองพัฒนาการ | • age × domain grid browser with recreated pictograms<br>• flashcards: match a milestone to its age band | none – interactive only | medium | P3 / R3 (NOT_STARTED) |
| MCH68-DEV-005 | **พ่อแม่ส่งเสริมพัฒนาการลูก: กอด คุย เล่านิทาน เล่นด้วยกัน**<br>Parents as the child's first teachers: hug, talk, read, play | PDF 33, 34, 58, 59, 63, 67<br>(printed 31, 32, 56, 57, 61) | educational | 1. ผู้เรียนสามารถบอกได้ว่าสมองของเด็กจะเพิ่มจำนวนเซลล์และเติบโตมากที่สุดใน 5 ขวบปีแรกของชีวิต<br>2. ผู้เรียนสามารถบอกได้ว่าพ่อแม่ผู้ดูแลมีบทบาทสำคัญในการฝึกกระตุ้นพัฒนาการของเด็ก เพราะมีเวลาอยู่กับเด็กมากที่สุด<br>3. ผู้เรียนสามารถบอกกิจกรรมส่งเสริมพัฒนาการตามสมุด: โอบกอด พูดคุย เล่านิทาน เล่นกับลูก และร่วมรับประทานอาหารพร้อมกับเด็ก<br>4. ผู้เรียนสามารถอธิบายได้ว่าการลงโทษด้วยการตีหยุดได้แค่ชั่วคราว แต่มีข้อเสียในระยะยาวมากกว่า | • daily-moments card deck (hug, talk, story, play, family meal)<br>• scenario: a child misbehaves — choose a response (options limited to handbook statements; hitting shown as not recommended) | 45-60 s warm animation of everyday family interactions | low | P1 / R1 (NOT_STARTED) |

### บันทึกการตรวจฟัน (`dental`, PDF p64–66) — 4 lesson(s)

| ID | Thai title / English | Pages | Type | Objectives | Interactivity | Video | Risk | Priority / Release |
|---|---|---|---|---|---|---|---|---|
| MCH68-DENT-001 | **ดูแลช่องปากลูกตามวัย แรกเกิด - 6 ปี**<br>Caring for your child's mouth from birth to 6 years | PDF 14, 35, 64, 66<br>(printed 12, 33, 62, 64) | educational | 1. ผู้เรียนสามารถทำความสะอาดช่องปากลูกตามวัย: 0-6 เดือน ใช้ผ้าสะอาดชุบน้ำต้มสุกที่เย็นแล้วเช็ดเหงือก กระพุ้งแก้ม และลิ้น วันละ 2 ครั้ง; 7-11 เดือน แปรงฟันตั้งแต่ซี่แรก; 1-3 ปี พ่อแม่แปรงให้วันละ 2 ครั้ง; 3-6 ปี ฝึกให้ลูกแปรงเองโดยพ่อแม่แปรงซ้ำ<br>2. ผู้เรียนสามารถบอกได้ว่าควรพบทันตแพทย์ครั้งแรกก่อนอายุ 1 ปี และพบต่อเนื่องทุก 6 เดือน และหากอายุ 1 ปีแล้วยังไม่มีฟันซี่แรกขึ้น ควรปรึกษาทันตแพทย์หรือทันตบุคลากร<br>3. ผู้เรียนสามารถบอกได้ว่าเมื่อพบฟันเริ่มผุเป็นรอยขาวขุ่น ต้องรีบไปพบทันตบุคลากรก่อนฟันผุลุกลาม<br>4. ผู้เรียนสามารถบอกวิธีไม่ส่งผ่านเชื้อฟันผุจากผู้ดูแลสู่เด็ก (ไม่ใช้ช้อนร่วมกัน ไม่เป่าอาหาร ไม่เคี้ยวอาหารให้เด็ก) | • age stepper (0-6 m / 7-11 m / 1-3 y / 3-6 y) with animated cleaning technique<br>• plaque-check explainer (small round-tipped plastic straw, as printed)<br>• myth / fact: 'wait until there are several teeth before brushing' | 60-90 s animation of gum wiping and brushing by age | medium | P1 / R1 (NOT_STARTED) |
| MCH68-DENT-002 | **ยาสีฟันฟลูออไรด์: ปริมาณที่เหมาะกับวัย**<br>Fluoride toothpaste: the right amount for each age | PDF 64, 66<br>(printed 62, 64) | educational | 1. ผู้เรียนสามารถบอกปริมาณยาสีฟันตามอายุ (ฟันซี่แรก-อายุต่ำกว่า 3 ปี: แตะขนแปรงพอเปียก หรือเท่าเมล็ดข้าวโพด; อายุ 3-ต่ำกว่า 6 ปี: บีบเท่ากับความกว้างแปรง หรือเท่าเมล็ดข้าวโพด; อายุ 6 ปีขึ้นไป: บีบเท่ากับความยาวแปรง)<br>2. ผู้เรียนสามารถบอกความเข้มข้นฟลูออไรด์ตามสมุด (ต่ำกว่า 6 ปี 1,000 ppm; 6 ปีขึ้นไป 1,500 ppm) และหาค่า ppm บนฉลากยาสีฟันได้<br>3. ผู้เรียนสามารถบอกได้ว่าการใช้ยาสีฟันที่มีฟลูออไรด์ 1,400-1,500 ppm ควรอยู่ภายใต้การแนะนำของทันตบุคลากร | • toothbrush picker by age with recreated images<br>• label-reading game: find the ppm on sample tube labels | 30-45 s animation | high | P2 / R2 (NOT_STARTED) |
| MCH68-DENT-003 | **พฤติกรรมเสี่ยงฟันผุในเด็ก: ทำไมทันตบุคลากรถามเรื่องนมและขนม**<br>Tooth-decay risk habits: why dental staff ask about milk and snacks | PDF 64<br>(printed 62) | staff-only-awareness | 1. ผู้เรียนสามารถบอกพฤติกรรมเสี่ยงฟันผุที่ทันตบุคลากรประเมิน (ดื่มนมรสหวาน ดื่มนมมื้อดึก ดูดนมขวด/หลับคาขวด ดูดเครื่องดื่มที่มีน้ำตาลจากขวดนม กินขนมหรือเครื่องดื่มที่มีน้ำตาลระหว่างมื้อมากกว่า 2 ครั้งต่อวัน ใช้ยาสีฟันที่มีฟลูออไรด์ต่ำกว่า 1,000 ppm)<br>2. ผู้เรียนสามารถเลือกการปรับพฤติกรรมเพื่อลดความเสี่ยงฟันผุได้<br>3. ผู้เรียนสามารถบอกได้ว่าทันตบุคลากรประเมินความเสี่ยงต่อสุขภาพช่องปากตั้งแต่อายุ 6 เดือนถึง 6 ปี และนัดติดตามตามระดับความเสี่ยง | • swap game: replace a risky-habit card with a safer one<br>• explainer of what the dental visit looks at (no colour-band scoring shown) | none – interactive only | medium | P3 / R3 (NOT_STARTED) |
| MCH68-DENT-004 | **บันทึกการขึ้นและหลุดของฟันลูก และการตรวจฟันโดยทันตบุคลากร**<br>Recording tooth eruption and loss; dental check records | PDF 65, 66<br>(printed 63, 64) | record-explainer | 1. ผู้เรียนสามารถบันทึกการขึ้นและหลุดของฟันน้ำนมแต่ละซี่ (A-E ใน 4 ส่วน: บนขวา บนซ้าย ล่างขวา ล่างซ้าย)<br>2. ผู้เรียนสามารถบอกได้ว่าเด็กแต่ละคนอาจมีฟันขึ้นได้เร็วช้าต่างกัน<br>3. ผู้เรียนสามารถบอกได้ว่าหน้าบันทึกการตรวจฟันเด็กและดัชนีคราบจุลินทรีย์เป็นส่วนที่ทันตบุคลากรบันทึก และฟันผุนำไปสู่โรคทางกายร้ายแรงอื่น ๆ ได้หลายโรค | • interactive tooth map: tap a tooth letter to learn its position (nothing stored)<br>• practice: record a sample eruption date in the right box | none – interactive only | low | P3 / R3 (NOT_STARTED) |


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

## 6. Clinical clarification / PMH-specific instructions needed

### 6a. Local instructions PMH must supply (the handbook gives none)

1. **Emergency route in pregnancy** (K-005, REC-003): where to go 24 hours a day (labour room / ER), phone number, and when to call 1669 versus coming by own transport. The handbook says "ต้องมาโรงพยาบาลทันที" but prints no number for pregnancy emergencies.
2. **Reduced fetal movements**: p15 says "แนะนำให้พบแพทย์" (< 3 per hour), while p26 lists "เด็กดิ้นน้อยลง หรือไม่ดิ้น" as "ต้องมาโรงพยาบาลทันที". PMH should give one clear instruction.
3. **Sick-baby route** (K-010, K-019, K-018): paediatric OPD hours vs ER after hours; where to bring a baby with pale stools urgently; where to bring a child after a seizure.
4. **Postpartum** (CH-001): who makes postnatal home visits in Phimai and how families are contacted; route for postpartum haemorrhage; **contraception advice** is listed on p35 but has no content in the handbook.
5. **Mental-health crisis pathway** (ASSESS-001, ASSESS-002): the handbook prints no crisis line or after-hours contact. Any hotline would be a PMH addition. PMH also needs a policy for the ♡ icon on p18–19, which implies mothers may fill in ST-5/2Q plus/EPDS themselves. The app will not offer self-scoring.
6. **Clinics and schedules**: ANC visit schedule (not printed), parenting-school session dates and booking, well-child/vaccine clinic days, dental clinic booking for pregnant women and for children before age 1, child-development stimulation (ฝึกกระตุ้น) clinic, lactation support, smoking-cessation and alcohol counselling.
7. **Birth registration** (INFO-001): where Phimai families register a birth within 15 days, and PMH's birth-notification process.
8. **Referral tier** (ANC-003): where PMH sits among รพ.สต. / รพช. / รพช.แม่ข่าย / รพท. / รพศ., and where high-risk women are referred.
9. **Vaccines** (ANC-002, CH-004, CH-005): which maternal vaccines PMH gives (aP / Tdap / TdaP, influenza) and whether free; which rotavirus vaccine (monovalent or pentavalent); which p39 vaccines are EPI vs optional; which optional vaccines PMH offers and their cost; who gives HPV (ป.5) and dT at 12 years.
10. **Medicines with no dose printed**: maternal iron/iodine/folic tablets (K-003, OVR-001 item 1), calcium supplement for low milk intake (K-001), child iron syrup weekly 6 months–5 years (GROW-008), antipyretics (K-018, CH-006). The handbook gives no product, amount or side-effect advice. PMH pharmacy must decide what to say; nothing may be invented.
11. **Plain-language purposes** of tests and screenings that the handbook only names (ANC-001 blood tests and Down syndrome tests, REC-001 visit checks, CH-002 newborn screening). PMH must write and approve these, or the lessons stay at "name only".
12. **Local context for illustrations only** (K-013, K-014, K-015, K-004): rural housing, motorcycles, water jars and ponds, local fermented foods. Adding local examples must not add new rules.

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

### R1 — core, low-to-medium-risk lessons for pregnancy and the newborn period (15 lessons)

**Rationale.** These lessons give the widest benefit for women attending PMH ANC and early postnatal care. They contain no danger-sign triage, first aid, screening cut-offs or vaccine schedules, so one reviewer per discipline can sign them off quickly. They also do not depend on local emergency instructions. INFO-002 is included so that the app can be introduced at parenting-school sessions, its natural delivery channel. OVR-001 is the pilot and is already drafted.

- MCH68-OVR-001 — 15 ข้อ เพื่อแม่ลูกสุขภาพดี (low, P1)
- MCH68-OVR-002 — รู้จักสมุดบันทึกสุขภาพแม่และเด็ก (low, P1)
- MCH68-INFO-002 — โรงเรียนพ่อแม่ 7 ครั้ง (low, P2)
- MCH68-REC-002 — การดูแลฟันแม่ขณะตั้งครรภ์ (low, P1)
- MCH68-ASSESS-003 — งดสุราและบุหรี่ ระหว่างตั้งครรภ์และให้นมลูก (low, P1)
- MCH68-K-001 — ธงโภชนาการ คืออะไร? อาหาร 6 กลุ่ม (low, P1)
- MCH68-K-002 — กินอย่างไรในแต่ละไตรมาส และช่วงให้นมลูก (medium, P1)
- MCH68-K-004 — ข้อปฏิบัติการกินเพื่อสุขภาพที่ดี 9 ข้อ สำหรับหญิงตั้งครรภ์และหญิงให้นมบุตร (low, P1)
- MCH68-K-006 — ออกกำลังกายระหว่างตั้งครรภ์และหลังคลอด (medium, P1)
- MCH68-K-007 — เลี้ยงลูกด้วยนมแม่: ทำไมสำคัญ และ 3 ดูด (medium, P1)
- MCH68-K-008 — การเก็บและละลายน้ำนมแม่ (medium, P1)
- MCH68-CH-006 — ก่อนและหลังพาลูกไปรับวัคซีน (medium, P1)
- MCH68-GROW-005 — นมแม่อย่างเดียว 6 เดือน และอาหารมื้อแรกของลูก (medium, P1)
- MCH68-DEV-005 — พ่อแม่ส่งเสริมพัฒนาการลูก: กอด คุย เล่านิทาน เล่นด้วยกัน (low, P1)
- MCH68-DENT-001 — ดูแลช่องปากลูกตามวัย แรกเกิด - 6 ปี (medium, P1)

### R2 — high-risk safety lessons and the rest of the core (30 lessons)

**Rationale.** These lessons hold danger signs, first aid and CPR, vaccine windows, supplement and medicine schedules, mental-health awareness with suicide-risk safe messaging, and the remaining infant feeding, growth and development content. Each one needs (a) named clinical sign-off on every threshold and step, and (b) the PMH-specific instructions in §6a, above all emergency contact routes, before release. First-aid lessons should go live together with an offer of hands-on practice.

- MCH68-INFO-001 — ข้อมูลครอบครัว และการแจ้งเกิดภายใน 15 วัน (low, P2)
- MCH68-ANC-001 — ผลตรวจเลือดตอนฝากครรภ์ของแม่และสามี (medium, P2)
- MCH68-ANC-002 — วัคซีนสำหรับหญิงตั้งครรภ์ (high, P2)
- MCH68-REC-001 — มาฝากครรภ์ตามนัด: แต่ละครั้งเจ้าหน้าที่ตรวจอะไรบ้าง (medium, P2)
- MCH68-REC-003 — การนับลูกดิ้น (high, P2)
- MCH68-REC-004 — น้ำหนักที่เพิ่มขึ้นขณะตั้งครรภ์ และกราฟ Vallop curve (high, P2)
- MCH68-ASSESS-001 — ดูแลใจระหว่างตั้งครรภ์: ความเครียดและการผ่อนคลาย (high, P2)
- MCH68-ASSESS-002 — ภาวะซึมเศร้าหลังคลอด เกิดขึ้นได้กับทุกคน (high, P2)
- MCH68-K-003 — ยาเม็ดเสริมธาตุเหล็ก ไอโอดีน และโฟลิก ทุกวัน (high, P2)
- MCH68-K-005 — อาการผิดปกติที่แม่ท้องต้องมาโรงพยาบาลทันที (high, P2)
- MCH68-K-009 — ฝึกลูกเข้านอน: ชั่วโมงนอนตามวัย (low, P2)
- MCH68-K-010 — สีอุจจาระทารก: สีซีดต้องรีบพบกุมารแพทย์ (high, P2)
- MCH68-K-012 — สื่อหน้าจอกับพัฒนาการเด็ก (low, P2)
- MCH68-K-013 — ป้องกันการบาดเจ็บในบ้าน (low, P2)
- MCH68-K-014 — ปลอดภัยบนท้องถนน: ที่นั่งนิรภัย รถจักรยานยนต์ และไม่ทิ้งเด็กในรถ (medium, P2)
- MCH68-K-015 — ป้องกันการจมน้ำและการอุดกั้นทางเดินหายใจ (low, P2)
- MCH68-K-016 — สิ่งแปลกปลอมติดคอ: วิธีช่วยเหลือเด็ก (high, P2)
- MCH68-K-017 — กู้ชีพเด็กโดยการกดหัวใจ (high, P2)
- MCH68-K-018 — ปฐมพยาบาลเมื่อลูกชักจากไข้สูง (high, P2)
- MCH68-K-019 — อาการที่ต้องพาทารกไปพบแพทย์ (high, P2)
- MCH68-CH-001 — หลังคลอด: อาการผิดปกติของแม่ที่ต้องพบแพทย์ทันที และการเยี่ยมหลังคลอด (high, P2)
- MCH68-CH-004 — วัคซีนพื้นฐานของลูก (EPI) (high, P2)
- MCH68-GROW-001 — การใช้กราฟการเจริญเติบโตของลูก (medium, P2)
- MCH68-GROW-002 — แปลผลกราฟน้ำหนัก ส่วนสูง และรูปร่างของลูก (high, P2)
- MCH68-GROW-006 — อาหารตามวัย 7-11 เดือน (medium, P2)
- MCH68-GROW-007 — ธงโภชนาการสำหรับเด็ก 1-5 ปี (medium, P2)
- MCH68-GROW-008 — ยาน้ำเสริมธาตุเหล็กสำหรับเด็ก 6 เดือน - 5 ปี (high, P2)
- MCH68-DEV-001 — เฝ้าระวังพัฒนาการลูกด้วยคู่มือ DSPM (medium, P2)
- MCH68-DEV-002 — พัฒนาการตามวัย แรกเกิด - 12 เดือน (medium, P2)
- MCH68-DENT-002 — ยาสีฟันฟลูออไรด์: ปริมาณที่เหมาะกับวัย (high, P2)

### R3 — record explainers, staff-only awareness and later-childhood detail (13 lessons)

**Rationale.** These lessons explain record pages and staff tools ("why the nurse does this"), or cover older-child detail. They matter less for early use, and several depend on unresolved items: the shading-derived well-child schedule (p42–43), chart redraw permissions (p46–55), and plain-language test purposes that PMH has to write.

- MCH68-INFO-003 — ทำไมต้องเล่าประวัติสุขภาพและการตั้งครรภ์ที่ผ่านมาให้ครบ (low, P3)
- MCH68-ANC-003 — ทำไมเจ้าหน้าที่ประเมินความเสี่ยงการตั้งครรภ์ทุกครั้งที่มาฝากครรภ์ (medium, P3)
- MCH68-K-011 — ฝึกขับถ่าย และการขับถ่ายรดที่นอน (medium, P3)
- MCH68-CH-002 — ลูกแรกเกิดได้รับการตรวจคัดกรองอะไรบ้าง (medium, P3)
- MCH68-CH-003 — บันทึกสุขภาพเด็ก: แพ้ยา แพ้อาหาร และการเจ็บป่วยสำคัญ (low, P3)
- MCH68-CH-005 — วัคซีนเสริม (ทางเลือก) (high, P3)
- MCH68-CH-007 — ตรวจสุขภาพเด็กปฐมวัยตามนัด: แต่ละช่วงอายุตรวจอะไร (medium, P3)
- MCH68-GROW-003 — เส้นรอบศีรษะและกระหม่อมของลูก (high, P3)
- MCH68-GROW-004 — บันทึกกราฟการเจริญเติบโตของลูกในสมุด (ชาย/หญิง) (medium, P3)
- MCH68-DEV-003 — พัฒนาการตามวัย 13 - 41 เดือน (medium, P3)
- MCH68-DEV-004 — พัฒนาการตามวัย 42 - 78 เดือน (medium, P3)
- MCH68-DENT-003 — พฤติกรรมเสี่ยงฟันผุในเด็ก: ทำไมทันตบุคลากรถามเรื่องนมและขนม (medium, P3)
- MCH68-DENT-004 — บันทึกการขึ้นและหลุดของฟันลูก และการตรวจฟันโดยทันตบุคลากร (low, P3)
