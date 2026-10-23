import { Link } from 'react-router-dom'
import { AREAS, unitById, unitsOfArea } from '../content/curriculum'
import { useProgress } from '../progress/store'
import { dayKey, recommendations, unitMastery } from '../progress/mastery'
import { missionsFor, playerLevel } from '../progress/gamification'
import { AREA_CLS } from '../ui/area'
import { Icon } from '../ui/icons'
import { ProgressBar } from '../ui/Layout'

export default function Home() {
  const s = useProgress()
  const today = dayKey()
  const lv = playerLevel(s.xp)
  const recs = recommendations(s)
  const missions = missionsFor(today)
  const due = s.errors.filter((e) => e.due <= today).length
  const dailyDone = !!s.dailyChallenges[today]
  const isNew = s.totals.attempts === 0
  const hour = new Date().getHours()
  const hello = hour < 6 ? 'Buenas noches' : hour < 13 ? 'Buen día' : hour < 20 ? 'Buenas tardes' : 'Buenas noches'

  return (
    <div className="grid gap-6">
      <section className="card-pad relative overflow-hidden">
        <div className="pointer-events-none absolute -right-10 -top-16 h-56 w-56 rounded-full bg-brand/20 blur-3xl" />
        <div className="relative grid gap-5 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <p className="text-sm text-muted">{hello}{s.settings.name ? `, ${s.settings.name}` : ''} 👋</p>
            <h1 className="mt-1 text-3xl font-bold sm:text-4xl">{isNew ? <>Aprendé matemática <span className="bg-gradient-to-r from-brand to-brand2 bg-clip-text text-transparent">explorando</span></> : 'Sigamos donde quedaste'}</h1>
            <p className="mt-2 max-w-xl text-muted">{isNew ? 'Funciones, matrices, vectores, derivadas e integrales: cada tema se descubre, se visualiza, se practica y se juega. Tu progreso se guarda en este dispositivo.' : `Llevás ${s.totals.correct} ejercicio${s.totals.correct === 1 ? '' : 's'} bien resuelto${s.totals.correct === 1 ? '' : 's'} de ${s.totals.attempts} intentados.`}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link to={recs[0] ? `/unidad/${recs[0].unitId}` : '/unidad/f1'} className="btn-primary"><Icon name="play" className="h-4 w-4" />{isNew ? 'Empezar por Funciones' : 'Continuar'}</Link>
              <Link to="/aprender" className="btn-ghost"><Icon name="map" className="h-4 w-4" />Ver el mapa</Link>
            </div>
          </div>
          <div className="grid min-w-[15rem] gap-3 rounded-2xl border border-line bg-surface2/50 p-4">
            <div className="flex items-center justify-between"><span className="font-semibold">Nivel {lv.level}</span><span className="chip">{lv.title}</span></div>
            <ProgressBar value={lv.into / lv.need} label="Progreso de nivel" />
            <div className="flex justify-between text-sm text-muted"><span>{s.xp} XP</span><span>faltan {lv.need - lv.into}</span></div>
            <div className="flex items-center gap-2 text-sm"><Icon name="fire" className="h-5 w-5 text-ader" /><span><b>{s.streak.current}</b> día{s.streak.current === 1 ? '' : 's'} de racha · mejor: {s.streak.best}</span></div>
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="card-pad lg:col-span-2">
          <h2 className="mb-3 text-lg font-semibold">Recomendado para vos</h2>
          {recs.length === 0 ? <p className="text-muted">Todavía no hay recomendaciones: empezá cualquier unidad y MathVerse se va a ir adaptando a lo que necesitás.</p> : (
            <ul className="grid gap-2">
              {recs.map((r, i) => {
                const u = unitById(r.unitId)
                const cls = u ? AREA_CLS[u.area] : AREA_CLS.funciones
                return (
                  <li key={i}>
                    <Link to={r.kind === 'repasar' ? '/repaso' : `/unidad/${r.unitId}${r.kind === 'reforzar' ? '?etapa=practica' : ''}`} className="flex items-center gap-3 rounded-xl border border-line bg-surface2/40 p-3 transition hover:border-brand/50">
                      <span className={'grid h-10 w-10 shrink-0 place-items-center rounded-xl text-lg font-bold ' + cls.soft + ' ' + cls.text}>{r.kind === 'repasar' ? '↻' : r.kind === 'reforzar' ? '💪' : r.kind === 'continuar' ? '▶' : '✦'}</span>
                      <span className="min-w-0 flex-1"><span className="block font-medium">{r.title}</span><span className="block text-sm text-muted">{r.reason}</span></span>
                      <Icon name="arrow" className="h-4 w-4 text-muted" />
                    </Link>
                  </li>
                )
              })}
            </ul>
          )}
        </section>

        <section className="card-pad">
          <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold"><Icon name="target" className="h-5 w-5 text-brand2" />Misiones de hoy</h2>
          <ul className="grid gap-3">
            {missions.map((m) => {
              const p = s.daily.date === today ? s.daily.missions.find((x) => x.id === m.id)?.progress ?? 0 : 0
              const done = s.daily.date === today && s.daily.claimed.includes(m.id)
              return (
                <li key={m.id} className="grid gap-1.5">
                  <div className="flex items-start justify-between gap-2 text-sm"><span className={done ? 'text-muted line-through' : ''}>{m.text}</span><span className="chip shrink-0">+{m.xp}</span></div>
                  <ProgressBar value={p / m.goal} color={done ? 'ok' : 'brand2'} label={m.text} />
                </li>
              )
            })}
          </ul>
          <div className="mt-4 grid gap-2">
            <Link to="/juegos/diario" className={'btn ' + (dailyDone ? 'btn-ghost' : 'btn-soft')}>{dailyDone ? '✓ Desafío diario completo' : '📆 Desafío diario'}</Link>
            <Link to="/repaso" className="btn-ghost"><Icon name="review" className="h-4 w-4" />Repaso{due ? ` (${due} pendiente${due > 1 ? 's' : ''})` : ''}</Link>
          </div>
        </section>
      </div>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Áreas</h2>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          {AREAS.map((a) => {
            const us = unitsOfArea(a.id)
            const m = us.reduce((acc, u) => acc + unitMastery(s, u), 0) / us.length
            const cls = AREA_CLS[a.id]
            return (
              <Link key={a.id} to={`/area/${a.id}`} className={'card group grid gap-3 p-4 transition hover:-translate-y-0.5 hover:border-brand/50'}>
                <div className="flex items-center gap-3"><span className={'grid h-11 w-11 place-items-center rounded-xl font-display text-2xl font-bold ' + cls.soft + ' ' + cls.text}>{a.icon}</span><div><div className="font-semibold">{a.name}</div><div className="text-xs text-muted">{us.length} unidades</div></div></div>
                <p className="text-sm text-muted">{a.tagline}</p>
                <div className="grid gap-1"><ProgressBar value={m} color={cls.color} label={`Dominio en ${a.name}`} /><span className="text-xs text-muted">Dominio estimado: {Math.round(m * 100)}%</span></div>
              </Link>
            )
          })}
        </div>
      </section>
    </div>
  )
}
