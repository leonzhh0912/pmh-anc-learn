/**
 * BOTNOI Voice (https://voice.botnoi.ai, API docs: https://voice.botnoi.ai/llms.txt).
 * Thai provider. The V2 API returns a URL to the generated file, which we download.
 *
 * voice block: { engine: "botnoi", voice: "<V2 speaker id>", speed: 1, volume: 1 }
 *   Speaker IDs differ between V1/V2/V4 — these must be V2 IDs.
 * Auth: BOTNOI_TOKEN (sent as the botnoi-token header).
 * Limits: 1,000 characters per request. Pauses inside text: delay{1} (seconds).
 * Billing: V2 costs 2 points per character (spaces not counted) on every API call.
 */
import { httpError } from "./index.mjs";

const ENDPOINT = "https://api-voice.botnoi.ai/openapi/v1/generate_audio_v2";

export async function botnoi(voice, text) {
  if ([...text].length > 1000) throw new Error("BOTNOI: segment longer than 1,000 characters; split it");
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "botnoi-token": process.env.BOTNOI_TOKEN, "Content-Type": "application/json" },
    body: JSON.stringify({
      text,
      speaker: String(voice.voice),
      volume: voice.volume ?? 1,
      speed: voice.speed ?? 1,
      type_media: "wav",
      save_file: "True",
      language: "th",
    }),
  });
  if (!res.ok) throw await httpError(res, "BOTNOI");
  const json = await res.json();
  const url = json.audio_url ?? json.data?.audio_url;
  if (!url) throw new Error(`BOTNOI: no audio_url in response: ${JSON.stringify(json).slice(0, 300)}`);
  const audio = await fetch(url);
  if (!audio.ok) throw await httpError(audio, "BOTNOI download");
  return {
    audio: Buffer.from(await audio.arrayBuffer()),
    ext: /\.mp3(\?|$)/.test(url) ? "mp3" : "wav",
    meta: { points: json.point ?? null, monthlyPointsLeft: json.user_monthly_point ?? null },
  };
}
