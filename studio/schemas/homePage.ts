import { defineType, defineField } from 'sanity'

const serviceCard = {
  type: 'object',
  fields: [
    defineField({ name: 'title', title: 'Titel', type: 'string', validation: Rule => Rule.required() }),
    defineField({ name: 'description', title: 'Beschrijving', type: 'text', rows: 4 }),
    defineField({ name: 'image', title: 'Afbeelding', type: 'image', options: { hotspot: true } }),
    defineField({ name: 'testimonialQuote', title: 'Testimonial citaat (optioneel)', type: 'text', rows: 2 }),
    defineField({ name: 'testimonialAuthor', title: 'Testimonial auteur (optioneel)', type: 'string' }),
  ],
  preview: { select: { title: 'title' } },
}

export default defineType({
  name: 'homePage',
  title: 'Homepage',
  type: 'document',
  fields: [
    defineField({ name: 'heroTitle', title: 'Hero-titel', type: 'string', validation: Rule => Rule.required() }),
    defineField({ name: 'heroSubtitle', title: 'Hero-subtitel', type: 'string' }),
    defineField({ name: 'heroImage', title: 'Hero-afbeelding', type: 'image', options: { hotspot: true } }),
    defineField({
      name: 'primaryServices',
      title: 'Primaire diensten (max 2)',
      type: 'array',
      of: [serviceCard],
      validation: Rule => Rule.max(2),
    }),
    defineField({
      name: 'secondaryServices',
      title: 'Secundaire diensten (max 3)',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({ name: 'title', title: 'Titel', type: 'string' }),
            defineField({ name: 'description', title: 'Beschrijving', type: 'text', rows: 3 }),
            defineField({ name: 'image', title: 'Afbeelding', type: 'image', options: { hotspot: true } }),
          ],
          preview: { select: { title: 'title', media: 'image' } },
        },
      ],
      validation: Rule => Rule.max(3),
    }),
    defineField({
      name: 'galleryImages',
      title: 'Galerij-afbeeldingen',
      type: 'array',
      of: [{ type: 'image', options: { hotspot: true } }],
    }),
    defineField({ name: 'ctaPrimaryLabel', title: 'CTA primaire knoptekst', type: 'string' }),
    defineField({ name: 'ctaPrimaryHref', title: 'CTA primaire URL', type: 'string' }),
    defineField({ name: 'ctaSecondaryLabel', title: 'CTA secundaire knoptekst', type: 'string' }),
    defineField({ name: 'ctaSecondaryHref', title: 'CTA secundaire URL', type: 'string' }),
  ],
  preview: { prepare: () => ({ title: 'Homepage' }) },
})
