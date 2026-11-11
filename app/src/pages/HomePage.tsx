import { Link } from "react-router";
import { lessons, lessonsInSection, sections } from "../content/load";
import { useProgress } from "../lib/progress";
import { InstallHelp } from "../components/InstallHelp";
import { useTutorial } from "../lib/tutorial";

export function HomePage() {
  const progress = useProgress();
  const tutorial = useTutorial();
  const tutorialOpen = !tutorial.completedAt && !tutorial.skippedAt;
  const started = lessons.filter((l) => progress.lessons[l.id]);
  const inProgress = started.find((l) => !progress.lessons[l.id]?.completedAt);
  const doneCount = lessons.filter((l) => progress.lessons[l.id]?.completedAt).length;
  // suggest the next lesson not yet finished, in handbook order
  const firstLesson = lessons.find((l) => !progress.lessons[l.id]?.completedAt) ?? lessons[0];

  return (
    <main className="page home">
      <section className="home__intro" aria-labelledby="home-title">
        <h1 id="home-title" className="home__title">
          เรียนรู้คู่สมุดสีชมพู
        </h1>
        <p className="home__lede">
          บทเรียนสั้น ๆ จากสมุดบันทึกสุขภาพแม่และเด็ก ฉบับปรับปรุงใหม่ พ.ศ. 2568
          สำหรับคุณแม่ ครอบครัว และผู้ดูแลเด็ก เรียนทีละขั้น ดูวิดีโอ แล้วลองตอบคำถาม
        </p>

        {tutorialOpen && (
          <Link className="start-here" to={`/start${tutorial.lastStep ? `?step=${tutorial.lastStep}` : ""}`}>
            <span className="start-here__label">เริ่มที่นี่</span>
            <span className="start-here__title">วิธีใช้งาน</span>
            <span className="start-here__meta">
              {tutorial.startedAt ? "ทำต่อจากที่ค้างไว้" : "8 ขั้นสั้น ๆ มีปุ่มให้ลองกด ประมาณ 5 นาที"}
            </span>
          </Link>
        )}

        {inProgress ? (
          <Link
            className="continue"
            to={`/lesson/${inProgress.id}?step=${progress.lessons[inProgress.id]?.step ?? 0}`}
          >
            <span className="continue__label">เรียนต่อจากครั้งที่แล้ว</span>
            <span className="continue__title">{inProgress.title}</span>
          </Link>
        ) : firstLesson ? (
          <Link className="continue" to={`/lesson/${firstLesson.id}`}>
            <span className="continue__label">
              {doneCount === 0
                ? "เริ่มบทเรียนแรก"
                : doneCount === lessons.length
                  ? "เรียนครบแล้ว ทบทวนอีกครั้ง"
                  : "บทเรียนถัดไป"}
            </span>
            <span className="continue__title">{firstLesson.title}</span>
          </Link>
        ) : null}

        <p className="home__progress">
          เรียนจบแล้ว {doneCount} จาก {lessons.length} บทเรียนที่มีในตอนนี้
          {!tutorialOpen && (
            <>
              {" · "}
              <Link to="/start">ดูวิธีใช้งานอีกครั้ง</Link>
            </>
          )}
        </p>
        <InstallHelp />
      </section>

      <section aria-labelledby="tabs-title" className="book">
        <h2 id="tabs-title" className="book__title">
          หมวดในสมุด
        </h2>
        <p className="book__hint">สีของแต่ละหมวดตรงกับแถบสีข้างสมุดสีชมพูของคุณ</p>
        <ul className="book__tabs">
          {sections.map((s) => {
            const count = lessonsInSection(s.id).length;
            const isRecord = s.kind === "record";
            return (
              <li key={s.id} style={{ ["--tab" as string]: s.tabColor }}>
                <Link to={`/section/${s.id}`} className="book__tab">
                  <span className="book__tab-text">
                    <span className="book__tab-name">{s.title}</span>
                    <span className="book__tab-meta">
                      {isRecord
                        ? "ส่วนบันทึกข้อมูล กรอกร่วมกับเจ้าหน้าที่"
                        : count > 0
                          ? `${count} บทเรียน`
                          : "กำลังจัดทำบทเรียน"}
                    </span>
                  </span>
                  <span className="book__tab-edge" aria-hidden="true" />
                </Link>
              </li>
            );
          })}
        </ul>
      </section>
    </main>
  );
}
