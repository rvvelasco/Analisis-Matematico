/** Inicio: el camino de aprendizaje, con paradas en zigzag como en las apps para aprender idiomas. */
import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { AREAS, unitsOfArea } from '../content/curriculum'
import type { AreaId } from '../engine/types'
import { NODES, nodeStates, unitProgress, type NodeState, type PathNode } from '../content/path'
import { markStage, useProgress } from '../progress/store'
import { missingPrereqs, unitStatus } from '../progress/mastery'
import { GAMES } from '../games/catalog'
import type { Unit } from '../content/types'
import type { State } from '../progress/schema'
import { Mascot, Speech } from '../ui/Mascot'
import { Icon } from '../ui/icons'

const AREA_KEY = 'mathverse:area'
const OFFSETS = [0, 52, 78, 52, 0, -52, -78, -52]
const AREA_VAR: Record<AreaId, string> = { funciones: '--a-fun', matrices: '--a-mat', vectores: '--a-vec', derivadas: '--a-der', integrales: '--a-int' }

function readArea(): AreaId {
  try { const v = localStorage.getItem(AREA_KEY); if (AREAS.some((a) => a.id === v)) return v as AreaId } catch { /* sin almacenamiento */ }
  return 'funciones'
}

export default function Path() {
  const s = useProgress()
  const [params, setParams] = useSearchParams()
  const fromUrl = params.get('area')
  const [area, setArea] = useState<AreaId>(() => (AREAS.some((a) => a.id === fromUrl) ? (fromUrl as AreaId) : readArea()))
  const [open, setOpen] = useState<string | null>(null)
  const currentRef = useRef<HTMLDivElement>(null)
  useEffect(() => { try { localStorage.setItem(AREA_KEY, area) } catch { /* nada */ } }, [area])
  useEffect(() => { if (fromUrl && AREAS.some((a) => a.id === fromUrl)) { setArea(fromUrl as AreaId); setParams({}, { replace: true }) } }, [fromUrl, setParams])
  useEffect(() => { currentRef.current?.scrollIntoView({ block: 'center', behavior: 'auto' }) }, [area])
  useEffect(() => {
    if (!open) return
    const close = (e: MouseEvent) => { if (!(e.target as HTMLElement).closest('[data-node]')) setOpen(null) }
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(null) }
    document.addEventListener('click', close); document.addEventListener('keydown', esc)
    return () => { document.removeEventListener('click', close); document.removeEventListener('keydown', esc) }
  }, [open])

  const units = unitsOfArea(area)
  const a = AREAS.find((x) => x.id === area)!
  // la primera unidad no terminada (y no bloqueada) tiene la parada "actual"
  const currentUnit = units.find((u) => unitStatus(s, u) !== 'bloqueada' && unitProgress(s, u) < 1)?.id
  const isNew = s.totals.attempts === 0 && Object.keys(s.stages).length === 0

  return (
    <div className="mx-auto max-w-xl">
      {/* selector de tema */}
      <nav className="sticky top-[3.6rem] z-20 -mx-4 mb-6 flex gap-2 overflow-x-auto bg-bg/95 px-4 py-2 backdrop-blur lg:top-0" aria-label="Temas">
        {AREAS.map((x) => (
          <button key={x.id} type="button" onClick={() => { setArea(x.id); setOpen(null) }} aria-pressed={area === x.id}
            className={'flex shrink-0 items-center gap-2 rounded-2xl border-2 px-3 py-2 text-sm font-extrabold transition ' + (area === x.id ? 'text-white' : 'border-line bg-surface text-muted hover:bg-surface2')}
            style={area === x.id ? { background: `rgb(var(${AREA_VAR[x.id]}))`, borderColor: `rgb(var(${AREA_VAR[x.id]}))` } : undefined}>
            <span className="font-display text-lg leading-none" aria-hidden>{x.icon}</span>{x.name}
          </button>
        ))}
      </nav>

      {isNew && (
        <div className="mb-6 anim-up">
          <Speech mood="happy" size={80}>
            <b>¡Hola! Soy Pi.</b> Te voy a acompañar mientras aprendés. Tocá el primer círculo del camino para empezar: son lecciones cortitas, de a poco.
          </Speech>
        </div>
      )}

      {units.map((u, ui) => (
        <UnitSection key={u.id} u={u} s={s} area={area} index={ui} isCurrentUnit={u.id === currentUnit} open={open} setOpen={setOpen} currentRef={currentRef} />
      ))}

      <div className="my-10 grid justify-items-center gap-3 text-center">
        <span className="text-6xl" aria-hidden>🏁</span>
        <h2 className="text-xl">Fin del camino de {a.name}</h2>
        <p className="max-w-sm font-semibold text-muted">Cuando termines todo, probá un examen de práctica o pasá a otro tema.</p>
        <Link to="/simulacros" className="btn-blue">Examen de práctica</Link>
      </div>
    </div>
  )
}

function UnitSection({ u, s, area, index, isCurrentUnit, open, setOpen, currentRef }: {
  u: Unit; s: State; area: AreaId; index: number; isCurrentUnit: boolean; open: string | null; setOpen: (k: string | null) => void; currentRef: React.RefObject<HTMLDivElement | null>
}) {
  const locked = unitStatus(s, u) === 'bloqueada'
  const states = nodeStates(s, u)
  const color = locked ? '--line' : AREA_VAR[area]
  const prog = unitProgress(s, u)
  const miss = locked ? missingPrereqs(s, u) : []
  return (
    <section className="mb-10" aria-labelledby={`u-${u.id}`}>
      <header className="flex items-center gap-3 rounded-2xl p-4 text-white sm:p-5" style={{ background: `rgb(var(${color}))`, boxShadow: `0 4px 0 rgb(0 0 0 / .18), 0 4px 0 rgb(var(${color}))` }}>
        <div className="min-w-0 flex-1">
          <div className={'text-xs font-black uppercase tracking-wider ' + (locked ? 'text-muted' : 'text-white/80')}>Unidad {u.n}{prog === 1 ? ' · ✓ completa' : ''}</div>
          <h2 id={`u-${u.id}`} className={'text-xl leading-tight ' + (locked ? 'text-muted' : '')}>{u.title}</h2>
          <p className={'mt-0.5 text-sm font-semibold ' + (locked ? 'text-muted' : 'text-white/90')}>{u.short}</p>
        </div>
        <Link to={`/unidad/${u.id}`} className={'flex shrink-0 flex-col items-center gap-0.5 rounded-xl border-2 px-3 py-2 text-[0.7rem] font-black uppercase ' + (locked ? 'border-muted/40 text-muted' : 'border-white/40 hover:bg-white/10')} aria-label={`Guía de ${u.title}`}>
          <span className="text-xl" aria-hidden>📒</span>Guía
        </Link>
      </header>

      {locked && (
        <div className="mx-auto mt-5 grid max-w-sm justify-items-center gap-2 text-center">
          <p className="text-sm font-semibold text-muted">🔒 Primero conviene avanzar en {miss.map((x) => x.unit.title).join(' y ')}.</p>
          <Link to={`/leccion/${u.id}/nivel`} className="btn-ghost btn-sm">⏩ ¿Ya lo sabés? Hacé la prueba para saltar</Link>
        </div>
      )}

      <div className="relative mt-14 grid justify-items-center gap-5">
        {NODES.map((n, i) => {
          const st = states[i]
          const key = u.id + ':' + n.id
          const isCurrent = st === 'current' && isCurrentUnit
          const off = OFFSETS[(i + index * 3) % OFFSETS.length]
          return (
            <div key={n.id} className={'relative flex w-full justify-center ' + (open === key ? 'z-30' : '')} ref={isCurrent ? currentRef : undefined} data-node>
              <div style={{ transform: `translateX(${off}px)` }}>
                <NodeButton n={n} st={st} color={AREA_VAR[area]} current={isCurrent} onClick={() => setOpen(open === key ? null : key)} />
              </div>
              {open === key && <NodePopover u={u} n={n} st={st} color={AREA_VAR[area]} arrow={off} onClose={() => setOpen(null)} />}
            </div>
          )
        })}
        {/* mascota decorativa al costado */}
        {!locked && <div className={'pointer-events-none absolute top-24 hidden sm:block ' + (index % 2 ? 'left-2' : 'right-2')} aria-hidden><Mascot mood={prog === 1 ? 'party' : index % 2 ? 'think' : 'happy'} size={88} /></div>}
      </div>
    </section>
  )
}

function NodeButton({ n, st, color, current, onClick }: { n: PathNode; st: NodeState; color: string; current: boolean; onClick: () => void }) {
  const big = n.id === 'examen' || n.id === 'repaso'
  const c = st === 'locked' ? '--line' : st === 'done' ? '--gold' : color
  return (
    <div className="relative grid justify-items-center">
      {current && <div className="absolute -top-12 z-10 whitespace-nowrap rounded-xl border-2 border-line bg-surface px-3 py-1.5 text-sm font-black uppercase tracking-wide anim-bob" style={{ color: `rgb(var(${color}))` }}>Empezar<span className="absolute -bottom-[7px] left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 border-b-2 border-r-2 border-line bg-surface" /></div>}
      <button type="button" onClick={onClick} aria-label={`${n.title}${st === 'done' ? ' (completada)' : st === 'locked' ? ' (bloqueada)' : ''}`}
        className={'relative grid place-items-center rounded-full text-3xl transition-transform active:translate-y-[5px] ' + (big ? 'h-[5.2rem] w-[5.2rem]' : 'h-[4.6rem] w-[4.6rem]') + (current ? ' anim-ring' : '')}
        style={{ background: `rgb(var(${c}))`, boxShadow: `0 6px 0 rgb(0 0 0 / .2), 0 6px 0 rgb(var(${c}))`, ['--ring' as string]: `var(${color})` }}>
        <span className={st === 'locked' ? 'opacity-40 grayscale' : ''} aria-hidden>{st === 'done' && !big ? '✔️' : n.icon}</span>
        {st === 'locked' && <span className="absolute -bottom-1 -right-1 grid h-7 w-7 place-items-center rounded-full border-2 border-bg bg-surface2 text-muted"><Icon name="lock" className="h-4 w-4" /></span>}
      </button>
    </div>
  )
}

function NodePopover({ u, n, st, color, arrow, onClose }: { u: Unit; n: PathNode; st: NodeState; color: string; arrow: number; onClose: () => void }) {
  const nav = useNavigate()
  const game = GAMES.find((g) => g.id === u.lesson.game)
  const locked = st === 'locked'
  const go = () => {
    onClose()
    if (n.id === 'juego' && game) { markStage(u.id, n.stage); nav(`/juegos/${game.id}?unidad=${u.id}`) }
    else nav(`/leccion/${u.id}/${n.id}`)
  }
  const unitLocked = unitStatus(useProgress(), u) === 'bloqueada'
  return (
    <div className="absolute left-1/2 top-full z-30 mt-4 w-80 max-w-full -translate-x-1/2 rounded-2xl p-4 text-white shadow-xl anim-pop" style={{ background: locked ? 'rgb(var(--surface2))' : `rgb(var(${color}))` }} role="dialog" aria-label={n.title}>
      <span className="absolute -top-2 h-4 w-4 -translate-x-1/2 rotate-45" style={{ left: `calc(50% + ${arrow}px)`, background: locked ? 'rgb(var(--surface2))' : `rgb(var(${color}))` }} />
      <div className={'text-lg font-black ' + (locked ? 'text-ink' : '')}>{n.title}{n.id === 'juego' && game ? `: ${game.name}` : ''}</div>
      <p className={'mt-1 text-sm font-semibold ' + (locked ? 'text-muted' : 'text-white/90')}>{n.id === 'juego' && game ? game.desc : n.desc}</p>
      {locked ? (
        <p className="mt-3 text-sm font-bold text-muted">{unitLocked ? 'Esta unidad todavía está bloqueada.' : 'Completá las paradas anteriores para abrir esta.'}</p>
      ) : (
        <button type="button" onClick={go} className="btn mt-3 w-full bg-white" style={{ color: `rgb(var(${color}))`, boxShadow: '0 4px 0 rgb(0 0 0 / .15)' }} autoFocus>
          {st === 'done' ? 'Repetir' : n.id === 'juego' ? 'Jugar' : 'Empezar'}{n.id === 'aprender' || n.id === 'juego' ? '' : ' · +puntos'}
        </button>
      )}
    </div>
  )
}
