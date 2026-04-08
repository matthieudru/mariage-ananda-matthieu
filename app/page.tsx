"use client";

import { useEffect, useState } from "react";

const COLOR = "#243b71";
const BG = "#f3ecdc";
const W = 11;
const DEZOOM_START = 0.5;
const DEZOOM_DUR = 5.5;

export default function Home() {
  const [vDur, setVDur] = useState("4s");
  const [hDur, setHDur] = useState("3s");
  const [hDelay, setHDelay] = useState("4.5s");

  useEffect(() => {
    const halfH = window.innerHeight / 2;
    const halfW = window.innerWidth / 2;
    const total = DEZOOM_DUR;
    const vd = total * halfH / (halfH + halfW);
    const hd = total * halfW / (halfH + halfW);
    const hDel = DEZOOM_START + vd;
    setVDur(`${vd.toFixed(2)}s`);
    setHDur(`${hd.toFixed(2)}s`);
    setHDelay(`${hDel.toFixed(2)}s`);
  }, []);

  const handleTouchStart = (e: React.TouchEvent<HTMLAnchorElement>) => {
    const el = e.currentTarget;
    const href = el.getAttribute("href")!;
    // Couleur immédiate via DOM direct (avant que React puisse écraser)
    el.style.cssText += `background:${COLOR} !important;color:${BG} !important;opacity:1 !important;transition:none !important;`;
    // Délai court pour que la couleur soit visible avant la navigation
    e.preventDefault();
    setTimeout(() => { window.location.href = href; }, 200);
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: BG, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>

      {/* Image */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/illustration.JPG"
        alt="Ananda & Matthieu"
        style={{
          width: "min(88vw, 64vh)",
          height: "auto",
          display: "block",
          marginTop: "-3vh",
          marginLeft: "-24px",
          transformOrigin: "55% 28%",
          WebkitBackfaceVisibility: "hidden",
          backfaceVisibility: "hidden",
          willChange: "transform",
          animation: `dezoom ${DEZOOM_DUR}s ease-out ${DEZOOM_START}s both`,
        }}
      />

      {/* Border SVGs */}
      <svg style={{ position:"absolute", left:0, top:0, width:W, height:"100%", zIndex:10, pointerEvents:"none", overflow:"visible" }}>
        <line x1={W/2} y1="50%" x2={W/2} y2="0"    stroke={COLOR} strokeWidth={W} pathLength="1" style={{ strokeDasharray:1, strokeDashoffset:1, animation:`draw ${vDur} linear ${DEZOOM_START}s forwards` }} />
        <line x1={W/2} y1="50%" x2={W/2} y2="100%" stroke={COLOR} strokeWidth={W} pathLength="1" style={{ strokeDasharray:1, strokeDashoffset:1, animation:`draw ${vDur} linear ${DEZOOM_START}s forwards` }} />
      </svg>
      <svg style={{ position:"absolute", right:0, top:0, width:W, height:"100%", zIndex:10, pointerEvents:"none", overflow:"visible" }}>
        <line x1={W/2} y1="50%" x2={W/2} y2="0"    stroke={COLOR} strokeWidth={W} pathLength="1" style={{ strokeDasharray:1, strokeDashoffset:1, animation:`draw ${vDur} linear ${DEZOOM_START}s forwards` }} />
        <line x1={W/2} y1="50%" x2={W/2} y2="100%" stroke={COLOR} strokeWidth={W} pathLength="1" style={{ strokeDasharray:1, strokeDashoffset:1, animation:`draw ${vDur} linear ${DEZOOM_START}s forwards` }} />
      </svg>
      <svg style={{ position:"absolute", top:0, left:0, width:"100%", height:W, zIndex:10, pointerEvents:"none", overflow:"visible" }}>
        <line x1="0"    y1={W/2} x2="50%" y2={W/2} stroke={COLOR} strokeWidth={W} pathLength="1" style={{ strokeDasharray:1, strokeDashoffset:1, animation:`draw ${hDur} linear ${hDelay} forwards` }} />
        <line x1="100%" y1={W/2} x2="50%" y2={W/2} stroke={COLOR} strokeWidth={W} pathLength="1" style={{ strokeDasharray:1, strokeDashoffset:1, animation:`draw ${hDur} linear ${hDelay} forwards` }} />
      </svg>
      <svg style={{ position:"absolute", bottom:0, left:0, width:"100%", height:W, zIndex:10, pointerEvents:"none", overflow:"visible" }}>
        <line x1="0"    y1={W/2} x2="50%" y2={W/2} stroke={COLOR} strokeWidth={W} pathLength="1" style={{ strokeDasharray:1, strokeDashoffset:1, animation:`draw ${hDur} linear ${hDelay} forwards` }} />
        <line x1="100%" y1={W/2} x2="50%" y2={W/2} stroke={COLOR} strokeWidth={W} pathLength="1" style={{ strokeDasharray:1, strokeDashoffset:1, animation:`draw ${hDur} linear ${hDelay} forwards` }} />
      </svg>

      {/* Nav */}
      <a href="/infos" className="nav-btn nav-left" onTouchStart={handleTouchStart}>Infos</a>
      <a href="/rsvp"  className="nav-btn nav-right" onTouchStart={handleTouchStart}>RSVP</a>

      <style>{`
        @keyframes dezoom {
          0%   { transform: translate3d(0,0,0) scale(3.5); }
          100% { transform: translate3d(0,0,0) scale(1.05); }
        }
        @keyframes draw {
          0%   { stroke-dashoffset: 1; }
          100% { stroke-dashoffset: 0; }
        }
        @keyframes fadeIn {
          0%   { opacity: 0; }
          100% { opacity: 1; }
        }

        .nav-btn {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          z-index: 20;
          color: ${COLOR};
          border: 1px solid ${COLOR};
          padding: 10px 20px;
          font-family: 'FT Aktual', Georgia, serif;
          font-weight: 300;
          font-size: clamp(11px, 1vw, 13px);
          letter-spacing: 0.25em;
          text-decoration: none;
          text-transform: uppercase;
          opacity: 0;
          animation: fadeIn 0.8s ease-out 6.2s forwards;
          transition: background 0.15s ease-out, color 0.15s ease-out;
          min-height: 44px;
          display: flex;
          align-items: center;
          -webkit-tap-highlight-color: transparent;
          touch-action: manipulation;
        }
        .nav-btn:hover {
          background: ${COLOR};
          color: ${BG};
        }

        .nav-left  { left:  calc(50% - min(44vw, 32vh) - 72px); }
        .nav-right { right: calc(50% - min(44vw, 32vh) - 72px); }

        @media (max-width: 640px) {
          .nav-btn { top: calc(50% + 60px); }
          .nav-left  { left: 16px; }
          .nav-right { right: 16px; }
        }
      `}</style>
    </div>
  );
}
