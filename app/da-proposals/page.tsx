"use client";

import { useEffect, useRef } from "react";

const BG    = "#f3ecdc";
const COLOR = "#243b71";
const GOLD  = "#c9a84c";

const W = 340;
const H = 220;

/* ── helpers ── */
function drawText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number,
  font: string, color: string, shadowColor = "transparent", shadowBlur = 0, align: CanvasTextAlign = "center") {
  ctx.font = font;
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.shadowColor = shadowColor;
  ctx.shadowBlur = shadowBlur;
  ctx.fillText(text, x, y);
  ctx.shadowBlur = 0;
}

/* ════════════════════════════════════════════
   1. BILLET DE BANQUE GRAVÉ
════════════════════════════════════════════ */
function drawBillet(canvas: HTMLCanvasElement) {
  const dpr = window.devicePixelRatio || 1;
  canvas.width = W * dpr; canvas.height = H * dpr;
  const ctx = canvas.getContext("2d")!;
  ctx.scale(dpr, dpr);

  // Fond vert-bleu nuit
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, "#0d2b2e"); bg.addColorStop(0.5, "#143430"); bg.addColorStop(1, "#0a2030");
  ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);

  // Guilloché — spirographe entrelacé
  ctx.save();
  ctx.strokeStyle = "rgba(180,220,160,0.18)"; ctx.lineWidth = 0.6;
  for (let k = 0; k < 360; k += 3) {
    const r1 = 70, r2 = 30, r3 = 12;
    const a = (k * Math.PI) / 180;
    const x = W/2 + (r1 + r2) * Math.cos(a) + r3 * Math.cos(((r1+r2)/r2)*a);
    const y = H/2 + (r1 + r2) * Math.sin(a) + r3 * Math.sin(((r1+r2)/r2)*a);
    if (k === 0) ctx.beginPath(), ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
  // second ring
  ctx.strokeStyle = "rgba(180,220,160,0.12)"; ctx.lineWidth = 0.5;
  for (let k = 0; k < 720; k += 2) {
    const r1 = 90, r2 = 18, r3 = 8;
    const a = (k * Math.PI) / 180;
    const x = W/2 + (r1 + r2) * Math.cos(a) + r3 * Math.cos(((r1+r2)/r2)*a);
    const y = H/2 + (r1 + r2) * Math.sin(a) + r3 * Math.sin(((r1+r2)/r2)*a);
    if (k === 0) ctx.beginPath(), ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
  ctx.restore();

  // Micro-texte sur les bords
  ctx.save();
  ctx.font = "5px 'Courier New', monospace";
  ctx.fillStyle = "rgba(180,220,160,0.25)";
  ctx.textAlign = "left";
  const micro = "ANANDA·MATTHIEU·10·10·2026·SICILIA·";
  for (let i = 0; i < 30; i++) ctx.fillText(micro, -2, 8 + i * 7);
  ctx.restore();

  // Cadre double
  ctx.strokeStyle = "rgba(100,200,120,0.35)"; ctx.lineWidth = 1.5;
  ctx.strokeRect(5, 5, W-10, H-10);
  ctx.strokeStyle = "rgba(100,200,120,0.15)"; ctx.lineWidth = 0.8;
  ctx.strokeRect(9, 9, W-18, H-18);

  // Numéro de série
  ctx.font = "600 8px 'Courier New', monospace";
  ctx.fillStyle = "rgba(140,200,120,0.6)";
  ctx.textAlign = "left";
  ctx.fillText("AM26-10102026-001", 14, H - 12);

  // 10.10
  drawText(ctx, "10.10", W/2, H*0.44, `900 ${Math.round(W*0.18)}px "Helvetica Neue", Arial, sans-serif`,
    "rgba(200,240,180,0.82)", "rgba(0,80,20,0.6)", 8);

  // Filet
  ctx.strokeStyle = "rgba(140,200,120,0.3)"; ctx.lineWidth = 0.8;
  ctx.beginPath(); ctx.moveTo(W*0.2, H*0.52); ctx.lineTo(W*0.8, H*0.52); ctx.stroke();

  // Règle
  drawText(ctx, "Trouve 3 photos d'Ananda et Matthieu", W/2, H*0.63,
    `${Math.round(W*0.032)}px "Helvetica Neue", Arial, sans-serif`, "rgba(160,220,140,0.6)");
  drawText(ctx, "GRATTE ICI  ▼", W/2, H*0.82,
    `700 ${Math.round(W*0.05)}px "Helvetica Neue", Arial, sans-serif`, "rgba(180,240,160,0.8)");
}

/* ════════════════════════════════════════════
   2. ART DÉCO NOIR & OR
════════════════════════════════════════════ */
function drawArtDeco(canvas: HTMLCanvasElement) {
  const dpr = window.devicePixelRatio || 1;
  canvas.width = W * dpr; canvas.height = H * dpr;
  const ctx = canvas.getContext("2d")!;
  ctx.scale(dpr, dpr);

  // Fond noir
  ctx.fillStyle = "#0a0a0a"; ctx.fillRect(0, 0, W, H);

  // Motif de losanges en fond
  ctx.strokeStyle = "rgba(201,168,76,0.12)"; ctx.lineWidth = 0.5;
  for (let x = 0; x < W + 20; x += 20) {
    for (let y = 0; y < H + 20; y += 20) {
      ctx.save(); ctx.translate(x, y); ctx.rotate(Math.PI/4);
      ctx.strokeRect(-7, -7, 14, 14); ctx.restore();
    }
  }

  // Cadre art déco extérieur
  const gold = (a: number) => `rgba(201,168,76,${a})`;
  ctx.strokeStyle = gold(0.9); ctx.lineWidth = 2;
  ctx.strokeRect(6, 6, W-12, H-12);
  ctx.strokeStyle = gold(0.4); ctx.lineWidth = 0.7;
  ctx.strokeRect(10, 10, W-20, H-20);
  ctx.strokeStyle = gold(0.25); ctx.lineWidth = 0.5;
  ctx.strokeRect(13, 13, W-26, H-26);

  // Ornements coins — éventails
  const corners = [[16,16],[W-16,16],[16,H-16],[W-16,H-16]];
  const angles  = [[0,Math.PI/2],[Math.PI/2,Math.PI],[3*Math.PI/2,2*Math.PI],[Math.PI,3*Math.PI/2]];
  corners.forEach(([cx,cy],i) => {
    ctx.strokeStyle = gold(0.7); ctx.lineWidth = 0.8;
    for (let r = 6; r <= 18; r += 4) {
      ctx.beginPath(); ctx.arc(cx, cy, r, angles[i][0], angles[i][1]); ctx.stroke();
    }
  });

  // Lignes horizontales encadrant le texte
  ctx.strokeStyle = gold(0.5); ctx.lineWidth = 0.8;
  ctx.beginPath(); ctx.moveTo(W*0.12, H*0.28); ctx.lineTo(W*0.88, H*0.28); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(W*0.12, H*0.60); ctx.lineTo(W*0.88, H*0.60); ctx.stroke();

  // Losange central décoratif
  ctx.save();
  ctx.strokeStyle = gold(0.5); ctx.lineWidth = 0.8;
  ctx.translate(W/2, H*0.44); ctx.rotate(Math.PI/4);
  ctx.strokeRect(-5,-5,10,10);
  ctx.restore();

  // 10.10
  drawText(ctx, "10.10", W/2, H*0.50,
    `100 ${Math.round(W*0.15)}px "Helvetica Neue", Arial, sans-serif`,
    gold(0.92), "rgba(201,168,76,0.3)", 12);

  // Règle
  drawText(ctx, "Trouve 3 photos d'Ananda et Matthieu", W/2, H*0.71,
    `300 ${Math.round(W*0.030)}px "Helvetica Neue", Arial, sans-serif`,
    gold(0.55));
  drawText(ctx, "GRATTE  ICI  ▼", W/2, H*0.85,
    `400 ${Math.round(W*0.042)}px "Helvetica Neue", Arial, sans-serif`,
    gold(0.8));
}

/* ════════════════════════════════════════════
   3. TIMBRE POSTAL SICILIEN
════════════════════════════════════════════ */
function drawTimbre(canvas: HTMLCanvasElement) {
  const dpr = window.devicePixelRatio || 1;
  canvas.width = W * dpr; canvas.height = H * dpr;
  const ctx = canvas.getContext("2d")!;
  ctx.scale(dpr, dpr);

  // Fond papier vieilli
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, "#ede0c4"); bg.addColorStop(0.5, "#f5ebd4"); bg.addColorStop(1, "#e8d8b8");
  ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);

  // Grain papier
  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const d = imgData.data;
  for (let i = 0; i < d.length; i += 4) {
    const n = (Math.random()-0.5)*14;
    d[i]=Math.max(0,Math.min(255,d[i]+n)); d[i+1]=Math.max(0,Math.min(255,d[i+1]+n)); d[i+2]=Math.max(0,Math.min(255,d[i+2]+n));
  }
  ctx.putImageData(imgData, 0, 0);

  // Dentelure (bord perforé)
  const rPerf = 5;
  const drawPerf = (x1:number,y1:number,x2:number,y2:number,horiz:boolean) => {
    const len = horiz ? Math.abs(x2-x1) : Math.abs(y2-y1);
    const n = Math.floor(len / (rPerf*2.5));
    for (let i = 0; i <= n; i++) {
      const t = i / n;
      const cx2 = horiz ? x1 + t*(x2-x1) : x1;
      const cy2 = horiz ? y1 : y1 + t*(y2-y1);
      ctx.beginPath(); ctx.arc(cx2, cy2, rPerf, 0, Math.PI*2);
      ctx.fillStyle = BG; ctx.fill();
    }
  };
  drawPerf(0,0,W,0,true); drawPerf(0,H,W,H,true);
  drawPerf(0,0,0,H,false); drawPerf(W,0,W,H,false);

  // Cadre intérieur
  const m = 16;
  ctx.strokeStyle = "rgba(80,40,10,0.35)"; ctx.lineWidth = 1;
  ctx.strokeRect(m, m, W-m*2, H-m*2);

  // Cachet circulaire
  ctx.save();
  ctx.translate(W*0.78, H*0.28);
  ctx.strokeStyle = "rgba(120,20,20,0.6)"; ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.arc(0, 0, 22, 0, Math.PI*2); ctx.stroke();
  ctx.beginPath(); ctx.arc(0, 0, 18, 0, Math.PI*2); ctx.stroke();
  ctx.font = "bold 5px 'Helvetica Neue', Arial, sans-serif";
  ctx.fillStyle = "rgba(120,20,20,0.7)"; ctx.textAlign = "center";
  ctx.fillText("SICILIA", 0, -8);
  ctx.fillText("10·10·2026", 0, 2);
  ctx.fillText("PALERMO", 0, 11);
  ctx.restore();

  // Lignes de fond (comme timbres anciens)
  ctx.strokeStyle = "rgba(80,40,10,0.08)"; ctx.lineWidth = 0.5;
  for (let y = m+4; y < H-m; y += 5) {
    ctx.beginPath(); ctx.moveTo(m+2, y); ctx.lineTo(W-m-2, y); ctx.stroke();
  }

  // 10.10 — gravé en bleu-violet foncé
  drawText(ctx, "10.10", W*0.42, H*0.48,
    `900 ${Math.round(W*0.17)}px "Helvetica Neue", Arial, sans-serif`,
    "rgba(50,35,80,0.72)", "rgba(255,255,255,0.5)", 4);

  // GRATTE ICI — tamponné en rouge
  ctx.save();
  ctx.translate(W*0.42, H*0.76);
  ctx.rotate(-0.04);
  drawText(ctx, "GRATTE ICI  ▼", 0, 0,
    `700 ${Math.round(W*0.047)}px "Helvetica Neue", Arial, sans-serif`,
    "rgba(140,20,20,0.75)", "rgba(200,60,60,0.2)", 3);
  ctx.restore();

  drawText(ctx, "Trouve 3 photos d'Ananda et Matthieu", W*0.42, H*0.63,
    `${Math.round(W*0.028)}px "Helvetica Neue", Arial, sans-serif`,
    "rgba(60,40,10,0.55)");
}

/* ════════════════════════════════════════════
   4. MÉTAL INDUSTRIEL BROSSÉ
════════════════════════════════════════════ */
function drawMetal(canvas: HTMLCanvasElement) {
  const dpr = window.devicePixelRatio || 1;
  canvas.width = W * dpr; canvas.height = H * dpr;
  const ctx = canvas.getContext("2d")!;
  ctx.scale(dpr, dpr);

  // Base gris acier
  ctx.fillStyle = "#8a8a8a"; ctx.fillRect(0, 0, W, H);

  // Stries horizontales ultra-fines (métal brossé)
  for (let y = 0; y < H; y++) {
    const brightness = 0.72 + Math.sin(y * 0.15) * 0.12 + (Math.random() - 0.5) * 0.06;
    const c = Math.floor(brightness * 200);
    ctx.fillStyle = `rgb(${c},${c},${c+4})`;
    ctx.fillRect(0, y, W, 1);
  }

  // Reflet lumineux central horizontal
  const reflet = ctx.createLinearGradient(0, H*0.3, 0, H*0.7);
  reflet.addColorStop(0,   "rgba(255,255,255,0)");
  reflet.addColorStop(0.3, "rgba(255,255,255,0.18)");
  reflet.addColorStop(0.5, "rgba(255,255,255,0.32)");
  reflet.addColorStop(0.7, "rgba(255,255,255,0.18)");
  reflet.addColorStop(1,   "rgba(255,255,255,0)");
  ctx.fillStyle = reflet; ctx.fillRect(0, 0, W, H);

  // Cadre biseauté
  ctx.strokeStyle = "rgba(255,255,255,0.7)"; ctx.lineWidth = 1.5;
  ctx.strokeRect(4, 4, W-8, H-8);
  ctx.strokeStyle = "rgba(0,0,0,0.4)"; ctx.lineWidth = 1.5;
  ctx.strokeRect(6, 6, W-12, H-12);
  ctx.strokeStyle = "rgba(255,255,255,0.3)"; ctx.lineWidth = 0.8;
  ctx.strokeRect(8, 8, W-16, H-16);

  // 10.10 — très grand, gravé
  drawText(ctx, "10.10", W/2, H*0.44,
    `900 ${Math.round(W*0.19)}px "Helvetica Neue", Arial, sans-serif`,
    "rgba(30,30,30,0.60)", "rgba(255,255,255,0.9)", 8);

  // Filet gravé
  ctx.strokeStyle = "rgba(0,0,0,0.2)"; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(W*0.15, H*0.54); ctx.lineTo(W*0.85, H*0.54); ctx.stroke();
  ctx.strokeStyle = "rgba(255,255,255,0.5)"; ctx.lineWidth = 0.5;
  ctx.beginPath(); ctx.moveTo(W*0.15, H*0.545); ctx.lineTo(W*0.85, H*0.545); ctx.stroke();

  drawText(ctx, "Trouve 3 photos d'Ananda et Matthieu", W/2, H*0.65,
    `${Math.round(W*0.03)}px "Helvetica Neue", Arial, sans-serif`,
    "rgba(30,30,30,0.5)", "rgba(255,255,255,0.6)", 2);

  drawText(ctx, "GRATTE ICI  ▼", W/2, H*0.82,
    `800 ${Math.round(W*0.05)}px "Helvetica Neue", Arial, sans-serif`,
    "rgba(20,20,20,0.65)", "rgba(255,255,255,0.9)", 6);
}

/* ════════════════════════════════════════════
   5. MARBRE ROSE & OR MÉDITERRANÉEN
════════════════════════════════════════════ */
function drawMarbre(canvas: HTMLCanvasElement) {
  const dpr = window.devicePixelRatio || 1;
  canvas.width = W * dpr; canvas.height = H * dpr;
  const ctx = canvas.getContext("2d")!;
  ctx.scale(dpr, dpr);

  // Fond marbre blanc-rose
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0,   "#f5ede8");
  bg.addColorStop(0.3, "#efe0d8");
  bg.addColorStop(0.6, "#f8f0eb");
  bg.addColorStop(1,   "#e8d8d0");
  ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);

  // Veines de marbre
  ctx.save();
  const drawVein = (x0:number,y0:number,angle:number,len:number,color:string,width:number) => {
    ctx.strokeStyle = color; ctx.lineWidth = width;
    ctx.beginPath(); ctx.moveTo(x0, y0);
    let x=x0, y=y0, a=angle;
    for (let i=0; i<len; i+=4) {
      a += (Math.random()-0.5)*0.3;
      x += Math.cos(a)*4; y += Math.sin(a)*4;
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  };
  drawVein(0,  H*0.3, 0.2, W*1.4, "rgba(180,140,130,0.25)", 1.2);
  drawVein(W*0.2, 0, 1.4, H*1.5, "rgba(160,120,110,0.18)", 0.8);
  drawVein(W*0.6, 0, 1.5, H*1.3, "rgba(200,160,150,0.20)", 1.5);
  drawVein(0, H*0.7, 0.1, W*1.3, "rgba(170,130,120,0.15)", 0.6);
  ctx.restore();

  // Cadre or
  const gold = (a:number) => `rgba(180,140,60,${a})`;
  ctx.strokeStyle = gold(0.8); ctx.lineWidth = 1.5;
  ctx.strokeRect(5, 5, W-10, H-10);
  ctx.strokeStyle = gold(0.4); ctx.lineWidth = 0.8;
  ctx.strokeRect(9, 9, W-18, H-18);

  // Ornements coins — feuilles d'olivier stylisées
  const leaf = (cx:number,cy:number,flip:boolean) => {
    ctx.save(); ctx.translate(cx,cy); if(flip) ctx.scale(-1,1);
    ctx.fillStyle = gold(0.55);
    for (let i=0; i<3; i++) {
      ctx.save(); ctx.rotate((i-1)*0.4);
      ctx.beginPath(); ctx.ellipse(0,-8-i*4, 2, 5, 0, 0, Math.PI*2); ctx.fill();
      ctx.restore();
    }
    ctx.restore();
  };
  leaf(18, 18, false); leaf(W-18, 18, true);
  leaf(18, H-18, false); leaf(W-18, H-18, true);

  // 10.10 — serif fin or foncé
  drawText(ctx, "10.10", W/2, H*0.44,
    `300 ${Math.round(W*0.16)}px Georgia, serif`,
    "rgba(120,85,30,0.82)", "rgba(255,240,200,0.7)", 6);

  // Filet or
  ctx.strokeStyle = gold(0.45); ctx.lineWidth = 0.8;
  ctx.beginPath(); ctx.moveTo(W*0.22, H*0.52); ctx.lineTo(W*0.78, H*0.52); ctx.stroke();

  drawText(ctx, "Trouve 3 photos d'Ananda et Matthieu", W/2, H*0.64,
    `${Math.round(W*0.028)}px Georgia, serif`,
    "rgba(100,70,30,0.6)");

  drawText(ctx, "GRATTE ICI  ▼", W/2, H*0.82,
    `400 ${Math.round(W*0.045)}px Georgia, serif`,
    "rgba(130,90,25,0.8)", "rgba(255,240,200,0.5)", 3);
}

/* ════════════════════════════════════════════
   Page
════════════════════════════════════════════ */
const PROPOSALS = [
  { id: 1, title: "Billet de banque gravé",       subtitle: "Fond vert nuit · guilloché · micro-texte · numéro de série", draw: drawBillet },
  { id: 2, title: "Art déco noir & or",            subtitle: "Fond noir · ornements géométriques dorés · années 20",       draw: drawArtDeco },
  { id: 3, title: "Timbre postal sicilien",        subtitle: "Dentelure · cachet Sicilia · tampon rouge · papier vieilli",  draw: drawTimbre },
  { id: 4, title: "Métal industriel brossé",       subtitle: "Stries horizontales · aluminium réaliste · gravure relief",  draw: drawMetal },
  { id: 5, title: "Marbre rose & or méditerranéen",subtitle: "Veines de marbre · cadre or · feuilles d'olivier · serif",   draw: drawMarbre },
];

function ProposalCanvas({ draw }: { draw: (c: HTMLCanvasElement) => void }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => { if (ref.current) draw(ref.current); }, [draw]);
  return (
    <canvas ref={ref}
      style={{ width: W, height: H, display: "block", borderRadius: 2 }}
    />
  );
}

export default function DAProposals() {
  return (
    <div style={{
      background: BG, minHeight: "100vh",
      fontFamily: "'FT Aktual', Georgia, serif",
      padding: "48px 24px 64px",
    }}>
      <p style={{ textAlign:"center", fontSize:11, letterSpacing:"0.2em", textTransform:"uppercase", opacity:0.4, color:COLOR, marginBottom:8 }}>
        Jeu à gratter — propositions DA
      </p>
      <h1 style={{ textAlign:"center", fontSize:"clamp(28px,4vw,42px)", fontWeight:400, color:COLOR, marginBottom:56, letterSpacing:"-0.02em" }}>
        5 propositions de couverture
      </h1>

      <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:56 }}>
        {PROPOSALS.map(p => (
          <div key={p.id} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:16, width:"100%", maxWidth: W+40 }}>
            <div style={{
              border: `1.5px solid ${COLOR}`,
              overflow: "hidden",
              boxShadow: "0 4px 24px rgba(36,59,113,0.12)",
            }}>
              <ProposalCanvas draw={p.draw} />
            </div>
            <div style={{ textAlign:"center" }}>
              <p style={{ fontSize:16, fontWeight:500, color:COLOR, letterSpacing:"0.01em", margin:"0 0 4px" }}>
                {p.id}. {p.title}
              </p>
              <p style={{ fontSize:12, opacity:0.5, color:COLOR, letterSpacing:"0.04em", margin:0 }}>
                {p.subtitle}
              </p>
            </div>
          </div>
        ))}
      </div>

      <p style={{ textAlign:"center", marginTop:64, fontSize:13, color:COLOR, opacity:0.45, letterSpacing:"0.05em" }}>
        Dis-moi laquelle tu préfères — ou combine des éléments de plusieurs.
      </p>
    </div>
  );
}
