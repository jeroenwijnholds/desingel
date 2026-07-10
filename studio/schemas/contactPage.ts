import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'contactPage',
  title: 'Contact pagina',
  type: 'document',
  description: 'Teksten op de contactpagina. Let op: de gegevens in de footer komen uit Site-instellingen.',
  fields: [
    defineField({
      name: 'infoOwners',
      title: 'Eigenaren (weergavetekst)',
      type: 'string',
      description: 'Zoals getoond op de contactpagina. De footer gebruikt de lijst uit Site-instellingen.',
    }),
    defineField({
      name: 'infoAddress',
      title: 'Adres (weergavetekst)',
      type: 'text',
      rows: 3,
      description: 'Zoals getoond op de contactpagina. De footer gebruikt het adres uit Site-instellingen.',
    }),
    defineField({ name: 'infoHours', title: 'Openingstijden farmshop', type: 'string' }),
    defineField({ name: 'infoResponseTime', title: 'Reactietijd', type: 'string' }),
    defineField({
      name: 'subjectOptions',
      title: 'Onderwerp-opties (dropdown)',
      type: 'array',
      of: [{ type: 'string' }],
    }),
    defineField({ name: 'privacyNotice', title: 'Privacyverklaring-tekst', type: 'text', rows: 2 }),
  ],
  preview: { prepare: () => ({ title: 'Contact pagina' }) },
})
