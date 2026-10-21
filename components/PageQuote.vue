<script setup lang="ts">
// Groot citaat op een donkergroene band (Over Ons, De Boerderij).
// Styling: .quote-band* in page-shared.css.
defineProps<{
  quote: string
  author: string
}>()
</script>

<template>
  <section class="quote-band">
    <figure v-reveal class="quote-band-inner">
      <blockquote class="quote-band-text">{{ quote }}</blockquote>
      <figcaption class="quote-band-author">– {{ author }}</figcaption>
    </figure>
  </section>
</template>
