import { defineType, defineField } from 'sanity'
import { linkValidation } from './lib'

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
            defineField({ name: 'href', title: 'URL', type: 'string', validation: Rule => linkValidation(Rule.required()) }),
            defineField({ name: 'isButton', title: 'Als knop weergeven', type: 'boolean', initialValue: false }),
          ],
          preview: {
            select: { title: 'label', subtitle: 'href' },
          },
        },
      ],
    }),
    defineField({
      name: 'announcement',
      title: 'Tijdelijke mededeling',
      type: 'object',
      description:
        'Een balk bovenaan elke pagina, bijv. "Farmshop gesloten t/m 3 november". ' +
        'Verdwijnt vanzelf na de einddatum. Leeg laten = geen balk.',
      options: { collapsible: true, collapsed: false },
      fields: [
        defineField({
          name: 'text',
          title: 'Tekst',
          type: 'string',
          description: 'Kort houden: maximaal 90 tekens, zodat het op een telefoon op twee regels past.',
          validation: Rule => Rule.max(90),
        }),
        defineField({
          name: 'link',
          title: 'Link (optioneel)',
          type: 'string',
          description: 'Bijv. /agenda of een volledige URL; de hele balk wordt dan klikbaar.',
          validation: linkValidation,
        }),
        defineField({
          name: 'until',
          title: 'Tonen tot en met',
          type: 'date',
          options: { dateFormat: 'DD-MM-YYYY' },
          description: 'Leeg = blijft staan tot je de tekst weghaalt.',
        }),
      ],
    }),
    defineField({
      name: 'owners',
      title: 'Eigenaren',
      type: 'array',
      description: 'Getoond in de footer en op de contactpagina ("Victor & Mari Duurland").',
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
      description: 'Getoond in de footer, op de contactpagina en op de homepage, en gebruikt door Google.',
    }),
    defineField({
      name: 'coordinates',
      title: 'Coördinaten (Google Maps)',
      description:
        'Bepaalt de kaart op de contactpagina en de "Plan je route"-knoppen. Zo vind je ze: ' +
        'klik in Google Maps met de rechtermuisknop op de boerderij en klik op de bovenste ' +
        'regel (bijv. 51.94792, 6.51001) — die staan dan op je klembord. Het eerste getal is ' +
        'de breedtegraad, het tweede de lengtegraad.',
      type: 'object',
      fields: [
        defineField({
          name: 'lat',
          title: 'Breedtegraad',
          type: 'number',
          validation: Rule => Rule.min(50.7).max(53.6).error('Dat ligt niet in Nederland (verwacht iets rond 51,9). Lengte- en breedtegraad omgedraaid?'),
        }),
        defineField({
          name: 'lng',
          title: 'Lengtegraad',
          type: 'number',
          validation: Rule => Rule.min(3.3).max(7.3).error('Dat ligt niet in Nederland (verwacht iets rond 6,5). Lengte- en breedtegraad omgedraaid?'),
        }),
      ],
    }),
    // farmshopHours en responseTime zijn verwijderd: de site las ze nooit —
    // de contactpagina gebruikt contactPage.infoHours / infoResponseTime.
    defineField({
      name: 'email',
      title: 'E-mailadres',
      type: 'string',
      description:
        'Wordt getoond in de footer en op de contactpagina (ook als alternatief als het ' +
        'formulier niet werkt). Leeg laten = nergens zichtbaar.',
      validation: Rule => Rule.email().error('Dit lijkt geen geldig e-mailadres.'),
    }),
    defineField({
      name: 'telephone',
      title: 'Telefoonnummer',
      type: 'string',
      validation: Rule =>
        Rule.regex(/^\+?[\d\s()-]{8,20}$/, { name: 'telefoonnummer' }).error('Alleen cijfers, spaties, haakjes, - en een + vooraan, bijv. +31 6 12345678.'),
      description:
        'Internationaal formaat, bijv. +31 6 12345678. Wordt klikbaar getoond in de footer en op ' +
        'de contactpagina. Leeg laten totdat dit bekend is — ' +
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
      title: 'Openingstijden farmshop',
      description:
        'Eén regel per tijdvak. Getoond op de homepage en de contactpagina, en gebruikt door ' +
        'Google en AI-assistenten.',
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
            defineField({ name: 'opens', title: 'Open vanaf (uu:mm)', type: 'string', validation: Rule => Rule.required().regex(/^([01]\d|2[0-3]):[0-5]\d$/, { name: 'tijd', invert: false }).error('Gebruik uu:mm, bijv. 09:30 of 17:00.') }),
            defineField({ name: 'closes', title: 'Open tot (uu:mm)', type: 'string', validation: Rule => Rule.required().regex(/^([01]\d|2[0-3]):[0-5]\d$/, { name: 'tijd', invert: false }).error('Gebruik uu:mm, bijv. 09:30 of 17:00.') }),
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
