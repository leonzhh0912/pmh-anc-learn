import { Link } from "react-router";
import { allApproved, handbookSource } from "../content/load";
import { resetProgress } from "../lib/progress";

export function AboutPage() {
  return (
    <main className="page about">
      <Link to="/" className="lesson__back">
        ‹ หน้าแรก
      </Link>
      <h1>เกี่ยวกับแอปนี้</h1>
      <p>
        แอปนี้เป็น{allApproved ? "" : "ต้นแบบ"}สื่อการเรียนรู้ของโรงพยาบาลพิมาย จัดทำตามเนื้อหาใน
        “{handbookSource.title}” โดย{handbookSource.publisher}
      </p>
      <p>
        แอปนี้ไม่ใช่เครื่องมือวินิจฉัยโรค และไม่ได้แทนคำแนะนำของแพทย์หรือเจ้าหน้าที่สาธารณสุข
        หากมีอาการผิดปกติหรือไม่แน่ใจ ให้ติดต่อสถานพยาบาลใกล้บ้าน
      </p>
      <h2>ข้อมูลของคุณ</h2>
      <p>
        แอปไม่ขอชื่อ ไม่ต้องสมัครสมาชิก และไม่ส่งข้อมูลออกจากเครื่อง ความคืบหน้าการเรียนเก็บไว้ในเครื่องนี้เท่านั้น
      </p>
      <button
        type="button"
        className="btn btn--quiet"
        onClick={() => {
          if (confirm("ล้างความคืบหน้าการเรียนทั้งหมดในเครื่องนี้?")) resetProgress();
        }}
      >
        ล้างความคืบหน้าการเรียน
      </button>
      <h2>สำหรับเจ้าหน้าที่</h2>
      <p>
        <Link to="/curriculum">ดูความครอบคลุมของหลักสูตรและสถานะการตรวจทาน</Link>
      </p>
      <h2>แหล่งที่มา</h2>
      <p>
        <a href={handbookSource.url} rel="noopener" target="_blank">
          {handbookSource.title} (อนามัยมีเดีย กรมอนามัย)
        </a>
      </p>
    </main>
  );
}
