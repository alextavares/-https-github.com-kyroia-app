// Capture the reference app dashboard (e.g., app.innerai.com) with Playwright
// Supports two auth modes:
// 1) Cookies: set REF_COOKIES_JSON to a JSON file with an array of cookies
//    [{ name, value, domain?, path? }]. Domain is inferred from REF_BASE_URL if missing.
// 2) Credentials: set REF_EMAIL and REF_PASSWORD; the script will try common signin paths
//    and fill email/password inputs heuristically.

const { chromium } = require('playwright')
const fs = require('fs')
const path = require('path')

function urlHost(urlStr) {
  const u = new URL(urlStr)
  return u.hostname
}

async function addCookiesFromJson(context, baseUrl, jsonPath) {
  const host = urlHost(baseUrl)
  const raw = JSON.parse(fs.readFileSync(jsonPath, 'utf8'))
  const arr = Array.isArray(raw) ? raw : (raw.cookies || [])
  if (!Array.isArray(arr)) throw new Error('Invalid cookies JSON format')
  const cookies = arr.map((c) => ({
    name: c.name,
    value: c.value,
    domain: c.domain || host,
    path: c.path || '/',
    httpOnly: !!c.httpOnly,
    secure: !!c.secure,
    sameSite: c.sameSite || 'Lax',
    expires: typeof c.expires === 'number' ? c.expires : undefined,
  }))
  await context.addCookies(cookies)
}

async function trySigninWithCredentials(page, baseURL, email, password) {
  const candidates = ['/auth/signin', '/signin', '/login', '/auth/login']
  for (const p of candidates) {
    try {
      await page.goto(`${baseURL}${p}`, { waitUntil: 'domcontentloaded' })
      // Heuristic fill
      const emailSel = 'input[type="email"], input[name*="email" i], input[autocomplete="username"]'
      const passSel = 'input[type="password"], input[name*="password" i], input[autocomplete="current-password"]'
      const btnSel = 'button[type="submit"], button:has-text("Entrar"), button:has-text("Login"), button:has-text("Sign in"), [role="button"]:has-text("Entrar")'
      if (await page.locator(emailSel).first().isVisible().catch(() => false)) {
        await page.locator(emailSel).first().fill(email)
      }
      if (await page.locator(passSel).first().isVisible().catch(() => false)) {
        await page.locator(passSel).first().fill(password)
      }
      if (await page.locator(btnSel).first().isVisible().catch(() => false)) {
        await Promise.all([
          page.waitForLoadState('domcontentloaded').catch(() => {}),
          page.locator(btnSel).first().click(),
        ])
      }
      // If we reached dashboard, return
      await page.waitForTimeout(1500)
      const pathname = new URL(page.url()).pathname
      if (pathname.includes('/dashboard')) return true
      // Try going to dashboard explicitly
      await page.goto(`${baseURL}/dashboard`, { waitUntil: 'domcontentloaded' })
      await page.waitForLoadState('networkidle').catch(() => {})
      if (new URL(page.url()).pathname.includes('/dashboard')) return true
    } catch (_) {}
  }
  return false
}

async function run() {
  const baseURL = process.env.REF_BASE_URL || 'https://app.innerai.com'
  const pathToVisit = process.env.REF_PATH || '/dashboard'
  const email = process.env.REF_EMAIL
  const password = process.env.REF_PASSWORD
  const cookiesJson = process.env.REF_COOKIES_JSON
  const ts = new Date().toISOString().replace(/[:.]/g, '-')

  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext()
  const page = await context.newPage()
  page.setDefaultNavigationTimeout(Number(process.env.PW_NAV_TIMEOUT || 60000))
  page.setDefaultTimeout(Number(process.env.PW_TIMEOUT || 60000))

  try {
    if (cookiesJson && fs.existsSync(cookiesJson)) {
      await addCookiesFromJson(context, baseURL, cookiesJson)
    }

    // Navigate to dashboard (may redirect to login)
    await page.goto(`${baseURL}${pathToVisit}`, { waitUntil: 'domcontentloaded' })
    await page.waitForLoadState('networkidle').catch(() => {})

    // If not logged in and credentials provided, try to sign in
    const pathname0 = new URL(page.url()).pathname
    if (!pathname0.includes('/dashboard') && email && password) {
      const ok = await trySigninWithCredentials(page, baseURL, email, password)
      if (!ok) console.warn('Signin attempt did not reach dashboard; capturing current page anyway.')
    }

    // Ensure we are at desired path
    await page.goto(`${baseURL}${pathToVisit}`, { waitUntil: 'domcontentloaded' }).catch(() => {})
    await page.waitForLoadState('networkidle').catch(() => {})

    const pageName = (pathToVisit.replace(/^[\/]+/,'') || 'dashboard').replace(/[^a-z0-9_-]+/gi, '-').toLowerCase()
    const outFull = path.join('screenshots', `ref-${pageName}-full-${ts}.png`)
    const outMain = path.join('screenshots', `ref-${pageName}-main-${ts}.png`)
    await page.screenshot({ path: outFull, fullPage: true })
    try {
      await page.locator('main, .container, .py-8, [role="main"]').first().screenshot({ path: outMain })
    } catch {}

    console.log(JSON.stringify({ ok: true, outFull, outMain, currentUrl: page.url() }, null, 2))
  } finally {
    await page.close(); await context.close(); await browser.close()
  }
}

run().catch((e) => { console.error(e); process.exit(1) })
