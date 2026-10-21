import { defineType, defineField } from 'sanity'
import { imageField, seoFields, SEO_GROUP } from './lib'

export default defineType({
  name: 'nieuwsPage',
  title: 'Nieuws pagina',
  type: 'document',
  description: 'Kop en teksten van de nieuws-overzichtspagina. De artikelen zelf staan onder "Nieuwsartikelen".',
  groups: [
    { name: 'pagina', title: 'Overzichtspagina', default: true },
    { name: 'artikel', title: 'Blok onder artikelen' },
    SEO_GROUP,
  ],
  fields: [
    defineField({
      name: 'headerLabel',
      group: 'pagina',
      title: 'Kop-label',
      type: 'string',
      description: 'Kleine tekst boven de paginatitel, bijv. "Belevenisboerderij de Singel".',
    }),
    defineField({ name: 'headerTitle', title: 'Paginatitel', type: 'string', group: 'pagina' }),
    defineField({ name: 'headerSubtitle', title: 'Ondertitel', type: 'text', rows: 2, group: 'pagina' }),
    imageField({
      name: 'headerImage',
      group: 'pagina',
      title: 'Headerfoto',
      description: 'Foto achter de paginakop. Er komt automatisch een donkergroene waas overheen zodat de tekst leesbaar blijft.',
    }),
    defineField({
      name: 'archiveHeading',
      group: 'pagina',
      title: 'Kop boven het archief',
      type: 'string',
      description: 'De kop boven de lijst met oudere artikelen, bijv. "Meer van de boerderij".',
    }),
    defineField({
      name: 'emptyMessage',
      group: 'pagina',
      title: 'Tekst bij geen artikelen',
      type: 'string',
      description: 'Wordt getoond als er nog geen nieuwsartikelen gepubliceerd zijn.',
    }),
    defineField({
      name: 'articleCtaLabel',
      title: 'Kop-label onder artikelen',
      type: 'string',
      group: 'artikel',
      description: 'Het blok onderaan elk nieuwsartikel. Bijv. "Meer van de boerderij".',
    }),
    defineField({ name: 'articleCtaTitle', title: 'Titel onder artikelen', type: 'string', group: 'artikel', description: 'Bijv. "Blijf op de hoogte van het boerderijleven".' }),
    defineField({ name: 'articleCtaText', title: 'Tekst onder artikelen', type: 'text', rows: 2, group: 'artikel' }),
    ...seoFields(),
  ],
  preview: { prepare: () => ({ title: 'Nieuws pagina' }) },
})
