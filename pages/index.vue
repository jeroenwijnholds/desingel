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
  heroImageMobile?: any
  servicesLabel?: string
  servicesTitle?: string
  servicesIntro?: string
  primaryServices: Service[]
  secondaryServices: SecondaryService[]
  upcomingLabel?: string
  upcomingTitle?: string
  upcomingEmptyText?: string
  galleryLabel?: string
  galleryTitle?: string
  ctaLabel?: string
  ctaTitle?: string
  ctaText?: string
  ctaPrimaryLabel?: string
  ctaPrimaryHref?: string
  ctaSecondaryLabel?: string
  ctaSecondaryHref?: string
}

interface UpcomingEvent {
  _id: string
  title: string
  slug: { current: string }
  date: string
  timeRange?: string
  location?: string
}

// Eén extra evenement ophalen: als het eerste vandaag al voorbij blijkt
// (isPastDay, NL-tijd) blijven er toch drie over.
const QUERY = `{
  "page": *[_type == "homePage" && !(_id in path("drafts.**"))][0],
  "gallery": *[_id == "fotoGalerij"][0].images,
  "events": *[_type == "event" && !(_id in path("drafts.**")) && dateTime(date) >= dateTime(now()) - 60*60*24] | order(date asc)[0...4] {
    _id, title, slug, date, timeRange, location
  }
}`

const { data } = useContentQuery<{ page: HomePage; gallery: any[]; events: UpcomingEvent[] }>(QUERY)

const page = computed(() => data.value?.page)
const { data: settings } = useSiteSettings()

const { formatDay, formatMonthShort, formatChipDate, formatDatetime, isPastDay } = useDateFormat()
const upcomingEvents = computed(() => (data.value?.events ?? []).filter(e => !isPastDay(e.date)).slice(0, 3))
const openingHours = computed(() => openingHoursParts(settings.value?.openingHours))

const imageUrl = useImageUrl()
const img = useSanityImg()

// Hero-foto's uit het CMS, doorgegeven als CSS-variabelen zodat de
// media-query voor mobiel blijft werken (inline background-image zou die
// overriden). Zonder ingevulde foto geldt de CSS-fallback (gebundelde
// hero-desktop/mobile.jpg). Hotspot stuurt de background-position.
const heroUrl = (source: any, width: number) => imageUrl(source).width(width).auto('format').quality(75).url()

const heroStyle = computed(() => {
  const style: Record<string, string> = {}
  const addImage = (source: any, suffix: string, width: number) => {
    if (!source?.asset?._ref) return
    style[`--hero-bg${suffix}`] = `url('${heroUrl(source, width)}')`
    if (source.hotspot) {
      style[`--hero-pos${suffix}`] = `${(source.hotspot.x * 100).toFixed(1)}% ${(source.hotspot.y * 100).toFixed(1)}%`
    }
  }
  addImage(page.value?.heroImage, '', 2000)
  // Zonder aparte mobiele foto een 1080px-versie van de desktopfoto, i.p.v.
  // de 2000px-versie op een telefoon
  addImage(hasImage(page.value?.heroImageMobile) ? page.value?.heroImageMobile : page.value?.heroImage, '-mobile', 1080)
  return Object.keys(style).length ? style : undefined
})

// De hero is het grootste element bij het laden (LCP), maar als CSS-
// achtergrond ontdekt de browser hem pas na het parsen van de stylesheet.
// Preload met dezelfde URL's en breakpoints als style.css (≤479px = mobiel).
useHead(() => {
  const desktop = page.value?.heroImage
  if (!hasImage(desktop)) return {}
  const mobile = hasImage(page.value?.heroImageMobile) ? page.value?.heroImageMobile : desktop
  return {
    link: [
      { rel: 'preload', as: 'image', href: heroUrl(desktop, 2000), media: '(min-width: 480px)', fetchpriority: 'high' },
      { rel: 'preload', as: 'image', href: heroUrl(mobile, 1080), media: '(max-width: 479px)', fetchpriority: 'high' },
    ],
  }
})

const galleryImages = computed(() =>
  (data.value?.gallery ?? []).filter(hasImage).map((source: any) => {
    const thumb = img(source, {
      widths: [400, 800, 1200],
      sizes: '(max-width: 767px) 50vw, 33vw',
    })
    return {
      url: thumb.src,
      srcset: thumb.srcset,
      sizes: thumb.sizes,
      style: (thumb as any).style,
      full: imageUrl(source).width(1600).auto('format').quality(80).url(),
      alt: source?.alt ?? '',
    }
  })
)

const heroEl = ref<HTMLElement | null>(null)
const contactCmp = ref<{ $el: HTMLElement } | null>(null)
const ctaFixedVisible = ref(false)

function updateCta() {
  if (!heroEl.value) return
  const heroRect = heroEl.value.getBoundingClientRect()
  const clipOffset = window.innerWidth >= 768 ? heroRect.height * 0.07 : 0
  const pastHero = (heroRect.bottom - clipOffset) <= 0
  const contactEl = contactCmp.value?.$el
  const contactVisible = contactEl
    ? contactEl.getBoundingClientRect().top < window.innerHeight
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

useSeo({
  // Regio + aanbod in de titel: daar zoeken mensen op ("boerderij Achterhoek")
  title: 'Belevenisboerderij De Singel – farmshop & boerderijbeleving in de Achterhoek',
  description: 'Belevenisboerderij in de Achterhoek: farmshop met eigen producten, boerderij op locatie en evenementen. Kom langs en beleef het boerenleven van dichtbij.',
})
</script>

<template>
  <section ref="heroEl" class="hero" :style="heroStyle">
    <div class="hero-ellipse-1"></div>
    <div class="hero-ellipse-2"></div>
    <div class="hero-text">
      <p class="section-label bright-green">{{ settings?.siteName ?? 'Belevenisboerderij de Singel' }}</p>
      <h1 class="hero-title">{{ page?.heroTitle ?? 'Waar kleinschalige landbouw en wilde natuur samenkomen' }}</h1>
      <p v-if="page?.heroSubtitle" class="hero-paragraph">{{ page.heroSubtitle }}</p>
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
          <p class="section-label dark-green">{{ page?.servicesLabel ?? 'Wat we doen' }}</p>
          <h2 class="section-title">{{ page?.servicesTitle ?? 'De boerderij dichtbij' }}</h2>
          <p class="intro-paragraph">{{ page?.servicesIntro ?? 'In onze tamme en georganiseerde levens willen wij mensen weer kennis laten maken met wildernis, dieren, natuur en buitenleven.' }}</p>
        </div>
        <div class="card-container">
          <img
            v-if="hasImage(page.primaryServices[0].image)"
            v-bind="img(page.primaryServices[0].image, { widths: [400, 800, 1200], sizes: '(max-width: 1180px) 100vw, 46vw', aspect: 1.5 })"
            :alt="page.primaryServices[0].image.alt ?? page.primaryServices[0].title"
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
            v-if="hasImage(page.primaryServices[1].image)"
            v-bind="img(page.primaryServices[1].image, { widths: [400, 800, 1200], sizes: '(max-width: 1180px) 100vw, 46vw', aspect: 1.5 })"
            :alt="page.primaryServices[1].image.alt ?? page.primaryServices[1].title"
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
      <div v-for="(service, i) in page.secondaryServices" :key="service.title" v-reveal="i * 100" class="service-item">
        <img
          v-if="hasImage(service.image)"
          v-bind="img(service.image, { widths: [400, 600, 900], sizes: '(max-width: 767px) 100vw, 32vw' })"
          :alt="service.image.alt ?? service.title"
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

  <section v-reveal class="upcoming-section" aria-labelledby="upcoming-title">
    <div class="upcoming-inner">
      <div class="upcoming-main">
        <p class="section-label dark-green">{{ page?.upcomingLabel ?? 'Agenda' }}</p>
        <h2 id="upcoming-title" class="section-title">{{ page?.upcomingTitle ?? 'Binnenkort op de Singel' }}</h2>
        <ul v-if="upcomingEvents.length" class="upcoming-list">
          <li v-for="event in upcomingEvents" :key="event._id">
            <NuxtLink :to="`/evenement/${event.slug.current}`" class="upcoming-item">
              <span class="upcoming-date" aria-hidden="true">
                <span class="upcoming-day">{{ formatDay(event.date) }}</span>
                <span class="upcoming-month">{{ formatMonthShort(event.date) }}</span>
              </span>
              <span class="upcoming-text">
                <span class="upcoming-title">{{ event.title }}</span>
                <span class="upcoming-meta">
                  <time :datetime="formatDatetime(event.date)">{{ formatChipDate(event.date) }}</time>
                  <template v-if="event.timeRange"> · {{ event.timeRange }}</template>
                  <template v-if="event.location"> · {{ event.location }}</template>
                </span>
              </span>
              <svg class="upcoming-arrow" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </NuxtLink>
          </li>
        </ul>
        <p v-else class="upcoming-empty">{{ page?.upcomingEmptyText ?? 'Er staan op dit moment geen evenementen gepland. Houd de agenda in de gaten – of kom langs bij de farmshop.' }}</p>
        <NuxtLink to="/agenda" class="upcoming-all">
          Bekijk de hele agenda
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
        </NuxtLink>
      </div>

      <aside v-if="openingHours.length || settings?.coordinates" class="upcoming-card" aria-label="Farmshop">
        <p class="section-label bright-green">Farmshop open</p>
        <p v-for="line in openingHours" :key="line.days + line.time" class="upcoming-hours">
          {{ line.days }}, <span class="upcoming-hours-time">{{ line.time }}</span>
        </p>
        <p v-if="settings?.address" class="upcoming-address">{{ settings.address }}</p>
        <a
          v-if="settings?.coordinates"
          :href="routeHref(settings.coordinates)"
          class="btn btn-yellow upcoming-route"
          target="_blank"
          rel="noopener noreferrer"
        >Plan je route<span class="visually-hidden"> (opent Google Maps in nieuw tabblad)</span></a>
      </aside>
    </div>
  </section>

  <section v-if="galleryImages.length" v-reveal class="gallery-section">
    <p class="section-label dark-green">{{ page?.galleryLabel ?? 'De boerderij in beeld' }}</p>
    <h2 class="section-title">{{ page?.galleryTitle ?? 'Belevenisboerderij de Singel' }}</h2>
    <AppLightbox :images="galleryImages" />
  </section>

  <CtaBlock
    id="contact"
    ref="contactCmp"
    :label="page?.ctaLabel ?? 'Kom langs'"
    :title="page?.ctaTitle ?? 'Beleef de boerderij zelf'"
    :text="page?.ctaText ?? 'Nieuwsgierig naar de boerderij? Bezoek ons op een van onze evenementen, kom langs bij de farmshop, of leer ons beter kennen.'"
    :primary-href="page?.ctaPrimaryHref ?? '/agenda'"
    :primary-label="page?.ctaPrimaryLabel ?? 'Bekijk de agenda'"
    :secondary-href="page?.ctaSecondaryHref ?? '/over-ons'"
    :secondary-label="page?.ctaSecondaryLabel ?? 'Leer ons kennen'"
  />

  <div class="cta-fixed" :class="{ 'cta-fixed--visible': ctaFixedVisible }">
    <NuxtLink to="/contact" class="btn btn-yellow">Neem contact op</NuxtLink>
  </div>
</template>
