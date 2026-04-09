import { Hono } from "hono";
import { streamSSE } from "hono/streaming";
import { addClient, removeClient } from "../sse";
import { db, queries } from "../db";

export const sseRouter = new Hono();

sseRouter.get("/", (c) => {
  return streamSSE(c, async (stream) => {
    const id = crypto.randomUUID();

    const client = {
      id,
      send: (event: string, data: unknown) =>
        stream.writeSSE({ event, data: JSON.stringify(data) }),
    };

    addClient(client);

    // Send current game state immediately on connect
    const state = queries.getGameState.get();
    const currentFact = state?.current_fact_id
      ? db.query<{ id: number; text: string }, [number]>("SELECT id, text FROM facts WHERE id = ?").get(state.current_fact_id)
      : null;
    await stream.writeSSE({ event: "init", data: JSON.stringify({ state, currentFact }) });

    // Keep open until client disconnects
    await new Promise<void>((resolve) => {
      stream.onAbort(() => {
        removeClient(client);
        resolve();
      });
    });
  });
});
