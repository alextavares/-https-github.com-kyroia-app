#!/usr/bin/env node

// Worker process that calls the API endpoint to process pending MercadoPago webhooks
// Runs continuously (every minute) on Digital Ocean App Platform

const BASE_URL = process.env.APP_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000';
const WORKER_TOKEN = process.env.WEBHOOK_WORKER_TOKEN || '';

function nowIso() {
  return new Date().toISOString();
}

async function callProcessPending() {
  const url = `${BASE_URL.replace(/\/$/, '')}/api/mercadopago/webhook/process-pending`;
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'x-worker-token': WORKER_TOKEN,
      },
    });

    const text = await res.text();
    let data;
    try { data = JSON.parse(text); } catch { data = text; }

    if (!res.ok) {
      console.error(`[${nowIso()}] Process-pending failed (${res.status}):`, data);
      return;
    }

    console.log(`[${nowIso()}] Processed OK:`, data);
  } catch (err) {
    console.error(`[${nowIso()}] Error calling process-pending:`, err);
  }
}

console.log('Webhook worker started');
console.log(`Base URL: ${BASE_URL}`);
console.log('Will process pending webhooks every minute');

// Run immediately on startup
callProcessPending();

// Schedule to run every minute
setInterval(callProcessPending, 60 * 1000);

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('Webhook worker shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('Webhook worker interrupted, shutting down...');
  process.exit(0);
});