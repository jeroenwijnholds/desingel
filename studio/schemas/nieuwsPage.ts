import { defineType, defineField } from 'sanity'
import { imageField } from './lib'

export default defineType({
  name: 'nieuwsPage',
  title: 'Nieuws pagina',
  type: 'document',
  description: 'Kop en teksten van de nieuws-overzichtspagina. De artikelen zelf staan onder "Nieuwsartikelen".',
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
    defineField({
      name: 'archiveHeading',
      title: 'Kop boven het archief',
      type: 'string',
      description: 'De kop boven de lijst met oudere artikelen, bijv. "Meer van de boerderij".',
    }),
    defineField({
      name: 'emptyMessage',
      title: 'Tekst bij geen artikelen',
      type: 'string',
      description: 'Wordt getoond als er nog geen nieuwsartikelen gepubliceerd zijn.',
    }),
  ],
  preview: { prepare: () => ({ title: 'Nieuws pagina' }) },
})
