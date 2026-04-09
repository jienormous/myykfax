import { Hono } from "hono";
import { serveStatic } from "hono/bun";
import { guestsRouter } from "./routes/guests";
import { factsRouter } from "./routes/facts";
import { guessesRouter } from "./routes/guesses";
import { adminRouter } from "./routes/admin";
import { sseRouter } from "./routes/sse";

const app = new Hono();

app.route("/api/guests", guestsRouter);
app.route("/api/facts", factsRouter);
app.route("/api/guesses", guessesRouter);
app.route("/api/admin", adminRouter);
app.route("/api/sse", sseRouter);

app.get("/api/health", (c) => c.json({ ok: true }));

// Serve built client
const publicDir = import.meta.dir + "/public";
app.use("/*", serveStatic({ root: publicDir }));
app.get("/*", async (c) => {
  const html = await Bun.file(publicDir + "/index.html").text();
  return c.html(html);
});

const port = Number(process.env.PORT ?? 3000);
console.log(`Myykfax running on http://localhost:${port}`);

export default { port, fetch: app.fetch };
