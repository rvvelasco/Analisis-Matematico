/** Juego 9 · Desafío diario. */
import { useMemo, useState } from 'react'
import { dailyChallenge } from '../engine/adaptive'
import { addDays, dayKey } from '../progress/mastery'
import { recordDaily, useProgress } from '../progress/store'
import { Sequence } from '../exercise/Sequence'
import { GameShell } from './common'

export default function Daily() {
  const s = useProgress()
  const today = dayKey()
  const items = useMemo(() => dailyChallenge(today), [today])
  const done = s.dailyChallenges[today]
  const [playing, setPlaying] = useState(false)
  const last14 = Array.from({ length: 14 }, (_, i) => addDays(today, i - 13))
  return (
    <GameShell id="diario">
      <div className="card mb-4 p-4">
        <div className="label mb-2">Últimos 14 días</div>
        <div className="flex flex-wrap gap-1.5">
          {last14.map((d) => {
            const r = s.dailyChallenges[d]
            return <span key={d} title={d} className={'grid h-9 w-9 place-items-center rounded-lg text-xs font-semibold ' + (r ? (r.score === r.total ? 'bg-ok text-white' : 'bg-ok/30') : d === today ? 'border-2 border-brand' : 'bg-line/60 text-muted')}>{Number(d.slice(8))}</span>
          })}
        </div>
      </div>
      {done && !playing ? (
        <div className="card-pad grid justify-items-center gap-2 text-center">
          <div className="text-5xl">✅</div>
          <h2 className="text-xl font-bold">Desafío de hoy completo: {done.score}/{done.total}</h2>
          <p className="text-muted">Mañana hay otro. Podés volver a practicarlo (no cambia tu resultado registrado).</p>
          <button type="button" className="btn-ghost" onClick={() => setPlaying(true)}>Practicarlo de nuevo</button>
        </div>
      ) : !playing ? (
        <div className="card-pad grid gap-3">
          <p>5 ejercicios, uno de cada área, de nivel Aprendiz a Experto. Son los mismos para todos hoy. Podés usar pistas, pero el puntaje registrado cuenta los aciertos.</p>
          <div><button type="button" className="btn-primary" onClick={() => setPlaying(true)}>Empezar el desafío</button></div>
        </div>
      ) : (
        <Sequence items={items} source="diario" title="Desafío diario" onFinish={(r) => recordDaily(today, r.filter((x) => x.score >= 0.999 && x.hints === 0 && !x.solution).length, r.length)}
          finishView={() => <p className="text-center text-sm text-muted">Cuentan como aciertos los resueltos sin pistas ni solución.</p>} />
      )}
    </GameShell>
  )
}
