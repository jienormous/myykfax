import { useEffect, useRef, useState } from "react";
import { api } from "../api";
import { FaxMachine } from "./FaxMachine";
import { Masthead } from "./Masthead";
import type { Fact, Guest } from "../types";

type SendState = "idle" | "feeding" | "ejecting" | "sent" | "error";
type IncomingState = "idle" | "feeding" | "ejecting";

export function Phase1View({ guest, inbox, onReceiveFact }: { guest: Guest; inbox: Fact[]; onReceiveFact: (fact: Fact) => void }) {
  const [text, setText] = useState("");
  const [sendState, setSendState] = useState<SendState>("idle");
  const [feedText, setFeedText] = useState("");
  const [incomingState, setIncomingState] = useState<IncomingState>("idle");
  const [incomingText, setIncomingText] = useState("");
  const [unread, setUnread] = useState(0);
  const prevInboxLen = useRef(inbox.length);

  useEffect(() => {
    if (inbox.length > prevInboxLen.current) {
      setUnread((u) => u + inbox.length - prevInboxLen.current);
    }
    prevInboxLen.current = inbox.length;
  }, [inbox.length]);

  function clearUnread() { setUnread(0); }

  function playIncoming(fact: Fact) {
    setIncomingText(fact.text);
    setIncomingState("feeding");
    setTimeout(() => {
      setIncomingState("ejecting");
      setTimeout(() => {
        setIncomingState("idle");
        onReceiveFact(fact);
      }, 400);
    }, 1400);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim() || sendState !== "idle") return;

    setFeedText(text.trim());
    setSendState("feeding");

    try {
      const { receivedFact } = await api.submitFact(text.trim(), guest.id);
      setTimeout(() => {
        setSendState("ejecting");
        setTimeout(() => {
          setText("");
          setSendState("sent");
          if (receivedFact) {
            setTimeout(() => playIncoming(receivedFact as Fact), 600);
          }
          setTimeout(() => setSendState("idle"), 1800);
        }, 450);
      }, 1200);
    } catch {
      setSendState("error");
      setTimeout(() => setSendState("idle"), 2000);
    }
  }

  const isSending = sendState === "feeding" || sendState === "ejecting";

  return (
    <div className="app">
      <Masthead />
      <div className="app-body">
        <FaxMachine size={130} />

        <div
          className={`paper-feed-wrap ${
            incomingState === "feeding" ? "feeding" :
            incomingState === "ejecting" ? "ejecting" : ""
          }`}
          style={{ maxHeight: incomingState === "idle" ? 0 : undefined }}
        >
          <div className="paper-feed">{incomingText}</div>
        </div>

        <hr className="divider" style={{ marginTop: "1.25rem" }} />

        <div className="paper-card" style={{ marginBottom: "1.5rem" }}>
          <p className="section-label">Send a myykfact, receive a myykfact</p>
          <form onSubmit={handleSubmit}>
            <textarea
              className="field"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Something true about Myyk..."
              maxLength={280}
              rows={3}
              disabled={isSending}
            />
            <div className="char-count">{text.length}/280</div>

            <div
              className={`paper-feed-wrap ${
                sendState === "feeding" ? "feeding" :
                sendState === "ejecting" ? "ejecting" : ""
              }`}
              style={{ maxHeight: sendState === "idle" || sendState === "sent" || sendState === "error" ? 0 : undefined }}
            >
              <div className="paper-feed">{feedText}</div>
            </div>

            <button className="btn btn--full" type="submit" disabled={isSending || !text.trim()}>
              {sendState === "feeding"  ? "Sending Fax..." :
               sendState === "ejecting" ? "Transmitting..." :
               sendState === "sent"     ? "Fax Sent ✓" :
               sendState === "error"    ? "Transmission Failed" :
               "Send Fax"}
            </button>
          </form>
        </div>

        <hr className="divider" />

        <div>
          <div className="inbox-header" onClick={clearUnread} style={{ cursor: "pointer" }}>
            <p className="section-label" style={{ marginBottom: 0 }}>Inbox</p>
            {unread > 0 && <span className="unread-badge">{unread} new</span>}
          </div>

          {inbox.length === 0 ? (
            <p className="inbox-empty">No faxes received yet. Stand by.</p>
          ) : (
            inbox.map((fact) => (
              <div key={fact.id} className="paper-card inbox-card">
                <p>{fact.text}</p>
                <p className="meta">— received via Myykfax 3000</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
