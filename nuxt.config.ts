export default defineNuxtConfig({
  modules: ['@nuxtjs/sanity'],

  sanity: {
    projectId: process.env.SANITY_PROJECT_ID,
    dataset: process.env.SANITY_DATASET || 'production',
    apiVersion: '2024-01-01',
    useCdn: false,
  },

  css: [
    '~/assets/css/style.css',
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
      ],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: 'anonymous' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Source+Sans+3:wght@300;400;600&display=swap',
        },
      ],
    },
  },

  typescript: { strict: true },
})
