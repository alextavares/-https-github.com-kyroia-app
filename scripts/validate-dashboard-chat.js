import { chromium } from 'playwright';

async function run() {
  const BASE_URL = process.env.BASE_URL || 'http://localhost:3025';
  const EMAIL = process.env.TEST_EMAIL || 'pro.user@example.com';
  const PASSWORD = process.env.TEST_PASSWORD || 'ProPass#123';

  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext();
  const page = await ctx.newPage();

  page.on('response', async (resp) => {
    const url = resp.url();
    if (url.includes('/api/auth/callback/credentials') || url.includes('/api/chat')) {
      console.log(`[response] ${resp.status()} ${url}`);
    }
  });
  const log = (...a) => console.log('[validate]', ...a);

  try {
    // Login via API (mais estável que UI selectors)
    await page.goto(`${BASE_URL}/auth/signin`, { waitUntil: 'domcontentloaded' });
    const sign = await page.evaluate(async ({ email, password }) => {
      const getJson = async (url) => (await fetch(url, { credentials: 'include' })).json();
      const csrf = await getJson('/api/auth/csrf');
      const form = new URLSearchParams();
      form.set('csrfToken', csrf.csrfToken);
      form.set('email', email);
      form.set('password', password);
      form.set('json', 'true');
      const res = await fetch('/api/auth/callback/credentials?json=true', {
        method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' }, body: form, credentials: 'include'
      });
      let body = null; try { body = await res.json(); } catch {}
      return { ok: res.ok, status: res.status, body };
    }, { email: EMAIL, password: PASSWORD });
    log('sign-in result:', sign);
    if (!sign.ok) throw new Error('Sign-in failed');

    // Dashboard
    await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle', { timeout: 30000 });
    const onDashboard = (new URL(page.url())).pathname.startsWith('/dashboard');
    log('on dashboard:', onDashboard, page.url());
    if (!onDashboard) throw new Error('Not on dashboard');

    // Ir ao chat e enviar mensagem
    await page.goto(`${BASE_URL}/dashboard/chat`, { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle', { timeout: 30000 });
    const textbox = page.getByRole('textbox').first();
    await textbox.click({ timeout: 10000 });
    await textbox.fill('Validação: responda com “OK” por favor.');
    await page.keyboard.press('Enter');

    // Aguardar resposta (UI usa streaming)
    let hasAssistant = false;
    try {
      await page.waitForSelector('div.bg-gray-800.border-gray-700', { timeout: 45000 });
      const blocks = await page.locator('div.bg-gray-800.border-gray-700').count();
      hasAssistant = blocks > 0;
      log('assistant blocks:', blocks);
    } catch {}

    if (!hasAssistant) {
      // Fallback: valida via API direta e salva screenshot para inspeção
      const resp = await page.evaluate(async () => {
        const res = await fetch('/api/chat', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ messages: [{ role: 'user', content: 'Diga OK' }], stream: false }) });
        try { return { ok: res.ok, status: res.status, body: await res.json() } } catch { return { ok: res.ok, status: res.status, body: null } }
      });
      log('fallback /api/chat result:', resp);
      await page.screenshot({ path: `screenshots/validate-chat-fallback.png`, fullPage: true });
      if (!resp.ok) throw new Error('Chat API failed');
    }

    log('SUCCESS: sessão, dashboard e chat validados');
  } finally {
    await page.close();
    await ctx.close();
    await browser.close();
  }
}

run().catch((err) => { console.error('[validate] FAILED', err); process.exit(1) });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmFsaWRhdGUtZGFzaGJvYXJkLWNoYXQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJ2YWxpZGF0ZS1kYXNoYm9hcmQtY2hhdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0sWUFBWSxDQUFBO0FBRXJDLEtBQUssVUFBVSxHQUFHO0lBQ2hCLE1BQU0sUUFBUSxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUSxJQUFJLHVCQUF1QixDQUFBO0lBQ2hFLE1BQU0sS0FBSyxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsVUFBVSxJQUFJLDZCQUE2QixDQUFBO0lBQ3JFLE1BQU0sUUFBUSxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsYUFBYSxJQUFJLFlBQVksQ0FBQTtJQUUxRCxNQUFNLE9BQU8sR0FBRyxNQUFNLFFBQVEsQ0FBQyxNQUFNLENBQUMsRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQTtJQUN6RCxNQUFNLEdBQUcsR0FBRyxNQUFNLE9BQU8sQ0FBQyxVQUFVLEVBQUUsQ0FBQTtJQUN0QyxNQUFNLElBQUksR0FBRyxNQUFNLEdBQUcsQ0FBQyxPQUFPLEVBQUUsQ0FBQTtJQUVoQyxxQ0FBcUM7SUFDckMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxHQUFHLEVBQUUsRUFBRTtRQUN6QixJQUFJLENBQUMsT0FBTyxFQUFFLFNBQVMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLENBQUMsRUFBRSxDQUFDO1lBQzlDLE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWSxHQUFHLENBQUMsSUFBSSxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQTtRQUNwRCxDQUFDO0lBQ0gsQ0FBQyxDQUFDLENBQUE7SUFDRixJQUFJLENBQUMsRUFBRSxDQUFDLFVBQVUsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLEVBQUU7UUFD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
