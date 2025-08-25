const sharp = require('sharp')
const fs = require('fs')
const path = require('path')

async function cropCenter(input, out, width) {
  const meta = await sharp(input).metadata()
  const w = meta.width || 0
  const h = meta.height || 0
  const cw = Math.min(width, w)
  const left = Math.max(0, Math.floor((w - cw) / 2))
  await sharp(input).extract({ left, top: 0, width: cw, height: h }).toFile(out)
  return out
}

async function main() {
  const input = process.argv[2]
  const out = process.argv[3] || path.join(path.dirname(input), 'crop-' + path.basename(input))
  const width = Number(process.argv[4] || 800)
  if (!fs.existsSync(input)) throw new Error('Input not found: ' + input)
  const res = await cropCenter(input, out, width)
  console.log(JSON.stringify({ ok: true, out: res }))
}

main().catch(e => { console.error(e); process.exit(1) })

