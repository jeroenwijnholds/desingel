/**
 * Nederlandse datumformattering, gedeeld door agenda, nieuws en
 * detailpagina's (stond voorheen 4× gedupliceerd per pagina).
 * nl-NL levert maand-/dagnamen in kleine letters; waar de tekst een
 * zin of kop opent kapitaliseren we de eerste letter.
 */

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

export function useDateFormat() {
  return {
    /** "8 april 2026" */
    formatDate(dateStr: string) {
      return new Date(dateStr).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' })
    },
    /** "2026-04-08" — voor het datetime-attribuut van <time> */
    formatDatetime(dateStr: string) {
      return dateStr.slice(0, 10)
    },
    /** "wo 8 april 2026" — chips op evenementpagina's */
    formatChipDate(dateStr: string) {
      const d = new Date(dateStr)
      const wd = d.toLocaleDateString('nl-NL', { weekday: 'short' })
      return `${wd} ${d.getDate()} ${d.toLocaleDateString('nl-NL', { month: 'long' })} ${d.getFullYear()}`
    },
    /** "8" — dagnummer in de agendalijst */
    formatDay(dateStr: string) {
      return new Date(dateStr).getDate().toString()
    },
    /** "W" — eerste letter van de weekdag in de agendalijst */
    formatWeekday(dateStr: string) {
      const wd = new Date(dateStr).toLocaleDateString('nl-NL', { weekday: 'short' })
      return capitalize(wd).slice(0, 2)
    },
    /** "April 2026" — maandkop in de agendalijst */
    formatMonthYear(dateStr: string) {
      return capitalize(new Date(dateStr).toLocaleDateString('nl-NL', { month: 'long', year: 'numeric' }))
    },
  }
}
