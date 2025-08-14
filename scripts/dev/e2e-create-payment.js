#!/usr/bin/env node
const https = require('https')
const http = require('http')

function httpJson(url, method, body) {
  return new Promise((resolve) => {
    const isHttps = url.startsWith('https://')
    const client = isHttps ? https : http
    const data = body ? JSON.stringify(body) : undefined
    const req = client.request(new URL(url), {
      method,
      headers: data
        ? { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) }
        : {}
    }, (res) => {
      let buf = ''
      res.on('data', (c) => (buf += c))
      res.on('end', () => {
        try { resolve({ status: res.statusCode, json: buf ? JSON.parse(buf) : null }) }
        catch { resolve({ status: res.statusCode, json: null, raw: buf }) }
      })
    })
    req.on('error', (e) => resolve({ status: 0, error: e.message }))
    if (data) req.write(data)
    req.end()
  })
}

async function main() {
  const base = process.env.APP_URL || 'http://localhost:3050'
  const ts = Date.now()
  const email = `dev${ts}@example.com`

  // 1) Create test user
  const userRes = await httpJson(`${base}/api/debug/create-test-user`, 'POST', {
    email,
    password: '123456',
    name: 'Dev'
  })
  console.log('create-user →', userRes.status, userRes.json)
  if (!userRes.json?.user?.id) {
    console.error('Failed to create user')
    process.exit(1)
  }
  const userId = userRes.json.user.id

  // 2) Create payment and auto-complete
  const externalId = `mp_e2e_${ts}`
  const payRes = await httpJson(`${base}/api/debug/create-payment`, 'POST', {
    userId,
    amount: 10,
    currency: 'BRL',
    creditPackageId: null,
    paymentMethod: 'pix',
    provider: 'mercadopago',
    externalId,
    setCompleted: true
  })
  console.log('create-payment →', payRes.status, payRes.json)

  // 3) Query status
  const q = await httpJson(`${base}/api/payments/status?externalId=${encodeURIComponent(externalId)}&userId=${encodeURIComponent(userId)}`, 'GET')
  console.log('status →', q.status, q.json)
}

main().catch((e) => { console.error(e); process.exit(1) })


