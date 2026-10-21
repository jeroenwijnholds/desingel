<script setup lang="ts">
// Types uit het Sanity-schema (types/sanity.types.ts, `npm run typegen`)
import type { OverOnsPage } from '~/types/sanity.types'

const QUERY = `*[_type == "overOnsPage"][0]`
const { data } = useContentQuery<OverOnsPage>(QUERY)
const page = computed(() => data.value)


// Titel/beschrijving voor Google: uit de Studio-groep "Google (SEO)", anders standaard
useSeo({
  title: () => page.value?.seoTitle || 'Over Ons – Belevenisboerderij De Singel',
  description: () => page.value?.seoDescription || 'Maak kennis met Victor en Mari Duurland, de boeren achter Belevenisboerderij de Singel in de Achterhoek.',
})

useBreadcrumbJsonLd([
  { name: 'Home', path: '/' },
  { name: 'Over Ons', path: '/over-ons' },
])
</script>

<template>
  <div>
    <PageIntroSplit
      :label="page?.introLabel ?? 'Victor & Mari Duurland'"
      :title="page?.introTitle ?? 'Hallo, wij zijn Victor en Mari'"
      :text="page?.introText"
      :meta="[
        { icon: 'pin', text: page?.introMeta?.[0] ?? 'Achterhoek, Gelderland' },
        { icon: 'signpost', text: page?.introMeta?.[1] ?? 'Boeren met een missie' },
      ]"
      :image="page?.familyPhoto"
      image-alt="Victor, Mari en de kinderen van de Singel"
      :caption="page?.photoCaption ?? 'Victor, Mari en de dieren van de Singel · Achterhoek'"
    />

    <PageStory
      :label="page?.storyLabel ?? 'Ons verhaal'"
      :title="page?.storyTitle ?? 'Van passie naar praktijk'"
      :columns="page?.storyColumns"
    />

    <PageQuote v-if="page?.victorQuote" :quote="page.victorQuote" :author="page.quoteAuthor || 'Victor Duurland'" />

    <section v-if="page?.values?.length" class="about-values">
      <div class="about-values-inner">
        <p class="section-label dark-green about-values-label">{{ page?.valuesLabel ?? 'Waar wij voor staan' }}</p>
        <h2 class="section-title about-values-title">{{ page?.valuesTitle ?? 'Onze overtuigingen' }}</h2>
        <div class="about-values-grid">
          <div v-for="(value, i) in page.values" :key="value._key" v-reveal="i * 100" class="about-value">
            <h3 class="about-value-title">{{ value.title }}</h3>
            <p>{{ value.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <PageWidePhoto
      v-if="page && hasImage(page.fullWidthPhoto)"
      :image="page.fullWidthPhoto"
      alt="Belevenisboerderij de Singel in de Achterhoek"
      focus="center 60%"
    />

    <CtaBlock
      :label="page?.ctaLabel ?? 'Kom langs'"
      :title="page?.ctaTitle ?? 'Beleef de boerderij zelf'"
      :text="page?.ctaText ?? 'Nieuwsgierig geworden? Kom langs op de farmshop, bezoek ons op een evenement, of stuur ons gewoon een bericht. We horen graag van je.'"
      :primary-href="page?.ctaPrimaryHref ?? '/agenda'"
      :primary-label="page?.ctaPrimaryLabel ?? 'Bekijk de agenda'"
      :secondary-href="page?.ctaSecondaryHref ?? '/contact'"
      :secondary-label="page?.ctaSecondaryLabel ?? 'Neem contact op'"
    />
  </div>
</template>
