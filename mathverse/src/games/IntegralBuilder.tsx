/** Juego 5 · Constructor de integrales: aproximar áreas con rectángulos y entender el área con signo. */
import { useMemo, useState } from 'react'
import { parse, toTeX } from '../math/expr'
import { fmt, riemannSum, simpson, type RiemannMode } from '../math/numeric'
import { parseNumber } from '../math/equivalence'
import { recordGame } from '../progress/store'
import { Plot, toFn } from '../ui/Plot'
import { TeX } from '../ui/Md'
import { Slider } from '../viz/controls'
import { GameOver, GameShell, ScoreBar } from './common'
import { makeRand, newSeedSafe } from './util'

const ROUNDS = 5
const FUNCS = [
  { f: 'x^2', a: 0, b: 2 }, { f: '4 - x^2', a: 0, b: 2 }, { f: 'sqrt(x)', a: 0, b: 4 }, { f: 'sin(x)', a: 0, b: 3.1416 },
  { f: 'e^(x/2)', a: 0, b: 2 }, { f: '1/x', a: 1, b: 4 }, { f: 'x^3 - 3*x', a: -2, b: 2 }, { f: 'x - 1', a: -1, b: 3 },
  { f: 'cos(x)', a: 0, b: 3 }, { f: '2*x - x^2', a: 0, b: 3 },
]
const MODES: { id: RiemannMode; label: string }[] = [{ id: 'izq', label: 'Izquierda' }, { id: 'der', label: 'Derecha' }, { id: 'medio', label: 'Medio' }, { id: 'trapecio', label: 'Trapecios' }]

export default function IntegralBuilder() {
  const [seed, setSeed] = useState(newSeedSafe)
  const [round, setRound] = useState(0)
  const [score, setScore] = useState(0)
  const [n, setN] = useState(4)
  const [mode, setMode] = useState<RiemannMode>('izq')
  const [guess, setGuess] = useState('')
  const [result, setResult] = useState<null | { exact: number; S: number; pts: number; guessV: number | null }>(null)
  const q = useMemo(() => makeRand(seed + round * 13).pick(FUNCS), [seed, round])
  const f = toFn(q.f)
  const S = riemannSum(f, q.a, q.b, n, mode)
  const h = (q.b - q.a) / n
  const rects = mode === 'trapecio' ? [] : Array.from({ length: n }, (_, i) => { const xi = mode === 'izq' ? q.a + i * h : mode === 'der' ? q.a + (i + 1) * h : q.a + (i + 0.5) * h; return { x: q.a + i * h, y: 0, w: h, h: f(xi), color: f(xi) >= 0 ? 'brand2' : 'bad' } })
  const ys = Array.from({ length: 50 }, (_, i) => f(q.a + ((q.b - q.a) * i) / 49)).filter(isFinite)
  const yr: [number, number] = [Math.min(0, ...ys) - 0.8, Math.max(0, ...ys) + 0.8]

  const submit = () => {
    const exact = simpson(f, q.a, q.b, 4000)
    const gv = parseNumber(guess)
    const est = gv ?? S
    const rel = Math.abs(est - exact) / Math.max(0.5, Math.abs(exact))
    const pts = Math.max(0, Math.round(100 - 300 * rel - n * 0.6))
    setResult({ exact, S, pts, guessV: gv })
    setScore((s) => s + pts)
  }
  const next = () => {
    const nr = round + 1
    if (nr >= ROUNDS) recordGame('constructor', { score, xp: Math.round(score / 10) })
    setRound(nr); setN(4); setMode('izq'); setGuess(''); setResult(null)
  }
  if (round >= ROUNDS)
    return <GameShell id="constructor"><GameOver title={`${score} puntos`} lines={['Ganás más puntos con estimaciones precisas que usen pocos rectángulos.', '¿Notaste que el punto medio y los trapecios convergen mucho más rápido?']} onAgain={() => { setSeed(newSeedSafe()); setRound(0); setScore(0) }} /></GameShell>

  return (
    <GameShell id="constructor">
      <ScoreBar items={[{ label: 'Ronda', value: `${round + 1}/${ROUNDS}` }, { label: 'Puntos', value: score, tone: 'brand' }]} />
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="card grid gap-2 p-3">
          <div className="text-center text-lg"><TeX tex={`\\int_{${fmt(q.a, 2).replace(',', '{,}')}}^{${q.b === 3.1416 ? '\\pi' : fmt(q.b, 2)}} ${toTeX(parse(q.f))}\\,dx \\approx\\ ?`} /></div>
          <Plot x={[q.a - 0.5, q.b + 0.5]} y={yr} rects={rects} fns={[{ f: q.f, width: 3 }]}>
            {(o) => mode === 'trapecio' ? <g>{Array.from({ length: n }, (_, i) => { const x1 = q.a + i * h, x2 = x1 + h; return <path key={i} d={`M${o.sx(x1)} ${o.sy(0)} L${o.sx(x1)} ${o.sy(f(x1))} L${o.sx(x2)} ${o.sy(f(x2))} L${o.sx(x2)} ${o.sy(0)} Z`} fill="rgb(var(--brand2) / .25)" stroke="rgb(var(--brand2))" /> })}</g> : null}
          </Plot>
          <p className="text-xs text-muted">Los rectángulos rojos están debajo del eje: restan.</p>
        </div>
        <div className="card grid content-start gap-3 p-4">
          <Slider label="Rectángulos n" value={n} min={1} max={60} step={1} onChange={(v) => !result && setN(v)} format={(v) => String(v)} />
          <div className="grid grid-cols-2 gap-1.5">{MODES.map((m) => <button key={m.id} type="button" disabled={!!result} aria-pressed={mode === m.id} className={'btn btn-sm ' + (mode === m.id ? 'bg-brand text-white' : 'border border-line bg-surface2/60')} onClick={() => setMode(m.id)}>{m.label}</button>)}</div>
          <div className="rounded-xl border border-line bg-surface2/50 p-3 text-sm">Suma de tus rectángulos: <b className="font-mono">{fmt(S, 4)}</b></div>
          <label className="grid gap-1 text-sm">Tu estimación de la integral (opcional; si la dejás vacía, se usa la suma)
            <input className="input" value={guess} disabled={!!result} onChange={(e) => setGuess(e.target.value)} placeholder={fmt(S, 3)} />
          </label>
          {!result ? <button type="button" className="btn-primary" onClick={submit}>Construir</button> : (
            <div className="grid gap-2 rounded-xl border border-ok/40 bg-ok/10 p-3 text-sm anim-up" role="status">
              <div>Valor exacto: <b className="font-mono">{fmt(result.exact, 5)}</b></div>
              <div>Tu valor: <b className="font-mono">{fmt(result.guessV ?? result.S, 5)}</b> (error {fmt(Math.abs((result.guessV ?? result.S) - result.exact), 4)})</div>
              <div className="text-base font-semibold">+{result.pts} puntos</div>
              <button type="button" className="btn-primary" onClick={next}>{round + 1 < ROUNDS ? 'Siguiente →' : 'Ver resultado'}</button>
            </div>
          )}
        </div>
      </div>
    </GameShell>
  )
}
