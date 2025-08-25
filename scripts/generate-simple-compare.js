const fs = require('fs')
const path = require('path')

function latest(dir, prefix) {
  const files = fs.existsSync(dir) ? fs.readdirSync(dir) : []
  const matches = files.filter(f => f.startsWith(prefix) && f.endsWith('.png'))
  if (!matches.length) return null
  matches.sort((a,b)=> fs.statSync(path.join(dir,b)).mtimeMs - fs.statSync(path.join(dir,a)).mtimeMs)
  return path.join(dir, matches[0])
}

function main() {
  const ref = latest(path.resolve('screenshots','ref-innerai'), 'external-')
  const cur = latest(path.resolve('screenshots'), 'local-')
  if (!ref || !cur) {
    console.error('Missing images. Ref:', ref, 'Cur:', cur)
    process.exit(1)
  }
  const html = `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <title>Comparação: InnerAI × Local</title>
  <style>
    body{font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;padding:16px;color:#111;background:#f6f7f9}
    h1{font-size:20px;margin:0 0 12px}
    .row{display:flex;gap:12px}
    .col{flex:1;border:1px solid #ddd;border-radius:8px;padding:8px;background:#fff}
    .label{font-size:12px;color:#555;margin-bottom:4px}
    img{max-width:100%;height:auto;display:block}
  </style>
  </head>
  <body>
    <h1>Comparação: InnerAI × Local</h1>
    <div class="row">
      <div class="col"><div class="label">InnerAI (ref)</div><img src="${path.relative(process.cwd(), ref).replace(/\\\\/g,'/')}" /></div>
      <div class="col"><div class="label">Projeto local</div><img src="${path.relative(process.cwd(), cur).replace(/\\\\/g,'/')}" /></div>
    </div>
  </body>
  </html>`
  const out = path.resolve('screenshots','compare-innerai-local.html')
  fs.writeFileSync(out, html, 'utf-8')
  console.log('Report written:', out)
}

main()
