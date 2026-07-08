export default defineNuxtConfig({
  compatibilityDate: '2026-07-08',

  modules: ['@nuxtjs/sanity'],

  sanity: {
    projectId: process.env.SANITY_PROJECT_ID,
    dataset: process.env.SANITY_DATASET || 'production',
    apiVersion: '2024-01-01',
    useCdn: false,
  },

  runtimeConfig: {
    public: {
      // ingevuld via NUXT_PUBLIC_WEB3FORMS_KEY tijdens de build
      web3formsKey: '',
      // absolute site-URL voor canonical/OG; NUXT_PUBLIC_SITE_URL in CI
      siteUrl: 'https://jeroenwijnholds.github.io/desingel',
    },
  },

  css: [
    '@fontsource/playfair-display/400.css',
    '@fontsource/playfair-display/700.css',
    '@fontsource/playfair-display/900.css',
    '@fontsource/playfair-display/400-italic.css',
    '@fontsource/source-sans-3/300.css',
    '@fontsource/source-sans-3/400.css',
    '@fontsource/source-sans-3/600.css',
    '@fontsource/source-sans-3/700.css',
    '~/assets/css/style.css',
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
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: `${process.env.NUXT_APP_BASE_URL || '/'}favicon.svg` },
        { rel: 'icon', type: 'image/png', sizes: '32x32', href: `${process.env.NUXT_APP_BASE_URL || '/'}favicon-32.png` },
        { rel: 'apple-touch-icon', href: `${process.env.NUXT_APP_BASE_URL || '/'}apple-touch-icon.png` },
      ],
    },
  },

  typescript: { strict: true },
})
