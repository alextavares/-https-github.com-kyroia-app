import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Use puppeteer (full) when available, fallback to puppeteer-core + env path
let puppeteer: any
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  puppeteer = require('puppeteer')
} catch {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  puppeteer = require('puppeteer-core')
}

// PPTX (opcional) — carregado dinamicamente
let PptxGenJS: any
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  PptxGenJS = require('pptxgenjs')
} catch {}


function sanitizeFileName(name: string) {
  return name.replace(/[^a-z0-9\-_. ]/gi, '_')
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions as any)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const searchParams = req.nextUrl.searchParams
    const format = (searchParams.get('format') || 'pdf').toLowerCase()
    const ratioStr = (searchParams.get('ratio') || '16:9').toLowerCase()
    const [rw, rh] = (() => { const m = ratioStr.split(':').map(Number); return (m.length===2 && m[0]>0 && m[1]>0) ? m : [16,9] })()
    const baseWidth = 1280
    const heightCalc = Math.round(baseWidth * (rh / rw))

    const pres = await prisma.presentation.findUnique({
      where: { id: params.id },
      include: {
        slides: { orderBy: { index: 'asc' }, select: { index: true, contentJson: true, htmlCode: true } },
      },
    })

    if (!pres || pres.userId !== session.user.id) {
      return NextResponse.json({ error: 'Apresentação não encontrada' }, { status: 404 })
    }
    if (!pres.slides || pres.slides.length === 0) {
      return NextResponse.json({ error: 'Nenhum slide para exportar' }, { status: 400 })
    }

    // Montar HTML com todas as páginas e tokens de tema
    const t = getThemeTokens(pres.theme || 'modern-light')
    // Montar HTML com todas as páginas (ajusta por ratio)
    const slidesHtml = pres.slides
      .sort((a, b) => a.index - b.index)
      .map((s) => {
        const body = s.htmlCode || safeSlideFromJson(s.contentJson, ratioStr, pres.theme || 'modern-light')
        return `<section class="slide">${body}</section>`
      })
      .join('\n')

    const html = `<!doctype html>
<html lang="pt-br">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(pres.title)} — Export</title>
    <style>
      @page { size: ${baseWidth}px ${heightCalc}px; margin: 0; }
      html, body { margin: 0; padding: 0; background: #${t.bgHex}; }
      .slide {
        width: ${baseWidth}px; height: ${heightCalc}px; box-sizing: border-box; background: #${t.bgHex}; color: #${t.fgHex};
        page-break-after: always; display: flex; align-items: stretch; justify-content: stretch;
      }
      /* Garantir que conteúdos relativos a fontes fiquem legíveis */
      * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    </style>
  </head>
  <body>
    ${slidesHtml}
  </body>
</html>`

    if (format === 'html') {
      const filename = sanitizeFileName(`${pres.title || 'apresentacao'}.html`)
      return new NextResponse(html, {
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Content-Disposition': `attachment; filename="${filename}"`,
          'Cache-Control': 'no-store',
        },
      })
    }

    if (format === 'pptx') {
      if (!PptxGenJS) {
        return NextResponse.json({ error: 'Exportação PPTX indisponível (instale pptxgenjs)' }, { status: 500 })
      }

      const pptx = new PptxGenJS()
      pptx.title = pres.title || 'Apresentação'
      try {
        pptx.layout = (rw===16 && rh===9) ? 'LAYOUT_16x9' : (rw===4 && rh===3) ? 'LAYOUT_4x3' : 'LAYOUT_WIDE'
      } catch {}
      const t = getThemeTokens(pres.theme || 'modern-light')

      const parsedSlides = pres.slides
        .sort((a, b) => a.index - b.index)
        .map((s) => ({ raw: s, json: (()=>{ try { return JSON.parse(s.contentJson) } catch { return null } })() }))
        .filter((x) => Boolean(x.json)) as Array<{ raw: { index: number; contentJson: string }; json: { elements: any[]; layout?: string; citations?: Array<{ url: string; title?: string }> } }>

      for (const item of parsedSlides) {
        const s = item.json
        const slide = pptx.addSlide()
        try { slide.background = { color: t.bgHex } } catch {}
        let y = 0.6
        const x = 0.7
        const maxWidth = 8.6

        // Layout-aware PPTX: title-cover tries background image
        const els = Array.isArray(s.elements) ? s.elements : []
        const heading = els.find((e:any)=>e?.type==='heading')
        const subtitle = els.find((e:any)=>e?.type==='subtitle')
        const bullets = els.find((e:any)=>e?.type==='bullets')
        const image = els.find((e:any)=>e?.type==='image')
        const layoutRaw = (s.layout || '') as string
        const layout = (!layoutRaw || layoutRaw === 'auto') ? recommendLayout(ratioStr, item.raw.contentJson) : layoutRaw

        if (layout === 'title-cover' && image?.source?.url) {
          try {
            const b64 = await fetchImageBase64(image.source.url)
            if (b64) {
              slide.background = { data: b64 }
              // Centered text overlay
              const centerW = 9.0
              const centerX = (10 - centerW) / 2
              slide.addText(heading?.text || '', { x: centerX, y: 2.5, w: centerW, h: 1.2, align: 'center', fontSize: 36, bold: true, color: t.fgHex, fontFace: t.headingFont })
              if (subtitle?.text) slide.addText(subtitle.text, { x: centerX, y: 3.5, w: centerW, h: 0.8, align: 'center', fontSize: 18, color: t.fgHex, fontFace: t.bodyFont })
              continue
            }
          } catch {}
        }

        // Two-columns layout
        const twoCols = layout === 'bullets-left-media-right' || layout === 'media-left-bullets-right'
        if (twoCols) {
          const imageFirst = layout === 'media-left-bullets-right'
          const marginX = 0.7
          const marginY = 0.7
          const gap = 0.3
          const totalW = 10 - 2 * marginX
          let leftW = totalW / 2
          let rightW = totalW / 2
          if (rw === 16 && rh === 9) { leftW = totalW * 0.6; rightW = totalW * 0.4 }
          if (rw === 4 && rh === 3) { leftW = totalW * 0.5; rightW = totalW * 0.5 }
          // Account for gap
          rightW = rightW - gap
          const leftX = marginX
          const rightX = marginX + leftW + gap
          // Dynamic vertical space based on slide ratio (width ~ 10in). Reserve footer space.
          const slideH = 10 * (rh / rw)
          const reservedFooter = 0.4
          const availableH = Math.max(1.8, slideH - 2 * marginY - reservedFooter)

          // Renderers
          const renderTextCol = (xPos: number, wPos: number) => {
            let yPos = marginY
            if (heading?.text) {
              slide.addText(heading.text, { x: xPos, y: yPos, w: wPos, fontSize: 28, bold: true, color: t.fgHex, fontFace: t.headingFont })
              yPos += 0.8
            }
            if (subtitle?.text) {
              slide.addText(subtitle.text, { x: xPos, y: yPos, w: wPos, fontSize: 16, color: t.mutedHex, fontFace: t.bodyFont })
              yPos += 0.6
            }
            if (Array.isArray(bullets?.items) && bullets.items.length) {
              const indent = 0.18
              const numbered = isNumberedList(bullets.items)
              // Reduce font size when many bullets
              const count = bullets.items.length
              let bulletSize = 14
              if (count > 8) bulletSize = 12
              if (count > 12) bulletSize = 11
              const maxLen = bulletSize <= 11 ? 90 : bulletSize <= 12 ? 100 : 120
              const items = bullets.items.map((s: any) => truncateBullet(String(s ?? ''), maxLen))
              slide.addText(items, {
                x: xPos + indent,
                y: yPos,
                w: Math.max(0.5, wPos - indent),
                fontSize: bulletSize,
                color: t.fgHex,
                bullet: numbered ? { type: 'number' } : true,
                fontFace: t.bodyFont,
                align: 'left',
                paraSpaceAfter: 6,
                lineSpacing: 120,
              })
            }
          }
          const renderImageCol = async (xPos: number, wPos: number) => {
            if (!image?.source?.url) return
            const b64 = await fetchImageBase64(image.source.url)
            if (!b64) return
            try { await slide.addImage({ data: b64, x: xPos, y: marginY, w: wPos, h: availableH }) } catch {}
          }

          if (!imageFirst) {
            renderTextCol(leftX, leftW)
            await renderImageCol(rightX, rightW)
          } else {
            await renderImageCol(leftX, leftW)
            renderTextCol(rightX, rightW)
          }
          continue
        }

        // Fallback: linear text
        for (const el of els) {
          if (el.type === 'heading' && typeof el.text === 'string') {
            slide.addText(el.text, { x, y, w: maxWidth, fontSize: 36, bold: true, color: t.fgHex, fontFace: t.headingFont })
            y += 0.9
          } else if (el.type === 'subtitle' && typeof el.text === 'string') {
            slide.addText(el.text, { x, y, w: maxWidth, fontSize: 18, color: t.mutedHex, fontFace: t.bodyFont })
            y += 0.6
          } else if (el.type === 'bullets' && Array.isArray(el.items)) {
            const numbered = isNumberedList(el.items)
            const count = el.items.length
            let bulletSize = 16
            if (count > 8) bulletSize = 14
            if (count > 12) bulletSize = 12
            const maxLen = bulletSize <= 12 ? 120 : 160
            const items = el.items.map((s: any) => truncateBullet(String(s ?? ''), maxLen))
            slide.addText(items, { x, y, w: maxWidth, fontSize: bulletSize, color: t.fgHex, bullet: numbered ? { type: 'number' } : true, fontFace: t.bodyFont, paraSpaceAfter: 6, lineSpacing: 120 })
            y += Math.max(0.5, el.items.length * 0.35)
          } else if (el.type === 'image') {
            const desc = el?.source?.query || el?.source?.url || el?.source?.id || 'Imagem'
            slide.addText(`Imagem: ${desc}`, { x, y, w: maxWidth, fontSize: 12, color: t.mutedHex, italic: true, fontFace: t.bodyFont })
            y += 0.4
          }
          if (y > 4.8) y = 4.8
        }

        // Rodapé com citações
        const cites = Array.isArray((s as any).citations) ? (s as any).citations as Array<{ url: string; title?: string }> : []
        if (cites.length > 0) {
          const maxCites = 3
          const text = 'Fontes: ' + cites.slice(0, maxCites).map(c => (c.title ? `${c.title}` : c.url)).join(' | ')
          slide.addText(text, { x: 0.6, y: 5.2, w: 9.2, fontSize: 10, color: t.mutedHex, fontFace: t.bodyFont })
        }
      }

      const nodeBuffer: Buffer = await pptx.write('nodebuffer')
      const filename = sanitizeFileName(`${pres.title || 'apresentacao'}.pptx`)
      return new NextResponse(nodeBuffer, {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
          'Content-Disposition': `attachment; filename="${filename}"`,
          'Cache-Control': 'no-store',
        },
      })
    }


    // Gera PDF com Puppeteer
    const launchOpts: any = {
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    }
    if (process.env.PUPPETEER_EXECUTABLE_PATH) {
      launchOpts.executablePath = process.env.PUPPETEER_EXECUTABLE_PATH
    }

    const browser = await puppeteer.launch(launchOpts)
    const page = await browser.newPage()
    await page.setContent(html, { waitUntil: 'networkidle0' })
    const pdfBuffer = await page.pdf({
      width: `${baseWidth}px`,
      height: `${heightCalc}px`,
      printBackground: true,
      preferCSSPageSize: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
    })
    await browser.close()

    const filename = sanitizeFileName(`${pres.title || 'apresentacao'}.pdf`)
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-store',
      },
    })
  } catch (err: any) {
    console.error('export pdf error', err)
    return NextResponse.json({ error: 'Falha ao exportar PDF' }, { status: 500 })
  }
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' } as any)[c])
}

function safeSlideFromJson(contentJson: string | null, ratioStr: string, themeId: string): string {
  const t = getThemeTokens(themeId || 'modern-light')
  if (!contentJson) return '<div style="padding:32px;font-family:Inter,system-ui,Arial;">(vazio)</div>'
  try {
    const s = JSON.parse(contentJson)
    const els = Array.isArray(s.elements) ? s.elements : []
    const heading = els.find((e:any)=>e?.type==='heading')
    const subtitle = els.find((e:any)=>e?.type==='subtitle')
    const bullets = els.find((e:any)=>e?.type==='bullets')
    const image = els.find((e:any)=>e?.type==='image')
    const layoutRaw = (s.layout || '').toString()
    const layout = (!layoutRaw || layoutRaw === 'auto') ? recommendLayout(ratioStr, contentJson) : layoutRaw
    const [rw, rh] = (() => { const m = ratioStr.split(':').map(Number); return (m.length===2 && m[0]>0 && m[1]>0) ? m : [16,9] })()
    const isSquare = rw === 1 && rh === 1
    const isFourThree = rw === 4 && rh === 3
    const colTemplate = isSquare ? '1fr' : isFourThree ? '1fr 1fr' : '3fr 2fr'

    if (layout === 'title-cover') {
      const bgUrl = image?.source?.url || ''
      const overlay = (themeId === 'modern-dark') ? 'rgba(0,0,0,0.35)' : 'rgba(255,255,255,0.25)'
      return `
        <div style="position:relative;width:100%;height:100%;font-family:Inter,system-ui,Arial;">
          ${bgUrl ? `<div style=\"position:absolute;inset:0;background-image:url('${escapeHtml(bgUrl)}');background-size:cover;background-position:center;\"></div>` : ''}
          <div style="position:absolute;inset:0;background:${overlay}"></div>
          <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;text-align:center;padding:32px;">
            <div style="max-width:70%;color:#${t.fgHex}">
              ${heading ? `<div style=\"font-size:48px;font-weight:800;\">${escapeHtml(heading.text)}</div>` : ''}
              ${subtitle ? `<div style=\"margin-top:8px;font-size:20px;opacity:.9;\">${escapeHtml(subtitle.text)}</div>` : ''}
            </div>
          </div>
        </div>`
    }

    if (layout === 'title-centered') {
      return `
        <div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;text-align:center;padding:32px;font-family:Inter,system-ui,Arial;color:#${t.fgHex}">
          <div style="max-width:70%">
            ${heading ? `<div style=\"font-size:36px;font-weight:800;\">${escapeHtml(heading.text)}</div>` : ''}
            ${subtitle ? `<div style=\"margin-top:8px;color:#${t.mutedHex}\">${escapeHtml(subtitle.text)}</div>` : ''}
          </div>
        </div>`
    }

    const twoCols = layout === 'bullets-left-media-right' || layout === 'media-left-bullets-right'
    const imageFirst = layout === 'media-left-bullets-right'
    if (twoCols) {
      const left = !imageFirst ? 'text' : 'image'
      const right = imageFirst ? 'text' : 'image'
      const renderText = () => `
        ${heading ? `<h1 style=\"margin:0 0 8px 0;font-size:28px;line-height:1.15;font-weight:700;color:#${t.fgHex}\">${escapeHtml(heading.text)}</h1>` : ''}
        ${subtitle ? `<p style=\"margin:0 0 12px 0;color:#${t.mutedHex};line-height:1.4\">${escapeHtml(subtitle.text)}</p>` : ''}
        ${(bullets && Array.isArray(bullets.items)) ? (()=>{ const numbered = isNumberedList(bullets.items); const tag = numbered ? 'ol' : 'ul'; return `<${tag} style=\\"padding-left:24px;color:#${t.fgHex};line-height:1.5;margin:0 0 12px 0;word-break:break-word\\\">${(bullets.items||[]).map((i: string) => `<li>${escapeHtml(truncateBullet(i, 180))}</li>`).join('')}</${tag}>` })() : ''}
      `
      const renderImage = () => image?.source?.url ? `<img src=\"${escapeHtml(image.source.url)}\" style=\"max-width:100%;height:auto;border-radius:8px\"/>` : ''
      return `
        <div style="width:100%;height:100%;padding:32px;font-family:Inter,system-ui,Arial;display:grid;grid-template-columns:${colTemplate};gap:16px;color:#${t.fgHex}">
          <div>${left==='text' ? renderText() : renderImage()}</div>
          <div>${right==='text' ? renderText() : renderImage()}</div>
        </div>`
    }

    // default linear
    const parts: string[] = []
    for (const el of els) {
      if (el.type === 'heading') parts.push(`<h1 style=\"margin:0 0 8px 0;font-size:36px;line-height:1.15;font-weight:700;color:#${t.fgHex}\">${escapeHtml(el.text)}</h1>`) 
      else if (el.type === 'subtitle') parts.push(`<p style=\"margin:0 0 12px 0;color:#${t.mutedHex};line-height:1.4\">${escapeHtml(el.text)}</p>`) 
      else if (el.type === 'bullets') { const numbered = isNumberedList(el.items||[]); const tag = numbered ? 'ol' : 'ul'; parts.push(`<${tag} style=\\"padding-left:24px;color:#${t.fgHex};line-height:1.5;margin:0 0 12px 0;word-break:break-word\\\">${(el.items||[]).map((i: string) => `<li>${escapeHtml(truncateBullet(i, 220))}</li>`).join('')}</${tag}>`) } 
      else if (el.type === 'image') parts.push(`<img src=\"${escapeHtml(el.source?.url || '')}\" style=\"max-width:100%;height:auto;border-radius:8px\"/>`) 
    }
    return `<div style=\"font-family:Inter,system-ui,Arial;padding:32px;background:white;color:#${t.fgHex};\">${parts.join('')}</div>`
  } catch {
    return '<div style="padding:32px;font-family:Inter,system-ui,Arial;">(erro ao renderizar slide)</div>'
  }
}

// duplicate definition removed; see earlier recommendLayout


function getThemeTokens(themeId: string) {
  const themes: Record<string, { bgHex: string; fgHex: string; mutedHex: string; primaryHex: string; headingFont: string; bodyFont: string }> = {
    'modern-light': { bgHex: 'FFFFFF', fgHex: '0F172A', mutedHex: '94A3B8', primaryHex: '2563EB', headingFont: 'Inter', bodyFont: 'Inter' },
    'modern-dark': { bgHex: '0B1220', fgHex: 'F8FAFC', mutedHex: '94A3B8', primaryHex: '60A5FA', headingFont: 'Inter', bodyFont: 'Inter' },
  }
  return themes[themeId] || themes['modern-light']
}

async function fetchImageBase64(url: string): Promise<string | null> {
  try {
    if (url.startsWith('/')) {
      const fs = await import('fs/promises')
      const path = `${process.cwd()}/public${url}`
      const buf = await fs.readFile(path)
      return buf.toString('base64')
    }
    const res = await fetch(url)
    if (!res.ok) return null
    const arr = new Uint8Array(await res.arrayBuffer())
    return Buffer.from(arr).toString('base64')
  } catch {
    return null
  }
}

function recommendLayout(ratioStr: string, contentJson: string): string {
  let rw = 16, rh = 9
  try { const m = ratioStr.split(':').map(Number); if (m.length===2 && m[0]>0 && m[1]>0) { rw=m[0]; rh=m[1] } } catch {}
  let j: any = {}
  try { j = JSON.parse(contentJson || '{}') } catch {}
  const els: any[] = Array.isArray(j.elements) ? j.elements : []
  const imageIdx = els.findIndex((e:any)=>e?.type==='image')
  const bulletsEl = els.find((e:any)=>e?.type==='bullets')
  const bulletsCount = Array.isArray(bulletsEl?.items) ? bulletsEl.items.length : 0
  const firstTextIdx = (()=>{
    const idxs = [
      els.findIndex((e:any)=>e?.type==='heading'),
      els.findIndex((e:any)=>e?.type==='subtitle'),
      els.findIndex((e:any)=>e?.type==='bullets'),
    ].filter((i)=>i>=0)
    return idxs.length ? Math.min(...idxs) : -1
  })()
  const hasImage = imageIdx >= 0
  const imageFirst = hasImage && (firstTextIdx < 0 || imageIdx < firstTextIdx)
  if (rw === 1 && rh === 1) return 'title-centered'
  if (rw === 16 && rh === 9) {
    if (hasImage && bulletsCount <= 3) return 'title-cover'
    if (hasImage) return imageFirst ? 'media-left-bullets-right' : 'bullets-left-media-right'
    return 'title-centered'
  }
  if (rw === 4 && rh === 3) {
    if (hasImage) return imageFirst ? 'media-left-bullets-right' : 'bullets-left-media-right'
    return 'title-centered'
  }
  return hasImage ? (imageFirst ? 'media-left-bullets-right' : 'bullets-left-media-right') : 'title-centered'
}

function isNumberedList(items: any): boolean {
  try {
    if (!Array.isArray(items) || items.length === 0) return false
    const rx = /^\s*\d+[\.)]\s?/ // e.g., "1.", "1)"
    const first = String(items[0] ?? '')
    const second = String(items[1] ?? '')
    if (rx.test(first) && (!second || /^\s*2[\.)]\s?/.test(second))) return true
    // Alternatively, consider at least 2 items matching numeric at start
    const matches = items.slice(0, 5).filter((s: any) => rx.test(String(s || ''))).length
    return matches >= 2
  } catch { return false }
}

function truncateBullet(s: string, maxLen: number): string {
  const clean = s.replace(/\s+/g, ' ').trim()
  if (clean.length <= maxLen) return clean
  // Try to truncate at word boundary
  const slice = clean.slice(0, maxLen - 1)
  const lastSpace = slice.lastIndexOf(' ')
  const head = lastSpace > 40 ? slice.slice(0, lastSpace) : slice
  return head + '…'
}
