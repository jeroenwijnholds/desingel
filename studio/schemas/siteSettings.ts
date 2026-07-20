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
      name: 'telephone',
      title: 'Telefoonnummer',
      type: 'string',
      description:
        'Internationaal formaat, bijv. +31 6 12345678. Leeg laten totdat dit bekend is — ' +
        'structured data (Google/AI-assistenten) mag nooit een verzonnen telefoonnummer bevatten.',
    }),
    defineField({
      name: 'socialLinks',
      title: 'Social-media links',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'platform',
              title: 'Platform',
              type: 'string',
              options: { list: ['Instagram', 'Facebook', 'TikTok', 'YouTube', 'LinkedIn'] },
              validation: Rule => Rule.required(),
            }),
            defineField({ name: 'url', title: 'URL', type: 'url', validation: Rule => Rule.required() }),
          ],
          preview: { select: { title: 'platform', subtitle: 'url' } },
        },
      ],
    }),
    defineField({
      name: 'openingHours',
      title: 'Openingstijden (structured data)',
      description:
        'Machineleesbare openingstijden voor Google en AI-assistenten. Voor de weergavetekst ' +
        'op de contactpagina: zie het veld "Openingstijden farmshop" op de Contact-pagina.',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'days',
              title: 'Dagen',
              type: 'array',
              of: [{ type: 'string' }],
              options: {
                list: [
                  { title: 'Maandag', value: 'monday' },
                  { title: 'Dinsdag', value: 'tuesday' },
                  { title: 'Woensdag', value: 'wednesday' },
                  { title: 'Donderdag', value: 'thursday' },
                  { title: 'Vrijdag', value: 'friday' },
                  { title: 'Zaterdag', value: 'saturday' },
                  { title: 'Zondag', value: 'sunday' },
                ],
              },
              validation: Rule => Rule.required().min(1),
            }),
            defineField({ name: 'opens', title: 'Open vanaf (HH:mm)', type: 'string', validation: Rule => Rule.required() }),
            defineField({ name: 'closes', title: 'Open tot (HH:mm)', type: 'string', validation: Rule => Rule.required() }),
          ],
          preview: {
            select: { days: 'days', opens: 'opens', closes: 'closes' },
            prepare: ({ days, opens, closes }: { days?: string[]; opens?: string; closes?: string }) => ({
              title: `${(days ?? []).join(', ')} · ${opens ?? '?'}–${closes ?? '?'}`,
            }),
          },
        },
      ],
    }),
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
