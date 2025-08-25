const fs = require('fs')
const path = require('path')
const sharp = require('sharp')
const PNG = require('pngjs').PNG
const _pm = require('pixelmatch')
const pixelmatch = (_pm && _pm.default) ? _pm.default : _pm

function latestScreenshot(prefix) {
  const dir = path.resolve('screenshots')
  if (!fs.existsSync(dir)) return null
  const files = fs.readdirSync(dir)
  const matches = files
    .filter(f => f.startsWith(prefix) && f.endsWith('.png'))
    .map(f => ({ f, m: fs.statSync(path.join(dir, f)).mtimeMs }))
    .sort((a, b) => b.m - a.m)
  return matches[0] ? path.join('screenshots', matches[0].f) : null
}

function refPathFromCandidates(candidates, envVarName) {
  // ENV override: allow absolute or relative path
  const override = process.env[envVarName]
  if (override) {
    const abs = path.resolve(override)
    if (fs.existsSync(abs)) return abs
    const relImgRef = path.join('imgreferencia', override)
    if (fs.existsSync(relImgRef)) return relImgRef
    const relShots = path.join('screenshots', override)
    if (fs.existsSync(relShots)) return relShots
  }
  for (const name of candidates) {
    const inImgRef = path.join('imgreferencia', name)
    if (fs.existsSync(inImgRef)) return inImgRef
    const inShots = path.join('screenshots', name)
    if (fs.existsSync(inShots)) return inShots
  }
  return null
}

async function ensureSameSizeBuffers(refBuf, curBuf, bg = { r: 255, g: 255, b: 255, alpha: 1 }) {
  const refImg = sharp(refBuf)
  const curImg = sharp(curBuf)
  const refMeta = await refImg.metadata()
  const curMeta = await curImg.metadata()
  const width = curMeta.width || 0
  const height = curMeta.height || 0
  if (!width || !height) throw new Error('Invalid current image size')
  const refResized = await refImg.resize({ width, height, fit: 'contain', background: bg }).png().toBuffer()
  const curPng = await curImg.png().toBuffer()
  return { ref: refResized, cur: curPng, width, height }
}

function diffToFile(refBuf, curBuf, width, height, outPath) {
  const refPng = PNG.sync.read(refBuf)
  const curPng = PNG.sync.read(curBuf)
  const { data: img1 } = refPng
  const { data: img2 } = curPng
  const diffPng = new PNG({ width, height })
  const diffPixels = pixelmatch(img1, img2, diffPng.data, width, height, { threshold: 0.1 })
  const outBuf = PNG.sync.write(diffPng)
  fs.writeFileSync(outPath, outBuf)
  return diffPixels
}

async function runPair(title, candidates, curPrefix, outBase, envVarName) {
  const ref = refPathFromCandidates(candidates, envVarName)
  const cur = latestScreenshot(curPrefix)
  if (!ref || !cur) {
    console.warn(`[skip] ${title}: missing ref or current`, { ref, cur })
    return null
  }
  const ts = new Date().toISOString().replace(/[:.]/g, '-')
  const out = path.join('screenshots', `${outBase}-diff-${ts}.png`)
  const refBuf = fs.readFileSync(ref)
  const curBuf = fs.readFileSync(cur)
  const { ref: refAligned, cur: curPng, width, height } = await ensureSameSizeBuffers(refBuf, curBuf)
  const pixels = diffToFile(refAligned, curPng, width, height, out)
  console.log(`Diff ${title} → ${out} (pixels diff: ${pixels})`)
  return out
}

async function main() {
  const tasks = [
    runPair(
      'Dashboard',
      ['ref-dashboard-3.jpg', 'ref-dashboard-2.jpg', 'ref-dashboard-1.jpg', 'Screenshot_141.jpg', 'ref-Screenshot_141.jpg'],
      'dashboard-full',
      'dashboard',
      'REF_DASHBOARD'
    ),
    runPair(
      'Chat',
      ['ref-chat-1.jpg', 'ref-chat-2.jpg', 'Screenshot_142.jpg', 'ref-Screenshot_142.jpg'],
      'dashboard-chat-full',
      'chat',
      'REF_CHAT'
    ),
  ]
  await Promise.all(tasks)
}

main().catch((e) => { console.error(e); process.exit(1) })
