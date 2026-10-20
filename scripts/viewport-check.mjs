import { chromium } from 'playwright'
import { AxeBuilder } from '@axe-core/playwright'
import { mkdirSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const BASE = process.env.BASE_URL || 'http://localhost:4173'
const routes = (process.env.ROUTES || '/').split(',')
const widths = (process.env.WIDTHS || '375,479,767,991,1180,1440').split(',').map(Number)
// Standaard buiten de repo (voorheen '.', waardoor tientallen PNG's in de
// repo-root belandden).
const shotDir = process.env.SHOT_DIR || join(tmpdir(), 'desingel-shots')
// Toegankelijkheidscheck (axe-core) op de smalste en breedste breedte;
// AXE=0 slaat hem over. Alleen serious/critical laat het script falen.
const runAxe = process.env.AXE !== '0'
const axeWidths = new Set([widths[0], widths[widths.length - 1]])

if (process.env.SHOTS) {
  mkdirSync(shotDir, { recursive: true })
  console.log(`screenshots → ${shotDir}`)
}

const browser = await chromium.launch()
let failures = 0
for (const route of routes) {
  for (const width of widths) {
    // eigen context per pagina: axe opent er een extra pagina in
    const context = await browser.newContext({
      viewport: { width, height: 900 },
      reducedMotion: 'reduce',
    })
    const page = await context.newPage()
    await page.goto(BASE + route, { waitUntil: 'networkidle' })
    const { scrollW, clientW } = await page.evaluate(() => ({
      scrollW: document.documentElement.scrollWidth,
      clientW: document.documentElement.clientWidth,
    }))
    const status = scrollW > clientW ? 'OVERFLOW' : 'ok'
    if (status === 'OVERFLOW') failures++
    console.log(`${route} @${width}px: ${status} (scroll ${scrollW} / client ${clientW})`)

    if (runAxe && axeWidths.has(width)) {
      const { violations } = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        // De Google Maps-iframe is van derden; daar hebben we geen invloed op
        .exclude('iframe')
        .analyze()
      for (const v of violations) {
        const blocking = v.impact === 'serious' || v.impact === 'critical'
        if (blocking) failures++
        console.log(`  ${blocking ? 'AXE' : 'axe'} [${v.impact}] ${v.id}: ${v.help} (${v.nodes.length}×)`)
        for (const n of v.nodes.slice(0, 3)) console.log(`      ${n.target.join(' ')}`)
      }
    }

    if (process.env.SHOTS) {
      const name = route.replace(/[\/\[\]]/g, '_') || '_home'
      await page.screenshot({ path: join(shotDir, `${name}-${width}.png`), fullPage: true })
    }
    await context.close()
  }
}
await browser.close()
process.exit(failures ? 1 : 0)
