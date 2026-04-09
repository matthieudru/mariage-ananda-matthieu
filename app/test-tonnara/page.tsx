"use client";

const COLOR = "#243b71";
const BG = "#f3ecdc";

const TEXT = <>Le mariage aura lieu le 10.10.26 à la Tonnara di Scopello, une ancienne fabrique de thon du XVIII<sup>e</sup> siècle, située au bord de la mer. Elle se situe à 5 minutes du village de Scopello, 20 minutes de Castellammare et une heure de Palerme.</>;

const MAP = (
  <div style={{ overflow: "hidden", position: "relative" }}>
    <iframe
      src="https://maps.google.com/maps?q=Tonnara+di+Scopello,+Castellammare+del+Golfo,+Sicile&t=&z=13&ie=UTF8&iwloc=B&output=embed"
      width="100%" height="250"
      style={{ border: 0, display: "block", filter: "grayscale(1) contrast(1.1) opacity(0.85)", marginBottom: "-30px" }}
      loading="lazy" referrerPolicy="no-referrer-when-downgrade"
    />
  </div>
);

const PHOTO = (h: string, pos = "center") => (
  // eslint-disable-next-line @next/next/no-img-element
  <img src="/tonnaradiscoppelo.jpg" alt="Tonnara di Scopello"
    style={{ width: "100%", height: h, objectFit: "cover", objectPosition: pos, display: "block" }} />
);

const TITLE = (
  <p style={{ fontSize: "clamp(24px, 3.5vw, 48px)", fontWeight: 500, letterSpacing: "-0.01em", textTransform: "uppercase", lineHeight: 1, marginBottom: "20px", color: COLOR }}>
    Tonnara di Scopello
  </p>
);

const DESC = (
  <p style={{ fontSize: "clamp(13px, 1.1vw, 15px)", opacity: 0.62, lineHeight: 1.8, fontWeight: 400, color: COLOR }}>
    {TEXT}
  </p>
);

const label = (n: number, desc: string) => (
  <div style={{ padding: "12px 0 8px", fontFamily: "'FT Aktual', Georgia, serif" }}>
    <p style={{ fontSize: "11px", letterSpacing: "0.2em", textTransform: "uppercase", opacity: 0.4, color: COLOR }}>Proposition {n} — {desc}</p>
  </div>
);

const PAD = "clamp(24px, 4vw, 60px)";

export default function TestTonnara() {
  return (
    <div style={{ background: BG, fontFamily: "'FT Aktual', Georgia, serif", paddingBottom: "120px" }}>

      <div style={{ padding: "48px clamp(24px,5vw,80px) 0" }}>
        <p style={{ fontSize: "11px", letterSpacing: "0.2em", textTransform: "uppercase", opacity: 0.35, color: COLOR }}>Test mise en page — Tonnara di Scopello</p>
      </div>

      {/* ── 1 : Texte gauche, photo droite pleine hauteur, carte en bas du texte ── */}
      <section style={{ borderTop: `1px solid rgba(36,59,113,0.15)`, marginTop: "32px" }}>
        {label(1, "Photo pleine hauteur à droite, texte + carte à gauche")}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 45%", borderTop: `1px solid rgba(36,59,113,0.15)` }}>
          <div style={{ padding: `40px ${PAD}`, borderRight: `1px solid rgba(36,59,113,0.15)`, display: "flex", flexDirection: "column", gap: "24px" }}>
            {TITLE}{DESC}
            <div style={{ overflow: "hidden", border: `1px solid rgba(36,59,113,0.15)` }}>
              {MAP}
            </div>
          </div>
          <div>{PHOTO("100%")}</div>
        </div>
      </section>

      {/* ── 2 : Photo centrée en haut pleine largeur, texte + carte en dessous côte à côte ── */}
      <section style={{ borderTop: `1px solid rgba(36,59,113,0.15)`, marginTop: "64px" }}>
        {label(2, "Photo bannière en haut, texte + carte en dessous")}
        <div style={{ borderTop: `1px solid rgba(36,59,113,0.15)` }}>
          <div style={{ height: "340px", overflow: "hidden" }}>{PHOTO("340px")}</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", borderTop: `1px solid rgba(36,59,113,0.15)` }}>
            <div style={{ padding: `40px ${PAD}`, borderRight: `1px solid rgba(36,59,113,0.15)` }}>{TITLE}{DESC}</div>
            <div style={{ padding: `40px ${PAD}` }}>
              <div style={{ overflow: "hidden", border: `1px solid rgba(36,59,113,0.15)` }}>{MAP}</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3 : Photo portrait avec marge à droite, texte en haut à gauche, carte en bas à gauche ── */}
      <section style={{ borderTop: `1px solid rgba(36,59,113,0.15)`, marginTop: "64px" }}>
        {label(3, "Photo portrait avec espace (marge), texte + carte empilés à gauche")}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 36%", borderTop: `1px solid rgba(36,59,113,0.15)` }}>
          <div style={{ padding: `40px ${PAD}`, borderRight: `1px solid rgba(36,59,113,0.15)`, display: "flex", flexDirection: "column", gap: "24px" }}>
            {TITLE}{DESC}
            <div style={{ overflow: "hidden", border: `1px solid rgba(36,59,113,0.15)` }}>{MAP}</div>
          </div>
          <div style={{ padding: "40px 40px 40px 0" }}>
            {PHOTO("100%")}
          </div>
        </div>
      </section>

      {/* ── 4 : Superposition — grand texte sur fond photo ── */}
      <section style={{ borderTop: `1px solid rgba(36,59,113,0.15)`, marginTop: "64px" }}>
        {label(4, "Texte superposé sur photo (overlay)")}
        <div style={{ borderTop: `1px solid rgba(36,59,113,0.15)`, position: "relative", minHeight: "480px", overflow: "hidden" }}>
          <div style={{ position: "absolute", inset: 0 }}>{PHOTO("100%")}</div>
          <div style={{ position: "absolute", inset: 0, background: "rgba(243,236,220,0.82)" }} />
          <div style={{ position: "relative", zIndex: 2, display: "grid", gridTemplateColumns: "1fr 1fr" }}>
            <div style={{ padding: `56px ${PAD}` }}>
              <p style={{ fontSize: "clamp(24px, 3.5vw, 48px)", fontWeight: 500, letterSpacing: "-0.01em", textTransform: "uppercase", lineHeight: 1, marginBottom: "20px", color: COLOR }}>Tonnara di Scopello</p>
              <p style={{ fontSize: "clamp(13px, 1.1vw, 15px)", opacity: 0.72, lineHeight: 1.8, fontWeight: 400, color: COLOR }}>{TEXT}</p>
            </div>
            <div style={{ padding: `56px ${PAD} 56px 0` }}>
              <div style={{ overflow: "hidden", border: `1px solid rgba(36,59,113,0.25)` }}>{MAP}</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 5 : 3 colonnes — carte | texte centré | photo ── */}
      <section style={{ borderTop: `1px solid rgba(36,59,113,0.15)`, marginTop: "64px" }}>
        {label(5, "3 colonnes : carte — texte centré — photo")}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", borderTop: `1px solid rgba(36,59,113,0.15)`, minHeight: "400px" }}>
          <div style={{ padding: `40px ${PAD}`, borderRight: `1px solid rgba(36,59,113,0.15)`, display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <div style={{ overflow: "hidden", border: `1px solid rgba(36,59,113,0.15)` }}>{MAP}</div>
          </div>
          <div style={{ padding: `40px ${PAD}`, borderRight: `1px solid rgba(36,59,113,0.15)`, display: "flex", flexDirection: "column", justifyContent: "center" }}>
            {TITLE}{DESC}
          </div>
          <div>{PHOTO("100%")}</div>
        </div>
      </section>

    </div>
  );
}
