# Nuxt 3 + Sanity + Netlify Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate the static HTML/CSS website for Belevenisboerderij de Singel to a Nuxt 3 project with Sanity as headless CMS and Netlify for static hosting, so the farm owners can manage all content without touching code.

**Architecture:** `nuxt generate` produces fully static HTML at build time via GROQ queries against Sanity. A Sanity publish webhook fires the Netlify build hook, triggering a rebuild. The existing CSS files are preserved verbatim and registered globally; the existing HTML structure is ported into Vue single-file components.

**Tech Stack:** Nuxt 3, TypeScript, `@nuxtjs/sanity`, `@sanity/client`, `@sanity/image-url`, `@portabletext/vue`, Sanity Studio v3, Netlify (hosting + Forms)

**Spec:** `docs/superpowers/specs/2026-05-27-nuxt-sanity-netlify-migration-design.md`

---

## File Map

```
desingel/
├── nuxt.config.ts                     CREATE
├── package.json                       CREATE
├── tsconfig.json                      CREATE
├── .env.example                       CREATE
├── .env                               CREATE (gitignored, your real values)
├── netlify.toml                       CREATE
├── .gitignore                         CREATE/MODIFY
│
├── studio/                            CREATE – Sanity Studio v3
│   ├── package.json
│   ├── sanity.config.ts
│   └── schemas/
│       ├── index.ts
│       ├── siteSettings.ts
│       ├── homePage.ts
│       ├── boerderijPage.ts
│       ├── overOnsPage.ts
│       ├── contactPage.ts
│       ├── event.ts
│       └── nieuwsArtikel.ts
│
├── assets/
│   └── css/                           MOVE existing .css files here
│       ├── style.css
│       ├── page-shared.css
│       ├── agenda.css
│       ├── contact.css
│       ├── de-boerderij.css
│       ├── nieuws.css
│       ├── over-ons.css
│       ├── evenement.css
│       └── nieuws-artikel.css
│
├── composables/
│   └── useImageUrl.ts                 CREATE
│
├── layouts/
│   └── default.vue                    CREATE
│
├── components/
│   ├── AppNav.vue                     CREATE
│   ├── AppFooter.vue                  CREATE
│   └── AppLightbox.vue                CREATE
│
├── pages/
│   ├── index.vue                      CREATE
│   ├── de-boerderij.vue               CREATE
│   ├── over-ons.vue                   CREATE
│   ├── agenda.vue                     CREATE
│   ├── nieuws.vue                     CREATE
│   ├── contact.vue                    CREATE
│   ├── evenement/
│   │   └── [slug].vue                 CREATE
│   └── nieuws/
│       └── [slug].vue                 CREATE
│
└── public/
    └── netlify-forms.html             CREATE
```

---

## Task 1: Check package versions and initialize project root

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `.gitignore`

- [ ] **Step 1: Check latest package versions**

Run each of these and record the version numbers — you'll use them in Step 2:

```bash
npm view nuxt version
npm view @nuxtjs/sanity version
npm view @sanity/client version
npm view @sanity/image-url version
npm view @portabletext/vue version
```

- [ ] **Step 2: Create `package.json`**

Replace `X.X.X` with the versions from Step 1:

```json
{
  "name": "desingel",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "nuxt dev",
    "build": "nuxt generate",
    "preview": "npx serve .output/public"
  },
  "dependencies": {
    "@nuxtjs/sanity": "^X.X.X",
    "@portabletext/vue": "^X.X.X",
    "@sanity/client": "^X.X.X",
    "@sanity/image-url": "^X.X.X",
    "nuxt": "^X.X.X"
  }
}
```

- [ ] **Step 3: Create `tsconfig.json`**

```json
{
  "extends": "./.nuxt/tsconfig.json"
}
```

- [ ] **Step 4: Create `.gitignore`**

```
node_modules
.output
.nuxt
dist
.env
.env.local
*.log
```

- [ ] **Step 5: Install dependencies**

```bash
npm install
```

Expected: `node_modules/` created, no errors.

- [ ] **Step 6: Commit**

```bash
git add package.json tsconfig.json .gitignore
git commit -m "chore: initialize Nuxt 3 project"
```

---

## Task 2: Create `nuxt.config.ts`

**Files:**
- Create: `nuxt.config.ts`

- [ ] **Step 1: Create `nuxt.config.ts`**

```ts
import { createClient } from '@sanity/client'

export default defineNuxtConfig({
  modules: ['@nuxtjs/sanity'],

  sanity: {
    projectId: process.env.SANITY_PROJECT_ID,
    dataset: process.env.SANITY_DATASET || 'production',
    apiVersion: '2024-01-01',
    useCdn: false,
  },

  css: [
    '~/assets/css/style.css',
    '~/assets/css/page-shared.css',
    '~/assets/css/agenda.css',
    '~/assets/css/contact.css',
    '~/assets/css/de-boerderij.css',
    '~/assets/css/nieuws.css',
    '~/assets/css/over-ons.css',
    '~/assets/css/evenement.css',
    '~/assets/css/nieuws-artikel.css',
  ],

  app: {
    head: {
      htmlAttrs: { lang: 'nl' },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      ],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Source+Sans+3:wght@300;400;600&display=swap',
        },
      ],
    },
  },

  hooks: {
    async 'nitro:config'(nitroConfig) {
      if (nitroConfig.dev) return
      const client = createClient({
        projectId: process.env.SANITY_PROJECT_ID!,
        dataset: process.env.SANITY_DATASET || 'production',
        apiVersion: '2024-01-01',
        useCdn: false,
      })
      const [eventSlugs, newsSlugs] = await Promise.all([
        client.fetch<string[]>(`*[_type == "event" && defined(slug.current)].slug.current`),
        client.fetch<string[]>(`*[_type == "nieuwsArtikel" && defined(slug.current)].slug.current`),
      ])
      nitroConfig.prerender!.routes = [
        ...(nitroConfig.prerender!.routes ?? []),
        ...eventSlugs.map(s => `/evenement/${s}`),
        ...newsSlugs.map(s => `/nieuws/${s}`),
      ]
    },
  },

  typescript: { strict: true },
})
```

- [ ] **Step 2: Commit**

```bash
git add nuxt.config.ts
git commit -m "chore: add nuxt.config.ts with Sanity module and CSS globals"
```

---

## Task 3: Deployment config

**Files:**
- Create: `netlify.toml`
- Create: `.env.example`
- Create: `.env` (your real values, gitignored)

- [ ] **Step 1: Create `netlify.toml`**

```toml
[build]
  command   = "npx nuxt generate"
  publish   = ".output/public"

[build.environment]
  NODE_VERSION = "20"
```

- [ ] **Step 2: Create `.env.example`**

```
SANITY_PROJECT_ID=your-project-id
SANITY_DATASET=production
```

- [ ] **Step 3: Create `.env`** with your real Sanity project ID

```
SANITY_PROJECT_ID=<your actual project id from sanity.io/manage>
SANITY_DATASET=production
```

- [ ] **Step 4: Commit**

```bash
git add netlify.toml .env.example
git commit -m "chore: add netlify.toml and .env.example"
```

---

## Task 4: Migrate CSS files to `assets/css/`

**Files:**
- Move: all existing `*.css` files into `assets/css/`

The existing CSS files live at the project root and in `evenement/` and `nieuws/` subdirectories. Move them all to `assets/css/` with flattened names.

- [ ] **Step 1: Create the directory and move files**

```bash
mkdir -p assets/css
mv style.css assets/css/style.css
mv page-shared.css assets/css/page-shared.css
mv agenda.css assets/css/agenda.css
mv contact.css assets/css/contact.css
mv de-boerderij.css assets/css/de-boerderij.css
mv nieuws.css assets/css/nieuws.css
mv over-ons.css assets/css/over-ons.css
mv evenement/evenement.css assets/css/evenement.css
mv nieuws/nieuws-artikel.css assets/css/nieuws-artikel.css
```

- [ ] **Step 2: Verify files are in place**

```bash
ls assets/css/
```

Expected: 9 `.css` files listed.

- [ ] **Step 3: Commit**

```bash
git add assets/css/ evenement/evenement.css nieuws/nieuws-artikel.css style.css page-shared.css agenda.css contact.css de-boerderij.css nieuws.css over-ons.css
git commit -m "chore: move CSS files to assets/css/"
```

---

## Task 5: Scaffold Sanity Studio

**Files:**
- Create: `studio/package.json`
- Create: `studio/sanity.config.ts`
- Create: `studio/schemas/index.ts`

- [ ] **Step 1: Check latest Studio package versions**

```bash
npm view sanity version
npm view @sanity/vision version
```

- [ ] **Step 2: Create `studio/package.json`**

Replace `X.X.X` with versions from Step 1:

```json
{
  "name": "desingel-studio",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "sanity dev",
    "build": "sanity build",
    "deploy": "sanity deploy"
  },
  "dependencies": {
    "@sanity/vision": "^X.X.X",
    "sanity": "^X.X.X"
  }
}
```

- [ ] **Step 3: Create `studio/sanity.config.ts`**

Replace `YOUR_PROJECT_ID` with the value from your `.env` file:

```ts
import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { visionTool } from '@sanity/vision'
import { schemaTypes } from './schemas'

export default defineConfig({
  name: 'default',
  title: 'Belevenisboerderij de Singel',

  projectId: 'YOUR_PROJECT_ID',
  dataset: 'production',

  plugins: [
    structureTool(),
    visionTool(),
  ],

  schema: {
    types: schemaTypes,
  },
})
```

- [ ] **Step 4: Create placeholder `studio/schemas/index.ts`**

```ts
export const schemaTypes: any[] = []
```

- [ ] **Step 5: Install Studio dependencies**

```bash
cd studio && npm install && cd ..
```

- [ ] **Step 6: Verify Studio starts**

```bash
cd studio && npx sanity dev
```

Expected: Studio opens at `http://localhost:3333`. Stop with Ctrl+C.

- [ ] **Step 7: Commit**

```bash
git add studio/
git commit -m "chore: scaffold Sanity Studio v3"
```

---

## Task 6: Sanity schema — `siteSettings`

**Files:**
- Create: `studio/schemas/siteSettings.ts`
- Modify: `studio/schemas/index.ts`

- [ ] **Step 1: Create `studio/schemas/siteSettings.ts`**

```ts
import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'siteSettings',
  title: 'Site-instellingen',
  type: 'document',
  fields: [
    defineField({
      name: 'siteName',
      title: 'Sitenaam',
      type: 'string',
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'tagline',
      title: 'Tagline',
      type: 'string',
    }),
    defineField({
      name: 'navigation',
      title: 'Navigatie',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({ name: 'label', title: 'Label', type: 'string', validation: Rule => Rule.required() }),
            defineField({ name: 'href', title: 'URL', type: 'string', validation: Rule => Rule.required() }),
            defineField({ name: 'isButton', title: 'Als knop weergeven', type: 'boolean', initialValue: false }),
          ],
          preview: {
            select: { title: 'label', subtitle: 'href' },
          },
        },
      ],
    }),
    defineField({
      name: 'owners',
      title: 'Eigenaren',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({ name: 'name', title: 'Naam', type: 'string' }),
            defineField({ name: 'role', title: 'Rol', type: 'string' }),
          ],
          preview: { select: { title: 'name' } },
        },
      ],
    }),
    defineField({
      name: 'address',
      title: 'Adres',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'coordinates',
      title: 'Coördinaten (Google Maps)',
      type: 'object',
      fields: [
        defineField({ name: 'lat', title: 'Breedtegraad', type: 'number' }),
        defineField({ name: 'lng', title: 'Lengtegraad', type: 'number' }),
      ],
    }),
    defineField({
      name: 'farmshopHours',
      title: 'Farmshop openingstijden',
      type: 'string',
    }),
    defineField({
      name: 'responseTime',
      title: 'Reactietijd contact',
      type: 'string',
    }),
    defineField({
      name: 'footerCopyright',
      title: 'Copyright-tekst (footer)',
      type: 'string',
    }),
  ],
  preview: {
    select: { title: 'siteName' },
  },
})
```

- [ ] **Step 2: Update `studio/schemas/index.ts`**

```ts
import siteSettings from './siteSettings'

export const schemaTypes = [siteSettings]
```

- [ ] **Step 3: Commit**

```bash
git add studio/schemas/
git commit -m "feat(sanity): add siteSettings schema"
```

---

## Task 7: Sanity schemas — page singletons

**Files:**
- Create: `studio/schemas/homePage.ts`
- Create: `studio/schemas/boerderijPage.ts`
- Create: `studio/schemas/overOnsPage.ts`
- Create: `studio/schemas/contactPage.ts`
- Modify: `studio/schemas/index.ts`

- [ ] **Step 1: Create `studio/schemas/homePage.ts`**

```ts
import { defineType, defineField } from 'sanity'

const serviceCard = {
  type: 'object',
  fields: [
    defineField({ name: 'title', title: 'Titel', type: 'string', validation: Rule => Rule.required() }),
    defineField({ name: 'description', title: 'Beschrijving', type: 'text', rows: 4 }),
    defineField({ name: 'image', title: 'Afbeelding', type: 'image', options: { hotspot: true } }),
    defineField({ name: 'testimonialQuote', title: 'Testimonial citaat (optioneel)', type: 'text', rows: 2 }),
    defineField({ name: 'testimonialAuthor', title: 'Testimonial auteur (optioneel)', type: 'string' }),
  ],
  preview: { select: { title: 'title' } },
}

export default defineType({
  name: 'homePage',
  title: 'Homepage',
  type: 'document',
  fields: [
    defineField({ name: 'heroTitle', title: 'Hero-titel', type: 'string', validation: Rule => Rule.required() }),
    defineField({ name: 'heroSubtitle', title: 'Hero-subtitel', type: 'string' }),
    defineField({ name: 'heroImage', title: 'Hero-afbeelding', type: 'image', options: { hotspot: true } }),
    defineField({
      name: 'primaryServices',
      title: 'Primaire diensten (max 2)',
      type: 'array',
      of: [serviceCard],
      validation: Rule => Rule.max(2),
    }),
    defineField({
      name: 'secondaryServices',
      title: 'Secundaire diensten (max 3)',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({ name: 'title', title: 'Titel', type: 'string' }),
            defineField({ name: 'description', title: 'Beschrijving', type: 'text', rows: 3 }),
          ],
          preview: { select: { title: 'title' } },
        },
      ],
      validation: Rule => Rule.max(3),
    }),
    defineField({
      name: 'galleryImages',
      title: 'Galerij-afbeeldingen',
      type: 'array',
      of: [{ type: 'image', options: { hotspot: true } }],
    }),
    defineField({
      name: 'ctaPrimaryLabel', title: 'CTA primaire knoptekst', type: 'string',
    }),
    defineField({
      name: 'ctaPrimaryHref', title: 'CTA primaire URL', type: 'string',
    }),
    defineField({
      name: 'ctaSecondaryLabel', title: 'CTA secundaire knoptekst', type: 'string',
    }),
    defineField({
      name: 'ctaSecondaryHref', title: 'CTA secundaire URL', type: 'string',
    }),
  ],
  preview: { prepare: () => ({ title: 'Homepage' }) },
})
```

- [ ] **Step 2: Create `studio/schemas/boerderijPage.ts`**

```ts
import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'boerderijPage',
  title: 'De Boerderij pagina',
  type: 'document',
  fields: [
    defineField({ name: 'introTitle', title: 'Intro-titel', type: 'string' }),
    defineField({ name: 'introText', title: 'Intro-tekst', type: 'text', rows: 5 }),
    defineField({ name: 'introImage', title: 'Intro-afbeelding', type: 'image', options: { hotspot: true } }),
    defineField({
      name: 'storyColumns',
      title: 'Verhaaltekst (2 kolommen)',
      type: 'array',
      of: [{ type: 'text' }],
      validation: Rule => Rule.max(2),
    }),
    defineField({ name: 'victorQuote', title: 'Citaat Victor', type: 'text', rows: 3 }),
    defineField({
      name: 'highlights',
      title: 'Hoogtepunten (max 3)',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({ name: 'title', title: 'Titel', type: 'string' }),
            defineField({ name: 'description', title: 'Beschrijving', type: 'text', rows: 3 }),
          ],
          preview: { select: { title: 'title' } },
        },
      ],
      validation: Rule => Rule.max(3),
    }),
    defineField({ name: 'fullWidthPhoto', title: 'Brede foto', type: 'image', options: { hotspot: true } }),
    defineField({ name: 'ctaPrimaryLabel', title: 'CTA primaire knoptekst', type: 'string' }),
    defineField({ name: 'ctaPrimaryHref', title: 'CTA primaire URL', type: 'string' }),
    defineField({ name: 'ctaSecondaryLabel', title: 'CTA secundaire knoptekst', type: 'string' }),
    defineField({ name: 'ctaSecondaryHref', title: 'CTA secundaire URL', type: 'string' }),
  ],
  preview: { prepare: () => ({ title: 'De Boerderij pagina' }) },
})
```

- [ ] **Step 3: Create `studio/schemas/overOnsPage.ts`**

```ts
import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'overOnsPage',
  title: 'Over Ons pagina',
  type: 'document',
  fields: [
    defineField({ name: 'introTitle', title: 'Intro-titel', type: 'string' }),
    defineField({ name: 'introText', title: 'Intro-tekst', type: 'text', rows: 5 }),
    defineField({ name: 'familyPhoto', title: 'Familiefoto', type: 'image', options: { hotspot: true } }),
    defineField({ name: 'storyTitle', title: 'Verhaaltitel', type: 'string' }),
    defineField({
      name: 'storyColumns',
      title: 'Verhaaltekst (2 kolommen)',
      type: 'array',
      of: [{ type: 'text' }],
      validation: Rule => Rule.max(2),
    }),
    defineField({ name: 'victorQuote', title: 'Citaat Victor', type: 'text', rows: 3 }),
    defineField({
      name: 'values',
      title: 'Waarden (max 3)',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({ name: 'title', title: 'Titel', type: 'string' }),
            defineField({ name: 'description', title: 'Beschrijving', type: 'text', rows: 3 }),
          ],
          preview: { select: { title: 'title' } },
        },
      ],
      validation: Rule => Rule.max(3),
    }),
    defineField({ name: 'fullWidthPhoto', title: 'Brede foto', type: 'image', options: { hotspot: true } }),
    defineField({ name: 'ctaPrimaryLabel', title: 'CTA primaire knoptekst', type: 'string' }),
    defineField({ name: 'ctaPrimaryHref', title: 'CTA primaire URL', type: 'string' }),
    defineField({ name: 'ctaSecondaryLabel', title: 'CTA secundaire knoptekst', type: 'string' }),
    defineField({ name: 'ctaSecondaryHref', title: 'CTA secundaire URL', type: 'string' }),
  ],
  preview: { prepare: () => ({ title: 'Over Ons pagina' }) },
})
```

- [ ] **Step 4: Create `studio/schemas/contactPage.ts`**

```ts
import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'contactPage',
  title: 'Contact pagina',
  type: 'document',
  fields: [
    defineField({ name: 'infoOwners', title: 'Eigenaren (weergavetekst)', type: 'string' }),
    defineField({ name: 'infoAddress', title: 'Adres (weergavetekst)', type: 'text', rows: 3 }),
    defineField({ name: 'infoHours', title: 'Openingstijden farmshop', type: 'string' }),
    defineField({ name: 'infoResponseTime', title: 'Reactietijd', type: 'string' }),
    defineField({
      name: 'subjectOptions',
      title: 'Onderwerp-opties (dropdown)',
      type: 'array',
      of: [{ type: 'string' }],
    }),
    defineField({ name: 'privacyNotice', title: 'Privacyverklaring-tekst', type: 'text', rows: 2 }),
  ],
  preview: { prepare: () => ({ title: 'Contact pagina' }) },
})
```

- [ ] **Step 5: Update `studio/schemas/index.ts`**

```ts
import siteSettings from './siteSettings'
import homePage from './homePage'
import boerderijPage from './boerderijPage'
import overOnsPage from './overOnsPage'
import contactPage from './contactPage'

export const schemaTypes = [
  siteSettings,
  homePage,
  boerderijPage,
  overOnsPage,
  contactPage,
]
```

- [ ] **Step 6: Verify Studio loads schemas**

```bash
cd studio && npx sanity dev
```

Expected: Studio opens at `http://localhost:3333`. In the sidebar you should see all 5 document types listed. Stop with Ctrl+C.

- [ ] **Step 7: Commit**

```bash
git add studio/schemas/
git commit -m "feat(sanity): add page singleton schemas"
```

---

## Task 8: Sanity schema — `event`

**Files:**
- Create: `studio/schemas/event.ts`
- Modify: `studio/schemas/index.ts`

- [ ] **Step 1: Create `studio/schemas/event.ts`**

```ts
import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'event',
  title: 'Evenement',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Titel',
      type: 'string',
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug (URL)',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'category',
      title: 'Categorie',
      type: 'string',
      options: {
        list: [
          { title: 'Farmshop open', value: 'Farmshop open' },
          { title: 'Markt', value: 'Markt' },
          { title: 'Evenement', value: 'Evenement' },
          { title: 'Kermis', value: 'Kermis' },
          { title: 'Circus', value: 'Circus' },
          { title: 'Anders', value: 'Anders' },
        ],
      },
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'date',
      title: 'Datum',
      type: 'datetime',
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'timeRange',
      title: 'Tijdvak (bijv. 11:00 – 18:00)',
      type: 'string',
    }),
    defineField({
      name: 'location',
      title: 'Locatie',
      type: 'string',
    }),
    defineField({
      name: 'description',
      title: 'Korte beschrijving (voor de agenda-lijst)',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'featuredImage',
      title: 'Afbeelding',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'body',
      title: 'Inhoud (detailpagina)',
      type: 'array',
      of: [
        {
          type: 'block',
          styles: [
            { title: 'Normaal', value: 'normal' },
            { title: 'H2', value: 'h2' },
            { title: 'H3', value: 'h3' },
            { title: 'Citaat', value: 'blockquote' },
          ],
          marks: {
            decorators: [
              { title: 'Vet', value: 'strong' },
              { title: 'Cursief', value: 'em' },
            ],
          },
        },
        {
          type: 'image',
          options: { hotspot: true },
          fields: [
            { name: 'caption', title: 'Bijschrift', type: 'string' },
            { name: 'alt', title: 'Alt-tekst', type: 'string' },
          ],
        },
      ],
    }),
    defineField({
      name: 'externalLink',
      title: 'Externe website-link (optioneel)',
      type: 'url',
    }),
  ],
  preview: {
    select: { title: 'title', subtitle: 'date' },
    prepare({ title, subtitle }) {
      return {
        title,
        subtitle: subtitle ? new Date(subtitle).toLocaleDateString('nl-NL') : '',
      }
    },
  },
  orderings: [
    {
      title: 'Datum oplopend',
      name: 'dateAsc',
      by: [{ field: 'date', direction: 'asc' }],
    },
  ],
})
```

- [ ] **Step 2: Update `studio/schemas/index.ts`**

```ts
import siteSettings from './siteSettings'
import homePage from './homePage'
import boerderijPage from './boerderijPage'
import overOnsPage from './overOnsPage'
import contactPage from './contactPage'
import event from './event'

export const schemaTypes = [
  siteSettings,
  homePage,
  boerderijPage,
  overOnsPage,
  contactPage,
  event,
]
```

- [ ] **Step 3: Commit**

```bash
git add studio/schemas/event.ts studio/schemas/index.ts
git commit -m "feat(sanity): add event schema"
```

---

## Task 9: Sanity schema — `nieuwsArtikel`

**Files:**
- Create: `studio/schemas/nieuwsArtikel.ts`
- Modify: `studio/schemas/index.ts`

- [ ] **Step 1: Create `studio/schemas/nieuwsArtikel.ts`**

```ts
import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'nieuwsArtikel',
  title: 'Nieuwsartikel',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Titel',
      type: 'string',
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug (URL)',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'category',
      title: 'Categorie',
      type: 'string',
      options: {
        list: [
          { title: 'Dieren', value: 'Dieren' },
          { title: 'Farmshop', value: 'Farmshop' },
          { title: 'Evenement', value: 'Evenement' },
          { title: 'Teelt', value: 'Teelt' },
          { title: 'Pers', value: 'Pers' },
          { title: 'Anders', value: 'Anders' },
        ],
      },
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'publishedAt',
      title: 'Publicatiedatum',
      type: 'datetime',
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'author',
      title: 'Auteur',
      type: 'string',
    }),
    defineField({
      name: 'excerpt',
      title: 'Inleiding / samenvatting',
      type: 'text',
      rows: 3,
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'readTime',
      title: 'Leestijd (minuten)',
      type: 'number',
    }),
    defineField({
      name: 'featuredImage',
      title: 'Uitgelichte afbeelding',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'body',
      title: 'Artikel-inhoud',
      type: 'array',
      of: [
        {
          type: 'block',
          styles: [
            { title: 'Normaal', value: 'normal' },
            { title: 'H2', value: 'h2' },
            { title: 'H3', value: 'h3' },
            { title: 'Citaat', value: 'blockquote' },
          ],
          marks: {
            decorators: [
              { title: 'Vet', value: 'strong' },
              { title: 'Cursief', value: 'em' },
            ],
          },
        },
        {
          type: 'image',
          options: { hotspot: true },
          fields: [
            { name: 'caption', title: 'Bijschrift', type: 'string' },
            { name: 'alt', title: 'Alt-tekst', type: 'string' },
          ],
        },
      ],
    }),
    defineField({
      name: 'relatedArticles',
      title: 'Gerelateerde artikelen',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'nieuwsArtikel' }] }],
      validation: Rule => Rule.max(3),
    }),
  ],
  preview: {
    select: { title: 'title', subtitle: 'publishedAt' },
    prepare({ title, subtitle }) {
      return {
        title,
        subtitle: subtitle ? new Date(subtitle).toLocaleDateString('nl-NL') : '',
      }
    },
  },
  orderings: [
    {
      title: 'Publicatiedatum nieuwste eerst',
      name: 'publishedAtDesc',
      by: [{ field: 'publishedAt', direction: 'desc' }],
    },
  ],
})
```

- [ ] **Step 2: Update `studio/schemas/index.ts`**

```ts
import siteSettings from './siteSettings'
import homePage from './homePage'
import boerderijPage from './boerderijPage'
import overOnsPage from './overOnsPage'
import contactPage from './contactPage'
import event from './event'
import nieuwsArtikel from './nieuwsArtikel'

export const schemaTypes = [
  siteSettings,
  homePage,
  boerderijPage,
  overOnsPage,
  contactPage,
  event,
  nieuwsArtikel,
]
```

- [ ] **Step 3: Verify all schemas in Studio**

```bash
cd studio && npx sanity dev
```

Expected: Studio lists all 7 document types. Stop with Ctrl+C.

- [ ] **Step 4: Commit**

```bash
git add studio/schemas/nieuwsArtikel.ts studio/schemas/index.ts
git commit -m "feat(sanity): add nieuwsArtikel schema — all schemas complete"
```

---

## Task 10: Seed Sanity content (manual)

This task is manual — it cannot be automated. Do it before running `nuxt generate`.

- [ ] **Step 1: Start Studio locally**

```bash
cd studio && npx sanity dev
```

Open `http://localhost:3333`.

- [ ] **Step 2: Create the `siteSettings` document**

In the Studio, create one `Site-instellingen` document with:
- Sitenaam: `Belevenisboerderij de Singel`
- Tagline: `Waar kleinschalige landbouw en wilde natuur samenkomen`
- Navigation: 5 items from `index.html` nav (De Boerderij `/de-boerderij`, Agenda `/agenda`, Nieuws `/nieuws`, Over ons `/over-ons`, Contact `/contact` — mark Contact as `isButton: true`)
- Eigenaren: Victor Duurland (Eigenaar), Mari Duurland (Eigenaar)
- Adres: from `contact.html`
- Coördinaten: lat `51.9479284`, lng `6.5100125`
- Farmshop openingstijden: `Zaterdag & zondag 10:00–17:00`
- Reactietijd: `Binnen 2 werkdagen`
- Copyright: `© 2026 Belevenisboerderij de Singel`

- [ ] **Step 3: Upload images to Sanity Assets**

For each image currently on `cdn.prod.website-files.com`:
1. Right-click the image URL in the existing HTML files → Save image to disk
2. In Studio, when filling in an image field, click the image picker and upload the saved file

- [ ] **Step 4: Create all page singleton documents**

Create one document for each: `Homepage`, `De Boerderij pagina`, `Over Ons pagina`, `Contact pagina`. Copy the text content from the corresponding `.html` files.

- [ ] **Step 5: Create event documents**

Create the events from `agenda.html`:
- Farmshop (recurring) — category: Farmshop open, date: 2026-04-04 (first occurrence), timeRange: 10:00 – 17:00, location: Bornerbroek
- Pinksterfeesten Bornerbroek — category: Markt, date: 2026-04-26, timeRange: 11:00 – 18:00, etc.
- Oldtimerdag Saasveld — category: Evenement, date: 2026-05-10
- Kermis Varsseveld — category: Kermis, date: 2026-05-23
- Kerstcircus Enschede — category: Circus, date: 2026-12-19

For Pinksterfeesten, also fill in the `body` Portable Text with content from `evenement/pinksterfeesten.html`.

- [ ] **Step 6: Create nieuwsArtikel documents**

Create the 6 news articles from `nieuws.html`. For `wagyu-seizoen`, fill in the `body` from `nieuws/wagyu-seizoen.html`.

---

## Task 11: `useImageUrl` composable

**Files:**
- Create: `composables/useImageUrl.ts`

- [ ] **Step 1: Create `composables/useImageUrl.ts`**

```ts
import imageUrlBuilder from '@sanity/image-url'
import { createClient } from '@sanity/client'
import type { SanityImageSource } from '@sanity/image-url/lib/types/types'

let _builder: ReturnType<typeof imageUrlBuilder> | null = null

export function useImageUrl() {
  if (!_builder) {
    const config = useRuntimeConfig()
    const client = createClient({
      projectId: config.public.sanity.projectId as string,
      dataset: config.public.sanity.dataset as string,
      apiVersion: '2024-01-01',
      useCdn: false,
    })
    _builder = imageUrlBuilder(client)
  }
  return (source: SanityImageSource) => _builder!.image(source)
}
```

- [ ] **Step 2: Verify nuxt.config.ts exposes Sanity config as public runtime config**

The `@nuxtjs/sanity` module automatically exposes `projectId` and `dataset` under `runtimeConfig.public.sanity`. Verify by checking that `config.public.sanity` is set after `nuxt dev` starts.

- [ ] **Step 3: Commit**

```bash
git add composables/useImageUrl.ts
git commit -m "feat: add useImageUrl composable"
```

---

## Task 12: Default layout

**Files:**
- Create: `layouts/default.vue`

- [ ] **Step 1: Create `layouts/default.vue`**

```vue
<script setup lang="ts">
</script>

<template>
  <div>
    <AppNav />
    <slot />
    <AppFooter />
  </div>
</template>
```

- [ ] **Step 2: Commit**

```bash
git add layouts/default.vue
git commit -m "feat: add default layout"
```

---

## Task 13: `AppNav` component

**Files:**
- Create: `components/AppNav.vue`

The navigation HTML structure comes from the `<nav>` block in `index.html` (the same nav appears on every page). Replace the static `<a>` links with `<NuxtLink>` and drive the items from Sanity.

- [ ] **Step 1: Create `components/AppNav.vue`**

```vue
<script setup lang="ts">
const QUERY = `*[_type == "siteSettings"][0]{ siteName, navigation }`

interface NavItem { label: string; href: string; isButton: boolean }
interface SiteSettings { siteName: string; navigation: NavItem[] }

const { data } = await useSanityQuery<SiteSettings>(QUERY)

const isMenuOpen = ref(false)
const isScrolled = ref(false)

function toggleMenu() {
  isMenuOpen.value = !isMenuOpen.value
  document.body.style.overflow = isMenuOpen.value ? 'hidden' : ''
}

function closeMenu() {
  isMenuOpen.value = false
  document.body.style.overflow = ''
}

onMounted(() => {
  const onScroll = () => { isScrolled.value = window.scrollY > 50 }
  window.addEventListener('scroll', onScroll, { passive: true })
  onUnmounted(() => window.removeEventListener('scroll', onScroll))
})
</script>

<template>
  <nav
    class="nav"
    :class="{ 'nav--open': isMenuOpen, 'nav--scrolled': isScrolled }"
  >
    <div class="nav__container">
      <NuxtLink to="/" class="nav__logo" @click="closeMenu">
        {{ data?.siteName }}
      </NuxtLink>

      <button
        class="nav__hamburger"
        :aria-expanded="isMenuOpen"
        aria-label="Menu openen"
        @click="toggleMenu"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      <ul class="nav__links">
        <li v-for="item in data?.navigation" :key="item.href">
          <NuxtLink
            :to="item.href"
            :class="item.isButton ? 'btn btn-green' : ''"
            @click="closeMenu"
          >
            {{ item.label }}
          </NuxtLink>
        </li>
      </ul>
    </div>
  </nav>
</template>
```

- [ ] **Step 2: Commit**

```bash
git add components/AppNav.vue
git commit -m "feat: add AppNav component"
```

---

## Task 14: `AppFooter` component

**Files:**
- Create: `components/AppFooter.vue`

Copy the footer HTML structure from `index.html` (the `<footer>` block). Drive nav links and copyright from Sanity.

- [ ] **Step 1: Create `components/AppFooter.vue`**

```vue
<script setup lang="ts">
const QUERY = `*[_type == "siteSettings"][0]{ siteName, footerCopyright, navigation }`

interface NavItem { label: string; href: string; isButton: boolean }
interface SiteSettings { siteName: string; footerCopyright: string; navigation: NavItem[] }

const { data } = await useSanityQuery<SiteSettings>(QUERY)
</script>

<template>
  <footer class="footer">
    <div class="footer__container">
      <NuxtLink to="/" class="footer__logo">
        {{ data?.siteName }}
      </NuxtLink>

      <nav class="footer__nav" aria-label="Footer navigatie">
        <ul>
          <li v-for="item in data?.navigation?.filter(n => !n.isButton)" :key="item.href">
            <NuxtLink :to="item.href">{{ item.label }}</NuxtLink>
          </li>
        </ul>
      </nav>

      <p class="footer__copyright">{{ data?.footerCopyright }}</p>
    </div>
  </footer>
</template>
```

- [ ] **Step 2: Commit**

```bash
git add components/AppFooter.vue
git commit -m "feat: add AppFooter component"
```

---

## Task 15: `AppLightbox` component

**Files:**
- Create: `components/AppLightbox.vue`

This replaces the inline JS lightbox from `index.html`.

- [ ] **Step 1: Create `components/AppLightbox.vue`**

```vue
<script setup lang="ts">
const props = defineProps<{
  images: Array<{ url: string; alt?: string }>
}>()

const activeIndex = ref<number | null>(null)

function open(index: number) {
  activeIndex.value = index
  document.body.style.overflow = 'hidden'
}

function close() {
  activeIndex.value = null
  document.body.style.overflow = ''
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') close()
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onUnmounted(() => window.removeEventListener('keydown', onKeydown))
</script>

<template>
  <div class="gallery">
    <div
      v-for="(img, i) in images"
      :key="i"
      class="gallery__item"
      @click="open(i)"
    >
      <img :src="img.url" :alt="img.alt || ''" loading="lazy" />
    </div>
  </div>

  <Teleport to="body">
    <div
      v-if="activeIndex !== null"
      class="lightbox"
      role="dialog"
      aria-modal="true"
      @click="close"
    >
      <img
        :src="images[activeIndex].url"
        :alt="images[activeIndex].alt || ''"
        class="lightbox__img"
        @click.stop
      />
    </div>
  </Teleport>
</template>
```

- [ ] **Step 2: Commit**

```bash
git add components/AppLightbox.vue
git commit -m "feat: add AppLightbox component"
```

---

## Task 16: Homepage (`pages/index.vue`)

**Files:**
- Create: `pages/index.vue`

Take the full HTML structure from `index.html`. Remove `<head>`, `<html>`, `<body>` tags — keep only the content inside `<body>`. Replace `<a href>` with `<NuxtLink to>`. Replace hardcoded content with Sanity data as shown below.

- [ ] **Step 1: Create `pages/index.vue`**

```vue
<script setup lang="ts">
useHead({ title: 'Home — Belevenisboerderij de Singel' })

const QUERY = `*[_type == "homePage"][0]{
  heroTitle,
  heroSubtitle,
  heroImage,
  primaryServices[]{ title, description, image, testimonialQuote, testimonialAuthor },
  secondaryServices[]{ title, description },
  galleryImages[],
  ctaPrimaryLabel,
  ctaPrimaryHref,
  ctaSecondaryLabel,
  ctaSecondaryHref
}`

interface Service { title: string; description: string; image?: any; testimonialQuote?: string; testimonialAuthor?: string }
interface HomePage {
  heroTitle: string
  heroSubtitle: string
  heroImage: any
  primaryServices: Service[]
  secondaryServices: Array<{ title: string; description: string }>
  galleryImages: any[]
  ctaPrimaryLabel: string
  ctaPrimaryHref: string
  ctaSecondaryLabel: string
  ctaSecondaryHref: string
}

const { data } = await useSanityQuery<HomePage>(QUERY)
const urlFor = useImageUrl()

// Gallery lightbox image list
const galleryItems = computed(() =>
  (data.value?.galleryImages ?? []).map(img => ({
    url: urlFor(img).width(1200).url(),
    alt: img.alt ?? '',
  }))
)

// Fixed CTA button visibility (show after hero, hide near contact section)
const showFixedCta = ref(false)
onMounted(() => {
  const hero = document.querySelector('.hero')
  const contact = document.querySelector('.contact-section, footer')
  if (!hero) return
  const observer = new IntersectionObserver(
    entries => { showFixedCta.value = !entries[0].isIntersecting },
    { threshold: 0 }
  )
  observer.observe(hero)
  onUnmounted(() => observer.disconnect())
})
</script>

<template>
  <!-- Preserve exact HTML from index.html for structure and class names.
       Replace hardcoded text/images with the bindings below. -->

  <section class="hero">
    <img
      v-if="data?.heroImage"
      :src="urlFor(data.heroImage).width(1600).url()"
      alt="Hero"
      class="hero__bg"
    />
    <div class="hero__content">
      <h1>{{ data?.heroTitle }}</h1>
      <p>{{ data?.heroSubtitle }}</p>
    </div>
  </section>

  <!-- Primary services (2 cards) -->
  <section class="intro">
    <div class="intro__grid">
      <div
        v-for="service in data?.primaryServices"
        :key="service.title"
        class="intro__card"
      >
        <img
          v-if="service.image"
          :src="urlFor(service.image).width(800).url()"
          :alt="service.title"
        />
        <h2>{{ service.title }}</h2>
        <p>{{ service.description }}</p>
        <blockquote v-if="service.testimonialQuote">
          <p>{{ service.testimonialQuote }}</p>
          <cite v-if="service.testimonialAuthor">— {{ service.testimonialAuthor }}</cite>
        </blockquote>
      </div>
    </div>
  </section>

  <!-- Secondary services grid (3 cards) -->
  <section class="services">
    <div class="services__grid">
      <div
        v-for="s in data?.secondaryServices"
        :key="s.title"
        class="services__card"
      >
        <h3>{{ s.title }}</h3>
        <p>{{ s.description }}</p>
      </div>
    </div>
  </section>

  <!-- Gallery -->
  <section class="gallery-section">
    <AppLightbox :images="galleryItems" />
  </section>

  <!-- CTA section -->
  <section class="cta-section">
    <NuxtLink :to="data?.ctaPrimaryHref" class="btn btn-green">
      {{ data?.ctaPrimaryLabel }}
    </NuxtLink>
    <NuxtLink :to="data?.ctaSecondaryHref" class="btn btn-yellow">
      {{ data?.ctaSecondaryLabel }}
    </NuxtLink>
  </section>

  <!-- Fixed CTA button -->
  <Transition name="fade">
    <NuxtLink
      v-show="showFixedCta"
      to="/contact"
      class="btn btn-green fixed-cta"
    >
      Neem contact op
    </NuxtLink>
  </Transition>
</template>
```

> **Note:** The class names in this template must exactly match those in `assets/css/style.css`. Cross-reference `index.html` and the CSS to ensure all section wrappers, grid classes, and card classes are correctly applied.

- [ ] **Step 2: Run dev server and visually check the homepage**

```bash
npm run dev
```

Open `http://localhost:3000`. Verify: hero image loads, both primary service cards show, 3 secondary cards show, gallery grid renders.

- [ ] **Step 3: Commit**

```bash
git add pages/index.vue
git commit -m "feat: homepage with Sanity content"
```

---

## Task 17: De Boerderij page (`pages/de-boerderij.vue`)

**Files:**
- Create: `pages/de-boerderij.vue`

Take the HTML structure from `de-boerderij.html`.

- [ ] **Step 1: Create `pages/de-boerderij.vue`**

```vue
<script setup lang="ts">
useHead({ title: 'De Boerderij — Belevenisboerderij de Singel' })

const QUERY = `*[_type == "boerderijPage"][0]{
  introTitle, introText, introImage,
  storyColumns,
  victorQuote,
  highlights[]{ title, description },
  fullWidthPhoto,
  ctaPrimaryLabel, ctaPrimaryHref,
  ctaSecondaryLabel, ctaSecondaryHref
}`

interface BoerderijPage {
  introTitle: string
  introText: string
  introImage: any
  storyColumns: string[]
  victorQuote: string
  highlights: Array<{ title: string; description: string }>
  fullWidthPhoto: any
  ctaPrimaryLabel: string
  ctaPrimaryHref: string
  ctaSecondaryLabel: string
  ctaSecondaryHref: string
}

const { data } = await useSanityQuery<BoerderijPage>(QUERY)
const urlFor = useImageUrl()
</script>

<template>
  <!-- Preserve HTML structure from de-boerderij.html -->

  <section class="page-intro">
    <div class="page-intro__text">
      <h1>{{ data?.introTitle }}</h1>
      <p>{{ data?.introText }}</p>
    </div>
    <div class="page-intro__image">
      <img
        v-if="data?.introImage"
        :src="urlFor(data.introImage).width(900).url()"
        :alt="data.introTitle"
      />
    </div>
  </section>

  <section class="story-section">
    <div class="story-section__grid">
      <p v-for="(col, i) in data?.storyColumns" :key="i">{{ col }}</p>
    </div>
  </section>

  <blockquote v-if="data?.victorQuote" class="quote-section">
    <p>{{ data.victorQuote }}</p>
    <cite>— Victor</cite>
  </blockquote>

  <section class="highlights-section">
    <div class="highlights-grid">
      <div v-for="h in data?.highlights" :key="h.title" class="highlights-card">
        <h3>{{ h.title }}</h3>
        <p>{{ h.description }}</p>
      </div>
    </div>
  </section>

  <div v-if="data?.fullWidthPhoto" class="full-width-photo">
    <img :src="urlFor(data.fullWidthPhoto).width(1600).url()" alt="" />
  </div>

  <section class="cta-section">
    <NuxtLink :to="data?.ctaPrimaryHref" class="btn btn-green">{{ data?.ctaPrimaryLabel }}</NuxtLink>
    <NuxtLink :to="data?.ctaSecondaryHref" class="btn btn-yellow">{{ data?.ctaSecondaryLabel }}</NuxtLink>
  </section>
</template>
```

- [ ] **Step 2: Commit**

```bash
git add pages/de-boerderij.vue
git commit -m "feat: de-boerderij page with Sanity content"
```

---

## Task 18: Over Ons page (`pages/over-ons.vue`)

**Files:**
- Create: `pages/over-ons.vue`

Take the HTML structure from `over-ons.html`.

- [ ] **Step 1: Create `pages/over-ons.vue`**

```vue
<script setup lang="ts">
useHead({ title: 'Over Ons — Belevenisboerderij de Singel' })

const QUERY = `*[_type == "overOnsPage"][0]{
  introTitle, introText, familyPhoto,
  storyTitle, storyColumns,
  victorQuote,
  values[]{ title, description },
  fullWidthPhoto,
  ctaPrimaryLabel, ctaPrimaryHref,
  ctaSecondaryLabel, ctaSecondaryHref
}`

interface OverOnsPage {
  introTitle: string
  introText: string
  familyPhoto: any
  storyTitle: string
  storyColumns: string[]
  victorQuote: string
  values: Array<{ title: string; description: string }>
  fullWidthPhoto: any
  ctaPrimaryLabel: string
  ctaPrimaryHref: string
  ctaSecondaryLabel: string
  ctaSecondaryHref: string
}

const { data } = await useSanityQuery<OverOnsPage>(QUERY)
const urlFor = useImageUrl()
</script>

<template>
  <!-- Preserve HTML structure from over-ons.html -->

  <section class="page-intro">
    <div class="page-intro__text">
      <h1>{{ data?.introTitle }}</h1>
      <p>{{ data?.introText }}</p>
    </div>
    <div class="page-intro__image about-photo-wrap">
      <img
        v-if="data?.familyPhoto"
        :src="urlFor(data.familyPhoto).width(900).url()"
        alt="Victor en Mari Duurland"
      />
      <!-- Show placeholder badge if no photo uploaded yet -->
      <div v-else class="photo-placeholder-badge">Familiefoto volgt</div>
    </div>
  </section>

  <section class="story-section">
    <h2>{{ data?.storyTitle }}</h2>
    <div class="story-section__grid">
      <p v-for="(col, i) in data?.storyColumns" :key="i">{{ col }}</p>
    </div>
  </section>

  <blockquote v-if="data?.victorQuote" class="quote-section">
    <p>{{ data.victorQuote }}</p>
    <cite>— Victor</cite>
  </blockquote>

  <section class="values-section">
    <div class="values-grid">
      <div v-for="v in data?.values" :key="v.title" class="values-card">
        <h3>{{ v.title }}</h3>
        <p>{{ v.description }}</p>
      </div>
    </div>
  </section>

  <div v-if="data?.fullWidthPhoto" class="full-width-photo">
    <img :src="urlFor(data.fullWidthPhoto).width(1600).url()" alt="" />
  </div>

  <section class="cta-section">
    <NuxtLink :to="data?.ctaPrimaryHref" class="btn btn-green">{{ data?.ctaPrimaryLabel }}</NuxtLink>
    <NuxtLink :to="data?.ctaSecondaryHref" class="btn btn-yellow">{{ data?.ctaSecondaryLabel }}</NuxtLink>
  </section>
</template>
```

- [ ] **Step 2: Commit**

```bash
git add pages/over-ons.vue
git commit -m "feat: over-ons page with Sanity content"
```

---

## Task 19: Contact page + Netlify Forms

**Files:**
- Create: `pages/contact.vue`
- Create: `public/netlify-forms.html`

- [ ] **Step 1: Create `public/netlify-forms.html`**

Netlify scans this file at deploy time to register the form. It must have the same `name` and field `name` attributes as the live form.

```html
<!DOCTYPE html>
<html>
  <body>
    <form name="contact" netlify netlify-honeypot="bot-field" hidden>
      <input name="Naam" type="text" />
      <input name="Email" type="email" />
      <input name="Telefoonnummer" type="tel" />
      <select name="Onderwerp">
        <option>Farmshop</option>
        <option>Boerderij op Locatie</option>
        <option>Evenement / Agenda</option>
        <option>Anders</option>
      </select>
      <textarea name="Bericht"></textarea>
      <input name="bot-field" />
    </form>
  </body>
</html>
```

- [ ] **Step 2: Create `pages/contact.vue`**

```vue
<script setup lang="ts">
useHead({ title: 'Contact — Belevenisboerderij de Singel' })

const QUERY = `*[_type == "contactPage"][0]{
  infoOwners, infoAddress, infoHours, infoResponseTime,
  subjectOptions, privacyNotice
}`

interface ContactPage {
  infoOwners: string
  infoAddress: string
  infoHours: string
  infoResponseTime: string
  subjectOptions: string[]
  privacyNotice: string
}

const SETTINGS_QUERY = `*[_type == "siteSettings"][0]{ coordinates }`
interface SiteSettings { coordinates: { lat: number; lng: number } }

const { data } = await useSanityQuery<ContactPage>(QUERY)
const { data: settings } = await useSanityQuery<SiteSettings>(SETTINGS_QUERY)

const formStatus = ref<'idle' | 'sending' | 'success' | 'error'>('idle')

async function handleSubmit(e: Event) {
  e.preventDefault()
  formStatus.value = 'sending'
  const form = e.target as HTMLFormElement
  const body = new URLSearchParams(new FormData(form) as any).toString()
  try {
    await fetch('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    })
    formStatus.value = 'success'
    form.reset()
  } catch {
    formStatus.value = 'error'
  }
}
</script>

<template>
  <!-- Preserve HTML structure from contact.html -->

  <section class="contact-page">
    <div class="contact-page__grid">

      <!-- Contact form -->
      <div class="contact-form-wrap">
        <h1>Contact</h1>

        <p v-if="formStatus === 'success'" class="form-success">
          Bedankt! We nemen zo snel mogelijk contact met je op.
        </p>
        <p v-else-if="formStatus === 'error'" class="form-error">
          Er is iets misgegaan. Probeer het opnieuw of mail ons direct.
        </p>

        <form
          v-else
          name="contact"
          method="POST"
          data-netlify="true"
          data-netlify-honeypot="bot-field"
          @submit="handleSubmit"
        >
          <input type="hidden" name="form-name" value="contact" />
          <p style="display:none"><label>Laat leeg: <input name="bot-field" /></label></p>

          <div class="form-field">
            <label for="naam">Naam *</label>
            <input id="naam" name="Naam" type="text" required />
          </div>

          <div class="form-field">
            <label for="email">E-mailadres *</label>
            <input id="email" name="Email" type="email" required />
          </div>

          <div class="form-field">
            <label for="telefoon">Telefoonnummer</label>
            <input id="telefoon" name="Telefoonnummer" type="tel" />
          </div>

          <div class="form-field">
            <label for="onderwerp">Onderwerp</label>
            <select id="onderwerp" name="Onderwerp">
              <option
                v-for="opt in data?.subjectOptions"
                :key="opt"
                :value="opt"
              >{{ opt }}</option>
            </select>
          </div>

          <div class="form-field">
            <label for="bericht">Bericht *</label>
            <textarea id="bericht" name="Bericht" rows="5" required></textarea>
          </div>

          <p v-if="data?.privacyNotice" class="form-privacy">{{ data.privacyNotice }}</p>

          <button type="submit" class="btn btn-green" :disabled="formStatus === 'sending'">
            {{ formStatus === 'sending' ? 'Versturen…' : 'Verstuur bericht' }}
          </button>
        </form>
      </div>

      <!-- Info sidebar -->
      <aside class="contact-info-card">
        <dl>
          <dt>Eigenaren</dt>
          <dd>{{ data?.infoOwners }}</dd>

          <dt>Adres</dt>
          <dd style="white-space: pre-line">{{ data?.infoAddress }}</dd>

          <dt>Farmshop</dt>
          <dd>{{ data?.infoHours }}</dd>

          <dt>Reactietijd</dt>
          <dd>{{ data?.infoResponseTime }}</dd>
        </dl>
        <NuxtLink to="/agenda" class="btn btn-yellow">Bekijk de agenda</NuxtLink>
      </aside>
    </div>

    <!-- Google Maps embed -->
    <div
      v-if="settings?.coordinates"
      class="contact-map"
    >
      <iframe
        :src="`https://maps.google.com/maps?q=${settings.coordinates.lat},${settings.coordinates.lng}&z=15&output=embed`"
        width="100%"
        height="400"
        style="border:0"
        loading="lazy"
        referrerpolicy="no-referrer-when-downgrade"
      ></iframe>
    </div>
  </section>
</template>
```

- [ ] **Step 3: Commit**

```bash
git add pages/contact.vue public/netlify-forms.html
git commit -m "feat: contact page with Netlify form and honeypot"
```

---

## Task 20: Agenda page (`pages/agenda.vue`)

**Files:**
- Create: `pages/agenda.vue`

Events are grouped by month using a computed property. Take the HTML structure from `agenda.html`.

- [ ] **Step 1: Create `pages/agenda.vue`**

```vue
<script setup lang="ts">
useHead({ title: 'Agenda — Belevenisboerderij de Singel' })

const QUERY = `*[_type == "event"] | order(date asc) {
  _id, title, slug, category, date, timeRange, location, description, externalLink
}`

interface AgendaEvent {
  _id: string
  title: string
  slug: { current: string }
  category: string
  date: string
  timeRange?: string
  location?: string
  description?: string
  externalLink?: string
}

const { data } = await useSanityQuery<AgendaEvent[]>(QUERY)

// Group events by month (Dutch locale)
const eventsByMonth = computed(() => {
  if (!data.value) return []
  const groups: { month: string; events: AgendaEvent[] }[] = []
  for (const event of data.value) {
    const month = new Date(event.date).toLocaleDateString('nl-NL', {
      month: 'long',
      year: 'numeric',
    })
    const existing = groups.find(g => g.month === month)
    if (existing) {
      existing.events.push(event)
    } else {
      groups.push({ month, events: [event] })
    }
  }
  return groups
})

function formatDay(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('nl-NL', { day: 'numeric' })
}

function formatWeekday(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('nl-NL', { weekday: 'short' })
}
</script>

<template>
  <!-- Preserve HTML structure from agenda.html -->

  <main class="agenda-page">
    <div v-for="group in eventsByMonth" :key="group.month" class="agenda-month">
      <h2 class="agenda-month__header">{{ group.month }}</h2>

      <article
        v-for="event in group.events"
        :key="event._id"
        class="agenda-item"
      >
        <div class="agenda-item__date">
          <span class="agenda-item__day">{{ formatDay(event.date) }}</span>
          <span class="agenda-item__weekday">{{ formatWeekday(event.date) }}</span>
        </div>

        <div class="agenda-item__content">
          <span class="agenda-item__label">{{ event.category }}</span>
          <h3 class="agenda-item__title">{{ event.title }}</h3>
          <p v-if="event.description" class="agenda-item__description">{{ event.description }}</p>

          <div class="agenda-item__meta">
            <span v-if="event.timeRange">🕐 {{ event.timeRange }}</span>
            <span v-if="event.location">📍 {{ event.location }}</span>
          </div>

          <div class="agenda-item__actions">
            <NuxtLink :to="`/evenement/${event.slug.current}`" class="btn btn-green">
              Lees meer
            </NuxtLink>
            <a
              v-if="event.externalLink"
              :href="event.externalLink"
              target="_blank"
              rel="noopener noreferrer"
              class="btn btn-yellow"
            >
              Externe website
            </a>
          </div>
        </div>
      </article>
    </div>

    <p v-if="!data?.length" class="agenda-empty">
      Er zijn momenteel geen evenementen gepland.
    </p>
  </main>
</template>
```

- [ ] **Step 2: Commit**

```bash
git add pages/agenda.vue
git commit -m "feat: agenda page with Sanity events, grouped by month"
```

---

## Task 21: Nieuws listing page (`pages/nieuws.vue`)

**Files:**
- Create: `pages/nieuws.vue`

Take the HTML structure from `nieuws.html`. The first article is featured large; the rest are in a grid/list.

- [ ] **Step 1: Create `pages/nieuws.vue`**

```vue
<script setup lang="ts">
useHead({ title: 'Nieuws — Belevenisboerderij de Singel' })

const QUERY = `*[_type == "nieuwsArtikel"] | order(publishedAt desc) {
  _id, title, slug, category, publishedAt, excerpt, featuredImage, readTime
}`

interface NieuwsItem {
  _id: string
  title: string
  slug: { current: string }
  category: string
  publishedAt: string
  excerpt: string
  featuredImage?: any
  readTime?: number
}

const { data } = await useSanityQuery<NieuwsItem[]>(QUERY)
const urlFor = useImageUrl()

const featured = computed(() => data.value?.[0])
const rest = computed(() => data.value?.slice(1) ?? [])

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('nl-NL', {
    day: 'numeric', month: 'long', year: 'numeric',
  })
}
</script>

<template>
  <!-- Preserve HTML structure from nieuws.html -->

  <main class="nieuws-page">

    <!-- Featured article (first result, large card) -->
    <section v-if="featured" class="nieuws-featured">
      <NuxtLink :to="`/nieuws/${featured.slug.current}`" class="nieuws-hero-card">
        <div class="nieuws-hero-card__image">
          <img
            v-if="featured.featuredImage"
            :src="urlFor(featured.featuredImage).width(900).url()"
            :alt="featured.title"
          />
        </div>
        <div class="nieuws-hero-card__content">
          <span class="nieuws-label">{{ featured.category }}</span>
          <time :datetime="featured.publishedAt">{{ formatDate(featured.publishedAt) }}</time>
          <h2>{{ featured.title }}</h2>
          <p>{{ featured.excerpt }}</p>
        </div>
      </NuxtLink>
    </section>

    <!-- News archive list -->
    <section class="nieuws-archive">
      <article
        v-for="item in rest"
        :key="item._id"
        class="nieuws-archive__item"
      >
        <NuxtLink :to="`/nieuws/${item.slug.current}`" class="nieuws-archive__link">
          <div class="nieuws-archive__image">
            <img
              v-if="item.featuredImage"
              :src="urlFor(item.featuredImage).width(400).url()"
              :alt="item.title"
            />
          </div>
          <div class="nieuws-archive__content">
            <span class="nieuws-label">{{ item.category }}</span>
            <time :datetime="item.publishedAt">{{ formatDate(item.publishedAt) }}</time>
            <h3>{{ item.title }}</h3>
            <p>{{ item.excerpt }}</p>
            <span v-if="item.readTime" class="nieuws-archive__readtime">
              {{ item.readTime }} min lezen
            </span>
          </div>
        </NuxtLink>
      </article>
    </section>
  </main>
</template>
```

- [ ] **Step 2: Commit**

```bash
git add pages/nieuws.vue
git commit -m "feat: nieuws listing page with Sanity articles"
```

---

## Task 22: Event detail page (`pages/evenement/[slug].vue`)

**Files:**
- Create: `pages/evenement/[slug].vue`

This is a dynamic route. Take the HTML structure from `evenement/pinksterfeesten.html`.

- [ ] **Step 1: Create `pages/evenement/[slug].vue`**

```vue
<script setup lang="ts">
import { PortableText } from '@portabletext/vue'

const route = useRoute()
const slug = route.params.slug as string

const QUERY = `*[_type == "event" && slug.current == $slug][0]{
  title, category, date, timeRange, location, featuredImage, body, externalLink, description
}`

interface EventDetail {
  title: string
  category: string
  date: string
  timeRange?: string
  location?: string
  featuredImage?: any
  body?: any[]
  externalLink?: string
  description?: string
}

const { data } = await useSanityQuery<EventDetail>(QUERY, { slug })

if (!data.value) {
  throw createError({ statusCode: 404, statusMessage: 'Evenement niet gevonden' })
}

useHead({ title: `${data.value?.title} — Belevenisboerderij de Singel` })

const urlFor = useImageUrl()

function formatFullDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('nl-NL', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })
}
</script>

<template>
  <!-- Preserve HTML structure from evenement/pinksterfeesten.html -->

  <article class="evenement-page">

    <!-- Hero image -->
    <div v-if="data?.featuredImage" class="evenement-hero">
      <img
        :src="urlFor(data.featuredImage).width(1600).url()"
        :alt="data.title"
        class="evenement-hero__img"
      />
    </div>

    <!-- Breadcrumb -->
    <nav class="breadcrumb" aria-label="Breadcrumb">
      <ol>
        <li><NuxtLink to="/">Home</NuxtLink></li>
        <li><NuxtLink to="/agenda">Agenda</NuxtLink></li>
        <li aria-current="page">{{ data?.title }}</li>
      </ol>
    </nav>

    <div class="evenement-layout">
      <!-- Main content -->
      <div class="evenement-main">
        <span class="evenement-label">{{ data?.category }}</span>
        <h1>{{ data?.title }}</h1>

        <ul class="evenement-chips">
          <li v-if="data?.date">{{ formatFullDate(data.date) }}</li>
          <li v-if="data?.timeRange">{{ data.timeRange }}</li>
          <li v-if="data?.location">{{ data.location }}</li>
        </ul>

        <div class="evenement-body">
          <PortableText v-if="data?.body?.length" :value="data.body" />
          <p v-else-if="data?.description">{{ data.description }}</p>
        </div>

        <NuxtLink to="/contact" class="btn btn-green">Neem contact op</NuxtLink>
      </div>

      <!-- Sidebar info card -->
      <aside class="evenement-sidebar">
        <dl class="evenement-info-card">
          <dt>Datum</dt>
          <dd>{{ data?.date ? formatFullDate(data.date) : '—' }}</dd>
          <dt>Tijd</dt>
          <dd>{{ data?.timeRange ?? '—' }}</dd>
          <dt>Locatie</dt>
          <dd>{{ data?.location ?? '—' }}</dd>
          <dt>Type</dt>
          <dd>{{ data?.category }}</dd>
        </dl>

        <div class="evenement-sidebar__actions">
          <NuxtLink to="/contact" class="btn btn-green">Contact</NuxtLink>
          <a
            v-if="data?.externalLink"
            :href="data.externalLink"
            target="_blank"
            rel="noopener noreferrer"
            class="btn btn-yellow"
          >
            Externe website
          </a>
        </div>
      </aside>
    </div>
  </article>
</template>
```

- [ ] **Step 2: Commit**

```bash
git add pages/evenement/
git commit -m "feat: event detail page with dynamic routing"
```

---

## Task 23: News article detail page (`pages/nieuws/[slug].vue`)

**Files:**
- Create: `pages/nieuws/[slug].vue`

Take the HTML structure from `nieuws/wagyu-seizoen.html`.

- [ ] **Step 1: Create `pages/nieuws/[slug].vue`**

```vue
<script setup lang="ts">
import { PortableText } from '@portabletext/vue'

const route = useRoute()
const slug = route.params.slug as string

const QUERY = `*[_type == "nieuwsArtikel" && slug.current == $slug][0]{
  title, category, publishedAt, author, excerpt, readTime, featuredImage, body,
  "relatedArticles": relatedArticles[]->{ title, slug, category, publishedAt, excerpt, featuredImage }
}`

interface NieuwsArtikel {
  title: string
  category: string
  publishedAt: string
  author?: string
  excerpt: string
  readTime?: number
  featuredImage?: any
  body?: any[]
  relatedArticles?: Array<{
    title: string
    slug: { current: string }
    category: string
    publishedAt: string
    excerpt: string
    featuredImage?: any
  }>
}

const { data } = await useSanityQuery<NieuwsArtikel>(QUERY, { slug })

if (!data.value) {
  throw createError({ statusCode: 404, statusMessage: 'Artikel niet gevonden' })
}

useHead({ title: `${data.value?.title} — Belevenisboerderij de Singel` })

const urlFor = useImageUrl()

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('nl-NL', {
    day: 'numeric', month: 'long', year: 'numeric',
  })
}
</script>

<template>
  <!-- Preserve HTML structure from nieuws/wagyu-seizoen.html -->

  <article class="artikel-page">

    <!-- Hero image -->
    <div v-if="data?.featuredImage" class="artikel-hero">
      <img
        :src="urlFor(data.featuredImage).width(1600).url()"
        :alt="data.title"
        class="artikel-hero__img"
      />
    </div>

    <!-- Breadcrumb -->
    <nav class="breadcrumb" aria-label="Breadcrumb">
      <ol>
        <li><NuxtLink to="/">Home</NuxtLink></li>
        <li><NuxtLink to="/nieuws">Nieuws</NuxtLink></li>
        <li aria-current="page">{{ data?.title }}</li>
      </ol>
    </nav>

    <div class="artikel-layout">
      <!-- Main content -->
      <div class="artikel-main">
        <span class="nieuws-label">{{ data?.category }}</span>
        <time :datetime="data?.publishedAt">{{ data?.publishedAt ? formatDate(data.publishedAt) : '' }}</time>
        <h1>{{ data?.title }}</h1>
        <p class="artikel-lead">{{ data?.excerpt }}</p>

        <div class="artikel-body">
          <PortableText v-if="data?.body?.length" :value="data.body" />
        </div>
      </div>

      <!-- Sidebar -->
      <aside class="artikel-sidebar">
        <!-- Article info card -->
        <dl class="artikel-info-card">
          <dt>Categorie</dt>
          <dd>{{ data?.category }}</dd>
          <dt>Gepubliceerd</dt>
          <dd>{{ data?.publishedAt ? formatDate(data.publishedAt) : '—' }}</dd>
          <dt v-if="data?.author">Auteur</dt>
          <dd v-if="data?.author">{{ data.author }}</dd>
          <dt v-if="data?.readTime">Leestijd</dt>
          <dd v-if="data?.readTime">{{ data.readTime }} minuten</dd>
        </dl>

        <!-- Related articles -->
        <div v-if="data?.relatedArticles?.length" class="related-articles">
          <h3>Meer artikelen</h3>
          <ul>
            <li v-for="rel in data.relatedArticles" :key="rel.slug.current">
              <NuxtLink :to="`/nieuws/${rel.slug.current}`">
                <img
                  v-if="rel.featuredImage"
                  :src="urlFor(rel.featuredImage).width(200).url()"
                  :alt="rel.title"
                />
                <span class="nieuws-label">{{ rel.category }}</span>
                <strong>{{ rel.title }}</strong>
              </NuxtLink>
            </li>
          </ul>
        </div>
      </aside>
    </div>

    <!-- CTA section -->
    <section class="cta-section">
      <NuxtLink to="/nieuws" class="btn btn-green">Meer van de boerderij</NuxtLink>
    </section>
  </article>
</template>
```

- [ ] **Step 2: Commit**

```bash
git add pages/nieuws/
git commit -m "feat: news article detail page with Portable Text body"
```

---

## Task 24: Full build verification

**Files:** None (verification only)

- [ ] **Step 1: Run `nuxt generate`**

```bash
npm run build
```

Expected: Completes without errors. Output includes lines like:
```
ℹ Generating routes...
✓ Generated /
✓ Generated /de-boerderij
✓ Generated /over-ons
✓ Generated /agenda
✓ Generated /nieuws
✓ Generated /contact
✓ Generated /evenement/pinksterfeesten
✓ Generated /evenement/oldtimerdag-saasveld
✓ Generated /nieuws/wagyu-seizoen
...
```

If the build fails with a Sanity auth error, ensure `.env` has the correct `SANITY_PROJECT_ID` and that the dataset is set to `production`.

- [ ] **Step 2: Verify all HTML files exist in output**

```bash
ls .output/public/
ls .output/public/evenement/
ls .output/public/nieuws/
```

Expected: `index.html`, `de-boerderij/index.html`, `over-ons/index.html`, `agenda/index.html`, `nieuws/index.html`, `contact/index.html`, plus one directory per event slug and one per article slug.

- [ ] **Step 3: Serve and visually inspect all pages**

```bash
npm run preview
```

Open `http://localhost:3000` and manually check every page:
- [ ] Homepage: hero, services, gallery (click to open lightbox), CTA buttons
- [ ] De Boerderij: intro, story columns, quote, highlights, CTA
- [ ] Over Ons: intro, family photo (or placeholder badge), values, quote, CTA
- [ ] Agenda: events grouped by month, "Lees meer" links navigate correctly
- [ ] Nieuws: featured card, archive list, article links navigate correctly
- [ ] Contact: form renders, submit goes through (requires live Netlify deploy for actual submission)
- [ ] `/evenement/<slug>`: hero, breadcrumb, chips, body content, sidebar
- [ ] `/nieuws/<slug>`: hero, breadcrumb, body content, sidebar with related articles
- [ ] Navigation hamburger menu on mobile viewport (375px)
- [ ] Footer copyright and links

- [ ] **Step 4: Final commit**

```bash
git add .
git commit -m "chore: verified full static build"
```

---

## Task 25: Deploy to Netlify and verify form

- [ ] **Step 1: Push to your connected Git remote**

```bash
git push origin master
```

Expected: Netlify auto-deploy triggers.

- [ ] **Step 2: Verify Netlify build succeeds**

In Netlify dashboard → Deploys: watch the build log. Expected: `Build succeeded` with `nuxt generate` output.

- [ ] **Step 3: Test Netlify form submission**

Navigate to `/contact` on the live URL. Fill in the form and submit.

Expected: Netlify dashboard → Forms → `contact` shows the submission.

- [ ] **Step 4: Verify Sanity webhook triggers rebuild**

In Sanity Studio, update any field on the `siteSettings` document and click Publish.

Expected within 5 minutes: Netlify dashboard → Deploys shows a new deploy triggered by webhook.

---

## Notes

**Class name alignment:** The Vue templates above use class names that must match the existing CSS in `assets/css/`. Cross-reference each component and page with its source `.html` file and the corresponding `.css` file to ensure all class names are correct. The CSS is not modified — only the HTML structure is ported into Vue templates.

**Unused HTML files:** Once all pages are migrated and the Nuxt build passes, the original `.html` files (`index.html`, `over-ons.html`, `de-boerderij.html`, `agenda.html`, `nieuws.html`, `contact.html`, `evenement/pinksterfeesten.html`, `nieuws/wagyu-seizoen.html`) can be deleted from the repo root.

**`@nuxtjs/sanity` runtime config:** The module exposes `projectId` and `dataset` under `runtimeConfig.public.sanity`. If `useImageUrl.ts` cannot resolve these, check `nuxt.config.ts` to confirm the `sanity:` block is present.
