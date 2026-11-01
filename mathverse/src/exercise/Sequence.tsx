/** Serie de ejercicios dentro de una página (usa el mismo reproductor que las lecciones). */
import type { ReactNode } from 'react'
import type { Exercise } from '../engine/types'
import type { AttemptMeta } from '../progress/store'
import { SessionPlayer, type SessionResult } from './Session'

export type SeqResult = SessionResult

export function Sequence({ items, allowHelp = true, source, onFinish, finishView, title }: {
  items: Exercise[]
  allowHelp?: boolean
  source?: AttemptMeta['source']
  onFinish?: (r: SeqResult[]) => void
  finishView?: (r: SeqResult[]) => ReactNode
  title?: string
}) {
  return (
    <SessionPlayer embedded items={items} allowHelp={allowHelp} source={source} title={title} onFinish={onFinish} endView={finishView}
      endTitle={(r) => { const ok = r.filter((x) => x.score >= 0.999).length; return `${ok} de ${r.length} bien` }} />
  )
}
