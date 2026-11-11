import { useId, useState } from "react";
import { explainPassword, passwordSignIn, patientIdEmail } from "./auth";

/**
 * Sign in with what staff handed over on the slip: patient ID (8 digits) + password; or, for staff, work
 * email + password. No SMS or email is sent.
 */
export function PasswordSignIn({ audience, onSignedIn }: { audience: "learner" | "staff"; onSignedIn: () => void }) {
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);
  const uid = useId();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setProblem(null);
    const email = audience === "learner" ? patientIdEmail(id) : id.trim().toLowerCase();
    if (audience === "learner" && id.replace(/\D/g, "").length !== 8) {
      setProblem("รหัสผู้เรียนมี 8 หลัก ดูในใบที่เจ้าหน้าที่ให้");
      return;
    }
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
        {audience === "learner" ? "รหัสผู้เรียน (8 หลัก)" : "อีเมลงาน"}
      </label>
      <input
        id={`${uid}-id`}
        className={`auth__input ${audience === "learner" ? "auth__input--id" : ""}`}
        inputMode={audience === "learner" ? "numeric" : "email"}
        autoComplete="username"
        type={audience === "learner" ? "text" : "email"}
        placeholder={audience === "learner" ? "เช่น 1234-5678" : "name@hospital"}
        value={id}
        onChange={(e) => setId(audience === "learner" ? e.target.value.replace(/[^\d-\s]/g, "").slice(0, 10) : e.target.value)}
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
          inputMode={audience === "learner" && !/[^\d\s]/.test(password) ? "numeric" : "text"}
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          aria-invalid={problem ? true : undefined}
        />
        <button type="button" className="btn btn--quiet" aria-pressed={show} onClick={() => setShow(!show)}>
          {show ? "ซ่อน" : "แสดง"}
        </button>
      </div>
      {audience === "learner" && (
        <p className="auth__hint">รหัสผู้เรียนและรหัสผ่านอยู่ในใบที่เจ้าหน้าที่ให้ ลืมรหัสผ่าน ถามเจ้าหน้าที่ที่คลินิกให้ออกรหัสใหม่</p>
      )}
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
