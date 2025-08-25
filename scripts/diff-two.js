// Diff two image files (png/jpg/webp) and write result to screenshots/diffs
// Usage: node scripts/diff-two.js path/to/current.jpg path/to/reference.jpg

const fs = require('fs')
const path = require('path')
const sharp = require('sharp')
const PNG = require('pngjs').PNG
const _pm = require('pixelmatch')
const pixelmatch = (_pm && _pm.default) ? _pm.default : _pm

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

async function main() {
  const curPath = process.argv[2]
  const refPath = process.argv[3]
  if (!curPath || !refPath) {
    console.error('Usage: node scripts/diff-two.js <current> <reference>')
    process.exit(1)
  }
  const curBuf = fs.readFileSync(curPath)
  const refBuf = fs.readFileSync(refPath)
  const { ref, cur, width, height } = await ensureSameSizeBuffers(refBuf, curBuf)
  const outDir = path.resolve('screenshots/diffs')
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true })
  const ts = new Date().toISOString().replace(/[:.]/g, '-')
  const base = path.basename(curPath, path.extname(curPath))
  const out = path.join(outDir, `${base}-manual-diff-${ts}.png`)
  const pixels = diffToFile(ref, cur, width, height, out)
  console.log(`Diff saved: ${out} (pixels: ${pixels})`)
}

main().catch((e) => { console.error(e); process.exit(1) })

