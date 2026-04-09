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
const SEA_Y    = 150;           // Y de la surface de l'eau
const SUN_R    = 48;            // rayon du soleil → 96px de diamètre
const SUN_X    = 85;
const GROUND_Y = SEA_Y - SUN_R * 2;  // = 54  (sol du soleil = surface eau)

const JUMP_V   = -580;          // vélocité saut px/sec
const GRAVITY  = 1800;          // gravité px/sec²
const BASE_SPD = 200;           // vitesse de départ px/sec

// Ratios naturels des images
const RATIO_MONTAGNE = 1514 / 819;   // 1.848
const RATIO_VAGUE    = 1514 / 819;   // 1.848

/* ─────────────────────────────────────────
   Type état du jeu
───────────────────────────────────────── */
type Rock = { x: number; w: number; h: number };
type GS   = {
  sunY: number; vy: number; rocks: Rock[];
  speed: number; score: number;
  scoreAccum: number; spawnAccum: number;
  waveOffset: number;   // px (scroll des vagues)
  lastTs: number; dead: boolean;
};

const makeState = (): GS => ({
  sunY: GROUND_Y, vy: 0, rocks: [],
  speed: BASE_SPD, score: 0,
  scoreAccum: 0, spawnAccum: 0,
  waveOffset: 0,
  lastTs: 0, dead: false,
});

/* ─────────────────────────────────────────
   Chargement image robuste
   (gère le cache navigateur : onload peut
    ne pas se déclencher si déjà en cache)
───────────────────────────────────────── */
function loadImg(
  src: string,
  ref: React.MutableRefObject<HTMLImageElement | null>
) {
  const img = new Image();
  img.onload = () => { ref.current = img; };
  img.onerror = () => { console.warn("Image not loaded:", src); };
  img.src = src;
  // Si l'image était déjà en cache, onload ne se déclenche pas
  if (img.complete && img.naturalWidth > 0) ref.current = img;
}

/* ─────────────────────────────────────────
   Composant SunGame
───────────────────────────────────────── */
function SunGame({ onClose }: { onClose: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef  = useRef<GS>(makeState());
  const rafRef    = useRef<number>(0);

  // Images
  const imgSun      = useRef<HTMLImageElement | null>(null);
  const imgMontagne = useRef<HTMLImageElement | null>(null);
  const imgVague    = useRef<HTMLImageElement | null>(null);

  const [dispScore, setDispScore] = useState(0);
  const [dispDead,  setDispDead]  = useState(false);

  /* ── Chargement des images ── */
  useEffect(() => {
    loadImg("/anim-sun.jpg",  imgSun);      // 200×185, quasi carré
    loadImg("/montagne.png",  imgMontagne); // 1514×819
    loadImg("/vague.png",     imgVague);    // 1514×819
  }, []);

  /* ── Boucle de jeu (monte une seule fois) ── */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width  = GAME_W * dpr;
    canvas.height = GAME_H * dpr;
    const ctx = canvas.getContext("2d")!;
    ctx.scale(dpr, dpr);

    /* Spawn obstacle */
    const spawnRock = (s: GS) => {
      const lvl   = Math.floor(s.score / 15);
      const baseH = 28 + lvl * 7;
      const h     = Math.min(baseH + Math.random() * 18, 62); // max 62px (franchissable)
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

      /* ── Montagnes ── */
      for (const rock of s.rocks) {
        const img = imgMontagne.current;
        if (img) {
          ctx.drawImage(img, rock.x, SEA_Y - rock.h, rock.w, rock.h);
        } else {
          /* Fallback silhouette */
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
      const vImg = imgVague.current;
      if (vImg) {
        const tileW  = seaH * RATIO_VAGUE;
        const offset = s.waveOffset % tileW;
        const count  = Math.ceil(GAME_W / tileW) + 2;
        for (let i = 0; i < count; i++) {
          ctx.drawImage(vImg, i * tileW - offset, SEA_Y - 1, tileW, seaH + 2);
        }
      } else {
        ctx.fillStyle = "rgba(36,59,113,0.22)";
        ctx.fillRect(0, SEA_Y, GAME_W, seaH);
      }

      /* ── Soleil ── */
      const sunImg = imgSun.current;
      const diam   = SUN_R * 2;
      if (sunImg) {
        // Clip circulaire pour qualité maximale
        ctx.save();
        ctx.beginPath();
        ctx.arc(SUN_X, s.sunY + SUN_R, SUN_R, 0, Math.PI * 2);
        ctx.clip();
        // Cover-fit : remplir le cercle sans déformer
        const iRatio = sunImg.naturalWidth / sunImg.naturalHeight; // ≈1.08
        let sw = diam, sh = diam;
        if (iRatio > 1) { sh = diam / iRatio; } else { sw = diam * iRatio; }
        const ox = SUN_X - SUN_R + (diam - sw) / 2;
        const oy = s.sunY + (diam - sh) / 2;
        ctx.drawImage(sunImg, ox, oy, sw, sh);
        ctx.restore();
      } else {
        /* Fallback : cercle doré */
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
      const dt = Math.min((ts - s.lastTs) / 1000, 0.05); // cap 50ms
      s.lastTs = ts;

      if (!s.dead) {
        /* Physique */
        s.vy    += GRAVITY * dt;
        s.sunY  += s.vy * dt;
        if (s.sunY >= GROUND_Y) { s.sunY = GROUND_Y; s.vy = 0; }
        if (s.sunY < 0)         { s.sunY = 0;         s.vy = 0; }

        /* Scroll vagues */
        s.waveOffset += 60 * dt; // 60 px/sec

        /* Score : 1 point / seconde */
        s.scoreAccum += dt;
        if (s.scoreAccum >= 1) {
          s.score      += Math.floor(s.scoreAccum);
          s.scoreAccum %= 1;
          setDispScore(s.score);
        }

        /* Vitesse progressive (douce) */
        s.speed = BASE_SPD + s.score * 7;

        /* Spawn */
        s.spawnAccum += dt;
        const interval = Math.max(1.1, 2.5 - s.score * 0.06);
        if (s.spawnAccum >= interval) {
          s.spawnAccum = 0;
          spawnRock(s);
        }

        /* Déplacement obstacles */
        s.rocks.forEach(r => { r.x -= s.speed * dt; });
        s.rocks = s.rocks.filter(r => r.x + r.w > -10);

        /* Collision AABB avec marge */
        const pad    = 10;
        const sunL   = SUN_X - SUN_R + pad;
        const sunRe  = SUN_X + SUN_R - pad;
        const sunBot = s.sunY + diam - pad;
        for (const rock of s.rocks) {
          if (sunRe <= rock.x + 4 || sunL >= rock.x + rock.w - 4) continue;
          if (sunBot > SEA_Y - rock.h * 0.85) {
            s.dead = true;
            setDispDead(true);
            setDispScore(s.score);
            break;
          }
        }
      }

      draw(s);
      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);  // Une seule fois au montage

  /* ── Saut / Restart ── */
  const jump = useCallback(() => {
    const s = stateRef.current;
    if (s.dead) {
      stateRef.current = makeState();
      setDispDead(false);
      setDispScore(0);
      return;
    }
    if (s.sunY >= GROUND_Y - 8) s.vy = JUMP_V; // saut depuis le sol uniquement
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

        <div style={{
          display: "flex", alignItems: "center",
          justifyContent: "center", gap: "16px", marginBottom: "28px",
        }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/Sun.png" alt="" style={{ width: "clamp(64px, 9vw, 120px)", height: "auto" }} />
          <p style={{
            fontSize: "clamp(48px, 9vw, 110px)", fontWeight: 500,
            letterSpacing: "-0.03em", lineHeight: 0.9, color: COLOR,
          }}>
            Grazie{prenom ? ` ${prenom}` : ""}
          </p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/Sun.png" alt="" style={{ width: "clamp(64px, 9vw, 120px)", height: "auto" }} />
        </div>

        <a
          href="https://www.ungrandjour.com/fr/ananda-matthieu"
          target="_blank"
          rel="noopener noreferrer"
          className="grazie-btn grazie-btn-red"
        >
          Liste de mariage
        </a>
      </div>

      <Link
        href="/"
        style={{
          marginTop: "48px", fontSize: "11px", letterSpacing: "0.2em",
          textTransform: "uppercase", opacity: 0.38, color: COLOR,
          textDecoration: "none", fontFamily: "'FT Aktual', Georgia, serif",
        }}
      >
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
      `}</style>
    </div>
  );
}
