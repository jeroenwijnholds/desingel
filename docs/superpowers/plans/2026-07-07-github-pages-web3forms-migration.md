# GitHub Pages + Web3Forms Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move hosting of the desingel site from Netlify (credit-based, ~20 deploys/month free) to GitHub Pages (free, 2000 Actions-minutes/month), and replace Netlify Forms with Web3Forms, while keeping the existing publish pipeline: Sanity publish → webhook → rebuild → fresh static HTML.

**Architecture:** Fully static `nuxt generate` output (`.output/public`) deployed by a GitHub Actions workflow to GitHub Pages. The workflow triggers on `push` to `master`, on `repository_dispatch` (fired by the Sanity webhook via the GitHub API), and manually via `workflow_dispatch`. The contact form POSTs directly to the Web3Forms API (no backend), then redirects to the existing `/bedankt` page.

**Tech Stack:** Nuxt 4 (`nuxt generate`, static preset), Sanity (unchanged), GitHub Actions (`actions/configure-pages@v5`, `actions/upload-pages-artifact@v3`, `actions/deploy-pages@v4`), Web3Forms (form-to-email API).

## Global Constraints

- Repository: `https://github.com/jeroenwijnholds/desingel.git`, default branch `master`.
- Node version: 20 (was pinned in `netlify.toml`, must be pinned in the workflow).
- Build command stays `npx nuxt generate`; deployable output directory is `.output/public`.
- The site must work both on the default project URL (`https://jeroenwijnholds.github.io/desingel/`) and on a custom domain. Never hardcode a base path or absolute site URL; derive the base path from `actions/configure-pages` output (`NUXT_APP_BASE_URL`) and derive the form redirect URL client-side from `window.location.origin` + `useRuntimeConfig().app.baseURL`.
- Sanity env var names stay `SANITY_PROJECT_ID` and `SANITY_DATASET` (read in `nuxt.config.ts`). The Web3Forms key uses Nuxt's public runtime config convention: `NUXT_PUBLIC_WEB3FORMS_KEY`.
- Sanity `useCdn: false` stays as-is (build-time fetches must see freshly published content immediately).
- All user-facing copy is Dutch (nl-NL).
- This project has no automated test suite; every task's "test" is a build-and-inspect verification with exact commands and expected output. Do not introduce a test framework.
- Local verification commands run in Git Bash on Windows. A populated `.env` (SANITY_PROJECT_ID, SANITY_DATASET) exists in the repo root (gitignored).

---

### Task 1: Revert ISR to fully static output

The last commit (`a992101`) set `routeRules: { '/**': { isr: 60 } }` and `nitro: { preset: 'netlify' }`. On GitHub Pages there is no server runtime, so every route must be prerendered. Removing both restores plain static generation.

**Files:**
- Modify: `nuxt.config.ts:41-45`

**Interfaces:**
- Consumes: nothing.
- Produces: `npx nuxt generate` writes a complete static site to `.output/public` (all routes as `.html` files, no server functions). Task 4's workflow relies on this output path.

- [ ] **Step 1: Remove the ISR route rules and the netlify preset**

In `nuxt.config.ts`, delete these lines:

```ts
  routeRules: {
    '/**': { isr: 60 },
  },

  nitro: { preset: 'netlify' },
```

so the config ends:

```ts
  app: {
    head: {
      // ... (unchanged)
    },
  },

  typescript: { strict: true },
})
```

- [ ] **Step 2: Verify a full static build**

Run:

```bash
npx nuxt generate
```

Expected: build succeeds; output lists prerendered routes. Then confirm all pages exist as HTML and no Netlify/server output was produced:

```bash
ls .output/public/index.html .output/public/agenda/index.html .output/public/contact/index.html .output/public/bedankt/index.html
ls .output/server 2>/dev/null || echo "OK: no server output"
```

Expected: the four `index.html` paths print; last line prints `OK: no server output`.

- [ ] **Step 3: Commit**

```bash
git add nuxt.config.ts
git commit -m "revert: drop ISR/netlify preset, back to fully static generate"
```

---

### Task 2: Replace Netlify Forms with Web3Forms

Web3Forms is a form-to-email API: the form POSTs to `https://api.web3forms.com/submit` with a public `access_key`, Web3Forms emails the submission and redirects the visitor to the URL in the `redirect` field. Its honeypot is a hidden checkbox named `botcheck`. The access key is public by design (it is visible in the HTML of any Web3Forms site), so it can live in public runtime config.

**Files:**
- Modify: `nuxt.config.ts` (add `runtimeConfig`)
- Modify: `pages/contact.vue:34-46`
- Delete: `public/netlify-forms.html`
- Modify: `.env`, `.env.example` (add `NUXT_PUBLIC_WEB3FORMS_KEY`)

**Interfaces:**
- Consumes: nothing from other tasks.
- Produces: the generated contact page posts to Web3Forms; the build reads `NUXT_PUBLIC_WEB3FORMS_KEY` at build time (Task 4's workflow must pass it as an env var).

- [ ] **Step 1: Add public runtime config for the Web3Forms key**

In `nuxt.config.ts`, add below the `sanity` block:

```ts
  runtimeConfig: {
    public: {
      // ingevuld via NUXT_PUBLIC_WEB3FORMS_KEY tijdens de build
      web3formsKey: '',
    },
  },
```

- [ ] **Step 2: Add the key to env files**

Append to `.env.example`:

```
NUXT_PUBLIC_WEB3FORMS_KEY=your-web3forms-access-key
```

Append to `.env` (real key comes later — see Task 5; use the placeholder for now):

```
NUXT_PUBLIC_WEB3FORMS_KEY=PLACEHOLDER_KEY
```

- [ ] **Step 3: Rewrite the form element in `pages/contact.vue`**

In the `<script setup>` block, add after the `useSanityQuery` call:

```ts
const config = useRuntimeConfig()
const redirectUrl = ref('')
onMounted(() => {
  redirectUrl.value = new URL(`${config.app.baseURL}bedankt`, window.location.origin).href
})
```

Replace the opening form tag and Netlify-specific hidden fields (lines 34–46, from `<form` through the closing `</p>` of the bot-field paragraph):

```html
        <form
          class="contact-form"
          method="POST"
          action="https://api.web3forms.com/submit"
          novalidate
        >
          <input type="hidden" name="access_key" :value="config.public.web3formsKey" />
          <input type="hidden" name="redirect" :value="redirectUrl" />
          <input type="hidden" name="subject" value="Nieuw bericht via het contactformulier" />
          <input type="hidden" name="from_name" value="Belevenisboerderij de Singel" />
          <input type="checkbox" name="botcheck" class="visually-hidden" tabindex="-1" autocomplete="off" aria-hidden="true" />
```

Everything from the first `<div class="form-row form-row--two">` onward stays unchanged (field names `naam`, `email`, `telefoonnummer`, `onderwerp`, `bericht` are passed through verbatim in the Web3Forms email; `email` doubles as reply-to).

- [ ] **Step 4: Delete the Netlify Forms registration file**

```bash
git rm public/netlify-forms.html
```

- [ ] **Step 5: Verify the generated contact page**

Run:

```bash
npx nuxt generate
grep -o 'action="https://api.web3forms.com/submit"' .output/public/contact/index.html
grep -o 'name="access_key"' .output/public/contact/index.html
grep -c 'data-netlify' .output/public/contact/index.html || echo "OK: no netlify attrs"
ls .output/public/netlify-forms.html 2>/dev/null || echo "OK: netlify-forms.html gone"
```

Expected: first two greps print their match once; third prints `OK: no netlify attrs` (grep exits non-zero on zero matches); last prints `OK: netlify-forms.html gone`.

- [ ] **Step 6: Commit**

```bash
git add nuxt.config.ts pages/contact.vue .env.example
git commit -m "feat: replace Netlify Forms with Web3Forms on contact page"
```

---

### Task 3: Add the GitHub Actions deploy workflow, remove Netlify config

`actions/configure-pages` outputs `base_path`: empty string when a custom domain is configured, `/desingel` on the default project URL. Passing `${{ steps.pages.outputs.base_path }}/` as `NUXT_APP_BASE_URL` (Nuxt's built-in env override for `app.baseURL`) makes the same workflow correct in both cases (`/` or `/desingel/`).

**Files:**
- Create: `.github/workflows/deploy.yml`
- Delete: `netlify.toml`
- Modify: `.gitignore` (drop the `.netlify` entry)

**Interfaces:**
- Consumes: static output contract from Task 1 (`.output/public`), build-time env contract from Task 2 (`NUXT_PUBLIC_WEB3FORMS_KEY`).
- Produces: workflow named `deploy.yml` triggering on `push` (master), `repository_dispatch` type `sanity-publish`, and `workflow_dispatch`. Task 4 sets the repo variables it reads: `SANITY_PROJECT_ID`, `SANITY_DATASET`, `WEB3FORMS_ACCESS_KEY`. Task 5's Sanity webhook fires the `sanity-publish` dispatch.

- [ ] **Step 1: Create `.github/workflows/deploy.yml`**

```yaml
name: Deploy naar GitHub Pages

on:
  push:
    branches: [master]
  repository_dispatch:
    types: [sanity-publish]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

# Bij snel opeenvolgende Sanity-publishes wordt een lopende build
# geannuleerd en vervangen door de nieuwste — scheelt Actions-minuten.
concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm

      - run: npm ci

      - name: Configure Pages
        id: pages
        uses: actions/configure-pages@v5

      - name: Build static site
        run: npx nuxt generate
        env:
          SANITY_PROJECT_ID: ${{ vars.SANITY_PROJECT_ID }}
          SANITY_DATASET: ${{ vars.SANITY_DATASET }}
          NUXT_APP_BASE_URL: ${{ steps.pages.outputs.base_path }}/
          NUXT_PUBLIC_WEB3FORMS_KEY: ${{ vars.WEB3FORMS_ACCESS_KEY }}

      - uses: actions/upload-pages-artifact@v3
        with:
          path: .output/public

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

- [ ] **Step 2: Remove Netlify config**

```bash
git rm netlify.toml
rm -rf .netlify
```

In `.gitignore`, delete these two lines:

```
# Local Netlify folder
.netlify
```

- [ ] **Step 3: Verify workflow YAML parses**

Run:

```bash
npx --yes yaml-lint .github/workflows/deploy.yml 2>/dev/null || node -e "const yaml=require('js-yaml');yaml.load(require('fs').readFileSync('.github/workflows/deploy.yml','utf8'));console.log('YAML OK')" 2>/dev/null || python -c "import yaml,sys;yaml.safe_load(open('.github/workflows/deploy.yml'));print('YAML OK')"
```

Expected: `YAML OK` (any one of the three parsers suffices; they fall through automatically).

- [ ] **Step 4: Commit (do not push yet — repo variables come first in Task 4)**

```bash
git add .github/workflows/deploy.yml .gitignore
git commit -m "feat: deploy to GitHub Pages via Actions, remove Netlify config"
```

---

### Task 4: Enable GitHub Pages, set repo variables, push, verify deploy

**Files:** none (GitHub-side configuration via `gh` CLI, plus the push).

**Interfaces:**
- Consumes: workflow from Task 3; variable names `SANITY_PROJECT_ID`, `SANITY_DATASET`, `WEB3FORMS_ACCESS_KEY`.
- Produces: live site at `https://jeroenwijnholds.github.io/desingel/`. Task 5 points the Sanity webhook at this repo.

- [ ] **Step 1: Enable Pages with GitHub Actions as source**

```bash
gh api -X POST repos/jeroenwijnholds/desingel/pages -f build_type=workflow 2>/dev/null || gh api -X PUT repos/jeroenwijnholds/desingel/pages -f build_type=workflow
```

Expected: JSON response containing `"build_type": "workflow"` (POST creates; PUT updates if Pages already existed).

- [ ] **Step 2: Set repository variables**

Read the real values from the local `.env` (never echo them into the plan/commit), then:

```bash
gh variable set SANITY_PROJECT_ID --repo jeroenwijnholds/desingel --body "<waarde uit .env>"
gh variable set SANITY_DATASET --repo jeroenwijnholds/desingel --body "production"
gh variable set WEB3FORMS_ACCESS_KEY --repo jeroenwijnholds/desingel --body "PLACEHOLDER_KEY"
```

Expected: each command prints a confirmation. `WEB3FORMS_ACCESS_KEY` gets its real value in Task 5; the placeholder lets the first deploy succeed.

- [ ] **Step 3: Push and watch the workflow**

```bash
git push origin master
gh run watch --repo jeroenwijnholds/desingel --exit-status
```

Expected: workflow `Deploy naar GitHub Pages` completes with exit code 0 (both `build` and `deploy` jobs green).

- [ ] **Step 4: Verify the live site**

```bash
curl -sL -o /dev/null -w "%{http_code}\n" https://jeroenwijnholds.github.io/desingel/
curl -sL https://jeroenwijnholds.github.io/desingel/contact/ | grep -o 'api.web3forms.com/submit'
curl -sL https://jeroenwijnholds.github.io/desingel/agenda/ | grep -io 'agenda' | head -1
```

Expected: `200`, then `api.web3forms.com/submit`, then `agenda` (case-insensitive match). Also click through the site manually once: navigation, CSS, and Sanity-CDN images must load correctly under the `/desingel/` base path.

---

### Task 5: Switch over Sanity webhook and Web3Forms key (user actions, guided)

These steps need accounts/credentials only the owner has. Execute what is possible; present the rest as a short checklist with exact values.

**Files:** none.

**Interfaces:**
- Consumes: live workflow from Task 4 (`repository_dispatch` type `sanity-publish`).
- Produces: publish-in-Sanity triggers a Pages deploy; contact form delivers email.

- [ ] **Step 1: Create a Web3Forms access key (user)**

At https://web3forms.com: enter the destination email address (the inbox that should receive contact-form submissions) → "Create Access Key" → the key arrives by email. Then update the variable and local env:

```bash
gh variable set WEB3FORMS_ACCESS_KEY --repo jeroenwijnholds/desingel --body "<echte-key>"
```

and replace `PLACEHOLDER_KEY` in the local `.env`.

- [ ] **Step 2: Create a fine-grained GitHub PAT for the webhook (user)**

GitHub → Settings → Developer settings → Fine-grained tokens → Generate new token:
- Repository access: **Only select repositories** → `jeroenwijnholds/desingel`
- Permissions: **Contents: Read and write** (required for the `dispatches` endpoint)
- Expiration: 1 year (add a calendar reminder to rotate)

- [ ] **Step 3: Repoint the Sanity webhook (user)**

At https://sanity.io/manage → project → API → Webhooks, edit the existing Netlify build-hook webhook (or create a new one and delete the old):
- URL: `https://api.github.com/repos/jeroenwijnholds/desingel/dispatches`
- HTTP method: `POST`
- HTTP headers:
  - `Authorization: Bearer <PAT uit stap 2>`
  - `Accept: application/vnd.github+json`
- Trigger on: Create, Update, Delete
- Filter: `_type in ["event", "nieuwsArtikel", "siteSettings", "homePage", "boerderijPage", "overOnsPage", "contactPage"]`
- Projection: `{"event_type": "sanity-publish"}`
- Drafts: disabled (only published documents)

- [ ] **Step 4: Verify end-to-end (user + agent)**

1. Publish a trivial change in Sanity Studio (e.g. edit a text field, publish, revert later).
2. Confirm a new run appears: `gh run list --repo jeroenwijnholds/desingel --limit 3` — expected: a run with event `repository_dispatch`.
3. After it goes green, confirm the change is visible on the live site.
4. Submit the contact form once on the live site — expected: redirect to `/bedankt` and an email in the configured inbox.

- [ ] **Step 5: Rebuild with the real Web3Forms key**

After Step 1's variable update, trigger a rebuild so the real key is baked into the HTML:

```bash
gh workflow run deploy.yml --repo jeroenwijnholds/desingel
gh run watch --repo jeroenwijnholds/desingel --exit-status
```

Expected: exit code 0; `curl -sL https://jeroenwijnholds.github.io/desingel/contact/ | grep -o 'PLACEHOLDER_KEY' || echo "OK: echte key actief"` prints `OK: echte key actief`.

---

### Task 6: Decommission Netlify (user, after everything is verified)

**Files:** none.

**Interfaces:**
- Consumes: verified live site + working webhook from Task 5.
- Produces: no more credit consumption; single hosting source of truth.

- [ ] **Step 1: Netlify dashboard (user)**

1. If a custom domain points at Netlify: first add it under GitHub repo → Settings → Pages → Custom domain, set the DNS CNAME to `jeroenwijnholds.github.io`, wait for the certificate, and re-run the deploy workflow (the `configure-pages` step then builds with base path `/`). Only then continue.
2. Site settings → delete the old Sanity→Netlify build hook.
3. Delete the Netlify site (or at minimum: Site settings → Build & deploy → Stop builds).

- [ ] **Step 2: Confirm no stray rebuilds**

Publish once more in Sanity; confirm only a GitHub Actions run fires and the Netlify dashboard shows no new deploy.

---

## Self-Review

- **Spec coverage:** revert ISR (Task 1), Web3Forms replacement incl. redirect + honeypot + `/bedankt` (Task 2), GitHub Actions + `repository_dispatch` for the Sanity webhook (Tasks 3+5), hosting switch + Netlify teardown (Tasks 4+6). Base-path handling for both project-URL and custom-domain covered via `configure-pages`.
- **Placeholder scan:** the only literal `PLACEHOLDER_KEY` is intentional (real key is a user credential, swapped in Task 5 with a rebuild in its Step 5).
- **Type consistency:** env/variable names consistent across tasks (`SANITY_PROJECT_ID`, `SANITY_DATASET`, `WEB3FORMS_ACCESS_KEY` ↔ `NUXT_PUBLIC_WEB3FORMS_KEY`, dispatch type `sanity-publish`, output dir `.output/public`).
