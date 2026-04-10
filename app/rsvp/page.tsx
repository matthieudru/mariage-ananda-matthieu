"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const COLOR = "#243b71";
const BG = "#f3ecdc";

const SHEET_URL = "https://script.google.com/macros/s/AKfycbzRGZKd3NRuGud5qXpYh85ynf6zaapXMidYYl5yNx6lmaNwYuM2Vev3-NS2-M_iz5HC/exec";

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
  absent: boolean;
};

export default function RSVP() {
  const router = useRouter();
  const [form, setForm] = useState<FormData>({
    jours: [],
    personnes: [personneVide()],
    message: "",
    absent: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [alreadyDone, setAlreadyDone] = useState(false);

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("grazie") === "1") router.replace("/grazie");
    if (localStorage.getItem("rsvp_submitted") === "1") setAlreadyDone(true);
  }, [router]);

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
      absent: false,
      jours: f.jours.includes(id) ? f.jours.filter(j => j !== id) : [...f.jours, id],
    }));
  };

  const toggleAbsent = () => {
    setForm(f => ({ ...f, absent: !f.absent, jours: f.absent ? f.jours : [] }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.absent && form.jours.length === 0) e.jours = "Choisissez au moins un jour ou confirmez votre absence";
    form.personnes.forEach((p, i) => {
      if (!p.prenom.trim()) e[`prenom_${i}`] = "Requis";
      if (!p.nom.trim()) e[`nom_${i}`] = "Requis";
      if ((i === 0 || !p.enfant) && (!p.email.trim() || !p.email.includes("@"))) e[`email_${i}`] = "Email invalide";
    });
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    const ps = form.personnes;
    const params = new URLSearchParams({
      date: new Date().toLocaleString("fr-FR"),
      prenom1: ps[0]?.prenom ?? "", nom1: ps[0]?.nom ?? "", email1: ps[0]?.email ?? "", allergie1: ps[0]?.allergies ?? "",
      absent:     form.absent ? "Oui" : "Non",
      opening:    !form.absent && form.jours.includes("vendredi") ? "Oui" : "Non",
      wedding:    !form.absent && form.jours.includes("samedi")   ? "Oui" : "Non",
      afterparty: !form.absent && form.jours.includes("dimanche") ? "Oui" : "Non",
      nb_personnes: String(ps.length),
      prenom2: ps[1]?.prenom ?? "", nom2: ps[1]?.nom ?? "", enfant2: ps[1] ? (ps[1].enfant ? "Enfant" : "Adulte") : "", email2: ps[1]?.email ?? "", allergie2: ps[1]?.allergies ?? "",
      prenom3: ps[2]?.prenom ?? "", nom3: ps[2]?.nom ?? "", enfant3: ps[2] ? (ps[2].enfant ? "Enfant" : "Adulte") : "", email3: ps[2]?.email ?? "", allergie3: ps[2]?.allergies ?? "",
      prenom4: ps[3]?.prenom ?? "", nom4: ps[3]?.nom ?? "", enfant4: ps[3] ? (ps[3].enfant ? "Enfant" : "Adulte") : "", email4: ps[3]?.email ?? "", allergie4: ps[3]?.allergies ?? "",
      message: form.message,
    });
    // sendBeacon garantit l'envoi même si la fenêtre se ferme immédiatement
    const sent = navigator.sendBeacon(SHEET_URL, params);
    if (!sent) {
      fetch(SHEET_URL, { method: "POST", mode: "no-cors", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: params.toString() });
    }
    localStorage.setItem("rsvp_submitted", "1");
    const prenom = ps[0]?.prenom?.trim() || "";
    router.push(`/grazie${prenom ? `?prenom=${encodeURIComponent(prenom)}` : ""}`);
  };

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

      {/* Déjà inscrit */}
      {alreadyDone && (
        <div style={{ maxWidth: "720px", margin: "80px auto", padding: "0 40px", textAlign: "center" }}>
          <p style={{ fontSize: "clamp(22px, 3vw, 32px)", fontWeight: 500, color: COLOR, marginBottom: "16px", letterSpacing: "-0.01em" }}>
            Votre RSVP a déjà été envoyé.
          </p>
          <p style={{ fontSize: "clamp(14px, 1.2vw, 16px)", opacity: 0.55, lineHeight: 1.7, marginBottom: "40px" }}>
            Nous avons bien reçu votre réponse. Si vous souhaitez modifier votre inscription, contactez-nous directement.
          </p>
          <button
            onClick={() => { localStorage.removeItem("rsvp_submitted"); setAlreadyDone(false); }}
            style={{ fontSize: "11px", letterSpacing: "0.2em", textTransform: "uppercase", color: COLOR, opacity: 0.4, background: "none", border: "none", cursor: "pointer", textDecoration: "underline", textUnderlineOffset: "3px" }}
          >
            Renvoyer quand même
          </button>
        </div>
      )}

      {/* Hero */}
      {!alreadyDone && <section style={{ padding: "60px 40px 48px", borderBottom: `1px solid rgba(36,59,113,0.15)`, textAlign: "center" }}>
        <div style={{ display: "inline-block", position: "relative" }}>
          {/* Images positionnées en dehors du flux pour ne pas affecter la largeur */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/Orange fond copie.png" alt="" className="rsvp-lemon rsvp-lemon-left" style={{ position: "absolute", right: "100%", top: "50%", transform: "translateY(-50%)", width: "clamp(80px, 11vw, 150px)", height: "auto", marginRight: "16px" }} />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/Orange fond.png" alt="" className="rsvp-lemon rsvp-lemon-right" style={{ position: "absolute", left: "100%", top: "50%", transform: "translateY(-50%)", width: "clamp(80px, 11vw, 150px)", height: "auto", marginLeft: "16px" }} />
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
      </section>}

      {/* Formulaire */}
      {!alreadyDone && <form onSubmit={handleSubmit} style={{ maxWidth: "720px", margin: "0 auto", padding: "64px 40px 120px" }}>

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
          <div className="jours-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginTop: "8px" }}>
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
                    transition: "all 0.08s ease-out",
                    WebkitTapHighlightColor: "transparent",
                    userSelect: "none",
                    textAlign: "center",
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
            {/* Bouton absent — même style exact que les labels de jours */}
            <button
              type="button"
              onClick={toggleAbsent}
              style={{
                display: "block",
                padding: "20px 24px",
                border: `1.5px solid ${form.absent ? COLOR : "rgba(36,59,113,0.25)"}`,
                background: form.absent ? COLOR : "transparent",
                color: form.absent ? BG : COLOR,
                fontFamily: "'FT Aktual', Georgia, serif",
                cursor: "pointer", transition: "all 0.08s ease-out",
                WebkitTapHighlightColor: "transparent" as unknown as string,
                userSelect: "none" as const, textAlign: "center" as const,
              }}
            >
              <span style={{ display: "block", fontSize: "clamp(16px, 1.8vw, 20px)", fontWeight: 500, marginBottom: "4px", letterSpacing: "-0.01em" }}>Absent</span>
              <span style={{ display: "block", fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", opacity: form.absent ? 0.6 : 0.4 }}>du mariage</span>
            </button>
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
                    transition: "all 0.08s ease-out",
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
                        cursor: "pointer", transition: "all 0.08s ease-out",
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
                {p.enfant && <p style={{ fontSize: "13px", color: "#8B1515", letterSpacing: "0.05em" }}>Pas d'enfant le soir du mariage.</p>}
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
        {form.absent && (
          <div style={{ marginBottom: "32px", padding: "20px 24px", border: `1px solid rgba(36,59,113,0.15)`, background: "rgba(36,59,113,0.03)" }}>
            <p style={{ fontSize: "10px", letterSpacing: "0.22em", textTransform: "uppercase", opacity: 0.5, fontWeight: 400 }}>Vous avez indiqué ne pas pouvoir être présent(e)</p>
          </div>
        )}
        {!form.absent && form.jours.length > 0 && (
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
          style={{
            width: "100%", padding: "22px",
            background: BG, color: COLOR,
            border: `1.5px solid ${COLOR}`,
            fontFamily: "'FT Aktual', Georgia, serif",
            fontSize: "clamp(14px, 1.4vw, 17px)", fontWeight: 500,
            letterSpacing: "0.18em", textTransform: "uppercase",
            cursor: "pointer",
            transition: "background 0.2s ease-out, color 0.2s ease-out", minHeight: "60px",
          }}
        >
          {form.absent ? "Confirmer mon absence" : "Confirmer ma présence"}
        </button>
      </form>}

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
          /* Citrons : collés contre le mot RSVP */
          .rsvp-lemon-left  { width: 19vw !important; margin-right: 0 !important; }
          .rsvp-lemon-right { width: 19vw !important; margin-left:  0 !important; }
          /* Sous-labels boutons (THE OPENING, THE AFTER PARTY…) : assez petits pour tenir sur une ligne */
          .jours-grid span + span {
            font-size: 9px !important;
            white-space: nowrap !important;
            letter-spacing: 0.08em !important;
          }
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
