# Thai narration voice: comparison and setup

Research date: 2026-11-09 (provider pages change often; re-check prices before buying).
Goal: a warm, calm, adult female Thai educator voice with natural tones and correct numbers, for
pregnant women and families at Phimai Hospital. No drama, no "TikTok voice".

## Summary

| | Google Cloud Chirp 3 HD | ElevenLabs (eleven_v3) | BOTNOI Voice (V2) |
|---|---|---|---|
| Thai support | 30 Thai voices (14 female), GA | Thai only on v3 / v4 models | Thai company, Thai-first voices |
| Candidate voices | Sulafat ("warm"), Vindemiatrix ("gentle"), Achernar ("soft") | No confirmed native-Thai female voice ID; pick in Voice Library (log in, filter Thai + female + educational) or Voice Design | ครูดีดี๊ Kru D Dee (ID 50, narrator, slow), น้าเกรซ Aunty Grace (ID 32, warm narrator) |
| Pauses | `[pause]` / `[pause short]` / `[pause long]` markup (not always honoured); SSML in Preview | No `<break>` on v3/v4; punctuation only | `delay{1}` in text |
| Pronunciation fixes | Custom pronunciations **exclude Thai**; respell in the script | Alias dictionaries (v3); phonemes only on v4 | Respell; Studio-only word fixes |
| Word timestamps | None | Yes (character alignment) | None |
| Max per request | 5,000 bytes ≈ 1,600 Thai chars | 5,000 chars (v3) | 1,000 chars |
| Price | US$30 / 1M chars, **first 1M chars per month free** | ≈US$0.08 / 1K chars; paid plan from US$6/month | 2 points/char; Elite 1,000 THB (+VAT) per 160k points, min. 3 months |
| Whole syllabus (≈150k chars, ×3 re-generations) | **≈US$0** (inside free tier) | ≈US$24–36 (1–2 months of Creator, US$22/mo) | ≈3,210 THB incl. VAT (3 months Elite) |
| Commercial use of audio | Allowed; generated output is customer data; Google says it does not log TTS text/audio and does not train on it | All paid plans include commercial licence; free plan forbids it and requires credit | **Unclear.** Terms say downloaded materials belong to Botnoi; get written confirmation |
| Data handling | Not logged (per Google docs) | Inputs may be used for training unless you opt out; US storage; zero-retention is Enterprise only | 2020 privacy policy; training use not stated |
| Procurement | Card on a Google Cloud billing account (USD) | Card (USD), NY law / arbitration | **Thai tax invoice, THB, PromptPay**, local vendor |
| Watch-outs | Gen-AI service terms §20(d)/(e): no clinical use, no services likely used by under-18s — patient education is probably fine but PMH legal should read it (teenage mothers) | Library voices can be withdrawn by their owner (notice period); default voices expire 31 Dec 2026 | Ownership clause; monthly points expire; 3-month minimum |

## Recommendation

Audition three voices, one per provider, on the same test script:

1. **Google Chirp 3 HD, Sulafat**: the strongest overall fit for a public hospital. Licensing is clear,
   input isn't logged or used for training, and the whole syllabus would likely cost nothing. Main
   risk: Thai quality is unproven until we hear it. Backup voice: Vindemiatrix.
2. **BOTNOI, ครูดีดี๊ Kru D Dee (ID 50)**: Thai-native, slow narrator pace, invoiced in THB. Use it only if
   Botnoi confirms in writing that PMH may publish the audio. Backup voice: น้าเกรซ (ID 32).
3. **ElevenLabs v3, one Voice Library pick**: possibly the most expressive, but needs a paid plan and
   a hand-picked voice, and inputs are used for training unless you opt out. Treat it as the quality
   benchmark.

Whichever wins, a Thai-speaking PMH reviewer must approve pronunciation (CONTENT_REVIEW.md) before any
video is published. Recorded narration by PMH staff remains a supported, free alternative.

## Test script

`content/voice-tests/voice-test-th-v1.json` has 7 sentences, 645 characters, reused from the existing
draft lesson (no new medical content). It tests numbers and ranges (12 สัปดาห์, 2,500 ถึง 4,000 กรัม,
20–34 ปี), loanwords (โฟลิก, ฟลูออไรด์, วัคซีน), the acronym DSPM, a gentle question, and sentence pauses.

## Cost of the comparison itself

| Provider | Test script, per voice | What you need |
|---|---|---|
| Google | 645 chars, inside the free 1M | Google Cloud project with billing enabled (card on file; no charge expected) |
| BOTNOI | ≈1,300 points (≈8 THB) | Account + API token. Sign-up points may cover it; otherwise smallest plan is 200 THB/month × 3 months. Free alternative: listen in the BOTNOI Studio (previews are free) |
| ElevenLabs | 645 chars ≈ US$0.05 | API use of Library voices needs Starter (US$6/month). Free alternative: preview voices on the website |

## How to set up a provider (keys never go into Git)

```bash
cd video
cp .env.example .env.local      # git-ignored; fill in only what you use
npm run voice-samples -- --dry-run   # characters and estimated cost, calls nothing
npm run voice-samples -- g-sulafat b-kru-d-dee   # generate chosen candidates
open out/voice-samples/index.html    # listen side by side
```

- **Google:** create a Google Cloud project, enable billing and the Text-to-Speech API. Then either
  install the gcloud CLI and run `gcloud auth application-default login` with `GOOGLE_CLOUD_PROJECT` set,
  or create an API key restricted to the Text-to-Speech API (`GOOGLE_TTS_API_KEY`).
- **BOTNOI:** sign up at voice.botnoi.ai, copy the API token into `BOTNOI_TOKEN`.
- **ElevenLabs:** create an API key restricted to Text to Speech (`ELEVENLABS_API_KEY`), choose a Thai
  female voice in the Voice Library, and paste its voice_id into `content/voice-tests/candidates.json`.

## Switching a video to the chosen voice

Change only the `voice` block of the video script, for example in `content/video-scripts/V-OVR-001.json`:

```json
"voice": { "engine": "google", "voice": "th-TH-Chirp3-HD-Sulafat", "speakingRate": 0.95 }
```

Then `npm run video V-OVR-001`. Narration is regenerated (cached per sentence + voice), scenes resize to
the new audio, Thai WebVTT captions are rebuilt from the same timings, the MP4 is rendered, and
`publish-to-app` refuses to publish if the MP4 and caption timings disagree. The narration text and medical
content are unchanged by a voice switch.

## Pipeline design notes

- One request per sentence: this gives exact subtitle timing without needing provider timestamps, natural
  pauses inserted by the pipeline, and stays under every provider's request limit.
- Every clip is converted to 48 kHz mono WAV, trimmed of edge silence and normalised to −16 LUFS, so
  voices from different providers can be compared and swapped without level or timing surprises.
- Clips are cached by a hash of text + voice settings; changing either regenerates only that sentence.
- Adapters: `video/scripts/tts/{google,elevenlabs,botnoi,macos-say}.mjs`.
