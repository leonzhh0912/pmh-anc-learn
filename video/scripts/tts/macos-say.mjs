// Draft-only voice: Apple's licence limits system voices to personal, non-commercial use.
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

export async function macosSay(voice, text) {
  const dir = mkdtempSync(join(tmpdir(), "say-"));
  const file = join(dir, "out.aiff");
  execFileSync("say", ["-v", voice.voice, "-r", String(voice.rate ?? 185), "-o", file, text]);
  const audio = readFileSync(file);
  rmSync(dir, { recursive: true, force: true });
  return { audio, ext: "aiff", meta: null };
}
