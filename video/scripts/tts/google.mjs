/**
 * Google Cloud Text-to-Speech, Chirp 3: HD voices
 * (https://docs.cloud.google.com/text-to-speech/docs/chirp3-hd).
 *
 * voice block: { engine: "google", voice: "th-TH-Chirp3-HD-Sulafat", speakingRate: 0.95 }
 *
 * Auth, in order of preference (nothing is ever written to the repo):
 *  1. Application Default Credentials via the gcloud CLI (documented route):
 *       gcloud auth application-default login
 *     and set GOOGLE_CLOUD_PROJECT=<project id> in video/.env.local
 *  2. GOOGLE_TTS_API_KEY — an API key restricted to the Text-to-Speech API.
 *     Works in practice but is not listed in Google's TTS auth docs.
 *
 * Limits: 5,000 bytes of input per request (≈1,600 Thai characters), so keep
 * one sentence/segment per request. Chirp 3 HD returns no word timestamps;
 * subtitles are timed from each segment's measured audio duration instead.
 */
import { execFileSync } from "node:child_process";
import { httpError } from "./index.mjs";

let cachedToken = null;
function accessToken() {
  if (cachedToken) return cachedToken;
  cachedToken = execFileSync("gcloud", ["auth", "application-default", "print-access-token"]).toString().trim();
  return cachedToken;
}

export function googleAuthAvailable() {
  if (process.env.GOOGLE_TTS_API_KEY) return true;
  if (!process.env.GOOGLE_CLOUD_PROJECT) return false;
  try {
    accessToken();
    return true;
  } catch {
    return false;
  }
}

export async function google(voice, text) {
  const bytes = Buffer.byteLength(text, "utf8");
  if (bytes > 4800) throw new Error(`Google TTS: segment is ${bytes} bytes; split it (limit 5,000 bytes per request)`);

  const languageCode = voice.languageCode ?? voice.voice.split("-").slice(0, 2).join("-");
  const headers = { "Content-Type": "application/json" };
  let url = "https://texttospeech.googleapis.com/v1/text:synthesize";
  if (process.env.GOOGLE_TTS_API_KEY) {
    url += `?key=${encodeURIComponent(process.env.GOOGLE_TTS_API_KEY)}`;
  } else {
    headers.Authorization = `Bearer ${accessToken()}`;
    headers["x-goog-user-project"] = process.env.GOOGLE_CLOUD_PROJECT;
  }

  // Use `markup` when the script contains [pause] tags, plain `text` otherwise.
  const input = /\[pause( short| long)?\]/.test(text) ? { markup: text } : { text };
  const res = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify({
      input,
      voice: { languageCode, name: voice.voice },
      audioConfig: { audioEncoding: "LINEAR16", sampleRateHertz: 48000, speakingRate: voice.speakingRate ?? 1.0 },
    }),
  });
  if (!res.ok) throw await httpError(res, "Google");
  const json = await res.json();
  return { audio: Buffer.from(json.audioContent, "base64"), ext: "wav", meta: null };
}
