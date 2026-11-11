import { Link } from "react-router";
import { flush, useSession } from "./session";

const bangkok = new Intl.DateTimeFormat("th-TH", {
  timeZone: "Asia/Bangkok",
  dateStyle: "medium",
  timeStyle: "short",
});
export const formatBangkok = (iso: string | null | undefined) => (iso ? bangkok.format(new Date(iso)) : "—");

/**
 * Where is my progress? Three honest states:
 *  บันทึกไว้ในเครื่องแล้ว (saved on this device, sending soon) · รอเชื่อมต่ออินเทอร์เน็ต · บันทึกเข้าบัญชีแล้ว
 */
export function SyncStatus({ detailed = false }: { detailed?: boolean }) {
  const s = useSession();
  if (s.phase === "disabled") return null;
  if (s.phase !== "signed-in" || s.account.kind !== "learner") {
    if (!detailed) return null;
    return null;
  }
  let label: string;
  let tone: string;
  if (s.sync === "offline") {
    label = "รอเชื่อมต่ออินเทอร์เน็ต";
    tone = "wait";
  } else if (s.sync === "error") {
    label = "ส่งเข้าบัญชีไม่สำเร็จ จะลองใหม่";
    tone = "wait";
  } else if (s.pending > 0 || s.sync === "sending") {
    label = "บันทึกไว้ในเครื่องแล้ว";
    tone = "local";
  } else {
    label = "บันทึกเข้าบัญชีแล้ว";
    tone = "ok";
  }
  if (!detailed) {
    return (
      <Link to="/account" className={`syncchip syncchip--${tone}`} aria-label={`บัญชีของฉัน: ${label}`}>
        <span className="syncchip__dot" aria-hidden="true" />
        {label}
      </Link>
    );
  }
  return (
    <div className={`syncbox syncbox--${tone}`} role="status">
      <p className="syncbox__label">
        <span className="syncchip__dot" aria-hidden="true" /> {label}
      </p>
      <p className="syncbox__meta">
        {s.pending > 0 && <>รอส่ง {s.pending} รายการ · </>}
        ส่งเข้าบัญชีล่าสุด {formatBangkok(s.lastSyncedAt)}
      </p>
      {s.pending > 0 && (
        <button type="button" className="btn btn--quiet" onClick={() => void flush()}>
          ส่งตอนนี้
        </button>
      )}
    </div>
  );
}
