const fs = require('fs')
const path = require('path')
const sharp = require('sharp')
const { PNG } = require('pngjs')

function readPng(filepath) {
  const buf = fs.readFileSync(filepath)
  return PNG.sync.read(buf)
}

function findHotspots(diffPath, gridCols = 8, gridRows = 6, pixelThreshold = 0.02) {
  const png = readPng(diffPath)
  const { width, height, data } = png
  const cellW = Math.floor(width / gridCols)
  const cellH = Math.floor(height / gridRows)
  const hotspots = []
  for (let r = 0; r < gridRows; r++) {
    for (let c = 0; c < gridCols; c++) {
      const x0 = c * cellW
      const y0 = r * cellH
      const x1 = c === gridCols - 1 ? width : (c + 1) * cellW
      const y1 = r === gridRows - 1 ? height : (r + 1) * cellH
      let changed = 0
      const total = (x1 - x0) * (y1 - y0)
      for (let y = y0; y < y1; y++) {
        for (let x = x0; x < x1; x++) {
          const idx = (y * width + x) * 4
          const rCh = data[idx]
          const gCh = data[idx + 1]
          const bCh = data[idx + 2]
          const aCh = data[idx + 3]
          // If any color present and visible alpha, count as changed
          if (aCh > 0 && (rCh > 16 || gCh > 16 || bCh > 16)) changed++
        }
      }
      if (changed / total >= pixelThreshold) {
        hotspots.push({ x: x0, y: y0, w: x1 - x0, h: y1 - y0 })
      }
    }
  }
  return { width, height, hotspots }
}

async function ensureSameHeight(buffers) {
  const metas = await Promise.all(buffers.map((b) => sharp(b).metadata()))
  const targetH = Math.max(...metas.map((m) => m.height || 0))
  const resized = await Promise.all(
    buffers.map((b) => sharp(b).resize({ height: targetH }).png().toBuffer())
  )
  const widths = await Promise.all(resized.map((b) => sharp(b).metadata().then((m) => m.width || 0)))
  return { resized, targetH, widths }
}

function svgOverlay(width, height, rects, labels = []) {
  const rectEls = rects
    .map((r) => `<rect x="${r.x}" y="${r.y}" width="${r.w}" height="${r.h}" fill="none" stroke="#ff0066" stroke-width="2" />`)
    .join('')
  const labelEls = labels
    .map((l) => `<text x="${l.x}" y="${l.y}" font-family="Arial, sans-serif" font-size="20" fill="#111" stroke="#fff" stroke-width="0.8">${l.text}</text>`)
    .join('')
  const svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">${rectEls}${labelEls}</svg>`
  return Buffer.from(svg)
}

async function threeUp({ refPath, localPath, diffPath, outPath }) {
  if (!fs.existsSync(refPath)) throw new Error('Missing ref: ' + refPath)
  if (!fs.existsSync(localPath)) throw new Error('Missing local: ' + localPath)
  if (!fs.existsSync(diffPath)) throw new Error('Missing diff: ' + diffPath)

  const [refBuf, localBuf, diffBuf] = [refPath, localPath, diffPath].map((p) => fs.readFileSync(p))
  const { resized, targetH, widths } = await ensureSameHeight([refBuf, localBuf, diffBuf])
  const [refRes, localRes, diffRes] = resized
  const [wRef, wLocal, wDiff] = widths
  const totalW = wRef + wLocal + wDiff

  // Analyze hotspots based on diff resized image
  const tmpDiffPng = PNG.sync.write(PNG.sync.read(diffRes)) // ensure PNG data for pngjs
  const tmpPath = path.join(process.cwd(), '.tmp-threeup-diff.png')
  fs.writeFileSync(tmpPath, tmpDiffPng)
  const { hotspots } = findHotspots(tmpPath)
  fs.unlinkSync(tmpPath)

  // Build composite canvas
  const canvas = await sharp({ create: { width: totalW, height: targetH, channels: 4, background: { r: 255, g: 255, b: 255, alpha: 1 } } }).png().toBuffer()
  let img = sharp(canvas)
    .composite([
      { input: refRes, left: 0, top: 0 },
      { input: localRes, left: wRef, top: 0 },
      { input: diffRes, left: wRef + wLocal, top: 0 },
    ])

  // Build overlay with hotspots replicated over all three sections
  const overlayRects = []
  hotspots.forEach((r) => {
    // on ref
    overlayRects.push({ x: r.x, y: r.y, w: r.w, h: r.h })
    // on local
    overlayRects.push({ x: wRef + r.x, y: r.y, w: r.w, h: r.h })
    // on diff
    overlayRects.push({ x: wRef + wLocal + r.x, y: r.y, w: r.w, h: r.h })
  })

  const labels = [
    { x: 16, y: 28, text: 'REF' },
    { x: wRef + 16, y: 28, text: 'LOCAL' },
    { x: wRef + wLocal + 16, y: 28, text: 'DIFF' },
  ]
  const svg = svgOverlay(totalW, targetH, overlayRects, labels)
  img = img.composite([{ input: svg, left: 0, top: 0 }])

  await img.png().toFile(outPath)
  return outPath
}

async function main() {
  const ref = process.env.REF || process.argv[2]
  const local = process.env.LOCAL || process.argv[3]
  const diff = process.env.DIFF || process.argv[4]
  if (!ref || !local || !diff) {
    console.error('Usage: node scripts/make-three-up.js <ref.png> <local.png> <diff.png>')
    process.exit(1)
  }
  const out = process.env.OUT || path.join('screenshots', `compare-3up-${Date.now()}.png`)
  const outAbs = path.resolve(out)
  const res = await threeUp({ refPath: path.resolve(ref), localPath: path.resolve(local), diffPath: path.resolve(diff), outPath: outAbs })
  console.log(JSON.stringify({ ok: true, out: res }))
}

main().catch((e) => { console.error(e); process.exit(1) })

