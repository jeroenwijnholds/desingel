<script setup lang="ts">
import { PortableText } from '@portabletext/vue'
import { defineComponent, h } from 'vue'

interface Event {
  title: string
  slug: { current: string }
  category: string
  date: string
  timeRange?: string
  location?: string
  featuredImage?: any
  body?: any[]
  externalLink?: string
}

const route = useRoute()
const QUERY = `*[_type == "event" && slug.current == $slug && !(_id in path("drafts.**"))][0]`
const { data, status } = useSanityQuery<Event>(QUERY, { slug: route.params.slug as string })
const event = computed(() => data.value)

watch(status, (s) => {
  if ((s === 'success' || s === 'error') && !data.value) {
    showError({ statusCode: 404, statusMessage: 'Evenement niet gevonden' })
  }
}, { immediate: true })

const img = useSanityImg()

function formatChipDate(dateStr: string) {
  const d = new Date(dateStr)
  const wd = d.toLocaleDateString('nl-NL', { weekday: 'short' })
  const day = d.getDate()
  const month = d.toLocaleDateString('nl-NL', { month: 'long' })
  const year = d.getFullYear()
  return `${wd} ${day} ${month} ${year}`
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
              ...img(val, { widths: [500, 900, 1400], sizes: '(max-width: 900px) 100vw, 800px' }),
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

useSeo({
  title: () => event.value ? `${event.value.title} – Belevenisboerderij De Singel` : 'Evenement – Belevenisboerderij De Singel',
  description: () => event.value?.description ?? 'Evenement van Belevenisboerderij de Singel.',
  image: () => event.value?.featuredImage
    ? img(event.value.featuredImage, { widths: [1200], sizes: '1200px', aspect: 1200 / 630 }).src
    : undefined,
})
</script>

<template>
  <div v-if="event">
    <header class="event-hero">
      <div v-if="event.featuredImage" class="event-hero-image-wrap">
        <img
          v-bind="img(event.featuredImage, { widths: [768, 1200, 1600, 2000], sizes: '100vw' })"
          :alt="event.title"
          class="event-hero-img"
          loading="eager"
          fetchpriority="high"
        />
      </div>
      <div class="event-hero-content">
        <NuxtLink to="/agenda" class="event-breadcrumb">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
          Terug naar agenda
        </NuxtLink>
        <div class="event-hero-bottom">
          <p class="section-label bright-green">{{ event.category }}</p>
          <h1 class="event-hero-title">{{ event.title }}</h1>
          <div class="event-hero-chips">
            <span class="event-chip">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              {{ formatChipDate(event.date) }}
            </span>
            <span v-if="event.timeRange" class="event-chip">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              {{ event.timeRange }}
            </span>
            <span v-if="event.location" class="event-chip">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              {{ event.location }}
            </span>
          </div>
        </div>
      </div>
    </header>

    <div class="event-layout">

      <article class="event-main">
        <PortableText v-if="event.body?.length" :value="event.body" :components="portableTextComponents" />
        <div v-else class="event-section">
          <p>Meer informatie over dit evenement volgt binnenkort.</p>
        </div>
        <NuxtLink to="/contact" class="btn btn-green event-contact-btn">Neem contact op</NuxtLink>
      </article>

      <aside class="event-sidebar">
        <div class="event-info-card">
          <p class="event-info-heading">Praktisch</p>
          <ul class="event-info-list">
            <li>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              <div>
                <span class="event-info-label">Datum</span>
                <span class="event-info-value">{{ formatChipDate(event.date) }}</span>
              </div>
            </li>
            <li v-if="event.timeRange">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              <div>
                <span class="event-info-label">Tijd</span>
                <span class="event-info-value">{{ event.timeRange }}</span>
              </div>
            </li>
            <li v-if="event.location">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              <div>
                <span class="event-info-label">Locatie</span>
                <span class="event-info-value">{{ event.location }}</span>
              </div>
            </li>
            <li>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
              <div>
                <span class="event-info-label">Type</span>
                <span class="event-info-value">{{ event.category }}</span>
              </div>
            </li>
          </ul>
          <div class="event-info-actions">
            <NuxtLink to="/contact" class="btn btn-green">Neem contact op</NuxtLink>
            <a v-if="event.externalLink" :href="event.externalLink" class="event-external-btn" target="_blank" rel="noopener noreferrer">
              Bezoek evenement website
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
            </a>
          </div>
        </div>
      </aside>

    </div>
  </div>
</template>
