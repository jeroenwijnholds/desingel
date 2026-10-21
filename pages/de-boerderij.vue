<script setup lang="ts">
// Types uit het Sanity-schema (types/sanity.types.ts, `npm run typegen`)
import type { BoerderijPage } from '~/types/sanity.types'

const QUERY = `*[_type == "boerderijPage"][0]`
const { data } = useContentQuery<BoerderijPage>(QUERY)
const page = computed(() => data.value)

const img = useSanityImg()

// Titel/beschrijving voor Google: uit de Studio-groep "Google (SEO)", anders standaard
useSeo({
  title: () => page.value?.seoTitle || 'De Boerderij – Belevenisboerderij De Singel',
  description: () => page.value?.seoDescription || 'Ontdek Belevenisboerderij de Singel: een kleinschalige boerderij in de Achterhoek waar bijzondere dieren en wilde natuur samenkomen.',
})

useBreadcrumbJsonLd([
  { name: 'Home', path: '/' },
  { name: 'De Boerderij', path: '/de-boerderij' },
])
</script>

<template>
  <div>
    <PageIntroSplit
      :label="page?.introLabel ?? 'Achterhoek, Gelderland'"
      :title="page?.introTitle ?? 'Een bijzondere plek in de Achterhoek'"
      :text="page?.introText"
      :meta="[
        { icon: 'pin', text: page?.introMeta?.[0] ?? 'Achterhoek, Gelderland' },
        { icon: 'tag', text: page?.introMeta?.[1] ?? 'Kleinschalige belevenisboerderij' },
      ]"
      :image="page?.introImage"
      image-alt="Belevenisboerderij de Singel in de Achterhoek"
      :caption="page?.photoCaption ?? 'De Singel in het hart van de Achterhoek'"
    />

    <PageStory
      :label="page?.storyLabel ?? 'De boerderij'"
      :title="page?.storyTitle ?? 'Kleinschalig, bewust en echt'"
      :columns="page?.storyColumns"
    />

    <PageQuote v-if="page?.victorQuote" :quote="page.victorQuote" :author="page.quoteAuthor || 'Victor Duurland'" />

    <section v-if="page?.highlights?.length" class="boerderij-highlights">
      <div class="boerderij-highlights-inner">
        <p class="section-label dark-green boerderij-highlights-label">{{ page?.highlightsLabel ?? 'Op de Singel' }}</p>
        <h2 class="section-title boerderij-highlights-title">{{ page?.highlightsTitle ?? 'Wat je aantreft' }}</h2>
        <div class="boerderij-cards">
          <article v-for="(highlight, i) in page.highlights" :key="highlight._key" v-reveal="i * 100" class="boerderij-card">
            <div v-if="hasImage(highlight.image)" class="boerderij-card-img-wrap">
              <img
                v-bind="img(highlight.image, { widths: [400, 600, 900], sizes: '(max-width: 767px) 100vw, 33vw' })"
                :alt="highlight.image.alt ?? highlight.title"
                loading="lazy"
              >
            </div>
            <div class="boerderij-card-body">
              <h3 class="boerderij-card-title">{{ highlight.title }}</h3>
              <p>{{ highlight.description }}</p>
            </div>
          </article>
        </div>
      </div>
    </section>

    <PageWidePhoto
      v-if="page && hasImage(page.fullWidthPhoto)"
      :image="page.fullWidthPhoto"
      alt="De Singel – Achterhoek"
      focus="center 55%"
    />

    <CtaBlock
      :label="page?.ctaLabel ?? 'Kom langs'"
      :title="page?.ctaTitle ?? 'Beleef de Singel zelf'"
      :text="page?.ctaText ?? 'Nieuwsgierig naar de boerderij? Bezoek ons op een van onze evenementen, kom langs bij de farmshop, of neem gewoon contact op.'"
      :primary-href="page?.ctaPrimaryHref ?? '/agenda'"
      :primary-label="page?.ctaPrimaryLabel ?? 'Bekijk de agenda'"
      :secondary-href="page?.ctaSecondaryHref ?? '/contact'"
      :secondary-label="page?.ctaSecondaryLabel ?? 'Neem contact op'"
    />
  </div>
</template>
