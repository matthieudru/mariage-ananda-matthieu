"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";

const COLOR = "#243b71";
const BG    = "#f3ecdc";
const GOLD  = "#c9a84c";

/* ─────────────────────────────────────────
   Photos de la grille
   → Ajouter les amis dans FRIEND_PHOTOS
───────────────────────────────────────── */
const COUPLE_PHOTO  = "/couple.png";
const FRIEND_PHOTOS: string[] = [
  // "/ami1.png",
  // "/ami2.png",
  // "/ami3.png",
  // "/ami4.png",
  // "/ami5.png",
  // "/ami6.png",
  // "/ami7.png",
];
const GRID_SIZE    = 10;
const COUPLE_COUNT = 3;

type Cell = { src: string | null; isCouple: boolean };

function buildGrid(): Cell[] {
  const cells: Cell[] = [];
  for (let i = 0; i < COUPLE_COUNT; i++) cells.push({ src: COUPLE_PHOTO, isCouple: true });
  for (let i = 0; i < GRID_SIZE - COUPLE_COUNT; i++) cells.push({ src: FRIEND_PHOTOS[i] ?? null, isCouple: false });
  for (let i = cells.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cells[i], cells[j]] = [cells[j], cells[i]];
  }
  return cells;
}

/* Stripe pattern SVG encodé */
const STRIPE_BG = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='36' height='8'%3E%3Crect x='0' width='18' height='8' fill='%23243b71'/%3E%3Crect x='18' width='18' height='8' fill='%23c9a84c'/%3E%3C/svg%3E")`;

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

      /* Gradient métallique argenté */
      const grad = ctx.createLinearGradient(0, 0, W, H);
      grad.addColorStop(0,    "#a8a49c");
      grad.addColorStop(0.15, "#d0ccc4");
      grad.addColorStop(0.3,  "#e8e4de");
      grad.addColorStop(0.45, "#cac6be");
      grad.addColorStop(0.6,  "#dedad4");
      grad.addColorStop(0.75, "#c4c0b8");
      grad.addColorStop(1,    "#b0aca4");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);

      /* Reflets horizontaux */
      for (let y = 0; y < H; y += 1) {
        const a = 0.02 + Math.abs(Math.sin(y * 0.11)) * 0.06;
        ctx.fillStyle = `rgba(255,255,255,${a})`;
        ctx.fillRect(0, y, W, 1);
      }

      /* Grain (bruit sur les pixels) */
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const d = imgData.data;
      for (let i = 0; i < d.length; i += 4) {
        const n = (Math.random() - 0.5) * 28;
        d[i]   = Math.max(0, Math.min(255, d[i]   + n));
        d[i+1] = Math.max(0, Math.min(255, d[i+1] + n));
        d[i+2] = Math.max(0, Math.min(255, d[i+2] + n));
      }
      ctx.putImageData(imgData, 0, 0);

      /* Cadre intérieur gravé */
      ctx.strokeStyle = "rgba(80,70,60,0.25)";
      ctx.lineWidth = 1.5;
      ctx.strokeRect(8, 8, W - 16, H - 16);
      ctx.strokeStyle = "rgba(255,255,255,0.35)";
      ctx.lineWidth = 1;
      ctx.strokeRect(9.5, 9.5, W - 19, H - 19);

      /* Texte "GRATTEZ ICI" */
      ctx.textAlign = "center";
      ctx.shadowColor = "rgba(255,255,255,0.6)";
      ctx.shadowBlur = 2;
      ctx.fillStyle = "rgba(50,40,30,0.55)";
      ctx.font = `bold ${Math.round(W * 0.04)}px Georgia, serif`;
      ctx.fillText("GRATTEZ ICI", W / 2, H / 2 - 10);
      ctx.font = `${Math.round(W * 0.028)}px Georgia, serif`;
      ctx.fillStyle = "rgba(50,40,30,0.35)";
      ctx.fillText("▼", W / 2, H / 2 + 12);
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
    ctx.arc(x, y, 26 * dpr, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    const now = Date.now();
    if (now - lastCheck.current < 200) return;
    lastCheck.current = now;

    const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    let transparent = 0;
    for (let i = 3; i < data.length; i += 4) { if (data[i] < 128) transparent++; }
    const pct = (transparent / (canvas.width * canvas.height)) * 100;
    if (pct > 45) {
      wonRef.current = true;
      setTimeout(() => {
        const ctx2 = canvasRef.current?.getContext("2d");
        if (ctx2 && canvasRef.current)
          ctx2.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }, 400);
    }
  }, []);

  const onMouseDown  = (e: React.MouseEvent) => { isDown.current = true;  doScratch(e.clientX, e.clientY); };
  const onMouseMove  = (e: React.MouseEvent) => { if (isDown.current) doScratch(e.clientX, e.clientY); };
  const onMouseUp    = () => { isDown.current = false; };
  const onTouchStart = (e: React.TouchEvent) => {
    e.preventDefault(); isDown.current = true;
    doScratch(e.touches[0].clientX, e.touches[0].clientY);
  };
  const onTouchMove  = (e: React.TouchEvent) => {
    e.preventDefault();
    if (isDown.current) doScratch(e.touches[0].clientX, e.touches[0].clientY);
  };
  const onTouchEnd = () => { isDown.current = false; };

  return (
    <div style={{ textAlign: "center", userSelect: "none", marginBottom: "40px" }}>

      {/* ═══ BILLET ═══ */}
      <div style={{
        display: "inline-block",
        width: "min(480px, 92vw)",
        fontFamily: "'FT Aktual', Georgia, serif",
        overflow: "hidden",
        textAlign: "left",
        boxShadow: "0 8px 40px rgba(36,59,113,0.22), 0 2px 8px rgba(36,59,113,0.12)",
        border: `1.5px solid rgba(36,59,113,0.4)`,
      }}>

        {/* Bande stripe haut */}
        <div style={{ height: "7px", backgroundImage: STRIPE_BG, backgroundSize: "36px 7px" }} />

        {/* ── HEADER ── */}
        <div style={{
          background: COLOR,
          padding: "18px 20px 16px",
          position: "relative",
          overflow: "hidden",
        }}>
          {/* Guilloché SVG en fond */}
          <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.07 }} preserveAspectRatio="xMidYMid slice">
            <defs>
              <pattern id="g" x="0" y="0" width="32" height="32" patternUnits="userSpaceOnUse">
                <circle cx="16" cy="16" r="14" fill="none" stroke={BG} strokeWidth="0.6"/>
                <circle cx="0"  cy="0"  r="14" fill="none" stroke={BG} strokeWidth="0.6"/>
                <circle cx="32" cy="0"  r="14" fill="none" stroke={BG} strokeWidth="0.6"/>
                <circle cx="0"  cy="32" r="14" fill="none" stroke={BG} strokeWidth="0.6"/>
                <circle cx="32" cy="32" r="14" fill="none" stroke={BG} strokeWidth="0.6"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#g)" />
          </svg>

          <div style={{ position: "relative", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px" }}>
            {/* Titre + sous-titre */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ color: GOLD, fontSize: "clamp(12px, 2.2vw, 16px)", lineHeight: 1 }}>✦</span>
                <div style={{
                  fontSize: "clamp(38px, 8.5vw, 60px)", fontWeight: 700,
                  letterSpacing: "0.06em", color: BG, lineHeight: 1,
                  textShadow: `0 1px 0 rgba(0,0,0,0.3), 0 -1px 0 rgba(255,255,255,0.08)`,
                }}>
                  WEDDING
                </div>
                <span style={{ color: GOLD, fontSize: "clamp(12px, 2.2vw, 16px)", lineHeight: 1 }}>✦</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "7px" }}>
                <div style={{ flex: 1, height: "1px", background: `rgba(201,168,76,0.4)` }} />
                <span style={{
                  fontSize: "clamp(7px, 1.3vw, 9px)", letterSpacing: "0.3em",
                  color: "rgba(243,236,220,0.55)", textTransform: "uppercase",
                  whiteSpace: "nowrap",
                }}>
                  Ananda &amp; Matthieu
                </span>
                <div style={{ flex: 1, height: "1px", background: `rgba(201,168,76,0.4)` }} />
              </div>
            </div>

            {/* Badge date */}
            <div style={{
              border: `1px solid ${GOLD}`,
              padding: "8px 11px",
              textAlign: "center",
              flexShrink: 0,
              marginTop: "4px",
            }}>
              <div style={{
                fontSize: "clamp(13px, 2.5vw, 17px)", fontWeight: 700,
                letterSpacing: "0.05em", color: GOLD, lineHeight: 1,
              }}>
                10.10
              </div>
              <div style={{
                fontSize: "clamp(5px, 0.9vw, 7px)", letterSpacing: "0.22em",
                color: "rgba(201,168,76,0.65)", textTransform: "uppercase",
                marginTop: "4px",
              }}>
                Scopello
              </div>
            </div>
          </div>
        </div>

        {/* ── RÈGLE ── */}
        <div style={{
          background: BG,
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10'%3E%3Ccircle cx='5' cy='5' r='0.8' fill='rgba(36,59,113,0.06)'/%3E%3C/svg%3E")`,
          borderTop: `2px solid ${COLOR}`,
          borderBottom: `1px solid rgba(36,59,113,0.15)`,
          padding: "7px 18px",
          display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
        }}>
          <span style={{ color: COLOR, opacity: 0.25, fontSize: "7px" }}>◆</span>
          <p style={{
            fontSize: "clamp(6px, 1.1vw, 7.5px)", letterSpacing: "0.2em",
            color: COLOR, opacity: 0.5, textTransform: "uppercase",
            margin: 0, textAlign: "center",
          }}>
            Trouvez 3 fois la même photo · Tous les jeux sont gagnants
          </p>
          <span style={{ color: COLOR, opacity: 0.25, fontSize: "7px" }}>◆</span>
        </div>

        {/* ── ZONE DE GRATTAGE ── */}
        <div style={{
          background: BG,
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10'%3E%3Ccircle cx='5' cy='5' r='0.8' fill='rgba(36,59,113,0.06)'/%3E%3C/svg%3E")`,
          padding: "12px 13px 10px",
        }}>
          {/* Label VOS PHOTOS */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "7px" }}>
            <div style={{ flex: 1, height: "1px", background: `rgba(36,59,113,0.18)` }} />
            <span style={{
              fontSize: "clamp(5px, 0.9vw, 7px)", letterSpacing: "0.28em",
              color: COLOR, opacity: 0.4, textTransform: "uppercase",
            }}>VOS PHOTOS</span>
            <div style={{ flex: 1, height: "1px", background: `rgba(36,59,113,0.18)` }} />
          </div>

          <div ref={scratchZoneRef} style={{
            position: "relative",
            border: `1.5px solid rgba(36,59,113,0.3)`,
            boxShadow: "inset 0 1px 4px rgba(36,59,113,0.08), 0 1px 3px rgba(36,59,113,0.1)",
            overflow: "hidden", cursor: "crosshair",
          }}>
            {/* Grille 5×2 */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(5, 1fr)",
              gap: "2px",
              background: `rgba(36,59,113,0.12)`,
            }}>
              {grid.map((cell, idx) => (
                <div key={idx} style={{
                  aspectRatio: "3 / 4",
                  overflow: "hidden",
                  background: BG,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {cell.src ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={cell.src} alt=""
                      style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                    />
                  ) : (
                    <div style={{
                      width: "100%", height: "100%",
                      background: `rgba(36,59,113,0.05)`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <svg width="30%" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="8" r="4" fill="rgba(36,59,113,0.12)" />
                        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="rgba(36,59,113,0.12)" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Canvas métallique */}
            <canvas
              ref={canvasRef}
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", touchAction: "none" }}
              onMouseDown={onMouseDown}
              onMouseMove={onMouseMove}
              onMouseUp={onMouseUp}
              onMouseLeave={onMouseUp}
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
            />
          </div>
        </div>

        {/* ── FOOTER ── */}
        <div style={{
          background: BG,
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10'%3E%3Ccircle cx='5' cy='5' r='0.8' fill='rgba(36,59,113,0.06)'/%3E%3C/svg%3E")`,
          borderTop: `1px solid rgba(36,59,113,0.12)`,
          padding: "8px 13px 9px",
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px",
        }}>
          {/* Code-barres gauche */}
          <div style={{ display: "flex", alignItems: "flex-end", gap: "1.5px", flexShrink: 0 }}>
            {[3,5,2,7,4,6,2,5,3,6,4,7,3,5,2].map((h, i) => (
              <div key={i} style={{
                width: i % 3 === 0 ? "2px" : "1px",
                height: `${h + 6}px`,
                background: `rgba(36,59,113,${0.15 + (i % 4) * 0.08})`,
              }} />
            ))}
          </div>

          <p style={{
            fontSize: "clamp(5px, 0.85vw, 6.5px)", letterSpacing: "0.22em",
            color: COLOR, opacity: 0.2, textTransform: "uppercase", margin: 0,
            textAlign: "center", flexShrink: 0,
          }}>
            NUL SI DÉCOUVERT
          </p>

          {/* Code-barres droit */}
          <div style={{ display: "flex", alignItems: "flex-end", gap: "1.5px", flexShrink: 0 }}>
            {[5,3,6,4,7,2,5,3,7,4,6,2,5,3,6].map((h, i) => (
              <div key={i} style={{
                width: i % 3 === 0 ? "2px" : "1px",
                height: `${h + 6}px`,
                background: `rgba(36,59,113,${0.15 + (i % 4) * 0.08})`,
              }} />
            ))}
          </div>
        </div>

        {/* Bande stripe bas */}
        <div style={{ height: "7px", backgroundImage: STRIPE_BG, backgroundSize: "36px 7px" }} />
      </div>
      {/* ═══ FIN BILLET ═══ */}

      <button
        onClick={onClose}
        style={{
          marginTop: "18px", background: "none", border: "none",
          fontSize: "11px", letterSpacing: "0.15em", textTransform: "uppercase",
          opacity: 0.3, cursor: "pointer",
          fontFamily: "'FT Aktual', Georgia, serif", color: COLOR,
        }}
      >
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
          <button
            onClick={() => setShowGame(true)}
            className="grazie-btn grazie-btn-blue"
            style={{ marginBottom: "40px" }}
          >
            Jouer
          </button>
        )}

        <div style={{ marginBottom: "28px", textAlign: "center", width: "100%" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "16px" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/Sun.png" alt="" className="grazie-sun" style={{ width: "clamp(48px, 9vw, 120px)", height: "auto", flexShrink: 0 }} />
            <div style={{ textAlign: "center" }}>
              <p style={{ fontSize: "clamp(48px, 9vw, 110px)", fontWeight: 500, letterSpacing: "-0.03em", lineHeight: 0.95, color: COLOR }}>
                Grazie
              </p>
              {prenom && (
                <p style={{ fontSize: "clamp(40px, 8vw, 100px)", fontWeight: 500, letterSpacing: "-0.03em", lineHeight: 0.95, color: COLOR }}>
                  {prenom}
                </p>
              )}
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/Sun.png" alt="" className="grazie-sun" style={{ width: "clamp(48px, 9vw, 120px)", height: "auto", flexShrink: 0 }} />
          </div>
        </div>

        <a href="https://www.ungrandjour.com/fr/ananda-matthieu" target="_blank" rel="noopener noreferrer" className="grazie-btn grazie-btn-red">
          Liste de mariage
        </a>
      </div>

      <Link href="/" style={{
        marginTop: "48px", fontSize: "11px", letterSpacing: "0.2em",
        textTransform: "uppercase", opacity: 0.38, color: COLOR,
        textDecoration: "none", fontFamily: "'FT Aktual', Georgia, serif",
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
        @media (max-width: 640px) {
          .grazie-sun { width: 40px !important; }
        }
      `}</style>
    </div>
  );
}
