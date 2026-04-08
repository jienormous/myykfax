export function FaxMachine({ size = 220 }: { size?: number }) {
  const VW = 300, VH = 220;
  return (
    <svg
      viewBox={`0 0 ${VW} ${VH}`}
      width={size}
      height={Math.round(size * VH / VW)}
      aria-hidden="true"
      style={{ display: "block", margin: "0 auto" }}
    >
      <defs>
        <linearGradient id="fm-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#eee8da" />
          <stop offset="100%" stopColor="#d0c9bc" />
        </linearGradient>
        <linearGradient id="fm-top" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#e6e0d2" />
          <stop offset="100%" stopColor="#cec8ba" />
        </linearGradient>
        <linearGradient id="fm-btn" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#ddd8cc" />
          <stop offset="100%" stopColor="#bfbbb0" />
        </linearGradient>
        <linearGradient id="fm-btnhi" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#ccc8be" />
          <stop offset="100%" stopColor="#aaa69e" />
        </linearGradient>
        <linearGradient id="fm-display" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#1c2c1c" />
          <stop offset="100%" stopColor="#0a160a" />
        </linearGradient>
        <linearGradient id="fm-paper" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#ffffff" />
          <stop offset="100%" stopColor="#f2f0ea" />
        </linearGradient>
        <filter id="fm-dropshadow">
          <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="#1a1a1a" floodOpacity="0.12" />
        </filter>
        <filter id="fm-papershadow">
          <feDropShadow dx="1" dy="2" stdDeviation="2" floodColor="#1a1a1a" floodOpacity="0.10" />
        </filter>
      </defs>

      {/* ── Paper strip coming out ── */}
      <g filter="url(#fm-papershadow)">
        <rect x="88" y="3" width="58" height="50" fill="url(#fm-paper)" />
        <rect x="88" y="3" width="58" height="50" fill="none" stroke="#d4cfc6" strokeWidth="0.8" />
      </g>
      {/* printed lines */}
      {[14, 20, 26, 32, 38, 44].map((y, i) => (
        <rect key={y} x="94" y={y} width={i % 2 === 0 ? 44 : 34} height="1.5" fill="#c8c4bc" />
      ))}

      {/* ── Main body ── */}
      <rect x="10" y="46" width="280" height="156" rx="4" fill="url(#fm-body)" filter="url(#fm-dropshadow)" />
      <rect x="10" y="46" width="280" height="156" rx="4" fill="none" stroke="#b0aa9e" strokeWidth="1.2" />

      {/* top panel (darker strip) */}
      <rect x="10" y="46" width="280" height="28" rx="4" fill="url(#fm-top)" />
      <rect x="10" y="46" width="280" height="28" fill="none" stroke="#b0aa9e" strokeWidth="0" />
      {/* panel seam */}
      <line x1="10" y1="74" x2="290" y2="74" stroke="#b0aa9e" strokeWidth="1" />

      {/* paper exit slot */}
      <rect x="80" y="43" width="74" height="10" rx="2" fill="#1a1a1a" opacity="0.75" />
      <rect x="82" y="44" width="70" height="3" fill="#2a2a2a" opacity="0.5" />
      {/* roller dots */}
      {[95, 110, 125, 140].map(x => (
        <circle key={x} cx={x} cy="48" r="2.5" fill="#0a0a0a" opacity="0.6" />
      ))}

      {/* ── LEFT PANEL ── */}

      {/* display bezel */}
      <rect x="18" y="54" width="152" height="34" rx="3" fill="#c8c2b4" />
      <rect x="20" y="56" width="148" height="30" rx="2" fill="url(#fm-display)" />
      {/* display glare */}
      <rect x="21" y="57" width="146" height="5" rx="1" fill="white" opacity="0.04" />
      {/* display text */}
      <text x="94" y="75" textAnchor="middle" fontSize="9"
        fontFamily="'Courier Prime', Courier, monospace" fill="#4adf18" letterSpacing="3"
        style={{ filter: "drop-shadow(0 0 3px #4adf18)" }}>
        READY
      </text>
      {/* LED indicator */}
      <circle cx="158" cy="62" r="3.5" fill="#2adf00" opacity="0.9"
        style={{ filter: "drop-shadow(0 0 3px #2adf00)" }} />

      {/* function buttons row */}
      {["FAX", "COPY", "SCAN", "MENU"].map((label, i) => (
        <g key={label}>
          <rect x={18 + i * 38} y="93" width="33" height="14" rx="2"
            fill="url(#fm-btn)" stroke="#a8a49a" strokeWidth="0.8" />
          <rect x={18 + i * 38} y="93" width="33" height="5" rx="2"
            fill="white" opacity="0.12" />
          <text x={18 + i * 38 + 16.5} y="103" textAnchor="middle" fontSize="5.5"
            fontFamily="'Courier Prime', Courier, monospace" fill="#4a4640" letterSpacing="0.3">
            {label}
          </text>
        </g>
      ))}

      {/* secondary buttons */}
      {["START", "STOP"].map((label, i) => (
        <g key={label}>
          <rect x={18 + i * 44} y="112" width="38" height="14" rx="2"
            fill={i === 0 ? "#8ab87a" : "#c87a7a"} stroke="#a0a098" strokeWidth="0.8" />
          <rect x={18 + i * 44} y="112" width="38" height="5" rx="2"
            fill="white" opacity="0.18" />
          <text x={18 + i * 44 + 19} y="122" textAnchor="middle" fontSize="5.5"
            fontFamily="'Courier Prime', Courier, monospace" fill="#fff" letterSpacing="0.3"
            fontWeight="bold">
            {label}
          </text>
        </g>
      ))}

      {/* speaker grille */}
      {[132, 138, 144, 150, 156, 162].map(y => (
        <line key={y} x1="18" x2="100" y1={y} y2={y} stroke="#b8b2a8" strokeWidth="0.8" />
      ))}

      {/* ── RIGHT PANEL — keypad ── */}
      {["1","2","3","4","5","6","7","8","9","*","0","#"].map((label, i) => {
        const col = i % 3;
        const row = Math.floor(i / 3);
        const x = 176 + col * 34;
        const y = 54 + row * 28;
        const isSpecial = label === "*" || label === "#";
        return (
          <g key={label}>
            <rect x={x} y={y} width="28" height="22" rx="3"
              fill={isSpecial ? "url(#fm-btnhi)" : "url(#fm-btn)"}
              stroke="#a8a49a" strokeWidth="0.8" />
            {/* top highlight */}
            <rect x={x} y={y} width="28" height="7" rx="3"
              fill="white" opacity="0.15" />
            {/* bottom shadow */}
            <rect x={x} y={y + 18} width="28" height="4" rx="2"
              fill="#1a1a1a" opacity="0.08" />
            <text x={x + 14} y={y + 15} textAnchor="middle" fontSize="10"
              fontFamily="'Courier Prime', Courier, monospace" fill="#3a3630"
              fontWeight={isSpecial ? "normal" : "bold"}>
              {label}
            </text>
          </g>
        );
      })}

      {/* ── Bottom label strip ── */}
      <rect x="10" y="188" width="280" height="14" rx="0" fill="#cac4b6" opacity="0.6" />
      <line x1="10" y1="188" x2="290" y2="188" stroke="#b0aa9e" strokeWidth="0.8" />
      <text x="150" y="199" textAnchor="middle" fontSize="6.5"
        fontFamily="'Special Elite', serif" fill="#6a6460" letterSpacing="3">
        MYYKFAX 3000
      </text>

      {/* feet */}
      <rect x="24"  y="200" width="30" height="6" rx="2" fill="#c0bab0" stroke="#a8a49a" strokeWidth="0.8" />
      <rect x="246" y="200" width="30" height="6" rx="2" fill="#c0bab0" stroke="#a8a49a" strokeWidth="0.8" />
    </svg>
  );
}
