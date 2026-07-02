# 🏁 Kart Hero Cup — Bracket Challenge

A World-Cup-style knockout **bracket prediction game** with a bold,
Mario-Kart-inspired "racing hero" look. Run **multiple tournaments** of
**8/16/32/64 teams**, import teams from a source, let players **join by code or a
general pool**, and climb a weighted leaderboard. An admin runs everything,
tracks members, posts announcements, and assigns YouTube **workout "punishment"
videos** to ranked spots (e.g. "4th from last").

Built on **Next.js (App Router)** and deploys directly to **Cloudflare Workers**
(via OpenNext) with a **Cloudflare D1** database.

---

## Features

- **Any-size brackets** — 8/16/32/64 teams. Rounds and scoring weights scale
  automatically (a 16-team cup keeps R16 ×1 · QF ×2 · SF ×3 · Final ×5).
- **Multiple tournaments** — admin can create, **show/hide**, and **feature** them;
  the public home page has a **tournament switcher**.
- **Import teams** when creating a tournament — **paste a list**, **fetch from a URL**
  (JSON/CSV, SSRF-guarded), or **clone** an existing tournament.
- **Join model** — players **join the general pool** (open) or **join a private
  tournament by code**; the admin **generates/regenerates join codes**. Only members
  can pick and appear on that tournament's leaderboard.
- **Google sign-in** (Auth.js). Facebook + X/Twitter are scaffolded for later.
- **Required username** + 50 hero avatars. Real name/email are **admin-only**.
- **Score predictions** with a **"won on penalties"** toggle and shootout-winner pick.
- **Picks deadline** with a live countdown; picks lock at the deadline (or at kickoff).
- **Weighted scoring:** correct winner + exact score + closeness (delta) + penalty bonus,
  all × round weight. See `/rules`.
- **Leaderboard** with medals + assigned punishment videos, plus a **group stats** panel
  (biggest delta scores, win/loss records, average & median points, your rank in group).
- **Announcements** — admin posts to a tournament (shown at the bottom of its page) and can
  **email all members** (via Resend, if configured).
- **Admin HQ** with a pill-toggle: Tournaments, Results, Signups, Punishments, Announce.
- **Haptics + sound** on selects/buttons (with a mute toggle).
- Original artwork — bold sticker-style mascots, some running/playing soccer.

> Today, only the admin (per `ADMIN_EMAILS`) can create tournaments and use the import
> tools; the architecture leaves room to open creation to any user later.

## Tech stack

| | |
|---|---|
| Framework | Next.js 15 (App Router, RSC + Server Actions), TypeScript |
| Hosting | Cloudflare Workers via `@opennextjs/cloudflare` |
| Database | Cloudflare D1 (SQLite) + Drizzle ORM |
| Auth | Auth.js (NextAuth v5) — Google, JWT sessions, Drizzle D1 adapter |
| Styling | Tailwind CSS v4 + custom "Kart Hero" design system |
| Tests | Vitest (unit + a real-SQLite integration test) |

---

## Local development

### 1. Install

```bash
npm install
```

### 2. Secrets

Copy the example env file and fill it in:

```bash
cp .dev.vars.example .dev.vars
```

- `AUTH_SECRET` — `npx auth secret` (or `openssl rand -base64 32`)
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` — from
  [Google Cloud Console → Credentials](https://console.cloud.google.com/apis/credentials).
  Add redirect URI `http://localhost:8788/api/auth/callback/google` (preview) and
  `http://localhost:3000/api/auth/callback/google` (`next dev`).
- `ADMIN_EMAILS` — comma-separated Google emails that get admin access.

### 3. Database (local D1)

```bash
npm run db:generate       # regenerate migrations after schema changes (optional)
npm run db:migrate:local  # apply migrations to the local D1
npm run db:seed:local     # optional: load a demo tournament + 16 teams
```

### 4. Run

```bash
# Fast iteration (Next dev server on :3000)
npm run dev

# Full Cloudflare Workers runtime on :8788 (D1, middleware, worker bundle)
npm run preview
```

### 5. Tests / typecheck

```bash
npm test          # vitest
npm run typecheck # tsc --noEmit
```

---

## Deploy to Cloudflare

1. **Create the D1 database** and copy its id into `wrangler.jsonc`
   (`d1_databases[0].database_id`):

   ```bash
   npx wrangler d1 create kart-hero-db
   ```

2. **Apply migrations** to the remote DB:

   ```bash
   npm run db:migrate:remote
   npm run db:seed:remote   # optional demo data
   ```

3. **Set production secrets** (do NOT commit them):

   ```bash
   npx wrangler secret put AUTH_SECRET
   npx wrangler secret put GOOGLE_CLIENT_ID
   npx wrangler secret put GOOGLE_CLIENT_SECRET
   npx wrangler secret put ADMIN_EMAILS
   npx wrangler secret put AUTH_URL   # your deployed https URL
   # Optional — enables announcement emails (no-op if unset):
   npx wrangler secret put RESEND_API_KEY
   npx wrangler secret put EMAIL_FROM  # e.g. "Kart Hero Cup <noreply@you.com>"
   ```

   Add your deployed callback URL to the Google OAuth app:
   `https://<your-worker-domain>/api/auth/callback/google`.

4. **Deploy:**

   ```bash
   npm run deploy
   ```

---

## Admin workflow

1. Sign in with a Google account listed in `ADMIN_EMAILS`, then open **Admin** in the nav.
2. **Tournament** tab → create the tournament (name + 16 team names + optional picks
   deadline). This builds the fully-wired bracket. Enter results per match; the winner
   auto-advances (penalty-shootout winner counts). Finishing the Final crowns the champion.
3. **Signups** tab → see every player with their real name/email (admin-only) and username.
4. **Punishments** tab → assign a YouTube workout to a spot ("from last" or "from the top");
   it shows as a badge on that player's leaderboard row.

## Adding more login providers later

In `src/auth.ts`, add the provider to the `providers` array (credentials come from
`.dev.vars` / secrets), e.g. `Facebook({ clientId: env.FACEBOOK_CLIENT_ID, ... })`.
No other changes are required.

## Scoring model

Per finalized match, per prediction (then × round weight):

- **Correct winner** (incl. via penalties): 5
- **Exact score**: 5
- **Closeness** (when not exact): `max(0, 3 − total goal error)`
- **Penalty bonus** (called the shootout AND its winner): 2

Round weights: **R16 ×1 · QF ×2 · SF ×3 · Final ×5**. Ties break by most exact
scores, then earliest signup. Logic lives in `src/lib/scoring.ts` (unit-tested).

> Note: recording a result advances the winner into the next round. If you change an
> already-recorded early-round result, re-check downstream matches — only the immediate
> next slot is rewritten automatically.
