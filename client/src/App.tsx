import { useCallback, useEffect, useState } from "react";
import { useSSE } from "./hooks/useSSE";
import { NicknameGate } from "./components/NicknameGate";
import { Phase0View } from "./components/Phase0View";
import { Phase1View } from "./components/Phase1View";
import { Phase2View } from "./components/Phase2View";
import { AdminView } from "./components/AdminView";
import type { Fact, GameState, Guest, Phase, Score, SSEEvent } from "./types";

const ADMIN_ROUTE = "/admin";

function loadGuest(): Guest | null {
  try {
    return JSON.parse(localStorage.getItem("myykfax_guest") ?? "null");
  } catch {
    return null;
  }
}

function saveGuest(guest: Guest) {
  localStorage.setItem("myykfax_guest", JSON.stringify(guest));
}

export function App() {
  const isAdmin = window.location.pathname === ADMIN_ROUTE;

  const [guest, setGuest] = useState<Guest | null>(loadGuest);
  const [gameState, setGameState] = useState<GameState>({ phase: "0", current_fact_id: null });
  const [inbox, setInbox] = useState<Fact[]>([]);
  const [currentFact, setCurrentFact] = useState<Fact | null>(null);
  const [scores, setScores] = useState<Score[]>([]);

  const handleSSE = useCallback((event: SSEEvent) => {
    switch (event.type) {
      case "init":
        setGameState(event.data.state);
        break;
      case "phase_change":
        setGameState((s) => ({ ...s, phase: event.data.phase }));
        break;
      case "fax_broadcast":
        setInbox((prev) => [event.data.fact, ...prev]);
        break;
      case "fact_revealed":
        setCurrentFact(event.data.fact);
        break;
      case "leaderboard_update":
        setScores(event.data.scores);
        break;
    }
  }, []);

  useSSE(handleSSE);

  function onJoin(guest: Guest) {
    saveGuest(guest);
    setGuest(guest);
  }

  if (isAdmin) {
    return <AdminView />;
  }

  if (!guest) {
    return <NicknameGate onJoin={onJoin} />;
  }

  const phase = gameState.phase as Phase;

  if (phase === "0") return <Phase0View />;
  if (phase === "1") return <Phase1View guest={guest} inbox={inbox} />;
  if (phase === "2") {
    return (
      <Phase2View
        guest={guest}
        currentFact={currentFact}
        scores={scores}
        currentFactId={gameState.current_fact_id}
      />
    );
  }

  return null;
}
