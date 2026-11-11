import { appUrl, qrPath, qrViewBox } from "../generated/qr";
import { formatPassword, formatPatientId } from "./auth";

/**
 * The paper slip staff hand over: who, the sign-in ID, the password, and how to start. Shown once after
 * creating an account or issuing a new password; the password cannot be shown again afterwards.
 */
export function CredentialSlip({
  kind,
  name,
  id,
  password,
  onClose,
}: {
  kind: "learner" | "staff";
  name: string;
  id: string;
  password: string;
  onClose: () => void;
}) {
  return (
    <section className="slip-wrap" aria-labelledby="slip-title">
      <p className="slip-warn" role="alert">
        พิมพ์หรือเขียนใบนี้ให้{kind === "learner" ? "ผู้เรียน" : "เจ้าหน้าที่"}ตอนนี้ ปิดแล้วจะดูรหัสผ่านนี้อีกไม่ได้ (ถ้าหายให้ออกรหัสผ่านใหม่)
      </p>
      <div className="slip" id="credential-slip">
        <p className="slip__org">โรงพยาบาลพิมาย · ANC Learn</p>
        <h2 id="slip-title" className="slip__title">{kind === "learner" ? "บัตรเข้าใช้บทเรียนคู่สมุดสีชมพู" : "บัญชีเจ้าหน้าที่ ANC Learn"}</h2>
        <p className="slip__name">{name}</p>
        <dl className="slip__creds">
          <dt>{kind === "learner" ? "รหัสผู้เรียน" : "อีเมลงาน"}</dt>
          <dd className="slip__value">{kind === "learner" ? formatPatientId(id) : id}</dd>
          <dt>รหัสผ่าน</dt>
          <dd className="slip__value">{formatPassword(password)}</dd>
        </dl>
        {kind === "learner" ? (
          <div className="slip__how">
            <svg className="slip__qr" viewBox={qrViewBox} role="img" aria-label={`คิวอาร์โค้ดไปที่ ${appUrl}`} shapeRendering="crispEdges">
              <rect x="0" y="0" width="100%" height="100%" fill="#fff" />
              <path d={qrPath} stroke="#000" />
            </svg>
            <ol>
              <li>สแกน QR หรือเปิด {appUrl.replace(/^https:\/\//, "").replace(/\/$/, "")}</li>
              <li>แตะ “เข้าสู่ระบบ” ใส่รหัสผู้เรียนและรหัสผ่านนี้</li>
              <li>เก็บใบนี้ไว้กับสมุดสีชมพู อย่าให้ผู้อื่นดู</li>
            </ol>
          </div>
        ) : (
          <ol className="slip__how-list">
            <li>เปิดแอป → วิธีใช้งานและช่วยเหลือ → สำหรับเจ้าหน้าที่ (/staff)</li>
            <li>ใส่อีเมลงานและรหัสผ่านนี้</li>
            <li>ตั้งค่าแอปยืนยันตัวตนในมือถือ (ครั้งแรก) แล้วใส่รหัส 6 หลักจากแอป</li>
          </ol>
        )}
        <p className="slip__note">ลืมรหัสผ่าน: ขอให้{kind === "learner" ? "เจ้าหน้าที่ที่คลินิก" : "ผู้ดูแลระบบ"}ออกรหัสผ่านใหม่</p>
      </div>
      <div className="auth__actions slip-actions">
        <button type="button" className="btn btn--primary" onClick={() => window.print()}>
          พิมพ์ใบนี้
        </button>
        <button
          type="button"
          className="btn btn--quiet"
          onClick={() => {
            if (confirm("ให้ใบรหัสแล้วใช่ไหม ปิดแล้วจะดูรหัสผ่านนี้อีกไม่ได้")) onClose();
          }}
        >
          เสร็จแล้ว ปิดใบนี้
        </button>
      </div>
    </section>
  );
}
