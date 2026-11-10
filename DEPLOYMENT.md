# Deployment

**Hosting: GitHub Pages** (decided 2026-11-10), at `https://leonzhh0912.github.io/pmh-anc-learn/`.
`.github/workflows/deploy.yml` publishes the **production build** on every push to `main`. The production
build refuses anything not APPROVED/PUBLISHED, so the site goes live only after a PMH reviewer records
sign-off (`npm run record-approval`, see CONTENT_REVIEW.md). Drafts are never published there.

One-time setup by the repo owner: GitHub → Settings → Pages → Source: **GitHub Actions**.
(Pages on a private repository needs a paid GitHub plan; otherwise make the repository public or use
another static host — see below.)

## Environments

| Environment | Purpose | Content allowed | Status |
|---|---|---|---|
| Local | development on any developer machine (`npm run dev`) | anything, DRAFT | working |
| LAN demo | show staff on a phone over hospital Wi-Fi (`npm run dev` or `npm run preview`, open the LAN URL) | DRAFT, clearly labelled | working |
| Staging | PMH reviewers test from anywhere; access-restricted | DRAFT / MEDICAL_REVIEW, labelled | to set up after approval |
| Production | patients and families via QR codes | APPROVED / PUBLISHED only (`build:production`) | Phase 4 |

## The build

The app is a static site. `cd app && npm run build` produces `app/dist/`, which any static web server can
host (HTTPS required for the service worker). Set `BASE_PATH=/sub/path/` if it is not served at a domain
root. The server must fall back to `index.html` for unknown paths (single-page app routing).

Production: `npm run build:production`. It fails if any content is not approved or any video uses draft TTS.

## Other hosting options

1. **PMH / MOPH server or hospital web hosting.** Data stays with the hospital. Needs IT to host static
   files with HTTPS and SPA fallback.
2. **Static host with access control for staging** (e.g. Cloudflare Pages with Cloudflare Access, Netlify
   with password protection). Free or low-cost tiers exist. Since the app holds no patient data and sends
   nothing to a server, privacy risk is low, but PMH policy decides.

Video files: currently served from the same static host (about 9 MB per 3-minute video). If the library
grows large, move MP4s to object storage or a CDN and point `mp4` paths there.

## Release procedure (to be finalised with PMH)

1. All tests green: `npm run validate:content -- --production`, `npm run test:e2e`.
2. Tag the release in Git: `git tag v1.0.0 && git push --tags`. The tag is the exact deployable version.
3. Build from the tag on a clean checkout: `npm ci && npm run build:production`.
4. Deploy `dist/` to staging, run the smoke test (open home, finish one lesson, play a video on a phone).
5. PMH content owner signs off. Deploy the same `dist/` to production.
6. Record the release (tag, date, approver) in `docs/PROGRESS.md`.

## Rollback

Every release is a Git tag, so rolling back means redeploying the previous tag's build:

```bash
git checkout v<previous> && cd app && npm ci && npm run build:production
# upload dist/ again (or use the host's "redeploy previous deployment" button)
```

The service worker updates clients on their next visit, so a rollback reaches users the same way a release
does. To withdraw one lesson urgently without a full rollback, revert the commit that added or changed
it (or delete its JSON file) on the release branch, rebuild with `build:production` and deploy.

## Backups

The Git repository (on GitHub plus at least one PMH-held clone) is the backup of all code and content.
Rendered media can be regenerated from the repository. Recorded narration files must be committed
(or kept in PMH storage) because they cannot be regenerated.
