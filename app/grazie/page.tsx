"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";

const COLOR = "#243b71";
const BG    = "#f3ecdc";

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
  for (let i = 0; i < COUPLE_COUNT; i++) {
    cells.push({ src: COUPLE_PHOTO, isCouple: true });
  }
  for (let i = 0; i < GRID_SIZE - COUPLE_COUNT; i++) {
    cells.push({ src: FRIEND_PHOTOS[i] ?? null, isCouple: false });
  }
  // Mélange Fisher-Yates
  for (let i = cells.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cells[i], cells[j]] = [cells[j], cells[i]];
  }
  return cells;
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

  // Grille mélangée une fois au montage
  const [grid] = useState<Cell[]>(() => buildGrid());

  /* ── Init couche de grattage ── */
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

      // Fond bleu
      ctx.fillStyle = COLOR;
      ctx.fillRect(0, 0, W, H);

      // Hachures diagonales
      ctx.strokeStyle = "rgba(255,255,255,0.05)";
      ctx.lineWidth = 1;
      for (let x = -H; x < W + H; x += 9) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x + H, H); ctx.stroke();
      }

      // Grille de points
      ctx.fillStyle = "rgba(255,255,255,0.025)";
      for (let cx = 10; cx < W; cx += 16) {
        for (let cy = 10; cy < H; cy += 16) {
          ctx.beginPath(); ctx.arc(cx, cy, 2, 0, Math.PI * 2); ctx.fill();
        }
      }

      // Cadre interne
      ctx.strokeStyle = "rgba(255,255,255,0.1)";
      ctx.lineWidth = 1;
      ctx.strokeRect(10, 10, W - 20, H - 20);

      // Texte "GRATTEZ ICI"
      ctx.fillStyle = "rgba(243,236,220,0.3)";
      ctx.textAlign = "center";
      ctx.font = `bold 12px Georgia, serif`;
      ctx.fillText("GRATTEZ ICI", W / 2, H / 2 - 8);
      ctx.font = `10px Georgia, serif`;
      ctx.fillStyle = "rgba(243,236,220,0.18)";
      ctx.fillText("▼", W / 2, H / 2 + 10);
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

    // Vérif victoire throttlée
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

  /* ── Handlers ── */
  const onMouseDown  = (e: React.MouseEvent)  => { isDown.current = true;  doScratch(e.clientX, e.clientY); };
  const onMouseMove  = (e: React.MouseEvent)  => { if (isDown.current) doScratch(e.clientX, e.clientY); };
  const onMouseUp    = ()                      => { isDown.current = false; };
  const onTouchStart = (e: React.TouchEvent)  => {
    e.preventDefault(); isDown.current = true;
    doScratch(e.touches[0].clientX, e.touches[0].clientY);
  };
  const onTouchMove  = (e: React.TouchEvent)  => {
    e.preventDefault();
    if (isDown.current) doScratch(e.touches[0].clientX, e.touches[0].clientY);
  };
  const onTouchEnd   = ()                      => { isDown.current = false; };

  return (
    <div style={{ textAlign: "center", userSelect: "none", marginBottom: "40px" }}>

      {/* ─── BILLET ─── */}
      <div style={{
        display: "inline-block",
        width: "min(480px, 92vw)",
        background: BG,
        border: `2px solid ${COLOR}`,
        fontFamily: "'FT Aktual', Georgia, serif",
        overflow: "hidden",
        textAlign: "left",
        boxShadow: "0 4px 24px rgba(36,59,113,0.15)",
      }}>

        {/* Header bleu */}
        <div style={{
          background: COLOR,
          padding: "16px 20px 14px",
          display: "flex", alignItems: "flex-end", justifyContent: "space-between",
        }}>
          <div>
            <div style={{
              fontSize: "clamp(32px, 7vw, 52px)", fontWeight: 700,
              letterSpacing: "-0.02em", color: BG, lineHeight: 1,
            }}>
              WEDDING
            </div>
            <div style={{
              fontSize: "clamp(7px, 1.2vw, 9px)", letterSpacing: "0.3em",
              color: "rgba(243,236,220,0.5)", textTransform: "uppercase", marginTop: "4px",
            }}>
              Ananda &amp; Matthieu
            </div>
          </div>
          <div style={{ textAlign: "right", paddingBottom: "2px" }}>
            <div style={{
              fontSize: "clamp(7px, 1.2vw, 9px)", letterSpacing: "0.25em",
              color: "rgba(243,236,220,0.45)", textTransform: "uppercase", lineHeight: 2,
            }}>
              10 · 10 · 26<br />Scopello, Sicile
            </div>
          </div>
        </div>

        {/* Règle */}
        <div style={{ padding: "8px 18px", borderBottom: `1px solid rgba(36,59,113,0.12)` }}>
          <p style={{
            fontSize: "clamp(6px, 1.1vw, 8px)", letterSpacing: "0.18em",
            color: COLOR, opacity: 0.45, textTransform: "uppercase",
            margin: 0, textAlign: "center", lineHeight: 1.6,
          }}>
            Trouvez 3 fois la même photo · Tous les jeux sont gagnants
          </p>
        </div>

        {/* Zone de grattage */}
        <div style={{ padding: "14px 14px 10px" }}>
          <div
            ref={scratchZoneRef}
            style={{ position: "relative", overflow: "hidden", cursor: "crosshair" }}
          >
            {/* Grille 5×2 de photos */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(5, 1fr)",
              gap: "3px",
              background: "rgba(36,59,113,0.08)",
            }}>
              {grid.map((cell, idx) => (
                <div key={idx} style={{
                  aspectRatio: "3 / 4",
                  overflow: "hidden",
                  background: "rgba(243,236,220,0.6)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {cell.src ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={cell.src}
                      alt=""
                      style={{
                        width: "100%", height: "100%",
                        objectFit: "cover", display: "block",
                      }}
                    />
                  ) : (
                    /* Placeholder ami (à remplacer) */
                    <div style={{
                      width: "100%", height: "100%",
                      background: "rgba(36,59,113,0.06)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <svg width="28%" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="8" r="4" fill="rgba(36,59,113,0.15)" />
                        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="rgba(36,59,113,0.15)" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
                      </svg>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Canvas de grattage par-dessus */}
            <canvas
              ref={canvasRef}
              style={{
                position: "absolute", inset: 0,
                width: "100%", height: "100%",
                touchAction: "none",
              }}
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

        {/* Footer billet */}
        <div style={{
          padding: "8px 18px 12px",
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <p style={{
            fontSize: "clamp(5px, 0.9vw, 7px)", letterSpacing: "0.2em",
            color: COLOR, opacity: 0.22, textTransform: "uppercase", margin: 0,
          }}>
            NUL SI DÉCOUVERT
          </p>
          <p style={{
            fontSize: "clamp(5px, 0.9vw, 7px)", letterSpacing: "0.2em",
            color: COLOR, opacity: 0.22, textTransform: "uppercase", margin: 0,
          }}>
            JEU GRATUIT · OFFERT PAR LES MARIÉS
          </p>
        </div>
      </div>
      {/* ─── FIN BILLET ─── */}

      <button
        onClick={onClose}
        style={{
          marginTop: "16px", background: "none", border: "none",
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
