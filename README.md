<p align="center">
  <img src="public/images/LogoTitle2_VBE.png" alt="VBE Eye Center" width="200">
</p>

# VBE Eye Center — clinic app

**Patient, scheduling and surgery management for the staff of VBE Eye Center.**

> This repository (`blank-slate-project`) is the Lovable-connected mirror of the
> [vbeeyecenter](https://github.com/angelonrevelo/vbeeyecenter) codebase — the
> GitHub endpoint Lovable syncs with.

The app replaces the clinic's earlier FlutterFlow app with a React one. Staff
sign in and work through the day from one place:

- **Dashboard** — patient flow, daily surgeries and workload at a glance.
- **Patients** — search, add and open records; a tabbed eye exam (visual acuity,
  slit lamp, anterior segment, fundus, biometry, diagnosis, treatment plan,
  clearance) with signatures and drawings that save as you go.
- **My tasks, returning patients, status** — intake and follow-up queues.
- **Scheduling and surgery** — appointments and the surgery schedule.
- **SMS** — schedule one-time or recurring text reminders to patients.
- **Settings, audit log, account** — admin tools and your own profile.

## Quick start

Requires Node.js 18+ and a Supabase project.

```bash
npm install
# create .env with the two keys below
npm run dev
```

| command | does |
|---|---|
| `npm run dev` | Vite dev server |
| `npm run build` | typecheck + production build |
| `npm run build:dev` | development-mode build |
| `npm run preview` | serve the production build |
| `npm test` | Vitest, single run |
| `npm run test:watch` | Vitest in watch mode |
| `npm run lint` | ESLint |

## Configuration

App (`.env`):

- `VITE_SUPABASE_URL` — Supabase project URL.
- `VITE_SUPABASE_PUBLISHABLE_KEY` — Supabase publishable (anon) key.

SMS scheduler edge function (set as backend secrets):

- `SEMAPHORE_API_KEY` — Semaphore SMS API key (required to send).
- `SEMAPHORE_SENDER_NAME` — sender name shown on the SMS (optional).
- `SCHEDULER_BATCH_SIZE` — max schedules processed per run (optional).
- `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` — provided to functions by Supabase.

## How it works

```
React app ──► Supabase (auth, Postgres, storage)
                  ▲
cron every 5 min ─┴─► sms-scheduler edge function ──► Semaphore SMS ──► patient
```

React 19, TypeScript, Vite, React Router and Tailwind on the front; Supabase
(through Lovable Cloud) for auth, data and storage. Database changes live in
`supabase/migrations/`; the SMS sender is `supabase/functions/sms-scheduler/`.

## More

- [docs/internals.md](docs/internals.md) — project structure, route table, Lovable sync rules, and the full SMS scheduler setup (cron SQL, client usage)

Private — VBE Eye Center.
