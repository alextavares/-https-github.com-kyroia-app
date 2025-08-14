#!/usr/bin/env node
const fs = require('fs')
const path = require('path')

function walk(dir) {
  const out = []
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name)
    if (ent.isDirectory()) out.push(...walk(p))
    else out.push(p)
  }
  return out
}

const root = process.cwd()
const appDir = path.join(root, 'app')
const pagesDir = path.join(root, 'pages')

let removed = 0
function safeUnlink(p) {
  try {
    fs.unlinkSync(p)
    console.log('Removed', path.relative(root, p))
    removed++
  } catch (e) {
    console.warn('Failed to remove', p, e.message)
  }
}

// 1) Remove page.jsx if page.tsx exists (under app/**)
if (fs.existsSync(appDir)) {
  const files = walk(appDir)
  const jsxPages = files.filter((f) => /\\page\.jsx$/.test(f) || /\/page\.jsx$/.test(f))
  for (const jsx of jsxPages) {
    const tsx = jsx.replace(/page\.jsx$/, 'page.tsx')
    if (fs.existsSync(tsx)) {
      safeUnlink(jsx)
    }
  }

  // 2) Remove route.js if route.ts exists (under app/api/**)
  const jsRoutes = files.filter((f) => /\\route\.js$/.test(f) || /\/route\.js$/.test(f))
  for (const js of jsRoutes) {
    const ts = js.replace(/route\.js$/, 'route.ts')
    if (fs.existsSync(ts)) {
      safeUnlink(js)
    }
  }
}

// 3) Remove pages/middleware.js if pages/middleware.ts exists
if (fs.existsSync(pagesDir)) {
  const mwJs = path.join(pagesDir, 'middleware.js')
  const mwTs = path.join(pagesDir, 'middleware.ts')
  if (fs.existsSync(mwJs) && fs.existsSync(mwTs)) {
    safeUnlink(mwJs)
  }
}

console.log(`Done. Removed ${removed} duplicate files.`)


