const fs = require('fs')
const path = require('path')
const sharp = require('sharp')

function findLatestPrefix(dir, basePrefix) {
  const files = fs.readdirSync(dir).filter(f => f.startsWith(basePrefix) && f.endsWith('.png'))
  if (!files.length) return null
  // basePrefix like 'chat-stream-<timestamp>-' → extract timestamp part
  const groups = new Map()
  for (const f of files) {
    const m = f.match(/^(chat-stream-\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}-\d{3}Z)-\d{3}\.png$/)
    if (m) {
      const key = m[1]
      const arr = groups.get(key) || []
      arr.push(f)
      groups.set(key, arr)
    }
  }
  if (!groups.size) return null
  // pick the group with most recent timestamp (lexicographically matches chronological due ISO format)
  const keys = Array.from(groups.keys()).sort().reverse()
  const latestKey = keys[0]
  const frames = groups.get(latestKey).sort((a,b)=>a.localeCompare(b))
  return { key: latestKey, frames }
}

async function makeAnimation({ dir = 'screenshots', pattern = 'chat-stream' }) {
  const absDir = path.resolve(dir)
  if (!fs.existsSync(absDir)) throw new Error(`Directory not found: ${absDir}`)
  const latest = findLatestPrefix(absDir, pattern)
  if (!latest) throw new Error('No frames found')
  const delays = []
  const inputs = latest.frames.map(() => ({ delay: 100 })) // 100ms default
  const framePaths = latest.frames.map(f => path.join(absDir, f))
  const outBase = path.join(absDir, `${latest.key}-anim`)

  // Try GIF
  try {
    const gifOut = `${outBase}.gif`
    const frames = framePaths.map((p, i) => ({ input: fs.readFileSync(p), delay: inputs[i].delay }))
    const gif = await sharp(frames, { animated: true }).gif({ effort: 3, loop: 0 })
    await gif.toFile(gifOut)
    return { ok: true, type: 'gif', out: gifOut, frames: framePaths.length }
  } catch (e) {
    // Fallback to animated WebP
    const webpOut = `${outBase}.webp`
    const frames = framePaths.map((p, i) => ({ input: fs.readFileSync(p), delay: inputs[i].delay }))
    const webp = await sharp(frames, { animated: true }).webp({ quality: 90, loop: 0 })
    await webp.toFile(webpOut)
    return { ok: true, type: 'webp', out: webpOut, frames: framePaths.length, note: 'gif-not-supported-fallback' }
  }
}

makeAnimation({}).then(r => {
  console.log(JSON.stringify(r, null, 2))
}).catch(err => {
  console.error('Animation failed:', err.message || err)
  process.exit(1)
})

