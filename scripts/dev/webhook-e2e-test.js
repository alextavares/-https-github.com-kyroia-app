#!/usr/bin/env node
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = 'file:./prisma/prisma/dev.db'
}
const { PrismaClient } = require('@prisma/client')
const https = require('https')
const http = require('http')

async function main() {
  const prisma = new PrismaClient()
  const url = process.env.APP_URL || 'http://localhost:3000'
  const payerId = process.env.TEST_USER_ID || 'dev-user-1'

  // Ensure test user exists
  let user = await prisma.user.findUnique({ where: { id: payerId } })
  if (!user) {
    user = await prisma.user.create({
      data: {
        id: payerId,
        email: `dev+${Date.now()}@example.com`,
        name: 'Dev User',
        password: null
      }
    })
    console.log('Created test user:', user.id)
  } else {
    console.log('Using existing user:', user.id)
  }

  const mpId = process.env.MP_ID || 'mp_e2e_123'
  const payload = {
    type: 'payment',
    data: { id: mpId, status: 'approved', payer: { id: user.id } }
  }
  const data = JSON.stringify(payload)
  const isHttps = url.startsWith('https://')
  const client = isHttps ? https : http

  // Send webhook
  await new Promise((resolve) => {
    const req = client.request(new URL('/api/mercadopago/webhook', url), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) }
    }, (res) => {
      let body = ''
      res.on('data', (c) => (body += c))
      res.on('end', () => {
        console.log('Webhook →', res.statusCode, body)
        resolve()
      })
    })
    req.on('error', (e) => { console.error('Webhook request error:', e.message); resolve() })
    req.write(data)
    req.end()
  })

  // Query payment status
  await new Promise((resolve) => {
    const statusUrl = new URL('/api/payments/status', url)
    statusUrl.searchParams.set('paymentId', mpId)
    statusUrl.searchParams.set('userId', user.id)
    const req = client.request(statusUrl, { method: 'GET' }, (res) => {
      let body = ''
      res.on('data', (c) => (body += c))
      res.on('end', () => {
        console.log('Status →', res.statusCode, body)
        resolve()
      })
    })
    req.on('error', (e) => { console.error('Status request error:', e.message); resolve() })
    req.end()
  })

  await prisma.$disconnect()
}

main().catch((e) => { console.error(e); process.exit(1) })


