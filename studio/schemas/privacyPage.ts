import { defineType, defineField } from 'sanity'
import { seoFields, SEO_GROUP } from './lib'

export default defineType({
  name: 'privacyPage',
  title: 'Privacyverklaring',
  type: 'document',
  description:
    'De pagina /privacy. Pas de tekst aan zodra er iets verandert aan wat de website met ' +
    'gegevens doet (bijv. een nieuwe dienst), en zet dan de datum "Laatst bijgewerkt" op vandaag.',
  groups: [{ name: 'pagina', title: 'Pagina', default: true }, SEO_GROUP],
  fields: [
    defineField({ name: 'title', title: 'Titel', type: 'string', group: 'pagina', validation: Rule => Rule.required() }),
    defineField({ name: 'intro', title: 'Inleiding', type: 'text', rows: 3, group: 'pagina' }),
    defineField({
      name: 'updatedAt',
      title: 'Laatst bijgewerkt',
      type: 'date',
      group: 'pagina',
      options: { dateFormat: 'DD-MM-YYYY' },
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'body',
      title: 'Tekst',
      type: 'array',
      group: 'pagina',
      of: [
        {
          type: 'block',
          styles: [
            { title: 'Normaal', value: 'normal' },
            { title: 'Tussenkop', value: 'h2' },
          ],
          lists: [{ title: 'Opsomming', value: 'bullet' }],
          marks: {
            decorators: [{ title: 'Vet', value: 'strong' }],
            annotations: [
              {
                name: 'link',
                title: 'Link',
                type: 'object',
                fields: [
                  defineField({
                    name: 'href',
                    title: 'Adres',
                    type: 'string',
                    description: 'Een pagina op deze site (bijv. /contact) of een volledige URL (https://…).',
                    validation: Rule =>
                      Rule.required().custom(v =>
                        typeof v === 'string' && /^(\/(?!\/)|https?:\/\/|mailto:)/i.test(v.trim())
                          ? true
                          : 'Begin met / voor een pagina op deze site, of met https://.',
                      ),
                  }),
                ],
              },
            ],
          },
        },
      ],
      validation: Rule => Rule.required(),
    }),
    ...seoFields(),
  ],
  preview: { prepare: () => ({ title: 'Privacyverklaring' }) },
})
