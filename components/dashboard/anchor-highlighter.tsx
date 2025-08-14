"use client"

import { useEffect } from 'react'

export function AnchorHighlighter() {
  useEffect(() => {
    let timeout1: ReturnType<typeof setTimeout> | null = null
    let timeout2: ReturnType<typeof setTimeout> | null = null

    const run = () => {
      const raw = typeof window !== 'undefined' ? window.location.hash : ''
      const id = raw ? decodeURIComponent(raw.replace(/^#/, '')) : ''
      if (!id) return
      const el = document.getElementById(id)
      if (!el) return

      try {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' })
        const classes = ['ring-2', 'ring-amber-400', 'animate-pulse']
        el.classList.add(...classes)
        timeout1 = setTimeout(() => {
          el.classList.remove('animate-pulse')
        }, 2000)
        timeout2 = setTimeout(() => {
          el.classList.remove(...classes)
        }, 4000)
      } catch {}
    }

    run()
    const onHashChange = () => run()
    window.addEventListener('hashchange', onHashChange)

    return () => {
      window.removeEventListener('hashchange', onHashChange)
      if (timeout1) clearTimeout(timeout1)
      if (timeout2) clearTimeout(timeout2)
    }
  }, [])

  return null
}


