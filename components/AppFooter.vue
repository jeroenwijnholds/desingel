<script setup lang="ts">
const QUERY = `*[_type == "siteSettings"][0]{ siteName, tagline, footerCopyright, navigation, owners, address, coordinates, telephone, socialLinks, openingHours }`

interface NavItem { label: string; href: string; isButton: boolean }
interface Owner { name: string; role: string }
interface SocialLink { platform: string; url: string }
interface OpeningHoursRule { days: string[]; opens: string; closes: string }
interface SiteSettings {
  siteName: string
  tagline: string
  footerCopyright: string
  navigation: NavItem[]
  owners: Owner[]
  address: string
  coordinates?: { lat: number; lng: number }
  telephone?: string
  socialLinks?: SocialLink[]
  openingHours?: OpeningHoursRule[]
}

const { data } = useSanityQuery<SiteSettings>(QUERY)

const navLinks = computed(() => (data.value?.navigation ?? []).filter(n => !n.isButton))

const DAY_URI: Record<string, string> = {
  monday: 'https://schema.org/Monday',
  tuesday: 'https://schema.org/Tuesday',
  wednesday: 'https://schema.org/Wednesday',
  thursday: 'https://schema.org/Thursday',
  friday: 'https://schema.org/Friday',
  saturday: 'https://schema.org/Saturday',
  sunday: 'https://schema.org/Sunday',
}

// Structured data voor Google: de boerderij als lokaal bedrijf.
// De footer staat op elke pagina, dus dit staat site-breed één keer in de head.
const config = useRuntimeConfig()
useJsonLd(() => data.value
  ? {
      '@context': 'https://schema.org',
      '@type': 'LocalBusiness',
      '@id': config.public.siteUrl,
      name: data.value.siteName,
      description: data.value.tagline,
      url: config.public.siteUrl,
      image: `${config.public.siteUrl}/og-default.jpg`,
      ...(data.value.address
        ? { address: { '@type': 'PostalAddress', streetAddress: data.value.address.replace(/\n/g, ', '), addressCountry: 'NL' } }
        : {}),
      ...(data.value.coordinates
        ? { geo: { '@type': 'GeoCoordinates', latitude: data.value.coordinates.lat, longitude: data.value.coordinates.lng } }
        : {}),
      ...(data.value.telephone ? { telephone: data.value.telephone } : {}),
      ...(data.value.socialLinks?.length ? { sameAs: data.value.socialLinks.map(s => s.url) } : {}),
      ...(data.value.openingHours?.length
        ? {
            openingHoursSpecification: data.value.openingHours.map(rule => ({
              '@type': 'OpeningHoursSpecification',
              dayOfWeek: rule.days.map(d => DAY_URI[d]).filter(Boolean),
              opens: rule.opens,
              closes: rule.closes,
            })),
          }
        : {}),
    }
  : null)
</script>

<template>
  <footer class="footer">
    <div class="footer-wrapper">
      <div class="footer-col footer-col--brand">
        <p class="footer-name">{{ data?.siteName }}</p>
        <p class="footer-tagline">{{ data?.tagline }}</p>
      </div>

      <div class="footer-col footer-col--nav">
        <p class="footer-heading">Navigatie</p>
        <ul class="footer-links">
          <li v-for="item in navLinks" :key="item.href">
            <NuxtLink :to="item.href">{{ item.label }}</NuxtLink>
          </li>
        </ul>
      </div>

      <div class="footer-col footer-col--contact">
        <p class="footer-heading">Contact</p>
        <p v-for="owner in data?.owners" :key="owner.name">{{ owner.name }}</p>
        <p v-if="data?.address" style="white-space: pre-line">{{ data.address }}</p>
      </div>
    </div>

    <div class="footer-bottom">
      <p>{{ data?.footerCopyright }}</p>
    </div>
  </footer>
</template>
