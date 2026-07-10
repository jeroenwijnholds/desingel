<script setup lang="ts">
// Gedeeld CTA-blok ("Kom langs / Beleef de boerderij zelf") — stond
// voorheen 3× vrijwel identiek in index, over-ons en de-boerderij.
// Styling: .cta-block* in page-shared.css.
defineProps<{
  label: string
  title: string
  text: string
  primaryLabel: string
  primaryHref: string
  secondaryLabel: string
  secondaryHref: string
}>()
</script>

<template>
  <section class="cta-block">
    <div v-reveal class="cta-block-inner">
      <p class="section-label dark-green">{{ label }}</p>
      <h2 class="cta-block-title">{{ title }}</h2>
      <p class="cta-block-text">{{ text }}</p>
      <div class="cta-block-btns">
        <NuxtLink :to="primaryHref" class="btn btn-green">{{ primaryLabel }}</NuxtLink>
        <NuxtLink :to="secondaryHref" class="btn btn-yellow">{{ secondaryLabel }}</NuxtLink>
      </div>
    </div>
  </section>
</template>
