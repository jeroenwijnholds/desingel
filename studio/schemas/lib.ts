import { defineField, type StringRule } from 'sanity'

export const HOTSPOT_UITLEG =
  'Tip: klik op "Edit hotspot" op de foto en sleep de cirkel naar het belangrijkste ' +
  'deel (bijv. het dier). De website houdt dat deel dan op elk schermformaat in beeld.'

/**
 * Validatie voor vrije link-velden (knoppen, menu): alleen een pad op deze
 * site (/agenda) of een http(s)-, mailto:- of tel:-link. Houdt typfouten
 * zonder slash (die een kapotte relatieve link gaven) en javascript:-links
 * tegen. `//` vooraan (protocol-relatief) telt niet als intern pad.
 */
export const linkValidation = (Rule: StringRule) =>
  Rule.custom(value => {
    if (!value) return true
    return /^(\/(?!\/)|https?:\/\/|mailto:|tel:)/i.test(value.trim())
      ? true
      : 'Begin met / voor een pagina op deze site (bijv. /agenda), of met https:// voor een externe website.'
  })

/** Uitleg die we bij velden tonen waarvan de wijziging pas na een rebuild live staat */
export const LIVE_UITLEG = 'Na publiceren staat de wijziging na ongeveer 2 minuten op de website.'

/* ==================== Voorbeeldteksten herkennen ==================== */

const normalize = (s: string) => s.trim().toLowerCase().replace(/\s+/g, ' ')

/**
 * Waarschuwt als een tekstveld nog letterlijk zijn eigen veldnaam bevat
 * ("Diensten titel", " CTA kop-label") — zo stonden er placeholders live op
 * de homepage én De Boerderij. Blokkeert publiceren niet.
 */
function placeholderRule(Rule: any, fieldTitle: string) {
  return Rule.custom((value: unknown) =>
    typeof value === 'string' && value.trim() && normalize(value) === normalize(fieldTitle)
      ? `"${value.trim()}" is de naam van dit veld, geen echte tekst. Vul de tekst in die bezoekers moeten zien, of maak het veld leeg — dan toont de website een standaardtekst.`
      : true,
  ).warning()
}

/** Voegt de voorbeeldtekst-waarschuwing toe aan alle tekstvelden van een documenttype */
export function withPlaceholderWarnings<T extends { fields?: any[] }>(type: T): T {
  const addTo = (fields: any[] = []): any[] =>
    fields.map(field => {
      if (field.type === 'object' && field.fields) return { ...field, fields: addTo(field.fields) }
      if ((field.type !== 'string' && field.type !== 'text') || field.options?.list) return field
      const original = field.validation
      return {
        ...field,
        validation: (Rule: any) => {
          const extra = placeholderRule(Rule, field.title ?? field.name)
          if (!original) return extra
          const rules = original(Rule)
          return Array.isArray(rules) ? [...rules, extra] : [rules, extra]
        },
      }
    })
  return { ...type, fields: addTo(type.fields) }
}

/* ==================== Gedeelde veldgroepen ==================== */

export const SEO_GROUP = { name: 'seo', title: 'Google (SEO)' }

/** Titel en beschrijving zoals Google ze toont; leeg = standaardtekst van de site */
export const seoFields = (group = SEO_GROUP.name) => [
  defineField({
    name: 'seoTitle',
    title: 'Titel in Google',
    type: 'string',
    group,
    description: 'Laat leeg voor de standaardtitel. Ideaal maximaal 60 tekens, anders kapt Google hem af.',
    validation: Rule => Rule.max(60).warning('Langer dan 60 tekens: Google kapt de titel af.'),
  }),
  defineField({
    name: 'seoDescription',
    title: 'Beschrijving in Google',
    type: 'text',
    rows: 3,
    group,
    description: 'Laat leeg voor de standaardbeschrijving. Ideaal 120–160 tekens.',
    validation: Rule => Rule.max(160).warning('Langer dan 160 tekens: Google kapt de beschrijving af.'),
  }),
]

/**
 * De zeven velden van het "Kom langs"-blok onderaan een pagina. Stonden 3×
 * gekopieerd; veldnamen blijven gelijk, dus er is geen datamigratie nodig.
 */
export const ctaFields = (opts: { group?: string; primaryExample?: string; secondaryExample?: string } = {}) => {
  const g = opts.group ? { group: opts.group } : {}
  return [
    defineField({ name: 'ctaLabel', title: 'CTA kop-label', type: 'string', ...g, description: 'Klein label boven het blok onderaan, bijv. "Kom langs".' }),
    defineField({ name: 'ctaTitle', title: 'CTA titel', type: 'string', ...g, description: 'Bijv. "Beleef de boerderij zelf".' }),
    defineField({ name: 'ctaText', title: 'CTA tekst', type: 'text', rows: 3, ...g }),
    defineField({ name: 'ctaPrimaryLabel', title: 'CTA primaire knoptekst', type: 'string', ...g, description: 'Tekst op de groene knop.' }),
    defineField({
      name: 'ctaPrimaryHref',
      title: 'CTA primaire URL',
      type: 'string',
      ...g,
      validation: linkValidation,
      description: `Interne link zoals ${opts.primaryExample ?? '/agenda'} of een volledige URL.`,
    }),
    defineField({ name: 'ctaSecondaryLabel', title: 'CTA secundaire knoptekst', type: 'string', ...g, description: 'Tekst op de gele knop.' }),
    defineField({
      name: 'ctaSecondaryHref',
      title: 'CTA secundaire URL',
      type: 'string',
      ...g,
      validation: linkValidation,
      description: `Interne link zoals ${opts.secondaryExample ?? '/contact'} of een volledige URL.`,
    }),
  ]
}

/** Alt-tekstveld met vriendelijke waarschuwing (blokkeert publiceren niet). */
const altField = defineField({
  name: 'alt',
  title: 'Alt-tekst',
  type: 'string',
  description: 'Korte beschrijving van wat er op de foto staat (voor blinde bezoekers en Google).',
  validation: Rule =>
    Rule.custom(alt => (alt ? true : 'Een alt-tekst helpt blinde bezoekers en Google.')).warning(),
})

/**
 * Afbeeldingsveld met hotspot én alt-tekstveld.
 * Gebruik dit voor elk los afbeeldingsveld in de schema's, zodat
 * redacteuren overal de uitsnede kunnen sturen en alt-tekst kunnen invullen.
 */
export const imageField = (opts: {
  name: string
  title: string
  description?: string
  group?: string
  required?: boolean
  /** Waarschuwing (blokkeert niet) als er geen foto is, met deze uitleg */
  recommended?: string
}) =>
  defineField({
    name: opts.name,
    title: opts.title,
    type: 'image',
    description: opts.description ? `${opts.description} ${HOTSPOT_UITLEG}` : HOTSPOT_UITLEG,
    options: { hotspot: true },
    ...(opts.group ? { group: opts.group } : {}),
    ...(opts.required
      ? { validation: (Rule: any) => Rule.required() }
      : opts.recommended
        ? { validation: (Rule: any) => Rule.custom((v: any) => (v?.asset ? true : opts.recommended)).warning() }
        : {}),
    fields: [altField],
  })

/**
 * Afbeelding als array-lid (galerijen, portable-text-body's) — zelfde
 * hotspot + alt-gedrag als imageField, plus optioneel bijschrift.
 * Array-leden kunnen defineField niet gebruiken; dit is de tegenhanger.
 */
export const imageArrayMember = (opts?: { withCaption?: boolean }) => ({
  type: 'image' as const,
  description: HOTSPOT_UITLEG,
  options: { hotspot: true },
  fields: [
    ...(opts?.withCaption
      ? [defineField({ name: 'caption', title: 'Bijschrift (optioneel)', type: 'string' })]
      : []),
    altField,
  ],
  preview: {
    select: { media: 'asset', title: 'alt', subtitle: 'caption' },
  },
})
