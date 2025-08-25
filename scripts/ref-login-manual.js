// Manual login helper: opens a persistent Chromium profile pointing to app.innerai.com.
// You perform the login manually; when ready, press Enter in the terminal.
// The script will save Playwright storageState to the given path and exit.

const { chromium } = require('playwright')
const fs = require('fs')
const path = require('path')

async function waitForEnter(prompt = 'Press Enter to save session and exit...') {
  return new Promise((resolve) => {
    process.stdout.write(`\n${prompt}\n`)
    process.stdin.resume()
    process.stdin.setRawMode && process.stdin.setRawMode(false)
    process.stdin.once('data', () => {
      resolve()
    })
  })
}

async function main() {
  const baseURL = process.env.REF_BASE_URL || 'https://app.innerai.com'
  const allowedHost = new URL(baseURL).hostname
  const outState = process.env.SAVE_REF_STORAGE_STATE || 'ref-storage-state.json'
  const userDataDir = process.env.REF_USER_DATA_DIR || path.resolve('tmp/ref-profile')
  const headless = false

  if (process.env.REF_RESET_PROFILE === '1' && fs.existsSync(userDataDir)) {
    console.log('[ref-login-manual] Resetting profile at', userDataDir)
    try { fs.rmSync(userDataDir, { recursive: true, force: true }) } catch {}
  }
  if (!fs.existsSync(userDataDir)) fs.mkdirSync(userDataDir, { recursive: true })

  const ua = process.env.REF_UA || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
  const viewport = { width: 1280, height: 800 }

  const context = await chromium.launchPersistentContext(userDataDir, {
    headless,
    viewport,
    userAgent: ua,
    args: [
      '--disable-blink-features=AutomationControlled',
      '--no-default-browser-check',
      '--disable-features=IsolateOrigins,site-per-process',
    ],
  })

  // Optionally clear cookies to avoid marketing redirects
  try { await context.clearCookies() } catch {}
  // Close any popup pages opened to other hosts
  context.on('page', async (p) => {
    try {
      const h = new URL(p.url()).hostname
      if (h && h !== allowedHost) {
        console.log('[ref-login-manual] closing popup to', h)
        await p.close().catch(() => {})
      }
    } catch {}
  })

  const page = context.pages()[0] || (await context.newPage())
  await page.goto(`${baseURL}/auth/signin`, { waitUntil: 'domcontentloaded' }).catch(() => {})
  // Clear local/session storage for this origin to avoid forced referrals
  try { await page.evaluate(() => { try { localStorage.clear(); sessionStorage.clear() } catch {} }) } catch {}
  console.log(`[ref-login-manual] Opened: ${page.url()}`)
  console.log('[ref-login-manual] If redirected, manually go to:', `${baseURL}/dashboard`)

  await waitForEnter('After you are logged in and at the dashboard, press Enter here...')

  await context.storageState({ path: outState })
  console.log('[ref-login-manual] storageState saved:', outState, fs.existsSync(outState) ? 'OK' : 'MISSING')

  await context.close()
}

main().catch((e) => { console.error(e); process.exit(1) })
