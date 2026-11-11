import { expect, type Page } from "@playwright/test";
import pg from "pg";
import { TOTP } from "otpauth";
import { env } from "./env";
import type { Lesson } from "../src/content/schema";

export const db = new pg.Pool({ connectionString: env.DATABASE_URL, max: 2, allowExitOnIdle: true });

export async function emailCode(email: string, after: number): Promise<string> {
  for (let i = 0; i < 60; i++) {
    const list = await (await fetch(`${env.MAILPIT_URL}/api/v1/search?query=${encodeURIComponent(`to:"${email}"`)}&limit=5`)).json();
    const msg = (list.messages ?? []).find((m: { Created: string }) => Date.parse(m.Created) > after);
    if (msg) {
      const full = await (await fetch(`${env.MAILPIT_URL}/api/v1/message/${msg.ID}`)).json();
      const code = /\b(\d{6})\b/.exec(full.Text ?? "")?.[1];
      if (code) return code;
    }
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error(`no code for ${email}`);
}

/** Sign in through the real UI with an email one-time code (learner page or staff page). */
export async function uiEmailSignIn(page: Page, email: string, path = "/signin") {
  await page.goto(path);
  const toCode = page.getByRole("button", { name: "เข้าด้วยรหัสทาง SMS หรืออีเมลแทน" });
  if (await toCode.isVisible().catch(() => false)) await toCode.click();
  const chooser = page.getByRole("button", { name: /^อีเมล/ });
  if (await chooser.isVisible().catch(() => false)) await chooser.click();
  await page.getByLabel(/^อีเมล$/).fill(email);
  for (let attempt = 0; attempt < 3; attempt++) {
    const t0 = Date.now() - 1500;
    await page.getByRole("button", { name: "ส่งรหัส", exact: true }).click();
    const wait = page.getByText(/ขอรหัสใหม่ได้อีกครั้งใน (\d+) วินาที/);
    const codeField = page.getByLabel("รหัส 6 หลัก");
    await expect(codeField.or(wait).first()).toBeVisible();
    if (await wait.isVisible().catch(() => false)) {
      // resend cooldown from an earlier sign-in with the same email: wait it out, then ask again
      const s = Number(/(\d+)/.exec((await wait.textContent()) ?? "10")?.[1] ?? 10);
      await page.waitForTimeout((s + 1) * 1000);
      await page.getByRole("button", { name: /^ขอรหัสใหม่$/ }).click();
      await expect(page.getByRole("alert")).toHaveCount(0);
    }
    const code = await emailCode(email, t0);
    await codeField.fill(code);
    await page.getByRole("button", { name: "ยืนยันรหัส" }).click();
    await expect(codeField).toBeHidden({ timeout: 15_000 }); // signed in: the code screen is gone
    return;
  }
}

/** Staff second factor: enrol (first time, reads the setup key shown on screen) or answer a challenge. */
export async function uiSecondFactor(page: Page, secret?: string): Promise<string> {
  await expect(page.getByRole("heading", { name: "ยืนยันตัวตนขั้นที่ 2" })).toBeVisible();
  let key = secret;
  if (!key) {
    await page.getByText("สแกนไม่ได้ พิมพ์รหัสตั้งค่าแทน").click();
    key = ((await page.locator(".mfa__secret").textContent()) ?? "").trim();
  }
  await page.getByLabel("รหัสจากแอปยืนยันตัวตน").fill(new TOTP({ secret: key, digits: 6, period: 30 }).generate());
  await page.getByRole("button", { name: "ยืนยัน", exact: true }).click();
  await expect(page.getByRole("heading", { name: "ยืนยันตัวตนขั้นที่ 2" })).toBeHidden({ timeout: 15_000 });
  return key;
}

const exact = (t: string) => new RegExp(`^\\s*${t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*$`);

/** Walk a whole lesson like a learner. If wrongFirst, the first quiz question is answered wrongly once. */
export async function walkLesson(page: Page, lesson: Lesson, { wrongFirst = false } = {}) {
  await page.goto(`/lesson/${lesson.id}`);
  for (const [i, step] of lesson.steps.entries()) {
    await expect(page.locator(".lesson__kind")).toContainText(`ขั้นที่ ${i + 1} จาก ${lesson.steps.length}`);
    if (step.type === "sort") {
      for (const it of step.items) {
        const bucket = step.buckets.find((b) => b.id === it.bucketId)!;
        await page.locator(".sort__cards").getByRole("button", { name: it.text, exact: true }).click();
        await page.getByRole("button", { name: `วางในช่อง ${bucket.label}`, exact: true }).click();
      }
    }
    if (step.type === "timeline") {
      const first = step.stages[0];
      await page.locator(".timeline__stage").filter({ has: page.locator(".timeline__stage-label", { hasText: exact(first.label) }) }).click();
    }
    if (step.type === "quiz") {
      for (const [qi, q] of step.questions.entries()) {
        await expect(page.locator(".quiz__count")).toHaveText(`ข้อ ${qi + 1} จาก ${step.questions.length}`);
        const correct = q.options.find((o) => o.id === q.correctOptionId)!;
        if (wrongFirst && qi === 0) {
          const wrong = q.options.find((o) => o.id !== q.correctOptionId)!;
          await page.locator(".quiz__options").getByRole("button", { name: wrong.text, exact: true }).click();
          await page.getByRole("button", { name: "ลองตอบอีกครั้ง" }).click();
        }
        await page.locator(".quiz__options").getByRole("button", { name: correct.text, exact: true }).click();
        await expect(page.locator(".feedback--correct")).toBeVisible();
        await page.getByRole("button", { name: /^(ข้อต่อไป|จบแบบทดสอบ)$/ }).click();
      }
      continue;
    }
    await page.getByRole("button", { name: /^(ต่อไป|จบบทเรียน)$/ }).click();
  }
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("จบบทเรียนแล้ว");
}

/** Sign in through the real UI with a Thai mobile number; the code is read from the local SMS outbox. */
export async function uiPhoneSignIn(page: Page, typed: string, e164: string) {
  await page.goto("/signin");
  await page.getByRole("button", { name: "เข้าด้วยรหัสทาง SMS หรืออีเมลแทน" }).click();
  await page.getByRole("button", { name: /^เบอร์โทรศัพท์/ }).click();
  await page.getByLabel("เบอร์มือถือ 10 หลัก").fill(typed);
  const { rows } = await db.query("select coalesce(max(id), 0)::int id from dev_only.sms_outbox");
  await page.getByRole("button", { name: "ส่งรหัส", exact: true }).click();
  const codeField = page.getByLabel("รหัส 6 หลัก");
  await expect(codeField).toBeVisible();
  let otp = "";
  for (let i = 0; i < 40 && !otp; i++) {
    const r = await db.query("select otp from dev_only.sms_outbox where phone = $1 and id > $2 order by id desc limit 1", [e164.slice(1), rows[0].id]);
    otp = r.rows[0]?.otp ?? "";
    if (!otp) await page.waitForTimeout(250);
  }
  await codeField.fill(otp);
  await page.getByRole("button", { name: "ยืนยันรหัส" }).click();
  await expect(codeField).toBeHidden({ timeout: 15_000 });
}

/** Password sign-in through the UI: patient ID (learner page) or work email (staff page). */
export async function uiPasswordSignIn(page: Page, id: string, password: string, path = "/signin") {
  await page.goto(path);
  await page.getByLabel(path === "/signin" ? "รหัสผู้เรียน (8 หลัก)" : "อีเมลงาน").fill(id);
  await page.getByLabel("รหัสผ่าน", { exact: true }).fill(password);
  await page.getByRole("button", { name: "เข้าสู่ระบบ", exact: true }).click();
  await expect(page.getByLabel("รหัสผ่าน", { exact: true })).toBeHidden({ timeout: 15_000 });
}

/** Read the ID and password from a credential slip on screen. */
export async function readSlip(page: Page) {
  const values = page.locator("#credential-slip .slip__value");
  await expect(values).toHaveCount(2);
  const [id, pw] = await values.allTextContents();
  return { id: id.trim(), password: pw.replace(/\s/g, "") };
}

export async function closeSlip(page: Page) {
  page.once("dialog", (d) => void d.accept());
  await page.getByRole("button", { name: "เสร็จแล้ว ปิดใบนี้" }).click();
}
