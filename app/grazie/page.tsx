"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";

const COLOR = "#243b71";
const BG    = "#f3ecdc";

/* ─────────────────────────────────────────
   Constantes du jeu
───────────────────────────────────────── */
const GAME_W   = 500;
const GAME_H   = 195;
const SEA_Y    = 150;
const SUN_R    = 48;               // → 96px diamètre
const SUN_X    = 85;
const GROUND_Y = SEA_Y - SUN_R * 2; // 54

const JUMP_V   = -580;
const GRAVITY  = 1800;
const BASE_SPD = 200;

const RATIO_MONTAGNE = 1514 / 819;
const RATIO_VAGUE    = 1514 / 819;

/* ─────────────────────────────────────────
   État du jeu
───────────────────────────────────────── */
type Rock = { x: number; w: number; h: number };
type GS   = {
  sunY: number; vy: number; rocks: Rock[];
  speed: number; score: number;
  scoreAccum: number; spawnAccum: number;
  waveOffset: number; lastTs: number; dead: boolean;
};

const makeState = (): GS => ({
  sunY: GROUND_Y, vy: 0, rocks: [],
  speed: BASE_SPD, score: 0,
  scoreAccum: 0, spawnAccum: 0,
  waveOffset: 0, lastTs: 0, dead: false,
});

/* ─────────────────────────────────────────
   Composant SunGame
   Les images sont de vrais <img> DOM cachés
   → le navigateur les gère, plus fiable sur iOS
───────────────────────────────────────── */
function SunGame({ onClose }: { onClose: () => void }) {
  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const stateRef     = useRef<GS>(makeState());
  const rafRef       = useRef<number>(0);

  // Refs vers de vrais éléments <img> dans le DOM (voir render)
  const refSun       = useRef<HTMLImageElement>(null);
  const refMontagne  = useRef<HTMLImageElement>(null);
  const refVague     = useRef<HTMLImageElement>(null);

  const [dispScore, setDispScore] = useState(0);
  const [dispDead,  setDispDead]  = useState(false);

  /* ── Boucle de jeu (monte une seule fois) ── */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width  = GAME_W * dpr;
    canvas.height = GAME_H * dpr;
    const ctx = canvas.getContext("2d")!;
    ctx.scale(dpr, dpr);

    /* helper : est-ce qu'une image est prête ? */
    const ready = (img: HTMLImageElement | null): img is HTMLImageElement =>
      img !== null && img.complete && img.naturalWidth > 0;

    /* Spawn obstacle */
    const spawnRock = (s: GS) => {
      const lvl   = Math.floor(s.score / 15);
      const baseH = 28 + lvl * 7;
      const h     = Math.min(baseH + Math.random() * 18, 62);
      const w     = h * RATIO_MONTAGNE * (0.55 + Math.random() * 0.5);
      s.rocks.push({ x: GAME_W + 20, w, h });
    };

    /* Dessin */
    const draw = (s: GS) => {
      ctx.clearRect(0, 0, GAME_W, GAME_H);

      /* Ciel */
      const sky = ctx.createLinearGradient(0, 0, 0, SEA_Y);
      sky.addColorStop(0, "#d9cfbc");
      sky.addColorStop(1, "#f3ecdc");
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, GAME_W, SEA_Y);

      /* ── Montagnes / obstacles ── */
      for (const rock of s.rocks) {
        if (ready(refMontagne.current)) {
          ctx.drawImage(refMontagne.current, rock.x, SEA_Y - rock.h, rock.w, rock.h);
        } else {
          /* Silhouette de secours */
          ctx.fillStyle = "rgba(36,59,113,0.28)";
          ctx.beginPath();
          ctx.moveTo(rock.x, SEA_Y);
          ctx.lineTo(rock.x + rock.w * 0.5, SEA_Y - rock.h);
          ctx.lineTo(rock.x + rock.w, SEA_Y);
          ctx.fill();
        }
      }

      /* ── Mer / vagues ── */
      const seaH = GAME_H - SEA_Y + 4;
      if (ready(refVague.current)) {
        const tileW  = seaH * RATIO_VAGUE;
        const offset = s.waveOffset % tileW;
        const count  = Math.ceil(GAME_W / tileW) + 2;
        for (let i = 0; i < count; i++) {
          ctx.drawImage(refVague.current, i * tileW - offset, SEA_Y - 1, tileW, seaH + 2);
        }
      } else {
        ctx.fillStyle = "rgba(36,59,113,0.22)";
        ctx.fillRect(0, SEA_Y, GAME_W, seaH);
      }

      /* ── Soleil ── */
      const diam = SUN_R * 2;
      if (ready(refSun.current)) {
        /* Dessin simple — pas de clip cercle, image rectangulaire */
        const iw = refSun.current.naturalWidth;
        const ih = refSun.current.naturalHeight;
        // Fit dans le carré diam×diam en gardant le ratio
        const scale = Math.min(diam / iw, diam / ih);
        const sw = iw * scale;
        const sh = ih * scale;
        ctx.drawImage(
          refSun.current,
          SUN_X - sw / 2,
          s.sunY + SUN_R - sh / 2,
          sw, sh
        );
      } else {
        ctx.beginPath();
        ctx.arc(SUN_X, s.sunY + SUN_R, SUN_R, 0, Math.PI * 2);
        ctx.fillStyle = "#d9943a";
        ctx.fill();
      }
    };

    /* ── Boucle principale ── */
    const loop = (ts: number) => {
      const s = stateRef.current;

      if (s.lastTs === 0) s.lastTs = ts;
      const dt = Math.min((ts - s.lastTs) / 1000, 0.05);
      s.lastTs = ts;

      if (!s.dead) {
        s.vy         += GRAVITY * dt;
        s.sunY       += s.vy * dt;
        if (s.sunY >= GROUND_Y) { s.sunY = GROUND_Y; s.vy = 0; }
        if (s.sunY  < 0)        { s.sunY = 0;         s.vy = 0; }

        s.waveOffset += 60 * dt;

        s.scoreAccum += dt;
        if (s.scoreAccum >= 1) {
          s.score      += Math.floor(s.scoreAccum);
          s.scoreAccum %= 1;
          setDispScore(s.score);
        }

        s.speed = BASE_SPD + s.score * 7;

        s.spawnAccum += dt;
        const interval = Math.max(1.1, 2.5 - s.score * 0.06);
        if (s.spawnAccum >= interval) { s.spawnAccum = 0; spawnRock(s); }

        s.rocks.forEach(r => { r.x -= s.speed * dt; });
        s.rocks = s.rocks.filter(r => r.x + r.w > -10);

        /* Collision */
        const pad    = 10;
        const sunL   = SUN_X - SUN_R + pad;
        const sunRe  = SUN_X + SUN_R - pad;
        const sunBot = s.sunY + SUN_R * 2 - pad;
        for (const rock of s.rocks) {
          if (sunRe <= rock.x + 4 || sunL >= rock.x + rock.w - 4) continue;
          if (sunBot > SEA_Y - rock.h * 0.85) {
            s.dead = true; setDispDead(true); setDispScore(s.score); break;
          }
        }
      }

      draw(s);
      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  /* ── Saut / Restart ── */
  const jump = useCallback(() => {
    const s = stateRef.current;
    if (s.dead) {
      stateRef.current = makeState();
      setDispDead(false);
      setDispScore(0);
      return;
    }
    if (s.sunY >= GROUND_Y - 8) s.vy = JUMP_V;
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Space") { e.preventDefault(); jump(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [jump]);

  return (
    <div style={{ textAlign: "center", userSelect: "none", marginBottom: "40px" }}>
      {/*
        Images cachées dans le DOM — le navigateur les charge normalement.
        On les lit depuis le canvas via refSun / refMontagne / refVague.
      */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img ref={refSun}      src="/anim-sun.jpg"  alt="" style={{ display: "none" }} />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img ref={refMontagne} src="/montagne.png"  alt="" style={{ display: "none" }} />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img ref={refVague}    src="/vague.png"     alt="" style={{ display: "none" }} />

      <div
        onClick={jump}
        onTouchStart={(e) => { e.preventDefault(); jump(); }}
        style={{
          display: "inline-block", cursor: "pointer",
          touchAction: "none", overflow: "hidden",
          border: `1px solid rgba(36,59,113,0.12)`,
        }}
      >
        <canvas
          ref={canvasRef}
          style={{
            display: "block",
            width: "min(500px, 90vw)",
            aspectRatio: `${GAME_W} / ${GAME_H}`,
          }}
        />
      </div>

      <p style={{
        fontSize: "11px", letterSpacing: "0.18em", textTransform: "uppercase",
        opacity: 0.35, marginTop: "8px", fontFamily: "'FT Aktual', Georgia, serif",
      }}>
        {dispDead
          ? `Score : ${dispScore} — Tap pour rejouer`
          : `Score : ${dispScore} — Espace ou tap pour sauter`}
      </p>
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
        {showGame && <SunGame onClose={() => setShowGame(false)} />}

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
