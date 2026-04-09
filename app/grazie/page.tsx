"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";

const COLOR = "#243b71";
const BG    = "#f3ecdc";

/* ─────────────────────────────────────────
   Jeu de grattage
───────────────────────────────────────── */
function ScratchCard({ onClose }: { onClose: () => void }) {
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const [won,      setWon]      = useState(false);
  const isDown     = useRef(false);
  const wonRef     = useRef(false);
  const lastCheck  = useRef(0);

  /* ── Dessin de la couche de grattage ── */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Taille réelle après layout
    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width  = rect.width  * dpr;
    canvas.height = rect.height * dpr;

    const ctx = canvas.getContext("2d")!;
    ctx.scale(dpr, dpr);
    const W = rect.width;
    const H = rect.height;

    // Fond doré-brun (couleur couche scratch)
    ctx.fillStyle = "#9b8866";
    ctx.fillRect(0, 0, W, H);

    // Hachures légères
    ctx.strokeStyle = "rgba(255,255,255,0.08)";
    ctx.lineWidth = 1;
    for (let x = -H; x < W + H; x += 7) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x + H, H);
      ctx.stroke();
    }

    // Points de texture
    ctx.fillStyle = "rgba(255,255,255,0.04)";
    for (let cx = 6; cx < W; cx += 12) {
      for (let cy = 6; cy < H; cy += 12) {
        ctx.beginPath();
        ctx.arc(cx, cy, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Texte "GRATTE"
    ctx.fillStyle = "rgba(255,255,255,0.22)";
    ctx.textAlign = "center";
    ctx.font = `10px Georgia, serif`;
    ctx.fillText("GRATTE POUR RÉVÉLER", W / 2, H / 2 + 4);
  }, []);

  /* ── Grattage ── */
  const doScratch = useCallback((clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas || wonRef.current) return;
    const ctx = canvas.getContext("2d")!;
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

    // Vérification victoire max 5×/s
    const now = Date.now();
    if (now - lastCheck.current < 200) return;
    lastCheck.current = now;

    const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    let transparent = 0;
    for (let i = 3; i < data.length; i += 4) {
      if (data[i] < 128) transparent++;
    }
    const pct = (transparent / (canvas.width * canvas.height)) * 100;

    if (pct > 45) {
      wonRef.current = true;
      setWon(true);
      // Effacement complet après délai
      setTimeout(() => {
        const ctx2 = canvasRef.current?.getContext("2d");
        if (ctx2 && canvasRef.current)
          ctx2.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }, 500);
    }
  }, []);

  /* ── Handlers ── */
  const onMouseDown = (e: React.MouseEvent) => { isDown.current = true;  doScratch(e.clientX, e.clientY); };
  const onMouseMove = (e: React.MouseEvent) => { if (isDown.current) doScratch(e.clientX, e.clientY); };
  const onMouseUp   = () => { isDown.current = false; };

  const onTouchStart = (e: React.TouchEvent) => {
    e.preventDefault(); isDown.current = true;
    doScratch(e.touches[0].clientX, e.touches[0].clientY);
  };
  const onTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    if (isDown.current) doScratch(e.touches[0].clientX, e.touches[0].clientY);
  };
  const onTouchEnd = () => { isDown.current = false; };

  return (
    <div style={{ textAlign: "center", userSelect: "none", marginBottom: "40px" }}>

      {/* Accroche */}
      <p style={{
        fontSize: "10px", letterSpacing: "0.2em", textTransform: "uppercase",
        color: COLOR, opacity: 0.4, margin: "0 auto 18px",
        fontFamily: "'FT Aktual', Georgia, serif", lineHeight: 1.8,
        maxWidth: "340px",
      }}>
        Si tu trouves 3 fois Ananda &amp; Matthieu,<br />
        ils se marient le 10.10 — tous les jeux sont gagnants
      </p>

      {/* Carte */}
      <div style={{
        position: "relative",
        display: "inline-block",
        width: "min(460px, 90vw)",
        aspectRatio: "460 / 190",
        border: `1px solid rgba(36,59,113,0.18)`,
        overflow: "hidden",
      }}>
        {/* Couche inférieure : 3 cases prize */}
        <div style={{
          position: "absolute", inset: 0,
          display: "flex",
          background: BG,
        }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{
              flex: 1,
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center",
              gap: "8px",
              borderRight: i < 2 ? `1px solid rgba(36,59,113,0.1)` : "none",
            }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/Sun.png" alt="" style={{ width: "clamp(28px, 5vw, 42px)", height: "auto" }} />
              <div style={{
                fontSize: "clamp(7px, 1vw, 10px)",
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: COLOR,
                fontFamily: "'FT Aktual', Georgia, serif",
                lineHeight: 1.8,
                textAlign: "center",
              }}>
                Ananda<br />&amp; Matthieu
              </div>
            </div>
          ))}
        </div>

        {/* Canvas scratch par-dessus */}
        <canvas
          ref={canvasRef}
          style={{
            position: "absolute", inset: 0,
            width: "100%", height: "100%",
            cursor: "crosshair",
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

      {/* Message */}
      {won ? (
        <p style={{
          fontSize: "clamp(28px, 5vw, 44px)",
          fontWeight: 500, letterSpacing: "-0.02em",
          color: COLOR, marginTop: "20px",
          fontFamily: "'FT Aktual', Georgia, serif",
          animation: "scratchWin 0.7s ease-out forwards",
        }}>
          C&apos;est gagné&nbsp;!
        </p>
      ) : (
        <p style={{
          fontSize: "11px", letterSpacing: "0.18em", textTransform: "uppercase",
          opacity: 0.3, marginTop: "8px",
          fontFamily: "'FT Aktual', Georgia, serif",
        }}>
          Gratte la surface
        </p>
      )}

      <button
        onClick={onClose}
        style={{
          marginTop: "10px", background: "none", border: "none",
          fontSize: "11px", letterSpacing: "0.15em", textTransform: "uppercase",
          opacity: 0.3, cursor: "pointer",
          fontFamily: "'FT Aktual', Georgia, serif", color: COLOR,
        }}
      >
        Fermer ×
      </button>

      <style>{`
        @keyframes scratchWin {
          0%   { opacity: 0; transform: translateY(8px) scale(0.95); }
          60%  { transform: translateY(-2px) scale(1.03); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
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
