const fs = require('fs')
const path = require('path')

function list(dir) {
  return fs.existsSync(dir) ? fs.readdirSync(dir) : []
}

function latestWithPrefix(dir, prefix) {
  const files = list(dir)
    .filter((f) => f.startsWith(prefix) && f.endsWith('.png'))
    .map((f) => ({ f, m: fs.statSync(path.join(dir, f)).mtimeMs }))
    .sort((a, b) => b.m - a.m)
  return (files[0] && files[0].f) || null
}

function buildHtml(pairs) {
  const sections = pairs
    .map(
      (p, i) => `
  <section class="pair">
    <h2>${p.title}</h2>
    <div class="row">
      <div class="col"><div class="label">Referência</div><img src="${p.ref}" /></div>
      <div class="col"><div class="label">Atual</div><img src="${p.cur}" /></div>
    </div>
    <div class="overlay" id="pair${i}">
      <div class="label">Overlay (slider)</div>
      <div class="img-container">
        <img src="${p.cur}" class="base" />
        <img src="${p.ref}" class="top" />
        <input type="range" min="0" max="100" value="50" class="slider" oninput="overlay('pair${i}', this.value)" />
      </div>
    </div>
  </section>`
    )
    .join('\n')

  return `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <title>Comparação Visual (Ref × Atual)</title>
  <style>
    body{font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;padding:16px;color:#111;background:#f6f7f9}
    h1{font-size:20px;margin:0 0 8px}
    .row{display:flex;gap:12px}
    .col{flex:1;border:1px solid #ddd;border-radius:8px;padding:8px;background:#fff}
    .label{font-size:12px;color:#555;margin-bottom:4px}
    img{max-width:100%;height:auto;display:block}
    .overlay{margin-top:12px;border:1px solid #ddd;border-radius:8px;padding:8px;background:#fff}
    .img-container{position:relative;width:100%;overflow:hidden}
    .img-container img{display:block;width:100%;height:auto}
    .img-container .top{position:absolute;top:0;left:0;width:50%;border-right:1px solid #f00;mix-blend-mode:difference}
    .img-container .slider{position:absolute;left:0;right:0;bottom:8px;width:40%;margin:0 auto;display:block}
  </style>
</head>
<body>
  <h1>Comparação Visual (Referência × Atual)</h1>
  <p class="note">Use o slider no overlay para comparar.</p>
  ${sections}
  <script>
    function overlay(id, v) {
      var el = document.querySelector('#' + id + ' .top');
      if (el) el.style.width = v + '%';
    }
  </script>
</body>
</html>`
}

function main() {
  const dir = path.resolve('screenshots')
  if (!fs.existsSync(dir)) {
    console.error('screenshots directory not found')
    process.exit(1)
  }

  const files = list(dir)
  const refPages = new Set(
    files
      .filter((f) => f.startsWith('ref-') && f.includes('-full-'))
      .map((f) => f.replace(/^ref-/, '').replace(/-full-.+$/, ''))
  )
  const localPages = new Set(
    files
      .filter((f) => !f.startsWith('ref-') && f.includes('-full-'))
      .map((f) => f.replace(/-full-.+$/, ''))
  )

  const pages = Array.from(refPages).filter((p) => localPages.has(p))
  if (!pages.length) {
    console.error('No pairs found. Ensure you have both ref-*-full and *-full screenshots.')
    process.exit(1)
  }

  const pairs = []
  for (const p of pages) {
    const ref = latestWithPrefix(dir, `ref-${p}-full`)
    const cur = latestWithPrefix(dir, `${p}-full`)
    if (ref && cur) {
      pairs.push({
        title: p,
        ref: `screenshots/${ref}`.replace(/\\/g, '/'),
        cur: `screenshots/${cur}`.replace(/\\/g, '/')
      })
    }
  }
  if (!pairs.length) {
    console.error('No valid pairs could be built from latest files.')
    process.exit(1)
  }

  const html = buildHtml(pairs)
  const out = path.resolve('screenshots', 'compare-report.html')
  fs.writeFileSync(out, html, 'utf-8')
  console.log('Report written:', out)
}

main()
