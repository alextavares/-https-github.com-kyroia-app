// Compare latest pairs from screenshots/current and screenshots/reference
// Pairs by prefix: 'dashboard-full', 'dashboard-chat-full', 'models-selector-open'

const fs = require('fs')
const path = require('path')
const sharp = require('sharp')
const PNG = require('pngjs').PNG
const _pm = require('pixelmatch')
const pixelmatch = (_pm && _pm.default) ? _pm.default : _pm

const CURRENT_DIR = path.resolve('screenshots/current')
const REF_DIR = path.resolve('screenshots/reference')
const OUT_DIR = path.resolve('screenshots/diffs')
const SUPPORTED_EXT = ['.png', '.jpg', '.jpeg', '.webp']

function ensureDir(p) {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true })
}

function latestByPrefix(dir, prefix) {
  if (!fs.existsSync(dir)) return null
  const files = fs
    .readdirSync(dir)
    .filter(f => f.startsWith(prefix) && SUPPORTED_EXT.includes(path.extname(f).toLowerCase()))
  if (!files.length) return null
  const withMtime = files.map(f => ({ f, m: fs.statSync(path.join(dir, f)).mtimeMs }))
  withMtime.sort((a, b) => b.m - a.m)
  return path.join(dir, withMtime[0].f)
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

function ts() {
  return new Date().toISOString().replace(/[:.]/g, '-')
}

async function runPair(name) {
  const cur = latestByPrefix(CURRENT_DIR, name)
  const ref = latestByPrefix(REF_DIR, name.startsWith('ref-') ? name : `ref-${name}`)
  if (!cur || !ref) {
    console.warn(`[skip] ${name}: missing cur or ref`, { cur, ref })
    return null
  }
  const outPath = path.join(OUT_DIR, `${name}-diff-${ts()}.png`)
  const refBuf = fs.readFileSync(ref)
  const curBuf = fs.readFileSync(cur)
  const { ref: refAligned, cur: curPng, width, height } = await ensureSameSizeBuffers(refBuf, curBuf)
  const pixels = diffToFile(refAligned, curPng, width, height, outPath)
  console.log(`Diff ${name} → ${outPath} (pixels diff: ${pixels})`)
  return outPath
}

async function main() {
  ensureDir(OUT_DIR)
  const tasks = []
  // Known pairs
  tasks.push(
    runPair('dashboard-full'),
    runPair('dashboard-chat-full'),
    runPair('models-selector-open'),
  )

  // Generic pairs by basename (e.g., 0.jpg in current and reference)
  try {
    const curFiles = fs.existsSync(CURRENT_DIR) ? fs.readdirSync(CURRENT_DIR) : []
    const refFiles = fs.existsSync(REF_DIR) ? fs.readdirSync(REF_DIR) : []
    const curBases = new Set(
      curFiles
        .filter(f => SUPPORTED_EXT.includes(path.extname(f).toLowerCase()))
        .map(f => path.basename(f, path.extname(f)))
    )
    const refBases = new Set(
      refFiles
        .filter(f => SUPPORTED_EXT.includes(path.extname(f).toLowerCase()))
        .map(f => path.basename(f, path.extname(f)))
    )
    // Intersect
    const common = [...curBases].filter(b => refBases.has(b))
    for (const base of common) {
      // Skip if base already covered by known prefixes
      if (['dashboard-full', 'dashboard-chat-full', 'models-selector-open', `ref-dashboard-full`, `ref-dashboard-chat-full`, `ref-models-selector-open`].includes(base)) continue
      tasks.push((async () => {
        const cur = latestByPrefix(CURRENT_DIR, base)
        const ref = latestByPrefix(REF_DIR, base)
        if (!cur || !ref) return null
        const outPath = path.join(OUT_DIR, `${base}-diff-${ts()}.png`)
        const refBuf = fs.readFileSync(ref)
        const curBuf = fs.readFileSync(cur)
        const { ref: refAligned, cur: curPng, width, height } = await ensureSameSizeBuffers(refBuf, curBuf)
        const pixels = diffToFile(refAligned, curPng, width, height, outPath)
        console.log(`Diff ${base} → ${outPath} (pixels diff: ${pixels})`)
        return outPath
      })())
    }
  } catch (e) {
    console.warn('[diff:v2] generic pair scan failed:', e.message)
  }

  await Promise.all(tasks)
}

main().catch((e) => { console.error(e); process.exit(1) })
