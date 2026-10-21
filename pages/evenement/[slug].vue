<script setup lang="ts">
import { PortableText } from '@portabletext/vue'
// Types uit het Sanity-schema (types/sanity.types.ts, `npm run typegen`)
import type { Event as SanityEvent } from '~/types/sanity.types'

const route = useRoute()
const QUERY = `*[_type == "event" && slug.current == $slug][0]`
const query = useContentQuery<SanityEvent>(QUERY, { slug: route.params.slug as string })
const { data } = query
const event = computed(() => data.value)

// De composable is thenable en resolvet pas nadat de data-ref gevuld is —
// status alleen is niet betrouwbaar (data volgt in een latere microtask).
query.then(() => {
  if (!data.value) {
    showError({ statusCode: 404, statusMessage: 'Evenement niet gevonden' })
  }
}).catch(() => {})

const img = useSanityImg()
const { formatChipDate, isPastDay } = useDateFormat()

// Verlopen evenementen worden niet meer gegenereerd, maar een pagina uit
// een eerdere build kan nog live staan tot de volgende (dagelijkse) build.
// Pas na mount bepalen, zodat de SSR-HTML niet van de client afwijkt.
const now = ref<Date | null>(null)
onMounted(() => { now.value = new Date() })
const isVoorbij = computed(() => !!(now.value && event.value && isPastDay(eventLastDate(event.value), now.value)))
const portableTextComponents = usePortableTextComponents()

useSeo({
  title: () => event.value ? `${event.value.title} – Belevenisboerderij De Singel` : 'Evenement – Belevenisboerderij De Singel',
  description: () => event.value?.description ?? 'Evenement van Belevenisboerderij de Singel.',
  image: () => event.value && hasImage(event.value.featuredImage)
    ? img(event.value.featuredImage, { widths: [1200], sizes: '1200px', aspect: 1200 / 630 }).src
    : undefined,
})

useBreadcrumbJsonLd(() => event.value
  ? [
      { name: 'Home', path: '/' },
      { name: 'Agenda', path: '/agenda' },
      { name: event.value.title, path: `/evenement/${event.value.slug.current}` },
    ]
  : null)

const config = useRuntimeConfig()

// Begin/eind in NL-tijd volgens het getoonde tijdvak (zie useEventTimes)
const times = computed(() => event.value ? getEventTimes(event.value.date, event.value.timeRange, event.value.endDate) : null)
const calendar = computed(() => {
  if (!event.value || !times.value) return null
  const input = {
    title: event.value.title,
    slug: event.value.slug.current,
    times: times.value,
    location: event.value.location,
    description: event.value.description,
    url: `${config.public.siteUrl}/evenement/${event.value.slug.current}`,
  }
  return { ics: icsHref(input), google: googleCalendarHref(input) }
})
// Contactformulier vooraf invullen met dit evenement
const timeLabel = computed(() => event.value ? eventTimeLabel(event.value) : undefined)
const contactLink = computed(() => ({ path: '/contact', query: event.value ? { over: event.value.title } : {} }))
useJsonLd(() => event.value
  ? {
      '@context': 'https://schema.org',
      '@type': 'Event',
      name: event.value.title,
      ...(times.value && !times.value.allDay
        ? { startDate: isoAmsterdam(times.value.start!), endDate: isoAmsterdam(times.value.end!) }
        : { startDate: times.value?.day ?? event.value.date }),
      eventStatus: 'https://schema.org/EventScheduled',
      eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
      ...(event.value.description ? { description: event.value.description } : {}),
      // Google vereist een adres bij Place; evenementen zijn vaak elders
      // (Enschede, Varsseveld), dus de locatietekst zelf — niet het boerderijadres.
      ...(event.value.location
        ? { location: { '@type': 'Place', name: event.value.location, address: event.value.location } }
        : {}),
      ...(hasImage(event.value.featuredImage)
        ? { image: [img(event.value.featuredImage, { widths: [1200], sizes: '1200px', aspect: 1200 / 630 }).src] }
        : {}),
      organizer: { '@type': 'Organization', name: 'Belevenisboerderij de Singel', url: config.public.siteUrl },
    }
  : null)
</script>

<template>
  <div v-if="event">
    <header class="detail-hero">
      <div v-if="hasImage(event.featuredImage)" class="detail-hero-image-wrap">
        <img
          v-bind="img(event.featuredImage, { widths: [768, 1200, 1600, 2000], sizes: '100vw' })"
          :alt="event.featuredImage.alt ?? event.title"
          class="detail-hero-img event-hero-img"
          loading="eager"
          fetchpriority="high"
        >
      </div>
      <div class="detail-hero-content">
        <NuxtLink to="/agenda" class="breadcrumb">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
          Terug naar agenda
        </NuxtLink>
        <div class="detail-hero-bottom stack">
          <p class="section-label bright-green">{{ event.category }}</p>
          <h1 class="display-title display-title--on-dark">{{ event.title }}</h1>
          <div class="event-hero-chips">
            <span class="event-chip">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              {{ formatChipDate(event.date) }}
            </span>
            <span v-if="timeLabel" class="event-chip">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              {{ timeLabel }}
            </span>
            <span v-if="event.location" class="event-chip">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              {{ event.location }}
            </span>
          </div>
        </div>
      </div>
    </header>

    <div class="sidebar-layout">

      <article>
        <p v-if="isVoorbij" class="event-past-notice" role="status">
          Dit evenement is voorbij. <NuxtLink to="/agenda">Bekijk de komende evenementen</NuxtLink>
        </p>
        <div class="prose">
          <PortableText v-if="event.body?.length" :value="event.body" :components="portableTextComponents" />
          <p v-else>Meer informatie over dit evenement volgt binnenkort.</p>
        </div>
        <NuxtLink :to="contactLink" class="btn btn-green event-contact-btn">Neem contact op</NuxtLink>
      </article>

      <aside class="sidebar-layout-aside">
        <div class="info-card info-card--reflow">
          <h2 class="section-label section-label--sm bright-green">Praktisch</h2>
          <ul class="info-card-list">
            <li>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              <div>
                <span class="info-card-label">Datum</span>
                <span class="info-card-value">{{ formatChipDate(event.date) }}</span>
              </div>
            </li>
            <li v-if="timeLabel">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              <div>
                <span class="info-card-label">Tijd</span>
                <span class="info-card-value">{{ timeLabel }}</span>
              </div>
            </li>
            <li v-if="event.location">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              <div>
                <span class="info-card-label">Locatie</span>
                <span class="info-card-value">{{ event.location }}</span>
              </div>
            </li>
            <li>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
              <div>
                <span class="info-card-label">Type</span>
                <span class="info-card-value">{{ event.category }}</span>
              </div>
            </li>
          </ul>
          <div class="info-card-actions">
            <NuxtLink :to="contactLink" class="btn btn-green">Neem contact op</NuxtLink>
            <template v-if="calendar && !isVoorbij">
              <a :href="calendar.ics" :download="`${event.slug.current}.ics`" class="btn btn-outline btn-outline--on-dark">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="12" y1="14" x2="12" y2="18"/><line x1="10" y1="16" x2="14" y2="16"/></svg>
                Zet in je agenda
              </a>
              <a :href="calendar.google" class="event-calendar-alt" target="_blank" rel="noopener noreferrer">
                of zet hem in Google Agenda<span class="visually-hidden"> (opent in nieuw tabblad)</span>
              </a>
            </template>
            <a v-if="event.externalLink" :href="event.externalLink" class="btn btn-outline btn-outline--on-dark" target="_blank" rel="noopener noreferrer">
              Bezoek evenement website<span class="visually-hidden"> (opent in nieuw tabblad)</span>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
            </a>
          </div>
        </div>
      </aside>

    </div>
  </div>
</template>
