"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";

const COLOR = "#243b71";
const BG = "#f3ecdc";

/* ─────────────────────────────────────────
   Constantes du jeu
───────────────────────────────────────── */
const GAME_W    = 500;
const GAME_H    = 195;
const SEA_Y     = 150;          // surface de la mer
const SUN_R     = 42;           // rayon du soleil (84px de diamètre)
const SUN_X     = 88;           // position horizontale fixe
const JUMP_V    = -560;         // vélocité de saut (px/sec)
const GRAVITY   = 1800;         // gravité (px/sec²)
const BASE_SPD  = 270;          // vitesse de départ (px/sec)
const IMG_RATIO = 1514 / 819;   // ratio naturel de montagne.png et vague.png

const GROUND_Y  = SEA_Y - SUN_R * 2;   // 150 - 84 = 66 (sol du soleil)

/* ─────────────────────────────────────────
   Types
───────────────────────────────────────── */
type Rock = { x: number; w: number; h: number };

type GState = {
  sunY:       number;
  vy:         number;   // px/sec
  rocks:      Rock[];
  speed:      number;   // px/sec
  score:      number;   // secondes entières
  scoreAccum: number;   // fraction de seconde accumulée
  spawnAccum: number;   // temps depuis dernier spawn
  totalTime:  number;   // temps total écoulé (pour vagues)
  lastTs:     number;   // timestamp du dernier frame (ms)
  dead:       boolean;
};

const makeState = (): GState => ({
  sunY:       GROUND_Y,
  vy:         0,
  rocks:      [],
  speed:      BASE_SPD,
  score:      0,
  scoreAccum: 0,
  spawnAccum: 0,
  totalTime:  0,
  lastTs:     0,
  dead:       false,
});

/* ─────────────────────────────────────────
   Composant SunGame
───────────────────────────────────────── */
function SunGame({ onClose }: { onClose: () => void }) {
  const canvasRef   = useRef<HTMLCanvasElement>(null);
  const stateRef    = useRef<GState>(makeState());
  const rafRef      = useRef<number>(0);

  // Images stockées dans un ref — jamais null avant onload, donc on vérifie avant draw
  const imgSun      = useRef<HTMLImageElement | null>(null);
  const imgMontagne = useRef<HTMLImageElement | null>(null);
  const imgVague    = useRef<HTMLImageElement | null>(null);

  const [dispScore, setDispScore] = useState(0);
  const [dispDead,  setDispDead]  = useState(false);

  /* Chargement des images (une seule fois) */
  useEffect(() => {
    const load = (
      src: string,
      target: React.MutableRefObject<HTMLImageElement | null>
    ) => {
      const img = new Image();
      img.onload = () => { target.current = img; };
      img.src = src;
    };
    load("/favicon.png",   imgSun);
    load("/montagne.png",  imgMontagne);
    load("/vague.png",     imgVague);
  }, []);

  /* Boucle de jeu (tourne en permanence, ne s'arrête jamais) */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    /* Setup DPR une seule fois */
    const dpr = window.devicePixelRatio || 1;
    canvas.width  = GAME_W * dpr;
    canvas.height = GAME_H * dpr;
    const ctx = canvas.getContext("2d")!;
    ctx.scale(dpr, dpr);

    /* ── Spawn d'obstacle ── */
    const spawnRock = (s: GState) => {
      const lvl  = Math.floor(s.score / 12);
      const baseH = 32 + lvl * 8;
      const h     = Math.min(baseH + Math.random() * 22, 78); // max 78px (jumpable)
      const w     = h * IMG_RATIO * (0.55 + Math.random() * 0.55);
      s.rocks.push({ x: GAME_W + 20, w, h });
      // Double obstacle aux niveaux élevés
      if (lvl >= 3 && Math.random() < 0.28) {
        const h2 = Math.min((28 + lvl * 5) * (0.7 + Math.random() * 0.5), 65);
        const w2 = h2 * IMG_RATIO * (0.5 + Math.random() * 0.5);
        s.rocks.push({ x: GAME_W + 20 + w + 24 + Math.random() * 35, w: w2, h: h2 });
      }
    };

    /* ── Dessin ── */
    const draw = (s: GState) => {
      ctx.clearRect(0, 0, GAME_W, GAME_H);

      /* Ciel dégradé */
      const sky = ctx.createLinearGradient(0, 0, 0, SEA_Y);
      sky.addColorStop(0, "#ddd5bf");
      sky.addColorStop(1, "#f3ecdc");
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, GAME_W, SEA_Y);

      /* Montagnes / obstacles */
      for (const rock of s.rocks) {
        const img = imgMontagne.current;
        if (img) {
          ctx.drawImage(img, rock.x, SEA_Y - rock.h, rock.w, rock.h);
        } else {
          ctx.fillStyle = "rgba(36,59,113,0.30)";
          ctx.fillRect(rock.x, SEA_Y - rock.h, rock.w, rock.h);
        }
      }

      /* Vagues (image tuilée et scrollée) */
      const seaH  = GAME_H - SEA_Y + 6;
      const vImg  = imgVague.current;
      if (vImg) {
        const tileW = seaH * (vImg.naturalWidth / vImg.naturalHeight);
        const offset = (s.totalTime * 75) % tileW;
        const count  = Math.ceil(GAME_W / tileW) + 2;
        for (let i = 0; i < count; i++) {
          ctx.drawImage(vImg, i * tileW - offset, SEA_Y - 2, tileW, seaH + 2);
        }
      } else {
        ctx.fillStyle = "rgba(36,59,113,0.20)";
        ctx.fillRect(0, SEA_Y, GAME_W, seaH);
      }

      /* Soleil */
      const sImg  = imgSun.current;
      const diam  = SUN_R * 2;
      if (sImg) {
        // Dessiné carré pour correspondre à la hitbox circulaire
        ctx.drawImage(sImg, SUN_X - SUN_R, s.sunY, diam, diam);
      } else {
        ctx.beginPath();
        ctx.arc(SUN_X, s.sunY + SUN_R, SUN_R, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(215,152,45,0.95)";
        ctx.fill();
      }
    };

    /* ── Boucle principale (delta time) ── */
    const loop = (timestamp: number) => {
      const s = stateRef.current;

      /* Delta time en secondes, capé à 50ms pour éviter les sauts */
      if (s.lastTs === 0) s.lastTs = timestamp;
      const dt = Math.min((timestamp - s.lastTs) / 1000, 0.05);
      s.lastTs = timestamp;

      if (!s.dead) {
        s.totalTime  += dt;

        /* Physique */
        s.vy   += GRAVITY * dt;
        s.sunY += s.vy * dt;
        if (s.sunY >= GROUND_Y) { s.sunY = GROUND_Y; s.vy = 0; }
        if (s.sunY <  0)        { s.sunY = 0;         s.vy = 0; }

        /* Score : 1 point par seconde */
        s.scoreAccum += dt;
        if (s.scoreAccum >= 1) {
          s.score      += Math.floor(s.scoreAccum);
          s.scoreAccum %= 1;
          setDispScore(s.score);
        }

        /* Accélération progressive */
        s.speed = BASE_SPD + s.score * 10;

        /* Spawn d'obstacles */
        s.spawnAccum += dt;
        const interval = Math.max(0.72, 1.55 - s.score * 0.014);
        if (s.spawnAccum >= interval) {
          s.spawnAccum = 0;
          spawnRock(s);
        }

        /* Déplacement des obstacles */
        s.rocks.forEach(r => { r.x -= s.speed * dt; });
        s.rocks = s.rocks.filter(r => r.x + r.w > -10);

        /* Collision AABB avec marge */
        const pad    = 10;
        const sunL   = SUN_X - SUN_R + pad;
        const sunRe  = SUN_X + SUN_R - pad;
        const sunBot = s.sunY + SUN_R * 2 - pad;
        for (const rock of s.rocks) {
          // Pas de chevauchement horizontal → skip
          if (sunRe <= rock.x + 4 || sunL >= rock.x + rock.w - 4) continue;
          // Chevauchement vertical (bas du soleil vs haut effectif du rocher)
          if (sunBot > SEA_Y - rock.h * 0.82) {
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
  }, []); // Une seule fois au montage

  /* Saut / Restart */
  const jump = useCallback(() => {
    const s = stateRef.current;
    if (s.dead) {
      // Reset complet
      stateRef.current = makeState();
      setDispDead(false);
      setDispScore(0);
      return;
    }
    // Saut uniquement depuis le sol (ou presque)
    if (s.sunY >= GROUND_Y - 8) {
      s.vy = JUMP_V;
    }
  }, []);

  /* Clavier */
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
            width: "min(500px, 88vw)",
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
        alignItems: "center", justifyContent: "center", gap: "0",
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
          white-space: nowrap; transition: background 0.2s ease-out, color 0.2s ease-out;
          cursor: pointer; background: ${BG};
        }
        .grazie-btn-red   { color: #6B1A1A; border-color: #6B1A1A; }
        .grazie-btn-red:hover,   .grazie-btn-red:active   { background: #6B1A1A; color: ${BG}; }
        .grazie-btn-blue  { color: ${COLOR}; border-color: ${COLOR}; }
        .grazie-btn-blue:hover,  .grazie-btn-blue:active  { background: ${COLOR}; color: ${BG}; }
      `}</style>
    </div>
  );
}
