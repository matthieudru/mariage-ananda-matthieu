"use client";

const COLOR = "#243b71";
const BG = "#f3ecdc";

const TESTS = [
  {
    label: "A — Version actuelle (bold, allongé x1.28)",
    scaleY: 1.28,
    weight: "700",
  },
  {
    label: "B — Plus fine (400), allongé x1.28",
    scaleY: 1.28,
    weight: "400",
  },
  {
    label: "C — Bold, encore plus allongé x1.6",
    scaleY: 1.6,
    weight: "700",
  },
];

export default function TestTitre() {
  return (
    <div style={{ background: BG, color: COLOR, fontFamily: "'FT Aktual', Georgia, serif", minHeight: "100vh", padding: "60px 48px" }}>
      <div style={{ position: "fixed", inset: 0, border: `11px solid ${COLOR}`, zIndex: 200, pointerEvents: "none" }} />

      <p style={{ fontSize: "11px", letterSpacing: "0.3em", textTransform: "uppercase", opacity: 0.38, marginBottom: "64px" }}>
        Test titre — 3 variations
      </p>

      {TESTS.map((t) => (
        <div key={t.label} style={{ marginBottom: "96px", borderTop: `1px solid rgba(36,59,113,0.15)`, paddingTop: "40px" }}>
          <p style={{ fontSize: "11px", letterSpacing: "0.2em", textTransform: "uppercase", opacity: 0.4, marginBottom: "32px" }}>
            {t.label}
          </p>

          <svg
            viewBox={`0 0 1000 ${Math.round(310 * t.scaleY)}`}
            style={{ width: "min(800px, 100%)", display: "block", overflow: "visible" }}
          >
            <g transform={`scale(1, ${t.scaleY})`}>
              <text y="148" textLength="1000" lengthAdjust="spacingAndGlyphs" fill={COLOR}>
                <tspan
                  fontFamily="'Playfair Display', Georgia, serif"
                  fontWeight={t.weight}
                  fontSize="148"
                >ANANDA </tspan>
                <tspan
                  fontFamily="'La Belle Aurore', cursive"
                  fontSize="118"
                >et</tspan>
              </text>
              <text
                x="0" y="293"
                textLength="1000" lengthAdjust="spacingAndGlyphs"
                fontFamily="'Playfair Display', Georgia, serif"
                fontWeight={t.weight}
                fontSize="148"
                fill={COLOR}
              >MATTHIEU</text>
            </g>
          </svg>
        </div>
      ))}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=La+Belle+Aurore&display=swap');
      `}</style>
    </div>
  );
}
