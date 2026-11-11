import { useEffect, useId, useRef, useState } from "react";
import { Link } from "react-router";
import { explain, sendCode, verifyCode, type Method } from "./auth";
import { formatThaiMobile, normaliseThaiMobile } from "./phone";

type Props = {
  methods: Method[];
  /** extra data stored at sign-up (e.g. intent: "staff"); never a role */
  meta?: Record<string, string>;
  onSignedIn: () => void;
  audience?: "learner" | "staff";
};

const RESEND_SECONDS = 60;

export function OtpSignIn({ methods, meta, onSignedIn, audience = "learner" }: Props) {
  const [method, setMethod] = useState<Method | null>(methods.length === 1 ? methods[0] : null);
  const [raw, setRaw] = useState("");
  const [contact, setContact] = useState<string | null>(null); // normalised, once a code was sent
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const codeRef = useRef<HTMLInputElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const id = useId();

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown(cooldown - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  useEffect(() => {
    if (contact) codeRef.current?.focus();
    else headingRef.current?.focus();
  }, [contact, method]);

  function normalised(): string | null {
    if (method === "phone") return normaliseThaiMobile(raw);
    const e = raw.trim().toLowerCase();
    return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e) ? e : null;
  }

  async function send(e?: React.FormEvent) {
    e?.preventDefault();
    if (!method) return;
    const target = contact ?? normalised();
    if (!target) {
      setProblem(
        method === "phone"
          ? "เบอร์นี้ไม่ใช่เบอร์มือถือไทยที่ถูกต้อง พิมพ์ 10 หลัก เช่น 081-234-5678"
          : "อีเมลนี้ไม่ถูกต้อง ตัวอย่าง: somchai@example.com",
      );
      return;
    }
    setBusy(true);
    setProblem(null);
    try {
      await sendCode(method, target, meta);
      setContact(target);
      setCode("");
      setCooldown(RESEND_SECONDS);
    } catch (err) {
      const p = explain(err);
      setProblem(p.message);
      if (p.cooldown) {
        setContact(target);
        setCooldown(p.cooldown);
      }
    } finally {
      setBusy(false);
    }
  }

  async function verify(e: React.FormEvent) {
    e.preventDefault();
    if (!method || !contact) return;
    const token = code.replace(/\D/g, "");
    if (token.length !== 6) {
      setProblem("รหัสมี 6 หลัก ตรวจตัวเลขอีกครั้ง");
      return;
    }
    setBusy(true);
    setProblem(null);
    try {
      await verifyCode(method, contact, token);
      onSignedIn();
    } catch (err) {
      setProblem(explain(err).message);
    } finally {
      setBusy(false);
    }
  }

  function changeContact() {
    setContact(null);
    setCode("");
    setProblem(null);
  }

  const shown = contact ? (method === "phone" ? formatThaiMobile(contact) : contact) : "";

  return (
    <div className="auth">
      {!method && (
        <fieldset className="auth__choose">
          <legend>
            <h2 ref={headingRef} tabIndex={-1}>
              เลือกวิธีเข้าสู่ระบบ
            </h2>
          </legend>
          <p className="auth__hint">เลือกอย่างใดอย่างหนึ่ง ใช้เบอร์มือถือหรืออีเมลที่คุณเปิดดูได้ตอนนี้</p>
          <div className="auth__methods">
            {methods.includes("phone") && (
              <button type="button" className="auth__method" onClick={() => setMethod("phone")}>
                <span className="auth__method-name">เบอร์โทรศัพท์</span>
                <span className="auth__method-sub">รับรหัสทางข้อความ SMS</span>
              </button>
            )}
            {methods.includes("email") && (
              <button type="button" className="auth__method" onClick={() => setMethod("email")}>
                <span className="auth__method-name">อีเมล</span>
                <span className="auth__method-sub">รับรหัสทางอีเมล</span>
              </button>
            )}
          </div>
        </fieldset>
      )}

      {method && !contact && (
        <form onSubmit={send} className="auth__form" noValidate>
          <h2 ref={headingRef} tabIndex={-1}>
            {method === "phone" ? "เบอร์มือถือของคุณ" : "อีเมลของคุณ"}
          </h2>
          <label htmlFor={`${id}-contact`} className="auth__label">
            {method === "phone" ? "เบอร์มือถือ 10 หลัก" : "อีเมล"}
          </label>
          <input
            id={`${id}-contact`}
            className="auth__input"
            type={method === "phone" ? "tel" : "email"}
            inputMode={method === "phone" ? "tel" : "email"}
            autoComplete={method === "phone" ? "tel-national" : "email"}
            placeholder={method === "phone" ? "08x-xxx-xxxx" : "name@example.com"}
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
            aria-describedby={`${id}-contact-help`}
            aria-invalid={problem ? true : undefined}
            required
          />
          <p id={`${id}-contact-help`} className="auth__hint">
            เราจะส่งรหัส 6 หลักไป{method === "phone" ? "ทาง SMS" : "ทางอีเมล"} ใช้รหัสนั้นเข้าสู่ระบบ ไม่ต้องตั้งรหัสผ่าน
          </p>
          {audience === "learner" && (
            <p className="auth__privacy">
              เมื่อเข้าสู่ระบบ ชื่อที่คุณตั้ง {method === "phone" ? "เบอร์มือถือ" : "อีเมล"} และความคืบหน้าการเรียนในแอปนี้
              จะถูกบันทึกในบัญชี และเจ้าหน้าที่ที่ได้รับอนุญาตของโรงพยาบาลดูได้{" "}
              <Link to="/privacy">อ่านรายละเอียด</Link>
            </p>
          )}
          {problem && (
            <p className="auth__problem" role="alert">
              {problem}
            </p>
          )}
          <div className="auth__actions">
            <button type="submit" className="btn btn--primary" disabled={busy}>
              {busy ? "กำลังส่งรหัส…" : "ส่งรหัส"}
            </button>
            {methods.length > 1 && (
              <button type="button" className="btn btn--quiet" onClick={() => { setMethod(null); setRaw(""); setProblem(null); }}>
                เปลี่ยนวิธี
              </button>
            )}
          </div>
        </form>
      )}

      {method && contact && (
        <form onSubmit={verify} className="auth__form" noValidate>
          <h2 ref={headingRef} tabIndex={-1}>
            ใส่รหัส 6 หลัก
          </h2>
          <p className="auth__sent">
            ส่งรหัสไปที่ <strong>{shown}</strong> แล้ว{" "}
            <button type="button" className="linklike" onClick={changeContact}>
              {method === "phone" ? "แก้ไขเบอร์" : "แก้ไขอีเมล"}
            </button>
          </p>
          <p className="auth__hint">
            {method === "phone"
              ? "รหัสมาทางข้อความ SMS ในมือถือเครื่องนี้หรือเครื่องที่ใช้เบอร์นี้"
              : "เปิดกล่องอีเมล หาอีเมลชื่อ “รหัสยืนยัน ANC Learn” ถ้าไม่เห็น ลองดูในจดหมายขยะ (Junk / Spam)"}{" "}
            รหัสใช้ได้ 10 นาที
          </p>
          <label htmlFor={`${id}-code`} className="auth__label">
            รหัส 6 หลัก
          </label>
          <input
            id={`${id}-code`}
            ref={codeRef}
            className="auth__input auth__input--code"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9]*"
            maxLength={12}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/[^\d]/g, "").slice(0, 6))}
            aria-invalid={problem ? true : undefined}
          />
          {problem && (
            <p className="auth__problem" role="alert">
              {problem}
            </p>
          )}
          <div className="auth__actions">
            <button type="submit" className="btn btn--primary" disabled={busy}>
              {busy ? "กำลังตรวจรหัส…" : "ยืนยันรหัส"}
            </button>
            <button type="button" className="btn btn--quiet" disabled={busy || cooldown > 0} onClick={() => void send()}>
              {cooldown > 0 ? `ขอรหัสใหม่ได้ใน ${cooldown} วินาที` : "ขอรหัสใหม่"}
            </button>
          </div>
          <details className="auth__help">
            <summary>ไม่ได้รับรหัส ทำอย่างไร</summary>
            <ul>
              <li>ตรวจว่า{method === "phone" ? "เบอร์" : "อีเมล"}ข้างบนถูกต้อง ถ้าผิด กด “แก้ไข”</li>
              <li>รอ 1 นาที แล้วกด “ขอรหัสใหม่” ใช้รหัสล่าสุดเท่านั้น</li>
              {methods.length > 1 && <li>ลองเข้าสู่ระบบด้วยอีกวิธีหนึ่ง</li>}
              <li>ยังไม่ได้รับ ถามเจ้าหน้าที่ที่คลินิก เจ้าหน้าที่จะไม่ขอรหัสของคุณ</li>
            </ul>
          </details>
        </form>
      )}
    </div>
  );
}
