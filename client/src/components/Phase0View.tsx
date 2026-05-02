import { FaxMachine } from "./FaxMachine";
import { Masthead } from "./Masthead";

export function Phase0View() {
  return (
    <div className="app">
      <Masthead />
      <div className="app-body">
        <FaxMachine size={190} />
        <div style={{ textAlign: "center", marginTop: "2rem" }}>
          <p style={{ fontFamily: "Special Elite, serif", fontSize: "1rem", letterSpacing: "0.1em", color: "var(--ink)" }}>
            STANDING BY<span className="blink">_</span>
          </p>
          <p style={{ color: "var(--ink-faded)", fontSize: "0.82rem", marginTop: "0.5rem" }}>
            The fax machine is warming up.
          </p>
        </div>
      </div>
    </div>
  );
}
