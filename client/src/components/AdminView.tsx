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
  const [newFactAuthor, setNewFactAuthor] = useState("");
  const [lastBroadcast, setLastBroadcast] = useState<string | null>(null);
  const [lastRevealed, setLastRevealed] = useState<{ text: string; submitter: string } | null>(null);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    try {
      await api.admin.getState(password);
      setAuthed(true); setAuthError(false);
    } catch { setAuthError(true); }
  }

  async function refresh() {
    const [s, f] = await Promise.all([api.admin.getState(password), api.admin.getFacts(password)]);
    setState(s); setFacts(f);
  }

  useEffect(() => { if (authed) refresh(); }, [authed]);

  async function seedFact() {
    if (!newFactText.trim()) return;
    await api.admin.seedFact(newFactText.trim(), password, newFactAuthor.trim() || null);
    setNewFactText(""); setNewFactAuthor(""); refresh();
  }

  async function broadcast() {
    const result = await api.admin.broadcast(password);
    setLastBroadcast(result.broadcast.text);
    setTimeout(() => setLastBroadcast(null), 4000);
  }

  async function revealNext() {
    const result = await api.admin.revealNext(password);
    setLastRevealed(result.fact); refresh();
  }

  if (!authed) {
    return (
      <div className="app">
        <Masthead sub="Admin Terminal" />
        <div className="app-body">
          <div className="paper-card">
            <p className="section-label">Authentication required</p>
            <form onSubmit={handleLogin}>
              <input className="field" type="password" value={password}
                onChange={(e) => setPassword(e.target.value)} placeholder="password" autoFocus />
              <button className="btn btn--full" type="submit">Enter</button>
            </form>
            {authError && <p style={{ marginTop: "0.5rem", color: "#7a3030", fontSize: "0.82rem" }}>Access denied.</p>}
          </div>
        </div>
      </div>
    );
  }

  const phase = state?.gameState?.phase ?? "?";

  return (
    <div className="app">
      <Masthead sub="Admin Terminal" />
      <div className="app-body">
        <div className="paper-card" style={{ marginBottom: "1rem" }}>
          <div className="status-row">
            <span>Phase: <strong>{phase}</strong></span>
            <span>Guests: <strong>{state?.guestCount ?? "—"}</strong></span>
            <span>Facts: <strong>{state?.factCount ?? "—"}</strong></span>
          </div>
        </div>

        <p className="section-label">Phase control</p>
        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.25rem" }}>
          {(["0", "1", "2"] as const).map((p) => (
            <button key={p} className="btn" disabled={phase === p}
              onClick={() => api.admin.setPhase(p, password).then(refresh)} style={{ flex: 1 }}>
              Phase {p}
            </button>
          ))}
        </div>

        {phase === "1" && (
          <>
            <p className="section-label">Broadcast</p>
            <div style={{ marginBottom: "1.25rem" }}>
              <button className="btn btn--full" onClick={broadcast}>Broadcast Random Fax</button>
              {lastBroadcast && (
                <p style={{ fontSize: "0.78rem", color: "var(--ink-faded)", marginTop: "0.4rem", fontStyle: "italic" }}>
                  Sent: "{lastBroadcast}"
                </p>
              )}
            </div>
          </>
        )}

        {phase === "2" && (
          <>
            <p className="section-label">Reveal next fact</p>
            <div style={{ marginBottom: "1.25rem" }}>
              <button className="btn btn--full" onClick={revealNext}>Reveal Next Fact →</button>
              {lastRevealed && (
                <div className="paper-card" style={{ marginTop: "0.5rem", fontSize: "0.82rem" }}>
                  <p>"{lastRevealed.text}"</p>
                  <p className="meta">submitted by {lastRevealed.submitter}</p>
                </div>
              )}
            </div>
          </>
        )}

        {state?.scores?.length > 0 && (
          <>
            <p className="section-label">Scores</p>
            <div className="paper-card" style={{ marginBottom: "1.25rem" }}>
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

        <p className="section-label">Seed a fact</p>
        <div style={{ marginBottom: "1.25rem" }}>
          <textarea className="field" value={newFactText}
            onChange={(e) => setNewFactText(e.target.value)}
            placeholder="Pre-seed a Myykfact..." rows={2} maxLength={280} />
          <div className="char-count">{newFactText.length}/280</div>
          <input className="field" style={{ marginTop: "0.5rem" }}
            value={newFactAuthor}
            onChange={(e) => setNewFactAuthor(e.target.value)}
            placeholder="author name"
            maxLength={32}
            autoComplete="off"
          />
          <button className="btn btn--full" onClick={seedFact} disabled={!newFactText.trim()}>
            Add Seeded Fact
          </button>
        </div>

        <p className="section-label">All facts ({facts.length})</p>
        <div className="paper-card">
          {facts.length === 0 && <p style={{ color: "var(--ink-faded)", fontSize: "0.82rem" }}>No facts yet.</p>}
          {facts.map((f) => (
            <div key={f.id} className="admin-fact-row" style={f.is_revealed ? { opacity: 0.45 } : undefined}>
              <span className="tag">[{f.is_preseeded ? "seed" : f.submitter_nickname ?? "?"}]</span>
              <span className="text">{f.text}</span>
              {f.is_revealed ? <span style={{ fontSize: "0.62rem", color: "#1e5a1e", whiteSpace: "nowrap" }}>revealed ✓</span> : null}
              <button className="btn btn--small btn--danger"
                onClick={() => api.admin.deleteFact(f.id, password).then(refresh)}>✕</button>
            </div>
          ))}
        </div>

        <div style={{ marginTop: "1rem", display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          <button className="btn btn--small" onClick={refresh}>↻ Refresh</button>
        </div>

        <hr className="divider" style={{ marginTop: "1.5rem" }} />

        <p className="section-label">Export</p>
        <button className="btn btn--full" onClick={() => api.admin.exportAll(password)}>
          ⬇ Download All Myykfaxes
        </button>
        <p style={{ fontSize: "0.72rem", color: "var(--ink-faded)", marginTop: "0.4rem", fontStyle: "italic" }}>
          Saves a .txt file with every fact, its author, and the final leaderboard.
        </p>
      </div>
    </div>
  );
}
