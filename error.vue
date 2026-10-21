<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{ error: NuxtError }>()

const isNotFound = computed(() => props.error.statusCode === 404)

useHead(() => ({
  title: isNotFound.value
    ? 'Pagina niet gevonden – Belevenisboerderij De Singel'
    : 'Er ging iets mis – Belevenisboerderij De Singel',
}))

function goHome() {
  clearError({ redirect: '/' })
}
</script>

<template>
  <div>
    <a href="#inhoud" class="skip-link">Direct naar de inhoud</a>
    <AppAnnouncement />
    <AppNav />
    <main id="inhoud" class="status-page" tabindex="-1">
      <div class="status-page-inner stack">
        <p class="error-code" aria-hidden="true">{{ error.statusCode }}</p>
        <p class="section-label dark-green">Belevenisboerderij de Singel</p>
        <h1 class="display-title">
          {{ isNotFound ? 'Deze pagina is er niet (meer)' : 'Er ging iets mis' }}
        </h1>
        <p class="status-page-sub">
          {{ isNotFound
            ? 'Misschien is de pagina verplaatst, of klopt het adres niet helemaal. Op de boerderij raakt ook wel eens iets zoek.'
            : 'Er is iets onverwachts misgegaan. Probeer het later opnieuw.' }}
        </p>
        <div class="status-page-actions">
          <button type="button" class="btn btn-green" @click="goHome">Terug naar de homepage</button>
          <NuxtLink to="/agenda" class="link-arrow" @click="clearError()">
            Bekijk de agenda
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </NuxtLink>
        </div>
      </div>
    </main>
    <AppFooter />
  </div>
</template>

<style scoped>
/* Opbouw: .status-page in components.css; alleen het grote foutnummer is eigen */
.error-code {
  margin: 0;
  font-family: var(--font-display);
  font-size: clamp(4rem, 3rem + 5vw, 7rem);
  font-weight: 900;
  line-height: 1;
  /* accentgroen haalde 1,2:1 op wit; lichtgroen = 4,2:1, ruim AA voor grote tekst */
  color: var(--green-light);
}
</style>
