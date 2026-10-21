// Leest de opgeslagen cookiekeuze in zodra de app in de browser draait
// (zie composables/useConsent.ts). Na mount, zodat hydratatie gelijk loopt
// met de statische HTML.
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hook('app:mounted', () => useConsent().load())
})
