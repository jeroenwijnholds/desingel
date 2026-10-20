import { defineType, defineField } from 'sanity'
import { imageField, imageArrayMember } from './lib'

const DATETIME_OPTIONS = { dateFormat: 'DD-MM-YYYY', timeFormat: 'HH:mm', timeStep: 15 }

export default defineType({
  name: 'event',
  title: 'Evenement',
  type: 'document',
  groups: [
    { name: 'basis', title: 'Wanneer & waar', default: true },
    { name: 'inhoud', title: 'Inhoud' },
  ],
  fields: [
    defineField({
      name: 'title',
      title: 'Titel',
      type: 'string',
      group: 'basis',
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug (URL)',
      type: 'slug',
      group: 'basis',
      description: 'Het laatste deel van het webadres. Klik op "Generate" om hem uit de titel te maken.',
      options: { source: 'title', maxLength: 96 },
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'category',
      title: 'Categorie',
      type: 'string',
      group: 'basis',
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
      title: 'Begint op',
      type: 'datetime',
      group: 'basis',
      description: 'Datum én begintijd. Na afloop verdwijnt het evenement vanzelf uit de agenda.',
      options: DATETIME_OPTIONS,
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'endDate',
      title: 'Eindigt op',
      type: 'datetime',
      group: 'basis',
      description: 'Datum en eindtijd. Voor een meerdaags evenement: de laatste dag. Leeg = alleen de begintijd tonen.',
      options: DATETIME_OPTIONS,
      validation: Rule =>
        Rule.custom((end, { document }) => {
          const start = document?.date as string | undefined
          return !end || !start || new Date(end as string) > new Date(start)
            ? true
            : 'De eindtijd moet ná de begintijd liggen.'
        }),
    }),
    defineField({
      name: 'timeRange',
      title: 'Tijdvak (verouderd)',
      type: 'string',
      group: 'basis',
      description: 'Vul liever "Begint op" en "Eindigt op" in, dan klopt ook "Zet in je agenda". Dit veld wordt alleen nog gebruikt als er geen eindtijd is.',
      // Alleen zichtbaar bij bestaande evenementen die het nog gebruiken
      hidden: ({ value }) => !value,
      deprecated: { reason: 'Vervangen door "Begint op" + "Eindigt op".' },
    }),
    defineField({
      name: 'location',
      title: 'Locatie',
      type: 'string',
      group: 'basis',
      description: 'Plaats of naam van de locatie, bijv. "Enschede" of "op de boerderij".',
    }),
    defineField({
      name: 'description',
      title: 'Korte beschrijving',
      type: 'text',
      rows: 3,
      group: 'basis',
      description: 'Staat in de agenda-lijst én is de beschrijving die Google toont. Ideaal maximaal 160 tekens.',
      validation: Rule => Rule.max(160).warning('Langer dan 160 tekens: Google kapt de beschrijving af.'),
    }),
    imageField({
      name: 'featuredImage',
      title: 'Afbeelding',
      group: 'inhoud',
      description: 'De grote foto bovenaan de evenementpagina.',
      recommended: 'Zonder foto krijgt de evenementpagina een effen groene kop.',
    }),
    defineField({
      name: 'body',
      title: 'Inhoud (detailpagina)',
      type: 'array',
      group: 'inhoud',
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
        imageArrayMember({ withCaption: true }),
      ],
    }),
    defineField({
      name: 'externalLink',
      title: 'Externe website-link (optioneel)',
      type: 'url',
      group: 'inhoud',
      description: 'Bijv. de website van de organisator. Verschijnt als knop "Bezoek evenement website".',
    }),
  ],
  preview: {
    select: { title: 'title', date: 'date', endDate: 'endDate', category: 'category', media: 'featuredImage' },
    prepare({ title, date, endDate, category, media }: { title?: string; date?: string; endDate?: string; category?: string; media?: unknown }) {
      const last = endDate ?? date
      const voorbij = last ? new Date(last).getTime() < Date.now() : false
      const when = date
        ? new Date(date).toLocaleDateString('nl-NL', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Europe/Amsterdam' })
        : 'Geen datum'
      return {
        title: title ?? 'Naamloos evenement',
        subtitle: [when, category, voorbij ? 'voorbij' : null].filter(Boolean).join(' · '),
        media: media as any,
      }
    },
  },
  orderings: [
    { title: 'Datum oplopend', name: 'dateAsc', by: [{ field: 'date', direction: 'asc' }] },
    { title: 'Datum aflopend', name: 'dateDesc', by: [{ field: 'date', direction: 'desc' }] },
  ],
})
