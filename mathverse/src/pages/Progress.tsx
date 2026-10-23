/** Perfil, estadísticas reales, dominio por concepto, logros y récords. */
import { Link } from 'react-router-dom'
import { AREAS, conceptName, unitsOfArea } from '../content/curriculum'
import { useProgress } from '../progress/store'
import { ACHIEVEMENTS, playerLevel } from '../progress/gamification'
import { addDays, conceptStatus, dayKey, effectiveMastery, unitMastery, unitStatus } from '../progress/mastery'
import { AREA_CLS, CONCEPT_STATUS_TEXT } from '../ui/area'
import { PageHeader, ProgressBar } from '../ui/Layout'

const fmtTime = (ms: number) => { const m = Math.round(ms / 60000); return m < 60 ? `${m} min` : `${Math.floor(m / 60)} h ${m % 60} min` }

export default function Progress() {
  const s = useProgress()
  const lv = playerLevel(s.xp)
  const today = dayKey()
  const days = Array.from({ length: 14 }, (_, i) => addDays(today, i - 13))
  const maxXp = Math.max(10, ...days.map((d) => s.xpByDay[d] ?? 0))
  const concepts = Object.entries(s.concepts).filter(([, c]) => c.attempts > 0 || c.seen)
  const counts = { visto: 0, practicado: 0, dominado: 0 }
  for (const [, c] of concepts) { const st = conceptStatus(c); if (st !== 'nuevo') counts[st]++ }
  const acc = s.totals.attempts ? s.totals.correct / s.totals.attempts : 0
  const empty = s.totals.attempts === 0

  return (
    <div className="grid gap-6 [&>*]:min-w-0">
      <PageHeader title="Mi progreso" subtitle="Todo lo que ves acá sale de lo que hiciste en este dispositivo. No hay datos inventados." right={<Link to="/repaso" className="btn-ghost">🔁 Repaso de errores ({s.errors.length})</Link>} />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="card-pad grid gap-2"><span className="label">Nivel</span><span className="font-display text-3xl font-bold">{lv.level} <span className="text-base font-medium text-muted">{lv.title}</span></span><ProgressBar value={lv.into / lv.need} label="Nivel" /><span className="text-xs text-muted">{s.xp} XP en total</span></div>
        <div className="card-pad grid gap-1"><span className="label">Racha</span><span className="font-display text-3xl font-bold text-ader">🔥 {s.streak.current}</span><span className="text-sm text-muted">Mejor racha: {s.streak.best} días</span></div>
        <div className="card-pad grid gap-1"><span className="label">Ejercicios</span><span className="font-display text-3xl font-bold">{s.totals.correct}<span className="text-base text-muted"> / {s.totals.attempts}</span></span><span className="text-sm text-muted">{empty ? 'Todavía no resolviste ejercicios' : `${Math.round(acc * 100)}% de acierto`}</span></div>
        <div className="card-pad grid gap-1"><span className="label">Tiempo practicando</span><span className="font-display text-3xl font-bold">{fmtTime(s.totals.timeMs)}</span><span className="text-sm text-muted">{counts.dominado} dominados · {counts.practicado} practicados · {counts.visto} vistos</span></div>
      </section>

      <section className="card-pad">
        <h2 className="mb-3 text-lg font-semibold">XP de los últimos 14 días</h2>
        {empty ? <p className="text-sm text-muted">Cuando practiques, acá vas a ver tu actividad diaria.</p> : (
          <div className="flex h-36 items-end gap-1.5" role="img" aria-label="Gráfico de barras de XP por día">
            {days.map((d) => { const v = s.xpByDay[d] ?? 0; return (
              <div key={d} className="flex flex-1 flex-col items-center gap-1">
                <span className="text-[0.6rem] text-muted">{v || ''}</span>
                <div className="w-full rounded-t-md bg-gradient-to-t from-brand to-brand2" style={{ height: `${(v / maxXp) * 100}px`, minHeight: v ? 4 : 1, opacity: v ? 1 : 0.25 }} title={`${d}: ${v} XP`} />
                <span className="text-[0.6rem] text-muted">{Number(d.slice(8))}</span>
              </div>
            ) })}
          </div>
        )}
      </section>

      <section className="grid gap-4 lg:grid-cols-5">
        {AREAS.map((a) => {
          const us = unitsOfArea(a.id)
          const m = us.reduce((x, u) => x + unitMastery(s, u), 0) / us.length
          const dom = us.filter((u) => unitStatus(s, u) === 'dominada').length
          return (
            <Link key={a.id} to={`/area/${a.id}`} className="card grid gap-2 p-4 hover:border-brand/50">
              <span className={'font-semibold ' + AREA_CLS[a.id].text}>{a.icon} {a.name}</span>
              <ProgressBar value={m} color={AREA_CLS[a.id].color} label={a.name} />
              <span className="text-xs text-muted">{Math.round(m * 100)}% · {dom}/{us.length} unidades dominadas</span>
            </Link>
          )
        })}
      </section>

      <section className="card-pad">
        <h2 className="mb-3 text-lg font-semibold">Dominio por concepto</h2>
        {concepts.length === 0 ? <p className="text-sm text-muted">Todavía no hay conceptos registrados. Empezá una lección y practicá.</p> : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[40rem] text-sm">
              <thead><tr className="text-left text-xs text-muted"><th className="py-2 font-medium">Concepto</th><th className="font-medium">Estado</th><th className="font-medium">Dominio</th><th className="font-medium">Intentos</th><th className="font-medium">Correctos</th><th className="font-medium">Pistas</th><th className="font-medium">Nivel máx.</th><th className="font-medium">Última práctica</th></tr></thead>
              <tbody>
                {concepts.sort((a, b) => b[1].last - a[1].last).map(([id, c]) => (
                  <tr key={id} className="border-t border-line/60">
                    <td className="py-2"><Link to={`/unidad/${id.split('.')[0]}?etapa=practica`} className="hover:text-brand">{conceptName(id)}</Link></td>
                    <td><span className={conceptStatus(c) === 'dominado' ? 'text-ok' : ''}>{CONCEPT_STATUS_TEXT[conceptStatus(c)]}</span></td>
                    <td className="w-32"><div className="flex items-center gap-2"><ProgressBar value={effectiveMastery(c)} label={conceptName(id)} /><span className="w-8 text-right text-xs">{Math.round(effectiveMastery(c) * 100)}%</span></div></td>
                    <td>{c.attempts}</td><td>{c.correct}</td><td>{c.hints}</td><td>{c.levelMax ? `N${c.levelMax}` : '—'}</td>
                    <td className="text-muted">{c.last ? new Date(c.last).toLocaleDateString('es-AR') : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="card-pad">
        <h2 className="mb-3 text-lg font-semibold">Logros <span className="text-sm font-normal text-muted">({Object.keys(s.achievements).length}/{ACHIEVEMENTS.length})</span></h2>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {ACHIEVEMENTS.map((a) => {
            const got = s.achievements[a.id]
            return (
              <div key={a.id} className={'flex items-center gap-3 rounded-xl border p-3 ' + (got ? 'border-brand/40 bg-brand/5' : 'border-line opacity-60')}>
                <span className={'text-2xl ' + (got ? '' : 'grayscale')} aria-hidden>{a.icon}</span>
                <div className="min-w-0"><div className="font-medium">{a.name}</div><div className="text-xs text-muted">{a.desc}{got ? ` · ${new Date(got).toLocaleDateString('es-AR')}` : ''}</div></div>
              </div>
            )
          })}
        </div>
      </section>

      <section className="card-pad grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <div><div className="label">Récord en duelo</div><div className="text-2xl font-bold">{s.records.duelBest}</div></div>
        <div><div className="label">Mejor racha sin pistas</div><div className="text-2xl font-bold">{s.records.bestNoHintRun}</div></div>
        <div><div className="label">Simulacros rendidos</div><div className="text-2xl font-bold">{s.exams.length}</div></div>
        <div><div className="label">Errores superados</div><div className="text-2xl font-bold">{s.resolvedErrors}</div></div>
      </section>
    </div>
  )
}
