import { Hono } from "hono";
import { db, queries } from "../db";
import { broadcast } from "../sse";

export const guessesRouter = new Hono();

guessesRouter.post("/", async (c) => {
  const { guestId, factId, guessedSubmitterId } = await c.req.json<{
    guestId: number;
    factId: number;
    guessedSubmitterId: number | null; // null = guessing "???"
  }>();

  const state = db.query("SELECT phase, current_fact_id FROM game_state WHERE id = 1").get() as {
    phase: string;
    current_fact_id: number | null;
  };

  if (state.phase !== "2") return c.json({ error: "Guessing is not open" }, 403);
  if (state.current_fact_id !== factId) return c.json({ error: "Not the current fact" }, 400);

  const fact = db
    .query<{ submitted_by: number | null }, [number]>(
      "SELECT submitted_by FROM facts WHERE id = ?"
    )
    .get(factId);

  if (!fact) return c.json({ error: "Unknown fact" }, 400);

  const isCorrect = guessedSubmitterId === fact.submitted_by ? 1 : 0;

  try {
    db.query(
      "INSERT INTO guesses (guesser_id, fact_id, guessed_submitter_id, is_correct) VALUES (?, ?, ?, ?)"
    ).run(guestId, factId, guessedSubmitterId, isCorrect);
  } catch {
    return c.json({ error: "Already guessed this fact" }, 409);
  }

  broadcast("leaderboard_update", { scores: queries.getScores.all() });

  return c.json({ correct: isCorrect === 1 });
});
