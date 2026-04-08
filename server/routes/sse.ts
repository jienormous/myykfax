import { Hono } from "hono";
import { addClient, removeClient } from "../sse";
import { queries } from "../db";
import { crypto } from "bun";

export const sseRouter = new Hono();

sseRouter.get("/", (c) => {
  const id = crypto.randomUUID();

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const client = { id, controller };
      addClient(client);

      // Send current game state immediately on connect
      const state = queries.getGameState.get();
      const encoder = new TextEncoder();
      controller.enqueue(
        encoder.encode(`event: init\ndata: ${JSON.stringify({ state })}\n\n`)
      );

      c.req.raw.signal.addEventListener("abort", () => {
        removeClient(client);
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
});
