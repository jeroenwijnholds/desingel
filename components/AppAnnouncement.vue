<script setup lang="ts">
// Tijdelijke mededeling uit Site-instellingen ("Farmshop gesloten t/m 3 nov").
// Staat vast bovenaan; de klasse has-announcement op <html> verhoogt
// --nav-height, zodat nav en alle paginakoppen er vanzelf onder schuiven.
const { data } = useSiteSettings()

const announcement = computed(() => {
  const a = data.value?.announcement
  if (!a?.text?.trim()) return null
  // Tot en met de einddatum (NL-kalenderdag); ook in de browser gecontroleerd,
  // want de statische HTML is zo oud als de laatste build
  if (a.until && a.until < new Date().toLocaleDateString('en-CA', { timeZone: 'Europe/Amsterdam' })) return null
  return a
})
const isExternal = computed(() => /^https?:\/\//i.test(announcement.value?.link ?? ''))

useHead(() => ({ htmlAttrs: { class: announcement.value ? 'has-announcement' : undefined } }))
</script>

<template>
  <div v-if="announcement" class="announcement" role="region" aria-label="Mededeling">
    <NuxtLink
      v-if="announcement.link"
      :to="announcement.link"
      class="announcement-text announcement-text--link"
      :target="isExternal ? '_blank' : undefined"
      :rel="isExternal ? 'noopener noreferrer' : undefined"
    >{{ announcement.text }}<span v-if="isExternal" class="visually-hidden"> (opent in nieuw tabblad)</span></NuxtLink>
    <p v-else class="announcement-text">{{ announcement.text }}</p>
  </div>
</template>
