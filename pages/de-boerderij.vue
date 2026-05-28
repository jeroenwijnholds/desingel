<script setup lang="ts">
interface Highlight {
  title: string
  description: string
  image?: any
}
interface BoerderijPage {
  introTitle: string
  introText: string
  introImage?: any
  storyColumns: string[]
  victorQuote?: string
  highlights: Highlight[]
  fullWidthPhoto?: any
  ctaPrimaryLabel?: string
  ctaPrimaryHref?: string
  ctaSecondaryLabel?: string
  ctaSecondaryHref?: string
}

const QUERY = `*[_type == "boerderijPage" && !(_id in path("drafts.**"))][0]`
const { data } = useSanityQuery<BoerderijPage>(QUERY)
const page = computed(() => data.value)

const imageUrl = useImageUrl()

useHead({ title: 'De Boerderij – Belevenisboerderij De Singel' })
</script>

<template>
  <section class="boerderij-intro">
    <div class="boerderij-intro-inner">

      <div class="boerderij-intro-text">
        <p class="section-label dark-green">Achterhoek, Gelderland</p>
        <h1 class="boerderij-title">{{ page?.introTitle ?? 'Een bijzondere plek in de Achterhoek' }}</h1>
        <p class="boerderij-lead">{{ page?.introText }}</p>
        <ul class="boerderij-intro-meta">
          <li>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            Achterhoek, Gelderland
          </li>
          <li>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
            Kleinschalige belevenisboerderij
          </li>
        </ul>
      </div>

      <div class="boerderij-photo-wrap">
        <figure class="boerderij-photo-frame">
          <img
            v-if="page?.introImage"
            :src="imageUrl(page.introImage).width(900).url()"
            alt="Belevenisboerderij de Singel in de Achterhoek"
            loading="eager"
          />
        </figure>
        <p class="boerderij-photo-caption">De Singel in het hart van de Achterhoek</p>
      </div>

    </div>
  </section>

  <section class="boerderij-story">
    <div class="boerderij-story-inner">
      <p class="section-label dark-green">De boerderij</p>
      <h2 class="section-title">Kleinschalig, bewust en echt</h2>
      <div
        v-for="(column, i) in (page?.storyColumns ?? [])"
        :key="i"
        class="boerderij-story-columns"
      >
        <p>{{ column }}</p>
      </div>
    </div>
  </section>

  <section v-if="page?.victorQuote" class="boerderij-quote-section">
    <div class="boerderij-quote-inner">
      <blockquote class="boerderij-quote">{{ page.victorQuote }}</blockquote>
      <p class="boerderij-quote-author">– Victor Duurland</p>
    </div>
  </section>

  <section v-if="page?.highlights?.length" class="boerderij-highlights">
    <div class="boerderij-highlights-inner">
      <p class="section-label dark-green boerderij-highlights-label">Op de Singel</p>
      <h2 class="section-title boerderij-highlights-title">Wat je aantreft</h2>
      <div class="boerderij-cards">
        <article v-for="highlight in page.highlights" :key="highlight.title" class="boerderij-card">
          <div v-if="highlight.image" class="boerderij-card-img-wrap">
            <img
              :src="imageUrl(highlight.image).width(600).url()"
              :alt="highlight.title"
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
      :src="imageUrl(page.fullWidthPhoto).width(1600).url()"
      alt="De Singel – Achterhoek"
      loading="lazy"
    />
  </div>

  <section class="boerderij-cta">
    <div class="boerderij-cta-inner">
      <p class="section-label bright-green">Kom langs</p>
      <h2 class="boerderij-cta-title">Beleef de Singel zelf</h2>
      <p class="boerderij-cta-text">Nieuwsgierig naar de boerderij? Bezoek ons op een van onze evenementen, kom langs bij de farmshop, of neem gewoon contact op.</p>
      <div class="boerderij-cta-btns">
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
