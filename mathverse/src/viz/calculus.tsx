/** Visualizaciones de funciones, límites, derivadas e integrales. */
import { useMemo, useState } from 'react'
import { compile, diff, evaluate, num, parse, simplify, substitute, toTeX, type Node } from '../math/expr'
import { fmt, numDeriv, riemannSum, simpson, type RiemannMode } from '../math/numeric'
import { Plot, toFn } from '../ui/Plot'
import { TeX } from '../ui/Md'
import type { SliderParam } from '../content/types'
import { Slider, Stat, WidgetFrame } from './controls'

/** Derivada simbólica si se puede; si no, numérica. */
function derivOf(expr: string): (x: number) => number {
  try {
    return compile(diff(parse(expr)), 'x')
  } catch {
    const f = toFn(expr)
    return (x) => numDeriv(f, x)
  }
}
const texOf = (expr: string) => { try { return toTeX(parse(expr)) } catch { return expr } }

/* ---------- familia con parámetros ---------- */
export function FamilyWidget({ expr, params, x, y, ghost, note }: { expr: string; params: SliderParam[]; x?: [number, number]; y?: [number, number]; ghost?: string; note?: string }) {
  const [vals, setVals] = useState<Record<string, number>>(() => Object.fromEntries(params.map((p) => [p.name, p.init])))
  const node = useMemo<Node | null>(() => { try { return parse(expr, { vars: ['x', ...params.map((p) => p.name)] }) } catch { return null } }, [expr, params])
  const f = useMemo(() => (node ? (xx: number) => evaluate(node, { ...vals, x: xx }) : () => NaN), [node, vals])
  const tex = useMemo(() => {
    if (!node) return ''
    let n = node
    for (const p of params) n = substitute(n, p.name, num(vals[p.name]))
    try { return toTeX(simplify(n)) } catch { return '' }
  }, [node, vals, params])
  const extra = useMemo(() => {
    // datos útiles para cuadráticas a x^2 + b x + c
    if (expr.replace(/\s/g, '') === 'a*x^2+b*x+c') {
      const { a, b, c } = vals
      const D = b * b - 4 * a * c
      return { D, xv: a !== 0 ? -b / (2 * a) : NaN }
    }
    return null
  }, [expr, vals])
  return (
    <WidgetFrame side={<>
      {params.map((p) => <Slider key={p.name} label={p.label ? `${p.name} (${p.label})` : p.name} value={vals[p.name]} min={p.min} max={p.max} step={p.step} onChange={(v) => setVals((s) => ({ ...s, [p.name]: v }))} />)}
      <div className="rounded-xl border border-line bg-surface2/50 p-3 text-center"><TeX tex={`f(x) = ${tex}`} /></div>
      {extra && <><Stat label="Discriminante Δ" value={fmt(extra.D, 3)} tone={extra.D > 0 ? 'ok' : extra.D === 0 ? 'warn' : 'bad'} /><Stat label="Vértice x_v" value={fmt(extra.xv, 3)} /></>}
      {note && <p className="text-xs text-muted">{note}</p>}
      <button type="button" className="btn-ghost btn-sm" onClick={() => setVals(Object.fromEntries(params.map((p) => [p.name, p.init])))}>Restablecer</button>
    </>}>
      <Plot fns={[...(ghost ? [{ f: ghost, dashed: true, color: 'muted', label: 'referencia' }] : []), { f, label: 'f(x)', color: 'brand' }]} x={x ?? [-8, 8]} y={y ?? [-8, 8]} />
    </WidgetFrame>
  )
}

/* ---------- recta tangente ---------- */
export function TangentWidget({ f: expr, x0: start, x, y }: { f: string; x0: number; x?: [number, number]; y?: [number, number] }) {
  const f = toFn(expr)
  const d = useMemo(() => derivOf(expr), [expr])
  const [x0, setX0] = useState(start)
  const y0 = f(x0), m = d(x0)
  const left = numDeriv(f, x0 - 1e-4) , right = numDeriv(f, x0 + 1e-4)
  const kink = Math.abs(left - right) > 1e-2
  return (
    <WidgetFrame side={<>
      <Slider label="x₀" value={x0} min={(x ?? [-5, 5])[0]} max={(x ?? [-5, 5])[1]} step={0.01} onChange={setX0} />
      <Stat label="f(x₀)" value={fmt(y0, 4)} />
      <Stat label="f'(x₀) = pendiente" value={kink ? 'no existe' : fmt(m, 4)} tone={kink ? 'bad' : 'brand'} />
      {kink ? <p className="text-sm text-warn">Las pendientes por izquierda ({fmt(left, 3)}) y por derecha ({fmt(right, 3)}) no coinciden: no hay una única tangente.</p>
        : <div className="rounded-xl border border-line bg-surface2/50 p-3 text-center text-sm"><TeX tex={`y = ${fmt(y0, 3).replace(',', '{,}')} ${m < 0 ? '-' : '+'} ${fmt(Math.abs(m), 3).replace(',', '{,}')}(x ${x0 < 0 ? '+' : '-'} ${fmt(Math.abs(x0), 2).replace(',', '{,}')})`} /></div>}
      <p className="text-xs text-muted">Arrastrá el punto violeta sobre la curva.</p>
    </>}>
      <Plot x={x} y={y} fns={[{ f: expr, label: `f(x) = ${expr}` }, ...(!kink ? [{ f: (t: number) => y0 + m * (t - x0), color: 'ader', dashed: true, label: 'tangente' }] : [])]}
        handles={[{ id: 'p', x: x0, y: y0, axis: 'x' }]} onHandle={(_, hx) => setX0(Math.round(hx * 100) / 100)} />
    </WidgetFrame>
  )
}

/* ---------- secante → tangente ---------- */
export function SecantWidget({ f: expr, x0: start, x, y }: { f: string; x0: number; x?: [number, number]; y?: [number, number] }) {
  const f = toFn(expr)
  const d = useMemo(() => derivOf(expr), [expr])
  const [x0, setX0] = useState(start)
  const [lh, setLh] = useState(Math.log10(2))
  const h = Math.pow(10, lh)
  const ms = (f(x0 + h) - f(x0)) / h
  return (
    <WidgetFrame side={<>
      <Slider label="h (distancia entre puntos)" value={lh} min={-3} max={Math.log10(3)} step={0.01} onChange={setLh} format={() => fmt(h, 4)} />
      <Slider label="x₀" value={x0} min={(x ?? [-4, 4])[0] + 0.5} max={(x ?? [-4, 4])[1] - 1} step={0.1} onChange={setX0} />
      <Stat label="pendiente de la secante" value={fmt(ms, 5)} tone="warn" />
      <Stat label="pendiente de la tangente f'(x₀)" value={fmt(d(x0), 5)} tone="brand" />
      <p className="text-xs text-muted">Cuando h → 0, la secante se convierte en la tangente.</p>
    </>}>
      <Plot x={x} y={y} fns={[{ f: expr, label: 'f' }, { f: (t: number) => f(x0) + ms * (t - x0), color: 'ader', dashed: true, label: 'secante' }, { f: (t: number) => f(x0) + d(x0) * (t - x0), color: 'ok', width: 1.4, label: 'tangente' }]}
        points={[{ x: x0, y: f(x0), label: 'P' }, { x: x0 + h, y: f(x0 + h), label: 'Q', color: 'ader' }]} />
    </WidgetFrame>
  )
}

/* ---------- límite ---------- */
export function LimitWidget({ f: expr, a, x, y }: { f: string; a: number; x?: [number, number]; y?: [number, number] }) {
  const f = toFn(expr)
  const [ld, setLd] = useState(0)
  const dlt = Math.pow(10, ld)
  const fl = f(a - dlt), fr = f(a + dlt), fa = f(a)
  return (
    <WidgetFrame side={<>
      <Slider label="distancia a x = a" value={ld} min={-4} max={0.3} step={0.01} onChange={setLd} format={() => fmt(dlt, 5)} />
      <Stat label={`f(${fmt(a - dlt, 5)})`} value={fmt(fl, 6)} />
      <Stat label={`f(${fmt(a + dlt, 5)})`} value={fmt(fr, 6)} />
      <Stat label={`f(${fmt(a)})`} value={isFinite(fa) ? fmt(fa, 6) : 'no definida'} tone={isFinite(fa) ? undefined : 'bad'} />
      <p className="text-xs text-muted">Achicá la distancia: ¿a qué valor se acercan los dos lados?</p>
    </>}>
      <Plot x={x} y={y} fns={[{ f: expr, label: 'f' }]} vlines={[{ x: a, label: `x = ${fmt(a)}` }]}
        points={[{ x: a - dlt, y: fl, color: 'ader' }, { x: a + dlt, y: fr, color: 'ader' }, ...(isFinite(fa) ? [] : [{ x: a, y: (fl + fr) / 2, open: true, color: 'brand' }])]} />
    </WidgetFrame>
  )
}

/* ---------- f y f' ---------- */
export function DerivGraphWidget({ f: expr, x, y }: { f: string; x?: [number, number]; y?: [number, number] }) {
  const f = toFn(expr)
  const d = useMemo(() => derivOf(expr), [expr])
  const [x0, setX0] = useState(((x ?? [-4, 4])[0] + (x ?? [-4, 4])[1]) / 2 + 0.3)
  const m = d(x0)
  return (
    <WidgetFrame side={<>
      <Slider label="x" value={x0} min={(x ?? [-4, 4])[0]} max={(x ?? [-4, 4])[1]} step={0.01} onChange={setX0} />
      <Stat label="f(x)" value={fmt(f(x0), 4)} />
      <Stat label="f'(x)" value={fmt(m, 4)} tone={m > 1e-9 ? 'ok' : m < -1e-9 ? 'bad' : 'warn'} />
      <p className="text-sm">{m > 1e-9 ? 'f crece acá (f\' > 0).' : m < -1e-9 ? 'f decrece acá (f\' < 0).' : 'Pendiente casi 0: posible extremo.'}</p>
      <div className="rounded-xl border border-line bg-surface2/50 p-2 text-center text-sm"><TeX tex={`f(x) = ${texOf(expr)}`} /></div>
    </>}>
      <div className="grid gap-2">
        <Plot x={x} y={y} aspect={0.42} fns={[{ f: expr, label: 'f(x)' }, { f: (t: number) => f(x0) + m * (t - x0), color: 'ader', dashed: true }]} handles={[{ id: 'p', x: x0, y: f(x0), axis: 'x' }]} onHandle={(_, hx) => setX0(hx)} />
        <Plot x={x} y={y} aspect={0.42} fns={[{ f: d, color: 'brand2', label: "f'(x)" }]} points={[{ x: x0, y: m, color: 'brand2' }]} />
      </div>
    </WidgetFrame>
  )
}

/* ---------- sumas de Riemann ---------- */
const MODES: { id: RiemannMode; label: string }[] = [{ id: 'izq', label: 'Izquierda' }, { id: 'der', label: 'Derecha' }, { id: 'medio', label: 'Punto medio' }, { id: 'trapecio', label: 'Trapecios' }]

export function RiemannWidget({ f: expr, a, b, y }: { f: string; a: number; b: number; y?: [number, number] }) {
  const f = toFn(expr)
  const [n, setN] = useState(4)
  const [mode, setMode] = useState<RiemannMode>('izq')
  const S = riemannSum(f, a, b, n, mode)
  const exact = simpson(f, a, b, 4000)
  const h = (b - a) / n
  const rects = mode === 'trapecio' ? [] : Array.from({ length: n }, (_, i) => {
    const xi = mode === 'izq' ? a + i * h : mode === 'der' ? a + (i + 1) * h : a + (i + 0.5) * h
    return { x: a + i * h, y: 0, w: h, h: f(xi), color: f(xi) >= 0 ? 'brand2' : 'bad' }
  })
  return (
    <WidgetFrame side={<>
      <Slider label="Cantidad de rectángulos n" value={n} min={1} max={100} step={1} onChange={setN} format={(v) => String(v)} />
      <div className="grid grid-cols-2 gap-1.5" role="radiogroup" aria-label="Método">
        {MODES.map((m) => <button key={m.id} type="button" role="radio" aria-checked={mode === m.id} className={'btn-sm btn ' + (mode === m.id ? 'bg-brand text-white' : 'border border-line bg-surface2/60')} onClick={() => setMode(m.id)}>{m.label}</button>)}
      </div>
      <Stat label="Suma aproximada" value={fmt(S, 5)} tone="warn" />
      <Stat label="Valor exacto de la integral" value={fmt(exact, 5)} tone="brand" />
      <Stat label="Error" value={fmt(Math.abs(S - exact), 5)} tone={Math.abs(S - exact) < 0.01 ? 'ok' : undefined} />
    </>}>
      <Plot x={[a - 0.5, b + 0.5]} y={y} rects={rects} fns={[{ f: expr, label: `f(x) = ${expr}`, width: 3 }]}>
        {(o) => mode === 'trapecio' ? (
          <g>{Array.from({ length: n }, (_, i) => { const x1 = a + i * h, x2 = x1 + h; return <path key={i} d={`M${o.sx(x1)} ${o.sy(0)} L${o.sx(x1)} ${o.sy(f(x1))} L${o.sx(x2)} ${o.sy(f(x2))} L${o.sx(x2)} ${o.sy(0)} Z`} fill="rgb(var(--brand2) / .25)" stroke="rgb(var(--brand2))" /> })}</g>
        ) : null}
      </Plot>
    </WidgetFrame>
  )
}

/* ---------- área con signo ---------- */
export function AreaWidget({ f: expr, a: a0, b: b0, x, y }: { f: string; a: number; b: number; x?: [number, number]; y?: [number, number] }) {
  const f = toFn(expr)
  const [a, setA] = useState(a0)
  const [b, setB] = useState(b0)
  const lo = Math.min(a, b), hi = Math.max(a, b)
  const I = simpson(f, a, b, 3000)
  const area = simpson((t) => Math.abs(f(t)), lo, hi, 3000)
  return (
    <WidgetFrame side={<>
      <Slider label="a" value={a} min={(x ?? [-5, 5])[0]} max={(x ?? [-5, 5])[1]} step={0.05} onChange={setA} />
      <Slider label="b" value={b} min={(x ?? [-5, 5])[0]} max={(x ?? [-5, 5])[1]} step={0.05} onChange={setB} />
      <Stat label="∫ₐᵇ f(x) dx (con signo)" value={fmt(I, 4)} tone="brand" />
      <Stat label="Área geométrica" value={fmt(area, 4)} tone="ok" />
      <p className="text-xs text-muted">Violeta suma, rojo resta. Arrastrá los puntos sobre el eje.</p>
    </>}>
      <Plot x={x} y={y} fns={[{ f: expr, label: 'f' }]} shades={[{ f: expr, a: lo, b: hi, signed: true }]}
        handles={[{ id: 'a', x: a, y: 0, axis: 'x', label: 'a', color: 'ader' }, { id: 'b', x: b, y: 0, axis: 'x', label: 'b', color: 'ader' }]}
        onHandle={(id, hx) => (id === 'a' ? setA(Math.round(hx * 20) / 20) : setB(Math.round(hx * 20) / 20))} />
    </WidgetFrame>
  )
}

/* ---------- acumulación ---------- */
export function AccumulationWidget({ f: expr, x, y }: { f: string; x?: [number, number]; y?: [number, number] }) {
  const f = toFn(expr)
  const [x0, x1] = x ?? [0, 6]
  const [t, setT] = useState(x0 + (x1 - x0) * 0.6)
  const F = useMemo(() => {
    const N = 400, xs: number[] = [], ys: number[] = []
    let acc = 0
    for (let i = 0; i <= N; i++) {
      const xi = x0 + ((x1 - x0) * i) / N
      if (i > 0) acc += simpson(f, xs[i - 1], xi, 8)
      xs.push(xi); ys.push(acc)
    }
    return (q: number) => { const i = Math.round(((q - x0) / (x1 - x0)) * N); return i < 0 || i > N ? NaN : ys[i] }
  }, [expr, x0, x1]) // eslint-disable-line react-hooks/exhaustive-deps
  const Ft = F(t)
  return (
    <WidgetFrame side={<>
      <Slider label="hasta x =" value={t} min={x0} max={x1} step={0.01} onChange={setT} />
      <Stat label={`Acumulado F(${fmt(t, 2)}) = ∫ f`} value={fmt(Ft, 4)} tone="brand" />
      <Stat label="f(x) = ritmo de acumulación" value={fmt(f(t), 4)} tone={f(t) >= 0 ? 'ok' : 'bad'} />
      <p className="text-xs text-muted">La pendiente del gráfico de abajo es la altura del de arriba: eso dice el teorema fundamental.</p>
    </>}>
      <div className="grid gap-2">
        <Plot x={[x0 - 0.3, x1 + 0.3]} y={y} aspect={0.42} fns={[{ f: expr, label: 'f(x)' }]} shades={[{ f: expr, a: x0, b: t, signed: true }]} handles={[{ id: 't', x: t, y: 0, axis: 'x', color: 'ader' }]} onHandle={(_, hx) => setT(Math.min(x1, Math.max(x0, hx)))} />
        <Plot x={[x0 - 0.3, x1 + 0.3]} aspect={0.42} y={undefined} fns={[{ f: F, color: 'muted', dashed: true }, { f: (q: number) => (q <= t ? F(q) : NaN), color: 'brand2', label: 'F(x): área acumulada' }]} points={[{ x: t, y: Ft, color: 'brand2' }]} />
      </div>
    </WidgetFrame>
  )
}

/* ---------- función inversa ---------- */
export function InverseWidget({ f: expr, finv, x }: { f: string; finv: string; x?: [number, number] }) {
  const f = toFn(expr)
  const [t, setT] = useState(1)
  const ft = f(t)
  return (
    <WidgetFrame side={<>
      <Slider label="x" value={t} min={(x ?? [-5, 5])[0]} max={(x ?? [-5, 5])[1]} step={0.01} onChange={setT} />
      <Stat label="punto en f" value={`(${fmt(t, 2)}; ${fmt(ft, 2)})`} tone="brand" />
      <Stat label="punto en f⁻¹" value={`(${fmt(ft, 2)}; ${fmt(t, 2)})`} tone="warn" />
      <p className="text-xs text-muted">Las coordenadas se intercambian: por eso los gráficos son simétricos respecto de y = x.</p>
    </>}>
      <Plot x={x} y={x} equal fns={[{ f: expr, label: 'f', color: 'brand' }, { f: finv, label: 'f⁻¹', color: 'ader' }, { f: 'x', dashed: true, color: 'muted', label: 'y = x' }]}
        points={[{ x: ft, y: t, color: 'ader' }]} handles={[{ id: 'p', x: t, y: ft, axis: 'x' }]} onHandle={(_, hx) => setT(hx)}>
        {(o) => isFinite(ft) ? <line x1={o.sx(t)} y1={o.sy(ft)} x2={o.sx(ft)} y2={o.sy(t)} stroke="rgb(var(--muted))" strokeDasharray="4 4" /> : null}
      </Plot>
    </WidgetFrame>
  )
}
