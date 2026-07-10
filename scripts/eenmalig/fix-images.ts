import { getCliClient } from 'sanity/cli'

const client = getCliClient({ apiVersion: '2024-01-01' })

function fixImages(obj: unknown): unknown {
  if (!obj || typeof obj !== 'object') return obj
  if (Array.isArray(obj)) return (obj as unknown[]).map(fixImages)
  const o = obj as Record<string, unknown>
  // Fix double-nested: { _type:'image', asset: { _type:'image', asset: { _ref:'...' } } }
  if (
    o._type === 'image' &&
    o.asset &&
    typeof o.asset === 'object' &&
    (o.asset as Record<string, unknown>)._type === 'image' &&
    (o.asset as Record<string, unknown>).asset &&
    typeof (o.asset as Record<string, unknown>).asset === 'object' &&
    ((o.asset as Record<string, unknown>).asset as Record<string, unknown>)._ref
  ) {
    const ref = ((o.asset as Record<string, unknown>).asset as Record<string, unknown>)._ref
    return { ...o, asset: { _type: 'reference', _ref: ref } }
  }
  const result: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(o)) {
    result[k] = fixImages(v)
  }
  return result
}

const SKIP = new Set(['_id', '_type', '_rev', '_createdAt', '_updatedAt'])

async function run() {
  const docs = await client.fetch<Record<string, unknown>[]>(
    '*[!(_id in path("drafts.**")) && _type != "sanity.imageAsset"]'
  )
  for (const doc of docs) {
    const fixed = fixImages(doc) as Record<string, unknown>
    if (JSON.stringify(fixed) === JSON.stringify(doc)) {
      console.log('skip', doc._id)
      continue
    }
    const patch: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(fixed)) {
      if (!SKIP.has(k)) patch[k] = v
    }
    await client.patch(doc._id as string).set(patch).commit()
    console.log('fixed', doc._id)
  }
  console.log('done')
}

run().catch(console.error)
