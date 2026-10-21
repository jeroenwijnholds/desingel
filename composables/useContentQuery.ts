/**
 * useSanityQuery, maar dan zo dat een mislukte query tijdens SSR/prerender
 * de render laat falen.
 *
 * Waarom: useAsyncData slikt fetch-fouten in een `error`-ref. Hapert Sanity
 * tijdens een (webhook-)build, dan renderden alle pagina's stilletjes met
 * fallbacks — een lege agenda, geen nieuws, geen detailroutes — en werd dat
 * gewoon gedeployd. Door hier te gooien wordt de route een 500, faalt
 * `nuxt generate` (Nuxt zet prerender.failOnError aan) en blijft de vorige
 * deploy live.
 *
 * Verder gedraagt dit zich exact als useSanityQuery (niet awaiten; voor
 * "bestaat dit document?"-checks de thenable gebruiken, zie CLAUDE.md).
 */
export function useContentQuery<T>(query: string, params?: Record<string, unknown>) {
  const result = useSanityQuery<T>(query, params)

  if (import.meta.server) {
    onServerPrefetch(async () => {
      await result
      if (result.error.value) {
        throw createError({
          statusCode: 500,
          statusMessage: `Sanity-query mislukt: ${String(result.error.value)}`,
          fatal: true,
        })
      }
    })
  }

  return result
}
