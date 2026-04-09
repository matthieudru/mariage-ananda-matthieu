"use client";

import { useEffect, useRef } from "react";

const BG    = "#f3ecdc";
const COLOR = "#243b71";
const W = 360;
const H = 230;

const sans  = `"Helvetica Neue", Arial, sans-serif`;
const serif = `Georgia, "Times New Roman", serif`;

/* ── fond argenté identique à la vraie carte ── */
function drawBase(canvas: HTMLCanvasElement): CanvasRenderingContext2D {
  const dpr = window.devicePixelRatio || 1;
  canvas.width = W * dpr; canvas.height = H * dpr;
  const ctx = canvas.getContext("2d")!;
  ctx.scale(dpr, dpr);

  const grad = ctx.createLinearGradient(0, 0, W, H);
  grad.addColorStop(0,    "#a4a09a");
  grad.addColorStop(0.15, "#d0ccc4");
  grad.addColorStop(0.3,  "#e8e4de");
  grad.addColorStop(0.5,  "#c8c4bc");
  grad.addColorStop(0.7,  "#dedad4");
  grad.addColorStop(0.85, "#c0bcb4");
  grad.addColorStop(1,    "#acaaa2");
  ctx.fillStyle = grad; ctx.fillRect(0, 0, W, H);

  for (let y = 0; y < H; y++) {
    const a = 0.012 + Math.abs(Math.sin(y * 0.09)) * 0.05;
    ctx.fillStyle = `rgba(255,255,255,${a.toFixed(3)})`;
    ctx.fillRect(0, y, W, 1);
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

  // Cercles concentriques
  ctx.strokeStyle = "rgba(60,50,40,0.08)"; ctx.lineWidth = 0.8;
  for (let r = 20; r < Math.max(W, H) * 0.7; r += 16) {
    ctx.beginPath(); ctx.arc(W/2, H/2, r, 0, Math.PI*2); ctx.stroke();
  }
  // Double cadre
  ctx.strokeStyle = "rgba(60,50,40,0.2)"; ctx.lineWidth = 1.5;
  ctx.strokeRect(6, 6, W-12, H-12);
  ctx.strokeStyle = "rgba(255,255,255,0.28)"; ctx.lineWidth = 1;
  ctx.strokeRect(8, 8, W-16, H-16);

  ctx.textAlign = "center";
  return ctx;
}

function hairline(ctx: CanvasRenderingContext2D, yFrac: number) {
  const lw = W * 0.28;
  ctx.strokeStyle = "rgba(60,50,40,0.18)"; ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(W/2 - lw, H * yFrac);
  ctx.lineTo(W/2 + lw, H * yFrac);
  ctx.stroke();
}

/* ════════════════════════════
   1. SERIF CLASSIQUE
   10.10 en serif léger élégant,
   règle en italic serif, GRATTE ICI small caps espacé
════════════════════════════ */
function draw1(canvas: HTMLCanvasElement) {
  const ctx = drawBase(canvas);

  // 10.10 — serif light large
  ctx.font = `300 ${Math.round(W*0.18)}px ${serif}`;
  ctx.shadowColor = "rgba(255,255,255,0.95)"; ctx.shadowBlur = 6;
  ctx.fillStyle = "rgba(20,14,8,0.58)";
  ctx.fillText("10.10", W/2, H*0.40);
  ctx.shadowBlur = 0;

  hairline(ctx, 0.50);

  // Règle — italic serif
  ctx.font = `italic ${Math.round(W*0.033)}px ${serif}`;
  ctx.fillStyle = "rgba(20,14,8,0.44)";
  ctx.fillText("Trouve 3 photos d'Ananda et Matthieu pour gagner", W/2, H*0.62);

  // GRATTE ICI — serif 400 très espacé
  ctx.font = `400 ${Math.round(W*0.048)}px ${serif}`;
  ctx.shadowColor = "rgba(255,255,255,0.95)"; ctx.shadowBlur = 5;
  ctx.fillStyle = "rgba(20,14,8,0.65)";
  ctx.letterSpacing = "0.18em";
  ctx.fillText("GRATTE ICI  ▼", W/2, H*0.81);
  ctx.letterSpacing = "0"; ctx.shadowBlur = 0;
}

/* ════════════════════════════
   2. HELVETICA ULTRA-FIN
   10.10 weight 100 très grand,
   règle 300 aéré, GRATTE ICI 600 tracké
════════════════════════════ */
function draw2(canvas: HTMLCanvasElement) {
  const ctx = drawBase(canvas);

  ctx.font = `100 ${Math.round(W*0.20)}px ${sans}`;
  ctx.shadowColor = "rgba(255,255,255,0.95)"; ctx.shadowBlur = 6;
  ctx.fillStyle = "rgba(20,14,8,0.50)";
  ctx.fillText("10.10", W/2, H*0.40);
  ctx.shadowBlur = 0;

  hairline(ctx, 0.50);

  ctx.font = `300 ${Math.round(W*0.031)}px ${sans}`;
  ctx.fillStyle = "rgba(20,14,8,0.40)";
  ctx.letterSpacing = "0.04em";
  ctx.fillText("Trouve 3 photos d'Ananda et Matthieu pour gagner", W/2, H*0.62);
  ctx.letterSpacing = "0";

  ctx.font = `600 ${Math.round(W*0.050)}px ${sans}`;
  ctx.shadowColor = "rgba(255,255,255,0.95)"; ctx.shadowBlur = 5;
  ctx.fillStyle = "rgba(20,14,8,0.65)";
  ctx.letterSpacing = "0.12em";
  ctx.fillText("GRATTE ICI  ▼", W/2, H*0.81);
  ctx.letterSpacing = "0"; ctx.shadowBlur = 0;
}

/* ════════════════════════════
   3. SERIF BOLD CONTRASTÉ
   10.10 en serif bold très affirmé,
   règle fine sans-serif, GRATTE ICI serif italic
════════════════════════════ */
function draw3(canvas: HTMLCanvasElement) {
  const ctx = drawBase(canvas);

  ctx.font = `bold ${Math.round(W*0.15)}px ${serif}`;
  ctx.shadowColor = "rgba(255,255,255,0.95)"; ctx.shadowBlur = 6;
  ctx.fillStyle = "rgba(20,14,8,0.62)";
  ctx.fillText("10.10", W/2, H*0.40);
  ctx.shadowBlur = 0;

  hairline(ctx, 0.50);

  ctx.font = `${Math.round(W*0.030)}px ${sans}`;
  ctx.fillStyle = "rgba(20,14,8,0.42)";
  ctx.letterSpacing = "0.06em";
  ctx.fillText("Trouve 3 photos d'Ananda et Matthieu pour gagner", W/2, H*0.62);
  ctx.letterSpacing = "0";

  ctx.font = `italic bold ${Math.round(W*0.050)}px ${serif}`;
  ctx.shadowColor = "rgba(255,255,255,0.95)"; ctx.shadowBlur = 5;
  ctx.fillStyle = "rgba(20,14,8,0.65)";
  ctx.fillText("Gratte ici  ▼", W/2, H*0.81);
  ctx.shadowBlur = 0;
}

/* ════════════════════════════
   4. SANS-SERIF 900 / PROPORTIONS AÉRÉES
   10.10 en sans 900 mais plus petit + beaucoup d'air,
   règle très fine et légère, GRATTE ICI 900 tracké
════════════════════════════ */
function draw4(canvas: HTMLCanvasElement) {
  const ctx = drawBase(canvas);

  ctx.font = `900 ${Math.round(W*0.13)}px ${sans}`;
  ctx.shadowColor = "rgba(255,255,255,0.95)"; ctx.shadowBlur = 6;
  ctx.fillStyle = "rgba(20,14,8,0.56)";
  ctx.fillText("10.10", W/2, H*0.38);
  ctx.shadowBlur = 0;

  // Double hairline
  hairline(ctx, 0.48);
  const lw = W * 0.28;
  ctx.strokeStyle = "rgba(60,50,40,0.10)"; ctx.lineWidth = 0.5;
  ctx.beginPath(); ctx.moveTo(W/2-lw, H*0.51); ctx.lineTo(W/2+lw, H*0.51); ctx.stroke();

  ctx.font = `200 ${Math.round(W*0.028)}px ${sans}`;
  ctx.fillStyle = "rgba(20,14,8,0.38)";
  ctx.letterSpacing = "0.08em";
  ctx.fillText("Trouve 3 photos d'Ananda et Matthieu pour gagner", W/2, H*0.63);
  ctx.letterSpacing = "0";

  ctx.font = `900 ${Math.round(W*0.048)}px ${sans}`;
  ctx.shadowColor = "rgba(255,255,255,0.95)"; ctx.shadowBlur = 5;
  ctx.fillStyle = "rgba(20,14,8,0.62)";
  ctx.letterSpacing = "0.16em";
  ctx.fillText("GRATTE ICI  ▼", W/2, H*0.82);
  ctx.letterSpacing = "0"; ctx.shadowBlur = 0;
}

/* ════════════════════════════
   5. MIXTE ÉLÉGANT
   10.10 en sans 900 large + petit ornement "·" de chaque côté,
   règle en serif italic, GRATTE ICI sans 700 normal
════════════════════════════ */
function draw5(canvas: HTMLCanvasElement) {
  const ctx = drawBase(canvas);

  // Petits ornements flanquant 10.10
  ctx.font = `300 ${Math.round(W*0.04)}px ${serif}`;
  ctx.fillStyle = "rgba(20,14,8,0.30)";
  ctx.fillText("· · ·", W/2, H*0.26);

  ctx.font = `900 ${Math.round(W*0.17)}px ${sans}`;
  ctx.shadowColor = "rgba(255,255,255,0.95)"; ctx.shadowBlur = 6;
  ctx.fillStyle = "rgba(20,14,8,0.60)";
  ctx.fillText("10.10", W/2, H*0.42);
  ctx.shadowBlur = 0;

  hairline(ctx, 0.52);

  ctx.font = `italic ${Math.round(W*0.032)}px ${serif}`;
  ctx.fillStyle = "rgba(20,14,8,0.44)";
  ctx.fillText("Trouve 3 photos d'Ananda et Matthieu pour gagner", W/2, H*0.64);

  ctx.font = `700 ${Math.round(W*0.050)}px ${sans}`;
  ctx.shadowColor = "rgba(255,255,255,0.95)"; ctx.shadowBlur = 5;
  ctx.fillStyle = "rgba(20,14,8,0.65)";
  ctx.letterSpacing = "0.06em";
  ctx.fillText("GRATTE ICI  ▼", W/2, H*0.82);
  ctx.letterSpacing = "0"; ctx.shadowBlur = 0;
}

/* ════════════════════════════
   Page
════════════════════════════ */
const PROPOSALS = [
  { id:1, title:"Serif Classique",         subtitle:"10.10 en serif léger · règle italic serif · GRATTE ICI small caps espacé",         draw:draw1 },
  { id:2, title:"Helvetica Ultra-fin",      subtitle:"10.10 weight 100 grand · règle 300 aérée · GRATTE ICI 600 tracké",                 draw:draw2 },
  { id:3, title:"Serif Bold Contrasté",     subtitle:"10.10 serif bold affirmé · règle sans-serif fine · GRATTE ICI serif italic",        draw:draw3 },
  { id:4, title:"Sans 900 Aéré",            subtitle:"10.10 sans 900 plus petit + double hairline · règle 200 légère · GRATTE ICI 900",   draw:draw4 },
  { id:5, title:"Mixte Élégant",            subtitle:"ornements · · · flanquant 10.10 sans 900 · règle italic serif · GRATTE ICI 700",   draw:draw5 },
];

function ProposalCanvas({ draw }: { draw: (c: HTMLCanvasElement) => void }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => { if (ref.current) draw(ref.current); }, [draw]);
  return <canvas ref={ref} style={{ width:W, height:H, display:"block" }} />;
}

export default function DAProposals() {
  return (
    <div style={{ background:BG, minHeight:"100vh", fontFamily:"'FT Aktual', Georgia, serif", padding:"48px 24px 80px" }}>
      <p style={{ textAlign:"center", fontSize:10, letterSpacing:"0.22em", textTransform:"uppercase", opacity:0.35, color:COLOR, marginBottom:6 }}>
        Jeu à gratter — typographie
      </p>
      <h1 style={{ textAlign:"center", fontSize:"clamp(24px,3.5vw,36px)", fontWeight:400, color:COLOR, marginBottom:56, letterSpacing:"-0.02em" }}>
        5 propositions
      </h1>

      <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:56 }}>
        {PROPOSALS.map(p => (
          <div key={p.id} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:14, width:"100%", maxWidth:W+40 }}>
            <div style={{ border:`1.5px solid ${COLOR}`, overflow:"hidden", boxShadow:"0 4px 24px rgba(36,59,113,0.12)" }}>
              <ProposalCanvas draw={p.draw} />
            </div>
            <div style={{ textAlign:"center" }}>
              <p style={{ fontSize:14, fontWeight:500, color:COLOR, margin:"0 0 4px" }}>{p.id}. {p.title}</p>
              <p style={{ fontSize:11, opacity:0.42, color:COLOR, margin:0, maxWidth:320 }}>{p.subtitle}</p>
            </div>
          </div>
        ))}
      </div>

      <p style={{ textAlign:"center", marginTop:64, fontSize:11, color:COLOR, opacity:0.35, letterSpacing:"0.08em" }}>
        Dis-moi laquelle — ou combine des éléments.
      </p>
    </div>
  );
}
