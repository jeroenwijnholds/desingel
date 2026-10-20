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
}) =>
  defineField({
    name: opts.name,
    title: opts.title,
    type: 'image',
    description: opts.description ? `${opts.description} ${HOTSPOT_UITLEG}` : HOTSPOT_UITLEG,
    options: { hotspot: true },
    ...(opts.group ? { group: opts.group } : {}),
    ...(opts.required ? { validation: (Rule: any) => Rule.required() } : {}),
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
