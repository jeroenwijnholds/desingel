import { defineType, defineField } from 'sanity'
import { HOTSPOT_UITLEG } from './lib'

export default defineType({
  name: 'fotoGalerij',
  title: 'Fotogalerij',
  type: 'document',
  description: 'De fotogalerij die op de homepage staat onder "De boerderij in beeld".',
  fields: [
    defineField({
      name: 'images',
      title: "Foto's",
      type: 'array',
      description:
        'Deze foto\'s verschijnen in de galerij op de homepage. Sleep om de volgorde te veranderen. ' +
        HOTSPOT_UITLEG,
      of: [
        {
          type: 'image',
          options: { hotspot: true },
          fields: [
            defineField({
              name: 'alt',
              title: 'Alt-tekst',
              type: 'string',
              description: 'Korte beschrijving van wat er op de foto staat (voor blinde bezoekers en Google).',
            }),
          ],
          preview: {
            select: { media: 'asset', title: 'alt' },
            prepare: ({ media, title }) => ({ media, title: title || 'Foto (nog geen alt-tekst)' }),
          },
        },
      ],
    }),
  ],
  preview: { prepare: () => ({ title: 'Fotogalerij' }) },
})
