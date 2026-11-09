# Brief: writing narration scripts for lesson videos (PMH Smart ANC Learn)

Short animated explainer videos (about 1.5–2.5 minutes) for pregnant women and families at Phimai Hospital,
Thailand. Narrated by a warm, calm ElevenLabs Thai voice. Calm and clear, never dramatic.

## Source rule (most important)
The narration must use ONLY content already in the lesson JSON you are scripting
(`content/lessons/<lessonId>.json`: its text, timeline, flag, sort
and takeaways steps). Those lessons are drafted from the official handbook and their additions are already
listed in `editorial.reviewNotes`. Do NOT add any fact, number, tip or example that is not in the lesson. Do not
use quiz scenarios. If a lesson statement is marked "HANDBOOK ISSUE" or flagged for review, leave it out of the
video unless it is central — and then add a reviewNote.

## Format — copy the structure of the finished example
`content/video-scripts/V-OVR-001.json`
Types: `video/src/lesson/types.ts`

- File: `content/video-scripts/V-<CODE>.json` where CODE is the lessonId without "MCH68-" (MCH68-K-001 → V-K-001).
- Top level: id, lessonId, version "0.1.0", title (the lesson title), handbookRef (copy edition, pdfPages,
  printedPages from the lesson; note: "Narration derived from lesson <id> v<version>"), editorial, voice.
- voice: exactly `{ "engine": "elevenlabs", "voice": "MYZYcGOqrkYQcwDunXl7", "model": "eleven_v3", "stability": 0.5, "style": 0, "speed": 0.95, "seed": 1234 }`
- editorial: status "DRAFT", author "Claude Code (AI draft) for PMH developer", medicalReviewer null, reviewDate null,
  clinicalRisk = the lesson's, reviewNotes = ["Narration derived only from lesson <id> v<version>; no new content.",
  "Thai-speaking reviewer: check pronunciation of <list tricky words/numbers>.", ...any lesson reviewNotes that
  apply to sentences you used].
- Scenes, in order:
  1. `title`: heading (short, ≤ 24 characters if possible), subheading "จากสมุดบันทึกสุขภาพแม่และเด็ก ฉบับปรับปรุงใหม่ พ.ศ. 2568",
     optional `chips` (0–3 very short topic labels), 1–2 segments introducing the topic.
  2. 1–3 `stage` scenes: `stage` number (1,2,3), `label` (≤ 22 chars), `prefix` "ตอนที่" (or "ช่วงที่" only when the
     parts are time periods), 2–6 `items` each {n, icon, text}. **Number items 1..N continuously across the whole
     video.** Item text ≤ 40 characters (it is shown big on screen). Segments: first one has `reveal: 0` and
     introduces the part; then one segment per item with `reveal: <n>`, in order.
  3. `summary`: heading (e.g. "จำไว้ 3 เรื่อง"), 2–4 points (≤ 34 chars), segments: `reveal: 0` intro ("สรุปเรื่องสำคัญ"),
     then one per point with reveal 1..k.
- Icons: use only these names: vitamin calendar scale handbook clinic food relax plan book breastfeed bowl
  vaccine tooth story ask check flag water walk bottle fridge snowflake clock thermometer toothbrush baby group
  noalcohol nosmoking heart leaf fish shield play warning motorcycle car ear smile chat form office fence blood
  (use `warning` for "stop / see staff quickly" items — never `flag`, which means the nutrition flag)

## Writing the segments
- `speak` = exactly what the voice says. Natural spoken Thai, one or two short sentences. **No digits**: write
  numbers in Thai words ("สิบสองสัปดาห์", "สองพันห้าร้อย", "ครึ่งฟอง"). Spell acronyms as Thai letters names
  ("ดี เอส พี เอ็ม"). Avoid ค่ะ/ครับ except a single gentle "นะคะ"-free ending — keep it neutral.
- `caption` = the same sentence as displayed subtitles; digits allowed ("12 สัปดาห์"); ≤ 90 characters; must say the
  same thing as `speak` (subtitles must match the audio).
- Total `speak` length 700–1,400 characters (cost control). Prefer fewer, clearer points over covering everything.
- Last summary line may remind: bring the handbook / ask staff if unsure — only if the lesson says so.

## Check and finish
- Run `cd video && node scripts/check-script.mjs V-<CODE> ...` and fix every
  ERROR (warnings: fix if easy).
- Write ONLY your own files in content/video-scripts/. Do not run narrate/render (they cost money), git, or edit other files.
- Final reply: per script — characters, scenes/items count, and any reviewNote you added. Compact.
