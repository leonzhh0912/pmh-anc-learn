/**
 * Provider-neutral text-to-speech for the narration pipeline.
 *
 *   await synthesize(voiceConfig, text, outWav)
 *
 * voiceConfig comes from a video script's "voice" block, e.g.
 *   { "engine": "elevenlabs", "voice": "<voice_id>", "model": "eleven_multilingual_v2", ... }
 *   { "engine": "google", "voice": "th-TH-Chirp3-HD-Achernar", "speakingRate": 0.95 }
 *   { "engine": "botnoi", "voice": "<speaker id>", "speed": 1 }
 *   { "engine": "macos-say", "voice": "Kanya", "rate": 185 }      (draft only)
 *
 * API keys are read ONLY from environment variables (video/.env.local, which
 * is git-ignored; see video/.env.example). Nothing secret is written to disk
 * except the generated audio.
 *
 * Every provider's output is converted to the same format: 48 kHz mono WAV,
 * leading/trailing silence trimmed, loudness normalised to -16 LUFS, so that
 * switching voices never breaks timing or levels.
 */
import { execFileSync } from "node:child_process";
import { rmSync, writeFileSync } from "node:fs";

import { elevenlabs } from "./elevenlabs.mjs";
import { google, googleAuthAvailable } from "./google.mjs";
import { botnoi } from "./botnoi.mjs";
import { macosSay } from "./macos-say.mjs";

const engines = { elevenlabs, google, botnoi, "macos-say": macosSay };

export const ENV_VARS = {
  elevenlabs: "ELEVENLABS_API_KEY",
  google: "GOOGLE_TTS_API_KEY",
  botnoi: "BOTNOI_TOKEN",
  "macos-say": null,
};

export function missingKey(engine) {
  if (engine === "google") {
    return googleAuthAvailable() ? null : "GOOGLE_CLOUD_PROJECT + gcloud ADC login (or GOOGLE_TTS_API_KEY)";
  }
  const v = ENV_VARS[engine];
  return v && !process.env[v] ? v : null;
}

/** Returns { file, raw } where raw is provider metadata (e.g. character alignment). */
export async function synthesize(voice, text, outWav) {
  const engine = engines[voice.engine];
  if (!engine) throw new Error(`Unknown TTS engine "${voice.engine}"`);
  const key = missingKey(voice.engine);
  if (key) throw new Error(`${key} is not set. Configure it in video/.env.local (never in source code).`);

  const { audio, ext, meta } = await engine(voice, text);
  const tmp = `${outWav}.src.${ext}`;
  writeFileSync(tmp, audio);
  normalise(tmp, outWav);
  rmSync(tmp);
  return { file: outWav, meta };
}

function normalise(input, output) {
  // trim silence at both ends (keeps natural pauses inside the sentence),
  // then EBU R128 loudness normalisation
  const trim =
    "silenceremove=start_periods=1:start_threshold=-50dB:start_silence=0.05," +
    "areverse,silenceremove=start_periods=1:start_threshold=-50dB:start_silence=0.08,areverse";
  execFileSync("ffmpeg", [
    "-v", "error", "-y", "-i", input,
    "-af", `${trim},loudnorm=I=-16:TP=-1.5:LRA=11`,
    "-ar", "48000", "-ac", "1", output,
  ]);
}

export async function httpError(res, provider) {
  let body = "";
  try {
    body = (await res.text()).slice(0, 400);
  } catch {
    /* ignore */
  }
  return new Error(`${provider} TTS failed: HTTP ${res.status} ${body}`);
}
