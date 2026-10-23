/** Juego 3 · Duelo contra reloj. */
import { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import type { AreaId, Exercise } from '../engine/types'
import { closestLevel, instantiate } from '../engine/registry'
import { quickTemplates } from '../engine/adaptive'
import { validate } from '../engine/validate'
import { AREAS, unitById } from '../content/curriculum'
import { recordAttempt, recordGame, useProgress } from '../progress/store'
import { AnswerInput, emptyDraft, isDraftReady, type Draft } from '../exercise/inputs'
import { specToPlot } from '../exercise/ExerciseView'
import { Md } from '../ui/Md'
import { Plot } from '../ui/Plot'
import { GameOver, GameShell, ScoreBar } from './common'
import { makeRand, newSeedSafe } from './util'

const DURATION = 90

function quickExercise(seed: number, areas: AreaId[]): Exercise {
  const r = makeRand(seed)
  const ts = quickTemplates(areas)
  for (let k = 0; k < 30; k++) {
    const t = r.pick(ts)
    const ex = instantiate(t.id, r.int(1, 1e9), closestLevel(t, r.pick([1, 2])))
    if (ex.kind === 'mc' || ex.kind === 'numeric' || ex.kind === 'tf') return ex
  }
  const t = r.pick(ts)
  return instantiate(t.id, r.int(1, 1e9), closestLevel(t, 1))
}

export default function Duel() {
  const [sp] = useSearchParams()
  const unit = sp.get('unidad')
  const s = useProgress()
  const [areas, setAreas] = useState<AreaId[]>(() => (unit && unitById(unit) ? [unitById(unit)!.area] : AREAS.map((a) => a.id)))
  const [phase, setPhase] = useState<'setup' | 'play' | 'over'>('setup')
  const [seed, setSeed] = useState(newSeedSafe)
  const [n, setN] = useState(0)
  const [left, setLeft] = useState(DURATION)
  const [score, setScore] = useState(0)
  const [combo, setCombo] = useState(0)
  const [stats, setStats] = useState({ ok: 0, bad: 0 })
  const [flash, setFlash] = useState<null | { ok: boolean; msg: string }>(null)
  const ex = useMemo(() => quickExercise(seed + n * 977, areas), [seed, n, areas])
  const [draft, setDraft] = useState<Draft>(() => emptyDraft(ex))
  const t0 = useRef(Date.now())
  const ended = useRef(false)

  useEffect(() => { setDraft(emptyDraft(ex, ex.seed)); t0.current = Date.now() }, [ex])
  useEffect(() => {
    if (phase !== 'play') return
    const id = setInterval(() => setLeft((l) => l - 1), 1000)
    return () => clearInterval(id)
  }, [phase])
  useEffect(() => {
    if (phase === 'play' && left <= 0 && !ended.current) {
      ended.current = true
      setPhase('over')
      recordGame('duelo', { score, duel: true, xp: score })
    }
  }, [left, phase, score])

  const submit = () => {
    if (!isDraftReady(ex, draft)) return
    const fb = validate(ex, draft)
    if (fb.verdict === 'invalid') { setFlash({ ok: false, msg: fb.message }); return }
    const ok = fb.verdict === 'correct'
    recordAttempt(ex, ok ? 1 : 0, { hintsUsed: 0, solutionShown: false, timeMs: Date.now() - t0.current, source: 'juego', message: fb.message, errorTag: fb.errorTag })
    if (ok) { setScore((x) => x + 1 + Math.floor(combo / 3)); setCombo((c) => c + 1); setStats((x) => ({ ...x, ok: x.ok + 1 })) }
    else { setCombo(0); setStats((x) => ({ ...x, bad: x.bad + 1 })) }
    setFlash({ ok, msg: ok ? '¡Bien!' : fb.message })
    setN((k) => k + 1)
  }

  const start = () => { setSeed(newSeedSafe()); setN(0); setLeft(DURATION); setScore(0); setCombo(0); setStats({ ok: 0, bad: 0 }); setFlash(null); ended.current = false; setPhase('play') }

  if (phase === 'setup')
    return (
      <GameShell id="duelo">
        <div className="card-pad mx-auto grid max-w-xl gap-4">
          <p>Tenés <b>{DURATION} segundos</b>. Cada respuesta correcta suma 1 punto, y cada 3 seguidas el premio crece. Un error corta la racha (pero no resta).</p>
          <div className="label">Áreas</div>
          <div className="flex flex-wrap gap-2">{AREAS.map((a) => <button key={a.id} type="button" aria-pressed={areas.includes(a.id)} className={'btn-sm btn border ' + (areas.includes(a.id) ? 'border-brand bg-brand/15' : 'border-line bg-surface2/50 text-muted')} onClick={() => setAreas((x) => (x.includes(a.id) ? (x.length > 1 ? x.filter((y) => y !== a.id) : x) : [...x, a.id]))}>{a.name}</button>)}</div>
          <p className="text-sm text-muted">Tu récord: <b>{s.records.duelBest}</b> puntos.</p>
          <button type="button" className="btn-primary" onClick={start}>¡Empezar!</button>
        </div>
      </GameShell>
    )
  if (phase === 'over')
    return <GameShell id="duelo"><GameOver title={`${score} puntos`} lines={[`${stats.ok} correctas y ${stats.bad} incorrectas.`, score >= s.records.duelBest && score > 0 ? '🎉 ¡Nuevo récord!' : `Récord: ${s.records.duelBest}`]} onAgain={start} /></GameShell>

  return (
    <GameShell id="duelo">
      <ScoreBar items={[{ label: 'Tiempo', value: `${left}s`, tone: left <= 10 ? 'bad' : 'warn' }, { label: 'Puntos', value: score, tone: 'brand' }, { label: 'Racha', value: combo, tone: 'ok' }]} />
      <div className="mb-3 h-2 overflow-hidden rounded-full bg-line"><div className="h-full bg-gradient-to-r from-ader to-bad transition-all" style={{ width: `${(left / DURATION) * 100}%` }} /></div>
      <form className="card-pad grid gap-4" onSubmit={(e) => { e.preventDefault(); submit() }}>
        <Md as="div" text={ex.prompt} className="text-lg" />
        {ex.plot && <Plot {...specToPlot(ex.plot)} interactive={false} />}
        <AnswerInput ex={ex} draft={draft} onChange={setDraft} seed={ex.seed} />
        <div className="flex flex-wrap items-center gap-3">
          <button type="submit" className="btn-primary" disabled={!isDraftReady(ex, draft)}>Responder</button>
          <button type="button" className="btn-ghost" onClick={() => { setCombo(0); setN((k) => k + 1); setFlash(null) }}>Saltar</button>
          {flash && <span className={'text-sm ' + (flash.ok ? 'text-ok' : 'text-bad')} role="status"><Md text={flash.msg} /></span>}
        </div>
      </form>
    </GameShell>
  )
}
