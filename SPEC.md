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

### Phase 1 — Submission
- Guests land on the app, type a nickname to join
- Guests submit Myykfacts through the fax interface
- Guests receive random Myykfacts back (see open question below)
- All fact submissions fan out in real-time via SSE

### Phase 2 — Guessing game
- Manually triggered by admin
- One fact is shown at a time (admin controls progression)
- All guests see the same fact simultaneously (SSE push)
- Guests pick from the list of nicknames who they think submitted it
- Live scoring leaderboard updates in real-time after each guess
- At the end: dramatic reveal of who wrote each fact

---

## Admin UI

- Hidden behind a simple hardcoded password
- Controls:
  - Pre-seed facts (Phase 0)
  - Trigger Phase 1 → Phase 2 transition
  - Advance to next fact (Phase 2)
  - View all submitted facts + submitters

---

## Data Model

```sql
guests       (id, nickname, joined_at)
facts        (id, text, submitted_by → guests.id, created_at, is_preseeded)
game_state   (phase, current_fact_id)   -- single row, always exists
guesses      (id, guesser_id → guests.id, fact_id → facts.id,
              guessed_submitter_id → guests.id, submitted_at, is_correct)
```

---

## Real-time SSE Events

| Event | When | Payload |
|---|---|---|
| `phase_change` | Admin changes phase | `{ phase }` |
| `fact_received` | Guest receives a random fax | `{ fact }` |
| `fact_revealed` | Phase 2: new fact shown | `{ fact_id, text }` |
| `leaderboard_update` | After any guess | `{ scores: [{ nickname, score }] }` |

---

## Open Questions

- [ ] **Scoring**: Flat (1pt per correct guess) or speed bonus (3pt first correct, 1pt others)?
- [ ] **Pre-seeded facts in Phase 2**: Excluded from guessing, or included as "???" submitter?
- [ ] **Phase 1 receive mechanic**: On submit (you get one back), periodic broadcast to everyone, or both?

---

## UX / Aesthetic

- Mobile-first
- 8-bit / pixel art fax machine theme
- "Sending fax" animation on submit
- "Fax printing" animation on receive
- Retro terminal / dot-matrix font feel
