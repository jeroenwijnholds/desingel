<script setup lang="ts">
// Reactietijd uit het CMS (Contact-pagina), zodat hij niet uit de pas loopt
// met de contactpagina — stond hier eerder hardcoded.
const { data } = useContentQuery<{ infoResponseTime?: string } | null>(
  `*[_type == "contactPage"][0]{ infoResponseTime }`
)
const responseTime = computed(() => {
  const t = data.value?.infoResponseTime?.trim() || 'Binnen 2 werkdagen'
  return t.charAt(0).toLowerCase() + t.slice(1)
})

useSeo({
  title: 'Bedankt voor je bericht – Belevenisboerderij De Singel',
  description: 'We hebben je bericht ontvangen en nemen zo snel mogelijk contact met je op.',
  noindex: true,
})
</script>

<template>
  <div class="status-page">
    <div class="status-page-inner stack">
      <div class="bedankt-icon" aria-hidden="true">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
          <polyline points="22 4 12 14.01 9 11.01"/>
        </svg>
      </div>
      <p class="section-label dark-green">Belevenisboerderij de Singel</p>
      <h1 class="display-title">Bedankt voor je bericht!</h1>
      <p class="status-page-sub">We hebben je bericht ontvangen en nemen normaal gesproken {{ responseTime }} contact met je op.</p>
      <div class="status-page-actions">
        <NuxtLink to="/" class="btn btn-green">Terug naar de homepage</NuxtLink>
        <NuxtLink to="/agenda" class="link-arrow">
          Bekijk onze evenementen
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Opbouw: .status-page in components.css; alleen het icoon is eigen */
.bedankt-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 72px;
  height: 72px;
  margin-bottom: var(--space-2);
  border-radius: 50%;
  background-color: var(--surface-soft);
  color: var(--green-light);
}

.bedankt-icon svg {
  width: 36px;
  height: 36px;
}
</style>
