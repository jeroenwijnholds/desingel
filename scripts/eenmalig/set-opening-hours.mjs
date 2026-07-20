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
