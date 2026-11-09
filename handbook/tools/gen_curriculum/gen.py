# -*- coding: utf-8 -*-
import json, sys, os
from collections import Counter, OrderedDict

sys.path.insert(0, os.path.dirname(__file__))
from lessons_data import L  # noqa

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../.."))

SECTIONS = json.load(open(f"{ROOT}/content/sections.json", encoding="utf-8"))
SEC_ORDER = [s["id"] for s in SECTIONS]
SEC = {s["id"]: s for s in SECTIONS}
CODE = {"overview": "OVR", "info": "INFO", "anc": "ANC", "record": "REC", "assess": "ASSESS",
        "knowledge": "K", "childhealth": "CH", "growth": "GROW", "dev": "DEV", "dental": "DENT"}


def printed(p):
    return str(p - 2) if 3 <= p <= 66 else None


KEYS = ["lessonId", "sectionId", "titleTh", "titleEn", "pdfPages", "printedPages", "contentType",
        "objectivesTh", "interactivity", "videoTreatment", "audience", "clinicalRisk",
        "reviewRequirements", "pmhClarificationNeeded", "priority", "release", "status", "videoStatus"]

out = []
for l in L:
    l = dict(l)
    l["pdfPages"] = sorted(set(l["pdfPages"]))
    l["printedPages"] = [printed(p) for p in l["pdfPages"] if printed(p)]
    l.setdefault("status", "NOT_STARTED")
    l.setdefault("videoStatus", "NOT_STARTED")
    assert l["lessonId"].startswith(f"MCH68-{CODE[l['sectionId']]}-"), l["lessonId"]
    assert 2 <= len(l["objectivesTh"]) <= 4, l["lessonId"]
    assert all(o.startswith("ผู้เรียน") for o in l["objectivesTh"]), l["lessonId"]
    assert l["contentType"] in ("educational", "record-explainer", "staff-only-awareness")
    assert l["clinicalRisk"] in ("low", "medium", "high")
    assert l["priority"] in ("P1", "P2", "P3") and l["release"] in ("R1", "R2", "R3")
    out.append(OrderedDict((k, l[k]) for k in KEYS))

ids = [l["lessonId"] for l in out]
assert len(ids) == len(set(ids))
# sort by section order then id
out.sort(key=lambda l: (SEC_ORDER.index(l["sectionId"]), l["lessonId"]))

with open(f"{ROOT}/content/curriculum.json", "w", encoding="utf-8") as f:
    json.dump(out, f, ensure_ascii=False, indent=2)
    f.write("\n")

# ------------------------------------------------------------------ page TOC
# (pdf, sectionId or front/back, title, type)
P = [
    (1, "front", "สมุดบันทึกสุขภาพแม่และเด็ก (ปกหน้า)", "COVER/ADMIN"),
    (2, "front", "ภาพแรกของหนู (ภาพอัลตราซาวนด์); คำแนะนำสมุดบันทึกสุขภาพแม่และเด็ก", "MIXED"),
    (3, "info", "ข้อมูลครอบครัว", "RECORD-FORM"),
    (4, "info", "โรงเรียนพ่อแม่ : Parenting School", "RECORD-FORM"),
    (5, "info", "ประวัติสุขภาพของหญิงตั้งครรภ์และครอบครัว", "RECORD-FORM"),
    (6, "anc", "ประวัติการตั้งครรภ์ปัจจุบัน; รายงานการตรวจเลือด; การตรวจภาวะดาวน์ซินโดรม", "RECORD-FORM"),
    (7, "anc", "ประวัติวัคซีนหญิงตั้งครรภ์", "RECORD-FORM (with clinical footnotes)"),
    (8, "anc", "ประเมินความเสี่ยงของหญิงตั้งครรภ์ ฝากครรภ์ ครั้งที่ 1", "STAFF-ONLY"),
    (9, "anc", "ติดตามความเสี่ยงของหญิงตั้งครรภ์เมื่อมาฝากครรภ์; ประเมินความเสี่ยงของหญิงตั้งครรภ์เพื่อพิจารณาสถานที่ฝากครรภ์", "STAFF-ONLY"),
    (10, "record", "บันทึกการตรวจครรภ์ 1/2; การคัดกรองเบาหวาน", "RECORD-FORM"),
    (11, "record", "วันกำหนดคลอด (EDC); ผลการตรวจอัลตราซาวนด์", "RECORD-FORM"),
    (12, "record", "บันทึกการตรวจครรภ์ 2/2; การตรวจหัวนม", "RECORD-FORM"),
    (13, "record", "ความผิดปกติที่พบระหว่างฝากครรภ์/ความเสี่ยงที่พบ; หมายเหตุ", "RECORD-FORM"),
    (14, "record", "การตรวจสุขภาพช่องปาก; การดูแลฟันแม่", "MIXED"),
    (15, "record", "การนับลูกดิ้น", "MIXED"),
    (16, "record", "กราฟการเพิ่มขึ้นของน้ำหนักหญิงตั้งครรภ์ (Vallop curve)", "MIXED"),
    (17, "record", "ตารางบันทึกการเพิ่มขึ้นของน้ำหนักขณะตั้งครรภ์ (+ กราฟ 3-4)", "MIXED"),
    (18, "assess", "แบบประเมินสุขภาพจิตหญิงตั้งครรภ์และหลังคลอด: ST-5; 2Q plus", "STAFF-ONLY (♡ — self-report screening)"),
    (19, "assess", "การประเมินการดื่มสุรา; แบบประเมินภาวะซึมเศร้าหลังคลอด (EPDS)", "STAFF-ONLY (♡ — self-report screening)"),
    (20, "assess", "การบันทึกผลการประเมินภาวะสุขภาพจิตและการดูแลช่วยเหลือ — บันทึกสำหรับหญิงตั้งครรภ์", "RECORD-FORM"),
    (21, "assess", "บันทึกสุขภาพจิตมารดา หลังคลอด 4-6 สัปดาห์; หลังคลอดมากกว่า 6 สัปดาห์", "RECORD-FORM"),
    (22, "knowledge", "ธงโภชนาการ คืออะไร?", "EDUCATIONAL"),
    (23, "knowledge", "ธงโภชนาการหญิงตั้งครรภ์ ไตรมาสที่ 1", "EDUCATIONAL"),
    (24, "knowledge", "ธงโภชนาการหญิงตั้งครรภ์ ไตรมาสที่ 2", "EDUCATIONAL"),
    (25, "knowledge", "ธงโภชนาการหญิงตั้งครรภ์ ไตรมาสที่ 3 และหญิงให้นมบุตร 6 เดือนแรก", "EDUCATIONAL"),
    (26, "knowledge", "ข้อปฏิบัติการกินเพื่อสุขภาพที่ดี สำหรับหญิงตั้งครรภ์และหญิงให้นมบุตร; อาการผิดปกติที่แม่ท้อง ต้องมาโรงพยาบาลทันที", "EDUCATIONAL"),
    (27, "knowledge", "ข้อแนะนำกิจกรรมทางกาย สำหรับหญิงตั้งครรภ์และหญิงหลังคลอด", "EDUCATIONAL"),
    (28, "knowledge", "การเลี้ยงลูกด้วยนมแม่; 3 ดูด กระตุ้นนมแม่; สูตรนมแม่ต่อเนื่อง; การเก็บน้ำนมแม่", "EDUCATIONAL"),
    (29, "knowledge", "ฝึกลูกเข้านอน; การขับถ่าย", "EDUCATIONAL"),
    (30, "knowledge", "สื่อหน้าจอกับพัฒนาการเด็ก; การป้องกันการบาดเจ็บในเด็ก", "EDUCATIONAL"),
    (31, "knowledge", "การป้องกันการบาดเจ็บทางจราจร; การป้องกันการจมน้ำ; การป้องกันการอุดกั้นทางเดินหายใจ", "EDUCATIONAL"),
    (32, "knowledge", "การช่วยเหลือเมื่อมีสิ่งแปลกปลอมหลุดเข้าทางเดินหายใจ; กู้ชีพโดยการกดหัวใจ", "EDUCATIONAL"),
    (33, "knowledge", "การปฐมพยาบาลเมื่อเด็กชัก; อาการที่ต้องพาทารกไปพบแพทย์; รวมคลังความรู้ในการดูแลแม่และเด็ก", "EDUCATIONAL"),
    (34, "childhealth", "ติดรูป / ข้อความจากคุณแม่คุณพ่อ....ถึงลูกน้อย; บริการ \"9 ย่างเพื่อสร้างลูก\"", "RECORD-FORM (keepsake + service info)"),
    (35, "childhealth", "บันทึกการคลอด; บันทึกการเยี่ยมหลังคลอด", "STAFF-ONLY (with parent-relevant danger-sign list)"),
    (36, "childhealth", "บันทึกทารกแรกเกิด", "STAFF-ONLY"),
    (37, "childhealth", "บันทึกสุขภาพเด็ก", "RECORD-FORM"),
    (38, "childhealth", "บันทึกการรับวัคซีน — วัคซีนตามแผนงานสร้างเสริมภูมิคุ้มกันโรค (EPI)", "RECORD-FORM"),
    (39, "childhealth", "บันทึกการรับวัคซีน (ต่อ); วัคซีนเสริมอื่นๆ (Optional vaccine)", "RECORD-FORM"),
    (40, "childhealth", "บันทึกการรับวัคซีน (ต่อ); คำแนะนำเกี่ยวกับการได้รับวัคซีน", "MIXED"),
    (41, "childhealth", "นัดหมายการรับวัคซีน", "RECORD-FORM"),
    (42, "childhealth", "บันทึกการตรวจสุขภาพเด็กปฐมวัย (ซ้าย)", "STAFF-ONLY"),
    (43, "childhealth", "บันทึกการตรวจสุขภาพเด็กปฐมวัย (ขวา)", "STAFF-ONLY (one parent-assessed column)"),
    (44, "growth", "การใช้กราฟแสดงการเจริญเติบโต; คำแนะนำการลงข้อมูลในกราฟ", "EDUCATIONAL"),
    (45, "growth", "การแปลผลกราฟติดตามการเจริญเติบโตของเด็ก", "EDUCATIONAL"),
    (46, "growth", "กราฟเส้นรอบวงศีรษะสำหรับเด็กชาย", "RECORD-FORM"),
    (47, "growth", "กราฟเส้นรอบวงศีรษะสำหรับเด็กหญิง", "RECORD-FORM"),
    (48, "growth", "กราฟน้ำหนักตามเกณฑ์อายุ แรกเกิด - 5 ปี เพศชาย", "RECORD-FORM"),
    (49, "growth", "กราฟความยาว/ส่วนสูงตามเกณฑ์อายุ แรกเกิด - 5 ปี เพศชาย", "RECORD-FORM"),
    (50, "growth", "กราฟน้ำหนักตามเกณฑ์ความยาว แรกเกิด - 2 ปี เพศชาย", "RECORD-FORM"),
    (51, "growth", "กราฟน้ำหนักตามเกณฑ์ความยาว (ส่วนสูง) 2 ปีขึ้นไป เพศชาย", "RECORD-FORM"),
    (52, "growth", "กราฟน้ำหนักตามเกณฑ์อายุ แรกเกิด - 5 ปี เพศหญิง", "RECORD-FORM"),
    (53, "growth", "กราฟความยาว/ส่วนสูงตามเกณฑ์อายุ แรกเกิด - 5 ปี เพศหญิง", "RECORD-FORM"),
    (54, "growth", "กราฟน้ำหนักตามเกณฑ์ความยาว แรกเกิด - 2 ปี เพศหญิง", "RECORD-FORM"),
    (55, "growth", "กราฟน้ำหนักตามเกณฑ์ความยาว (ส่วนสูง) 2 ปีขึ้นไป เพศหญิง", "RECORD-FORM"),
    (56, "growth", "อาหารที่แนะนำใน 1 วัน สำหรับทารกแรกเกิด - 11 เดือน 29 วัน (1/2)", "EDUCATIONAL"),
    (57, "growth", "อาหารที่แนะนำใน 1 วัน สำหรับทารกแรกเกิด - 11 เดือน 29 วัน (2/2)", "EDUCATIONAL"),
    (58, "growth", "ธงโภชนาการ สำหรับเด็กอายุ 12 - 23 เดือน", "EDUCATIONAL"),
    (59, "growth", "ธงโภชนาการ สำหรับเด็กอายุ 2 - 5 ปี", "EDUCATIONAL"),
    (60, "dev", "DSPM: แรกเกิด - 12 เดือน", "RECORD-FORM (parent checklist)"),
    (61, "dev", "DSPM: 13 - 41 เดือน", "RECORD-FORM (parent checklist)"),
    (62, "dev", "DSPM: 42 - 72 เดือน", "RECORD-FORM (parent checklist)"),
    (63, "dev", "DSPM: 73 - 78 เดือน; คู่มือ DSPM / DAIM", "MIXED"),
    (64, "dental", "การประเมินความเสี่ยงต่อสุขภาพช่องปาก", "STAFF-ONLY"),
    (65, "dental", "บันทึกการตรวจฟันเด็ก โดยทันตบุคลากร", "STAFF-ONLY"),
    (66, "dental", "บันทึกการขึ้นและหลุดของฟันเด็ก โดยผู้ปกครอง; เฝ้าดูฟัน 6 ขวบปีแรก", "MIXED"),
    (67, "overview", "คุณลักษณะที่พึงประสงค์สำหรับคุณแม่ เพื่อลูกสุขภาพดี", "EDUCATIONAL"),
    (68, "back", "ปกหลัง (ข้อมูลการพิมพ์และลิขสิทธิ์)", "COVER/ADMIN"),
]
assert [p[0] for p in P] == list(range(1, 69))
PT = {p[0]: p for p in P}

# Notes on the part of a page NOT covered by a lesson (or why no lesson)
NOTE = {
    1: "Cover only; tab layout used in OVR-002",
    3: "Form itself is filled with staff; lesson explains it",
    4: "Attendance log signed by staff; lesson explains schedule",
    5: "History form filled with staff",
    6: "Lab results recorded by staff; no result interpretation taught",
    8: "Staff checklist & colour codes NOT shown to families",
    9: "Staff grid NOT shown; only the 4-tier care-level idea",
    10: "OGTT/GCT cut-off table is staff-only — not taught",
    11: "Visit/ultrasound table filled by staff",
    13: "Free-text record; only the travel tip is taught",
    16: "Vallop band boundaries need source data",
    18: "ST-5 / 2Q plus items and scoring NOT reproduced (no self-scoring)",
    19: "EPDS items and scoring NOT reproduced (no self-scoring)",
    20: "Result log filled by staff",
    21: "Result log filled by staff",
    33: "6 QR resources ('รวมคลังความรู้') — link-out list only, no lesson",
    34: "Keepsake photo/message page — record form, no lesson (personal keepsake); service text and tip used",
    35: "Delivery record (บันทึกการคลอด) is staff-only",
    36: "Staff form; jaundice thresholds blank",
    41: "Appointment log — record form, no lesson (blank appointment table); only the margin tip is used",
    42: "Staff-filled; schedule derived from shading",
    43: "Staff-filled; schedule derived from shading",
    46: "Plotting chart (record form)",
    47: "Plotting chart (record form)",
    48: "Plotting chart (record form)",
    49: "Plotting chart (record form); title says 'น้ำหนัก' on a height chart",
    50: "Plotting chart (record form)",
    51: "Plotting chart (record form); no source footnote",
    52: "Plotting chart (record form)",
    53: "Plotting chart (record form); title says 'น้ำหนัก' on a height chart",
    54: "Plotting chart (record form); no source footnote",
    55: "Plotting chart (record form); no source footnote",
    63: "DSPM/DAIM manual covers & QR — link-out only",
    64: "Colour-band scoring and fluoride-varnish rules stay staff-only",
    65: "Dental charting and Mombelli plaque index are staff-only",
    68: "record form – no lesson (back cover: free-distribution and copyright notice, publisher and printing data; cited as the source in CURRICULUM.md)",
}

cover = {p: [] for p in range(1, 69)}
for l in out:
    for p in l["pdfPages"]:
        cover[p].append(l["lessonId"].replace("MCH68-", ""))
uncovered = [p for p in range(1, 69) if not cover[p]]
assert uncovered == [68], uncovered

# ------------------------------------------------------------------ counts
by_sec = Counter(l["sectionId"] for l in out)
by_risk = Counter(l["clinicalRisk"] for l in out)
by_pri = Counter(l["priority"] for l in out)
by_rel = Counter(l["release"] for l in out)
by_type = Counter(l["contentType"] for l in out)

stats = dict(total=len(out), by_sec=by_sec, by_risk=by_risk, by_pri=by_pri, by_rel=by_rel, by_type=by_type)


def pp(l):
    s = ", ".join(str(p) for p in l["pdfPages"])
    pr = ", ".join(l["printedPages"]) or "—"
    return f"PDF {s}<br>(printed {pr})"


def esc(s):
    return s.replace("|", "\\|")


def lesson_tables():
    md = []
    for sid in SEC_ORDER:
        s = SEC[sid]
        ls = [l for l in out if l["sectionId"] == sid]
        md.append(f"### {s['title']} (`{sid}`, PDF p{s['pdfPages'][0]}–{s['pdfPages'][1]}) — {len(ls)} lesson(s)\n")
        md.append("| ID | Thai title / English | Pages | Type | Objectives | Interactivity | Video | Risk | Priority / Release |")
        md.append("|---|---|---|---|---|---|---|---|---|")
        for l in ls:
            obj = "<br>".join(f"{i+1}. {esc(o)}" for i, o in enumerate(l["objectivesTh"]))
            inter = "<br>".join(f"• {esc(x)}" for x in l["interactivity"])
            md.append(
                f"| {l['lessonId']} | **{esc(l['titleTh'])}**<br>{esc(l['titleEn'])} | {pp(l)} | {l['contentType']} | {obj} | {inter} | {esc(l['videoTreatment'])} | {l['clinicalRisk']} | {l['priority']} / {l['release']} ({l['status']}) |")
        md.append("")
    return "\n".join(md)


def toc():
    md = []
    groups = [("front", "Front matter (no section tab)")] + [(s["id"], f"{s['title']} (`{s['id']}`)") for s in SECTIONS if s["id"] != "overview"] + [("overview", f"{SEC['overview']['title']} (`overview`) — unnumbered page"), ("back", "Back matter")]
    for gid, gname in groups:
        rows = [p for p in P if p[1] == gid]
        md.append(f"**{gname}**\n")
        md.append("| PDF p | Printed p | Page title | Page type |")
        md.append("|---|---|---|---|")
        for p in rows:
            md.append(f"| {p[0]} | {printed(p[0]) or '—'} | {esc(p[2])} | {p[3]} |")
        md.append("")
    return "\n".join(md)


def coverage():
    md = ["| PDF p | Printed p | Type | Lesson ID(s) | Notes (parts with no lesson) |", "|---|---|---|---|---|"]
    for p in range(1, 69):
        ids = ", ".join(cover[p]) if cover[p] else "**none**"
        md.append(f"| {p} | {printed(p) or '—'} | {PT[p][3]} | {ids} | {esc(NOTE.get(p, ''))} |")
    return "\n".join(md)


def release_list(r):
    return "\n".join(f"- {l['lessonId']} — {l['titleTh']} ({l['clinicalRisk']}, {l['priority']})" for l in out if l["release"] == r)


json.dump({k: dict(v) if isinstance(v, Counter) else v for k, v in stats.items()}, sys.stdout, ensure_ascii=False, indent=1)
print()
print("uncovered:", uncovered)

with open(os.path.join(os.path.dirname(__file__), "parts.json"), "w", encoding="utf-8") as f:
    json.dump({"lessons": lesson_tables(), "toc": toc(), "coverage": coverage(),
               "R1": release_list("R1"), "R2": release_list("R2"), "R3": release_list("R3"),
               "stats": {k: dict(v) if isinstance(v, Counter) else v for k, v in stats.items()}},
              f, ensure_ascii=False, indent=1)
