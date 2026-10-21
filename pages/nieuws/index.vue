<script setup lang="ts">
// Types uit het Sanity-schema (types/sanity.types.ts, `npm run typegen`)
import type { NieuwsPage, NieuwsArtikel as SanityArtikel } from '~/types/sanity.types'

type NieuwsArtikel = Pick<SanityArtikel, '_id' | 'title' | 'slug' | 'category' | 'publishedAt' | 'excerpt' | 'featuredImage'>

const QUERY = `{
  "articles": *[_type == "nieuwsArtikel"] | order(publishedAt desc) {
    _id, title, slug, category, publishedAt, excerpt, featuredImage
  },
  "page": *[_type == "nieuwsPage"][0]
}`
const { data } = useContentQuery<{ articles: NieuwsArtikel[]; page?: NieuwsPage }>(QUERY)
const page = computed(() => data.value?.page)

const articles = computed(() => data.value?.articles ?? [])
const hero = computed(() => articles.value[0])
const featured = computed(() => articles.value.slice(1, 3))
const archive = computed(() => articles.value.slice(3))

const img = useSanityImg()
const { formatDate, formatDatetime } = useDateFormat()

// Titel/beschrijving voor Google: uit de Studio-groep "Google (SEO)", anders standaard
useSeo({
  title: () => page.value?.seoTitle || 'Nieuws – Belevenisboerderij De Singel',
  description: () => page.value?.seoDescription || 'Verhalen van het land: nieuws over dieren, seizoenen, de farmshop en het dagelijks leven op Belevenisboerderij de Singel.',
})

useBreadcrumbJsonLd([
  { name: 'Home', path: '/' },
  { name: 'Nieuws', path: '/nieuws' },
])
</script>

<template>
  <div>
    <PageHeader
      :label="page?.headerLabel ?? 'Belevenisboerderij de Singel'"
      :title="page?.headerTitle ?? 'Nieuws'"
      :subtitle="page?.headerSubtitle ?? 'Verhalen van het land – over dieren, seizoenen en het leven op de boerderij.'"
      :image="page?.headerImage"
    />

    <section v-if="hero" class="news-featured">
      <div class="news-featured-inner">
        <div class="news-featured-grid">

          <article class="news-card news-card--hero">
            <NuxtLink :to="`/nieuws/${hero.slug.current}`" class="news-card-link">
              <div class="news-card-img-wrap">
                <img
                  v-if="hasImage(hero.featuredImage)"
                  v-bind="img(hero.featuredImage, { widths: [600, 900, 1400], sizes: '(max-width: 767px) 100vw, 62vw' })"
                  :alt="hero.featuredImage.alt ?? hero.title"
                  loading="eager"
                >
              </div>
              <div class="news-card-overlay">
                <div class="news-card-meta">
                  <span class="news-label">{{ hero.category }}</span>
                  <time class="news-date" :datetime="formatDatetime(hero.publishedAt)">{{ formatDate(hero.publishedAt) }}</time>
                </div>
                <h2 class="news-card-title">{{ hero.title }}</h2>
                <p class="news-card-excerpt">{{ hero.excerpt }}</p>
                <span class="news-card-cta">
                  Lees het verhaal
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                </span>
              </div>
            </NuxtLink>
          </article>

          <div v-if="featured.length" class="news-featured-side">
            <article v-for="article in featured" :key="article._id" class="news-card news-card--featured">
              <NuxtLink :to="`/nieuws/${article.slug.current}`" class="news-card-link">
                <div class="news-card-img-wrap">
                  <img
                    v-if="hasImage(article.featuredImage)"
                    v-bind="img(article.featuredImage, { widths: [400, 600, 900], sizes: '(max-width: 767px) 50vw, 33vw' })"
                    :alt="article.featuredImage.alt ?? article.title"
                    loading="lazy"
                  >
                </div>
                <div class="news-card-overlay">
                  <div class="news-card-meta">
                    <span class="news-label">{{ article.category }}</span>
                    <time class="news-date" :datetime="formatDatetime(article.publishedAt)">{{ formatDate(article.publishedAt) }}</time>
                  </div>
                  <h2 class="news-card-title">{{ article.title }}</h2>
                </div>
              </NuxtLink>
            </article>
          </div>

        </div>
      </div>
    </section>

    <section v-if="archive.length" class="news-archive">
      <div class="news-archive-inner">
        <h2 class="section-label dark-green list-heading">{{ page?.archiveHeading ?? 'Meer van de boerderij' }}</h2>
        <div class="news-list">
          <article v-for="article in archive" :key="article._id" class="news-list-item">
            <NuxtLink :to="`/nieuws/${article.slug.current}`" class="news-list-link">
              <div class="news-list-img-wrap">
                <img
                  v-if="hasImage(article.featuredImage)"
                  v-bind="img(article.featuredImage, { widths: [200, 400], sizes: '(max-width: 767px) 88px, 160px' })"
                  :alt="article.featuredImage.alt ?? article.title"
                  loading="lazy"
                >
              </div>
              <div class="news-list-body">
                <div class="news-list-meta">
                  <span class="news-label">{{ article.category }}</span>
                  <time class="news-date" :datetime="formatDatetime(article.publishedAt)">{{ formatDate(article.publishedAt) }}</time>
                </div>
                <h3 class="news-list-title">{{ article.title }}</h3>
                <p class="news-list-excerpt">{{ article.excerpt }}</p>
              </div>
            </NuxtLink>
          </article>
        </div>
      </div>
    </section>

    <section v-if="!articles.length" class="page-empty">
      <div class="page-empty-inner">
        <p class="page-empty-text">{{ page?.emptyMessage ?? 'Er zijn nog geen nieuwsartikelen gepubliceerd. Kom binnenkort terug voor verhalen van het land.' }}</p>
        <NuxtLink to="/agenda" class="btn btn-green">Bekijk de agenda</NuxtLink>
      </div>
    </section>
  </div>
</template>
