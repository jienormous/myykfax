import { Hono } from "hono";
import { db } from "../db";

export const factsRouter = new Hono();

// Submit a fact (Phase 1 guests)
factsRouter.post("/", async (c) => {
  const { text, guestId } = await c.req.json<{ text: string; guestId: number }>();

  if (!text?.trim()) return c.json({ error: "Fact text is required" }, 400);
  if (!guestId) return c.json({ error: "Guest ID is required" }, 400);

  const state = db.query("SELECT phase FROM game_state WHERE id = 1").get() as { phase: string };
  if (state.phase !== "1") return c.json({ error: "Submissions are closed" }, 403);

  const guest = db.query("SELECT id FROM guests WHERE id = ?").get(guestId);
  if (!guest) return c.json({ error: "Unknown guest" }, 400);

  const result = db
    .query<{ id: number }, [string, number]>(
      "INSERT INTO facts (text, submitted_by) VALUES (?, ?) RETURNING id"
    )
    .get(text.trim().slice(0, 280), guestId);

  return c.json({ id: result!.id });
});

// List facts — no submitter info exposed to guests
factsRouter.get("/", (c) => {
  const facts = db
    .query("SELECT id, text, created_at FROM facts ORDER BY created_at DESC")
    .all();
  return c.json(facts);
});
