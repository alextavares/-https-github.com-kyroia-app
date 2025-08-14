import { chromium } from 'playwright';

async function main() {
  const base = 'https://faf8b6d5dafe.ngrok-free.app';
  const email = 'test@example.com';
  const password = 'Test123!@#';
  const packageId = 'cme8uw6dz000097u78cn53918';

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  page.on('response', async (resp) => {
    const url = resp.url();
    if (url.includes('/api/payments/mp/checkout/pix')) {
      const status = resp.status();
      let body: string;
      try { body = await resp.text(); } catch { body = '<no body>'; }
      console.log('\n[PIX API RESPONSE]', status, body);
    }
  });

  console.log('Opening sign-in...');
  await page.goto(`${base}/auth/signin`, { waitUntil: 'domcontentloaded' });
  console.log('Landed URL:', page.url());
  try { await page.screenshot({ path: 'pix-signin.png' }); } catch {}
  console.log('After goto URL:', page.url());
  try { console.log('Page title:', await page.title()); } catch {}
  try { console.log('Has email input?', await page.locator('input[name="email"]').count()); } catch {}
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  await page.click('button[type="submit"]');

  await page.waitForURL('**/dashboard**', { timeout: 15000 });
  console.log('Logged in, going to PIX page...');

  await page.goto(`${base}/dashboard/credits/payment/pix?package=${packageId}`, { waitUntil: 'networkidle' });

  // Wait a bit for client to call API
  await page.waitForTimeout(3000);

  // Try to detect QR or error text
  const errorText = await page.locator('text=Erro').first().textContent().catch(() => null);
  const imgCount = await page.locator('img[alt="QR Code PIX"]').count();
  const textArea = page.locator('textarea');
  const copia = await textArea.count() ? await textArea.first().inputValue().catch(() => '') : '';

  console.log('QR visible:', imgCount > 0);
  if (copia) console.log('Copia e cola length:', copia.length);
  if (errorText) console.log('Error text:', errorText);

  await browser.close();
}

main().catch((e) => {
  console.error('Script error:', e);
  process.exit(1);
});
