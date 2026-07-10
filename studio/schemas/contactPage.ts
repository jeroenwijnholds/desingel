import { defineType, defineField } from 'sanity'
import { imageField } from './lib'

export default defineType({
  name: 'contactPage',
  title: 'Contact pagina',
  type: 'document',
  description: 'Teksten op de contactpagina. Let op: de gegevens in de footer komen uit Site-instellingen.',
  fields: [
    defineField({
      name: 'headerLabel',
      title: 'Kop-label',
      type: 'string',
      description: 'Kleine tekst boven de paginatitel, bijv. "Belevenisboerderij de Singel".',
    }),
    defineField({ name: 'headerTitle', title: 'Paginatitel', type: 'string' }),
    defineField({ name: 'headerSubtitle', title: 'Ondertitel', type: 'text', rows: 2 }),
    imageField({
      name: 'headerImage',
      title: 'Headerfoto',
      description: 'Foto achter de paginakop. Er komt automatisch een donkergroene waas overheen zodat de tekst leesbaar blijft.',
    }),
    defineField({ name: 'formTitle', title: 'Formulier titel', type: 'string', description: 'Bijv. "Stuur een bericht".' }),
    defineField({ name: 'formIntro', title: 'Formulier introtekst', type: 'text', rows: 3 }),
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
