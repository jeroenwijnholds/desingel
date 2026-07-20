# SEO/GEO-optimalisatie Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** LocalBusiness/Article/Breadcrumb JSON-LD verrijken, een echte `<lastmod>` in de sitemap en een `llms.txt` toevoegen, zodat de site beter te begrijpen is voor zoekmachines én AI-antwoordmachines (GEO).

**Architecture:** Bovenop de bestaande `useSeo`/`useJsonLd`-composables en de build-time `scripts/generate-sitemap.mjs`. Eén nieuwe Sanity-schemauitbreiding (`siteSettings`: telefoon/social/openingstijden), één nieuwe composable (`useBreadcrumbJsonLd`), en gerichte uitbreidingen van bestaande JSON-LD-blokken. Geen nieuwe dependencies.

**Tech Stack:** Nuxt 4 (`nuxt generate`), `@nuxtjs/sanity`, Sanity Studio v5, plain Node ESM-script (`generate-sitemap.mjs`) met de globale `fetch` (Node 22).

## Global Constraints

- Werk op een feature-branch (`feature/seo-geo-optimalisatie`, aanmaken vanaf `master` vóór Task 1). Nooit direct commits op `master` — elke push naar master deployt automatisch naar de live site.
- Geen geautomatiseerde testsuite in dit project — elke taak wordt geverifieerd met `npm run build` + `npm run typecheck` + handmatige inspectie van de gegenereerde output (`.output/public`). Introduceer geen testframework.
- Alle nieuwe/gewijzigde CMS-labels en gebruikersgerichte tekst zijn Nederlands.
- `telephone` en `socialLinks` op `siteSettings` blijven **leeg in de live (productie-)dataset** — dit zijn machineleesbare feiten (structured data), geen cosmetische placeholder-copy; een verzonnen telefoonnummer kan door Google/een AI-assistent als feit aan een echte klant worden doorgegeven. `openingHours` wordt wél gevuld, met de waarde die al overal consistent in de content staat (za & zo, 10:00–17:00).
- **Task 6** (data-patch) en een eventuele Studio-deploy (`npm run deploy` in `studio/`, buiten dit plan — zie Task 1) muteren gedeelde/live infrastructuur. Vraag expliciet aan Jeroen om bevestiging vlak voordat je deze uitvoert, ook al is dit plan al goedgekeurd.
- Commands hieronder zijn geschreven voor Git Bash (zoals gebruikt in deze sessie); pas aan naar PowerShell-syntax als je daar werkt.

---

## File Structure

- **Modify** `studio/schemas/siteSettings.ts` — nieuwe velden `telephone`, `socialLinks`, `openingHours`.
- **Modify** `components/AppFooter.vue` — query + JSON-LD uitbreiden met de nieuwe velden, plus `@id`/`image`.
- **Create** `composables/useBreadcrumbJsonLd.ts` — herbruikbare `BreadcrumbList`-helper bovenop `useJsonLd`.
- **Modify** `pages/de-boerderij.vue`, `pages/over-ons.vue`, `pages/contact.vue`, `pages/agenda.vue`, `pages/nieuws/index.vue` — één `useBreadcrumbJsonLd(...)`-call per pagina.
- **Modify** `pages/nieuws/[slug].vue` — breadcrumb (reactief) + `_updatedAt` → `dateModified` + `publisher.logo`.
- **Modify** `pages/evenement/[slug].vue` — breadcrumb (reactief).
- **Modify** `scripts/generate-sitemap.mjs` — `<lastmod>` per route via Sanity CDN-API, plus `llms.txt`-generatie.
- **Create** `scripts/eenmalig/set-opening-hours.mjs` — eenmalige data-patch (openingHours) op het live `siteSettings`-document.
- **Modify** `NOG-TE-DOEN.md` — open punt: telefoon/social invullen in de Studio.

---

### Task 1: Sanity-schema — telefoon, social-links en structured-data-openingstijden

**Files:**
- Modify: `studio/schemas/siteSettings.ts`

**Interfaces:**
- Consumes: niets (schemawijziging, geen codeafhankelijkheden).
- Produces: drie nieuwe Sanity-velden op het `siteSettings`-document — `telephone: string`, `socialLinks: {platform: string, url: string}[]`, `openingHours: {days: string[], opens: string, closes: string}[]` (dag-sleutels: `monday`…`sunday`). Task 2 leest deze exacte veldnamen/vormen.

- [ ] **Step 1: Maak de feature-branch**

```bash
git checkout master && git pull --ff-only
git checkout -b feature/seo-geo-optimalisatie
```

Expected: `Switched to a new branch 'feature/seo-geo-optimalisatie'`

- [ ] **Step 2: Voeg de drie nieuwe velden toe aan `siteSettings.ts`**

In `studio/schemas/siteSettings.ts`, vervang:

```ts
    // farmshopHours en responseTime zijn verwijderd: de site las ze nooit —
    // de contactpagina gebruikt contactPage.infoHours / infoResponseTime.
    defineField({
      name: 'footerCopyright',
      title: 'Copyright-tekst (footer)',
      type: 'string',
    }),
```

door:

```ts
    // farmshopHours en responseTime zijn verwijderd: de site las ze nooit —
    // de contactpagina gebruikt contactPage.infoHours / infoResponseTime.
    defineField({
      name: 'telephone',
      title: 'Telefoonnummer',
      type: 'string',
      description:
        'Internationaal formaat, bijv. +31 6 12345678. Leeg laten totdat dit bekend is — ' +
        'structured data (Google/AI-assistenten) mag nooit een verzonnen telefoonnummer bevatten.',
    }),
    defineField({
      name: 'socialLinks',
      title: 'Social-media links',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'platform',
              title: 'Platform',
              type: 'string',
              options: { list: ['Instagram', 'Facebook', 'TikTok', 'YouTube', 'LinkedIn'] },
              validation: Rule => Rule.required(),
            }),
            defineField({ name: 'url', title: 'URL', type: 'url', validation: Rule => Rule.required() }),
          ],
          preview: { select: { title: 'platform', subtitle: 'url' } },
        },
      ],
    }),
    defineField({
      name: 'openingHours',
      title: 'Openingstijden (structured data)',
      description:
        'Machineleesbare openingstijden voor Google en AI-assistenten. Voor de weergavetekst ' +
        'op de contactpagina: zie het veld "Openingstijden farmshop" op de Contact-pagina.',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'days',
              title: 'Dagen',
              type: 'array',
              of: [{ type: 'string' }],
              options: {
                list: [
                  { title: 'Maandag', value: 'monday' },
                  { title: 'Dinsdag', value: 'tuesday' },
                  { title: 'Woensdag', value: 'wednesday' },
                  { title: 'Donderdag', value: 'thursday' },
                  { title: 'Vrijdag', value: 'friday' },
                  { title: 'Zaterdag', value: 'saturday' },
                  { title: 'Zondag', value: 'sunday' },
                ],
              },
              validation: Rule => Rule.required().min(1),
            }),
            defineField({ name: 'opens', title: 'Open vanaf (HH:mm)', type: 'string', validation: Rule => Rule.required() }),
            defineField({ name: 'closes', title: 'Open tot (HH:mm)', type: 'string', validation: Rule => Rule.required() }),
          ],
          preview: {
            select: { days: 'days', opens: 'opens', closes: 'closes' },
            prepare: ({ days, opens, closes }: { days?: string[]; opens?: string; closes?: string }) => ({
              title: `${(days ?? []).join(', ')} · ${opens ?? '?'}–${closes ?? '?'}`,
            }),
          },
        },
      ],
    }),
    defineField({
      name: 'footerCopyright',
      title: 'Copyright-tekst (footer)',
      type: 'string',
    }),
```

- [ ] **Step 3: Verifieer dat de Studio nog compileert**

```bash
cd studio && npm run build
```

Expected: eindigt met `✓ Studio built` (of gelijkwaardige success-melding), geen TypeScript-fouten over de nieuwe velden.

- [ ] **Step 4: Commit**

```bash
git add studio/schemas/siteSettings.ts
git commit -m "$(cat <<'EOF'
feat: telefoon, social-links en structured-data-openingstijden in Sanity-schema

Nodig voor de LocalBusiness JSON-LD-verrijking (telephone/sameAs/
openingHoursSpecification). Telefoon en social blijven leeg totdat de
echte gegevens bekend zijn — verzonnen structured data kan als feit
aan een klant worden doorgegeven.
EOF
)"
```

---

### Task 2: LocalBusiness JSON-LD uitbreiden in AppFooter.vue

**Files:**
- Modify: `components/AppFooter.vue`

**Interfaces:**
- Consumes: `siteSettings.telephone`, `.socialLinks`, `.openingHours` (Task 1).
- Produces: niets dat latere taken direct consumeren — dit is een site-brede, zelfstandige verrijking.

- [ ] **Step 1: Vervang het script-blok**

Vervang het volledige `<script setup lang="ts">`-blok van `components/AppFooter.vue` door:

```vue
<script setup lang="ts">
const QUERY = `*[_type == "siteSettings"][0]{ siteName, tagline, footerCopyright, navigation, owners, address, coordinates, telephone, socialLinks, openingHours }`

interface NavItem { label: string; href: string; isButton: boolean }
interface Owner { name: string; role: string }
interface SocialLink { platform: string; url: string }
interface OpeningHoursRule { days: string[]; opens: string; closes: string }
interface SiteSettings {
  siteName: string
  tagline: string
  footerCopyright: string
  navigation: NavItem[]
  owners: Owner[]
  address: string
  coordinates?: { lat: number; lng: number }
  telephone?: string
  socialLinks?: SocialLink[]
  openingHours?: OpeningHoursRule[]
}

const { data } = useSanityQuery<SiteSettings>(QUERY)

const navLinks = computed(() => (data.value?.navigation ?? []).filter(n => !n.isButton))

const DAY_URI: Record<string, string> = {
  monday: 'https://schema.org/Monday',
  tuesday: 'https://schema.org/Tuesday',
  wednesday: 'https://schema.org/Wednesday',
  thursday: 'https://schema.org/Thursday',
  friday: 'https://schema.org/Friday',
  saturday: 'https://schema.org/Saturday',
  sunday: 'https://schema.org/Sunday',
}

// Structured data voor Google: de boerderij als lokaal bedrijf.
// De footer staat op elke pagina, dus dit staat site-breed één keer in de head.
const config = useRuntimeConfig()
useJsonLd(() => data.value
  ? {
      '@context': 'https://schema.org',
      '@type': 'LocalBusiness',
      '@id': config.public.siteUrl,
      name: data.value.siteName,
      description: data.value.tagline,
      url: config.public.siteUrl,
      image: `${config.public.siteUrl}/og-default.jpg`,
      ...(data.value.address
        ? { address: { '@type': 'PostalAddress', streetAddress: data.value.address.replace(/\n/g, ', '), addressCountry: 'NL' } }
        : {}),
      ...(data.value.coordinates
        ? { geo: { '@type': 'GeoCoordinates', latitude: data.value.coordinates.lat, longitude: data.value.coordinates.lng } }
        : {}),
      ...(data.value.telephone ? { telephone: data.value.telephone } : {}),
      ...(data.value.socialLinks?.length ? { sameAs: data.value.socialLinks.map(s => s.url) } : {}),
      ...(data.value.openingHours?.length
        ? {
            openingHoursSpecification: data.value.openingHours.map(rule => ({
              '@type': 'OpeningHoursSpecification',
              dayOfWeek: rule.days.map(d => DAY_URI[d]).filter(Boolean),
              opens: rule.opens,
              closes: rule.closes,
            })),
          }
        : {}),
    }
  : null)
</script>
```

Het `<template>`-blok blijft ongewijzigd.

- [ ] **Step 2: Typecheck en build**

```bash
npm run typecheck
npm run build
```

Expected: beide slagen zonder fouten.

- [ ] **Step 3: Inspecteer de gegenereerde JSON-LD**

```bash
node -e "
const html = require('fs').readFileSync('.output/public/index.html', 'utf8');
const m = html.match(/<script type=\"application\/ld\+json\">(.*?)<\/script>/s);
console.log(m ? JSON.parse(m[1]) : 'GEEN JSON-LD GEVONDEN');
"
```

Expected: een object met `"@type":"LocalBusiness"`, `"@id"` gelijk aan de site-URL, en een `image`-veld. `telephone`/`sameAs`/`openingHoursSpecification` ontbreken nog (verwacht — de Sanity-data is nog leeg; Task 6 vult `openingHours`).

- [ ] **Step 4: Commit**

```bash
git add components/AppFooter.vue
git commit -m "$(cat <<'EOF'
feat: LocalBusiness JSON-LD verrijken met telefoon, social en openingstijden

Voegt @id, image, telephone, sameAs en openingHoursSpecification toe
(conditioneel — alleen aanwezig als de Sanity-data is ingevuld), voor
betere herkenning door Google en AI-antwoordmachines.
EOF
)"
```

---

### Task 3: BreadcrumbList JSON-LD

**Files:**
- Create: `composables/useBreadcrumbJsonLd.ts`
- Modify: `pages/de-boerderij.vue`, `pages/over-ons.vue`, `pages/contact.vue`, `pages/agenda.vue`, `pages/nieuws/index.vue`, `pages/nieuws/[slug].vue`, `pages/evenement/[slug].vue`

**Interfaces:**
- Consumes: `useJsonLd` (bestaand, `composables/useJsonLd.ts`), `useRuntimeConfig().public.siteUrl` (bestaand).
- Produces: `useBreadcrumbJsonLd(items: MaybeRefOrGetter<{name: string, path: string}[] | null>): void` — aangeroepen door de zeven paginabestanden hieronder.

- [ ] **Step 1: Maak de composable**

Nieuw bestand `composables/useBreadcrumbJsonLd.ts`:

```ts
import type { MaybeRefOrGetter } from 'vue'

interface BreadcrumbItem {
  name: string
  /** Route-pad, bijv. '/nieuws' of '/nieuws/mijn-artikel' */
  path: string
}

/**
 * Voegt een BreadcrumbList JSON-LD-script toe. Bouwt voort op useJsonLd,
 * dus dezelfde SSG-garantie: bij een getter met reactieve data (detailpagina's)
 * staat de volledige breadcrumb al in de geprerenderde HTML.
 */
export function useBreadcrumbJsonLd(items: MaybeRefOrGetter<BreadcrumbItem[] | null>) {
  const config = useRuntimeConfig()
  const siteUrl = String(config.public.siteUrl || '').replace(/\/$/, '')

  useJsonLd(() => {
    const list = toValue(items)
    if (!list || !list.length) return null
    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: list.map((item, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: item.name,
        item: siteUrl + item.path,
      })),
    }
  })
}
```

- [ ] **Step 2: Wire de statische pagina's**

In elk van de volgende bestanden, voeg direct ná de bestaande `useSeo({...})`-call de bijbehorende regel toe:

`pages/de-boerderij.vue`:
```ts
useBreadcrumbJsonLd([
  { name: 'Home', path: '/' },
  { name: 'De Boerderij', path: '/de-boerderij' },
])
```

`pages/over-ons.vue`:
```ts
useBreadcrumbJsonLd([
  { name: 'Home', path: '/' },
  { name: 'Over Ons', path: '/over-ons' },
])
```

`pages/contact.vue`:
```ts
useBreadcrumbJsonLd([
  { name: 'Home', path: '/' },
  { name: 'Contact', path: '/contact' },
])
```

`pages/agenda.vue`:
```ts
useBreadcrumbJsonLd([
  { name: 'Home', path: '/' },
  { name: 'Agenda', path: '/agenda' },
])
```

`pages/nieuws/index.vue`:
```ts
useBreadcrumbJsonLd([
  { name: 'Home', path: '/' },
  { name: 'Nieuws', path: '/nieuws' },
])
```

- [ ] **Step 3: Wire de detailpagina's (reactief)**

`pages/nieuws/[slug].vue` — direct ná de bestaande `useSeo({...})`-call:
```ts
useBreadcrumbJsonLd(() => article.value
  ? [
      { name: 'Home', path: '/' },
      { name: 'Nieuws', path: '/nieuws' },
      { name: article.value.title, path: `/nieuws/${article.value.slug.current}` },
    ]
  : null)
```

`pages/evenement/[slug].vue` — direct ná de bestaande `useSeo({...})`-call:
```ts
useBreadcrumbJsonLd(() => event.value
  ? [
      { name: 'Home', path: '/' },
      { name: 'Agenda', path: '/agenda' },
      { name: event.value.title, path: `/evenement/${event.value.slug.current}` },
    ]
  : null)
```

- [ ] **Step 4: Typecheck en build**

```bash
npm run typecheck
npm run build
```

Expected: beide slagen zonder fouten.

- [ ] **Step 5: Inspecteer een statische en een detailpagina**

```bash
node -e "
const fs = require('fs');
for (const f of ['.output/public/de-boerderij/index.html', '.output/public/agenda/index.html']) {
  const html = fs.readFileSync(f, 'utf8');
  console.log(f, '->', html.includes('BreadcrumbList') ? 'BreadcrumbList aanwezig' : 'ONTBREEKT');
}
"
```

Expected: beide regels tonen `BreadcrumbList aanwezig`.

Controleer ook één artikel- of evenementpagina (vervang `<slug>` door een echte slug uit `.output/public/nieuws/` of `.output/public/evenement/`, bijv. `wagyu-kalveren-seizoen`):

```bash
node -e "
const html = require('fs').readFileSync('.output/public/nieuws/wagyu-kalveren-seizoen/index.html', 'utf8');
console.log(html.includes('BreadcrumbList') ? 'BreadcrumbList aanwezig' : 'ONTBREEKT');
"
```

Expected: `BreadcrumbList aanwezig`.

- [ ] **Step 6: Commit**

```bash
git add composables/useBreadcrumbJsonLd.ts pages/de-boerderij.vue pages/over-ons.vue pages/contact.vue pages/agenda.vue pages/nieuws/index.vue pages/nieuws/[slug].vue pages/evenement/[slug].vue
git commit -m "$(cat <<'EOF'
feat: BreadcrumbList JSON-LD op alle sub- en detailpagina's

Helpt zoekmachines en AI-antwoordmachines de sitehiërarchie en
paginacontext te begrijpen.
EOF
)"
```

---

### Task 4: NewsArticle — dateModified en publisher.logo

**Files:**
- Modify: `pages/nieuws/[slug].vue`

**Interfaces:**
- Consumes: Sanity's ingebouwde `_updatedAt`-veld (elk document heeft dit automatisch).
- Produces: niets dat andere taken consumeren.

- [ ] **Step 1: Breid de query en interface uit**

Vervang:

```ts
interface NieuwsArtikel {
  title: string
  slug: { current: string }
  category: string
  publishedAt: string
  author?: string
  excerpt: string
  readTime?: number
  featuredImage?: any
  body?: any[]
  relatedArticles?: RelatedArticle[]
}
```

door:

```ts
interface NieuwsArtikel {
  title: string
  slug: { current: string }
  category: string
  publishedAt: string
  _updatedAt: string
  author?: string
  excerpt: string
  readTime?: number
  featuredImage?: any
  body?: any[]
  relatedArticles?: RelatedArticle[]
}
```

En vervang:

```ts
const QUERY = `*[_type == "nieuwsArtikel" && slug.current == $slug && !(_id in path("drafts.**"))][0]{
  title, slug, category, publishedAt, author, excerpt, readTime, featuredImage, body,
  relatedArticles[]->{_id, title, slug, featuredImage}
}`
```

door:

```ts
const QUERY = `*[_type == "nieuwsArtikel" && slug.current == $slug && !(_id in path("drafts.**"))][0]{
  title, slug, category, publishedAt, _updatedAt, author, excerpt, readTime, featuredImage, body,
  relatedArticles[]->{_id, title, slug, featuredImage}
}`
```

- [ ] **Step 2: Breid de JSON-LD uit**

Vervang:

```ts
const config = useRuntimeConfig()
useJsonLd(() => article.value
  ? {
      '@context': 'https://schema.org',
      '@type': 'NewsArticle',
      headline: article.value.title,
      description: article.value.excerpt,
      datePublished: article.value.publishedAt,
      ...(article.value.featuredImage
        ? { image: [img(article.value.featuredImage, { widths: [1200], sizes: '1200px', aspect: 1200 / 630 }).src] }
        : {}),
      author: [
        article.value.author
          ? { '@type': 'Person', name: article.value.author }
          : { '@type': 'Organization', name: 'Belevenisboerderij de Singel' },
      ],
      publisher: { '@type': 'Organization', name: 'Belevenisboerderij de Singel', url: config.public.siteUrl },
    }
  : null)
```

door:

```ts
const config = useRuntimeConfig()
useJsonLd(() => article.value
  ? {
      '@context': 'https://schema.org',
      '@type': 'NewsArticle',
      headline: article.value.title,
      description: article.value.excerpt,
      datePublished: article.value.publishedAt,
      dateModified: article.value._updatedAt,
      ...(article.value.featuredImage
        ? { image: [img(article.value.featuredImage, { widths: [1200], sizes: '1200px', aspect: 1200 / 630 }).src] }
        : {}),
      author: [
        article.value.author
          ? { '@type': 'Person', name: article.value.author }
          : { '@type': 'Organization', name: 'Belevenisboerderij de Singel' },
      ],
      publisher: {
        '@type': 'Organization',
        name: 'Belevenisboerderij de Singel',
        url: config.public.siteUrl,
        logo: { '@type': 'ImageObject', url: `${config.public.siteUrl}/icon-512.png`, width: 512, height: 512 },
      },
    }
  : null)
```

- [ ] **Step 3: Typecheck en build**

```bash
npm run typecheck
npm run build
```

Expected: beide slagen zonder fouten.

- [ ] **Step 4: Inspecteer de gegenereerde JSON-LD van een artikel**

```bash
node -e "
const fs = require('fs');
const html = fs.readFileSync('.output/public/nieuws/wagyu-kalveren-seizoen/index.html', 'utf8');
const matches = [...html.matchAll(/<script type=\"application\/ld\+json\">(.*?)<\/script>/gs)];
const article = matches.map(m => JSON.parse(m[1])).find(j => j['@type'] === 'NewsArticle');
console.log(article);
"
```

Expected: object met `dateModified` (een ISO-datum) en `publisher.logo.url` eindigend op `/icon-512.png`.

- [ ] **Step 5: Commit**

```bash
git add "pages/nieuws/[slug].vue"
git commit -m "$(cat <<'EOF'
feat: dateModified en publisher.logo in NewsArticle JSON-LD

Geeft AI-antwoordmachines en Google een signaal van actualiteit
(dateModified) en een volwaardige publisher-entiteit (logo).
EOF
)"
```

---

### Task 5: Sitemap `<lastmod>` + `llms.txt`

**Files:**
- Modify: `scripts/generate-sitemap.mjs`

**Interfaces:**
- Consumes: `SANITY_PROJECT_ID`/`SANITY_DATASET` (uit `.env` lokaal of echte env vars in CI — zelfde bron als `nuxt.config.ts`), `NUXT_PUBLIC_SITE_URL` (bestaand).
- Produces: `.output/public/sitemap.xml` (met `<lastmod>` waar bekend), `.output/public/llms.txt` (nieuw).

**Let op — afwijking van de spec:** de spec noemt `public/llms.txt` als statisch bestand. Dat zou de site-URL hardcoded moeten bevatten, wat precies de valkuil is die `CLAUDE.md` beschrijft ("Hardcode nooit absolute paden... gebruik config.public.siteUrl") — bij de toekomstige domeinwissel (zie `NOG-TE-DOEN.md`) zou dat bestand stiekem verouderde links bevatten. Daarom wordt `llms.txt` hier, net als `sitemap.xml`/`robots.txt`, gegenereerd door `scripts/generate-sitemap.mjs` met de resolved `SITE_URL`.

- [ ] **Step 1: Vervang het volledige script**

Vervang de hele inhoud van `scripts/generate-sitemap.mjs` door:

```js
/**
 * Genereert sitemap.xml + robots.txt + llms.txt in .output/public, ná
 * `nuxt generate` (gekoppeld via het build-script in package.json). Leest de
 * routes uit de daadwerkelijk geprerenderde HTML-bestanden, dus de sitemap
 * kan nooit uit de pas lopen met wat er echt gedeployd wordt.
 *
 * De site-URL komt uit NUXT_PUBLIC_SITE_URL (door CI gezet, incl. het
 * /desingel/-subpad zolang de site op github.io draait).
 *
 * <lastmod> komt uit Sanity's _updatedAt per document, opgehaald via de
 * publieke CDN read-API (geen auth nodig). Lukt dat niet (geen
 * SANITY_PROJECT_ID, netwerkfout, ...), dan wordt de sitemap zonder
 * <lastmod> geschreven — de build mag hier nooit op falen.
 */
import { readdirSync, writeFileSync, existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const OUT = '.output/public'
const SITE_URL = (process.env.NUXT_PUBLIC_SITE_URL || 'https://jeroenwijnholds.github.io/desingel').replace(/\/$/, '')

// Pagina's die niet geïndexeerd moeten worden (bedankt heeft ook noindex)
const EXCLUDE = new Set(['/bedankt'])

// Route -> Sanity-documenttype voor de singleton-pagina's
const ROUTE_SINGLETON_TYPE = {
  '/': 'homePage',
  '/de-boerderij': 'boerderijPage',
  '/over-ons': 'overOnsPage',
  '/contact': 'contactPage',
  '/agenda': 'agendaPage',
  '/nieuws': 'nieuwsPage',
}

if (!existsSync(OUT)) {
  console.error(`generate-sitemap: ${OUT} bestaat niet — eerst \`nuxt generate\` draaien`)
  process.exit(1)
}

function loadDotEnv() {
  if (!existsSync('.env')) return {}
  return Object.fromEntries(
    readFileSync('.env', 'utf8').split('\n')
      .filter(l => l.includes('=') && !l.trim().startsWith('#'))
      .map(l => [l.slice(0, l.indexOf('=')).trim(), l.slice(l.indexOf('=') + 1).trim()])
  )
}
const env = { ...loadDotEnv(), ...process.env }

function collectRoutes(dir, prefix = '') {
  const routes = []
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (entry.name === '_payload.json' || entry.name.startsWith('_')) continue
      routes.push(...collectRoutes(join(dir, entry.name), `${prefix}/${entry.name}`))
    } else if (entry.name === 'index.html') {
      routes.push(prefix || '/')
    }
  }
  return routes
}

function buildLastmodMap(result) {
  const map = new Map()
  for (const doc of result.singletons ?? []) {
    const route = Object.entries(ROUTE_SINGLETON_TYPE).find(([, type]) => type === doc._type)?.[0]
    if (route) map.set(route, doc._updatedAt)
  }
  for (const article of result.articles ?? []) {
    if (article.slug) map.set(`/nieuws/${article.slug}`, article._updatedAt)
  }
  for (const event of result.events ?? []) {
    if (event.slug) map.set(`/evenement/${event.slug}`, event._updatedAt)
  }
  return map
}

async function fetchLastmodMap() {
  const projectId = env.SANITY_PROJECT_ID
  if (!projectId) {
    console.warn('generate-sitemap: SANITY_PROJECT_ID ontbreekt — sitemap wordt geschreven zonder <lastmod>')
    return new Map()
  }
  const dataset = env.SANITY_DATASET || 'production'
  const query = `{
    "singletons": *[_type in ["homePage","boerderijPage","overOnsPage","contactPage","agendaPage","nieuwsPage"]]{_type, _updatedAt},
    "articles": *[_type == "nieuwsArtikel" && !(_id in path("drafts.**"))]{"slug": slug.current, _updatedAt},
    "events": *[_type == "event" && !(_id in path("drafts.**"))]{"slug": slug.current, _updatedAt}
  }`
  const url = `https://${projectId}.apicdn.sanity.io/v2024-01-01/data/query/${dataset}?query=${encodeURIComponent(query)}`
  try {
    const res = await fetch(url)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const { result } = await res.json()
    return buildLastmodMap(result)
  } catch (err) {
    console.warn(`generate-sitemap: kon lastmod-data niet ophalen (${err.message}) — sitemap wordt geschreven zonder <lastmod>`)
    return new Map()
  }
}

const routes = collectRoutes(OUT)
  .filter(r => !EXCLUDE.has(r))
  .sort()

const lastmodMap = await fetchLastmodMap()

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes.map(r => {
  const lastmod = lastmodMap.get(r)
  const lastmodTag = lastmod ? `<lastmod>${lastmod.slice(0, 10)}</lastmod>` : ''
  return `  <url><loc>${SITE_URL}${r === '/' ? '/' : r}</loc>${lastmodTag}</url>`
}).join('\n')}
</urlset>
`

const robots = `User-agent: *
Allow: /
Disallow: /bedankt

Sitemap: ${SITE_URL}/sitemap.xml
`

const llmsTxt = `# Belevenisboerderij de Singel

> Kleinschalige belevenisboerderij in de Achterhoek (Gelderland), gerund door Victor en Mari Duurland. Waar kleinschalige landbouw en wilde natuur samenkomen: Wagyu-runderen, loopvogels en een farmshop met ambachtelijke producten.

## Kernfeiten
- Locatie: Achterhoek, Gelderland, Nederland
- Farmshop geopend: zaterdag en zondag, 10:00–17:00
- Aanbod: verse producten van eigen boerderij (Wagyu-vlees, Poule de Bresse kip, zachtfruit, groenten), "Boerderij op Locatie" voor markten, braderieën, evenementen, zorgcentra en scholen

## Pagina's
- [Home](${SITE_URL}/): overzicht van de boerderij, diensten en fotogalerij
- [De Boerderij](${SITE_URL}/de-boerderij): de dieren, de gronden en de farmshop
- [Over Ons](${SITE_URL}/over-ons): het verhaal van Victor en Mari Duurland
- [Agenda](${SITE_URL}/agenda): aankomende evenementen en boerderijbezoeken op locatie
- [Nieuws](${SITE_URL}/nieuws): verhalen over dieren, seizoenen en de farmshop
- [Contact](${SITE_URL}/contact): contactformulier en praktische informatie
`

writeFileSync(join(OUT, 'sitemap.xml'), sitemap)
writeFileSync(join(OUT, 'robots.txt'), robots)
writeFileSync(join(OUT, 'llms.txt'), llmsTxt)
console.log(`sitemap.xml (${routes.length} routes, ${lastmodMap.size} met lastmod) + robots.txt + llms.txt geschreven voor ${SITE_URL}`)
```

- [ ] **Step 2: Build en bekijk de console-output**

```bash
npm run build
```

Expected: de laatste regel meldt `sitemap.xml (N routes, M met lastmod) + robots.txt + llms.txt geschreven voor ...` — als `SANITY_PROJECT_ID` lokaal beschikbaar is (via `.env`) moet `M` > 0 zijn; zo niet, verschijnt de `generate-sitemap: SANITY_PROJECT_ID ontbreekt`-waarschuwing en is `M` 0 (nog steeds een geslaagde build).

- [ ] **Step 3: Inspecteer sitemap.xml en llms.txt**

```bash
node -e "console.log(require('fs').readFileSync('.output/public/sitemap.xml', 'utf8'))"
node -e "console.log(require('fs').readFileSync('.output/public/llms.txt', 'utf8'))"
```

Expected: `sitemap.xml` bevat `<lastmod>`-tags op de meeste `<url>`-regels (in `YYYY-MM-DD`-formaat); `llms.txt` bevat de juiste `SITE_URL` in elke link (geen hardcoded `/desingel/`-pad tenzij dat toevallig de huidige `SITE_URL` is).

- [ ] **Step 4: Commit**

```bash
git add scripts/generate-sitemap.mjs
git commit -m "$(cat <<'EOF'
feat: lastmod in sitemap.xml + llms.txt voor GEO

lastmod komt uit Sanity's _updatedAt per document (publieke CDN-API,
graceful fallback zonder lastmod als dat faalt). llms.txt volgt de
opkomende conventie voor AI-crawlers en wordt build-time gegenereerd
zodat de site-URL nooit hardcoded raakt (zie NOG-TE-DOEN.md domeinwissel).
EOF
)"
```

---

### Task 6: Openingstijden invullen in productie (data-patch)

**Files:**
- Create: `scripts/eenmalig/set-opening-hours.mjs`

**Interfaces:**
- Consumes: `SANITY_TOKEN`/`SANITY_PROJECT_ID`/`SANITY_DATASET` uit `.env`.
- Produces: gevulde `openingHours` op het live `siteSettings`-document — Task 2's JSON-LD toont vanaf nu ook `openingHoursSpecification`.

**⚠️ Dit script muteert het live productie-document. Vraag Jeroen om expliciete bevestiging vlak voordat je Step 2 uitvoert.**

- [ ] **Step 1: Maak het script**

Nieuw bestand `scripts/eenmalig/set-opening-hours.mjs`:

```js
/**
 * Eenmalig (2026-07-20): vult siteSettings.openingHours met de farmshop-
 * openingstijden die al overal in de content staan (za & zo, 10:00–17:00).
 * Nodig voor de LocalBusiness openingHoursSpecification in JSON-LD
 * (zie components/AppFooter.vue).
 * Zie docs/superpowers/specs/2026-07-20-seo-geo-optimalisatie-design.md.
 *
 * Draaien: node scripts/eenmalig/set-opening-hours.mjs  (SANITY_TOKEN in .env)
 */
import { createClient } from '@sanity/client'
import { readFileSync } from 'node:fs'

const env = Object.fromEntries(
  readFileSync('.env', 'utf8').split('\n')
    .filter(l => l.includes('='))
    .map(l => [l.slice(0, l.indexOf('=')).trim(), l.slice(l.indexOf('=') + 1).trim()])
)

const client = createClient({
  projectId: env.SANITY_PROJECT_ID || 'vua8q73o',
  dataset: env.SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  token: env.SANITY_TOKEN,
  useCdn: false,
})

const result = await client
  .patch('siteSettings')
  .set({
    openingHours: [
      { _key: 'farmshop-weekend', days: ['saturday', 'sunday'], opens: '10:00', closes: '17:00' },
    ],
  })
  .commit()

console.log('openingHours ingesteld op document:', result._id)
```

- [ ] **Step 2: Vraag bevestiging aan Jeroen, draai het script pas daarna**

```bash
node scripts/eenmalig/set-opening-hours.mjs
```

Expected: `openingHours ingesteld op document: siteSettings`

- [ ] **Step 3: Herbouw en verifieer dat de JSON-LD nu openingHoursSpecification bevat**

```bash
npm run build
node -e "
const html = require('fs').readFileSync('.output/public/index.html', 'utf8');
const m = html.match(/<script type=\"application\/ld\+json\">(.*?)<\/script>/s);
const jsonld = m ? JSON.parse(m[1]) : null;
console.log(jsonld?.openingHoursSpecification);
"
```

Expected: array met één object, `dayOfWeek: ["https://schema.org/Saturday", "https://schema.org/Sunday"]`, `opens: "10:00"`, `closes: "17:00"`.

- [ ] **Step 4: Commit het script (de data-mutatie zelf wordt niet gecommit — dat leeft in Sanity)**

```bash
git add scripts/eenmalig/set-opening-hours.mjs
git commit -m "$(cat <<'EOF'
chore: eenmalig script om openingHours in productie te vullen

Zet de al overal in de content voorkomende farmshop-openingstijden
(za & zo 10:00-17:00) als structured data op siteSettings.
EOF
)"
```

---

### Task 7: Documentatie en eindverificatie

**Files:**
- Modify: `NOG-TE-DOEN.md`

**Interfaces:**
- Consumes: niets.
- Produces: niets — afsluitende taak.

- [ ] **Step 1: Voeg een open punt toe aan NOG-TE-DOEN.md**

Voeg, ná de sectie `### Dependency-beheer (periodiek, geen haast)` en vóór `### ~~Oude galerijdata opruimen~~ ✅ afgerond 10 juli 2026`, deze nieuwe sectie toe:

```md
### Contactgegevens aanvullen voor structured data

Sinds de SEO/GEO-optimalisatieronde (20 juli 2026) heeft Site-instellingen
lege velden voor `telephone` en `socialLinks` (Instagram/Facebook e.d.). Ze
staan bewust leeg — structured data mag geen verzonnen telefoonnummer of
social-link bevatten. Vul ze in via de Studio zodra de gegevens bekend
zijn; `components/AppFooter.vue` neemt ze dan automatisch mee in de
LocalBusiness-JSON-LD (`telephone`/`sameAs`).

```

- [ ] **Step 2: Volledige eindverificatie**

```bash
npm run typecheck
npm run build
```

Expected: beide slagen zonder fouten. Screenshot/viewport-verificatie (`npm run viewport-check`) is hier bewust overgeslagen — deze ronde wijzigt geen enkele template of CSS, alleen `<head>`-scripts en een build-script, dus er is niets visueel te controleren.

- [ ] **Step 3: Commit**

```bash
git add NOG-TE-DOEN.md
git commit -m "$(cat <<'EOF'
docs: open punt voor telefoon/social-links na SEO/GEO-ronde
EOF
)"
```

- [ ] **Step 4: Klaar voor afronding**

Gebruik hierna `superpowers:finishing-a-development-branch` om de branch af te ronden (merge/PR-keuze bij Jeroen).
