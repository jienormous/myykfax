export type Phase = "0" | "1" | "2";

export interface Guest {
  id: number;
  nickname: string;
}

export interface Fact {
  id: number;
  text: string;
}

export interface Score {
  nickname: string;
  score: number;
}

export interface GameState {
  phase: Phase;
  current_fact_id: number | null;
}

// Events pushed over SSE
export type SSEEvent =
  | { type: "init"; data: { state: GameState; currentFact: Fact | null; quizComplete: boolean } }
  | { type: "phase_change"; data: { phase: Phase } }
  | { type: "fax_broadcast"; data: { fact: Fact } }
  | { type: "fact_revealed"; data: { fact: Fact } }
  | { type: "quiz_complete"; data: {} }
  | { type: "leaderboard_update"; data: { scores: Score[] } }
  | { type: "guest_joined"; data: { nickname: string } };
