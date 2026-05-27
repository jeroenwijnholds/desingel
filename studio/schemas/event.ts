import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'event',
  title: 'Evenement',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Titel',
      type: 'string',
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug (URL)',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'category',
      title: 'Categorie',
      type: 'string',
      options: {
        list: [
          { title: 'Farmshop open', value: 'Farmshop open' },
          { title: 'Markt', value: 'Markt' },
          { title: 'Evenement', value: 'Evenement' },
          { title: 'Kermis', value: 'Kermis' },
          { title: 'Circus', value: 'Circus' },
          { title: 'Anders', value: 'Anders' },
        ],
      },
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'date',
      title: 'Datum',
      type: 'datetime',
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'timeRange',
      title: 'Tijdvak (bijv. 11:00 – 18:00)',
      type: 'string',
    }),
    defineField({
      name: 'location',
      title: 'Locatie',
      type: 'string',
    }),
    defineField({
      name: 'description',
      title: 'Korte beschrijving (voor de agenda-lijst)',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'featuredImage',
      title: 'Afbeelding',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'body',
      title: 'Inhoud (detailpagina)',
      type: 'array',
      of: [
        {
          type: 'block',
          styles: [
            { title: 'Normaal', value: 'normal' },
            { title: 'H2', value: 'h2' },
            { title: 'H3', value: 'h3' },
            { title: 'Citaat', value: 'blockquote' },
          ],
          marks: {
            decorators: [
              { title: 'Vet', value: 'strong' },
              { title: 'Cursief', value: 'em' },
            ],
          },
        },
        {
          type: 'image',
          options: { hotspot: true },
          fields: [
            { name: 'caption', title: 'Bijschrift', type: 'string' },
            { name: 'alt', title: 'Alt-tekst', type: 'string' },
          ],
        },
      ],
    }),
    defineField({
      name: 'externalLink',
      title: 'Externe website-link (optioneel)',
      type: 'url',
    }),
  ],
  preview: {
    select: { title: 'title', subtitle: 'date' },
    prepare({ title, subtitle }: { title: string; subtitle: string }) {
      return {
        title,
        subtitle: subtitle ? new Date(subtitle).toLocaleDateString('nl-NL') : '',
      }
    },
  },
  orderings: [
    {
      title: 'Datum oplopend',
      name: 'dateAsc',
      by: [{ field: 'date', direction: 'asc' }],
    },
  ],
})
