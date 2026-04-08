# UI_RULES.md
## Design System — Ananda & Matthieu
### Sources: Hervé Paris (scrappé), Untitled UI, Tailwind UI, Flowbite, DaisyUI, Preline, HyperUI, UIverse, Awesome Design Systems, UI/UX Resources

---

## 1. IDENTITÉ DU PROJET

| Token | Valeur |
|-------|--------|
| `--color-bg` | `#f3ecdc` |
| `--color-primary` | `#243b71` |
| `--color-primary-hover` | `#1a2d58` |
| `--color-text` | `#243b71` |
| `--color-text-muted` | `#243b7150` |
| `--font-serif` | `Georgia, 'Times New Roman', serif` |

---

## 2. DA REFERENCE — HERVÉ PARIS

Hervé Paris est la référence directe de DA. Voici leurs patterns à retenir :

### Philosophie
- "Audacieux dans la création, rigoureux dans l'exécution"
- "Transformer sans travestir" — respecter l'identité source
- Chaque animation a un sens narratif, jamais décoratif
- Le temps de l'utilisateur est précieux — friction zéro

### Clients de référence
Cartier, Richard Mille, Lacoste, Lucis, La Rosée — luxe, soin, mode, tech premium

### Approche visuelle
- Contraste fort et tranché — jamais de gris mou intermédiaire
- Whitespace généreux comme élément de design à part entière
- Images full-bleed, sans border, sans frame
- Typographie comme premier élément visuel (headline = hook)
- **Principe Lucis :** couleurs d'accent uniquement quand elles signifient quelque chose

### Stack d'animation (reproduit en CSS/JS natif)
- **SplitText** : titres révélés lettre par lettre ou mot par mot
- **ScrollTrigger** : chaque section révélée au scroll, jamais tout d'un coup
- **Mask animation** : images apparaissant derrière un masque qui glisse (gauche→droite ou bas→haut)
- **Transition page** : fondu + légère translation Y (20–30px)
- **Hover** : opacity + transform subtil, 200ms max
- Jamais de bounce, jamais de spring

### Storytelling visuel
- Narrative en chapitres séquentiels
- Texte court, dense, percutant — chaque mot compte
- Chiffres clés mis en valeur typographiquement (grand, isolé)
- Images alternent full-width / colonne

---

## 3. LES 10 MARQUES D'UNE UI PREMIUM
_(source : synthèse Untitled UI + Tailwind UI + Preline + UI/UX Resources)_

1. **Tokens sémantiques** — les composants référencent des alias, jamais des valeurs brutes
2. **Shadows crafted** — jamais `rgba(0,0,0,x)`, toujours `rgba(16,24,40,x)` (bleu-noir naturel)
3. **Typographie précise** — tracking négatif sur grand, positif sur petit, line-height cohérent
4. **Focus rings visibles** — 4px ring couleur brand offset 2px — jamais l'outline browser
5. **Hover 150ms** — ni instant, ni 300ms+ (trop lent)
6. **Borders sophistiquées** — `ring-1 ring-black/10` ou `1px solid rgba(0,0,0,0.08)` — jamais `border-gray-200` générique
7. **Dark mode first-class** — tokens parallèles, pas un afterthought
8. **Whitespace généreux** — 24–32px padding carte, 80–96px section vertical
9. **Contrainte couleur** — 60/30/10. Une couleur brand. Le reste = neutres + sémantiques (error/success)
10. **États complets** — chaque composant interactif a : default / hover / focus / active / disabled / loading / error

---

## 4. SPACING SCALE

```
4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 / 96px
```

**Application :**
- `4px` — écart entre éléments liés (icône + texte)
- `8px` — gap entre items d'un groupe
- `16px` — padding interne composant standard
- `24px` — padding interne carte
- `32px` — gap entre sections internes
- `48px` — padding section mobile
- `64px` — padding section tablet
- `96px` — padding section desktop

**Règle absolue :** aucune valeur hors de cette échelle.

---

## 5. TYPOGRAPHIE

| Rôle | Taille | Poids | Tracking | Line-height |
|------|--------|-------|---------|-------------|
| Display / Hero | clamp(32px, 6vw, 72px) | 400 | -0.02em | 1.05 |
| H1 | clamp(22px, 3.5vw, 42px) | 400 | -0.01em | 1.1 |
| H2 | clamp(16px, 2vw, 26px) | 400 | 0em | 1.2 |
| Body | clamp(13px, 1.2vw, 16px) | 400 | 0.01em | 1.6 |
| Caption / Meta | clamp(10px, 0.9vw, 12px) | 400 | 0.12em | 1.5 |
| Nav / Label | clamp(10px, 0.9vw, 13px) | 400 | 0.2em | 1 |

**Règles :**
- Famille unique : Georgia serif
- Uppercase uniquement pour nav et labels
- Jamais de bold — le serif exprime la force naturellement
- Texte body : max 65 caractères par ligne (lisibilité optimale)
- Eyebrow pattern (Tailwind UI) : petit label uppercase au-dessus du titre

---

## 6. COULEURS

Palette strictement 2 couleurs + fond :

| Rôle | Valeur |
|------|--------|
| Fond | `#f3ecdc` |
| Primaire (text, border, bg hover) | `#243b71` |
| Primaire hover | `#1a2d58` |
| Muted | `#243b7150` |

**Règle Lucis :** n'introduire une couleur d'accent que si elle porte un sens précis. Sinon, rester en 2 couleurs.

**60/30/10 rule :**
- 60% → fond beige
- 30% → blanc/vide (espace négatif)
- 10% → bleu primaire (texte, borders, hover)

---

## 7. BORDERS & RADIUS

- `border-radius: 0` partout — esthétique éditoriale
- Border standard UI : `1.5px solid #243b71`
- Border frame page : `11px solid #243b71`
- Border muted : `1px solid rgba(36,59,113,0.15)`
- **Toujours préférer les borders aux shadows** _(Untitled UI, Preline)_

---

## 8. SHADOWS

**Aucune.** Les borders portent tout le travail spatial.

_(Référence : les design systems premium n'utilisent des shadows que pour l'élévation dans des UI de type dashboard/SaaS. Dans une esthétique éditoriale/luxe, zero shadow.)_

---

## 9. COMPOSANTS

### Bouton / Lien nav
```css
padding: 10px 20px;
min-height: 44px; /* touch target minimum */
border: 1.5px solid #243b71;
font-family: Georgia, serif;
font-size: clamp(10px, 0.9vw, 13px);
letter-spacing: 0.2em;
text-transform: uppercase;
color: #243b71;
background: transparent;
cursor: pointer;
transition: background 200ms ease-out, color 200ms ease-out;
border-radius: 0;
```
**Hover :**
```css
background: #243b71;
color: #f3ecdc;
```
**Disabled :**
```css
opacity: 0.35;
cursor: not-allowed;
pointer-events: none;
```

### Card
```css
border: 1.5px solid #243b71;
padding: 24px 32px;
background: #f3ecdc;
border-radius: 0;
```

### Input
```css
border: none;
border-bottom: 1.5px solid rgba(36,59,113,0.3);
background: transparent;
padding: 12px 0;
width: 100%;
font-family: Georgia, serif;
font-size: clamp(13px, 1.2vw, 16px);
color: #243b71;
border-radius: 0;
transition: border-color 150ms ease-out;
```
**Focus :**
```css
outline: none;
border-bottom-color: #243b71;
```
**Placeholder :**
```css
color: #243b71;
opacity: 0.3;
```
**Error :**
```css
border-bottom-color: #8B1515;
```

### Label formulaire
```css
display: block;
font-family: Georgia, serif;
font-size: 10px;
letter-spacing: 0.2em;
text-transform: uppercase;
color: #243b71;
opacity: 0.55;
margin-bottom: 8px;
```

### Message d'erreur inline
```css
font-size: 11px;
color: #8B1515;
margin-top: 6px;
letter-spacing: 0.05em;
```

### Divider
```css
border: none;
border-top: 1px solid rgba(36,59,113,0.15);
margin: 32px 0;
```

---

## 10. ANIMATIONS

### Timing reference _(source : Material Motion + Untitled UI + Hervé Paris)_

| Usage | Durée | Easing |
|-------|-------|--------|
| Hover / focus | 150–200ms | `ease-out` |
| Dropdown appear | 200ms | `cubic-bezier(0, 0, 0.2, 1)` |
| Modal enter | 250ms | `cubic-bezier(0, 0, 0.2, 1)` |
| Modal exit | 150ms | `cubic-bezier(0.4, 0, 1, 1)` |
| Page transition | 350ms | `cubic-bezier(0.4, 0, 0.2, 1)` |
| Intro dezoom | 5500ms | `ease-out` |
| Border draw | 5500ms | `linear` |
| FadeIn nav | 800ms | `ease-out` |
| Scroll reveal | 600ms | `cubic-bezier(0, 0, 0.2, 1)` |

### Pattern Hervé Paris — séquence d'intro _(déjà implémenté)_
1. Page load → dezoom (3.5×→1.05×) + pause 0.5s
2. Border draw — 4 traits depuis milieu gauche/droite
3. Nav → fadeIn après fin du dezoom

### Pattern Hervé Paris — scroll reveal _(pages internes)_
```css
/* Initial state */
opacity: 0;
transform: translateY(24px);
/* On enter viewport */
opacity: 1;
transform: translateY(0);
transition: opacity 600ms ease-out, transform 600ms cubic-bezier(0, 0, 0.2, 1);
```

### Mask animation _(Hervé signature)_
```css
/* Image révélée par un masque qui glisse */
clip-path: inset(0 100% 0 0);
/* Animé vers : */
clip-path: inset(0 0% 0 0);
transition: clip-path 800ms cubic-bezier(0, 0, 0.2, 1);
```

### Jamais
- Animations en loop idle
- Bounce / spring
- Animations gadget sans sens narratif
- Plusieurs animations non synchronisées
- Durée > 6s hors intro

---

## 11. LAYOUT

- Homepage : viewport fixe, pas de scroll
- Pages internes : scroll naturel, sections séquentielles
- Border page : `11px solid #243b71` (inset, révélée par animation)
- Nav : positionnée left/right, verticalement centrée, fadeIn après intro
- Container max-width : `min(90vw, 800px)` pour le contenu textuel
- Sections desktop : `padding: 96px 0`

---

## 12. RESPONSIVE

```
Mobile  : < 640px
Tablet  : 640–1024px  
Desktop : > 1024px
```

- Toutes les tailles de texte en `clamp()`
- Toutes les tailles de layout en `min()` / `max()` / `vw`
- Touch targets : **minimum 44×44px** _(Fitts's Law)_
- Nav mobile : positionnée en bas, au-dessous de l'illustration
- Jamais de texte qui déborde ou se chevauche
- Images : `aspect-ratio` + `object-fit: cover` pour éviter le layout shift

---

## 13. MICRO-INTERACTIONS _(source : UIverse + Hervé)_

| Déclencheur | Effet | Durée |
|-------------|-------|-------|
| Hover nav | bg/color invert | 200ms ease-out |
| Focus input | border-bottom s'intensifie | 150ms ease-out |
| Submit form | bouton → état loading | instantané |
| Confirmation RSVP | message inline fade-in | 400ms ease-out |
| Scroll section | fadeIn + translateY | 600ms |
| Page load | dezoom + border draw | 6s total |

---

## 14. ÉTATS COMPLETS _(source : Untitled UI checklist)_

Chaque composant interactif doit avoir :
- **Default** — état repos
- **Hover** — feedback visuel clair (200ms)
- **Focus** — pour l'accessibilité clavier
- **Active/Pressed** — feedback de clic
- **Disabled** — opacity 0.35, cursor not-allowed
- **Loading** — indicateur pendant action async
- **Error** — feedback d'erreur inline
- **Success** — confirmation après action

---

## 15. PATTERN PAGES

### Page Infos
- Hero : titre centré très grand (Display), fadeIn en scroll
- Blocs : Lieu / Date / Programme / Accès — chacun séparé par un divider
- Typographie dominante, peu d'images
- Chaque info = bloc avec border-bottom 1px
- Lien Google Maps pour l'accès

### Page RSVP
- Un seul CTA dominant visible immédiatement
- Formulaire : prénom, nom, présence (oui/non), régime alimentaire, message libre
- Labels uppercase, inputs bottom-border uniquement
- Validation inline au blur
- Submit = bouton invert, état loading pendant envoi
- Confirmation : message inline, pas de redirection
- Jamais de `confirm("êtes-vous sûr ?")` — undo préféré _(UI/UX Resources)_

---

## 16. PATTERNS À NE JAMAIS FAIRE

- ❌ `border-radius` > 0
- ❌ Drop shadows
- ❌ Plusieurs familles de polices
- ❌ Plus de 2 couleurs dans l'UI
- ❌ Animations en loop idle
- ❌ Gradients
- ❌ Bibliothèques d'icônes externes
- ❌ Patterns Bootstrap/Tailwind génériques copié-collé
- ❌ Textes centrés > 2 lignes
- ❌ Espacement hors de la scale définie
- ❌ Animations sans sens narratif
- ❌ Validation uniquement au submit (toujours au blur)
- ❌ Modales de confirmation (préférer l'undo)
- ❌ Placeholder comme label unique (toujours un vrai label visible)

---

## 17. VOIX & TON

- Français, intime, jamais formel
- Minuscules en body, majuscules en nav et labels uniquement
- Pas de point d'exclamation dans les labels UI
- Court et dense — chaque mot compte
- Pas de jargon technique visible à l'utilisateur
