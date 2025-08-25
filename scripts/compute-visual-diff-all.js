// Compute visual diffs for all captured routes by pairing
// screenshots/ref-<slug>-full-*.png with screenshots/<slug>-full-*.png
// Outputs per-route diff images and a JSON/CSV summary with metrics.

const fs = require('fs')
const path = require('path')
const sharp = require('sharp')
const { PNG } = require('pngjs')
const _pm = require('pixelmatch')
const pixelmatch = (_pm && _pm.default) ? _pm.default : _pm

function listPng(dir) {
  return fs.existsSync(dir) ? fs.readdirSync(dir).filter(f => f.endsWith('.png')) : []
}

function latestByPrefix(dir, prefix) {
  const files = listPng(dir)
    .filter(f => f.startsWith(prefix))
    .map(f => ({ f, m: fs.statSync(path.join(dir, f)).mtimeMs }))
    .sort((a, b) => b.m - a.m)
  return files.length ? path.join(dir, files[0].f) : null
}

function extractSlugFromRef(filename) {
  // filename like: ref-dashboard-chat-full-2025-...png
  const m = filename.match(/^ref-(.+)-full-/)
  return m ? m[1] : null
}

async function alignToCurrentSize(refBuf, curBuf) {
  const refImg = sharp(refBuf)
  const curImg = sharp(curBuf)
  const curMeta = await curImg.metadata()
  const width = curMeta.width || 0
  const height = curMeta.height || 0
  if (!width || !height) throw new Error('Invalid current image size')
  const refResized = await refImg.resize({ width, height, fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } }).png().toBuffer()
  const curPng = await curImg.png().toBuffer()
  return { ref: refResized, cur: curPng, width, height }
}

function computeDiff(refBuf, curBuf, width, height) {
  const refPng = PNG.sync.read(refBuf)
  const curPng = PNG.sync.read(curBuf)
  const diffPng = new PNG({ width, height })
  const diffPixels = pixelmatch(refPng.data, curPng.data, diffPng.data, width, height, { threshold: 0.1 })
  const outBuf = PNG.sync.write(diffPng)
  return { diffPixels, outBuf }
}

async function main() {
  const dir = path.resolve('screenshots')
  if (!fs.existsSync(dir)) {
    console.error('screenshots directory not found')
    process.exit(1)
  }
  const nowTs = new Date().toISOString().replace(/[:.]/g, '-')
  const files = listPng(dir)
  const refFiles = files.filter(f => f.startsWith('ref-') && f.includes('-full-'))
  const slugs = Array.from(new Set(refFiles.map(extractSlugFromRef).filter(Boolean)))
  if (!slugs.length) {
    console.error('No reference screenshots found (ref-*-full-*.png).')
    process.exit(1)
  }

  const results = []
  for (const slug of slugs) {
    const refPath = latestByPrefix(dir, `ref-${slug}-full-`)
    const curPath = latestByPrefix(dir, `${slug}-full-`)
    if (!refPath || !curPath) {
      console.warn(`[skip] Missing pair for slug=${slug}`, { refPath, curPath })
      continue
    }
    const refBuf = fs.readFileSync(refPath)
    const curBuf = fs.readFileSync(curPath)
    const { ref, cur, width, height } = await alignToCurrentSize(refBuf, curBuf)
    const { diffPixels, outBuf } = computeDiff(ref, cur, width, height)
    const totalPixels = width * height
    const diffPercent = totalPixels ? (diffPixels / totalPixels) * 100 : 0
    const outName = `diff-${slug}-${nowTs}.png`
    const outPath = path.join(dir, outName)
    fs.writeFileSync(outPath, outBuf)
    results.push({ slug, refPath: path.relative(process.cwd(), refPath), curPath: path.relative(process.cwd(), curPath), diffPath: path.relative(process.cwd(), outPath), width, height, diffPixels, totalPixels, diffPercent: Number(diffPercent.toFixed(3)) })
    console.log(`Diff ${slug} → ${outName} | ${diffPixels}/${totalPixels} pixels (${diffPercent.toFixed(2)}%)`)
  }

  if (!results.length) {
    console.error('No pairs processed.')
    process.exit(2)
  }

  // Save JSON and CSV
  const jsonPath = path.join(dir, 'visual-diff-summary.json')
  fs.writeFileSync(jsonPath, JSON.stringify({ generatedAt: new Date().toISOString(), results }, null, 2), 'utf-8')
  const csvHeader = 'slug,width,height,diff_pixels,total_pixels,diff_percent,ref_path,cur_path,diff_path\n'
  const csvBody = results.map(r => [r.slug, r.width, r.height, r.diffPixels, r.totalPixels, r.diffPercent, r.refPath, r.curPath, r.diffPath].join(','))
  const csvPath = path.join(dir, 'visual-diff-summary.csv')
  fs.writeFileSync(csvPath, csvHeader + csvBody.join('\n'), 'utf-8')
  console.log('Summary:', jsonPath, csvPath)
}

main().catch((e) => { console.error(e); process.exit(1) })

