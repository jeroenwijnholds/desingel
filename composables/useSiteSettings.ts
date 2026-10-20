/**
 * Site-instellingen, gedeeld door nav, footer, homepage en contactpagina.
 * Eén vaste query = één useAsyncData-key, dus Nuxt haalt hem per pagina één
 * keer op (stonden voorheen als losse, net verschillende queries in elk
 * component).
 */

export interface NavItem { label: string; href: string; isButton: boolean }
export interface Owner { name: string; role?: string }
export interface SocialLink { platform: string; url: string }
export interface OpeningHoursRule { days: string[]; opens: string; closes: string }
export interface SiteSettings {
  siteName: string
  tagline?: string
  footerCopyright?: string
  navigation?: NavItem[]
  owners?: Owner[]
  address?: string
  coordinates?: { lat: number; lng: number }
  telephone?: string
  email?: string
  socialLinks?: SocialLink[]
  openingHours?: OpeningHoursRule[]
}

const QUERY = `*[_type == "siteSettings" && !(_id in path("drafts.**"))][0]{
  siteName, tagline, footerCopyright, navigation, owners, address, coordinates,
  telephone, email, socialLinks, openingHours
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

/** tel:-link zonder spaties/streepjes; "+31 6 12345678" → "tel:+31612345678" */
export const telHref = (tel: string) => `tel:${tel.replace(/[^\d+]/g, '')}`

/** Google Maps-routebeschrijving naar de coördinaten (opent de app op mobiel) */
export const routeHref = (c: { lat: number; lng: number }) =>
  `https://www.google.com/maps/dir/?api=1&destination=${c.lat},${c.lng}`
