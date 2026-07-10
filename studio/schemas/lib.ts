import { defineField } from 'sanity'

export const HOTSPOT_UITLEG =
  'Tip: klik op "Edit hotspot" op de foto en sleep de cirkel naar het belangrijkste ' +
  'deel (bijv. het dier). De website houdt dat deel dan op elk schermformaat in beeld.'

/**
 * Afbeeldingsveld met hotspot én alt-tekstveld.
 * Gebruik dit voor elk los afbeeldingsveld in de schema's, zodat
 * redacteuren overal de uitsnede kunnen sturen en alt-tekst kunnen invullen.
 */
export const imageField = (opts: { name: string; title: string; description?: string; group?: string }) =>
  defineField({
    name: opts.name,
    title: opts.title,
    type: 'image',
    description: opts.description ? `${opts.description} ${HOTSPOT_UITLEG}` : HOTSPOT_UITLEG,
    options: { hotspot: true },
    ...(opts.group ? { group: opts.group } : {}),
    fields: [
      defineField({
        name: 'alt',
        title: 'Alt-tekst',
        type: 'string',
        description: 'Korte beschrijving van wat er op de foto staat (voor blinde bezoekers en Google).',
      }),
    ],
  })
