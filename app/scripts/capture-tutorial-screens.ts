/**
 * Captures real screens of the app (accounts build on the dev server, LOCAL backend, fictional person)
 * for the app-use tutorial video: video/public/app-tutorial/*.png at phone size.
 *   cd app && npm run dev:accounts   (other terminal; backend running: cd ../backend && npm run db:start)
 *   npx tsx scripts/capture-tutorial-screens.ts
 * The ID/password shown on screen are the made-up sample values (1234-5678 / 2468 135 790).
 */
import { chromium, type Page } from "@playwright/test";
import { join } from "node:path";
import { readFileSync } from "node:fs";

const out = join(import.meta.dirname, "../../video/public/app-tutorial");
const base = "http://localhost:5174";
const env = Object.fromEntries(
  readFileSync(join(import.meta.dirname, "../../backend/.env.local"), "utf8").split("\n").filter((l) => l.includes("=")).map((l) => [l.slice(0, l.indexOf("=")), l.slice(l.indexOf("=") + 1)]),
);

const shot = (page: Page, name: string) => page.screenshot({ path: join(out, `${name}.png`) });

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, locale: "th-TH", timezoneId: "Asia/Bangkok", isMobile: true, hasTouch: true });
const page = await ctx.newPage();

await page.goto(`${base}/`);
await page.locator(".start-here").waitFor();
await shot(page, "01-home");
// sign-in with a staff-issued slip: a fictional patient created directly in the LOCAL database
import pg from "pg";
const db = new pg.Client({ connectionString: env.DATABASE_URL });
await db.connect();
const username = String(10000000 + Math.floor(Math.random() * 89999999));
const password = "2468135790";
const { rows } = await db.query("select private.create_password_user($1, $2, 'learner_local', 'สมใจ') id", [`${username}@learners.anc-learn.invalid`, password]);
await db.query("update public.learners set username = $1, contact_method = 'username', contact_hint = 'ID ' || left($1, 4) || '-' || right($1, 4) where id = $2", [username, rows[0].id]);
await db.end();

await page.goto(`${base}/start?step=1`);
await page.locator(".slip--sample").evaluate((e: HTMLElement) => e.scrollIntoView({ block: "center" }));
await page.waitForTimeout(300);
await shot(page, "02-slip-sample");
await page.goto(`${base}/signin`);
await page.getByLabel("รหัสผู้เรียน (8 หลัก)").waitFor();
await shot(page, "03-signin-password");
await page.getByLabel("รหัสผู้เรียน (8 หลัก)").fill("1234-5678");
await page.getByLabel("รหัสผ่าน", { exact: true }).fill("2468135790");
await page.getByLabel("รหัสผ่าน", { exact: true }).evaluate((e: HTMLElement) => e.scrollIntoView({ block: "center" }));
await shot(page, "04-signin-filled");
await page.getByLabel("รหัสผู้เรียน (8 หลัก)").fill(username);
await page.getByRole("button", { name: "เข้าสู่ระบบ", exact: true }).click();
await page.waitForURL(/\/account$/);

await page.goto(`${base}/`);
await page.locator(".book__title").evaluate((e: HTMLElement) => e.scrollIntoView({ block: "start" }));
await page.waitForTimeout(300);
await shot(page, "05-home-sections");
await page.goto(`${base}/lesson/MCH68-OVR-001`);
await page.locator(".lesson__kind").waitFor();
await shot(page, "06-lesson");
await page.goto(`${base}/lesson/MCH68-OVR-001?step=1`);
await page.locator("video").waitFor();
await page.waitForTimeout(500);
await shot(page, "07-video");

const lesson = JSON.parse(readFileSync(join(import.meta.dirname, "../../content/lessons/MCH68-OVR-001.json"), "utf8"));
const qi = lesson.steps.findIndex((s: { type: string }) => s.type === "quiz");
await page.goto(`${base}/lesson/MCH68-OVR-001?step=${qi}`);
const q = lesson.steps[qi].questions[0];
const wrong = q.options.find((o: { id: string }) => o.id !== q.correctOptionId);
await page.locator(".quiz__options").getByRole("button", { name: wrong.text, exact: true }).click();
await page.locator(".feedback").evaluate((e: HTMLElement) => e.scrollIntoView({ block: "center" }));
await shot(page, "08-quiz-retry");
await page.getByRole("button", { name: "ลองตอบอีกครั้ง" }).click();
const right = q.options.find((o: { id: string }) => o.id === q.correctOptionId);
await page.locator(".quiz__options").getByRole("button", { name: right.text, exact: true }).click();
await page.locator(".feedback--correct").evaluate((e: HTMLElement) => e.scrollIntoView({ block: "center" }));
await shot(page, "09-quiz-correct");

await page.goto(`${base}/account`);
await page.locator(".syncbox").filter({ hasText: "บันทึกเข้าบัญชีแล้ว" }).waitFor({ timeout: 20000 });
await page.locator(".account__import").count().then(async (n) => n && (await page.getByRole("button", { name: "ไม่ใช่ ไม่ต้องนำเข้า" }).click()));
await shot(page, "10-account-saved");
await page.goto(`${base}/`);
await page.locator(".continue").waitFor();
await shot(page, "11-home-continue");
await page.goto(`${base}/help`);
await shot(page, "12-help");
await page.goto(`${base}/account`);
await page.getByRole("button", { name: "ออกจากระบบ" }).scrollIntoViewIfNeeded();
await shot(page, "13-signout");
await browser.close();
console.log("screens in", out);
