# Thai narration voice

## Decision (2026-11-09)

- **Provider: ElevenLabs only.** Google Chirp 3 HD and BOTNOI were researched and dropped; their adapters
  were removed. The research summary is kept below for the record.
- **Voice:** `MYZYcGOqrkYQcwDunXl7`, chosen by the developer.
- **Model:** `eleven_v3`. Thai is supported only on v3/v4, not on `eleven_multilingual_v2` or flash.
- **Settings:** stability 0.5, style 0, speed 0.95, seed 1234, set in each video script's `voice` block.
- **Status:** narration is still **DRAFT** until a Thai-speaking PMH reviewer approves pronunciation per video
  (CONTENT_REVIEW.md). The app labels these videos "เสียงบรรยายสังเคราะห์ด้วย AI".

## Account and key (owner: developer; see "Handover")

- Paid plan required: Starter (US$6/month) minimum for commercial use and API access to library voices;
  Creator (US$22/month) when producing the full syllabus. Prices as checked 2026-11-09.
- Account setting: opt out of data use for model training.
- API key: restricted to **Text to Speech only**, with a character limit, stored **only** in git-ignored
  `video/.env.local` as `ELEVENLABS_API_KEY`. Template: `video/.env.example`.
  - Because of that restriction the key cannot read voice details or account usage (HTTP 401 on
    `/v1/voices`, `/v1/models`, `/v1/user/subscription`). This is intended. Check usage in the ElevenLabs
    dashboard.
- If the chosen voice is a **Voice Library** voice, its owner can withdraw it; access then continues for that
  voice's notice period, and audio already generated stays usable. Check the notice period on the voice's
  page. If long-term stability matters, recreate a similar voice with **Voice Design** (owned by the account).
- Handover: the subscription and voice live in the developer's ElevenLabs account. For PMH to keep producing
  videos without the developer, PMH needs its own subscription (or a shared workspace) and the same voice
  added to it. All narration text, settings and generated audio are reproducible from the repo.

## Cost

| Item | Characters | Approx. cost on v3 (~US$0.08 / 1K) |
|---|---|---|
| One lesson video (e.g. V-OVR-001) | ≈1,400 | ≈US$0.11 of plan allowance |
| Voice test script | 645 | ≈US$0.05 |
| Full syllabus, one pass (58 lessons) | ≈150,000 | ≈US$12, inside 1–2 months of Creator |

Characters are only spent when a sentence's text or voice settings change. Unchanged sentences come from
the local cache.

## How it works in the pipeline

```bash
cd video
npm run voice-samples -- --dry-run     # characters + estimated cost, no API call
npm run voice-samples -- el-chosen     # test script in the chosen voice -> out/voice-samples/index.html
npm run video V-OVR-001                # narrate -> render -> publish into the app
```

- One API request per sentence (`/v1/text-to-speech/{voice}/with-timestamps`). The returned character
  alignment is checked against the input text (verified identical on the first test call).
- Each clip is converted to 48 kHz mono WAV, edge silence trimmed, loudness normalised to −16 LUFS.
- Scenes are sized to the measured audio; Thai WebVTT captions are built from the same timings, so captions
  match the narration sentence by sentence.
- `publish-to-app` refuses an MP4 whose duration doesn't match the current narration timing.
- Pauses: v3/v4 ignore `<break>` tags. Pauses come from punctuation and from the gaps the pipeline inserts
  between sentences (0.45 s) and at scene edges.
- Numbers and acronyms are written out in the `speak` text (e.g. "สิบสองสัปดาห์", "ดี เอส พี เอ็ม") while captions
  show digits. That keeps pronunciation predictable.
- Recorded human narration still overrides TTS per sentence: put
  `video/public/audio/<id>/recorded/<sceneId>-<n>.wav` and re-run narrate.

## Changing the voice later

Edit only the `voice` block in `content/video-scripts/<id>.json` (and the `el-chosen` entry in
`content/voice-tests/candidates.json`), then `npm run video <id>`. The narration text is not touched, so a voice
change needs pronunciation review, not clinical re-review.

## Research summary (2026-11-09, for the record)

| | ElevenLabs v3 | Google Chirp 3 HD | BOTNOI V2 |
|---|---|---|---|
| Thai | v3/v4 only | 30 voices (14 female) | Thai-first provider |
| Price | ≈US$0.08/1K chars; paid plan needed | US$30/1M, 1M/month free | 2 points/char, THB plans, 3-month minimum |
| Output rights | Commercial licence on paid plans | Customer data; not logged | Unclear in terms (ownership clause) |
| Data use | Training unless opted out; US storage | Not logged, not used for training | 2020 policy, training use not stated |
| Timestamps | Character alignment | None | None |
