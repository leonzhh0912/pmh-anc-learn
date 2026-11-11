import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import tutorial from "../../../content/app-tutorial/tutorial.json";
import { setTextScale, useProgress } from "../lib/progress";
import { tutorialComplete, tutorialSkip, tutorialStep } from "../lib/tutorial";
import { accountsEnabled } from "../account/config";

/**
 * Lesson 0: how to use the app. Hands-on practice with pretend buttons; nothing is sent anywhere
 * (the practice sign-in uses a clearly fictional number and code). Software instruction only: no handbook
 * citation, not part of the 58-lesson curriculum.
 */
const steps = tutorial.steps;
const base = import.meta.env.BASE_URL;

export function TutorialPage() {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const index = Math.min(Math.max(0, Number(params.get("step") ?? 0) || 0), steps.length - 1);
  const step = steps[index];
  const headingRef = useRef<HTMLHeadingElement>(null);
  const [practised, setPractised] = useState<Record<string, boolean>>({});
  const done = (id: string) => setPractised((p) => ({ ...p, [id]: true }));

  useEffect(() => {
    tutorialStep(index);
    headingRef.current?.focus();
    window.scrollTo({ top: 0 });
  }, [index]);

  const go = (i: number) => setParams({ step: String(i) });
  const isLast = index === steps.length - 1;

  return (
    <main className="page lesson tutorial" style={{ ["--section-color" as string]: "#b0175a" }}>
      <header className="lesson__head">
        <Link to="/" className="lesson__back">
          ‹ หน้าแรก
        </Link>
        <p className="lesson__section">{tutorial.title}</p>
        <ol className="lesson__steps" aria-label="ขั้นตอนของวิธีใช้งาน">
          {steps.map((s, i) => (
            <li key={s.id}>
              <button
                type="button"
                className={`lesson__dot ${i === index ? "is-current" : ""} ${i < index ? "is-done" : ""}`}
                aria-current={i === index ? "step" : undefined}
                aria-label={`ขั้นที่ ${i + 1}: ${s.title}`}
                onClick={() => go(i)}
              />
            </li>
          ))}
        </ol>
        <button
          type="button"
          className="linklike tutorial__skip"
          onClick={() => {
            tutorialSkip();
            navigate("/");
          }}
        >
          ข้ามวิธีใช้งาน ไปเรียนเลย
        </button>
      </header>

      <article className="lesson__card" aria-labelledby="tut-title">
        <p className="lesson__kind">
          ขั้นที่ {index + 1} จาก {steps.length}
        </p>
        <h1 id="tut-title" ref={headingRef} tabIndex={-1} className="lesson__title">
          {step.title}
        </h1>
        {step.body.map((p, i) => (
          <p key={i} className="tutorial__text">
            {p}
          </p>
        ))}
        <Practice id={step.id} done={!!practised[step.id]} onDone={() => done(step.id)} />
      </article>

      <nav className="lesson__nav" aria-label="ไปยังขั้นตอน">
        <button type="button" className="btn btn--quiet" disabled={index === 0} onClick={() => go(index - 1)}>
          ย้อนกลับ
        </button>
        {isLast ? (
          <button
            type="button"
            className="btn btn--primary"
            onClick={() => {
              tutorialComplete(steps.length);
              navigate("/?tutorial=done");
            }}
          >
            จบวิธีใช้งาน ไปเรียนเลย
          </button>
        ) : (
          <button type="button" className="btn btn--primary" onClick={() => go(index + 1)}>
            ต่อไป
          </button>
        )}
      </nav>
    </main>
  );
}

function Done({ show, children }: { show: boolean; children: React.ReactNode }) {
  return (
    <p className="tutorial__done" role="status" aria-live="polite">
      {show ? <>✓ {children}</> : null}
    </p>
  );
}

function Practice({ id, done, onDone }: { id: string; done: boolean; onDone: () => void }) {
  switch (id) {
    case "start":
      return <StartPractice done={done} onDone={onDone} />;
    case "login":
      return <LoginPractice done={done} onDone={onDone} />;
    case "find":
      return <FindPractice done={done} onDone={onDone} />;
    case "nav":
      return <NavPractice done={done} onDone={onDone} />;
    case "video":
      return <VideoPractice done={done} onDone={onDone} />;
    case "quiz":
      return <QuizPractice done={done} onDone={onDone} />;
    case "save":
      return <SavePractice />;
    case "return":
      return <ReturnPractice />;
    default:
      return null;
  }
}

type P = { done: boolean; onDone: () => void };

function StartPractice({ done, onDone }: P) {
  return (
    <div className="practice">
      <p className="practice__label">ลองแตะ</p>
      <button type="button" className="btn btn--primary practice__big" onClick={onDone}>
        เริ่ม
      </button>
      <Done show={done}>ดีมาก ปุ่มสีชมพูเข้มแบบนี้คือปุ่มที่ใช้ไปต่อในทุกหน้า</Done>
      <div className="mock" aria-label="ตัวอย่างหน้าแรก">
        <p className="mock__caption">หน้าแรกมี 3 ส่วนหลัก</p>
        <ol className="mock__list">
          <li>
            <span className="mock__chip mock__chip--pink">เริ่มที่นี่ / เรียนต่อ</span> ปุ่มใหญ่ด้านบน พาไปบทเรียนที่ควรเรียนต่อ
          </li>
          <li>
            <span className="mock__chip">หมวดในสมุด</span> รายการหมวด สีตรงกับแถบข้างสมุดสีชมพู
          </li>
          <li>
            <span className="mock__chip">ก ก ก</span> ปุ่มขยายตัวอักษร มุมขวาบน
          </li>
        </ol>
      </div>
    </div>
  );
}

const SAMPLE_PHONE = "081-234-5678";
const SAMPLE_CODE = "123456";

function LoginPractice({ done, onDone }: P) {
  const [method, setMethod] = useState<"phone" | "email" | null>(null);
  const [sent, setSent] = useState(false);
  const [code, setCode] = useState("");
  const [wrong, setWrong] = useState(false);
  const contact = method === "email" ? "somjai@example.com" : SAMPLE_PHONE;
  return (
    <div className="practice">
      <p className="practice__fiction">ฝึกเท่านั้น: เบอร์ อีเมล และรหัสข้างล่างเป็นตัวอย่าง ไม่มีการส่งข้อความจริง</p>
      {!method && (
        <div className="auth__methods">
          <button type="button" className="auth__method" onClick={() => setMethod("phone")}>
            <span className="auth__method-name">เบอร์โทรศัพท์</span>
            <span className="auth__method-sub">รับรหัสทางข้อความ SMS</span>
          </button>
          <button type="button" className="auth__method" onClick={() => setMethod("email")}>
            <span className="auth__method-name">อีเมล</span>
            <span className="auth__method-sub">รับรหัสทางอีเมล</span>
          </button>
        </div>
      )}
      {method && !sent && (
        <div>
          <p className="auth__label">{method === "phone" ? "เบอร์มือถือ 10 หลัก" : "อีเมล"}</p>
          <p className="practice__field">{contact}</p>
          <p className="auth__hint">ของจริง: พิมพ์{method === "phone" ? "เบอร์" : "อีเมล"}ของคุณเอง แล้วแตะ “ส่งรหัส”</p>
          <button type="button" className="btn btn--primary" onClick={() => setSent(true)}>
            ส่งรหัส (ฝึก)
          </button>
        </div>
      )}
      {method && sent && (
        <div>
          <div className="practice__message" aria-label={method === "phone" ? "ตัวอย่างข้อความ SMS" : "ตัวอย่างอีเมล"}>
            <p className="practice__message-from">{method === "phone" ? "ข้อความ SMS (ตัวอย่าง)" : "อีเมล: รหัสยืนยัน ANC Learn (ตัวอย่าง)"}</p>
            <p>
              รหัสยืนยัน ANC Learn: <strong>{SAMPLE_CODE}</strong> ใช้ได้ 10 นาที ห้ามบอกรหัสนี้กับผู้อื่น
            </p>
          </div>
          <p className="auth__hint">
            {method === "phone"
              ? "ของจริง: รหัสมาเป็นข้อความ SMS บางเครื่องแตะรหัสเหนือแป้นพิมพ์ได้เลย"
              : "ของจริง: เปิดแอปอีเมล หาอีเมลชื่อ “รหัสยืนยัน ANC Learn” ถ้าไม่เห็นให้ดูในจดหมายขยะ"}
          </p>
          <label className="auth__label" htmlFor="practice-code">
            พิมพ์รหัส 6 หลักจากข้อความตัวอย่าง
          </label>
          <input
            id="practice-code"
            className="auth__input auth__input--code"
            inputMode="numeric"
            autoComplete="off"
            value={code}
            onChange={(e) => {
              setCode(e.target.value.replace(/\D/g, "").slice(0, 6));
              setWrong(false);
            }}
          />
          <div className="auth__actions">
            <button
              type="button"
              className="btn btn--primary"
              onClick={() => (code === SAMPLE_CODE ? onDone() : setWrong(true))}
            >
              ยืนยันรหัส (ฝึก)
            </button>
            <button type="button" className="btn btn--quiet" onClick={() => { setSent(false); setMethod(null); setCode(""); }}>
              เริ่มฝึกใหม่
            </button>
          </div>
          {wrong && <p className="auth__problem" role="alert">รหัสยังไม่ตรง ดูตัวเลขในข้อความตัวอย่างอีกครั้ง</p>}
        </div>
      )}
      <Done show={done}>เข้าสู่ระบบ (ฝึก) สำเร็จ ถ้ารหัสไม่มา ของจริงมีปุ่ม “ขอรหัสใหม่” และถามเจ้าหน้าที่ได้</Done>
      {accountsEnabled && (
        <p className="auth__hint">
          พร้อมแล้ว <Link to="/signin">เข้าสู่ระบบจริง</Link> (ทำทีหลังก็ได้)
        </p>
      )}
    </div>
  );
}

const sampleSections = [
  { name: "การฝากครรภ์", lessons: ["ฝากครรภ์ครั้งแรก", "นัดฝากครรภ์แต่ละครั้ง"] },
  { name: "ความรู้", lessons: ["ธงโภชนาการ คืออะไร", "การนับลูกดิ้น"] },
  { name: "การเจริญเติบโต", lessons: ["อาหารตามวัย", "การชั่งน้ำหนัก"] },
];

function FindPractice({ done, onDone }: P) {
  const [open, setOpen] = useState<number | null>(null);
  const [picked, setPicked] = useState<string | null>(null);
  return (
    <div className="practice">
      <p className="practice__label">ลองแตะหมวด แล้วแตะบทเรียน (ตัวอย่าง)</p>
      <ul className="mock__tabs">
        {sampleSections.map((s, i) => (
          <li key={s.name}>
            <button type="button" className="mock__tab" aria-expanded={open === i} onClick={() => setOpen(i)}>
              {s.name}
            </button>
            {open === i && (
              <ul className="mock__lessons">
                {s.lessons.map((l) => (
                  <li key={l}>
                    <button
                      type="button"
                      className="mock__lesson"
                      onClick={() => {
                        setPicked(l);
                        onDone();
                      }}
                    >
                      {l}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
      <Done show={done}>
        เปิดบทเรียน “{picked}” (ตัวอย่าง) แต่ละบทมี: อ่าน → ดูวิดีโอ → ลองทำ → ตอบคำถาม → สรุป
      </Done>
    </div>
  );
}

function NavPractice({ done, onDone }: P) {
  const total = 5;
  const [at, setAt] = useState(0);
  const [log, setLog] = useState<string[]>([]);
  const press = (what: string, next: number) => {
    setAt(next);
    const l = [...log, what];
    setLog(l);
    if (l.includes("ต่อไป") && l.includes("ย้อนกลับ") && l.includes("หน้าแรก")) onDone();
  };
  return (
    <div className="practice">
      <p className="practice__label">ลองแตะ “ต่อไป” “ย้อนกลับ” และ “หน้าแรก” อย่างละครั้ง</p>
      <div className="mock mock--lesson">
        <p className="lesson__kind">{at < 0 ? "หน้าแรก" : `ขั้นที่ ${at + 1} จาก ${total} (ตัวอย่าง)`}</p>
        <div className="auth__actions">
          <button type="button" className="btn btn--quiet" disabled={at <= 0} onClick={() => press("ย้อนกลับ", at - 1)}>
            ย้อนกลับ
          </button>
          <button type="button" className="btn btn--primary" disabled={at >= total - 1} onClick={() => press("ต่อไป", Math.max(at, 0) + 1)}>
            ต่อไป
          </button>
          <button type="button" className="btn btn--quiet" onClick={() => press("หน้าแรก", -1)}>
            ‹ หน้าแรก
          </button>
        </div>
        {at < 0 && (
          <button type="button" className="continue mock__continue" onClick={() => setAt(1)}>
            <span className="continue__label">เรียนต่อจากครั้งที่แล้ว</span>
            <span className="continue__title">บทเรียนตัวอย่าง (ขั้นที่ 2)</span>
          </button>
        )}
      </div>
      <Done show={done}>ครบแล้ว ออกกลางคันได้ แอปจำว่าเรียนถึงขั้นไหน</Done>
    </div>
  );
}

function VideoPractice({ done, onDone }: P) {
  const { textScale } = useProgress();
  const [missing, setMissing] = useState(false);
  return (
    <div className="practice">
      {!missing ? (
        <figure className="video">
          <video
            controls
            preload="metadata"
            playsInline
            poster={`${base}media/APP-TUTORIAL.jpg`}
            onPlay={onDone}
            onError={() => setMissing(true)}
          >
            <source src={`${base}media/APP-TUTORIAL.mp4`} type="video/mp4" onError={() => setMissing(true)} />
            {/* the words are already on screen in the video; the caption track is there for anyone who wants it */}
            <track kind="captions" srcLang="th" label="ไทย" src={`${base}media/APP-TUTORIAL.th.vtt`} />
          </video>
          <figcaption className="video__meta">
            <span>วิดีโอวิธีใช้งาน ความยาวประมาณ 1 นาทีครึ่ง มีข้อความภาษาไทยบนวิดีโอ และเปิดคำบรรยาย (CC) เพิ่มได้</span>
            <span className="video__draft">ฉบับร่าง รอโรงพยาบาลตรวจทาน</span>
          </figcaption>
        </figure>
      ) : (
        <p className="notice">วิดีโอวิธีใช้งานยังไม่พร้อมในเครื่องนี้ อ่านคำอธิบายด้านบนแทนได้</p>
      )}
      <p className="practice__label">ลองปรับขนาดตัวอักษร</p>
      <div className="textsize textsize--inline" role="group" aria-label="ขนาดตัวอักษร (ฝึก)">
        {([1, 1.15, 1.3] as const).map((v, i) => (
          <button
            key={v}
            type="button"
            className="textsize__btn"
            style={{ fontSize: `${16 + i * 4}px` }}
            aria-pressed={textScale === v}
            aria-label={["ปกติ", "ใหญ่", "ใหญ่มาก"][i]}
            onClick={() => {
              setTextScale(v);
              onDone();
            }}
          >
            ก
          </button>
        ))}
      </div>
      <p className="auth__hint">ดูวิดีโอซ้ำได้ เลื่อนแถบเวลากลับไปต้นวิดีโอ หรือกดเล่นอีกครั้งเมื่อจบ</p>
      <Done show={done}>เยี่ยม ตัวอักษรที่เลือกจะใช้กับทุกหน้า</Done>
    </div>
  );
}

const practiceQuestion = {
  prompt: "ถ้าต้องการกลับไปหน้าหลักของแอป ควรแตะปุ่มไหน",
  options: [
    { id: "a", text: "ต่อไป", feedback: "ปุ่ม “ต่อไป” พาไปขั้นถัดไปในบทเรียน ยังไม่ใช่หน้าหลัก" },
    { id: "b", text: "‹ หน้าแรก", feedback: "ถูกต้อง ปุ่ม “หน้าแรก” อยู่มุมซ้ายบนของบทเรียน" },
    { id: "c", text: "ย้อนกลับ", feedback: "ปุ่ม “ย้อนกลับ” กลับไปขั้นก่อนหน้าในบทเรียน ยังไม่ใช่หน้าหลัก" },
  ],
  correct: "b",
};

function QuizPractice({ done, onDone }: P) {
  const [chosen, setChosen] = useState<string | null>(null);
  const opt = practiceQuestion.options.find((o) => o.id === chosen);
  const right = chosen === practiceQuestion.correct;
  return (
    <div className="practice quiz">
      <p className="practice__fiction">คำถามฝึก (เรื่องการใช้แอป)</p>
      <h3 className="quiz__prompt" id="pq">
        {practiceQuestion.prompt}
      </h3>
      <div className="quiz__options" role="group" aria-labelledby="pq">
        {practiceQuestion.options.map((o) => (
          <button
            key={o.id}
            type="button"
            className={`option ${chosen === o.id ? (right ? "is-correct" : "is-wrong") : chosen && right ? "is-dim" : ""}`}
            aria-pressed={chosen === o.id}
            onClick={() => {
              if (right) return;
              setChosen(o.id);
              if (o.id === practiceQuestion.correct) onDone();
            }}
          >
            <span className="option__text">{o.text}</span>
          </button>
        ))}
      </div>
      <div aria-live="polite">
        {opt && (
          <div className={`feedback ${right ? "feedback--correct" : "feedback--gentle"}`}>
            <p className="feedback__title">{right ? "ถูกต้อง" : "ยังไม่ใช่"}</p>
            <p>{opt.feedback}</p>
          </div>
        )}
      </div>
      {chosen && !right && (
        <button type="button" className="btn btn--primary" onClick={() => setChosen(null)}>
          ลองตอบอีกครั้ง
        </button>
      )}
      <Done show={done}>ในบทเรียนจริงก็เหมือนกัน ตอบผิดได้ ลองใหม่ได้ หรือกด “ดูเฉลย”</Done>
    </div>
  );
}

function SavePractice() {
  return (
    <div className="practice">
      <ul className="savestates">
        <li>
          <span className="syncchip syncchip--local">
            <span className="syncchip__dot" aria-hidden="true" />
            บันทึกไว้ในเครื่องแล้ว
          </span>
          <span>เก็บในมือถือเครื่องนี้แล้ว กำลังจะส่งเข้าบัญชี</span>
        </li>
        <li>
          <span className="syncchip syncchip--wait">
            <span className="syncchip__dot" aria-hidden="true" />
            รอเชื่อมต่ออินเทอร์เน็ต
          </span>
          <span>ไม่มีอินเทอร์เน็ต เรียนต่อได้ เมื่อเน็ตกลับมาจะส่งให้เอง</span>
        </li>
        <li>
          <span className="syncchip syncchip--ok">
            <span className="syncchip__dot" aria-hidden="true" />
            บันทึกเข้าบัญชีแล้ว
          </span>
          <span>อยู่ในบัญชีแล้ว เปิดจากเครื่องอื่นก็เห็น</span>
        </li>
      </ul>
      <p className="auth__hint">
        ถ้าไม่เข้าสู่ระบบ ความคืบหน้าเก็บไว้ในเครื่องนี้เท่านั้น ไม่ส่งไปที่ไหน และเปิดจากเครื่องอื่นไม่เห็น
      </p>
    </div>
  );
}

function ReturnPractice() {
  return (
    <div className="practice">
      <ul className="mock__list">
        <li>เปิดแอป → ปุ่ม “เรียนต่อจากครั้งที่แล้ว” ที่หน้าแรก</li>
        {accountsEnabled && <li>เข้าสู่ระบบ → “บัญชีของฉัน” → ดูว่าเรียนจบกี่บท</li>}
        <li>
          ต้องการความช่วยเหลือ → <Link to="/help">วิธีใช้งานและช่วยเหลือ</Link>
        </li>
        {accountsEnabled && <li>ใช้เครื่องร่วมกัน → “บัญชีของฉัน” → “ออกจากระบบ”</li>}
      </ul>
    </div>
  );
}
