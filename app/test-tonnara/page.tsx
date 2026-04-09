"use client";

const COLOR = "#243b71";
const BG = "#f3ecdc";

const TEXT = "Le mariage aura lieu le 10.10.26 à la Tonnara di Scopello, une ancienne fabrique de thon du XVIIIe siècle, située au bord de la mer. Elle se situe à 5 minutes du village de Scopello, 20 minutes de Castellammare et une heure de Palerme.";

const MAP_SRC = "https://maps.google.com/maps?q=Tonnara+di+Scopello,+Castellammare+del+Golfo,+Sicile&t=&z=13&ie=UTF8&iwloc=B&output=embed";

const MapEmbed = ({ h = 200 }: { h?: number }) => (
  <a href="https://maps.google.com/?q=Tonnara+di+Scopello,+Castellammare+del+Golfo,+Sicily" target="_blank" rel="noopener noreferrer"
    style={{ display: "block", textDecoration: "none", border: `1px solid rgba(36,59,113,0.15)`, overflow: "hidden" }}>
    <div style={{ height: h, overflow: "hidden" }}>
      <iframe src={MAP_SRC} width="100%" height={h + 30}
        style={{ border: 0, display: "block", filter: "grayscale(1) contrast(1.1) opacity(0.85)", marginBottom: -30 }}
        loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
    </div>
  </a>
);

// Photo toujours en format portrait 1/3 de largeur
const Photo = ({ minH = 400 }: { minH?: number }) => (
  // eslint-disable-next-line @next/next/no-img-element
  <img src="/tonnaradiscoppelo.jpg" alt="Tonnara di Scopello"
    style={{ width: "100%", height: "100%", minHeight: minH, objectFit: "cover", objectPosition: "center", display: "block" }} />
);

const Title = ({ size = "clamp(22px, 3vw, 40px)" }) => (
  <p style={{ fontSize: size, fontWeight: 500, letterSpacing: "-0.01em", textTransform: "uppercase", lineHeight: 1, marginBottom: "16px", color: COLOR }}>
    Tonnara di Scopello
  </p>
);

const Desc = () => (
  <p style={{ fontSize: "clamp(13px, 1.1vw, 15px)", opacity: 0.62, lineHeight: 1.8, fontWeight: 400, color: COLOR }}>{TEXT}</p>
);

const Label = ({ n, desc }: { n: number; desc: string }) => (
  <div style={{ padding: "32px clamp(24px,5vw,60px) 12px", fontFamily: "'FT Aktual', Georgia, serif" }}>
    <p style={{ fontSize: "11px", letterSpacing: "0.2em", textTransform: "uppercase", opacity: 0.4, color: COLOR }}>Proposition {n} — {desc}</p>
  </div>
);

const pad = "clamp(24px, 4vw, 56px)";
const border = `1px solid rgba(36,59,113,0.15)`;

export default function TestTonnara() {
  return (
    <div style={{ background: BG, fontFamily: "'FT Aktual', Georgia, serif", paddingBottom: "120px" }}>

      <div style={{ padding: `48px ${pad} 0` }}>
        <p style={{ fontSize: "11px", letterSpacing: "0.2em", textTransform: "uppercase", opacity: 0.35, color: COLOR }}>
          Test mise en page — Tonnara di Scopello (photo 1/3)
        </p>
      </div>

      {/* ── 1 : Photo 1/3 droite, texte en haut à gauche, carte en bas à gauche ── */}
      <section style={{ borderTop: border, marginTop: "32px" }}>
        <Label n={1} desc="Texte + carte empilés à gauche, photo portrait 1/3 à droite" />
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", borderTop: border, minHeight: 420 }}>
          <div style={{ padding: `40px ${pad}`, borderRight: border, display: "flex", flexDirection: "column", gap: "24px" }}>
            <Title /><Desc />
            <MapEmbed h={200} />
          </div>
          <Photo />
        </div>
      </section>

      {/* ── 2 : Photo 1/3 droite avec marge intérieure, carte inline sous texte ── */}
      <section style={{ borderTop: border, marginTop: "64px" }}>
        <Label n={2} desc="Photo portrait avec marge intérieure, carte compacte sous texte" />
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", borderTop: border, minHeight: 420 }}>
          <div style={{ padding: `40px ${pad}`, borderRight: border, display: "flex", flexDirection: "column", gap: "20px" }}>
            <Title /><Desc />
            <MapEmbed h={160} />
          </div>
          <div style={{ padding: "32px 32px 32px 0" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/tonnaradiscoppelo.jpg" alt="Tonnara di Scopello"
              style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center", display: "block" }} />
          </div>
        </div>
      </section>

      {/* ── 3 : Carte à gauche, texte centré, photo 1/3 à droite ── */}
      <section style={{ borderTop: border, marginTop: "64px" }}>
        <Label n={3} desc="Carte gauche, texte centré, photo droite (3 colonnes)" />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", borderTop: border, minHeight: 420 }}>
          <div style={{ padding: `40px ${pad}`, borderRight: border, display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <MapEmbed h={220} />
          </div>
          <div style={{ padding: `40px ${pad}`, borderRight: border, display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <Title /><Desc />
          </div>
          <Photo />
        </div>
      </section>

      {/* ── 4 : Titre pleine largeur au dessus, puis carte + photo côte à côte ── */}
      <section style={{ borderTop: border, marginTop: "64px" }}>
        <Label n={4} desc="Titre + texte pleine largeur en haut, carte et photo côte à côte en dessous" />
        <div style={{ borderTop: border }}>
          <div style={{ padding: `40px ${pad} 32px`, borderBottom: border }}>
            <Title size="clamp(28px, 4vw, 52px)" /><Desc />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr" }}>
            <div style={{ padding: `32px ${pad}`, borderRight: border }}>
              <MapEmbed h={240} />
            </div>
            <Photo minH={240} />
          </div>
        </div>
      </section>

      {/* ── 5 : Photo 1/3 à gauche, texte + carte à droite ── */}
      <section style={{ borderTop: border, marginTop: "64px" }}>
        <Label n={5} desc="Photo portrait 1/3 à gauche, texte + carte à droite" />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", borderTop: border, minHeight: 420 }}>
          <Photo />
          <div style={{ padding: `40px ${pad}`, borderLeft: border, display: "flex", flexDirection: "column", gap: "24px" }}>
            <Title /><Desc />
            <MapEmbed h={200} />
          </div>
        </div>
      </section>

    </div>
  );
}
