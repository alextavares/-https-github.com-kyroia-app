// Generate a pixel diff between two images of possibly different sizes.
// Usage: node scripts/diff-two-images.js <ref.png> <cur.png> [out.png]
const fs = require('fs')
const path = require('path')
const sharp = require('sharp')
const { PNG } = require('pngjs')
const _pm = require('pixelmatch')
const pixelmatch = (_pm && _pm.default) ? _pm.default : _pm

async function alignToSameSize(refBuf, curBuf, bg = { r: 255, g: 255, b: 255, alpha: 1 }) {
  const refImg = sharp(refBuf)
  const curImg = sharp(curBuf)
  const curMeta = await curImg.metadata()
  const width = curMeta.width || 0
  const height = curMeta.height || 0
  if (!width || !height) throw new Error('Invalid current image size')
  const refResized = await refImg.resize({ width, height, fit: 'contain', background: bg }).png().toBuffer()
  const curPng = await curImg.png().toBuffer()
  return { ref: refResized, cur: curPng, width, height }
}

function writeDiff(refBuf, curBuf, width, height, outPath) {
  const refPng = PNG.sync.read(refBuf)
  const curPng = PNG.sync.read(curBuf)
  const diffPng = new PNG({ width, height })
  const diffPixels = pixelmatch(refPng.data, curPng.data, diffPng.data, width, height, { threshold: 0.1 })
  const outBuf = PNG.sync.write(diffPng)
  fs.writeFileSync(outPath, outBuf)
  return diffPixels
}

async function main() {
  const refPath = process.argv[2]
  const curPath = process.argv[3]
  const outPath = process.argv[4] || path.join('screenshots', `diff-${Date.now()}.png`)
  if (!refPath || !curPath) {
    console.error('Usage: node scripts/diff-two-images.js <ref.png> <cur.png> [out.png]')
    process.exit(1)
  }
  const refBuf = fs.readFileSync(refPath)
  const curBuf = fs.readFileSync(curPath)
  const { ref, cur, width, height } = await alignToSameSize(refBuf, curBuf)
  const pixels = writeDiff(ref, cur, width, height, outPath)
  console.log(JSON.stringify({ ok: true, out: path.resolve(outPath), pixels }))
}

main().catch((e) => { console.error(e); process.exit(1) })

