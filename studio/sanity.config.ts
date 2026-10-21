import type { ComponentType } from 'react'
import { defineConfig, isDev, type DocumentActionComponent, type SanityDocument } from 'sanity'
import { structureTool, type StructureBuilder } from 'sanity/structure'
import { visionTool } from '@sanity/vision'
import { nlNLLocale } from '@sanity/locale-nl-nl'
import {
  HomeIcon,
  LeaveIcon,
  UsersIcon,
  EnvelopeIcon,
  ImagesIcon,
  CalendarIcon,
  ClockIcon,
  ArchiveIcon,
  DocumentTextIcon,
  CogIcon,
  LaunchIcon,
  LockIcon,
} from '@sanity/icons'
import { schemaTypes } from './schemas'
import { statistiekTools } from './tools/statistiek'

/**
 * Adres van de live website. Bij de DNS-omzetting naar het eigen domein
 * (zie NOG-TE-DOEN.md) hier aanpassen en de Studio opnieuw deployen.
 */
const SITE_URL = 'https://jeroenwijnholds.github.io/desingel'

/**
 * Singleton-documenten: bestaan precies één keer en zijn niet aan te maken,
 * te dupliceren of te verwijderen. Het document-id is gelijk aan het type.
 */
const singletonTypes = new Set([
  'homePage',
  'boerderijPage',
  'overOnsPage',
  'contactPage',
  'agendaPage',
  'nieuwsPage',
  'privacyPage',
  'fotoGalerij',
  'siteSettings',
])

/** Pad op de website per documenttype (null = geen eigen pagina) */
function sitePath(doc: SanityDocument | null | undefined): string | null {
  if (!doc) return null
  const slug = (doc.slug as { current?: string } | undefined)?.current
  switch (doc._type) {
    case 'homePage':
    case 'fotoGalerij':
      return '/'
    case 'boerderijPage': return '/de-boerderij'
    case 'overOnsPage': return '/over-ons'
    case 'contactPage': return '/contact'
    case 'agendaPage': return '/agenda'
    case 'nieuwsPage': return '/nieuws'
    case 'privacyPage': return '/privacy'
    case 'event': return slug ? `/evenement/${slug}` : null
    case 'nieuwsArtikel': return slug ? `/nieuws/${slug}` : null
    default: return null
  }
}

/**
 * "Bekijk op website": opent de gepubliceerde pagina. De site wordt na elke
 * publicatie opnieuw gebouwd; dat duurt ongeveer 2 minuten.
 */
const ViewOnSiteAction: DocumentActionComponent = ({ published }) => {
  const path = sitePath(published)
  return {
    label: 'Bekijk op website',
    icon: LaunchIcon,
    disabled: !path,
    title: path
      ? 'Opent de live pagina. Net gepubliceerd? De website is na ongeveer 2 minuten bijgewerkt.'
      : 'Nog niet gepubliceerd (of nog geen slug): er is nog geen pagina om te bekijken.',
    onHandle: () => {
      if (path) window.open(`${SITE_URL}${path}`, '_blank', 'noopener')
    },
  }
}

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
    // Studio-interface in het Nederlands (knoppen, menu's, meldingen)
    nlNLLocale(),
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
                    singleton(S, 'agendaPage', 'Agenda', CalendarIcon),
                    singleton(S, 'nieuwsPage', 'Nieuws', DocumentTextIcon),
                    singleton(S, 'privacyPage', 'Privacyverklaring', LockIcon),
                  ])
              ),
            singleton(S, 'fotoGalerij', 'Fotogalerij', ImagesIcon),
            S.divider(),
            // Komend en archief gescheiden: zo staan afgelopen evenementen
            // niet tussen wat er nog moet gebeuren
            S.listItem()
              .title('Agenda (evenementen)')
              .icon(CalendarIcon)
              .child(
                S.list()
                  .title('Agenda')
                  .items([
                    S.listItem()
                      .title('Komende evenementen')
                      .icon(ClockIcon)
                      .child(
                        S.documentList()
                          .title('Komende evenementen')
                          .schemaType('event')
                          .filter('_type == "event" && dateTime(coalesce(endDate, date)) >= dateTime(now()) - 60*60*24')
                          .defaultOrdering([{ field: 'date', direction: 'asc' }])
                      ),
                    S.listItem()
                      .title('Afgelopen (archief)')
                      .icon(ArchiveIcon)
                      .child(
                        S.documentList()
                          .title('Afgelopen evenementen')
                          .schemaType('event')
                          .filter('_type == "event" && dateTime(coalesce(endDate, date)) < dateTime(now()) - 60*60*24')
                          .defaultOrdering([{ field: 'date', direction: 'desc' }])
                      ),
                    S.divider(),
                    S.documentTypeListItem('event').title('Alle evenementen'),
                  ])
              ),
            S.listItem()
              .title('Nieuwsartikelen')
              .icon(DocumentTextIcon)
              .child(
                S.documentTypeList('nieuwsArtikel')
                  .title('Nieuwsartikelen')
                  .defaultOrdering([{ field: 'publishedAt', direction: 'desc' }])
              ),
            S.divider(),
            singleton(S, 'siteSettings', 'Site-instellingen', CogIcon),
          ]),
    }),
    // GROQ-console alleen lokaal (npm run dev): voor redacteuren is het
    // een verwarrend extra tabblad. apiVersion gepind zodat query-gedrag
    // in Vision niet stilletjes verandert.
    ...(isDev ? [visionTool({ defaultApiVersion: '2024-01-01' })] : []),
  ],

  // Tabblad met de link naar het Umami-dashboard (alleen als
  // SANITY_STUDIO_UMAMI_SHARE_URL in studio/.env staat)
  tools: (prev) => [...prev, ...statistiekTools],

  schema: {
    types: schemaTypes,
    // Singletons niet aanbieden in het "nieuw document"-menu
    templates: (templates) => templates.filter(({ schemaType }) => !singletonTypes.has(schemaType)),
  },

  document: {
    actions: (actions, { schemaType }) => {
      // Op singletons alleen publiceren/terugdraaien toestaan — geen
      // aanmaken, dupliceren of verwijderen (voorkomt een tweede "Homepage")
      const allowed = singletonTypes.has(schemaType)
        ? actions.filter(({ action }) => action && ['publish', 'discardChanges', 'restore'].includes(action))
        : actions
      return sitePath({ _type: schemaType, slug: { current: 'x' } } as unknown as SanityDocument)
        ? [...allowed, ViewOnSiteAction]
        : allowed
    },
  },
})
