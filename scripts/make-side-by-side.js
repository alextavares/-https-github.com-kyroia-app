const fs = require('fs')
const path = require('path')
const sharp = require('sharp')

async function sideBySide({ leftPath, rightPath, outPath }) {
  if (!fs.existsSync(leftPath)) throw new Error('Left image not found: ' + leftPath)
  if (!fs.existsSync(rightPath)) throw new Error('Right image not found: ' + rightPath)

  const [leftMeta, rightMeta] = await Promise.all([
    sharp(leftPath).metadata(),
    sharp(rightPath).metadata(),
  ])

  const targetHeight = Math.max(leftMeta.height || 0, rightMeta.height || 0)
  const leftBuf = await sharp(leftPath).resize({ height: targetHeight }).toBuffer()
  const rightBuf = await sharp(rightPath).resize({ height: targetHeight }).toBuffer()
  const leftResized = await sharp(leftBuf).metadata()
  const rightResized = await sharp(rightBuf).metadata()
  const width = (leftResized.width || 0) + (rightResized.width || 0)

  const canvas = await sharp({
    create: { width, height: targetHeight, channels: 4, background: { r: 255, g: 255, b: 255, alpha: 1 } }
  }).png().toBuffer()

  const out = await sharp(canvas)
    .composite([
      { input: leftBuf, left: 0, top: 0 },
      { input: rightBuf, left: leftResized.width || 0, top: 0 },
    ])
    .png()
    .toFile(outPath)

  return outPath
}

async function main() {
  const left = process.env.BEFORE || process.argv[2]
  const right = process.env.AFTER || process.argv[3]
  if (!left || !right) {
    console.error('Usage: node scripts/make-side-by-side.js <left.png> <right.png>')
    process.exit(1)
  }
  const out = process.env.OUT || path.join('screenshots', `compare-${path.basename(left).replace(/\.png$/, '')}__${path.basename(right).replace(/\.png$/, '')}.png`)
  const outAbs = path.resolve(out)
  await sideBySide({ leftPath: path.resolve(left), rightPath: path.resolve(right), outPath: outAbs })
  console.log(JSON.stringify({ ok: true, out: outAbs }))
}

main().catch(e => { console.error(e); process.exit(1) })

