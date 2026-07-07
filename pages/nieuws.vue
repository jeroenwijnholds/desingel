<script setup lang="ts">
interface NieuwsArtikel {
  _id: string
  title: string
  slug: { current: string }
  category: string
  publishedAt: string
  excerpt: string
  featuredImage?: any
}

const QUERY = `*[_type == "nieuwsArtikel" && !(_id in path("drafts.**"))] | order(publishedAt desc) {
  _id, title, slug, category, publishedAt, excerpt, featuredImage
}`
const { data } = useSanityQuery<NieuwsArtikel[]>(QUERY)

const articles = computed(() => data.value ?? [])
const hero = computed(() => articles.value[0])
const featured = computed(() => articles.value.slice(1, 3))
const archive = computed(() => articles.value.slice(3))

const imageUrl = useImageUrl()

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' })
}

function formatDatetime(dateStr: string) {
  return dateStr.slice(0, 10)
}

useHead({ title: 'Nieuws – Belevenisboerderij De Singel' })
</script>

<template>
  <PageHeader
    label="Belevenisboerderij de Singel"
    title="Nieuws"
    subtitle="Verhalen van het land – over dieren, seizoenen en het leven op de boerderij."
  />

  <section v-if="hero" class="news-featured">
    <div class="news-featured-inner">
      <div class="news-featured-grid">

        <article class="news-card news-card--hero">
          <NuxtLink :to="`/nieuws/${hero.slug.current}`" class="news-card-link">
            <div class="news-card-img-wrap">
              <img
                v-if="hero.featuredImage"
                :src="imageUrl(hero.featuredImage).width(900).url()"
                :alt="hero.title"
                loading="eager"
              />
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
                  v-if="article.featuredImage"
                  :src="imageUrl(article.featuredImage).width(600).url()"
                  :alt="article.title"
                  loading="lazy"
                />
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
      <h2 class="news-archive-heading">Meer van de boerderij</h2>
      <div class="news-list">
        <article v-for="article in archive" :key="article._id" class="news-list-item">
          <NuxtLink :to="`/nieuws/${article.slug.current}`" class="news-list-link">
            <div class="news-list-img-wrap">
              <img
                v-if="article.featuredImage"
                :src="imageUrl(article.featuredImage).width(400).url()"
                :alt="article.title"
                loading="lazy"
              />
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

  <p v-if="!articles.length" class="nieuws-empty">Er zijn nog geen nieuwsartikelen gepubliceerd.</p>
</template>
