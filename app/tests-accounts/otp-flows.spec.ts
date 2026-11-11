/**
 * OPTIONAL sign-in by email code (needs a paid email sender in production; PMH starts with staff-issued
 * passwords, see demo.spec.ts). Learner signs in with an email code, does Lesson 0 and a lesson, progress
 * is saved centrally, and a second browser shows the same progress; sign-out clears the device.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { expect, test } from "@playwright/test";
import { db, uiEmailSignIn, walkLesson } from "./helpers";
import type { Lesson } from "../src/content/schema";

const lesson: Lesson = JSON.parse(readFileSync(join(import.meta.dirname, "../../content/lessons/MCH68-OVR-001.json"), "utf8"));

const LEARNER = "somjai.test@example.test";

test.describe.configure({ mode: "serial" });

let learnerId = "";

test("learner: sign in, Lesson 0, one lesson, progress saved to the account", async ({ page }) => {
  await test.step("1. sign in with an email one-time code", async () => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/signin/); // sign-in first
    await uiEmailSignIn(page, LEARNER);
    await page.goto("/account");
    await page.getByLabel("ชื่อที่ให้เจ้าหน้าที่เห็น").fill("สมใจ (ทดสอบ)");
    await page.getByRole("button", { name: "บันทึกชื่อ" }).click();
    await expect(page.getByRole("status").filter({ hasText: "บันทึกแล้ว" })).toBeVisible();
    learnerId = (await db.query("select id from auth.users where email = $1", [LEARNER])).rows[0].id;
  });

  await test.step("2-3. Lesson 0 is the first card; complete every practice step", async () => {
    await page.goto("/");
    const start = page.locator(".start-here");
    await expect(start).toContainText("วิธีใช้งาน");
    // the tutorial card comes before the lesson card
    const order = await page.locator(".start-here, .continue").evaluateAll((els) => els.map((e) => e.className));
    expect(order[0]).toContain("start-here");
    await start.click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("เริ่มต้น");
    await expect(page.locator(".page-chip")).toHaveCount(0); // no handbook citation on the tutorial
    await page.getByRole("button", { name: "เริ่ม", exact: true }).click();
    await expect(page.locator(".tutorial__done")).toContainText("ดีมาก");
    const next = () => page.locator(".lesson__nav").getByRole("button", { name: "ต่อไป" }).click();
    await next();

    await page.getByLabel("รหัสผู้เรียน (8 หลัก)").fill("12345678");
    await page.getByLabel("รหัสผ่าน").fill("2468 135 790");
    await page.getByRole("button", { name: "เข้าสู่ระบบ (ฝึก)" }).click();
    await expect(page.locator(".tutorial__done")).toContainText("สำเร็จ");
    await next();

    await page.getByRole("button", { name: "ความรู้" }).click();
    await page.getByRole("button", { name: "ธงโภชนาการ คืออะไร" }).click();
    await expect(page.locator(".tutorial__done")).toContainText("ธงโภชนาการ");
    await next();

    const mock = page.locator(".mock--lesson");
    await mock.getByRole("button", { name: "ต่อไป" }).click();
    await mock.getByRole("button", { name: "ย้อนกลับ" }).click();
    await mock.getByRole("button", { name: "‹ หน้าแรก" }).click();
    await expect(page.locator(".tutorial__done")).toContainText("ครบแล้ว");
    await next();

    await page.getByRole("group", { name: "ขนาดตัวอักษร (ฝึก)" }).getByRole("button", { name: "ใหญ่", exact: true }).click();
    await expect(page.locator(".tutorial__done")).toContainText("ตัวอักษร");
    await page.getByRole("group", { name: "ขนาดตัวอักษร (ฝึก)" }).getByRole("button", { name: "ปกติ", exact: true }).click();
    await next();

    await page.locator(".quiz__options").getByRole("button", { name: "ต่อไป" }).click();
    await expect(page.locator(".feedback--gentle")).toBeVisible();
    await page.getByRole("button", { name: "ลองตอบอีกครั้ง" }).click();
    await page.locator(".quiz__options").getByRole("button", { name: "‹ หน้าแรก" }).click();
    await expect(page.locator(".feedback--correct")).toBeVisible();
    await next();
    await expect(page.locator(".savestates")).toContainText("บันทึกเข้าบัญชีแล้ว");
    await next();
    await page.getByRole("button", { name: "จบวิธีใช้งาน ไปเรียนเลย" }).click();
    await expect(page.locator(".start-here")).toHaveCount(0);
    await expect(page.getByRole("link", { name: "ดูวิธีใช้งานอีกครั้ง" })).toBeVisible();
    await expect(page.locator(".home__progress")).toContainText("จาก 58 บทเรียน"); // tutorial not counted
  });

  await test.step("4. complete one handbook lesson (first quiz answer wrong once)", async () => {
    await walkLesson(page, lesson, { wrongFirst: true });
  });

  await test.step("5. progress is saved to the account", async () => {
    await page.goto("/account");
    await expect(page.locator(".syncbox")).toContainText("บันทึกเข้าบัญชีแล้ว", { timeout: 20_000 });
    await expect(page.locator(".syncbox__meta")).not.toContainText("ส่งเข้าบัญชีล่าสุด —");
    // everything was done while signed in, so nothing may have landed in the device's guest store
    await expect(page.locator(".account__import")).toHaveCount(0);
    expect(await page.evaluate(() => localStorage.getItem("pmh-anc-learn:progress:v1"))).toBeNull();
    const { rows } = await db.query(
      "select lesson_id, first_completed_at, furthest_step from public.lesson_progress where learner_id = $1",
      [learnerId],
    );
    expect(rows).toHaveLength(1);
    expect(rows[0].lesson_id).toBe(lesson.id);
    expect(rows[0].first_completed_at).not.toBeNull();
    const tut = await db.query("select completed_at from public.tutorial_progress where learner_id = $1", [learnerId]);
    expect(tut.rows[0].completed_at).not.toBeNull();
  });
});

test("another browser: the same progress after signing in", async ({ browser }) => {
  const ctx = await browser.newContext({ locale: "th-TH", timezoneId: "Asia/Bangkok", viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  await page.goto("/");
  await expect(page).toHaveURL(/\/signin/); // nothing is shown before sign-in
  await uiEmailSignIn(page, LEARNER);
  await page.goto("/account");
  await expect(page.getByText("บทเรียนจากสมุดสีชมพู: เรียนจบแล้ว 1 จาก 58 บท")).toBeVisible({ timeout: 15_000 });
  await expect(page.getByText(/วิธีใช้งาน: เรียนจบแล้ว/)).toBeVisible();
  await page.goto("/");
  await expect(page.locator(".home__progress")).toContainText("เรียนจบแล้ว 1 จาก 58");

  // shared phone: sign out removes this account's data from the device
  await page.goto("/account");
  await page.getByRole("button", { name: "ออกจากระบบ" }).click();
  await expect(page).toHaveURL(/\/signin\?next=%2F$/);
  await page.waitForLoadState("load");
  const leftovers = await page.evaluate(() => Object.keys(localStorage).filter((k) => k.includes(":account:") || k.includes("auth")));
  expect(leftovers).toEqual([]);
  await page.goBack();
  await expect(page.getByText("สมใจ (ทดสอบ)")).toHaveCount(0);
  await ctx.close();
});
