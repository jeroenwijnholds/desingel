/**
 * Eenmalig (10 juli 2026): verwijdert het verouderde veld `galleryImages`
 * van het Homepage-document. De site leest sinds de CMS-herinrichting uit
 * het eigen `fotoGalerij`-document; vooraf geverifieerd dat dat 9 foto's
 * bevat (evenveel als het oude veld). Zie NOG-TE-DOEN "Oude galerijdata".
 *
 * Draaien: node scripts/eenmalig/unset-legacy-gallery.mjs  (SANITY_TOKEN in .env)
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

const result = await client.patch('homePage').unset(['galleryImages']).commit()
console.log('galleryImages verwijderd van document:', result._id)
