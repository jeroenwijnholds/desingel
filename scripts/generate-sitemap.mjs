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
