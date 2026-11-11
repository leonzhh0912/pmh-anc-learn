import { useEffect, useState } from "react";
import { Link } from "react-router";
import { call } from "../../account/auth";
import { signOut, useSession } from "../../account/session";
import { formatBangkok } from "../../account/SyncStatus";
import { lessons } from "../../content/load";
import { StaffGate } from "./StaffGate";

type Row = {
  id: string;
  display_name: string;
  contact_hint: string;
  contact_method: "phone" | "email";
  status: string;
  name_verified_at: string | null;
  tutorial_completed_at: string | null;
  tutorial_started_at: string | null;
  tutorial_skipped_at: string | null;
  completed: number;
  in_progress: number;
  last_activity_at: string | null;
  last_synced_at: string | null;
};
type ListResult = { total: number; page: number; page_size: number; rows: Row[] };

const filters = [
  { value: "all", label: "ทั้งหมด" },
  { value: "in_progress", label: "มีบทที่เรียนค้าง" },
  { value: "not_started", label: "ยังไม่เริ่มบทเรียน" },
  { value: "tutorial_not_done", label: "ยังไม่จบวิธีใช้งาน" },
];

export function StaffPage() {
  return (
    <StaffGate>
      <StaffDashboard />
    </StaffGate>
  );
}

export function StaffHeader({ title }: { title: string }) {
  const s = useSession();
  const me = s.account.kind === "staff" ? s.account : null;
  return (
    <header className="staff__head">
      <div>
        <p className="staff__who">
          {me?.display_name} · {me?.role === "admin" ? "ผู้ดูแลระบบ" : "เจ้าหน้าที่"}
        </p>
        <h1>{title}</h1>
      </div>
      <nav className="staff__nav" aria-label="เมนูเจ้าหน้าที่">
        <Link to="/staff">ผู้เรียน</Link>
        {me?.role === "admin" && <Link to="/admin">ผู้ดูแลระบบ</Link>}
        <button type="button" className="btn btn--quiet" onClick={() => void signOut({ discardPending: true })}>
          ออกจากระบบ
        </button>
      </nav>
    </header>
  );
}

function tutorialLabel(r: Pick<Row, "tutorial_completed_at" | "tutorial_started_at" | "tutorial_skipped_at">) {
  if (r.tutorial_completed_at) return "จบแล้ว";
  if (r.tutorial_skipped_at) return "ข้าม";
  if (r.tutorial_started_at) return "เริ่มแล้ว";
  return "ยังไม่เริ่ม";
}

function StaffDashboard() {
  const [query, setQuery] = useState("");
  const [applied, setApplied] = useState("");
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<ListResult | null>(null);
  const [problem, setProblem] = useState<string | null>(null);
  const [loadedAt, setLoadedAt] = useState<string | null>(null);

  useEffect(() => {
    let live = true;
    setProblem(null);
    call<ListResult>("staff_list_learners", { p_query: applied, p_filter: filter, p_page: page, p_page_size: 20 })
      .then((d) => {
        if (!live) return;
        setData(d);
        setLoadedAt(new Date().toISOString());
      })
      .catch((e: Error) => live && setProblem(e.message === "mfa_required" ? "ต้องยืนยันตัวตนขั้นที่ 2 ใหม่" : "โหลดรายชื่อไม่สำเร็จ ต้องเชื่อมต่ออินเทอร์เน็ต"));
    return () => {
      live = false;
    };
  }, [applied, filter, page]);

  const pages = data ? Math.max(1, Math.ceil(data.total / data.page_size)) : 1;

  return (
    <main className="page staff">
      <StaffHeader title="ความคืบหน้าผู้เรียน" />
      <p className="staff__scope">
        แสดงเฉพาะผู้เรียนในกลุ่มที่คุณได้รับมอบหมาย ทุกครั้งที่เปิดดู ระบบบันทึกไว้ ข้อมูล ณ {formatBangkok(loadedAt)} (เวลาไทย)
      </p>
      <form
        className="staff__search"
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          setPage(1);
          setApplied(query);
        }}
      >
        <label htmlFor="staff-q" className="auth__label">
          ค้นหาชื่อ หรือเลขท้ายเบอร์ / อีเมล
        </label>
        <div className="staff__searchrow">
          <input id="staff-q" className="auth__input" value={query} onChange={(e) => setQuery(e.target.value)} />
          <button type="submit" className="btn btn--primary">
            ค้นหา
          </button>
        </div>
        <label htmlFor="staff-filter" className="auth__label">
          แสดง
        </label>
        <select
          id="staff-filter"
          className="auth__input"
          value={filter}
          onChange={(e) => {
            setPage(1);
            setFilter(e.target.value);
          }}
        >
          {filters.map((f) => (
            <option key={f.value} value={f.value}>
              {f.label}
            </option>
          ))}
        </select>
      </form>

      {problem && (
        <p className="auth__problem" role="alert">
          {problem}
        </p>
      )}
      {data && (
        <>
          <p role="status">พบ {data.total} คน</p>
          {data.total === 0 && (
            <p className="notice">ยังไม่มีผู้เรียนในกลุ่มของคุณ ถ้าคิดว่าควรมี ติดต่อผู้ดูแลระบบให้เพิ่มผู้เรียนเข้ากลุ่ม</p>
          )}
          <ul className="learners">
            {data.rows.map((r) => (
              <li key={r.id} className="learners__row">
                <Link to={`/staff/learner/${r.id}`} className="learners__name">
                  {r.display_name || "(ยังไม่ได้ตั้งชื่อ)"}
                </Link>
                <span className="learners__ref">
                  {r.contact_hint} {r.name_verified_at ? "· ยืนยันชื่อแล้ว" : "· ชื่อที่ผู้เรียนตั้งเอง"}
                  {r.status !== "active" && " · ปิดใช้งาน"}
                </span>
                <span className="learners__stats">
                  วิธีใช้งาน: {tutorialLabel(r)} · จบ {r.completed} จาก {lessons.length} บท
                  {r.in_progress > 0 && ` · ค้าง ${r.in_progress} บท`}
                </span>
                <span className="learners__time">
                  เรียนล่าสุด {formatBangkok(r.last_activity_at)} · ส่งเข้าระบบล่าสุด {formatBangkok(r.last_synced_at)}
                </span>
                <span className="learners__bar" aria-hidden="true">
                  <span style={{ width: `${(100 * r.completed) / lessons.length}%` }} />
                </span>
              </li>
            ))}
          </ul>
          {pages > 1 && (
            <nav className="lesson__nav" aria-label="หน้ารายชื่อ">
              <button type="button" className="btn btn--quiet" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                หน้าก่อน
              </button>
              <span>
                หน้า {page} จาก {pages}
              </span>
              <button type="button" className="btn btn--quiet" disabled={page >= pages} onClick={() => setPage(page + 1)}>
                หน้าถัดไป
              </button>
            </nav>
          )}
        </>
      )}
      <p className="staff__note">
        “เรียนจบ” หมายถึงผู้เรียนเรียนถึงขั้นสุดท้ายและกด “จบบทเรียน” ตามกติกาของแอป ไม่ได้พิสูจน์ว่าเข้าใจเนื้อหา
        ข้อมูลที่ยังไม่ได้ส่งจากมือถือของผู้เรียน (เช่น ไม่มีอินเทอร์เน็ต) จะยังไม่แสดง ดู “ส่งเข้าระบบล่าสุด”
      </p>
    </main>
  );
}
