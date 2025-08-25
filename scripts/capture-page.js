const { chromium } = require('playwright')

function sanitize(name) {
  return name.replace(/[^a-z0-9_-]+/gi, '-').replace(/^-+|-+$/g, '').toLowerCase() || 'root'
}

async function run() {
  const baseURL = process.env.BASE_URL || 'http://localhost:3025'
  const email = process.env.TEST_EMAIL || 'test@example.com'
  const password = process.env.TEST_PASSWORD || 'Test@123456'
  const path = process.argv[2] || '/'
  const pageName = sanitize(path.replace(/^\//, ''))
  const ts = new Date().toISOString().replace(/[:.]/g, '-')

  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext()
  const page = await context.newPage()
  // Increase default timeouts to handle slower pages/environments
  try {
    page.setDefaultNavigationTimeout(Number(process.env.PW_NAV_TIMEOUT || 60000))
    page.setDefaultTimeout(Number(process.env.PW_TIMEOUT || 60000))
  } catch {}

  const waitForPath = async (frag, timeout = 20000) => {
    await page.waitForFunction((f) => window.location.pathname.includes(f), frag, { timeout })
  }

  try {
    // Sign-in programmatically via NextAuth credentials
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
    if (!result.ok) throw new Error('Sign-in failed: ' + JSON.stringify(result))

    // Navigate to requested path
    await page.goto(`${baseURL}${path}`, { waitUntil: 'domcontentloaded' })
    try { await waitForPath(path, 25000) } catch {}
    await page.waitForLoadState('networkidle')

    // Screenshots
    await page.screenshot({ path: `screenshots/${pageName}-full-${ts}.png`, fullPage: true })
    try {
      await page.locator('main, .container, .space-y-6, .py-8').first().screenshot({ path: `screenshots/${pageName}-main-${ts}.png` })
    } catch {}

    console.log(`Captured ${path} as ${pageName}-{full,main}-${ts}.png`)
  } finally {
    await page.close(); await context.close(); await browser.close()
  }
}

run().catch((e) => { console.error(e); process.exit(1) })
