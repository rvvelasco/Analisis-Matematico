/** Texto con fórmulas: $inline$, $$bloque$$ y **negrita**. Renderiza KaTeX (offline). */
import katex from 'katex'
import { memo, useMemo } from 'react'

const cache = new Map<string, string>()

export function renderTeX(tex: string, display = false): string {
  const key = (display ? 'D' : 'I') + tex
  const hit = cache.get(key)
  if (hit) return hit
  let html: string
  try {
    html = katex.renderToString(tex, { displayMode: display, throwOnError: false, strict: 'ignore', trust: false, output: 'htmlAndMathml' })
  } catch {
    html = `<code>${escapeHtml(tex)}</code>`
  }
  if (cache.size > 4000) cache.clear()
  cache.set(key, html)
  return html
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!)
}

/** Convierte el mini-markdown a HTML seguro (el texto se escapa; solo KaTeX genera marcado). */
export function mdToHtml(src: string): string {
  const out: string[] = []
  // separar fórmulas en bloque e inline
  const re = /\$\$([\s\S]+?)\$\$|\$([^$]+?)\$/g
  let last = 0
  let m: RegExpExecArray | null
  while ((m = re.exec(src))) {
    out.push(textToHtml(src.slice(last, m.index)))
    out.push(m[1] !== undefined ? renderTeX(m[1], true) : renderTeX(m[2], false))
    last = m.index + m[0].length
  }
  out.push(textToHtml(src.slice(last)))
  return out.join('')
}

function textToHtml(t: string): string {
  return escapeHtml(t)
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br/>')
}

export const Md = memo(function Md({ text, className, as = 'span' }: { text: string; className?: string; as?: 'span' | 'div' | 'p' }) {
  const html = useMemo(() => mdToHtml(text), [text])
  const Tag = as
  return <Tag className={className} dangerouslySetInnerHTML={{ __html: html }} />
})

export const TeX = memo(function TeX({ tex, display = false, className }: { tex: string; display?: boolean; className?: string }) {
  const html = useMemo(() => renderTeX(tex, display), [tex, display])
  return <span className={className} dangerouslySetInnerHTML={{ __html: html }} />
})
