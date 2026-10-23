/** Lección de una unidad, con sus 10 etapas. */
import { useEffect, useMemo, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { areaById, conceptName, unitById, unitsOfArea } from '../content/curriculum'
import type { Exercise, Level } from '../engine/types'
import { LEVEL_INFO } from '../engine/types'
import { intuitionSet, masteryCheck, nextPractice, placementTest, suggestedLevel } from '../engine/adaptive'
import { getState, markConceptsSeen, markStage, unlockUnit, useProgress } from '../progress/store'
import { conceptStatus, effectiveMastery, missingPrereqs, unitMastery, unitStatus } from '../progress/mastery'
import { ExerciseView } from '../exercise/ExerciseView'
import { Sequence } from '../exercise/Sequence'
import { Md, TeX } from '../ui/Md'
import { Widget } from '../viz/Widget'
import { AREA_CLS, CONCEPT_STATUS_TEXT, STATUS_TEXT } from '../ui/area'
import { PageHeader, ProgressBar } from '../ui/Layout'
import { GAMES } from '../games/catalog'
import { NotFound } from './Learn'

export const STAGES = [
  { id: 'descubri', label: 'Descubrí', icon: '🔍' },
  { id: 'entende', label: 'Entendé', icon: '💡' },
  { id: 'visualiza', label: 'Visualizá', icon: '📈' },
  { id: 'teoria', label: 'Teoría', icon: '📘' },
  { id: 'ejemplo', label: 'Ejemplo resuelto', icon: '✍️' },
  { id: 'practica', label: 'Practicá', icon: '🎯' },
  { id: 'intuicion', label: 'Desafiá tu intuición', icon: '🧠' },
  { id: 'juga', label: 'Jugá', icon: '🎮' },
  { id: 'demostra', label: 'Demostrá', icon: '🏅' },
  { id: 'repasa', label: 'Repasá', icon: '🔁' },
] as const
type StageId = (typeof STAGES)[number]['id']

export default function UnitPage() {
  const { id = '' } = useParams()
  const u = unitById(id)
  const s = useProgress()
  const [params, setParams] = useSearchParams()
  const stage = (STAGES.find((x) => x.id === params.get('etapa'))?.id ?? 'descubri') as StageId
  const status = u ? unitStatus(s, u) : 'bloqueada'
  useEffect(() => {
    if (!u || status === 'bloqueada') return
    markStage(u.id, stage)
    if (stage === 'entende' || stage === 'teoria') markConceptsSeen(u.concepts)
  }, [u, stage, status])
  if (!u) return <NotFound />
  const area = areaById(u.area)
  const cls = AREA_CLS[u.area]
  const m = unitMastery(s, u)
  const siblings = unitsOfArea(u.area)
  const idx = siblings.findIndex((x) => x.id === u.id)
  const next = siblings[idx + 1]
  const visited = s.stages[u.id] ?? []
  const go = (st: StageId) => setParams(st === 'descubri' ? {} : { etapa: st }, { replace: false })
  const stageIdx = STAGES.findIndex((x) => x.id === stage)

  return (
    <div>
      <PageHeader back={{ to: `/area/${u.area}`, label: area.name }}
        title={<><span className={'mr-2 font-mono text-base ' + cls.text}>{u.id.toUpperCase()}</span>{u.title}</>}
        subtitle={u.short}
        right={<div className="grid w-56 gap-1"><div className="flex justify-between text-xs text-muted"><span>{STATUS_TEXT[status]}</span><span>Dominio {Math.round(m * 100)}%</span></div><ProgressBar value={m} color={cls.color} label="Dominio de la unidad" /></div>} />

      {status === 'bloqueada' ? <Locked unitId={u.id} /> : (
        <div className="grid gap-5 lg:grid-cols-[14rem_minmax(0,1fr)]">
          <nav aria-label="Etapas de la lección" className="-mx-4 overflow-x-auto px-4 lg:mx-0 lg:overflow-visible lg:px-0">
            <ol className="flex gap-1.5 lg:sticky lg:top-6 lg:grid">
              {STAGES.map((st, i) => (
                <li key={st.id}>
                  <button type="button" onClick={() => go(st.id)} aria-current={stage === st.id ? 'step' : undefined}
                    className={'flex w-max items-center gap-2 whitespace-nowrap rounded-xl px-3 py-2 text-sm transition lg:w-full ' + (stage === st.id ? 'bg-brand text-white' : 'bg-surface2/60 text-muted hover:text-ink')}>
                    <span aria-hidden>{st.icon}</span><span>{i + 1}. {st.label}</span>{visited.includes(st.id) && stage !== st.id && <span className="ml-auto text-ok" aria-label="visitada">✓</span>}
                  </button>
                </li>
              ))}
            </ol>
          </nav>
          <div className="min-w-0">
            <Stage unitId={u.id} stage={stage} />
            <div className="mt-6 flex flex-wrap justify-between gap-2">
              {stageIdx > 0 ? <button type="button" className="btn-ghost" onClick={() => go(STAGES[stageIdx - 1].id)}>← {STAGES[stageIdx - 1].label}</button> : <span />}
              {stageIdx < STAGES.length - 1 ? <button type="button" className="btn-primary" onClick={() => go(STAGES[stageIdx + 1].id)}>{STAGES[stageIdx + 1].label} →</button>
                : next ? <Link to={`/unidad/${next.id}`} className="btn-primary">Siguiente unidad: {next.title} →</Link> : <Link to="/aprender" className="btn-primary">Volver al mapa</Link>}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Locked({ unitId }: { unitId: string }) {
  const s = useProgress()
  const u = unitById(unitId)!
  const miss = missingPrereqs(s, u)
  const [testing, setTesting] = useState(false)
  const [seed] = useState(() => Math.floor(Math.random() * 1e9))
  const items = useMemo(() => placementTest(unitId, seed), [unitId, seed])
  return (
    <div className="grid gap-4">
      <div className="card-pad grid gap-3">
        <h2 className="text-lg font-semibold">🔒 Esta unidad todavía está bloqueada</h2>
        <p className="text-muted">Para que la aproveches, conviene dominar antes:</p>
        <ul className="grid gap-2">
          {miss.map((x) => (
            <li key={x.unit.id} className="flex items-center gap-3 rounded-xl border border-line bg-surface2/40 p-3">
              <span className="min-w-0 flex-1"><span className="font-medium">{x.unit.title}</span><span className="mt-1 block"><ProgressBar value={x.mastery / 0.55} label={x.unit.title} /></span><span className="text-xs text-muted">{Math.round(x.mastery * 100)}% de 55% necesario</span></span>
              <Link to={`/unidad/${x.unit.id}?etapa=practica`} className="btn-soft btn-sm">Practicar</Link>
            </li>
          ))}
        </ul>
        {!testing && <div className="flex flex-wrap items-center gap-2"><button type="button" className="btn-primary" onClick={() => setTesting(true)}>Rendir prueba de nivel</button><span className="text-sm text-muted">4 ejercicios de los prerrequisitos, sin pistas. Con 3 correctos se desbloquea.</span></div>}
      </div>
      {testing && (
        <Sequence items={items} allowHelp={false} source="practica" title="Prueba de nivel"
          onFinish={(r) => { if (r.filter((x) => x.score >= 0.999).length >= 3) unlockUnit(unitId) }}
          finishView={(r) => {
            const ok = r.filter((x) => x.score >= 0.999).length
            return <p className="text-center">{ok >= 3 ? '¡Demostraste la base necesaria! La unidad quedó desbloqueada.' : 'Todavía no alcanza. Practicá los prerrequisitos y volvé a intentarlo cuando quieras.'}</p>
          }} />
      )}
    </div>
  )
}

function Stage({ unitId, stage }: { unitId: string; stage: StageId }) {
  const u = unitById(unitId)!
  const L = u.lesson
  switch (stage) {
    case 'descubri': return <Discover unitId={unitId} />
    case 'entende':
      return (
        <section className="card-pad prose-mv grid gap-3">
          <h2 className="text-xl font-semibold">Entendé la idea</h2>
          {L.intuition.map((p, i) => <Md key={i} as="p" text={p} className="text-[1.05rem] leading-relaxed" />)}
        </section>
      )
    case 'visualiza':
      return (
        <section className="card-pad grid gap-4">
          <h2 className="text-xl font-semibold">Visualizá</h2>
          <Md as="p" text={L.visual.caption} className="text-muted" />
          <Widget spec={L.visual.widget} />
          <div className="rounded-xl border border-brand2/30 bg-brand2/5 p-4"><div className="label mb-2 !text-brand2">Probá esto</div><ul className="grid list-disc gap-1 pl-5">{L.visual.tasks.map((t, i) => <li key={i}><Md text={t} /></li>)}</ul></div>
        </section>
      )
    case 'teoria':
      return (
        <section className="grid gap-4">
          {L.theory.map((t, i) => (
            <div key={i} className="card-pad grid gap-2">
              <h3 className="text-lg font-semibold">{t.title}</h3>
              {t.text && <Md as="p" text={t.text} />}
              {t.formulas?.map((f, k) => <div key={k} className="overflow-x-auto rounded-xl bg-surface2/50 px-3 py-1"><TeX tex={f} display /></div>)}
            </div>
          ))}
        </section>
      )
    case 'ejemplo': return <Example unitId={unitId} />
    case 'practica': return <Practice unitId={unitId} />
    case 'intuicion': return <Intuition unitId={unitId} />
    case 'juga': {
      const g = GAMES.find((x) => x.id === L.game)!
      return (
        <section className="card-pad grid gap-3">
          <h2 className="text-xl font-semibold">Jugá con este tema</h2>
          <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-line bg-surface2/40 p-4">
            <span className="text-4xl" aria-hidden>{g.icon}</span>
            <div className="min-w-0 flex-1"><div className="text-lg font-semibold">{g.name}</div><p className="text-sm text-muted">{g.desc}</p></div>
            <Link to={`/juegos/${g.id}?unidad=${unitId}`} className="btn-primary">Jugar</Link>
          </div>
          <Link to="/juegos" className="text-sm text-brand hover:underline">Ver todos los juegos →</Link>
        </section>
      )
    }
    case 'demostra': return <Demonstrate unitId={unitId} />
    case 'repasa': return <ReviewStage unitId={unitId} />
  }
}

function Discover({ unitId }: { unitId: string }) {
  const u = unitById(unitId)!
  const [show, setShow] = useState(false)
  const [guess, setGuess] = useState('')
  useEffect(() => { setShow(false); setGuess('') }, [unitId])
  return (
    <section className="card-pad grid gap-4">
      <h2 className="text-xl font-semibold">Descubrí</h2>
      <Md as="p" text={u.lesson.hook.question} className="text-lg leading-relaxed" />
      {!show ? (
        <div className="grid gap-2">
          <label className="label" htmlFor="guess">¿Qué pensás? (escribilo, aunque sea una intuición)</label>
          <textarea id="guess" className="input min-h-[5rem] font-sans" value={guess} onChange={(e) => setGuess(e.target.value)} placeholder="Mi idea es que…" />
          <div><button type="button" className="btn-primary" onClick={() => setShow(true)}>Ver qué pasa</button></div>
        </div>
      ) : (
        <div className="rounded-xl border border-brand/40 bg-brand/10 p-4 anim-up">
          {guess.trim() && <p className="mb-2 text-sm text-muted">Tu idea: “{guess.trim()}”</p>}
          <Md as="div" text={u.lesson.hook.reveal} />
        </div>
      )}
    </section>
  )
}

function Example({ unitId }: { unitId: string }) {
  const u = unitById(unitId)!
  const ex = u.lesson.example
  const [n, setN] = useState(1)
  useEffect(() => setN(1), [unitId])
  return (
    <section className="card-pad grid gap-4">
      <h2 className="text-xl font-semibold">Ejemplo resuelto</h2>
      <Md as="p" text={ex.prompt} className="text-lg" />
      <ol className="grid gap-3">
        {ex.steps.slice(0, n).map((st, i) => (
          <li key={i} className="flex gap-3 anim-up"><span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-brand/15 text-sm font-bold text-brand">{i + 1}</span><div className="min-w-0 flex-1">{st.text && <Md as="div" text={st.text} />}{st.tex && <div className="overflow-x-auto"><TeX tex={st.tex} display /></div>}</div></li>
        ))}
      </ol>
      {n < ex.steps.length ? <div><button type="button" className="btn-soft" onClick={() => setN(n + 1)}>Mostrar el paso {n + 1}</button></div> : <p className="text-sm text-ok">¡Listo! Ahora probá vos en “Practicá”.</p>}
    </section>
  )
}

function Practice({ unitId }: { unitId: string }) {
  const s = useProgress()
  const u = unitById(unitId)!
  const [mode, setMode] = useState<'auto' | Level>('auto')
  const [recent, setRecent] = useState<string[]>([])
  const [session, setSession] = useState({ ok: 0, total: 0, last: '' })
  const make = (m: 'auto' | Level, rec: string[]) => nextPractice(getState(), unitId, { level: m === 'auto' ? undefined : m, recent: rec })
  const [ex, setEx] = useState<Exercise>(() => make('auto', []))
  useEffect(() => { setEx(make(mode, [])); setRecent([]); setSession({ ok: 0, total: 0, last: '' }) }, [unitId]) // eslint-disable-line react-hooks/exhaustive-deps
  const nextEx = () => { const rec = [...recent, ex.templateId].slice(-4); setRecent(rec); setEx(make(mode, rec)) }
  return (
    <section className="grid gap-4">
      <div className="card flex flex-wrap items-center gap-3 p-4">
        <span className="font-semibold">Practicá</span>
        <span className="text-sm text-muted">Sesión: {session.ok}/{session.total} correctos</span>
        <label className="ml-auto flex items-center gap-2 text-sm">Nivel
          <select className="input !w-auto !py-1.5 font-sans" value={String(mode)} onChange={(e) => { const m = e.target.value === 'auto' ? 'auto' : (Number(e.target.value) as Level); setMode(m); setEx(make(m, recent)) }}>
            <option value="auto">Adaptativo (sugerido: N{suggestedLevel(s, unitId)})</option>
            {([1, 2, 3, 4] as Level[]).map((l) => <option key={l} value={l}>N{l} · {LEVEL_INFO[l].name}</option>)}
          </select>
        </label>
      </div>
      <ExerciseView ex={ex} source="practica" onResult={(fb) => setSession((x) => (x.last === ex.id ? x : { ok: x.ok + (fb.verdict === 'correct' ? 1 : 0), total: x.total + 1, last: ex.id }))} onNext={nextEx} />
      <div className="card p-4">
        <div className="label mb-2">Tu dominio en esta unidad</div>
        <div className="grid gap-2 sm:grid-cols-2">
          {u.concepts.map((c) => <div key={c} className="grid gap-1 text-sm"><div className="flex justify-between"><span>{conceptName(c)}</span><span className="text-muted">{CONCEPT_STATUS_TEXT[conceptStatus(s.concepts[c])]}</span></div><ProgressBar value={effectiveMastery(s.concepts[c])} label={conceptName(c)} /></div>)}
        </div>
      </div>
    </section>
  )
}

function Intuition({ unitId }: { unitId: string }) {
  const [seed, setSeed] = useState(() => Math.floor(Math.random() * 1e9))
  const items = useMemo(() => intuitionSet(unitId, seed), [unitId, seed])
  return (
    <section className="grid gap-3">
      <div className="card p-4"><h2 className="text-xl font-semibold">Desafiá tu intuición</h2><p className="text-sm text-muted">Preguntas donde la primera respuesta que se te ocurre suele ser incorrecta. Pensá antes de responder.</p></div>
      <Sequence key={seed} items={items} source="practica" finishView={() => <div className="text-center"><button type="button" className="btn-ghost" onClick={() => setSeed(seed + 1)}>Otra ronda</button></div>} />
    </section>
  )
}

function Demonstrate({ unitId }: { unitId: string }) {
  const [seed, setSeed] = useState<number | null>(null)
  const items = useMemo(() => (seed === null ? [] : masteryCheck(unitId, seed)), [unitId, seed])
  if (seed === null)
    return (
      <section className="card-pad grid gap-3">
        <h2 className="text-xl font-semibold">Demostrá lo que aprendiste</h2>
        <p className="text-muted">4 ejercicios de nivel Analista y Experto, <b>sin pistas</b>. Así se mide el dominio real: los conceptos se marcan como dominados cuando resolvés bien ejercicios de nivel alto, sin ayuda y en distintos momentos.</p>
        <div><button type="button" className="btn-primary" onClick={() => setSeed(Math.floor(Math.random() * 1e9))}>Empezar la prueba</button></div>
      </section>
    )
  return (
    <Sequence key={seed} items={items} allowHelp={false} source="practica" title="Prueba de dominio"
      finishView={(r) => {
        const ok = r.filter((x) => x.score >= 0.999).length
        return (
          <div className="grid justify-items-center gap-2 text-center">
            <p>{ok >= 3 ? '¡Muy bien! Demostraste un buen dominio. Si lo repetís otro día con el mismo resultado, se consolida.' : 'Todavía hay cosas para reforzar. Volvé a “Practicá” y después intentá de nuevo.'}</p>
            <button type="button" className="btn-ghost" onClick={() => setSeed(Math.floor(Math.random() * 1e9))}>Otra prueba</button>
          </div>
        )
      }} />
  )
}

function ReviewStage({ unitId }: { unitId: string }) {
  const s = useProgress()
  const u = unitById(unitId)!
  const errs = s.errors.filter((e) => e.concept.startsWith(unitId + '.'))
  return (
    <section className="grid gap-4">
      <div className="card-pad grid gap-2">
        <h2 className="text-xl font-semibold">Repasá</h2>
        <div className="label mt-2">Lo esencial</div>
        <ul className="grid list-disc gap-1 pl-5">{u.lesson.summary.map((t, i) => <li key={i}><Md text={t} /></li>)}</ul>
        <div className="label mt-3">Errores típicos</div>
        <ul className="grid list-disc gap-1 pl-5 text-muted">{u.lesson.pitfalls.map((t, i) => <li key={i}><Md text={t} /></li>)}</ul>
      </div>
      <div className="card-pad grid gap-2">
        <div className="label">Tus errores en esta unidad</div>
        {errs.length === 0 ? <p className="text-sm text-muted">No tenés errores pendientes en esta unidad. 🎉</p> : (
          <>
            <ul className="grid gap-1.5 text-sm">{errs.slice(-5).map((e) => <li key={e.id} className="rounded-xl border border-line bg-surface2/40 px-3 py-2"><span className="font-medium">{conceptName(e.concept)}</span>: <Md text={e.message || 'respuesta incorrecta'} /></li>)}</ul>
            <Link to="/repaso" className="btn-soft w-max">Ir al repaso</Link>
          </>
        )}
      </div>
    </section>
  )
}
