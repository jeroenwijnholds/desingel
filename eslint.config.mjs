// @ts-check
// Basisregels van @nuxt/eslint (Vue + TypeScript, afgestemd op Nuxt).
// `npm run lint`; draait ook in CI. .nuxt/eslint.config.mjs wordt door
// `nuxt prepare` (of typecheck/build) gegenereerd.
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt(
  {
    ignores: ['studio/**', 'types/**', '.output/**', 'scripts/eenmalig/**'],
  },
)
