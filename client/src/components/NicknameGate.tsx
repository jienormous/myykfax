import { useState } from "react";
import { api } from "../api";
import { FaxMachine } from "./FaxMachine";
import { Masthead } from "./Masthead";
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
    } catch {
      setError("Transmission failed. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app">
      <Masthead />
      <div className="app-body">
        <div style={{ margin: "0 -1.75rem" }}>
          <FaxMachine size={440} />
        </div>
        <div style={{ marginTop: "1.5rem" }}>
          <div className="paper-card">
            <p className="section-label">Identify yourself</p>
            <form onSubmit={handleSubmit}>
              <input
                className="field"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="your name"
                maxLength={32}
                autoFocus
                autoComplete="off"
              />
              <button className="btn btn--full" type="submit" disabled={loading || !nickname.trim()}>
                {loading ? "Connecting..." : "Connect to Myykfax"}
              </button>
            </form>
            {error && <p style={{ marginTop: "0.5rem", color: "#7a3030", fontSize: "0.82rem" }}>{error}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
