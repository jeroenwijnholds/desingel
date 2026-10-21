<script setup lang="ts">
// Na een client-side navigatie bleef de focus op de aangeklikte link in de
// nav (of op niets) staan: toetsenbord- en schermlezergebruikers begonnen
// dan niet bij de nieuwe inhoud. page:finish vuurt als de nieuwe pagina
// gerenderd is; de eerste (de initiële paginalading) slaan we over, net als
// navigaties naar een anker (#contact-form e.d.).
const mainEl = ref<HTMLElement | null>(null)
const route = useRoute()
let initial = true
const off = useNuxtApp().hook('page:finish', () => {
  if (initial) { initial = false; return }
  if (route.hash) return
  mainEl.value?.focus({ preventScroll: true })
})
onBeforeUnmount(off)
</script>

<template>
  <div>
    <a href="#inhoud" class="skip-link">Direct naar de inhoud</a>
    <NuxtRouteAnnouncer />
    <AppAnnouncement />
    <AppNav />
    <main id="inhoud" ref="mainEl" tabindex="-1">
      <slot />
    </main>
    <AppFooter />
  </div>
</template>
