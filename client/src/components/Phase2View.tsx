import { useEffect, useRef, useState } from "react";
import { Masthead } from "./Masthead";
import { api } from "../api";
import type { Fact, Guest, Score } from "../types";

export function Phase2View({
  guest, currentFact, scores, quizComplete,
}: {
  guest: Guest;
  currentFact: Fact | null;
  scores: Score[];
  quizComplete: boolean;
}) {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [guessed, setGuessed] = useState<Set<number>>(new Set());
  const [lastResult, setLastResult] = useState<boolean | null>(null);
  const inFlight = useRef<Set<number>>(new Set());

  useEffect(() => { api.getGuests().then(setGuests); }, []);
  useEffect(() => { setLastResult(null); }, [currentFact?.id]);

  async function handleGuess(submitterId: number | null) {
    if (!currentFact) return;
    const factId = currentFact.id;
    if (guessed.has(factId) || inFlight.current.has(factId)) return;
    inFlight.current.add(factId);
    try {
      const { correct } = await api.submitGuess(guest.id, factId, submitterId);
      setLastResult(correct);
      setGuessed((prev) => new Set(prev).add(factId));
    } catch { /* already guessed or stale fact */ }
    finally { inFlight.current.delete(factId); }
  }

  const hasGuessed = currentFact ? guessed.has(currentFact.id) : false;

  return (
    <div className="app">
      <Masthead sub="Who Sent This Fax?" />
      <div className="app-body">
        <div className="paper-card">
          {quizComplete ? (
            <div style={{ textAlign: "center", padding: "1rem 0" }}>
              <p className="section-label">Transmission complete</p>
              <p className="current-fact" style={{ marginTop: "0.5rem" }}>
                ★ Quiz Over ★
              </p>
              <p style={{ color: "var(--ink-mid)", fontStyle: "italic", marginTop: "0.5rem" }}>
                All myykfaxes have been revealed. Final scores below.
              </p>
            </div>
          ) : currentFact ? (
            <>
              <p className="section-label">Incoming transmission</p>
              <p className="current-fact">{currentFact.text}</p>

              {hasGuessed ? (
                <p className={`guess-result ${lastResult ? "correct" : "wrong"}`}>
                  {lastResult ? "Correct ✓" : "Wrong ✗"}
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

        {scores.length > 0 && (
          <>
            <p className="section-label">Leaderboard</p>
            <div className="paper-card">
              {scores.map((s, i) => (
                <div key={s.nickname} className="leaderboard-row">
                  <span>
                    <span className="rank">{i + 1}.</span>
                    {s.nickname}{s.nickname === guest.nickname ? " (you)" : ""}
                  </span>
                  <span className="score">{s.score} pt{s.score !== 1 ? "s" : ""}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
