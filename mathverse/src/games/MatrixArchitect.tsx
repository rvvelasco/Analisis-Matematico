/** Juego 7 · Arquitecto de matrices: construir la matriz de una transformación. */
import { useMemo, useState } from 'react'
import type { Exercise } from '../engine/types'
import { recordAttempt, recordGame } from '../progress/store'
import { MatrixEditor, TransformView } from '../viz/linear'
import { fmt } from '../math/numeric'
import { GameOver, GameShell, ScoreBar } from './common'
import { makeRand, newSeedSafe } from './util'

interface Target { name: string; m: number[][]; desc: string; level: 1 | 2 | 3 | 4 }
const mul = (A: number[][], B: number[][]) => A.map((r) => B[0].map((_, j) => r.reduce((s, v, k) => s + v * B[k][j], 0)))

function targets(k: number): Target[] {
  const R90 = [[0, -1], [1, 0]], SX = [[1, 0], [0, -1]], SY = [[-1, 0], [0, 1]], SD = [[0, 1], [1, 0]]
  return [
    { name: 'Escala', m: [[k, 0], [0, k]], desc: `Agrandar todo ×${k}`, level: 1 },
    { name: 'Estirar en x', m: [[k, 0], [0, 1]], desc: `Estirar ×${k} solo en horizontal`, level: 1 },
    { name: 'Simetría eje x', m: SX, desc: 'Reflejar respecto del eje x', level: 2 },
    { name: 'Simetría eje y', m: SY, desc: 'Reflejar respecto del eje y', level: 2 },
    { name: 'Simetría y = x', m: SD, desc: 'Reflejar respecto de la recta y = x', level: 2 },
    { name: 'Rotación 90°', m: R90, desc: 'Rotar 90° en sentido antihorario', level: 2 },
    { name: 'Rotación 180°', m: [[-1, 0], [0, -1]], desc: 'Rotar 180°', level: 2 },
    { name: 'Rotación −90°', m: [[0, 1], [-1, 0]], desc: 'Rotar 90° en sentido horario', level: 3 },
    { name: 'Cizalladura', m: [[1, k], [0, 1]], desc: `Deslizar horizontalmente: (x, y) → (x + ${k}y, y)`, level: 3 },
    { name: 'Rotar y escalar', m: mul([[k, 0], [0, k]], R90), desc: `Rotar 90° antihorario y agrandar ×${k}`, level: 4 },
    { name: 'Reflejar y estirar', m: mul([[k, 0], [0, 1]], SX), desc: `Reflejar en el eje x y estirar ×${k} en horizontal`, level: 4 },
  ]
}

const ROUNDS = 6

export default function MatrixArchitect() {
  const [seed, setSeed] = useState(newSeedSafe)
  const [i, setI] = useState(0)
  const [score, setScore] = useState(0)
  const [m, setM] = useState([[1, 0], [0, 1]])
  const [tries, setTries] = useState(0)
  const [state, setState] = useState<'play' | 'ok' | 'shown'>('play')
  const [msg, setMsg] = useState<string | null>(null)
  const [showTarget, setShowTarget] = useState(true)
  const target = useMemo(() => {
    const r = makeRand(seed + i * 211)
    const lvl = Math.min(4, 1 + Math.floor(i / 1.5))
    const pool = targets(r.pick([2, 3])).filter((t) => t.level <= lvl && t.level >= lvl - 1)
    return r.pick(pool)
  }, [seed, i])

  const check = () => {
    const ok = m.every((row, a) => row.every((v, b) => Math.abs(v - target.m[a][b]) < 1e-9))
    setTries((t) => t + 1)
    const fake: Exercise = { id: `arq:${seed}:${i}`, templateId: 'arquitecto', seed, area: 'matrices', unit: 'm7', subtopic: 'Transformaciones', concepts: ['m7.transformaciones'], level: target.level, levelWhy: '', prompt: '', hints: [], solution: [], explanation: '', commonErrors: [], prereqs: [], estMinutes: 2, kind: 'matrix', rows: 2, cols: 2, answer: [['0', '0'], ['0', '0']] }
    if (tries === 0) recordAttempt(fake, ok ? 1 : 0, { hintsUsed: 0, solutionShown: false, timeMs: 0, source: 'juego' })
    if (ok) { const pts = Math.max(5, 25 - 5 * tries); setScore((s) => s + pts); setState('ok'); setMsg(`¡Exacto! +${pts}`); return }
    const c1 = [m[0][0], m[1][0]], t1 = [target.m[0][0], target.m[1][0]]
    if (c1[0] !== t1[0] || c1[1] !== t1[1]) setMsg(`Pensá adónde tiene que ir el vector e₁ = (1, 0): tu matriz lo manda a (${fmt(c1[0])}; ${fmt(c1[1])}). La primera columna es esa imagen.`)
    else setMsg(`La primera columna está bien. Ahora: ¿adónde va e₂ = (0, 1)? Tu matriz lo manda a (${fmt(m[0][1])}; ${fmt(m[1][1])}).`)
  }
  const next = () => {
    const n = i + 1
    if (n >= ROUNDS) recordGame('arquitecto', { score, xp: Math.round(score / 4) })
    setI(n); setM([[1, 0], [0, 1]]); setTries(0); setState('play'); setMsg(null)
  }
  if (i >= ROUNDS)
    return <GameShell id="arquitecto"><GameOver title={`${score} puntos`} lines={['Truco: las columnas de la matriz son las imágenes de (1, 0) y (0, 1).']} onAgain={() => { setSeed(newSeedSafe()); setI(0); setScore(0) }} /></GameShell>

  return (
    <GameShell id="arquitecto">
      <ScoreBar items={[{ label: 'Plano', value: `${i + 1}/${ROUNDS}` }, { label: 'Puntos', value: score, tone: 'brand' }]} />
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_19rem]">
        <div className="card p-3"><TransformView m={m} target={showTarget ? target.m : undefined} /></div>
        <div className="card grid content-start gap-3 p-4">
          <div><div className="label">Encargo</div><p className="text-lg font-semibold">{target.desc}</p></div>
          <p className="text-xs text-muted">La figura verde punteada es el objetivo; la naranja, lo que hace tu matriz.</p>
          <MatrixEditor m={m} onChange={(x) => state === 'play' && setM(x)} step={1} />
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={showTarget} onChange={(e) => setShowTarget(e.target.checked)} /> Mostrar el objetivo</label>
          {state === 'play' ? (
            <div className="flex flex-wrap gap-2"><button type="button" className="btn-primary" onClick={check}>Construir</button>{tries >= 2 && <button type="button" className="btn-ghost" onClick={() => { setM(target.m.map((r) => r.slice())); setState('shown'); setMsg('Esta es la matriz pedida.') }}>Ver solución</button>}</div>
          ) : <button type="button" className="btn-primary" onClick={next}>{i + 1 < ROUNDS ? 'Siguiente encargo →' : 'Ver resultado'}</button>}
          {msg && <p className={'rounded-xl p-3 text-sm ' + (state === 'ok' ? 'bg-ok/10 text-ok' : 'bg-warn/10')} role="status">{msg}</p>}
        </div>
      </div>
    </GameShell>
  )
}
