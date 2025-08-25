const { chromium } = require('playwright')

async function run() {
  const baseURL = process.env.BASE_URL || 'http://localhost:3000'
  const url = `${baseURL}/dashboard`
  const ts = new Date().toISOString().replace(/[:.]/g, '-')
  const fs = require('fs')
  fs.mkdirSync('screenshots', { recursive: true })
  const browser = await chromium.launch({ headless: true })
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await ctx.newPage()
  page.setDefaultNavigationTimeout(60000)
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded' })
    try { await page.waitForLoadState('networkidle', { timeout: 10000 }) } catch {}
    const out = `screenshots/local-${ts}.png`
    await page.screenshot({ path: out, fullPage: true })
    console.log('Saved:', out, 'URL:', page.url())
  } finally {
    await page.close(); await ctx.close(); await browser.close()
  }
}

run().catch((e)=>{ console.error(e); process.exit(1) })
