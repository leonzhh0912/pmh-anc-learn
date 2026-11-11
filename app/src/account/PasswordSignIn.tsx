import { useId, useState } from "react";
import { explainPassword, passwordSignIn, patientIdEmail } from "./auth";

/**
 * One sign-in form for everyone. Learners type the 8-digit ID from their slip; staff and administrators type
 * their work email. The account itself (checked by the server) decides where the person goes next, and
 * staff/admins still need their authenticator code. No SMS or email is sent.
 */
export function PasswordSignIn({ onSignedIn }: { onSignedIn: () => void }) {
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);
  const uid = useId();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setProblem(null);
    const typed = id.trim();
    const isEmail = typed.includes("@");
    if (!isEmail && typed.replace(/\D/g, "").length !== 8) {
      setProblem("ผู้เรียน: ใส่รหัสผู้เรียน 8 หลักจากใบที่ได้รับ · เจ้าหน้าที่: ใส่อีเมลงาน");
      return;
    }
    const email = isEmail ? typed.toLowerCase() : patientIdEmail(typed);
    if (!password.trim()) {
      setProblem("ใส่รหัสผ่าน");
      return;
    }
    setBusy(true);
    try {
      await passwordSignIn(email, password);
      onSignedIn();
    } catch (err) {
      setProblem(explainPassword(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="auth__form" onSubmit={submit} noValidate>
      <label htmlFor={`${uid}-id`} className="auth__label">
        รหัสผู้เรียน หรืออีเมลงาน (เจ้าหน้าที่)
      </label>
      <input
        id={`${uid}-id`}
        className="auth__input auth__input--id"
        inputMode="text"
        autoComplete="username"
        autoCapitalize="none"
        spellCheck={false}
        type="text"
        placeholder="เช่น 1234-5678"
        value={id}
        onChange={(e) => setId(e.target.value.slice(0, 120))}
        aria-invalid={problem ? true : undefined}
      />
      <label htmlFor={`${uid}-pw`} className="auth__label">
        รหัสผ่าน
      </label>
      <div className="auth__pwrow">
        <input
          id={`${uid}-pw`}
          className="auth__input"
          type={show ? "text" : "password"}
          inputMode={!id.includes("@") && !/[^\d\s]/.test(password) ? "numeric" : "text"}
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          aria-invalid={problem ? true : undefined}
        />
        <button type="button" className="btn btn--quiet" aria-pressed={show} onClick={() => setShow(!show)}>
          {show ? "ซ่อน" : "แสดง"}
        </button>
      </div>
      <p className="auth__hint">
        ผู้เรียน: รหัสผู้เรียนและรหัสผ่านอยู่ในใบที่เจ้าหน้าที่ให้ ลืมรหัสผ่าน ถามเจ้าหน้าที่ที่คลินิกให้ออกรหัสใหม่
        <br />
        เจ้าหน้าที่และผู้ดูแลระบบ: ใช้อีเมลงานและรหัสผ่าน แล้วตามด้วยรหัสจากแอปยืนยันตัวตน
      </p>
      {problem && (
        <p className="auth__problem" role="alert">
          {problem}
        </p>
      )}
      <div className="auth__actions">
        <button type="submit" className="btn btn--primary" disabled={busy}>
          {busy ? "กำลังเข้าสู่ระบบ…" : "เข้าสู่ระบบ"}
        </button>
      </div>
    </form>
  );
}
