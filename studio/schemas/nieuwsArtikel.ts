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
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'readTime',
      title: 'Leestijd (minuten)',
      type: 'number',
    }),
    imageField({
      name: 'featuredImage',
      title: 'Uitgelichte afbeelding',
      description: 'De grote foto bovenaan het artikel; ook zichtbaar op de nieuwsoverzichtspagina.',
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
      of: [{ type: 'reference', to: [{ type: 'nieuwsArtikel' }] }],
      validation: Rule => Rule.max(3),
    }),
  ],
  preview: {
    select: { title: 'title', subtitle: 'publishedAt' },
    prepare({ title, subtitle }: { title: string; subtitle: string }) {
      return {
        title,
        subtitle: subtitle ? new Date(subtitle).toLocaleDateString('nl-NL') : '',
      }
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
