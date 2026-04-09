"use client";

import { useEffect, useRef, useState } from "react";

const BG    = "#f3ecdc";
const COLOR = "#243b71";
const W = 360;
const H = 230;

const sans  = `"Helvetica Neue", Arial, sans-serif`;
const serif = `Georgia, "Times New Roman", serif`;
const bungee = `"Bungee", sans-serif`;

/* ── fond argenté sans cercles ── */
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

/* ── Bungee gras simulé : stroke + fill superposés ── */
function drawBungee(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, size: number) {
  ctx.font = `${size}px ${bungee}`;
  ctx.shadowColor = "rgba(255,255,255,0.95)"; ctx.shadowBlur = 6;
  // stroke épais pour épaissir le trait
  ctx.lineWidth = size * 0.08;
  ctx.lineJoin = "round";
  ctx.strokeStyle = "rgba(20,14,8,0.60)";
  ctx.strokeText(text, x, y);
  // fill par-dessus
  ctx.fillStyle = "rgba(20,14,8,0.60)";
  ctx.fillText(text, x, y);
  ctx.shadowBlur = 0;
}

/* ════════════════════════════
   1. BUNGEE + SERIF ITALIC
   Règle en Georgia italic léger, GRATTE ICI Bungee petit
════════════════════════════ */
function draw1(ctx: CanvasRenderingContext2D) {
  drawBungee(ctx, "10.10", W/2, H*0.40, Math.round(W*0.17));

  hairline(ctx, 0.50);

  ctx.font = `italic ${Math.round(W*0.034)}px ${serif}`;
  ctx.fillStyle = "rgba(20,14,8,0.52)";
  ctx.fillText("Trouve 3 photos d'Ananda et Matthieu pour gagner", W/2, H*0.63);

  ctx.font = `${Math.round(W*0.048)}px ${bungee}`;
  ctx.shadowColor = "rgba(255,255,255,0.95)"; ctx.shadowBlur = 5;
  ctx.fillStyle = "rgba(20,14,8,0.58)";
  ctx.fillText("GRATTE ICI  ▼", W/2, H*0.82);
  ctx.shadowBlur = 0;
}

/* ════════════════════════════
   2. BUNGEE + SANS ULTRA-FIN
   Règle Helvetica 100 aérée, GRATTE ICI sans 300 tracké
════════════════════════════ */
function draw2(ctx: CanvasRenderingContext2D) {
  drawBungee(ctx, "10.10", W/2, H*0.40, Math.round(W*0.17));

  hairline(ctx, 0.50);

  ctx.font = `100 ${Math.round(W*0.034)}px ${sans}`;
  ctx.fillStyle = "rgba(20,14,8,0.48)";
  ctx.letterSpacing = "0.05em";
  ctx.fillText("Trouve 3 photos d'Ananda et Matthieu pour gagner", W/2, H*0.63);
  ctx.letterSpacing = "0";

  ctx.font = `300 ${Math.round(W*0.044)}px ${sans}`;
  ctx.shadowColor = "rgba(255,255,255,0.95)"; ctx.shadowBlur = 5;
  ctx.fillStyle = "rgba(20,14,8,0.58)";
  ctx.letterSpacing = "0.20em";
  ctx.fillText("GRATTE ICI  ▼", W/2, H*0.82);
  ctx.letterSpacing = "0"; ctx.shadowBlur = 0;
}

/* ════════════════════════════
   3. BUNGEE + SANS 700 BOLD
   Règle sans 700 tracké, GRATTE ICI sans 900
════════════════════════════ */
function draw3(ctx: CanvasRenderingContext2D) {
  drawBungee(ctx, "10.10", W/2, H*0.40, Math.round(W*0.17));

  hairline(ctx, 0.50);

  ctx.font = `700 ${Math.round(W*0.028)}px ${sans}`;
  ctx.fillStyle = "rgba(20,14,8,0.50)";
  ctx.letterSpacing = "0.10em";
  ctx.fillText("TROUVE 3 PHOTOS D'ANANDA ET MATTHIEU", W/2, H*0.63);
  ctx.letterSpacing = "0";

  ctx.font = `900 ${Math.round(W*0.046)}px ${sans}`;
  ctx.shadowColor = "rgba(255,255,255,0.95)"; ctx.shadowBlur = 5;
  ctx.fillStyle = "rgba(20,14,8,0.65)";
  ctx.letterSpacing = "0.08em";
  ctx.fillText("GRATTE ICI  ▼", W/2, H*0.82);
  ctx.letterSpacing = "0"; ctx.shadowBlur = 0;
}

/* ════════════════════════════
   4. BUNGEE SEUL
   Tout en Bungee, hiérarchie de tailles, très cohérent
════════════════════════════ */
function draw4(ctx: CanvasRenderingContext2D) {
  drawBungee(ctx, "10.10", W/2, H*0.40, Math.round(W*0.17));

  hairline(ctx, 0.50);

  ctx.font = `${Math.round(W*0.030)}px ${bungee}`;
  ctx.fillStyle = "rgba(20,14,8,0.44)";
  ctx.fillText("TROUVE 3 PHOTOS POUR GAGNER", W/2, H*0.63);

  ctx.font = `${Math.round(W*0.048)}px ${bungee}`;
  ctx.shadowColor = "rgba(255,255,255,0.95)"; ctx.shadowBlur = 5;
  ctx.fillStyle = "rgba(20,14,8,0.60)";
  ctx.fillText("GRATTE ICI  ▼", W/2, H*0.82);
  ctx.shadowBlur = 0;
}

/* ════════════════════════════
   5. BUNGEE + SERIF ROMAIN
   Règle Georgia romain élégant, GRATTE ICI serif italic
════════════════════════════ */
function draw5(ctx: CanvasRenderingContext2D) {
  drawBungee(ctx, "10.10", W/2, H*0.40, Math.round(W*0.17));

  hairline(ctx, 0.50);

  ctx.font = `${Math.round(W*0.034)}px ${serif}`;
  ctx.fillStyle = "rgba(20,14,8,0.50)";
  ctx.fillText("Trouve 3 photos d'Ananda et Matthieu pour gagner", W/2, H*0.63);

  ctx.font = `italic bold ${Math.round(W*0.050)}px ${serif}`;
  ctx.shadowColor = "rgba(255,255,255,0.95)"; ctx.shadowBlur = 5;
  ctx.fillStyle = "rgba(20,14,8,0.60)";
  ctx.fillText("Gratte ici  ▼", W/2, H*0.82);
  ctx.shadowBlur = 0;
}

const DRAWS = [draw1, draw2, draw3, draw4, draw5];

const PROPOSALS = [
  { id:1, title:"Bungee + Serif italic",    subtitle:"Règle Georgia italic · GRATTE ICI Bungee · mélange chaud" },
  { id:2, title:"Bungee + Sans ultra-fin",  subtitle:"Règle Helvetica 100 aérée · GRATTE ICI sans 300 très tracké · épuré" },
  { id:3, title:"Bungee + Sans bold",       subtitle:"Règle sans 700 en caps · GRATTE ICI sans 900 · tout affirmé" },
  { id:4, title:"Bungee seul",              subtitle:"Tout en Bungee · hiérarchie de tailles · très cohérent" },
  { id:5, title:"Bungee + Serif romain",    subtitle:"Règle Georgia romain · GRATTE ICI serif italic · classique" },
];

function ProposalCanvas({ drawFn }: { drawFn: (ctx: CanvasRenderingContext2D) => void }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    // Attendre que Bungee soit chargée
    document.fonts.ready.then(() => {
      const ctx = drawBase(canvas);
      drawFn(ctx);
    });
  }, [drawFn]);

  return <canvas ref={ref} style={{ width:W, height:H, display:"block" }} />;
}

export default function DAProposals() {
  const [, forceRender] = useState(0);

  useEffect(() => {
    // Re-render une fois que les fonts Google sont chargées
    document.fonts.ready.then(() => forceRender(n => n + 1));
  }, []);

  return (
    <>
      {/* Chargement Bungee depuis Google Fonts */}
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Bungee&display=swap');`}</style>

      <div style={{ background:BG, minHeight:"100vh", fontFamily:"'FT Aktual', Georgia, serif", padding:"48px 24px 80px" }}>
        <p style={{ textAlign:"center", fontSize:10, letterSpacing:"0.22em", textTransform:"uppercase", opacity:0.35, color:COLOR, marginBottom:6 }}>
          Jeu à gratter — typographie Bungee
        </p>
        <h1 style={{ textAlign:"center", fontSize:"clamp(22px,3vw,34px)", fontWeight:400, color:COLOR, marginBottom:56, letterSpacing:"-0.02em" }}>
          5 propositions
        </h1>

        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:56 }}>
          {PROPOSALS.map((p, i) => (
            <div key={p.id} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:14, width:"100%", maxWidth:W+40 }}>
              <div style={{ border:`1.5px solid ${COLOR}`, overflow:"hidden", boxShadow:"0 4px 24px rgba(36,59,113,0.12)" }}>
                <ProposalCanvas drawFn={DRAWS[i]} />
              </div>
              <div style={{ textAlign:"center" }}>
                <p style={{ fontSize:14, fontWeight:500, color:COLOR, margin:"0 0 4px" }}>{p.id}. {p.title}</p>
                <p style={{ fontSize:11, opacity:0.42, color:COLOR, margin:0, maxWidth:340 }}>{p.subtitle}</p>
              </div>
            </div>
          ))}
        </div>

        <p style={{ textAlign:"center", marginTop:64, fontSize:11, color:COLOR, opacity:0.35, letterSpacing:"0.08em" }}>
          Dis-moi laquelle — ou combine des éléments.
        </p>
      </div>
    </>
  );
}
