import { useState } from "react";
import { api } from "../api";
import type { Fact, Guest } from "../types";

export function Phase1View({ guest, inbox }: { guest: Guest; inbox: Fact[] }) {
  const [text, setText] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    setStatus("sending");
    try {
      await api.submitFact(text.trim(), guest.id);
      setText("");
      setStatus("sent");
      setTimeout(() => setStatus("idle"), 2000);
    } catch {
      setStatus("error");
    }
  }

  return (
    <div>
      <h1>MYYKFAX</h1>
      <p>Hey {guest.nickname}! Send a Myykfact.</p>

      <form onSubmit={handleSubmit}>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Something true about Myyk..."
          maxLength={280}
          rows={3}
        />
        <button type="submit" disabled={status === "sending" || !text.trim()}>
          {status === "sending" ? "SENDING FAX..." : "SEND FAX"}
        </button>
      </form>

      {status === "sent" && <p>Fax sent!</p>}
      {status === "error" && <p>Transmission failed. Try again.</p>}

      <section>
        <h2>INBOX ({inbox.length})</h2>
        {inbox.length === 0 ? (
          <p>No faxes yet. Stand by.</p>
        ) : (
          <ul>
            {inbox.map((fact) => (
              <li key={fact.id}>{fact.text}</li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
