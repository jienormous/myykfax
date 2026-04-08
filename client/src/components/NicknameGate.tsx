import { useState } from "react";
import { api } from "../api";
import type { Guest } from "../types";

export function NicknameGate({ onJoin }: { onJoin: (guest: Guest) => void }) {
  const [nickname, setNickname] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nickname.trim()) return;
    setLoading(true);
    setError("");
    try {
      const guest = await api.joinAsGuest(nickname.trim());
      onJoin(guest);
    } catch (err) {
      setError("Failed to join. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1>MYYKFAX</h1>
      <p>Enter your name to join the party</p>
      <form onSubmit={handleSubmit}>
        <input
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          placeholder="your nickname"
          maxLength={32}
          autoFocus
        />
        <button type="submit" disabled={loading || !nickname.trim()}>
          {loading ? "Joining..." : "JOIN"}
        </button>
      </form>
      {error && <p>{error}</p>}
    </div>
  );
}
