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

Stand 13 juli 2026, na `npm update` + CI-modernisering (Actions op hun
Node 24-releases, build op Node 22):

- **5× moderate in `npm audit`** — allemaal dezelfde wortel: `uuid <11.1.1`
  zit vastgepind via `@sanity/uuid` diep in `@nuxtjs/sanity`. Het kwetsbare
  codepad (buf-argument, alleen in preview-tooling) raken wij niet, en de
  enige npm-"fix" is een breaking downgrade. **Actie: niets** — bij een
  volgende periodieke `npm update` lost dit vanzelf op zodra Sanity
  upstream released.
- **`@types/node` blijft bewust op 22.x**: de types horen de Node-versie
  van de CI-build te volgen (nu 22). Pas samen verhogen met een
  Node-bump in `.github/workflows/deploy.yml`.
- **TypeScript blijft bewust op 5.9**: TS 7 (de native compiler) pas
  instappen als Nuxt/`vue-tsc` hem officieel ondersteunen; onze typecheck
  draait via vue-tsc.
- **Werkwijze**: af en toe `npm outdated` + `npm update` draaien, en
  daarna altijd lokaal `npm ci` vóór het committen van de lockfile (zie
  de valkuil in CLAUDE.md — dit brak op 13 juli de deploy).

### ~~Oude galerijdata opruimen~~ ✅ afgerond 10 juli 2026

Data geünset met `scripts/eenmalig/unset-legacy-gallery.mjs` (akkoord
Jeroen), verborgen veld uit `studio/schemas/homePage.ts` verwijderd en
de Studio opnieuw gedeployed. Geverifieerd: `fotoGalerij` bevat de
9 foto's, het oude veld is `null`.
