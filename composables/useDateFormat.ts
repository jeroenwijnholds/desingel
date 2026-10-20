/**
 * Nederlandse datumformattering, gedeeld door agenda, nieuws en
 * detailpagina's (stond voorheen 4× gedupliceerd per pagina).
 * nl-NL levert maand-/dagnamen in kleine letters; waar de tekst een
 * zin of kop opent kapitaliseren we de eerste letter.
 *
 * Alles formatteert expliciet in Europe/Amsterdam: Sanity slaat datetimes
 * in UTC op en de build draait in CI ook in UTC, dus zonder vaste tijdzone
 * belandde een evenement tussen 00:00 en 02:00 NL-tijd op de vorige dag
 * in de statische HTML (en in de verkeerde maandgroep).
 */

const TZ = 'Europe/Amsterdam'

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

function fmt(dateStr: string, options: Intl.DateTimeFormatOptions, locale = 'nl-NL') {
  return new Date(dateStr).toLocaleDateString(locale, { timeZone: TZ, ...options })
}

export function useDateFormat() {
  return {
    /** "8 april 2026" */
    formatDate(dateStr: string) {
      return fmt(dateStr, { day: 'numeric', month: 'long', year: 'numeric' })
    },
    /** "2026-04-08" — voor het datetime-attribuut van <time> (en-CA geeft ISO-volgorde) */
    formatDatetime(dateStr: string) {
      return fmt(dateStr, { year: 'numeric', month: '2-digit', day: '2-digit' }, 'en-CA')
    },
    /** "wo 8 april 2026" — chips op evenementpagina's */
    formatChipDate(dateStr: string) {
      return fmt(dateStr, { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })
    },
    /** "8" — dagnummer in de agendalijst */
    formatDay(dateStr: string) {
      return fmt(dateStr, { day: 'numeric' })
    },
    /** "Wo" — weekdag-afkorting in de agendalijst */
    formatWeekday(dateStr: string) {
      return capitalize(fmt(dateStr, { weekday: 'short' })).slice(0, 2)
    },
    /** "dec" — maand-afkorting in de datumtegel op de homepage */
    formatMonthShort(dateStr: string) {
      return fmt(dateStr, { month: 'short' }).replace('.', '')
    },
    /** "April 2026" — maandkop in de agendalijst */
    formatMonthYear(dateStr: string) {
      return capitalize(fmt(dateStr, { month: 'long', year: 'numeric' }))
    },
    /** true als de (NL-)kalenderdag van dateStr vóór vandaag ligt — een evenement van vandaag telt nog mee */
    isPastDay(dateStr: string, now: Date = new Date()) {
      const day = (s: string) => fmt(s, { year: 'numeric', month: '2-digit', day: '2-digit' }, 'en-CA')
      return day(dateStr) < day(now.toISOString())
    },
  }
}
