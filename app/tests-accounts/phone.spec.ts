// SMS sign-in is the main way in. Locally no SMS is sent: the real one-time code goes to the dev outbox.
import { expect, test } from "@playwright/test";
import { db, uiPhoneSignIn } from "./helpers";

test("phone sign-in: Thai formatting, landline refused, code by SMS", async ({ page }) => {
  const digits = String(Date.now()).slice(-7);
  const typed = `08${digits[0]}-${digits.slice(1, 4)}-${digits.slice(4)}0`.replace(/^(\d{3}-\d{3}-\d{4}).*/, "$1");
  const e164 = "+66" + typed.replace(/\D/g, "").slice(1);

  await page.goto("/signin");
  await page.getByRole("button", { name: "เข้าด้วยรหัสทาง SMS หรืออีเมลแทน" }).click();
  const phone = page.getByRole("button", { name: /^เบอร์โทรศัพท์/ });
  await expect(phone).toContainText("แนะนำ");
  await phone.click();
  // a landline is refused before anything is sent
  await page.getByLabel("เบอร์มือถือ 10 หลัก").fill("02-123-4567");
  await page.getByRole("button", { name: "ส่งรหัส", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText("ไม่ใช่เบอร์มือถือไทยที่ถูกต้อง");

  await uiPhoneSignIn(page, typed, e164);
  await page.goto("/account");
  await expect(page.getByText(/เข้าสู่ระบบด้วยเบอร์ 08x-xxx-\d{4}/)).toBeVisible();
  const { rows } = await db.query("select phone from auth.users where phone = $1", [e164.slice(1)]);
  expect(rows).toHaveLength(1); // stored as E.164 digits, never 660…
  const sms = await db.query("select body from dev_only.sms_outbox where phone = $1 order by id desc limit 1", [e164.slice(1)]);
  expect(sms.rows[0].body).toMatch(/^รหัสยืนยัน ANC Learn: \d{6} ใช้ได้ 10 นาที/);
});
