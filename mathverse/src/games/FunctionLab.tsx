/** Juego 1 · Laboratorio de funciones: igualar una curva objetivo moviendo parámetros. */
import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { evaluate, num, parse, simplify, substitute, toTeX } from '../math/expr'
import { makeRand, newSeedSafe } from './util'
import { recordGame } from '../progress/store'
import { Plot } from '../ui/Plot'
import { TeX } from '../ui/Md'
import { Slider } from '../viz/controls'
import { GameOver, GameShell, ScoreBar } from './common'

interface Family { id: string; name: string; expr: string; params: { name: string; min: number; max: number; step: number; init: number; pool: number[] }[]; units: string[] }

const FAMILIES: Family[] = [
  { id: 'lin', name: 'Recta', expr: 'a*x + b', units: ['f3', 'f2', 'f1'], params: [{ name: 'a', min: -3, max: 3, step: 0.5, init: 1, pool: [-2, -1.5, -1, -0.5, 0.5, 1.5, 2, 3] }, { name: 'b', min: -5, max: 5, step: 1, init: 0, pool: [-4, -3, -2, -1, 1, 2, 3, 4] }] },
  { id: 'quad', name: 'Parábola', expr: 'a*(x - h)^2 + k', units: ['f4', 'f2'], params: [{ name: 'a', min: -2, max: 2, step: 0.5, init: 1, pool: [-2, -1, -0.5, 0.5, 2] }, { name: 'h', min: -4, max: 4, step: 1, init: 0, pool: [-3, -2, -1, 1, 2, 3] }, { name: 'k', min: -5, max: 5, step: 1, init: 0, pool: [-4, -2, -1, 1, 3, 4] }] },
  { id: 'abs', name: 'Valor absoluto', expr: 'a*abs(x - h) + k', units: ['f8'], params: [{ name: 'a', min: -3, max: 3, step: 0.5, init: 1, pool: [-2, -1, -0.5, 0.5, 2, 3] }, { name: 'h', min: -4, max: 4, step: 1, init: 0, pool: [-3, -2, -1, 1, 2, 3] }, { name: 'k', min: -5, max: 5, step: 1, init: 0, pool: [-3, -2, 1, 2, 4] }] },
  { id: 'sin', name: 'Senoide', expr: 'a*sin(b*x) + k', units: ['f7'], params: [{ name: 'a', min: -3, max: 3, step: 0.5, init: 1, pool: [-2, -1, 0.5, 1.5, 2, 3] }, { name: 'b', min: 0.5, max: 3, step: 0.5, init: 1, pool: [0.5, 1.5, 2, 3] }, { name: 'k', min: -3, max: 3, step: 1, init: 0, pool: [-2, -1, 1, 2] }] },
  { id: 'exp', name: 'Exponencial', expr: 'a*2^x + k', units: ['f6'], params: [{ name: 'a', min: -3, max: 3, step: 0.5, init: 1, pool: [-1, 0.5, 1.5, 2, 3] }, { name: 'k', min: -4, max: 4, step: 1, init: 0, pool: [-3, -2, -1, 1, 2] }] },
]

const ROUNDS = 5

function makeRound(seed: number, unit: string | null) {
  const r = makeRand(seed)
  const fams = unit ? FAMILIES.filter((f) => f.units.includes(unit)) : FAMILIES
  const fam = r.pick(fams.length ? fams : FAMILIES)
  const target = Object.fromEntries(fam.params.map((p) => [p.name, r.pick(p.pool)]))
  return { fam, target }
}

export default function FunctionLab() {
  const [sp] = useSearchParams()
  const unit = sp.get('unidad')
  const [seed, setSeed] = useState(newSeedSafe)
  const [round, setRound] = useState(0)
  const [score, setScore] = useState(0)
  const [checks, setChecks] = useState(0)
  const [msg, setMsg] = useState<string | null>(null)
  const [solved, setSolved] = useState(false)
  const { fam, target } = useMemo(() => makeRound(seed + round * 101, unit), [seed, round, unit])
  const [vals, setVals] = useState<Record<string, number>>(() => Object.fromEntries(fam.params.map((p) => [p.name, p.init])))
  const node = useMemo(() => parse(fam.expr, { vars: ['x', ...fam.params.map((p) => p.name)] }), [fam])
  const f = (env: Record<string, number>) => (x: number) => evaluate(node, { ...env, x })
  const tex = (env: Record<string, number>) => { let n = node; for (const p of fam.params) n = substitute(n, p.name, num(env[p.name])); return toTeX(simplify(n)) }

  const resetRound = (nextRound: number, s = seed) => {
    const nf = makeRound(s + nextRound * 101, unit).fam
    setVals(Object.fromEntries(nf.params.map((p) => [p.name, p.init])))
    setChecks(0); setMsg(null); setSolved(false)
  }

  const check = () => {
    const xs = Array.from({ length: 41 }, (_, i) => -6 + i * 0.3)
    const g = f(vals), t = f(target)
    const diffs = xs.map((x) => g(x) - t(x))
    const maxErr = Math.max(...diffs.map(Math.abs))
    setChecks((c) => c + 1)
    if (maxErr < 1e-6) {
      const pts = Math.max(10, 50 - 8 * checks)
      setScore((s) => s + pts)
      setSolved(true)
      setMsg(`¡Coinciden! +${pts} puntos.`)
      return
    }
    const avg = diffs.reduce((a, b) => a + b, 0) / diffs.length
    const slopeU = (g(1) - g(-1)) / 2, slopeT = (t(1) - t(-1)) / 2
    if (Math.abs(avg) > 0.5 && diffs.every((d) => Math.sign(d) === Math.sign(avg))) setMsg(`Tu curva está toda ${avg > 0 ? 'por encima' : 'por debajo'} de la objetivo: probá ${avg > 0 ? 'bajarla' : 'subirla'}.`)
    else if (Math.sign(slopeU) !== Math.sign(slopeT) && Math.abs(slopeT) > 0.1) setMsg('Cerca de x = 0, una sube y la otra baja: revisá el signo del parámetro que multiplica.')
    else setMsg('Todavía no coinciden. Compará dónde cortan los ejes y qué tan "abierta" o "empinada" es cada una.')
  }

  const next = () => {
    if (round + 1 >= ROUNDS) { recordGame('lab', { score, xp: Math.round(score / 5) }); setRound(ROUNDS); return }
    setRound(round + 1); resetRound(round + 1)
  }

  if (round >= ROUNDS)
    return <GameShell id="lab"><GameOver title={`${score} puntos`} lines={[`Completaste las ${ROUNDS} curvas.`, 'Cuantas menos comprobaciones necesitás, más puntos sumás.']} onAgain={() => { const s = newSeedSafe(); setSeed(s); setRound(0); setScore(0); resetRound(0, s) }} /></GameShell>

  return (
    <GameShell id="lab">
      <ScoreBar items={[{ label: 'Curva', value: `${round + 1}/${ROUNDS}` }, { label: 'Puntos', value: score, tone: 'brand' }, { label: 'Familia', value: fam.name }]} />
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="card p-3"><Plot x={[-7, 7]} y={[-6, 6]} fns={[{ f: f(target), color: 'ok', dashed: true, label: 'objetivo', width: 3.5 }, { f: f(vals), color: 'brand', label: 'tu función' }]} /></div>
        <div className="card grid content-start gap-3 p-4">
          <div className="rounded-xl bg-surface2/60 p-2 text-center text-sm"><TeX tex={`f(x) = ${tex(vals)}`} /></div>
          {fam.params.map((p) => <Slider key={p.name} label={p.name} value={vals[p.name]} min={p.min} max={p.max} step={p.step} onChange={(v) => !solved && setVals((s) => ({ ...s, [p.name]: v }))} />)}
          {!solved ? <button type="button" className="btn-primary" onClick={check}>Comprobar</button> : <button type="button" className="btn-primary" onClick={next}>{round + 1 < ROUNDS ? 'Siguiente curva →' : 'Ver resultado'}</button>}
          {msg && <p className={'rounded-xl p-3 text-sm ' + (solved ? 'bg-ok/10 text-ok' : 'bg-warn/10')} role="status">{msg}</p>}
          {solved && <p className="text-xs text-muted">Objetivo: <TeX tex={tex(target)} /></p>}
        </div>
      </div>
    </GameShell>
  )
}
