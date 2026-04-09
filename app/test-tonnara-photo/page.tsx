"use client";

const COLOR = "#243b71";
const BG = "#f3ecdc";
const border = `1px solid rgba(36,59,113,0.15)`;
const pad = "40px";

const Label = ({ n, desc }: { n: number; desc: string }) => (
  <div style={{ padding: `32px ${pad} 12px`, fontFamily: "'FT Aktual', Georgia, serif" }}>
    <p style={{ fontSize: "11px", letterSpacing: "0.2em", textTransform: "uppercase", opacity: 0.4, color: COLOR }}>
      Option {n} — {desc}
    </p>
  </div>
);

const LeftContent = () => (
  <div style={{ padding: `48px ${pad}`, paddingTop: "48px", paddingBottom: "48px", borderRight: border, display: "flex", flexDirection: "column", gap: "28px" }}>
    <p style={{ fontSize: "clamp(28px, 4vw, 52px)", fontWeight: 500, letterSpacing: "-0.01em", textTransform: "uppercase", lineHeight: 1, color: COLOR }}>
      Tonnara di Scopello
    </p>
    <div style={{ maxWidth: "47%", display: "flex", flexDirection: "column", gap: "20px" }}>
      <p style={{ fontSize: "clamp(13px, 1.1vw, 15px)", opacity: 0.62, lineHeight: 1.8, fontWeight: 400, textAlign: "justify", color: COLOR }}>
        Le mariage aura lieu le 10.10.26 à la Tonnara di Scopello, une ancienne fabrique de thon du XVIII<sup>e</sup> siècle, située au bord de la mer. Elle se situe à 5 minutes du village de Scopello, 20 minutes de Castellammare et une heure de Palerme.
      </p>
      <a
        href="https://maps.google.com/?q=Tonnara+di+Scopello,+Castellammare+del+Golfo,+Sicily"
        target="_blank"
        rel="noopener noreferrer"
        style={{ display: "block", textDecoration: "none", overflow: "hidden", border }}
      >
        <div style={{ height: "220px", overflow: "hidden", position: "relative" }}>
          <iframe
            src="https://maps.google.com/maps?q=Tonnara+di+Scopello,+Castellammare+del+Golfo,+Sicile&t=&z=13&ie=UTF8&iwloc=B&output=embed"
            width="100%"
            height="250"
            style={{ border: 0, display: "block", filter: "grayscale(1) contrast(1.1) opacity(0.85)", marginBottom: "-30px" }}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </a>
      <p style={{ fontSize: "clamp(13px, 1.1vw, 15px)", opacity: 0.62, lineHeight: 1.8, fontWeight: 400, color: COLOR, marginTop: "4px" }}>
        Tonnara di Scopello — SP16, Contrada Scopello, 91014 Castellammare del Golfo TP, Sicile
      </p>
      <div style={{ borderTop: `1px solid rgba(36,59,113,0.12)`, paddingTop: "16px", marginTop: "4px" }}>
        <p style={{ fontSize: "11px", letterSpacing: "0.15em", textTransform: "uppercase", opacity: 0.38, fontWeight: 400, marginBottom: "8px", color: COLOR }}>Cérémonie religieuse</p>
        <p style={{ fontSize: "clamp(13px, 1.1vw, 15px)", opacity: 0.62, fontWeight: 400, lineHeight: 1.8, marginBottom: "8px", color: COLOR }}>
          Chiesa di San Giuseppe, Castellammare del Golfo
        </p>
        <a
          href="https://maps.google.com/?q=Chiesa+di+San+Giuseppe,+Castellammare+del+Golfo"
          target="_blank"
          rel="noopener noreferrer"
          style={{ fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", color: COLOR, opacity: 0.55, textDecoration: "underline", textUnderlineOffset: "3px" }}
        >
          Ouvrir dans Maps →
        </a>
      </div>
    </div>
  </div>
);

export default function TestTonnaraPhoto() {
  return (
    <div style={{ background: BG, fontFamily: "'FT Aktual', Georgia, serif", paddingBottom: "120px" }}>
      <div style={{ padding: `48px ${pad} 0` }}>
        <p style={{ fontSize: "11px", letterSpacing: "0.2em", textTransform: "uppercase", opacity: 0.35, color: COLOR }}>
          Test mise en page — Photo Tonnara (2 options)
        </p>
      </div>

      {/* ── Option 1 : photo collée à droite et en haut, plein bord ── */}
      <section style={{ borderTop: border, marginTop: "32px" }}>
        <Label n={1} desc="Photo collée à droite et en haut (plein bord)" />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 40%", borderTop: border }}>
          <LeftContent />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/tonnaradiscoppelo.jpg"
            alt="Tonnara di Scopello"
            style={{ width: "100%", objectFit: "cover", objectPosition: "center", display: "block", alignSelf: "stretch" }}
          />
        </div>
      </section>

      {/* ── Option 2 : photo plus petite, marges haut/bas, décalée à gauche ── */}
      <section style={{ borderTop: border, marginTop: "64px" }}>
        <Label n={2} desc="Photo plus petite avec marges, décalée vers la gauche" />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 40%", borderTop: border }}>
          <LeftContent />
          <div style={{ padding: "80px 64px 80px 24px" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/tonnaradiscoppelo.jpg"
              alt="Tonnara di Scopello"
              style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center", display: "block" }}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
