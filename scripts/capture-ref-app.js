// Capture reference app (InnerAI) screenshots for fresh references
// Usage:
//   REFERENCE_BASE_URL=https://app.innerai.com node scripts/capture-ref-app.js
// Optional: set REF_COOKIES=ref-cookies.json to reuse/save session cookies.

const fs = require('fs')
const path = require('path')
const { chromium } = require('playwright')

async function ensureDir(p) {
  await fs.promises.mkdir(p, { recursive: true })
}

function ts() {
  return new Date().toISOString().replace(/[:.]/g, '-')
}

async function loadCookies(ctx, cookiePath) {
  try {
    const raw = await fs.promises.readFile(cookiePath, 'utf8')
    const cookies = JSON.parse(raw)
    if (Array.isArray(cookies) && cookies.length) {
      await ctx.addCookies(cookies)
      console.log('[capture-ref-app] Loaded cookies from', cookiePath)
    }
  } catch {}
}

async function saveCookies(ctx, cookiePath) {
  try {
    const cookies = await ctx.cookies()
    await fs.promises.writeFile(cookiePath, JSON.stringify(cookies, null, 2))
    console.log('[capture-ref-app] Saved cookies to', cookiePath)
  } catch {}
}

async function main() {
  const BASE_URL = process.env.REFERENCE_BASE_URL || 'https://app.innerai.com'
  const COOKIE_PATH = process.env.REF_COOKIES || 'ref-cookies.json'

  const outDir = path.resolve('screenshots/reference')
  await ensureDir(outDir)

  // Use headful to allow manual login if needed
  const browser = await chromium.launch({ headless: false })
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  await loadCookies(ctx, COOKIE_PATH)
  const page = await ctx.newPage()

  try {
    // Landing
    await page.goto(BASE_URL, { waitUntil: 'load', timeout: 60000 })
    await page.waitForTimeout(1200)
    const landingPath = path.join(outDir, `ref-landing-full-${ts()}.png`)
    await page.screenshot({ path: landingPath, fullPage: true })
    console.log('[capture-ref-app] Saved', landingPath)

    // Try dashboard (if session is valid)
    await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(1500)
    const url = page.url()
    if (/\/dashboard/.test(url)) {
      const dashPath = path.join(outDir, `ref-dashboard-full-${ts()}.png`)
      await page.screenshot({ path: dashPath, fullPage: true })
      console.log('[capture-ref-app] Saved', dashPath)
    } else {
      console.log('[capture-ref-app] Not logged in; manual login recommended, cookies will be saved if you do it now.')
      // Give time for manual login
      await page.waitForTimeout(30000)
      // Attempt again
      await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'domcontentloaded' })
      await page.waitForTimeout(1200)
      if (/\/dashboard/.test(page.url())) {
        const dashPath = path.join(outDir, `ref-dashboard-full-${ts()}.png`)
        await page.screenshot({ path: dashPath, fullPage: true })
        console.log('[capture-ref-app] Saved', dashPath)
      }
    }

    await saveCookies(ctx, COOKIE_PATH)
  } finally {
    await page.close()
    await ctx.close()
    await browser.close()
  }
}

main().catch((e) => { console.error('[capture-ref-app] FAILED', e); process.exit(1) })

