import { readFileSync } from "node:fs";
import { join } from "node:path";

/** Local stack settings written by `supabase status` into backend/.env.local (git-ignored). */
export const env: Record<string, string> = Object.fromEntries(
  readFileSync(join(import.meta.dirname, "../../backend/.env.local"), "utf8")
    .split("\n")
    .filter((l) => /^[A-Z_]+=/.test(l))
    .map((l) => [l.slice(0, l.indexOf("=")), l.slice(l.indexOf("=") + 1)]),
);
