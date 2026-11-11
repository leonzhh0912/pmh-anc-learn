import { Link } from "react-router";

/** Shown when this build has no account service configured (e.g. the public site). */
export function AccountsOff() {
  return (
    <main className="page">
      <Link to="/" className="lesson__back">
        ‹ หน้าแรก
      </Link>
      <h1>ยังไม่เปิดใช้บัญชีผู้ใช้</h1>
      <p>
        ตอนนี้เรียนได้ทุกบทโดยไม่ต้องเข้าสู่ระบบ ความคืบหน้าบันทึกไว้ในเครื่องนี้เท่านั้น ยังไม่ส่งออกจากเครื่อง
      </p>
      <Link className="btn btn--primary" to="/">
        กลับไปเรียน
      </Link>
    </main>
  );
}
