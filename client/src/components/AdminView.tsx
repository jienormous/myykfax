import { useEffect, useState } from "react";
import { Masthead } from "./Masthead";
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

  useEffect(() => { if (authed) refresh(); }, [authed]);

  async function seedFact() {
    if (!newFactText.trim()) return;
    await api.admin.seedFact(newFactText.trim(), password);
    setNewFactText("");
    refresh();
  }

  async function broadcast() {
    const result = await api.admin.broadcast(password);
    setLastBroadcast(result.broadcast.text);
    setTimeout(() => setLastBroadcast(null), 4000);
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
      <div className="app">
        <Masthead sub="Admin Terminal" />
        <div className="paper-card">
          <p className="section-label">Authentication required</p>
          <form onSubmit={handleLogin}>
            <input
              className="field"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="password"
              autoFocus
            />
            <button className="btn btn--full" type="submit">ENTER</button>
          </form>
          {authError && <p style={{ marginTop: "0.5rem", color: "#a04040", fontSize: "0.82rem" }}>Access denied.</p>}
        </div>
      </div>
    );
  }

  const phase = state?.gameState?.phase ?? "?";

  return (
    <div className="app">
      <Masthead sub="Admin Terminal" />

      {/* Status */}
      <div className="paper-card" style={{ marginBottom: "1rem" }}>
        <div className="status-row">
          <span>Phase: <strong>{phase}</strong></span>
          <span>Guests: <strong>{state?.guestCount ?? "—"}</strong></span>
          <span>Facts: <strong>{state?.factCount ?? "—"}</strong></span>
        </div>
      </div>

      {/* Phase control */}
      <p className="section-label">Phase control</p>
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
        {(["0", "1", "2"] as const).map((p) => (
          <button key={p} className="btn" disabled={phase === p} onClick={() => setPhase(p)}
            style={{ flex: 1 }}>
            Phase {p}
          </button>
        ))}
      </div>

      {/* Broadcast */}
      {phase === "1" && (
        <>
          <p className="section-label">Broadcast</p>
          <div style={{ marginBottom: "1rem" }}>
            <button className="btn btn--full" onClick={broadcast}>
              Broadcast Random Fax
            </button>
            {lastBroadcast && (
              <p style={{ fontSize: "0.78rem", color: "var(--ink-faded)", marginTop: "0.4rem", fontStyle: "italic" }}>
                Sent: "{lastBroadcast}"
              </p>
            )}
          </div>
        </>
      )}

      {/* Reveal */}
      {phase === "2" && (
        <>
          <p className="section-label">Reveal next fact</p>
          <div style={{ marginBottom: "1rem" }}>
            <button className="btn btn--full" onClick={revealNext}>
              Reveal Next Fact →
            </button>
            {lastRevealed && (
              <div className="paper-card" style={{ marginTop: "0.5rem", fontSize: "0.82rem" }}>
                <p>"{lastRevealed.text}"</p>
                <p className="meta">submitted by {lastRevealed.submitter}</p>
              </div>
            )}
          </div>
        </>
      )}

      {/* Scores */}
      {state?.scores?.length > 0 && (
        <>
          <p className="section-label">Scores</p>
          <div className="paper-card" style={{ marginBottom: "1rem" }}>
            {state.scores.map((s: any, i: number) => (
              <div key={s.nickname} className="leaderboard-row">
                <span><span className="rank">{i + 1}.</span>{s.nickname}</span>
                <span className="score">{s.score}</span>
              </div>
            ))}
          </div>
        </>
      )}

      <hr className="divider" />

      {/* Seed fact */}
      <p className="section-label">Seed a fact</p>
      <div style={{ marginBottom: "1.25rem" }}>
        <textarea
          className="field"
          value={newFactText}
          onChange={(e) => setNewFactText(e.target.value)}
          placeholder="Pre-seed a Myykfact..."
          rows={2}
          maxLength={280}
        />
        <div className="char-count">{newFactText.length}/280</div>
        <button className="btn btn--full" onClick={seedFact} disabled={!newFactText.trim()}>
          Add Seeded Fact
        </button>
      </div>

      {/* Facts list */}
      <p className="section-label">All facts ({facts.length})</p>
      <div className="paper-card">
        {facts.length === 0 && <p style={{ color: "var(--ink-faded)", fontSize: "0.82rem" }}>No facts yet.</p>}
        {facts.map((f) => (
          <div key={f.id} className="admin-fact-row">
            <span className="tag">[{f.is_preseeded ? "seed" : f.submitter_nickname ?? "?"}]{f.is_revealed ? "✓" : ""}</span>
            <span className="text">{f.text}</span>
            <button className="btn btn--small btn--danger" onClick={() => deleteFact(f.id)}>✕</button>
          </div>
        ))}
      </div>

      <div style={{ marginTop: "1rem" }}>
        <button className="btn btn--small" onClick={refresh}>↻ Refresh</button>
      </div>
    </div>
  );
}
