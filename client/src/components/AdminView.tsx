import { useEffect, useState } from "react";
import { api } from "../api";

export function AdminView() {
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [authError, setAuthError] = useState(false);

  const [state, setState] = useState<any>(null);
  const [facts, setFacts] = useState<any[]>([]);
  const [newFactText, setNewFactText] = useState("");
  const [lastBroadcast, setLastBroadcast] = useState<string | null>(null);
  const [lastRevealed, setLastRevealed] = useState<{ text: string; submitter: string } | null>(null);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    try {
      await api.admin.getState(password);
      setAuthed(true);
      setAuthError(false);
    } catch {
      setAuthError(true);
    }
  }

  async function refresh() {
    const [s, f] = await Promise.all([
      api.admin.getState(password),
      api.admin.getFacts(password),
    ]);
    setState(s);
    setFacts(f);
  }

  useEffect(() => {
    if (authed) refresh();
  }, [authed]);

  async function seedFact() {
    if (!newFactText.trim()) return;
    await api.admin.seedFact(newFactText.trim(), password);
    setNewFactText("");
    refresh();
  }

  async function broadcast() {
    const result = await api.admin.broadcast(password);
    setLastBroadcast(result.broadcast.text);
  }

  async function setPhase(phase: "0" | "1" | "2") {
    await api.admin.setPhase(phase, password);
    refresh();
  }

  async function revealNext() {
    const result = await api.admin.revealNext(password);
    setLastRevealed(result.fact);
    refresh();
  }

  async function deleteFact(id: number) {
    await api.admin.deleteFact(id, password);
    refresh();
  }

  if (!authed) {
    return (
      <div>
        <h1>MYYKFAX ADMIN</h1>
        <form onSubmit={handleLogin}>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="admin password"
            autoFocus
          />
          <button type="submit">ENTER</button>
        </form>
        {authError && <p>Wrong password.</p>}
      </div>
    );
  }

  const currentPhase = state?.gameState?.phase ?? "?";

  return (
    <div>
      <h1>MYYKFAX ADMIN</h1>
      <button onClick={refresh}>Refresh</button>

      <section>
        <h2>Status</h2>
        <p>Phase: {currentPhase} | Guests: {state?.guestCount} | Facts: {state?.factCount}</p>
      </section>

      <section>
        <h2>Phase Control</h2>
        <button onClick={() => setPhase("0")} disabled={currentPhase === "0"}>Phase 0 (Pre-party)</button>
        <button onClick={() => setPhase("1")} disabled={currentPhase === "1"}>Phase 1 (Submission)</button>
        <button onClick={() => setPhase("2")} disabled={currentPhase === "2"}>Phase 2 (Guessing)</button>
      </section>

      {currentPhase === "1" && (
        <section>
          <h2>Broadcast</h2>
          <button onClick={broadcast}>Broadcast Random Fax</button>
          {lastBroadcast && <p>Sent: "{lastBroadcast}"</p>}
        </section>
      )}

      {currentPhase === "2" && (
        <section>
          <h2>Reveal</h2>
          <button onClick={revealNext}>Reveal Next Fact</button>
          {lastRevealed && (
            <p>
              Revealed: "{lastRevealed.text}" — submitted by {lastRevealed.submitter}
            </p>
          )}
        </section>
      )}

      <section>
        <h2>Seed a Fact</h2>
        <textarea
          value={newFactText}
          onChange={(e) => setNewFactText(e.target.value)}
          placeholder="Pre-seed a Myykfact..."
          rows={2}
          maxLength={280}
        />
        <button onClick={seedFact} disabled={!newFactText.trim()}>Add Fact</button>
      </section>

      <section>
        <h2>All Facts ({facts.length})</h2>
        <ul>
          {facts.map((f) => (
            <li key={f.id}>
              [{f.is_preseeded ? "seed" : f.submitter_nickname ?? "?"}]
              {f.is_revealed ? " ✓" : ""} {f.text}
              <button onClick={() => deleteFact(f.id)}>Delete</button>
            </li>
          ))}
        </ul>
      </section>

      {state?.scores?.length > 0 && (
        <section>
          <h2>Scores</h2>
          <ol>
            {state.scores.map((s: any) => (
              <li key={s.nickname}>{s.nickname}: {s.score}</li>
            ))}
          </ol>
        </section>
      )}
    </div>
  );
}
