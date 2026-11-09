import { describe, expect, it } from 'vitest'
import { formatOpeningHours, formatOwners, openingHoursParts, routeHref, telHref, validCoordinates, visibleNavigation, isHiddenPath } from '../composables/useSiteSettings'
import type { NavItem, OpeningHoursRule, Owner } from '../composables/useSiteSettings'

const rule = (days: string[], opens = '10:00', closes = '17:00') =>
  ({ _key: days.join(), days, opens, closes }) as OpeningHoursRule
const owners = (...names: string[]) => names.map((name, i) => ({ _key: String(i), name })) as Owner[]

describe('openingstijden', () => {
  it('weekend, in de goede volgorde', () => {
    expect(formatOpeningHours([rule(['sunday', 'saturday'])])).toEqual(['Zaterdag & zondag, 10:00 – 17:00'])
  })

  it('aaneengesloten reeks wordt "t/m"; losse dagen een opsomming', () => {
    expect(formatOpeningHours([rule(['monday', 'tuesday', 'wednesday', 'thursday', 'friday'], '09:00', '18:00')]))
      .toEqual(['Maandag t/m vrijdag, 09:00 – 18:00'])
    expect(formatOpeningHours([rule(['monday', 'wednesday', 'friday'])])).toEqual(['Maandag, woensdag & vrijdag, 10:00 – 17:00'])
  })

  it('levert dagen en tijd los voor de opmaak', () => {
    expect(openingHoursParts([rule(['saturday'])])).toEqual([{ days: 'Zaterdag', time: '10:00 – 17:00' }])
    expect(formatOpeningHours(undefined)).toEqual([])
  })
})

describe('eigenaren', () => {
  it('voegt een gedeelde achternaam samen', () => {
    expect(formatOwners(owners('Victor Duurland', 'Mari Duurland'))).toBe('Victor & Mari Duurland')
  })

  it('verschillende achternamen blijven voluit', () => {
    expect(formatOwners(owners('Victor Duurland', 'Anna Jansen'))).toBe('Victor Duurland & Anna Jansen')
  })

  it('één of geen eigenaar', () => {
    expect(formatOwners(owners('Victor Duurland'))).toBe('Victor Duurland')
    expect(formatOwners(undefined)).toBe('')
  })
})

describe('links', () => {
  it('tel:-link zonder opmaaktekens', () => {
    expect(telHref('+31 6 12-34 56 78')).toBe('tel:+31612345678')
  })

  it('route alleen met volledige coördinaten', () => {
    expect(routeHref({ lat: 51.9479, lng: 6.51 })).toBe('https://www.google.com/maps/dir/?api=1&destination=51.9479,6.51')
    // Beide velden zijn los invulbaar in de Studio: half ingevuld = geen kapotte link
    expect(routeHref({ lat: 51.9479 })).toBeUndefined()
    expect(routeHref(null)).toBeUndefined()
    expect(validCoordinates({ lat: 0, lng: 0 })).toEqual({ lat: 0, lng: 0 })
  })
})

describe('menu zonder lege pagina\'s', () => {
  const nav = (...hrefs: string[]) => hrefs.map((href, i) => ({ _key: String(i), label: href, href })) as NavItem[]
  const menu = nav('/de-boerderij', '/agenda', '/nieuws/', '/over-ons', '/contact')

  it('verbergt Nieuws zonder artikelen en Agenda zonder komende evenementen', () => {
    expect(visibleNavigation(menu, { hasNews: false, hasEvents: false }).map(n => n.href))
      .toEqual(['/de-boerderij', '/over-ons', '/contact'])
  })

  it('toont ze weer zodra er content is (ook met slash, query of hash)', () => {
    expect(visibleNavigation(menu, { hasNews: true, hasEvents: true })).toHaveLength(5)
    expect(visibleNavigation(nav('/agenda?x=1', '/agenda#top'), { hasNews: false, hasEvents: true })).toHaveLength(2)
    expect(visibleNavigation(undefined, { hasNews: true, hasEvents: true })).toEqual([])
  })
  it('isHiddenPath raakt alleen lege Nieuws/Agenda', () => {
    const leeg = { hasNews: false, hasEvents: false }
    expect(isHiddenPath('/agenda', leeg)).toBe(true)
    expect(isHiddenPath('/nieuws/', leeg)).toBe(true)
    expect(isHiddenPath('/nieuws/een-artikel', leeg)).toBe(false)
    expect(isHiddenPath('/contact', leeg)).toBe(false)
    expect(isHiddenPath(undefined, leeg)).toBe(false)
  })
})
