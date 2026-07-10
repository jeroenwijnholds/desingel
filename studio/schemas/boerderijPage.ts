import { defineType, defineField } from 'sanity'
import { imageField } from './lib'

export default defineType({
  name: 'boerderijPage',
  title: 'De Boerderij pagina',
  type: 'document',
  fields: [
    defineField({
      name: 'introLabel',
      title: 'Intro kop-label',
      type: 'string',
      description: 'Klein label boven de introtitel, bijv. "Achterhoek, Gelderland".',
    }),
    defineField({ name: 'introTitle', title: 'Intro-titel', type: 'string' }),
    defineField({ name: 'introText', title: 'Intro-tekst', type: 'text', rows: 5 }),
    defineField({
      name: 'introMeta',
      title: 'Intro kenmerken (max 2)',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'De twee korte regels met icoontje onder de introtekst.',
      validation: Rule => Rule.max(2),
    }),
    imageField({ name: 'introImage', title: 'Intro-foto', description: 'De staande foto naast de introtekst.' }),
    defineField({ name: 'photoCaption', title: 'Foto-onderschrift', type: 'string' }),
    defineField({
      name: 'storyLabel',
      title: 'Verhaal kop-label',
      type: 'string',
      description: 'Klein label boven de verhaaltitel, bijv. "De boerderij".',
    }),
    defineField({ name: 'storyTitle', title: 'Verhaaltitel', type: 'string' }),
    defineField({
      name: 'storyColumns',
      title: 'Verhaaltekst (2 kolommen)',
      type: 'array',
      of: [{ type: 'text' }],
      validation: Rule => Rule.max(2),
    }),
    defineField({ name: 'victorQuote', title: 'Citaat Victor', type: 'text', rows: 3 }),
    defineField({
      name: 'highlightsLabel',
      title: 'Hoogtepunten kop-label',
      type: 'string',
      description: 'Klein label boven de hoogtepunten, bijv. "Op de Singel".',
    }),
    defineField({ name: 'highlightsTitle', title: 'Hoogtepunten titel', type: 'string' }),
    defineField({
      name: 'highlights',
      title: 'Hoogtepunten (max 3)',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({ name: 'title', title: 'Titel', type: 'string' }),
            defineField({ name: 'description', title: 'Beschrijving', type: 'text', rows: 3 }),
            imageField({ name: 'image', title: 'Afbeelding' }),
          ],
          preview: { select: { title: 'title', media: 'image' } },
        },
      ],
      validation: Rule => Rule.max(3),
    }),
    imageField({ name: 'fullWidthPhoto', title: 'Brede foto', description: 'De paginabrede foto onderaan.' }),
    defineField({
      name: 'ctaLabel',
      title: 'CTA kop-label',
      type: 'string',
      description: 'Klein label boven het blok onderaan, bijv. "Kom langs".',
    }),
    defineField({ name: 'ctaTitle', title: 'CTA titel', type: 'string' }),
    defineField({ name: 'ctaText', title: 'CTA tekst', type: 'text', rows: 3 }),
    defineField({ name: 'ctaPrimaryLabel', title: 'CTA primaire knoptekst', type: 'string' }),
    defineField({
      name: 'ctaPrimaryHref',
      title: 'CTA primaire URL',
      type: 'string',
      description: 'Interne link zoals /agenda of een volledige URL.',
    }),
    defineField({ name: 'ctaSecondaryLabel', title: 'CTA secundaire knoptekst', type: 'string' }),
    defineField({
      name: 'ctaSecondaryHref',
      title: 'CTA secundaire URL',
      type: 'string',
      description: 'Interne link zoals /contact of een volledige URL.',
    }),
  ],
  preview: { prepare: () => ({ title: 'De Boerderij pagina' }) },
})
