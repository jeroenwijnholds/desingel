<script setup lang="ts">
useHead({ title: 'Bedankt voor je bericht – Belevenisboerderij De Singel' })
</script>

<template>
  <main class="bedankt-main">
    <div class="bedankt-inner">
      <div class="bedankt-icon" aria-hidden="true">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
          <polyline points="22 4 12 14.01 9 11.01"/>
        </svg>
      </div>
      <p class="bedankt-label">Belevenisboerderij de Singel</p>
      <h1 class="bedankt-title">Bedankt voor je bericht!</h1>
      <p class="bedankt-sub">We hebben je bericht ontvangen en nemen normaal gesproken binnen 2 werkdagen contact met je op.</p>
      <div class="bedankt-actions">
        <NuxtLink to="/" class="btn btn-green">Terug naar de homepage</NuxtLink>
        <NuxtLink to="/agenda" class="bedankt-link">Bekijk onze evenementen</NuxtLink>
      </div>
    </div>
  </main>
</template>

<style scoped>
.bedankt-main {
  min-height: 70vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 80px 24px;
  background-color: var(--white);
}

.bedankt-inner {
  max-width: 560px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.bedankt-icon {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background-color: #eef6e9;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
  color: var(--green-light);
}

.bedankt-icon svg {
  width: 36px;
  height: 36px;
}

.bedankt-label {
  font-family: var(--font-body);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--green-light);
}

.bedankt-title {
  font-family: var(--font-display);
  font-size: 42px;
  font-weight: 700;
  color: var(--green-dark);
  line-height: 1.15;
  margin: 0;
}

.bedankt-sub {
  font-family: var(--font-body);
  font-size: 17px;
  line-height: 1.75;
  color: var(--text);
  opacity: 0.7;
  max-width: 46ch;
  margin-top: 4px;
}

.bedankt-actions {
  display: flex;
  align-items: center;
  gap: 24px;
  margin-top: 16px;
  flex-wrap: wrap;
  justify-content: center;
}

.bedankt-link {
  font-family: var(--font-body);
  font-size: 15px;
  font-weight: 600;
  color: var(--green-light);
  text-decoration: underline;
  text-underline-offset: 3px;
}

.bedankt-link:hover {
  opacity: 0.75;
}

@media screen and (max-width: 479px) {
  .bedankt-title {
    font-size: 32px;
  }

  .bedankt-actions {
    flex-direction: column;
    gap: 16px;
  }
}
</style>
