// Capture current app (local/prod) screenshots for fresh references
// Usage:
//   BASE_URL=http://localhost:3025 TEST_EMAIL=you@example.com TEST_PASSWORD=secret \
//   node scripts/capture-our-app.js

const fs = require('fs')
const path = require('path')
const { chromium } = require('playwright')

async function ensureDir(p) {
  await fs.promises.mkdir(p, { recursive: true })
}

function ts() {
  return new Date().toISOString().replace(/[:.]/g, '-')
}

async function main() {
  const BASE_URL = process.env.BASE_URL || 'http://localhost:3025'
  const EMAIL = process.env.TEST_EMAIL
  const PASSWORD = process.env.TEST_PASSWORD

  if (!EMAIL || !PASSWORD) {
    console.error('[capture-our-app] Missing TEST_EMAIL or TEST_PASSWORD')
    process.exit(1)
  }

  const outDir = path.resolve('screenshots/current')
  await ensureDir(outDir)

  const headless = !(process.env.HEADFUL === '1' || process.env.HEADLESS === 'false')
  const browser = await chromium.launch({ headless })
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await ctx.newPage()

  page.on('console', (msg) => {
    if (['error'].includes(msg.type())) {
      console.log(`[console.${msg.type()}]`, msg.text())
    }
  })

  try {
    // Sign in
    await page.goto(`${BASE_URL}/auth/signin`, { waitUntil: 'domcontentloaded' })
    await page.getByPlaceholder(/email/i).fill(EMAIL)
    await page.getByPlaceholder(/senha|password/i).fill(PASSWORD)
    await page.getByRole('button', { name: /Entrar com email|entrar|login/i }).click()

    // Wait dashboard
    await page.waitForLoadState('networkidle', { timeout: 30000 })
    await page.waitForURL(/.*\/dashboard.*/, { timeout: 30000 }).catch(() => {})

    // Baseline capture (full)
    await page.waitForTimeout(600)
    const dashPath = path.join(outDir, `dashboard-full-${ts()}.png`)
    await page.screenshot({ path: dashPath, fullPage: true })
    console.log('[capture-our-app] Saved', dashPath)

    // Focus chat to collapse templates
    await page.locator('#inline-chat').scrollIntoViewIfNeeded().catch(() => {})
    await page.locator('#inline-chat-input').click({ timeout: 5000 })
    await page.waitForTimeout(350)
    // Expect the “Mostrar templates” link to appear in tall mode
    await page.getByText(/Mostrar templates/i).first().isVisible().catch(() => {})
    const chatPath = path.join(outDir, `dashboard-chat-full-${ts()}.png`)
    await page.screenshot({ path: chatPath, fullPage: true })
    console.log('[capture-our-app] Saved', chatPath)

    // Open model selector dropdown
    const trigger = page.locator('[data-testid="model-selector-trigger"]').first()
    await trigger.click({ timeout: 5000 })
    await page.getByText(/Selecione um Modelo de IA/i).first().waitFor({ timeout: 5000 }).catch(() => {})
    const modelPath = path.join(outDir, `models-selector-open-${ts()}.png`)
    await page.screenshot({ path: modelPath, fullPage: true })
    console.log('[capture-our-app] Saved', modelPath)

  } finally {
    await page.close()
    await ctx.close()
    await browser.close()
  }
}

main().catch((e) => { console.error('[capture-our-app] FAILED', e); process.exit(1) })
