# Connexion Google Sheets

## 1. Crée le Google Sheet
- Va sur sheets.google.com → Nouveau
- Nomme-le "RSVP Ananda & Matthieu"
- En ligne 1, mets ces colonnes :
  `Date | Prénom | Nom | Email | Jours | Nb personnes | Allergies | Message`

## 2. Crée le Google Apps Script
- Dans le Sheet : Extensions → Apps Script
- Remplace tout le code par :

```javascript
function doPost(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const data = JSON.parse(e.postData.contents);
  sheet.appendRow([
    data.date,
    data.prenom,
    data.nom,
    data.email,
    data.jours,
    data.nb_personnes,
    data.allergies,
    data.message,
  ]);
  return ContentService
    .createTextOutput(JSON.stringify({ result: "ok" }))
    .setMimeType(ContentService.MimeType.JSON);
}
```

## 3. Déploie
- Clique "Déployer" → "Nouveau déploiement"
- Type : Application Web
- Exécuter en tant que : Moi
- Accès : Tout le monde
- Copie l'URL générée

## 4. Colle l'URL dans le code
Dans `app/rsvp/page.tsx`, ligne 10 :
```
const SHEET_URL = "https://script.google.com/macros/s/TON_SCRIPT_ID/exec";
```
Remplace par ton URL.
