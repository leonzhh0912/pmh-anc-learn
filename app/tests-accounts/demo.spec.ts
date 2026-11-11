/**
 * The PMH flow (staff-issued logins; no SMS or email cost), through the real UI and the real local auth:
 *  1 IT creates the first administrator in the database; the admin signs in (password + authenticator)
 *  2 the admin creates a nurse account (slip with a one-time password) and gives her a group
 *  3 the nurse signs in, creates a patient account and gets the patient's slip
 *  4 the patient signs in with ID + password, completes Lesson 0 and one handbook lesson; saved centrally
 *  5 on another phone the same ID + password shows the same progress; sign-out clears the device
 *  6 the nurse sees the progress (patients newest first); a patient who forgot the password gets a new one
 *  7 an unauthorised patient cannot see anything; revoking the group hides the patient at once
 *  8 the admin deletes an account (identity removed, de-identified records kept 5 years)
 * Screenshots go to docs/guides/img/ for the staff/admin guides.
 */
import { mkdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { expect, test, type Browser, type Page } from "@playwright/test";
import { closeSlip, db, readSlip, uiPasswordSignIn, uiSecondFactor, walkLesson } from "./helpers";
import { env } from "./env";
import type { Lesson } from "../src/content/schema";

const lesson: Lesson = JSON.parse(readFileSync(join(import.meta.dirname, "../../content/lessons/MCH68-OVR-001.json"), "utf8"));
const shots = join(import.meta.dirname, "../../docs/guides/img");
mkdirSync(shots, { recursive: true });
const shot = (page: Page, name: string) => page.screenshot({ path: join(shots, `${name}.png`) });

const ADMIN = "admin.demo@pmh.example.test";
const NURSE = "nurse.demo@pmh.example.test";
const COHORT = "คลินิกฝากครรภ์ (ข้อมูลทดสอบ)";

test.describe.configure({ mode: "serial" });

const desktop = async (browser: Browser) =>
  (await browser.newContext({ viewport: { width: 1100, height: 900 }, locale: "th-TH", timezoneId: "Asia/Bangkok" })).newPage();
const phone = async (browser: Browser) =>
  (await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, locale: "th-TH", timezoneId: "Asia/Bangkok" })).newPage();

let admin: Page, nurse: Page;
let patient = { id: "", password: "" };
let patientUid = "";

test("admin and nurse accounts, then the nurse creates a patient", async ({ browser }) => {
  const pw = (await db.query("select private.bootstrap_admin_password($1, $2) pw", [ADMIN, "ผู้ดูแลระบบ (ทดสอบ)"])).rows[0].pw;
  admin = await desktop(browser);
  await uiPasswordSignIn(admin, ADMIN, pw, "/staff");
  await uiSecondFactor(admin);
  await admin.goto("/admin");
  await admin.getByLabel("อีเมลงาน (ใช้เป็นชื่อเข้าระบบ)").fill(NURSE);
  await admin.getByLabel("ชื่อที่แสดง").fill("พยาบาลทดสอบ");
  await admin.getByRole("button", { name: "สร้างบัญชี", exact: true }).click();
  const nurseSlip = await readSlip(admin);
  expect(nurseSlip.id).toBe(NURSE);
  expect(nurseSlip.password).toMatch(/^\d{10}$/);
  await shot(admin, "admin-staff-slip");
  await closeSlip(admin);
  const nurseRow = admin.locator(".admin__staff").filter({ hasText: "พยาบาลทดสอบ" });
  await nurseRow.getByLabel(COHORT).click();
  await expect(nurseRow.getByLabel(COHORT)).toBeChecked();
  await shot(admin, "admin-staff");

  nurse = await desktop(browser);
  await uiPasswordSignIn(nurse, NURSE, nurseSlip.password, "/staff");
  await shot(nurse, "staff-second-factor");
  await uiSecondFactor(nurse);
  await nurse.getByRole("button", { name: "สร้างบัญชีผู้เรียน" }).click();
  await nurse.getByLabel("ชื่อผู้เรียน (ชื่อเล่นหรือชื่อจริง)").fill("สมใจ (ทดสอบ)");
  await nurse.getByLabel("กลุ่ม").selectOption({ label: COHORT });
  await nurse.getByRole("button", { name: "สร้างบัญชีและพิมพ์ใบรหัส" }).click();
  patient = await readSlip(nurse);
  expect(patient.id).toMatch(/^\d{4}-\d{4}$/);
  expect(patient.password).toMatch(/^\d{10}$/);
  await shot(nurse, "staff-create-slip");
  await closeSlip(nurse);
  await expect(nurse.locator(".learners__row").first()).toContainText("สมใจ (ทดสอบ)");
  patientUid = (await db.query("select id from public.learners where username = $1", [patient.id.replace("-", "")])).rows[0].id;
});

test("patient: sign in with the slip, Lesson 0, one lesson, saved to the account", async ({ browser }) => {
  const page = await phone(browser);
  await page.goto("/");
  await shot(page, "learner-home");
  await page.getByRole("link", { name: "เข้าสู่ระบบ" }).click();
  await shot(page, "learner-signin");
  await uiPasswordSignIn(page, patient.id, patient.password);
  await expect(page).toHaveURL(/\/account$/);
  await expect(page.getByText(`รหัสผู้เรียนของคุณ ${patient.id}`)).toBeVisible();

  await page.goto("/start");
  await page.getByRole("button", { name: "เริ่ม", exact: true }).click();
  for (let step = 1; step < 8; step++) {
    await page.locator(".lesson__nav").getByRole("button", { name: "ต่อไป" }).click();
    await expect(page.locator("article.lesson__card > .lesson__kind")).toHaveText(`ขั้นที่ ${step + 1} จาก 8`);
  }
  await page.getByRole("button", { name: "จบวิธีใช้งาน ไปเรียนเลย" }).click();
  await expect(page.locator(".start-here")).toHaveCount(0);

  await walkLesson(page, lesson, { wrongFirst: true });
  await page.goto("/account");
  await expect(page.locator(".syncbox")).toContainText("บันทึกเข้าบัญชีแล้ว", { timeout: 20_000 });
  await expect(page.locator(".account__import")).toHaveCount(0);
  await shot(page, "learner-account-synced");
  const { rows } = await db.query("select first_completed_at from public.lesson_progress where learner_id = $1 and lesson_id = $2", [patientUid, lesson.id]);
  expect(rows[0].first_completed_at).not.toBeNull();
});

test("another phone: same ID + password, same progress; sign-out clears the phone", async ({ browser }) => {
  const page = await phone(browser);
  await uiPasswordSignIn(page, patient.id.replace("-", ""), patient.password);
  await expect(page.getByText("บทเรียนจากสมุดสีชมพู: เรียนจบแล้ว 1 จาก 58 บท")).toBeVisible({ timeout: 15_000 });
  await expect(page.getByText(/วิธีใช้งาน: เรียนจบแล้ว/)).toBeVisible();
  await page.getByRole("button", { name: "ออกจากระบบ" }).click();
  await expect(page).toHaveURL(/\/$/);
  const leftovers = await page.evaluate(() => Object.keys(localStorage).filter((k) => k.includes(":account:") || k.includes("auth")));
  expect(leftovers).toEqual([]);
});

test("nurse sees the progress, newest patients first, and issues a new password", async ({ browser }) => {
  // a second, newer patient in the same group goes to the top of the list
  await nurse.goto("/staff");
  await nurse.getByRole("button", { name: "สร้างบัญชีผู้เรียน" }).click();
  await nurse.getByLabel("ชื่อผู้เรียน (ชื่อเล่นหรือชื่อจริง)").fill("มาลี (ทดสอบ)");
  await nurse.getByLabel("กลุ่ม").selectOption({ label: COHORT });
  await nurse.getByRole("button", { name: "สร้างบัญชีและพิมพ์ใบรหัส" }).click();
  await readSlip(nurse);
  await closeSlip(nurse);
  await expect(nurse.locator(".learners__row").nth(0)).toContainText("มาลี (ทดสอบ)");
  const row = nurse.locator(".learners__row").filter({ hasText: "สมใจ (ทดสอบ)" });
  await expect(row).toContainText("จบ 1 จาก 58 บท");
  await expect(row).toContainText("วิธีใช้งาน: จบแล้ว");
  await shot(nurse, "staff-list");
  await row.getByRole("link").click();
  const done = nurse.locator(".lessonrow").filter({ hasText: lesson.title });
  await expect(done).toContainText("จบตามกติกาของแอป");
  await expect(done).toContainText("อาจต้องอธิบายเพิ่ม");
  await shot(nurse, "staff-learner-detail");

  nurse.once("dialog", (d) => void d.accept());
  await nurse.getByRole("button", { name: "ลืมรหัสผ่าน: ออกรหัสผ่านใหม่" }).click();
  const fresh = await readSlip(nurse);
  expect(fresh.password).not.toBe(patient.password);
  await closeSlip(nurse);
  const page = await phone(browser);
  await page.goto("/signin");
  await page.getByLabel("รหัสผู้เรียน (8 หลัก)").fill(patient.id);
  await page.getByLabel("รหัสผ่าน", { exact: true }).fill(patient.password);
  await page.getByRole("button", { name: "เข้าสู่ระบบ", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText("รหัสไม่ถูกต้อง");
  await uiPasswordSignIn(page, patient.id, fresh.password);
  await expect(page).toHaveURL(/\/account$/);
  patient.password = fresh.password;
});

test("outsiders see nothing; revoking a group hides patients; the admin deletes an account", async ({ browser }) => {
  // another patient, in no group the nurse... created by the admin in a new group
  await admin.goto("/admin");
  await admin.getByLabel("ชื่อกลุ่มใหม่").fill("คลินิกเด็กดี (ข้อมูลทดสอบ)");
  await admin.getByRole("button", { name: "สร้างกลุ่ม" }).click();
  await expect(admin.getByText("สร้างกลุ่มแล้ว")).toBeVisible();
  await admin.goto("/staff");
  await admin.getByRole("button", { name: "สร้างบัญชีผู้เรียน" }).click();
  await admin.getByLabel("ชื่อผู้เรียน (ชื่อเล่นหรือชื่อจริง)").fill("คนนอกกลุ่ม (ทดสอบ)");
  await admin.getByLabel("กลุ่ม").selectOption({ label: "คลินิกเด็กดี (ข้อมูลทดสอบ)" });
  await admin.getByRole("button", { name: "สร้างบัญชีและพิมพ์ใบรหัส" }).click();
  const outsider = await readSlip(admin);
  await closeSlip(admin);

  const other = await phone(browser);
  await uiPasswordSignIn(other, outsider.id, outsider.password);
  await other.goto("/staff");
  await expect(other.getByRole("heading", { name: "บัญชีนี้ไม่ใช่บัญชีเจ้าหน้าที่" })).toBeVisible();
  const direct = await other.evaluate(
    async ({ url, key, id }) => {
      const token = JSON.parse(localStorage.getItem("pmh-anc-learn:auth") ?? "{}").access_token;
      const h = { apikey: key, authorization: `Bearer ${token}`, "content-type": "application/json" };
      const detail = await fetch(`${url}/rest/v1/rpc/staff_learner_detail`, { method: "POST", headers: h, body: JSON.stringify({ p_learner: id }) });
      const create = await fetch(`${url}/rest/v1/rpc/staff_create_learner`, { method: "POST", headers: h, body: JSON.stringify({ p_display_name: "x", p_cohort: "00000000-0000-0000-0000-000000000000" }) });
      const rows = await (await fetch(`${url}/rest/v1/lesson_progress?learner_id=eq.${id}`, { headers: h })).json();
      return { detail: await detail.text(), create: await create.text(), rows };
    },
    { url: env.SUPABASE_URL, key: env.SUPABASE_PUBLISHABLE_KEY, id: patientUid },
  );
  expect(direct.detail).toContain("not_staff");
  expect(direct.create).toContain("not_staff");
  expect(direct.rows).toEqual([]);

  // revoking the nurse's group hides her patients on the next request
  await admin.goto("/admin");
  const nurseRow = admin.locator(".admin__staff").filter({ hasText: "พยาบาลทดสอบ" });
  await nurseRow.getByLabel(COHORT).click();
  await expect(nurseRow.getByLabel(COHORT)).not.toBeChecked();
  await nurse.goto("/staff");
  await expect(nurse.getByText("พบ 0 คน")).toBeVisible();

  // the admin deletes the outsider's account (reason required)
  await admin.getByRole("tab", { name: "บัญชีผู้เรียน" }).click();
  const outsiderRow = admin.locator(".admin__staff").filter({ hasText: "คนนอกกลุ่ม (ทดสอบ)" });
  await shot(admin, "admin-learners");
  admin.once("dialog", (d) => void d.accept("ทดสอบการลบบัญชี"));
  await outsiderRow.getByRole("button", { name: "ลบบัญชี" }).click();
  await expect(admin.getByText(/ลบบัญชี .* แล้ว/)).toBeVisible();
  await expect(outsiderRow).toHaveCount(0);
  await admin.getByRole("tab", { name: "บันทึกการใช้งาน" }).click();
  await expect(admin.locator(".timeline-log")).toContainText("สร้างบัญชีผู้เรียน");
  await shot(admin, "admin-audit");
});
