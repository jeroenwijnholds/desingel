<script setup lang="ts">
// Gedeeld CTA-blok ("Kom langs / Beleef de boerderij zelf") — stond
// voorheen 3× vrijwel identiek in index, over-ons en de-boerderij (en als
// afwijkende kopie onder nieuwsartikelen). Styling: .cta-block* in page-shared.css.
const props = defineProps<{
  label: string
  title: string
  text: string
  primaryLabel: string
  primaryHref: string
  secondaryLabel?: string
  secondaryHref?: string
}>()

// Knoppen naar een lege pagina (agenda zonder evenementen, nieuws zonder
// artikelen) vallen weg; blijft alleen de tweede over, dan wordt die de groene
const { isHidden } = useContentAvailability()
const buttons = computed(() => [
  { href: props.primaryHref, label: props.primaryLabel },
  { href: props.secondaryHref, label: props.secondaryLabel },
].filter((b): b is { href: string; label: string } => !!b.href && !!b.label && !isHidden(b.href)))
</script>

<template>
  <section class="cta-block">
    <div v-reveal class="cta-block-inner stack">
      <p class="section-label dark-green">{{ label }}</p>
      <h2 class="section-title">{{ title }}</h2>
      <p class="cta-block-text">{{ text }}</p>
      <div v-if="buttons.length" class="cta-block-btns">
        <NuxtLink
          v-for="(btn, i) in buttons"
          :key="btn.href"
          :to="btn.href"
          class="btn"
          :class="i === 0 ? 'btn-green' : 'btn-yellow'"
        >{{ btn.label }}</NuxtLink>
      </div>
    </div>
  </section>
</template>
