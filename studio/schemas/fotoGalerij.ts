import { defineType, defineField } from 'sanity'
import { HOTSPOT_UITLEG, imageArrayMember } from './lib'

export default defineType({
  name: 'fotoGalerij',
  title: 'Fotogalerij',
  type: 'document',
  description: 'De fotogalerij die op de homepage staat onder "De boerderij in beeld".',
  fields: [
    defineField({
      name: 'images',
      title: "Foto's",
      type: 'array',
      description:
        'Deze foto\'s verschijnen in de galerij op de homepage. Sleep om de volgorde te veranderen. ' +
        HOTSPOT_UITLEG,
      of: [imageArrayMember()],
      validation: Rule =>
        Rule.custom(images =>
          images?.length ? true : 'Zonder foto\'s blijft de galerij op de homepage leeg.'
        ).warning(),
    }),
  ],
  preview: { prepare: () => ({ title: 'Fotogalerij' }) },
})
