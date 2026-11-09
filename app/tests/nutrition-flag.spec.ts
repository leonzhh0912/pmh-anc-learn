import { expect, test } from "@playwright/test";

test("K-001 nutrition flag: tiers reveal groups, sorting and quiz complete", async ({ page }) => {
  await page.goto("/lesson/MCH68-K-001");
  await expect(page.locator(".draft-banner")).toContainText("ฉบับร่าง");
  await page.getByRole("button", { name: "ต่อไป" }).click();

  // flag: top tier open by default, tip tier says eat least
  await expect(page.locator(".flag__amount")).toHaveText("บนสุด: กินปริมาณมาก");
  await page.getByRole("button", { name: "กลุ่มไขมัน น้ำตาล เกลือ" }).click();
  await expect(page.locator(".flag__amount")).toHaveText("ปลายธง: กินปริมาณน้อย");
  await expect(page.locator(".flag__seen")).toContainText("ดูแล้ว 2 จาก 4");
  await page.getByRole("button", { name: "ต่อไป" }).click();

  // sorting into six groups
  const placements: [string, string][] = [
    ["ขนมปัง", "ข้าว-แป้ง"],
    ["ไข่", "เนื้อสัตว์"],
    ["น้ำมัน", "ไขมัน น้ำตาล เกลือ"],
    ["ปลา", "เนื้อสัตว์"],
    ["เส้นก๋วยเตี๋ยว", "ข้าว-แป้ง"],
    ["นม 1 แก้ว", "นม"],
  ];
  for (const [card, bucket] of placements) {
    await page.locator(".sort__cards").getByRole("button", { name: card, exact: true }).click();
    await page.getByRole("button", { name: `วางในช่อง ${bucket}`, exact: true }).click();
  }
  await expect(page.locator(".sort__message")).toHaveText("ครบทุกข้อแล้ว เก่งมาก");
  await page.getByRole("button", { name: "ต่อไป" }).click();
  await page.getByRole("button", { name: "ต่อไป" }).click(); // "why it matters" text

  // quiz
  for (const answer of ["6 กลุ่ม", "กลุ่มไขมัน น้ำตาล เกลือ", "ไตรมาส 3", "ขอคำแนะนำการกินอาหารจากแพทย์ที่ดูแล"]) {
    await page.locator(".quiz__options").getByRole("button", { name: answer, exact: true }).click();
    await expect(page.locator(".feedback--correct")).toContainText("ถูกต้อง");
    await page.getByRole("button", { name: /^(ข้อต่อไป|จบแบบทดสอบ)$/ }).click();
  }
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("สรุปสิ่งสำคัญ");
  await page.getByRole("button", { name: "จบบทเรียน" }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("จบบทเรียนแล้ว");
});
