import { defineType, defineField } from 'sanity'
import { imageField, seoFields, SEO_GROUP } from './lib'

export default defineType({
  name: 'agendaPage',
  title: 'Agenda pagina',
  type: 'document',
  description: 'Kop en teksten van de agenda-overzichtspagina. De evenementen zelf staan onder "Agenda (evenementen)".',
  groups: [{ name: 'pagina', title: 'Pagina', default: true }, SEO_GROUP],
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
      name: 'emptyMessage',
      group: 'pagina',
      title: 'Tekst bij lege agenda',
      type: 'string',
      description: 'Wordt getoond als er geen evenementen gepland zijn.',
    }),
    ...seoFields(),
  ],
  preview: { prepare: () => ({ title: 'Agenda pagina' }) },
})
