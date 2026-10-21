/**
 * Eenmalig (21 oktober 2026):
 * - alt-teksten bij de 12 galerijfoto's (geen enkele had er een, dus
 *   schermlezers hoorden alleen "Foto 1 vergroten"). Geschreven na het
 *   bekijken van elke foto; personen zijn bewust niet bij naam genoemd.
 * - de privacytekst onder het contactformulier: die zei dat gegevens
 *   "nooit gedeeld met derden" worden, maar berichten lopen via Web3Forms.
 *
 * Zet alleen lege alt-teksten en vervangt de privacytekst alleen als de oude
 * tekst er nog staat; ifRevisionId per document.
 * Back-up vooraf: ../desingel-backups/production-2026-10-21-voor-alt-privacy.tar.gz
 * Draaien: node scripts/eenmalig/vul-alt-en-privacytekst.mjs [--apply]  (SANITY_TOKEN in .env)
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

// _key van de galerijfoto → alt-tekst
const ALT = {
  g1: 'Struisvogel in het gras voor een omheining, onder een bewolkte lucht',
  g2: 'Wagyu-koe met gele oormerken die graast in het hoge gras',
  g3: 'Kudde langharige geiten met jonge geitjes rent door de wei',
  g4: 'Twee zwarte Wagyu-runderen met hoorns bij een houten hek in de zon',
  g5: 'Jonge bruin-witte geit die door het gras loopt',
  g6: 'Vier nandoes bij de houten poort van de Achterhoekse Outback',
  g7: 'Kop van een geit met grote gebogen hoorns en een lange donkere vacht',
  g8: 'Blauwe Ford-tractor in het gras naast een zandpad met een bomenrij',
  g9: 'Bomenlaan met een zandpad dat weerspiegelt in een plas',
  '3de8b29e0e59': 'Drie mannen met twee jonge Wagyu-runderen bij de poort van de Wagyu Ranch',
  fa59df0ea8c9: 'Schildpad met een geel-zwart sterpatroon op het schild, in iemands hand',
  '8dd4e564373c': 'Twee jonge Wagyu-runderen grazen naast een blauwe Ford-tractor',
}
const OUDE_PRIVACY = 'Je gegevens worden alleen gebruikt om je vraag te beantwoorden en nooit gedeeld met derden.'
const NIEUWE_PRIVACY = 'Je gegevens gebruiken we alleen om je vraag te beantwoorden. Je bericht wordt verstuurd via onze formulierdienst (Web3Forms) en niet voor andere doelen gebruikt.'

let tx = client.transaction()
let count = 0

const galerij = await client.getDocument('fotoGalerij')
const altSet = {}
for (const img of galerij?.images ?? []) {
  const alt = ALT[img._key]
  if (!alt) { console.log(`GEEN TEKST voor foto ${img._key} — overgeslagen`); continue }
  if (img.alt?.trim()) { console.log(`OVERGESLAGEN ${img._key}: heeft al "${img.alt}"`); continue }
  altSet[`images[_key=="${img._key}"].alt`] = alt
  console.log(`${APPLY ? 'ZET' : 'ZOU ZETTEN'}  alt ${img._key} → ${alt}`)
}
if (Object.keys(altSet).length) {
  tx = tx.patch('fotoGalerij', p => p.ifRevisionId(galerij._rev).set(altSet))
  count += Object.keys(altSet).length
}

const contact = await client.getDocument('contactPage')
if (contact?.privacyNotice?.trim() === OUDE_PRIVACY) {
  tx = tx.patch('contactPage', p => p.ifRevisionId(contact._rev).set({ privacyNotice: NIEUWE_PRIVACY }))
  count++
  console.log(`${APPLY ? 'ZET' : 'ZOU ZETTEN'}  privacytekst → ${NIEUWE_PRIVACY}`)
} else {
  console.log(`OVERGESLAGEN privacytekst: is al aangepast ("${contact?.privacyNotice}")`)
}

if (!count) console.log('Niets te doen.')
else if (APPLY) console.log(`\n${count} velden gepubliceerd (transactie ${(await tx.commit()).transactionId}).`)
else console.log(`\nDroge run: ${count} velden. Draai met --apply om te publiceren.`)
