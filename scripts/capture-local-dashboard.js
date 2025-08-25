// Login via UI and capture dashboard
const { chromium } = require('playwright')

async function run() {
  const baseURL = process.env.BASE_URL || 'http://localhost:3000'
  const email = process.env.TEST_EMAIL || 'test@example.com'
  const password = process.env.TEST_PASSWORD || 'Test@123456'
  const ts = new Date().toISOString().replace(/[:.]/g, '-')
  const path = require('path')
  const fs = require('fs')
  const outDir = 'screenshots'
  fs.mkdirSync(outDir, { recursive: true })

  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await context.newPage()
  page.setDefaultNavigationTimeout(Number(process.env.PW_NAV_TIMEOUT || 60000))
  page.setDefaultTimeout(Number(process.env.PW_TIMEOUT || 60000))

  try {
    // Go to sign in
    await page.goto(`${baseURL}/auth/signin`, { waitUntil: 'domcontentloaded' })
    // Fill login form
    await page.fill('input[type="email"]', email)
    await page.fill('input[type="password"]', password)
    // Click login button (robust fallback selectors)
    try {
      await page.getByRole('button', { name: /entrar com email/i }).click()
    } catch {
      try { await page.click('button:has-text("Entrar com email")') } catch {
        await page.click('text=Entrar com email')
      }
    }
    // Wait for dashboard
    await page.waitForURL('**/dashboard', { timeout: 30000 })
    try { await page.waitForLoadState('networkidle', { timeout: 10000 }) } catch {}
    const outFull = path.join(outDir, `dashboard-full-${ts}.png`)
    await page.screenshot({ path: outFull, fullPage: true })
    console.log('Saved:', outFull)
    // Try capture main container if present
    try {
      const mainSelector = 'main, .container, .py-8'
      await page.locator(mainSelector).first().screenshot({ path: path.join(outDir, `dashboard-main-${ts}.png`) })
    } catch {}
  } finally {
    await page.close()
    await context.close()
    await browser.close()
  }
}

run().catch((err) => { console.error('Capture local dashboard failed:', err); process.exit(1) })
