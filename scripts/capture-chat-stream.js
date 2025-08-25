const { chromium } = require('playwright')

async function run() {
  const BASE_URL = process.env.BASE_URL || 'http://localhost:3025'
  const EMAIL = process.env.TEST_EMAIL || 'pro.user@example.com'
  const PASSWORD = process.env.TEST_PASSWORD || 'ProPass#123'
  const INTERVAL_MS = Number(process.env.FRAME_INTERVAL_MS || 500)
  const MAX_MS = Number(process.env.MAX_CAPTURE_MS || 10000)

  const browser = await chromium.launch({ headless: true })
  const ctx = await browser.newContext()
  const page = await ctx.newPage()
  const ts = new Date().toISOString().replace(/[:.]/g, '-')

  try {
    await page.goto(`${BASE_URL}/auth/signin`, { waitUntil: 'domcontentloaded' })
    const sign = await page.evaluate(async ({ email, password }) => {
      const getJson = async (url) => (await fetch(url, { credentials: 'include' })).json()
      const csrf = await getJson('/api/auth/csrf')
      const form = new URLSearchParams()
      form.set('csrfToken', csrf.csrfToken)
      form.set('email', email)
      form.set('password', password)
      form.set('json', 'true')
      const res = await fetch('/api/auth/callback/credentials?json=true', {
        method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' }, body: form, credentials: 'include'
      })
      let body = null; try { body = await res.json() } catch {}
      return { ok: res.ok, status: res.status, body }
    }, { email: EMAIL, password: PASSWORD })
    if (!sign.ok) throw new Error('sign-in failed')

    await page.goto(`${BASE_URL}/dashboard/chat`, { waitUntil: 'domcontentloaded' })
    await page.waitForLoadState('networkidle', { timeout: 30000 })

    const textbox = page.getByRole('textbox').first()
    await textbox.click({ timeout: 10000 })
    await textbox.fill('Teste de streaming: responda com uma frase curta e amigável.')
    await page.keyboard.press('Enter')

    const start = Date.now()
    let frame = 0
    while (Date.now() - start < MAX_MS) {
      await page.screenshot({ path: `screenshots/chat-stream-${ts}-${String(frame).padStart(3,'0')}.png`, fullPage: true })
      await page.waitForTimeout(INTERVAL_MS)
      frame++
    }

    console.log(`Frames salvos em screenshots/chat-stream-${ts}-NNN.png (total ${frame})`)
  } finally {
    await page.close(); await ctx.close(); await browser.close()
  }
}

run().catch((e) => { console.error('Stream capture failed:', e); process.exit(1) })

