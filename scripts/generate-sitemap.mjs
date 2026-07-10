/**
 * Genereert sitemap.xml + robots.txt in .output/public, ná `nuxt generate`
 * (gekoppeld via het build-script in package.json). Leest de routes uit de
 * daadwerkelijk geprerenderde HTML-bestanden, dus de sitemap kan nooit uit
 * de pas lopen met wat er echt gedeployd wordt.
 *
 * De site-URL komt uit NUXT_PUBLIC_SITE_URL (door CI gezet, incl. het
 * /desingel/-subpad zolang de site op github.io draait).
 */
import { readdirSync, writeFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'

const OUT = '.output/public'
const SITE_URL = (process.env.NUXT_PUBLIC_SITE_URL || 'https://jeroenwijnholds.github.io/desingel').replace(/\/$/, '')

// Pagina's die niet geïndexeerd moeten worden (bedankt heeft ook noindex)
const EXCLUDE = new Set(['/bedankt'])

if (!existsSync(OUT)) {
  console.error(`generate-sitemap: ${OUT} bestaat niet — eerst \`nuxt generate\` draaien`)
  process.exit(1)
}

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

const routes = collectRoutes(OUT)
  .filter(r => !EXCLUDE.has(r))
  .sort()

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes.map(r => `  <url><loc>${SITE_URL}${r === '/' ? '/' : r}</loc></url>`).join('\n')}
</urlset>
`

const robots = `User-agent: *
Allow: /
Disallow: /bedankt

Sitemap: ${SITE_URL}/sitemap.xml
`

writeFileSync(join(OUT, 'sitemap.xml'), sitemap)
writeFileSync(join(OUT, 'robots.txt'), robots)
console.log(`sitemap.xml (${routes.length} routes) + robots.txt geschreven voor ${SITE_URL}`)
