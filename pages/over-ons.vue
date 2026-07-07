<script setup lang="ts">
interface Value {
  title: string
  description: string
}
interface OverOnsPage {
  introTitle: string
  introText: string
  familyPhoto?: any
  storyTitle?: string
  storyColumns: string[]
  victorQuote?: string
  values: Value[]
  fullWidthPhoto?: any
  ctaPrimaryLabel?: string
  ctaPrimaryHref?: string
  ctaSecondaryLabel?: string
  ctaSecondaryHref?: string
}

const QUERY = `*[_type == "overOnsPage" && !(_id in path("drafts.**"))][0]`
const { data } = useSanityQuery<OverOnsPage>(QUERY)
const page = computed(() => data.value)

const imageUrl = useImageUrl()

useHead({ title: 'Over Ons – Belevenisboerderij De Singel' })
</script>

<template>
  <section class="about-intro">
    <div class="about-intro-inner">

      <div class="about-intro-text">
        <p class="section-label dark-green">Victor &amp; Mari Duurland</p>
        <h1 class="about-title">{{ page?.introTitle ?? 'Hallo, wij zijn Victor en Mari' }}</h1>
        <p class="about-lead">{{ page?.introText }}</p>
        <ul class="about-intro-meta">
          <li>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            Achterhoek, Gelderland
          </li>
          <li>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 22V12"/><path d="M5 17H2a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h3"/><path d="M19 17h3a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1h-3"/><rect x="5" y="2" width="14" height="20" rx="2"/></svg>
            Boeren met een missie
          </li>
        </ul>
      </div>

      <div class="about-photo-wrap">
        <figure class="about-photo-frame">
          <img
            v-if="page?.familyPhoto"
            :src="imageUrl(page.familyPhoto).width(900).url()"
            alt="Victor, Mari en de kinderen van de Singel"
            loading="eager"
          />
          <div v-else class="about-photo-placeholder-badge">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
            Familiefoto volgt
          </div>
        </figure>
        <p class="about-photo-caption">Victor, Mari en de dieren van de Singel · Achterhoek</p>
      </div>

    </div>
  </section>

  <section class="about-story">
    <div class="about-story-inner">
      <div class="about-story-label-row">
        <p class="section-label dark-green">Ons verhaal</p>
      </div>
      <h2 class="section-title">{{ page?.storyTitle ?? 'Van passie naar praktijk' }}</h2>
      <div
        v-for="(column, i) in (page?.storyColumns ?? [])"
        :key="i"
        class="about-story-columns"
      >
        <p>{{ column }}</p>
      </div>
    </div>
  </section>

  <section v-if="page?.victorQuote" class="about-quote-section">
    <div class="about-quote-inner">
      <blockquote class="about-quote">{{ page.victorQuote }}</blockquote>
      <p class="about-quote-author">– Victor Duurland</p>
    </div>
  </section>

  <section v-if="page?.values?.length" class="about-values">
    <div class="about-values-inner">
      <p class="section-label dark-green about-values-label">Waar wij voor staan</p>
      <h2 class="section-title about-values-title">Onze overtuigingen</h2>
      <div class="about-values-grid">
        <div v-for="value in page.values" :key="value.title" class="about-value">
          <h3 class="about-value-title">{{ value.title }}</h3>
          <p>{{ value.description }}</p>
        </div>
      </div>
    </div>
  </section>

  <div v-if="page?.fullWidthPhoto" class="about-farm-photo">
    <img
      :src="imageUrl(page.fullWidthPhoto).width(1600).url()"
      alt="Belevenisboerderij de Singel in de Achterhoek"
      loading="lazy"
    />
  </div>

  <section class="about-cta">
    <div class="about-cta-inner">
      <p class="section-label bright-green">Kom langs</p>
      <h2 class="about-cta-title">Beleef de boerderij zelf</h2>
      <p class="about-cta-text">Nieuwsgierig geworden? Kom langs op de farmshop, bezoek ons op een evenement, of stuur ons gewoon een bericht. We horen graag van je.</p>
      <div class="about-cta-btns">
        <NuxtLink :to="page?.ctaPrimaryHref ?? '/agenda'" class="btn btn-green">
          {{ page?.ctaPrimaryLabel ?? 'Bekijk de agenda' }}
        </NuxtLink>
        <NuxtLink :to="page?.ctaSecondaryHref ?? '/contact'" class="btn btn-yellow">
          {{ page?.ctaSecondaryLabel ?? 'Neem contact op' }}
        </NuxtLink>
      </div>
    </div>
  </section>
</template>
