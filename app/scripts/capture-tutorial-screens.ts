/**
 * Captures real screens of the app (accounts build on the dev server, LOCAL backend, fictional person)
 * for the app-use tutorial video: video/public/app-tutorial/*.png at phone size.
 *   cd app && npm run dev:accounts   (other terminal; backend running: cd ../backend && npm run db:start)
 *   npx tsx scripts/capture-tutorial-screens.ts
 * The code shown on the code screen is the made-up 123456; the real local code is typed afterwards.
 */
import { chromium, type Page } from "@playwright/test";
import { join } from "node:path";
import { readFileSync } from "node:fs";

const out = join(import.meta.dirname, "../../video/public/app-tutorial");
const base = "http://localhost:5174";
const env = Object.fromEntries(
  readFileSync(join(import.meta.dirname, "../../backend/.env.local"), "utf8").split("\n").filter((l) => l.includes("=")).map((l) => [l.slice(0, l.indexOf("=")), l.slice(l.indexOf("=") + 1)]),
);
const email = `somjai.video.${Date.now().toString(36)}@example.test`;

async function code(after: number) {
  for (let i = 0; i < 40; i++) {
    const list = await (await fetch(`${env.MAILPIT_URL}/api/v1/search?query=${encodeURIComponent(`to:"${email}"`)}&limit=1`)).json();
    const m = list.messages?.[0];
    if (m && Date.parse(m.Created) > after) {
      const full = await (await fetch(`${env.MAILPIT_URL}/api/v1/message/${m.ID}`)).json();
      return /\b(\d{6})\b/.exec(full.Text)![1];
    }
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error("no code");
}

const shot = (page: Page, name: string) => page.screenshot({ path: join(out, `${name}.png`) });

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, locale: "th-TH", timezoneId: "Asia/Bangkok", isMobile: true, hasTouch: true });
const page = await ctx.newPage();

await page.goto(`${base}/`);
await page.locator(".start-here").waitFor();
await shot(page, "01-home");
await page.goto(`${base}/signin`);
await page.getByRole("button", { name: /^อีเมล/ }).waitFor();
await shot(page, "02-signin-choose");
await page.getByRole("button", { name: /^อีเมล/ }).click();
await page.getByLabel(/^อีเมล$/).fill("somjai@example.com");
await page.getByLabel(/^อีเมล$/).evaluate((e: HTMLElement) => e.scrollIntoView({ block: "center" }));
await shot(page, "03-signin-email");
await page.getByLabel(/^อีเมล$/).fill(email);
const t0 = Date.now() - 1500;
await page.getByRole("button", { name: "ส่งรหัส", exact: true }).click();
const field = page.getByLabel("รหัส 6 หลัก");
await field.waitFor();
await page.locator(".auth__sent strong").evaluate((e) => (e.textContent = "somjai@example.com"));
await field.fill("123456");
await field.evaluate((e: HTMLElement) => e.scrollIntoView({ block: "center" }));
await shot(page, "04-signin-code");
await field.fill(await code(t0));
await page.getByRole("button", { name: "ยืนยันรหัส" }).click();
await page.waitForURL(/\/account$/);
await page.getByLabel("ชื่อที่ให้เจ้าหน้าที่เห็น").fill("สมใจ");
await page.getByRole("button", { name: "บันทึกชื่อ" }).click();

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
