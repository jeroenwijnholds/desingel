import type { MaybeRefOrGetter } from 'vue'

interface SeoOptions {
  title: MaybeRefOrGetter<string>
  description: MaybeRefOrGetter<string>
  /** Absolute URL van een paginaspecifieke share-afbeelding (1200×630) */
  image?: MaybeRefOrGetter<string | undefined>
  /** true voor pagina's die niet geïndexeerd moeten worden (bv. /bedankt) */
  noindex?: boolean
  /** 'article' voor nieuwsartikelen (standaard 'website') */
  type?: 'website' | 'article'
  /** Publicatiedatum (ISO) — alleen zinvol bij type 'article' */
  publishedTime?: MaybeRefOrGetter<string | undefined>
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
    // detailpagina's croppen share-afbeeldingen op 1200×630 (aspect in useSanityImg);
    // og-default.jpg heeft dezelfde maat
    ogImageWidth: 1200,
    ogImageHeight: 630,
    ogImageAlt: () => toValue(opts.title),
    ogType: opts.type ?? 'website',
    ogSiteName: 'Belevenisboerderij de Singel',
    ogLocale: 'nl_NL',
    twitterCard: 'summary_large_image',
    twitterImage: () => toValue(opts.image) || `${siteUrl}/og-default.jpg`,
    ...(opts.type === 'article'
      ? { articlePublishedTime: () => toValue(opts.publishedTime) }
      : {}),
    ...(opts.noindex ? { robots: 'noindex' } : {}),
  })

  useHead({
    link: [{ rel: 'canonical', href: canonical }],
  })
}
