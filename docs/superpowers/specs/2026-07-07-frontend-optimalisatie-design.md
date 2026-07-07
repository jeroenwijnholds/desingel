# Frontend-optimalisatie — Belevenisboerderij De Singel

**Datum:** 2026-07-07
**Status:** goedgekeurd door Jeroen (optie B + volledige visuele optimalisatie)

## Doel

Een verregaande optimalisatie van de bestaande Nuxt 3 + Sanity frontend:

1. **Robuust** op alle schermformaten — geen magic numbers, geen layout die breekt bij langere content of tussenmaten.
2. **Mobiel optimaal** — correcte viewport-units, tap targets, snelheid (responsive images), geen layout shift.
3. **Visueel geoptimaliseerd** — verfijnde typografie, consistente sectieritmiek, micro-interacties en een polished "feel" op elke pagina (frontend-design skill), zonder de bestaande identiteit (groen/natuurlijk, Playfair + Source Sans) overboord te gooien.

## Context

- Nuxt 4 (`nuxt generate`, volledig statisch), gedeployed op GitHub Pages via Actions bij push naar `master`.
- Content uit Sanity; rebuild via webhook.
- 8 pagina's, 3 componenten, 9 globale CSS-bestanden (±4.000 regels).

## Vastgestelde problemen

1. Font-gewichten 900 (Playfair) en 700 (Source Sans 3) worden gebruikt maar niet geladen → faux bold.
2. Mojibake (`Â·`, `â€“`) en letterlijke `&amp;` in templates.
3. `.page-header` 4× gedefinieerd in globaal geladen per-pagina CSS → laadvolgorde bepaalt styling.
4. Onbekende slugs renderen een blanco pagina; geen 404-pagina.
5. Homepage leunt op magic numbers (intro-bg 800px / -500px, card-overlays -80/-90px).
6. Mobiele hero gebruikt `100vh` (iOS-adresbalkprobleem).
7. Hero/ellips-afbeeldingen komen van het oude Webflow-CDN.
8. Geen `srcset`/`sizes`, geen WebP, geen `width`/`height` → traag en CLS op mobiel.
9. Vaste px-typografie met 4 inconsistent toegepaste breakpoints.
10. Lightbox zonder navigatie/focus-trap/alt; menu zonder Escape/focus-trap; geen `scroll-padding-top`; `smooth` zonder reduced-motion-guard.
11. Formulier zonder validatie-feedback of verzendstatus.
12. Geen meta-description, OG-tags of favicon.

## Aanpak (7 fasen)

### Fase 1 — Typografisch en technisch fundament
- Fonts **self-hosten** (woff2 in `assets/fonts/`, `@font-face` met `font-display: swap`), inclusief Playfair 900 en Source Sans 700. Google Fonts-links verwijderen.
- Alle encoding-bugs en `&amp;`-teksten fixen.
- Fluid typography met `clamp()` via design tokens (`--text-*` schaal) ter vervanging van de px-cascade.
- Spacing-tokens (`--space-*`) en uniforme breakpoints (479/767/991/1180 blijven, maar consequent toegepast).
- `scroll-padding-top` voor de vaste nav; `scroll-behavior: smooth` alleen zonder `prefers-reduced-motion`.

### Fase 2 — CSS-herstructurering
- Eén `PageHeader.vue`-component (props: label, titel, subtitel, optioneel afbeelding) vervangt de 4 dubbele `.page-header`-implementaties; bijbehorende CSS één keer in een gedeeld bestand.
- Dubbele/dode selectors dedupliceren; per-pagina CSS behoudt alleen wat echt paginaspecifiek is.
- Geen visuele wijziging in deze fase (op de bestaande inconsistenties na, die genormaliseerd worden).

### Fase 3 — Homepage robuust
- Intro-sectie: magic-number-constructie vervangen door grid/flow-layout die dezelfde overlappende-kaart-esthetiek geeft maar meegroeit met content.
- Hero: `min-height: 100svh`/`80svh` met `vh`-fallback.
- Webflow-CDN-afbeeldingen downloaden en lokaal in het project opnemen (`public/images/`), met de mogelijkheid ze later naar Sanity te verhuizen. De ellips-SVG's idem.

### Fase 4 — Responsive images
- `useImageUrl` uitbreiden met een helper die `srcset` (meerdere breedtes), `sizes`, `auto=format` (WebP) en `width`/`height`-attributen levert.
- Alle `<img>`-plekken (pagina's, PortableText-figuren, lightbox, kaarten) erop overzetten.

### Fase 5 — UX & toegankelijkheid
- Lightbox: vorige/volgende (knoppen + pijltjestoetsen + swipe), focus-trap, teller, alt uit Sanity waar beschikbaar.
- Mobiel menu: Escape sluit, focus-trap, aria-label wisselt open/dicht, sluit bij routewissel.
- Contactformulier: client-side validatie met nette Nederlandse foutmeldingen, verzendstatus ("Versturen…"), foutafhandeling zonder de pagina te verlaten waar mogelijk (fetch naar Web3Forms met redirect-fallback).
- 404: `error.vue` met vriendelijke pagina; slug-pagina's tonen een "niet gevonden"-blok i.p.v. blanco.

### Fase 6 — SEO & delen
- Meta-description per pagina, canonical, Open Graph + Twitter cards (afbeelding uit Sanity of statisch), favicon-set (SVG + PNG + apple-touch).

### Fase 7 — Visuele optimalisatie (frontend-design skill)
Binnen de bestaande identiteit (donkergroen `#364838`, accentgroen `#d1f2c2`, geel `#f6c204`, Playfair Display + Source Sans 3):
- Consistente verticale ritmiek en sectie-overgangen op alle pagina's.
- Verfijnde typografische hiërarchie (maatvoering, letter-spacing, regellengtes).
- Micro-interacties: hover/focus-states, subtiele reveal-animaties (met reduced-motion-guard), kaart- en knopinteracties.
- Mobiele "feel": tap targets ≥44px, spacing, sticky CTA-gedrag.
- Per pagina een polish-pass: home, agenda, evenement-detail, nieuws, nieuws-detail, over-ons, de-boerderij, contact, bedankt.

## Verificatie

- `npm run build` (nuxt generate) slaagt per fase.
- Visuele controle via dev-server op 375, 479, 767, 991, 1180 en 1440px.
- Toegankelijkheid: toetsenbord-walkthrough (menu, lightbox, formulier), focus zichtbaar.
- Geen references meer naar `cdn.prod.website-files.com` of `fonts.googleapis.com`.

## Buiten scope

- Sanity-schemawijzigingen (behalve optionele alt-velden als die al bestaan).
- Nieuwe pagina's of contentwijzigingen.
- Wisselen van framework, hosting of formulier-provider.
