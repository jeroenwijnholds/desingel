import type { MaybeRefOrGetter } from 'vue'

/**
 * Voegt een JSON-LD structured-data-script toe aan de <head>.
 * Accepteert een getter zodat detailpagina's reactieve data kunnen geven
 * (de non-awaited Sanity-queries vullen data pas na een microtask; bij
 * SSG staat de data er tijdens de render al, dus de gegenereerde HTML
 * bevat het volledige script).
 */
export function useJsonLd(data: MaybeRefOrGetter<Record<string, unknown> | null>) {
  useHead({
    script: [
      {
        type: 'application/ld+json',
        // '<' escapen zodat content nooit uit het script-element kan breken
        innerHTML: computed(() => {
          const value = toValue(data)
          return value ? JSON.stringify(value).replace(/</g, '\\u003c') : ''
        }),
      },
    ],
  })
}
