<script setup lang="ts">
// Tweekoloms verhaal op een zachtgroene band (Over Ons, De Boerderij).
// Styling: .story* in page-shared.css.
defineProps<{
  label: string
  title: string
  columns?: string[]
}>()
</script>

<template>
  <section class="story">
    <div v-reveal class="story-inner">
      <p class="section-label dark-green">{{ label }}</p>
      <h2 class="section-title">{{ title }}</h2>
      <div class="story-columns">
        <p v-for="(column, i) in (columns ?? [])" :key="i">{{ column }}</p>
      </div>
    </div>
  </section>
</template>
