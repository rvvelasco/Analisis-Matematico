/** Mapa de aprendizaje y página de cada área. */
import { Link, useParams } from 'react-router-dom'
import { AREAS, areaById, conceptName, unitById, unitsOfArea } from '../content/curriculum'
import type { AreaId } from '../engine/types'
import { useProgress } from '../progress/store'
import { conceptStatus, effectiveMastery, missingPrereqs, unitMastery, unitStatus, type UnitStatus } from '../progress/mastery'
import { templatesForUnit } from '../engine/registry'
import { AREA_CLS, CONCEPT_STATUS_TEXT, STATUS_TEXT } from '../ui/area'
import { Icon } from '../ui/icons'
import { PageHeader, ProgressBar } from '../ui/Layout'
import type { Unit } from '../content/types'
import type { State } from '../progress/schema'

function StatusDot({ st }: { st: UnitStatus }) {
  const cls = { bloqueada: 'bg-line text-muted', disponible: 'bg-surface2 text-ink border border-line', vista: 'bg-brand2/20 text-brand2', practicada: 'bg-brand/20 text-brand', dominada: 'bg-ok text-white' }[st]
  return <span className={'grid h-9 w-9 shrink-0 place-items-center rounded-full text-sm font-bold ' + cls} aria-hidden>{st === 'bloqueada' ? <Icon name="lock" className="h-4 w-4" /> : st === 'dominada' ? <Icon name="check" className="h-4 w-4" /> : '•'}</span>
}

function UnitNode({ u, s }: { u: Unit; s: State }) {
  const st = unitStatus(s, u)
  const m = unitMastery(s, u)
  const cls = AREA_CLS[u.area]
  return (
    <Link to={`/unidad/${u.id}`} className={'flex items-center gap-3 rounded-2xl border bg-surface p-3 transition hover:-translate-y-0.5 ' + (st === 'bloqueada' ? 'border-line/60 opacity-75' : 'border-line hover:border-brand/50')}>
      <StatusDot st={st} />
      <span className="min-w-0 flex-1">
        <span className="flex min-w-0 items-center gap-2"><span className={'shrink-0 font-mono text-xs ' + cls.text}>{u.id.toUpperCase()}</span><span className="truncate font-medium">{u.title}</span></span>
        <span className="mt-1 block"><ProgressBar value={m} color={cls.color} label={`Dominio de ${u.title}`} /></span>
        <span className="mt-1 flex justify-between text-xs text-muted"><span>{STATUS_TEXT[st]}</span><span>{Math.round(m * 100)}%</span></span>
      </span>
    </Link>
  )
}

export function LearnMap() {
  const s = useProgress()
  return (
    <div>
      <PageHeader title="Mapa de aprendizaje" subtitle="Las unidades se desbloquean cuando demostrás dominio en sus prerrequisitos (no por puntos). Si ya sabés un tema, podés rendir una prueba de nivel." />
      <div className="mb-6 flex flex-wrap gap-2 text-xs text-muted">
        {(['bloqueada', 'disponible', 'vista', 'practicada', 'dominada'] as UnitStatus[]).map((st) => <span key={st} className="inline-flex items-center gap-1.5"><span className="scale-75"><StatusDot st={st} /></span>{STATUS_TEXT[st]}</span>)}
      </div>
      <div className="grid gap-8 [&>*]:min-w-0">
        {AREAS.map((a) => (
          <section key={a.id} aria-labelledby={`area-${a.id}`}>
            <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
              <h2 id={`area-${a.id}`} className="flex flex-wrap items-center gap-x-2 text-xl font-semibold"><span className={AREA_CLS[a.id].text}>{a.icon}</span>{a.name}<span className="text-sm font-normal text-muted">· {a.tagline}</span></h2>
              <Link to={`/area/${a.id}`} className="text-sm text-brand hover:underline">Ver el área →</Link>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 [&>*]:min-w-0">
              {unitsOfArea(a.id).map((u) => <UnitNode key={u.id} u={u} s={s} />)}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}

export function AreaPage() {
  const { id } = useParams()
  const s = useProgress()
  const a = AREAS.find((x) => x.id === id)
  if (!a) return <NotFound />
  const us = unitsOfArea(a.id as AreaId)
  const cls = AREA_CLS[a.id]
  const m = us.reduce((acc, u) => acc + unitMastery(s, u), 0) / us.length
  return (
    <div>
      <PageHeader back={{ to: '/aprender', label: 'Mapa' }} title={<span className="flex items-center gap-3"><span className={'grid h-12 w-12 place-items-center rounded-2xl font-display text-3xl ' + cls.soft + ' ' + cls.text}>{a.icon}</span>{a.name}</span>} subtitle={a.description} />
      <div className="card-pad mb-6 grid gap-2 sm:max-w-md">
        <div className="flex justify-between text-sm"><span>Dominio del área</span><b>{Math.round(m * 100)}%</b></div>
        <ProgressBar value={m} color={cls.color} label="Dominio del área" />
        {a.prereqAreas.length > 0 && <p className="text-xs text-muted">Conviene haber visto antes: {a.prereqAreas.map((p) => areaById(p).name).join(', ')}.</p>}
      </div>
      <ol className="grid gap-4">
        {us.map((u) => {
          const st = unitStatus(s, u)
          const miss = st === 'bloqueada' ? missingPrereqs(s, u) : []
          return (
            <li key={u.id} className="card-pad grid gap-3">
              <div className="flex flex-wrap items-start gap-3">
                <StatusDot st={st} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2"><span className={'font-mono text-sm ' + cls.text}>Unidad {u.n}</span><span className="chip">{STATUS_TEXT[st]}</span><span className="chip">{templatesForUnit(u.id).length} tipos de ejercicio</span></div>
                  <h3 className="mt-1 text-lg font-semibold">{u.title}</h3>
                  <p className="text-sm text-muted">{u.short}</p>
                </div>
                <Link to={`/unidad/${u.id}`} className={st === 'bloqueada' ? 'btn-ghost' : 'btn-primary'}>{st === 'bloqueada' ? 'Ver requisitos' : st === 'disponible' ? 'Empezar' : 'Continuar'}</Link>
              </div>
              {miss.length > 0 && <p className="text-sm text-warn">Para desbloquear: alcanzá 55% de dominio en {miss.map((x) => `${x.unit.title} (${Math.round(x.mastery * 100)}%)`).join(', ')}, o rendí la prueba de nivel.</p>}
              <div className="grid gap-2 sm:grid-cols-2">
                {u.concepts.map((c) => {
                  const cs = s.concepts[c]
                  const cst = conceptStatus(cs)
                  return (
                    <div key={c} className="rounded-xl border border-line/70 bg-surface2/40 px-3 py-2">
                      <div className="flex justify-between gap-2 text-sm"><span>{conceptName(c)}</span><span className={'text-xs ' + (cst === 'dominado' ? 'text-ok' : 'text-muted')}>{CONCEPT_STATUS_TEXT[cst]}</span></div>
                      <div className="mt-1.5"><ProgressBar value={effectiveMastery(cs)} color={cls.color} label={conceptName(c)} /></div>
                    </div>
                  )
                })}
              </div>
              {u.prereqs.length > 0 && <p className="text-xs text-muted">Prerrequisitos: {u.prereqs.map((p) => unitById(p)?.title).join(' · ')}</p>}
            </li>
          )
        })}
      </ol>
    </div>
  )
}

export function NotFound() {
  return (
    <div className="card-pad mx-auto max-w-md text-center">
      <div className="text-5xl">🧭</div>
      <h1 className="mt-3 text-2xl font-bold">No encontramos esta página</h1>
      <p className="mt-1 text-muted">Puede que el enlace esté mal escrito.</p>
      <Link to="/" className="btn-primary mt-4">Volver al inicio</Link>
    </div>
  )
}
