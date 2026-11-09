import type { EditorialStatus } from "../content/schema";
import { isApproved } from "../content/load";

const label: Record<EditorialStatus, string> = {
  DRAFT: "ฉบับร่าง",
  MEDICAL_REVIEW: "อยู่ระหว่างตรวจทาน",
  APPROVED: "ผ่านการตรวจทานแล้ว",
  PUBLISHED: "เผยแพร่แล้ว",
};

/**
 * Shown on every lesson that is not yet approved by PMH medical reviewers.
 * Compact so it does not crowd small screens, but it cannot be dismissed:
 * draft content must never look authoritative.
 */
export function DraftBanner({ status }: { status: EditorialStatus }) {
  if (isApproved(status)) return null;
  return (
    <details className="draft-banner" role="note">
      <summary>
        <strong>{label[status]}</strong> ยังไม่ผ่านการตรวจทานทางการแพทย์
      </summary>
      <p>
        เนื้อหานี้ยังไม่ผ่านการตรวจทานโดยบุคลากรทางการแพทย์ของโรงพยาบาลพิมาย ใช้เพื่อทดลองระบบเท่านั้น
        หากมีข้อสงสัยเรื่องสุขภาพ ให้ปรึกษาแพทย์หรือเจ้าหน้าที่สาธารณสุข
      </p>
    </details>
  );
}
