// Sanity vervangt process.env.SANITY_STUDIO_* tijdens de build (waarden uit
// studio/.env). De Studio heeft geen @types/node, dus alleen dit stukje.
declare const process: { env: Record<`SANITY_STUDIO_${string}`, string | undefined> }
