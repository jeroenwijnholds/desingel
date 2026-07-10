import type { ComponentType } from 'react'
import { defineConfig } from 'sanity'
import { structureTool, type StructureBuilder } from 'sanity/structure'
import { visionTool } from '@sanity/vision'
import {
  HomeIcon,
  LeaveIcon,
  UsersIcon,
  EnvelopeIcon,
  ImagesIcon,
  CalendarIcon,
  DocumentTextIcon,
  CogIcon,
} from '@sanity/icons'
import { schemaTypes } from './schemas'

/**
 * Singleton-documenten: bestaan precies één keer en zijn niet aan te maken,
 * te dupliceren of te verwijderen. Het document-id is gelijk aan het type.
 */
const singletonTypes = new Set([
  'homePage',
  'boerderijPage',
  'overOnsPage',
  'contactPage',
  'fotoGalerij',
  'siteSettings',
])

const singleton = (S: StructureBuilder, type: string, title: string, icon: ComponentType) =>
  S.listItem()
    .title(title)
    .icon(icon)
    .child(S.document().schemaType(type).documentId(type).title(title))

export default defineConfig({
  name: 'default',
  title: 'Belevenisboerderij de Singel',

  projectId: 'vua8q73o',
  dataset: 'production',

  plugins: [
    structureTool({
      title: 'Inhoud',
      structure: (S) =>
        S.list()
          .title('Inhoud')
          .items([
            S.listItem()
              .title("Pagina's")
              .icon(DocumentTextIcon)
              .child(
                S.list()
                  .title("Pagina's")
                  .items([
                    singleton(S, 'homePage', 'Homepage', HomeIcon),
                    singleton(S, 'boerderijPage', 'De Boerderij', LeaveIcon),
                    singleton(S, 'overOnsPage', 'Over Ons', UsersIcon),
                    singleton(S, 'contactPage', 'Contact', EnvelopeIcon),
                  ])
              ),
            singleton(S, 'fotoGalerij', 'Fotogalerij', ImagesIcon),
            S.divider(),
            S.documentTypeListItem('event').title('Agenda (evenementen)').icon(CalendarIcon),
            S.documentTypeListItem('nieuwsArtikel').title('Nieuwsartikelen').icon(DocumentTextIcon),
            S.divider(),
            singleton(S, 'siteSettings', 'Site-instellingen', CogIcon),
          ]),
    }),
    visionTool(),
  ],

  schema: {
    types: schemaTypes,
    // Singletons niet aanbieden in het "nieuw document"-menu
    templates: (templates) => templates.filter(({ schemaType }) => !singletonTypes.has(schemaType)),
  },

  document: {
    // Op singletons alleen publiceren/terugdraaien toestaan — geen
    // aanmaken, dupliceren of verwijderen (voorkomt een tweede "Homepage")
    actions: (actions, { schemaType }) =>
      singletonTypes.has(schemaType)
        ? actions.filter(({ action }) => action && ['publish', 'discardChanges', 'restore'].includes(action))
        : actions,
  },
})
