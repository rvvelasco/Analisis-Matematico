/** Repaso espaciado de errores. */
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { getTemplate, instantiate } from '../engine/registry'
import { conceptName } from '../content/curriculum'
import { dayKey } from '../progress/mastery'
import { recordReview, useProgress } from '../progress/store'
import { ExerciseView } from '../exercise/ExerciseView'
import { Md } from '../ui/Md'
import { PageHeader } from '../ui/Layout'

export default function Review() {
  const s = useProgress()
  const today = dayKey()
  const valid = s.errors.filter((e) => getTemplate(e.templateId))
  const due = valid.filter((e) => e.due <= today)
  const later = valid.filter((e) => e.due > today)
  const [current, setCurrent] = useState<string | null>(null)
  const [answered, setAnswered] = useState(false)
  const entry = valid.find((e) => e.id === current)
  const ex = useMemo(() => {
    if (!entry) return null
    try {
      // misma plantilla y nivel, con otra semilla si ya se repasó (para no memorizar el número)
      return instantiate(entry.templateId, entry.box === 0 ? entry.seed : entry.seed + entry.box * 101, entry.level)
    } catch { return null }
  }, [entry])

  return (
    <div>
      <PageHeader back={{ to: '/progreso', label: 'Mi progreso' }} title="Repaso de errores" subtitle="Cada ejercicio que fallás vuelve en el momento justo: al día siguiente, a los 3 días y a la semana. Cuando lo resolvés bien varias veces seguidas, sale de la lista." />
      {ex && entry ? (
        <div className="grid gap-3">
          <div className="card p-3 text-sm"><span className="label">La última vez: </span><Md text={entry.message || 'respuesta incorrecta'} /></div>
          <ExerciseView key={ex.id} ex={ex} source="repaso" onResult={(fb) => { if (answered) return; setAnswered(true); recordReview(entry.id, fb.verdict === 'correct') }}
            onNext={answered ? () => { setAnswered(false); const nextDue = due.find((e) => e.id !== entry.id); setCurrent(nextDue?.id ?? null) } : undefined} nextLabel="Siguiente repaso" />
          <button type="button" className="btn-ghost w-max" onClick={() => { setCurrent(null); setAnswered(false) }}>Volver a la lista</button>
        </div>
      ) : (
        <div className="grid gap-5">
          <section className="card-pad">
            <h2 className="mb-3 text-lg font-semibold">Para hoy ({due.length})</h2>
            {due.length === 0 ? <p className="text-muted">No hay repasos pendientes para hoy. {valid.length === 0 ? '¡Todavía no registraste errores!' : 'Volvé mañana.'}</p> : (
              <>
                <button type="button" className="btn-primary mb-3" onClick={() => setCurrent(due[0].id)}>Empezar repaso</button>
                <ul className="grid gap-2">{due.map((e) => (
                  <li key={e.id}><button type="button" onClick={() => setCurrent(e.id)} className="flex w-full items-center gap-3 rounded-xl border border-line bg-surface2/40 p-3 text-left hover:border-brand/50">
                    <span className="chip">N{e.level}</span><span className="min-w-0 flex-1"><span className="font-medium">{conceptName(e.concept)}</span><span className="block truncate text-sm text-muted"><Md text={e.message || 'respuesta incorrecta'} /></span></span><span className="text-xs text-muted">caja {e.box + 1}/4</span>
                  </button></li>
                ))}</ul>
              </>
            )}
          </section>
          {later.length > 0 && (
            <section className="card-pad">
              <h2 className="mb-3 text-lg font-semibold">Próximos ({later.length})</h2>
              <ul className="grid gap-1.5 text-sm">{later.map((e) => <li key={e.id} className="flex justify-between gap-2 rounded-lg bg-surface2/40 px-3 py-2"><span>{conceptName(e.concept)}</span><span className="text-muted">{e.due}</span></li>)}</ul>
            </section>
          )}
          <Link to="/aprender" className="text-sm text-brand hover:underline">Ir al mapa →</Link>
        </div>
      )}
    </div>
  )
}
