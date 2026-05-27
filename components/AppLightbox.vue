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

const onKeydown = (e: KeyboardEvent) => { if (e.key === 'Escape') close() }
onMounted(() => window.addEventListener('keydown', onKeydown))
onUnmounted(() => window.removeEventListener('keydown', onKeydown))
</script>

<template>
  <div class="gallery-grid">
    <img
      v-for="(img, i) in images"
      :key="img.url || i"
      :src="img.url"
      :alt="img.alt || ''"
      class="gallery-image"
      loading="lazy"
      @click="open(i)"
    />
  </div>

  <Teleport to="body">
    <div
      v-if="activeIndex !== null && activeIndex < images.length"
      class="modal modal--open"
      role="dialog"
      aria-modal="true"
      @click="close"
    >
      <button class="modal-close" aria-label="Sluiten" @click.stop="close">&times;</button>
      <img
        :src="images[activeIndex].url"
        :alt="images[activeIndex].alt || ''"
        class="modal-img"
        @click.stop
      />
    </div>
  </Teleport>
</template>
