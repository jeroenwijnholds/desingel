/**
 * Site-instellingen, gedeeld door nav, footer, homepage en contactpagina.
 * Eén vaste query = één useAsyncData-key, dus Nuxt haalt hem per pagina één
 * keer op (stonden voorheen als losse, net verschillende queries in elk
 * component).
 */

import type { SiteSettings as SanitySiteSettings } from '~/types/sanity.types'

// Afgeleid van het Sanity-schema (types/sanity.types.ts), zodat een
// schemawijziging hier een typefout oplevert i.p.v. stilletjes te breken
export type SiteSettings = Pick<
  SanitySiteSettings,
  'siteName' | 'tagline' | 'footerCopyright' | 'navigation' | 'owners' | 'address' | 'coordinates'
  | 'telephone' | 'email' | 'socialLinks' | 'openingHours' | 'announcement'
>
export type NavItem = NonNullable<SanitySiteSettings['navigation']>[number]
export type Owner = NonNullable<SanitySiteSettings['owners']>[number]
export type OpeningHoursRule = NonNullable<SanitySiteSettings['openingHours']>[number]

const QUERY = `*[_type == "siteSettings"][0]{
  siteName, tagline, footerCopyright, navigation, owners, address, coordinates,
  telephone, email, socialLinks, openingHours, announcement
}`

export function useSiteSettings() {
  return useContentQuery<SiteSettings>(QUERY)
}

const DAY_ORDER = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
const DAY_NL: Record<string, string> = {
  monday: 'maandag', tuesday: 'dinsdag', wednesday: 'woensdag', thursday: 'donderdag',
  friday: 'vrijdag', saturday: 'zaterdag', sunday: 'zondag',
}

/**
 * { days: "Zaterdag & zondag", time: "10:00 – 17:00" } uit de machineleesbare
 * openingstijden (los, zodat het tijdvak in de opmaak niet midden afbreekt).
 * Aaneengesloten reeksen van 3+ dagen worden "maandag t/m vrijdag".
 * Eén item per tijdvak.
 */
export function openingHoursParts(rules?: OpeningHoursRule[]): { days: string; time: string }[] {
  return (rules ?? []).map(rule => {
    const days = [...rule.days].sort((a, b) => DAY_ORDER.indexOf(a) - DAY_ORDER.indexOf(b))
    const idx = days.map(d => DAY_ORDER.indexOf(d))
    const consecutive = idx.every((v, i) => i === 0 || v === idx[i - 1]! + 1)
    const names = days.map(d => DAY_NL[d] ?? d)
    let label: string
    if (names.length >= 3 && consecutive) label = `${names[0]} t/m ${names[names.length - 1]}`
    else if (names.length > 1) label = `${names.slice(0, -1).join(', ')} & ${names[names.length - 1]}`
    else label = names[0] ?? ''
    return { days: `${label.charAt(0).toUpperCase()}${label.slice(1)}`, time: `${rule.opens} – ${rule.closes}` }
  })
}

/** "Zaterdag & zondag, 10:00 – 17:00" */
export const formatOpeningHours = (rules?: OpeningHoursRule[]) =>
  openingHoursParts(rules).map(p => `${p.days}, ${p.time}`)

/**
 * "Victor & Mari Duurland" uit [{ name: 'Victor Duurland' }, { name: 'Mari Duurland' }]:
 * bij een gedeelde achternaam alleen de voornamen samenvoegen.
 */
export function formatOwners(owners?: Owner[]): string {
  const names = (owners ?? []).map(o => o.name?.trim()).filter((n): n is string => !!n)
  if (names.length < 2) return names[0] ?? ''
  const split = names.map(n => {
    const i = n.lastIndexOf(' ')
    return i > 0 ? [n.slice(0, i), n.slice(i + 1)] as const : [n, ''] as const
  })
  const surname = split[0]![1]
  if (surname && split.every(([, s]) => s === surname)) {
    const firsts = split.map(([f]) => f)
    return `${firsts.slice(0, -1).join(', ')} & ${firsts[firsts.length - 1]} ${surname}`
  }
  return `${names.slice(0, -1).join(', ')} & ${names[names.length - 1]}`
}

/** tel:-link zonder spaties/streepjes; "+31 6 12345678" → "tel:+31612345678" */
export const telHref = (tel: string) => `tel:${tel.replace(/[^\d+]/g, '')}`

/** Volledige coördinaten, of null als lat of lng ontbreekt (beide zijn los invulbaar in de Studio) */
export const validCoordinates = (c?: { lat?: number; lng?: number } | null) =>
  typeof c?.lat === 'number' && typeof c?.lng === 'number' ? { lat: c.lat, lng: c.lng } : null

/** Google Maps-routebeschrijving naar de coördinaten (opent de app op mobiel); undefined zonder volledige coördinaten */
export function routeHref(c?: { lat?: number; lng?: number } | null) {
  const v = validCoordinates(c)
  return v ? `https://www.google.com/maps/dir/?api=1&destination=${v.lat},${v.lng}` : undefined
}
