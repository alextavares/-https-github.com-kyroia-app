// Capture a public page screenshot using Playwright
const { chromium } = require('playwright')

async function run() {
  const url = process.env.TARGET_URL || 'https://app.innerai.com'
  const outDir = process.env.OUT_DIR || 'screenshots/ref-innerai'
  const ts = new Date().toISOString().replace(/[:.]/g, '-')
  const path = require('path')
  const fs = require('fs')
  fs.mkdirSync(outDir, { recursive: true })

  const browser = await chromium.launch({ headless: true })
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1
  })
  const page = await ctx.newPage()
  page.setDefaultNavigationTimeout(Number(process.env.PW_NAV_TIMEOUT || 60000))
  page.setDefaultTimeout(Number(process.env.PW_TIMEOUT || 60000))
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded' })
    try { await page.waitForLoadState('networkidle', { timeout: 20000 }) } catch {}
    const outFile = path.join(outDir, `external-${ts}.png`)
    await page.screenshot({ path: outFile, fullPage: true })
    console.log('Saved:', outFile)
  } finally {
    await page.close()
    await ctx.close()
    await browser.close()
  }
}

run().catch((err) => { console.error('Capture external failed:', err); process.exit(1) })
