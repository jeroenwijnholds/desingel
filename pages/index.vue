<script setup lang="ts">
interface Service {
  title: string
  description: string
  image?: any
  testimonialQuote?: string
  testimonialAuthor?: string
}
interface SecondaryService {
  title: string
  description: string
  image?: any
}
interface HomePage {
  heroTitle: string
  heroSubtitle: string
  heroImage?: any
  primaryServices: Service[]
  secondaryServices: SecondaryService[]
  galleryImages: any[]
  ctaPrimaryLabel?: string
  ctaPrimaryHref?: string
  ctaSecondaryLabel?: string
  ctaSecondaryHref?: string
}

const QUERY = `{
  "page": *[_type == "homePage" && !(_id in path("drafts.**"))][0],
  "settings": *[_type == "siteSettings" && !(_id in path("drafts.**"))][0]{ siteName }
}`

const { data } = useSanityQuery<{ page: HomePage; settings: { siteName: string } }>(QUERY)

const page = computed(() => data.value?.page)
const settings = computed(() => data.value?.settings)

const imageUrl = useImageUrl()

const galleryImages = computed(() =>
  (page.value?.galleryImages ?? []).map((img: any) => ({
    url: imageUrl(img).width(1200).url(),
    alt: '',
  }))
)

const heroEl = ref<HTMLElement | null>(null)
const contactEl = ref<HTMLElement | null>(null)
const ctaFixedVisible = ref(false)

function updateCta() {
  if (!heroEl.value) return
  const heroRect = heroEl.value.getBoundingClientRect()
  const clipOffset = window.innerWidth >= 768 ? heroRect.height * 0.07 : 0
  const pastHero = (heroRect.bottom - clipOffset) <= 0
  const contactVisible = contactEl.value
    ? contactEl.value.getBoundingClientRect().top < window.innerHeight
    : false
  ctaFixedVisible.value = pastHero && !contactVisible
}

onMounted(() => {
  window.addEventListener('scroll', updateCta, { passive: true })
  updateCta()
})

onUnmounted(() => {
  window.removeEventListener('scroll', updateCta)
})

useHead({ title: 'Belevenisboerderij De Singel' })
</script>

<template>
  <section ref="heroEl" class="hero">
    <div class="hero-ellipse-1"></div>
    <div class="hero-ellipse-2"></div>
    <div class="hero-text">
      <p class="section-label bright-green">{{ settings?.siteName ?? 'Belevenisboerderij de Singel' }}</p>
      <h1 class="hero-title">{{ page?.heroTitle ?? 'Waar kleinschalige landbouw en wilde natuur samenkomen' }}</h1>
      <p class="hero-paragraph">{{ page?.heroSubtitle }}</p>
      <NuxtLink to="/de-boerderij" class="hero-link">
        Lees meer over de boerderij
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
      </NuxtLink>
    </div>
  </section>

  <section class="intro-bg"></section>

  <section class="intro-section">
    <div class="content-wrapper">

      <div v-if="page?.primaryServices?.[0]" class="content-block">
        <div class="intro-text">
          <p class="section-label dark-green">Wat we doen</p>
          <h2 class="section-title">De boerderij dichtbij</h2>
          <p class="intro-paragraph">In onze tamme en georganiseerde levens willen wij mensen weer kennis laten maken met wildernis, dieren, natuur en buitenleven.</p>
        </div>
        <div class="card-container">
          <img
            v-if="page.primaryServices[0].image"
            :src="imageUrl(page.primaryServices[0].image).width(800).url()"
            :alt="page.primaryServices[0].title"
            class="card-image"
            loading="lazy"
          />
          <div class="card-desc card-desc--intro card-desc--left">
            <h3 class="card-title">{{ page.primaryServices[0].title }}</h3>
            <p class="card-paragraph">{{ page.primaryServices[0].description }}</p>
          </div>
        </div>
      </div>

      <div v-if="page?.primaryServices?.[1]" class="content-block">
        <div class="card-container">
          <img
            v-if="page.primaryServices[1].image"
            :src="imageUrl(page.primaryServices[1].image).width(800).url()"
            :alt="page.primaryServices[1].title"
            class="card-image"
            loading="lazy"
          />
          <div class="card-desc card-desc--intro card-desc--right">
            <h3 class="card-title">{{ page.primaryServices[1].title }}</h3>
            <p class="card-paragraph">{{ page.primaryServices[1].description }}</p>
          </div>
        </div>
        <div v-if="page.primaryServices[1].testimonialQuote" class="quote-block">
          <p class="quote-text">{{ page.primaryServices[1].testimonialQuote }}</p>
          <p class="quote-sender">{{ page.primaryServices[1].testimonialAuthor ?? "Victor's Boerderij op locatie" }}</p>
        </div>
      </div>

    </div>
  </section>

  <section v-if="page?.secondaryServices?.length" class="services-section">
    <div class="services-wrapper">
      <div v-for="service in page.secondaryServices" :key="service.title" class="service-item">
        <img
          v-if="service.image"
          :src="imageUrl(service.image).width(600).url()"
          :alt="service.title"
          class="service-image"
          loading="lazy"
        />
        <div class="service-desc">
          <h3 class="card-title">{{ service.title }}</h3>
          <p>{{ service.description }}</p>
        </div>
      </div>
    </div>
  </section>

  <section class="gallery-section">
    <p class="section-label dark-green">De boerderij in beeld</p>
    <h2 class="section-title">Belevenisboerderij de Singel</h2>
    <AppLightbox :images="galleryImages" />
  </section>

  <section ref="contactEl" class="boerderij-cta" id="contact">
    <div class="boerderij-cta-inner">
      <p class="section-label bright-green">Kom langs</p>
      <h2 class="boerderij-cta-title">Beleef de boerderij zelf</h2>
      <p class="boerderij-cta-text">Nieuwsgierig naar de boerderij? Bezoek ons op een van onze evenementen, kom langs bij de farmshop, of leer ons beter kennen.</p>
      <div class="boerderij-cta-btns">
        <NuxtLink :to="page?.ctaPrimaryHref ?? '/agenda'" class="btn btn-green">
          {{ page?.ctaPrimaryLabel ?? 'Bekijk de agenda' }}
        </NuxtLink>
        <NuxtLink :to="page?.ctaSecondaryHref ?? '/over-ons'" class="btn btn-yellow">
          {{ page?.ctaSecondaryLabel ?? 'Leer ons kennen' }}
        </NuxtLink>
      </div>
    </div>
  </section>

  <div class="cta-fixed" :class="{ 'cta-fixed--visible': ctaFixedVisible }">
    <NuxtLink to="/contact" class="btn btn-yellow">Neem contact op</NuxtLink>
  </div>
</template>
