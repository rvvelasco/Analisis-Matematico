/** Juego 2 · Cazador de errores: decidir si una resolución está bien y encontrar el error. */
import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import type { Exercise } from '../engine/types'
import { ALL_TEMPLATES, closestLevel, instantiate } from '../engine/registry'
import { correctAnswerText } from '../engine/validate'
import { unitById } from '../content/curriculum'
import { parse, toTeX } from '../math/expr'
import { fmt } from '../math/numeric'
import { recordAttempt, recordGame } from '../progress/store'
import { ExerciseView, specToPlot } from '../exercise/ExerciseView'
import { Plot } from '../ui/Plot'
import { Md, TeX } from '../ui/Md'
import { GameOver, GameShell, ScoreBar } from './common'
import { makeRand, newSeedSafe } from './util'

type Claim = { ex: Exercise; claimTeX: string; isRight: boolean; why: string }
type Round = { kind: 'claim'; claim: Claim } | { kind: 'step'; ex: Exercise }

const ROUNDS = 8

function makeRound(seed: number, area: string | null): Round {
  const r = makeRand(seed)
  const pool = ALL_TEMPLATES.filter((t) => !area || t.area === area)
  const steps = pool.filter((t) => t.id.includes('error') || t.id.includes('Error'))
  if (steps.length && r.chance(0.3)) {
    const t = r.pick(steps)
    return { kind: 'step', ex: instantiate(t.id, r.int(1, 1e9), t.levels[0]) }
  }
  for (let tries = 0; tries < 40; tries++) {
    const t = r.pick(pool)
    const ex = instantiate(t.id, r.int(1, 1e9), closestLevel(t, r.pick([2, 3, 4])))
    if (ex.kind === 'expression' && ex.wrong && ex.wrong.length) {
      const right = r.chance(0.45)
      const w = r.pick(ex.wrong)
      let wrongTeX: string
      try { wrongTeX = toTeX(parse(w.expr, { vars: [ex.v] })) } catch { continue }
      return { kind: 'claim', claim: { ex, isRight: right, claimTeX: right ? correctAnswerText(ex).replace(/\$/g, '') : wrongTeX + (ex.mode === 'upToConstant' ? ' + C' : ''), why: right ? 'El resultado es correcto: comprobalo derivando o evaluando en un punto.' : w.why } }
    }
    if (ex.kind === 'numeric' && ex.wrong && ex.wrong.length) {
      const right = r.chance(0.45)
      const w = r.pick(ex.wrong)
      return { kind: 'claim', claim: { ex, isRight: right, claimTeX: right ? (ex.answerText ?? fmt(ex.answer, 4)).replace('.', '{,}') : fmt(w.value, 4).replace(',', '{,}'), why: right ? 'El resultado es correcto.' : w.why } }
    }
  }
  const t = r.pick(steps.length ? steps : ALL_TEMPLATES.filter((x) => x.id.includes('error')))
  return { kind: 'step', ex: instantiate(t.id, r.int(1, 1e9), t.levels[0]) }
}

export default function ErrorHunter() {
  const [sp] = useSearchParams()
  const unit = sp.get('unidad')
  const area = unit ? unitById(unit)?.area ?? null : null
  const [seed, setSeed] = useState(newSeedSafe)
  const [i, setI] = useState(0)
  const [lives, setLives] = useState(3)
  const [score, setScore] = useState(0)
  const [answer, setAnswer] = useState<boolean | null>(null)
  const [stepDone, setStepDone] = useState<number | null>(null)
  const round = useMemo(() => makeRound(seed + i * 7919, area), [seed, i, area])
  const over = i >= ROUNDS || lives <= 0

  const judge = (says: boolean) => {
    if (round.kind !== 'claim' || answer !== null) return
    setAnswer(says)
    const ok = says === round.claim.isRight
    recordAttempt(round.claim.ex, ok ? 1 : 0, { hintsUsed: 0, solutionShown: false, timeMs: 0, source: 'juego', message: round.claim.why })
    if (ok) setScore((s) => s + 10)
    else setLives((l) => l - 1)
  }
  const next = () => {
    setAnswer(null); setStepDone(null)
    const n = i + 1
    if (n >= ROUNDS || lives <= 0) recordGame('cazador', { score, xp: Math.round(score / 4) })
    setI(n)
  }

  if (over)
    return <GameShell id="cazador"><GameOver title={`${score} puntos`} lines={[lives <= 0 ? 'Te quedaste sin vidas.' : `Revisaste ${ROUNDS} resoluciones.`, 'Detectar errores ajenos entrena el ojo para los propios.']} onAgain={() => { setSeed(newSeedSafe()); setI(0); setLives(3); setScore(0) }} /></GameShell>

  return (
    <GameShell id="cazador">
      <ScoreBar items={[{ label: 'Ronda', value: `${i + 1}/${ROUNDS}` }, { label: 'Puntos', value: score, tone: 'brand' }, { label: 'Vidas', value: '❤️'.repeat(lives) + '🖤'.repeat(3 - lives) }]} />
      {round.kind === 'claim' ? (
        <div className="card-pad grid gap-4">
          <div className="label">Un compañero resolvió:</div>
          <Md as="div" text={round.claim.ex.prompt} className="text-lg" />
          {round.claim.ex.plot && <Plot {...specToPlot(round.claim.ex.plot)} />}
          <div className="rounded-xl border border-line bg-surface2/50 p-4 text-center text-lg"><span className="text-muted">Su respuesta: </span><TeX tex={round.claim.claimTeX} /></div>
          {answer === null ? (
            <div className="flex flex-wrap gap-2">
              <button type="button" className="btn-primary flex-1" onClick={() => judge(true)}>✓ Está bien</button>
              <button type="button" className="btn-ghost flex-1 !border-bad/60" onClick={() => judge(false)}>✗ Tiene un error</button>
            </div>
          ) : (
            <div className={'rounded-xl border p-4 anim-up ' + (answer === round.claim.isRight ? 'border-ok/50 bg-ok/10' : 'border-bad/50 bg-bad/10')} role="status">
              <div className="font-semibold">{answer === round.claim.isRight ? '¡Bien visto! +10' : 'Uy, no.'} {round.claim.isRight ? 'La respuesta era correcta.' : 'La respuesta tenía un error.'}</div>
              <Md as="div" text={round.claim.why} />
              {!round.claim.isRight && <p className="mt-2 text-sm">Lo correcto: <Md text={correctAnswerText(round.claim.ex)} /></p>}
              <button type="button" className="btn-primary mt-3" onClick={next}>Siguiente →</button>
            </div>
          )}
        </div>
      ) : (
        <div className="grid gap-3">
          <ExerciseView key={round.ex.id} ex={round.ex} allowHelp={false} source="juego"
            onResult={(fb, meta) => { if (stepDone !== null) return; setStepDone(meta.score); if (meta.score >= 0.999) setScore((s) => s + 15); else setLives((l) => l - 1); void fb }}
            onNext={stepDone !== null ? next : undefined} />
        </div>
      )}
    </GameShell>
  )
}
