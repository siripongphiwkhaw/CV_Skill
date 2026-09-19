# Job Fit CV

A web app that takes one job posting and walks you from "here is my CV" to "here is a CV built for this job, and here is whether I actually want it" — in six steps, with **no API key**. Every AI step is a *prompt exchange*: the app writes the prompt, you paste it into any Claude chat (claude.ai, Claude Code, the desktop app), paste the JSON reply back, and the app validates it before anything is applied.

Built with Next.js (App Router). Each user has an account (email + password); your CV, profile and job session are saved to a Postgres database and follow you across devices, with a fast `localStorage` cache for offline/instant reads.

## Quick start

```bash
cp .env.example .env   # fill in DATABASE_URL and AUTH_SECRET
npm install
npm run db:push        # create tables from prisma/schema.prisma
npm run dev             # http://localhost:3000
```

## The six steps

| # | Step | What happens | Prompt exchange |
|---|------|--------------|-----------------|
| 1 | **Profile** | Paste your CV → it becomes a structured document → a skill list you rate (level 1–5, years) → up to 5 follow-up questions about skills your CV implies but doesn't state | `import-cv`, `extract-skills` |
| 2 | **Job** | Paste the posting (title and company optional) | — |
| 3 | **Compare** | Requirements split into must-have / nice-to-have, each **covered**, **partial** (you have an equivalent skill) or **missing**, with what to learn and one clarifying question per gap. Industry-standard expectations the posting didn't mention are listed separately and never scored | `job-fit` |
| 4 | **Update** | Answer each gap's question in your own words → a bullet is drafted from the answer → you pick the role it goes under and press Accept. Or add the skill straight to your Skills section. Nothing lands without an Accept | `draft-bullet` |
| 5 | **Build** | The CV is reordered and reworded for this job — same facts only — with a change list. Edit bullets in place, then **Export PDF** (browser print-to-PDF, text stays selectable) | `build-cv` |
| 6 | **Interview** | 6–8 likely questions with hints from your CV, three "a week in this job" scenarios, three honest self-check prompts | `interview-prep` |

## How a prompt exchange works

1. **Copy prompt** — the app assembles instructions, the JSON Schema of the expected reply, and your data.
2. Paste it into any Claude chat and copy the JSON it returns.
3. **Paste the JSON reply** → **Validate & apply**. The reply is checked against the same Zod schema; fences and surrounding prose are stripped automatically; anything that doesn't fit is rejected with a readable error and nothing changes.

The prompts live in `src/exchanges/`, one file per step, each exporting `{ id, title, schema, buildPrompt }`.

## The match %

Computed locally in `src/lib/score.ts`, never by the model: must-have requirements weigh 3, nice-to-have 1; covered = 1, partial = ½, missing = 0. A gap you close in step 4 counts as covered. Bands: ≥ 85 strong, ≥ 60 fair, otherwise weak. There is no hard gate — a warning shows when under half the must-haves are covered.

## No-fabrication policy

Every prompt carries the same hard rule: never invent employers, titles, dates, tools, projects or numbers. Where a bullet would be stronger with a fact you haven't given, the model leaves a bracketed placeholder such as `[add number]` for you to fill. Skill evidence is quoted verbatim from your CV; interview hints must point at real CV content or a named gap.

## Data

Sign in required. Each account (`User` row in Postgres, see `prisma/schema.prisma`) holds three JSON columns, mirrored into `localStorage` as a cache (guarded — corrupt or blocked storage reads as "nothing saved"):

- `cv` — your structured CV
- `profile` — skills, ratings, survey answers
- `session` — the current job: posting, comparison, accepted gaps, tailored CV, interview pack, and which step you're on (a reload lands you back there)

Changes save to `localStorage` immediately and sync to the database on a 600ms debounce (`PUT /api/state`). Auth is `next-auth` (Credentials provider, JWT sessions, bcrypt-hashed passwords) — see `src/auth.ts` / `src/auth.config.ts`. Route access is enforced in `src/proxy.ts`.

"Start another job" resets only the session.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Next.js dev server |
| `npm run build` | Production build (`next build`) |
| `npm start` | Run the production build |
| `npm test` | Vitest — scoring, storage, reply parsing, prompt building |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run db:push` | Push `prisma/schema.prisma` to the database (no migration history) |
| `npm run db:migrate` | Create/apply a Prisma migration |

## Design

The workspace follows the visual language of a job-board profile page (white top bar, grey page, bordered white cards, pink primary actions, pill status chips); tokens are in `src/styles/tokens.css`.

Interaction details come from [React Bits](https://reactbits.dev) (MIT + Commons Clause), vendored under `src/reactbits/` and themed through their props: **Count Up** (match rings, rail %, the "53 % → 79 %" chip), **Rubber Segment** (the 1–5 skill level), **Status Mark** (completed-step checks in the rail), **Fuse Button** (Accept / "I have this" — the action applies immediately and carries a four-second Undo that really removes the bullet or skill again), **Jelly Radio** (the self-check answers), **Hold Button** (hold-to-confirm on Discard and Start another job). Requirement rows cascade in with a small `motion` wrapper (`src/components/motion.tsx`). Everything respects `prefers-reduced-motion`. The CV itself (`src/cv/CvDocument.tsx`, `src/styles/cv.css`) is a Harvard-style single column with no tables or icons so ATS parsers keep the reading order; `print.css` hides everything else when exporting. The design preview that this was built from is a Claude artifact: https://claude.ai/artifact/RhMXZmMuijWcdxt1mVVFQq
