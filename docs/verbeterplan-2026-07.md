# Verbeterplan — grondige sweep, 10 juli 2026

> **Status (10 juli 2026, uitgevoerd op verzoek van Jeroen):** alle punten
> zijn uitgevoerd, met deze uitzonderingen:
> - **Punt 13 (galerijdata)**: het code-deel is klaar; het unsetten van de
>   productiedata is een handmatige stap (script staat klaar, zie
>   NOG-TE-DOEN) — productie-datamutaties draaien we niet automatisch.
> - **Punt 15**: de optionele `InfoCard`- en icoon-componenten zijn niet
>   gebouwd (de drie kerncomponenten wél).
> - **Punt 14 slug-uniciteit**: Sanity's ingebouwde slug-uniciteitscheck
>   dekt dit al per documenttype; geen custom code toegevoegd.
> - **Punt 20 (px→tokens-migratie)**: bewust uitgesteld conform het plan
>   zelf ("aparte, goed geverifieerde klus"); de token-gaten (punt 17)
>   zijn wél gedicht.
> - **Punt 19 (a11y)**: focus/tap/contrast/headings gedaan; de
>   `error-summary-labels → anchors`-suggestie was cosmetisch en is
>   overgeslagen.

Resultaat van een codebase-brede review (frontend, Studio-schemas, CSS,
config/CI). Bevindingen met ⚠ zijn handmatig geverifieerd (grep/run),
de rest komt uit code-review.

Per punt: wat, waarom, moeite (klein / middel / groot).

---

## Fase 1 — SEO & vindbaarheid (grootste winst, beperkt werk)

1. **Sitemap + robots.txt** — ontbreken allebei (⚠ geen `sitemap.xml` in
   `.output/public`, geen `robots.txt` in `public/`). Detailpagina's
   (`/evenement/*`, `/nieuws/*`) worden nu alleen via crawling gevonden.
   Aanpak: `@nuxtjs/sitemap` (kent `siteUrl` al) + statische `robots.txt`
   met `Sitemap:`-regel (let op het `/desingel/`-subpad). Stond al als
   "idee voor later" in CLAUDE.md. *Moeite: klein–middel.*
2. **Structured data (JSON-LD)** — nergens aanwezig, terwijl de data al in
   het CMS zit: `LocalBusiness` (adres/coördinaten/openingstijden uit
   `siteSettings`), `Event` op `evenement/[slug].vue` (datum, locatie,
   tijden), `NewsArticle` op `nieuws/[slug].vue` (publishedAt, image).
   Directe winst voor Google-weergave (event-kaarten, nieuwscarrousel).
   *Moeite: middel.*
3. **OG-metadata afronden** — `useSeo.ts:31` zet `ogType` altijd op
   `'website'` (artikelen horen `'article'` + `article:published_time`);
   `ogImageWidth`/`ogImageHeight`/`ogImageAlt` en `twitterImage` ontbreken
   (LinkedIn/X renderen betrouwbaarder mét). *Moeite: klein.*

## Fase 2 — Performance & tooling (klein werk, houdt kwaliteit vast)

4. **Preconnect naar `cdn.sanity.io`** — alle contentfoto's (incl. LCP-hero's
   met `fetchpriority="high"`) komen daarvandaan; `nuxt.config.ts` heeft geen
   preconnect. Merkbaar snellere LCP op detailpagina's. *Moeite: klein.*
5. **Ongebruikt fontgewicht schrappen** — ⚠ `@fontsource/source-sans-3/300.css`
   wordt geladen (`nuxt.config.ts:27`) maar `font-weight: 300` komt in geen
   enkel CSS-/Vue-bestand voor. Gratis kleinere payload. *Moeite: klein.*
6. **Playwright als devDependency** — ⚠ `scripts/viewport-check.mjs`
   importeert `playwright`, dat wél in `node_modules` staat (ooit los
   geïnstalleerd, v1.60.0) maar níét in `package.json`. Op een verse clone
   breekt het verificatie-script dus stilletjes. *Moeite: klein.*
7. **npm-scripts + CI-check** — `package.json` heeft alleen dev/build/preview;
   de deploy-workflow doet geen enkele check behalve "build slaagt". Toevoegen:
   `typecheck`-script (`nuxt typecheck`) en die in CI draaien; optioneel de
   viewport-check als CI-stap en een `.nvmrc` (CI pint Node 20, lokaal niets).
   *Moeite: klein–middel.*

## Fase 3 — CMS-dekking (redactie kan meer zelf, zelfde patroon als agenda/nieuws)

8. **Contact-paginakop naar CMS** — `contact.vue:101-105` heeft als enige
   PageHeader-pagina nog hardcoded label/titel/ondertitel (en kan meteen de
   nieuwe headerfoto-optie meekrijgen). Drie à vier velden op `contactPage`,
   zelfde fallback-patroon als agenda/nieuws. *Moeite: klein.*
9. **Logo-tekst uit `siteName`** — ⚠ `AppNav.vue` háált `siteName` al op in
   de query maar gebruikt het nergens; het logo is hardcoded
   "Belevenisboerderij de Singel". Gebruiken of uit de query halen.
   *Moeite: klein.*
10. **CTA-blok "Kom langs" naar CMS** — het blok (label/titel/tekst) staat
    3× hardcoded (`index.vue`, `over-ons.vue`, `de-boerderij.vue`) terwijl de
    kníppen eronder wél CMS-gestuurd zijn. Combineert goed met punt 15
    (CtaBlock-component). *Moeite: middel.*
11. **Overige vaste teksten op inhoudspagina's** — meta-items ("Achterhoek,
    Gelderland", "Boeren met een missie"), fotocaptions en sectielabels op
    over-ons/de-boerderij/index staan buiten het CMS. Per stuk klein; bewust
    níét doen voor `error.vue` (moet werken als het CMS juist de faalbron is)
    en laag prioriteren voor `bedankt.vue`. *Moeite: middel (verspreid).*

## Fase 4 — Studio-schemas (redacteursvriendelijkheid & datakwaliteit)

12. **Dode velden opruimen in `siteSettings`** — `farmshopHours` en
    `responseTime` worden door geen enkele pagina gelezen (de contactpagina
    gebruikt `contactPage.infoHours`/`infoResponseTime`); redacteuren vullen
    openingstijden nu op twee plekken in waarvan er één genegeerd wordt.
    *Moeite: klein.*
13. **Legacy `galleryImages`-traject afronden** — stond al in NOG-TE-DOEN.md;
    extra argument uit de sweep: het verborgen veld heeft geen alt-veld, dus
    zolang het bestaat kan het alt-loze foto's bevatten. *Moeite: klein.*
14. **Schema-validatie aanscherpen** — heroImage verplicht; `.warning()` op
    lege alt-teksten (blokkeert publiceren niet); `initialValue` op
    `nieuwsArtikel.publishedAt`; slug-uniciteit op event/nieuwsArtikel;
    descriptions op de CTA-href-velden; `apiVersion` pinnen in
    `sanity.config.ts`; gedeelde array-image-helper in `lib.ts` zodat ook
    galerij- en body-afbeeldingen consistente alt/hotspot krijgen.
    *Moeite: middel (veel kleine punten). Let op: Studio herdeployen.*

## Fase 5 — Duplicatie in de frontend (onderhoudbaarheid)

15. **Gedeelde componenten/composables** — de duidelijkste drie:
    `useDateFormat`-composable (nl-NL-formattering staat nu 4× verspreid),
    `<CtaBlock>` (3× vrijwel identiek), en de PortableText-image-component
    die byte-voor-byte gelijk is in `evenement/[slug].vue` en
    `nieuws/[slug].vue`. Daarna optioneel: `<InfoCard>` (3× "Praktisch"-kaart,
    combineert met punt 19) en een icoon-component voor de overal herhaalde
    inline SVG's. *Moeite: middel.*

## Fase 6 — CSS-hygiëne & toegankelijkheid

16. **Dubbele selectors dedupliceren** — ⚠ `.news-label`/`.news-date` staan
    identiek in `nieuws.css` én `nieuws-artikel.css`: exact de klasse bug
    (laadvolgorde bepaalt stilletjes de styling) die eerder `.page-header`
    raakte. Verplaatsen naar een gedeeld bestand. *Moeite: klein.*
17. **Token-gaten dichten** — ⚠ `--green-bg` wordt gebruikt
    (`nieuws-artikel.css:182`) maar is nooit gedefinieerd (draait altijd op de
    fallback); de zachte licht-groene surface-kleur bestaat in drie
    nét-verschillende tinten (`#f0f5ec`/`#f4f7f2`/`#f8f9f6`) → één
    `--surface-soft`-token; foutkleuren in contact.css als `--error`-token;
    hardcoded schaduwen die (bijna) gelijk zijn aan `--shadow-*`.
    *Moeite: klein–middel.*
18. **Dode CSS opruimen** — ⚠ `.sr-only` (duplicaat van `.visually-hidden`),
    `hr.divider`, en `.nav-link--active` (AppNav gebruikt die klasse nooit;
    ofwel verwijderen, ofwel júist koppelen aan `router-link-active` zodat de
    actieve navigatie-stijl echt werkt — dat laatste is een kleine feature).
    *Moeite: klein.*
19. **A11y-puntjes** — ontbrekende `:focus-visible` op ~10 links/knoppen
    (agenda-knoppen, breadcrumbs, footer-links…); tap-targets net onder 44px
    (`.agenda-btn` 40px, `.btn` op mobiel); contrastrisico's (wit op 40-65%
    opacity op donkergroen, captions op 50-55% opacity); info-kaart-koppen
    zijn `<p>` i.p.v. headings. *Moeite: middel (verspreid, mechanisch).*
20. **Op termijn: spacing/typografie naar tokens** — veel pagina-CSS gebruikt
    vaste px (o.a. 60px zijpadding i.p.v. `--page-pad`, vaste titelgroottes
    i.p.v. de fluid `--text-*`-schaal). Grootste klus van het plan, puur
    consistentie; alleen doen met screenshot-vergelijking per pagina.
    *Moeite: groot.*

## Fase 7 — Documentatie

21. **CLAUDE.md-statussectie actualiseren** — ⚠ die zegt nog "PR #1 wacht op
    review" en "Web3Forms/webhook/Netlify open", terwijl NOG-TE-DOEN.md meldt
    dat de hele migratie sinds 10 juli klaar is. Verwarrend voor elke
    volgende sessie. *Moeite: klein.*

---

## Aangeraden volgorde

Fase 1 + 2 eerst (meeste waarde per uur, geen ontwerpkeuzes nodig), dan 16-18
(kleine hygiëne met echt bug-potentieel), dan 3/4 in overleg (raakt wat de
redactie ziet; Studio moet na schemawijzigingen opnieuw gedeployd), dan 5/19,
en 20 alleen als aparte, goed geverifieerde klus.
