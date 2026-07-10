import { defineType, defineField } from 'sanity'
import { imageField } from './lib'

export default defineType({
  name: 'agendaPage',
  title: 'Agenda pagina',
  type: 'document',
  description: 'Kop en teksten van de agenda-overzichtspagina. De evenementen zelf staan onder "Agenda (evenementen)".',
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
      name: 'emptyMessage',
      title: 'Tekst bij lege agenda',
      type: 'string',
      description: 'Wordt getoond als er geen evenementen gepland zijn.',
    }),
  ],
  preview: { prepare: () => ({ title: 'Agenda pagina' }) },
})
