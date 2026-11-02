/** Gráfico animado para el pizarrón de los videos (SVG propio: trazos que se dibujan, rectángulos que aparecen). */
import { useMemo } from 'react'
import { compile, parse } from '../math/expr'
import { CH, type PlotSpec } from './types'

const W = 520
const cache = new Map<string, (x: number) => number>()
function fn(src: string): (x: number) => number {
  let f = cache.get(src)
  if (!f) { try { f = compile(parse(src)) } catch { f = () => NaN } cache.set(src, f) }
  return f
}

export function VPlot({ spec }: { spec: PlotSpec }) {
  const H = spec.h ?? (spec.line ? 130 : 400)
  const pad = 30
  const [x0, x1] = spec.x, [y0, y1] = spec.y
  const sx = (x: number) => pad + ((x - x0) / (x1 - x0)) * (W - 2 * pad)
  const sy = (y: number) => H - pad - ((y - y0) / (y1 - y0)) * (H - 2 * pad)
  const axisY = spec.line ? H / 2 : sy(Math.min(Math.max(0, y0), y1))
  const axisX = sx(Math.min(Math.max(0, x0), x1))

  const path = (src: string, dom?: [number, number]) => {
    const f = fn(src)
    const a = dom ? Math.max(dom[0], x0) : x0, b = dom ? Math.min(dom[1], x1) : x1
    const N = 400
    let d = '', pen = false
    for (let i = 0; i <= N; i++) {
      const x = a + ((b - a) * i) / N, y = f(x)
      if (!isFinite(y) || y < y0 - (y1 - y0) || y > y1 + (y1 - y0)) { pen = false; continue }
      d += (pen ? 'L' : 'M') + sx(x).toFixed(1) + ' ' + sy(y).toFixed(1)
      pen = true
    }
    return d
  }

  const rects = useMemo(() => {
    const r = spec.rects
    if (!r) return []
    const f = fn(r.f), dx = (r.b - r.a) / r.n
    return Array.from({ length: r.n }, (_, i) => {
      const xl = r.a + i * dx
      const xs = r.mode === 'mid' ? xl + dx / 2 : r.mode === 'right' ? xl + dx : xl
      const h = f(xs)
      return { x: sx(xl), w: sx(xl + dx) - sx(xl), y: sy(Math.max(0, h)), hh: Math.abs(sy(h) - sy(0)) }
    })
  }, [spec.rects]) // eslint-disable-line react-hooks/exhaustive-deps

  const key = JSON.stringify(spec)
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="gráfico">
      {/* ejes */}
      <line x1={pad - 10} y1={axisY} x2={W - pad + 14} y2={axisY} stroke={CH.white} strokeOpacity=".75" strokeWidth="2.5" />
      <path d={`M${W - pad + 14} ${axisY} l-10 -6 v12 z`} fill={CH.white} fillOpacity=".75" />
      {!spec.line && <><line x1={axisX} y1={H - pad + 10} x2={axisX} y2={pad - 14} stroke={CH.white} strokeOpacity=".75" strokeWidth="2.5" /><path d={`M${axisX} ${pad - 14} l-6 10 h12 z`} fill={CH.white} fillOpacity=".75" /></>}
      {!spec.line && <><text x={W - pad + 4} y={axisY + 24} fill={CH.white} fontSize="18" fontStyle="italic">x</text><text x={axisX + 8} y={pad - 4} fill={CH.white} fontSize="18" fontStyle="italic">y</text></>}
      {/* marcas */}
      {spec.ticks?.map((t, i) => <g key={i}><line x1={sx(t.x)} y1={axisY - 6} x2={sx(t.x)} y2={axisY + 6} stroke={CH.white} strokeWidth="2" /><text x={sx(t.x)} y={axisY + 26} fill={CH.white} fontSize="17" textAnchor="middle">{t.label}</text></g>)}
      {/* tramos (intervalos) */}
      {spec.bands?.map((b, i) => (
        <g key={'b' + i + key} className="vp-pop">
          <line x1={sx(b.a)} y1={axisY} x2={sx(b.b)} y2={axisY} stroke={b.color ?? CH.yellow} strokeWidth="9" strokeLinecap="butt" opacity=".9" />
          <text x={sx(b.a)} y={axisY + 11} fill={b.color ?? CH.yellow} fontSize="40" fontWeight="700" textAnchor="middle">{b.openA ? '(' : '['}</text>
          <text x={sx(b.b)} y={axisY + 11} fill={b.color ?? CH.yellow} fontSize="40" fontWeight="700" textAnchor="middle">{b.openB ? ')' : ']'}</text>
        </g>
      ))}
      {spec.shade?.map((s, i) => {
        const f = fn(s.f), N = 120
        let d = `M${sx(s.a)} ${sy(0)}`
        for (let k = 0; k <= N; k++) { const x = s.a + ((s.b - s.a) * k) / N; d += `L${sx(x).toFixed(1)} ${sy(f(x)).toFixed(1)}` }
        d += `L${sx(s.b)} ${sy(0)}Z`
        return <path key={'s' + i + key} d={d} fill={s.color ?? CH.cyan} fillOpacity=".28" className="vp-fade" />
      })}
      {rects.map((r, i) => <rect key={'r' + i + key} x={r.x} y={r.y} width={Math.max(0, r.w)} height={r.hh} fill={spec.rects!.color ?? CH.orange} fillOpacity=".35" stroke={spec.rects!.color ?? CH.orange} strokeWidth="1.5" className="vp-pop" style={{ animationDelay: `${Math.min(i * 40, 1200)}ms` }} />)}
      {spec.vlines?.map((v, i) => <g key={'v' + i}><line x1={sx(v.x)} y1={pad} x2={sx(v.x)} y2={H - pad} stroke={v.color ?? CH.white} strokeOpacity=".6" strokeDasharray="6 6" strokeWidth="2" />{v.label && <text x={sx(v.x)} y={H - 6} fill={v.color ?? CH.white} fontSize="16" textAnchor="middle">{v.label}</text>}</g>)}
      {spec.fns?.map((f, i) => (
        <g key={'f' + i + f.f}>
          <path d={path(f.f, f.domain)} fill="none" stroke={f.color ?? CH.green} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" strokeDasharray={f.dash ? '10 8' : undefined} pathLength={f.dash ? undefined : 1} className={f.dash ? 'vp-fade' : 'vp-draw'} />
          {f.label && (() => { const xs = x0 + (x1 - x0) * 0.86, ys = fn(f.f)(xs); return isFinite(ys) && ys > y0 && ys < y1 ? <text x={sx(xs)} y={sy(ys) - 12} fill={f.color ?? CH.green} fontSize="20" fontWeight="700">{f.label}</text> : null })()}
        </g>
      ))}
      {spec.segs?.map((s, i) => <g key={'g' + i + key} className="vp-fade"><line x1={sx(s.x1)} y1={sy(s.y1)} x2={sx(s.x2)} y2={sy(s.y2)} stroke={s.color ?? CH.pink} strokeWidth="3.5" strokeDasharray={s.dash ? '8 6' : undefined} />{s.label && <text x={sx(s.x2) + 6} y={sy(s.y2) - 6} fill={s.color ?? CH.pink} fontSize="18" fontWeight="700">{s.label}</text>}</g>)}
      {spec.pts?.map((p, i) => <g key={'p' + i + key} className="vp-pop"><circle cx={sx(p.x)} cy={sy(p.y)} r="7" fill={p.open ? '#1d2b2f' : p.color ?? CH.yellow} stroke={p.color ?? CH.yellow} strokeWidth="3" />{p.label && <text x={sx(p.x) + 10} y={sy(p.y) - 12} fill={p.color ?? CH.yellow} fontSize="19" fontWeight="700">{p.label}</text>}</g>)}
    </svg>
  )
}
