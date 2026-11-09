/**
 * Data-driven walk-through of EVERY lesson in content/lessons:
 * each step renders without console errors or sideways scrolling at 360 px,
 * every interactive can be completed, every quiz question accepts its correct
 * answer, and the lesson finishes. New lessons are covered automatically.
 */
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { expect, test, type Page } from "@playwright/test";
import type { Lesson } from "../src/content/schema";

const dir = join(import.meta.dirname, "../../content/lessons");
const lessons: Lesson[] = readdirSync(dir)
  .filter((f) => f.endsWith(".json"))
  .map((f) => JSON.parse(readFileSync(join(dir, f), "utf8")));

const exact = (t: string) => new RegExp(`^\\s*${t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*$`);

async function noSidewaysScroll(page: Page, where: string) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow, `horizontal overflow at ${where}`).toBeLessThanOrEqual(0);
}

for (const lesson of lessons) {
  test(`walk-through ${lesson.id}`, async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
    page.on("pageerror", (e) => errors.push(String(e)));
    await page.setViewportSize({ width: 360, height: 760 });
    await page.goto(`/lesson/${lesson.id}`);

    for (const [i, step] of lesson.steps.entries()) {
      await expect(page.locator(".lesson__kind")).toContainText(`ขั้นที่ ${i + 1} จาก ${lesson.steps.length}`);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(step.heading);
      await noSidewaysScroll(page, `${lesson.id} step ${i + 1}`);

      if (step.type === "timeline") {
        for (const stage of step.stages) {
          await page
            .locator(".timeline__stage")
            .filter({ has: page.locator(".timeline__stage-label", { hasText: exact(stage.label) }) })
            .click();
          for (const it of stage.items) {
            const btn = page
              .locator(".timeline__toggle")
              .filter({ has: page.locator(".timeline__title", { hasText: exact(it.title) }) });
            await btn.click();
            await expect(btn).toHaveAttribute("aria-expanded", "true");
          }
        }
      }
      if (step.type === "flag") {
        for (const tier of step.tiers) {
          await page.locator(".flag__tier").filter({ hasText: tier.groups[0].name }).first().click();
          await expect(page.locator(".flag__amount")).toHaveText(tier.amount);
        }
      }
      if (step.type === "sort") {
        for (const it of step.items) {
          const bucket = step.buckets.find((b) => b.id === it.bucketId)!;
          await page.locator(".sort__cards").getByRole("button", { name: it.text, exact: true }).click();
          await page.getByRole("button", { name: `วางในช่อง ${bucket.label}`, exact: true }).click();
        }
        await expect(page.locator(".sort__message")).toHaveText("ครบทุกข้อแล้ว เก่งมาก");
      }
      if (step.type === "quiz") {
        for (const [qi, q] of step.questions.entries()) {
          await expect(page.locator(".quiz__count")).toHaveText(`ข้อ ${qi + 1} จาก ${step.questions.length}`);
          const correct = q.options.find((o) => o.id === q.correctOptionId)!;
          await page.locator(".quiz__options").getByRole("button", { name: correct.text, exact: true }).click();
          await expect(page.locator(".feedback--correct")).toBeVisible();
          await noSidewaysScroll(page, `${lesson.id} ${q.id}`);
          await page.getByRole("button", { name: /^(ข้อต่อไป|จบแบบทดสอบ)$/ }).click();
        }
        continue; // the quiz advances the lesson itself
      }
      await page.getByRole("button", { name: /^(ต่อไป|จบบทเรียน)$/ }).click();
    }

    await expect(page.getByRole("heading", { level: 1 })).toHaveText("จบบทเรียนแล้ว");
    expect(errors, `console errors in ${lesson.id}`).toEqual([]);
  });
}
