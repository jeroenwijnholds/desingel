import { defineType, defineField } from 'sanity'
import { imageField, imageArrayMember } from './lib'

export default defineType({
  name: 'nieuwsArtikel',
  title: 'Nieuwsartikel',
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
          { title: 'Dieren', value: 'Dieren' },
          { title: 'Farmshop', value: 'Farmshop' },
          { title: 'Evenement', value: 'Evenement' },
          { title: 'Teelt', value: 'Teelt' },
          { title: 'Pers', value: 'Pers' },
          { title: 'Anders', value: 'Anders' },
        ],
      },
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'publishedAt',
      title: 'Publicatiedatum',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'author',
      title: 'Auteur',
      type: 'string',
    }),
    defineField({
      name: 'excerpt',
      title: 'Inleiding / samenvatting',
      type: 'text',
      rows: 3,
      description: 'Staat onder de titel, in het nieuwsoverzicht én is de beschrijving die Google toont. Ideaal maximaal 160 tekens.',
      validation: Rule => [
        Rule.required(),
        Rule.max(160).warning('Langer dan 160 tekens: Google kapt de beschrijving af.'),
      ],
    }),
    defineField({
      name: 'readTime',
      title: 'Leestijd (minuten)',
      type: 'number',
      description: 'Laat leeg: de website berekent de leestijd dan zelf uit de tekst.',
      validation: Rule => Rule.integer().min(1).max(60),
    }),
    imageField({
      name: 'featuredImage',
      title: 'Uitgelichte afbeelding',
      description: 'De grote foto bovenaan het artikel; ook zichtbaar op de nieuwsoverzichtspagina.',
      recommended: 'Zonder foto oogt het artikel in het nieuwsoverzicht als een leeg groen vlak.',
    }),

    defineField({
      name: 'body',
      title: 'Artikel-inhoud',
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
        imageArrayMember({ withCaption: true }),
      ],
    }),
    defineField({
      name: 'relatedArticles',
      title: 'Gerelateerde artikelen',
      type: 'array',
      description: 'Maximaal 3; verschijnen in de zijkolom als "Meer nieuws".',
      of: [
        {
          type: 'reference',
          to: [{ type: 'nieuwsArtikel' }],
          // Een artikel kan niet naar zichzelf verwijzen
          options: {
            filter: ({ document }) => ({
              filter: '_id != $id',
              params: { id: String(document._id).replace(/^drafts\./, '') },
            }),
          },
        },
      ],
      validation: Rule => Rule.max(3).unique(),
    }),
  ],
  preview: {
    select: { title: 'title', publishedAt: 'publishedAt', category: 'category', media: 'featuredImage' },
    prepare({ title, publishedAt, category, media }: { title?: string; publishedAt?: string; category?: string; media?: unknown }) {
      const when = publishedAt
        ? new Date(publishedAt).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Europe/Amsterdam' })
        : 'Nog niet gepland'
      return { title: title ?? 'Naamloos artikel', subtitle: [when, category].filter(Boolean).join(' · '), media: media as any }
    },
  },
  orderings: [
    {
      title: 'Publicatiedatum nieuwste eerst',
      name: 'publishedAtDesc',
      by: [{ field: 'publishedAt', direction: 'desc' }],
    },
  ],
})
