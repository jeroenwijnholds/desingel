# Design: SEO- en GEO-optimalisatie

**Datum:** 2026-07-20
**Status:** Approved

---

## Context

De site heeft al een werkende SEO-basis (`useSeo`, `useJsonLd`, een sitemap/robots-generator die uit de echte build-output leest, JSON-LD voor `LocalBusiness`, `NewsArticle` en `Event`). Deze ronde verrijkt die basis, met het oog op zowel klassieke zoekmachine-SEO als "GEO" (geschiktheid voor AI-antwoordmachines zoals ChatGPT/Perplexity/Google AI Overviews om de site correct te citeren).

Niet in scope: FAQ-schema (geen FAQ-content om aan te haken), `WebSite`/`SearchAction` (geen sitewide zoekfunctie), hreflang (single-locale nl-NL).

---

## 1. LocalBusiness-verrijking (schema-uitbreiding)

Nieuwe, optionele velden op `studio/schemas/siteSettings.ts`:

- `telephone` (string)
- `socialLinks` (array van `{platform: string, url: string}`) → gemapt naar `sameAs` in JSON-LD (array van URL's)
- `openingHours` (array van objecten `{dayOfWeek: string[], opens: string, closes: string}`) → gemapt naar `openingHoursSpecification`

Dit blijft losstaand van `contactPage.infoHours` (de vrije weergavetekst op de contactpagina) — zelfde patroon als nu al bestaat tussen `siteSettings.address` (bron voor JSON-LD/footer) en `contactPage.infoAddress` (vrije weergavetekst op de contactpagina).

`components/AppFooter.vue` breidt de bestaande `LocalBusiness`-JSON-LD uit met deze velden, conditioneel (alleen toevoegen als ingevuld — zelfde `...(x ? {...} : {})`-patroon als `address`/`coordinates` nu al gebruiken). Ook `@id` (= `config.public.siteUrl`) en `image` (og-default.jpg of een echte gevelfoto, indien beschikbaar) toevoegen voor een completere entiteit.

**Contentbeslissing:** `telephone` en `socialLinks` worden **niet** gevuld met verzonnen data in de live Sanity-dataset. Een placeholder-kop ("Diensten titel") is onschuldige nep-copy die een bezoeker meteen als placeholder herkent; een verzonnen telefoonnummer in machineleesbare structured data is dat niet — een zoekmachine of AI-assistent kan het als feit doorgeven aan een echte klant. De velden komen dus leeg binnen; JSON-LD laat ze vanzelf weg zolang ze niet zijn ingevuld. `NOG-TE-DOEN.md` krijgt een aantekening dat Victor/Mari deze velden invullen in de Studio zodra de gegevens er zijn — zelfde behandeling als de bestaande homepage-placeholderteksten.

`openingHours` wordt **wel** gevuld, met de waarde die al consistent in de content voorkomt: zaterdag & zondag, 10:00–17:00 (farmshop).

Organization-logo voor JSON-LD: bestaande `public/icon-512.png` (512×512).

## 2. BreadcrumbList JSON-LD

Nieuwe shared helper (bv. `composables/useBreadcrumbJsonLd.ts`, bovenop de bestaande `useJsonLd`) die op subpagina's (`nieuws/[slug]`, `evenement/[slug]`, en overige pagina's t.o.v. home) een `BreadcrumbList` toevoegt. Puur uit al beschikbare route/title-data (paginatitel + statische hiërarchie), geen CMS-wijziging nodig.

## 3. NewsArticle-verrijking

`pages/nieuws/[slug].vue`: query uitbreiden met Sanity's ingebouwde `_updatedAt`, en dat doorgeven als `dateModified` in de bestaande `useJsonLd`-call. `publisher.logo` toevoegen (`icon-512.png` als `ImageObject` met breedte/hoogte).

## 4. Sitemap: `<lastmod>`

`scripts/generate-sitemap.mjs` haalt momenteel geen Sanity-data op — het leest alleen de gegenereerde HTML-bestanden om de routelijst te bepalen. Dat blijft zo, maar het script krijgt er een stap bij: per route de bijbehorende Sanity-document-`_updatedAt` ophalen via de publieke Sanity CDN read-API (`https://<project>.apicdn.sanity.io/v2024-01-01/data/query/<dataset>?query=...`, dezelfde API-versie als `nuxt.config.ts` al gebruikt; geen auth nodig — de dataset is publiek leesbaar) en als `<lastmod>` in de sitemap zetten. Statische singleton-pagina's (home, boerderij, over-ons, contact, agenda-index) gebruiken de `_updatedAt` van hun singleton-document; content-routes (nieuws-artikel, evenement) die van hun eigen document. Als de fetch om wat voor reden ook faalt (netwerk, env-vars ontbreken), valt het script terug op geen `<lastmod>` voor die route (nooit een gegokte datum) en logt het een waarschuwing — de build mag hier nooit op falen.

## 5. `llms.txt` (GEO)

Nieuw statisch bestand `public/llms.txt`, volgens de opkomende llms.txt-conventie (platte tekst, Markdown-achtig, korte samenvatting + links naar belangrijkste pagina's). Inhoud: wie is Belevenisboerderij de Singel, wat bieden ze (farmshop, boerderij op locatie, Wagyu, loopvogels), locatie (Achterhoek), openingstijden farmshop, links naar `/de-boerderij`, `/over-ons`, `/agenda`, `/contact`, `/nieuws`. Alleen bestaande, al gepubliceerde content — geen nieuwe verzonnen feiten. Statisch bestand, geen Sanity-koppeling (te weinig toegevoegde waarde voor de complexiteit van een dynamische generator, en de content verandert zelden).

---

## Verificatie

- `npm run build` (genereert site + sitemap + robots + llms.txt landt automatisch mee als static asset)
- Handmatige inspectie van de gegenereerde JSON-LD (`.output/public/**/index.html` doorzoeken op `application/ld+json`) en van `sitemap.xml`/`llms.txt` in `.output/public`
- `npm run typecheck`
- Sanity-schemawijziging lokaal testen (`npx sanity dev` in `studio/` of gewoon het gegenereerde schema-bestand nalezen) vóór `npm run deploy` in `studio/`
- Geen automatische testsuite in dit project (bestaande conventie) — build-and-inspect is de verificatiestandaard
