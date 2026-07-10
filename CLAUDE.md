# Belevenisboerderij De Singel — projectinstructies

Website voor een belevenisboerderij in de Achterhoek (Victor & Mari Duurland).
Nuxt 4 + Sanity CMS, volledig statisch gegenereerd (`nuxt generate`), gehost op
GitHub Pages. Alle content en teksten zijn **Nederlands**; communiceer met
Jeroen ook in het Nederlands.

## Commando's

```bash
npm run dev                      # dev-server
npm run build                    # nuxt generate + sitemap.xml/robots.txt → .output/public (DE verificatie)
npm run typecheck                # vue-tsc via nuxt typecheck (draait ook in CI vóór de deploy)
npx serve -l 4173 .output/public # gebouwde site lokaal serveren
npm run viewport-check           # Playwright: overflow-check + screenshots (zie Verificatie)
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
- **Hydration-mismatch-warning in de console is bekend en geaccepteerd**: SSR
  rendert mét data, de client hydrateert kort zonder (non-awaited queries).
  Visueel onzichtbaar. Niet "fixen" door overal `await` toe te voegen zonder
  de flash-afweging opnieuw te maken (zie commit 860184d).
- **GitHub Pages draait onder `/desingel/`**: de workflow zet
  `NUXT_APP_BASE_URL` en `NUXT_PUBLIC_SITE_URL` tijdens de build. Hardcode
  nooit absolute paden (`/images/...`) in templates of head-config; gebruik
  `~/assets/...` (Vite verwerkt baseURL) of `config.public.siteUrl`.

## Architectuur

- `pages/` — index, agenda, contact, de-boerderij, over-ons, bedankt,
  `nieuws/index` + `nieuws/[slug]`, `evenement/[slug]`; `error.vue` in de root.
- `components/` — `AppNav` (focus-trap, escape, sluit bij navigatie;
  logo-tekst uit `siteSettings.siteName`), `AppFooter` (incl. site-brede
  LocalBusiness-JSON-LD), `AppLightbox` (pijltjes/swipe/focus-trap/teller),
  `PageHeader` (dé paginakop; props label/title/subtitle/image — image is
  een Sanity-afbeelding als achtergrond met gradient-overlay),
  `CtaBlock` (het "Kom langs"-blok; styling `.cta-block*` in page-shared).
- `composables/` — `useImageUrl` (ruwe Sanity image-builder),
  `useSanityImg` (**gebruik deze voor elke afbeelding**: levert
  src/srcset/sizes/width/height met WebP via `auto=format`; mét `aspect`
  snijdt Sanity server-side rond de hotspot, zónder `aspect` komt de hotspot
  terug als inline `object-position`-style die de CSS-fallback overridet —
  redacteuren sturen de uitsnede dus via "Edit hotspot" in Studio),
  `useSeo` (title/description/canonical/OG per pagina; accepteert getters;
  `type: 'article'` + `publishedTime` voor artikelen), `useJsonLd`
  (structured data), `useDateFormat` (alle nl-NL-datumformattering),
  `usePortableTextComponents` (gedeelde body-afbeelding-renderer).
- `studio/` — Sanity Studio (v5). Deskstructuur in `sanity.config.ts`:
  singletons (Homepage, De Boerderij, Over Ons, Contact, Fotogalerij,
  Site-instellingen) zijn niet aan te maken/verwijderen; documentnieuws en
  agenda zijn lijsten. Schema-helper `schemas/lib.ts` (`imageField`) geeft
  elk afbeeldingsveld hotspot + alt-veld — gebruik die voor nieuwe velden.
  **Na elke schemawijziging opnieuw deployen** (`npm run deploy` in
  `studio/`), anders werkt de gehoste Studio met het oude schema.
- De fotogalerij is een eigen document (`fotoGalerij`, id `fotoGalerij`);
  de homepage leest alléén daaruit. Het verouderde verborgen veld
  `homePage.galleryImages` bevat nog data — opruimscript staat klaar
  (zie NOG-TE-DOEN).
- `scripts/generate-sitemap.mjs` draait als onderdeel van `npm run build`
  en schrijft sitemap.xml + robots.txt op basis van de echt geprerenderde
  routes (site-URL uit `NUXT_PUBLIC_SITE_URL`).
- `scripts/eenmalig/` — afgeronde seed-/migratiescripts; alleen ter naslag.
- `plugins/reveal.ts` — `v-reveal`-directive voor scroll-reveals
  (optionele waarde = vertraging in ms; slaat elementen over die al in beeld
  zijn en respecteert reduced-motion).
- `assets/css/` — globaal geladen (volgorde in `nuxt.config.ts`):
  `style.css` (tokens + home + nav/footer/modal), `page-header.css`,
  `page-shared.css` (over-ons + de-boerderij patronen), rest per pagina.
  **Alle CSS is globaal** — geef nieuwe selectors unieke, paginaspecifieke
  prefixes en definieer nooit dezelfde class in twee bestanden (dat was de
  `.page-header`-bug: laadvolgorde bepaalde stilletjes de styling).

## Designsysteem (bewaken!)

Identiteit: donkergroen `#364838`, lichtgroen `#658457`, accentgroen
`#d1f2c2`, geel `#f6c204`, Playfair Display (koppen, 400/700/900 + italic)
en Source Sans 3 (body, 400/600/700), self-hosted via @fontsource —
**geen Google Fonts-links terugzetten** en geen gewichten gebruiken die niet
in `nuxt.config.ts` geladen worden (geeft faux bold).

Tokens in `:root` (`style.css`) — bouw hierop, geen losse px-waarden:
- Fluid type: `--text-xs` t/m `--text-hero` (clamp-schaal)
- Spacing: `--space-1` t/m `--space-24`
- Layout: `--page-pad` (fluid zijmarge), `--section-pad`, `--nav-height`,
  `--container-max`
- Vorm: `--radius-*`, `--shadow-*`
- Kleur-extra's: `--surface-soft` (zachte groene sectie-achtergrond),
  `--error`/`--error-bg` (formulierfouten)

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
$env:ROUTES = "/,/agenda,/nieuws,/contact,/over-ons,/de-boerderij,/bedankt"
node scripts/viewport-check.mjs          # overflow-check 6 breedtes per route
$env:SHOTS = "1"; node scripts/viewport-check.mjs   # + full-page screenshots
```

Bij frontend-wijzigingen minimaal: build groen → overflow-check → screenshots
op 375/1440 bekijken (Read op de PNG's) → toetsenbord-walkthrough voor
interactieve elementen (menu, lightbox, formulier: Tab/Escape/pijltjes).
Het script zet `reducedMotion: 'reduce'` zodat scroll-reveals screenshots
niet verstoren.

## Werkwijze

- Superpowers-flow aanhouden: brainstorm → spec (`docs/superpowers/specs/`) →
  plan (`docs/superpowers/plans/`) → uitvoeren met verificatie per taak →
  afronden via finishing-a-development-branch (Jeroen kiest merge/PR).
- Commits in het Nederlands, met het **waarom** in de body; frequente, kleine
  commits per afgeronde taak.
- Jeroen waardeert: zelf doorpakken, grondig verifiëren vóór claims, en
  gevonden nevenproblemen benoemen (de onbereikbare nieuwsartikelen vonden we
  ook "en passant" — dat soort vondsten altijd melden en meenemen).

## Status & openstaande punten (10 juli 2026)

- **Migratie afgerond**: site live op GitHub Pages, Studio gehost op
  desingel.sanity.studio, Web3Forms werkt, Sanity-publish triggert een
  rebuild. Details en beheersleutels in `NOG-TE-DOEN.md`.
- **Verbeterplan uitgevoerd** (`docs/verbeterplan-2026-07.md`, zie de
  statuskop daarin): SEO-infra (sitemap/robots/JSON-LD), typecheck in CI,
  alle paginateksten CMS-bewerkbaar, CSS-hygiëne + a11y, Studio-validaties.
  Bewust uitgesteld: volledige px→token-migratie (plan-punt 20) en de
  optionele InfoCard-/Icon-componenten.
- **Nog open** (zie `NOG-TE-DOEN.md`): eigen domein omzetten (DNS wijst
  nog naar de oude Webflow-site) en de oude galerijdata unsetten
  (script staat klaar in `scripts/eenmalig/`).
