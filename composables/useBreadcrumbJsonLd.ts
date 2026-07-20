import type { MaybeRefOrGetter } from 'vue'

interface BreadcrumbItem {
  name: string
  /** Route-pad, bijv. '/nieuws' of '/nieuws/mijn-artikel' */
  path: string
}

/**
 * Voegt een BreadcrumbList JSON-LD-script toe. Bouwt voort op useJsonLd,
 * dus dezelfde SSG-garantie: bij een getter met reactieve data (detailpagina's)
 * staat de volledige breadcrumb al in de geprerenderde HTML.
 */
export function useBreadcrumbJsonLd(items: MaybeRefOrGetter<BreadcrumbItem[] | null>) {
  const config = useRuntimeConfig()
  const siteUrl = String(config.public.siteUrl || '').replace(/\/$/, '')

  useJsonLd(() => {
    const list = toValue(items)
    if (!list || !list.length) return null
    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: list.map((item, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: item.name,
        item: siteUrl + item.path,
      })),
    }
  })
}
