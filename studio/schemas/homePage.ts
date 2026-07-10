import { defineType, defineField } from 'sanity'
import { imageField } from './lib'

const serviceCard = {
  type: 'object',
  fields: [
    defineField({ name: 'title', title: 'Titel', type: 'string', validation: Rule => Rule.required() }),
    defineField({ name: 'description', title: 'Beschrijving', type: 'text', rows: 4 }),
    imageField({ name: 'image', title: 'Afbeelding' }),
    defineField({ name: 'testimonialQuote', title: 'Testimonial citaat (optioneel)', type: 'text', rows: 2 }),
    defineField({ name: 'testimonialAuthor', title: 'Testimonial auteur (optioneel)', type: 'string' }),
  ],
  preview: { select: { title: 'title', media: 'image' } },
}

export default defineType({
  name: 'homePage',
  title: 'Homepage',
  type: 'document',
  groups: [
    { name: 'hero', title: 'Hero (bovenaan)', default: true },
    { name: 'diensten', title: 'Diensten' },
    { name: 'galerij', title: 'Galerij-kop' },
    { name: 'cta', title: 'Blok onderaan' },
  ],
  fields: [
    defineField({
      name: 'heroTitle',
      title: 'Hero-titel',
      type: 'string',
      group: 'hero',
      description: 'De grote titel bovenaan de homepage.',
      validation: Rule => Rule.required(),
    }),
    defineField({ name: 'heroSubtitle', title: 'Hero-subtitel', type: 'string', group: 'hero' }),
    imageField({
      name: 'heroImage',
      title: 'Hero-foto',
      group: 'hero',
      description: 'De grote foto bovenaan de homepage (liggend formaat werkt het best).',
      required: true,
    }),
    imageField({
      name: 'heroImageMobile',
      title: 'Hero-foto mobiel (optioneel)',
      group: 'hero',
      description: 'Aparte, staande foto voor telefoons. Leeg = de gewone hero-foto wordt gebruikt.',
    }),
    defineField({
      name: 'servicesLabel',
      title: 'Diensten kop-label',
      type: 'string',
      group: 'diensten',
      description: 'Klein label boven de dienstensectie, bijv. "Wat we doen".',
    }),
    defineField({ name: 'servicesTitle', title: 'Diensten titel', type: 'string', group: 'diensten' }),
    defineField({
      name: 'servicesIntro',
      title: 'Diensten introtekst',
      type: 'text',
      rows: 3,
      group: 'diensten',
      description: 'De alinea naast de eerste dienstenkaart.',
    }),
    defineField({
      name: 'primaryServices',
      title: 'Primaire diensten (max 2)',
      type: 'array',
      group: 'diensten',
      description: 'De twee grote kaarten onder de hero (Farmshop en Boerderij op locatie).',
      of: [serviceCard],
      validation: Rule => Rule.max(2),
    }),
    defineField({
      name: 'secondaryServices',
      title: 'Secundaire diensten (max 3)',
      type: 'array',
      group: 'diensten',
      description: 'De drie kleinere blokken daaronder.',
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
    // Verouderd: de galerij is verhuisd naar het eigen document "Fotogalerij".
    // Veld blijft verborgen staan tot de oude data is opgeruimd (zie NOG-TE-DOEN).
    defineField({
      name: 'galleryImages',
      title: 'Galerij-afbeeldingen (verouderd — zie Fotogalerij)',
      type: 'array',
      of: [{ type: 'image', options: { hotspot: true } }],
      hidden: true,
    }),
    defineField({
      name: 'galleryLabel',
      title: 'Galerij kop-label',
      type: 'string',
      group: 'galerij',
      description: 'Klein label boven de fotogalerij, bijv. "De boerderij in beeld". De foto\'s zelf staan onder "Fotogalerij".',
    }),
    defineField({ name: 'galleryTitle', title: 'Galerij titel', type: 'string', group: 'galerij' }),
    defineField({
      name: 'ctaLabel',
      title: 'CTA kop-label',
      type: 'string',
      group: 'cta',
      description: 'Klein label boven het blok onderaan, bijv. "Kom langs".',
    }),
    defineField({ name: 'ctaTitle', title: 'CTA titel', type: 'string', group: 'cta' }),
    defineField({ name: 'ctaText', title: 'CTA tekst', type: 'text', rows: 3, group: 'cta' }),
    defineField({
      name: 'ctaPrimaryLabel',
      title: 'CTA primaire knoptekst',
      type: 'string',
      group: 'cta',
      description: 'Tekst op de groene knop in het "Kom langs"-blok onderaan.',
    }),
    defineField({
      name: 'ctaPrimaryHref',
      title: 'CTA primaire URL',
      type: 'string',
      group: 'cta',
      description: 'Interne link zoals /agenda of een volledige URL.',
    }),
    defineField({ name: 'ctaSecondaryLabel', title: 'CTA secundaire knoptekst', type: 'string', group: 'cta' }),
    defineField({
      name: 'ctaSecondaryHref',
      title: 'CTA secundaire URL',
      type: 'string',
      group: 'cta',
      description: 'Interne link zoals /over-ons of een volledige URL.',
    }),
  ],
  preview: { prepare: () => ({ title: 'Homepage' }) },
})
