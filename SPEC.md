# Myykfax — Spec

A mobile-first birthday party webapp. Guests submit and receive fun facts about Myyk through an 8-bit fax machine interface, then play a live attribution guessing game.

---

## Stack

| Layer | Choice |
|---|---|
| Runtime | Bun |
| Backend framework | Hono |
| Database | SQLite via `bun:sqlite` |
| Real-time | Server-Sent Events (SSE) |
| Frontend | React + Vite |
| Deployment | Railway (persistent volume for SQLite) |

---

## Phases

### Phase 0 — Pre-party (admin only)
- Admin logs into password-protected admin UI
- Pre-seeds facts into the compendium before guests arrive
- Pre-seeded facts have no real submitter; shown as "???" in Phase 2

### Phase 1 — Submission
- Guests land on the app, type a nickname to join
- Guests submit Myykfacts through the fax interface (submit = "send a fax")
- Fax broadcasts: admin manually pushes a random fact to all guests' inboxes at will
- Received faxes accumulate in a scrollable inbox (pile of faxes)
- Unread badge on inbox when new faxes arrive

### Phase 2 — Guessing game (admin-triggered)
- Admin manually triggers Phase 1 → Phase 2 transition
- Admin controls progression: one fact revealed at a time
- All guests see the same fact simultaneously (SSE push)
- Guests pick from the nickname list who they think submitted it
  - Pre-seeded facts show "???" as the submitter option (trivially guessable — fun freebie)
- Scoring: **1 point per correct guess** (flat)
- Live leaderboard updates in real-time after each round
- At the end: full reveal of who wrote what

---

## Admin UI

Hidden behind a hardcoded password. Controls:

| Control | When |
|---|---|
| Pre-seed a fact | Phase 0 |
| View all facts + submitters | Any time |
| Broadcast random fax to all guests | Phase 1 |
| Trigger Phase 1 → Phase 2 | When ready |
| Reveal next fact | Phase 2 |

---

## Data Model

```sql
guests       (id, nickname, joined_at)

facts        (id, text, submitted_by → guests.id NULL for preseeded,
              created_at, is_preseeded)

game_state   (id=1, phase TEXT, current_fact_id → facts.id)
             -- single row, always exists, phase ∈ {0, 1, 2}

guesses      (id, guesser_id → guests.id, fact_id → facts.id,
              guessed_submitter_id → guests.id NULL for "???",
              submitted_at, is_correct)
```

---

## Real-time SSE Events

| Event | Triggered by | Payload |
|---|---|---|
| `phase_change` | Admin | `{ phase }` |
| `fax_broadcast` | Admin (manual) | `{ fact: { id, text } }` |
| `fact_revealed` | Admin (Phase 2 advance) | `{ fact: { id, text } }` |
| `leaderboard_update` | Any guess submitted | `{ scores: [{ nickname, score }] }` |
| `guest_joined` | New nickname registered | `{ nickname }` |

---

## UX / Aesthetic

- Mobile-first
- 8-bit / pixel art fax machine theme
- Dot-matrix / retro terminal font
- "Sending fax" animation on submit
- "Fax printing" paper-feed animation when a broadcast arrives
- Inbox: scrollable stack of received faxes, unread badge
- Phase 2: full-screen fact card, nickname picker, live leaderboard below

---

## Decisions Log

- **Scoring**: Flat — 1pt per correct guess
- **Pre-seeded facts**: Included in Phase 2 as "???" submitter (NULL submitted_by)
- **Broadcast trigger**: Admin button — host controls pacing
