/**
 * ElevenLabs TTS (https://elevenlabs.io/docs/api-reference/text-to-speech/convert-with-timestamps).
 *
 * Thai is supported only by eleven_v3 / eleven_v4 (NOT eleven_multilingual_v2
 * or flash_v2_5, which are the API defaults) — so model is always set explicitly.
 * Uses /with-timestamps to also get character-level alignment (kept in meta).
 * <break> tags are NOT supported on v3/v4: pauses come from punctuation and from
 * our one-segment-per-request design (the pipeline inserts the gaps).
 *
 * voice block: { engine: "elevenlabs", voice: "<voice_id>", model: "eleven_v3",
 *                stability, similarity, style, speed (0.7–1.2), seed }
 * Requires a PAID plan for commercial use and for Voice Library voices via API.
 */
import { httpError } from "./index.mjs";

export async function elevenlabs(voice, text) {
  if (!voice.voice || voice.voice.startsWith("<")) {
    throw new Error("ElevenLabs: set a real voice_id (choose one in the Voice Library: Thai, female, educational)");
  }
  const body = {
    text,
    model_id: voice.model ?? "eleven_v3",
    language_code: voice.languageCode ?? "th",
    voice_settings: {
      stability: voice.stability ?? 0.5,
      similarity_boost: voice.similarity ?? 0.75,
      style: voice.style ?? 0,
      use_speaker_boost: true,
      speed: voice.speed ?? 0.95,
    },
  };
  // a fixed seed makes re-generation of unchanged text as repeatable as the API allows
  if (voice.seed !== undefined) body.seed = voice.seed;

  const res = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voice.voice)}/with-timestamps?output_format=mp3_44100_128`,
    {
      method: "POST",
      headers: { "xi-api-key": process.env.ELEVENLABS_API_KEY, "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(90_000), // fail fast on a dead connection; the batch retries
    },
  );
  if (!res.ok) throw await httpError(res, "ElevenLabs");
  const json = await res.json();
  return {
    audio: Buffer.from(json.audio_base64, "base64"),
    ext: "mp3",
    meta: { alignment: json.alignment ?? null },
  };
}
