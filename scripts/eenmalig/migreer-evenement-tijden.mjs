/**
 * Eenmalig — NOG NIET GEDRAAID (oktober 2026, wacht op review van fase 5).
 *
 * Zet het oude vrije tijdvak van evenementen ("14:00 – 21:00") om naar de
 * nieuwe velden: `date` = echte begintijd, `endDate` = eindtijd (beide in
 * NL-tijd op de kalenderdag van het oude datumveld), en verwijdert daarna
 * `timeRange`. Daarmee kloppen "Zet in je agenda" en de structured data
 * zonder terugval, en verdwijnt het verouderde veld uit de Studio.
 *
 * Rekent exact zoals de website: hergebruikt getEventTimes uit
 * composables/useEventTimes.ts (Node 24 kan TypeScript direct importeren).
 * Evenementen zonder herkenbaar tijdvak worden overgeslagen en gemeld.
 *
 * Eerst een back-up:   cd studio && npx sanity dataset export production backup.tar.gz
 * Droog (standaard):   node scripts/eenmalig/migreer-evenement-tijden.mjs
 * Echt uitvoeren:      node scripts/eenmalig/migreer-evenement-tijden.mjs --apply
 * (SANITY_TOKEN met schrijfrechten in .env; alleen nodig voor --apply)
 */
import { createClient } from '@sanity/client'
import { readFileSync } from 'node:fs'
import { getEventTimes } from '../../composables/useEventTimes.ts'

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
  token: APPLY ? env.SANITY_TOKEN : undefined,
  useCdn: false,
})

if (APPLY && !env.SANITY_TOKEN) {
  console.error('SANITY_TOKEN ontbreekt in .env — nodig voor --apply.')
  process.exit(1)
}

// Ook concepten (drafts) meenemen, anders overschrijft een openstaand concept
// later de migratie bij publiceren. Zonder token zijn drafts niet zichtbaar;
// de droge run toont dan alleen gepubliceerde evenementen.
const events = await client.fetch(
  `*[_type == "event" && defined(timeRange) && !defined(endDate)]{ _id, title, date, timeRange }`
)

const nlTime = d => d.toLocaleString('nl-NL', { timeZone: 'Europe/Amsterdam', dateStyle: 'short', timeStyle: 'short' })
let tx = client.transaction()
let todo = 0

for (const ev of events) {
  const t = getEventTimes(ev.date, ev.timeRange)
  if (t.allDay) {
    console.log(`OVERGESLAGEN  ${ev.title}: tijdvak "${ev.timeRange}" niet herkend — handmatig invullen`)
    continue
  }
  todo++
  console.log(`${APPLY ? 'MIGREER' : 'ZOU MIGREREN'}  ${ev.title}`)
  console.log(`    oud: ${nlTime(new Date(ev.date))} + "${ev.timeRange}"`)
  console.log(`    nieuw: ${nlTime(t.start)} t/m ${nlTime(t.end)}`)
  tx = tx.patch(ev._id, p => p.set({ date: t.start.toISOString(), endDate: t.end.toISOString() }).unset(['timeRange']))
}

if (!todo) {
  console.log('Niets te migreren.')
} else if (APPLY) {
  const res = await tx.commit()
  console.log(`\n${todo} evenement(en) bijgewerkt (transactie ${res.transactionId}).`)
} else {
  console.log(`\nDroge run: ${todo} evenement(en) zouden worden bijgewerkt. Draai met --apply om echt te wijzigen.`)
}
