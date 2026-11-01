/**
 * Reproductor de lecciones estilo app de aprendizaje:
 * barra de avance, vidas, botón COMPROBAR y una franja de resultado (verde o roja) abajo.
 */
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import type { Exercise, Feedback } from '../engine/types'
import { LEVEL_INFO } from '../engine/types'
import { correctAnswerText, validate } from '../engine/validate'
import { recordAttempt, type AttemptMeta } from '../progress/store'
import { Md, TeX } from '../ui/Md'
import { Plot } from '../ui/Plot'
import { Mascot, Speech } from '../ui/Mascot'
import { Bar } from '../ui/Layout'
import { Icon } from '../ui/icons'
import { sfx } from '../ui/sfx'
import { AnswerInput, emptyDraft, isDraftReady, type Draft } from './inputs'
import { specToPlot } from './ExerciseView'

export interface SessionResult { ex: Exercise; score: number; hints: number; solution: boolean }

const PRAISE = ['¡Muy bien!', '¡Excelente!', '¡Genial!', '¡Perfecto!', '¡Así se hace!', '¡Bien ahí!']
const ENCOURAGE = ['No pasa nada, así se aprende.', 'Casi. Mirá cómo se hace y seguimos.', 'Tranqui: este vuelve más adelante.']
const MAX_HEARTS = 5

interface Props {
  items: Exercise[]
  title?: string
  /** pistas y "ver la solución" */
  allowHelp?: boolean
  source?: AttemptMeta['source']
  /** usar vidas (se pierde una por error) */
  hearts?: boolean
  /** repetir al final los ejercicios errados (una vez, sin contar para el progreso) */
  requeue?: boolean
  /** dentro de una página (no a pantalla completa) */
  embedded?: boolean
  /** no registrar en el progreso */
  noRecord?: boolean
  onAnswer?: (ex: Exercise, correct: boolean, index: number) => void
  onFinish?: (r: SessionResult[]) => void
  onExit?: () => void
  /** contenido extra en la pantalla final */
  endView?: (r: SessionResult[]) => ReactNode
  endTitle?: (r: SessionResult[]) => string
  /** texto del botón final */
  doneLabel?: string
  onRestart?: () => void
}

interface QItem { ex: Exercise; retry: boolean; orig: number }

export function SessionPlayer({ items, title, allowHelp = true, source = 'practica', hearts = false, requeue = false, embedded, noRecord, onAnswer, onFinish, onExit, endView, endTitle, doneLabel = 'Continuar', onRestart }: Props) {
  const [queue, setQueue] = useState<QItem[]>(() => items.map((ex, i) => ({ ex, retry: false, orig: i })))
  const [pos, setPos] = useState(0)
  const [results, setResults] = useState<SessionResult[]>([])
  const [lives, setLives] = useState(MAX_HEARTS)
  const [xp, setXp] = useState(0)
  const [streak, setStreak] = useState(0)
  const [askExit, setAskExit] = useState(false)
  const start = useRef(Date.now())
  const [elapsed, setElapsed] = useState(0)
  const finished = pos >= queue.length
  const noLives = hearts && lives <= 0 && !finished

  useEffect(() => {
    setQueue(items.map((ex, i) => ({ ex, retry: false, orig: i })))
    setPos(0); setResults([]); setLives(MAX_HEARTS); setXp(0); setStreak(0); start.current = Date.now()
  }, [items])

  const firstRun = queue.filter((q) => !q.retry).length
  const doneCount = Math.min(pos, queue.length)
  const progress = queue.length ? doneCount / queue.length : 0

  if (!items.length) return <div className="card-pad text-center font-semibold text-muted">No hay ejercicios disponibles para esto todavía.</div>

  const shell = embedded ? 'card flex min-h-[32rem] flex-col overflow-hidden' : 'fixed inset-0 z-40 flex flex-col bg-bg'

  if (finished || noLives) {
    const ok = results.filter((r) => r.score >= 0.999).length
    const total = results.length
    const acc = total ? Math.round((ok / total) * 100) : 0
    const secs = Math.round(elapsed / 1000)
    return (
      <div className={shell}>
        <div className="flex flex-1 flex-col items-center justify-center gap-5 overflow-y-auto px-5 py-8 text-center anim-pop">
          {noLives ? <Mascot mood="sad" size={130} /> : <div className="relative"><Confetti /><Mascot mood="party" size={140} className="anim-bob" /></div>}
          <h2 className={'text-3xl ' + (noLives ? 'text-bad' : 'text-gold')}>{noLives ? 'Te quedaste sin vidas' : endTitle?.(results) ?? '¡Lección completada!'}</h2>
          {noLives && <p className="max-w-md font-semibold text-muted">No te preocupes: equivocarse es parte de aprender. Repasá la explicación y volvé a intentarlo.</p>}
          {!noLives && (
            <div className="grid w-full max-w-md grid-cols-3 gap-3">
              <StatTile color="gold" label="Puntos" value={`+${xp}`} icon="💎" />
              <StatTile color={acc >= 80 ? 'brand' : acc >= 50 ? 'a-der' : 'bad'} label="Aciertos" value={`${acc}%`} icon="🎯" />
              <StatTile color="brand2" label="Tiempo" value={secs >= 60 ? `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}` : `${secs}s`} icon="⏱" />
            </div>
          )}
          {endView && <div className="w-full max-w-md">{endView(results)}</div>}
        </div>
        <footer className="border-t-2 border-line px-4 py-4 sm:py-6">
          <div className="mx-auto flex max-w-3xl flex-wrap justify-end gap-3">
            {(noLives || onRestart) && <button type="button" className="btn-ghost flex-1 sm:flex-none" onClick={() => { if (onRestart) onRestart(); else { setQueue(items.map((ex, i) => ({ ex, retry: false, orig: i }))); setPos(0); setResults([]); setLives(MAX_HEARTS); setXp(0); start.current = Date.now() } }}>Intentar de nuevo</button>}
            {onExit && <button type="button" className="btn-primary flex-1 sm:flex-none sm:min-w-[12rem]" onClick={onExit} autoFocus>{noLives ? 'Salir' : doneLabel}</button>}
          </div>
        </footer>
      </div>
    )
  }

  const cur = queue[pos]
  const advance = (r: { correct: boolean; score: number; hints: number; solution: boolean; xp: number }) => {
    if (!cur.retry) {
      setResults((list) => [...list, { ex: cur.ex, score: r.score, hints: r.hints, solution: r.solution }])
      onAnswer?.(cur.ex, r.correct, cur.orig)
    }
    setXp((x) => x + r.xp)
    if (r.correct) setStreak((s) => s + 1)
    else {
      setStreak(0)
      if (hearts) setLives((l) => l - 1)
      if (requeue && !cur.retry) setQueue((q) => [...q, { ...cur, retry: true }])
    }
  }
  const next = () => {
    const np = pos + 1
    if (np >= queue.length) {
      setElapsed(Date.now() - start.current)
      sfx.finish()
      // los resultados ya están actualizados en este punto
      onFinish?.(results)
    }
    setPos(np)
  }

  return (
    <div className={shell}>
      <header className={'flex items-center gap-3 px-4 pt-4 sm:gap-5 sm:px-6 ' + (embedded ? 'pb-2' : 'pb-2 sm:pt-6')}>
        {onExit && (
          <button type="button" onClick={() => (results.length ? setAskExit(true) : onExit())} className="shrink-0 text-muted hover:text-ink" aria-label="Salir de la lección">
            <Icon name="close" className="h-7 w-7" />
          </button>
        )}
        <Bar value={progress} className="flex-1" />
        {hearts && <span className="flex shrink-0 items-center gap-1 text-lg font-black text-bad" aria-label={`${lives} vidas`}>❤️ {lives}</span>}
        {!hearts && title && <span className="hidden shrink-0 text-sm font-extrabold uppercase text-muted sm:block">{title}</span>}
      </header>
      {streak >= 3 && <div className="text-center text-sm font-black uppercase tracking-wide text-ader anim-pop" key={streak}>🔥 {streak} seguidas</div>}
      <Question key={pos + ':' + cur.ex.id} ex={cur.ex} retry={cur.retry} allowHelp={allowHelp} source={source} noRecord={noRecord || cur.retry}
        counter={cur.retry ? 'Volvé a intentarlo' : `${Math.min(cur.orig + 1, firstRun)} de ${firstRun}`} embedded={embedded}
        onResult={advance} onContinue={next} />
      {askExit && (
        <div className="fixed inset-0 z-50 grid place-items-end bg-black/40 sm:place-items-center" role="dialog" aria-modal="true" aria-label="¿Salir?">
          <div className="w-full max-w-md rounded-t-3xl bg-surface p-6 text-center anim-sheet sm:rounded-3xl">
            <Mascot mood="sad" size={90} className="mx-auto" />
            <h3 className="mt-2 text-xl">¿Seguro que querés salir?</h3>
            <p className="mt-1 font-semibold text-muted">Lo que respondiste ya quedó guardado, pero vas a perder el avance de esta lección.</p>
            <div className="mt-5 grid gap-3">
              <button type="button" className="btn-primary" onClick={() => setAskExit(false)} autoFocus>Seguir aprendiendo</button>
              <button type="button" className="btn-soft !text-bad" onClick={onExit}>Salir</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function StatTile({ label, value, icon, color }: { label: string; value: string; icon: string; color: string }) {
  return (
    <div className="overflow-hidden rounded-2xl border-2" style={{ borderColor: `rgb(var(--${color}))`, background: `rgb(var(--${color}))` }}>
      <div className="py-1 text-[0.7rem] font-black uppercase tracking-wide text-white">{label}</div>
      <div className="flex items-center justify-center gap-1 rounded-xl bg-surface py-3 text-xl font-black" style={{ color: `rgb(var(--${color}))` }}><span aria-hidden>{icon}</span>{value}</div>
    </div>
  )
}

function Confetti() {
  const bits = useMemo(() => Array.from({ length: 26 }, (_, i) => ({ left: (i * 37) % 100, delay: (i % 7) * 0.12, color: ['--brand', '--brand2', '--gold', '--a-int', '--a-mat'][i % 5], size: 6 + (i % 4) * 2 })), [])
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden>
      {bits.map((b, i) => <span key={i} className="absolute top-0 rounded-sm" style={{ left: `${b.left}%`, width: b.size, height: b.size * 1.6, background: `rgb(var(${b.color}))`, animation: `confetti 2.4s ${b.delay}s ease-in forwards` }} />)}
    </div>
  )
}

/* ---------- una pregunta ---------- */
function Question({ ex, retry, allowHelp, source, noRecord, counter, embedded, onResult, onContinue }: {
  ex: Exercise; retry: boolean; allowHelp: boolean; source: AttemptMeta['source']; noRecord?: boolean; counter: string; embedded?: boolean
  onResult: (r: { correct: boolean; score: number; hints: number; solution: boolean; xp: number }) => void
  onContinue: () => void
}) {
  const [draft, setDraft] = useState<Draft>(() => emptyDraft(ex, ex.seed))
  const [fb, setFb] = useState<Feedback | null>(null)
  const [warn, setWarn] = useState<string | null>(null)
  const [state, setState] = useState<'answering' | 'right' | 'wrong'>('answering')
  const [hints, setHints] = useState(0)
  const [skipped, setSkipped] = useState(false)
  const [showSteps, setShowSteps] = useState(false)
  const [shake, setShake] = useState(false)
  const [gained, setGained] = useState(0)
  const startT = useRef(Date.now())
  const plot = useMemo(() => (ex.plot ? specToPlot(ex.plot) : null), [ex])
  const ready = isDraftReady(ex, draft)
  const praise = useMemo(() => PRAISE[ex.seed % PRAISE.length], [ex.seed])
  const encourage = useMemo(() => ENCOURAGE[ex.seed % ENCOURAGE.length], [ex.seed])
  const contRef = useRef<HTMLButtonElement>(null)

  useEffect(() => { if (state !== 'answering') contRef.current?.focus() }, [state])

  const record = (score: number, solution: boolean, f?: Feedback) => {
    if (noRecord) return 0
    const meta: AttemptMeta = { hintsUsed: hints, solutionShown: solution, timeMs: Date.now() - startT.current, source, message: f?.message, errorTag: f?.errorTag }
    return recordAttempt(ex, score, meta).xp
  }

  const check = () => {
    if (!ready || state !== 'answering') return
    const f = validate(ex, draft)
    if (f.verdict === 'invalid' || f.verdict === 'unknown') { setWarn(f.message); return }
    setWarn(null)
    setFb(f)
    if (f.verdict === 'correct') {
      sfx.correct()
      const x = record(f.score, false, f)
      setGained(x)
      setState('right')
      onResult({ correct: true, score: f.score, hints, solution: false, xp: x })
    } else {
      sfx.wrong()
      setShake(true); setTimeout(() => setShake(false), 400)
      const x = record(f.score * 0.5, false, f)
      setGained(x)
      setState('wrong')
      onResult({ correct: false, score: f.score * 0.5, hints, solution: false, xp: x })
    }
  }

  const dontKnow = () => {
    if (state !== 'answering') return
    sfx.wrong()
    setSkipped(true)
    setShowSteps(true)
    const f: Feedback = { verdict: 'incorrect', score: 0, message: 'Elegiste ver cómo se resuelve.' }
    setFb(f)
    record(0, true, f)
    setState('wrong')
    onResult({ correct: false, score: 0, hints, solution: true, xp: 0 })
  }

  const levelName = LEVEL_INFO[ex.level].name
  const right = state === 'right'
  const checked = state !== 'answering'

  return (
    <>
      <main className={'flex-1 overflow-y-auto px-4 pb-6 sm:px-6 ' + (embedded ? '' : '')} onKeyDown={(e) => { if (e.key === 'Enter' && !(e.target instanceof HTMLTextAreaElement) && !(e.target instanceof HTMLButtonElement)) { e.preventDefault(); if (checked) onContinue(); else check() } }}>
        <div className="mx-auto grid max-w-2xl gap-5 pt-4 sm:pt-8">
          <div className="flex flex-wrap items-center gap-2 text-sm font-extrabold uppercase tracking-wide">
            {retry ? <span className="text-ader">↻ Volvé a intentarlo</span> : <span className="text-amat">{ex.level >= 4 ? '💪 Difícil' : '✨ Pregunta'} · {counter}</span>}
            <span className="chip" title={LEVEL_INFO[ex.level].desc}>Nivel {ex.level}: {levelName}</span>
            <span className="chip normal-case">{ex.subtopic}</span>
          </div>
          <div className="text-[1.15rem] font-bold leading-relaxed sm:text-xl"><Md as="div" text={ex.prompt} /></div>
          {plot && <Plot {...plot} />}
          {hints > 0 && !checked && (
            <div className="grid gap-2">
              {ex.hints.slice(0, hints).map((h, i) => <Speech key={i} mood="think" size={58}><span className="text-sm"><b className="text-brand2">Pista {i + 1}: </b><Md text={h} /></span></Speech>)}
            </div>
          )}
          <div className={shake ? 'anim-shake' : ''}>
            <AnswerInput ex={ex} draft={draft} onChange={(d) => { setDraft(d); setWarn(null) }} disabled={checked} feedback={skipped ? null : fb} reveal={skipped} seed={ex.seed} />
          </div>
          {warn && <div role="status" className="rounded-2xl border-2 border-gold/60 bg-gold/10 p-3 text-sm font-semibold"><span aria-hidden>✍️ </span><Md text={warn} /></div>}
        </div>
      </main>

      {/* franja inferior */}
      <footer className={'border-t-2 ' + (checked ? (right ? 'border-transparent bg-okbg' : 'border-transparent bg-badbg') + ' anim-sheet' : 'border-line')} role={checked ? 'status' : undefined} aria-live="polite">
        <div className="mx-auto max-w-3xl px-4 py-4 sm:py-6">
          {!checked ? (
            <div className="flex flex-wrap items-center gap-3">
              <button type="button" className="btn-ghost" onClick={dontKnow}>No sé</button>
              {allowHelp && hints < ex.hints.length && <button type="button" className="btn-ghost" onClick={() => setHints((h) => h + 1)}>💡 Pista</button>}
              <button type="button" className="btn-primary ml-auto min-w-[9rem] flex-1 sm:flex-none sm:min-w-[12rem]" onClick={check} disabled={!ready}>Comprobar</button>
            </div>
          ) : (
            <div className="grid gap-3">
              <div className="flex items-start gap-3">
                <span className={'grid h-12 w-12 shrink-0 place-items-center rounded-full bg-surface text-2xl font-black ' + (right ? 'text-ok' : 'text-bad')} aria-hidden>{right ? '✓' : '✕'}</span>
                <div className="min-w-0 flex-1">
                  <div className={'text-2xl font-black ' + (right ? 'text-ok' : 'text-bad')}>{right ? praise : skipped ? 'Así se resuelve' : fb?.verdict === 'partial' ? 'Casi, te faltó una parte' : 'Respuesta incorrecta'}</div>
                  {right && gained > 0 && <div className="font-extrabold text-ok">+{gained} puntos</div>}
                  {!right && (
                    <div className={'mt-1 font-semibold ' + 'text-bad'}>
                      <div className="font-black">Respuesta correcta:</div>
                      <Md as="div" text={correctAnswerText(ex)} />
                    </div>
                  )}
                  {fb && !skipped && fb.message && !right && <div className="mt-2 text-sm font-semibold text-ink/80"><Md as="div" text={fb.message} /></div>}
                  {!right && !skipped && <div className="mt-1 text-sm font-semibold text-ink/70">{encourage}</div>}
                </div>
              </div>
              {showSteps && (
                <div className="max-h-[38vh] overflow-y-auto rounded-2xl bg-surface p-4 text-sm">
                  <div className="label mb-2">Paso a paso</div>
                  <ol className="grid gap-2">
                    {ex.solution.map((s, i) => (
                      <li key={i} className="flex gap-2"><span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-brand2/15 text-xs font-black text-brand2">{i + 1}</span><div className="min-w-0 flex-1">{s.text && <Md as="div" text={s.text} />}{s.tex && <div className="overflow-x-auto"><TeX tex={s.tex} display /></div>}</div></li>
                    ))}
                  </ol>
                  <div className="mt-3 rounded-xl bg-surface2 p-3"><div className="label mb-1 !text-brand">¿Por qué funciona?</div><Md as="div" text={ex.explanation} /></div>
                  {ex.commonErrors.length > 0 && <div className="mt-2 text-muted"><b>Ojo con: </b>{ex.commonErrors.map((c, i) => <span key={i}><Md text={c} />{i < ex.commonErrors.length - 1 ? ' · ' : ''}</span>)}</div>}
                </div>
              )}
              <div className="flex flex-wrap items-center gap-3">
                {!showSteps && <button type="button" className={'btn-soft ' + (right ? '!text-ok' : '!text-bad')} onClick={() => setShowSteps(true)}>Ver cómo se resuelve</button>}
                <button ref={contRef} type="button" className={(right ? 'btn-primary' : 'btn-danger') + ' ml-auto min-w-[9rem] flex-1 sm:flex-none sm:min-w-[12rem]'} onClick={onContinue}>Continuar</button>
              </div>
            </div>
          )}
        </div>
      </footer>
    </>
  )
}
