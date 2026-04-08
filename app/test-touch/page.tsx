// Server component — pas de "use client"
export default function TestTouch() {
  return (
    <div style={{ padding: "24px", fontFamily: "monospace" }}>

      {/* Capteur d'erreurs JS — s'affiche si le bundle plante */}
      <div
        id="err-box"
        style={{ background: "#555", color: "#fff", padding: 16, marginBottom: 16, fontSize: 13, whiteSpace: "pre-wrap" }}
      >
        En attente d'erreurs JS...
      </div>

      {/* Test JS inline */}
      <div id="inline-ok" style={{ background: "#c00", color: "#fff", padding: 16, marginBottom: 16 }}>
        JS inline : NON
      </div>

      {/* Bouton HTML pur */}
      <a href="/" style={{ display: "block", padding: "20px", background: "#243b71", color: "#fff", textDecoration: "none", textAlign: "center", marginBottom: 16 }}>
        Lien accueil (HTML pur)
      </a>

      <div id="react-zone" style={{ background: "#eee", padding: 16 }}>
        Zone React — si React charge, ce fond deviendra vert
      </div>

      {/* Scripts inline qui tournent immédiatement, sans bundle React */}
      <script dangerouslySetInnerHTML={{ __html: `
        // Capteur d'erreurs global
        window.onerror = function(msg, src, line, col, err) {
          var box = document.getElementById('err-box');
          if (box) box.innerHTML = 'ERREUR JS:\\n' + msg + '\\n' + src + ' ligne ' + line;
          box.style.background = '#c00';
          return false;
        };
        window.onunhandledrejection = function(e) {
          var box = document.getElementById('err-box');
          if (box) box.innerHTML = 'PROMISE REJETÉE:\\n' + (e.reason && e.reason.toString ? e.reason.toString() : e.reason);
          box.style.background = '#c00';
        };

        // Confirme que JS inline tourne
        var el = document.getElementById('inline-ok');
        if (el) { el.style.background = '#063'; el.textContent = 'JS inline : OUI ✓'; }
      ` }} />

    </div>
  );
}
