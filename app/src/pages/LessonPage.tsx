import { useEffect, useRef, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router";
import { lessonById, sections } from "../content/load";
import type { Step } from "../content/schema";
import { completeLesson, reachStep, useProgress } from "../lib/progress";
import { DraftBanner } from "../components/DraftBanner";
import { PageChip } from "../components/PageChip";
import { Quiz } from "../components/Quiz";
import { SortGame } from "../components/SortGame";
import { Timeline } from "../components/Timeline";
import { VideoPlayer } from "../components/VideoPlayer";

const stepKind: Record<Step["type"], string> = {
  text: "อ่าน",
  timeline: "สำรวจ",
  sort: "ลองจัด",
  video: "ดูวิดีโอ",
  quiz: "ทบทวน",
  takeaways: "สรุป",
};

export function LessonPage() {
  const { lessonId = "" } = useParams();
  const lesson = lessonById(lessonId);
  const [params, setParams] = useSearchParams();
  const progress = useProgress();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const [finished, setFinished] = useState(false);

  const index = Math.max(0, Number(params.get("step") ?? 0) || 0);

  useEffect(() => {
    if (lesson) reachStep(lesson.id, index);
    headingRef.current?.focus();
    window.scrollTo({ top: 0 });
  }, [lesson, index]);

  if (!lesson) {
    return (
      <main className="page">
        <h1>ไม่พบบทเรียนนี้</h1>
        <Link to="/">กลับหน้าแรก</Link>
      </main>
    );
  }

  const section = sections.find((s) => s.id === lesson.sectionId);
  const step = lesson.steps[Math.min(index, lesson.steps.length - 1)];
  const isLast = index >= lesson.steps.length - 1;
  const done = progress.lessons[lesson.id]?.completedAt;

  const go = (i: number) => setParams({ step: String(i) });
  const next = () => {
    if (isLast) {
      completeLesson(lesson.id);
      setFinished(true);
    } else go(index + 1);
  };

  if (finished) {
    return (
      <main className="page lesson-done">
        <h1 ref={headingRef} tabIndex={-1}>
          จบบทเรียนแล้ว
        </h1>
        <p>
          คุณเรียน “{lesson.title}” ครบทุกขั้นตอนแล้ว กลับมาทบทวนได้ทุกเมื่อ
          และอย่าลืมพกสมุดสีชมพูไปทุกครั้งที่พบเจ้าหน้าที่
        </p>
        <div className="lesson-done__actions">
          <button type="button" className="btn btn--quiet" onClick={() => { setFinished(false); go(0); }}>
            เรียนบทนี้อีกครั้ง
          </button>
          <Link className="btn btn--primary" to="/">
            กลับหน้าแรก
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main
      className="page lesson"
      style={{ ["--section-color" as string]: section?.tabColor }}
    >
      <header className="lesson__head">
        <Link to="/" className="lesson__back">
          ‹ หน้าแรก
        </Link>
        <p className="lesson__section">{section?.title}</p>
        <ol className="lesson__steps" aria-label="ขั้นตอนของบทเรียน">
          {lesson.steps.map((s, i) => (
            <li key={i}>
              <button
                type="button"
                className={`lesson__dot ${i === index ? "is-current" : ""} ${i < index || done ? "is-done" : ""}`}
                aria-current={i === index ? "step" : undefined}
                aria-label={`ขั้นที่ ${i + 1}: ${stepKind[s.type]}`}
                onClick={() => go(i)}
              />
            </li>
          ))}
        </ol>
      </header>

      <DraftBanner status={lesson.editorial.status} />

      <article className="lesson__card">
        <p className="lesson__kind">
          ขั้นที่ {index + 1} จาก {lesson.steps.length}: {stepKind[step.type]}
        </p>
        <h1 ref={headingRef} tabIndex={-1} className="lesson__title">
          {step.heading}
        </h1>
        <StepBody step={step} lessonId={lesson.id} onQuizDone={next} />
        {step.type !== "quiz" && (
          <PageChip
            pdfPages={lesson.handbookRef.pdfPages}
            printedPages={lesson.handbookRef.printedPages}
          />
        )}
      </article>

      {step.type !== "quiz" && (
        <nav className="lesson__nav" aria-label="ไปยังขั้นตอน">
          {index > 0 && (
            <button type="button" className="btn btn--quiet" onClick={() => go(index - 1)}>
              ย้อนกลับ
            </button>
          )}
          <button type="button" className="btn btn--primary" onClick={next}>
            {isLast ? "จบบทเรียน" : "ต่อไป"}
          </button>
        </nav>
      )}
    </main>
  );
}

function StepBody({
  step,
  lessonId,
  onQuizDone,
}: {
  step: Step;
  lessonId: string;
  onQuizDone: () => void;
}) {
  switch (step.type) {
    case "text":
      return (
        <div className="prose">
          {step.paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      );
    case "timeline":
      return <Timeline step={step} />;
    case "sort":
      return <SortGame step={step} />;
    case "video":
      return <VideoPlayer videoId={step.videoId} />;
    case "quiz":
      return <Quiz lessonId={lessonId} questions={step.questions} onDone={onQuizDone} />;
    case "takeaways":
      return (
        <div className="takeaways">
          <ul>
            {step.items.map((t, i) => (
              <li key={i}>{t}</li>
            ))}
          </ul>
          {step.familyNote && (
            <aside className="family-note">
              <h2>สำหรับครอบครัวและผู้ดูแล</h2>
              <p>{step.familyNote}</p>
            </aside>
          )}
        </div>
      );
  }
}
