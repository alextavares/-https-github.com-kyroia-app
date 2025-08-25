const { createWorker } = require('tesseract.js')
const fs = require('fs')
const path = require('path')

async function main() {
  const img = process.argv[2] || 'screenshots/Screenshot_205.jpg'
  const p = path.resolve(img)
  if (!fs.existsSync(p)) {
    console.error('Image not found:', p)
    process.exit(1)
  }
  const worker = await createWorker()
  await worker.loadLanguage('eng+por')
  await worker.initialize('eng+por')
  const { data } = await worker.recognize(p)
  await worker.terminate()
  const lines = (data.lines || []).map(l => ({ text: l.text.trim(), conf: l.confidence }))
    .filter(l => l.text && l.conf > 60)
  console.log(JSON.stringify({ ok: true, lines }, null, 2))
}

main().catch(e => { console.error(e); process.exit(1) })

