"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

const COLOR = "#243b71";
const BG = "#f3ecdc";

function Reveal({ children }: { children: React.ReactNode; delay?: number }) {
  return <>{children}</>;
}

/* ── Panneau Programme ── */
function ProgrammePanel({
  num, titre, jour, mois, photo, items, index, total, bgSize = "cover", bgPosition = "center", flipH = false,
}: {
  num: string; titre: string; jour: string; mois: string; photo: string | null;
  items: { heure: string; label: string }[];
  index: number; total: number; bgSize?: string; bgPosition?: string; flipH?: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  const isLast = index === total - 1;
  const active = hovered && !!photo;
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="prog-panel"
      style={{
        flex: 1,
        position: "relative",
        borderRight: isLast ? "none" : `1px solid rgba(36,59,113,0.25)`,
        overflow: "hidden",
        cursor: "pointer",
        WebkitTapHighlightColor: "transparent",
        minHeight: "68vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "28px 20px",
      }}
    >
      {photo && (
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: `url(${photo})`,
          backgroundSize: bgSize, backgroundPosition: bgPosition,
          transform: flipH ? "scaleX(-1)" : undefined,
          opacity: hovered ? 1 : 0.12,
          transition: "opacity 0.6s cubic-bezier(0,0,0.2,1)",
        }} />
      )}
      <div style={{
        position: "absolute", inset: 0,
        background: "rgba(36,59,113,0.6)",
        opacity: active ? 1 : 0,
        transition: "opacity 0.6s cubic-bezier(0,0,0.2,1)",
      }} />

      {/* Bouton overlay — capte tous les taps sur le panneau */}
      {photo && (
        <button
          type="button"
          onClick={() => setHovered(h => !h)}
          style={{ position: "absolute", inset: 0, zIndex: 5, background: "transparent", border: "none", cursor: "pointer", WebkitTapHighlightColor: "transparent", touchAction: "manipulation" } as React.CSSProperties}
          aria-label="Voir la photo"
        />
      )}

      <div style={{ position: "relative", zIndex: 6, pointerEvents: "none" }}>
        <p style={{
          fontSize: "clamp(18px, 2.2vw, 38px)", fontWeight: 500, letterSpacing: "-0.01em", textTransform: "uppercase",
          lineHeight: 1.0, whiteSpace: "pre-line",
          color: active ? BG : COLOR,
          transition: "color 0.4s",
        }}>{titre}</p>
        <p style={{
          fontSize: "clamp(10px, 0.9vw, 13px)", fontWeight: 400, letterSpacing: "0.1em", textTransform: "uppercase",
          color: active ? BG : COLOR,
          opacity: active ? 0.55 : 0.38,
          transition: "color 0.4s, opacity 0.4s",
          marginTop: "4px",
        }}>{jour} {num} {mois}</p>
      </div>

      <div style={{ position: "relative", zIndex: 6, paddingTop: "16px", pointerEvents: "none" }}>
        {items.map((item, i) => (
          <div key={i} style={{ marginBottom: i < items.length - 1 ? "12px" : "16px" }}>
            {item.heure && <p style={{
              fontSize: "13px", opacity: active ? 0.55 : 0.35, fontWeight: 400, marginBottom: "2px",
              color: active ? BG : COLOR, transition: "color 0.4s, opacity 0.4s", letterSpacing: "0.08em",
            }}>{item.heure}</p>}
            <p style={{
              fontSize: "clamp(12px, 1.2vw, 16px)", fontWeight: 400, lineHeight: 1.1, opacity: active ? 0.85 : 0.6,
              color: active ? BG : COLOR, transition: "color 0.4s",
            }}>{item.label}</p>
          </div>
        ))}
        <p style={{
          fontSize: "clamp(64px, 12vw, 190px)", fontWeight: 500, lineHeight: 1, letterSpacing: "-0.04em",
          color: active ? BG : COLOR,
          opacity: active ? 1 : 0.13,
          transition: "color 0.4s, opacity 0.5s",
          userSelect: "none",
        }}>{num}</p>
      </div>
    </div>
  );
}

/* ── Ligne hôtel ── */
function HotelRow({ hotel, delay }: { hotel: { nom: string; detail: string; email: string; url: string; photo: string }; delay: number }) {
  const [hovered, setHovered] = useState(false);
  return (
    <Reveal delay={delay}>
      <a
        href={hotel.url}
        target="_blank"
        rel="noopener noreferrer"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onTouchStart={() => setHovered(true)}
        onTouchEnd={() => setTimeout(() => setHovered(false), 400)}
        className="hotel-row"
        style={{
          display: "block",
          borderTop: `1px solid rgba(36,59,113,0.15)`,
          padding: "24px 40px",
          textDecoration: "none", color: COLOR,
          position: "relative", overflow: "hidden",
        }}
      >
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: `url(${hotel.photo})`,
          backgroundSize: "cover", backgroundPosition: "center",
          opacity: hovered ? 1 : 0,
          transition: "opacity 0.55s cubic-bezier(0,0,0.2,1)",
        }} />
        <div style={{
          position: "absolute", inset: 0,
          background: "rgba(36,59,113,0.62)",
          opacity: hovered ? 1 : 0,
          transition: "opacity 0.55s cubic-bezier(0,0,0.2,1)",
        }} />
        <div className="hotel-row-inner" style={{ position: "relative", zIndex: 2, display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", alignItems: "center" }}>
          <p style={{ fontSize: "clamp(15px, 1.8vw, 22px)", fontWeight: 500, color: hovered ? BG : COLOR, transition: "color 0.4s" }}>
            {hotel.nom}
          </p>
          <div>
            <p style={{ fontSize: "clamp(12px, 1vw, 15px)", opacity: hovered ? 0.75 : 0.55, lineHeight: 1.6, fontWeight: 400, color: hovered ? BG : COLOR, transition: "color 0.4s, opacity 0.4s" }}>
              {hotel.detail}
            </p>
            <p style={{ fontSize: "11px", opacity: 0.5, marginTop: "4px", fontWeight: 400, color: hovered ? BG : COLOR, transition: "color 0.4s" }}>
              {hotel.email} · Réserver en direct
            </p>
          </div>
        </div>
      </a>
    </Reveal>
  );
}

const HOTELS = [
  { nom: "La Tavernetta", detail: "Centre du village de Scopello, 5 min de la Tonnara.", email: "info@albertolatavernetta.it", url: "https://www.albergolatavernetta.it/en/", photo: "/la-tavernetta.jpg" },
  { nom: "Baglio di Scopello", detail: "Centre du village de Scopello, 5 min de la Tonnara.", email: "info@hotelbagliodiscopello.it", url: "https://www.hotelbagliodiscopello.com/eng/index.html", photo: "https://www.hotelbagliodiscopello.com/img/about-1.jpg" },
  { nom: "Torre Bennistra", detail: "Vue sur la Tonnara, centre du village, 5 min.", email: "info@torrebennistra.it", url: "https://www.hoteltorrebennistra.it/en/", photo: "https://www.hoteltorrebennistra.it/images/panorama/0c6a9640.webp" },
  { nom: "Baglio La Riserva", detail: "Sur la route de Scopello, 4 min de la Tonnara.", email: "info@bagliolariserva.it", url: "https://www.bagliolariserva.it/", photo: "https://www.bagliolariserva.it/wp-content/uploads/2020/06/baglio-la-riserva-scopello-faraglioni-03-1024x673.jpg" },
  { nom: "Tenute Plaia", detail: "Sur la route de Scopello, 4 min de la Tonnara.", email: "info@agriturismotenuteplaia.it", url: "https://www.agriturismotenuteplaia.it/english/", photo: "https://www.agriturismotenuteplaia.it/assets/images/slide-3.jpg" },
];

const MAISONS = [
  { nom: "Villa Gaia", detail: "6 personnes — 5 min de la Tonnara." },
  { nom: "Villa Riserva dello Zingaro", detail: "6 à 8 personnes — 5 min de la Tonnara." },
  { nom: "Villa Ginestra", detail: "6 personnes — 5 min de la Tonnara." },
  { nom: "Casa Vinz", detail: "2 à 4 personnes — 5 min de la Tonnara." },
  { nom: "Palma dello Zingaro", detail: "4 à 6 personnes — 5 min de la Tonnara." },
];

const PROGRAMME = [
  { num: "9", titre: "The\nOpening", jour: "Vendredi", mois: "Octobre", photo: "/TheOpening.JPG", items: [{ heure: "18h00", label: "Drinks in Scopello" }] },
  { num: "10", titre: "The\nWedding", jour: "Samedi", mois: "Octobre", photo: "/scopello-2.jpg", items: [{ heure: "15h00", label: "Cérémonie" }, { heure: "17h00", label: "Apéritif" }, { heure: "19h30", label: "Dîner" }] },
  { num: "11", titre: "The After Party", jour: "Dimanche", mois: "Octobre", photo: "/TheAfterParty.jpeg", bgSize: "120%", bgPosition: "75% center", flipH: true, items: [{ heure: "12h–19h", label: "Pizza Party" }] },
  { num: "12", titre: "Ciao\nBye Bye", jour: "Lundi", mois: "Octobre", photo: null, items: [] },
];

export default function Infos() {
  const heroRef = useRef<HTMLElement>(null);
  const [heroVisible, setHeroVisible] = useState(true);

  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => setHeroVisible(entry.isIntersecting),
      { threshold: 0.01 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const HERO_COLOR = "#6B1A1A";

  return (
    <div style={{ background: BG, color: COLOR, fontFamily: "'FT Aktual', Georgia, serif" }}>
      {/* Couvre le cadre bleu sur le hero */}
      {heroVisible && <>
        <div style={{ position:"fixed", left:0, top:0, bottom:0, width:"11px", background:HERO_COLOR, zIndex:10000, pointerEvents:"none" }} />
        <div style={{ position:"fixed", right:0, top:0, bottom:0, width:"11px", background:HERO_COLOR, zIndex:10000, pointerEvents:"none" }} />
        <div style={{ position:"fixed", top:0, left:0, right:0, height:"11px", background:HERO_COLOR, zIndex:10000, pointerEvents:"none" }} />
        <div style={{ position:"fixed", bottom:0, left:0, right:0, height:"11px", background:HERO_COLOR, zIndex:10000, pointerEvents:"none" }} />
      </>}


      {/* ── HERO ── */}
      <section ref={heroRef} style={{
        height: "100svh",
        background: "#6B1A1A",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: "72px 24px 48px",
        position: "relative",
        boxSizing: "border-box",
      }}>
        <div style={{ width: "min(688px, 88vw)", marginBottom: "40px" }}>
          <svg viewBox="0 0 1000 472" style={{ width: "100%", display: "block", overflow: "visible" }}>
            <g transform="scale(1, 1.6)">
              <text y="148" fill="#f3ecdc">
                <tspan fontFamily="'Playfair Display', Georgia, serif" fontWeight="700" fontSize="148" textLength="760" lengthAdjust="spacingAndGlyphs">ANANDA </tspan>
                <tspan fontFamily="'La Belle Aurore', cursive" fontSize="90" textLength="240" lengthAdjust="spacingAndGlyphs">et</tspan>
              </text>
              <text x="0" y="293" textLength="1000" lengthAdjust="spacingAndGlyphs"
                fontFamily="'Playfair Display', Georgia, serif" fontWeight="700" fontSize="148" fill="#f3ecdc">
                MATTHIEU
              </text>
            </g>
          </svg>
        </div>

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/AnandaetMatthieu5.jpg"
          alt="Ananda et Matthieu"
          className="hero-photo"
          style={{ objectFit: "cover", display: "block", flexShrink: 0 }}
        />

        <div style={{ position: "absolute", bottom: "12px", left: "50%", transform: "translateX(-50%)", animation: "bounce 2s ease-in-out infinite", opacity: 0.5 }}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
            <path d="M12 5v14M5 12l7 7 7-7" stroke="#f3ecdc" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>

        <div style={{ position: "absolute", top: "11px", left: 0, right: 0, display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 24px" }}>
          <Link href="/" style={{ color: "#f3ecdc", textDecoration: "none", fontSize: "11px", fontWeight: 400, letterSpacing: "0.22em", textTransform: "uppercase", opacity: 0.5 }}>
            ← Accueil
          </Link>
          <Link href="/rsvp" className="hero-rsvp">RSVP</Link>
        </div>
      </section>

      {/* ── PROGRAMME ── */}
      <section style={{ borderBottom: `1px solid rgba(36,59,113,0.15)` }}>
        <div className="prog-panels" style={{
          display: "flex",
          borderTop: `1px solid rgba(36,59,113,0.25)`,
          borderBottom: `1px solid rgba(36,59,113,0.25)`,
        }}>
          {PROGRAMME.map((p, i) => (
            <ProgrammePanel key={p.jour} {...p} index={i} total={PROGRAMME.length} />
          ))}
        </div>
      </section>

      {/* ── VENIR ── */}
      <section style={{ borderBottom: `1px solid rgba(36,59,113,0.15)` }}>
        <div className="section-pad">
          <Reveal>
            <p style={{ fontSize: "clamp(28px, 4vw, 52px)", fontWeight: 500, letterSpacing: "-0.01em", textTransform: "uppercase", lineHeight: 1 }}>Venir</p>
          </Reveal>
        </div>

        <div style={{ borderTop: `1px solid rgba(36,59,113,0.15)`, display: "grid", gridTemplateColumns: "1fr 1fr" }} className="venir-grid">
          <div className="section-pad" style={{ paddingTop: "32px", paddingBottom: "40px", borderRight: `1px solid rgba(36,59,113,0.15)` }}>
            <p style={{ fontSize: "clamp(22px, 3vw, 42px)", fontWeight: 400, lineHeight: 1.05, letterSpacing: "-0.02em", marginBottom: "16px" }}>Avion</p>
            <p style={{ fontSize: "clamp(14px, 1.3vw, 17px)", opacity: 0.62, lineHeight: 1.8, fontWeight: 400 }}>
              Le meilleur moyen pour rejoindre Scopello est d'atterrir à l'aéroport de Palerme.
              Il y a des vols directs depuis Marseille avec Ryanair ou Transavia,
              et depuis Paris avec Transavia, EasyJet ou Air France.
              L'aéroport de Palerme se situe ensuite à 40 minutes de voiture de Scopello.
            </p>
          </div>
          <div className="section-pad" style={{ paddingTop: "32px", paddingBottom: "48px" }}>
            <p style={{ fontSize: "clamp(22px, 3vw, 42px)", fontWeight: 400, lineHeight: 1.05, letterSpacing: "-0.02em", marginBottom: "16px" }}>Voiture</p>
            <p style={{ fontSize: "clamp(14px, 1.3vw, 17px)", opacity: 0.62, lineHeight: 1.8, fontWeight: 400, marginBottom: "28px" }}>
              La Tonnara di Scopello se trouve à 40 minutes de route de l'aéroport de Palerme.
              Il est facile de louer une voiture directement depuis l'aéroport.
            </p>
            <div style={{ display: "flex", gap: "48px", flexWrap: "wrap" }}>
              {[{ nom: "AVIS", code: "T069423" }, { nom: "SIXT", code: "19451327" }].map(car => (
                <div key={car.nom}>
                  <p style={{ fontSize: "11px", letterSpacing: "0.2em", textTransform: "uppercase", fontWeight: 400, opacity: 0.38, marginBottom: "6px" }}>{car.nom}</p>
                  <p style={{ fontSize: "clamp(14px, 1.3vw, 16px)", fontWeight: 400 }}>Code promo : {car.code}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── HÔTELS ── */}
      <section style={{ borderBottom: `1px solid rgba(36,59,113,0.15)` }}>
        <div className="section-pad" style={{ paddingTop: "48px", paddingBottom: "32px" }}>
          <Reveal>
            <p style={{ fontSize: "clamp(28px, 4vw, 52px)", fontWeight: 500, letterSpacing: "-0.01em", lineHeight: 1, textTransform: "uppercase" }}>Dormir</p>
            <p style={{ fontSize: "clamp(14px, 1.8vw, 20px)", letterSpacing: "0.04em", textTransform: "uppercase", opacity: 0.4, fontWeight: 400, marginTop: "10px" }}>Hôtels</p>
          </Reveal>
        </div>
        {HOTELS.map((h, i) => (
          <HotelRow key={h.nom} hotel={h} delay={i * 50} />
        ))}
        <div style={{ borderTop: `1px solid rgba(36,59,113,0.15)` }} />
      </section>

      {/* ── AIRBNB ── */}
      <section style={{ borderBottom: `1px solid rgba(36,59,113,0.15)` }}>
        <div className="section-pad" style={{ paddingTop: "48px", paddingBottom: "32px" }}>
          <Reveal>
            <p style={{ fontSize: "clamp(28px, 4vw, 52px)", fontWeight: 500, letterSpacing: "-0.01em", lineHeight: 1, textTransform: "uppercase" }}>Dormir</p>
            <p style={{ fontSize: "clamp(14px, 1.8vw, 20px)", letterSpacing: "0.04em", textTransform: "uppercase", opacity: 0.4, fontWeight: 400, marginTop: "10px" }}>Airbnb</p>
          </Reveal>
        </div>
        {MAISONS.map((m, i) => (
          <Reveal key={m.nom} delay={i * 50}>
            <div className="maison-row" style={{ borderTop: `1px solid rgba(36,59,113,0.15)`, padding: "24px 40px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", alignItems: "center" }}>
              <p style={{ fontSize: "clamp(15px, 1.8vw, 22px)", fontWeight: 400 }}>{m.nom}</p>
              <p style={{ fontSize: "clamp(12px, 1vw, 15px)", opacity: 0.55, lineHeight: 1.6, fontWeight: 400 }}>{m.detail}</p>
            </div>
          </Reveal>
        ))}
        <div style={{ borderTop: `1px solid rgba(36,59,113,0.15)` }} />
      </section>

      {/* ── RSVP CTA ── */}
      <section style={{ padding: "80px 24px 100px", textAlign: "center" }}>
        <Reveal>
          <Link href="/rsvp" className="cta-rsvp">RSVP</Link>
        </Reveal>
      </section>

      <footer style={{ borderTop: `1px solid rgba(36,59,113,0.15)`, padding: "24px", display: "flex", justifyContent: "space-between", alignItems: "center", opacity: 0.35, marginBottom: "11px" }}>
        <span style={{ fontSize: "11px", letterSpacing: "0.15em", fontWeight: 400 }}>Ananda et Matthieu</span>
        <span style={{ fontSize: "11px", letterSpacing: "0.15em", fontWeight: 400 }}>10 · 10 · 26</span>
      </footer>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=La+Belle+Aurore&display=swap');

        @keyframes bounce {
          0%, 100% { transform: translateX(-50%) translateY(0); }
          50%       { transform: translateX(-50%) translateY(8px); }
        }

        .hero-photo {
          width: clamp(180px, 40vw, 260px);
          height: clamp(180px, 40vw, 260px);
        }

        .section-pad {
          padding-left: 40px;
          padding-right: 40px;
          padding-top: 48px;
          padding-bottom: 40px;
        }

        .hero-rsvp {
          color: #f3ecdc;
          text-decoration: none;
          font-size: 11px;
          font-weight: 400;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          border: 1px solid rgba(243,236,220,0.4);
          padding: 9px 22px;
          min-height: 40px;
          display: flex;
          align-items: center;
          transition: background 0.2s ease-out, color 0.2s ease-out, border-color 0.2s ease-out;
        }
        .hero-rsvp:hover, .hero-rsvp:active {
          background: #f3ecdc;
          color: #6B1A1A;
          border-color: #f3ecdc;
        }

        .cta-rsvp {
          display: inline-flex;
          align-items: center;
          color: ${COLOR};
          background: transparent;
          text-decoration: none;
          font-size: clamp(14px, 1.6vw, 18px);
          font-weight: 500;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          border: 1.5px solid ${COLOR};
          padding: 22px 64px;
          min-height: 60px;
          font-family: 'FT Aktual', Georgia, serif;
          transition: background 0.2s ease-out, color 0.2s ease-out;
        }
        .cta-rsvp:hover, .cta-rsvp:active {
          background: ${COLOR};
          color: ${BG};
        }
        a { -webkit-tap-highlight-color: transparent; }
        .hotel-row:active > div:last-child { opacity: 1 !important; }
        .hotel-row:active .hotel-row-inner p { color: ${BG} !important; }

        /* ── Mobile ── */
        @media (max-width: 640px) {
          .section-pad {
            padding-left: 20px;
            padding-right: 20px;
            padding-top: 32px;
            padding-bottom: 28px;
          }

          /* Panneaux programme : 2 par ligne */
          .prog-panels {
            flex-wrap: wrap !important;
          }
          .prog-panel {
            flex: 1 1 50% !important;
            min-height: 44vh !important;
            border-right: none !important;
            border-bottom: 1px solid rgba(36,59,113,0.25) !important;
          }
          .prog-panel:nth-child(odd) {
            border-right: 1px solid rgba(36,59,113,0.25) !important;
          }

          /* Hotel : une colonne */
          .hotel-row { padding: 20px 20px !important; }
          .hotel-row-inner {
            grid-template-columns: 1fr !important;
            gap: 8px !important;
          }

          /* Venir : une colonne */
          .venir-grid {
            grid-template-columns: 1fr !important;
          }
          .venir-grid > div:first-child {
            border-right: none !important;
            border-bottom: 1px solid rgba(36,59,113,0.15);
          }

          /* Maisons : une colonne */
          .maison-row {
            grid-template-columns: 1fr !important;
            gap: 6px !important;
            padding: 20px 20px !important;
          }

          .hero-photo {
            width: clamp(140px, 45vw, 220px) !important;
            height: clamp(140px, 45vw, 220px) !important;
          }
        }
      `}</style>
    </div>
  );
}
