<script setup lang="ts">
interface Highlight {
  title: string
  description: string
  image?: any
}
interface BoerderijPage {
  introLabel?: string
  introTitle: string
  introText: string
  introMeta?: string[]
  introImage?: any
  photoCaption?: string
  storyLabel?: string
  storyTitle?: string
  storyColumns: string[]
  victorQuote?: string
  highlightsLabel?: string
  highlightsTitle?: string
  highlights: Highlight[]
  fullWidthPhoto?: any
  ctaLabel?: string
  ctaTitle?: string
  ctaText?: string
  ctaPrimaryLabel?: string
  ctaPrimaryHref?: string
  ctaSecondaryLabel?: string
  ctaSecondaryHref?: string
}

const QUERY = `*[_type == "boerderijPage" && !(_id in path("drafts.**"))][0]`
const { data } = useSanityQuery<BoerderijPage>(QUERY)
const page = computed(() => data.value)

const img = useSanityImg()

useSeo({
  title: 'De Boerderij – Belevenisboerderij De Singel',
  description: 'Ontdek Belevenisboerderij de Singel: een kleinschalige boerderij in de Achterhoek waar bijzondere dieren en wilde natuur samenkomen.',
})

useBreadcrumbJsonLd([
  { name: 'Home', path: '/' },
  { name: 'De Boerderij', path: '/de-boerderij' },
])
</script>

<template>
  <section class="boerderij-intro">
    <div class="boerderij-intro-inner">

      <div class="boerderij-intro-text">
        <p class="section-label dark-green">{{ page?.introLabel ?? 'Achterhoek, Gelderland' }}</p>
        <h1 class="boerderij-title">{{ page?.introTitle ?? 'Een bijzondere plek in de Achterhoek' }}</h1>
        <p class="boerderij-lead">{{ page?.introText }}</p>
        <ul class="boerderij-intro-meta">
          <li>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            {{ page?.introMeta?.[0] ?? 'Achterhoek, Gelderland' }}
          </li>
          <li>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
            {{ page?.introMeta?.[1] ?? 'Kleinschalige belevenisboerderij' }}
          </li>
        </ul>
      </div>

      <div class="boerderij-photo-wrap">
        <figure class="boerderij-photo-frame">
          <img
            v-if="page?.introImage"
            v-bind="img(page.introImage, { widths: [480, 900, 1200], sizes: '(max-width: 991px) 100vw, 50vw', aspect: 0.8 })"
            :alt="page.introImage.alt ?? 'Belevenisboerderij de Singel in de Achterhoek'"
            loading="eager"
            fetchpriority="high"
          />
        </figure>
        <p class="boerderij-photo-caption">{{ page?.photoCaption ?? 'De Singel in het hart van de Achterhoek' }}</p>
      </div>

    </div>
  </section>

  <section class="boerderij-story">
    <div v-reveal class="boerderij-story-inner">
      <p class="section-label dark-green">{{ page?.storyLabel ?? 'De boerderij' }}</p>
      <h2 class="section-title">{{ page?.storyTitle ?? 'Kleinschalig, bewust en echt' }}</h2>
      <div class="boerderij-story-columns">
        <p v-for="(column, i) in (page?.storyColumns ?? [])" :key="i">{{ column }}</p>
      </div>
    </div>
  </section>

  <section v-if="page?.victorQuote" class="boerderij-quote-section">
    <div v-reveal class="boerderij-quote-inner">
      <blockquote class="boerderij-quote">{{ page.victorQuote }}</blockquote>
      <p class="boerderij-quote-author">– Victor Duurland</p>
    </div>
  </section>

  <section v-if="page?.highlights?.length" class="boerderij-highlights">
    <div class="boerderij-highlights-inner">
      <p class="section-label dark-green boerderij-highlights-label">{{ page?.highlightsLabel ?? 'Op de Singel' }}</p>
      <h2 class="section-title boerderij-highlights-title">{{ page?.highlightsTitle ?? 'Wat je aantreft' }}</h2>
      <div class="boerderij-cards">
        <article v-for="(highlight, i) in page.highlights" :key="highlight.title" v-reveal="i * 100" class="boerderij-card">
          <div v-if="highlight.image" class="boerderij-card-img-wrap">
            <img
              v-bind="img(highlight.image, { widths: [400, 600, 900], sizes: '(max-width: 767px) 100vw, 33vw' })"
              :alt="highlight.image.alt ?? highlight.title"
              loading="lazy"
            />
          </div>
          <div class="boerderij-card-body">
            <h3 class="boerderij-card-title">{{ highlight.title }}</h3>
            <p>{{ highlight.description }}</p>
          </div>
        </article>
      </div>
    </div>
  </section>

  <div v-if="page?.fullWidthPhoto" class="boerderij-farm-photo">
    <img
      v-bind="img(page.fullWidthPhoto, { widths: [768, 1200, 1600, 2000], sizes: '100vw' })"
      :alt="page.fullWidthPhoto.alt ?? 'De Singel – Achterhoek'"
      loading="lazy"
    />
  </div>

  <CtaBlock
    :label="page?.ctaLabel ?? 'Kom langs'"
    :title="page?.ctaTitle ?? 'Beleef de Singel zelf'"
    :text="page?.ctaText ?? 'Nieuwsgierig naar de boerderij? Bezoek ons op een van onze evenementen, kom langs bij de farmshop, of neem gewoon contact op.'"
    :primary-href="page?.ctaPrimaryHref ?? '/agenda'"
    :primary-label="page?.ctaPrimaryLabel ?? 'Bekijk de agenda'"
    :secondary-href="page?.ctaSecondaryHref ?? '/contact'"
    :secondary-label="page?.ctaSecondaryLabel ?? 'Neem contact op'"
  />
</template>
