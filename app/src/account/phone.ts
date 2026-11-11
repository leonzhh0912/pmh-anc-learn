// "mobile" metadata: isValid() is true only for mobile numbers
import { parsePhoneNumberFromString } from "libphonenumber-js/mobile";

/**
 * Thai mobile numbers as people write them ("081-234-5678", "0812345678", "+66 81 234 5678",
 * "66812345678") -> E.164 "+66812345678". Never produces "+660…". Returns null if it is not a valid
 * Thai mobile number (SMS codes can only go to mobiles).
 */
export function normaliseThaiMobile(input: string): string | null {
  const cleaned = input.replace(/[^\d+]/g, "");
  if (cleaned.length < 9) return null;
  const parsed = parsePhoneNumberFromString(cleaned, "TH");
  if (!parsed || parsed.country !== "TH" || !parsed.isValid()) return null;
  return parsed.number; // E.164
}

/** "+66812345678" -> "081-234-5678" for showing back to the user. */
export function formatThaiMobile(e164: string): string {
  const national = "0" + e164.replace(/^\+66/, "");
  return national.replace(/^(\d{3})(\d{3})(\d{4})$/, "$1-$2-$3");
}
