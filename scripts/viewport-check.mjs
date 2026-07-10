import { chromium } from 'playwright'

const BASE = process.env.BASE_URL || 'http://localhost:4173'
const routes = (process.env.ROUTES || '/').split(',')
const widths = (process.env.WIDTHS || '375,479,767,991,1180,1440').split(',').map(Number)
const shotDir = process.env.SHOT_DIR || '.'

const browser = await chromium.launch()
let failures = 0
for (const route of routes) {
  for (const width of widths) {
    const page = await browser.newPage({
      viewport: { width, height: 900 },
      reducedMotion: 'reduce',
    })
    await page.goto(BASE + route, { waitUntil: 'networkidle' })
    const { scrollW, clientW } = await page.evaluate(() => ({
      scrollW: document.documentElement.scrollWidth,
      clientW: document.documentElement.clientWidth,
    }))
    const status = scrollW > clientW ? 'OVERFLOW' : 'ok'
    if (status === 'OVERFLOW') failures++
    console.log(`${route} @${width}px: ${status} (scroll ${scrollW} / client ${clientW})`)
    if (process.env.SHOTS) {
      const name = route.replace(/[\/\[\]]/g, '_') || '_home'
      await page.screenshot({ path: `${shotDir}/${name}-${width}.png`, fullPage: true })
    }
    await page.close()
  }
}
await browser.close()
process.exit(failures ? 1 : 0)
