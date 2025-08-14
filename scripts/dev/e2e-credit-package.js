#!/usr/bin/env node
const https = require('https')
const http = require('http')

function httpJson(url, method, body) {
  return new Promise((resolve) => {
    const isHttps = url.startsWith('https://')
    const client = isHttps ? https : http
    const data = body ? JSON.stringify(body) : undefined
    const headers = { 'x-debug-key': 'dev' }
    if (data) {
      headers['Content-Type'] = 'application/json'
      headers['Content-Length'] = Buffer.byteLength(data)
    }
    const req = client.request(new URL(url), { method, headers }, (res) => {
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
  const base = process.env.APP_URL || 'http://localhost:3060'
  const ts = Date.now()
  const email = `dev${ts}@example.com`

  const user = await httpJson(`${base}/api/debug/create-test-user`, 'POST', {
    email,
    password: '123456',
    name: 'Dev'
  })
  console.log('user →', user.status, user.json?.user?.id)
  if (!user.json?.user?.id) process.exit(1)
  const userId = user.json.user.id

  const pkg = await httpJson(`${base}/api/debug/create-credit-package`, 'POST', {
    name: 'Dev Pack',
    credits: 1234,
    price: 12.34,
    currency: 'BRL'
  })
  console.log('pkg →', pkg.status, pkg.json?.package?.id)
  const packageId = pkg.json?.package?.id
  if (!packageId) process.exit(1)

  const buy = await httpJson(`${base}/api/debug/purchase-credit-package`, 'POST', {
    userId,
    packageId
  })
  console.log('buy →', buy.status, buy.json?.user)

  const bal = await httpJson(`${base}/api/credits/balance`, 'GET')
  console.log('balance →', bal.status, bal.json)
}

main().catch((e) => { console.error(e); process.exit(1) })


