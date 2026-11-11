import { expect, test } from "@playwright/test";

// Lesson 0 (how to use the app) in the public build: no account needed, first card on Home, skippable,
// replayable, no handbook citation, not counted in the 58 lessons, and its video plays.
test("Lesson 0: first card, works without sign-in, skip and replay, not counted", async ({ page }) => {
  await page.goto("/");
  const cards = await page.locator(".start-here, .continue").evaluateAll((els) => els.map((e) => e.className));
  expect(cards[0]).toContain("start-here");
  await expect(page.locator(".home__progress")).toContainText("จาก 58 บทเรียน");

  await page.locator(".start-here").click();
  await expect(page.locator("article.lesson__card > .lesson__kind")).toHaveText("ขั้นที่ 1 จาก 8");
  await expect(page.locator(".page-chip")).toHaveCount(0);
  // the practice sign-in sends nothing: there is no network call to any auth service
  const calls: string[] = [];
  page.on("request", (r) => /auth\/v1|rest\/v1/.test(r.url()) && calls.push(r.url()));
  await page.goto("/start?step=1");
  await page.getByLabel("รหัสผู้เรียน (8 หลัก)").fill("12345679");
  await page.getByLabel("รหัสผ่าน").fill("2468135790");
  await page.getByRole("button", { name: "เข้าสู่ระบบ (ฝึก)" }).click();
  await expect(page.getByRole("alert")).toContainText("ยังไม่ตรง");
  await page.getByLabel("รหัสผู้เรียน (8 หลัก)").fill("1234-5678");
  await page.getByRole("button", { name: "เข้าสู่ระบบ (ฝึก)" }).click();
  await expect(page.locator(".tutorial__done")).toContainText("สำเร็จ");
  expect(calls).toEqual([]);

  await page.getByRole("button", { name: "ข้ามวิธีใช้งาน ไปเรียนเลย" }).click();
  await expect(page.locator(".start-here")).toHaveCount(0);
  await page.getByRole("link", { name: "ดูวิธีใช้งานอีกครั้ง" }).click();
  await expect(page).toHaveURL(/\/start/);
  await page.goto("/help");
  await expect(page.getByRole("link", { name: /ดูวิธีใช้งานทีละขั้น/ })).toBeVisible();
});

test("Lesson 0 video plays with captions available", async ({ page }) => {
  await page.goto("/start?step=4");
  const video = page.locator(".tutorial video");
  await expect(video).toBeVisible();
  const meta = await video.evaluate(async (v: HTMLVideoElement) => {
    v.muted = true;
    await v.play();
    await new Promise((r) => setTimeout(r, 1200));
    const t = v.currentTime;
    v.pause();
    return { duration: v.duration, played: t, tracks: v.textTracks.length, w: v.videoWidth };
  });
  expect(meta.duration).toBeGreaterThan(60);
  expect(meta.played).toBeGreaterThan(0.3);
  expect(meta.tracks).toBe(1);
  expect(meta.w).toBe(1280);
  const vtt = await page.request.get("/media/APP-TUTORIAL.th.vtt");
  expect(vtt.ok()).toBe(true);
  expect(await vtt.text()).toContain("WEBVTT");
});

test("Lesson 0 at 360 px with the largest text: every step fits, no sideways scrolling", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 740 });
  await page.addInitScript(() => localStorage.setItem("pmh-anc-learn:prefs:v1", JSON.stringify({ textScale: 1.3 })));
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  for (let step = 0; step < 8; step++) {
    await page.goto(`/start?step=${step}`);
    await expect(page.locator("article.lesson__card > .lesson__kind")).toHaveText(`ขั้นที่ ${step + 1} จาก 8`);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow, `step ${step + 1}`).toBeLessThanOrEqual(0);
    // main buttons stay large enough to tap
    const h = await page.locator(".lesson__nav .btn--primary").evaluate((b) => b.getBoundingClientRect().height);
    expect(h).toBeGreaterThanOrEqual(44);
  }
  expect(errors).toEqual([]);
});
