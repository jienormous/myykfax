import { Hono } from "hono";
import { db, queries } from "../db";
import { broadcast } from "../sse";

export const guestsRouter = new Hono();

guestsRouter.post("/", async (c) => {
  const { nickname } = await c.req.json<{ nickname: string }>();

  if (!nickname?.trim()) {
    return c.json({ error: "Nickname is required" }, 400);
  }

  const trimmed = nickname.trim().slice(0, 32);

  try {
    const result = db
      .query<{ id: number }, [string]>(
        "INSERT INTO guests (nickname) VALUES (?) RETURNING id"
      )
      .get(trimmed);

    broadcast("guest_joined", { nickname: trimmed });
    return c.json({ id: result!.id, nickname: trimmed });
  } catch {
    // Nickname taken — return existing guest
    const existing = db
      .query<{ id: number; nickname: string }, [string]>(
        "SELECT id, nickname FROM guests WHERE nickname = ? COLLATE NOCASE"
      )
      .get(trimmed);

    if (!existing) return c.json({ error: "Failed to join" }, 500);
    return c.json({ id: existing.id, nickname: existing.nickname });
  }
});

guestsRouter.get("/", (c) => {
  return c.json(queries.getGuests.all());
});
