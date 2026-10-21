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
5. In Umami het domein van de website wijzigen (zie Bezoekersstatistiek).
   `data-domains` volgt vanzelf `NUXT_PUBLIC_SITE_URL`.

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

### ~~Verbetervoorstel oktober 2026 uitrollen~~ ✅ afgerond 21 oktober 2026

Fase 1–6 gemerged (#5–#10, merge-commit 24edff8) en live; CI groen.
Studio gedeployd met het nieuwe schema. Back-up van de dataset vóór de
migratie (alleen documenten, 15 stuks) staat buiten de repo in
`../desingel-backups/production-2026-10-21-voor-migratie.tar.gz`.
`migreer-evenement-tijden.mjs --apply` gedraaid: de 4 evenementen hebben
nu begin- én eindtijd (het tijdvak was leidend; de opgeslagen tijd week
overal 2 uur af door een tijdzonefout bij de oorspronkelijke invoer).
Live gecontroleerd: tijden, structured data en agendabestand kloppen.

Nog over: de verouderde Contact-velden (adres/eigenaren/openingstijden)
worden niet meer gelezen; ze kunnen blijven staan of later opgeruimd worden.

### Content in de Studio bijwerken (oktober 2026)

- ~~**Placeholderteksten op homepage en De Boerderij**~~ ✅ 21 oktober
  2026: alle 13 vervangen door teksten van de originele Webflow-site
  (diensten- en galerijkop) en de bestaande terugvalteksten
  (`scripts/eenmalig/vul-placeholderteksten.mjs`, back-up vooraf in
  `../desingel-backups/`). Het zijn voorbeeldteksten: Victor & Mari kunnen
  ze in de Studio naar eigen smaak aanpassen.
- **Plaatsnaam**: het intro-label op De Boerderij zegt "Heelweg,
  Gelderland". Als dat klopt: ook in Site-instellingen → Adres zetten
  (nu alleen "Achterhoek, Gelderland"), dan nemen footer, contactpagina
  en Google het over.

- ~~**Privacytekst onder het contactformulier**~~ ✅ 21 oktober 2026:
  vermeldt nu dat berichten via Web3Forms lopen (de oude tekst beloofde
  "nooit gedeeld met derden").
- ~~**Alt-teksten bij de 12 galerijfoto's**~~ ✅ 21 oktober 2026: per foto
  beschreven (personen niet bij naam). Victor & Mari kunnen ze in de
  Studio aanvullen, bijv. met namen of de diersoort.
  Beide via `scripts/eenmalig/vul-alt-en-privacytekst.mjs`, back-up vooraf
  in `../desingel-backups/`.
- ~~**Tijdvak vs. tijd in het datumveld bij evenementen**~~ ✅ opgelost
  door de migratie van 21 oktober (begin- en eindtijd).

### ~~Cookiebanner + privacyverklaring~~ ✅ 21 oktober 2026

- Eigen lichte banner (`AppConsent`): de enige cookies komen van de
  Google Maps-kaart, die pas laadt na "Kaart toestaan" (op de banner of
  op de kaart-placeholder). De keuze staat een jaar in `localStorage`
  (`desingel-cookiekeuze`). Wijzigen kan via "Cookie-instellingen" in de footer.
- Privacyverklaring op `/privacy`: Studio → Pagina's → Privacyverklaring.
  De eerste versie komt uit `scripts/eenmalig/maak-privacyverklaring.mjs`.
  **Pas de tekst aan** als er een dienst bijkomt of afgaat, en zet dan
  "Laatst bijgewerkt" op de datum van die dag.

### Bezoekersstatistiek (Umami Cloud) ✅ ingesteld 21 oktober 2026

Het account is van Jeroen (Umami Cloud, gratis Hobby-plan: tot 100.000
events per maand, 6 maanden bewaard, geen teamleden). De website staat erin
met het domein `jeroenwijnholds.github.io`. Hoe het werkt:

- **Tellen**: de repo-variabele `UMAMI_WEBSITE_ID` (GitHub → Settings →
  Secrets and variables → Actions → Variables) zet `plugins/analytics.ts`
  aan. `UMAMI_SCRIPT_URL` is niet gezet, dus het script komt van
  `https://cloud.umami.is/script.js`. De CSP neemt dat domein automatisch
  op, plus `gateway.umami.is`, waar het Cloud-script de tellingen naartoe stuurt.
- **Meekijken (Victor & Mari)**: via een deellink van Umami (alleen-lezen,
  zonder login). De Studio heeft een tabblad **Bezoekersstatistiek** dat de
  deellink opent. De link staat bewust **niet** in de repo, want die is
  openbaar. Hij staat in `studio/.env` als `SANITY_STUDIO_UMAMI_SHARE_URL`
  en wordt bij `npm run deploy` in de Studio gebakken. **Deploy je de Studio
  vanaf een andere computer, zet dan eerst dat bestand neer**, anders
  verdwijnt het tabblad. De link vind je in Umami → website → Edit → Share
  URL.
- Lekt de deellink uit, klik dan in Umami op "Regenerate". Zet daarna de
  nieuwe link in `studio/.env` en deploy de Studio opnieuw.
- Wil je dat Victor & Mari eigen logins krijgen (teamleden), dan heb je het
  Pro-plan nodig ($20 per maand).

Alleen bezoeken op het domein uit `NUXT_PUBLIC_SITE_URL` tellen mee
(`data-domains`), dus lokaal testen vervuilt de cijfers niet. Wie
Do Not Track aan heeft staan, wordt niet geteld.

### ~~Oude galerijdata opruimen~~ ✅ afgerond 10 juli 2026

Data geünset met `scripts/eenmalig/unset-legacy-gallery.mjs` (akkoord
Jeroen), verborgen veld uit `studio/schemas/homePage.ts` verwijderd en
de Studio opnieuw gedeployed. Geverifieerd: `fotoGalerij` bevat de
9 foto's, het oude veld is `null`.
