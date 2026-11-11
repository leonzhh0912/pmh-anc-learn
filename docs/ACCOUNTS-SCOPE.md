# Scope amendment: learner accounts and staff progress tracking

**Date:** 2026-11-11.
**Instruction from:** the PMH hospital executive, relayed by the developer.
**Changes:** rule 5 in CLAUDE.md and AGENTS.md. Rule 9 is new.

## What changed

Before this amendment, the app had no accounts, and progress stayed only in the browser. The hospital executive now
requires the following:

1. **Three account types:** learners, hospital staff and administrators.
2. **Learner sign-in:** with a phone number *or* an email address, by one-time code. A managed password sign-in is
   the fallback if a code channel cannot be set up properly.
3. **Staff monitoring:** staff can see registered learners and their progress in this app.
4. **Administration:** administrators manage staff accounts, permissions and learner access.
5. **First use:** the first learning experience explains how to use the app ("Lesson 0"), with an animated Thai
   video.
6. **Existing content:** the 58 handbook lessons, videos and quizzes stay intact. The app still works on phones and
   offline.

## What is allowed, and what is not

| Allowed (minimum needed) | Not allowed |
|---|---|
| Internal account ID (UUID) | Diagnoses, symptoms, pregnancy history |
| Display name chosen by the learner, marked as unverified | National ID numbers, hospital numbers (HN) or medical records |
| ONE verified phone number or email, held by the auth provider | Location |
| Account status | Advertising, third-party analytics or behavioural tracking |
| Learning activity in this app: steps, completion, quiz answers, video playback coverage, tutorial | Integration with the hospital information system (needs a separate requirement and approval) |
| Audit records of staff and administrator actions | Public leaderboards, marketing messages, automatic reminders |

## Rules that are unchanged

- **Book-only medical content (rule 8).** The tutorial is software instruction, so it is kept apart and carries no
  handbook citations (rule 9).
- **Clinical approval (rule 3).** An administrator role gives no authority over clinical approval or content.
- **Guest access.** Guests keep full access to the lessons, videos and tutorial without an account.

## Decisions recorded on 2026-11-11 (relayed by the developer for PMH)

| Topic | Decision | Still open |
|---|---|---|
| Deletion | Administrators delete learner accounts, usually once the child reaches an age PMH sets. The app stores no ages, so the administrator decides. | The age |
| Retention | On deletion, identity (sign-in, phone/email, name) is removed at once; learning records are kept **de-identified for 5 years for research**, then purged automatically (daily job). | Research/ethics approval for that use; whether records of *active* accounts also have a limit |
| Hosting | Data may live in a **Thai cloud** (self-hosted Supabase); the developer is taught the setup (docs/THAI-CLOUD-SETUP.md). | Which provider |
| Sign-in | **SMS phone sign-in first**; email is the fallback. Any email sender is fine. | SMS provider account and sender-name registration |
| Owners | More owners are added to every account; the developer is taught how. | Names |
| Narration | The project ElevenLabs voice, not the free draft voice, including for the Lesson 0 video. | PMH product review of the video |
| QR codes | The developer confirmed the poster QR opens the app (including from LINE). | — |

## What must happen before real people use accounts (BLOCKED until a human approves)

1. **Privacy and IT review by PMH's authorised staff:**
   - purpose and lawful basis;
   - whether learning activity linked to a maternity clinic counts as sensitive (PDPA s.26);
   - hosting location and cross-border transfer (s.28/29);
   - retention, deletion and recovery;
   - caregiver and minor accounts;
   - the staff access rules.
2. **Approved hosting and providers.** This means the database, auth, email sending and SMS sender, each with a
   cost owner (see docs/ACCOUNTS-HOSTING.md).
3. **Review of the Thai privacy notice text,** which is drafted in the app and marked for PMH review.
4. **A named first administrator,** set up by someone with database access (docs/ACCOUNTS-ADMIN-GUIDE.md).

Until then, accounts are switched off in the public build: it has no Supabase settings, so no sign-in appears.
Development uses only a local database and fictional people.
