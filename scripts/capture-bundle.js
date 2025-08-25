const { spawn } = require('child_process')

const ROUTES = (process.env.ROUTES && process.env.ROUTES.split(',')) || [
  '/dashboard',
  '/dashboard/chat',
  '/dashboard/models',
  '/dashboard/templates',
  '/dashboard/history',
  '/dashboard/credits',
  '/dashboard/subscription',
  '/dashboard/settings',
  '/dashboard/profile',
  '/dashboard/knowledge',
]

async function runOne(route) {
  return new Promise((resolve) => {
    const child = spawn(process.execPath, ['scripts/capture-page.js', route], {
      stdio: 'inherit',
      env: process.env,
    })
    child.on('exit', (code) => resolve(code === 0))
  })
}

async function main() {
  console.log('Starting capture bundle for routes:', ROUTES.join(', '))
  let okAll = true
  for (const r of ROUTES) {
    console.log(`\n--- Capturing ${r} ---`)
    // eslint-disable-next-line no-await-in-loop
    const ok = await runOne(r)
    if (!ok) {
      okAll = false
      console.warn(`Capture failed for ${r}`)
    }
  }
  console.log('\nBundle complete. Success:', okAll)
  process.exit(okAll ? 0 : 1)
}

main().catch((e) => { console.error(e); process.exit(1) })

