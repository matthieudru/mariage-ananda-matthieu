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
function ScratchCard({ onClose }: { onClose: () => void }) {
  const canvasRef      = useRef<HTMLCanvasElement>(null);
  const scratchZoneRef = useRef<HTMLDivElement>(null);
  const isDown         = useRef(false);
  const wonRef         = useRef(false);
  const lastCheck      = useRef(0);
  const [grid]         = useState<Cell[]>(() => buildGrid());

  /* ── Init couche métallique ── */
  useEffect(() => {
    const canvas = canvasRef.current;
    const zone   = scratchZoneRef.current;
    if (!canvas || !zone) return;

    requestAnimationFrame(() => {
      const rect = zone.getBoundingClientRect();
      if (!rect.width || !rect.height) return;

      const dpr = window.devicePixelRatio || 1;
      canvas.width  = rect.width  * dpr;
      canvas.height = rect.height * dpr;

      const ctx = canvas.getContext("2d")!;
      ctx.scale(dpr, dpr);
      const W = rect.width;
      const H = rect.height;

      /* Gradient argenté diagonal */
      const grad = ctx.createLinearGradient(0, 0, W, H);
      grad.addColorStop(0,    "#a4a09a");
      grad.addColorStop(0.12, "#ccc8c0");
      grad.addColorStop(0.28, "#e4e0da");
      grad.addColorStop(0.44, "#c8c4bc");
      grad.addColorStop(0.58, "#dedad6");
      grad.addColorStop(0.72, "#c0bcb4");
      grad.addColorStop(0.86, "#d4d0c8");
      grad.addColorStop(1,    "#acaaa2");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);

      /* Reflets horizontaux fins */
      for (let y = 0; y < H; y++) {
        const a = 0.015 + Math.abs(Math.sin(y * 0.09)) * 0.055;
        ctx.fillStyle = `rgba(255,255,255,${a.toFixed(3)})`;
        ctx.fillRect(0, y, W, 1);
      }

      /* Grain */
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const d = imgData.data;
      for (let i = 0; i < d.length; i += 4) {
        const n = (Math.random() - 0.5) * 24;
        d[i]   = Math.max(0, Math.min(255, d[i]   + n));
        d[i+1] = Math.max(0, Math.min(255, d[i+1] + n));
        d[i+2] = Math.max(0, Math.min(255, d[i+2] + n));
      }
      ctx.putImageData(imgData, 0, 0);

      /* Cercles concentriques décoratifs centrés */
      const cx = W / 2, cy = H / 2;
      ctx.strokeStyle = "rgba(60,50,40,0.1)";
      ctx.lineWidth = 0.8;
      for (let r = 18; r < Math.max(W, H) * 0.65; r += 14) {
        ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
      }

      /* Double cadre gravé */
      ctx.strokeStyle = "rgba(60,50,40,0.22)"; ctx.lineWidth = 1.5;
      ctx.strokeRect(7, 7, W - 14, H - 14);
      ctx.strokeStyle = "rgba(255,255,255,0.3)"; ctx.lineWidth = 1;
      ctx.strokeRect(9, 9, W - 18, H - 18);

      /* Textes */
      ctx.textAlign = "center";

      /* Ligne 1-2 : instruction */
      const fs1 = Math.max(12, Math.round(W * 0.044));
      ctx.font = `italic ${fs1}px Georgia, serif`;
      ctx.shadowColor = "rgba(255,255,255,0.8)"; ctx.shadowBlur = 3;
      ctx.fillStyle = "rgba(30,22,14,0.62)";
      ctx.fillText("Trouve 3 photos d'Ananda", cx, cy - 26);
      ctx.fillText("et Matthieu pour gagner", cx, cy - 4);

      /* Séparateur orné */
      ctx.shadowBlur = 0;
      const lw = W * 0.32;
      ctx.strokeStyle = "rgba(60,50,40,0.25)"; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(cx - lw, cy + 10); ctx.lineTo(cx - 12, cy + 10); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx + 12, cy + 10); ctx.lineTo(cx + lw, cy + 10); ctx.stroke();
      ctx.fillStyle = "rgba(60,50,40,0.3)";
      ctx.font = `${Math.round(fs1 * 0.7)}px Georgia, serif`;
      ctx.fillText("✦", cx, cy + 14);

      /* Ligne 3 : Gratte ici — dominant */
      const fs2 = Math.max(16, Math.round(W * 0.058));
      ctx.font = `bold ${fs2}px Georgia, serif`;
      ctx.shadowColor = "rgba(255,255,255,0.9)"; ctx.shadowBlur = 4;
      ctx.fillStyle = "rgba(30,22,14,0.72)";
      ctx.letterSpacing = "0.05em";
      ctx.fillText("GRATTE ICI ▼", cx, cy + 38);
      ctx.shadowBlur = 0;
    });
  }, []);

  /* ── Grattage ── */
  const doScratch = useCallback((clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas || wonRef.current) return;
    const ctx  = canvas.getContext("2d")!;
    const dpr  = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const x = (clientX - rect.left) * dpr;
    const y = (clientY - rect.top)  * dpr;

    ctx.save();
    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc(x, y, 12 * dpr, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    const now = Date.now();
    if (now - lastCheck.current < 200) return;
    lastCheck.current = now;
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    let t = 0;
    for (let i = 3; i < data.length; i += 4) { if (data[i] < 128) t++; }
    if ((t / (canvas.width * canvas.height)) * 100 > 45) {
      wonRef.current = true;
      setTimeout(() => {
        const c2 = canvasRef.current?.getContext("2d");
        if (c2 && canvasRef.current) c2.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }, 400);
    }
  }, []);

  const onMouseDown  = (e: React.MouseEvent) => { isDown.current = true;  doScratch(e.clientX, e.clientY); };
  const onMouseMove  = (e: React.MouseEvent) => { if (isDown.current) doScratch(e.clientX, e.clientY); };
  const onMouseUp    = () => { isDown.current = false; };
  const onTouchStart = (e: React.TouchEvent) => { e.preventDefault(); isDown.current = true;  doScratch(e.touches[0].clientX, e.touches[0].clientY); };
  const onTouchMove  = (e: React.TouchEvent) => { e.preventDefault(); if (isDown.current) doScratch(e.touches[0].clientX, e.touches[0].clientY); };
  const onTouchEnd   = () => { isDown.current = false; };

  /* ─── Dot pattern CSS ─── */
  const dotBg = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10'%3E%3Ccircle cx='5' cy='5' r='0.75' fill='rgba(36,59,113,0.06)'/%3E%3C/svg%3E")`;
  const stripeBg = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='36' height='7'%3E%3Crect x='0' width='18' height='7' fill='%23243b71'/%3E%3Crect x='18' width='18' height='7' fill='%23c9a84c'/%3E%3C/svg%3E")`;

  return (
    <div style={{ textAlign: "center", userSelect: "none", marginBottom: "40px" }}>

      {/* ═══ BILLET ═══ */}
      <div style={{
        display: "inline-flex",
        width: "min(520px, 95vw)",
        fontFamily: "'FT Aktual', Georgia, serif",
        overflow: "hidden",
        textAlign: "left",
        border: `1.5px solid rgba(36,59,113,0.45)`,
        boxShadow: "0 8px 40px rgba(36,59,113,0.2), 0 2px 8px rgba(36,59,113,0.1)",
      }}>

        {/* ── Colonne WEDDING verticale ── */}
        <div style={{
          width: "58px", flexShrink: 0,
          background: COLOR,
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          position: "relative", overflow: "hidden",
        }}>
          {/* Guilloché en fond */}
          <svg style={{ position:"absolute", inset:0, width:"100%", height:"100%", opacity:0.07 }} preserveAspectRatio="xMidYMid slice">
            <defs>
              <pattern id="gc" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse">
                <circle cx="14" cy="14" r="12" fill="none" stroke={BG} strokeWidth="0.6"/>
                <circle cx="0"  cy="0"  r="12" fill="none" stroke={BG} strokeWidth="0.6"/>
                <circle cx="28" cy="0"  r="12" fill="none" stroke={BG} strokeWidth="0.6"/>
                <circle cx="0"  cy="28" r="12" fill="none" stroke={BG} strokeWidth="0.6"/>
                <circle cx="28" cy="28" r="12" fill="none" stroke={BG} strokeWidth="0.6"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#gc)" />
          </svg>

          {/* Étoile haut */}
          <span style={{ position:"absolute", top:"14px", color:GOLD, fontSize:"14px", zIndex:1 }}>✦</span>

          {/* WEDDING vertical bas → haut */}
          <div style={{
            writingMode: "vertical-rl",
            transform: "rotate(180deg)",
            fontSize: "clamp(22px, 4.2vw, 30px)",
            fontWeight: 700,
            letterSpacing: "0.18em",
            color: BG,
            textShadow: `-1px -1px 0 ${GOLD}, 1px -1px 0 ${GOLD}, -1px 1px 0 ${GOLD}, 1px 1px 0 ${GOLD}, 0 3px 8px rgba(0,0,0,0.5)`,
            position: "relative", zIndex: 1,
          }}>
            WEDDING
          </div>

          {/* Étoile bas */}
          <span style={{ position:"absolute", bottom:"14px", color:GOLD, fontSize:"14px", zIndex:1 }}>✦</span>

          {/* Double filet doré sur le bord droit */}
          <div style={{ position:"absolute", right:"3px", top:0, bottom:0, width:"1px", background:`linear-gradient(to bottom, transparent, ${GOLD}, transparent)`, opacity:0.6 }} />
          <div style={{ position:"absolute", right:"6px", top:0, bottom:0, width:"1px", background:`linear-gradient(to bottom, transparent, ${GOLD}, transparent)`, opacity:0.25 }} />
        </div>

        {/* ── Contenu principal ── */}
        <div style={{ flex:1, display:"flex", flexDirection:"column", minWidth:0 }}>

          {/* Stripe haut */}
          <div style={{ height:"7px", backgroundImage:stripeBg, backgroundSize:"36px 7px", flexShrink:0 }} />

          {/* Header */}
          <div style={{
            background: COLOR,
            padding: "12px 14px 11px",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            position: "relative", overflow: "hidden", flexShrink: 0,
          }}>
            <svg style={{ position:"absolute", inset:0, width:"100%", height:"100%", opacity:0.06 }} preserveAspectRatio="xMidYMid slice">
              <defs>
                <pattern id="gh" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse">
                  <circle cx="14" cy="14" r="12" fill="none" stroke={BG} strokeWidth="0.6"/>
                  <circle cx="0"  cy="0"  r="12" fill="none" stroke={BG} strokeWidth="0.6"/>
                  <circle cx="28" cy="0"  r="12" fill="none" stroke={BG} strokeWidth="0.6"/>
                  <circle cx="0"  cy="28" r="12" fill="none" stroke={BG} strokeWidth="0.6"/>
                  <circle cx="28" cy="28" r="12" fill="none" stroke={BG} strokeWidth="0.6"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#gh)" />
            </svg>

            <div style={{ position:"relative" }}>
              <div style={{
                fontSize: "clamp(6px, 1vw, 8px)", letterSpacing: "0.32em",
                color: `rgba(201,168,76,0.7)`, textTransform: "uppercase",
                marginBottom: "5px",
              }}>
                Jeu de grattage
              </div>
              <div style={{
                fontSize: "clamp(13px, 2.4vw, 18px)", fontWeight: 700,
                letterSpacing: "0.18em", color: BG, textTransform: "uppercase",
                lineHeight: 1,
                textShadow: "0 1px 3px rgba(0,0,0,0.4)",
              }}>
                Ananda &amp; Matthieu
              </div>
              <div style={{
                fontSize: "clamp(6px, 1vw, 8px)", letterSpacing: "0.22em",
                color: "rgba(243,236,220,0.38)", textTransform: "uppercase",
                marginTop: "5px",
              }}>
                Tonnara di Scopello · Sicile
              </div>
            </div>

            <div style={{
              position: "relative",
              border: `1px solid ${GOLD}`,
              padding: "6px 10px", textAlign: "center", flexShrink: 0,
            }}>
              <div style={{
                fontSize: "clamp(13px, 2.4vw, 16px)", fontWeight: 700,
                letterSpacing: "0.06em", color: GOLD, lineHeight: 1,
              }}>10.10</div>
              <div style={{
                fontSize: "clamp(5px, 0.9vw, 7px)", letterSpacing: "0.22em",
                color: `rgba(201,168,76,0.6)`, textTransform: "uppercase", marginTop: "4px",
              }}>2026</div>
            </div>
          </div>

          {/* Règle */}
          <div style={{
            background: BG, backgroundImage: dotBg,
            borderTop: `2px solid ${COLOR}`,
            borderBottom: `1px solid rgba(36,59,113,0.14)`,
            padding: "6px 12px",
            display: "flex", alignItems: "center", justifyContent: "center", gap: "7px",
            flexShrink: 0,
          }}>
            <span style={{ color:COLOR, opacity:0.22, fontSize:"6px" }}>◆</span>
            <p style={{
              fontSize: "clamp(5.5px, 1vw, 7px)", letterSpacing: "0.18em",
              color: COLOR, opacity: 0.48, textTransform: "uppercase",
              margin: 0, textAlign: "center",
            }}>
              Trouvez 3 fois la même photo · Tous les jeux sont gagnants
            </p>
            <span style={{ color:COLOR, opacity:0.22, fontSize:"6px" }}>◆</span>
          </div>

          {/* Zone de grattage */}
          <div style={{ background: BG, backgroundImage: dotBg, padding: "10px 11px 8px", flex: 1 }}>

            {/* Label */}
            <div style={{ display:"flex", alignItems:"center", gap:"7px", marginBottom:"6px" }}>
              <div style={{ flex:1, height:"1px", background:"rgba(36,59,113,0.18)" }} />
              <span style={{
                fontSize: "clamp(5px, 0.85vw, 7px)", letterSpacing: "0.28em",
                color: COLOR, opacity: 0.38, textTransform: "uppercase",
              }}>VOS PHOTOS</span>
              <div style={{ flex:1, height:"1px", background:"rgba(36,59,113,0.18)" }} />
            </div>

            <div ref={scratchZoneRef} style={{
              position: "relative",
              border: `1.5px solid rgba(36,59,113,0.28)`,
              boxShadow: "inset 0 1px 4px rgba(36,59,113,0.07), 0 1px 4px rgba(36,59,113,0.08)",
              overflow: "hidden", cursor: "crosshair",
            }}>
              {/* Grille 6×3 */}
              <div style={{
                display: "grid",
                gridTemplateColumns: `repeat(${COLS}, 1fr)`,
                gap: "2px",
                background: "rgba(36,59,113,0.12)",
              }}>
                {grid.map((cell, idx) => (
                  <div key={idx} style={{
                    aspectRatio: "3 / 4", overflow: "hidden",
                    background: BG,
                  }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={cell.src} alt=""
                      style={{
                        width: "100%", height: "100%",
                        objectFit: "cover", display: "block",
                        transform: `rotate(${cell.rotation}deg) scale(1.3)`,
                        transformOrigin: "center",
                      }}
                    />
                  </div>
                ))}
              </div>

              {/* Canvas métallique */}
              <canvas
                ref={canvasRef}
                style={{ position:"absolute", inset:0, width:"100%", height:"100%", touchAction:"none" }}
                onMouseDown={onMouseDown} onMouseMove={onMouseMove}
                onMouseUp={onMouseUp} onMouseLeave={onMouseUp}
                onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}
              />
            </div>
          </div>

          {/* Footer */}
          <div style={{
            background: BG, backgroundImage: dotBg,
            borderTop: `1px solid rgba(36,59,113,0.1)`,
            padding: "7px 12px 8px",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            flexShrink: 0,
          }}>
            {/* Code-barres gauche */}
            <div style={{ display:"flex", alignItems:"flex-end", gap:"1.5px" }}>
              {[3,5,2,7,4,6,2,5,3,6,4,7,3,5,2].map((h, i) => (
                <div key={i} style={{
                  width: i % 3 === 0 ? "2px" : "1px",
                  height: `${h + 5}px`,
                  background: `rgba(36,59,113,${0.12 + (i % 4) * 0.07})`,
                }} />
              ))}
            </div>
            <p style={{
              fontSize: "clamp(5px, 0.85vw, 6.5px)", letterSpacing: "0.2em",
              color: COLOR, opacity: 0.2, textTransform: "uppercase", margin: 0,
            }}>NUL SI DÉCOUVERT</p>
            {/* Code-barres droit */}
            <div style={{ display:"flex", alignItems:"flex-end", gap:"1.5px" }}>
              {[5,3,6,4,7,2,5,3,7,4,6,2,5,3,6].map((h, i) => (
                <div key={i} style={{
                  width: i % 3 === 0 ? "2px" : "1px",
                  height: `${h + 5}px`,
                  background: `rgba(36,59,113,${0.12 + (i % 4) * 0.07})`,
                }} />
              ))}
            </div>
          </div>

          {/* Stripe bas */}
          <div style={{ height:"7px", backgroundImage:stripeBg, backgroundSize:"36px 7px", flexShrink:0 }} />
        </div>
      </div>
      {/* ═══ FIN BILLET ═══ */}

      <button onClick={onClose} style={{
        marginTop: "18px", background: "none", border: "none",
        fontSize: "11px", letterSpacing: "0.15em", textTransform: "uppercase",
        opacity: 0.3, cursor: "pointer",
        fontFamily: "'FT Aktual', Georgia, serif", color: COLOR,
      }}>
        Fermer ×
      </button>
    </div>
  );
}

/* ─────────────────────────────────────────
   Page Grazie
───────────────────────────────────────── */
export default function GraziePage() {
  const [showGame, setShowGame] = useState(false);
  const [prenom,   setPrenom]   = useState("");

  useEffect(() => {
    const p = new URLSearchParams(window.location.search).get("prenom") || "";
    setPrenom(p);
  }, []);

  return (
    <div style={{
      background: BG, minHeight: "100vh",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "space-between",
      fontFamily: "'FT Aktual', Georgia, serif",
      padding: "60px 24px 48px",
    }}>
      <div style={{
        flex: 1, display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
      }}>
        {showGame && <ScratchCard onClose={() => setShowGame(false)} />}

        {!showGame && (
          <button onClick={() => setShowGame(true)}
            className="grazie-btn grazie-btn-blue"
            style={{ marginBottom: "40px" }}>
            Jouer
          </button>
        )}

        <div style={{ marginBottom: "28px", textAlign: "center", width: "100%" }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:"16px" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/Sun.png" alt="" className="grazie-sun" style={{ width:"clamp(48px,9vw,120px)", height:"auto", flexShrink:0 }} />
            <div style={{ textAlign:"center" }}>
              <p style={{ fontSize:"clamp(48px,9vw,110px)", fontWeight:500, letterSpacing:"-0.03em", lineHeight:0.95, color:COLOR }}>Grazie</p>
              {prenom && (
                <p style={{ fontSize:"clamp(40px,8vw,100px)", fontWeight:500, letterSpacing:"-0.03em", lineHeight:0.95, color:COLOR }}>{prenom}</p>
              )}
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/Sun.png" alt="" className="grazie-sun" style={{ width:"clamp(48px,9vw,120px)", height:"auto", flexShrink:0 }} />
          </div>
        </div>

        <a href="https://www.ungrandjour.com/fr/ananda-matthieu" target="_blank" rel="noopener noreferrer" className="grazie-btn grazie-btn-red">
          Liste de mariage
        </a>
      </div>

      <Link href="/" style={{
        marginTop:"48px", fontSize:"11px", letterSpacing:"0.2em",
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
        @media (max-width: 640px) { .grazie-sun { width: 40px !important; } }
      `}</style>
    </div>
  );
}
