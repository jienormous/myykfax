# Myykfax

A mobile-first webapp for Myyk's birthday party. Guests submit and receive fun facts ("Myykfacts") through an 8-bit fax machine interface, then play a live attribution guessing game.

See [SPEC.md](SPEC.md) for the full design and [UI_MOCKUPS.md](UI_MOCKUPS.md) for screen mocks.

## Stack

Bun • Hono • SQLite (`bun:sqlite`, persistent volume) • React + Vite • SSE for real-time fan-out • Deployed on Railway.

## Layout

```
client/   React + Vite frontend (built into server/public/)
server/   Hono API + SSE + static file server
```

## Local development

Install once:

```sh
cd client && bun install
cd ../server && bun install
```

Run the two dev servers in separate terminals:

```sh
bun run dev:server   # http://localhost:3000  (API + SSE)
bun run dev:client   # http://localhost:5173  (Vite, proxies /api → :3000)
```

Or run a single production-style server (build client, serve from Hono):

```sh
bun run build
bun run start
```

## Configuration

| Env var | Default | Notes |
|---|---|---|
| `PORT` | `3000` | HTTP port |
| `DB_PATH` | `./myykfax.db` | SQLite file path. Set to `/data/myykfax.db` in prod for the Railway volume. |
| `ADMIN_PASSWORD` | `changeme` | Required header `x-admin-password` for `/admin` routes. **Set this in prod.** |

## Routes

- `/` — guest UI (nickname gate → phase view)
- `/admin` — password-gated admin terminal: phase control, fact seeding, broadcast, reveal, export

## Phases

- **0** Pre-party — admin pre-seeds facts.
- **1** Submission — guests submit Myykfacts and receive random ones via "fax broadcast".
- **2** Guessing — admin reveals one fact at a time; guests guess the submitter; live leaderboard via SSE. When the last fact has been revealed, all clients see a "Quiz Over" screen.

## Admin export

The admin terminal has a **Download All Myykfaxes** button at the bottom that saves a `.txt` snapshot containing every fact, its author, and the final leaderboard. Useful as a keepsake after the party.

## Deploy

Railway auto-builds from the Dockerfile. The volume is mounted at `/data` (see `railway.toml`); `DB_PATH=/data/myykfax.db` keeps SQLite on the persistent volume across deploys.

```sh
railway up
```
