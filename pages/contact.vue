<script setup lang="ts">
interface ContactPage {
  infoOwners?: string
  infoAddress?: string
  infoHours?: string
  infoResponseTime?: string
  subjectOptions?: string[]
  privacyNotice?: string
}

const QUERY = `*[_type == "contactPage" && !(_id in path("drafts.**"))][0]`
const { data } = useSanityQuery<ContactPage>(QUERY)
const page = computed(() => data.value)

useHead({ title: 'Contact â€” Belevenisboerderij De Singel' })
</script>

<template>
  <header class="page-header">
    <div class="page-header-inner">
      <p class="section-label bright-green">Belevenisboerderij de Singel</p>
      <h1 class="page-header-title">Contact</h1>
      <p class="page-header-sub">We horen graag van je â€” stel je vraag of laat ons weten wat je wil bespreken.</p>
    </div>
  </header>

  <main class="contact-main" id="contact-form">
    <div class="contact-layout">

      <section class="contact-form-section" aria-labelledby="form-heading">
        <h2 class="contact-form-heading" id="form-heading">Stuur een bericht</h2>
        <p class="contact-form-intro">Heb je een vraag over de farmshop, een evenement of de boerderij op locatie? Vul het formulier in â€” we reageren normaal gesproken binnen 2 werkdagen.</p>

        <form
          class="contact-form"
          name="contact"
          method="POST"
          action="/bedankt"
          data-netlify="true"
          data-netlify-honeypot="bot-field"
          novalidate
        >
          <input type="hidden" name="form-name" value="contact" />
          <p class="visually-hidden">
            <label>Laat dit veld leeg: <input name="bot-field" /></label>
          </p>

          <div class="form-row form-row--two">
            <div class="form-group">
              <label class="form-label" for="naam">
                Naam <span class="form-required" aria-hidden="true">*</span>
              </label>
              <input class="form-input" type="text" id="naam" name="naam" autocomplete="name" placeholder="Jouw naam" required />
            </div>
            <div class="form-group">
              <label class="form-label" for="email">
                E-mailadres <span class="form-required" aria-hidden="true">*</span>
              </label>
              <input class="form-input" type="email" id="email" name="email" autocomplete="email" placeholder="jouw@emailadres.nl" required />
            </div>
          </div>

          <div class="form-row form-row--two">
            <div class="form-group">
              <label class="form-label" for="telefoonnummer">
                Telefoonnummer <span class="form-optional">â€” optioneel</span>
              </label>
              <input class="form-input" type="tel" id="telefoonnummer" name="telefoonnummer" autocomplete="tel" placeholder="+31 6 12 34 56 78" />
            </div>
            <div class="form-group">
              <label class="form-label" for="onderwerp">Onderwerp</label>
              <select class="form-input form-select" id="onderwerp" name="onderwerp">
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
            <textarea class="form-input form-textarea" id="bericht" name="bericht" placeholder="Waar kunnen we je mee helpen?" rows="6" required></textarea>
          </div>

          <div class="form-footer">
            <button type="submit" class="btn btn-green contact-submit">Verstuur bericht</button>
            <p class="form-privacy">{{ page?.privacyNotice ?? 'Je gegevens worden alleen gebruikt om je vraag te beantwoorden en nooit gedeeld met derden.' }}</p>
          </div>
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
                <span class="contact-info-value">{{ page?.infoOwners ?? 'Victor &amp; Mari Duurland' }}</span>
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
                <span class="contact-info-value">{{ page?.infoHours ?? 'Zaterdag & zondag\n10:00 â€“ 17:00' }}</span>
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
      src="https://maps.google.com/maps?q=51.9479284,6.510012499999999&t=&z=13&ie=UTF8&iwloc=&output=embed"
      class="contact-map"
      title="Locatie Belevenisboerderij de Singel"
      loading="lazy"
      allowfullscreen
      referrerpolicy="no-referrer-when-downgrade"
    ></iframe>
  </section>
</template>
