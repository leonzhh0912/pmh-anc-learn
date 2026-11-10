import { readFileSync } from "node:fs";
import { join } from "node:path";
import { expect, type Page } from "@playwright/test";

/** Draft content is always labelled; approved content never is. */
export async function expectDraftLabelMatchesStatus(page: Page, lessonId: string) {
  const file = join(import.meta.dirname, "../../content/lessons", `${lessonId}.json`);
  const { status } = JSON.parse(readFileSync(file, "utf8")).editorial as { status: string };
  const banner = page.locator(".draft-banner");
  if (status === "APPROVED" || status === "PUBLISHED") await expect(banner).toHaveCount(0);
  else await expect(banner).toContainText("ฉบับร่าง");
}
