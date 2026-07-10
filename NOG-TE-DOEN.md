# Status migratie & beheer

**Stand: 10 juli 2026 — de migratie is afgerond.** De site draait live op
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

### ~~Oude galerijdata opruimen~~ ✅ afgerond 10 juli 2026

Data geünset met `scripts/eenmalig/unset-legacy-gallery.mjs` (akkoord
Jeroen), verborgen veld uit `studio/schemas/homePage.ts` verwijderd en
de Studio opnieuw gedeployed. Geverifieerd: `fotoGalerij` bevat de
9 foto's, het oude veld is `null`.
