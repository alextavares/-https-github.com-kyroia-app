const { chromium } = require('playwright')

async function run() {
  const BASE_URL = process.env.BASE_URL || 'http://localhost:3025'
  const EMAIL = process.env.TEST_EMAIL || 'pro.user@example.com'
  const PASSWORD = process.env.TEST_PASSWORD || 'ProPass#123'

  const browser = await chromium.launch({ headless: true })
  const ctx = await browser.newContext()
  const page = await ctx.newPage()

  const log = (...args) => console.log('[quick-validate]', ...args)

  try {
    // Sign-in via NextAuth credentials API (more robust than UI selectors)
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
        method: 'POST',
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        body: form,
        credentials: 'include'
      })
      let body = null
      try { body = await res.json() } catch {}
      return { ok: res.ok, status: res.status, body }
    }, { email: EMAIL, password: PASSWORD })
    log('sign-in result:', sign)
    if (!sign.ok) throw new Error('Sign-in failed')

    // Go to dashboard and assert we're in
    await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'domcontentloaded' })
    await page.waitForLoadState('networkidle', { timeout: 30000 })
    const onDashboard = (new URL(page.url())).pathname.startsWith('/dashboard')
    log('on dashboard:', onDashboard, page.url())
    if (!onDashboard) throw new Error('Not on dashboard')

    // Heuristic badges
    const planVisible = await page.getByText('Plano:').first().isVisible().catch(() => false)
    const creditsVisible = await page.getByText('Créditos:').first().isVisible().catch(() => false)
    log('badges visible -> plan, credits:', planVisible, creditsVisible)

    // Navigate to chat and send a message
    await page.goto(`${BASE_URL}/dashboard/chat`, { waitUntil: 'domcontentloaded' })
    await page.waitForLoadState('networkidle', { timeout: 30000 })
    // Try generic textbox
    const textbox = page.getByRole('textbox').first()
    await textbox.click({ timeout: 10000 })
    await textbox.fill('Teste rápido: diga “ok” se recebeu esta mensagem.')
    await page.keyboard.press('Enter')

    // Wait for either typing indicator or an assistant block
    let typing = false
    try { typing = await page.getByText('Digitando...').first().isVisible({ timeout: 15000 }) } catch {}
    log('typing indicator:', typing)
    let blocks = 0
    try {
      await page.waitForSelector('div.bg-gray-800.border-gray-700', { timeout: 30000 })
      blocks = await page.locator('div.bg-gray-800.border-gray-700').count()
    } catch {}
    log('assistant blocks:', blocks)

    if (blocks === 0) log('warning: no assistant block detected (pode faltar chave OPENAI/OPENROUTER)')

    console.log('\nOK: sessão válida e navegação do chat verificada.')
  } finally {
    await page.close()
    await ctx.close()
    await browser.close()
  }
}

run().catch((err) => { console.error('[quick-validate] FAILED', err); process.exit(1) })

