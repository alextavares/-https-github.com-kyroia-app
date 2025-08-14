#!/usr/bin/env node
const { spawn } = require('child_process')

const env = {
  ...process.env,
  NODE_ENV: 'development',
  NEXT_TELEMETRY_DISABLED: '1',
  DATABASE_URL: process.env.DATABASE_URL || 'file:./prisma/prisma/dev.db',
  DEBUG_KEY: process.env.DEBUG_KEY || 'dev',
  APP_URL: process.env.APP_URL || 'http://localhost:3060',
}

console.log('[run-next-3060] Starting Next dev on :3060 with env:', {
  NODE_ENV: env.NODE_ENV,
  DATABASE_URL: env.DATABASE_URL,
  DEBUG_KEY: env.DEBUG_KEY,
  APP_URL: env.APP_URL,
})

const proc = spawn('next', ['dev', '-p', '3060', '-H', '0.0.0.0'], {
  env,
  stdio: 'inherit',
  shell: true,
})

proc.on('exit', (code) => {
  console.log('[run-next-3060] Next dev exited with code', code)
})


