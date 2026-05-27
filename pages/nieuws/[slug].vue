<script setup lang="ts">
import { PortableText } from '@portabletext/vue'
import { defineComponent, h } from 'vue'

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
  author?: string
  excerpt: string
  readTime?: number
  featuredImage?: any
  body?: any[]
  relatedArticles?: RelatedArticle[]
}

const route = useRoute()
const QUERY = `*[_type == "nieuwsArtikel" && slug.current == $slug && !(_id in path("drafts.**"))][0]{
  title, slug, category, publishedAt, author, excerpt, readTime, featuredImage, body,
  relatedArticles[]->{_id, title, slug, featuredImage}
}`
const { data } = await useSanityQuery<NieuwsArtikel>(QUERY, { slug: route.params.slug as string })
const article = computed(() => data.value)

const imageUrl = useImageUrl()

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' })
}

function formatDatetime(dateStr: string) {
  return dateStr.slice(0, 10)
}

const portableTextComponents = {
  types: {
    image: defineComponent({
      props: { value: { type: Object, default: null } },
      setup(props) {
        return () => {
          const val = props.value as any
          if (!val) return null
          return h('figure', { class: 'article-figure' }, [
            h('img', {
              src: imageUrl(val).width(900).url(),
              alt: val.alt ?? '',
              loading: 'lazy',
            }),
            val.caption ? h('figcaption', val.caption) : null,
          ].filter(Boolean))
        }
      },
    }),
  },
}

useHead(() => ({
  title: article.value ? `${article.value.title} — Belevenisboerderij De Singel` : 'Nieuws',
}))
</script>

<template>
  <div v-if="article">
    <header class="article-hero">
      <div v-if="article.featuredImage" class="article-hero-image-wrap">
        <img
          :src="imageUrl(article.featuredImage).width(1400).url()"
          :alt="article.title"
          class="article-hero-img"
          loading="eager"
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
          <p class="article-info-heading">Over dit artikel</p>
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
          <p class="article-related-heading">Meer nieuws</p>
          <ul class="article-related-list">
            <li v-for="related in article.relatedArticles" :key="related._id">
              <NuxtLink :to="`/nieuws/${related.slug.current}`" class="article-related-link">
                <div v-if="related.featuredImage" class="article-related-img">
                  <img
                    :src="imageUrl(related.featuredImage).width(200).url()"
                    :alt="related.title"
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
