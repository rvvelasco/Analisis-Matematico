/** Piezas compartidas por los juegos. */
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { GAMES } from './catalog'
import type { GameId } from '../content/types'
import { PageHeader } from '../ui/Layout'

export function GameShell({ id, children, right }: { id: GameId; children: ReactNode; right?: ReactNode }) {
  const g = GAMES.find((x) => x.id === id)!
  return (
    <div>
      <PageHeader back={{ to: '/juegos', label: 'Juegos' }} title={<><span className="mr-2" aria-hidden>{g.icon}</span>{g.name}</>} subtitle={g.desc} right={right} />
      {children}
    </div>
  )
}

export function ScoreBar({ items }: { items: { label: string; value: ReactNode; tone?: 'ok' | 'bad' | 'brand' | 'warn' }[] }) {
  return (
    <div className="mb-4 flex flex-wrap gap-2">
      {items.map((it) => (
        <div key={it.label} className="rounded-xl border border-line bg-surface px-3 py-1.5">
          <span className="text-xs text-muted">{it.label} </span>
          <b className={it.tone === 'ok' ? 'text-ok' : it.tone === 'bad' ? 'text-bad' : it.tone === 'warn' ? 'text-warn' : it.tone === 'brand' ? 'text-brand' : ''}>{it.value}</b>
        </div>
      ))}
    </div>
  )
}

export function GameOver({ title, lines, onAgain, extra }: { title: string; lines: ReactNode[]; onAgain: () => void; extra?: ReactNode }) {
  return (
    <div className="card-pad mx-auto grid max-w-lg justify-items-center gap-3 text-center anim-pop">
      <div className="text-5xl">🏁</div>
      <h2 className="text-2xl font-bold">{title}</h2>
      {lines.map((l, i) => <p key={i} className="text-muted">{l}</p>)}
      {extra}
      <div className="flex flex-wrap justify-center gap-2">
        <button type="button" className="btn-primary" onClick={onAgain}>Jugar otra vez</button>
        <Link to="/juegos" className="btn-ghost">Otros juegos</Link>
      </div>
    </div>
  )
}
