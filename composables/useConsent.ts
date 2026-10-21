/**
 * Toestemming voor externe inhoud die cookies plaatst — op deze site alleen
 * de Google Maps-kaart. De bezoekersstatistiek (Umami) is cookieloos en valt
 * hier dus niet onder.
 *
 * De keuze staat in localStorage van de bezoeker (wordt nergens heen
 * gestuurd) en vervalt na een jaar, zodat we het dan opnieuw vragen.
 * Op de server en tijdens hydratatie is de keuze onbekend (`ready` = false):
 * pas na het inlezen in de browser beslissen banner en kaart wat ze tonen,
 * zodat de statische HTML voor iedereen gelijk is.
 */

export type ConsentChoice = 'accepted' | 'declined'

const STORAGE_KEY = 'desingel-cookiekeuze'
const MAX_AGE_MS = 365 * 24 * 60 * 60 * 1000

export function useConsent() {
  const choice = useState<ConsentChoice | null>('consent-choice', () => null)
  const ready = useState<boolean>('consent-ready', () => false)

  const save = (value: ConsentChoice | null) => {
    choice.value = value
    try {
      if (value) localStorage.setItem(STORAGE_KEY, JSON.stringify({ value, date: Date.now() }))
      else localStorage.removeItem(STORAGE_KEY)
    } catch {
      // Opslag geblokkeerd (privévenster e.d.): de keuze geldt dan alleen voor dit bezoek
    }
  }

  /** Eenmalig in de browser aanroepen (plugins/consent.client.ts) */
  const load = () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      const stored = raw ? (JSON.parse(raw) as { value?: ConsentChoice; date?: number }) : null
      const fresh = stored?.date && Date.now() - stored.date < MAX_AGE_MS
      choice.value = fresh && (stored.value === 'accepted' || stored.value === 'declined') ? stored.value : null
    } catch {
      choice.value = null
    }
    ready.value = true
  }

  return {
    choice: readonly(choice),
    ready: readonly(ready),
    /** Banner tonen: in de browser ingelezen en nog geen keuze gemaakt */
    needsChoice: computed(() => ready.value && choice.value === null),
    mapsAllowed: computed(() => choice.value === 'accepted'),
    accept: () => save('accepted'),
    decline: () => save('declined'),
    /** "Cookie-instellingen": keuze wissen, de banner verschijnt opnieuw */
    reset: () => save(null),
    load,
  }
}
