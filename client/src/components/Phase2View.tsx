import { useEffect, useState } from "react";
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

  // Reset result display when fact changes
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
      // Already guessed or error
    }
  }

  const hasGuessedCurrent = currentFact ? guessed.has(currentFact.id) : false;

  return (
    <div>
      <h1>MYYKFAX — WHO SENT THIS?</h1>

      <section>
        {currentFact ? (
          <>
            <blockquote>{currentFact.text}</blockquote>

            {hasGuessedCurrent ? (
              <p>{lastResult ? "CORRECT!" : "WRONG!"}</p>
            ) : (
              <ul>
                {guests.map((g) => (
                  <li key={g.id}>
                    <button onClick={() => handleGuess(g.id)}>{g.nickname}</button>
                  </li>
                ))}
                <li>
                  <button onClick={() => handleGuess(null)}>???</button>
                </li>
              </ul>
            )}
          </>
        ) : (
          <p>Waiting for next fax...</p>
        )}
      </section>

      <section>
        <h2>LEADERBOARD</h2>
        <ol>
          {scores.map((s, i) => (
            <li key={s.nickname}>
              {i + 1}. {s.nickname} — {s.score} pt{s.score !== 1 ? "s" : ""}
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
