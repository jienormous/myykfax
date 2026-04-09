import { Hono } from "hono";
import { createMiddleware } from "hono/factory";
import { db, queries } from "../db";
import { broadcast } from "../sse";

export const adminRouter = new Hono();

const auth = createMiddleware(async (c, next) => {
  const password = c.req.header("x-admin-password");
  if (password !== (process.env.ADMIN_PASSWORD ?? "changeme")) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  await next();
});

adminRouter.use("/*", auth);

// Pre-seed a fact
adminRouter.post("/facts", async (c) => {
  const { text, authorName } = await c.req.json<{ text: string; authorName?: string | null }>();
  if (!text?.trim()) return c.json({ error: "Text required" }, 400);

  let submittedBy: number | null = null;
  if (authorName?.trim()) {
    // Upsert guest by name
    db.query("INSERT OR IGNORE INTO guests (nickname) VALUES (?)").run(authorName.trim().slice(0, 32));
    const guest = db.query<{ id: number }, [string]>("SELECT id FROM guests WHERE nickname = ? COLLATE NOCASE").get(authorName.trim());
    submittedBy = guest?.id ?? null;
  }

  const result = db
    .query<{ id: number }, [string, number | null]>(
      "INSERT INTO facts (text, submitted_by, is_preseeded) VALUES (?, ?, 1) RETURNING id"
    )
    .get(text.trim().slice(0, 280), submittedBy);

  return c.json({ id: result!.id });
});

// List all facts with submitter info
adminRouter.get("/facts", (c) => {
  const facts = db
    .query(`
      SELECT f.id, f.text, f.is_preseeded, f.is_revealed, f.created_at,
             g.nickname as submitter_nickname
      FROM facts f
      LEFT JOIN guests g ON g.id = f.submitted_by
      ORDER BY f.created_at DESC
    `)
    .all();
  return c.json(facts);
});

// Delete a fact
adminRouter.delete("/facts/:id", (c) => {
  const id = Number(c.req.param("id"));
  db.query("DELETE FROM guesses WHERE fact_id = ?").run(id);
  db.query("UPDATE game_state SET current_fact_id = NULL WHERE current_fact_id = ?").run(id);
  db.query("DELETE FROM facts WHERE id = ?").run(id);
  return c.json({ ok: true });
});

// Broadcast a random fact to all guests
adminRouter.post("/broadcast", (c) => {
  const fact = queries.getRandomFact.get();
  if (!fact) return c.json({ error: "No facts to broadcast" }, 404);

  broadcast("fax_broadcast", { fact: { id: fact.id, text: fact.text } });
  return c.json({ broadcast: { id: fact.id, text: fact.text } });
});

// Change phase
adminRouter.post("/phase", async (c) => {
  const { phase } = await c.req.json<{ phase: "0" | "1" | "2" }>();
  if (!["0", "1", "2"].includes(phase)) return c.json({ error: "Invalid phase" }, 400);

  db.query("UPDATE game_state SET phase = ? WHERE id = 1").run(phase);
  broadcast("phase_change", { phase });
  return c.json({ phase });
});

// Reveal next fact (Phase 2)
adminRouter.post("/reveal", (c) => {
  const state = db.query("SELECT phase FROM game_state WHERE id = 1").get() as { phase: string };
  if (state.phase !== "2") return c.json({ error: "Not in Phase 2" }, 403);

  const fact = queries.getNextUnrevealedFact.get();
  if (!fact) return c.json({ error: "No more facts to reveal" }, 404);

  db.query("UPDATE facts SET is_revealed = 1 WHERE id = ?").run(fact.id);
  db.query("UPDATE game_state SET current_fact_id = ? WHERE id = 1").run(fact.id);

  const submitterNickname = fact.submitted_by
    ? (db.query<{ nickname: string }, [number]>("SELECT nickname FROM guests WHERE id = ?").get(fact.submitted_by)?.nickname ?? "???")
    : "???";

  broadcast("fact_revealed", {
    fact: { id: fact.id, text: fact.text },
    // submitter withheld from broadcast — only revealed at end
  });

  // Return submitter to admin only
  return c.json({ fact: { id: fact.id, text: fact.text, submitter: submitterNickname } });
});

// Get full game state summary
adminRouter.get("/state", (c) => {
  return c.json({
    gameState: queries.getGameState.get(),
    scores: queries.getScores.all(),
    guests: queries.getGuests.all(),
    guestCount: (db.query("SELECT COUNT(*) as n FROM guests").get() as { n: number }).n,
    factCount: (db.query("SELECT COUNT(*) as n FROM facts").get() as { n: number }).n,
  });
});
