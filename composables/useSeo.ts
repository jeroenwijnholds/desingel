import type { MaybeRefOrGetter } from 'vue'

interface SeoOptions {
  title: MaybeRefOrGetter<string>
  description: MaybeRefOrGetter<string>
  /** Absolute URL van een paginaspecifieke share-afbeelding */
  image?: MaybeRefOrGetter<string | undefined>
  /** true voor pagina's die niet geïndexeerd moeten worden (bv. /bedankt) */
  noindex?: boolean
}

/**
 * Zet title, meta description, canonical en Open Graph/Twitter-tags.
 * siteUrl komt uit runtimeConfig (NUXT_PUBLIC_SITE_URL tijdens de build).
 * Accepteert getters zodat detailpagina's reactieve waarden kunnen geven.
 */
export function useSeo(opts: SeoOptions) {
  const config = useRuntimeConfig()
  const route = useRoute()

  const siteUrl = String(config.public.siteUrl || '').replace(/\/$/, '')
  const canonical = siteUrl + route.path

  useSeoMeta({
    title: () => toValue(opts.title),
    description: () => toValue(opts.description),
    ogTitle: () => toValue(opts.title),
    ogDescription: () => toValue(opts.description),
    ogUrl: canonical,
    ogImage: () => toValue(opts.image) || `${siteUrl}/og-default.jpg`,
    ogType: 'website',
    ogSiteName: 'Belevenisboerderij de Singel',
    ogLocale: 'nl_NL',
    twitterCard: 'summary_large_image',
    ...(opts.noindex ? { robots: 'noindex' } : {}),
  })

  useHead({
    link: [{ rel: 'canonical', href: canonical }],
  })
}
