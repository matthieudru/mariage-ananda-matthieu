"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";

const COLOR = "#243b71";
const BG = "#f3ecdc";

/* ── Mini jeu Soleil ── */
const SUN_R = 26;
const SUN_X = 70;
const JUMP_V = -11;
const GRAVITY = 0.65;
const GAME_W = 500;
const GAME_H = 175;
const SEA_Y = GAME_H - 42;

type Rock = { x: number; w: number; h: number };

function SunGame({ onClose }: { onClose: () => void }) {
  const [dead, setDead] = useState(false);
  const [score, setScore] = useState(0);

  type State = {
    sunY: number; vy: number; rocks: Rock[];
    frame: number; speed: number; score: number; dead: boolean;
  };

  const makeState = (): State => ({
    sunY: SEA_Y - SUN_R * 2 - 8, vy: 0, rocks: [],
    frame: 0, speed: 4.5, score: 0, dead: false,
  });

  const stateRef = useRef<State>(makeState());
  const rafRef = useRef<number>(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgs = useRef<{ sun?: HTMLImageElement; montagne?: HTMLImageElement; vague?: HTMLImageElement }>({});
  const imgsReady = useRef({ sun: false, montagne: false, vague: false });

  useEffect(() => {
    const load = (src: string, key: "sun" | "montagne" | "vague") => {
      const img = new Image();
      img.onload = () => { imgsReady.current[key] = true; };
      img.src = src;
      imgs.current[key] = img;
    };
    load("/favicon.png", "sun");
    load("/montagne.png", "montagne");
    load("/vague.png", "vague");
  }, []);

  const jump = useCallback(() => {
    const s = stateRef.current;
    if (s.dead) { stateRef.current = makeState(); setDead(false); setScore(0); return; }
    if (s.sunY >= SEA_Y - SUN_R * 2 - 4) s.vy = JUMP_V;
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.code === "Space") { e.preventDefault(); jump(); } };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [jump]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = GAME_W * dpr;
    canvas.height = GAME_H * dpr;
    const ctx = canvas.getContext("2d")!;
    ctx.scale(dpr, dpr);
    const s = stateRef.current;

    const spawnRock = () => {
      const level = Math.floor(s.score / 200);
      const baseH = 38 + level * 12;
      const h = Math.min(baseH + Math.random() * 35, 108);
      const w = h * 1.848 * (0.65 + Math.random() * 0.7);
      s.rocks.push({ x: GAME_W + 20, w, h });
      if (level >= 2 && Math.random() < 0.38) {
        const h2 = (38 + level * 8) * (0.75 + Math.random() * 0.5);
        const w2 = Math.min(h2, 105) * 1.848 * (0.65 + Math.random() * 0.5);
        s.rocks.push({ x: GAME_W + 20 + w + 18 + Math.random() * 30, w: w2, h: Math.min(h2, 105) });
      }
    };

    const drawScene = () => {
      ctx.clearRect(0, 0, GAME_W, GAME_H);
      const sky = ctx.createLinearGradient(0, 0, 0, SEA_Y);
      sky.addColorStop(0, "#ede4d0");
      sky.addColorStop(1, "#f3ecdc");
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, GAME_W, SEA_Y);

      if (imgsReady.current.montagne && imgs.current.montagne) {
        for (const rock of s.rocks) {
          ctx.drawImage(imgs.current.montagne!, rock.x, SEA_Y - rock.h, rock.w, rock.h);
        }
      }

      const seaH = GAME_H - SEA_Y + 4;
      if (imgsReady.current.vague && imgs.current.vague) {
        const vague = imgs.current.vague!;
        const scaledW = seaH * (vague.naturalWidth / vague.naturalHeight);
        const offset = (s.frame * 1.8) % scaledW;
        const count = Math.ceil(GAME_W / scaledW) + 2;
        for (let i = 0; i < count; i++) {
          ctx.drawImage(vague, i * scaledW - offset, SEA_Y - 2, scaledW, seaH + 2);
        }
      } else {
        ctx.fillStyle = "rgba(36,59,113,0.18)";
        ctx.fillRect(0, SEA_Y, GAME_W, seaH);
      }

      if (imgsReady.current.sun && imgs.current.sun) {
        const sunImg = imgs.current.sun!;
        const ratio = sunImg.naturalHeight / sunImg.naturalWidth;
        const sunW = SUN_R * 2;
        const sunH = sunW * ratio;
        ctx.drawImage(sunImg, SUN_X - SUN_R, s.sunY + SUN_R - sunH / 2, sunW, sunH);
      } else {
        ctx.beginPath();
        ctx.arc(SUN_X, s.sunY + SUN_R, SUN_R, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(215,152,45,0.95)";
        ctx.fill();
      }
    };

    const loop = () => {
      if (s.dead) return;
      s.frame++;
      s.score++;
      s.speed = 4.5 + Math.floor(s.score / 200) * 0.5;
      s.vy += GRAVITY;
      s.sunY += s.vy;
      if (s.sunY >= SEA_Y - SUN_R * 2) { s.sunY = SEA_Y - SUN_R * 2; s.vy = 0; }
      if (s.sunY < 0) { s.sunY = 0; s.vy = 0; }
      const interval = Math.max(46, 82 - Math.floor(s.score / 200) * 5);
      if (s.frame % interval === 0) spawnRock();
      s.rocks = s.rocks.filter(r => r.x + r.w > -10);
      s.rocks.forEach(r => { r.x -= s.speed; });
      const pad = 5;
      const sunL = SUN_X - SUN_R + pad, sunR = SUN_X + SUN_R - pad;
      const sunBot = s.sunY + SUN_R * 2 - pad;
      for (const rock of s.rocks) {
        if (sunR < rock.x + 6 || sunL > rock.x + rock.w - 6) continue;
        if (sunBot > SEA_Y - rock.h * 0.80) {
          s.dead = true; setDead(true); setScore(s.score);
          cancelAnimationFrame(rafRef.current); drawScene(); return;
        }
      }
      drawScene();
      setScore(s.score);
      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [dead]);

  return (
    <div style={{ textAlign: "center", userSelect: "none", marginBottom: "40px" }}>
      <div onClick={jump} onTouchStart={(e) => { e.preventDefault(); jump(); }}
        style={{ display: "inline-block", cursor: "pointer", touchAction: "none", overflow: "hidden", border: `1px solid rgba(36,59,113,0.12)` }}>
        <canvas ref={canvasRef}
          style={{ display: "block", width: "min(500px, 88vw)", aspectRatio: `${GAME_W} / ${GAME_H}` }} />
      </div>
      <p style={{ fontSize: "11px", letterSpacing: "0.18em", textTransform: "uppercase", opacity: 0.35, marginTop: "8px", fontFamily: "'FT Aktual', Georgia, serif" }}>
        {dead ? `Score : ${Math.floor(score / 10)} — Tap pour rejouer` : `Score : ${Math.floor(score / 10)} — Espace ou tap pour sauter`}
      </p>
      <button onClick={onClose} style={{ marginTop: "10px", background: "none", border: "none", fontSize: "11px", letterSpacing: "0.15em", textTransform: "uppercase", opacity: 0.3, cursor: "pointer", fontFamily: "'FT Aktual', Georgia, serif", color: COLOR }}>
        Fermer ×
      </button>
    </div>
  );
}

export default function GraziePage() {
  const [showGame, setShowGame] = useState(false);
  const [prenom, setPrenom] = useState("");

  useEffect(() => {
    const p = new URLSearchParams(window.location.search).get("prenom") || "";
    setPrenom(p);
  }, []);

  return (
    <div style={{ background: BG, minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-between", fontFamily: "'FT Aktual', Georgia, serif", padding: "60px 24px 48px" }}>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "0" }}>

        {showGame && <SunGame onClose={() => setShowGame(false)} />}

        {!showGame && (
          <button onClick={() => setShowGame(true)} className="grazie-btn grazie-btn-blue" style={{ marginBottom: "40px" }}>
            Jouer
          </button>
        )}

        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "16px", marginBottom: "28px" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/Sun.png" alt="" style={{ width: "clamp(64px, 9vw, 120px)", height: "auto" }} />
          <p style={{ fontSize: "clamp(48px, 9vw, 110px)", fontWeight: 500, letterSpacing: "-0.03em", lineHeight: 0.9, color: COLOR }}>
            Grazie{prenom ? ` ${prenom}` : ""}
          </p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/Sun.png" alt="" style={{ width: "clamp(64px, 9vw, 120px)", height: "auto" }} />
        </div>

        <a href="https://www.ungrandjour.com/fr/ananda-matthieu" target="_blank" rel="noopener noreferrer" className="grazie-btn grazie-btn-red">
          Liste de mariage
        </a>
      </div>

      <Link href="/" style={{ marginTop: "48px", fontSize: "11px", letterSpacing: "0.2em", textTransform: "uppercase", opacity: 0.38, color: COLOR, textDecoration: "none", fontFamily: "'FT Aktual', Georgia, serif" }}>
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
        .grazie-btn-red { color: #6B1A1A; border-color: #6B1A1A; }
        .grazie-btn-red:hover, .grazie-btn-red:active { background: #6B1A1A; color: ${BG}; }
        .grazie-btn-blue { color: ${COLOR}; border-color: ${COLOR}; }
        .grazie-btn-blue:hover, .grazie-btn-blue:active { background: ${COLOR}; color: ${BG}; }
      `}</style>
    </div>
  );
}
