<script setup lang="ts">
// Gedeeld CTA-blok ("Kom langs / Beleef de boerderij zelf") — stond
// voorheen 3× vrijwel identiek in index, over-ons en de-boerderij (en als
// afwijkende kopie onder nieuwsartikelen). Styling: .cta-block* in page-shared.css.
defineProps<{
  label: string
  title: string
  text: string
  primaryLabel: string
  primaryHref: string
  secondaryLabel?: string
  secondaryHref?: string
}>()
</script>

<template>
  <section class="cta-block">
    <div v-reveal class="cta-block-inner stack">
      <p class="section-label dark-green">{{ label }}</p>
      <h2 class="section-title">{{ title }}</h2>
      <p class="cta-block-text">{{ text }}</p>
      <div class="cta-block-btns">
        <NuxtLink :to="primaryHref" class="btn btn-green">{{ primaryLabel }}</NuxtLink>
        <NuxtLink v-if="secondaryHref && secondaryLabel" :to="secondaryHref" class="btn btn-yellow">{{ secondaryLabel }}</NuxtLink>
      </div>
    </div>
  </section>
</template>
