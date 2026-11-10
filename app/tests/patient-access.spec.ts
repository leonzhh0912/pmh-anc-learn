import { expect, test } from "@playwright/test";
import { appUrl, qrUrl } from "../src/generated/qr";

const iphone =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148";

test("QR opens LINE links in the phone's browser; the printed address stays plain", async ({ page }) => {
  expect(new URL(qrUrl).searchParams.get("openExternalBrowser")).toBe("1");
  expect(new URL(qrUrl).origin + new URL(qrUrl).pathname).toBe(appUrl);
  await page.goto("/poster");
  await expect(page.locator(".poster__url")).toHaveText(appUrl.replace(/^https:\/\//, "").replace(/\/$/, ""));
  await expect(page.locator(".poster-page__link")).toHaveText(qrUrl);
});

test("LINE's parameter is removed from the address bar", async ({ page }) => {
  await page.goto("/lesson/MCH68-OVR-001?openExternalBrowser=1");
  await expect(page.locator("h1")).toBeVisible();
  expect(new URL(page.url()).search).toBe("");
  expect(new URL(page.url()).pathname).toBe("/lesson/MCH68-OVR-001");
});

test.describe("inside LINE on iPhone", () => {
  test.use({ userAgent: `${iphone} Line/14.5.0` });
  test("install card offers a tap to open in Safari", async ({ page }) => {
    await page.goto("/");
    const open = page.locator(".install__open");
    await expect(open).toHaveText(/เปิดใน Safari/);
    const href = new URL((await open.getAttribute("href"))!);
    expect(href.searchParams.get("openExternalBrowser")).toBe("1");
    expect(href.pathname).toBe("/");
  });
});

test.describe("Safari on iPhone", () => {
  test.use({ userAgent: iphone });
  test("install card shows Add to Home Screen steps, no LINE step", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator(".install__steps")).toContainText("เพิ่มไปยังหน้าจอโฮม");
    await expect(page.locator(".install__open")).toHaveCount(0);
    await page.getByRole("button", { name: "เข้าใจแล้ว" }).click();
    await page.reload();
    await expect(page.locator(".install")).toHaveCount(0);
  });
});
