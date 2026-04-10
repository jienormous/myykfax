import type { Guest, Score } from "./types";

const BASE = "/api";

function adminHeaders(password: string) {
  return { "Content-Type": "application/json", "x-admin-password": password };
}

export const api = {
  async joinAsGuest(nickname: string): Promise<Guest> {
    const res = await fetch(`${BASE}/guests`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nickname }),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  async getGuests(): Promise<Guest[]> {
    return fetch(`${BASE}/guests`).then((r) => r.json());
  },

  async submitFact(text: string, guestId: number, excludeIds: number[] = []): Promise<{ id: number; receivedFact: { id: number; text: string } | null }> {
    const res = await fetch(`${BASE}/facts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, guestId, excludeIds }),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  async submitGuess(guestId: number, factId: number, guessedSubmitterId: number | null): Promise<{ correct: boolean }> {
    const res = await fetch(`${BASE}/guesses`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ guestId, factId, guessedSubmitterId }),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  admin: {
    async seedFact(text: string, password: string, authorName?: string | null): Promise<{ id: number }> {
      const res = await fetch(`${BASE}/admin/facts`, {
        method: "POST",
        headers: adminHeaders(password),
        body: JSON.stringify({ text, authorName: authorName ?? null }),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },

    async deleteFact(id: number, password: string): Promise<void> {
      await fetch(`${BASE}/admin/facts/${id}`, {
        method: "DELETE",
        headers: adminHeaders(password),
      });
    },

    async getFacts(password: string) {
      const res = await fetch(`${BASE}/admin/facts`, {
        headers: adminHeaders(password),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },

    async broadcast(password: string): Promise<{ broadcast: { id: number; text: string } }> {
      const res = await fetch(`${BASE}/admin/broadcast`, {
        method: "POST",
        headers: adminHeaders(password),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },

    async setPhase(phase: "0" | "1" | "2", password: string): Promise<void> {
      const res = await fetch(`${BASE}/admin/phase`, {
        method: "POST",
        headers: adminHeaders(password),
        body: JSON.stringify({ phase }),
      });
      if (!res.ok) throw new Error(await res.text());
    },

    async revealNext(password: string): Promise<{ fact: { id: number; text: string; submitter: string } }> {
      const res = await fetch(`${BASE}/admin/reveal`, {
        method: "POST",
        headers: adminHeaders(password),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },

    async getState(password: string): Promise<{ gameState: any; scores: Score[]; guestCount: number; factCount: number }> {
      const res = await fetch(`${BASE}/admin/state`, {
        headers: adminHeaders(password),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
  },
};
