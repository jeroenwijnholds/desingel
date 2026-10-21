import { describe, expect, it } from 'vitest'
import { useDateFormat } from '../composables/useDateFormat'
import { eventLastDate, eventTimeLabel, getEventTimes, googleCalendarHref, icsHref, isoAmsterdam } from '../composables/useEventTimes'

const f = useDateFormat()

describe('useDateFormat (NL-tijd, ook als de build in UTC draait)', () => {
  // 22:30 UTC op 7 april = 00:30 NL-tijd op 8 april: ging vroeger mis
  const laat = '2026-04-07T22:30:00.000Z'

  it('formatteert de NL-kalenderdag, niet de UTC-dag', () => {
    expect(f.formatDate(laat)).toBe('8 april 2026')
    expect(f.formatDatetime(laat)).toBe('2026-04-08')
    expect(f.formatDay(laat)).toBe('8')
    expect(f.formatChipDate(laat)).toBe('wo 8 april 2026')
    expect(f.formatMonthYear(laat)).toBe('April 2026')
  })

  it('kort de maand en weekdag af', () => {
    expect(f.formatMonthShort('2026-12-19T14:00:00Z')).toBe('dec')
    expect(f.formatWeekday('2026-12-19T14:00:00Z')).toBe('Za')
  })

  it('isPastDay: vandaag telt nog mee, gisteren niet', () => {
    const now = new Date('2026-12-19T22:00:00+01:00')
    expect(f.isPastDay('2026-12-19T14:00:00+01:00', now)).toBe(false)
    expect(f.isPastDay('2026-12-18T23:59:00+01:00', now)).toBe(true)
  })
})

describe('getEventTimes', () => {
  it('leest het oude tijdvak als NL-tijd op de NL-dag', () => {
    const t = getEventTimes('2026-12-19T14:00:00.000Z', '14:00 – 21:00')
    expect(t.allDay).toBe(false)
    expect(isoAmsterdam(t.start!)).toBe('2026-12-19T14:00:00+01:00')
    expect(isoAmsterdam(t.end!)).toBe('2026-12-19T21:00:00+01:00')
  })

  it('kent zomertijd', () => {
    const t = getEventTimes('2026-05-10T10:00:00.000Z', '10:00 - 17:00')
    expect(isoAmsterdam(t.start!)).toBe('2026-05-10T10:00:00+02:00')
  })

  it('laat een avond doorlopen na middernacht', () => {
    const t = getEventTimes('2026-06-01T10:00:00.000Z', '20:00 – 01:00')
    expect(isoAmsterdam(t.end!)).toBe('2026-06-02T01:00:00+02:00')
  })

  it('geeft 2 uur bij alleen een begintijd en een hele dag zonder tijd', () => {
    expect(isoAmsterdam(getEventTimes('2026-06-01T10:00:00Z', 'vanaf 11.00 uur').end!)).toBe('2026-06-01T13:00:00+02:00')
    expect(getEventTimes('2026-06-01T10:00:00Z', 'hele dag').allDay).toBe(true)
  })

  it('gebruikt echte begin/eindtijd als endDate bestaat', () => {
    const t = getEventTimes('2026-12-19T13:00:00Z', '09:00 – 10:00', '2026-12-19T20:00:00Z')
    expect(t.start!.toISOString()).toBe('2026-12-19T13:00:00.000Z')
    expect(t.end!.toISOString()).toBe('2026-12-19T20:00:00.000Z')
  })
})

describe('eventTimeLabel / eventLastDate', () => {
  it('maakt de tijdtekst uit begin/eind', () => {
    expect(eventTimeLabel({ date: '2026-12-19T13:00:00Z', endDate: '2026-12-19T20:00:00Z' })).toBe('14:00 – 21:00')
  })

  it('toont "t/m" bij meerdaagse evenementen', () => {
    expect(eventTimeLabel({ date: '2026-12-19T13:00:00Z', endDate: '2026-12-21T20:00:00Z' })).toBe('t/m ma 21 december')
  })

  it('valt terug op het oude tijdvak', () => {
    expect(eventTimeLabel({ date: '2026-12-19T13:00:00Z', timeRange: ' 14:00 – 21:00 ' })).toBe('14:00 – 21:00')
    expect(eventTimeLabel({ date: '2026-12-19T13:00:00Z' })).toBeUndefined()
  })

  it('kijkt voor "voorbij" naar het einde', () => {
    expect(eventLastDate({ date: 'a', endDate: 'b' })).toBe('b')
    expect(eventLastDate({ date: 'a' })).toBe('a')
  })
})

describe('agenda-links', () => {
  const t = getEventTimes('2026-12-19T14:00:00.000Z', '14:00 – 21:00')
  const ev = { title: 'Kerst, circus; test', slug: 'k', times: t, location: 'Enschede', description: 'Regel 1\nRegel 2', url: 'https://x/evenement/k' }

  it('Google Agenda krijgt UTC-tijden', () => {
    expect(googleCalendarHref(ev)).toContain('dates=20261219T130000Z%2F20261219T200000Z')
  })

  it('.ics escapet komma, puntkomma en regeleinden', () => {
    const ics = decodeURIComponent(icsHref(ev).split(',').slice(1).join(','))
    expect(ics).toContain('SUMMARY:Kerst\\, circus\\; test')
    expect(ics).toContain('DESCRIPTION:Regel 1\\nRegel 2')
    expect(ics).toContain('DTSTART:20261219T130000Z')
    expect(ics.split('\r\n')[0]).toBe('BEGIN:VCALENDAR')
  })

  it('hele dag = DATE-waarden met de dag erna als einde', () => {
    const ics = decodeURIComponent(icsHref({ ...ev, times: getEventTimes('2026-06-01T10:00:00Z') }).split(',').slice(1).join(','))
    expect(ics).toContain('DTSTART;VALUE=DATE:20260601')
    expect(ics).toContain('DTEND;VALUE=DATE:20260602')
  })
})
