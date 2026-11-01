/** Pantalla completa de una parada del camino: explicación, práctica, desafío, prueba final, repaso o prueba para saltar. */
import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { unitById } from '../content/curriculum'
import { nodeById } from '../content/path'
import type { Exercise } from '../engine/types'
import { intuitionSet, masteryCheck, nextPractice, placementTest } from '../engine/adaptive'
import { getTemplate, instantiate } from '../engine/registry'
import { getState, markConceptsSeen, markStage, recordReview, unlockUnit } from '../progress/store'
import { SessionPlayer, type SessionResult } from '../exercise/Session'
import { Md, TeX } from '../ui/Md'
import { Widget } from '../viz/Widget'
import { Mascot, Speech } from '../ui/Mascot'
import { Bar } from '../ui/Layout'
import { Icon } from '../ui/icons'
import { sfx } from '../ui/sfx'
import { NotFound } from './Learn'

const rnd = () => Math.floor(Math.random() * 1e9)
const okCount = (r: SessionResult[]) => r.filter((x) => x.score >= 0.999).length

function practiceSet(unitId: string, n = 6): Exercise[] {
  const out: Exercise[] = []
  const recent: string[] = []
  for (let i = 0; i < n; i++) {
    const ex = nextPractice(getState(), unitId, { recent })
    out.push(ex)
    recent.push(ex.templateId)
    if (recent.length > 4) recent.shift()
  }
  return out
}

function reviewSet(unitId: string): { items: Exercise[]; ids: (string | null)[] } {
  const errs = getState().errors.filter((e) => e.concept.startsWith(unitId + '.') && getTemplate(e.templateId)).slice(-5)
  const items: Exercise[] = []
  const ids: (string | null)[] = []
  for (const e of errs) {
    try { items.push(instantiate(e.templateId, e.box === 0 ? e.seed : e.seed + e.box * 101, e.level)); ids.push(e.id) } catch { /* plantilla vieja */ }
  }
  for (const ex of practiceSet(unitId, Math.max(0, 4 - items.length))) { items.push(ex); ids.push(null) }
  return { items, ids }
}

export default function Lesson() {
  const { unitId = '', node = '' } = useParams()
  const nav = useNavigate()
  const u = unitById(unitId)
  const n = nodeById(node)
  const [seed, setSeed] = useState(rnd)
  const exit = () => nav(u ? `/?area=${u.area}` : '/')
  const set = useMemo(() => {
    if (!u) return null
    switch (node) {
      case 'practica': return { items: practiceSet(u.id), ids: [] as (string | null)[] }
      case 'desafio': return { items: intuitionSet(u.id, seed), ids: [] }
      case 'examen': return { items: masteryCheck(u.id, seed), ids: [] }
      case 'nivel': return { items: placementTest(u.id, seed), ids: [] }
      case 'repaso': return reviewSet(u.id)
      default: return null
    }
  }, [u, node, seed])

  if (!u || (!n && node !== 'nivel')) return <div className="p-6"><NotFound /></div>
  if (node === 'aprender') return <LessonStory unitId={u.id} onExit={exit} />
  if (!set) return <div className="p-6"><NotFound /></div>

  const restart = () => setSeed(rnd())
  const common = { items: set.items, onExit: exit, onRestart: restart }
  switch (node) {
    case 'practica':
      return <SessionPlayer key={seed} {...common} title="Práctica" source="practica" hearts requeue onFinish={() => markStage(u.id, 'practica')} />
    case 'desafio':
      return <SessionPlayer key={seed} {...common} title="Desafío" source="practica" hearts onFinish={() => markStage(u.id, 'intuicion')}
        endView={() => <Speech mood="wow" size={70}>Estas preguntas engañan a mucha gente. Si alguna te sorprendió, ¡eso es aprender!</Speech>} />
    case 'examen':
      return <SessionPlayer key={seed} {...common} title="Prueba final" source="practica" allowHelp={false}
        endTitle={(r) => (okCount(r) >= 3 ? '¡Prueba superada!' : 'Prueba terminada')}
        onFinish={(r) => { if (okCount(r) >= 3) markStage(u.id, 'demostra') }}
        endView={(r) => (
          <Speech mood={okCount(r) >= 3 ? 'party' : 'think'} size={70}>
            {okCount(r) >= 3 ? <>Resolviste bien <b>{okCount(r)} de {r.length}</b>. Si lo repetís otro día con buen resultado, el tema queda bien aprendido.</> : <>Resolviste bien <b>{okCount(r)} de {r.length}</b>. Necesitás 3 para pasar. Practicá un poco más y volvé a intentarlo.</>}
          </Speech>
        )} />
    case 'nivel':
      return <SessionPlayer key={seed} {...common} title="Prueba para saltar" source="practica" allowHelp={false}
        endTitle={(r) => (okCount(r) >= 3 ? '¡Unidad desbloqueada!' : 'Todavía no')}
        onFinish={(r) => { if (okCount(r) >= 3) unlockUnit(u.id) }}
        endView={(r) => <Speech mood={okCount(r) >= 3 ? 'party' : 'think'} size={70}>{okCount(r) >= 3 ? 'Demostraste que ya tenés la base. ¡Adelante!' : `Acertaste ${okCount(r)} de ${r.length} (necesitás 3). Repasá los temas anteriores y probá de nuevo cuando quieras.`}</Speech>} />
    case 'repaso':
      return <SessionPlayer key={seed} {...common} title="Repaso" source="repaso" requeue
        onAnswer={(_, ok, i) => { const id = set.ids[i]; if (id) recordReview(id, ok) }}
        onFinish={() => markStage(u.id, 'repasa')}
        endView={() => (
          <div className="card grid gap-2 p-4 text-left">
            <div className="label">Lo más importante</div>
            <ul className="grid list-disc gap-1 pl-5 text-sm font-semibold">{u.lesson.summary.map((t, i) => <li key={i}><Md text={t} /></li>)}</ul>
            <div className="label mt-2">Errores comunes</div>
            <ul className="grid list-disc gap-1 pl-5 text-sm text-muted">{u.lesson.pitfalls.map((t, i) => <li key={i}><Md text={t} /></li>)}</ul>
          </div>
        )} />
  }
  return <NotFound />
}

/* ---------- explicación en diapositivas ---------- */
type Slide =
  | { kind: 'hook' }
  | { kind: 'idea'; text: string; i: number }
  | { kind: 'visual' }
  | { kind: 'theory'; i: number }
  | { kind: 'example' }

export function LessonStory({ unitId, onExit }: { unitId: string; onExit: () => void }) {
  const u = unitById(unitId)!
  const L = u.lesson
  const slides = useMemo<Slide[]>(() => [
    { kind: 'hook' },
    ...L.intuition.map((text, i) => ({ kind: 'idea' as const, text, i })),
    { kind: 'visual' },
    ...L.theory.map((_, i) => ({ kind: 'theory' as const, i })),
    { kind: 'example' },
  ], [L])
  const [i, setI] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [guess, setGuess] = useState('')
  const [steps, setSteps] = useState(1)
  const [done, setDone] = useState(false)
  const nav = useNavigate()
  const sl = slides[i]

  const stageOf = (x: Slide) => (x.kind === 'hook' ? 'descubri' : x.kind === 'idea' ? 'entende' : x.kind === 'visual' ? 'visualiza' : x.kind === 'theory' ? 'teoria' : 'ejemplo')
  const next = () => {
    markStage(u.id, stageOf(sl))
    if (sl.kind === 'idea' || sl.kind === 'theory') markConceptsSeen(u.concepts)
    if (i + 1 >= slides.length) { sfx.finish(); setDone(true); return }
    setI(i + 1); setRevealed(false); setSteps(1)
  }
  const canGo = sl.kind === 'hook' ? revealed : sl.kind === 'example' ? steps >= L.example.steps.length : true

  if (done)
    return (
      <div className="fixed inset-0 z-40 flex flex-col bg-bg">
        <div className="flex flex-1 flex-col items-center justify-center gap-5 px-5 text-center anim-pop">
          <Mascot mood="party" size={140} className="anim-bob" />
          <h2 className="text-3xl text-gold">¡Ya entendiste la idea!</h2>
          <p className="max-w-md font-semibold text-muted">Ahora toca practicar <b>{u.title}</b> con ejercicios cortos. Si te trabás, podés pedir pistas.</p>
        </div>
        <footer className="border-t-2 border-line px-4 py-5">
          <div className="mx-auto flex max-w-3xl flex-wrap justify-end gap-3">
            <button type="button" className="btn-ghost flex-1 sm:flex-none" onClick={onExit}>Volver al camino</button>
            <button type="button" className="btn-primary flex-1 sm:flex-none sm:min-w-[12rem]" onClick={() => nav(`/leccion/${u.id}/practica`, { replace: true })} autoFocus>¡A practicar!</button>
          </div>
        </footer>
      </div>
    )

  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-bg">
      <header className="flex items-center gap-4 px-4 pb-2 pt-4 sm:px-6 sm:pt-6">
        <button type="button" onClick={onExit} className="text-muted hover:text-ink" aria-label="Salir de la lección"><Icon name="close" className="h-7 w-7" /></button>
        <Bar value={i / slides.length} className="flex-1" />
      </header>
      <main className="flex-1 overflow-y-auto px-4 pb-8 sm:px-6">
        <div key={i} className="mx-auto grid max-w-2xl gap-5 pt-6 anim-up">
          {sl.kind === 'hook' && (
            <>
              <h1 className="text-2xl">Una pregunta para arrancar</h1>
              <Speech mood="think" size={84}><Md as="div" text={L.hook.question} /></Speech>
              {!revealed ? (
                <label className="grid gap-2">
                  <span className="font-bold text-muted">¿Qué pensás? Escribilo si querés (no se corrige).</span>
                  <textarea className="input min-h-[5rem]" value={guess} onChange={(e) => setGuess(e.target.value)} placeholder="Yo creo que…" />
                </label>
              ) : (
                <div className="rounded-2xl border-2 border-brand/40 bg-okbg p-4 font-semibold anim-pop">
                  {guess.trim() && <p className="mb-2 text-sm text-muted">Tu idea: “{guess.trim()}”</p>}
                  <Md as="div" text={L.hook.reveal} />
                </div>
              )}
            </>
          )}
          {sl.kind === 'idea' && (
            <>
              <h1 className="text-2xl">{sl.i === 0 ? 'La idea, en simple' : 'Sigamos'}</h1>
              <Speech mood={sl.i % 2 ? 'wow' : 'happy'} size={84}><Md as="div" text={sl.text} className="text-[1.05rem]" /></Speech>
            </>
          )}
          {sl.kind === 'visual' && (
            <>
              <h1 className="text-2xl">Miralo con tus propios ojos</h1>
              <Md as="p" text={L.visual.caption} className="font-semibold text-muted" />
              <div className="card p-3"><Widget spec={L.visual.widget} /></div>
              <div className="rounded-2xl border-2 border-brand2/40 bg-selbg p-4"><div className="label mb-2 !text-brand2">Probá esto</div><ul className="grid list-disc gap-1 pl-5 font-semibold">{L.visual.tasks.map((t, k) => <li key={k}><Md text={t} /></li>)}</ul></div>
            </>
          )}
          {sl.kind === 'theory' && (
            <>
              <div className="label">Lo importante para recordar</div>
              <h1 className="text-2xl">{L.theory[sl.i].title}</h1>
              {L.theory[sl.i].text && <Md as="p" text={L.theory[sl.i].text} className="text-[1.05rem] leading-relaxed" />}
              {L.theory[sl.i].formulas?.map((f, k) => <div key={k} className="overflow-x-auto rounded-2xl border-2 border-line bg-surface2 px-4 py-2"><TeX tex={f} display /></div>)}
            </>
          )}
          {sl.kind === 'example' && (
            <>
              <h1 className="text-2xl">Veamos un ejemplo, paso a paso</h1>
              <div className="rounded-2xl border-2 border-line p-4 text-lg font-bold"><Md as="div" text={L.example.prompt} /></div>
              <ol className="grid gap-3">
                {L.example.steps.slice(0, steps).map((st, k) => (
                  <li key={k} className="flex gap-3 anim-up"><span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand text-sm font-black text-white">{k + 1}</span><div className="min-w-0 flex-1 font-semibold">{st.text && <Md as="div" text={st.text} />}{st.tex && <div className="overflow-x-auto"><TeX tex={st.tex} display /></div>}</div></li>
                ))}
              </ol>
            </>
          )}
        </div>
      </main>
      <footer className="border-t-2 border-line px-4 py-4 sm:py-6">
        <div className="mx-auto flex max-w-3xl justify-end gap-3">
          {i > 0 && <button type="button" className="btn-ghost" onClick={() => { setI(i - 1); setRevealed(true); setSteps(L.example.steps.length) }}>Atrás</button>}
          {sl.kind === 'hook' && !revealed ? <button type="button" className="btn-blue flex-1 sm:flex-none sm:min-w-[12rem]" onClick={() => setRevealed(true)}>Ver la respuesta</button>
            : sl.kind === 'example' && steps < L.example.steps.length ? <button type="button" className="btn-blue flex-1 sm:flex-none sm:min-w-[12rem]" onClick={() => setSteps(steps + 1)}>Siguiente paso ({steps + 1}/{L.example.steps.length})</button>
            : <button type="button" className="btn-primary flex-1 sm:flex-none sm:min-w-[12rem]" onClick={next} disabled={!canGo}>Continuar</button>}
        </div>
      </footer>
      <Link to={`/unidad/${u.id}`} className="sr-only">Ver la guía completa de la unidad</Link>
    </div>
  )
}
