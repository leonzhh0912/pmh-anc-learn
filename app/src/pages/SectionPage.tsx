import { Link, useParams } from "react-router";
import { lessonsInSection, sections } from "../content/load";
import { useProgress } from "../lib/progress";
import { printedLabel } from "../lib/pages";

export function SectionPage() {
  const { sectionId = "" } = useParams();
  const section = sections.find((s) => s.id === sectionId);
  const progress = useProgress();

  if (!section) {
    return (
      <main className="page">
        <h1>ไม่พบหมวดนี้</h1>
        <Link to="/">กลับหน้าแรก</Link>
      </main>
    );
  }
  const items = lessonsInSection(section.id);

  return (
    <main className="page section" style={{ ["--section-color" as string]: section.tabColor }}>
      <Link to="/" className="lesson__back">
        ‹ หน้าแรก
      </Link>
      <h1 className="section__title">{section.title}</h1>
      <p>{section.description}</p>
      <p className="section__pages">
        ในสมุดสีชมพู:{" "}
        {section.pdfPages[0] === section.pdfPages[1]
          ? printedLabel(section.pdfPages[0])
          : `หน้า ${section.pdfPages[0] - 2}–${section.pdfPages[1] - 2}`}
      </p>

      {items.length === 0 ? (
        <p className="notice">
          {section.kind === "record"
            ? "หมวดนี้เป็นแบบบันทึกที่คุณกรอกในสมุดร่วมกับเจ้าหน้าที่ แอปนี้ไม่เก็บข้อมูลสุขภาพส่วนตัว จะมีบทเรียนอธิบายวิธีอ่านและใช้แบบบันทึกในรุ่นต่อไป"
            : "บทเรียนในหมวดนี้กำลังจัดทำและรอการตรวจทานจากทีมแพทย์ ระหว่างนี้อ่านได้จากสมุดสีชมพู"}
        </p>
      ) : (
        <ul className="lesson-list">
          {items.map((l) => {
            const p = progress.lessons[l.id];
            const state = p?.completedAt ? "เรียนจบแล้ว" : p ? "เรียนค้างไว้" : "ยังไม่ได้เริ่ม";
            return (
              <li key={l.id}>
                <Link to={`/lesson/${l.id}`} className="lesson-row">
                  <span className="lesson-row__title">{l.title}</span>
                  <span className="lesson-row__summary">{l.summary}</span>
                  <span className="lesson-row__meta">
                    <span>ประมาณ {l.minutes} นาที</span>
                    <span className={p?.completedAt ? "is-done" : ""}>{state}</span>
                    {l.editorial.status !== "APPROVED" && l.editorial.status !== "PUBLISHED" && (
                      <span className="tag-draft">ฉบับร่าง</span>
                    )}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
