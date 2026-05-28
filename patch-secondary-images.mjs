/**
 * Voegt afbeeldingen toe aan de bestaande secundaire diensten in Sanity.
 *
 * Gebruik:
 *   node --env-file .env patch-secondary-images.mjs
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

const CDN = 'https://cdn.prod.website-files.com/6533a9b8694c7dea02da67d4'
const IMAGES = {
  'Loopvogels':          { url: `${CDN}/65ec6b106c7b5f808a7acd21_IMG_5398.jpg`, filename: 'loopvogels.jpg' },
  'De Wagyu Ranch':      { url: `${CDN}/65ec6b48838be82644c23423_IMG_5357.jpg`, filename: 'wagyu.jpg' },
  'Achterhoekse Outback':{ url: `${CDN}/65ec6b5246d6f7bdc2d68deb_IMG_5318.jpg`, filename: 'outback.jpg' },
}

async function uploadImage(url, filename) {
  console.log(`  ↑ uploading ${filename}…`)
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`)
  const buffer = Buffer.from(await res.arrayBuffer())
  const asset = await client.assets.upload('image', buffer, {
    filename,
    contentType: res.headers.get('content-type') || 'image/jpeg',
  })
  return { _type: 'image', asset: { _type: 'reference', _ref: asset._id } }
}

async function patch() {
  console.log('\n🖼️   Secundaire diensten afbeeldingen patchen…\n')

  const doc = await client.fetch('*[_type == "homePage" && !(_id in path("drafts.**"))][0]{ _id, secondaryServices }')
  if (!doc) {
    console.error('❌  homePage document niet gevonden.')
    process.exit(1)
  }

  const updated = await Promise.all(
    doc.secondaryServices.map(async (service) => {
      const imgDef = IMAGES[service.title]
      if (!imgDef) {
        console.log(`  ⏭  Geen afbeelding voor "${service.title}", overgeslagen.`)
        return service
      }
      const imageRef = await uploadImage(imgDef.url, imgDef.filename)
      console.log(`  ✓ ${service.title}`)
      return { ...service, image: imageRef }
    })
  )

  await client.patch(doc._id).set({ secondaryServices: updated }).commit()
  console.log('\n✅  Klaar! Afbeeldingen zijn gekoppeld aan de secundaire diensten.\n')
}

patch().catch(err => {
  console.error('❌  Patch mislukt:', err.message)
  process.exit(1)
})
