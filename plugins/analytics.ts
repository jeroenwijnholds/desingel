// Bezoekersstatistiek via Umami: cookieloos en zonder persoonsgegevens, dus
// zonder toestemmingsvraag. Alleen actief als NUXT_PUBLIC_UMAMI_WEBSITE_ID
// tijdens de build gezet is (GitHub-variabele UMAMI_WEBSITE_ID).
// data-domains: alleen bezoeken op de echte site tellen, niet lokaal of in een
// preview. Umami volgt route-wissels in de SPA zelf.
// Het scriptdomein staat via scripts/add-csp.mjs in de Content-Security-Policy.
export default defineNuxtPlugin(() => {
  const { umamiWebsiteId, umamiScriptUrl, siteUrl } = useRuntimeConfig().public
  if (!umamiWebsiteId) return
  useHead({
    script: [
      {
        src: umamiScriptUrl || 'https://cloud.umami.is/script.js',
        defer: true,
        'data-website-id': umamiWebsiteId,
        'data-domains': new URL(siteUrl).hostname,
        'data-do-not-track': 'true',
      },
    ],
  })
})
