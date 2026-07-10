<script setup lang="ts">
const props = defineProps<{
  label?: string
  title: string
  subtitle?: string
  /** Sanity-afbeelding als achtergrond; de gradient-overlay houdt de tekst leesbaar */
  image?: any
}>()

const img = useSanityImg()

const imageAttrs = computed(() =>
  props.image ? img(props.image, { widths: [768, 1280, 1920], sizes: '100vw' }) : null
)
</script>

<template>
  <header class="page-header">
    <div v-if="imageAttrs" class="page-header-image-wrap" aria-hidden="true">
      <img
        v-bind="imageAttrs"
        alt=""
        class="page-header-img"
        loading="eager"
        fetchpriority="high"
      />
    </div>
    <div class="page-header-inner">
      <p v-if="label" class="section-label bright-green">{{ label }}</p>
      <h1 class="page-header-title">{{ title }}</h1>
      <p v-if="subtitle" class="page-header-sub">{{ subtitle }}</p>
    </div>
  </header>
</template>
