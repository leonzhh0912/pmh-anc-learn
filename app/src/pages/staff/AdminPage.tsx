import { useCallback, useEffect, useState } from "react";
import { call } from "../../account/auth";
import { formatBangkok } from "../../account/SyncStatus";
import { StaffGate } from "./StaffGate";
import { StaffHeader } from "./StaffPage";

type Cohort = { id: string; name: string; learners?: number };
type Staff = {
  user_id: string;
  email: string;
  display_name: string;
  role: "staff" | "admin";
  status: "active" | "deactivated";
  mfa_enrolled: boolean;
  cohorts: Cohort[];
};
type Invitation = { id: string; email: string; display_name: string; role: string; expires_at: string };
type StaffList = { staff: Staff[]; invitations: Invitation[]; cohorts: Cohort[] };
type Learner = { id: string; display_name: string; contact_hint: string; status: string; created_at: string; cohorts: Cohort[] };
type Audit = { id: number; at: string; actor_name: string; actor_role: string; action: string; details: Record<string, unknown> };
type Health = Record<string, number | string | null>;

const actionLabel: Record<string, string> = {
  "staff.list_learners": "เปิดรายชื่อผู้เรียน",
  "staff.view_learner": "เปิดข้อมูลผู้เรียน",
  "staff.view_learner_denied": "พยายามเปิดผู้เรียนนอกกลุ่ม (ถูกปฏิเสธ)",
  "staff.invitation_accepted": "เจ้าหน้าที่เปิดใช้บัญชี (เข้าสู่ระบบครั้งแรก)",
  "admin.invite_staff": "สร้างบัญชีเจ้าหน้าที่",
  "admin.revoke_invitation": "ยกเลิกบัญชีที่ยังไม่เปิดใช้",
  "admin.set_staff_role": "เปลี่ยนบทบาท",
  "admin.set_staff_status": "เปิด/ปิดบัญชีเจ้าหน้าที่",
  "admin.create_cohort": "สร้างกลุ่ม",
  "admin.grant_cohort": "ให้สิทธิ์ดูกลุ่ม",
  "admin.revoke_cohort": "ถอนสิทธิ์ดูกลุ่ม",
  "admin.list_learners": "ค้นหาบัญชีผู้เรียน",
  "admin.add_learner_to_cohort": "เพิ่มผู้เรียนเข้ากลุ่ม",
  "admin.remove_learner_from_cohort": "นำผู้เรียนออกจากกลุ่ม",
  "admin.set_learner_status": "เปิด/ปิดบัญชีผู้เรียน",
  "bootstrap.admin_invitation": "สร้างผู้ดูแลระบบคนแรก (จากฐานข้อมูล)",
};

const problemText = (e: unknown) => {
  const m = e instanceof Error ? e.message : String(e);
  if (m === "last_active_admin") return "ทำไม่ได้: ต้องมีผู้ดูแลระบบที่ใช้งานอยู่อย่างน้อย 1 คน";
  if (m === "email_already_has_account") return "อีเมลนี้มีบัญชีอยู่แล้ว (เช่น บัญชีผู้เรียน) ใช้อีเมลงานอีกอีเมลหนึ่ง";
  if (m === "bad_email") return "อีเมลไม่ถูกต้อง";
  if (/duplicate key/.test(m)) return "มีบัญชีที่รอเปิดใช้สำหรับอีเมลนี้ หรือชื่อนี้อยู่แล้ว";
  return "ทำรายการไม่สำเร็จ ลองอีกครั้ง";
};

export function AdminPage() {
  return (
    <StaffGate admin>
      <AdminDashboard />
    </StaffGate>
  );
}

function AdminDashboard() {
  const [tab, setTab] = useState<"staff" | "learners" | "audit" | "health">("staff");
  return (
    <main className="page staff admin">
      <StaffHeader title="ผู้ดูแลระบบ" />
      <div className="tabs" role="tablist" aria-label="ส่วนของผู้ดูแลระบบ">
        {(
          [
            ["staff", "เจ้าหน้าที่และกลุ่ม"],
            ["learners", "บัญชีผู้เรียน"],
            ["audit", "บันทึกการใช้งาน"],
            ["health", "สถานะระบบ"],
          ] as const
        ).map(([k, label]) => (
          <button key={k} type="button" role="tab" aria-selected={tab === k} className="tabs__tab" onClick={() => setTab(k)}>
            {label}
          </button>
        ))}
      </div>
      {tab === "staff" && <StaffAdmin />}
      {tab === "learners" && <LearnerAdmin />}
      {tab === "audit" && <AuditLog />}
      {tab === "health" && <HealthPanel />}
      <p className="staff__note">
        สิทธิ์ผู้ดูแลระบบใช้จัดการบัญชีเท่านั้น ไม่ใช่สิทธิ์อนุมัติหรือแก้ไขเนื้อหาทางการแพทย์ ทุกการเปลี่ยนแปลงถูกบันทึกไว้
      </p>
    </main>
  );
}

function StaffAdmin() {
  const [data, setData] = useState<StaffList | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [form, setForm] = useState({ email: "", name: "", role: "staff" });
  const [cohortName, setCohortName] = useState("");
  const load = useCallback(() => call<StaffList>("admin_list_staff").then(setData).catch((e) => setMsg(problemText(e))), []);
  useEffect(() => {
    void load();
  }, [load]);
  const act = async (fn: string, args: Record<string, unknown>, ok: string) => {
    setMsg(null);
    try {
      await call(fn, args);
      setMsg(ok);
      await load();
    } catch (e) {
      setMsg(problemText(e));
    }
  };

  return (
    <section aria-label="เจ้าหน้าที่และกลุ่ม">
      {msg && <p role="status" className="notice">{msg}</p>}
      <h2>สร้างบัญชีเจ้าหน้าที่</h2>
      <p className="auth__hint">
        สร้างบัญชีให้เจ้าหน้าที่หรือผู้ดูแลระบบคนใหม่ด้วยอีเมลงาน เจ้าหน้าที่เปิดใช้บัญชีเองภายใน 7 วัน โดยเข้า “เข้าสู่ระบบเจ้าหน้าที่”
        ด้วยอีเมลนั้น แล้วตั้งค่าแอปยืนยันตัวตน ไม่มีการตั้งรหัสผ่านให้ใคร
      </p>
      <form
        className="admin__form"
        onSubmit={(e) => {
          e.preventDefault();
          void act("admin_invite_staff", { p_email: form.email, p_display_name: form.name, p_role: form.role }, "สร้างบัญชีแล้ว แจ้งเจ้าหน้าที่ให้เข้า “เข้าสู่ระบบเจ้าหน้าที่” ด้วยอีเมลนี้ภายใน 7 วัน เพื่อเปิดใช้บัญชี").then(() =>
            setForm({ email: "", name: "", role: "staff" }),
          );
        }}
      >
        <label className="auth__label" htmlFor="inv-email">อีเมลงาน</label>
        <input id="inv-email" className="auth__input" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <label className="auth__label" htmlFor="inv-name">ชื่อที่แสดง</label>
        <input id="inv-name" className="auth__input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <label className="auth__label" htmlFor="inv-role">บทบาท</label>
        <select id="inv-role" className="auth__input" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
          <option value="staff">เจ้าหน้าที่ (ดูผู้เรียนในกลุ่มที่ได้รับมอบหมาย)</option>
          <option value="admin">ผู้ดูแลระบบ (จัดการบัญชีและสิทธิ์)</option>
        </select>
        <button type="submit" className="btn btn--primary">สร้างบัญชี</button>
      </form>

      {data && data.invitations.length > 0 && (
        <>
          <h3>บัญชีที่รอเปิดใช้ (เจ้าหน้าที่ยังไม่เคยเข้าสู่ระบบ)</h3>
          <ul className="admin__list">
            {data.invitations.map((i) => (
              <li key={i.id}>
                {i.display_name} · {i.email} · {i.role === "admin" ? "ผู้ดูแลระบบ" : "เจ้าหน้าที่"} · หมดอายุ {formatBangkok(i.expires_at)}{" "}
                <button type="button" className="btn btn--quiet" onClick={() => void act("admin_revoke_invitation", { p_invitation: i.id }, "ยกเลิกบัญชีแล้ว")}>
                  ยกเลิกบัญชีนี้
                </button>
              </li>
            ))}
          </ul>
        </>
      )}

      <h2>เจ้าหน้าที่</h2>
      <ul className="admin__list">
        {data?.staff.map((s) => (
          <li key={s.user_id} className="admin__staff">
            <p>
              <strong>{s.display_name}</strong> · {s.email} · {s.role === "admin" ? "ผู้ดูแลระบบ" : "เจ้าหน้าที่"} ·{" "}
              {s.status === "active" ? "ใช้งาน" : "ปิดใช้งาน"} · {s.mfa_enrolled ? "ตั้งค่ายืนยันตัวตนแล้ว" : "ยังไม่ได้ตั้งค่ายืนยันตัวตน"}
            </p>
            <fieldset className="admin__cohorts">
              <legend>ดูผู้เรียนในกลุ่ม</legend>
              {data.cohorts.map((c) => {
                const has = s.cohorts.some((x) => x.id === c.id);
                return (
                  <label key={c.id} className="admin__check">
                    <input
                      type="checkbox"
                      checked={has}
                      onChange={() => void act("admin_set_staff_cohort", { p_staff: s.user_id, p_cohort: c.id, p_granted: !has }, has ? "ถอนสิทธิ์แล้ว" : "ให้สิทธิ์แล้ว")}
                    />{" "}
                    {c.name}
                  </label>
                );
              })}
            </fieldset>
            <div className="auth__actions">
              <button
                type="button"
                className="btn btn--quiet"
                onClick={() => void act("admin_set_staff_status", { p_user: s.user_id, p_status: s.status === "active" ? "deactivated" : "active" }, "บันทึกแล้ว")}
              >
                {s.status === "active" ? "ปิดใช้งานบัญชี" : "เปิดใช้งานบัญชี"}
              </button>
              <button
                type="button"
                className="btn btn--quiet"
                onClick={() => void act("admin_set_staff_role", { p_user: s.user_id, p_role: s.role === "admin" ? "staff" : "admin" }, "เปลี่ยนบทบาทแล้ว")}
              >
                {s.role === "admin" ? "เปลี่ยนเป็นเจ้าหน้าที่" : "เปลี่ยนเป็นผู้ดูแลระบบ"}
              </button>
            </div>
          </li>
        ))}
      </ul>

      <h2>กลุ่มผู้เรียน</h2>
      <p className="auth__hint">เจ้าหน้าที่เห็นเฉพาะผู้เรียนในกลุ่มที่ได้รับสิทธิ์ เช่น “คลินิกฝากครรภ์” หรือ “คลินิกเด็กดี”</p>
      <ul className="admin__list">
        {data?.cohorts.map((c) => (
          <li key={c.id}>
            {c.name} · ผู้เรียน {c.learners} คน
          </li>
        ))}
      </ul>
      <form
        className="admin__form admin__form--inline"
        onSubmit={(e) => {
          e.preventDefault();
          void act("admin_create_cohort", { p_name: cohortName }, "สร้างกลุ่มแล้ว").then(() => setCohortName(""));
        }}
      >
        <label className="auth__label" htmlFor="cohort-name">ชื่อกลุ่มใหม่</label>
        <input id="cohort-name" className="auth__input" required value={cohortName} onChange={(e) => setCohortName(e.target.value)} />
        <button type="submit" className="btn btn--quiet">สร้างกลุ่ม</button>
      </form>
    </section>
  );
}

function LearnerAdmin() {
  const [q, setQ] = useState("");
  const [rows, setRows] = useState<Learner[] | null>(null);
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [msg, setMsg] = useState<string | null>(null);
  const search = useCallback(async (query: string) => {
    try {
      const [l, s] = await Promise.all([
        call<{ rows: Learner[] }>("admin_list_learners", { p_query: query, p_page: 1, p_page_size: 25 }),
        call<StaffList>("admin_list_staff"),
      ]);
      setRows(l.rows);
      setCohorts(s.cohorts);
    } catch (e) {
      setMsg(problemText(e));
    }
  }, []);
  useEffect(() => {
    void search("");
  }, [search]);
  const act = async (fn: string, args: Record<string, unknown>) => {
    try {
      await call(fn, args);
      await search(q);
    } catch (e) {
      setMsg(problemText(e));
    }
  };
  return (
    <section aria-label="บัญชีผู้เรียน">
      <p className="auth__hint">หน้านี้แสดงเฉพาะข้อมูลบัญชี ไม่แสดงความคืบหน้าการเรียน ใช้เพื่อจัดกลุ่มและเปิด/ปิดบัญชี</p>
      <form
        className="staff__searchrow"
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          void search(q);
        }}
      >
        <input aria-label="ค้นหาผู้เรียน" className="auth__input" value={q} onChange={(e) => setQ(e.target.value)} placeholder="ชื่อ หรือเลขท้ายเบอร์ / อีเมล" />
        <button type="submit" className="btn btn--primary">ค้นหา</button>
      </form>
      {msg && <p role="status" className="notice">{msg}</p>}
      <ul className="admin__list">
        {rows?.map((l) => (
          <li key={l.id} className="admin__staff">
            <p>
              <strong>{l.display_name || "(ยังไม่ได้ตั้งชื่อ)"}</strong> · {l.contact_hint} · {l.status === "active" ? "ใช้งาน" : "ปิดใช้งาน"} · สมัคร{" "}
              {formatBangkok(l.created_at)}
            </p>
            <fieldset className="admin__cohorts">
              <legend>อยู่ในกลุ่ม</legend>
              {cohorts.map((c) => {
                const has = l.cohorts.some((x) => x.id === c.id);
                return (
                  <label key={c.id} className="admin__check">
                    <input type="checkbox" checked={has} onChange={() => void act("admin_set_learner_cohort", { p_learner: l.id, p_cohort: c.id, p_member: !has })} />{" "}
                    {c.name}
                  </label>
                );
              })}
            </fieldset>
            <button
              type="button"
              className="btn btn--quiet"
              onClick={() => void act("admin_set_learner_status", { p_learner: l.id, p_status: l.status === "active" ? "deactivated" : "active" })}
            >
              {l.status === "active" ? "ปิดใช้งานบัญชี" : "เปิดใช้งานบัญชี"}
            </button>
          </li>
        ))}
      </ul>
      <p className="staff__note">
        การกู้คืนบัญชี (เปลี่ยนเบอร์ เปลี่ยนอีเมล มือถือหาย) ทำตามขั้นตอนใน docs/ACCOUNTS-ADMIN-GUIDE.md เท่านั้น ห้ามรวมบัญชีเพราะชื่อเหมือนกัน
      </p>
    </section>
  );
}

function AuditLog() {
  const [rows, setRows] = useState<Audit[] | null>(null);
  useEffect(() => {
    void call<Audit[]>("admin_audit_log", { p_page: 1, p_page_size: 100 }).then(setRows);
  }, []);
  return (
    <section aria-label="บันทึกการใช้งาน">
      <ol className="timeline-log">
        {rows?.map((a) => (
          <li key={a.id}>
            <span>{formatBangkok(a.at)}</span> {a.actor_name || a.actor_role} · {actionLabel[a.action] ?? a.action}
          </li>
        ))}
      </ol>
      <p className="staff__note">บันทึกนี้แก้ไขหรือลบจากแอปไม่ได้</p>
    </section>
  );
}

function HealthPanel() {
  const [h, setH] = useState<Health | null>(null);
  useEffect(() => {
    void call<Health>("admin_health").then(setH);
  }, []);
  if (!h) return <p role="status">กำลังโหลด…</p>;
  return (
    <dl className="facts">
      <dt>ผู้เรียนทั้งหมด</dt>
      <dd>{h.learners} (ใช้งาน {h.learners_active})</dd>
      <dt>เจ้าหน้าที่ที่ใช้งาน</dt>
      <dd>{h.staff_active} (ผู้ดูแลระบบ {h.admins_active})</dd>
      <dt>กิจกรรมการเรียน 24 ชม.</dt>
      <dd>{h.events_24h}</dd>
      <dt>ข้อมูลเข้าล่าสุด</dt>
      <dd>{formatBangkok(h.last_event_at as string | null)}</dd>
      <dt>เวลาเซิร์ฟเวอร์</dt>
      <dd>{formatBangkok(h.server_time as string)}</dd>
    </dl>
  );
}
