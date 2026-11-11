import { execFileSync } from "node:child_process";
import { join } from "node:path";

/** Start every run from an empty local database (migrations + dev seed). Never touches anything remote. */
export default function globalSetup() {
  execFileSync("npx", ["supabase", "db", "reset", "--local"], { cwd: join(import.meta.dirname, "../../backend"), stdio: "inherit" });
}
