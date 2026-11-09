import { expect, test, type Page } from "@playwright/test";

const LESSON = "/lesson/MCH68-OVR-001";

async function next(page: Page) {
  await page.getByRole("button", { name: /^(ต่อไป|จบบทเรียน)$/ }).click();
}

test("home shows handbook sections and the first lesson", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/เรียนรู้คู่สมุดสีชมพู/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("เรียนรู้คู่สมุดสีชมพู");
  await expect(page.locator(".book__tab")).toHaveCount(10);
  await expect(page.getByRole("link", { name: /เริ่มบทเรียนแรก/ })).toBeVisible();
});

test("complete lesson: timeline, sorting, quiz with retry, progress saved", async ({ page }) => {
  await page.goto(LESSON);
  // draft content is always labelled
  await expect(page.locator(".draft-banner")).toContainText("ฉบับร่าง");

  // 1 text
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("สมุดสีชมพูคือคู่มือของครอบครัว");
  await next(page);

  // 2 video with Thai captions
  const video = page.locator("video");
  await expect(video).toBeVisible();
  await expect(video.locator("track[kind=captions][srclang=th]")).toHaveCount(1);
  await next(page);

  // 3 timeline: open an item in stage 2
  await page.getByRole("tab", { name: /ระหว่างตั้งครรภ์/ }).click();
  const item5 = page.getByRole("button", { name: /ฝากครรภ์ทันที/ });
  await item5.click();
  await expect(item5).toHaveAttribute("aria-expanded", "true");
  await expect(page.locator(".timeline__detail")).toContainText("หน้า 8–11");
  await next(page);

  // 4 sorting: a wrong placement is refused, then place every card correctly
  await page.getByRole("button", { name: "ฝากครรภ์ก่อน 12 สัปดาห์", exact: true }).click();
  await page.getByRole("button", { name: "วางในช่วง หลังคลอดและการดูแลลูก" }).click();
  await expect(page.locator(".sort__message")).toContainText("ยังไม่ใช่");
  // the card stays selected after a wrong try: just tap another stage
  await page.getByRole("button", { name: "วางในช่วง ระหว่างตั้งครรภ์" }).click();
  await expect(page.locator(".sort__message")).toContainText("ถูกต้อง");
  const placements: [string, string][] = [
    ["วิตามินเสริมเหล็ก/โฟลิก อย่างน้อย 3 เดือน", "ก่อนและเริ่มตั้งครรภ์"],
    ["เว้นช่วงมีบุตรห่างกันอย่างน้อย 2 ปี", "ก่อนและเริ่มตั้งครรภ์"],
    ["วางแผนคลอด", "ระหว่างตั้งครรภ์"],
    ["นมแม่อย่างเดียว 6 เดือน", "หลังคลอดและการดูแลลูก"],
    ["แปรงฟันลูกตั้งแต่ฟันซี่แรก", "หลังคลอดและการดูแลลูก"],
  ];
  for (const [card, bucket] of placements) {
    await page.locator(".sort__cards").getByRole("button", { name: card, exact: true }).click();
    await page.getByRole("button", { name: `วางในช่วง ${bucket}` }).click();
  }
  await expect(page.locator(".sort__message")).toHaveText("ครบทุกข้อแล้ว เก่งมาก");
  await next(page);

  // 5 quiz: wrong answer -> gentle feedback, retry, then correct
  await page.getByRole("button", { name: "รอให้ท้องเริ่มโตก่อน" }).click();
  await expect(page.locator(".feedback--gentle")).toContainText("ยังไม่ใช่");
  await expect(page.locator(".option.is-correct")).toHaveCount(0); // answer not revealed yet
  await page.getByRole("button", { name: "ลองตอบอีกครั้ง" }).click();
  await page.getByRole("button", { name: "ทันที ก่อนอายุครรภ์ 12 สัปดาห์" }).click();
  await expect(page.locator(".feedback--correct")).toContainText("ถูกต้อง");
  await expect(page.locator(".feedback--correct .page-chip")).toContainText("หน้าสรุปท้ายเล่ม");
  await page.getByRole("button", { name: "ข้อต่อไป" }).click();

  // remaining questions: use "show answer" on one, answer the rest correctly
  await page.getByRole("button", { name: "จริง", exact: true }).click();
  await page.getByRole("button", { name: "ดูเฉลย" }).click();
  await expect(page.locator(".feedback--correct")).toContainText("คำตอบคือ");
  await page.getByRole("button", { name: "ข้อต่อไป" }).click();
  await page.getByRole("button", { name: "ครบ 6 เดือน" }).click();
  await page.getByRole("button", { name: "ข้อต่อไป" }).click();
  await page.getByRole("button", { name: "ถามแพทย์หรือเจ้าหน้าที่ก่อน" }).click();
  await page.getByRole("button", { name: "ข้อต่อไป" }).click();
  await page.getByRole("button", { name: "ตั้งแต่ฟันซี่แรกขึ้น" }).click();
  await page.getByRole("button", { name: "จบแบบทดสอบ" }).click();

  // 6 takeaways with family note
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("สรุปสิ่งสำคัญ");
  await expect(page.getByRole("heading", { name: "สำหรับครอบครัวและผู้ดูแล" })).toBeVisible();
  await next(page);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("จบบทเรียนแล้ว");

  // progress survives a reload and shows on home
  await page.goto("/");
  await page.reload();
  await expect(page.locator(".home__progress")).toContainText("เรียนจบแล้ว 1 จาก 1");
});

test("text size control scales the type and is remembered", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "ขนาดตัวอักษรใหญ่มาก" }).click();
  const scale = () => page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue("--scale").trim());
  expect(await scale()).toBe("1.3");
  await page.reload();
  expect(await scale()).toBe("1.3");
});

test("video and captions are served", async ({ page, request }) => {
  const mp4 = await request.get("/media/V-OVR-001.mp4", { headers: { Range: "bytes=0-1023" } });
  expect([200, 206]).toContain(mp4.status());
  const vtt = await request.get("/media/V-OVR-001.th.vtt");
  expect(vtt.ok()).toBe(true);
  const text = await vtt.text();
  expect(text.startsWith("WEBVTT")).toBe(true);
  expect(text).toContain("ฝากครรภ์ทันที");
  await page.goto(`${LESSON}?step=1`);
  await expect(page.locator("video")).toHaveAttribute("preload", "none");
});

test("no horizontal scrolling at 360px", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 740 });
  for (const path of ["/", "/section/overview", LESSON, `${LESSON}?step=2`, `${LESSON}?step=3`, `${LESSON}?step=4`]) {
    await page.goto(path);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow, path).toBeLessThanOrEqual(0);
  }
});

test("lesson works offline after first visit", async ({ page, context, browserName }) => {
  test.skip(browserName !== "chromium", "service worker test runs on chromium");
  await page.goto("/");
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await page.reload(); // let the SW take control
  await context.setOffline(true);
  await page.goto(LESSON);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("สมุดสีชมพูคือคู่มือของครอบครัว");
  await context.setOffline(false);
});
