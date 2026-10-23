/** Simulacros / Arena de parciales: exámenes configurables con corrección al final. */
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AREAS, conceptName, conceptUnit, UNITS, unitById } from '../content/curriculum'
import type { AreaId, Exercise, Feedback, Level } from '../engine/types'
import { LEVEL_INFO } from '../engine/types'
import { buildExam } from '../engine/adaptive'
import { correctAnswerText, validate } from '../engine/validate'
import { recordAttempt, recordExam, recordGame, useProgress } from '../progress/store'
import { AnswerInput, emptyDraft, type Draft } from '../exercise/inputs'
import { LevelBadge, specToPlot } from '../exercise/ExerciseView'
import { Md, TeX } from '../ui/Md'
import { Plot } from '../ui/Plot'
import { PageHeader, ProgressBar } from '../ui/Layout'

interface Cfg { title: string; areas: AreaId[]; units: string[]; level: Level; count: number; minutes: number }
const PRESETS: Cfg[] = [
  { title: 'Parcial 1 · Funciones', areas: ['funciones'], units: [], level: 4, count: 8, minutes: 60 },
  { title: 'Parcial · Álgebra (matrices y vectores)', areas: ['matrices', 'vectores'], units: [], level: 4, count: 8, minutes: 60 },
  { title: 'Parcial 2 · Derivadas', areas: ['derivadas'], units: [], level: 5, count: 6, minutes: 75 },
  { title: 'Parcial 3 · Integrales', areas: ['integrales'], units: [], level: 5, count: 6, minutes: 75 },
  { title: 'Final integrador', areas: ['funciones', 'matrices', 'vectores', 'derivadas', 'integrales'], units: [], level: 6, count: 10, minutes: 120 },
]

type Phase = { kind: 'config' } | { kind: 'run'; cfg: Cfg; items: Exercise[]; drafts: Draft[]; start: number } | { kind: 'result'; cfg: Cfg; items: Exercise[]; drafts: Draft[]; fbs: Feedback[]; timeMs: number }

export default function Exams() {
  const [phase, setPhase] = useState<Phase>({ kind: 'config' })
  const start = (cfg: Cfg) => {
    const items = buildExam({ areas: cfg.areas, units: cfg.units, level: cfg.level, count: cfg.count, seed: Math.floor(Math.random() * 1e9) })
    setPhase({ kind: 'run', cfg, items, drafts: items.map((e) => emptyDraft(e, e.seed)), start: Date.now() })
  }
  const submit = (p: Extract<Phase, { kind: 'run' }>) => {
    const fbs = p.items.map((ex, i) => validate(ex, p.drafts[i]))
    const timeMs = Date.now() - p.start
    const byConcept: Record<string, { ok: number; total: number }> = {}
    p.items.forEach((ex, i) => {
      const score = fbs[i].verdict === 'invalid' ? 0 : fbs[i].score
      recordAttempt(ex, score, { hintsUsed: 0, solutionShown: false, timeMs: timeMs / p.items.length, source: 'examen', message: fbs[i].message, errorTag: fbs[i].errorTag })
      for (const c of ex.concepts) { byConcept[c] = byConcept[c] ?? { ok: 0, total: 0 }; byConcept[c].total++; byConcept[c].ok += score }
    })
    const total = p.items.length
    const score = fbs.reduce((a, f) => a + (f.verdict === 'invalid' ? 0 : f.score), 0)
    recordExam({ date: Date.now(), title: p.cfg.title, areas: p.cfg.areas, level: p.cfg.level, total, score, timeMs, byConcept })
    recordGame('arena', {})
    setPhase({ kind: 'result', cfg: p.cfg, items: p.items, drafts: p.drafts, fbs, timeMs })
    window.scrollTo({ top: 0 })
  }
  if (phase.kind === 'config') return <Config onStart={start} />
  if (phase.kind === 'run') return <Run p={phase} setP={setPhase} onSubmit={() => submit(phase)} />
  return <Result p={phase} onAgain={() => setPhase({ kind: 'config' })} />
}

function Config({ onStart }: { onStart: (c: Cfg) => void }) {
  const s = useProgress()
  const [cfg, setCfg] = useState<Cfg>({ title: 'Simulacro personalizado', areas: ['derivadas'], units: [], level: 4, count: 8, minutes: 60 })
  const units = UNITS.filter((u) => cfg.areas.includes(u.area))
  return (
    <div>
      <PageHeader title="Arena de parciales" subtitle="Simulacros con tiempo y sin pistas. La corrección llega al final, con el detalle de cada ejercicio y de cada concepto." />
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <section className="grid content-start gap-4">
          <div className="grid gap-3 sm:grid-cols-2">
            {PRESETS.map((p) => (
              <button key={p.title} type="button" onClick={() => onStart(p)} className="card flex flex-col gap-1 p-4 text-left transition hover:border-brand/50">
                <span className="font-semibold">{p.title}</span>
                <span className="text-sm text-muted">{p.count} ejercicios · {p.minutes} min · {LEVEL_INFO[p.level].name}</span>
                <span className="mt-2 text-sm text-brand">Empezar →</span>
              </button>
            ))}
          </div>
          <div className="card-pad grid gap-4">
            <h2 className="text-lg font-semibold">Armá tu simulacro</h2>
            <div className="grid gap-1.5"><span className="label">Áreas</span>
              <div className="flex flex-wrap gap-2">{AREAS.map((a) => <button key={a.id} type="button" aria-pressed={cfg.areas.includes(a.id)} className={'btn btn-sm border ' + (cfg.areas.includes(a.id) ? 'border-brand bg-brand/15' : 'border-line bg-surface2/50 text-muted')} onClick={() => setCfg((c) => ({ ...c, units: [], areas: c.areas.includes(a.id) ? (c.areas.length > 1 ? c.areas.filter((x) => x !== a.id) : c.areas) : [...c.areas, a.id] }))}>{a.name}</button>)}</div>
            </div>
            <div className="grid gap-1.5"><span className="label">Unidades (opcional; si no elegís, entran todas)</span>
              <div className="flex flex-wrap gap-1.5">{units.map((u) => <button key={u.id} type="button" aria-pressed={cfg.units.includes(u.id)} className={'chip cursor-pointer ' + (cfg.units.includes(u.id) ? '!border-brand !text-ink' : '')} onClick={() => setCfg((c) => ({ ...c, units: c.units.includes(u.id) ? c.units.filter((x) => x !== u.id) : [...c.units, u.id] }))}>{u.id.toUpperCase()} · {u.title}</button>)}</div>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <label className="grid gap-1 text-sm">Nivel<select className="input font-sans" value={cfg.level} onChange={(e) => setCfg({ ...cfg, level: Number(e.target.value) as Level })}>{([2, 3, 4, 5, 6] as Level[]).map((l) => <option key={l} value={l}>N{l} · {LEVEL_INFO[l].name}</option>)}</select></label>
              <label className="grid gap-1 text-sm">Ejercicios<select className="input font-sans" value={cfg.count} onChange={(e) => setCfg({ ...cfg, count: Number(e.target.value) })}>{[4, 6, 8, 10, 15].map((n) => <option key={n} value={n}>{n}</option>)}</select></label>
              <label className="grid gap-1 text-sm">Tiempo<select className="input font-sans" value={cfg.minutes} onChange={(e) => setCfg({ ...cfg, minutes: Number(e.target.value) })}>{[0, 20, 30, 45, 60, 90, 120].map((n) => <option key={n} value={n}>{n ? `${n} min` : 'Sin límite'}</option>)}</select></label>
            </div>
            <div><button type="button" className="btn-primary" onClick={() => onStart(cfg)}>Empezar simulacro</button></div>
          </div>
        </section>
        <aside className="card-pad grid content-start gap-3">
          <h2 className="text-lg font-semibold">Historial</h2>
          {s.exams.length === 0 ? <p className="text-sm text-muted">Todavía no rendiste simulacros.</p> : (
            <ul className="grid gap-2">{s.exams.slice().reverse().slice(0, 8).map((e, i) => (
              <li key={i} className="rounded-xl border border-line bg-surface2/40 p-3 text-sm">
                <div className="flex justify-between gap-2"><span className="font-medium">{e.title}</span><b className={e.score / e.total >= 0.6 ? 'text-ok' : 'text-bad'}>{Math.round((e.score / e.total) * 100)}%</b></div>
                <div className="text-xs text-muted">{new Date(e.date).toLocaleDateString('es-AR')} · {Math.round(e.timeMs / 60000)} min · N{e.level}</div>
              </li>
            ))}</ul>
          )}
        </aside>
      </div>
    </div>
  )
}

function Run({ p, setP, onSubmit }: { p: Extract<Phase, { kind: 'run' }>; setP: (p: Phase) => void; onSubmit: () => void }) {
  const [i, setI] = useState(0)
  const [now, setNow] = useState(Date.now())
  const [confirm, setConfirm] = useState(false)
  useEffect(() => { const id = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(id) }, [])
  const limit = p.cfg.minutes * 60000
  const left = limit ? Math.max(0, limit - (now - p.start)) : null
  useEffect(() => { if (left === 0) onSubmit() }, [left]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => { e.preventDefault() }
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [])
  const ex = p.items[i]
  const answered = (k: number) => JSON.stringify(p.drafts[k]) !== JSON.stringify(emptyDraft(p.items[k], p.items[k].seed))
  const plot = useMemo(() => (ex.plot ? specToPlot(ex.plot) : null), [ex])
  const mm = left !== null ? `${Math.floor(left / 60000)}:${String(Math.floor((left % 60000) / 1000)).padStart(2, '0')}` : null
  return (
    <div>
      <div className="sticky top-14 z-20 -mx-4 mb-4 flex flex-wrap items-center gap-3 border-b border-line/60 bg-bg/90 px-4 py-2 backdrop-blur lg:top-0">
        <span className="font-semibold">{p.cfg.title}</span>
        {mm && <span className={'chip font-mono ' + (left! < 5 * 60000 ? '!border-bad !text-bad' : '')} aria-live="off">⏱ {mm}</span>}
        <div className="flex flex-wrap gap-1">{p.items.map((_, k) => <button key={k} type="button" onClick={() => setI(k)} aria-label={`Ir al ejercicio ${k + 1}`} aria-current={k === i} className={'h-8 w-8 rounded-lg text-xs font-bold ' + (k === i ? 'bg-brand text-white' : answered(k) ? 'bg-brand2/25 text-ink' : 'bg-surface2 text-muted')}>{k + 1}</button>)}</div>
        <button type="button" className="btn-soft btn-sm ml-auto" onClick={() => setConfirm(true)}>Entregar</button>
      </div>
      {confirm && (
        <div className="card-pad mb-4 flex flex-wrap items-center gap-3 border-warn/50" role="alertdialog" aria-label="Confirmar entrega">
          <span>¿Entregás? Respondiste {p.items.filter((_, k) => answered(k)).length} de {p.items.length}.</span>
          <button type="button" className="btn-primary btn-sm" onClick={onSubmit}>Sí, entregar</button>
          <button type="button" className="btn-ghost btn-sm" onClick={() => setConfirm(false)}>Seguir</button>
        </div>
      )}
      <article className="card-pad grid gap-4">
        <header className="flex flex-wrap items-center gap-2"><span className="font-display text-lg font-bold">Ejercicio {i + 1}</span><LevelBadge level={ex.level} why={ex.levelWhy} /><span className="chip">{unitById(ex.unit)?.title}</span></header>
        <Md as="div" text={ex.prompt} className="prose-mv text-[1.05rem]" />
        {plot && <Plot {...plot} />}
        <AnswerInput ex={ex} draft={p.drafts[i]} seed={ex.seed} onChange={(d) => { const drafts = p.drafts.slice(); drafts[i] = d; setP({ ...p, drafts }) }} />
        <div className="flex justify-between gap-2">
          <button type="button" className="btn-ghost" disabled={i === 0} onClick={() => setI(i - 1)}>← Anterior</button>
          {i + 1 < p.items.length ? <button type="button" className="btn-primary" onClick={() => setI(i + 1)}>Siguiente →</button> : <button type="button" className="btn-primary" onClick={() => setConfirm(true)}>Terminar</button>}
        </div>
      </article>
    </div>
  )
}

function Result({ p, onAgain }: { p: Extract<Phase, { kind: 'result' }>; onAgain: () => void }) {
  const total = p.items.length
  const score = p.fbs.reduce((a, f) => a + (f.verdict === 'invalid' ? 0 : f.score), 0)
  const pct = score / total
  const byConcept: Record<string, { ok: number; total: number }> = {}
  p.items.forEach((ex, i) => ex.concepts.forEach((c) => { byConcept[c] = byConcept[c] ?? { ok: 0, total: 0 }; byConcept[c].total++; byConcept[c].ok += p.fbs[i].verdict === 'invalid' ? 0 : p.fbs[i].score }))
  const weak = Object.entries(byConcept).filter(([, v]) => v.ok / v.total < 0.6)
  return (
    <div>
      <PageHeader title="Resultado del simulacro" subtitle={p.cfg.title} />
      <div className="grid gap-5 lg:grid-cols-[20rem_minmax(0,1fr)]">
        <aside className="grid content-start gap-4">
          <div className="card-pad text-center">
            <div className={'font-display text-5xl font-bold ' + (pct >= 0.6 ? 'text-ok' : 'text-bad')}>{Math.round(pct * 100)}%</div>
            <div className="mt-1 text-muted">{fmtScore(score)} de {total} puntos · {Math.round(p.timeMs / 60000)} min</div>
            <div className="mt-2 chip">{pct >= 0.6 ? 'Aprobado (≥ 60%)' : 'No alcanzó el 60%'}</div>
          </div>
          <div className="card-pad grid gap-2">
            <div className="label">Por concepto</div>
            {Object.entries(byConcept).map(([c, v]) => <div key={c} className="grid gap-1 text-sm"><div className="flex justify-between gap-2"><span>{conceptName(c)}</span><span className="text-muted">{fmtScore(v.ok)}/{v.total}</span></div><ProgressBar value={v.ok / v.total} color={v.ok / v.total >= 0.6 ? 'ok' : 'bad'} label={conceptName(c)} /></div>)}
          </div>
          {weak.length > 0 && (
            <div className="card-pad grid gap-2">
              <div className="label">Para reforzar</div>
              {weak.map(([c]) => <Link key={c} to={`/unidad/${conceptUnit(c)}?etapa=practica`} className="btn-ghost btn-sm justify-start">{conceptName(c)} →</Link>)}
            </div>
          )}
          <button type="button" className="btn-primary" onClick={onAgain}>Otro simulacro</button>
        </aside>
        <ol className="grid gap-4">
          {p.items.map((ex, i) => {
            const fb = p.fbs[i]
            return (
              <li key={i} className={'card-pad grid gap-3 border-l-4 ' + (fb.verdict === 'correct' ? 'border-l-ok' : fb.verdict === 'partial' ? 'border-l-warn' : 'border-l-bad')}>
                <div className="flex flex-wrap items-center gap-2"><b>Ejercicio {i + 1}</b><LevelBadge level={ex.level} why={ex.levelWhy} /><span className="ml-auto chip">{fmtScore(fb.verdict === 'invalid' ? 0 : fb.score)} / 1</span></div>
                <Md as="div" text={ex.prompt} />
                <AnswerInput ex={ex} draft={p.drafts[i]} onChange={() => {}} disabled feedback={fb} seed={ex.seed} />
                <div className={'rounded-xl p-3 text-sm ' + (fb.verdict === 'correct' ? 'bg-ok/10' : 'bg-bad/10')}><Md as="div" text={fb.verdict === 'invalid' ? 'Sin responder o con una respuesta que no se pudo leer.' : fb.message} /></div>
                {fb.verdict !== 'correct' && <div className="text-sm"><span className="label">Respuesta correcta: </span><Md text={correctAnswerText(ex)} /></div>}
                <details className="rounded-xl border border-line bg-surface2/40 p-3 text-sm">
                  <summary className="cursor-pointer font-semibold">Resolución y explicación</summary>
                  <ol className="mt-2 grid gap-1.5">{ex.solution.map((st, k) => <li key={k}>{st.text && <Md as="div" text={st.text} />}{st.tex && <TeX tex={st.tex} display />}</li>)}</ol>
                  <Md as="p" text={ex.explanation} className="mt-2 text-muted" />
                </details>
              </li>
            )
          })}
        </ol>
      </div>
    </div>
  )
}

const fmtScore = (v: number) => (Number.isInteger(v) ? String(v) : v.toFixed(2).replace('.', ','))
