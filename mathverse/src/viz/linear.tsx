/** Visualizaciones de vectores y matrices. */
import { useMemo, useState } from 'react'
import { angleDeg, det2, dot, norm } from '../math/vector'
import { applyRowOp, M, matTeX, rref, rowOpTeX, solveSystem, type Mat, type RowOp } from '../math/matrix'
import { frac, fstr, fval, parseFrac } from '../math/fraction'
import { fmt, makeRand } from '../math/numeric'
import { Plot } from '../ui/Plot'
import { TeX } from '../ui/Md'
import { NumberBox, Slider, Stat, WidgetFrame } from './controls'

const snap = (v: number, s = 0.5) => Math.round(v / s) * s
const vtxt = (v: number[]) => `(${v.map((c) => fmt(c, 2)).join('; ')})`

/* ---------- suma y escalar ---------- */
export function VectorsWidget() {
  const [u, setU] = useState([3, 1])
  const [v, setV] = useState([1, 2.5])
  const [k, setK] = useState(1)
  const s = [u[0] + v[0], u[1] + v[1]]
  const ku = [k * u[0], k * u[1]]
  return (
    <WidgetFrame side={<>
      <Stat label="u" value={vtxt(u)} tone="brand" />
      <Stat label="v" value={vtxt(v)} />
      <Stat label="u + v" value={vtxt(s)} tone="ok" />
      <Stat label="|u|, |v|, |u + v|" value={`${fmt(norm(u), 2)}; ${fmt(norm(v), 2)}; ${fmt(norm(s), 2)}`} />
      <Slider label="k (para k·u)" value={k} min={-2} max={3} step={0.25} onChange={setK} />
      <Stat label="k·u" value={vtxt(ku)} tone="warn" />
      <p className="text-xs text-muted">Arrastrá las puntas de u y v. La línea punteada completa el paralelogramo.</p>
    </>}>
      <Plot x={[-6, 6]} y={[-4, 5]} equal interactive={false}
        vectors={[{ to: [ku[0], ku[1]], color: 'warn', width: 6, label: k !== 1 ? 'k·u' : undefined }, { to: [u[0], u[1]], color: 'brand', label: 'u' }, { to: [v[0], v[1]], color: 'brand2', label: 'v' }, { from: [u[0], u[1]], to: [s[0], s[1]], color: 'brand2', dashed: true, width: 1.5 }, { from: [v[0], v[1]], to: [s[0], s[1]], color: 'brand', dashed: true, width: 1.5 }, { to: [s[0], s[1]], color: 'ok', label: 'u+v' }]}
        handles={[{ id: 'u', x: u[0], y: u[1], color: 'brand' }, { id: 'v', x: v[0], y: v[1], color: 'brand2' }]}
        onHandle={(id, x, y) => (id === 'u' ? setU([snap(x), snap(y)]) : setV([snap(x), snap(y)]))} />
    </WidgetFrame>
  )
}

/* ---------- producto escalar y proyección ---------- */
export function DotWidget() {
  const [u, setU] = useState([2, 3])
  const [v, setV] = useState([4, 1])
  const d = dot(u, v)
  const ang = angleDeg(u, v)
  const vv = dot(v, v)
  const p = vv ? [(d / vv) * v[0], (d / vv) * v[1]] : [0, 0]
  return (
    <WidgetFrame side={<>
      <Stat label="u · v" value={fmt(d, 3)} tone={d > 1e-9 ? 'ok' : d < -1e-9 ? 'bad' : 'warn'} />
      <Stat label="ángulo" value={ang === null ? '—' : `${fmt(ang, 1)}°`} />
      <Stat label="proyección escalar de u sobre v" value={vv ? fmt(d / Math.sqrt(vv), 3) : '—'} tone="brand" />
      <Stat label="proyección vectorial" value={vtxt(p)} />
      <p className="text-sm">{d > 1e-9 ? 'Ángulo agudo: apuntan "para el mismo lado".' : d < -1e-9 ? 'Ángulo obtuso: apuntan en sentidos opuestos.' : '¡Perpendiculares!'}</p>
    </>}>
      <Plot x={[-6, 6]} y={[-4, 5]} equal interactive={false}
        vectors={[{ to: [v[0], v[1]], color: 'brand2', label: 'v' }, { to: [u[0], u[1]], color: 'brand', label: 'u' }, { to: [p[0], p[1]], color: 'warn', width: 5, label: 'proy' }, { from: [p[0], p[1]], to: [u[0], u[1]], color: 'muted', dashed: true, width: 1.5 }]}
        handles={[{ id: 'u', x: u[0], y: u[1], color: 'brand' }, { id: 'v', x: v[0], y: v[1], color: 'brand2' }]}
        onHandle={(id, x, y) => (id === 'u' ? setU([snap(x), snap(y)]) : setV([snap(x), snap(y)]))} />
    </WidgetFrame>
  )
}

/* ---------- combinación lineal ---------- */
export function SpanWidget() {
  const [u, setU] = useState([2, 1])
  const [v, setV] = useState([-1, 2])
  const [a, setA] = useState(1)
  const [b, setB] = useState(1)
  const [target, setTarget] = useState<[number, number]>([3, 4])
  const w = [a * u[0] + b * v[0], a * u[1] + b * v[1]]
  const hit = Math.abs(w[0] - target[0]) < 0.26 && Math.abs(w[1] - target[1]) < 0.26
  const D = det2(u, v)
  const newTarget = () => { const r = makeRand(Date.now() % 100000); setTarget([r.int(-5, 5), r.int(-3, 4)]) }
  const grid: { from: [number, number]; to: [number, number] }[] = []
  if (Math.abs(D) > 1e-9) for (let i = -6; i <= 6; i++) {
    grid.push({ from: [i * v[0] - 8 * u[0], i * v[1] - 8 * u[1]], to: [i * v[0] + 8 * u[0], i * v[1] + 8 * u[1]] })
    grid.push({ from: [i * u[0] - 8 * v[0], i * u[1] - 8 * v[1]], to: [i * u[0] + 8 * v[0], i * u[1] + 8 * v[1]] })
  }
  return (
    <WidgetFrame side={<>
      <Slider label="α" value={a} min={-4} max={4} step={0.25} onChange={setA} />
      <Slider label="β" value={b} min={-4} max={4} step={0.25} onChange={setB} />
      <Stat label="α·u + β·v" value={vtxt(w)} tone={hit ? 'ok' : 'brand'} />
      <Stat label="det(u, v)" value={fmt(D, 2)} tone={Math.abs(D) < 1e-9 ? 'bad' : undefined} />
      <p className="text-sm">{Math.abs(D) < 1e-9 ? 'u y v son paralelos (LD): solo generan una recta.' : hit ? '¡Llegaste al objetivo!' : `Llevá la punta al objetivo (${target[0]}; ${target[1]}).`}</p>
      <button type="button" className="btn-ghost btn-sm" onClick={newTarget}>Nuevo objetivo</button>
    </>}>
      <Plot x={[-7, 7]} y={[-5, 6]} equal interactive={false}
        vectors={[{ to: [u[0], u[1]], color: 'brand', label: 'u' }, { to: [v[0], v[1]], color: 'brand2', label: 'v' }, { to: [w[0], w[1]], color: hit ? 'ok' : 'warn', label: 'αu+βv' }]}
        points={[{ x: target[0], y: target[1], color: 'ok', open: true, label: 'objetivo', r: 7 }]}
        handles={[{ id: 'u', x: u[0], y: u[1], color: 'brand' }, { id: 'v', x: v[0], y: v[1], color: 'brand2' }]}
        onHandle={(id, x, y) => (id === 'u' ? setU([snap(x), snap(y)]) : setV([snap(x), snap(y)]))}>
        {(o) => <g>{grid.map((g, i) => <line key={i} x1={o.sx(g.from[0])} y1={o.sy(g.from[1])} x2={o.sx(g.to[0])} y2={o.sy(g.to[1])} stroke="rgb(var(--brand) / .14)" />)}</g>}
      </Plot>
    </WidgetFrame>
  )
}

/* ---------- transformaciones lineales ---------- */
const PRESETS: { name: string; m: number[][] }[] = [
  { name: 'Identidad', m: [[1, 0], [0, 1]] },
  { name: 'Rotación 90°', m: [[0, -1], [1, 0]] },
  { name: 'Simetría eje x', m: [[1, 0], [0, -1]] },
  { name: 'Simetría y = x', m: [[0, 1], [1, 0]] },
  { name: 'Escala ×2', m: [[2, 0], [0, 2]] },
  { name: 'Cizalladura', m: [[1, 1], [0, 1]] },
  { name: 'Aplastar (det 0)', m: [[1, 2], [0.5, 1]] },
]
/** Figura "F" para ver orientación. */
const SHAPE: [number, number][] = [[0, 0], [0, 2], [1.2, 2], [1.2, 1.6], [0.4, 1.6], [0.4, 1.15], [1, 1.15], [1, 0.75], [0.4, 0.75], [0.4, 0]]

export function TransformView({ m, target, aspect }: { m: number[][]; target?: number[][]; aspect?: number }) {
  const T = (p: [number, number], A = m): [number, number] => [A[0][0] * p[0] + A[0][1] * p[1], A[1][0] * p[0] + A[1][1] * p[1]]
  // vista que contenga la figura transformada y el objetivo
  const pts = [...SHAPE.map((p) => T(p)), ...(target ? SHAPE.map((p) => T(p, target)) : [])]
  const R = Math.max(3, ...pts.map((p) => Math.max(Math.abs(p[0]), Math.abs(p[1]) / 0.62))) + 0.6
  return (
    <Plot x={[-R, R]} y={[-R * 0.62, R * 0.62]} equal interactive={false} aspect={aspect}
      vectors={[{ to: [m[0][0], m[1][0]], color: 'brand', label: 'A·e₁' }, { to: [m[0][1], m[1][1]], color: 'brand2', label: 'A·e₂' }]}>
      {(o) => {
        const path = (pts: [number, number][]) => 'M' + pts.map((p) => `${o.sx(p[0])} ${o.sy(p[1])}`).join('L') + 'Z'
        const lines = []
        for (let i = -4; i <= 4; i++) {
          const a1 = T([i, -4]), a2 = T([i, 4]), b1 = T([-4, i]), b2 = T([4, i])
          lines.push(<line key={'a' + i} x1={o.sx(a1[0])} y1={o.sy(a1[1])} x2={o.sx(a2[0])} y2={o.sy(a2[1])} stroke="rgb(var(--brand) / .18)" />)
          lines.push(<line key={'b' + i} x1={o.sx(b1[0])} y1={o.sy(b1[1])} x2={o.sx(b2[0])} y2={o.sy(b2[1])} stroke="rgb(var(--brand) / .18)" />)
        }
        return (
          <g>
            {lines}
            <path d={path([[0, 0], [1, 0], [1, 1], [0, 1]])} fill="none" stroke="rgb(var(--muted))" strokeDasharray="4 4" />
            <path d={path(SHAPE)} fill="rgb(var(--muted) / .12)" stroke="rgb(var(--muted))" strokeDasharray="3 3" />
            {target && <path d={path(SHAPE.map((p) => T(p, target)))} fill="rgb(var(--ok) / .15)" stroke="rgb(var(--ok))" strokeWidth={2} strokeDasharray="6 4" />}
            <path d={path([[0, 0], T([1, 0]), T([1, 1]), T([0, 1])])} fill="rgb(var(--brand2) / .18)" stroke="rgb(var(--brand2))" />
            <path d={path(SHAPE.map((p) => T(p)))} fill="rgb(var(--a-der) / .3)" stroke="rgb(var(--a-der))" strokeWidth={2} />
          </g>
        )
      }}
    </Plot>
  )
}

export function MatrixEditor({ m, onChange, step = 0.5 }: { m: number[][]; onChange: (m: number[][]) => void; step?: number }) {
  return (
    <div className="flex items-center gap-2">
      <TeX tex="A =" />
      <div className="relative inline-grid grid-cols-2 gap-1.5 px-2.5 py-1">
        <span className="pointer-events-none absolute inset-y-0 left-0 w-2 rounded-l-lg border-y-2 border-l-2 border-ink/70" />
        <span className="pointer-events-none absolute inset-y-0 right-0 w-2 rounded-r-lg border-y-2 border-r-2 border-ink/70" />
        {m.map((row, i) => row.map((c, j) => <NumberBox key={`${i}${j}`} label={`a${i + 1}${j + 1}`} value={c} step={step} onChange={(v) => { const n = m.map((r) => r.slice()); n[i][j] = v; onChange(n) }} />))}
      </div>
    </div>
  )
}

export function MatrixTransformWidget() {
  const [m, setM] = useState([[1, 0.5], [0, 1]])
  const det = m[0][0] * m[1][1] - m[0][1] * m[1][0]
  return (
    <WidgetFrame side={<>
      <MatrixEditor m={m} onChange={setM} />
      <div className="flex flex-wrap gap-1">{PRESETS.map((p) => <button key={p.name} type="button" className="btn-ghost btn-sm" onClick={() => setM(p.m.map((r) => r.slice()))}>{p.name}</button>)}</div>
      <Stat label="det A (factor de área)" value={fmt(det, 3)} tone={Math.abs(det) < 1e-9 ? 'bad' : det < 0 ? 'warn' : 'ok'} />
      <p className="text-sm">{Math.abs(det) < 1e-9 ? 'det = 0: todo el plano se aplasta en una recta (o un punto). No se puede deshacer.' : det < 0 ? 'det < 0: la figura queda "dada vuelta" (cambia la orientación).' : 'Las áreas se multiplican por det A.'}</p>
      <p className="text-xs text-muted">Gris: figura original. Naranja: transformada. Las flechas son las columnas de A.</p>
    </>}>
      <TransformView m={m} />
    </WidgetFrame>
  )
}

/* ---------- producto de matrices ---------- */
export function MatrixProductWidget() {
  const [seed, setSeed] = useState(3)
  const { A, B } = useMemo(() => {
    const r = makeRand(seed)
    return { A: Array.from({ length: 2 }, () => Array.from({ length: 3 }, () => r.int(-3, 4))), B: Array.from({ length: 3 }, () => Array.from({ length: 2 }, () => r.int(-3, 4))) }
  }, [seed])
  const C = A.map((row) => B[0].map((_, j) => row.reduce((s, a, k) => s + a * B[k][j], 0)))
  const [sel, setSel] = useState<[number, number]>([0, 0])
  const [i, j] = sel
  const cell = (v: number, hl: boolean, key: string) => <span key={key} className={'grid h-10 w-10 place-items-center rounded-lg font-mono ' + (hl ? 'bg-brand/25 font-bold text-ink' : 'bg-surface2/60 text-muted')}>{v}</span>
  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center justify-center gap-4">
        <div className="grid grid-cols-3 gap-1">{A.map((row, r) => row.map((v, c) => cell(v, r === i, `a${r}${c}`)))}</div>
        <span className="text-2xl text-muted">×</span>
        <div className="grid grid-cols-2 gap-1">{B.map((row, r) => row.map((v, c) => cell(v, c === j, `b${r}${c}`)))}</div>
        <span className="text-2xl text-muted">=</span>
        <div className="grid grid-cols-2 gap-1">{C.map((row, r) => row.map((v, c) => (
          <button key={`c${r}${c}`} type="button" onClick={() => setSel([r, c])} aria-label={`Elemento ${r + 1},${c + 1} del resultado`} className={'grid h-10 w-10 place-items-center rounded-lg font-mono ' + (r === i && c === j ? 'bg-ader text-white' : 'bg-surface2 hover:bg-brand/20')}>{v}</button>
        )))}</div>
      </div>
      <div className="rounded-xl border border-line bg-surface2/50 p-3 text-center">
        <TeX tex={`(AB)_{${i + 1}${j + 1}} = ${A[i].map((a, k) => `${a < 0 ? `(${a})` : a}\\cdot ${B[k][j] < 0 ? `(${B[k][j]})` : B[k][j]}`).join(' + ')} = ${C[i][j]}`} />
      </div>
      <p className="text-center text-sm text-muted">Tocá un elemento del resultado: se resaltan la fila de A y la columna de B que se combinan.</p>
      <div className="text-center"><button type="button" className="btn-ghost btn-sm" onClick={() => setSeed((s) => s + 1)}>Otras matrices</button></div>
    </div>
  )
}

/* ---------- sistemas 2×2 como rectas ---------- */
export function SystemLinesWidget() {
  const [c, setC] = useState({ a1: 1, b1: 1, c1: 4, a2: 1, b2: -1, c2: 0 })
  const det = c.a1 * c.b2 - c.a2 * c.b1
  const res = solveSystem(M([[c.a1, c.b1], [c.a2, c.b2]]), [frac(c.c1), frac(c.c2)])
  const line = (a: number, b: number, k: number) => (b !== 0 ? (x: number) => (k - a * x) / b : () => NaN)
  const vl = [...(c.b1 === 0 && c.a1 !== 0 ? [{ x: c.c1 / c.a1, color: 'brand' }] : []), ...(c.b2 === 0 && c.a2 !== 0 ? [{ x: c.c2 / c.a2, color: 'ader' }] : [])]
  const set = (k: keyof typeof c) => (v: number) => setC((s) => ({ ...s, [k]: v }))
  return (
    <WidgetFrame side={<>
      <div className="grid gap-1.5 text-sm">
        <div className="flex items-center gap-1"><NumberBox label="a1" value={c.a1} onChange={set('a1')} />x +<NumberBox label="b1" value={c.b1} onChange={set('b1')} />y =<NumberBox label="c1" value={c.c1} onChange={set('c1')} /></div>
        <div className="flex items-center gap-1"><NumberBox label="a2" value={c.a2} onChange={set('a2')} />x +<NumberBox label="b2" value={c.b2} onChange={set('b2')} />y =<NumberBox label="c2" value={c.c2} onChange={set('c2')} /></div>
      </div>
      <Stat label="Clasificación" value={res.kind} tone={res.kind === 'SCD' ? 'ok' : res.kind === 'SCI' ? 'warn' : 'bad'} />
      <Stat label="det A" value={fmt(det, 3)} />
      {res.solution && <Stat label="Solución (x; y)" value={`(${res.solution.map(fstr).join('; ')})`} tone="brand" />}
      <p className="text-sm">{res.kind === 'SCD' ? 'Las rectas se cortan en un único punto.' : res.kind === 'SCI' ? 'Son la misma recta: infinitas soluciones.' : 'Son paralelas: no hay solución.'}</p>
    </>}>
      <Plot x={[-8, 8]} y={[-6, 6]} equal fns={[{ f: line(c.a1, c.b1, c.c1), color: 'brand', label: 'ecuación 1' }, { f: line(c.a2, c.b2, c.c2), color: 'ader', label: 'ecuación 2', dashed: res.kind === 'SCI' }]} vlines={vl}
        points={res.solution ? [{ x: fval(res.solution[0]), y: fval(res.solution[1]), color: 'ok', label: 'solución' }] : []} />
    </WidgetFrame>
  )
}

/* ---------- Gauss paso a paso ---------- */
const START: number[][] = [[1, 1, 1, 6], [2, -1, 1, 3], [1, 2, -1, 2]]

export function GaussWidget() {
  const [hist, setHist] = useState<{ m: Mat; op?: RowOp }[]>([{ m: M(START) }])
  const [form, setForm] = useState({ type: 'addMul' as RowOp['t'], i: 1, j: 0, k: '-2' })
  const cur = hist[hist.length - 1].m
  const auto = useMemo(() => rref(cur, 3).steps[0], [cur])
  const apply = (op: RowOp) => setHist((h) => [...h, { m: applyRowOp(h[h.length - 1].m, op), op }])
  const manual = (): RowOp | null => {
    const k = parseFrac(form.k)
    if (form.type === 'swap') return form.i === form.j ? null : { t: 'swap', i: form.i, j: form.j }
    if (!k) return null
    if (form.type === 'scale') return k.n === 0 ? null : { t: 'scale', i: form.i, k }
    return form.i === form.j ? null : { t: 'addMul', i: form.i, j: form.j, k }
  }
  const op = manual()
  const done = !auto
  const sol = solveSystem(cur.map((r) => r.slice(0, 3)), cur.map((r) => r[3]))
  const newSystem = () => {
    const r = makeRand(Date.now() % 99991)
    let A: number[][]
    do A = Array.from({ length: 3 }, () => Array.from({ length: 3 }, () => r.int(-3, 3)))
    while (Math.abs(A[0][0] * (A[1][1] * A[2][2] - A[1][2] * A[2][1]) - A[0][1] * (A[1][0] * A[2][2] - A[1][2] * A[2][0]) + A[0][2] * (A[1][0] * A[2][1] - A[1][1] * A[2][0])) < 1)
    const x = [r.int(-3, 3), r.int(-3, 3), r.int(-3, 3)]
    setHist([{ m: M(A.map((row) => [...row, row.reduce((s, v, i) => s + v * x[i], 0)])) }])
  }
  return (
    <div className="grid gap-4">
      <div className="overflow-x-auto rounded-xl border border-line bg-surface2/40 p-3 text-center"><TeX tex={matTeX(cur, 3)} display /></div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="grid gap-2 rounded-xl border border-line p-3">
          <div className="label">Operación manual</div>
          <div className="flex flex-wrap items-center gap-1.5 text-sm">
            <select className="input !w-auto !py-1.5" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as RowOp['t'] })} aria-label="Tipo de operación">
              <option value="addMul">Fᵢ → Fᵢ + k·Fⱼ</option><option value="scale">Fᵢ → k·Fᵢ</option><option value="swap">Fᵢ ↔ Fⱼ</option>
            </select>
            i:<select className="input !w-auto !py-1.5" value={form.i} onChange={(e) => setForm({ ...form, i: Number(e.target.value) })} aria-label="Fila i">{[0, 1, 2].map((x) => <option key={x} value={x}>F{x + 1}</option>)}</select>
            {form.type !== 'scale' && <>j:<select className="input !w-auto !py-1.5" value={form.j} onChange={(e) => setForm({ ...form, j: Number(e.target.value) })} aria-label="Fila j">{[0, 1, 2].map((x) => <option key={x} value={x}>F{x + 1}</option>)}</select></>}
            {form.type !== 'swap' && <>k:<input className="input !w-16 !py-1.5" value={form.k} onChange={(e) => setForm({ ...form, k: e.target.value })} aria-label="Factor k" /></>}
          </div>
          <button type="button" className="btn-soft btn-sm" disabled={!op} onClick={() => op && apply(op)}>{op ? <>Aplicar <TeX tex={rowOpTeX(op)} /></> : 'Operación inválida'}</button>
        </div>
        <div className="grid content-start gap-2 rounded-xl border border-line p-3">
          <div className="label">Ayuda</div>
          {auto ? <button type="button" className="btn-ghost btn-sm" onClick={() => apply(auto.op)}>Siguiente paso sugerido: <TeX tex={rowOpTeX(auto.op)} /></button> : <span className="text-sm text-ok">¡Matriz reducida! {sol.kind === 'SCD' && sol.solution ? `x = ${fstr(sol.solution[0])}, y = ${fstr(sol.solution[1])}, z = ${fstr(sol.solution[2])}` : sol.kind}</span>}
          <div className="flex gap-2">
            <button type="button" className="btn-ghost btn-sm" disabled={hist.length < 2} onClick={() => setHist((h) => h.slice(0, -1))}>Deshacer</button>
            <button type="button" className="btn-ghost btn-sm" onClick={newSystem}>Otro sistema</button>
          </div>
        </div>
      </div>
      {hist.length > 1 && (
        <ol className="grid gap-1 text-sm text-muted">{hist.slice(1).map((h, i) => <li key={i}>{i + 1}. <TeX tex={rowOpTeX(h.op!)} /></li>)}</ol>
      )}
      {done && <p className="text-sm text-muted">Cada operación de fila cambia la matriz, pero no las soluciones del sistema.</p>}
    </div>
  )
}
