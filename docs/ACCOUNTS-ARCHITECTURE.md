# Accounts and progress tracking: architecture

**Status:** built and tested locally with fictional people on branch `feat/accounts-progress`. Not deployed.
Real-user use is BLOCKED until PMH approval (docs/ACCOUNTS-SCOPE.md).

## Shape

```
Phone / PC browser                                    Supabase (managed Auth + Postgres)
┌──────────────────────────────┐   HTTPS (publishable  ┌──────────────────────────────────────────┐
│ React PWA (unchanged lessons)│   key + user JWT)     │ Auth: email OTP, SMS OTP (send-SMS hook),│
│  guest: progress on device   │ ────────────────────► │       TOTP second factor for staff/admin │
│  learner: per-account copy + │                       │ Postgres: tables with RLS (default deny) │
│    offline event queue       │ ◄──────────────────── │   + SECURITY DEFINER functions = the API │
│  staff/admin pages (lazy)    │   only what the       │   + audit_log (function-written only)    │
└──────────────────────────────┘   database allows     └──────────────────────────────────────────┘
```

- **No app server of our own.** The browser talks to Supabase directly, and the database enforces every rule.
  Privileged actions are database functions that check the caller on every call. No service/secret key is
  needed by the app, so none exists in the frontend.
- **The public static site keeps working as before.** Accounts switch on only in a build given a Supabase URL
  and a publishable key (`--mode accounts`). The public GitHub Pages build has neither, so it shows no sign-in
  and makes no account network calls. Its service worker does not precache account code.
- **Code:** `backend/supabase/migrations/20261111000001_accounts_progress.sql` (schema, RLS, functions, grants),
  `app/src/account/` (client, session, sync, sign-in), `app/src/pages/{account,staff}/`,
  `app/src/pages/TutorialPage.tsx`.

## Permission matrix (enforced by the database)

| Action | Guest | Learner | Staff (aal2) | Admin (aal2) | How it is enforced |
|---|---|---|---|---|---|
| Read lessons, videos, tutorial | ✓ | ✓ | ✓ | ✓ | static files |
| Own progress: read | – | own rows only | – | – | RLS `learner_id = auth.uid()` and account active |
| Own progress: write | – | via `sync_learning` only | – | – | no table grants; function uses the caller's id and server time |
| Import device progress (once) | – | ✓ | – | – | `import_device_progress`, `legacy_imported_at` |
| List and see learners' progress | – | – | learners in assigned cohorts | learners in cohorts assigned to them | `staff_list_learners` / `staff_learner_detail`: active staff row + `aal2` + cohort check; every call audited |
| Read audit log | – | – | – | ✓ | `admin_audit_log`; no table grant to anyone |
| Invite staff, set role and status | – | – | – | ✓ | `admin_*` functions; cannot remove the last active admin |
| Assign cohorts (staff ↔ learners) | – | – | – | ✓ | `admin_set_staff_cohort`, `admin_set_learner_cohort` |
| Deactivate or reactivate learners | – | – | – | ✓ | `admin_set_learner_status` (deactivated: no sync, no reads) |
| Create the first admin | – | – | – | – | `private.bootstrap_admin`, run only with direct DB access |
| Approve clinical content | – | – | – | – | not an app permission (CLAUDE.md rule 3) |

- **Roles live only in `staff_members`.** They are never taken from the JWT, user metadata, URL, form fields or
  browser storage. They are checked on every call, so removing a role, scope or account takes effect on the next
  request, even if the old session is still open.
- **Sign-up never creates staff or admin.** Signing up through the staff page (`intent = staff`) works only when
  an open, unexpired invitation exists for that exact email. Any other sign-up becomes a learner. An existing
  learner's email cannot be invited; the admin must use a separate work email.
- **Second factor.** Staff and admin functions require the JWT `aal` claim to equal `aal2`. That only happens after
  TOTP verification, and the JWT is signed by Auth, so a forged claim is rejected (HTTP 401, tested).

## Data model (smallest set that does the job)

| Table | Holds | Notes |
|---|---|---|
| `auth.users` (Supabase) | verified phone or email, credentials, TOTP factors | managed by Auth, never copied |
| `learners` | UUID, display name (self-chosen, unverified), contact method, masked hint, status, `legacy_imported_at` | `name_verified_*` is set only after a staff check |
| `staff_members`, `staff_invitations` | work email, display name, role, status | invitations expire after 7 days |
| `cohorts`, `cohort_learners`, `staff_cohorts` | access scope | staff see only their cohorts |
| `lesson_progress` | lesson, content version, step count, current and furthest step, `first_completed_at` (never overwritten), first/last activity (device time, clamped), `last_synced_at` (server time), `source` | `legacy_import` rows are labelled |
| `tutorial_progress` | started, last step, completed, skipped | not part of the 58 |
| `quiz_answers` | every answer actually given since accounts began; `attempt_no` set by the server | earlier history is not invented |
| `video_progress` | merged played ranges, watched seconds, resume position, `completed_at` at ≥ 90 % coverage | seeking does not count |
| `learning_events` | every accepted event (client UUID = idempotency key), device time, server time | staff timeline |
| `audit_log` | privileged reads and changes | function-written; no client access |

All times are stored as `timestamptz` and shown in Asia/Bangkok time. Device times are clamped to the range
[now − 60 days, now], so a wrong phone clock cannot write future times.

## Sync rules

- Every step change, finish, quiz answer, tutorial step and batch of video ranges becomes an event with a random
  UUID. It goes into a queue stored per account (`pmh-anc-learn:account:<uid>:queue:v1`).
- The queue is sent in batches of up to 100 to `sync_learning`. An id that was already applied is skipped, so
  retries, a second tab and resent offline queues never duplicate anything.
- Merging is conflict-safe:
  - furthest step = the maximum;
  - first completion = the earliest;
  - current step = from the latest event, so an older event arriving late does not move progress back.
- The queue is sent only while the stored session belongs to the same account. A queue can never be sent under
  another person's session.
- Saving states shown in Thai:
  - บันทึกไว้ในเครื่องแล้ว (saved on this device, waiting to send);
  - รอเชื่อมต่ออินเทอร์เน็ต (waiting for internet);
  - บันทึกเข้าบัญชีแล้ว (saved to the account).
  Staff always see `last_synced_at` and the time the page was loaded.
- After a reload, the stored session's account is attached before any page records a step. A bug where the
  first step went to the guest store was found by the e2e test and fixed.

## Guest progress, shared devices, offline

- **Guest progress** stays under `pmh-anc-learn:progress:v1` and is never uploaded.
  - After sign-in, the account page asks once whether this device's progress belongs to the learner.
  - "Yes" imports only the furthest step and completion time, labelled as imported. "No" is remembered.
  - Nothing is imported automatically.
- **Sign-out** removes this account's on-device copy, queue and session, then fully reloads the page, which
  clears memory. Staff pages reload if restored from the back/forward cache.
  - If events are unsent, the learner is warned and must confirm before they are discarded.
- **Offline.** Lessons work offline as before. Signing in, sending progress and staff/admin pages need a
  connection.
- **Service worker.** It caches only same-origin app files. API responses go to Supabase's origin and are never
  cached.

## What reset, correction and deletion do (current behaviour)

- **"ล้างความคืบหน้าในเครื่องนี้" (About page).** Clears the on-device copy for the current owner only. Account
  data on the server is untouched.
- **Learner deactivation (admin).** Blocks sync and reads for that learner. Data is kept.
- **Corrections and deletion of an account's data:** no in-app function yet.
  - BLOCKED on PMH's retention and deletion policy.
  - Deleting the auth user cascades to all learner rows (`on delete cascade`). That needs the service key, so it is
    an operator task (docs/ACCOUNTS-ADMIN-GUIDE.md).
  - Audit rows keep the target id.

## Tests

- `cd backend && npm test`: 26 database/API tests with real OTP flows (Mailpit, local SMS outbox) and fictional
  people.
  - Covers roles, RLS, writes, audit, MFA and forged tokens, revocation with an open session, the last admin,
    deactivation, idempotent sync, first-completion preservation, late events, clock forging, cross-learner
    access, video seeking and legacy import.
- `cd app && npm run test:accounts`: Playwright end-to-end demo through the real UI (Phase D).
- `cd app && npm run test:e2e`: the existing suite plus Lesson 0 tests, on the public build (accounts off).
