const fs = require('fs')
const path = require('path')
const { execFileSync } = require('child_process')

function findLatestPrefix(dir) {
  const files = fs.readdirSync(dir).filter(f => /^chat-stream-.*-\d{3}\.png$/.test(f))
  if (!files.length) throw new Error('No chat-stream frames found in ' + dir)
  const groups = {}
  for (const f of files) {
    const m = f.match(/^(chat-stream-[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}-[0-9]{2}-[0-9]{2}-[0-9]{3}Z)-[0-9]{3}\.png$/)
    if (m) groups[m[1]] = (groups[m[1]] || 0) + 1
  }
  const keys = Object.keys(groups).sort()
  if (!keys.length) throw new Error('No chat-stream groups found')
  return keys[keys.length - 1]
}

function ensureFfmpeg() {
  try {
    const out = execFileSync('ffmpeg', ['-version'], { encoding: 'utf8' })
    if (!out.includes('ffmpeg version')) throw new Error('ffmpeg not found')
  } catch (e) {
    throw new Error('ffmpeg is required to generate GIFs')
  }
}

async function main() {
  const dir = path.resolve('screenshots')
  if (!fs.existsSync(dir)) throw new Error('Directory not found: ' + dir)
  const prefix = findLatestPrefix(dir)
  ensureFfmpeg()

  const inputPattern = path.join(dir, `${prefix}-%03d.png`)
  const fps = String(process.env.ANIM_FPS || 10)
  const format = String(process.env.ANIM_FORMAT || 'gif').toLowerCase()

  if (format === 'webp') {
    const outWebp = path.join(dir, `${prefix}-anim.webp`)
    // Animated WebP
    execFileSync('ffmpeg', ['-y', '-framerate', fps, '-i', inputPattern, '-c:v', 'libwebp', '-loop', '0', '-qscale', '80', outWebp], { stdio: 'ignore' })
    console.log(JSON.stringify({ ok: true, out: outWebp, prefix, format, fps: Number(fps) }, null, 2))
    return
  }

  // Default: GIF with palette for better colors
  const palette = path.join('/tmp', 'palette.png')
  const outGif = path.join(dir, `${prefix}-anim.gif`)
  execFileSync('ffmpeg', ['-y', '-framerate', fps, '-i', inputPattern, '-vf', 'palettegen', palette], { stdio: 'ignore' })
  execFileSync('ffmpeg', ['-y', '-framerate', fps, '-i', inputPattern, '-i', palette, '-lavfi', 'paletteuse', outGif], { stdio: 'ignore' })
  console.log(JSON.stringify({ ok: true, out: outGif, prefix, format: 'gif', fps: Number(fps) }, null, 2))
}

main().catch((e) => { console.error(JSON.stringify({ ok: false, error: String(e.message || e) })); process.exit(1) })
