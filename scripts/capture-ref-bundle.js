const { chromium } = require('playwright')
const fs = require('fs')
const path = require('path')

function sanitize(name) {
  return name.replace(/[^a-z0-9_-]+/gi, '-').replace(/^-+|-+$/g, '').toLowerCase
() || 'root'
}
function urlHost(urlStr) { return new URL(urlStr).hostname }

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
      const emailSel = 'input[type="email"], input[name*="email" i], input[autoc
omplete="username"]'
      const passSel = 'input[type="password"], input[name*="password" i], input[
autocomplete="current-password"]'
      const btnSel = 'button[type="submit"], button:has-text("Entrar"), button:h
as-text("Login"), button:has-text("Sign in"), [role="button"]:has-text("Entrar")
'
      if (await page.locator(emailSel).first().isVisible().catch(() => false)) a
wait page.locator(emailSel).first().fill(email)
      if (await page.locator(passSel).first().isVisible().catch(() => false)) aw
ait page.locator(passSel).first().fill(password)
      if (await page.locator(btnSel).first().isVisible().catch(() => false)) {
        await Promise.all([
          page.waitForLoadState('domcontentloaded').catch(() => {}),
          page.locator(btnSel).first().click(),
        ])
      }
      await page.waitForTimeout(1500)
      const pathname = new URL(page.url()).pathname
      if (pathname.includes('/dashboard')) return true
      await page.goto(`${baseURL}/dashboard`, { waitUntil: 'domcontentloaded' })
      await page.waitForLoadState('networkidle').catch(() => {})
      if (new URL(page.url()).pathname.includes('/dashboard')) return true
    } catch (_) {}
  }
  return false
}

async function run() {
  const baseURL = process.env.REF_BASE_URL || 'https://app.innerai.com'
  const routes = (process.env.ROUTES && process.env.ROUTES.split(',')) || [
    '/dashboard',
    '/dashboard/chat',
    '/dashboard/models',
    '/dashboard/templates',
    '/dashboard/history',
    '/dashboard/credits',
    '/dashboard/subscription',
    '/dashboard/settings',
    '/dashboard/profile',
    '/dashboard/knowledge',
  ]
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
    await page.goto(`${baseURL}/dashboard`, { waitUntil: 'domcontentloaded' }).c
atch(() => {})
    await page.waitForLoadState('networkidle').catch(() => {})
    if (!new URL(page.url()).pathname.includes('/dashboard') && email && passwor
d) {
      const ok = await trySigninWithCredentials(page, baseURL, email, password)
      if (!ok) console.warn('[ref-bundle] Signin might have failed or require 2F
A; proceeding to capture what is visible.')
    }

    for (const pathToVisit of routes) {
      const pageName = sanitize(pathToVisit.replace(/^\/+/, '') || 'dashboard')
      const outFull = path.join('screenshots', `ref-${pageName}-full-${ts}.png`)
      const outMain = path.join('screenshots', `ref-${pageName}-main-${ts}.png`)
      try {
        await page.goto(`${baseURL}${pathToVisit}`, { waitUntil: 'domcontentload
ed' })
        await page.waitForLoadState('networkidle').catch(() => {})
        await page.screenshot({ path: outFull, fullPage: true })
        try { await page.locator('main, .container, .py-8, [role="main"]').first
().screenshot({ path: outMain }) } catch {}
        console.log(`[ref] captured ${pathToVisit} → ${outFull}`)
      } catch (e) {
        console.warn(`[ref] failed to capture ${pathToVisit}:`, e.message || e)
      }
    }
    console.log(JSON.stringify({ ok: true, ts, routes, baseURL }, null, 2))
  } finally {
    await page.close(); await context.close(); await browser.close()
  }
}
run().catch((e) => { console.error(e); process.exit(1) })
