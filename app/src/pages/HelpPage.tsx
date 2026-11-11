import { Link } from "react-router";
import { accountsEnabled, requireLogin } from "../account/config";

/** Permanent help: replay the tutorial, plus short answers to common problems. Works without signing in. */
export function HelpPage() {
  return (
    <main className="page help">
      <Link to="/" className="lesson__back">
        ‹ หน้าแรก
      </Link>
      <h1>วิธีใช้งานและช่วยเหลือ</h1>
      <Link className="start-here" to="/start">
        <span className="start-here__label">วิธีใช้งาน</span>
        <span className="start-here__title">ดูวิธีใช้งานทีละขั้น</span>
        <span className="start-here__meta">มีปุ่มให้ลองกด และวิดีโอสั้น ดูซ้ำได้ทุกเมื่อ</span>
      </Link>

      <h2>คำถามที่พบบ่อย</h2>
      <details className="faq">
        <summary>ต้องเข้าสู่ระบบไหม</summary>
        <p>
          {requireLogin
            ? "ต้องเข้าสู่ระบบก่อนเริ่มเรียน ด้วยรหัสผู้เรียนและรหัสผ่านจากใบที่เจ้าหน้าที่ให้ หน้าวิธีใช้งานและหน้านี้เปิดดูได้โดยไม่ต้องเข้าสู่ระบบ"
            : `ไม่ต้อง ทุกบทเรียนและวิดีโอเปิดดูได้เลย${accountsEnabled ? " การเข้าสู่ระบบช่วยเก็บความคืบหน้าไว้ในบัญชี เปิดจากเครื่องอื่นได้ และเจ้าหน้าที่ที่ดูแลคุณเห็นว่าเรียนถึงไหน" : ""}`}
        </p>
      </details>
      {accountsEnabled && (
        <>
          <details className="faq">
            <summary>จะมีบัญชีได้อย่างไร</summary>
            <p>ขอให้เจ้าหน้าที่ที่คลินิกสร้างบัญชีให้ คุณจะได้ใบที่มีรหัสผู้เรียน 8 หลักและรหัสผ่าน ไม่ต้องสมัครเอง</p>
          </details>
          <details className="faq">
            <summary>เข้าสู่ระบบอย่างไร</summary>
            <p>แตะ “เข้าสู่ระบบ” ที่มุมบน พิมพ์รหัสผู้เรียนและรหัสผ่านจากใบ แล้วแตะ “เข้าสู่ระบบ”</p>
          </details>
          <details className="faq">
            <summary>ลืมรหัสผ่าน หรือทำใบหาย</summary>
            <p>ถามเจ้าหน้าที่ที่คลินิกให้ออกรหัสผ่านใหม่ คุณจะได้ใบใหม่ ความคืบหน้าการเรียนยังอยู่ครบ รหัสผ่านเดิมจะใช้ไม่ได้อีก</p>
          </details>
          <details className="faq">
            <summary>อยากเปลี่ยนรหัสผ่าน</summary>
            <p>เข้าสู่ระบบ แล้วไปที่ “บัญชีของฉัน” → “ตั้งรหัสผ่านของคุณเอง” (ไม่บังคับ)</p>
          </details>
          <details className="faq">
            <summary>ใช้มือถือร่วมกับคนในบ้าน</summary>
            <p>ใช้บัญชีของตัวเอง และออกจากระบบทุกครั้งที่เรียนเสร็จ (บัญชีของฉัน → ออกจากระบบ) อย่าให้ผู้อื่นดูใบรหัส</p>
          </details>
        </>
      )}
      <details className="faq">
        <summary>ไม่มีอินเทอร์เน็ต เรียนได้ไหม</summary>
        <p>
          บทเรียนที่เคยเปิดแล้วดูได้แม้ไม่มีอินเทอร์เน็ต วิดีโอที่เคยเล่นจนจบจะเล่นซ้ำได้
          {accountsEnabled ? " แต่การเข้าสู่ระบบและการส่งความคืบหน้าเข้าบัญชีต้องใช้อินเทอร์เน็ต แอปจะส่งให้เองเมื่อเน็ตกลับมา" : ""}
        </p>
      </details>
      <details className="faq">
        <summary>ตัวอักษรเล็กไป</summary>
        <p>แตะปุ่ม ก ที่มุมขวาบน มี 3 ขนาด</p>
      </details>
      <p className="help__note">แอปนี้ให้ความรู้ตามสมุดสีชมพู ไม่ใช่เครื่องมือวินิจฉัยโรค ถ้ามีอาการผิดปกติ ทำตามที่สมุดสีชมพูแนะนำ</p>
      {accountsEnabled && (
        <p>
          <Link to="/staff">สำหรับเจ้าหน้าที่โรงพยาบาล</Link>
        </p>
      )}
    </main>
  );
}
