<script setup lang="ts">
interface Event {
  _id: string
  title: string
  slug: { current: string }
  category: string
  date: string
  timeRange?: string
  location?: string
  description?: string
  externalLink?: string
}

interface AgendaPage {
  headerLabel?: string
  headerTitle?: string
  headerSubtitle?: string
  headerImage?: any
  emptyMessage?: string
}

// Grove voorselectie op de server (alles van de afgelopen 24 uur en later);
// de exacte "vanaf vandaag"-grens in NL-tijd bepaalt isPastDay hieronder.
const QUERY = `{
  "events": *[_type == "event" && !(_id in path("drafts.**")) && dateTime(date) >= dateTime(now()) - 60*60*24] | order(date asc) {
    _id, title, slug, category, date, timeRange, location, description, externalLink
  },
  "page": *[_type == "agendaPage" && !(_id in path("drafts.**"))][0]
}`
const { data } = useContentQuery<{ events: Event[]; page?: AgendaPage }>(QUERY)
const page = computed(() => data.value?.page)

const { formatDay, formatWeekday, formatMonthYear, formatChipDate, isPastDay } = useDateFormat()

const groupedEvents = computed(() => {
  const groups: { key: string; events: Event[] }[] = []
  const byKey: Record<string, { key: string; events: Event[] }> = {}
  // Ook in de browser filteren: de statische HTML is zo oud als de laatste
  // build, dus tussen twee (dagelijkse) builds kan er een evenement verlopen.
  for (const event of (data.value?.events ?? []).filter(e => !isPastDay(e.date))) {
    const key = formatMonthYear(event.date)
    let group = byKey[key]
    if (!group) {
      group = { key, events: [] }
      byKey[key] = group
      groups.push(group)
    }
    group.events.push(event)
  }
  return groups
})

useSeo({
  title: 'Agenda – Belevenisboerderij De Singel',
  description: 'Alle evenementen van Belevenisboerderij de Singel op een rij: van markten en braderieën tot boerderijbezoeken in de Achterhoek.',
})

useBreadcrumbJsonLd([
  { name: 'Home', path: '/' },
  { name: 'Agenda', path: '/agenda' },
])
</script>

<template>
  <PageHeader
    :label="page?.headerLabel ?? 'Belevenisboerderij de Singel'"
    :title="page?.headerTitle ?? 'Agenda'"
    :subtitle="page?.headerSubtitle ?? 'Kom langs bij een van onze evenementen en beleef de boerderij van dichtbij.'"
    :image="page?.headerImage"
  />

  <div v-if="groupedEvents.length" class="agenda-main">
    <div class="agenda-wrapper">
      <div v-for="group in groupedEvents" :key="group.key" v-reveal class="agenda-month">
        <h2 class="section-label dark-green list-heading">{{ group.key }}</h2>

        <article v-for="event in group.events" :key="event._id" class="agenda-item">
          <div class="date-tile" aria-hidden="true">
            <span class="date-tile-day">{{ formatDay(event.date) }}</span>
            <span class="date-tile-sub">{{ formatWeekday(event.date) }}</span>
          </div>
          <div class="agenda-content">
            <p class="section-label section-label--sm dark-green">{{ event.category }}</p>
            <h3 class="agenda-title">{{ event.title }}</h3>
            <p class="visually-hidden">{{ formatChipDate(event.date) }}</p>
            <p v-if="event.description" class="agenda-desc">{{ event.description }}</p>
            <p v-if="event.timeRange || event.location" class="agenda-meta">
              <span v-if="event.timeRange">{{ event.timeRange }}</span>
              <template v-if="event.timeRange && event.location"> · </template>
              <span v-if="event.location">{{ event.location }}</span>
            </p>
            <div class="agenda-actions">
              <NuxtLink :to="`/evenement/${event.slug.current}`" class="btn btn-outline btn-sm">
                Lees meer<span class="visually-hidden"> over {{ event.title }}</span>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </NuxtLink>
              <a v-if="event.externalLink" :href="event.externalLink" class="btn btn-outline btn-sm agenda-btn-external" target="_blank" rel="noopener noreferrer">
                Bezoek website<span class="visually-hidden"> van {{ event.title }} (opent in nieuw tabblad)</span>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
              </a>
            </div>
          </div>
        </article>
      </div>

    </div>
  </div>

  <section v-else class="page-empty">
    <div class="page-empty-inner">
      <p class="page-empty-text">{{ page?.emptyMessage ?? 'Er zijn momenteel geen evenementen gepland. Hou deze pagina in de gaten, of lees intussen ons nieuws.' }}</p>
      <NuxtLink to="/nieuws" class="btn btn-green">Lees ons nieuws</NuxtLink>
    </div>
  </section>
</template>
