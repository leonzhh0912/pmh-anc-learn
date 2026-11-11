# PMH Smart ANC Learn — เรียนรู้คู่สมุดสีชมพู

A mobile-first learning web app (PWA) for Phimai Hospital (โรงพยาบาลพิมาย) that turns the official Thai
**Maternal and Child Health Handbook** into short lessons, narrated videos and interactive exercises for
pregnant women, families and caregivers.

> **Status: prototype. All content is DRAFT and has not been medically reviewed.**
> Nothing here may be presented to patients as authoritative guidance until PMH reviewers approve it
> (see [CONTENT_REVIEW.md](CONTENT_REVIEW.md)).

## Source of truth

**สมุดบันทึกสุขภาพแม่และเด็ก ฉบับปรับปรุงใหม่ พ.ศ. 2568**, กรมอนามัย กระทรวงสาธารณสุข,
2nd printing April 2569 (68-page PDF). Exact file, hash and page-numbering rule:
[content/handbook-source.json](content/handbook-source.json). Curriculum map: [CURRICULUM.md](CURRICULUM.md).

An earlier 1st-printing file (July 2568) circulates and differs on many pages. Do not use it.

## What is in this repository

| Folder | What it is |
|---|---|
| `app/` | The PWA (React + TypeScript + Vite, `vite-plugin-pwa`, Playwright tests) |
| `video/` | Remotion project that renders lesson videos (MP4 + Thai WebVTT captions) |
| `content/` | All lesson, quiz, video-script and section data as JSON — the only place content is edited |
| `handbook/` | Page-by-page extraction of the official handbook (`extraction/`) and the local PDF copy (`source/`, not committed) |
| `.claude/launch.json` | Dev-server definitions for Claude Code's preview |

## Quick start (any Mac or Linux machine with Node.js ≥ 22)

```bash
git clone https://github.com/phimai-hospital/phimai-hospital.github.io.git pmh-anc-learn && cd pmh-anc-learn
cd app && npm ci && npm run dev        # http://localhost:5173 (also on your LAN for phone testing)
```

Videos (macOS needed only for the draft Thai voice; rendering works anywhere with Node + ffmpeg):

```bash
cd video && npm ci
npm run video V-OVR-001                # narrate -> render -> copy into the app
```

Tests:

```bash
cd app && npx playwright install chromium && npm run test:e2e
```

## Documentation

- [DEVELOPMENT.md](DEVELOPMENT.md) — architecture, setup, adding lessons and videos, troubleshooting
- [CURRICULUM.md](CURRICULUM.md) — handbook table of contents, page coverage, lesson map, releases
- [CONTENT_REVIEW.md](CONTENT_REVIEW.md) — editorial workflow DRAFT → MEDICAL REVIEW → APPROVED → PUBLISHED
- [DEPLOYMENT.md](DEPLOYMENT.md) — staging, production, rollback
- [CLAUDE.md](CLAUDE.md) — rules for AI assistants working on this repo
- [docs/PROGRESS.md](docs/PROGRESS.md) — session log and next-step checklist
- Accounts (in development, not live): [scope](docs/ACCOUNTS-SCOPE.md), [architecture](docs/ACCOUNTS-ARCHITECTURE.md),
  [hosting and approvals](docs/ACCOUNTS-HOSTING.md), [staff guide](docs/ACCOUNTS-STAFF-GUIDE.md), [admin guide](docs/ACCOUNTS-ADMIN-GUIDE.md)

## Ownership

Repository: https://github.com/phimai-hospital/phimai-hospital.github.io (public, in the hospital's GitHub
organisation `phimai-hospital`). Live app: https://phimai-hospital.github.io/

Built for Phimai Hospital. The project must stay operable by authorised PMH staff without depending on any
one person's computer or AI account. The PMH hospital director approved the project, and
MOPH (กรมอนามัย) approved adapting the handbook. Items still open are listed in
[docs/PROGRESS.md](docs/PROGRESS.md#open-decisions): Remotion licence, narration voice, per-lesson clinical review.
