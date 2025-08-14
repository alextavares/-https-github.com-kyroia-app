#!/usr/bin/env node
const https = require('https')
const http = require('http')

const base = process.env.APP_URL || 'http://localhost:3060'
const packages = [
  { name: '5.000 créditos', credits: 5000, price: 59.00, currency: 'BRL' },
  { name: '10.000 créditos', credits: 10000, price: 99.00, currency: 'BRL' },
  { name: '20.000 créditos', credits: 20000, price: 159.00, currency: 'BRL' },
]

function postJson(url, body) {
  return new Promise((resolve) => {
    const isHttps = url.startsWith('https://')
    const client = isHttps ? https : http
    const data = JSON.stringify(body)
    const req = client.request(new URL(url), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
        'x-debug-key': process.env.DEBUG_KEY || 'dev',
      },
    }, (res) => {
      let buf = ''
      res.on('data', (c) => (buf += c))
      res.on('end', () => {
        try { resolve({ status: res.statusCode, json: JSON.parse(buf) }) }
        catch { resolve({ status: res.statusCode, body: buf }) }
      })
    })
    req.on('error', (e) => resolve({ status: 0, error: e.message }))
    req.write(data)
    req.end()
  })
}

;(async () => {
  for (const pkg of packages) {
    const res = await postJson(`${base}/api/debug/create-credit-package`, pkg)
    console.log('create-credit-package', pkg.name, '→', res.status, res.json || res.body || res.error)
  }
})().catch((e) => { console.error(e); process.exit(1) })


