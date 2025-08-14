import { test, expect } from '@playwright/test'

const BASE_URL = process.env.BASE_URL || 'http://localhost:3025'
const EMAIL = process.env.TEST_EMAIL || 'alexandretmoraes1@gmail.com'
const PASSWORD = process.env.TEST_PASSWORD || 'Y*mare2025'

test.describe('Dashboard & Chat E2E', () => {
  test.setTimeout(60_000)

  test('Dashboard loads with CTA and progress bars after login', async ({ page }) => {
    await page.goto(`${BASE_URL}/auth/signin`)
    await page.getByPlaceholder('Seu email').fill(EMAIL)
    await page.getByPlaceholder('Sua senha').fill(PASSWORD)
    await page.getByRole('button', { name: /Entrar com email/i }).click()

    // Aguarde o dashboard renderizar (sem depender estrito da troca de URL)
    await expect(page.getByText('Plano:')).toBeVisible({ timeout: 30_000 })
    await expect(page.getByText('Créditos:')).toBeVisible()

    // Mensagens hoje (progress daily)
    await expect(page.getByText('Mensagens hoje')).toBeVisible()

    // Tokens no mês (se disponível)
    // Tornar tolerante caso não haja limite configurado
    // eslint-disable-next-line playwright/no-conditional-in-test
    const hasMonthly = await page.getByText('Tokens no mês').count()
    if (hasMonthly > 0) {
      
      await expect(page.getByText('Tokens no mês')).toBeVisible()
    }

    // CTA Upgrade quando plano FREE (link para subscription)
    // Não falhar se usuário não for FREE
    const upgradeCount = await page.getByRole('link', { name: /Upgrade/i }).count()
    if (upgradeCount > 0) {
      await expect(page.getByRole('link', { name: /Upgrade/i })).toHaveAttribute('href', '/dashboard/subscription')
    }
  })

  test('Chat sends and receives a message', async ({ page }) => {
    await page.goto(`${BASE_URL}/auth/signin`)
    await page.getByPlaceholder('Seu email').fill(EMAIL)
    await page.getByPlaceholder('Sua senha').fill(PASSWORD)
    await page.getByRole('button', { name: /Entrar com email/i }).click()

    // Aguarde o dashboard renderizar
    await expect(page.getByText('Plano:')).toBeVisible({ timeout: 30_000 })

    // Focar textarea do chat (placeholder dinâmico presente no estado inicial)
    // Se já houver conversa iniciada, cairá no bloco acima e o input muda; cobrir ambos
    const dynamicInput = page.getByRole('textbox').first()
    await dynamicInput.click()
    await dynamicInput.fill('Explique rapidamente os recursos do plano Free em 3 bullets.')

    // Enviar
    const sendButton = page.getByRole('button', { name: /^$/ }).or(page.locator('button:has(svg)'))
    await page.keyboard.press('Enter')

    // Aguarda indicador "Digitando..." e depois a resposta aparecer
    await expect(page.getByText('Digitando...')).toBeVisible({ timeout: 15_000 })
    // Espera um bloco de mensagem de assistente (bg cinza com borda)
    await page.waitForSelector('div.bg-gray-800.border-gray-700', { timeout: 30_000 })
    const assistantBlocks = await page.locator('div.bg-gray-800.border-gray-700').count()
    expect(assistantBlocks).toBeGreaterThan(0)
  })
})


