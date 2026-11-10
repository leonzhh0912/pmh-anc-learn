import { useState } from "react";
import { Link } from "react-router";
import { appUrl, qrPath, qrUrl, qrViewBox } from "../generated/qr";

/**
 * Staff page: printable A4 poster and an A4 sheet of 12 stickers for the inside cover of the pink
 * handbook. Both carry the QR code for the app. Open /poster, press "พิมพ์", choose A4.
 */
function Qr({ label }: { label: string }) {
  return (
    <svg className="qr" viewBox={qrViewBox} role="img" aria-label={label} shapeRendering="crispEdges">
      <rect x="0" y="0" width="100%" height="100%" fill="#fff" />
      <path d={qrPath} stroke="#000" />
    </svg>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      className="btn btn--quiet"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
        } catch {
          window.prompt("คัดลอกลิงก์นี้", text);
        }
      }}
    >
      {copied ? "คัดลอกแล้ว" : "คัดลอกลิงก์"}
    </button>
  );
}

const shortUrl = appUrl.replace(/^https:\/\//, "").replace(/\/$/, "");

export function PosterPage() {
  return (
    <main className="page poster-page">
      <div className="poster-page__tools">
        <Link to="/about" className="lesson__back">
          ‹ เกี่ยวกับแอป
        </Link>
        <h1>โปสเตอร์และสติกเกอร์ QR</h1>
        <p>
          สำหรับเจ้าหน้าที่: พิมพ์บนกระดาษ A4 หน้าแรกเป็นโปสเตอร์สำหรับติดที่คลินิก หน้าที่สองเป็นสติกเกอร์ 12 ดวง
          สำหรับติดด้านในปกสมุดสีชมพู
        </p>
        <button type="button" className="btn btn--primary" onClick={() => window.print()}>
          พิมพ์
        </button>
        <h2 className="poster-page__sub">ลิงก์สำหรับส่งใน LINE</h2>
        <p>
          ลิงก์นี้ทำให้ LINE เปิดแอปในเบราว์เซอร์ของมือถือ (Safari หรือ Chrome) ซึ่งเพิ่มไว้ที่หน้าจอหลักได้
          คิวอาร์โค้ดด้านล่างใช้ลิงก์เดียวกัน
        </p>
        <p className="poster-page__link">{qrUrl}</p>
        <CopyButton text={qrUrl} />
      </div>

      <section className="sheet poster" aria-label="โปสเตอร์">
        <p className="poster__org">โรงพยาบาลพิมาย</p>
        <h2 className="poster__title">เรียนรู้คู่สมุดสีชมพู</h2>
        <p className="poster__lede">
          บทเรียนสั้น ๆ พร้อมวิดีโอ จากสมุดบันทึกสุขภาพแม่และเด็ก ฉบับปรับปรุงใหม่ พ.ศ. 2568
          สำหรับคุณแม่ ครอบครัว และผู้ดูแลเด็ก
        </p>
        <Qr label={`คิวอาร์โค้ดไปที่ ${appUrl}`} />
        <p className="poster__scan">สแกนด้วยกล้องมือถือ</p>
        <ul className="poster__points">
          <li>ฟรี ไม่ต้องสมัคร ไม่ต้องดาวน์โหลดจากร้านแอป</li>
          <li>เพิ่มไว้ที่หน้าจอหลักได้ เปิดดูซ้ำได้ทุกเมื่อ</li>
          <li>แนะนำให้ดูวิดีโอเมื่อเชื่อมต่อ Wi-Fi</li>
        </ul>
        <p className="poster__url">{shortUrl}</p>
      </section>

      <section className="sheet stickers" aria-label="สติกเกอร์สำหรับสมุดสีชมพู">
        {Array.from({ length: 12 }, (_, i) => (
          <div className="sticker" key={i}>
            <Qr label={`คิวอาร์โค้ดไปที่ ${appUrl}`} />
            <p className="sticker__title">บทเรียนคู่สมุดสีชมพู</p>
            <p className="sticker__scan">สแกนเพื่อเรียนและดูวิดีโอ</p>
          </div>
        ))}
      </section>
    </main>
  );
}
