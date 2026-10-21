/**
 * Voegt na `nuxt generate` een Content-Security-Policy toe aan elke HTML-
 * pagina in .output/public, als <meta http-equiv> (GitHub Pages kan geen
 * headers zetten).
 *
 * Inline scripts die Nuxt zelf genereert (importmap, window.__NUXT__-config)
 * krijgen een sha256-hash, dus script-src kan zonder 'unsafe-inline': een
 * geïnjecteerd <script> wordt dan niet uitgevoerd. JSON-blokken
 * (application/json, ld+json) worden niet uitgevoerd en vallen buiten CSP.
 *
 * Een meta-CSP geldt alleen voor wat ná de tag komt; daarom direct na
 * <meta charset>. frame-ancestors en rapportage kunnen niet via meta.
 */
import { createHash } from 'node:crypto'
import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const OUT = '.output/public'

// Umami-statistiek (plugins/analytics.ts): het scriptdomein mag scripts
// leveren. De (cookieloze) paginaweergaven gaan bij Umami Cloud naar een
// aparte gateway (staat hardcoded in cloud.umami.is/script.js); bij een eigen
// Umami-server naar het scriptdomein zelf.
const umami = process.env.NUXT_PUBLIC_UMAMI_WEBSITE_ID
  ? new URL(process.env.NUXT_PUBLIC_UMAMI_SCRIPT_URL || 'https://cloud.umami.is/script.js').origin
  : ''
const umamiSend = umami === 'https://cloud.umami.is' ? 'https://gateway.umami.is' : umami

const STATIC_DIRECTIVES = [
  "default-src 'self'",
  // Inline style-attributen (hero-achtergrond, hotspot-uitsnede) vereisen 'unsafe-inline'
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https://cdn.sanity.io",
  "font-src 'self' data:",
  // Sanity-API (alleen als er geen payload is) en het contactformulier
  `connect-src 'self' https://*.api.sanity.io https://*.apicdn.sanity.io https://api.web3forms.com${umamiSend ? ` ${umamiSend}` : ''}`,
  // Google Maps-kaart op de contactpagina
  'frame-src https://maps.google.com https://www.google.com',
  // Contactformulier zonder JS post rechtstreeks naar Web3Forms
  "form-action 'self' https://api.web3forms.com",
  "base-uri 'self'",
  "object-src 'none'",
  'upgrade-insecure-requests',
]

const NON_EXECUTABLE = /type=["'](application\/(ld\+)?json)["']/i

function htmlFiles(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap(e =>
    e.isDirectory() ? (e.name.startsWith('_') ? [] : htmlFiles(join(dir, e.name)))
      : e.name.endsWith('.html') ? [join(dir, e.name)] : [],
  )
}

let pages = 0
const allHashes = new Set()
for (const file of htmlFiles(OUT)) {
  let html = readFileSync(file, 'utf8')
  if (html.includes('http-equiv="Content-Security-Policy"')) continue // al verwerkt

  const hashes = new Set()
  for (const m of html.matchAll(/<script(?![^>]*\bsrc=)([^>]*)>([\s\S]*?)<\/script>/gi)) {
    if (NON_EXECUTABLE.test(m[1]) || !m[2].trim()) continue
    const hash = `'sha256-${createHash('sha256').update(m[2], 'utf8').digest('base64')}'`
    hashes.add(hash)
    allHashes.add(hash)
  }

  const policy = [`script-src 'self' ${[...hashes].join(' ')}${umami ? ` ${umami}` : ''}`.trim(), ...STATIC_DIRECTIVES].join('; ')
  const meta = `<meta http-equiv="Content-Security-Policy" content="${policy}">`
  const charset = html.match(/<meta charset="[^"]*">/i)
  if (!charset) {
    console.error(`add-csp: geen <meta charset> in ${file}`)
    process.exit(1)
  }
  html = html.replace(charset[0], `${charset[0]}${meta}`)
  writeFileSync(file, html)
  pages++
}
console.log(`CSP toegevoegd aan ${pages} pagina's (${allHashes.size} unieke script-hashes)`)
