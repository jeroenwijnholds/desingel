/**
 * Begin- en eindtijd van een evenement, voor "Zet in je agenda" en de
 * Event-JSON-LD.
 *
 * Het tijdvak dat bezoekers zien (vrije tekst, bijv. "14:00 – 21:00") is
 * leidend, uitgelegd als Nederlandse tijd op de NL-kalenderdag van het
 * datumveld. De tijd ín het datumveld wijkt daar in de praktijk van af
 * (Kerstcircus: 15:00 opgeslagen, "14:00 – 21:00" getoond). Zonder
 * herkenbaar tijdvak wordt het een hele-dag-evenement.
 */

const TZ = 'Europe/Amsterdam'

export interface EventTimes {
  /** NL-kalenderdag, "2026-12-19" */
  day: string
  allDay: boolean
  start?: Date
  end?: Date
}

const pad = (n: number) => String(n).padStart(2, '0')

/** Offset van Amsterdam t.o.v. UTC (in ms) op een gegeven moment: +1u (CET) of +2u (CEST) */
function amsterdamOffset(utcMs: number) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: TZ, hourCycle: 'h23',
    year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit',
  }).formatToParts(new Date(utcMs))
  const get = (t: string) => Number(parts.find(p => p.type === t)?.value)
  return Date.UTC(get('year'), get('month') - 1, get('day'), get('hour'), get('minute')) - utcMs
}

/** "2026-12-19" + 14:00 Nederlandse tijd → het echte tijdstip */
function amsterdamTime(day: string, h: number, m: number) {
  const [y, mo, d] = day.split('-').map(Number) as [number, number, number]
  const guess = Date.UTC(y, mo - 1, d, h, m)
  return new Date(guess - amsterdamOffset(guess))
}

export function getEventTimes(dateStr: string, timeRange?: string): EventTimes {
  const day = new Date(dateStr).toLocaleDateString('en-CA', { timeZone: TZ })
  const times = [...(timeRange ?? '').matchAll(/(\d{1,2})[:.](\d{2})/g)]
    .map(m => [Number(m[1]), Number(m[2])] as const)
    .filter(([h, m]) => h < 24 && m < 60)
  if (!times.length) return { day, allDay: true }
  const start = amsterdamTime(day, ...times[0]!)
  let end = times[1] ? amsterdamTime(day, ...times[1]) : new Date(start.getTime() + 2 * 3600_000)
  if (end <= start) end = new Date(end.getTime() + 24 * 3600_000) // loopt door na middernacht
  return { day, allDay: false, start, end }
}

/** "2026-12-19T14:00:00+01:00" — ISO 8601 met NL-offset, voor JSON-LD */
export function isoAmsterdam(date: Date) {
  const off = amsterdamOffset(date.getTime()) / 60_000
  const local = new Date(date.getTime() + off * 60_000)
  const sign = off >= 0 ? '+' : '-'
  return `${local.toISOString().slice(0, 19)}${sign}${pad(Math.floor(Math.abs(off) / 60))}:${pad(Math.abs(off) % 60)}`
}

const utcStamp = (d: Date) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
const dayStamp = (day: string, plusDays = 0) => {
  const d = new Date(`${day}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() + plusDays)
  return d.toISOString().slice(0, 10).replace(/-/g, '')
}

interface CalendarEvent { title: string; slug: string; times: EventTimes; location?: string; description?: string; url: string }

export function googleCalendarHref(e: CalendarEvent) {
  const dates = e.times.allDay
    ? `${dayStamp(e.times.day)}/${dayStamp(e.times.day, 1)}`
    : `${utcStamp(e.times.start!)}/${utcStamp(e.times.end!)}`
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: e.title,
    dates,
    details: [e.description, e.url].filter(Boolean).join('\n\n'),
    ...(e.location ? { location: e.location } : {}),
  })
  return `https://calendar.google.com/calendar/render?${params}`
}

/** .ics als data-URI: werkt zonder server in Apple Agenda, Outlook en Android */
export function icsHref(e: CalendarEvent) {
  const esc = (s: string) => s.replace(/\\/g, '\\\\').replace(/[,;]/g, m => `\\${m}`).replace(/\r?\n/g, '\\n')
  const when = e.times.allDay
    ? [`DTSTART;VALUE=DATE:${dayStamp(e.times.day)}`, `DTEND;VALUE=DATE:${dayStamp(e.times.day, 1)}`]
    : [`DTSTART:${utcStamp(e.times.start!)}`, `DTEND:${utcStamp(e.times.end!)}`]
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Belevenisboerderij de Singel//Agenda//NL',
    'BEGIN:VEVENT',
    `UID:${e.slug}@belevenisboerderij-desingel.nl`,
    // deterministisch (gelijk in SSR en client); de begintijd volstaat als stempel
    `DTSTAMP:${e.times.allDay ? `${dayStamp(e.times.day)}T000000Z` : utcStamp(e.times.start!)}`,
    ...when,
    `SUMMARY:${esc(e.title)}`,
    ...(e.location ? [`LOCATION:${esc(e.location)}`] : []),
    `DESCRIPTION:${esc([e.description, e.url].filter(Boolean).join('\n\n'))}`,
    `URL:${e.url}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ]
  return `data:text/calendar;charset=utf-8,${encodeURIComponent(lines.join('\r\n'))}`
}
