import { Link } from 'react-router-dom'
import { GAMES } from '../games/catalog'
import { useProgress } from '../progress/store'
import { PageHeader } from '../ui/Layout'

export default function Games() {
  const s = useProgress()
  return (
    <div>
      <PageHeader title="Juegos" subtitle="Aprendé jugando. Lo que respondés en los juegos también suma a tu progreso." />
      <div className="mb-6 flex flex-wrap gap-2 text-sm">
        <span className="chip">Récord en duelo: <b className="ml-1 text-ink">{s.records.duelBest}</b></span>
        <span className="chip">Desafíos diarios: <b className="ml-1 text-ink">{Object.keys(s.dailyChallenges).length}</b></span>
        <span className="chip">Juegos que probaste: <b className="ml-1 text-ink">{Object.keys(s.records.gamesPlayed).length}/10</b></span>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {GAMES.map((g) => (
          <Link key={g.id} to={g.id === 'arena' ? '/simulacros' : `/juegos/${g.id}`} className="card group flex flex-col gap-3 p-5 transition hover:bg-surface2" style={{ boxShadow: "0 4px 0 rgb(var(--line))" }}>
            <div className="flex items-center gap-3">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-surface2 text-2xl" aria-hidden>{g.icon}</span>
              <div><div className="text-lg font-extrabold">{g.name}</div></div>
            </div>
            <p className="flex-1 text-sm text-muted">{g.desc}</p>
            <div className="flex items-center justify-between text-xs"><span className="chip">{g.skills}</span><span className="text-muted">{s.records.gamesPlayed[g.id] ? `Jugado ${s.records.gamesPlayed[g.id]} ${s.records.gamesPlayed[g.id] === 1 ? 'vez' : 'veces'}` : 'Sin jugar'}</span></div>
          </Link>
        ))}
      </div>
    </div>
  )
}
