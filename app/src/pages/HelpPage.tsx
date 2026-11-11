import { Link } from "react-router";
import { accountsEnabled } from "../account/config";

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
        <p>ไม่ต้อง ทุกบทเรียนและวิดีโอเปิดดูได้เลย{accountsEnabled ? " การเข้าสู่ระบบช่วยเก็บความคืบหน้าไว้ในบัญชี เปิดจากเครื่องอื่นได้ และเจ้าหน้าที่ที่ดูแลคุณเห็นว่าเรียนถึงไหน" : ""}</p>
      </details>
      {accountsEnabled && (
        <>
          <details className="faq">
            <summary>รหัส 6 หลักมาจากไหน</summary>
            <p>ถ้าเลือกเบอร์โทรศัพท์ รหัสมาเป็นข้อความ SMS ถ้าเลือกอีเมล รหัสมาในอีเมลชื่อ “รหัสยืนยัน ANC Learn” รหัสใช้ได้ 10 นาที</p>
          </details>
          <details className="faq">
            <summary>รหัสไม่มา ทำอย่างไร</summary>
            <ul>
              <li>ตรวจเบอร์หรืออีเมลที่พิมพ์ ถ้าผิดกด “แก้ไข”</li>
              <li>อีเมล: ดูในจดหมายขยะ (Junk / Spam)</li>
              <li>รอ 1 นาที แล้วกด “ขอรหัสใหม่” ใช้รหัสล่าสุด</li>
              <li>ลองอีกวิธีหนึ่ง (เบอร์โทรศัพท์หรืออีเมล)</li>
              <li>ยังไม่ได้ ถามเจ้าหน้าที่ที่คลินิก เจ้าหน้าที่จะไม่ขอรหัสของคุณ</li>
            </ul>
          </details>
          <details className="faq">
            <summary>เปลี่ยนเบอร์ ทำมือถือหาย หรือเข้าบัญชีเดิมไม่ได้</summary>
            <p>ติดต่อเจ้าหน้าที่ที่คลินิก ห้ามบอกรหัสยืนยันกับใคร</p>
          </details>
          <details className="faq">
            <summary>ใช้มือถือร่วมกับคนในบ้าน</summary>
            <p>เข้าสู่ระบบด้วยเบอร์หรืออีเมลของตัวเอง และออกจากระบบทุกครั้งที่เรียนเสร็จ (บัญชีของฉัน → ออกจากระบบ)</p>
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
