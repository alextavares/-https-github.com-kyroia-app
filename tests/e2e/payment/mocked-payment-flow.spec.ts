import { test, expect } from '@playwright/test'
import { AuthHelpers } from '../../helpers/auth.helpers'

test.describe('Mocked Payment Flow (no real keys)', () => {
  test('card checkout via MercadoPago mocked to success', async ({ page }) => {
    const helpers = new AuthHelpers(page)

    // Login (test user must exist according to your test fixtures)
    await helpers.login('test@example.com', 'Test123!@#')
    await helpers.waitForSuccessfulLogin()

    // Intercept MercadoPago checkout to redirect to local success page
    await page.route('**/api/mercadopago/checkout', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ url: '/payment/success?payment_id=mock&status=approved' }),
      })
    })

    // Go to pricing and select Pro
    await page.goto('/pricing')
    await expect(page.getByRole('heading', { name: /Escolha o plano/i })).toBeVisible()
    await page.getByRole('button', { name: /Assinar Pro/i }).click()

    // On checkout, keep default method (cartão) and finalize
    await expect(page).toHaveURL(/\/checkout\?/) 
    await page.getByRole('button', { name: /Finalizar Pagamento/i }).click()

    // We should land on local success page (mocked)
    await page.waitForURL(/\/payment\/success/)
    await expect(page.getByRole('heading', { name: /Pagamento Aprovado/i })).toBeVisible()

    // Optionally go to Dashboard
    await page.getByRole('button', { name: /Ir para o Dashboard/i }).click()
    await expect(page).toHaveURL(/\/dashboard/)
  })

  test('PIX flow mocked to success', async ({ page }) => {
    const helpers = new AuthHelpers(page)
    await helpers.login('test@example.com', 'Test123!@#')
    await helpers.waitForSuccessfulLogin()

    await page.route('**/api/mercadopago/checkout', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ url: '/payment/success?payment_id=mock_pix&status=approved' }),
      })
    })

    await page.goto('/pricing')
    await page.getByRole('button', { name: /Assinar Pro/i }).click()
    await expect(page).toHaveURL(/\/checkout\?/) 
    await page.getByLabel('Pix').click()
    await page.getByRole('button', { name: /Finalizar Pagamento/i }).click()
    await page.waitForURL(/\/payment\/success/)
    await expect(page.getByRole('heading', { name: /Pagamento Aprovado/i })).toBeVisible()
  })

  test('Boleto flow mocked to success', async ({ page }) => {
    const helpers = new AuthHelpers(page)
    await helpers.login('test@example.com', 'Test123!@#')
    await helpers.waitForSuccessfulLogin()

    await page.route('**/api/mercadopago/checkout', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ url: '/payment/success?payment_id=mock_bol&status=approved' }),
      })
    })

    await page.goto('/pricing')
    await page.getByRole('button', { name: /Assinar Pro/i }).click()
    await expect(page).toHaveURL(/\/checkout\?/) 
    await page.getByLabel('Boleto Bancário').click()
    await page.getByRole('button', { name: /Finalizar Pagamento/i }).click()
    await page.waitForURL(/\/payment\/success/)
    await expect(page.getByRole('heading', { name: /Pagamento Aprovado/i })).toBeVisible()
  })
})
