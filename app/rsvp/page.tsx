"use client";

import { useState } from "react";
import Link from "next/link";

const COLOR = "#243b71";
const BG = "#f3ecdc";

const SHEET_URL = "https://script.google.com/macros/s/AKfycbzvbX2vwokAEHRxXM7ZMb5fx3NyAIBrfH4lFNaiQHPIHztVOfzudG8Kc4KmkVsvfAAm/exec";

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

export default function RSVP() {
  const [form, setForm] = useState<FormData>({
    jours: [],
    personnes: [personneVide()],
    message: "",
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});

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
        prenom2: ps[1]?.prenom ?? "", nom2: ps[1]?.nom ?? "", email2: ps[1]?.email ?? "", allergie2: ps[1]?.allergies ?? "",
        prenom3: ps[2]?.prenom ?? "", nom3: ps[2]?.nom ?? "", email3: ps[2]?.email ?? "", allergie3: ps[2]?.allergies ?? "",
        prenom4: ps[3]?.prenom ?? "", nom4: ps[3]?.nom ?? "", email4: ps[3]?.email ?? "", allergie4: ps[3]?.allergies ?? "",
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

  if (status === "success") {
    const prenom = form.personnes[0]?.prenom?.trim() || "";
    return (
      <div style={{ background: BG, minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "'FT Aktual', Georgia, serif" }}>
        <div style={{ textAlign: "center", padding: "40px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", marginBottom: "48px" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/Sun.png" alt="" style={{ width: "clamp(96px, 12vw, 160px)", height: "auto" }} />
            <p style={{ fontSize: "clamp(40px, 7vw, 88px)", fontWeight: 500, letterSpacing: "-0.03em", lineHeight: 0.9, color: COLOR }}>
              Grazie{prenom ? ` ${prenom}` : ""}
            </p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/Sun.png" alt="" style={{ width: "clamp(96px, 12vw, 160px)", height: "auto" }} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "20px" }}>
            <a href="#" style={{
              display: "inline-flex", alignItems: "center",
              color: "#f3ecdc", background: "#6B1A1A",
              textDecoration: "none", fontSize: "clamp(13px, 1.4vw, 16px)",
              fontWeight: 500, letterSpacing: "0.2em", textTransform: "uppercase",
              border: "1.5px solid #6B1A1A", padding: "18px 48px",
              fontFamily: "'FT Aktual', Georgia, serif",
            }}>
              Wedding List
            </a>
            <Link href="/" style={{ color: COLOR, textDecoration: "none", fontSize: "11px", letterSpacing: "0.22em", textTransform: "uppercase", borderBottom: `1px solid ${COLOR}`, paddingBottom: "2px" }}>
              ← Retour à l'accueil
            </Link>
          </div>
        </div>
      </div>
    );
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

        {/* Submit */}
        <button
          type="submit"
          disabled={status === "loading"}
          style={{
            width: "100%", padding: "22px",
            background: status === "loading" ? "rgba(36,59,113,0.5)" : COLOR,
            color: BG, border: "none",
            fontFamily: "'FT Aktual', Georgia, serif",
            fontSize: "clamp(14px, 1.4vw, 17px)", fontWeight: 500,
            letterSpacing: "0.18em", textTransform: "uppercase",
            cursor: status === "loading" ? "not-allowed" : "pointer",
            transition: "background 0.2s ease-out", minHeight: "60px",
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
        button[type="submit"]:hover:not(:disabled) { background: #1a2d58 !important; }
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
  textTransform: "uppercase", opacity: 0.45, fontWeight: 400, marginBottom: "12px",
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
