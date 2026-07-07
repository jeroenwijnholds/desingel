# Frontend-optimalisatie Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** De Nuxt/Sanity-site robuust maken op alle schermformaten, mobiel optimaliseren en visueel polijsten, conform de spec `docs/superpowers/specs/2026-07-07-frontend-optimalisatie-design.md`.

**Architecture:** Bestaande Nuxt 4 SSG-site (nuxt generate → GitHub Pages). We werken van fundament (fonts/tokens) via structuur (CSS-dedupe, componenten) naar features (images, a11y, SEO) en sluiten af met een visuele polish-pass. Geen unit-testinfra; elke taak eindigt met `npm run build` (moet slagen) plus concrete grep-/visuele verificatie.

**Tech Stack:** Nuxt 4, Vue 3 `<script setup>`, @nuxtjs/sanity, @sanity/image-url, @fontsource (self-hosted fonts), vanilla CSS met custom properties.

## Global Constraints

- Site wordt gedeployed vanaf `master`; al dit werk gebeurt op branch `frontend-optimalisatie`.
- Kleurenpalet en identiteit blijven: `--green-dark #364838`, `--green-light #658457`, `--green-accent #d1f2c2`, `--yellow #f6c204`, Playfair Display + Source Sans 3.
- Alle teksten op de site zijn Nederlands.
- Bestanden zijn UTF-8; let op bestaande BOM's in .vue-bestanden (niet verwijderen, geen nieuwe mojibake introduceren).
- Verificatie per taak: `npm run build` slaagt (exit 0). Visuele checks via `npm run dev` op 375/479/767/991/1180/1440 px.
- Breakpoints blijven 479 / 767 / 991 / 1180 (max-width), maar consequent toegepast.
- `prefers-reduced-motion: reduce` moet elke nieuwe animatie/transitie uitschakelen.

---

### Task 1: Fonts self-hosten met correcte gewichten

**Files:**
- Modify: `package.json` (dependencies)
- Modify: `nuxt.config.ts` (css-array, head-links)

**Interfaces:**
- Produces: geladen font-families `'Playfair Display'` (400/700/900 + italic 400) en `'Source Sans 3'` (300/400/600/700), beschikbaar voor alle CSS.

- [x] **Step 1:** `npm install @fontsource/playfair-display @fontsource/source-sans-3`
- [x] **Step 2:** In `nuxt.config.ts` de Google Fonts `<link>`-entries (preconnect ×2 + stylesheet) verwijderen en bovenaan de `css:`-array toevoegen:

```ts
css: [
  '@fontsource/playfair-display/400.css',
  '@fontsource/playfair-display/700.css',
  '@fontsource/playfair-display/900.css',
  '@fontsource/playfair-display/400-italic.css',
  '@fontsource/source-sans-3/300.css',
  '@fontsource/source-sans-3/400.css',
  '@fontsource/source-sans-3/600.css',
  '@fontsource/source-sans-3/700.css',
  // ...bestaande css-bestanden
],
```

- [x] **Step 3:** `npm run build` → slaagt; `grep -r "fonts.googleapis" .output/public/index.html` → geen hits; woff2-bestanden aanwezig in `.output/public/_nuxt/`.
- [x] **Step 4:** Commit `feat: self-host fonts met correcte gewichten (900/700)`.

### Task 2: Encoding- en tekstbugs fixen

**Files:**
- Modify: `pages/agenda.vue:75` (` Â· ` → ` · `)
- Modify: `pages/over-ons.vue:761-regio` (caption `Â·` → `·`)
- Modify: `pages/contact.vue` (`Victor &amp; Mari Duurland` → `Victor & Mari Duurland`; fallback `10:00 â€“ 17:00` → `10:00 – 17:00`)

**Interfaces:** geen.

- [x] **Step 1:** Alle bovenstaande strings corrigeren (Edit per bestand; UTF-8 intact laten).
- [x] **Step 2:** Verifieer: `grep -rn "Â\|â€\|&amp;" pages/ components/` → geen hits in template-tekst.
- [x] **Step 3:** Build + commit `fix: mojibake en letterlijke HTML-entities in teksten`.

### Task 3: Design tokens — fluid typography, spacing, motion-guards

**Files:**
- Modify: `assets/css/style.css` (tokens-blok bovenaan + typografie-sectie)

**Interfaces:**
- Produces: CSS-custom-properties die alle latere taken gebruiken:
  `--text-xs/-sm/-base/-lg/-xl/-2xl/-3xl/-4xl/-hero` (clamp-schaal), `--space-1..-16` (4-64px+ schaal), `--radius-sm/-md/-lg`, `--shadow-sm/-md/-lg`, `--container-max: 1140px`, `--page-pad` (fluid inline padding).

- [x] **Step 1:** Tokens toevoegen aan `:root`:

```css
/* Fluid type (375px → 1440px viewport) */
--text-xs:   clamp(0.75rem, 0.72rem + 0.15vw, 0.8125rem);
--text-sm:   clamp(0.875rem, 0.85rem + 0.15vw, 0.9375rem);
--text-base: clamp(1rem, 0.96rem + 0.2vw, 1.0625rem);
--text-lg:   clamp(1.0625rem, 1rem + 0.3vw, 1.1875rem);
--text-xl:   clamp(1.25rem, 1.15rem + 0.5vw, 1.5rem);
--text-2xl:  clamp(1.5rem, 1.3rem + 0.9vw, 2rem);
--text-3xl:  clamp(1.75rem, 1.4rem + 1.5vw, 2.5rem);
--text-4xl:  clamp(2rem, 1.5rem + 2.2vw, 3.25rem);
--text-hero: clamp(2.125rem, 1.6rem + 2.6vw, 3.5rem);
/* Spacing */
--space-1: 4px;  --space-2: 8px;  --space-3: 12px; --space-4: 16px;
--space-5: 20px; --space-6: 24px; --space-8: 32px; --space-10: 40px;
--space-12: 48px; --space-16: 64px; --space-20: 80px; --space-24: 96px;
/* Vorm & schaduw */
--radius-sm: 8px; --radius-md: 12px; --radius-lg: 20px;
--shadow-sm: 0 2px 8px rgba(41, 31, 15, 0.08);
--shadow-md: 0 8px 24px rgba(41, 31, 15, 0.12);
--shadow-lg: 0 16px 56px rgba(54, 72, 56, 0.18);
/* Layout */
--container-max: 1140px;
--page-pad: clamp(16px, 4vw, 120px);
--nav-height: 72px;
```

- [x] **Step 2:** `html { scroll-behavior: smooth; }` vervangen door:

```css
html { scroll-padding-top: calc(var(--nav-height) + 8px); }
@media (prefers-reduced-motion: no-preference) {
  html { scroll-behavior: smooth; }
}
```

- [x] **Step 3:** Basis-typografie op tokens: `h2 { font-size: var(--text-2xl); }`, `h3 { font-size: var(--text-xl); }`, body `font-size: var(--text-base)`; de px-media-query-overrides voor h2/h3 verwijderen.
- [x] **Step 4:** Globale reduced-motion-guard toevoegen:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

- [x] **Step 5:** Build + visuele smoke-check → commit `feat: design tokens met fluid typography en motion-guards`.

### Task 4: PageHeader-component + CSS-dedupe

**Files:**
- Create: `components/PageHeader.vue`
- Create: `assets/css/page-header.css`
- Modify: `assets/css/agenda.css`, `assets/css/contact.css`, `assets/css/nieuws.css`, `assets/css/evenement.css` (dubbele `.page-header*`-blokken verwijderen)
- Modify: `pages/agenda.vue`, `pages/contact.vue`, `pages/nieuws.vue` (component gebruiken)
- Modify: `nuxt.config.ts` (page-header.css toevoegen)

**Interfaces:**
- Produces: `<PageHeader label="..." title="..." :subtitle="...?" />` — rendert `<header class="page-header">` met label/h1/sub; één canonieke CSS-definitie (min-height `clamp(420px, 55svh, 640px)`).

- [x] **Step 1:** `PageHeader.vue`:

```vue
<script setup lang="ts">
defineProps<{ label?: string; title: string; subtitle?: string }>()
</script>

<template>
  <header class="page-header">
    <div class="page-header-inner">
      <p v-if="label" class="section-label bright-green">{{ label }}</p>
      <h1 class="page-header-title">{{ title }}</h1>
      <p v-if="subtitle" class="page-header-sub">{{ subtitle }}</p>
    </div>
  </header>
</template>
```

- [x] **Step 2:** Eén `.page-header`-definitie in `assets/css/page-header.css` (gebaseerd op de agenda-variant, tokens gebruiken, `min-height: clamp(420px, 55svh, 640px)`); alle `.page-header*`-regels uit de vier page-css-bestanden verwijderen.
- [x] **Step 3:** De drie pagina's omzetten naar `<PageHeader ... />`; props met de bestaande teksten.
- [x] **Step 4:** Verifieer: `grep -c "\.page-header" assets/css/*.css` → alleen page-header.css heeft definities. Build + check /agenda, /contact, /nieuws visueel identiek qua opzet.
- [x] **Step 5:** Commit `refactor: één PageHeader-component, dubbele CSS-definities verwijderd`.

### Task 5: Webflow-CDN-assets lokaal opnemen

**Files:**
- Create: `public/images/hero-desktop.png` (of .jpg), `public/images/hero-mobile.jpg`, `public/images/ellipse-1.svg`, `public/images/ellipse-2.svg`
- Modify: `assets/css/style.css` (4 url()-references)

**Interfaces:**
- Produces: lokale paden `/images/hero-desktop.*` etc. NB: site draait onder baseURL `/desingel/` op Pages — gebruik relatieve CSS-urls of laat Nuxt/Vite ze verwerken via `~/assets` import; kies `assets/images/` + Vite-verwerking zodat baseURL automatisch klopt.

- [x] **Step 1:** Download de 4 bestanden van `cdn.prod.website-files.com` (urls staan in style.css) naar `assets/images/`.
- [x] **Step 2:** CSS-references vervangen door `url('~/assets/images/…')`.
- [x] **Step 3:** Build → `grep -r "website-files.com" .output/public/_nuxt/*.css` → geen hits; assets aanwezig in output; visuele check hero desktop + mobiel.
- [x] **Step 4:** Commit `feat: hero- en ellips-afbeeldingen lokaal i.p.v. Webflow-CDN`.

### Task 6: Homepage-layout robuust (hero svh + intro zonder magic numbers)

**Files:**
- Modify: `assets/css/style.css` (hero, intro-bg, intro-section, card-desc, services)
- Modify: `pages/index.vue` (structuur intro-sectie indien nodig)

**Interfaces:** geen nieuwe; visueel equivalent aan huidig ontwerp.

- [x] **Step 1:** Hero: `min-height: 80vh` → `min-height: 80svh` (met `vh`-fallbackregel erboven); mobiel `100vh` → `100svh` idem.
- [x] **Step 2:** `.intro-bg` (vaste 800px + `margin-top: -500px`) vervangen door een achtergrond-benadering zonder vaste hoogte: de `.intro-section` krijgt zelf de achtergrondkleur met een `::before`-overlap omhoog (`top: clamp(-320px, -22vw, -160px)`), of gelijkwaardige grid-oplossing — geen vaste pixelhoogtes die van contentlengte afhangen.
- [x] **Step 3:** Kaart-overlays: negatieve marges (-80/-90px) vervangen door `transform: translateX(±clamp(...))` of grid met overlappende kolommen, zodat overlap schaalt en nooit buiten de viewport valt; `margin-bottom: 152px` naar token-gebaseerde ruimte die de daadwerkelijke overlap reserveert.
- [x] **Step 4:** Test op 375/600/800/1000/1200/1440: geen horizontale scrollbar (`document.documentElement.scrollWidth === clientWidth`), overlays binnen beeld, geen overlappende tekst.
- [x] **Step 5:** Build + commit `refactor: homepage-layout zonder magic numbers, svh-hero`.

### Task 7: Responsive images via uitgebreide image-composable

**Files:**
- Modify: `composables/useImageUrl.ts` → nieuwe helper `useSanityImg`
- Modify: alle afnemers: `pages/index.vue`, `pages/nieuws.vue`, `pages/nieuws/[slug].vue`, `pages/evenement/[slug].vue`, `pages/over-ons.vue`, `pages/de-boerderij.vue`, `components/AppLightbox.vue`

**Interfaces:**
- Produces: `useSanityImg()` → `(source, opts: { widths: number[]; sizes: string; aspect?: number }) => { src: string; srcset: string; sizes: string; width: number; height: number | undefined }`. Alle urls krijgen `.auto('format').quality(75)`.

- [x] **Step 1:** Composable implementeren:

```ts
export function useSanityImg() {
  const builder = useImageUrl()
  return (source: any, opts: { widths: number[]; sizes: string; aspect?: number }) => {
    const base = (w: number) => {
      let b = builder(source).width(w).auto('format').quality(75)
      if (opts.aspect) b = b.height(Math.round(w / opts.aspect))
      return b.url()
    }
    const maxW = Math.max(...opts.widths)
    return {
      src: base(maxW),
      srcset: opts.widths.map(w => `${base(w)} ${w}w`).join(', '),
      sizes: opts.sizes,
      width: maxW,
      height: opts.aspect ? Math.round(maxW / opts.aspect) : undefined,
    }
  }
}
```

- [x] **Step 2:** Alle `<img :src="imageUrl(...).width(N).url()">`-plekken omzetten naar `v-bind="sanityImg(source, { widths: [...], sizes: '...' })"`. Richtwaarden: hero/detailheaders `[640, 960, 1400, 1920]` met `sizes="100vw"`; kaarten `[400, 600, 900]` met `sizes="(max-width: 767px) 100vw, 33vw"`; gallery `[400, 800, 1200]` met `sizes="(max-width: 767px) 50vw, 33vw"`; sidebar-thumbs `[120, 200]`.
- [x] **Step 3:** PortableText-figuren in beide `[slug]`-pagina's zelfde behandeling.
- [x] **Step 4:** Build → in gegenereerde HTML `grep -o 'srcset' .output/public/index.html | wc -l` > 0 en `auto=format` aanwezig; visuele check dat beelden scherp blijven.
- [x] **Step 5:** Commit `perf: responsive images met srcset, WebP en vaste afmetingen`.

### Task 8: Lightbox-upgrade (navigatie, focus-trap, swipe)

**Files:**
- Modify: `components/AppLightbox.vue`
- Modify: `assets/css/style.css` (modal-sectie: nav-knoppen, teller)
- Modify: `pages/index.vue` (alt-teksten doorgeven waar beschikbaar)

**Interfaces:**
- Consumes: bestaande prop `images: Array<{ url, srcset?, alt? }>`.
- Produces: zelfde componentnaam/props (uitgebreid met optionele `srcset`), dus geen breaking change.

- [x] **Step 1:** Component uitbreiden: `prev()/next()` met wrap-around; keydown-handler voor `ArrowLeft`/`ArrowRight`/`Escape`; touch-handlers (`touchstart`/`touchend`, swipe-drempel 40px); teller "3 / 12"; focus bij openen naar de dialog, focus-trap (Tab cycelt binnen modal), focus terug naar de aangeklikte thumbnail bij sluiten; gallery-thumbs worden `<button>`-elementen (toetsenbord-toegankelijk).
- [x] **Step 2:** CSS: `.modal-nav`-knoppen (44×44px min, links/rechts gecentreerd, zichtbare focus-ring), `.modal-counter` onderaan; alles met tokens.
- [x] **Step 3:** Handmatige test: muis, toetsenbord (Tab/pijlen/Escape) en swipe in devtools-touch-emulatie.
- [x] **Step 4:** Build + commit `feat: lightbox met navigatie, focus-trap en swipe`.

### Task 9: Mobiel menu toegankelijk

**Files:**
- Modify: `components/AppNav.vue`

**Interfaces:** geen wijziging naar buiten.

- [x] **Step 1:** Escape sluit menu; focus-trap wanneer open; `aria-label` wisselt "Menu openen"/"Menu sluiten"; `aria-expanded` blijft; menu sluit op route-wissel via `watch(() => route.path, closeMenu)` (vervangt losse @click-handlers niet, maar vangt alle navigatie).
- [x] **Step 2:** Body-scroll-lock behouden maar ook opruimen in `onUnmounted`.
- [x] **Step 3:** Handmatige test op 375px: openen, Tab-cyclus, Escape, navigeren.
- [x] **Step 4:** Build + commit `fix: mobiel menu met escape, focus-trap en correcte aria`.

### Task 10: Contactformulier — validatie en verzendstatus

**Files:**
- Modify: `pages/contact.vue`
- Modify: `assets/css/contact.css` (fout- en status-styling)

**Interfaces:**
- Consumes: `config.public.web3formsKey`; Web3Forms accepteert JSON POST naar `https://api.web3forms.com/submit` met `access_key`.

- [x] **Step 1:** Submit onderscheppen (`@submit.prevent`): client-side validatie (naam ≥ 2 tekens, e-mail regex, bericht ≥ 10 tekens) met Nederlandse foutmeldingen per veld (`aria-describedby` + `aria-invalid`), fout-samenvatting met focus erheen.
- [x] **Step 2:** Versturen via `fetch` (JSON); states: `idle | sending | error`; knop toont "Versturen…" en is disabled tijdens sending; bij succes `navigateTo('/bedankt')`; bij fout inline foutmelding met behoud van invoer. `redirect`-hidden-field verwijderen (niet meer nodig); `botcheck` behouden.
- [x] **Step 3:** CSS: `.form-error` (rood #b3261e, `--text-sm`), `.form-input[aria-invalid="true"]` rand, status-regio `aria-live="polite"`.
- [x] **Step 4:** Handmatige test: lege submit → fouten zichtbaar en aankondigbaar; geldige submit → (met placeholder-key) nette foutafhandeling.
- [x] **Step 5:** Build + commit `feat: contactformulier met validatie en verzendstatus`.

### Task 11: 404-afhandeling

**Files:**
- Create: `error.vue` (projectroot)
- Modify: `pages/evenement/[slug].vue`, `pages/nieuws/[slug].vue`

**Interfaces:**
- Produces: `error.vue` toont vriendelijke NL-pagina met nav/footer-stijl en links naar home/agenda/nieuws.

- [x] **Step 1:** `error.vue` met `useError()`, titel "Pagina niet gevonden" (404) / "Er ging iets mis" (overig), knop naar home; styling scoped, hergebruik `.btn`-classes.
- [x] **Step 2:** In beide slug-pagina's: als query resolved en `!data.value`, `showError({ statusCode: 404, statusMessage: 'Niet gevonden' })`; tijdens generate bestaat alleen wat geprerenderd is, dus dit dekt de client-side fallback.
- [x] **Step 3:** Test: dev-server → `/evenement/bestaat-niet` toont 404-pagina.
- [x] **Step 4:** Build + commit `feat: 404-pagina en nette afhandeling van onbekende slugs`.

### Task 12: SEO, Open Graph en favicon

**Files:**
- Create: `composables/useSeo.ts`
- Create: `public/favicon.svg`, `public/favicon.ico`(png), `public/apple-touch-icon.png`, `public/og-default.jpg`
- Modify: `nuxt.config.ts` (head: favicon-links, default meta)
- Modify: alle pagina's (useSeo-aanroep met description per pagina)

**Interfaces:**
- Produces: `useSeo({ title, description, image? })` → zet title, meta description, canonical, og:*, twitter:*.

- [x] **Step 1:** Favicon-set maken (eenvoudig boerderij/blad-monogram in huisstijlgroen als SVG; PNG-renders 32/180px). OG-default: bestaand hero-beeld 1200×630.
- [x] **Step 2:** `useSeo`-composable met `useHead`/`useSeoMeta`; per pagina aanroepen met een passende NL-description (agenda, contact, nieuws, over-ons, de-boerderij, home, detailpagina's met excerpt).
- [x] **Step 3:** Build → `grep -o 'og:title' .output/public/index.html` hit; favicon-links aanwezig.
- [x] **Step 4:** Commit `feat: seo-meta, open graph en favicon`.

### Task 13: Visuele optimalisatie — globale pass (frontend-design skill)

**Files:**
- Modify: `assets/css/style.css`, `assets/css/page-shared.css`, `assets/css/page-header.css`

**Interfaces:** bouwt uitsluitend op tokens uit Task 3.

- [x] **Step 1:** Invoke frontend-design skill; richtlijnen: identiteit behouden, sectieritmiek uniformeren (secties `padding-block: clamp(64px, 9vw, 112px)`), typografische hiërarchie aanscherpen (display-titels letter-spacing -0.02em, labels 0.12em uppercase op `--text-xs/sm`), knoppen/links consistente hover- en focus-states, kaarten `--radius-md` + `--shadow-sm→md` op hover met subtiele lift.
- [x] **Step 2:** Subtiele scroll-reveal (IntersectionObserver-composable `useReveal`, alleen `opacity/transform`, uit bij reduced-motion) toepassen op sectie-niveau.
- [x] **Step 3:** Visuele review op alle breakpoints; build + commit `style: globale visuele polish (ritmiek, typografie, interacties)`.

### Task 14: Visuele optimalisatie — per-pagina pass + eindverificatie

**Files:**
- Modify: per-pagina CSS + templates waar nodig (alle pagina's uit de spec).

- [x] **Step 1:** Per pagina (home, agenda, evenement-detail, nieuws, nieuws-detail, over-ons, de-boerderij, contact, bedankt) een polish-pass: spacing op tokens, tap targets ≥ 44px, mobiele volgorde/hiërarchie, lege-staten netjes.
- [x] **Step 2:** Eindverificatie-checklist: build slaagt; geen horizontale scroll op 375–1440; toetsenbord-walkthrough menu/lightbox/formulier; geen `website-files.com`/`fonts.googleapis.com` in output; Lighthouse-achtige sanity (afbeeldingen met width/height, meta aanwezig).
- [x] **Step 3:** Commit(s) per pagina; afsluitend `docs: plan-checkboxes bijgewerkt`.
