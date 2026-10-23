/** Reproductor de ejercicios: responder, diagnóstico, pistas graduales, solución y explicación. */
import { useEffect, useMemo, useRef, useState } from 'react'
import type { Exercise, Feedback, PlotSpec } from '../engine/types'
import { LEVEL_INFO } from '../engine/types'
import { correctAnswerText, validate } from '../engine/validate'
import { conceptName } from '../content/curriculum'
import { recordAttempt, useProgress, type AttemptMeta } from '../progress/store'
import { Md, TeX } from '../ui/Md'
import { Plot, type PlotFn } from '../ui/Plot'
import { AnswerInput, emptyDraft, isDraftReady, type Draft } from './inputs'

export function specToPlot(spec: PlotSpec) {
  return {
    fns: (spec.fns ?? []).map((f): PlotFn => ({ f: f.expr, color: f.color, dashed: f.dashed, label: f.label, domain: f.domain })),
    points: spec.points?.map((p) => ({ x: p.x, y: p.y, label: p.label, open: p.open, color: p.color })),
    vectors: spec.vectors,
    shades: spec.shade?.map((s) => ({ f: s.expr, under: s.under, a: s.a, b: s.b, signed: !s.under })),
    vlines: spec.vlines,
    x: spec.x,
    y: spec.y,
  }
}

export function LevelBadge({ level, why }: { level: Exercise['level']; why?: string }) {
  const [open, setOpen] = useState(false)
  const colors = ['', 'bg-avec/15 text-avec', 'bg-afun/15 text-afun', 'bg-amat/15 text-amat', 'bg-ader/15 text-ader', 'bg-aint/15 text-aint', 'bg-bad/15 text-bad']
  return (
    <span className="relative inline-flex">
      <button type="button" className={'chip !border-transparent font-semibold ' + colors[level]} onClick={() => setOpen((o) => !o)} aria-expanded={open} title="¿Por qué este nivel?">
        N{level} · {LEVEL_INFO[level].name}
      </button>
      {open && why && (
        <span role="tooltip" className="absolute left-0 top-full z-20 mt-1 w-72 rounded-xl border border-line bg-surface p-3 text-xs text-muted shadow-xl anim-pop"><Md text={why} /></span>
      )}
    </span>
  )
}

interface Props {
  ex: Exercise
  /** se llama con cada corrección */
  onResult?: (fb: Feedback, meta: AttemptMeta & { score: number }) => void
  onNext?: () => void
  nextLabel?: string
  source?: AttemptMeta['source']
  /** no registrar en el progreso (p. ej. el sandbox) */
  noRecord?: boolean
  /** permitir pistas y solución */
  allowHelp?: boolean
  compact?: boolean
}

type Phase = 'answering' | 'wrong' | 'done'

export function ExerciseView({ ex, onResult, onNext, nextLabel = 'Siguiente', source = 'practica', noRecord, allowHelp = true, compact }: Props) {
  const settings = useProgress().settings
  const [draft, setDraft] = useState<Draft>(() => emptyDraft(ex, ex.seed))
  const [fb, setFb] = useState<Feedback | null>(null)
  const [phase, setPhase] = useState<Phase>('answering')
  const [hints, setHints] = useState(0)
  const [showSol, setShowSol] = useState(false)
  const [attempts, setAttempts] = useState(0)
  const [xpGained, setXp] = useState<number | null>(null)
  const [shake, setShake] = useState(false)
  const start = useRef(Date.now())
  const recorded = useRef(false)
  const fbRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setDraft(emptyDraft(ex, ex.seed)); setFb(null); setPhase('answering'); setHints(0); setShowSol(false); setAttempts(0); setXp(null)
    start.current = Date.now(); recorded.current = false
  }, [ex])

  const plot = useMemo(() => (ex.plot ? specToPlot(ex.plot) : null), [ex])
  const ready = isDraftReady(ex, draft)

  const finish = (f: Feedback, solutionShown: boolean) => {
    const score = solutionShown ? 0 : f.score
    const meta: AttemptMeta = { hintsUsed: hints, solutionShown, timeMs: Date.now() - start.current, source, message: f.message, errorTag: f.errorTag }
    if (!recorded.current && !noRecord) {
      recorded.current = true
      const r = recordAttempt(ex, score, meta)
      setXp(r.xp)
    }
    onResult?.(f, { ...meta, score })
  }

  const check = () => {
    if (!ready) return
    const f = validate(ex, draft)
    setFb(f)
    setAttempts((a) => a + 1)
    requestAnimationFrame(() => fbRef.current?.focus())
    if (f.verdict === 'correct') {
      setPhase('done')
      finish(f, false)
    } else if (f.verdict === 'invalid' || f.verdict === 'unknown') {
      // no cuenta como intento fallido: hay que corregir la escritura
    } else {
      setPhase('wrong')
      setShake(true)
      setTimeout(() => setShake(false), 350)
      // el primer error ya se registra para el seguimiento (y el repaso)
      if (!recorded.current && !noRecord) {
        recorded.current = true
        const meta: AttemptMeta = { hintsUsed: hints, solutionShown: false, timeMs: Date.now() - start.current, source, message: f.message, errorTag: f.errorTag }
        recordAttempt(ex, f.score * 0.5, meta)
        onResult?.(f, { ...meta, score: f.score * 0.5 })
      }
    }
  }

  const revealSolution = () => {
    setShowSol(true)
    setPhase('done')
    if (!recorded.current) finish(fb ?? { verdict: 'incorrect', message: 'Viste la solución.', score: 0 }, true)
  }

  const hintLabels = ['Pista sutil', 'Pista concreta', 'Otra pista']

  return (
    <article className={'grid gap-4 ' + (compact ? '' : 'card-pad')} aria-label="Ejercicio">
      <header className="flex flex-wrap items-center gap-2">
        <LevelBadge level={ex.level} why={ex.levelWhy} />
        <span className="chip">{ex.subtopic}</span>
        {settings.showTimer && <span className="chip" title="Tiempo estimado">⏱ {ex.estMinutes} min</span>}
        {ex.noCalc && <span className="chip" title="Pensado para resolver sin calculadora">sin calculadora</span>}
      </header>

      <div className="prose-mv text-[1.05rem]"><Md as="div" text={ex.prompt} /></div>
      {plot && <Plot {...plot} />}

      <div className={shake ? 'anim-shake' : ''}>
        <AnswerInput ex={ex} draft={draft} onChange={(d) => { setDraft(d); if (phase === 'wrong') setPhase('answering') }} disabled={phase === 'done'} feedback={fb} reveal={showSol} seed={ex.seed} />
      </div>

      {fb && (
        <div ref={fbRef} tabIndex={-1} role="status" aria-live="polite"
          className={'rounded-xl border p-4 anim-up ' + (fb.verdict === 'correct' ? 'border-ok/50 bg-ok/10' : fb.verdict === 'unknown' || fb.verdict === 'invalid' ? 'border-warn/50 bg-warn/10' : 'border-bad/50 bg-bad/10')}>
          <div className="mb-1 font-semibold">
            {fb.verdict === 'correct' ? '✓ ¡Bien!' : fb.verdict === 'partial' ? '◐ Parcialmente correcto' : fb.verdict === 'unknown' ? '? No lo puedo decidir' : fb.verdict === 'invalid' ? '✎ Revisá cómo lo escribiste' : '✗ Todavía no'}
            {xpGained !== null && xpGained > 0 && fb.verdict === 'correct' && <span className="ml-2 chip !border-brand/40 text-brand">+{xpGained} XP</span>}
          </div>
          <Md as="div" text={fb.message} />
          {fb.parts && fb.parts.length > 0 && ex.kind === 'fill' && (
            <ul className="mt-2 grid gap-1 text-sm">{fb.parts.filter((p) => p.verdict !== 'correct').map((p) => <li key={p.label}>Casillero <b>{p.label}</b>: <Md text={p.message} /></li>)}</ul>
          )}
        </div>
      )}

      {hints > 0 && phase !== 'done' && (
        <div className="grid gap-2">
          {ex.hints.slice(0, hints).map((h, i) => (
            <div key={i} className="rounded-xl border border-brand2/40 bg-brand2/10 p-3 text-sm anim-up"><span className="font-semibold text-brand2">{hintLabels[Math.min(i, 2)]}: </span><Md text={h} /></div>
          ))}
        </div>
      )}

      {phase !== 'done' && (
        <div className="flex flex-wrap gap-2">
          <button type="button" className="btn-primary" onClick={check} disabled={!ready}>{phase === 'wrong' ? 'Volver a comprobar' : 'Comprobar'}</button>
          {allowHelp && hints < ex.hints.length && (attempts > 0 || hints > 0 || phase === 'answering') && (
            <button type="button" className="btn-ghost" onClick={() => setHints((h) => h + 1)}>💡 {hints === 0 ? 'Pedir una pista' : 'Otra pista'}</button>
          )}
          {((allowHelp && (attempts > 0 || hints >= ex.hints.length)) || (!allowHelp && phase === 'wrong')) && (
            <button type="button" className="btn-ghost" onClick={revealSolution}>{allowHelp ? 'Ver la solución' : 'Ver la solución y seguir'}</button>
          )}
          {phase === 'wrong' && <span className="self-center text-sm text-muted">Podés corregir y reintentar, pedir una pista o ver la solución.</span>}
        </div>
      )}

      {phase === 'done' && (
        <section className="grid gap-3 anim-up" aria-label="Resolución">
          {showSol && <div className="rounded-xl border border-line bg-surface2/50 p-3 text-sm"><span className="label">Respuesta: </span><Md text={correctAnswerText(ex)} /></div>}
          <details className="rounded-xl border border-line bg-surface2/40 p-4" open={showSol || fb?.verdict !== 'correct'}>
            <summary className="cursor-pointer font-semibold">Resolución paso a paso</summary>
            <ol className="mt-3 grid gap-2">
              {ex.solution.map((s, i) => (
                <li key={i} className="grid gap-1">
                  {s.text && <Md as="div" text={s.text} />}
                  {s.tex && <div className="overflow-x-auto"><TeX tex={s.tex} display /></div>}
                </li>
              ))}
            </ol>
          </details>
          <div className="rounded-xl border border-brand/30 bg-brand/5 p-4 text-sm">
            <div className="label mb-1 !text-brand">¿Por qué funciona?</div>
            <Md as="div" text={ex.explanation} />
          </div>
          {ex.commonErrors.length > 0 && (
            <div className="text-sm text-muted"><span className="label">Errores frecuentes: </span>{ex.commonErrors.map((c, i) => <span key={i}><Md text={c} />{i < ex.commonErrors.length - 1 ? ' · ' : ''}</span>)}</div>
          )}
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
            Conceptos: {ex.concepts.map((c) => <span key={c} className="chip">{conceptName(c)}</span>)}
          </div>
          {onNext && <div><button type="button" className="btn-primary" onClick={onNext}>{nextLabel} →</button></div>}
        </section>
      )}
    </article>
  )
}
