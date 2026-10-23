/** Serie de ejercicios con progreso y resumen final. */
import { useState, type ReactNode } from 'react'
import type { Exercise } from '../engine/types'
import { conceptName } from '../content/curriculum'
import type { AttemptMeta } from '../progress/store'
import { ExerciseView } from './ExerciseView'

export interface SeqResult { ex: Exercise; score: number; hints: number; solution: boolean }

export function Sequence({ items, allowHelp = true, source, onFinish, finishView, title }: {
  items: Exercise[]
  allowHelp?: boolean
  source?: AttemptMeta['source']
  onFinish?: (r: SeqResult[]) => void
  finishView?: (r: SeqResult[]) => ReactNode
  title?: string
}) {
  const [i, setI] = useState(0)
  const [results, setResults] = useState<SeqResult[]>([])
  const [answered, setAnswered] = useState(false)
  const done = i >= items.length
  if (!items.length) return <p className="text-muted">No hay ejercicios disponibles para esta selección.</p>
  if (done) {
    const ok = results.filter((r) => r.score >= 0.999).length
    return (
      <div className="card-pad grid gap-4 anim-pop">
        <div className="text-center">
          <div className="text-5xl">{ok === items.length ? '🏆' : ok >= items.length / 2 ? '👏' : '💪'}</div>
          <h3 className="mt-2 text-2xl font-bold">{ok} de {items.length} correctos</h3>
        </div>
        {finishView?.(results)}
        <ul className="grid gap-1.5">
          {results.map((r, k) => (
            <li key={k} className="flex items-center gap-2 rounded-xl border border-line bg-surface2/40 px-3 py-2 text-sm">
              <span className={r.score >= 0.999 ? 'text-ok' : r.score > 0 ? 'text-warn' : 'text-bad'}>{r.score >= 0.999 ? '✓' : r.score > 0 ? '◐' : '✗'}</span>
              <span className="flex-1">{r.ex.subtopic} <span className="text-muted">· {r.ex.concepts.map(conceptName).join(', ')}</span></span>
              <span className="chip">N{r.ex.level}</span>
            </li>
          ))}
        </ul>
      </div>
    )
  }
  const ex = items[i]
  return (
    <div className="grid gap-3">
      <div className="flex items-center gap-3">
        {title && <span className="font-semibold">{title}</span>}
        <span className="text-sm text-muted">Ejercicio {i + 1} de {items.length}</span>
        <div className="flex flex-1 gap-1" aria-hidden>{items.map((_, k) => <span key={k} className={'h-1.5 flex-1 rounded-full ' + (k < i ? (results[k]?.score >= 0.999 ? 'bg-ok' : 'bg-bad') : k === i ? 'bg-brand' : 'bg-line')} />)}</div>
      </div>
      <ExerciseView
        key={ex.id + i}
        ex={ex}
        allowHelp={allowHelp}
        source={source}
        onResult={(fb, meta) => {
          if (answered) return
          setAnswered(true)
          setResults((r) => [...r, { ex, score: meta.score, hints: meta.hintsUsed, solution: meta.solutionShown }])
          void fb
        }}
        onNext={answered ? () => {
          setAnswered(false)
          const next = i + 1
          setI(next)
          if (next >= items.length) onFinish?.(results)
        } : undefined}
        nextLabel={i + 1 < items.length ? 'Siguiente' : 'Ver resultados'}
      />
    </div>
  )
}
