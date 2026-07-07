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

const QUERY = `*[_type == "event" && !(_id in path("drafts.**"))] | order(date asc) {
  _id, title, slug, category, date, timeRange, location, description, externalLink
}`
const { data } = useSanityQuery<Event[]>(QUERY)

function formatDay(dateStr: string) {
  return new Date(dateStr).getDate().toString()
}

function formatWeekday(dateStr: string) {
  const wd = new Date(dateStr).toLocaleDateString('nl-NL', { weekday: 'short' })
  return wd.charAt(0).toUpperCase() + wd.slice(1, 2)
}

function formatMonthYear(dateStr: string) {
  const label = new Date(dateStr).toLocaleDateString('nl-NL', { month: 'long', year: 'numeric' })
  return label.charAt(0).toUpperCase() + label.slice(1)
}

const groupedEvents = computed(() => {
  const groups: { key: string; events: Event[] }[] = []
  const seen: Record<string, number> = {}
  for (const event of data.value ?? []) {
    const key = formatMonthYear(event.date)
    if (seen[key] === undefined) {
      seen[key] = groups.length
      groups.push({ key, events: [] })
    }
    groups[seen[key]].events.push(event)
  }
  return groups
})

useSeo({
  title: 'Agenda – Belevenisboerderij De Singel',
  description: 'Alle evenementen van Belevenisboerderij de Singel op een rij: van markten en braderieën tot boerderijbezoeken in de Achterhoek.',
})
</script>

<template>
  <PageHeader
    label="Belevenisboerderij de Singel"
    title="Agenda"
    subtitle="Kom langs bij een van onze evenementen en beleef de boerderij van dichtbij."
  />

  <main class="agenda-main">
    <div class="agenda-wrapper">
      <div v-for="group in groupedEvents" :key="group.key" v-reveal class="agenda-month">
        <h2 class="agenda-month-title">{{ group.key }}</h2>

        <article v-for="event in group.events" :key="event._id" class="agenda-item">
          <div class="agenda-date">
            <span class="agenda-day">{{ formatDay(event.date) }}</span>
            <span class="agenda-weekday">{{ formatWeekday(event.date) }}</span>
          </div>
          <div class="agenda-content">
            <p class="agenda-label">{{ event.category }}</p>
            <h3 class="agenda-title">{{ event.title }}</h3>
            <p v-if="event.description" class="agenda-desc">{{ event.description }}</p>
            <p v-if="event.timeRange || event.location" class="agenda-meta">
              <span v-if="event.timeRange">{{ event.timeRange }}</span>
              <template v-if="event.timeRange && event.location"> · </template>
              <span v-if="event.location">{{ event.location }}</span>
            </p>
            <div class="agenda-actions">
              <NuxtLink :to="`/evenement/${event.slug.current}`" class="agenda-btn agenda-btn--internal">
                Lees meer
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </NuxtLink>
              <a v-if="event.externalLink" :href="event.externalLink" class="agenda-btn agenda-btn--external" target="_blank" rel="noopener noreferrer">
                Bezoek website
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
              </a>
            </div>
          </div>
        </article>
      </div>

      <p v-if="!groupedEvents.length" class="agenda-empty">Er zijn momenteel geen evenementen gepland.</p>
    </div>
  </main>
</template>
