import { defineType, defineField } from 'sanity'
import { imageField } from './lib'

export default defineType({
  name: 'overOnsPage',
  title: 'Over Ons pagina',
  type: 'document',
  fields: [
    defineField({ name: 'introTitle', title: 'Intro-titel', type: 'string' }),
    defineField({ name: 'introText', title: 'Intro-tekst', type: 'text', rows: 5 }),
    imageField({ name: 'familyPhoto', title: 'Familiefoto', description: 'De staande foto naast de introtekst.' }),
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
      name: 'values',
      title: 'Waarden (max 3)',
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
    imageField({ name: 'fullWidthPhoto', title: 'Brede foto', description: 'De paginabrede foto onderaan.' }),
    defineField({ name: 'ctaPrimaryLabel', title: 'CTA primaire knoptekst', type: 'string' }),
    defineField({ name: 'ctaPrimaryHref', title: 'CTA primaire URL', type: 'string' }),
    defineField({ name: 'ctaSecondaryLabel', title: 'CTA secundaire knoptekst', type: 'string' }),
    defineField({ name: 'ctaSecondaryHref', title: 'CTA secundaire URL', type: 'string' }),
  ],
  preview: { prepare: () => ({ title: 'Over Ons pagina' }) },
})
