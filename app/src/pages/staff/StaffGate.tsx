import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router";
import { OtpSignIn } from "../../account/OtpSignIn";
import { staffSignin } from "../../account/config";
import { explain, mfaEnroll, mfaStatus, mfaVerify } from "../../account/auth";
import { signOut, useSession } from "../../account/session";
import { AccountsOff } from "../account/AccountsOff";

/**
 * Staff/admin entry: invitation-only email sign-in, then an authenticator-app code (second factor).
 * This only decides what to draw; the database refuses staff data to anyone without an active staff
 * record and a second factor, whatever this page shows.
 */
export function StaffGate({ admin = false, children }: { admin?: boolean; children: React.ReactNode }) {
  const s = useSession();

  // a page restored from the back/forward cache after sign-out must not show staff data
  useEffect(() => {
    const onShow = (e: PageTransitionEvent) => {
      if (e.persisted) window.location.reload();
    };
    window.addEventListener("pageshow", onShow);
    return () => window.removeEventListener("pageshow", onShow);
  }, []);

  if (s.phase === "disabled") return <AccountsOff />;
  if (s.phase === "loading") return <main className="page"><p role="status">กำลังโหลด…</p></main>;
  // one sign-in page for everyone: staff bookmarks to /staff land there and come back here afterwards
  if (s.phase === "guest" && staffSignin === "password") return <Navigate to="/signin" replace />;
  if (s.phase === "guest")
    return (
      <main className="page staff">
        <Link to="/" className="lesson__back">
          ‹ หน้าแรก
        </Link>
        <h1>เข้าสู่ระบบเจ้าหน้าที่</h1>
        <p>สำหรับเจ้าหน้าที่ที่ผู้ดูแลระบบสร้างบัญชีให้แล้วเท่านั้น ใช้อีเมลงาน แล้วตามด้วยรหัสจากแอปยืนยันตัวตน</p>
        <OtpSignIn methods={["email"]} meta={{ intent: "staff" }} audience="staff" onSignedIn={() => undefined} />
      </main>
    );
  if (s.account.kind !== "staff")
    return (
      <main className="page staff">
        <h1>บัญชีนี้ไม่ใช่บัญชีเจ้าหน้าที่</h1>
        <p>คุณเข้าสู่ระบบด้วยบัญชีผู้เรียน ถ้าเป็นเจ้าหน้าที่ ออกจากระบบแล้วเข้าด้วยอีเมลงานที่ผู้ดูแลระบบใช้สร้างบัญชีเจ้าหน้าที่</p>
        <button type="button" className="btn btn--quiet" onClick={() => void signOut({ discardPending: false }).catch(() => signOut({ discardPending: true }))}>
          ออกจากระบบ
        </button>
      </main>
    );
  if (s.account.status !== "active")
    return (
      <main className="page staff">
        <h1>สิทธิ์เจ้าหน้าที่ถูกปิดใช้งาน</h1>
        <p>ติดต่อผู้ดูแลระบบของโรงพยาบาล</p>
        <button type="button" className="btn btn--quiet" onClick={() => void signOut({ discardPending: true })}>
          ออกจากระบบ
        </button>
      </main>
    );
  // the authenticator step only when the server requires it (PMH default: off, password only)
  if (s.account.mfa_required && s.account.aal !== "aal2") return <SecondFactor />;
  if (admin && s.account.role !== "admin")
    return (
      <main className="page staff">
        <h1>หน้านี้สำหรับผู้ดูแลระบบ</h1>
        <Link to="/staff">กลับหน้าเจ้าหน้าที่</Link>
      </main>
    );
  return <>{children}</>;
}

function SecondFactor() {
  const [mode, setMode] = useState<"loading" | "challenge" | "enroll">("loading");
  const [factorId, setFactorId] = useState<string | null>(null);
  const [qr, setQr] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [problem, setProblem] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void (async () => {
      const st = await mfaStatus();
      if (st.factorId) {
        setFactorId(st.factorId);
        setMode("challenge");
      } else {
        const e = await mfaEnroll();
        setFactorId(e.factorId);
        setQr(e.qr);
        setSecret(e.secret);
        setMode("enroll");
      }
    })().catch((err) => setProblem(explain(err).message));
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!factorId) return;
    setBusy(true);
    setProblem(null);
    try {
      await mfaVerify(factorId, code.replace(/\D/g, ""));
    } catch {
      setProblem("รหัสไม่ถูกต้อง ใช้รหัสล่าสุดในแอปยืนยันตัวตน (รหัสเปลี่ยนทุก 30 วินาที)");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="page staff">
      <h1>ยืนยันตัวตนขั้นที่ 2</h1>
      <p>
        ข้อมูลผู้เรียนเป็นข้อมูลส่วนบุคคล เจ้าหน้าที่ต้องใช้รหัสจากแอปยืนยันตัวตนในมือถือ (เช่น Google Authenticator หรือ
        Microsoft Authenticator) ทุกครั้งที่เข้าสู่ระบบ
      </p>
      {mode === "enroll" && (
        <section className="mfa">
          <h2>ตั้งค่าครั้งแรก</h2>
          <ol>
            <li>เปิดแอปยืนยันตัวตนในมือถือของคุณ แล้วเลือกเพิ่มบัญชี / สแกน QR</li>
            <li>สแกนรูปนี้</li>
          </ol>
          {qr && <img className="mfa__qr" src={qr} alt="คิวอาร์โค้ดสำหรับแอปยืนยันตัวตน" width={200} height={200} />}
          <details>
            <summary>สแกนไม่ได้ พิมพ์รหัสตั้งค่าแทน</summary>
            <p className="mfa__secret">{secret}</p>
          </details>
          <p>3. พิมพ์รหัส 6 หลักที่แอปแสดง</p>
        </section>
      )}
      {mode === "challenge" && <p>เปิดแอปยืนยันตัวตน แล้วพิมพ์รหัส 6 หลักของ ANC Learn</p>}
      {mode !== "loading" && (
        <form onSubmit={submit} className="auth__form">
          <label htmlFor="mfa-code" className="auth__label">
            รหัสจากแอปยืนยันตัวตน
          </label>
          <input
            id="mfa-code"
            className="auth__input auth__input--code"
            inputMode="numeric"
            autoComplete="one-time-code"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
          />
          <div className="auth__actions">
            <button type="submit" className="btn btn--primary" disabled={busy}>
              ยืนยัน
            </button>
            <button type="button" className="btn btn--quiet" onClick={() => void signOut({ discardPending: true })}>
              ออกจากระบบ
            </button>
          </div>
        </form>
      )}
      {problem && (
        <p className="auth__problem" role="alert">
          {problem}
        </p>
      )}
    </main>
  );
}
