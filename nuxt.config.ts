export default defineNuxtConfig({
  compatibilityDate: '2026-07-08',

  modules: ['@nuxtjs/sanity', '@nuxt/eslint'],

  sanity: {
    projectId: process.env.SANITY_PROJECT_ID,
    dataset: process.env.SANITY_DATASET || 'production',
    apiVersion: '2024-01-01',
    useCdn: false,
    // Alleen gepubliceerde content (de API laat concepten dan weg); vervangt
    // de losse !(_id in path("drafts.**"))-filters die in elke query stonden
    perspective: 'published',
  },

  runtimeConfig: {
    public: {
      // ingevuld via NUXT_PUBLIC_WEB3FORMS_KEY tijdens de build
      web3formsKey: '',
      // absolute site-URL voor canonical/OG; NUXT_PUBLIC_SITE_URL in CI
      siteUrl: 'https://jeroenwijnholds.github.io/desingel',
      // Umami-statistiek (plugins/analytics.ts); leeg = uit.
      // NUXT_PUBLIC_UMAMI_WEBSITE_ID / NUXT_PUBLIC_UMAMI_SCRIPT_URL in CI
      umamiWebsiteId: '',
      umamiScriptUrl: '',
    },
  },

  css: [
    '@fontsource/playfair-display/400.css',
    '@fontsource/playfair-display/700.css',
    '@fontsource/playfair-display/900.css',
    '@fontsource/playfair-display/400-italic.css',
    '@fontsource/source-sans-3/400.css',
    '@fontsource/source-sans-3/600.css',
    '@fontsource/source-sans-3/700.css',
    // echte cursieven voor <em> in CMS-teksten, bijschriften en het verhaal
    // (anders maakt de browser een scheve nep-cursief); laden pas bij gebruik
    '@fontsource/source-sans-3/400-italic.css',
    '@fontsource/source-sans-3/600-italic.css',
    '~/assets/css/style.css',
    '~/assets/css/components.css',
    '~/assets/css/page-header.css',
    '~/assets/css/page-shared.css',
    '~/assets/css/agenda.css',
    '~/assets/css/contact.css',
    '~/assets/css/de-boerderij.css',
    '~/assets/css/nieuws.css',
    '~/assets/css/over-ons.css',
    '~/assets/css/evenement.css',
    '~/assets/css/nieuws-artikel.css',
  ],

  app: {
    head: {
      htmlAttrs: { lang: 'nl' },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'theme-color', content: '#364838' },
        // Externe sites (Google Maps, Web3Forms, links) zien alleen het domein, niet de volledige URL
        { name: 'referrer', content: 'strict-origin-when-cross-origin' },
      ],
      link: [
        // alle contentfoto's (incl. LCP-hero's) komen van de Sanity-CDN
        { rel: 'preconnect', href: 'https://cdn.sanity.io' },
        { rel: 'icon', type: 'image/svg+xml', href: `${process.env.NUXT_APP_BASE_URL || '/'}favicon.svg` },
        { rel: 'icon', type: 'image/png', sizes: '32x32', href: `${process.env.NUXT_APP_BASE_URL || '/'}favicon-32.png` },
        { rel: 'apple-touch-icon', href: `${process.env.NUXT_APP_BASE_URL || '/'}apple-touch-icon.png` },
      ],
    },
  },

  typescript: { strict: true },
})
