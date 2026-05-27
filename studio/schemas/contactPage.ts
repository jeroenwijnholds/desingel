import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'contactPage',
  title: 'Contact pagina',
  type: 'document',
  fields: [
    defineField({ name: 'infoOwners', title: 'Eigenaren (weergavetekst)', type: 'string' }),
    defineField({ name: 'infoAddress', title: 'Adres (weergavetekst)', type: 'text', rows: 3 }),
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
