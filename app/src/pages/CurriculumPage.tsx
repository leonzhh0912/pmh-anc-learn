import { Link } from "react-router";
import curriculumJson from "../../../content/curriculum.json";
import { lessonById, sections } from "../content/load";
import { printedLabel } from "../lib/pages";

type Entry = {
  lessonId: string;
  sectionId: string;
  titleTh: string;
  pdfPages: number[];
  contentType: string;
  clinicalRisk: "low" | "medium" | "high";
  priority: string;
  release: string;
  status: string;
  videoStatus: string;
};

const curriculum = curriculumJson as unknown as Entry[];

const riskLabel = { low: "ต่ำ", medium: "กลาง", high: "สูง" } as const;

/**
 * Staff-facing coverage tracker: every planned lesson by handbook section,
 * with lesson, review and video status. Generated from content/curriculum.json;
 * a lesson that exists in content/lessons shows its live editorial status.
 */
export function CurriculumPage() {
  const total = curriculum.length;
  const built = curriculum.filter((e) => lessonById(e.lessonId)).length;
  const approved = curriculum.filter((e) => {
    const s = lessonById(e.lessonId)?.editorial.status;
    return s === "APPROVED" || s === "PUBLISHED";
  }).length;

  return (
    <main className="page curriculum">
      <Link to="/about" className="lesson__back">
        ‹ เกี่ยวกับแอป
      </Link>
      <h1>ความครอบคลุมของหลักสูตร</h1>
      <p>
        สำหรับเจ้าหน้าที่และผู้ตรวจทาน บทเรียนที่วางแผนไว้ทั้งหมดตามสมุดบันทึกสุขภาพแม่และเด็ก
        ฉบับปรับปรุงใหม่ พ.ศ. 2568
      </p>
      <dl className="curriculum__totals">
        <div>
          <dt>บทเรียนตามแผน</dt>
          <dd>{total}</dd>
        </div>
        <div>
          <dt>จัดทำแล้ว (ร่าง)</dt>
          <dd>{built}</dd>
        </div>
        <div>
          <dt>ผ่านการตรวจทาน</dt>
          <dd>{approved}</dd>
        </div>
      </dl>

      {sections.map((s) => {
        const rows = curriculum.filter((e) => e.sectionId === s.id);
        if (rows.length === 0) return null;
        return (
          <section key={s.id} className="curriculum__section" style={{ ["--section-color" as string]: s.tabColor }}>
            <h2>{s.title}</h2>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th scope="col">บทเรียน</th>
                    <th scope="col">หน้าในสมุด</th>
                    <th scope="col">ความเสี่ยง</th>
                    <th scope="col">รุ่น</th>
                    <th scope="col">สถานะ</th>
                    <th scope="col">วิดีโอ</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((e) => {
                    const live = lessonById(e.lessonId);
                    return (
                      <tr key={e.lessonId}>
                        <td>
                          {live ? <Link to={`/lesson/${e.lessonId}`}>{e.titleTh}</Link> : e.titleTh}
                          <span className="curriculum__id">{e.lessonId}</span>
                        </td>
                        <td>{e.pdfPages.map(printedLabel).join(", ")}</td>
                        <td className={`risk risk--${e.clinicalRisk}`}>{riskLabel[e.clinicalRisk] ?? e.clinicalRisk}</td>
                        <td>
                          {e.release} {e.priority}
                        </td>
                        <td>{live ? live.editorial.status : e.status}</td>
                        <td>{e.videoStatus}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        );
      })}
    </main>
  );
}
