<script setup lang="ts">
interface ContactPage {
  infoOwners?: string
  infoAddress?: string
  infoHours?: string
  infoResponseTime?: string
  subjectOptions?: string[]
  privacyNotice?: string
}

const QUERY = `{
  "page": *[_type == "contactPage" && !(_id in path("drafts.**"))][0],
  "settings": *[_type == "siteSettings" && !(_id in path("drafts.**"))][0]{ coordinates }
}`
const { data } = useSanityQuery<{ page: ContactPage; settings?: { coordinates?: { lat: number; lng: number } } }>(QUERY)
const page = computed(() => data.value?.page)

// Kaart volgt de coördinaten uit Site-instellingen; fallback = huidige locatie
const mapSrc = computed(() => {
  const { lat = 51.9479284, lng = 6.5100125 } = data.value?.settings?.coordinates ?? {}
  return `https://maps.google.com/maps?q=${lat},${lng}&t=&z=13&ie=UTF8&iwloc=&output=embed`
})

const config = useRuntimeConfig()

// --- Formulier: velden, validatie en verzendstatus ---
const form = reactive({
  naam: '',
  email: '',
  telefoonnummer: '',
  onderwerp: '',
  bericht: '',
  botcheck: false,
})

const errors = reactive<{ naam?: string; email?: string; bericht?: string }>({})
const status = ref<'idle' | 'sending' | 'error'>('idle')
const errorSummary = ref<HTMLElement | null>(null)

function validate(): boolean {
  errors.naam = form.naam.trim().length >= 2
    ? undefined
    : 'Vul je naam in (minimaal 2 tekens).'
  errors.email = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.trim())
    ? undefined
    : 'Vul een geldig e-mailadres in.'
  errors.bericht = form.bericht.trim().length >= 10
    ? undefined
    : 'Schrijf een bericht van minimaal 10 tekens.'
  return !errors.naam && !errors.email && !errors.bericht
}

const errorList = computed(() =>
  (Object.entries(errors) as Array<[string, string | undefined]>)
    .filter(([, msg]) => msg)
    .map(([field, msg]) => ({ field, msg: msg! }))
)

async function onSubmit() {
  if (status.value === 'sending') return
  if (!validate()) {
    nextTick(() => errorSummary.value?.focus())
    return
  }
  if (form.botcheck) return // honeypot

  status.value = 'sending'
  try {
    const res = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        access_key: config.public.web3formsKey,
        subject: 'Nieuw bericht via het contactformulier',
        from_name: 'Belevenisboerderij de Singel',
        naam: form.naam,
        email: form.email,
        telefoonnummer: form.telefoonnummer,
        onderwerp: form.onderwerp,
        bericht: form.bericht,
      }),
    })
    const result = await res.json()
    if (result.success) {
      await navigateTo('/bedankt')
    } else {
      status.value = 'error'
    }
  } catch {
    status.value = 'error'
  }
}

useSeo({
  title: 'Contact – Belevenisboerderij De Singel',
  description: 'Neem contact op met Belevenisboerderij de Singel: stel je vraag over de farmshop, evenementen of de boerderij op locatie.',
})
</script>

<template>
  <PageHeader
    label="Belevenisboerderij de Singel"
    title="Contact"
    subtitle="We horen graag van je – stel je vraag of laat ons weten wat je wil bespreken."
  />

  <main class="contact-main" id="contact-form">
    <div class="contact-layout">

      <section class="contact-form-section" aria-labelledby="form-heading">
        <h2 class="contact-form-heading" id="form-heading">Stuur een bericht</h2>
        <p class="contact-form-intro">Heb je een vraag over de farmshop, een evenement of de boerderij op locatie? Vul het formulier in – we reageren normaal gesproken binnen 2 werkdagen.</p>

        <form class="contact-form" novalidate @submit.prevent="onSubmit">
          <input v-model="form.botcheck" type="checkbox" name="botcheck" class="visually-hidden" tabindex="-1" autocomplete="off" aria-hidden="true" />

          <div
            v-if="errorList.length"
            ref="errorSummary"
            class="form-error-summary"
            role="alert"
            tabindex="-1"
          >
            <p class="form-error-summary-title">Het formulier is nog niet compleet:</p>
            <ul>
              <li v-for="err in errorList" :key="err.field">
                <label :for="err.field">{{ err.msg }}</label>
              </li>
            </ul>
          </div>

          <div class="form-row form-row--two">
            <div class="form-group">
              <label class="form-label" for="naam">
                Naam <span class="form-required" aria-hidden="true">*</span>
              </label>
              <input
                id="naam"
                v-model="form.naam"
                class="form-input"
                type="text"
                name="naam"
                autocomplete="name"
                placeholder="Jouw naam"
                required
                :aria-invalid="errors.naam ? 'true' : undefined"
                :aria-describedby="errors.naam ? 'naam-error' : undefined"
              />
              <p v-if="errors.naam" id="naam-error" class="form-error">{{ errors.naam }}</p>
            </div>
            <div class="form-group">
              <label class="form-label" for="email">
                E-mailadres <span class="form-required" aria-hidden="true">*</span>
              </label>
              <input
                id="email"
                v-model="form.email"
                class="form-input"
                type="email"
                name="email"
                autocomplete="email"
                placeholder="jouw@emailadres.nl"
                required
                :aria-invalid="errors.email ? 'true' : undefined"
                :aria-describedby="errors.email ? 'email-error' : undefined"
              />
              <p v-if="errors.email" id="email-error" class="form-error">{{ errors.email }}</p>
            </div>
          </div>

          <div class="form-row form-row--two">
            <div class="form-group">
              <label class="form-label" for="telefoonnummer">
                Telefoonnummer <span class="form-optional">– optioneel</span>
              </label>
              <input id="telefoonnummer" v-model="form.telefoonnummer" class="form-input" type="tel" name="telefoonnummer" autocomplete="tel" placeholder="+31 6 12 34 56 78" />
            </div>
            <div class="form-group">
              <label class="form-label" for="onderwerp">Onderwerp</label>
              <select id="onderwerp" v-model="form.onderwerp" class="form-input form-select" name="onderwerp">
                <option value="">Kies een onderwerp</option>
                <option
                  v-for="option in (page?.subjectOptions ?? ['Farmshop', 'Boerderij op Locatie', 'Evenement / Agenda', 'Anders'])"
                  :key="option"
                  :value="option"
                >{{ option }}</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label" for="bericht">
              Bericht <span class="form-required" aria-hidden="true">*</span>
            </label>
            <textarea
              id="bericht"
              v-model="form.bericht"
              class="form-input form-textarea"
              name="bericht"
              placeholder="Waar kunnen we je mee helpen?"
              rows="6"
              required
              :aria-invalid="errors.bericht ? 'true' : undefined"
              :aria-describedby="errors.bericht ? 'bericht-error' : undefined"
            ></textarea>
            <p v-if="errors.bericht" id="bericht-error" class="form-error">{{ errors.bericht }}</p>
          </div>

          <div class="form-footer">
            <button type="submit" class="btn btn-green contact-submit" :disabled="status === 'sending'">
              {{ status === 'sending' ? 'Versturen…' : 'Verstuur bericht' }}
            </button>
            <p class="form-privacy">{{ page?.privacyNotice ?? 'Je gegevens worden alleen gebruikt om je vraag te beantwoorden en nooit gedeeld met derden.' }}</p>
          </div>

          <p v-if="status === 'error'" class="form-error form-error--submit" role="alert">
            Het versturen is helaas niet gelukt. Probeer het later opnieuw, of mail ons rechtstreeks.
          </p>
        </form>
      </section>

      <aside class="contact-info-col">
        <div class="contact-info-card">
          <p class="contact-info-heading">Praktisch</p>
          <ul class="contact-info-list">
            <li>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              <div>
                <span class="contact-info-label">Adres</span>
                <span class="contact-info-value">{{ page?.infoAddress ?? 'Achterhoek, Gelderland' }}</span>
              </div>
            </li>
            <li>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              <div>
                <span class="contact-info-label">Eigenaren</span>
                <span class="contact-info-value">{{ page?.infoOwners ?? 'Victor & Mari Duurland' }}</span>
              </div>
            </li>
            <li>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              <div>
                <span class="contact-info-label">Reactietijd</span>
                <span class="contact-info-value">{{ page?.infoResponseTime ?? 'Binnen 2 werkdagen' }}</span>
              </div>
            </li>
            <li>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              <div>
                <span class="contact-info-label">Farmshop open</span>
                <span class="contact-info-value">{{ page?.infoHours ?? 'Zaterdag & zondag\n10:00 – 17:00' }}</span>
              </div>
            </li>
          </ul>
          <NuxtLink to="/agenda" class="contact-info-link">
            Bekijk alle evenementen
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </NuxtLink>
        </div>
      </aside>

    </div>
  </main>

  <section class="contact-map-section" aria-label="Locatie op de kaart">
    <iframe
      :src="mapSrc"
      class="contact-map"
      title="Locatie Belevenisboerderij de Singel"
      loading="lazy"
      allowfullscreen
      referrerpolicy="no-referrer-when-downgrade"
    ></iframe>
  </section>
</template>
