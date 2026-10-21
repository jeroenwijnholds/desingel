<script setup lang="ts">
// Paginabrede foto (Over Ons, De Boerderij). Met hotspot bepaalt de
// redacteur de uitsnede; `focus` is alleen de terugval zonder hotspot.
// Styling: .wide-photo in page-shared.css.
const props = defineProps<{
  image: SanityImageField
  alt: string
  focus?: string
}>()

const img = useSanityImg()
const attrs = computed(() => img(props.image, { widths: [768, 1200, 1600, 2000], sizes: '100vw' }))
</script>

<template>
  <div class="wide-photo">
    <img
      v-bind="attrs"
      :style="attrs.style ?? (focus ? { objectPosition: focus } : undefined)"
      :alt="image.alt ?? alt"
      loading="lazy"
    >
  </div>
</template>
