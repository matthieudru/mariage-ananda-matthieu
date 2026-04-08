"use client";

const PHOTOS = [
  "/AnandaetMatthieu.JPG",
  "/AnandaetMatthieu2.JPG",
  "/AnandaetMatthieu3.JPG",
  "/AnandaetMatthieu4.JPG",
  "/AnandaetMatthieu5.JPG",
  "/AnandaetMatthieu6.JPG",
];

export default function TestHero() {
  return (
    <div>
      {PHOTOS.map((photo, i) => (
        <section key={photo} style={{
          minHeight: "100vh",
          background: "#6B1A1A",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "60px 48px",
          position: "relative",
        }}>
          <p style={{ position: "absolute", top: "32px", left: "50%", transform: "translateX(-50%)", fontSize: "11px", letterSpacing: "0.25em", textTransform: "uppercase", color: "#f3ecdc", opacity: 0.4 }}>
            Photo {i + 1}
          </p>

          <div style={{ width: "min(688px, 74vw)", marginBottom: "52px" }}>
            <svg viewBox="0 0 1000 472" style={{ width: "100%", display: "block", overflow: "visible" }}>
              <g transform="scale(1, 1.6)">
                <text y="148" textLength="1000" lengthAdjust="spacingAndGlyphs" fill="#f3ecdc">
                  <tspan fontFamily="'Playfair Display', Georgia, serif" fontWeight="700" fontSize="148">ANANDA </tspan>
                  <tspan fontFamily="'La Belle Aurore', cursive" fontSize="118">et</tspan>
                </text>
                <text x="0" y="293" textLength="1000" lengthAdjust="spacingAndGlyphs"
                  fontFamily="'Playfair Display', Georgia, serif" fontWeight="700" fontSize="148" fill="#f3ecdc">
                  MATTHIEU
                </text>
              </g>
            </svg>
          </div>

          <div style={{ width: "clamp(160px, 18vw, 260px)", height: "clamp(160px, 18vw, 260px)", overflow: "hidden" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photo}
              alt={`Ananda et Matthieu ${i + 1}`}
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            />
          </div>

          <div style={{ position: "absolute", bottom: "32px", left: "50%", transform: "translateX(-50%)", opacity: 0.4, animation: "bounce 2s ease-in-out infinite" }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
              <path d="M12 5v14M5 12l7 7 7-7" stroke="#f3ecdc" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </section>
      ))}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=La+Belle+Aurore&display=swap');
        @keyframes bounce {
          0%, 100% { transform: translateX(-50%) translateY(0); }
          50%       { transform: translateX(-50%) translateY(8px); }
        }
      `}</style>
    </div>
  );
}
