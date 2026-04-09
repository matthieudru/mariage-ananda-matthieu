"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";

const COLOR = "#243b71";
const BG = "#f3ecdc";

const SHEET_URL = "https://script.google.com/macros/s/AKfycbyPWyZHvxo3l6bQGfmeUY5MvkbO1_y9nnEPTdf-6r-JJuzWdt8d1Q_nowH4t0mCW6uQ/exec";

/* ── Mini jeu Soleil ── */
const SUN_SIZE = 44;
const JUMP_V = -14;
const GRAVITY = 0.72;
const GAME_W = 500;
const GAME_H = 160;
const GROUND_Y = GAME_H - 20; // laisse de la place pour le sol

type Mountain = { x: number; peaks: number[] };

function drawMountain(ctx: CanvasRenderingContext2D, m: Mountain, groundY: number) {
  const nPeaks = m.peaks.length;
  const segW = 60;
  ctx.beginPath();
  ctx.moveTo(m.x, groundY);
  for (let i = 0; i < nPeaks; i++) {
    const px = m.x + i * segW + segW / 2;
    ctx.lineTo(px, groundY - m.peaks[i]);
  }
  ctx.lineTo(m.x + nPeaks * segW, groundY);
  ctx.closePath();
  ctx.fillStyle = `rgba(36,59,113,0.35)`;
  ctx.fill();
}

function SunGame({ onClose }: { onClose: () => void }) {
  const [dead, setDead] = useState(false);
  const [score, setScore] = useState(0);

  type State = {
    sunY: number; vy: number;
    mountains: Mountain[];
    frame: number; speed: number; score: number; dead: boolean;
  };

  const makeState = (): State => ({
    sunY: GROUND_Y - SUN_SIZE, vy: 0, mountains: [], frame: 0, speed: 3.5, score: 0, dead: false
  });

  const stateRef = useRef<State>(makeState());
  const rafRef = useRef<number>(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const faviconImg = useRef<HTMLImageElement | null>(null);
  const imgReady = useRef(false);

  useEffect(() => {
    const img = new Image();
    img.onload = () => { imgReady.current = true; };
    img.src = "/favicon.png";
    faviconImg.current = img;
  }, []);

  const jump = useCallback(() => {
    const s = stateRef.current;
    if (s.dead) { stateRef.current = makeState(); setDead(false); setScore(0); return; }
    if (s.sunY >= GROUND_Y - SUN_SIZE - 2) s.vy = JUMP_V;
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.code === "Space") { e.preventDefault(); jump(); } };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [jump]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const s = stateRef.current;

    const drawScene = () => {
      ctx.clearRect(0, 0, GAME_W, GAME_H);

      // Sky gradient
      const sky = ctx.createLinearGradient(0, 0, 0, GROUND_Y);
      sky.addColorStop(0, "#e8ddc8");
      sky.addColorStop(1, "#f3ecdc");
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, GAME_W, GROUND_Y);

      // Ground
      ctx.fillStyle = `rgba(36,59,113,0.12)`;
      ctx.fillRect(0, GROUND_Y, GAME_W, GAME_H - GROUND_Y);
      ctx.strokeStyle = `rgba(36,59,113,0.3)`;
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(0, GROUND_Y); ctx.lineTo(GAME_W, GROUND_Y); ctx.stroke();

      // Mountains
      s.mountains.forEach(m => drawMountain(ctx, m, GROUND_Y));

      // Favicon (sun)
      if (imgReady.current && faviconImg.current) {
        ctx.drawImage(faviconImg.current, 60, s.sunY, SUN_SIZE, SUN_SIZE);
      } else {
        ctx.fillStyle = `rgba(200,150,50,0.9)`;
        ctx.beginPath();
        ctx.arc(60 + SUN_SIZE / 2, s.sunY + SUN_SIZE / 2, SUN_SIZE / 2 - 2, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const loop = () => {
      if (s.dead) return;
      s.frame++;
      s.score++;
      s.speed = 3.5 + Math.floor(s.score / 250) * 0.4;

      // Physics
      s.vy += GRAVITY;
      s.sunY += s.vy;
      if (s.sunY >= GROUND_Y - SUN_SIZE) { s.sunY = GROUND_Y - SUN_SIZE; s.vy = 0; }

      // Spawn mountains
      const interval = Math.max(60, 110 - Math.floor(s.score / 200) * 5);
      if (s.frame % interval === 0) {
        const nPeaks = 1 + Math.floor(Math.random() * 2);
        const peaks = Array.from({ length: nPeaks }, () => 28 + Math.random() * 40);
        s.mountains.push({ x: GAME_W + 10, peaks });
      }
      s.mountains = s.mountains.filter(m => m.x + m.peaks.length * 60 > -10);
      s.mountains.forEach(m => { m.x -= s.speed; });

      // Collision — check if sun overlaps any mountain polygon (simplified bbox per segment)
      const sx = 60, sy = s.sunY, pad = 8;
      for (const m of s.mountains) {
        const segW = 60;
        for (let i = 0; i < m.peaks.length; i++) {
          const px = m.x + i * segW;
          const pw = segW;
          const ph = m.peaks[i];
          if (sx + SUN_SIZE - pad > px + 8 && sx + pad < px + pw - 8 && sy + SUN_SIZE - pad > GROUND_Y - ph * 0.7) {
            s.dead = true;
            setDead(true);
            setScore(s.score);
            cancelAnimationFrame(rafRef.current);
            drawScene();
            return;
          }
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
        style={{ display: "inline-block", cursor: "pointer", touchAction: "none", borderRadius: "2px", overflow: "hidden", border: `1px solid rgba(36,59,113,0.12)` }}>
        <canvas ref={canvasRef} width={GAME_W} height={GAME_H}
          style={{ display: "block", maxWidth: "min(500px, 88vw)", height: "auto" }} />
      </div>
      <p style={{ fontSize: "11px", letterSpacing: "0.18em", textTransform: "uppercase", opacity: 0.35, marginTop: "8px", fontFamily: "'FT Aktual', Georgia, serif" }}>
        {dead ? `Score : ${Math.floor(score / 10)} — Tap pour rejouer` : `Score : ${Math.floor(score / 10)} — Espace ou tap pour sauter`}
      </p>
      <button onClick={onClose} style={{ marginTop: "10px", background: "none", border: "none", fontSize: "11px", letterSpacing: "0.15em", textTransform: "uppercase", opacity: 0.3, cursor: "pointer", fontFamily: "'FT Aktual', Georgia, serif", color: "#243b71" }}>
        Fermer ×
      </button>
    </div>
  );
}

const JOURS = [
  { id: "vendredi", label: "Vendredi 9", sublabel: "The Opening" },
  { id: "samedi", label: "Samedi 10", sublabel: "The Wedding" },
  { id: "dimanche", label: "Dimanche 11", sublabel: "The After Party" },
];

type Personne = { prenom: string; nom: string; email: string; allergies: string; enfant: boolean };

const personneVide = (): Personne => ({ prenom: "", nom: "", email: "", allergies: "", enfant: false });

type FormData = {
  jours: string[];
  personnes: Personne[];
  message: string;
};

function GraziePage({ prenom }: { prenom: string }) {
  const [showGame, setShowGame] = useState(false);
  return (
    <div style={{ background: BG, minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-between", fontFamily: "'FT Aktual', Georgia, serif", padding: "60px 24px 48px" }}>

      {/* Centre */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "0" }}>

        {/* Jeu */}
        {showGame && <SunGame onClose={() => setShowGame(false)} />}

        {/* Bouton Jouer */}
        {!showGame && (
          <button onClick={() => setShowGame(true)} className="grazie-btn grazie-btn-blue" style={{ marginBottom: "40px" }}>
            Jouer
          </button>
        )}

        {/* Grazie avec soleils */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "16px", marginBottom: "28px" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/Sun.png" alt="" style={{ width: "clamp(64px, 9vw, 120px)", height: "auto" }} />
          <p style={{ fontSize: "clamp(48px, 9vw, 110px)", fontWeight: 500, letterSpacing: "-0.03em", lineHeight: 0.9, color: COLOR }}>
            Grazie{prenom ? ` ${prenom}` : ""}
          </p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/Sun.png" alt="" style={{ width: "clamp(64px, 9vw, 120px)", height: "auto" }} />
        </div>

        {/* Liste de mariage */}
        <a href="https://www.ungrandjour.com/fr/ananda-matthieu" target="_blank" rel="noopener noreferrer" className="grazie-btn grazie-btn-red">
          Liste de mariage
        </a>
      </div>

      {/* Retour accueil en bas */}
      <Link href="/" className="grazie-btn grazie-btn-blue" style={{ marginTop: "40px" }}>
        ← Retour à l'accueil
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

export default function RSVP() {
  const [showGrazie, setShowGrazie] = useState(false);
  const [form, setForm] = useState<FormData>({
    jours: [],
    personnes: [personneVide()],
    message: "",
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("grazie") === "1") setShowGrazie(true);
  }, []);

  const setNbPersonnes = (n: number) => {
    setForm(f => {
      const current = f.personnes;
      if (n > current.length) {
        return { ...f, personnes: [...current, ...Array(n - current.length).fill(null).map(personneVide)] };
      } else {
        return { ...f, personnes: current.slice(0, n) };
      }
    });
  };

  const updatePersonne = (i: number, field: keyof Personne, value: string) => {
    setForm(f => {
      const personnes = [...f.personnes];
      personnes[i] = { ...personnes[i], [field]: value };
      return { ...f, personnes };
    });
  };

  const toggleJour = (id: string) => {
    setForm(f => ({
      ...f,
      jours: f.jours.includes(id) ? f.jours.filter(j => j !== id) : [...f.jours, id],
    }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (form.jours.length === 0) e.jours = "Choisissez au moins un jour";
    form.personnes.forEach((p, i) => {
      if (!p.prenom.trim()) e[`prenom_${i}`] = "Requis";
      if (!p.nom.trim()) e[`nom_${i}`] = "Requis";
      if ((i === 0 || !p.enfant) && (!p.email.trim() || !p.email.includes("@"))) e[`email_${i}`] = "Email invalide";
    });
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setStatus("loading");
    try {
      const ps = form.personnes;
      const params = new URLSearchParams({
        date: new Date().toLocaleString("fr-FR"),
        prenom1: ps[0]?.prenom ?? "", nom1: ps[0]?.nom ?? "", email1: ps[0]?.email ?? "", allergie1: ps[0]?.allergies ?? "",
        opening:    form.jours.includes("vendredi") ? "Oui" : "Non",
        wedding:    form.jours.includes("samedi")   ? "Oui" : "Non",
        afterparty: form.jours.includes("dimanche") ? "Oui" : "Non",
        nb_personnes: String(ps.length),
        prenom2: ps[1]?.prenom ?? "", nom2: ps[1]?.nom ?? "", enfant2: ps[1] ? (ps[1].enfant ? "Enfant" : "Adulte") : "", email2: ps[1]?.email ?? "", allergie2: ps[1]?.allergies ?? "",
        prenom3: ps[2]?.prenom ?? "", nom3: ps[2]?.nom ?? "", enfant3: ps[2] ? (ps[2].enfant ? "Enfant" : "Adulte") : "", email3: ps[2]?.email ?? "", allergie3: ps[2]?.allergies ?? "",
        prenom4: ps[3]?.prenom ?? "", nom4: ps[3]?.nom ?? "", enfant4: ps[3] ? (ps[3].enfant ? "Enfant" : "Adulte") : "", email4: ps[3]?.email ?? "", allergie4: ps[3]?.allergies ?? "",
        message: form.message,
      });
      await fetch(SHEET_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params.toString(),
      });
      setStatus("success");
    } catch {
      setStatus("error");
    }
  };

  if (showGrazie || status === "success") {
    const prenom = form.personnes[0]?.prenom?.trim() || "";
    return <GraziePage prenom={prenom} />;
  }

  return (
    <div style={{ background: BG, color: COLOR, fontFamily: "'FT Aktual', Georgia, serif" }}>

      {/* Nav */}
      <nav style={{
        position: "sticky", top: "11px", zIndex: 100,
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "20px 40px", background: BG,
        borderBottom: `1px solid rgba(36,59,113,0.15)`,
      }}>
        <Link href="/infos" style={{ color: COLOR, textDecoration: "none", fontSize: "11px", fontWeight: 400, letterSpacing: "0.22em", textTransform: "uppercase", opacity: 0.5 }}>
          ← Infos
        </Link>
        <Link href="/" style={{ color: COLOR, textDecoration: "none", fontSize: "11px", fontWeight: 400, letterSpacing: "0.22em", textTransform: "uppercase", opacity: 0.5 }}>
          Accueil
        </Link>
      </nav>

      {/* Hero */}
      <section style={{ padding: "60px 40px 48px", borderBottom: `1px solid rgba(36,59,113,0.15)`, textAlign: "center" }}>
        <div style={{ display: "inline-block", position: "relative" }}>
          {/* Images positionnées en dehors du flux pour ne pas affecter la largeur */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/Orange fond copie.png" alt="" style={{ position: "absolute", right: "100%", top: "50%", transform: "translateY(-50%)", width: "clamp(80px, 11vw, 150px)", height: "auto", marginRight: "16px" }} />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/Orange fond.png" alt="" style={{ position: "absolute", left: "100%", top: "50%", transform: "translateY(-50%)", width: "clamp(80px, 11vw, 150px)", height: "auto", marginLeft: "16px" }} />
          <h1 style={{ fontSize: "clamp(48px, 10vw, 120px)", fontWeight: 500, letterSpacing: "0.08em", lineHeight: 0.88, marginBottom: "4px" }}>
            RSVP
          </h1>
          <p className="rsvp-subtitle" style={{ fontSize: "13px", letterSpacing: "0.25em", textTransform: "uppercase", opacity: 0.38, width: "100%", textAlign: "center" }}>
            10 · 10 · 26 — Tonnara di Scopello
          </p>
          <p className="rsvp-subtitle-mobile" style={{ display: "none", fontSize: "13px", letterSpacing: "0.25em", textTransform: "uppercase", opacity: 0.38, width: "100%", textAlign: "center" }}>
            10.10.26<br />Tonnara di Scopello
          </p>
        </div>
      </section>

      {/* Formulaire */}
      <form onSubmit={handleSubmit} style={{ maxWidth: "720px", margin: "0 auto", padding: "64px 40px 120px" }}>

        {/* Personne 0 : Prénom / Nom / Email / Allergies */}
        {(() => { const p = form.personnes[0]; return (
          <div style={{ marginBottom: "56px", paddingBottom: "56px", borderBottom: `1px solid rgba(36,59,113,0.12)` }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginBottom: "24px" }}>
              <div>
                <label style={labelStyle}>Prénom</label>
                <input type="text" value={p.prenom} onChange={e => updatePersonne(0, "prenom", e.target.value)} placeholder="Prénom" style={inputStyle(!!errors[`prenom_0`])} />
                {errors[`prenom_0`] && <p style={errorStyle}>{errors[`prenom_0`]}</p>}
              </div>
              <div>
                <label style={labelStyle}>Nom</label>
                <input type="text" value={p.nom} onChange={e => updatePersonne(0, "nom", e.target.value)} placeholder="Nom" style={inputStyle(!!errors[`nom_0`])} />
                {errors[`nom_0`] && <p style={errorStyle}>{errors[`nom_0`]}</p>}
              </div>
            </div>
            <div style={{ marginBottom: "24px" }}>
              <label style={labelStyle}>Email de contact</label>
              <input type="email" value={p.email} onChange={e => updatePersonne(0, "email", e.target.value)} placeholder="votre@email.com" style={inputStyle(!!errors[`email_0`])} />
              {errors[`email_0`] && <p style={errorStyle}>{errors[`email_0`]}</p>}
            </div>
            <div>
              <label style={labelStyle}>Allergies / régime alimentaire <span style={{ opacity: 0.4 }}>(optionnel)</span></label>
              <input type="text" value={p.allergies} onChange={e => updatePersonne(0, "allergies", e.target.value)} placeholder="Végétarien, sans gluten, noix, OM..." style={inputStyle(false)} />
            </div>
          </div>
        ); })()}

        {/* Jours */}
        <div style={{ marginBottom: "56px" }}>
          <span style={labelStyle}>Je serai là <span style={{ opacity: 0.5, fontWeight: 400, textTransform: "none", letterSpacing: "0.02em" }}>(sélectionnez les jours auxquels vous serez présent)</span></span>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginTop: "8px" }}>
            {JOURS.map(jour => {
              const checked = form.jours.includes(jour.id);
              return (
                <label
                  key={jour.id}
                  htmlFor={`jour-${jour.id}`}
                  style={{
                    display: "block",
                    border: `1.5px solid ${checked ? COLOR : "rgba(36,59,113,0.25)"}`,
                    background: checked ? COLOR : "transparent",
                    color: checked ? BG : COLOR,
                    padding: "20px 24px",
                    cursor: "pointer",
                    fontFamily: "'FT Aktual', Georgia, serif",
                    transition: "all 0.2s ease-out",
                    WebkitTapHighlightColor: "transparent",
                    userSelect: "none",
                  }}
                >
                  <input
                    type="checkbox"
                    id={`jour-${jour.id}`}
                    checked={checked}
                    onChange={() => toggleJour(jour.id)}
                    style={{ position: "absolute", opacity: 0, width: 0, height: 0, pointerEvents: "none" }} tabIndex={-1}
                  />
                  <span style={{ display: "block", fontSize: "clamp(16px, 1.8vw, 20px)", fontWeight: 500, marginBottom: "4px", letterSpacing: "-0.01em" }}>{jour.label}</span>
                  <span style={{ display: "block", fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", opacity: checked ? 0.6 : 0.4 }}>{jour.sublabel}</span>
                </label>
              );
            })}
          </div>
          {errors.jours && <p style={errorStyle}>{errors.jours}</p>}
        </div>

        {/* Nombre de personnes */}
        <div style={{ marginBottom: "56px" }}>
          <span style={labelStyle}>Nombre de personnes</span>
          <div style={{ display: "flex", marginTop: "8px" }}>
            {[1, 2, 3, 4].map((n, i) => {
              const active = form.personnes.length === n;
              return (
                <label
                  key={n}
                  htmlFor={`nb-${n}`}
                  style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "14px",
                    border: `1.5px solid ${active ? COLOR : "rgba(36,59,113,0.25)"}`,
                    borderRight: i < 3 ? "none" : `1.5px solid ${active ? COLOR : "rgba(36,59,113,0.25)"}`,
                    background: active ? COLOR : "transparent",
                    color: active ? BG : COLOR,
                    fontFamily: "'FT Aktual', Georgia, serif",
                    fontSize: "clamp(16px, 1.6vw, 20px)",
                    fontWeight: 500,
                    cursor: "pointer",
                    transition: "all 0.2s ease-out",
                    WebkitTapHighlightColor: "transparent",
                    userSelect: "none",
                  }}
                >
                  <input
                    type="radio"
                    id={`nb-${n}`}
                    name="nb_personnes"
                    checked={active}
                    onChange={() => setNbPersonnes(n)}
                    style={{ position: "absolute", opacity: 0, width: 0, height: 0, pointerEvents: "none" }} tabIndex={-1}
                  />
                  {n}
                </label>
              );
            })}
          </div>
        </div>

        {/* Fiches personnes supplémentaires */}
        {form.personnes.slice(1).map((p, idx) => { const i = idx + 1; return (
          <div key={i} style={{ marginBottom: "48px", paddingBottom: "48px", borderBottom: `1px solid rgba(36,59,113,0.12)` }}>
            <p style={{ fontSize: "11px", letterSpacing: "0.22em", textTransform: "uppercase", opacity: 0.4, marginBottom: "24px", fontWeight: 400 }}>
              Personne {i + 1}
            </p>

            {/* Prénom / Nom */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginBottom: "24px" }}>
              <div>
                <label style={labelStyle}>Prénom</label>
                <input type="text" value={p.prenom} onChange={e => updatePersonne(i, "prenom", e.target.value)} placeholder="Prénom" style={inputStyle(!!errors[`prenom_${i}`])} />
                {errors[`prenom_${i}`] && <p style={errorStyle}>{errors[`prenom_${i}`]}</p>}
              </div>
              <div>
                <label style={labelStyle}>Nom</label>
                <input type="text" value={p.nom} onChange={e => updatePersonne(i, "nom", e.target.value)} placeholder="Nom" style={inputStyle(!!errors[`nom_${i}`])} />
                {errors[`nom_${i}`] && <p style={errorStyle}>{errors[`nom_${i}`]}</p>}
              </div>
            </div>

            {/* Adulte / Enfant */}
            {(
              <div style={{ marginBottom: "24px", display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                <span style={{ fontSize: "10px", letterSpacing: "0.22em", textTransform: "uppercase", opacity: 0.45, fontWeight: 400 }}>Adulte ou enfant</span>
                <div style={{ display: "flex" }}>
                  {([{ val: false, label: "Adulte" }, { val: true, label: "Enfant" }] as { val: boolean; label: string }[]).map(({ val, label }, idx) => {
                    const active = p.enfant === val;
                    return (
                      <label key={label} htmlFor={`enfant-${i}-${label}`} style={{
                        display: "flex", alignItems: "center", padding: "6px 16px",
                        border: `1.5px solid ${active ? COLOR : "rgba(36,59,113,0.25)"}`,
                        borderRight: idx === 0 ? "none" : `1.5px solid ${active ? COLOR : "rgba(36,59,113,0.25)"}`,
                        background: active ? COLOR : "transparent", color: active ? BG : COLOR,
                        fontFamily: "'FT Aktual', Georgia, serif", fontSize: "11px", letterSpacing: "0.1em", fontWeight: 400,
                        cursor: "pointer", transition: "all 0.2s ease-out",
                        WebkitTapHighlightColor: "transparent", userSelect: "none",
                      }}>
                        <input type="radio" id={`enfant-${i}-${label}`} name={`enfant-${i}`} checked={active}
                          onChange={() => { const personnes = [...form.personnes]; personnes[i] = { ...personnes[i], enfant: val }; setForm(f => ({ ...f, personnes })); }}
                          style={{ position: "absolute", opacity: 0, width: 0, height: 0, pointerEvents: "none" }} tabIndex={-1} />
                        {label}
                      </label>
                    );
                  })}
                </div>
                {p.enfant && <p style={{ fontSize: "11px", color: "#8B1515", letterSpacing: "0.05em" }}>Pas d'enfant le soir du mariage.</p>}
              </div>
            )}

            {/* Email — pas pour les enfants */}
            {!p.enfant && (
              <div style={{ marginBottom: "24px" }}>
                <label style={labelStyle}>Email</label>
                <input type="email" value={p.email} onChange={e => updatePersonne(i, "email", e.target.value)} placeholder="votre@email.com" style={inputStyle(!!errors[`email_${i}`])} />
                {errors[`email_${i}`] && <p style={errorStyle}>{errors[`email_${i}`]}</p>}
              </div>
            )}

            {/* Allergies — pas pour les enfants */}
            {!p.enfant && (
              <div>
                <label style={labelStyle}>Allergies / régime alimentaire <span style={{ opacity: 0.4 }}>(optionnel)</span></label>
                <input type="text" value={p.allergies} onChange={e => updatePersonne(i, "allergies", e.target.value)} placeholder="Végétarien, sans gluten, noix, OM..." style={inputStyle(false)} />
              </div>
            )}
          </div>
        ); })}

        {/* Message */}
        <div style={{ marginBottom: "64px" }}>
          <label style={labelStyle}>Un mot pour nous</label>
          <textarea
            value={form.message}
            onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
            placeholder="On a hâte de fêter ça avec vous, ou autre message moins banal."
            rows={4}
            style={{ ...inputStyle(false), resize: "none", paddingTop: "16px" }}
          />
        </div>

        {/* Récap jours */}
        {form.jours.length > 0 && (
          <div style={{ marginBottom: "32px", padding: "20px 24px", border: `1px solid rgba(36,59,113,0.15)`, background: "rgba(36,59,113,0.03)" }}>
            <p style={{ fontSize: "10px", letterSpacing: "0.22em", textTransform: "uppercase", opacity: 0.5, marginBottom: "12px", fontWeight: 400 }}>Vous serez là</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {JOURS.filter(j => form.jours.includes(j.id)).map(j => (
                <span key={j.id} style={{ fontSize: "clamp(13px, 1.2vw, 15px)", fontWeight: 400, color: COLOR, border: `1px solid ${COLOR}`, padding: "4px 14px", letterSpacing: "0.05em" }}>
                  {j.label} — {j.sublabel}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={status === "loading"}
          style={{
            width: "100%", padding: "22px",
            background: status === "loading" ? "rgba(36,59,113,0.5)" : BG,
            color: status === "loading" ? BG : COLOR,
            border: `1.5px solid ${status === "loading" ? "rgba(36,59,113,0.5)" : COLOR}`,
            fontFamily: "'FT Aktual', Georgia, serif",
            fontSize: "clamp(14px, 1.4vw, 17px)", fontWeight: 500,
            letterSpacing: "0.18em", textTransform: "uppercase",
            cursor: status === "loading" ? "not-allowed" : "pointer",
            transition: "background 0.2s ease-out, color 0.2s ease-out", minHeight: "60px",
          }}
        >
          {status === "loading" ? "Envoi..." : "Confirmer ma présence"}
        </button>

        {status === "error" && (
          <p style={{ ...errorStyle, textAlign: "center", marginTop: "16px", fontSize: "14px" }}>
            Une erreur est survenue. Réessaie ou écris-nous directement.
          </p>
        )}
      </form>

      {/* Footer */}
      <footer style={{ borderTop: `1px solid rgba(36,59,113,0.15)`, padding: "28px 40px", display: "flex", justifyContent: "space-between", alignItems: "center", opacity: 0.35, marginBottom: "11px" }}>
        <span style={{ fontSize: "11px", letterSpacing: "0.15em" }}>Ananda et Matthieu</span>
        <span style={{ fontSize: "11px", letterSpacing: "0.15em" }}>10 · 10 · 26</span>
      </footer>

      <style>{`
        input::placeholder, textarea::placeholder { color: ${COLOR}; opacity: 0.3; }
        input:focus, textarea:focus { outline: none; border-bottom-color: ${COLOR} !important; }
        button[type="submit"]:hover:not(:disabled) { background: ${COLOR} !important; color: ${BG} !important; }
        button { touch-action: manipulation; -webkit-tap-highlight-color: transparent; }
        @media (max-width: 640px) {
          .rsvp-subtitle { display: none !important; }
          .rsvp-subtitle-mobile { display: block !important; }
        }
      `}</style>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: "block", fontSize: "10px", letterSpacing: "0.22em",
  textTransform: "uppercase", opacity: 0.65, fontWeight: 400, marginBottom: "12px",
};

const inputStyle = (hasError: boolean): React.CSSProperties => ({
  display: "block", width: "100%", border: "none",
  borderBottom: `1.5px solid ${hasError ? "#8B1515" : "rgba(36,59,113,0.25)"}`,
  background: "transparent", padding: "12px 0",
  fontFamily: "'FT Aktual', Georgia, serif",
  fontSize: "clamp(15px, 1.3vw, 17px)", color: "#243b71",
  fontWeight: 400, transition: "border-color 0.15s ease-out",
});

const errorStyle: React.CSSProperties = {
  fontSize: "11px", color: "#8B1515", marginTop: "6px", letterSpacing: "0.05em",
};
