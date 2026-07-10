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
    <AppNav />
    <main class="error-main">
      <div class="error-inner">
        <p class="error-code" aria-hidden="true">{{ error.statusCode }}</p>
        <p class="error-label">Belevenisboerderij de Singel</p>
        <h1 class="error-title">
          {{ isNotFound ? 'Deze pagina is er niet (meer)' : 'Er ging iets mis' }}
        </h1>
        <p class="error-sub">
          {{ isNotFound
            ? 'Misschien is de pagina verplaatst, of klopt het adres niet helemaal. Op de boerderij raakt ook wel eens iets zoek.'
            : 'Er is iets onverwachts misgegaan. Probeer het later opnieuw.' }}
        </p>
        <div class="error-actions">
          <button type="button" class="btn btn-green" @click="goHome">Terug naar de homepage</button>
          <NuxtLink to="/agenda" class="error-link" @click="clearError()">Bekijk de agenda</NuxtLink>
        </div>
      </div>
    </main>
    <AppFooter />
  </div>
</template>

<style scoped>
.error-main {
  min-height: 70vh;
  min-height: 70svh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 120px 24px 80px;
  background-color: var(--white);
}

.error-inner {
  max-width: 560px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-4);
}

.error-code {
  font-family: var(--font-display);
  font-size: clamp(4rem, 3rem + 5vw, 7rem);
  font-weight: 900;
  color: var(--green-accent);
  line-height: 1;
  margin: 0;
}

.error-label {
  font-family: var(--font-body);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--green-light);
}

.error-title {
  font-family: var(--font-display);
  font-size: var(--text-3xl);
  font-weight: 700;
  color: var(--green-dark);
  line-height: 1.15;
  margin: 0;
}

.error-sub {
  font-family: var(--font-body);
  font-size: var(--text-lg);
  line-height: 1.75;
  color: var(--text);
  opacity: 0.7;
  max-width: 46ch;
}

.error-actions {
  display: flex;
  align-items: center;
  gap: var(--space-6);
  margin-top: var(--space-4);
  flex-wrap: wrap;
  justify-content: center;
}

.error-link {
  font-family: var(--font-body);
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--green-light);
  text-decoration: underline;
  text-underline-offset: 3px;
}

.error-link:hover {
  opacity: 0.75;
}
</style>
