/** Gráfico SVG interactivo: zoom, desplazamiento, funciones, áreas, puntos, vectores y puntos arrastrables. */
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { compile, parse } from '../math/expr'
import { fmt } from '../math/numeric'

export type Fn = ((x: number) => number) | string
export interface PlotFn { f: Fn; color?: string; dashed?: boolean; width?: number; label?: string; domain?: [number, number] }
export interface PlotPoint { x: number; y: number; color?: string; open?: boolean; label?: string; r?: number }
export interface PlotVector { from?: [number, number]; to: [number, number]; color?: string; label?: string; dashed?: boolean; width?: number }
export interface PlotShade { f: Fn; under?: Fn; a: number; b: number; color?: string; signed?: boolean; opacity?: number }
export interface PlotRect { x: number; y: number; w: number; h: number; color?: string; opacity?: number }
export interface Handle { id: string; x: number; y: number; color?: string; label?: string; axis?: 'x' | 'y' | 'both' }
export interface View { x0: number; x1: number; y0: number; y1: number }

export interface Overlay {
  sx: (x: number) => number
  sy: (y: number) => number
  view: View
  W: number
  H: number
}

interface Props {
  x?: [number, number]
  y?: [number, number]
  fns?: PlotFn[]
  points?: PlotPoint[]
  vectors?: PlotVector[]
  shades?: PlotShade[]
  rects?: PlotRect[]
  vlines?: { x: number; label?: string; color?: string }[]
  hlines?: { y: number; label?: string; color?: string }[]
  handles?: Handle[]
  onHandle?: (id: string, x: number, y: number) => void
  onHandleEnd?: (id: string) => void
  /** relación alto/ancho */
  aspect?: number
  interactive?: boolean
  /** mantener la misma escala en x e y (útil para vectores y transformaciones) */
  equal?: boolean
  grid?: boolean
  label?: string
  children?: (o: Overlay) => ReactNode
  className?: string
}

const PALETTE = ['brand', 'brand2', 'ader', 'avec', 'aint', 'amat']
const VAR: Record<string, string> = { brand: '--brand', brand2: '--brand2', ok: '--ok', bad: '--bad', warn: '--warn', afun: '--a-fun', amat: '--a-mat', avec: '--a-vec', ader: '--a-der', aint: '--a-int', ink: '--ink', muted: '--muted' }
export const col = (c: string | undefined, i = 0): string => {
  const k = c ?? PALETTE[i % PALETTE.length]
  return VAR[k] ? `rgb(var(${VAR[k]}))` : k
}

const fnCache = new Map<string, (x: number) => number>()
export function toFn(f: Fn): (x: number) => number {
  if (typeof f === 'function') return f
  let g = fnCache.get(f)
  if (!g) {
    try {
      g = compile(parse(f), 'x')
    } catch {
      g = () => NaN
    }
    fnCache.set(f, g)
  }
  return g
}

function niceStep(range: number, target = 8): number {
  const raw = range / target
  const p = Math.pow(10, Math.floor(Math.log10(raw)))
  const m = raw / p
  return (m < 1.5 ? 1 : m < 3.5 ? 2 : m < 7.5 ? 5 : 10) * p
}

export function Plot(props: Props) {
  const { fns = [], points = [], vectors = [], shades = [], rects = [], vlines = [], hlines = [], handles = [], interactive = true, grid = true, aspect = 0.62, equal = false } = props
  const W = 640
  const H = Math.round(W * aspect)
  const initial = useMemo<View>(() => {
    const [x0, x1] = props.x ?? [-6, 6]
    let [y0, y1] = props.y ?? [-(x1 - x0) * aspect / 2, (x1 - x0) * aspect / 2]
    if (equal) {
      const cy = (y0 + y1) / 2, half = ((x1 - x0) * aspect) / 2
      y0 = cy - half; y1 = cy + half
    }
    return { x0, x1, y0, y1 }
  }, [props.x?.[0], props.x?.[1], props.y?.[0], props.y?.[1], aspect, equal]) // eslint-disable-line react-hooks/exhaustive-deps
  const [view, setView] = useState<View>(initial)
  useEffect(() => setView(initial), [initial])
  const svgRef = useRef<SVGSVGElement>(null)
  const drag = useRef<{ kind: 'pan'; px: number; py: number; v: View } | { kind: 'handle'; id: string } | null>(null)

  const sx = useCallback((x: number) => ((x - view.x0) / (view.x1 - view.x0)) * W, [view])
  const sy = useCallback((y: number) => H - ((y - view.y0) / (view.y1 - view.y0)) * H, [view, H])
  const toWorld = useCallback((clientX: number, clientY: number) => {
    const r = svgRef.current!.getBoundingClientRect()
    const px = ((clientX - r.left) / r.width) * W
    const py = ((clientY - r.top) / r.height) * H
    return { x: view.x0 + (px / W) * (view.x1 - view.x0), y: view.y0 + ((H - py) / H) * (view.y1 - view.y0), px, py }
  }, [view, H])

  const zoom = useCallback((factor: number, cx?: number, cy?: number) => {
    setView((v) => {
      const mx = cx ?? (v.x0 + v.x1) / 2, my = cy ?? (v.y0 + v.y1) / 2
      return { x0: mx + (v.x0 - mx) * factor, x1: mx + (v.x1 - mx) * factor, y0: my + (v.y0 - my) * factor, y1: my + (v.y1 - my) * factor }
    })
  }, [])

  useEffect(() => {
    const el = svgRef.current
    if (!el || !interactive) return
    const onWheel = (e: WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey && !e.altKey && document.activeElement !== el) return
      e.preventDefault()
      const w = toWorld(e.clientX, e.clientY)
      zoom(e.deltaY > 0 ? 1.15 : 1 / 1.15, w.x, w.y)
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [interactive, toWorld, zoom])

  const onPointerDown = (e: React.PointerEvent) => {
    const target = e.target as Element
    const hid = target.getAttribute('data-handle')
    if (hid) {
      drag.current = { kind: 'handle', id: hid }
      ;(e.currentTarget as Element).setPointerCapture(e.pointerId)
      e.preventDefault()
      return
    }
    if (!interactive) return
    drag.current = { kind: 'pan', px: e.clientX, py: e.clientY, v: view }
    ;(e.currentTarget as Element).setPointerCapture(e.pointerId)
  }
  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current
    if (!d) return
    if (d.kind === 'handle') {
      const w = toWorld(e.clientX, e.clientY)
      const h = handles.find((x) => x.id === d.id)
      props.onHandle?.(d.id, h?.axis === 'y' ? h.x : w.x, h?.axis === 'x' ? h.y : w.y)
      return
    }
    const r = svgRef.current!.getBoundingClientRect()
    const dx = ((e.clientX - d.px) / r.width) * (d.v.x1 - d.v.x0)
    const dy = ((e.clientY - d.py) / r.height) * (d.v.y1 - d.v.y0)
    setView({ x0: d.v.x0 - dx, x1: d.v.x1 - dx, y0: d.v.y0 + dy, y1: d.v.y1 + dy })
  }
  const onPointerUp = () => {
    const d = drag.current
    if (d?.kind === 'handle') props.onHandleEnd?.(d.id)
    drag.current = null
  }
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!interactive) return
    const sxv = (view.x1 - view.x0) * 0.1, syv = (view.y1 - view.y0) * 0.1
    const moves: Record<string, [number, number]> = { ArrowLeft: [-sxv, 0], ArrowRight: [sxv, 0], ArrowUp: [0, syv], ArrowDown: [0, -syv] }
    if (moves[e.key]) {
      e.preventDefault()
      const [dx, dy] = moves[e.key]
      setView((v) => ({ x0: v.x0 + dx, x1: v.x1 + dx, y0: v.y0 + dy, y1: v.y1 + dy }))
    } else if (e.key === '+' || e.key === '=') zoom(1 / 1.2)
    else if (e.key === '-') zoom(1.2)
  }

  // ejes y grilla
  const xs = niceStep(view.x1 - view.x0), ys = niceStep(view.y1 - view.y0, 6)
  const gridLines: ReactNode[] = []
  if (grid) {
    for (let x = Math.ceil(view.x0 / xs) * xs; x <= view.x1; x += xs) gridLines.push(<line key={'gx' + x} x1={sx(x)} x2={sx(x)} y1={0} y2={H} stroke="rgb(var(--grid) / .06)" />)
    for (let y = Math.ceil(view.y0 / ys) * ys; y <= view.y1; y += ys) gridLines.push(<line key={'gy' + y} y1={sy(y)} y2={sy(y)} x1={0} x2={W} stroke="rgb(var(--grid) / .06)" />)
  }
  const ax = Math.min(Math.max(sy(0), 0), H), ay = Math.min(Math.max(sx(0), 0), W)
  const labels: ReactNode[] = []
  for (let x = Math.ceil(view.x0 / xs) * xs; x <= view.x1; x += xs) {
    if (Math.abs(x) < xs / 2) continue
    labels.push(<text key={'lx' + x} x={sx(x)} y={Math.min(H - 4, ax + 14)} fontSize={11} textAnchor="middle" fill="rgb(var(--muted))">{fmt(x, 3)}</text>)
  }
  for (let y = Math.ceil(view.y0 / ys) * ys; y <= view.y1; y += ys) {
    if (Math.abs(y) < ys / 2) continue
    labels.push(<text key={'ly' + y} x={Math.max(4, Math.min(W - 30, ay + 5))} y={sy(y) + 4} fontSize={11} fill="rgb(var(--muted))">{fmt(y, 3)}</text>)
  }

  const curve = (f: (x: number) => number, dom?: [number, number]) => {
    const a = Math.max(view.x0, dom?.[0] ?? -Infinity), b = Math.min(view.x1, dom?.[1] ?? Infinity)
    if (a >= b) return ''
    const N = 700
    const yr = view.y1 - view.y0
    let d = ''
    let prev: number | null = null
    for (let i = 0; i <= N; i++) {
      const x = a + ((b - a) * i) / N
      const y = f(x)
      if (!isFinite(y) || Math.abs(y - (view.y0 + view.y1) / 2) > yr * 20) { prev = null; continue }
      if (prev !== null && Math.abs(y - prev) > yr * 1.5) { prev = null }
      d += (prev === null ? 'M' : 'L') + sx(x).toFixed(2) + ' ' + sy(y).toFixed(2)
      prev = y
    }
    return d
  }

  const shadePath = (s: PlotShade, sign?: 1 | -1) => {
    const f = toFn(s.f), g = s.under ? toFn(s.under) : () => 0
    const a = Math.max(s.a, view.x0 - (view.x1 - view.x0)), b = Math.min(s.b, view.x1 + (view.x1 - view.x0))
    if (a >= b) return ''
    const N = 300
    const top: string[] = [], bottom: string[] = []
    for (let i = 0; i <= N; i++) {
      const x = a + ((b - a) * i) / N
      let y1 = f(x), y0 = g(x)
      if (!isFinite(y1) || !isFinite(y0)) continue
      if (sign === 1) y1 = Math.max(y1, y0)
      if (sign === -1) y1 = Math.min(y1, y0)
      top.push(`${sx(x).toFixed(2)} ${sy(y1).toFixed(2)}`)
      bottom.push(`${sx(x).toFixed(2)} ${sy(y0).toFixed(2)}`)
    }
    if (!top.length) return ''
    return 'M' + top.join('L') + 'L' + bottom.reverse().join('L') + 'Z'
  }

  const arrow = (v: PlotVector, i: number) => {
    const [fx, fy] = v.from ?? [0, 0]
    const x1 = sx(fx), y1 = sy(fy), x2 = sx(v.to[0]), y2 = sy(v.to[1])
    const ang = Math.atan2(y2 - y1, x2 - x1)
    const len = Math.hypot(x2 - x1, y2 - y1)
    const hs = Math.min(12, len * 0.4)
    const c = col(v.color, i)
    return (
      <g key={'v' + i}>
        <line x1={x1} y1={y1} x2={x2 - Math.cos(ang) * hs * 0.6} y2={y2 - Math.sin(ang) * hs * 0.6} stroke={c} strokeWidth={v.width ?? 3} strokeDasharray={v.dashed ? '6 5' : undefined} strokeLinecap="round" />
        {len > 2 && <path d={`M${x2} ${y2} L${x2 - hs * Math.cos(ang - 0.4)} ${y2 - hs * Math.sin(ang - 0.4)} L${x2 - hs * Math.cos(ang + 0.4)} ${y2 - hs * Math.sin(ang + 0.4)} Z`} fill={c} />}
        {v.label && <text x={(x1 + x2) / 2 + 8} y={(y1 + y2) / 2 - 8} fontSize={14} fontWeight={700} fill={c}>{v.label}</text>}
      </g>
    )
  }

  return (
    <div className={'relative ' + (props.className ?? '')}>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        className="block h-auto w-full touch-none select-none rounded-xl bg-surface2/40"
        role="img"
        aria-label={props.label ?? 'Gráfico interactivo. Arrastrá para desplazar; usá + y − para el zoom.'}
        tabIndex={interactive ? 0 : -1}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onKeyDown={onKeyDown}
        style={{ cursor: interactive ? 'grab' : 'default' }}
      >
        {gridLines}
        {rects.map((r, i) => <rect key={'r' + i} x={sx(Math.min(r.x, r.x + r.w))} y={sy(Math.max(r.y, r.y + r.h))} width={Math.abs(sx(r.x + r.w) - sx(r.x))} height={Math.abs(sy(r.y + r.h) - sy(r.y))} fill={col(r.color ?? 'brand2')} fillOpacity={r.opacity ?? 0.25} stroke={col(r.color ?? 'brand2')} strokeOpacity={0.8} />)}
        {shades.map((s, i) =>
          s.signed ? (
            <g key={'s' + i}>
              <path d={shadePath(s, 1)} fill={col('brand')} fillOpacity={s.opacity ?? 0.3} />
              <path d={shadePath(s, -1)} fill={col('bad')} fillOpacity={s.opacity ?? 0.3} />
            </g>
          ) : (
            <path key={'s' + i} d={shadePath(s)} fill={col(s.color ?? 'brand')} fillOpacity={s.opacity ?? 0.25} />
          ),
        )}
        <line x1={0} x2={W} y1={ax} y2={ax} stroke="rgb(var(--muted) / .7)" strokeWidth={1.2} />
        <line y1={0} y2={H} x1={ay} x2={ay} stroke="rgb(var(--muted) / .7)" strokeWidth={1.2} />
        {labels}
        {vlines.map((l, i) => (
          <g key={'vl' + i}>
            <line x1={sx(l.x)} x2={sx(l.x)} y1={0} y2={H} stroke={col(l.color ?? 'muted')} strokeDasharray="5 5" strokeWidth={1.3} />
            {l.label && <text x={sx(l.x) + 4} y={14} fontSize={12} fill={col(l.color ?? 'muted')}>{l.label}</text>}
          </g>
        ))}
        {hlines.map((l, i) => (
          <g key={'hl' + i}>
            <line y1={sy(l.y)} y2={sy(l.y)} x1={0} x2={W} stroke={col(l.color ?? 'muted')} strokeDasharray="5 5" strokeWidth={1.3} />
            {l.label && <text x={6} y={sy(l.y) - 5} fontSize={12} fill={col(l.color ?? 'muted')}>{l.label}</text>}
          </g>
        ))}
        {fns.map((p, i) => (
          <path key={'f' + i} d={curve(toFn(p.f), p.domain)} fill="none" stroke={col(p.color, i)} strokeWidth={p.width ?? 2.6} strokeDasharray={p.dashed ? '7 6' : undefined} strokeLinejoin="round" strokeLinecap="round" />
        ))}
        {vectors.map(arrow)}
        {props.children?.({ sx, sy, view, W, H })}
        {points.map((p, i) => (
          <g key={'p' + i}>
            <circle cx={sx(p.x)} cy={sy(p.y)} r={p.r ?? 5} fill={p.open ? 'rgb(var(--surface))' : col(p.color ?? 'ink')} stroke={col(p.color ?? 'ink')} strokeWidth={2} />
            {p.label && <text x={sx(p.x) + 8} y={sy(p.y) - 8} fontSize={13} fontWeight={600} fill="rgb(var(--ink))">{p.label}</text>}
          </g>
        ))}
        {handles.map((h) => (
          <g key={'h' + h.id}>
            <circle cx={sx(h.x)} cy={sy(h.y)} r={16} fill={col(h.color ?? 'brand')} fillOpacity={0.18} data-handle={h.id} style={{ cursor: 'grab' }} />
            <circle cx={sx(h.x)} cy={sy(h.y)} r={7} fill={col(h.color ?? 'brand')} stroke="white" strokeWidth={2} data-handle={h.id} style={{ cursor: 'grab' }} />
            {h.label && <text x={sx(h.x) + 12} y={sy(h.y) - 12} fontSize={13} fontWeight={700} fill={col(h.color ?? 'brand')} pointerEvents="none">{h.label}</text>}
          </g>
        ))}
      </svg>
      {interactive && (
        <div className="absolute right-2 top-2 flex gap-1">
          <button type="button" className="btn-ghost btn-sm !px-2" onClick={() => zoom(1 / 1.3)} aria-label="Acercar">＋</button>
          <button type="button" className="btn-ghost btn-sm !px-2" onClick={() => zoom(1.3)} aria-label="Alejar">－</button>
          <button type="button" className="btn-ghost btn-sm !px-2" onClick={() => setView(initial)} aria-label="Restablecer vista">⟲</button>
        </div>
      )}
      {fns.some((f) => f.label) && (
        <div className="mt-1.5 flex flex-wrap gap-3 px-1 text-xs text-muted">
          {fns.map((f, i) => f.label && (
            <span key={i} className="inline-flex items-center gap-1.5"><span className="inline-block h-0.5 w-4 rounded" style={{ background: col(f.color, i) }} />{f.label}</span>
          ))}
        </div>
      )}
    </div>
  )
}
