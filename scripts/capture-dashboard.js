// Simple Playwright script to sign up, sign in, and capture dashboard screenshots
const { chromium } = require('playwright')

async function run() {
  const baseURL = process.env.BASE_URL || 'http://localhost:3025'
  const ts = new Date().toISOString().replace(/[:.]/g, '-')
  const email = process.env.TEST_EMAIL || `test+${Date.now()}@example.com`
  const password = process.env.TEST_PASSWORD || 'Test@123456'
  const name = process.env.TEST_NAME || 'Test User'

  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext()
  const page = await context.newPage()
  // Increase default timeouts to better tolerate slower dev envs
  try {
    page.setDefaultNavigationTimeout(Number(process.env.PW_NAV_TIMEOUT || 60000))
    page.setDefaultTimeout(Number(process.env.PW_TIMEOUT || 60000))
  } catch {}
  page.on('console', msg => {
    try {
      console.log('[browser]', msg.type(), msg.text())
    } catch {}
  })
  page.on('pageerror', err => {
    console.log('[pageerror]', err?.message || String(err))
  })

  // Helper to wait for a path change
  const waitForPath = async (pathFragment, timeout = 15000) => {
    await page.waitForFunction(
      (frag) => window.location.pathname.includes(frag),
      pathFragment,
      { timeout }
    )
  }

  try {
    // 0) Create user via API to avoid UI flakiness
    // Allow using existing account without trying to register when TEST_EMAIL is set
    if (!process.env.TEST_EMAIL) {
      try {
        const res = await fetch(`${baseURL}/api/auth/register`, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ name, email, password })
        })
        if (!res.ok && res.status !== 400) {
          console.warn('Register API response:', res.status, await res.text())
        }
      } catch (e) {
        console.warn('Register API call failed, proceeding to sign in anyway:', e.message || e)
      }
    }

    // 1) Sign in (credentials) via NextAuth callback API to ensure session cookie
    await page.goto(`${baseURL}/auth/signin`, { waitUntil: 'domcontentloaded' })
    const result = await page.evaluate(async ({ email, password }) => {
      const getJson = async (url) => (await fetch(url, { credentials: 'include' })).json()
      const csrf = await getJson('/api/auth/csrf')
      const form = new URLSearchParams()
      form.set('csrfToken', csrf.csrfToken)
      form.set('email', email)
      form.set('password', password)
      form.set('json', 'true')
      const res = await fetch('/api/auth/callback/credentials?json=true', {
        method: 'POST',
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        body: form,
        credentials: 'include'
      })
      let body = null
      try { body = await res.json() } catch {}
      return { ok: res.ok, status: res.status, body }
    }, { email, password })
    console.log('Sign-in API result:', result)
    if (!result.ok) {
      await page.screenshot({ path: `screenshots/signin-error-${ts}.png`, fullPage: true })
      throw new Error('Sign-in API failed: ' + JSON.stringify(result))
    }
    // Go to dashboard with valid session cookie now set
    await page.goto(`${baseURL}/dashboard`, { waitUntil: 'domcontentloaded' })
    console.log('After goto(/dashboard) URL:', page.url())
    const cookies = await context.cookies()
    const authCookies = cookies.filter(c=>c.name.includes('next-auth'))
    console.log('Auth cookies:', authCookies)
    await waitForPath('/dashboard')

    // 3) Capture dashboard screenshots
    await page.waitForLoadState('networkidle')
    await page.screenshot({ path: `screenshots/dashboard-full-${ts}.png`, fullPage: true })

    // Optional: capture key sections if present
    try {
      const selector = 'main, .container, .py-8'
      await page.locator(selector).first().screenshot({ path: `screenshots/dashboard-main-${ts}.png` })
    } catch (_) {}

    console.log('Screenshots saved to screenshots/*.png')
    console.log('Login email:', email)
    console.log('Login password:', password)

    // 4) Navigate to chat and capture
    await page.goto(`${baseURL}/dashboard/chat`, { waitUntil: 'domcontentloaded' })
    try { await waitForPath('/dashboard/chat', 20000) } catch {}
    await page.waitForLoadState('networkidle')
    await page.screenshot({ path: `screenshots/chat-full-${ts}.png`, fullPage: true })
    try {
      await page.locator('main, .container, .py-8').first().screenshot({ path: `screenshots/chat-main-${ts}.png` })
    } catch (_) {}

    // 5) Navigate to history and capture
    await page.goto(`${baseURL}/dashboard/history`, { waitUntil: 'domcontentloaded' })
    try { await waitForPath('/dashboard/history', 20000) } catch {}
    await page.waitForLoadState('networkidle')
    await page.screenshot({ path: `screenshots/history-full-${ts}.png`, fullPage: true })
    try {
      await page.locator('main, .container, .py-8').first().screenshot({ path: `screenshots/history-main-${ts}.png` })
    } catch (_) {}

    // 6) Navigate to models and capture
    await page.goto(`${baseURL}/dashboard/models`, { waitUntil: 'domcontentloaded' })
    try { await waitForPath('/dashboard/models', 20000) } catch {}
    await page.waitForLoadState('networkidle')
    await page.screenshot({ path: `screenshots/models-full-${ts}.png`, fullPage: true })
    try {
      await page.locator('main, .container, .py-8').first().screenshot({ path: `screenshots/models-main-${ts}.png` })
    } catch (_) {}

    // 7) Navigate to credits and capture
    await page.goto(`${baseURL}/dashboard/credits`, { waitUntil: 'domcontentloaded' })
    try { await waitForPath('/dashboard/credits', 20000) } catch {}
    await page.waitForLoadState('networkidle')
    await page.screenshot({ path: `screenshots/credits-full-${ts}.png`, fullPage: true })
    try {
      await page.locator('main, .container, .py-8').first().screenshot({ path: `screenshots/credits-main-${ts}.png` })
    } catch (_) {}

    // 8) Navigate to subscription and capture
    await page.goto(`${baseURL}/dashboard/subscription`, { waitUntil: 'domcontentloaded' })
    try { await waitForPath('/dashboard/subscription', 20000) } catch {}
    await page.waitForLoadState('networkidle')
    await page.screenshot({ path: `screenshots/subscription-full-${ts}.png`, fullPage: true })
    try {
      await page.locator('main, .container, .py-8').first().screenshot({ path: `screenshots/subscription-main-${ts}.png` })
    } catch (_) {}

    // 9) Navigate to settings and capture
    await page.goto(`${baseURL}/dashboard/settings`, { waitUntil: 'domcontentloaded' })
    try { await waitForPath('/dashboard/settings', 20000) } catch {}
    await page.waitForLoadState('networkidle')
    await page.screenshot({ path: `screenshots/settings-full-${ts}.png`, fullPage: true })
    try {
      await page.locator('main, .container, .py-8').first().screenshot({ path: `screenshots/settings-main-${ts}.png` })
    } catch (_) {}

    // 10) Navigate to profile and capture
    await page.goto(`${baseURL}/dashboard/profile`, { waitUntil: 'domcontentloaded' })
    try { await waitForPath('/dashboard/profile', 20000) } catch {}
    await page.waitForLoadState('networkidle')
    await page.screenshot({ path: `screenshots/profile-full-${ts}.png`, fullPage: true })
    try {
      await page.locator('main, .container, .py-8').first().screenshot({ path: `screenshots/profile-main-${ts}.png` })
    } catch (_) {}

    // 11) Navigate to templates and capture
    await page.goto(`${baseURL}/dashboard/templates`, { waitUntil: 'domcontentloaded' })
    try { await waitForPath('/dashboard/templates', 20000) } catch {}
    await page.waitForLoadState('networkidle')
    await page.screenshot({ path: `screenshots/templates-full-${ts}.png`, fullPage: true })
    try {
      await page.locator('main, .container, .py-8').first().screenshot({ path: `screenshots/templates-main-${ts}.png` })
    } catch (_) {}

    // 12) Navigate to knowledge and capture
    await page.goto(`${baseURL}/dashboard/knowledge`, { waitUntil: 'domcontentloaded' })
    try { await waitForPath('/dashboard/knowledge', 20000) } catch {}
    await page.waitForLoadState('networkidle')
    await page.screenshot({ path: `screenshots/knowledge-full-${ts}.png`, fullPage: true })
    try {
      await page.locator('main, .container, .py-8').first().screenshot({ path: `screenshots/knowledge-main-${ts}.png` })
    } catch (_) {}
  } finally {
    await page.close()
    await context.close()
    await browser.close()
  }
}

run().catch((err) => {
  console.error('Capture failed:', err)
  process.exit(1)
})
