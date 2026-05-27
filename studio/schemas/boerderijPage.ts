import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'boerderijPage',
  title: 'De Boerderij pagina',
  type: 'document',
  fields: [
    defineField({ name: 'introTitle', title: 'Intro-titel', type: 'string' }),
    defineField({ name: 'introText', title: 'Intro-tekst', type: 'text', rows: 5 }),
    defineField({ name: 'introImage', title: 'Intro-afbeelding', type: 'image', options: { hotspot: true } }),
    defineField({
      name: 'storyColumns',
      title: 'Verhaaltekst (2 kolommen)',
      type: 'array',
      of: [{ type: 'text' }],
      validation: Rule => Rule.max(2),
    }),
    defineField({ name: 'victorQuote', title: 'Citaat Victor', type: 'text', rows: 3 }),
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
          ],
          preview: { select: { title: 'title' } },
        },
      ],
      validation: Rule => Rule.max(3),
    }),
    defineField({ name: 'fullWidthPhoto', title: 'Brede foto', type: 'image', options: { hotspot: true } }),
    defineField({ name: 'ctaPrimaryLabel', title: 'CTA primaire knoptekst', type: 'string' }),
    defineField({ name: 'ctaPrimaryHref', title: 'CTA primaire URL', type: 'string' }),
    defineField({ name: 'ctaSecondaryLabel', title: 'CTA secundaire knoptekst', type: 'string' }),
    defineField({ name: 'ctaSecondaryHref', title: 'CTA secundaire URL', type: 'string' }),
  ],
  preview: { prepare: () => ({ title: 'De Boerderij pagina' }) },
})
