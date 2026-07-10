import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'siteSettings',
  title: 'Site-instellingen',
  type: 'document',
  fields: [
    defineField({
      name: 'siteName',
      title: 'Sitenaam',
      type: 'string',
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'tagline',
      title: 'Tagline',
      type: 'string',
    }),
    defineField({
      name: 'navigation',
      title: 'Navigatie',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({ name: 'label', title: 'Label', type: 'string', validation: Rule => Rule.required() }),
            defineField({ name: 'href', title: 'URL', type: 'string', validation: Rule => Rule.required() }),
            defineField({ name: 'isButton', title: 'Als knop weergeven', type: 'boolean', initialValue: false }),
          ],
          preview: {
            select: { title: 'label', subtitle: 'href' },
          },
        },
      ],
    }),
    defineField({
      name: 'owners',
      title: 'Eigenaren',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({ name: 'name', title: 'Naam', type: 'string' }),
            defineField({ name: 'role', title: 'Rol', type: 'string' }),
          ],
          preview: { select: { title: 'name' } },
        },
      ],
    }),
    defineField({
      name: 'address',
      title: 'Adres',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'coordinates',
      title: 'Coördinaten (Google Maps)',
      description: 'Bepaalt waar de kaart op de contactpagina op inzoomt.',
      type: 'object',
      fields: [
        defineField({ name: 'lat', title: 'Breedtegraad', type: 'number' }),
        defineField({ name: 'lng', title: 'Lengtegraad', type: 'number' }),
      ],
    }),
    // farmshopHours en responseTime zijn verwijderd: de site las ze nooit —
    // de contactpagina gebruikt contactPage.infoHours / infoResponseTime.
    defineField({
      name: 'footerCopyright',
      title: 'Copyright-tekst (footer)',
      type: 'string',
    }),
  ],
  preview: {
    select: { title: 'siteName' },
  },
})
