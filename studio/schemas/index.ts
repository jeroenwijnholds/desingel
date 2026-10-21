import siteSettings from './siteSettings'
import homePage from './homePage'
import boerderijPage from './boerderijPage'
import overOnsPage from './overOnsPage'
import contactPage from './contactPage'
import agendaPage from './agendaPage'
import nieuwsPage from './nieuwsPage'
import fotoGalerij from './fotoGalerij'
import event from './event'
import nieuwsArtikel from './nieuwsArtikel'
import { withPlaceholderWarnings } from './lib'

export const schemaTypes = [
  siteSettings,
  // Paginateksten: waarschuwing als een veld nog zijn eigen veldnaam als
  // inhoud heeft ("Diensten titel") — zo stonden er placeholders live.
  ...[homePage, boerderijPage, overOnsPage, contactPage, agendaPage, nieuwsPage].map(withPlaceholderWarnings),
  fotoGalerij,
  event,
  nieuwsArtikel,
]
