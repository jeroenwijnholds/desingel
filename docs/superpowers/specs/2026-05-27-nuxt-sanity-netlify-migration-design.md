# Design: Belevenisboerderij de Singel — Nuxt 3 + Sanity + Netlify Migration

**Date:** 2026-05-27  
**Status:** Approved

---

## Context

The site is currently a static HTML/CSS marketing website for Belevenisboerderij de Singel (a small-scale farm in the Achterhoek). The owners (Victor & Mari Duurland) want to manage content — events, news articles, page copy — without touching code. The migration converts the site to a Nuxt 3 project with Sanity as the headless CMS and Netlify for hosting. Publishing in Sanity triggers a Netlify rebuild that generates and deploys fresh static HTML.

---

## Architecture Overview

- **Nuxt 3** with `nuxt generate` (fully static output, no SSR)
- **Sanity** headless CMS via `@nuxtjs/sanity` module
- **Netlify** for hosting + Forms for contact form
- **TypeScript** throughout
- **CSS**: existing files moved to `assets/css/`, registered globally — no rewrites
- **Images**: uploaded to Sanity Assets, served via `@sanity/image-url` builder

**Publish pipeline (already configured):**
Sanity publish → Sanity webhook → Netlify build hook → `npx nuxt generate` → static HTML on CDN

---

## Project Structure

```
desingel/
├── nuxt.config.ts
├── package.json
├── tsconfig.json
├── .env                          (gitignored)
├── .env.example                  (SANITY_PROJECT_ID, SANITY_DATASET)
├── netlify.toml
├── studio/                       ← Sanity Studio v3 project (run locally with `npx sanity dev`)
│   ├── sanity.config.ts          (projectId, dataset, schema registry)
│   ├── package.json
│   └── schemas/
│       ├── index.ts              (schema registry)
│       ├── siteSettings.ts       (singleton: nav, address, owners, hours, footer)
│       ├── homePage.ts           (singleton: hero, service cards, gallery, CTA)
│       ├── boerderijPage.ts      (singleton: intro, story, quote, highlights, CTA)
│       ├── overOnsPage.ts        (singleton: intro, story, quote, family photo, values, CTA)
│       ├── contactPage.ts        (singleton: info card, subject dropdown options)
│       ├── event.ts              (collection: title, slug, date, time, location, category, description, image, body, external link)
│       └── nieuwsArtikel.ts      (collection: title, slug, date, category, author, excerpt, image, body, related refs)
├── assets/
│   └── css/
│       ├── style.css
│       ├── page-shared.css
│       ├── agenda.css
│       ├── contact.css
│       ├── de-boerderij.css
│       ├── nieuws.css
│       ├── over-ons.css
│       ├── evenement.css
│       └── nieuws-artikel.css
├── public/
│   └── netlify-forms.html        (static Netlify form fallback)
├── components/
│   ├── AppNav.vue                (navigation, hamburger, scroll behaviour)
│   ├── AppFooter.vue             (footer links, copyright)
│   └── AppLightbox.vue           (gallery lightbox modal)
├── layouts/
│   └── default.vue               (wraps all pages with nav + footer)
└── pages/
    ├── index.vue
    ├── de-boerderij.vue
    ├── over-ons.vue
    ├── agenda.vue
    ├── nieuws.vue
    ├── contact.vue
    ├── evenement/
    │   └── [slug].vue            (pre-rendered from all event slugs)
    └── nieuws/
        └── [slug].vue            (pre-rendered from all nieuwsArtikel slugs)
```

---

## Sanity Schemas

### Singletons (one document each, fetched by type)

**`siteSettings`**
- `siteName` (string)
- `tagline` (string)
- `owners` (array of `{name, role}`)
- `address` (text)
- `coordinates` (object: `{lat, lng}`)
- `farmshopHours` (string, e.g. "Za & zo 10:00–17:00")
- `responseTime` (string, e.g. "Binnen 2 werkdagen")
- `footerCopyright` (string)
- `navigation` (array of `{label: string, href: string, isButton: boolean}`)

**`homePage`**
- `heroTitle` (string)
- `heroSubtitle` (string)
- `heroImage` (image)
- `primaryServices` (array of `{title, description, image, testimonialQuote?}`, max 2)
- `secondaryServices` (array of `{title, description}`, max 3)
- `galleryImages` (array of image)
- `ctaSection` (object: `{primaryLabel, primaryHref, secondaryLabel, secondaryHref}`)

**`boerderijPage`**
- `introTitle`, `introText` (string, text)
- `introImage` (image)
- `storyColumns` (array of text, max 2)
- `victorQuote` (string)
- `highlights` (array of `{title, description}`, max 3)
- `fullWidthPhoto` (image)
- `ctaSection` (same as above)

**`overOnsPage`**
- `introTitle`, `introText` (string, text)
- `familyPhoto` (image)
- `storyTitle`, `storyColumns` (string, array of text, max 2)
- `victorQuote` (string)
- `values` (array of `{title, description}`, max 3)
- `fullWidthPhoto` (image)
- `ctaSection`

**`contactPage`**
- `infoOwners` (string)
- `infoAddress` (text)
- `infoHours` (string)
- `infoResponseTime` (string)
- `subjectOptions` (array of string — dropdown values)
- `privacyNotice` (text)

### Collections

**`event`**
- `title` (string, required)
- `slug` (slug, required)
- `category` (string: Farmshop open | Markt | Evenement | Kermis | Circus | Anders)
- `date` (datetime)
- `timeRange` (string, e.g. "11:00 – 18:00")
- `location` (string)
- `description` (text)
- `featuredImage` (image)
- `body` (Portable Text — rich content for detail page)
- `externalLink` (url, optional)

**`nieuwsArtikel`**
- `title` (string, required)
- `slug` (slug, required)
- `category` (string: Dieren | Farmshop | Evenement | Teelt | Pers | Anders)
- `publishedAt` (datetime)
- `author` (string)
- `excerpt` (text)
- `readTime` (number, minutes)
- `featuredImage` (image)
- `body` (Portable Text)
- `relatedArticles` (array of references to `nieuwsArtikel`)

---

## Nuxt Configuration

**nuxt.config.ts highlights:**
- `modules: ['@nuxtjs/sanity']`
- `sanity: { projectId: process.env.SANITY_PROJECT_ID, dataset: process.env.SANITY_DATASET, apiVersion: '2024-01-01', useCdn: true }`
- `css: ['~/assets/css/style.css', '~/assets/css/page-shared.css', ...]` (all 9 CSS files)
- `app.head`: Google Fonts (Playfair Display, Source Sans 3)
- `nitro.prerender.routes`: populated dynamically from Sanity slugs for `/evenement/*` and `/nieuws/*`

**Dynamic route pre-generation** (in `nuxt.config.ts`):
```ts
hooks: {
  async 'nitro:config'(nitroConfig) {
    const client = createClient({ projectId, dataset, apiVersion, useCdn: false })
    const eventSlugs = await client.fetch(`*[_type=="event"].slug.current`)
    const newsSlugs = await client.fetch(`*[_type=="nieuwsArtikel"].slug.current`)
    nitroConfig.prerender.routes.push(
      ...eventSlugs.map(s => `/evenement/${s}`),
      ...newsSlugs.map(s => `/nieuws/${s}`)
    )
  }
}
```

---

## Pages & GROQ Queries

| Page | File | GROQ scope |
|------|------|------------|
| Homepage | `pages/index.vue` | `*[_type=="homePage"][0]` + `*[_type=="siteSettings"][0]` |
| De Boerderij | `pages/de-boerderij.vue` | `*[_type=="boerderijPage"][0]` |
| Over Ons | `pages/over-ons.vue` | `*[_type=="overOnsPage"][0]` |
| Agenda | `pages/agenda.vue` | `*[_type=="event"] \| order(date asc)` |
| Nieuws | `pages/nieuws.vue` | `*[_type=="nieuwsArtikel"] \| order(publishedAt desc)` |
| Contact | `pages/contact.vue` | `*[_type=="contactPage"][0]` + `*[_type=="siteSettings"][0]` |
| Event detail | `pages/evenement/[slug].vue` | `*[_type=="event" && slug.current==$slug][0]` |
| News detail | `pages/nieuws/[slug].vue` | `*[_type=="nieuwsArtikel" && slug.current==$slug][0]` |
| Layout | `layouts/default.vue` | `*[_type=="siteSettings"][0]` (nav + footer) |

All queries use `useSanityQuery` composable from `@nuxtjs/sanity`.

---

## Netlify Forms

**Contact form** (`pages/contact.vue`):
```html
<form name="contact" method="POST" data-netlify="true" data-netlify-honeypot="bot-field">
  <input type="hidden" name="form-name" value="contact" />
  <p class="visually-hidden"><label>Leave blank: <input name="bot-field" /></label></p>
  <!-- Naam, Email, Telefoonnummer, Onderwerp (select), Bericht -->
</form>
```

**public/netlify-forms.html** — static HTML file Netlify scans at deploy time:
```html
<!DOCTYPE html>
<html>
  <body>
    <form name="contact" netlify netlify-honeypot="bot-field" hidden>
      <input name="Naam" type="text" />
      <input name="Email" type="email" />
      <input name="Telefoonnummer" type="tel" />
      <select name="Onderwerp">...</select>
      <textarea name="Bericht"></textarea>
      <input name="bot-field" />
    </form>
  </body>
</html>
```

---

## netlify.toml

```toml
[build]
  command   = "npx nuxt generate"
  publish   = ".output/public"

[build.environment]
  NODE_VERSION = "20"
```

---

## .env.example

```
SANITY_PROJECT_ID=your-project-id
SANITY_DATASET=production
```

---

## Agenda Month Grouping

The agenda page groups events by month header (e.g., "April 2026", "Mei 2026"). This grouping is done client-side in `pages/agenda.vue` using a computed property that groups the flat GROQ result by `new Date(event.date).toLocaleDateString('nl-NL', { month: 'long', year: 'numeric' })`. Sanity returns events sorted by `date asc`; the component groups them.

---

## JavaScript Behaviour (inline → Vue components)

The existing inline JS is migrated to Vue `<script setup>` or composables:

| Behaviour | Component |
|-----------|-----------|
| Hamburger menu toggle (`nav--open`) | `AppNav.vue` |
| Scroll-based nav class (`nav--scrolled`) | `AppNav.vue` |
| Fixed CTA visibility (IntersectionObserver) | `pages/index.vue` |
| Gallery lightbox modal | `AppLightbox.vue` |
| Breadcrumb navigation | `pages/evenement/[slug].vue`, `pages/nieuws/[slug].vue` |

---

## Dependencies (use latest stable at scaffold time)

Check `npm view <pkg> version` before writing package.json.

**Nuxt project (root `package.json`):**
- `nuxt` (^3.x)
- `@nuxtjs/sanity` (^1.x)
- `@sanity/client` (^6.x)
- `@sanity/image-url` (^1.x)
- `@portabletext/vue` (^1.x) — for rendering Portable Text body in event/news detail pages

**Sanity Studio (`studio/package.json`):**
- `sanity` (^3.x)
- `@sanity/vision` (^3.x) — GROQ query explorer for development

**Studio deployment:** run `npx sanity deploy` from the `studio/` directory to publish the Studio to a `*.sanity.studio` URL. The user has an existing Sanity project (has project ID) — the Studio will be deployed to that project.

---

## Verification

1. Run `npx nuxt generate` — confirm `.output/public` contains HTML for all 8+ routes including `/evenement/pinksterfeesten` and `/nieuws/wagyu-seizoen`
2. Serve `.output/public` locally (`npx serve .output/public`) and verify:
   - All pages render with correct content from Sanity
   - Navigation works across all pages
   - Contact form submits (Netlify Forms requires live deploy to test fully)
   - Gallery lightbox opens/closes
   - Mobile hamburger menu works
3. Deploy to Netlify — verify form submission appears in Netlify dashboard under Forms
4. Update a field in Sanity Studio → publish → confirm Netlify build triggers and new content appears
