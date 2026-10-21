<script setup lang="ts">
// Cookiekeuze. Het enige op de site dat cookies plaatst is de Google
// Maps-kaart op de contactpagina; daar gaat deze vraag dus over.
// Niet-modaal: de pagina blijft bruikbaar, de keuze kan ook later via
// "Cookie-instellingen" in de footer.
const { choice, needsChoice, accept, decline } = useConsent()

// Heropend via "Cookie-instellingen": focus naar de banner, en na de keuze
// terug naar die knop (anders verdwijnt de focus met de banner).
const root = ref<HTMLElement | null>(null)
let returnTo: HTMLElement | null = null
watch(choice, async (now, before) => {
  if (now !== null || before === null) return
  returnTo = document.activeElement as HTMLElement | null
  await nextTick()
  root.value?.querySelector('button')?.focus()
})
function choose(save: () => void) {
  const hadFocus = !!root.value?.contains(document.activeElement)
  save()
  if (hadFocus && returnTo?.isConnected) returnTo.focus()
  returnTo = null
}
</script>

<template>
  <Transition name="consent">
    <section v-if="needsChoice" ref="root" class="consent" aria-labelledby="consent-title">
      <div class="consent-text">
        <h2 id="consent-title" class="consent-title">Mag de kaart van Google laden?</h2>
        <p>
          Deze website plaatst zelf geen cookies. Alleen de Google Maps-kaart op de
          contactpagina doet dat. Zonder toestemming laten we die kaart weg; de route
          plannen kan altijd.
          <NuxtLink to="/privacy" class="consent-link">Lees de privacyverklaring</NuxtLink>
        </p>
      </div>
      <div class="consent-actions">
        <button type="button" class="btn btn-yellow btn-sm" @click="choose(accept)">Kaart toestaan</button>
        <button type="button" class="btn btn-outline btn-outline--on-dark btn-sm" @click="choose(decline)">Liever niet</button>
      </div>
    </section>
  </Transition>
</template>
