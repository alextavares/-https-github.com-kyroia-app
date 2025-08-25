const { execFileSync } = require('child_process')

function runNode(script) {
  execFileSync(process.execPath, [script], { stdio: 'inherit', env: process.env })
}

function main() {
  // Step 1: capture frames (respects FRAME_INTERVAL_MS and MAX_CAPTURE_MS)
  runNode('scripts/capture-chat-stream.js')

  // Step 2: animate (respects ANIM_FORMAT and ANIM_FPS)
  const out = execFileSync(process.execPath, ['scripts/make-chat-gif.js'], { encoding: 'utf8' })
  process.stdout.write(out)
}

try {
  main()
} catch (e) {
  console.error('capture-and-animate failed:', e.message || e)
  process.exit(1)
}

