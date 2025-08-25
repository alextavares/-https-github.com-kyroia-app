const { chromium } = require('playwright')

async function run() {
  const baseURL = process.env.BASE_URL || 'http://localhost:3025'
  const email = process.env.TEST_EMAIL || 'test@example.com'
  const password = process.env.TEST_PASSWORD || 'Test@123456'
  const ts = new Date().toISOString().replace(/[:.]/g, '-')

  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext()
  const page = await context.newPage()

  const waitForPath = async (frag, timeout = 15000) => {
    await page.waitForFunction((f) => window.location.pathname.includes(f), frag, { timeout })
  }

  try {
    await page.goto(`${baseURL}/auth/signin`, { waitUntil: 'domcontentloaded' })
    // Programmatic NextAuth credentials sign-in to set cookies reliably
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

    await page.goto(`${baseURL}/dashboard/knowledge`, { waitUntil: 'domcontentloaded' })
    try { await waitForPath('/dashboard/knowledge', 20000) } catch {}
    await page.waitForLoadState('networkidle')

    await page.screenshot({ path: `screenshots/knowledge-full-${ts}.png`, fullPage: true })
    try {
      await page.locator('main, .container, .py-8, .space-y-6').first().screenshot({ path: `screenshots/knowledge-main-${ts}.png` })
    } catch {}

    console.log('Knowledge screenshots saved. Email:', email)
  } finally {
    await page.close(); await context.close(); await browser.close()
  }
}

run().catch((e) => { console.error(e); process.exit(1) })

