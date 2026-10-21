import { Button, Card, Container, Heading, Stack, Text } from '@sanity/ui'
import { ChartUpwardIcon, LaunchIcon } from '@sanity/icons'
import type { Tool } from 'sanity'

/**
 * Tabblad "Bezoekersstatistiek": opent de deellink van het Umami-dashboard
 * (alleen-lezen, geen login nodig). Inbedden kan niet: Umami Cloud weigert
 * frames (X-Frame-Options: SAMEORIGIN).
 *
 * De deellink staat NIET in de code (de repo is openbaar): zet hem in
 * studio/.env als SANITY_STUDIO_UMAMI_SHARE_URL vóór `npm run deploy`.
 * Zonder die variabele verschijnt het tabblad niet.
 */
const SHARE_URL = process.env.SANITY_STUDIO_UMAMI_SHARE_URL ?? ''

function StatistiekTool() {
  return (
    <Container width={1} padding={5}>
      <Card padding={5} radius={3} shadow={1}>
        <Stack space={5}>
          <Heading as="h1" size={3}>Bezoekersstatistiek</Heading>
          <Text muted>
            Hoeveel mensen de website bezoeken, welke pagina’s ze bekijken en waar ze vandaan
            komen. De cijfers zijn anoniem: er worden geen cookies gebruikt en bezoekers zijn
            niet herkenbaar.
          </Text>
          <Text muted size={1}>
            Het dashboard opent in een nieuw tabblad. Je hoeft niet in te loggen; deel de link
            niet openbaar.
          </Text>
          <Button
            as="a"
            href={SHARE_URL}
            target="_blank"
            rel="noopener noreferrer"
            icon={ChartUpwardIcon}
            iconRight={LaunchIcon}
            text="Open de statistieken"
            tone="primary"
            fontSize={2}
            padding={4}
          />
        </Stack>
      </Card>
    </Container>
  )
}

export const statistiekTools: Tool[] = SHARE_URL
  ? [{ name: 'statistiek', title: 'Bezoekersstatistiek', icon: ChartUpwardIcon, component: StatistiekTool }]
  : []
