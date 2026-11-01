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
import { Speech } from '../ui/Mascot'
import { SessionPlayer } from '../exercise/Session'
import type { Exercise } from '../engine/types'

export default function Review() {
  const s = useProgress()
  const today = dayKey()
  const valid = s.errors.filter((e) => getTemplate(e.templateId))
  const due = valid.filter((e) => e.due <= today)
  const later = valid.filter((e) => e.due > today)
  const [current, setCurrent] = useState<string | null>(null)
  const [answered, setAnswered] = useState(false)
  const [playing, setPlaying] = useState<{ items: Exercise[]; ids: string[] } | null>(null)
  const entry = valid.find((e) => e.id === current)
  const ex = useMemo(() => {
    if (!entry) return null
    try {
      // misma plantilla y nivel, con otra semilla si ya se repasó (para no memorizar el número)
      return instantiate(entry.templateId, entry.box === 0 ? entry.seed : entry.seed + entry.box * 101, entry.level)
    } catch { return null }
  }, [entry])

  const startAll = () => {
    const items: Exercise[] = []
    const ids: string[] = []
    for (const e of due.slice(0, 10)) {
      try { items.push(instantiate(e.templateId, e.box === 0 ? e.seed : e.seed + e.box * 101, e.level)); ids.push(e.id) } catch { /* plantilla vieja */ }
    }
    if (items.length) setPlaying({ items, ids })
  }

  if (playing)
    return <SessionPlayer items={playing.items} source="repaso" title="Repaso" onExit={() => setPlaying(null)} doneLabel="Listo"
      onAnswer={(_, ok, i) => recordReview(playing.ids[i], ok)}
      endView={(r) => <Speech mood="party" size={70}>{r.filter((x) => x.score >= 0.999).length === r.length ? '¡Todo bien! Estos errores ya casi no vuelven.' : 'Los que fallaste vuelven en unos días, para que se te fijen.'}</Speech>} />

  return (
    <div>
      <PageHeader title="Repasar" subtitle="Lo que te salió mal vuelve en el momento justo: al otro día, a los 3 días y a la semana. Cuando lo hacés bien varias veces, sale de la lista." />
      {!ex && <div className="mb-5"><Speech mood={due.length ? 'think' : 'happy'} size={76}>{due.length ? <>Tenés <b>{due.length}</b> ejercicio{due.length > 1 ? 's' : ''} para repasar hoy. ¡Vamos que en un ratito sale!</> : valid.length ? 'Hoy no tenés nada para repasar. ¡Bien ahí! Volvé mañana.' : 'Todavía no te equivocaste en nada… ¡o todavía no empezaste! Cuando falles un ejercicio, va a aparecer acá.'}</Speech></div>}
      {ex && entry ? (
        <div className="grid gap-3">
          <div className="card p-3 text-sm font-semibold"><span className="label">La última vez: </span><Md text={entry.message || 'respuesta incorrecta'} /></div>
          <ExerciseView key={ex.id} ex={ex} source="repaso" onResult={(fb) => { if (answered) return; setAnswered(true); recordReview(entry.id, fb.verdict === 'correct') }}
            onNext={answered ? () => { setAnswered(false); const nextDue = due.find((e) => e.id !== entry.id); setCurrent(nextDue?.id ?? null) } : undefined} nextLabel="Siguiente repaso" />
          <button type="button" className="btn-ghost w-max" onClick={() => { setCurrent(null); setAnswered(false) }}>Volver a la lista</button>
        </div>
      ) : (
        <div className="grid gap-5">
          <section className="card-pad">
            <h2 className="mb-3 text-lg">Para hoy ({due.length})</h2>
            {due.length === 0 ? <p className="text-muted">Nada para hoy. 🎉</p> : (
              <>
                <button type="button" className="btn-primary mb-4 w-full sm:w-auto" onClick={startAll}>Repasar todo</button>
                <ul className="grid gap-2">{due.map((e) => (
                  <li key={e.id}><button type="button" onClick={() => setCurrent(e.id)} className="choice">
                    <span className="chip">Nivel {e.level}</span><span className="min-w-0 flex-1"><span className="font-medium">{conceptName(e.concept)}</span><span className="block truncate text-sm text-muted"><Md text={e.message || 'respuesta incorrecta'} /></span></span><span className="text-xs text-muted">{e.box + 1} de 4</span>
                  </button></li>
                ))}</ul>
              </>
            )}
          </section>
          {later.length > 0 && (
            <section className="card-pad">
              <h2 className="mb-3 text-lg">Más adelante ({later.length})</h2>
              <ul className="grid gap-1.5 text-sm">{later.map((e) => <li key={e.id} className="flex justify-between gap-2 rounded-lg bg-surface2/40 px-3 py-2"><span>{conceptName(e.concept)}</span><span className="text-muted">{e.due}</span></li>)}</ul>
            </section>
          )}
          <Link to="/" className="font-extrabold text-brand2 hover:underline">Volver al camino →</Link>
        </div>
      )}
    </div>
  )
}
