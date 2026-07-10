<script setup lang="ts">
const props = defineProps<{
  images: Array<{ url: string; srcset?: string; sizes?: string; full?: string; alt?: string }>
}>()

const activeIndex = ref<number | null>(null)
const modalEl = ref<HTMLElement | null>(null)
const thumbEls = ref<HTMLButtonElement[]>([])

function open(index: number) {
  activeIndex.value = index
  document.body.style.overflow = 'hidden'
  nextTick(() => modalEl.value?.focus())
}

function close() {
  const restoreIndex = activeIndex.value
  activeIndex.value = null
  document.body.style.overflow = ''
  if (restoreIndex !== null) thumbEls.value[restoreIndex]?.focus()
}

function prev() {
  if (activeIndex.value === null) return
  activeIndex.value = (activeIndex.value - 1 + props.images.length) % props.images.length
}

function next() {
  if (activeIndex.value === null) return
  activeIndex.value = (activeIndex.value + 1) % props.images.length
}

function onKeydown(e: KeyboardEvent) {
  if (activeIndex.value === null) return
  if (e.key === 'Escape') close()
  else if (e.key === 'ArrowLeft') prev()
  else if (e.key === 'ArrowRight') next()
  else if (e.key === 'Tab') {
    // Focus-trap: cycle binnen de dialog
    const focusables = modalEl.value?.querySelectorAll<HTMLElement>('button') ?? []
    if (!focusables.length) return
    const first = focusables[0]
    const last = focusables[focusables.length - 1]
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault()
      last.focus()
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault()
      first.focus()
    }
  }
}

// Swipe-navigatie
let touchStartX = 0
function onTouchStart(e: TouchEvent) {
  touchStartX = e.changedTouches[0].clientX
}
function onTouchEnd(e: TouchEvent) {
  const dx = e.changedTouches[0].clientX - touchStartX
  if (Math.abs(dx) < 40) return
  if (dx > 0) prev()
  else next()
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown)
  document.body.style.overflow = ''
})
</script>

<template>
  <div class="gallery-grid">
    <button
      v-for="(img, i) in images"
      :key="img.url || i"
      ref="thumbEls"
      type="button"
      class="gallery-thumb"
      :aria-label="img.alt || `Foto ${i + 1} vergroten`"
      @click="open(i)"
    >
      <img
        :src="img.url"
        :srcset="img.srcset"
        :sizes="img.sizes"
        :alt="img.alt || ''"
        class="gallery-image"
        loading="lazy"
      />
    </button>
  </div>

  <Teleport to="body">
    <div
      v-if="activeIndex !== null && activeIndex < images.length"
      ref="modalEl"
      class="modal modal--open"
      role="dialog"
      aria-modal="true"
      aria-label="Fotoweergave"
      tabindex="-1"
      @click="close"
      @touchstart.passive="onTouchStart"
      @touchend.passive="onTouchEnd"
    >
      <button class="modal-close" aria-label="Sluiten" @click.stop="close">&times;</button>

      <button
        v-if="images.length > 1"
        class="modal-nav modal-nav--prev"
        aria-label="Vorige foto"
        @click.stop="prev"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="15 18 9 12 15 6"/></svg>
      </button>

      <img
        :src="images[activeIndex].full || images[activeIndex].url"
        :alt="images[activeIndex].alt || ''"
        class="modal-img"
        @click.stop
      />

      <button
        v-if="images.length > 1"
        class="modal-nav modal-nav--next"
        aria-label="Volgende foto"
        @click.stop="next"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="9 18 15 12 9 6"/></svg>
      </button>

      <p v-if="images.length > 1" class="modal-counter" aria-live="polite">
        {{ activeIndex + 1 }} / {{ images.length }}
      </p>
    </div>
  </Teleport>
</template>
