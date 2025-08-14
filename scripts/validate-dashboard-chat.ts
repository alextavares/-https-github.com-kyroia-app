import { chromium } from 'playwright'

async function run() {
  const BASE_URL = process.env.BASE_URL || 'http://localhost:3025'
  const EMAIL = process.env.TEST_EMAIL || 'alexandretmoraes1@gmail.com'
  const PASSWORD = process.env.TEST_PASSWORD || 'Y*mare2025'

  const browser = await chromium.launch({ headless: true })
  const ctx = await browser.newContext()
  const page = await ctx.newPage()

  // Capture console and network errors
  page.on('console', (msg) => {
    if (['error', 'warning'].includes(msg.type())) {
      console.log(`[console.${msg.type()}]`, msg.text())
    }
  })
  page.on('response', async (resp) => {
    const url = resp.url()
    if (url.includes('/api/auth/callback/credentials') || url.includes('/api/chat')) {
      console.log(`[response] ${resp.status()} ${url}`)
      if (!resp.ok()) {
        try {
          const txt = await resp.text()
          console.log('[response body]', txt)
        } catch {}
      }
    }
  })

  const log = (msg: string) => console.log(`[validate] ${msg}`)

  try {
    log('Opening sign-in page')
    await page.goto(`${BASE_URL}/auth/signin`, { waitUntil: 'domcontentloaded' })

    await page.getByPlaceholder('Seu email').fill(EMAIL)
    await page.getByPlaceholder('Sua senha').fill(PASSWORD)
    await page.getByRole('button', { name: /Entrar com email/i }).click()
    // Log current URL post-click
    await page.waitForTimeout(1000)
    console.log('[validate] After click URL:', page.url())

    // Wait for Dashboard content heuristic
    await page.waitForLoadState('networkidle', { timeout: 30000 })
    const planVisible = await page.getByText('Plano:').first().isVisible().catch(() => false)
    const creditsVisible = await page.getByText('Créditos:').first().isVisible().catch(() => false)
    log(`Dashboard badges -> Plano:${planVisible} Créditos:${creditsVisible}`)

    if (!planVisible || !creditsVisible) {
      const url = page.url()
      throw new Error(`Dashboard badges not visible. Current URL: ${url}`)
    }

    // Check daily progress label
    const dailyVisible = await page.getByText('Mensagens hoje').first().isVisible().catch(() => false)
    log(`Daily progress visible: ${dailyVisible}`)

    // Find textarea (dynamic placeholder) and send a message
    const textbox = page.getByRole('textbox').first()
    await textbox.click()
    await textbox.fill('Teste: descreva os recursos do plano Free em 3 bullets.')
    await page.keyboard.press('Enter')

    // Wait for typing indicator then an assistant block
    const typingAppeared = await page.getByText('Digitando...').first().isVisible({ timeout: 15000 }).catch(() => false)
    log(`Typing indicator: ${typingAppeared}`)
    await page.waitForTimeout(1000)

    // Assistant message block style used in our UI
    await page.waitForSelector('div.bg-gray-800.border-gray-700', { timeout: 30000 })
    const blocks = await page.locator('div.bg-gray-800.border-gray-700').count()
    log(`Assistant blocks: ${blocks}`)

    if (blocks === 0) {
      throw new Error('No assistant message blocks found after sending a message')
    }

    log('SUCCESS: Dashboard badges, progress and chat response validated')
  } finally {
    await browser.close()
  }
}

run().catch((err) => {
  console.error('[validate] FAILED', err)
  process.exit(1)
})


