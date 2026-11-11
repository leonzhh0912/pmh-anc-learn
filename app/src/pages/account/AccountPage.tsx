import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router";
import { call, changeMyPassword, explainPassword } from "../../account/auth";
import { refreshAccount, signOut, useSession, getClient } from "../../account/session";
import { SyncStatus } from "../../account/SyncStatus";
import { lessonById, lessons } from "../../content/load";
import { guestProgress, useProgress } from "../../lib/progress";
import { useTutorial } from "../../lib/tutorial";
import { AccountsOff } from "./AccountsOff";

const dismissKey = (uid: string) => `pmh-anc-learn:account:${uid}:import-declined`;

export function AccountPage() {
  const session = useSession();
  const progress = useProgress();
  const tutorial = useTutorial();
  const [name, setName] = useState("");
  const [nameSaved, setNameSaved] = useState(false);
  const [importState, setImportState] = useState<"ask" | "done" | "declined" | "none">("none");
  const [importResult, setImportResult] = useState<string | null>(null);
  const [leaving, setLeaving] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);

  const account = session.account.kind === "learner" ? session.account : null;
  const uid = session.uid;

  useEffect(() => {
    if (account) setName(account.display_name);
  }, [account?.display_name]); // eslint-disable-line react-hooks/exhaustive-deps

  // Offer, once, to bring in progress that was saved on this device before signing in. Never automatic.
  const device = guestProgress();
  const deviceCount = Object.keys(device).filter((id) => lessonById(id)).length;
  useEffect(() => {
    if (!account || !uid) return;
    let declined = false;
    try {
      declined = localStorage.getItem(dismissKey(uid)) === "1";
    } catch {
      /* ignore */
    }
    if (account.legacy_imported_at) setImportState("done");
    else if (declined) setImportState("declined");
    else setImportState(deviceCount > 0 ? "ask" : "none");
  }, [account?.legacy_imported_at, uid, deviceCount]); // eslint-disable-line react-hooks/exhaustive-deps

  if (session.phase === "disabled") return <AccountsOff />;
  if (session.phase === "loading") return <main className="page"><p role="status">กำลังโหลด…</p></main>;
  if (session.phase === "guest") return <Navigate to="/signin" replace />;
  if (session.account.kind === "staff") return <Navigate to="/staff" replace />;
  if (!account) return <main className="page"><p>ไม่พบบัญชีผู้เรียน</p></main>;
  if (account.status !== "active")
    return (
      <main className="page">
        <h1>บัญชีนี้ถูกปิดใช้งาน</h1>
        <p>ติดต่อเจ้าหน้าที่ของโรงพยาบาลหากต้องการเปิดใช้อีกครั้ง</p>
        <button type="button" className="btn btn--quiet" onClick={() => void signOut({ discardPending: true })}>
          ออกจากระบบ
        </button>
      </main>
    );

  const done = lessons.filter((l) => progress.lessons[l.id]?.completedAt).length;

  async function saveName(e: React.FormEvent) {
    e.preventDefault();
    try {
      await call("set_my_display_name", { p_name: name });
      setNameSaved(true);
      await refreshAccount();
    } catch {
      setProblem("บันทึกชื่อไม่สำเร็จ ต้องเชื่อมต่ออินเทอร์เน็ต");
    }
  }

  async function importDevice() {
    const payload: Record<string, unknown> = {};
    for (const [id, p] of Object.entries(device)) {
      const l = lessonById(id);
      if (!l) continue;
      payload[id] = { step: p.step, stepCount: l.steps.length, version: l.version, completedAt: p.completedAt ?? null };
    }
    try {
      const r = await call<{ imported: number; already_imported: boolean }>("import_device_progress", { p_lessons: payload });
      setImportResult(
        r.already_imported ? "บัญชีนี้เคยนำเข้าความคืบหน้าจากเครื่องแล้ว" : `นำเข้า ${r.imported} บทเรียนจากเครื่องนี้เข้าบัญชีแล้ว`,
      );
      setImportState("done");
      await refreshAccount();
    } catch {
      setProblem("นำเข้าไม่สำเร็จ ต้องเชื่อมต่ออินเทอร์เน็ต ลองอีกครั้ง");
    }
  }

  function declineImport() {
    if (uid)
      try {
        localStorage.setItem(dismissKey(uid), "1");
      } catch {
        /* ignore */
      }
    setImportState("declined");
  }

  async function leave() {
    setProblem(null);
    setLeaving(true);
    try {
      await signOut();
    } catch {
      setLeaving(false);
      const n = session.pending;
      if (
        confirm(
          `ยังมีความคืบหน้า ${n} รายการที่ยังไม่ได้ส่งเข้าบัญชี (ไม่มีอินเทอร์เน็ต)\n` +
            "ถ้าออกจากระบบตอนนี้ รายการเหล่านี้จะหายไป\n\nกด “ตกลง” เพื่อออกและทิ้งรายการ หรือ “ยกเลิก” เพื่อรอส่งก่อน",
        )
      ) {
        await signOut({ discardPending: true });
      }
    }
  }

  return (
    <main className="page account">
      <Link to="/" className="lesson__back">
        ‹ หน้าแรก
      </Link>
      <h1>บัญชีของฉัน</h1>
      <SyncStatus detailed />

      {importState === "ask" && (
        <section className="account__import" aria-labelledby="import-title">
          <h2 id="import-title">ความคืบหน้าในเครื่องนี้เป็นของคุณหรือไม่</h2>
          <p>
            ก่อนเข้าสู่ระบบ เครื่องนี้มีการเรียน {deviceCount} บทเรียนที่บันทึกไว้ ถ้าเป็นการเรียนของคุณเอง นำเข้าบัญชีได้ครั้งเดียว
            ถ้าเครื่องนี้ใช้ร่วมกับคนอื่น (เช่น เครื่องที่คลินิก) เลือก “ไม่ใช่”
          </p>
          <p className="account__note">
            ระบบจะบันทึกว่านำเข้าจากเครื่อง และนำเข้าเฉพาะขั้นที่เรียนถึงกับวันที่เรียนจบ ไม่รวมคำตอบแบบทดสอบ
          </p>
          <div className="auth__actions">
            <button type="button" className="btn btn--primary" onClick={() => void importDevice()}>
              ใช่ นำเข้าบัญชีของฉัน
            </button>
            <button type="button" className="btn btn--quiet" onClick={declineImport}>
              ไม่ใช่ ไม่ต้องนำเข้า
            </button>
          </div>
        </section>
      )}
      {importResult && <p role="status" className="account__ok">{importResult}</p>}

      <section aria-labelledby="me-title">
        <h2 id="me-title">ข้อมูลบัญชี</h2>
        <p>
          {account.contact_method === "username" ? (
            <>
              รหัสผู้เรียนของคุณ <strong>{account.contact_hint.replace(/^ID /, "")}</strong> (ดูในใบที่เจ้าหน้าที่ให้)
            </>
          ) : (
            <>
              เข้าสู่ระบบด้วย{account.contact_method === "phone" ? "เบอร์" : "อีเมล"} <strong>{account.contact_hint}</strong>
            </>
          )}
        </p>
        <form onSubmit={saveName} className="account__name">
          <label htmlFor="display-name" className="auth__label">
            ชื่อที่ให้เจ้าหน้าที่เห็น
          </label>
          <input
            id="display-name"
            className="auth__input"
            value={name}
            maxLength={80}
            autoComplete="name"
            onChange={(e) => {
              setName(e.target.value);
              setNameSaved(false);
            }}
          />
          <p className="auth__hint">ใส่ชื่อเล่นหรือชื่อจริงก็ได้ ไม่ต้องใส่เลขบัตรประชาชนหรือข้อมูลสุขภาพ</p>
          <button type="submit" className="btn btn--quiet">
            บันทึกชื่อ
          </button>
          {nameSaved && <span role="status" className="account__ok"> บันทึกแล้ว</span>}
        </form>
      </section>

      {account.contact_method === "username" && <ChangePassword />}

      <section aria-labelledby="learn-title">
        <h2 id="learn-title">การเรียนของฉัน</h2>
        <p>
          วิธีใช้งาน: {tutorial.completedAt ? "เรียนจบแล้ว" : tutorial.startedAt ? "เริ่มแล้ว ยังไม่จบ" : "ยังไม่ได้เริ่ม"}
          {" · "}
          <Link to="/start">{tutorial.completedAt ? "ดูอีกครั้ง" : "เริ่มเลย"}</Link>
        </p>
        <p>
          บทเรียนจากสมุดสีชมพู: เรียนจบแล้ว {done} จาก {lessons.length} บท
        </p>
      </section>

      {problem && (
        <p className="auth__problem" role="alert">
          {problem}
        </p>
      )}

      <section aria-labelledby="out-title" className="account__out">
        <h2 id="out-title">ออกจากระบบ</h2>
        <p>ถ้าใช้มือถือหรือคอมพิวเตอร์ร่วมกับคนอื่น ออกจากระบบทุกครั้งที่เรียนเสร็จ ข้อมูลบัญชีจะถูกลบออกจากเครื่องนี้</p>
        <button type="button" className="btn btn--quiet" disabled={leaving} onClick={() => void leave()}>
          {leaving ? "กำลังออก…" : "ออกจากระบบ"}
        </button>
      </section>
    </main>
  );
}

// keep the client warm on this page so sign-out is quick
void getClient;

function ChangePassword() {
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  return (
    <section aria-labelledby="pw-title">
      <h2 id="pw-title">ตั้งรหัสผ่านของคุณเอง (ไม่บังคับ)</h2>
      <p className="auth__hint">รหัสผ่านในใบที่ได้รับใช้ต่อได้ ถ้าอยากเปลี่ยนให้จำง่ายขึ้น ตั้งอย่างน้อย 8 ตัว และอย่าใช้รหัสเดียวกับที่อื่น</p>
      <form
        className="account__name"
        onSubmit={async (e) => {
          e.preventDefault();
          if (pw.length < 8) return setMsg({ ok: false, text: "รหัสผ่านสั้นเกินไป ใช้อย่างน้อย 8 ตัว" });
          if (pw !== pw2) return setMsg({ ok: false, text: "รหัสผ่านสองช่องไม่ตรงกัน" });
          try {
            await changeMyPassword(pw);
            setPw("");
            setPw2("");
            setMsg({ ok: true, text: "เปลี่ยนรหัสผ่านแล้ว ครั้งหน้าใช้รหัสผ่านใหม่" });
          } catch (err) {
            setMsg({ ok: false, text: explainPassword(err) });
          }
        }}
      >
        <label className="auth__label" htmlFor="new-pw">รหัสผ่านใหม่</label>
        <input id="new-pw" className="auth__input" type="password" autoComplete="new-password" value={pw} onChange={(e) => setPw(e.target.value)} />
        <label className="auth__label" htmlFor="new-pw2">พิมพ์รหัสผ่านใหม่อีกครั้ง</label>
        <input id="new-pw2" className="auth__input" type="password" autoComplete="new-password" value={pw2} onChange={(e) => setPw2(e.target.value)} />
        <button type="submit" className="btn btn--quiet">เปลี่ยนรหัสผ่าน</button>
        {msg && (
          <p role={msg.ok ? "status" : "alert"} className={msg.ok ? "account__ok" : "auth__problem"}>
            {msg.text}
          </p>
        )}
      </form>
    </section>
  );
}
