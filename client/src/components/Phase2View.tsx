import { useEffect, useState } from "react";
import { Masthead } from "./Masthead";
import { api } from "../api";
import type { Fact, Guest, Score } from "../types";

export function Phase2View({
  guest,
  currentFact,
  scores,
  currentFactId,
}: {
  guest: Guest;
  currentFact: Fact | null;
  scores: Score[];
  currentFactId: number | null;
}) {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [guessed, setGuessed] = useState<Set<number>>(new Set());
  const [lastResult, setLastResult] = useState<boolean | null>(null);

  useEffect(() => {
    api.getGuests().then(setGuests);
  }, []);

  useEffect(() => {
    setLastResult(null);
  }, [currentFactId]);

  async function handleGuess(submitterId: number | null) {
    if (!currentFact || guessed.has(currentFact.id)) return;
    try {
      const { correct } = await api.submitGuess(guest.id, currentFact.id, submitterId);
      setLastResult(correct);
      setGuessed((prev) => new Set(prev).add(currentFact.id));
    } catch {
      // already guessed
    }
  }

  const hasGuessed = currentFact ? guessed.has(currentFact.id) : false;

  return (
    <div className="app">
      <Masthead sub="Who Sent This Fax?" />

      {/* Current fact card */}
      <div className="paper-card" style={{ marginBottom: "1.25rem" }}>
        {currentFact ? (
          <>
            <p className="section-label">Incoming transmission</p>
            <p className="current-fact">{currentFact.text}</p>

            {hasGuessed ? (
              <p className={`guess-result ${lastResult ? "correct" : "wrong"}`}>
                {lastResult ? "CORRECT ✓" : "WRONG ✗"}
              </p>
            ) : (
              <>
                <hr className="divider" style={{ margin: "0.75rem 0" }} />
                <p className="section-label">Sender</p>
                <div className="guess-grid">
                  {guests.map((g) => (
                    <button key={g.id} className="btn" onClick={() => handleGuess(g.id)}>
                      {g.nickname}
                    </button>
                  ))}
                  <button className="btn" onClick={() => handleGuess(null)}>???</button>
                </div>
              </>
            )}
          </>
        ) : (
          <p style={{ textAlign: "center", color: "var(--ink-faded)", fontStyle: "italic", padding: "1rem 0" }}>
            Waiting for next fax<span className="blink">_</span>
          </p>
        )}
      </div>

      {/* Leaderboard */}
      {scores.length > 0 && (
        <div>
          <p className="section-label">Leaderboard</p>
          <div className="paper-card">
            {scores.map((s, i) => (
              <div key={s.nickname} className="leaderboard-row">
                <span>
                  <span className="rank">{i + 1}.</span>
                  {s.nickname}
                  {s.nickname === guest.nickname ? " (you)" : ""}
                </span>
                <span className="score">{s.score} pt{s.score !== 1 ? "s" : ""}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
