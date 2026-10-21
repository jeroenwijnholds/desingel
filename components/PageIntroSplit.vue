<script setup lang="ts">
// Intro van Over Ons en De Boerderij: tekst links, staande foto rechts.
// Zonder foto vervalt het fotoblok en wordt de intro één kolom.
// Styling: .split-intro* in page-shared.css.
type MetaIcon = 'pin' | 'tag' | 'signpost'

defineProps<{
  label: string
  title: string
  text?: string
  meta: Array<{ text: string; icon: MetaIcon }>
  /** Sanity-afbeelding (staand, 4:5) */
  image?: SanityImageField
  imageAlt: string
  caption: string
}>()

const img = useSanityImg()
</script>

<template>
  <section class="split-intro">
    <div class="split-intro-inner" :class="{ 'split-intro-inner--no-photo': !hasImage(image) }">
      <div class="split-intro-text stack">
        <p class="section-label dark-green">{{ label }}</p>
        <h1 class="display-title">{{ title }}</h1>
        <p v-if="text" class="split-intro-lead">{{ text }}</p>
        <ul class="split-intro-meta">
          <li v-for="item in meta" :key="item.text">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <template v-if="item.icon === 'pin'"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></template>
              <template v-else-if="item.icon === 'tag'"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" /><line x1="7" y1="7" x2="7.01" y2="7" /></template>
              <template v-else><path d="M12 22V12" /><path d="M5 17H2a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h3" /><path d="M19 17h3a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1h-3" /><rect x="5" y="2" width="14" height="20" rx="2" /></template>
            </svg>
            {{ item.text }}
          </li>
        </ul>
      </div>

      <div v-if="hasImage(image)" class="split-intro-photo">
        <figure class="split-intro-frame">
          <img
            v-bind="img(image, { widths: [480, 900, 1200], sizes: '(max-width: 991px) 100vw, 50vw', aspect: 0.8 })"
            :alt="image.alt ?? imageAlt"
            loading="eager"
            fetchpriority="high"
          >
        </figure>
        <p class="split-intro-caption">{{ caption }}</p>
      </div>
    </div>
  </section>
</template>
