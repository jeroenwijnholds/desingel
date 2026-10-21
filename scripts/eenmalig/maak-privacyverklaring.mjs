/**
 * Eenmalig (21 oktober 2026): de eerste versie van de privacyverklaring
 * (singleton privacyPage, pagina /privacy) aanmaken. De tekst beschrijft wat
 * de site op dat moment echt doet: contactformulier via Web3Forms,
 * cookieloze statistiek via Umami, Google Maps pas na toestemming, hosting op
 * GitHub Pages en foto's via het Sanity-CDN. Contact loopt bewust alleen via
 * het contactformulier (geen e-mailadres op de site).
 *
 * createIfNotExists: overschrijft niets als het document al bestaat.
 * Back-up vooraf: ../desingel-backups/production-2026-10-21-voor-privacy.tar.gz
 * Draaien: node scripts/eenmalig/maak-privacyverklaring.mjs [--apply]  (SANITY_TOKEN in .env)
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

// Kleine Portable Text-bouwers. Een tekstdeel is een string, of
// [tekst, href] voor een link, of { strong: tekst } voor vet.
let n = 0
const key = () => `p${String(++n).padStart(3, '0')}`
function block(parts, extra = {}) {
  const markDefs = []
  const children = parts.map((part) => {
    if (typeof part === 'string') return { _type: 'span', _key: key(), text: part, marks: [] }
    if (Array.isArray(part)) {
      const def = { _type: 'link', _key: key(), href: part[1] }
      markDefs.push(def)
      return { _type: 'span', _key: key(), text: part[0], marks: [def._key] }
    }
    return { _type: 'span', _key: key(), text: part.strong, marks: ['strong'] }
  })
  return { _type: 'block', _key: key(), style: 'normal', markDefs, children, ...extra }
}
const p = (...parts) => block(parts)
const h2 = text => block([text], { style: 'h2' })
const li = (...parts) => block(parts, { listItem: 'bullet', level: 1 })

const body = [
  h2('Wie zijn wij'),
  p('Belevenisboerderij de Singel is de boerderij van Victor en Mari Duurland in de Achterhoek. Wij zijn verantwoordelijk voor de gegevens die via deze website binnenkomen. Vragen over je gegevens stel je via het ', ['contactformulier', '/contact'], '.'),

  h2('Het contactformulier'),
  p('Als je ons een bericht stuurt, vragen we om je naam, je e-mailadres, een onderwerp en je bericht. Je telefoonnummer is optioneel. We gebruiken deze gegevens alleen om je vraag te beantwoorden, en niet voor nieuwsbrieven of andere doelen.'),
  p('Het formulier wordt verstuurd via de dienst Web3Forms, die het bericht naar onze mailbox doorstuurt. Web3Forms bewaart berichten maximaal 30 dagen en deelt of verkoopt ze niet. Zelf bewaren we je bericht niet langer dan nodig is om je vraag af te handelen.'),

  h2('Bezoekersstatistiek'),
  p('Om te zien welke pagina’s worden bekeken, gebruiken we Umami. Umami plaatst geen cookies en slaat je IP-adres niet op. We zien alleen samengevoegde cijfers, zoals het aantal bezoeken per pagina, de website waar je vandaan kwam en het soort apparaat. Daarmee zijn bezoekers niet herkenbaar. Heb je in je browser ‘Do Not Track’ aangezet, dan tellen we je bezoek niet mee.'),

  h2('Cookies en Google Maps'),
  p('Deze website plaatst zelf geen cookies. Alleen de kaart van Google Maps op de contactpagina doet dat, en daarom laden we die pas als je daar toestemming voor geeft. Zonder toestemming tonen we in plaats van de kaart een knop om je route te plannen.'),
  p('Je keuze onthouden we een jaar lang in je eigen browser, niet bij ons. Je kunt hem altijd veranderen via ', { strong: 'Cookie-instellingen' }, ' onderaan elke pagina. Wat Google met de gegevens doet, lees je in de ', ['privacyverklaring van Google', 'https://policies.google.com/privacy'], '.'),

  h2('Hosting en foto’s'),
  p('De website staat op GitHub Pages, en de foto’s en teksten komen van Sanity, het systeem waarmee wij de site bijhouden. Zoals bij elke website zien deze diensten technische gegevens, zoals je IP-adres en browser, om de pagina’s te kunnen leveren en te beveiligen. De lettertypen staan op onze eigen site, dus daarvoor maak je geen verbinding met Google.'),

  h2('Je rechten'),
  p('Je mag altijd vragen welke gegevens we van je hebben. Je kunt ons ook vragen om:'),
  li('je gegevens in te zien;'),
  li('onjuiste gegevens te verbeteren;'),
  li('je gegevens te verwijderen.'),
  p('Stuur je verzoek via het ', ['contactformulier', '/contact'], '. Ben je niet tevreden over hoe we met je gegevens omgaan, dan kun je een klacht indienen bij de ', ['Autoriteit Persoonsgegevens', 'https://www.autoriteitpersoonsgegevens.nl'], '.'),

  h2('Wijzigingen'),
  p('Verandert er iets aan wat de website met gegevens doet, dan passen we deze verklaring aan. Bovenaan staat wanneer dat voor het laatst gebeurde.'),
]

const doc = {
  _id: 'privacyPage',
  _type: 'privacyPage',
  title: 'Privacyverklaring',
  intro: 'Wat er met je gegevens gebeurt als je deze website bezoekt of ons een bericht stuurt. Kort gezegd: zo weinig mogelijk.',
  updatedAt: '2026-10-21',
  body,
}

const bestaand = await client.getDocument('privacyPage')
const concept = await client.getDocument('drafts.privacyPage')
if (bestaand || concept) {
  console.log(`BESTAAT AL (${bestaand ? 'gepubliceerd' : ''}${concept ? ' concept' : ''}) — niets gedaan`)
  process.exit(0)
}
console.log(JSON.stringify(doc, null, 2).slice(0, 1500))
console.log(`… ${body.length} blokken`)
if (!APPLY) { console.log('\nDroge run — draai met --apply om te publiceren'); process.exit(0) }
await client.createIfNotExists(doc)
console.log('GEPUBLICEERD: privacyPage')
