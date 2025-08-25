// Scrape the model list from app.innerai.com using Playwright and saved storage state
const { chromium } = require('@playwright/test')
const fs = require('fs')
const path = require('path')

async function scrape() {
  const storageStatePath = path.resolve('ref-storage-state.json')
  const outPath = path.resolve('innerai-scraped-models.json')
  const url = 'https://app.innerai.com/'

  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({ 
    storageState: fs.existsSync(storageStatePath) ? storageStatePath : undefined,
    viewport: { width: 1440, height: 900 }
  })
  const page = await context.newPage()
  page.setDefaultTimeout(45000)

  const candidates = [
    'GPT', 'Claude', 'Gemini', 'Llama', 'Grok', 'Deepseek', 'DeepSeek', 'Qwen', 'GLM', 'Perplexity', 'Sabiá', 'Mistral', 'Nova', 'Amazon'
  ]

  const result = { models: [], rawItems: [], clicked: false, ts: new Date().toISOString() }

  try {
    await page.goto(url, { waitUntil: 'domcontentloaded' })
    try { await page.waitForLoadState('networkidle', { timeout: 15000 }) } catch {}

    // Try to open the model selector: search a button/menu that includes model-like text
    const opened = await page.evaluate((candidates) => {
      const els = Array.from(document.querySelectorAll('button, [role="button"], [aria-label], .cursor-pointer, .select-none'))
      for (const el of els) {
        const t = (el.textContent || '').trim()
        const a = (el.getAttribute('aria-label') || '').trim()
        if (t.length + a.length === 0) continue
        if (candidates.some(s => t.includes(s) || a.includes(s))) {
          (el).click()
          return true
        }
      }
      return false
    }, candidates)
    result.clicked = opened
    if (opened) {
      await page.waitForTimeout(1200)
    }

    // Collect possible model menu items
    const items = await page.evaluate((candidates) => {
      const acc = []
      const nodes = Array.from(document.querySelectorAll('[role="option"], [role="menuitem"], li, div, button'))
      for (const node of nodes) {
        const text = (node.textContent || '').replace(/\s+/g, ' ').trim()
        if (!text) continue
        // Heuristic: lines that mention known model families
        if (candidates.some(s => text.includes(s))) {
          // Split by line breaks or bullets
          text.split(/\n|•|—|\||,/).forEach(part => {
            const p = part.replace(/\s+/g, ' ').trim()
            if (p && candidates.some(s => p.includes(s))) acc.push(p)
          })
        }
      }
      return Array.from(new Set(acc))
    }, candidates)

    result.rawItems = items

    // Normalize to a list of simple names (best-effort)
    const normalized = items
      .map(t => t
        .replace(/\s+\(.+?\)/g, '') // remove parentheses
        .replace(/\s{2,}/g, ' ')
        .trim()
      )
      .filter(t => t.length > 0)

    // Deduplicate while preserving order
    const seen = new Set()
    result.models = normalized.filter(n => (seen.has(n) ? false : (seen.add(n), true)))

    fs.writeFileSync(outPath, JSON.stringify(result, null, 2))
    console.log('✅ Saved model list to:', outPath)
    console.log(result.models)
  } catch (err) {
    console.error('❌ Scrape failed:', err)
    try { fs.writeFileSync(outPath, JSON.stringify(result, null, 2)) } catch {}
    process.exitCode = 1
  } finally {
    await page.close()
    await context.close()
    await browser.close()
  }
}

scrape()

