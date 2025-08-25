const { createWorker } = require('tesseract.js')
const fs = require('fs')
const path = require('path')
const sharp = require('sharp')

function norm(s) {
  return (s || '')
    .toLowerCase()
    .normalize('NFD').replace(/\p{Diacritic}+/gu, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ') // collapse
    .trim()
}

const TARGETS = [
  'geracao de imagens',
  'transcrever video',
  'traducao de texto',
  'gerar video com edicao de imagem',
]

function matchLine(text) {
  const n = norm(text)
  return TARGETS.some(t => n.includes(t)) ||
    // tolerate slight OCR variations
    (n.includes('geracao') && n.includes('imagens')) ||
    (n.includes('transcrever') && n.includes('video')) ||
    (n.includes('traducao') && n.includes('texto')) ||
    (n.includes('gerar') && n.includes('video') && n.includes('imagem'))
}

async function cropByOcr(inputPath, outPath) {
  const worker = await createWorker()
  await worker.loadLanguage('eng+por')
  await worker.initialize('eng+por')
  const { data } = await worker.recognize(inputPath)
  await worker.terminate()
  const words = (data.words || []).filter(w => (w.confidence || w.conf || 0) > 55)
  const KEYS = ['geracao','imagens','transcrever','video','traducao','texto','gerar','edicao','imagem']
  const matched = words.filter(w => {
    const n = norm(w.text || '')
    return KEYS.some(k => n.includes(k))
  })
  if (!matched.length) throw new Error('No matching words found in OCR')
  // Union bbox
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity
  for (const l of matched) {
    const b = l.bbox || l.box || l.bbl || l
    const left = b.x0 ?? b.x ?? b.left ?? 0
    const top = b.y0 ?? b.y ?? b.top ?? 0
    const right = b.x1 ?? (b.x0 + b.w) ?? (left + (b.width || 0))
    const bottom = b.y1 ?? (b.y0 + b.h) ?? (top + (b.height || 0))
    x0 = Math.min(x0, left)
    y0 = Math.min(y0, top)
    x1 = Math.max(x1, right)
    y1 = Math.max(y1, bottom)
  }
  // Expand padding to include cards area around titles
  const pad = 120
  const img = sharp(inputPath)
  const meta = await img.metadata()
  const W = meta.width || 0
  const H = meta.height || 0
  const cx0 = Math.max(0, Math.floor(x0 - pad))
  const cy0 = Math.max(0, Math.floor(y0 - pad))
  const cw = Math.min(W - cx0, Math.floor((x1 - x0) + pad * 2))
  const ch = Math.min(H - cy0, Math.floor((y1 - y0) + pad * 2))
  await img.extract({ left: cx0, top: cy0, width: cw, height: ch }).toFile(outPath)
  return { out: outPath, bbox: { x0: cx0, y0: cy0, w: cw, h: ch } }
}

async function main() {
  const input = process.argv[2] || 'screenshots/Screenshot_205.jpg'
  const out = process.argv[3] || path.join('screenshots', 'ref-4cards-crop.png')
  const absIn = path.resolve(input)
  const absOut = path.resolve(out)
  if (!fs.existsSync(absIn)) {
    console.error('Input not found:', absIn)
    process.exit(1)
  }
  const res = await cropByOcr(absIn, absOut)
  console.log(JSON.stringify({ ok: true, ...res }))
}

main().catch(e => { console.error(e); process.exit(1) })
