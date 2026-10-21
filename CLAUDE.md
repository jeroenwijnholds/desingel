# Belevenisboerderij De Singel — projectinstructies

Website voor een belevenisboerderij in de Achterhoek (Victor & Mari Duurland).
Nuxt 4 + Sanity CMS, volledig statisch gegenereerd (`nuxt generate`), gehost op
GitHub Pages. Alle content en teksten zijn **Nederlands**; communiceer met
Jeroen ook in het Nederlands.

## Commando's

```bash
npm run dev                      # dev-server
npm run build                    # nuxt generate + sitemap/robots/llms.txt + CSP-meta → .output/public (DE verificatie)
npm run typecheck                # vue-tsc via nuxt typecheck (draait ook in CI)
npm run lint                     # @nuxt/eslint (CI); na typecheck/prepare, want leest .nuxt/eslint.config.mjs
npm test                         # Vitest: pure logica in composables, in TZ=UTC zoals CI (tests/)
npm run typegen                  # schema → types/sanity.types.ts; na élke schemawijziging (CI controleert het)
npx serve -l 4173 .output/public # gebouwde site lokaal serveren
npm run viewport-check           # Playwright: overflow + axe + screenshots (zie Verificatie)
```

`.env` bevat `SANITY_PROJECT_ID`/`SANITY_DATASET` (nodig voor build; nooit committen).

## Kritieke regels

1. **Nooit direct op `master` committen.** Elke push naar master deployt
   automatisch naar de live site (GitHub Actions → Pages). Werk altijd op een
   feature-branch en rond af via PR of expliciete merge-keuze van Jeroen.
2. **Bouw na elke afgeronde taak** (`npm run build`) en verifieer visueel
   vóór je iets af noemt. Beweringen zonder draaiende verificatie zijn niet af.
3. **Encoding**: .vue-bestanden zijn UTF-8, sommige met BOM. Verwijder BOM's
   niet en introduceer geen mojibake (`Â·`, `â€“`). In `{{ }}`-interpolaties
   géén HTML-entities (`&amp;` rendert daar letterlijk); in gewone
   template-tekst zijn entities wél oké.
4. **`prefers-reduced-motion` respecteren** bij elke nieuwe animatie/transitie
   (er staat een globale guard in `style.css`, maar denk erom bij JS-animaties).

## Valkuilen die ons echt gebeten hebben

Lees deze vóór je aan de betreffende code werkt — elk punt heeft ons debugtijd gekost:

- **`aspect-ratio` in CSS verliest van het `height`-attribuut** dat
  `useSanityImg` op afbeeldingen met `aspect` zet (tegen layout shift):
  zonder `height: auto` in de CSS rendert de foto op de attribuut-hoogte
  (zo waren de homepage-kaarten maandenlang 800px hoog op elk scherm).
  Zet bij `aspect-ratio` op een Sanity-`<img>` dus altijd óók `height: auto`.
- **Het originele Webflow-ontwerp is de designreferentie** en draait nog
  live op belevenisboerderij-desingel.nl (tot de DNS-omzetting). Bij
  twijfel over hoe iets "hoort": haal daar de markup/CSS op (stylesheet
  op cdn.prod.website-files.com) in plaats van te gissen vanaf screenshots.
- **Query's gaan via `useContentQuery`**, niet rechtstreeks via
  `useSanityQuery`: de wrapper laat de prerender falen (500 → `nuxt
  generate` stopt) als Sanity een fout geeft. Zonder die wrapper slikt
  `useAsyncData` de fout in en werd een lege site gedeployd (getest met een
  ongeldig project-ID: exit 0, 16 routes). Verder identiek aan
  `useSanityQuery`, dus onderstaande regel geldt ook voor de wrapper.
- **`useSanityQuery` zonder `await`** (bewuste keuze, tegen hydration-flash):
  de `status`-ref wordt `'success'` **vóórdat** de `data`-ref gevuld is (dat
  gebeurt een microtask later in de module). Voor "bestaat dit document?"-checks
  dus **nooit** `watch(status)` gebruiken; gebruik de **thenable** die de
  composable teruggeeft: `query.then(() => { if (!data.value) showError(...) })`.
  Zo doen `pages/evenement/[slug].vue` en `pages/nieuws/[slug].vue` het nu.
- **Parent-routes**: een `pages/x.vue` naast een map `pages/x/` maakt `x.vue`
  een parent-route; zonder `<NuxtPage>` renderen de kinderen **nooit** (zo
  waren nieuwsartikelen maandenlang onbereikbaar). Gebruik `pages/x/index.vue`.
- **De groene intro-band op de homepage** (`.intro-bg`) werkt door
  CSS-paint-order: statische (niet-gepositioneerde) elementen schilderen
  áchter gepositioneerde elementen, en de hero is `position: relative` met een
  ellips-`clip-path`. Zet dus **geen** `position`/`z-index` op `.intro-bg`,
  anders schildert hij óver de hero-foto heen.
- **`.service-desc` en `.card-desc--intro` steken buiten hun container uit**
  (negatieve marges/overhang). Zet geen `overflow: hidden` op `.service-item`
  of `.card-container` — dat knipt de overlays af. De overhang-maten zijn
  gekoppeld via `--card-hang` en `--card-overhang` op `.intro-section`.
- **Content-Security-Policy** (`scripts/add-csp.mjs`, na de build): hasht de
  inline scripts van Nuxt; script-src staat géén `'unsafe-inline'` toe. Laad
  je een nieuwe externe bron (script, iframe, font, API), voeg het domein dan
  daar toe — anders blokkeert de browser het stil (controleer de console).
  Nooit `v-html` gebruiken (er is er nu geen enkele).
  Let op: een script kan naar een **ander** domein verzenden dan waar het
  vandaan komt. Het Umami Cloud-script komt van `cloud.umami.is`, maar
  verstuurt naar `gateway.umami.is`. Kijk dus in het script zelf.
- **Toestemming/cookies**: alleen de Google Maps-kaart plaatst cookies en
  laadt pas na toestemming (`useConsent().mapsAllowed`). Een nieuwe
  externe dienst die cookies zet of persoonsgegevens verwerkt, vraagt
  hetzelfde. **Werk daarna ook de privacyverklaring bij** (Studio → Pagina's →
  Privacyverklaring).
- **Types komen uit het schema** (`types/sanity.types.ts`): gebruik die (of
  een `Pick<>` bij een projectie) i.p.v. eigen interfaces; afbeeldingen zijn
  `SanityImageField` (uit `useImageUrl`). Na een schemawijziging
  `npm run typegen`, anders faalt de CI-job "studio".
- **Pagina's hebben één root-element** (een `<div>` om de template): nodig
  voor Nuxt-paginatransities; lint (`vue/no-multiple-template-root`) bewaakt het.
- **Hydration-mismatch-warning in de console is bekend en geaccepteerd**: SSR
  rendert mét data, de client hydrateert kort zonder (non-awaited queries).
  Visueel onzichtbaar. Niet "fixen" door overal `await` toe te voegen zonder
  de flash-afweging opnieuw te maken (zie commit 860184d).
- **GitHub Pages draait onder `/desingel/`**: de workflow zet
  `NUXT_APP_BASE_URL` en `NUXT_PUBLIC_SITE_URL` tijdens de build. Hardcode
  nooit absolute paden (`/images/...`) in templates of head-config; gebruik
  `~/assets/...` (Vite verwerkt baseURL) of `config.public.siteUrl`.
- **`npm update` kan een lockfile schrijven die `npm ci` weigert** (interne
  inconsistentie — zo brak de deploy op 13 juli 2026, lokaal onopgemerkt).
  Draai na elke lockfile-wijziging lokaal `npm ci` vóór je commit; dat is
  exact de check die CI doet.

## Architectuur

- `pages/` — index, agenda, contact, de-boerderij, over-ons, bedankt, privacy,
  `nieuws/index` + `nieuws/[slug]`, `evenement/[slug]`; `error.vue` in de root.
- `components/` — `AppNav` (focus-trap, escape, sluit bij navigatie;
  logo-tekst uit `siteSettings.siteName`), `AppFooter` (incl. site-brede
  LocalBusiness-JSON-LD), `AppLightbox` (pijltjes/swipe/focus-trap/teller),
  `PageHeader` (dé paginakop; props label/title/subtitle/image — image is
  een Sanity-afbeelding als achtergrond met gradient-overlay),
  `CtaBlock` (het "Kom langs"-blok; styling `.cta-block*` in page-shared),
  `PageIntroSplit`/`PageStory`/`PageQuote`/`PageWidePhoto` (de gedeelde
  secties van Over Ons en De Boerderij), `AppAnnouncement` (mededelingsbalk),
  `AppConsent` (cookiekeuze. Staat vooraan in de tabvolgorde en wordt
  verborgen zolang het menu of de lightbox open is. Bij heropenen via de
  footer krijgt hij de focus).
- `composables/` — `useContentQuery` (zie Valkuilen), `useImageUrl` (ruwe
  Sanity image-builder; exporteert ook `hasImage()` — **gebruik die in elke
  `v-if` op een afbeeldingsveld**, een object met alleen een alt-tekst is
  truthy maar heeft geen foto),
  `useSanityImg` (**gebruik deze voor elke afbeelding**: levert
  src/srcset/sizes/width/height met WebP via `auto=format`; mét `aspect`
  snijdt Sanity server-side rond de hotspot, zónder `aspect` komt de hotspot
  terug als inline `object-position`-style die de CSS-fallback overridet —
  redacteuren sturen de uitsnede dus via "Edit hotspot" in Studio),
  `useSeo` (title/description/canonical/OG per pagina; accepteert getters;
  `type: 'article'` + `publishedTime` voor artikelen), `useJsonLd`
  (structured data), `useDateFormat` (alle nl-NL-datumformattering, altijd
  in Europe/Amsterdam — de build draait in UTC; `isPastDay` voor
  "is dit evenement voorbij?"),
  `usePortableTextComponents` (gedeelde body-afbeelding- en citaatrenderer),
  `useFocusTrap` (`trapFocus` + `useScrollLock` met teller, voor menu en
  lightbox),
  `useSiteSettings` (**dé** bron voor Site-instellingen in componenten — geen
  eigen siteSettings-query meer schrijven; plus `openingHoursParts`/
  `formatOpeningHours`, `telHref`, `routeHref`), `useEventTimes`
  (`getEventTimes`: begin/eind in NL-tijd uit het getoonde tijdvak — dat is
  leidend, de tijd in het datumveld wijkt in de praktijk af; plus
  `isoAmsterdam`, `icsHref`, `googleCalendarHref`).
- `studio/` — Sanity Studio (v5). Deskstructuur in `sanity.config.ts`:
  singletons (Homepage, De Boerderij, Over Ons, Contact, Fotogalerij,
  Site-instellingen) zijn niet aan te maken/verwijderen; documentnieuws en
  agenda zijn lijsten. Schema-helper `schemas/lib.ts` (`imageField`) geeft
  elk afbeeldingsveld hotspot + alt-veld — gebruik die voor nieuwe velden.
  **Na elke schemawijziging opnieuw deployen** (`npm run deploy` in
  `studio/`), anders werkt de gehoste Studio met het oude schema.
  **Nieuw documenttype?** Voeg het ook toe aan het filter van de webhook
  "GitHub Pages rebuild" (sanity.io/manage → API → Webhooks). Dat filter is
  een vaste `_type in [...]`-lijst; zonder het type komt een publicatie pas
  bij de dagelijkse rebuild live. Zo ging het eerst met `privacyPage`.
- De fotogalerij is een eigen document (`fotoGalerij`, id `fotoGalerij`);
  de homepage leest alléén daaruit. (Het verouderde veld
  `homePage.galleryImages` is op 10 juli 2026 geleegd en uit het schema
  verwijderd.)
- Studio-conventies (`studio/schemas/lib.ts`): `ctaFields()` en
  `seoFields()` voor het "Kom langs"-blok en Google-titel/-beschrijving
  (de site leest `seoTitle`/`seoDescription` met fallback),
  `withPlaceholderWarnings` (in `schemas/index.ts`) op alle paginateksten,
  `imageField({ recommended })` voor een niet-blokkerende foto-waarschuwing.
  Gebruik **groepen** zodra een document meer dan ~8 velden heeft, en wijs
  dan élk veld een groep toe (een `default`-groep verbergt velden zonder
  groep). Vervangen velden: `deprecated` + `readOnly` + verborgen als ze
  leeg zijn, i.p.v. verwijderen (geen dataverlies). `SITE_URL` in
  `sanity.config.ts` bij de domeinomzetting aanpassen.
- Eén bron voor praktische gegevens: adres, eigenaren, openingstijden,
  telefoon en e-mail komen uit Site-instellingen (`useSiteSettings`);
  de Contact-velden daarvoor zijn verouderd.
- Evenementen hebben `date` (begin) + `endDate`; het oude `timeRange` is
  alleen nog terugval (`eventTimeLabel`, `getEventTimes`). Filter
  "voorbij" altijd op `eventLastDate(e)` / `coalesce(endDate, date)`.
- `AppAnnouncement`: tijdelijke mededeling bovenaan; zet `has-announcement`
  op `<html>`, waardoor `--nav-height` (= `--nav-base` + balk) groeit en
  alle offsets meeschuiven. Reken dus altijd met `--nav-height`, nooit
  met een vaste 72px.
- `scripts/generate-sitemap.mjs` draait als onderdeel van `npm run build`
  en schrijft sitemap.xml + robots.txt op basis van de echt geprerenderde
  routes (site-URL uit `NUXT_PUBLIC_SITE_URL`).
- `scripts/eenmalig/` — afgeronde seed-/migratiescripts; alleen ter naslag.
- `plugins/reveal.ts` — `v-reveal`-directive voor scroll-reveals
  (optionele waarde = vertraging in ms; slaat elementen over die al in beeld
  zijn en respecteert reduced-motion).
- `assets/css/` — globaal geladen (volgorde in `nuxt.config.ts`):
  `style.css` (tokens + home + nav/footer/modal), **`components.css`**
  (gedeelde UI-patronen, zie Designsysteem), `page-header.css`,
  `page-shared.css` (over-ons + de-boerderij patronen, CTA-blok, lege
  staat), rest per pagina — paginabestanden bevatten alleen nog wat écht
  paginaspecifiek is.
  **Alle CSS is globaal** — geef nieuwe selectors unieke, paginaspecifieke
  prefixes en definieer nooit dezelfde class in twee bestanden (dat was de
  `.page-header`-bug: laadvolgorde bepaalde stilletjes de styling).

## Designsysteem (bewaken!)

Identiteit: donkergroen `#364838`, lichtgroen `#658457`, accentgroen
`#d1f2c2`, geel `#f6c204`, Playfair Display (koppen, 400/700/900 + italic)
en Source Sans 3 (body, 400/600/700 + italic 400/600), self-hosted via @fontsource —
**geen Google Fonts-links terugzetten** en geen gewichten gebruiken die niet
in `nuxt.config.ts` geladen worden (geeft faux bold).

Tokens in `:root` (`style.css`) — bouw hierop, geen losse px-waarden:
- Fluid type: `--text-xs` t/m `--text-hero` (clamp-schaal)
- Spacing: `--space-1` t/m `--space-24`
- Layout: `--page-pad` (fluid zijmarge; capt via een `max()`-term de
  content op schermen breder dan ~1520px op `--container-max` (1280px).
  Het percentage in die term klopt alleen als horizontale padding op
  full-bleed secties — gebruik het token nergens anders voor),
  `--section-pad`, `--nav-height`, `--container-max`, `--sticky-top`
- **Eén raster**: links uitgelijnde layouts (grids, intro-splits,
  detailpagina's, contact) volgen allemaal `--page-pad`, zodat ze op
  dezelfde linkerrand staan als homepage, nav en footer — geen eigen
  `max-width: 1100px` e.d. Gecentreerde composities kiezen één van
  `--container-text` (760), `--container-mid` (960) of
  `--container-narrow` (600).
- Vorm: `--radius-*` (`--radius-card` = 16px voor alle UI-kaarten),
  `--shadow-*`, `--shadow-card-hover` + `--lift-card-hover` (overal
  dezelfde kaart-hover), `--overlay-hero`/`-header`/`-card` (foto-overlays,
  alle in het merkgroen).
- **Hoekig vs. rond** (bewust): de foto-collage op de homepage (diensten-
  en kaartfoto's met overlappende tekstblokken) is hoekig, zoals in het
  Webflow-origineel. Alle UI-kaarten (info-, nieuws-, waardenkaarten)
  zijn `--radius-card`, knoppen pill-vormig.
- Kleur-extra's: `--surface-soft` (zachte groene sectie-achtergrond),
  `--error`/`--error-bg` (formulierfouten)
- **Contrast**: lichtgroen `#658457` haalt met wit maar 4,2:1 (onder AA).
  Gebruik voor kleine groene tekst `--green-text` en als knopvlak met
  witte tekst `--green-button`; `--green-light` alleen voor vlakken,
  iconen en grote tekst. Nieuwe kleurcombinaties narekenen (axe doet het
  in de viewport-check).
- **Focus**: één ring via `--focus-ring` + de globale `:focus-visible`-regel
  in `style.css`. Op een nieuwe donkere container zet je alleen
  `--focus-ring: var(--white)` in diens eigen regel; nooit een losse
  outline-kleur per component (zo was de ring van `.btn-green` wit, dus
  onzichtbaar op licht).
- **Landmarks**: `layouts/default.vue` levert de enige `<main>` (+ skip-link,
  route-aankondiging, focus na navigatie). Pagina's gebruiken dus géén
  eigen `<main>`; alleen `error.vue` (rendert buiten de layout).

Gedeelde componenten in `components.css` — **gebruik deze, maak geen
paginakopie**: `.display-title` (+`--on-dark`; de h1 van elke subpagina),
`.subsection-title`, `.section-label--sm`, `.list-heading`, `.stack`
(verticale gap + automatische label→titel-afstand; vervangt negatieve
marges), `.btn-outline` (+`--on-dark`), `.btn-sm`, `.link-arrow`
(+`--on-dark`), `.breadcrumb`, `.date-tile`, `.info-card`
(+`--reflow` voor tablet), `.sidebar-layout`, `.detail-hero*`, `.prose`
(+ `.prose-quote`/`.prose-figure` voor Portable Text), `.status-page`.
Let op specificiteit: `components.css` laadt ná `style.css`; een
homepage-verfijning op zo'n component heeft een dubbele class nodig
(zie `.info-card.upcoming-card`).

Conventies: sectielabels zijn uppercase met `letter-spacing: 0.14em`
(`.section-label`, kies `dark-green` op licht en `bright-green` op donker —
let op contrast!); display-koppen krijgen `letter-spacing: -0.02em` en
`text-wrap: balance`; breakpoints zijn 479/767/991/1180 max-width; tap
targets minimaal ~44px op mobiel.

## Verificatie (de lat ligt hier)

`scripts/viewport-check.mjs` draait met Playwright (lokaal beschikbaar via
`npx playwright`) tegen een draaiende serve op :4173:

```powershell
# PowerShell (Git Bash verhaspelt de routes naar Windows-paden!)
$env:ROUTES = "/,/agenda,/nieuws,/contact,/over-ons,/de-boerderij,/bedankt,/privacy"
node scripts/viewport-check.mjs          # overflow 6 breedtes + axe (WCAG AA) op 375/1440
$env:SHOTS = "1"; node scripts/viewport-check.mjs   # + full-page screenshots (→ %TEMP%\desingel-shots, of SHOT_DIR)
```

Axe-bevindingen van ernst serious/critical laten het script falen
(`$env:AXE = "0"` slaat axe over). De Google Maps-iframe is uitgesloten.

Bij frontend-wijzigingen minimaal: build groen → overflow-check → screenshots
op 375/1440 bekijken (Read op de PNG's) → toetsenbord-walkthrough voor
interactieve elementen (menu, lightbox, formulier: Tab/Escape/pijltjes).
Het script zet `reducedMotion: 'reduce'` zodat scroll-reveals screenshots
niet verstoren. Let op bij eigen Playwright-checks onder reduced motion: de
globale guard geeft élke property een transitie van 0,01ms, dus lees
berekende stijlen (bv. outline-kleur na focus) pas een frame later uit.

## Werkwijze

- Superpowers-flow aanhouden: brainstorm → spec (`docs/superpowers/specs/`) →
  plan (`docs/superpowers/plans/`) → uitvoeren met verificatie per taak →
  afronden via finishing-a-development-branch (Jeroen kiest merge/PR).
- Commits in het Nederlands, met het **waarom** in de body; frequente, kleine
  commits per afgeronde taak.
- Jeroen waardeert: zelf doorpakken, grondig verifiëren vóór claims, en
  gevonden nevenproblemen benoemen (de onbereikbare nieuwsartikelen vonden we
  ook "en passant" — dat soort vondsten altijd melden en meenemen).

## Status & openstaande punten (21 oktober 2026)

- **Verbetervoorstel oktober 2026 uitgevoerd en live** (#5–#10): build
  faalt bij Sanity-storing, NL-tijdzone, agenda zonder verlopen
  evenementen + dagelijkse rebuild, WCAG AA (axe 0 bevindingen),
  "Binnenkort"-blok, contact/route/agenda-knoppen, één raster +
  `components.css`, Nederlandse Studio met groepen/archief/waarschuwingen,
  eindtijd bij evenementen (data gemigreerd), mededelingsbalk, typegen,
  Vitest, ESLint, CI op PR's (incl. Studio-job), CSP. Plan:
  `~/.claude/plans/analyseer-de-hele-applicatie-structured-pine.md`.
- **CI-les**: lokaal (Node 24) schrijft npm 11 een lockfile die npm 10 in
  CI (Node 22) kan weigeren. Na een lockfile-wijziging ook
  `npx -y npm@10 ci --dry-run --ignore-scripts` draaien. De PR-check vangt
  het nu, maar alleen als je via een PR werkt.
- **Cookiebanner + privacyverklaring + statistiek** (21 oktober): Maps pas
  na toestemming, `/privacy` vanuit het CMS, en Umami Cloud klaar in de code.
  Umami staat **uit** tot de repo-variabele `UMAMI_WEBSITE_ID` gezet is
  (stappen in `NOG-TE-DOEN.md`).
- **Nog open**: Umami-account aanmaken en het eigen domein (zie `NOG-TE-DOEN.md`).

### Eerder (13 juli 2026)

- **Migratie afgerond**: site live op GitHub Pages, Studio gehost op
  desingel.sanity.studio, Web3Forms werkt, Sanity-publish triggert een
  rebuild, oude galerijdata opgeruimd. Details en beheersleutels in
  `NOG-TE-DOEN.md`.
- **Verbeterplan uitgevoerd** (`docs/verbeterplan-2026-07.md`, zie de
  statuskop daarin): SEO-infra (sitemap/robots/JSON-LD), typecheck in CI,
  alle paginateksten CMS-bewerkbaar, CSS-hygiëne + a11y, Studio-validaties.
  Bewust uitgesteld: de optionele InfoCard-/Icon-componenten; de
  px→token-migratie (plan-punt 20) is voor de homepage inmiddels gedaan
  (spacing-sweep 10 juli), de overige pagina's nog niet.
- **Spacing-sweep homepage** (10 juli): hero/intro/services/galerij volgen
  overal `--page-pad` en de `--space-*`-tokens; content capt op 1280px.
- **CI gemoderniseerd** (13 juli): alle GitHub Actions op hun
  Node 24-releases, build op Node 22 (LTS tot april 2027).
- **Nog open** (zie `NOG-TE-DOEN.md`): eigen domein omzetten (DNS wijst
  nog naar de oude Webflow-site) en periodiek dependency-beheer (npm
  audit-findings wachten op een upstream Sanity-release; majors bewust
  uitgesteld).
- **Content**: de placeholderteksten zijn op 21 oktober 2026 vervangen
  door voorbeeldteksten (Webflow-origineel + terugvalteksten). Nieuwe
  placeholders: invullen in de Studio (die waarschuwt), niet in code
  "fixen" — de code-fallbacks zijn wél echte teksten.
