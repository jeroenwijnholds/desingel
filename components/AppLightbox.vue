<script setup lang="ts">
const props = defineProps<{
  images: Array<{ url: string; alt?: string }>
}>()

const activeIndex = ref<number | null>(null)

function open(index: number) {
  activeIndex.value = index
  document.body.style.overflow = 'hidden'
}

function close() {
  activeIndex.value = null
  document.body.style.overflow = ''
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') close()
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onUnmounted(() => window.removeEventListener('keydown', onKeydown))
</script>

<template>
  <div class="gallery">
    <div
      v-for="(img, i) in images"
      :key="img.url || i"
      class="gallery__item"
      @click="open(i)"
    >
      <img :src="img.url" :alt="img.alt || ''" loading="lazy" />
    </div>
  </div>

  <Teleport to="body">
    <div
      v-if="activeIndex !== null && activeIndex < images.length"
      class="lightbox"
      role="dialog"
      aria-modal="true"
      @click="close"
    >
      <img
        :src="images[activeIndex].url"
        :alt="images[activeIndex].alt || ''"
        class="lightbox__img"
        @click.stop
      />
    </div>
  </Teleport>
</template>
