import { describe, expect, it } from 'vitest'
import { formatOpeningHours, formatOwners, openingHoursParts, routeHref, telHref, validCoordinates } from '../composables/useSiteSettings'
import type { OpeningHoursRule, Owner } from '../composables/useSiteSettings'

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
