const { chromium } = require('playwright')

async function main() {
  const baseURL = process.env.BASE_URL || 'http://localhost:3025'
  const email = process.env.TEST_EMAIL || 'pro.user@example.com'
  const password = process.env.TEST_PASSWORD || 'ProPass#123'

  const browser = await chromium.launch({ headless: true })
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await ctx.newPage()
  try {
    await page.goto(`${baseURL}/auth/signin`, { waitUntil: 'domcontentloaded' })
    const result = await page.evaluate(async ({ email, password }) => {
      const getJson = async (url) => (await fetch(url, { credentials: 'include' })).json()
      const csrf = await getJson('/api/auth/csrf')
      const form = new URLSearchParams()
      form.set('csrfToken', csrf.csrfToken)
      form.set('email', email)
      form.set('password', password)
      form.set('json', 'true')
      const res = await fetch('/api/auth/callback/credentials?json=true', { method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' }, body: form, credentials: 'include' })
      try { return { ok: res.ok, status: res.status, body: await res.json() } } catch { return { ok: res.ok, status: res.status } }
    }, { email, password })
    if (!result.ok) throw new Error('Login failed')

    await page.goto(`${baseURL}/dashboard/chat`, { waitUntil: 'domcontentloaded' })
    await page.waitForLoadState('networkidle').catch(()=>{})
    // Enviar uma mensagem com quote para renderizar mensagens
    const textbox = page.getByRole('textbox').first()
    await textbox.click({ timeout: 15000 })
    await textbox.fill('> This is a quoted line.\nNow continue with normal content for comparison.')
    await page.keyboard.press('Enter')
    // Aguardar container de mensagens e um pequeno tempo para stream
    await page.waitForSelector('main div.space-y-3', { timeout: 30000 })
    await page.waitForTimeout(3000)
    // Adicionar mais uma mensagem normal para variar densidade
    await textbox.fill('Agora uma mensagem normal para comparar com o quote.')
    await page.keyboard.press('Enter')
    await page.waitForTimeout(2500)
    const container = page.locator('main div.space-y-3').first()
    await container.screenshot({ path: 'screenshots/chat-messages-after.png' })
  } finally {
    await ctx.close(); await browser.close()
  }
}

main().catch(e => { console.error(e); process.exit(1) })
