# Status migratie & beheer

**Stand: 13 juli 2026 — de migratie is afgerond.** De site draait live op
https://jeroenwijnholds.github.io/desingel/ en elke push naar `master`
deployt automatisch. Alle eerdere handmatige stappen zijn gedaan:

| Onderdeel | Status |
|---|---|
| Studio-deploy (nieuwe CMS-indeling) | ✅ live op https://desingel.sanity.studio |
| Web3Forms (contactformulier) | ✅ key ingesteld als repo-variabele `WEB3FORMS_ACCESS_KEY`; end-to-end getest |
| Sanity-webhook → GitHub rebuild | ✅ webhook "GitHub Pages rebuild" (repository_dispatch `sanity-publish`); getest |
| Netlify | ✅ build hook + site verwijderd; account is leeg |
| Vercel-restanten in GitHub | ✅ homepage-URL en oud environment opgeruimd |

Een publish in de Studio triggert nu automatisch een rebuild (~2 min).

## Beheersleutels (lokaal in `.env`, nooit committen)

- `SANITY_TOKEN` — Editor-token voor content/datamigraties
- `GITHUB_WEBHOOK_TOKEN` — fine-grained PAT (alleen repo `desingel`,
  Contents R/W); staat óók in de Sanity-webhook. **Verloopt juli 2027**:
  dan een nieuwe maken en de webhook bijwerken, anders stoppen de
  automatische rebuilds stilletjes.
- `NETLIFY_TOKEN` — mag ingetrokken worden, Netlify is opgeruimd.
- Sanity-webhookbeheer en studio-deploys lopen via de lokale CLI-sessie
  (`~/.config/sanity/config.json`).

## Nog open

### Eigen domein omzetten (wanneer Jeroen wil)

**Let op:** belevenisboerderij-desingel.nl wijst nu nog naar de **oude
Webflow-site** (DNS bij TransIP: apex → 198.202.211.1, `www` →
`cdn.webflow.com`). Bezoekers zien dus verouderde content. Omzetten:

1. TransIP → DNS van het domein: vier **A**-records op de apex naar
   `185.199.108.153`, `185.199.109.153`, `185.199.110.153`,
   `185.199.111.153`; **CNAME** `www` → `jeroenwijnholds.github.io`.
2. GitHub → repo → Settings → Pages → **Custom domain** invullen,
   wachten op het certificaat (tot ~1 uur) en **Enforce HTTPS** aanvinken.
3. Eén keer de deploy-workflow draaien (de workflow detecteert het domein
   en bouwt dan zonder `/desingel/`-padvoorvoegsel; sitemap.xml en
   robots.txt volgen automatisch mee via `NUXT_PUBLIC_SITE_URL`).
4. Daarna het Webflow-abonnement opzeggen (staat anders door te lopen).

### Dependency-beheer (periodiek, geen haast)

Stand 20 oktober 2026, na `npm update` in root én `studio/` (nuxt 4.6.2,
vue 3.5.44, sanity 5.31). Tussen juli en oktober was dit opgelopen naar
35 meldingen (5 critical, o.a. een RCE in `@nuxt/devtools` tijdens
`npm run dev` en een SSR-XSS in vue) — periodiek updaten loont dus echt.

- **Root: 14× high in `npm audit --omit=dev`**, allemaal build-tooling:
  `braces`/`micromatch` (DoS bij kwaadaardige glob-patronen, via
  nitropack/`@sanity/codegen`) en `node-forge` (via de dev-server
  `listhen`). Niets daarvan belandt op de statische site en we voeren
  geen glob-patronen van buitenaf in. **Actie: niets**, lost op met een
  volgende upstream-release.
- **Studio: 16 (10 high, 0 critical)**, ook allemaal CLI-tooling
  (`adm-zip`, `js-yaml`, `braces`). Sanity 6 (major) bewust nog niet.
- **GitHub Actions** staan sinds oktober op commit-SHA vastgepind;
  Dependabot opent maandelijks een PR als er nieuwe versies zijn.
- **Let op**: GitHub schakelt de dagelijkse `schedule`-build uit na 60
  dagen zonder repo-activiteit (krijgt een mail). Dan weer aanzetten via
  het Actions-tabblad. (Bezoekers merken het nauwelijks — de browser
  filtert verlopen evenementen ook zelf — maar de statische HTML,
  sitemap en detailpagina's lopen dan achter tot de volgende publish.)
- **`@types/node` blijft bewust op 22.x**: de types horen de Node-versie
  van de CI-build te volgen (nu 22). Pas samen verhogen met een
  Node-bump in `.github/workflows/deploy.yml`.
- **TypeScript blijft bewust op 5.9**: TS 7 (de native compiler) pas
  instappen als Nuxt/`vue-tsc` hem officieel ondersteunen; onze typecheck
  draait via vue-tsc.
- **Werkwijze**: af en toe `npm outdated` + `npm update` draaien, en
  daarna altijd lokaal `npm ci` vóór het committen van de lockfile (zie
  de valkuil in CLAUDE.md — dit brak op 13 juli de deploy).

### Contactgegevens aanvullen (Studio → Site-instellingen)

Site-instellingen heeft lege velden voor `email` (sinds oktober 2026),
`telephone` en `socialLinks` (Instagram/Facebook e.d.). Ze staan bewust
leeg — de site en structured data mogen geen verzonnen gegevens bevatten.
Zodra ze ingevuld zijn verschijnen ze vanzelf: klikbaar in de footer en de
"Praktisch"-kaart op de contactpagina, de foutmelding van het formulier
noemt het e-mailadres, en de LocalBusiness-JSON-LD neemt ze mee
(`email`/`telephone`/`sameAs`).

### Content in de Studio bijwerken (oktober 2026)

- **Privacytekst onder het contactformulier** (Contact-pagina →
  "Privacytekst onder het formulier") zegt nu dat gegevens "nooit gedeeld
  met derden" worden. Dat klopt niet: berichten lopen via Web3Forms.
  Voorstel: *"Je gegevens gebruiken we alleen om je vraag te beantwoorden.
  Je bericht wordt verstuurd via onze formulierdienst (Web3Forms) en niet
  voor andere doelen gebruikt."*
- **Alt-teksten bij de 12 galerijfoto's** (Fotogalerij): ontbreken nu,
  waardoor schermlezers alleen "Foto 1 vergroten" horen.
- **Tijdvak vs. tijd in het datumveld bij evenementen**: bij het
  Kerstcircus staat 15:00 opgeslagen en "14:00 – 21:00" als tijdvak. De
  site gebruikt het tijdvak (voor "Zet in je agenda" en Google); de
  Studio-herinrichting (fase 5) maakt hier één invoer van.

### Cookiebanner + privacyverklaring (besloten 20 oktober 2026)

De Google Maps-kaart op de contactpagina blijft bewust direct laden
(keuze Jeroen). Die zet Google-cookies zonder toestemming; daarvoor komt
later een cookiebanner. Neem daarin mee:
- de kaart pas laden na toestemming (anders heeft de banner geen effect),
  met de "Plan je route"-link als altijd-werkend alternatief;
- een korte privacy- en cookieverklaring (wie is verantwoordelijk,
  Web3Forms voor het formulier, Google Maps, Sanity-CDN voor foto's),
  gelinkt vanuit de banner, de footer en de tekst onder het formulier.

### ~~Oude galerijdata opruimen~~ ✅ afgerond 10 juli 2026

Data geünset met `scripts/eenmalig/unset-legacy-gallery.mjs` (akkoord
Jeroen), verborgen veld uit `studio/schemas/homePage.ts` verwijderd en
de Studio opnieuw gedeployed. Geverifieerd: `fotoGalerij` bevat de
9 foto's, het oude veld is `null`.
