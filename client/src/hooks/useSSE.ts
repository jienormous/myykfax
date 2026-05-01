import { useEffect } from "react";
import type { SSEEvent } from "../types";

export function useSSE(onEvent: (event: SSEEvent) => void) {
  useEffect(() => {
    const es = new EventSource("/api/sse");

    const handle = (eventName: string) => (e: MessageEvent) => {
      onEvent({ type: eventName, data: JSON.parse(e.data) } as SSEEvent);
    };

    const events: SSEEvent["type"][] = [
      "init",
      "phase_change",
      "fax_broadcast",
      "fact_revealed",
      "quiz_complete",
      "leaderboard_update",
      "guest_joined",
    ];

    for (const name of events) {
      es.addEventListener(name, handle(name));
    }

    es.onerror = () => {
      // Browser auto-reconnects on error
    };

    return () => es.close();
  }, [onEvent]);
}
