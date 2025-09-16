#!/usr/bin/env node
const fs = require('fs');
const { spawn } = require('child_process');
const path = require('path');
const os = require('os');
const puppeteer = require('puppeteer');

const PROTOCOL_VERSION = '2024-11-05';

function resolveChromeExecutable() {
  const explicit = (process.env.PUPPETEER_EXECUTABLE_PATH || '').trim();
  const candidates = [];
  if (explicit) {
    candidates.push(explicit);
  }
  try {
    const autoPath = typeof puppeteer.executablePath === 'function' ? puppeteer.executablePath() : null;
    if (autoPath) {
      candidates.push(autoPath);
    }
  } catch (err) {
    // ignore auto detection issues and fall back to known paths
  }
  const platform = process.platform;
  if (platform === 'win32') {
    const localAppData = process.env.LOCALAPPDATA;
    if (localAppData) {
      candidates.push(path.join(localAppData, 'Google', 'Chrome', 'Application', 'chrome.exe'));
      candidates.push(path.join(localAppData, 'Microsoft', 'Edge', 'Application', 'msedge.exe'));
    }
    candidates.push(path.join('C:\Program Files', 'Google', 'Chrome', 'Application', 'chrome.exe'));
    candidates.push(path.join('C:\Program Files (x86)', 'Google', 'Chrome', 'Application', 'chrome.exe'));
  } else if (platform === 'darwin') {
    candidates.push('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome');
    candidates.push('/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge');
  } else {
    const home = os.homedir();
    if (home) {
      candidates.push(path.join(home, '.cache', 'puppeteer', 'chrome', 'linux-138.0.7204.168', 'chrome-linux64', 'chrome'));
    }
    candidates.push('/usr/bin/google-chrome-stable');
    candidates.push('/usr/bin/google-chrome');
    candidates.push('/usr/bin/chromium-browser');
    candidates.push('/usr/bin/chromium');
  }
  const seen = new Set();
  const uniqueCandidates = candidates.filter((candidate) => {
    if (!candidate || seen.has(candidate)) return false;
    seen.add(candidate);
    return true;
  });
  for (const candidate of uniqueCandidates) {
    if (fs.existsSync(candidate)) {
      return { path: candidate, checked: uniqueCandidates };
    }
  }
  return { path: null, checked: uniqueCandidates };
}


async function main() {
  const { path: executablePath, checked: checkedPaths } = resolveChromeExecutable();
  const targetUrl = process.env.MCP_PUPPETEER_URL || 'http://127.0.0.1:3025';
  const screenshotName = process.env.MCP_PUPPETEER_SCREENSHOT || 'mcp-check';


  if (!executablePath) {
    const locations = checkedPaths.length ? checkedPaths.join(', ') : 'no known locations';
    throw new Error(
      `Chrome executable not found. Checked: ${locations}. ` +
        'Run `npx puppeteer browsers install chrome` or set PUPPETEER_EXECUTABLE_PATH.'
    );
  }

  const server = spawn('mcp-server-puppeteer', [], {
    stdio: ['pipe', 'pipe', 'inherit'],
    env: { ...process.env, PUPPETEER_EXECUTABLE_PATH: executablePath },
    shell: process.platform === 'win32'
  });

  let buffer = '';
  const pending = new Map();
  let nextId = 1;
  let closed = false;

  function sendNotification(method, params = {}) {
    if (closed) return;
    server.stdin.write(JSON.stringify({ jsonrpc: '2.0', method, params }) + '\n');
  }

  function sendRequest(method, params = {}) {
    if (closed) return Promise.reject(new Error('Server already closed'));
    const id = nextId++;
    server.stdin.write(JSON.stringify({ jsonrpc: '2.0', id, method, params }) + '\n');
    return new Promise((resolve, reject) => {
      pending.set(id, { resolve, reject, method });
    });
  }

  server.stdout.setEncoding('utf8');
  server.stdout.on('data', chunk => {
    buffer += chunk;
    const lines = buffer.split('\n');
    buffer = lines.pop();
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      let message;
      try {
        message = JSON.parse(trimmed);
      } catch (err) {
        console.error('Failed to parse MCP output:', trimmed);
        continue;
      }
      if (message.id !== undefined && pending.has(message.id)) {
        pending.get(message.id).resolve(message);
        pending.delete(message.id);
      }
    }
  });

  const closeServer = () => {
    if (closed) return;
    closed = true;
    server.stdin.end();
    server.kill();
  };

  server.on('error', err => {
    console.error('mcp-server-puppeteer error:', err.message);
  });

  server.on('exit', (code, signal) => {
    if (!closed && code !== 0) {
      console.error('mcp-server-puppeteer exited', { code, signal });
    }
    closed = true;
  });

  try {
    const init = await sendRequest('initialize', {
      protocolVersion: PROTOCOL_VERSION,
      clientInfo: { name: 'run-mcp-puppeteer-check', version: '1.0.0' },
      capabilities: { resources: {}, tools: {} }
    });
    if (init.error) throw new Error(`initialize failed: ${init.error.message}`);

    sendNotification('initialized', {});

    const tools = await sendRequest('tools/list');
    const toolNames = tools?.result?.tools?.map(tool => tool.name) ?? [];
    if (!toolNames.includes('puppeteer_navigate') || !toolNames.includes('puppeteer_screenshot')) {
      throw new Error(`Expected puppeteer tools not available. Tools: ${toolNames.join(', ')}`);
    }

    const navigate = await sendRequest('tools/call', {
      name: 'puppeteer_navigate',
      arguments: { url: targetUrl, launchOptions: { headless: 'new' } }
    });
    if (navigate.error) throw new Error(`navigate failed: ${navigate.error.message}`);
    console.log(navigate.result?.content?.[0]?.text ?? 'Navigation succeeded');

    const screenshot = await sendRequest('tools/call', {
      name: 'puppeteer_screenshot',
      arguments: { name: screenshotName, width: 1280, height: 720, encoded: false }
    });
    if (screenshot.error) throw new Error(`screenshot failed: ${screenshot.error.message}`);
    console.log(screenshot.result?.content?.[0]?.text ?? 'Screenshot captured');

    if (screenshot.result?.content?.some(item => item.type === 'image')) {
      console.log('Screenshot resource available via MCP resource list.');
    }
  } finally {
    closeServer();
  }
}

main().catch(err => {
  console.error(err.message);
  process.exitCode = 1;
});
