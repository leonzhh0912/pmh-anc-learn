import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { call } from "../../account/auth";
import { formatBangkok } from "../../account/SyncStatus";
import { lessons, sections } from "../../content/load";
import { StaffGate } from "./StaffGate";
import { StaffHeader } from "./StaffPage";
import { CredentialSlip } from "../../account/CredentialSlip";

type LessonRow = {
  lesson_id: string;
  content_version: string;
  step_count: number;
  current_step: number;
  furthest_step: number;
  first_completed_at: string | null;
  last_activity_at: string;
  last_synced_at: string;
  source: "app" | "legacy_import";
};
type QuizRow = { lesson_id: string; question_id: string; attempt_no: number; correct: boolean; answered_at: string };
type VideoRow = { video_id: string; duration_sec: number; watched_sec: number; completed_at: string | null; last_synced_at: string };
type EventRow = { kind: string; lesson_id: string | null; data: Record<string, unknown>; occurred_at: string; recorded_at: string };
type Detail = {
  error?: string;
  learner: {
    id: string;
    display_name: string;
    contact_hint: string;
    contact_method: string;
    status: string;
    name_verified_at: string | null;
    legacy_imported_at: string | null;
    created_at: string;
  };
  tutorial: { started_at: string | null; completed_at: string | null; skipped_at: string | null; last_step: number; last_synced_at: string } | null;
  lessons: LessonRow[];
  quiz: QuizRow[];
  videos: VideoRow[];
  events: EventRow[];
};

const eventLabel: Record<string, string> = {
  lesson_step: "เปิดขั้นในบทเรียน",
  lesson_complete: "กดจบบทเรียน",
  quiz_answer: "ตอบคำถาม",
  video_watch: "เล่นวิดีโอ",
  tutorial_start: "เริ่มวิธีใช้งาน",
  tutorial_step: "ดูวิธีใช้งาน",
  tutorial_complete: "จบวิธีใช้งาน",
  tutorial_skip: "ข้ามวิธีใช้งาน",
  legacy_import: "นำเข้าความคืบหน้าจากเครื่อง",
};

export function StaffLearnerPage() {
  return (
    <StaffGate>
      <LearnerDetail />
    </StaffGate>
  );
}

function LearnerDetail() {
  const { learnerId = "" } = useParams();
  const [d, setD] = useState<Detail | null>(null);
  const [problem, setProblem] = useState<string | null>(null);
  const [loadedAt, setLoadedAt] = useState<string | null>(null);
  const [slip, setSlip] = useState<{ username: string; password: string; display_name: string } | null>(null);

  useEffect(() => {
    call<Detail>("staff_learner_detail", { p_learner: learnerId })
      .then((r) => {
        if (r.error) setProblem("ผู้เรียนคนนี้ไม่อยู่ในกลุ่มที่คุณได้รับมอบหมาย");
        else {
          setD(r);
          setLoadedAt(new Date().toISOString());
        }
      })
      .catch(() => setProblem("โหลดข้อมูลไม่สำเร็จ ต้องเชื่อมต่ออินเทอร์เน็ต"));
  }, [learnerId]);

  if (problem)
    return (
      <main className="page staff">
        <StaffHeader title="ข้อมูลผู้เรียน" />
        <p className="auth__problem" role="alert">
          {problem}
        </p>
        <Link to="/staff">กลับไปรายชื่อ</Link>
      </main>
    );
  if (!d) return <main className="page staff"><p role="status">กำลังโหลด…</p></main>;

  const byLesson = new Map(d.lessons.map((l) => [l.lesson_id, l]));
  const completed = lessons.filter((l) => byLesson.get(l.id)?.first_completed_at);
  const inProgress = lessons.filter((l) => byLesson.has(l.id) && !byLesson.get(l.id)?.first_completed_at);
  const notStarted = lessons.filter((l) => !byLesson.has(l.id));
  const lastSync = [d.tutorial?.last_synced_at, ...d.lessons.map((l) => l.last_synced_at)].filter(Boolean).sort().pop();

  // first recorded try per question, per lesson (only answers actually recorded since accounts began)
  const quizByLesson = new Map<string, { answered: number; firstWrong: number }>();
  for (const q of d.quiz) {
    if (q.attempt_no !== 1) continue;
    const x = quizByLesson.get(q.lesson_id) ?? { answered: 0, firstWrong: 0 };
    x.answered++;
    if (!q.correct) x.firstWrong++;
    quizByLesson.set(q.lesson_id, x);
  }

  return (
    <main className="page staff">
      <StaffHeader title={d.learner.display_name || "(ยังไม่ได้ตั้งชื่อ)"} />
      <p>
        <Link to="/staff">‹ กลับไปรายชื่อ</Link>
      </p>
      {slip && (
        <CredentialSlip kind="learner" name={slip.display_name} id={slip.username} password={slip.password} onClose={() => setSlip(null)} />
      )}
      {d.learner.contact_method === "username" && !slip && (
        <p>
          <button
            type="button"
            className="btn btn--quiet"
            onClick={async () => {
              if (!confirm("ออกรหัสผ่านใหม่ให้ผู้เรียนคนนี้? รหัสผ่านเดิมจะใช้ไม่ได้ และเครื่องที่เข้าไว้จะถูกออกจากระบบ")) return;
              try {
                setSlip(await call("staff_reset_learner_password", { p_learner: d.learner.id }));
              } catch {
                setProblem("ออกรหัสผ่านใหม่ไม่สำเร็จ");
              }
            }}
          >
            ลืมรหัสผ่าน: ออกรหัสผ่านใหม่
          </button>
        </p>
      )}
      <dl className="facts">
        <dt>อ้างอิง</dt>
        <dd>
          {d.learner.contact_hint} ({d.learner.contact_method === "phone" ? "เบอร์มือถือ" : "อีเมล"}){" "}
          {d.learner.name_verified_at ? "· เจ้าหน้าที่ยืนยันชื่อแล้ว" : "· ชื่อที่ผู้เรียนตั้งเอง ยังไม่ได้ยืนยัน"}
        </dd>
        <dt>สมัครเมื่อ</dt>
        <dd>{formatBangkok(d.learner.created_at)}</dd>
        <dt>วิธีใช้งาน</dt>
        <dd>
          {d.tutorial?.completed_at
            ? `จบแล้ว ${formatBangkok(d.tutorial.completed_at)}`
            : d.tutorial?.skipped_at
              ? "ข้าม"
              : d.tutorial?.started_at
                ? `เริ่มแล้ว ถึงขั้นที่ ${d.tutorial.last_step + 1}`
                : "ยังไม่มีข้อมูล"}
        </dd>
        <dt>บทเรียน</dt>
        <dd>
          จบตามกติกาของแอป {completed.length} · ค้าง {inProgress.length} · ยังไม่เริ่ม {notStarted.length} (จาก {lessons.length})
        </dd>
        <dt>ส่งเข้าระบบล่าสุด</dt>
        <dd>{lastSync ? formatBangkok(lastSync) : "ยังไม่มีข้อมูล"}</dd>
        <dt>ข้อมูล ณ</dt>
        <dd>{formatBangkok(loadedAt)} (ไม่อัปเดตเอง โหลดหน้าใหม่เพื่อดูข้อมูลล่าสุด)</dd>
      </dl>
      {d.learner.legacy_imported_at && (
        <p className="notice">
          ผู้เรียนนำเข้าความคืบหน้าที่เคยบันทึกในเครื่องเมื่อ {formatBangkok(d.learner.legacy_imported_at)} รายการที่นำเข้ามีเพียงขั้นที่เรียนถึงและวันที่เรียนจบ
          ไม่มีคำตอบแบบทดสอบ
        </p>
      )}

      <h2>รายบทเรียน</h2>
      {sections.map((s) => {
        const ls = lessons.filter((l) => l.sectionId === s.id);
        if (!ls.length) return null;
        return (
          <section key={s.id} className="detail-section">
            <h3>{s.title}</h3>
            <ul className="lessonrows">
              {ls.map((l) => {
                const p = byLesson.get(l.id);
                const q = quizByLesson.get(l.id);
                const status = p?.first_completed_at
                  ? "จบตามกติกาของแอป"
                  : p
                    ? `กำลังเรียน (ขั้นที่ ${p.furthest_step + 1} จาก ${p.step_count})`
                    : "ยังไม่เริ่ม";
                return (
                  <li key={l.id} className={`lessonrow ${p?.first_completed_at ? "is-done" : p ? "is-going" : ""}`}>
                    <span className="lessonrow__title">{l.title}</span>
                    <span className="lessonrow__status">
                      {status}
                      {p?.first_completed_at && ` · ${formatBangkok(p.first_completed_at)}`}
                      {p?.source === "legacy_import" && " · นำเข้าจากเครื่อง"}
                    </span>
                    {q ? (
                      <span className="lessonrow__quiz">
                        ตอบครั้งแรกถูก {q.answered - q.firstWrong} จาก {q.answered} ข้อที่บันทึก
                        {q.firstWrong > 0 && <strong> · อาจต้องอธิบายเพิ่ม</strong>}
                      </span>
                    ) : (
                      p && <span className="lessonrow__quiz">ไม่มีข้อมูลคำตอบ</span>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}

      <h2>วิดีโอ</h2>
      {d.videos.length === 0 ? (
        <p>ยังไม่มีข้อมูลการเล่นวิดีโอ</p>
      ) : (
        <ul className="lessonrows">
          {d.videos.map((v) => (
            <li key={v.video_id} className="lessonrow">
              <span className="lessonrow__title">{v.video_id}</span>
              <span className="lessonrow__status">
                เล่นแล้ว {Math.round((100 * Number(v.watched_sec)) / Number(v.duration_sec))}% ของความยาว
                {v.completed_at ? " · ครบตามเกณฑ์ (90%)" : ""}
              </span>
            </li>
          ))}
        </ul>
      )}
      <p className="staff__note">การเล่นวิดีโอวัดจากช่วงที่เล่นจริง การกดข้ามไม่นับ แต่ไม่ได้พิสูจน์ว่าผู้เรียนตั้งใจดู</p>

      <h2>กิจกรรมล่าสุด</h2>
      <ol className="timeline-log">
        {d.events.slice(0, 50).map((e, i) => (
          <li key={i}>
            <span>{formatBangkok(e.occurred_at)}</span> {eventLabel[e.kind] ?? e.kind}
            {e.lesson_id ? ` · ${lessons.find((l) => l.id === e.lesson_id)?.title ?? e.lesson_id}` : ""}
            {e.kind === "quiz_answer" ? ` · ${e.data.correct ? "ถูก" : "ยังไม่ถูก"}` : ""}
          </li>
        ))}
      </ol>
      <p className="staff__note">
        เวลาในรายการคือเวลาในมือถือของผู้เรียน ข้อมูลก่อนเปิดใช้บัญชีไม่มีในระบบ ผลแบบทดสอบใช้ดูว่าควรอธิบายเรื่องไหนเพิ่ม
        ไม่ใช่การวินิจฉัยหรือการประเมินความปลอดภัย
      </p>
    </main>
  );
}
