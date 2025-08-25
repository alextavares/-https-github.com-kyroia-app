// Headed login helper for reference site. Fills credentials if provided,
// waits for dashboard, and saves storageState to a file for reuse.

const { chromium } = require('playwright')
const fs = require('fs')
const path = require('path')

async function main() {
  const baseURL = process.env.REF_BASE_URL || 'https://app.innerai.com'
  const allowedHost = new URL(baseURL).hostname
  const email = process.env.REF_EMAIL
  const password = process.env.REF_PASSWORD
  const outState = process.env.SAVE_REF_STORAGE_STATE || 'ref-storage-state.json'
  const headless = process.env.HEADLESS === '0' ? false : true
  const userDataDir = process.env.REF_USER_DATA_DIR || path.resolve('tmp/ref-profile')
  if (!fs.existsSync(userDataDir)) fs.mkdirSync(userDataDir, { recursive: true })

  const ua = process.env.REF_UA || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
  const viewport = { width: 1280, height: 800 }

  let context
  try {
    context = await chromium.launchPersistentContext(userDataDir, {
      headless,
      viewport,
      userAgent: ua,
      args: [
        '--disable-blink-features=AutomationControlled',
        '--no-default-browser-check',
        '--disable-features=IsolateOrigins,site-per-process',
      ],
    })
  } catch (e) {
    const browser = await chromium.launch({ headless })
    context = await browser.newContext({ viewport, userAgent: ua })
  }
  await context.addInitScript(() => {
    try { Object.defineProperty(navigator, 'webdriver', { get: () => undefined }) } catch {}
    try { Object.defineProperty(navigator, 'languages', { get: () => ['pt-BR', 'pt', 'en-US', 'en'] }) } catch {}
    try { Object.defineProperty(navigator, 'plugins', { get: () => [1,2,3,4,5] }) } catch {}
    try { window.chrome = window.chrome || { runtime: {} } } catch {}
  })
  // Observe external navigations to bring user back
  context.on('framenavigated', async (frame) => {
    try {
      if (frame.parentFrame()) return
      const u = new URL(frame.url())
      if (u.hostname && u.hostname !== allowedHost) {
        console.log('[ref-login] detected nav to other host:', u.hostname)
        const p = frame.page()
        await p.goto(`${baseURL}/auth/signin`, { waitUntil: 'domcontentloaded' }).catch(() => {})
      }
    } catch {}
  })
  const page = await context.newPage()
  try {
    page.setDefaultNavigationTimeout(Number(process.env.PW_NAV_TIMEOUT || 90000))
    page.setDefaultTimeout(Number(process.env.PW_TIMEOUT || 90000))
  } catch {}

  try {
    await page.goto(`${baseURL}/auth/signin`, { waitUntil: 'domcontentloaded' })
  } catch {}

  if (email && password) {
    try {
      const emailSel = 'input[type="email"], input[name*="email" i], input[autocomplete="username"]'
      const passSel = 'input[type="password"], input[name*="password" i], input[autocomplete="current-password"]'
      const btnSel = 'button[type="submit"], button:has-text("Entrar"), button:has-text("Login"), button:has-text("Sign in")'
      if (await page.locator(emailSel).first().isVisible().catch(() => false)) await page.locator(emailSel).first().fill(email)
      if (await page.locator(passSel).first().isVisible().catch(() => false)) await page.locator(passSel).first().fill(password)
      if (await page.locator(btnSel).first().isVisible().catch(() => false)) {
        await Promise.all([
          page.waitForLoadState('domcontentloaded').catch(() => {}),
          page.locator(btnSel).first().click(),
        ])
      }
    } catch (e) {
      console.warn('[ref-login] auto-fill failed, proceed manually:', e.message || e)
    }
  }

  // Allow manual completion if needed (2FA, captcha, etc.)
  const manualMs = Number(process.env.MANUAL_LOGIN_MS || 0)
  if (!headless || manualMs > 0) {
    const waitMs = manualMs || 30000
    console.log(`[ref-login] waiting up to ${waitMs}ms for manual completion...`)
    await page.waitForTimeout(waitMs)
  }

  // Verify dashboard access
  try {
    if (!new URL(page.url()).pathname.includes('/dashboard')) {
      await page.goto(`${baseURL}/dashboard`, { waitUntil: 'domcontentloaded' })
    }
  } catch {}
  const atDashboard = new URL(page.url()).pathname.includes('/dashboard')
  console.log('[ref-login] atDashboard:', atDashboard, 'url:', page.url())

  await context.storageState({ path: outState })
  console.log('[ref-login] storageState saved:', outState, fs.existsSync(outState) ? 'OK' : 'MISSING')
}

main().catch((e) => { console.error(e); process.exit(1) })
