# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

LeaveEasy — a leave-request web app built for the ADT-RAISE Non-Degree Batch 2, Module 2 course. Plain HTML/CSS/JS, no framework, no build step. This repo (`inthiporn/leaveeasy-start`) is a **fork of `cnacha-mfu/leaveeasy-start`** (the shared course template) — when creating a PR or comparing branches, GitHub defaults the base to the upstream `cnacha-mfu` repo, not this fork's own `main`. Always double check the base repo before opening a PR; this repo almost never needs a PR to upstream — commits just go to this fork's own `main`.

`leaveeasy-spec.md` is the authoritative spec (field names, Firestore collection names, Thai status values, business rules, and the week-by-week scope). Read it before making any data-model change — it explicitly says not to add unspecified features or do a later week's work early.

## Running it

There is no build step, but pages that touch Firestore use ES modules (`<script type="module">`), which browsers refuse to load over `file://`. Those pages must be served over HTTP:

```bash
powershell -ExecutionPolicy Bypass -File serve.ps1
```

This starts a dependency-free static file server (plain `System.Net.HttpListener`, no Node/Python required) on `http://localhost:3001`. It exists because this machine has no Node.js/Python installed; `package.json`'s `npm run dev` (`serve -l 3000 .`) is the equivalent if Node is available elsewhere. Pages that don't touch Firestore (`index.html`, `new-leave-request.html`, `leave-request-detail.html`, `leave-types.html`) still work fine opened directly via `file://`.

No test framework, linter, or build/CI config exists in this repo.

## Architecture

**Data flow is split by page, not unified** — this is the single most important thing to understand before touching any page:

- `js/data.js` defines a global `window.LEAVE_DATA` object (`users`, `leaveTypes`, `leaveRequests`, `approvals`) loaded via a plain classic `<script>`. Every page except `leave-requests.html` still reads/writes this in-memory mock data directly — `new-leave-request.js` stages new requests into `sessionStorage` instead of mutating it, `leave-types.js` does full CRUD but only against a local copy (`.slice()`), and `leave-request-detail.js` mutates the in-memory object directly for status changes/comments. None of this persists past a page reload except via `sessionStorage`.
- `leave-requests.html`/`js/leave-requests.js` is the one page connected to Firestore: it's a `type="module"` script that imports `js/firebaseConfig.js` and reads the `leaveRequests` collection with `getDocs`. It still merges in anything staged in `sessionStorage` (new requests aren't written to Firestore yet) and still supports `?status=` filtering.
- `js/firebaseConfig.js` initializes the Firebase app (`leaveeasy-inthiporn` project) and exports `db`. The apiKey is a public Firebase web-app identifier (not a secret) — real access control is Firestore Security Rules, not yet locked down since there's no login (Firebase Auth is a later-week addition per the spec).
- `dev-seed.html` is a one-time dev tool (not part of the app's nav) that copies `window.LEAVE_DATA` into Firestore (`users`, `leaveTypes`, `leaveRequests`, and `approvals` as a **subcollection** of each `leaveRequests` doc) using `setDoc` with the same ids as `data.js`, so re-running it is idempotent. Run it after adding/editing anything in `data.js` that should also exist in Firestore.

**Why only one page reads from Firestore**: the spec's week-by-week rollout (`leaveeasy-spec.md` §8) currently scopes this repo to Firestore *read* only for the leave-requests list. Create/update/delete against Firestore (new requests, approve/reject, comments, leave-type management) are intentionally still mocked — that's a later week's scope, not a bug to fix.

**Firestore field-name discipline**: `leaveeasy-spec.md` warns explicitly that field-name casing must match Firestore exactly everywhere (`status` vs `Status` would silently break things) — `js/data.js`'s field names are already spelled to match. `leaveRequests`/`leaveTypes`/`approvals` are denormalized (e.g. `requesterName` duplicated alongside `requesterId`) because Firestore has no JOIN; this is intentional, not a normalization bug to fix.

**Firestore collections** (all camelCase, no underscores — per the spec):
- `users` — `{ name, email, role }`, `role` ∈ `employee | manager | hr`
- `leaveTypes` — `{ name }`
- `leaveRequests` — see fields in `js/data.js`; each doc has an `approvals` **subcollection**: `leaveRequests/{id}/approvals/{id}` — `{ authorId, authorName, message, createdAt }`

**Leave request status** (`leaveRequests.status`) is one of exactly 3 Thai string values, forward-only:

```
รอพิจารณา  →  อนุมัติ
           └→ ไม่อนุมัติ
```

New requests always start at `รอพิจารณา`; only `manager`/`hr` may change it (not enforced yet — no login until a later week); once set to `อนุมัติ`/`ไม่อนุมัติ` it's terminal (no reverting); a status update must only ever write the `status` field, never overwrite the rest of the document; setting `ไม่อนุมัติ` requires at least one existing `approvals` comment first.

**Shared conventions across `js/*.js`**: variable/function names are Thai (only the Firestore/data-model field names are English, per the spec); `js/util.js` provides `esc()` (HTML-escape), `ป้ายสถานะ()` (status badge), `เวลาตอนนี้()` (timestamp), `ค่าจากURL()` (query param) as globals used by every page; `js/nav.js` renders the shared nav bar and defines `showConfigWarning()`, the established pattern for surfacing a Firebase/Firestore error banner on a page (used by `leave-requests.js` when `getDocs` fails).

## Never commit real keys/secrets

The Firebase Web SDK `apiKey` in `js/firebaseConfig.js` is a **public client identifier, not a secret** — Firebase's own docs say it's safe to expose, since real access control is Firestore Security Rules, not the key. It is fine as-is in a pushed file.

What must **never** go into a file that gets committed/pushed: a Firebase **service account JSON** (Admin SDK credentials), any server-side/admin API key, or credentials for any other third-party service. Those grant privileged access that bypasses Security Rules entirely. If a future task needs one, it belongs in a local, gitignored file (or an environment variable) — flag it to the user rather than hardcoding it.
