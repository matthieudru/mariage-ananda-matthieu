"use client";

import { useEffect, useRef } from "react";

const BG    = "#f3ecdc";
const COLOR = "#243b71";

const W = 360;
const H = 230;

/* ── fond argenté commun (identique à la vraie carte) ── */
function drawSilverBase(ctx: CanvasRenderingContext2D, w: number, h: number, canvas: HTMLCanvasElement) {
  const grad = ctx.createLinearGradient(0, 0, w, h);
  grad.addColorStop(0,    "#a4a09a");
  grad.addColorStop(0.15, "#d0ccc4");
  grad.addColorStop(0.3,  "#e8e4de");
  grad.addColorStop(0.5,  "#c8c4bc");
  grad.addColorStop(0.7,  "#dedad4");
  grad.addColorStop(0.85, "#c0bcb4");
  grad.addColorStop(1,    "#acaaa2");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  for (let y = 0; y < h; y++) {
    const a = 0.012 + Math.abs(Math.sin(y * 0.09)) * 0.05;
    ctx.fillStyle = `rgba(255,255,255,${a.toFixed(3)})`;
    ctx.fillRect(0, y, w, 1);
  }

  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const d = imgData.data;
  for (let i = 0; i < d.length; i += 4) {
    const n = (Math.random() - 0.5) * 22;
    d[i]   = Math.max(0, Math.min(255, d[i]   + n));
    d[i+1] = Math.max(0, Math.min(255, d[i+1] + n));
    d[i+2] = Math.max(0, Math.min(255, d[i+2] + n));
  }
  ctx.putImageData(imgData, 0, 0);
}

const sans  = `"Helvetica Neue", "Arial", sans-serif`;
const serif = `Georgia, "Times New Roman", serif`;

/* ════════════════════════════════════════════
   1. GÉANT + MURMURE
   "10.10" ultra-thin énorme, "gratte ici" minuscule bold
   coin bas droit. Un seul trait diagonal.
════════════════════════════════════════════ */
function draw1(canvas: HTMLCanvasElement) {
  const dpr = window.devicePixelRatio || 1;
  canvas.width = W*dpr; canvas.height = H*dpr;
  const ctx = canvas.getContext("2d")!;
  ctx.scale(dpr, dpr);
  drawSilverBase(ctx, W, H, canvas);

  // Trait diagonal fin
  ctx.strokeStyle = "rgba(20,14,8,0.12)"; ctx.lineWidth = 0.8;
  ctx.beginPath(); ctx.moveTo(0, H*0.15); ctx.lineTo(W, H*0.85); ctx.stroke();

  // "10.10" ultra-thin, énorme, centré légèrement haut
  ctx.textAlign = "center";
  ctx.font = `100 ${Math.round(H*0.72)}px ${sans}`;
  ctx.fillStyle = "rgba(20,14,8,0.58)";
  ctx.shadowColor = "rgba(255,255,255,0.9)"; ctx.shadowBlur = 8;
  ctx.fillText("10.10", W/2, H*0.72);
  ctx.shadowBlur = 0;

  // Hairline horizontale basse
  ctx.strokeStyle = "rgba(20,14,8,0.18)"; ctx.lineWidth = 0.7;
  ctx.beginPath(); ctx.moveTo(W*0.06, H*0.86); ctx.lineTo(W*0.94, H*0.86); ctx.stroke();

  // "gratte ici ↓" minuscule bold bas droit
  ctx.textAlign = "right";
  ctx.font = `700 9px ${sans}`;
  ctx.fillStyle = "rgba(20,14,8,0.55)";
  ctx.letterSpacing = "0.18em";
  ctx.fillText("GRATTE ICI  ↓", W*0.94, H*0.93);
  ctx.letterSpacing = "0";

  // "trouve 3 photos d'ananda & matthieu" bas gauche, minuscule italic
  ctx.textAlign = "left";
  ctx.font = `300 italic 8px ${serif}`;
  ctx.fillStyle = "rgba(20,14,8,0.38)";
  ctx.fillText("trouve 3 photos d'ananda & matthieu", W*0.06, H*0.93);
}

/* ════════════════════════════════════════════
   2. SPLIT POIDS
   "10" massif noir à gauche, hairline verticale,
   ".10" ultra-fin à droite. Asymétrie intentionnelle.
════════════════════════════════════════════ */
function draw2(canvas: HTMLCanvasElement) {
  const dpr = window.devicePixelRatio || 1;
  canvas.width = W*dpr; canvas.height = H*dpr;
  const ctx = canvas.getContext("2d")!;
  ctx.scale(dpr, dpr);
  drawSilverBase(ctx, W, H, canvas);

  // Hairline verticale
  ctx.strokeStyle = "rgba(20,14,8,0.20)"; ctx.lineWidth = 0.8;
  ctx.beginPath(); ctx.moveTo(W*0.52, H*0.08); ctx.lineTo(W*0.52, H*0.88); ctx.stroke();

  // "10" — noir 900 left
  ctx.textAlign = "right";
  ctx.font = `900 ${Math.round(H*0.65)}px ${sans}`;
  ctx.fillStyle = "rgba(20,14,8,0.72)";
  ctx.shadowColor = "rgba(255,255,255,0.7)"; ctx.shadowBlur = 4;
  ctx.fillText("10", W*0.50, H*0.70);
  ctx.shadowBlur = 0;

  // ".10" — ultra-thin right
  ctx.textAlign = "left";
  ctx.font = `100 ${Math.round(H*0.65)}px ${sans}`;
  ctx.fillStyle = "rgba(20,14,8,0.45)";
  ctx.fillText(".10", W*0.54, H*0.70);

  // Règle bas gauche
  ctx.textAlign = "left";
  ctx.font = `700 8px ${sans}`;
  ctx.fillStyle = "rgba(20,14,8,0.50)";
  ctx.letterSpacing = "0.14em";
  ctx.fillText("GRATTE ICI ↓", W*0.06, H*0.92);
  ctx.letterSpacing = "0";

  // Règle bas droite
  ctx.textAlign = "right";
  ctx.font = `300 8px ${sans}`;
  ctx.fillStyle = "rgba(20,14,8,0.38)";
  ctx.fillText("3 photos à trouver", W*0.94, H*0.92);
}

/* ════════════════════════════════════════════
   3. BLOC INVERSÉ
   Rectangle sombre au centre avec "10.10" en clair.
   Textes hors bloc en small caps espacés.
════════════════════════════════════════════ */
function draw3(canvas: HTMLCanvasElement) {
  const dpr = window.devicePixelRatio || 1;
  canvas.width = W*dpr; canvas.height = H*dpr;
  const ctx = canvas.getContext("2d")!;
  ctx.scale(dpr, dpr);
  drawSilverBase(ctx, W, H, canvas);

  // Bloc foncé central
  const bx = W*0.08, by = H*0.20, bw = W*0.84, bh = H*0.50;
  ctx.fillStyle = "rgba(18,12,6,0.72)";
  ctx.fillRect(bx, by, bw, bh);

  // "10.10" clair dans le bloc
  ctx.textAlign = "center";
  ctx.font = `900 ${Math.round(bh*0.80)}px ${sans}`;
  ctx.fillStyle = "rgba(232,228,220,0.92)";
  ctx.shadowColor = "rgba(0,0,0,0.4)"; ctx.shadowBlur = 0;
  ctx.fillText("10.10", W/2, by + bh*0.77);

  // Hairlines au-dessus et en-dessous du bloc
  ctx.strokeStyle = "rgba(20,14,8,0.22)"; ctx.lineWidth = 0.7;
  ctx.beginPath(); ctx.moveTo(W*0.08, H*0.16); ctx.lineTo(W*0.92, H*0.16); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(W*0.08, H*0.76); ctx.lineTo(W*0.92, H*0.76); ctx.stroke();

  // Texte haut
  ctx.font = `400 8px ${sans}`;
  ctx.fillStyle = "rgba(20,14,8,0.45)";
  ctx.letterSpacing = "0.22em";
  ctx.fillText("ANANDA  &  MATTHIEU", W/2, H*0.12);
  ctx.letterSpacing = "0";

  // Texte bas — deux côtés
  ctx.textAlign = "left";
  ctx.font = `700 8px ${sans}`;
  ctx.fillStyle = "rgba(20,14,8,0.52)";
  ctx.letterSpacing = "0.14em";
  ctx.fillText("GRATTE ICI ↓", W*0.09, H*0.90);
  ctx.letterSpacing = "0";

  ctx.textAlign = "right";
  ctx.font = `300 italic 8px ${serif}`;
  ctx.fillStyle = "rgba(20,14,8,0.40)";
  ctx.fillText("3 photos à trouver", W*0.91, H*0.90);
}

/* ════════════════════════════════════════════
   4. CONDENSÉ EN BANDEAUX
   3 bandes horizontales pleine largeur,
   alternance noir / vide / noir, typographies contrastées.
════════════════════════════════════════════ */
function draw4(canvas: HTMLCanvasElement) {
  const dpr = window.devicePixelRatio || 1;
  canvas.width = W*dpr; canvas.height = H*dpr;
  const ctx = canvas.getContext("2d")!;
  ctx.scale(dpr, dpr);
  drawSilverBase(ctx, W, H, canvas);

  const bands = [
    { y: H*0.14, h: H*0.24, fill: "rgba(18,12,6,0.70)" },
    { y: H*0.38, h: H*0.10, fill: "rgba(18,12,6,0.12)" },
    { y: H*0.48, h: H*0.24, fill: "rgba(18,12,6,0.70)" },
  ];
  for (const b of bands) {
    ctx.fillStyle = b.fill;
    ctx.fillRect(0, b.y, W, b.h);
  }

  // "10" bande 1 — ultra-condensed
  ctx.textAlign = "center";
  ctx.font = `900 ${Math.round(H*0.22)}px ${sans}`;
  ctx.fillStyle = "rgba(230,224,216,0.95)";
  ctx.letterSpacing = "0.25em";
  ctx.fillText("10", W/2, bands[0].y + bands[0].h*0.76);
  ctx.letterSpacing = "0";

  // Bande 2 — fine règle
  ctx.font = `300 8px ${sans}`;
  ctx.fillStyle = "rgba(20,14,8,0.50)";
  ctx.letterSpacing = "0.20em";
  ctx.fillText("ANANDA  ·  MATTHIEU  ·  SICILE", W/2, bands[1].y + bands[1].h*0.72);
  ctx.letterSpacing = "0";

  // ".10" bande 3 — thin inversé
  ctx.font = `100 ${Math.round(H*0.22)}px ${sans}`;
  ctx.fillStyle = "rgba(230,224,216,0.85)";
  ctx.fillText(".10", W/2, bands[2].y + bands[2].h*0.76);

  // Bas de page
  ctx.textAlign = "left";
  ctx.font = `700 8px ${sans}`;
  ctx.fillStyle = "rgba(20,14,8,0.50)";
  ctx.letterSpacing = "0.14em";
  ctx.fillText("GRATTE ICI ↓", W*0.06, H*0.94);
  ctx.letterSpacing = "0";

  ctx.textAlign = "right";
  ctx.font = `300 8px ${sans}`;
  ctx.fillStyle = "rgba(20,14,8,0.38)";
  ctx.fillText("3 photos · 1 gagnant", W*0.94, H*0.94);
}

/* ════════════════════════════════════════════
   5. KINÉTIQUE DIAGONAL
   "10.10" pivoté ~20° traverse la carte en diagonale.
   Tout le reste est minuscule, ancré aux bords.
════════════════════════════════════════════ */
function draw5(canvas: HTMLCanvasElement) {
  const dpr = window.devicePixelRatio || 1;
  canvas.width = W*dpr; canvas.height = H*dpr;
  const ctx = canvas.getContext("2d")!;
  ctx.scale(dpr, dpr);
  drawSilverBase(ctx, W, H, canvas);

  // "10.10" diagonal
  ctx.save();
  ctx.translate(W*0.50, H*0.52);
  ctx.rotate(-0.30);
  ctx.textAlign = "center";
  ctx.font = `900 ${Math.round(H*0.58)}px ${sans}`;
  ctx.fillStyle = "rgba(20,14,8,0.60)";
  ctx.shadowColor = "rgba(255,255,255,0.85)"; ctx.shadowBlur = 10;
  ctx.fillText("10.10", 0, 0);
  ctx.shadowBlur = 0;
  ctx.restore();

  // Coin haut gauche — petite étiquette
  ctx.textAlign = "left";
  ctx.font = `300 italic 8px ${serif}`;
  ctx.fillStyle = "rgba(20,14,8,0.40)";
  ctx.fillText("ananda & matthieu", W*0.06, H*0.12);

  // Coin bas droit — GRATTE ICI
  ctx.textAlign = "right";
  ctx.font = `700 9px ${sans}`;
  ctx.fillStyle = "rgba(20,14,8,0.55)";
  ctx.letterSpacing = "0.14em";
  ctx.fillText("GRATTE ICI ↘", W*0.94, H*0.93);
  ctx.letterSpacing = "0";

  // Hairline bas
  ctx.strokeStyle = "rgba(20,14,8,0.15)"; ctx.lineWidth = 0.7;
  ctx.beginPath(); ctx.moveTo(W*0.06, H*0.86); ctx.lineTo(W*0.94, H*0.86); ctx.stroke();

  // "3 photos" bas gauche
  ctx.textAlign = "left";
  ctx.font = `400 8px ${sans}`;
  ctx.fillStyle = "rgba(20,14,8,0.38)";
  ctx.fillText("3 photos à trouver", W*0.06, H*0.93);
}

/* ════════════════════════════════════════════
   Page
════════════════════════════════════════════ */
const PROPOSALS = [
  { id: 1, title: "Géant + Murmure",       subtitle: "10.10 ultra-thin énorme · gratte ici minuscule bold · diagonal · contraste extrême de taille", draw: draw1 },
  { id: 2, title: "Split Poids",            subtitle: "«10» noir 900 à gauche · hairline verticale · «.10» ultra-thin à droite · tension asymétrique", draw: draw2 },
  { id: 3, title: "Bloc Inversé",           subtitle: "Rectangle sombre encadrant «10.10» en clair · textes extérieurs en small caps espacés", draw: draw3 },
  { id: 4, title: "Bandeaux Condensés",     subtitle: "3 bandes pleine largeur · alternance noir/vide · typographies contrastées · très éditorial", draw: draw4 },
  { id: 5, title: "Kinétique Diagonal",     subtitle: "«10.10» pivoté traverse la carte · tout le reste minuscule aux coins · énergie en mouvement", draw: draw5 },
];

function ProposalCanvas({ draw }: { draw: (c: HTMLCanvasElement) => void }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => { if (ref.current) draw(ref.current); }, [draw]);
  return <canvas ref={ref} style={{ width: W, height: H, display: "block" }} />;
}

export default function DAProposals() {
  return (
    <div style={{
      background: BG, minHeight: "100vh",
      fontFamily: "'FT Aktual', Georgia, serif",
      padding: "48px 24px 80px",
    }}>
      <p style={{ textAlign:"center", fontSize:10, letterSpacing:"0.22em", textTransform:"uppercase", opacity:0.35, color:COLOR, marginBottom:6 }}>
        Jeu à gratter — couverture argentée
      </p>
      <h1 style={{ textAlign:"center", fontSize:"clamp(24px,3.5vw,38px)", fontWeight:400, color:COLOR, marginBottom:12, letterSpacing:"-0.02em" }}>
        5 propositions DA
      </h1>
      <p style={{ textAlign:"center", fontSize:11, opacity:0.4, color:COLOR, marginBottom:56, letterSpacing:"0.04em" }}>
        Fond argenté conservé · typo &amp; mise en page Hervé Paris
      </p>

      <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:64 }}>
        {PROPOSALS.map(p => (
          <div key={p.id} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:14, width:"100%", maxWidth: W+40 }}>
            <div style={{
              border: `1.5px solid ${COLOR}`,
              overflow: "hidden",
              boxShadow: "0 4px 28px rgba(36,59,113,0.13)",
            }}>
              <ProposalCanvas draw={p.draw} />
            </div>
            <div style={{ textAlign:"center" }}>
              <p style={{ fontSize:15, fontWeight:500, color:COLOR, letterSpacing:"0.01em", margin:"0 0 5px" }}>
                {p.id}. {p.title}
              </p>
              <p style={{ fontSize:11, opacity:0.45, color:COLOR, letterSpacing:"0.03em", margin:0, maxWidth:320 }}>
                {p.subtitle}
              </p>
            </div>
          </div>
        ))}
      </div>

      <p style={{ textAlign:"center", marginTop:72, fontSize:12, color:COLOR, opacity:0.38, letterSpacing:"0.08em" }}>
        Dis-moi laquelle — ou ce que tu veux combiner.
      </p>
    </div>
  );
}
