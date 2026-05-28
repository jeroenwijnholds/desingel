/**
 * Seed script — vult Sanity met voorbeeldcontent uit de originele website.
 *
 * Gebruik:
 *   node --env-file .env seed.mjs
 *
 * Vereist in .env:
 *   SANITY_PROJECT_ID=vua8q73o
 *   SANITY_DATASET=production
 *   SANITY_TOKEN=sk...   (Editor-token van sanity.io/manage → API → Tokens)
 */

import { createClient } from '@sanity/client'

const token = process.env.SANITY_TOKEN
if (!token) {
  console.error('❌  SANITY_TOKEN ontbreekt. Voeg toe aan .env en herstart.')
  process.exit(1)
}

const client = createClient({
  projectId: process.env.SANITY_PROJECT_ID || 'vua8q73o',
  dataset: process.env.SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token,
})

// ─── Afbeeldingen uploaden ────────────────────────────────────────────────────

const imageCache = new Map()

async function uploadImage(url, filename) {
  if (imageCache.has(url)) return imageCache.get(url)
  console.log(`  ↑ uploading ${filename}…`)
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`)
  const buffer = Buffer.from(await res.arrayBuffer())
  const asset = await client.assets.upload('image', buffer, {
    filename,
    contentType: res.headers.get('content-type') || 'image/jpeg',
  })
  const ref = { _type: 'image', asset: { _type: 'reference', _ref: asset._id } }
  imageCache.set(url, ref)
  return ref
}

const CDN = 'https://cdn.prod.website-files.com/6533a9b8694c7dea02da67d4'
const IMG = {
  farmshop:          `${CDN}/6533cae98dd7217452773064_Farmshop.jpg`,
  boerderijOpLocatie:`${CDN}/6533cd71515cf733608cf3ad_BoerderijOpLocatie.jpg`,
  loopvogels:        `${CDN}/65ec6b106c7b5f808a7acd21_IMG_5398.jpg`,
  wagyu:             `${CDN}/65ec6b48838be82644c23423_IMG_5357.jpg`,
  outback:           `${CDN}/65ec6b5246d6f7bdc2d68deb_IMG_5318.jpg`,
  img5948:           `${CDN}/65ec7be714e3e398a7f48c5e_IMG_5948.jpg`,
  img5370:           `${CDN}/65ec7a9e46d6f7bdc2ddf0f4_IMG_5370.jpg`,
  img5257:           `${CDN}/65ec7a9bd2054acce8af723a_IMG_5257.jpg`,
  img5333:           `${CDN}/65ec7a9f6cf469713ee87d9d_IMG_5333.jpg`,
  img5281:           `${CDN}/65ec7a9e4fa7a38ee92a3b60_IMG_5281.jpg`,
  img5327:           `${CDN}/65ec7aa1dacd2569bd3e9843_IMG_5327.jpg`,
  img5242:           `${CDN}/65ec7a93fa620f5552b39cc4_IMG_5242.jpg`,
  img5896:           `${CDN}/65ec7c03dacd2569bd3f4a0b_IMG_5896.jpg`,
  img5909:           `${CDN}/65ec7bf3253cc0b11ba18875_IMG_5909.jpg`,
}

// ─── Helper: Portable Text blok ──────────────────────────────────────────────

let _key = 0
function key() { return `k${++_key}` }

function block(text, style = 'normal') {
  return {
    _type: 'block', _key: key(), style,
    children: [{ _type: 'span', _key: key(), text, marks: [] }],
    markDefs: [],
  }
}

function h2(text)    { return block(text, 'h2') }
function quote(text) { return block(text, 'blockquote') }

// ─── Documenten aanmaken ─────────────────────────────────────────────────────

async function seed() {
  console.log('\n🌱  Sanity seed gestart…\n')

  // ── 1. Afbeeldingen uploaden ───────────────────────────────────────────────
  console.log('📸  Afbeeldingen uploaden…')
  const imgFarmshop    = await uploadImage(IMG.farmshop,          'farmshop.jpg')
  const imgBol         = await uploadImage(IMG.boerderijOpLocatie,'boerderij-op-locatie.jpg')
  const imgLoopvogels  = await uploadImage(IMG.loopvogels,        'loopvogels.jpg')
  const imgWagyu       = await uploadImage(IMG.wagyu,             'wagyu.jpg')
  const imgOutback     = await uploadImage(IMG.outback,           'outback.jpg')
  const img5948        = await uploadImage(IMG.img5948,           'img-5948.jpg')
  const img5370        = await uploadImage(IMG.img5370,           'img-5370.jpg')
  const img5257        = await uploadImage(IMG.img5257,           'img-5257.jpg')
  const img5333        = await uploadImage(IMG.img5333,           'img-5333.jpg')
  const img5281        = await uploadImage(IMG.img5281,           'img-5281.jpg')
  const img5327        = await uploadImage(IMG.img5327,           'img-5327.jpg')
  const img5242        = await uploadImage(IMG.img5242,           'img-5242.jpg')
  const img5896        = await uploadImage(IMG.img5896,           'img-5896.jpg')
  const img5909        = await uploadImage(IMG.img5909,           'img-5909.jpg')

  // ── 2. siteSettings ───────────────────────────────────────────────────────
  console.log('\n⚙️   siteSettings…')
  await client.createOrReplace({
    _id: 'siteSettings',
    _type: 'siteSettings',
    siteName: 'Belevenisboerderij de Singel',
    tagline: 'Waar kleinschalige landbouw en wilde natuur samenkomen',
    owners: [
      { _key: key(), name: 'Victor Duurland', role: 'Eigenaar & Boer' },
      { _key: key(), name: 'Mari Duurland',   role: 'Eigenaar' },
    ],
    address: 'Achterhoek, Gelderland',
    coordinates: { lat: 51.9479284, lng: 6.5100125 },
    farmshopHours: 'Za & zo 10:00–17:00',
    responseTime: 'Binnen 2 werkdagen',
    footerCopyright: '© 2026 Belevenisboerderij de Singel',
    navigation: [
      { _key: key(), label: 'De Boerderij',     href: '/de-boerderij', isButton: false },
      { _key: key(), label: 'Agenda',            href: '/agenda',       isButton: false },
      { _key: key(), label: 'Nieuws',            href: '/nieuws',       isButton: false },
      { _key: key(), label: 'Over ons',          href: '/over-ons',     isButton: false },
      { _key: key(), label: 'Neem contact op',   href: '/contact',      isButton: true  },
    ],
  })

  // ── 3. homePage ───────────────────────────────────────────────────────────
  console.log('🏠  homePage…')
  await client.createOrReplace({
    _id: 'homePage',
    _type: 'homePage',
    heroTitle: 'Waar kleinschalige landbouw en wilde natuur samenkomen',
    heroSubtitle: 'Een boerderij met bijzondere dieren, waar zachtfruit wordt geteeld en waar onze producten verkrijgbaar zijn in een mobiele farmshop. Een boerderij waar de natuur onze grootste bondgenoot en inspiratiebron is.',
    heroImage: img5948,
    primaryServices: [
      {
        _key: key(),
        title: 'Farmshop',
        description: 'Ambachtelijke verse producten van eigen boerderij, dat is kopen met een goed gevoel.\n\nEen ruime selectie van zachtfruit, verse groenten, tot eersteklas Wagyu vlees en poule de bresse kip.',
        image: imgFarmshop,
      },
      {
        _key: key(),
        title: 'Boerderij op Locatie',
        description: 'Victor brengt de boerderij naar je toe! Maak kennis met onze dieren en het boerenleven.\n\nKies voor een grote boerderij, geschikt voor markten, braderieën en evenementen. Of een kleine boerderij geschikt voor zorgcentra, kinderdagverblijven en scholen.',
        image: imgBol,
        testimonialQuote: 'o.a. Pinksterfeesten Bornerbroek, Kerstcircus Enschede, Oldtimerdag Saasveld en Kermis Varsseveld gingen u al voor',
        testimonialAuthor: "Victor's Boerderij op locatie",
      },
    ],
    secondaryServices: [
      { _key: key(), title: 'Loopvogels',          description: 'Bij belevingsboerderij de Singel doen wij aan struisvogelpolitiek.', image: imgLoopvogels },
      { _key: key(), title: 'De Wagyu Ranch',       description: 'Keizerlijke koeien die grazen op ongerepte Achterhoekse gronden.',  image: imgWagyu },
      { _key: key(), title: 'Achterhoekse Outback', description: 'Naar de andere kant van de wereld, gewoon in eigen land.',           image: imgOutback },
    ],
    galleryImages: [img5948, img5370, img5257, img5333, img5281, img5327, img5242, img5896, img5909].map((img, i) => ({
      ...img, _key: key(),
    })),
    ctaPrimaryLabel:    'Bekijk de agenda',
    ctaPrimaryHref:     '/agenda',
    ctaSecondaryLabel:  'Leer ons kennen',
    ctaSecondaryHref:   '/over-ons',
  })

  // ── 4. boerderijPage ──────────────────────────────────────────────────────
  console.log('🚜  boerderijPage…')
  await client.createOrReplace({
    _id: 'boerderijPage',
    _type: 'boerderijPage',
    introTitle: 'Een bijzondere plek in de Achterhoek',
    introText: 'Op de Singel is het rustiger dan in de rest van de wereld. Hier bepalen de seizoenen het ritme, grazen Wagyu koeien in het ochtendlicht en kijken loopvogels je nieuwsgierig aan. Het is een plek die je niet snel vergeet.',
    introImage: img5948,
    storyColumns: [
      'De Singel is geen gewone boerderij. Hier grazen Wagyu koeien op ongerepte gronden die nooit aangeraakt zijn door de intensieve landbouw. Loopvogels wandelen door het struikgewas. Zachtfruit rijpt langzaam aan de struik — in zijn eigen tempo, zonder tussenkomst.\n\nDe boerderij is bewust kleinschalig gehouden. Niet uit gebrek aan ambitie, maar uit overtuiging. Want ruimte, rust en aandacht zijn geen luxe voor dieren — het zijn voorwaarden voor kwaliteit. Dat proef je terug in alles wat de Singel voortbrengt.',
      'De Achterhoekse gronden geven de boerderij zijn karakter. Lage horizon, brede velden en een stilte die je zelden meer hoort. Een plek die doet terugdenken aan hoe het ooit was — en toont dat het ook nu nog zo kan zijn.\n\nNaast de dieren en het land is er de farmshop: een plek waar je de producten van de Singel mee naar huis neemt. Van Wagyu vlees tot Poule de Bresse kip, van verse groenten tot zachtfruit. Elke zaterdag en zondag geopend.',
    ],
    victorQuote: '"Onze boerderij is niet groot. Ze hoeft ook niet groot te zijn. Wat ze biedt is zeldzamer dan oppervlakte: echtheid."',
    highlights: [
      { _key: key(), title: 'De Wagyu Ranch',  description: 'Keizerlijke Wagyu koeien die grazen op ongerepte Achterhoekse gronden. Langzaam grootgebracht, met oog voor dierenwelzijn en smaak.' },
      { _key: key(), title: 'Loopvogels',      description: 'Bij de Singel doen wij aan struisvogelpolitiek — in de beste zin van het woord. Bijzondere vogels in een bijzondere omgeving.' },
      { _key: key(), title: 'De Farmshop',     description: 'Ambachtelijke verse producten van eigen boerderij, te kopen met een goed gevoel. Za & zo geopend, 10:00–17:00.' },
    ],
    fullWidthPhoto: img5333,
    ctaPrimaryLabel:   'Bekijk de agenda',
    ctaPrimaryHref:    '/agenda',
    ctaSecondaryLabel: 'Neem contact op',
    ctaSecondaryHref:  '/contact',
  })

  // ── 5. overOnsPage ────────────────────────────────────────────────────────
  console.log('👨‍👩‍👧  overOnsPage…')
  await client.createOrReplace({
    _id: 'overOnsPage',
    _type: 'overOnsPage',
    introTitle: 'Hallo,\nwij zijn\nVictor en Mari',
    introText: 'Al jaren dromen wij van een plek waar kleinschaligheid en natuur het tempo bepalen — niet de markt. Een plek waar onze kinderen opgroeien te midden van dieren, seizoenen en eerlijk voedsel. Die plek is Belevenisboerderij de Singel.',
    familyPhoto: imgBol,
    storyTitle: 'Van passie naar praktijk',
    storyColumns: [
      'Victor groeide op met een diepe fascinatie voor natuur en dieren. Als kind wist hij al: ik wil iets doen waarbij de verbinding tussen mens en natuur centraal staat. Die droom nam vorm aan op de Achterhoekse gronden van de Singel.\n\nSamen met Mari — die haar liefde voor eerlijk, puur voedsel deelt — bouwde hij een boerderij die niet over volume gaat, maar over waarde. Wagyu koeien die rustig grazen op ongerepte gronden. Poule de Bresse kippen die de ruimte krijgen die ze verdienen. Zachtfruit dat rijpt in zijn eigen tempo.',
      'De boerderij is ook een gezinsplek. Onze kinderen groeien op tussen de dieren, leren van de seizoenen en begrijpen waar hun eten vandaan komt. Dat gevoel willen we met iedereen delen — via de farmshop, via evenementen en via alles wat we doen.\n\nNiet voor niets heet het een belevingsboerderij. Want boven alles willen wij dat mensen weggaan met een gevoel — van verbinding, van verwondering, van echtheid.',
    ],
    victorQuote: '"Wij doen dit niet voor de schaal. Wij doen dit voor het gevoel dat je krijgt als je een kind ziet stralen bij zijn eerste ontmoeting met een pasgeboren kalf."',
    values: [
      { _key: key(), title: 'Eerlijk & puur',          description: 'Geen trucjes, geen shortcuts. Onze producten komen van dieren en grond die goed worden verzorgd. Dat proef je terug in elk product dat we verkopen.' },
      { _key: key(), title: 'Natuur als leidraad',     description: 'De natuur is onze grootste bondgenoot en inspiratiebron. Wij werken mét de natuur, niet eromheen — en laten haar het tempo bepalen.' },
      { _key: key(), title: 'Beleving voor iedereen',  description: 'Het boerenleven is voor iedereen. Via de farmshop en de boerderij op locatie brengen we die beleving naar zoveel mogelijk mensen toe.' },
    ],
    fullWidthPhoto: img5370,
    ctaPrimaryLabel:   'Bekijk de agenda',
    ctaPrimaryHref:    '/agenda',
    ctaSecondaryLabel: 'Neem contact op',
    ctaSecondaryHref:  '/contact',
  })

  // ── 6. contactPage ────────────────────────────────────────────────────────
  console.log('📬  contactPage…')
  await client.createOrReplace({
    _id: 'contactPage',
    _type: 'contactPage',
    infoOwners: 'Victor & Mari Duurland',
    infoAddress: 'Achterhoek, Gelderland',
    infoHours: 'Zaterdag & zondag, 10:00 – 17:00',
    infoResponseTime: 'Binnen 2 werkdagen',
    subjectOptions: ['Farmshop', 'Boerderij op Locatie', 'Evenement / Agenda', 'Anders'],
    privacyNotice: 'Je gegevens worden alleen gebruikt om je vraag te beantwoorden en nooit gedeeld met derden.',
  })

  // ── 7. Evenementen ────────────────────────────────────────────────────────
  console.log('\n📅  Evenementen…')

  const events = [
    {
      _id: 'event-pinksterfeesten',
      _type: 'event',
      title: 'Pinksterfeesten Bornerbroek',
      slug: { _type: 'slug', current: 'pinksterfeesten-bornerbroek' },
      category: 'Markt',
      date: '2026-04-26T11:00:00.000Z',
      timeRange: '11:00 – 18:00',
      location: 'Bornerbroek',
      description: 'Victor brengt de boerderij naar Bornerbroek. Maak kennis met onze dieren en het boerenleven op de jaarlijkse Pinksterfeesten.',
      featuredImage: imgBol,
      body: [
        block('Op de jaarlijkse Pinksterfeesten in Bornerbroek is Belevenisboerderij de Singel van de partij. Victor brengt zijn complete boerderijbeleving mee: bijzondere dieren, verse producten uit eigen tuin en het echte boerenleven — midden in het dorp.'),
        block('De Pinksterfeesten zijn hét feest van Bornerbroek, elk jaar bezocht door honderden bezoekers uit de regio. Een perfecte plek om mensen kennis te laten maken met de natuur, de dieren en het kleinschalige landbouwleven dat wij zo koesteren in de Achterhoek.'),
        h2('Wat kun je verwachten'),
        block('Kennismaken met onze dieren: konijnen, geiten, kippen en meer. Verse producten uit de farmshop: zachtfruit, groenten, Wagyu vlees en Poule de Bresse. Verhalen over het boerenleven en de natuur in de Achterhoek.'),
        h2('Boerderij op Locatie'),
        block('Met "Boerderij op Locatie" brengt Victor de beleving van de boerderij naar evenementen door heel de regio. Wil je Victor\'s Boerderij op Locatie ook bij jouw evenement? Neem dan contact op.'),
      ],
    },
    {
      _id: 'event-oldtimerdag',
      _type: 'event',
      title: 'Oldtimerdag Saasveld',
      slug: { _type: 'slug', current: 'oldtimerdag-saasveld' },
      category: 'Evenement',
      date: '2026-05-10T10:00:00.000Z',
      timeRange: '10:00 – 17:00',
      location: 'Saasveld',
      description: 'De boerderij op locatie bij de Oldtimerdag in Saasveld. Een dag vol nostalgie, dieren en boerensfeer.',
      featuredImage: imgWagyu,
    },
    {
      _id: 'event-kermis-varsseveld',
      _type: 'event',
      title: 'Kermis Varsseveld',
      slug: { _type: 'slug', current: 'kermis-varsseveld' },
      category: 'Kermis',
      date: '2026-05-23T12:00:00.000Z',
      timeRange: '12:00 – 22:00',
      location: 'Varsseveld',
      description: 'Kom de sfeer van de boerderij beleven op de kermis in Varsseveld. Voor jong en oud.',
      featuredImage: imgLoopvogels,
    },
    {
      _id: 'event-kerstcircus',
      _type: 'event',
      title: 'Kerstcircus Enschede',
      slug: { _type: 'slug', current: 'kerstcircus-enschede' },
      category: 'Circus',
      date: '2026-12-19T14:00:00.000Z',
      timeRange: '14:00 – 21:00',
      location: 'Enschede',
      description: 'Belevenisboerderij de Singel is van de partij bij het Kerstcircus in Enschede. Een magische kerstavond met dieren en winterse sfeer.',
      featuredImage: imgBol,
    },
  ]

  for (const event of events) {
    console.log(`  ✓ ${event.title}`)
    await client.createOrReplace(event)
  }

  // ── 8. Nieuwsartikelen ────────────────────────────────────────────────────
  console.log('\n📰  Nieuwsartikelen…')

  const artikel1Id = 'artikel-wagyu-kalveren'
  const artikel2Id = 'artikel-farmshop-zondag'
  const artikel3Id = 'artikel-struisvogels'

  const artikelen = [
    {
      _id: artikel1Id,
      _type: 'nieuwsArtikel',
      title: 'Nieuwe Wagyu kalveren verwelkomd op de Singel',
      slug: { _type: 'slug', current: 'wagyu-kalveren-seizoen' },
      category: 'Dieren',
      publishedAt: '2026-04-08T08:00:00.000Z',
      author: 'Victor Duurland',
      excerpt: 'De eerste kalveren van dit seizoen zijn er. Een bijzonder moment voor de hele familie — en voor iedereen die de boerderij een warm hart toedraagt.',
      readTime: 3,
      featuredImage: imgWagyu,
      body: [
        block('Het begon vroeg in de ochtend. Toen Victor de stal binnenliep voor zijn dagelijkse ronde, zag hij dat een van de Wagyu-koeien — al weken dichter bij haar werpdatum — rustig naast haar pasgeboren kalf lag. Een gezonde stier, stevig op de benen, nog geen twee uur oud. Even later volgde een tweede geboorte in de aangrenzende ruimte.'),
        block('Voor de Duurlands is het altijd een bijzonder moment, ook al is het niet de eerste keer. "Je weet dat het eraan komt," zegt Victor, "maar als het zover is, staat de wereld even stil. Je bent getuige van iets puur en ongelooflijk kwetsbaars tegelijk."'),
        quote('"Je weet dat het eraan komt, maar als het zover is, staat de wereld even stil." — Victor Duurland'),
        h2('De Wagyu-kudde op de Singel'),
        block('Belevenisboerderij de Singel houdt al jaren Wagyu-runderen — een Japans ras dat wereldwijd bekendstaat om zijn uitzonderlijke vlees met de karakteristieke marmering. Op de Singel grazen de dieren op ruime, ongerepte Achterhoekse gronden en leven ze zo natuurlijk mogelijk.'),
        block('De kalveren blijven de eerste maanden bij hun moeder. In die periode leren ze de wei kennen, de andere dieren en het vaste ritme van de boerderij. Pas later, als ze groot en sterk genoeg zijn, worden ze geleidelijk aan de kudde voorgesteld.'),
        h2('Seizoensgebonden geboortes'),
        block('De geboortes in het voorjaar zijn bewust gepland. "In de zomermaanden is het gras op zijn best en is er genoeg ruimte voor de koeien om rustig te herstellen," legt Mari uit. "De kalveren groeien op in de mooiste tijd van het jaar."'),
        block('Het is een keuze die past bij de filosofie van de boerderij: de natuur als leidraad nemen, niet als obstakel. Kleinschaligheid, aandacht en respect voor het dier staan centraal — van geboorte tot de producten in de farmshop.'),
        h2('Vers Wagyu-vlees in de farmshop'),
        block('De Wagyu-kalveren van dit seizoen zullen pas over anderhalf tot twee jaar hun weg vinden naar de farmshop. In de tussentijd is er nog volop vers Wagyu-vlees beschikbaar van de vorige generatie — door liefhebbers al jarenlang gewaardeerd om de smaak en kwaliteit.'),
      ],
      relatedArticles: [
        { _type: 'reference', _ref: artikel2Id, _key: key() },
        { _type: 'reference', _ref: artikel3Id, _key: key() },
      ],
    },
    {
      _id: artikel2Id,
      _type: 'nieuwsArtikel',
      title: 'Farmshop nu ook op zondag open',
      slug: { _type: 'slug', current: 'farmshop-zondag-open' },
      category: 'Farmshop',
      publishedAt: '2026-03-29T09:00:00.000Z',
      author: 'Mari Duurland',
      excerpt: 'Goed nieuws voor iedereen die doordeweeks niet langs kan komen: de farmshop is voortaan ook op zondag geopend van 10:00 tot 17:00.',
      readTime: 2,
      featuredImage: imgFarmshop,
      body: [
        block('Na veel enthousiaste reacties op onze zaterdag-openingstijden, hebben we besloten de farmshop voortaan ook op zondag open te stellen. Vanaf 1 april zijn we elke zaterdag én zondag te bezoeken van 10:00 tot 17:00.'),
        block('Je vindt er zoals altijd onze verse producten: van Wagyu vlees en Poule de Bresse kip tot seizoensgroenten en het eerste zachtfruit van het jaar. Wij kijken ernaar uit om ook op zondag meer mensen te verwelkomen op de Singel.'),
      ],
      relatedArticles: [
        { _type: 'reference', _ref: artikel1Id, _key: key() },
        { _type: 'reference', _ref: artikel3Id, _key: key() },
      ],
    },
    {
      _id: artikel3Id,
      _type: 'nieuwsArtikel',
      title: 'Struisvogels verwelkomen drie nieuwe kuikens',
      slug: { _type: 'slug', current: 'struisvogels-nieuwe-kuikens' },
      category: 'Dieren',
      publishedAt: '2026-03-02T10:00:00.000Z',
      author: 'Victor Duurland',
      excerpt: 'Onze loopvogelhoek is een stuk drukker geworden. Na een broedperiode van 42 dagen zijn drie gezonde kuikens uit het ei gekropen.',
      readTime: 2,
      featuredImage: imgLoopvogels,
      body: [
        block('Onze loopvogelhoek is een stuk drukker geworden. Na een broedperiode van 42 dagen zijn drie gezonde kuikens uit het ei gekropen — een zeldzame beleving die ook de kinderen van de buren niet wilden missen.'),
        block('Loopvogels zijn niet de meest voorspelbare dieren op de boerderij, maar juist dat maakt ze zo bijzonder. Ze reageren op alles met hun kenmerkende nieuwsgierigheid en geven de Singel een heel eigen karakter.'),
      ],
      relatedArticles: [
        { _type: 'reference', _ref: artikel1Id, _key: key() },
        { _type: 'reference', _ref: artikel2Id, _key: key() },
      ],
    },
  ]

  for (const artikel of artikelen) {
    console.log(`  ✓ ${artikel.title}`)
    await client.createOrReplace(artikel)
  }

  console.log('\n✅  Seed klaar! Start nu de site met: npx nuxt generate\n')
}

seed().catch(err => {
  console.error('❌  Seed mislukt:', err.message)
  process.exit(1)
})
