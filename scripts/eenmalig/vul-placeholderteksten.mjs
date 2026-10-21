/**
 * Eenmalig (21 oktober 2026): vervangt de placeholderteksten die live op de
 * homepage en De Boerderij stonden ("Diensten titel", "Verhaaltitel", …) door
 * echte teksten. Bron: de originele Webflow-site (belevenisboerderij-desingel.nl)
 * waar die de tekst had, anders de terugvalteksten die al in de code stonden.
 *
 * Zet een veld alleen als het nu nog exact de placeholder bevat: is het
 * intussen in de Studio ingevuld, dan blijft dat staan.
 *
 * Back-up vooraf: ../desingel-backups/production-2026-10-21-voor-teksten.tar.gz
 * Draaien: node scripts/eenmalig/vul-placeholderteksten.mjs [--apply]  (SANITY_TOKEN in .env)
 */
import { createClient } from '@sanity/client'
import { readFileSync } from 'node:fs'

const APPLY = process.argv.includes('--apply')
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

// documentId → veld → [huidige placeholder, nieuwe tekst]
const TEKSTEN = {
  homePage: {
    servicesTitle: ['Diensten titel', 'De boerderij dichtbij'],
    servicesIntro: ['Diensten introtekst', 'In onze tamme en georganiseerde levens willen wij mensen weer kennis laten maken met wildernis, dieren, natuur en buitenleven.'],
    galleryTitle: ['Galerij titel', 'Belevenisboerderij de Singel'],
    ctaTitle: ['CTA titel', 'Beleef de boerderij zelf'],
    ctaText: ['CTA tekst', 'Nieuwsgierig naar de boerderij? Bezoek ons op een van onze evenementen, kom langs bij de farmshop, of leer ons beter kennen.'],
  },
  boerderijPage: {
    storyLabel: ['Verhaal kop-label', 'De boerderij'],
    storyTitle: ['Verhaaltitel', 'Kleinschalig, bewust en echt'],
    photoCaption: ['Foto-onderschrift', 'Een van onze loopvogels, in het hart van de Achterhoek'],
    highlightsLabel: ['Hoogtepunten kop-label', 'Op de Singel'],
    highlightsTitle: ['Hoogtepunten titel', 'Wat je aantreft'],
    ctaLabel: ['CTA kop-label', 'Kom langs'],
    ctaTitle: ['CTA titel', 'Beleef de Singel zelf'],
    ctaText: ['CTA tekst', 'Nieuwsgierig naar de boerderij? Bezoek ons op een van onze evenementen, kom langs bij de farmshop, of neem gewoon contact op.'],
  },
}

const norm = s => String(s ?? '').trim().toLowerCase().replace(/\s+/g, ' ')
let tx = client.transaction()
let count = 0
for (const [id, fields] of Object.entries(TEKSTEN)) {
  const doc = await client.getDocument(id)
  const set = {}
  for (const [field, [placeholder, text]] of Object.entries(fields)) {
    if (norm(doc?.[field]) === norm(placeholder)) set[field] = text
    else console.log(`OVERGESLAGEN ${id}.${field}: bevat al ${JSON.stringify(doc?.[field])}`)
  }
  for (const [field, text] of Object.entries(set)) console.log(`${APPLY ? 'ZET' : 'ZOU ZETTEN'}  ${id}.${field} → ${text}`)
  if (Object.keys(set).length) {
    // ifRevisionId: faalt als het document net tussen lezen en schrijven wijzigt
    tx = tx.patch(id, p => p.ifRevisionId(doc._rev).set(set))
    count += Object.keys(set).length
  }
}
if (!count) console.log('Niets te doen.')
else if (APPLY) console.log(`\n${count} velden gepubliceerd (transactie ${(await tx.commit()).transactionId}).`)
else console.log(`\nDroge run: ${count} velden. Draai met --apply om te publiceren.`)
