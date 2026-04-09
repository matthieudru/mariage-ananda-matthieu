"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";

const COLOR = "#243b71";
const BG    = "#f3ecdc";
const GOLD  = "#c9a84c";

/* ─── Photos ─────────────────────────────
   Décommenter pour ajouter des amis
───────────────────────────────────────── */
const COUPLE_PHOTO  = "/couple.png";
const AMI1_PHOTO    = "/ami1.png";
// Ajouter d'autres amis ici : const AMI2_PHOTO = "/ami2.png"; etc.

const COLS         = 6;
const ROWS         = 3;
const GRID_SIZE    = COLS * ROWS; // 18
const COUPLE_COUNT = 3;

type Cell = { src: string; rotation: number };

function buildGrid(): Cell[] {
  // 3 photos du couple + le reste rempli avec ami1
  const srcs: string[] = [
    ...Array(COUPLE_COUNT).fill(COUPLE_PHOTO),
    ...Array(GRID_SIZE - COUPLE_COUNT).fill(AMI1_PHOTO),
  ];
  // Mélange Fisher-Yates
  for (let i = srcs.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [srcs[i], srcs[j]] = [srcs[j], srcs[i]];
  }
  // Rotation aléatoire ±16° pour chaque photo
  return srcs.map(src => ({
    src,
    rotation: (Math.random() - 0.5) * 32,
  }));
}

/* ─────────────────────────────────────────
   Jeu de grattage
───────────────────────────────────────── */
function ScratchCard({ onWin }: { onWin: () => void }) {
  const canvasRef      = useRef<HTMLCanvasElement>(null);
  const fwCanvasRef    = useRef<HTMLCanvasElement>(null);
  const scratchZoneRef = useRef<HTMLDivElement>(null);
  const isDown         = useRef(false);
  const didReveal      = useRef(false);
  const lastCheck      = useRef(0);
  const [grid]         = useState<Cell[]>(() => buildGrid());

  /* ── Indices des cellules couple ── */
  const coupleIndices = grid
    .map((cell, i) => cell.src === COUPLE_PHOTO ? i : -1)
    .filter(i => i !== -1);

  /* ── Feu d'artifice (lent) ── */
  const launchFireworks = useCallback(() => {
    const fw = fwCanvasRef.current;
    if (!fw) return;
    fw.width  = window.innerWidth;
    fw.height = window.innerHeight;
    const ctx = fw.getContext("2d")!;

    type P = { x:number; y:number; vx:number; vy:number; alpha:number; color:string; r:number };
    const particles: P[] = [];
    const colors = [GOLD, COLOR, "#c0392b", "#ffffff", "#e8d5a3", "#9b59b6"];

    const card = scratchZoneRef.current?.getBoundingClientRect();
    const cx = card ? (card.left + card.right) / 2 : window.innerWidth / 2;
    const cy = card ? (card.top  + card.bottom) / 2 : window.innerHeight / 2;
    const rx = card ? card.width  / 2 + 20 : 200;
    const ry = card ? card.height / 2 + 20 : 150;

    for (let burst = 0; burst < 12; burst++) {
      const angle = (burst / 12) * Math.PI * 2;
      const bx = cx + Math.cos(angle) * rx * (0.8 + Math.random() * 0.5);
      const by = cy + Math.sin(angle) * ry * (0.8 + Math.random() * 0.5);
      for (let i = 0; i < 18; i++) {
        const a = Math.random() * Math.PI * 2;
        const spd = 0.2 + Math.random() * 0.9; // très lent
        particles.push({ x:bx, y:by, vx:Math.cos(a)*spd, vy:Math.sin(a)*spd,
          alpha:1, color:colors[Math.floor(Math.random()*colors.length)], r:2+Math.random()*3 });
      }
    }

    let frame = 0;
    function animate() {
      if (!fw) return;
      if (frame > 500) { ctx.clearRect(0,0,fw.width,fw.height); return; }
      ctx.clearRect(0,0,fw.width,fw.height);
      for (const p of particles) {
        p.x += p.vx; p.y += p.vy;
        p.vy += 0.008; // gravité très réduite
        p.alpha -= 0.0018; // disparition très lente
        if (p.alpha <= 0) continue;
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI*2); ctx.fill();
      }
      ctx.globalAlpha = 1;
      frame++;
      requestAnimationFrame(animate);
    }
    animate();
  }, []);

  /* ── Init couche métallique ── */
  useEffect(() => {
    const canvas = canvasRef.current;
    const zone   = scratchZoneRef.current;
    if (!canvas || !zone) return;

    const draw = () => {
      const rect = zone.getBoundingClientRect();
      if (!rect.width || !rect.height) return;

      const dpr = window.devicePixelRatio || 1;
      canvas.width  = rect.width  * dpr;
      canvas.height = rect.height * dpr;

      const ctx = canvas.getContext("2d")!;
      ctx.scale(dpr, dpr);
      const W = rect.width;
      const H = rect.height;

      /* Gradient argenté */
      const grad = ctx.createLinearGradient(0, 0, W, H);
      grad.addColorStop(0,    "#a4a09a");
      grad.addColorStop(0.15, "#d0ccc4");
      grad.addColorStop(0.3,  "#e8e4de");
      grad.addColorStop(0.5,  "#c8c4bc");
      grad.addColorStop(0.7,  "#dedad4");
      grad.addColorStop(0.85, "#c0bcb4");
      grad.addColorStop(1,    "#acaaa2");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);

      /* Reflets */
      for (let y = 0; y < H; y++) {
        const a = 0.012 + Math.abs(Math.sin(y * 0.09)) * 0.05;
        ctx.fillStyle = `rgba(255,255,255,${a.toFixed(3)})`;
        ctx.fillRect(0, y, W, 1);
      }

      /* Grain */
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const d = imgData.data;
      for (let i = 0; i < d.length; i += 4) {
        const n = (Math.random() - 0.5) * 22;
        d[i]   = Math.max(0, Math.min(255, d[i]   + n));
        d[i+1] = Math.max(0, Math.min(255, d[i+1] + n));
        d[i+2] = Math.max(0, Math.min(255, d[i+2] + n));
      }
      ctx.putImageData(imgData, 0, 0);

      /* Double cadre gravé */
      ctx.strokeStyle = "rgba(60,50,40,0.2)"; ctx.lineWidth = 1.5;
      ctx.strokeRect(6, 6, W - 12, H - 12);
      ctx.strokeStyle = "rgba(255,255,255,0.28)"; ctx.lineWidth = 1;
      ctx.strokeRect(8, 8, W - 16, H - 16);

      /* ── Textes sur la couche ── */
      ctx.textAlign = "center";
      const cx = W / 2;
      const bungee = `"Bungee", sans-serif`;
      const sans   = `"Helvetica Neue", "Arial", sans-serif`;

      /* helper Bungee gras : stroke + fill */
      const drawBungee = (text: string, x: number, y: number, size: number) => {
        ctx.font = `${size}px ${bungee}`;
        ctx.shadowColor = "rgba(255,255,255,0.95)"; ctx.shadowBlur = 6;
        ctx.lineWidth = size * 0.08; ctx.lineJoin = "round";
        ctx.strokeStyle = "rgba(20,14,8,0.60)";
        ctx.strokeText(text, x, y);
        ctx.fillStyle = "rgba(20,14,8,0.60)";
        ctx.fillText(text, x, y);
        ctx.shadowBlur = 0;
      };

      /* "10/10" — Bungee gras */
      const fsBig = Math.max(32, Math.round(W * 0.16));
      drawBungee("10/10", cx, H * 0.37, fsBig);

      /* Filet */
      const lw = W * 0.28;
      ctx.strokeStyle = "rgba(60,50,40,0.18)"; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(cx - lw, H * 0.44); ctx.lineTo(cx + lw, H * 0.44); ctx.stroke();

      /* Règle — sans 700 tracké caps (option 3) */
      const fsRule = Math.max(9, Math.round(W * 0.028));
      ctx.font = `700 ${fsRule}px ${sans}`;
      ctx.shadowColor = "rgba(255,255,255,0.7)"; ctx.shadowBlur = 2;
      ctx.fillStyle = "rgba(20,14,8,0.50)";
      ctx.letterSpacing = "0.10em";
      ctx.fillText("TROUVE 3 PHOTOS D'ANANDA ET MATTHIEU", cx, H * 0.56);
      ctx.letterSpacing = "0"; ctx.shadowBlur = 0;

      /* "GRATTE ICI ▼" — Bungee gras */
      const fsGratte = Math.max(14, Math.round(W * 0.052));
      drawBungee("GRATTE ICI  ▼", cx, H * 0.78, fsGratte);
    };

    // Charger Bungee puis dessiner
    document.fonts.load(`16px "Bungee"`).then(() => {
      requestAnimationFrame(draw);
    });
  }, []);

  /* ── Grattage ──
     IMPORTANT : après ctx.scale(dpr,dpr), le repère est en px CSS.
     Les coords clientX/Y - rect sont déjà en px CSS → pas de * dpr.
     Le rayon est en px CSS : 20 (mouse) / 28 (touch). */
  const doScratch = useCallback((clientX: number, clientY: number, radius: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx  = canvas.getContext("2d")!;
    const rect = canvas.getBoundingClientRect();

    // Coordonnées en px CSS (pas de multiplication DPR — ctx.scale l'a déjà appliqué)
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.save();
    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    if (didReveal.current) return;
    const now = Date.now();
    if (now - lastCheck.current < 250) return;
    lastCheck.current = now;

    const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    const cW = canvas.width;
    const cH = canvas.height;
    const cellW = cW / COLS;
    const cellH = cH / ROWS;

    // Vérifie si toutes les cellules couple sont grattées à > 55%
    const allRevealed = coupleIndices.every(idx => {
      const col = idx % COLS;
      const row = Math.floor(idx / COLS);
      const x0 = Math.floor(col * cellW);
      const y0 = Math.floor(row * cellH);
      const x1 = Math.floor((col + 1) * cellW);
      const y1 = Math.floor((row + 1) * cellH);
      let transparent = 0;
      let total = 0;
      for (let py = y0; py < y1; py++) {
        for (let px = x0; px < x1; px++) {
          total++;
          if (data[(py * cW + px) * 4 + 3] < 128) transparent++;
        }
      }
      return total > 0 && (transparent / total) > 0.55;
    });

    if (allRevealed) {
      didReveal.current = true;
      onWin();
      setTimeout(() => launchFireworks(), 400);
    }
  }, [coupleIndices, launchFireworks, onWin]);

  const onMouseDown  = (e: React.MouseEvent) => { isDown.current = true;  doScratch(e.clientX, e.clientY, 20); };
  const onMouseMove  = (e: React.MouseEvent) => { if (isDown.current) doScratch(e.clientX, e.clientY, 20); };
  const onMouseUp    = () => { isDown.current = false; };
  const onTouchStart = (e: React.TouchEvent) => { e.preventDefault(); isDown.current = true;  doScratch(e.touches[0].clientX, e.touches[0].clientY, 28); };
  const onTouchMove  = (e: React.TouchEvent) => { e.preventDefault(); if (isDown.current) doScratch(e.touches[0].clientX, e.touches[0].clientY, 28); };
  const onTouchEnd   = () => { isDown.current = false; };

  return (
    <div style={{ textAlign: "center", userSelect: "none" }}>

      {/* Canvas feu d'artifice — plein écran fixe, pointer-events none */}
      <canvas ref={fwCanvasRef} style={{
        position: "fixed", inset: 0, zIndex: 100,
        pointerEvents: "none", width: "100%", height: "100%",
      }} />

      {/* ═══ BILLET — juste la zone de grattage ═══ */}
      <div style={{
        display: "inline-block",
        width: "min(520px, 92vw)",
        fontFamily: "'FT Aktual', Georgia, serif",
        border: `2px solid ${COLOR}`,
        overflow: "hidden",
        boxShadow: "0 6px 32px rgba(36,59,113,0.18)",
      }}>
        <div ref={scratchZoneRef} style={{ position: "relative", cursor: "crosshair" }}>

          {/* Grille de photos */}
          <div style={{
            display: "grid",
            gridTemplateColumns: `repeat(${COLS}, 1fr)`,
            gap: "2px",
            background: "rgba(36,59,113,0.1)",
          }}>
            {grid.map((cell, idx) => (
              <div key={idx} style={{ aspectRatio: "3 / 4", overflow: "hidden", background: BG }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={cell.src} alt=""
                  style={{
                    width: "100%", height: "100%",
                    objectFit: "cover", display: "block",
                    transform: `rotate(${cell.rotation}deg) scale(1.35)`,
                    transformOrigin: "center",
                  }}
                />
              </div>
            ))}
          </div>

          {/* Canvas métallique par-dessus */}
          <canvas
            ref={canvasRef}
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", touchAction: "none" }}
            onMouseDown={onMouseDown} onMouseMove={onMouseMove}
            onMouseUp={onMouseUp} onMouseLeave={onMouseUp}
            onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}
          />
        </div>
      </div>
      {/* ═══ FIN BILLET ═══ */}

    </div>
  );
}

/* ─────────────────────────────────────────
   Page Grazie
───────────────────────────────────────── */
export default function GraziePage() {
  const [showGame, setShowGame] = useState(false);
  const [won,      setWon]      = useState(false);
  const [prenom,   setPrenom]   = useState("");

  useEffect(() => {
    const p = new URLSearchParams(window.location.search).get("prenom") || "";
    setPrenom(p);
  }, []);

  return (
    <>
    <style>{`@import url('https://fonts.googleapis.com/css2?family=Bungee&display=swap');`}</style>
    <div style={{
      background: BG, height: "100vh",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "space-between",
      fontFamily: "'FT Aktual', Georgia, serif",
      padding: "48px 24px 24px",
      overflow: "hidden",
    }}>
      {/* Overlay jeu — fixe, ne déplace pas la page */}
      {showGame && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 50,
          background: BG,
          display: "flex", flexDirection: "column", alignItems: "center",
          overflowY: "auto", padding: "20px 20px 24px",
        }}>
          {/* Espace au-dessus de la carte — BRAVO centré dedans */}
          <div style={{ flex: 2, display: "flex", alignItems: "center", justifyContent: "center", width: "100%", paddingBottom: "clamp(8px, 2vh, 24px)" }}>
            {won && (
              <div style={{
                fontSize: "clamp(40px, 8vw, 72px)",
                color: COLOR,
                fontFamily: "'Bungee', sans-serif",
                WebkitTextStroke: "1px rgba(36,59,113,0.3)",
                animation: "bravoIn 0.5s cubic-bezier(0.34,1.56,0.64,1) both",
              }}>
                BRAVO
              </div>
            )}
          </div>

          {/* Carte à gratter */}
          <ScratchCard onWin={() => setWon(true)} />

          {/* Boutons en dessous */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "12px", width: "100%" }}>
            <button onClick={() => { setShowGame(false); setWon(false); }} className="grazie-btn grazie-btn-blue">
              Fermer
            </button>
            <a href="https://www.ungrandjour.com/fr/ananda-matthieu" target="_blank" rel="noopener noreferrer" className="grazie-btn grazie-btn-red">
              Liste de mariage
            </a>
          </div>
        </div>
      )}

      <div style={{
        flex: 1, display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "space-evenly",
      }}>
        <button onClick={() => setShowGame(true)} className="grazie-btn grazie-btn-blue">
          Jouer
        </button>

        <div style={{ textAlign: "center", width: "100%" }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:"12px" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/Sun.png" alt="" className="grazie-sun" style={{ width:"clamp(64px,11vw,140px)", height:"auto", flexShrink:0 }} />
            <div className="grazie-names">
              <p style={{ fontSize:"clamp(48px,9vw,110px)", fontWeight:500, letterSpacing:"-0.03em", lineHeight:0.95, color:COLOR }}>Grazie</p>
              {prenom && (
                <p className="grazie-prenom" style={{ fontSize:"clamp(40px,8vw,100px)", fontWeight:500, letterSpacing:"-0.03em", lineHeight:0.95, color:COLOR }}>{prenom}</p>
              )}
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/Sun.png" alt="" className="grazie-sun" style={{ width:"clamp(64px,11vw,140px)", height:"auto", flexShrink:0 }} />
          </div>
        </div>

        <a href="https://www.ungrandjour.com/fr/ananda-matthieu" target="_blank" rel="noopener noreferrer" className="grazie-btn grazie-btn-red">
          Liste de mariage
        </a>
      </div>

      <Link href="/" style={{
        fontSize:"11px", letterSpacing:"0.2em",
        textTransform:"uppercase", opacity:0.38, color:COLOR,
        textDecoration:"none", fontFamily:"'FT Aktual', Georgia, serif",
      }}>
        ← Retour à l&apos;accueil
      </Link>

      <style>{`
        .grazie-btn {
          display: inline-flex; align-items: center; justify-content: center;
          text-decoration: none; font-family: 'FT Aktual', Georgia, serif;
          font-size: clamp(12px, 1.3vw, 15px); font-weight: 400;
          letter-spacing: 0.2em; text-transform: uppercase;
          border: 1.5px solid; padding: 15px 0; width: clamp(200px, 20vw, 280px);
          white-space: nowrap;
          transition: background 0.2s ease-out, color 0.2s ease-out;
          cursor: pointer; background: ${BG};
        }
        .grazie-btn-red  { color: #6B1A1A; border-color: #6B1A1A; }
        .grazie-btn-red:hover,  .grazie-btn-red:active  { background: #6B1A1A; color: ${BG}; }
        .grazie-btn-blue { color: ${COLOR}; border-color: ${COLOR}; }
        .grazie-btn-blue:hover, .grazie-btn-blue:active { background: ${COLOR}; color: ${BG}; }
        @media (max-width: 640px) { .grazie-sun { width: 56px !important; } }
        /* Desktop : Grazie + prénom sur la même ligne */
        @media (min-width: 641px) {
          .grazie-names { display: flex; align-items: baseline; gap: 0.18em; }
          .grazie-prenom { font-size: clamp(40px, 8vw, 100px) !important; }
        }
        @keyframes bravoIn {
          0%   { opacity: 0; transform: scale(0.5); }
          100% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
    </>
  );
}
