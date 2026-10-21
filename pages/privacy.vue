<script setup lang="ts">
import { PortableText } from '@portabletext/vue'
// Types uit het Sanity-schema (types/sanity.types.ts, `npm run typegen`)
import type { PrivacyPage } from '~/types/sanity.types'

const QUERY = `*[_type == "privacyPage"][0]`
const { data } = useContentQuery<PrivacyPage | null>(QUERY)
const page = computed(() => data.value)

const { formatDate } = useDateFormat()
const portableTextComponents = usePortableTextComponents()

useSeo({
  title: () => page.value?.seoTitle || 'Privacyverklaring – Belevenisboerderij De Singel',
  description: () => page.value?.seoDescription || 'Welke gegevens Belevenisboerderij de Singel via deze website verwerkt, waarom, en wat je rechten zijn.',
})

useBreadcrumbJsonLd([
  { name: 'Home', path: '/' },
  { name: 'Privacyverklaring', path: '/privacy' },
])
</script>

<template>
  <div class="privacy-page">
    <div class="privacy-inner">
      <header class="stack privacy-head">
        <p class="section-label dark-green">Belevenisboerderij de Singel</p>
        <h1 class="display-title">{{ page?.title ?? 'Privacyverklaring' }}</h1>
        <p v-if="page?.intro" class="privacy-intro">{{ page.intro }}</p>
        <p v-if="page?.updatedAt" class="privacy-updated">
          Laatst bijgewerkt op <time :datetime="page.updatedAt">{{ formatDate(page.updatedAt) }}</time>
        </p>
      </header>

      <div class="prose">
        <PortableText v-if="page?.body?.length" :value="page.body" :components="portableTextComponents" />
        <p v-else>
          Vragen over je gegevens? Neem contact met ons op via het
          <NuxtLink to="/contact">contactformulier</NuxtLink>.
        </p>
      </div>
    </div>
  </div>
</template>
