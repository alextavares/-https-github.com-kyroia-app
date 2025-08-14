#!/usr/bin/env node
const https = require('https')
const http = require('http')

const url = process.env.APP_URL || 'http://localhost:3000'

const payload = {
  type: 'payment',
  data: { id: process.env.MP_ID || 'mp_dev_123', status: process.env.MP_STATUS || 'approved' }
}
if (process.env.MP_PAYER_ID) {
  payload.data.payer = { id: process.env.MP_PAYER_ID }
}

const data = JSON.stringify(payload)
const isHttps = url.startsWith('https://')
const client = isHttps ? https : http

const req = client.request(
  new URL('/api/mercadopago/webhook', url),
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(data)
    }
  },
  (res) => {
    let body = ''
    res.on('data', (c) => (body += c))
    res.on('end', () => {
      console.log('Status:', res.statusCode)
      console.log('Body:', body)
    })
  }
)

req.on('error', (e) => {
  console.error('Request error:', e.message)
})

req.write(data)
req.end()


