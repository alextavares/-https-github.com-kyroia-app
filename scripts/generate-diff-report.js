const fs = require('fs')
const path = require('path')

function latestScreenshot(prefix) {
  const dir = path.resolve('screenshots')
  const files = fs.existsSync(dir) ? fs.readdirSync(dir) : []
  const matches = files
    .filter(f => f.startsWith(prefix) && f.endsWith('.png'))
    .map(f => ({ f, m: fs.statSync(path.join(dir, f)).mtimeMs }))
    .sort((a, b) => b.m - a.m)
  return matches[0] ? `screenshots/${matches[0].f}` : null
}

function existingRef(name) {
  const p = path.resolve('screenshots', name)
  return fs.existsSync(p) ? `screenshots/${name}` : null
}

function buildPair(title, refPath, curPath) {
  if (!refPath || !curPath) return null
  return { title, ref: refPath.replace(/\\/g, '/'), cur: curPath.replace(/\\/g, '/') }
}

function htmlForPair(p, idx) {
  const id = `pair${idx}`
  return `
  <section class="pair">
    <h2>${p.title}</h2>
    <div class="row">
      <div class="col">
        <div class="label">Referência</div>
        <img src="${p.ref}" alt="ref" />
      </div>
      <div class="col">
        <div class="label">Atual</div>
        <img src="${p.cur}" alt="current" />
      </div>
    </div>
    <div class="overlay" id="${id}">
      <div class="label">Overlay (arraste o slider)</div>
      <div class="img-container">
        <img src="${p.cur}" class="base" />
        <img src="${p.ref}" class="top" />
        <input type="range" min="0" max="100" value="50" class="slider" oninput="overlay('${id}', this.value)" />
      </div>
    </div>
  </section>`
}

function buildHtml(pairs) {
  const sections = pairs.map(htmlForPair).join('\n')
  return `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <title>Diff Visual - Relatório</title>
  <style>
    body { font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif; padding: 16px; color: #111; }
    h1 { font-size: 20px; margin-bottom: 8px; }
    h2 { font-size: 16px; margin: 16px 0 8px; }
    .row { display: flex; gap: 12px; }
    .col { flex: 1; border: 1px solid #ddd; border-radius: 8px; padding: 8px; background:#fff }
    .label { font-size: 12px; color: #555; margin-bottom: 4px; }
    img { max-width: 100%; height: auto; display:block; }
    .overlay { margin-top: 12px; border: 1px solid #ddd; border-radius: 8px; padding: 8px; background:#fff }
    .img-container { position: relative; width: 100%; overflow: hidden; }
    .img-container img { display:block; width:100%; height:auto; }
    .img-container .base { filter: none; }
    .img-container .top { position: absolute; top:0; left:0; width:50%; height:auto; border-right: 1px solid #f00; mix-blend-mode: difference; }
    .img-container .slider { position: absolute; left:0; right:0; bottom:8px; width: 40%; margin: 0 auto; display:block; }
    .note { font-size: 12px; color: #666; margin-top: 4px; }
  </style>
</head>
<body>
  <h1>Diff Visual (referência × atual)</h1>
  <p class="note">Dica: use o slider no overlay para comparar. O modo difference ajuda a evidenciar mudanças de layout/cores.</p>
  ${sections}
  <script>
    function overlay(id, percent) {
      const el = document.querySelector('#'+id+' .top');
      if (el) el.style.width = percent + '%';
    }
  </script>
</body>
</html>`
}

function main() {
  const pairs = []
  const ref1 = existingRef('ref-Screenshot_141.jpg')
  const ref2 = existingRef('ref-Screenshot_142.jpg')
  const dash = latestScreenshot('dashboard-full')
  const chat = latestScreenshot('chat-full')
  const knowledge = latestScreenshot('knowledge-full')
  if (ref1 && dash) pairs.push(buildPair('Dashboard (ref_141 × atual)', ref1, dash))
  if (ref2 && chat) pairs.push(buildPair('Chat (ref_142 × atual)', ref2, chat))
  if (knowledge && dash) pairs.push(buildPair('Knowledge (atual × dashboard atual)', knowledge, dash))

  const validPairs = pairs.filter(Boolean)
  if (!validPairs.length) {
    console.error('No pairs found to compare. Ensure ref images and screenshots exist.')
    process.exit(1)
  }
  const html = buildHtml(validPairs)
  const out = path.resolve('screenshots', 'diff-report.html')
  fs.writeFileSync(out, html, 'utf-8')
  console.log('Diff report saved to', out)
}

main()

