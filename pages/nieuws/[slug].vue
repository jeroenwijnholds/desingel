<script setup lang="ts">
import { PortableText } from '@portabletext/vue'

interface RelatedArticle {
  _id: string
  title: string
  slug: { current: string }
  featuredImage?: any
}
interface NieuwsArtikel {
  title: string
  slug: { current: string }
  category: string
  publishedAt: string
  _updatedAt: string
  author?: string
  excerpt: string
  readTime?: number
  featuredImage?: any
  body?: any[]
  relatedArticles?: RelatedArticle[]
}

const route = useRoute()
const QUERY = `*[_type == "nieuwsArtikel" && slug.current == $slug && !(_id in path("drafts.**"))][0]{
  title, slug, category, publishedAt, _updatedAt, author, excerpt, readTime, featuredImage, body,
  relatedArticles[]->{_id, title, slug, featuredImage}
}`
const query = useSanityQuery<NieuwsArtikel>(QUERY, { slug: route.params.slug as string })
const { data } = query
const article = computed(() => data.value)

// De composable is thenable en resolvet pas nadat de data-ref gevuld is —
// status alleen is niet betrouwbaar (data volgt in een latere microtask).
query.then(() => {
  if (!data.value) {
    showError({ statusCode: 404, statusMessage: 'Artikel niet gevonden' })
  }
}).catch(() => {})

const img = useSanityImg()
const { formatDate, formatDatetime } = useDateFormat()
const portableTextComponents = usePortableTextComponents()

useSeo({
  title: () => article.value ? `${article.value.title} – Belevenisboerderij De Singel` : 'Nieuws – Belevenisboerderij De Singel',
  description: () => article.value?.excerpt ?? 'Nieuws van Belevenisboerderij de Singel.',
  image: () => article.value?.featuredImage
    ? img(article.value.featuredImage, { widths: [1200], sizes: '1200px', aspect: 1200 / 630 }).src
    : undefined,
  type: 'article',
  publishedTime: () => article.value?.publishedAt,
})

useBreadcrumbJsonLd(() => article.value
  ? [
      { name: 'Home', path: '/' },
      { name: 'Nieuws', path: '/nieuws' },
      { name: article.value.title, path: `/nieuws/${article.value.slug.current}` },
    ]
  : null)

const config = useRuntimeConfig()
useJsonLd(() => article.value
  ? {
      '@context': 'https://schema.org',
      '@type': 'NewsArticle',
      headline: article.value.title,
      description: article.value.excerpt,
      datePublished: article.value.publishedAt,
      dateModified: article.value._updatedAt,
      ...(article.value.featuredImage
        ? { image: [img(article.value.featuredImage, { widths: [1200], sizes: '1200px', aspect: 1200 / 630 }).src] }
        : {}),
      author: [
        article.value.author
          ? { '@type': 'Person', name: article.value.author }
          : { '@type': 'Organization', name: 'Belevenisboerderij de Singel' },
      ],
      publisher: {
        '@type': 'Organization',
        name: 'Belevenisboerderij de Singel',
        url: config.public.siteUrl,
        logo: { '@type': 'ImageObject', url: `${config.public.siteUrl}/icon-512.png`, width: 512, height: 512 },
      },
    }
  : null)
</script>

<template>
  <div v-if="article">
    <header class="article-hero">
      <div v-if="article.featuredImage" class="article-hero-image-wrap">
        <img
          v-bind="img(article.featuredImage, { widths: [768, 1200, 1600, 2000], sizes: '100vw' })"
          :alt="article.featuredImage.alt ?? article.title"
          class="article-hero-img"
          loading="eager"
          fetchpriority="high"
        />
      </div>
      <div class="article-hero-content">
        <NuxtLink to="/nieuws" class="article-breadcrumb">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
          Terug naar nieuws
        </NuxtLink>
        <div class="article-hero-bottom">
          <div class="article-hero-meta">
            <span class="news-label">{{ article.category }}</span>
            <time class="news-date" :datetime="formatDatetime(article.publishedAt)">{{ formatDate(article.publishedAt) }}</time>
          </div>
          <h1 class="article-hero-title">{{ article.title }}</h1>
          <p class="article-hero-lead">{{ article.excerpt }}</p>
        </div>
      </div>
    </header>

    <div class="article-layout">

      <article class="article-body">
        <PortableText v-if="article.body?.length" :value="article.body" :components="portableTextComponents" />
      </article>

      <aside class="article-sidebar">

        <div class="article-info-card">
          <h2 class="article-info-heading">Over dit artikel</h2>
          <ul class="article-info-list">
            <li>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
              <div>
                <span class="article-info-label">Categorie</span>
                <span class="article-info-value">{{ article.category }}</span>
              </div>
            </li>
            <li>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              <div>
                <span class="article-info-label">Gepubliceerd</span>
                <span class="article-info-value">{{ formatDate(article.publishedAt) }}</span>
              </div>
            </li>
            <li v-if="article.author">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              <div>
                <span class="article-info-label">Auteur</span>
                <span class="article-info-value">{{ article.author }}</span>
              </div>
            </li>
            <li v-if="article.readTime">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              <div>
                <span class="article-info-label">Leestijd</span>
                <span class="article-info-value">± {{ article.readTime }} minuten</span>
              </div>
            </li>
          </ul>
        </div>

        <div v-if="article.relatedArticles?.length" class="article-related-card">
          <h2 class="article-related-heading">Meer nieuws</h2>
          <ul class="article-related-list">
            <li v-for="related in article.relatedArticles" :key="related._id">
              <NuxtLink :to="`/nieuws/${related.slug.current}`" class="article-related-link">
                <div v-if="related.featuredImage" class="article-related-img">
                  <img
                    v-bind="img(related.featuredImage, { widths: [120, 200], sizes: '72px' })"
                    :alt="related.featuredImage.alt ?? related.title"
                    loading="lazy"
                  />
                </div>
                <h3 class="article-related-title">{{ related.title }}</h3>
              </NuxtLink>
            </li>
          </ul>
        </div>

      </aside>

    </div>

    <section class="article-more">
      <div class="article-more-inner">
        <p class="article-more-label">Meer van de boerderij</p>
        <h2 class="article-more-title">Blijf op de hoogte van het boerderijleven</h2>
        <p class="article-more-text">Verhalen over dieren, seizoenen, de farmshop en het dagelijkse leven op de Singel.</p>
        <NuxtLink to="/nieuws" class="btn btn-green">Bekijk alle nieuws</NuxtLink>
      </div>
    </section>
  </div>
</template>
