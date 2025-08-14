#!/usr/bin/env node
const fs = require('fs')
const path = require('path')

const ROOT = path.join(process.cwd(), 'app', 'api')

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((ent) => {
    const p = path.join(dir, ent.name)
    if (ent.isDirectory()) return walk(p)
    return [p]
  })
}

const files = walk(ROOT)
const jsRoutes = files.filter((f) => f.endsWith('route.js'))

let removed = 0
for (const f of jsRoutes) {
  try {
    fs.unlinkSync(f)
    removed++
    console.log('Removed', path.relative(process.cwd(), f))
  } catch (e) {
    console.error('Failed to remove', f, e.message)
  }
}

console.log(`Done. Removed ${removed} duplicate .js route files.`)


