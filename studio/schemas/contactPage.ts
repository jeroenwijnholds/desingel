import { defineType, defineField } from 'sanity'
import { imageField, seoFields, SEO_GROUP } from './lib'

// Deze gegevens komen sinds oktober 2026 uit Site-instellingen (één bron voor
// footer, contactpagina, homepage en Google). De oude waarden blijven zichtbaar
// zolang ze er staan, maar zijn niet meer te bewerken en worden niet gelezen.
const VEROUDERD = {
  readOnly: true,
  hidden: ({ value }: { value?: unknown }) => value === undefined,
  deprecated: { reason: 'Komt nu uit Site-instellingen; dit veld wordt niet meer op de website gebruikt.' },
}

export default defineType({
  name: 'contactPage',
  title: 'Contact pagina',
  type: 'document',
  description: 'Teksten op de contactpagina. Adres, eigenaren, openingstijden, telefoon en e-mail komen uit Site-instellingen.',
  groups: [
    { name: 'kop', title: 'Paginakop', default: true },
    { name: 'formulier', title: 'Formulier' },
    { name: 'praktisch', title: 'Praktisch-kaart' },
    SEO_GROUP,
  ],
  fields: [
    defineField({
      name: 'headerLabel',
      title: 'Kop-label',
      type: 'string',
      group: 'kop',
      description: 'Kleine tekst boven de paginatitel, bijv. "Belevenisboerderij de Singel".',
    }),
    defineField({ name: 'headerTitle', title: 'Paginatitel', type: 'string', group: 'kop' }),
    defineField({ name: 'headerSubtitle', title: 'Ondertitel', type: 'text', rows: 2, group: 'kop' }),
    imageField({
      name: 'headerImage',
      title: 'Headerfoto',
      group: 'kop',
      description: 'Foto achter de paginakop. Er komt automatisch een donkergroene waas overheen zodat de tekst leesbaar blijft.',
    }),
    defineField({ name: 'formTitle', title: 'Formulier titel', type: 'string', group: 'formulier', description: 'Bijv. "Stuur een bericht".' }),
    defineField({ name: 'formIntro', title: 'Formulier introtekst', type: 'text', rows: 3, group: 'formulier' }),
    defineField({
      name: 'infoOwners',
      title: 'Eigenaren (verouderd)',
      type: 'string',
      group: 'praktisch',
      ...VEROUDERD,
    }),
    defineField({
      name: 'infoAddress',
      title: 'Adres (verouderd)',
      type: 'text',
      rows: 3,
      group: 'praktisch',
      ...VEROUDERD,
    }),
    defineField({ name: 'infoHours', title: 'Openingstijden farmshop (verouderd)', type: 'string', group: 'praktisch', ...VEROUDERD }),
    defineField({
      name: 'infoResponseTime',
      title: 'Reactietijd',
      type: 'string',
      group: 'praktisch',
      description: 'Bijv. "Binnen 2 werkdagen". Staat ook op de bedankpagina na het versturen.',
    }),
    defineField({
      name: 'subjectOptions',
      title: 'Onderwerp-opties (dropdown)',
      type: 'array',
      group: 'formulier',
      description: 'Houd een optie met het woord "Evenement" aan: die wordt automatisch gekozen als iemand via een evenementpagina contact opneemt.',
      of: [{ type: 'string' }],
    }),
    defineField({
      name: 'privacyNotice',
      title: 'Privacytekst onder het formulier',
      type: 'text',
      rows: 2,
      group: 'formulier',
      description:
        'Let op: berichten lopen via de formulierdienst Web3Forms (een derde partij). ' +
        'Schrijf dus niet dat gegevens "nooit met derden gedeeld" worden.',
    }),
    ...seoFields(),
  ],
  preview: { prepare: () => ({ title: 'Contact pagina' }) },
})
