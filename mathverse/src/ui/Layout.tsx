/** Estructura general estilo app de aprendizaje: barra lateral, panel de racha y misiones, barra inferior en celular. */
import { useEffect, useState, type ReactNode } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { onToast, refreshDay, useProgress, type Toast } from '../progress/store'
import { missionsFor, playerLevel } from '../progress/gamification'
import { dayKey } from '../progress/mastery'
import { Icon, type IconName } from './icons'
import { Mascot } from './Mascot'

export const NAV: { to: string; label: string; short?: string; icon: IconName; color: string }[] = [
  { to: '/', label: 'Aprender', icon: 'home', color: 'text-brand' },
  { to: '/repaso', label: 'Repasar', icon: 'review', color: 'text-brand2' },
  { to: '/juegos', label: 'Juegos', icon: 'games', color: 'text-amat' },
  { to: '/laboratorio', label: 'Laboratorio', short: 'Lab', icon: 'lab', color: 'text-avec' },
  { to: '/simulacros', label: 'Exámenes', icon: 'exam', color: 'text-ader' },
  { to: '/progreso', label: 'Perfil', icon: 'progress', color: 'text-aint' },
]

function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2" aria-label="MathVerse, inicio">
      <Mascot size={34} />
      <span className="font-display text-2xl font-black tracking-tight text-brand">mathverse</span>
    </Link>
  )
}

function Toasts() {
  const [list, setList] = useState<Toast[]>([])
  useEffect(() => onToast((t) => {
    setList((l) => [...l.slice(-3), t])
    setTimeout(() => setList((l) => l.filter((x) => x.id !== t.id)), 4500)
  }), [])
  return (
    <div className="pointer-events-none fixed inset-x-0 top-3 z-[60] flex flex-col items-center gap-2 px-3" aria-live="polite">
      {list.map((t) => (
        <div key={t.id} className="pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-2xl border-2 border-line bg-surface p-3 shadow-xl anim-pop">
          <span className="text-3xl" aria-hidden>{t.icon ?? '✨'}</span>
          <div className="min-w-0 flex-1"><div className="font-extrabold">{t.title}</div>{t.text && <div className="text-sm text-muted">{t.text}</div>}</div>
          <button type="button" onClick={() => setList((l) => l.filter((x) => x.id !== t.id))} className="text-muted hover:text-ink" aria-label="Cerrar aviso"><Icon name="close" className="h-4 w-4" /></button>
        </div>
      ))}
    </div>
  )
}

/** Fueguito de racha, XP y nivel: arriba en celular y en el panel derecho en compu. */
export function StatsRow() {
  const s = useProgress()
  const lv = playerLevel(s.xp)
  return (
    <div className="flex items-center gap-4 font-extrabold">
      <span className={'flex items-center gap-1 ' + (s.streak.current ? 'text-ader' : 'text-muted')} title="Días seguidos practicando"><span className="text-xl" aria-hidden>🔥</span>{s.streak.current}</span>
      <span className="flex items-center gap-1 text-brand2" title="Puntos de experiencia"><span className="text-xl" aria-hidden>💎</span>{s.xp}</span>
      <span className="flex items-center gap-1 text-gold" title="Tu nivel"><span className="text-xl" aria-hidden>⭐</span>{lv.level}</span>
    </div>
  )
}

export function Bar({ value, color = 'brand', className = '' }: { value: number; color?: string; className?: string }) {
  const pct = Math.round(Math.max(0, Math.min(1, value)) * 100)
  return (
    <div className={'h-4 w-full overflow-hidden rounded-full bg-line ' + className} role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
      <div className="relative h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: `rgb(var(--${color.startsWith('a') && color.length === 4 ? 'a-' + color.slice(1) : color}))` }}>
        <span className="absolute inset-x-2 top-1 h-1 rounded-full bg-white/30" />
      </div>
    </div>
  )
}

function SideRail() {
  const s = useProgress()
  const today = dayKey()
  const lv = playerLevel(s.xp)
  const missions = missionsFor(today)
  const due = s.errors.filter((e) => e.due <= today).length
  return (
    <aside className="sticky top-6 hidden w-[22rem] shrink-0 flex-col gap-5 self-start xl:flex">
      <div className="flex justify-end"><StatsRow /></div>
      <div className="card p-5">
        <div className="flex items-center justify-between"><h2 className="text-lg">Nivel {lv.level}</h2><span className="chip">{lv.title}</span></div>
        <Bar value={lv.into / lv.need} color="gold" className="mt-3" />
        <p className="mt-2 text-sm font-semibold text-muted">Te faltan {lv.need - lv.into} puntos para subir de nivel</p>
      </div>
      <div className="card p-5">
        <h2 className="mb-3 text-lg">Misiones del día</h2>
        <ul className="grid gap-4">
          {missions.map((m) => {
            const p = s.daily.date === today ? s.daily.missions.find((x) => x.id === m.id)?.progress ?? 0 : 0
            const done = s.daily.date === today && s.daily.claimed.includes(m.id)
            return (
              <li key={m.id} className="flex items-center gap-3">
                <span className="text-3xl" aria-hidden>{done ? '✅' : '🎯'}</span>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-bold">{m.text}</div>
                  <div className="mt-1 flex items-center gap-2"><Bar value={p / m.goal} color={done ? 'brand' : 'gold'} className="!h-3" /><span className="shrink-0 text-xs font-bold text-muted">{p}/{m.goal}</span></div>
                </div>
              </li>
            )
          })}
        </ul>
      </div>
      {due > 0 && (
        <Link to="/repaso" className="card flex items-center gap-3 p-4 hover:bg-surface2">
          <span className="text-3xl" aria-hidden>🔁</span>
          <span className="flex-1 font-bold">Tenés {due} ejercicio{due > 1 ? 's' : ''} para repasar hoy</span>
          <Icon name="arrow" className="h-5 w-5 text-muted" />
        </Link>
      )}
      <Link to="/juegos/diario" className="card flex items-center gap-3 p-4 hover:bg-surface2">
        <span className="text-3xl" aria-hidden>📆</span>
        <span className="flex-1 font-bold">{s.dailyChallenges[today] ? 'Desafío de hoy completo ✓' : 'Desafío del día: 5 preguntas'}</span>
        <Icon name="arrow" className="h-5 w-5 text-muted" />
      </Link>
    </aside>
  )
}

export function Layout({ children }: { children: ReactNode }) {
  const s = useProgress()
  const loc = useLocation()
  useEffect(() => { refreshDay() }, [])
  useEffect(() => {
    const el = document.documentElement
    el.dataset.theme = s.settings.theme
    el.dataset.reducedMotion = String(s.settings.reducedMotion)
    el.style.setProperty('--font-scale', String(s.settings.fontScale))
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', s.settings.theme === 'dark' ? '#131f24' : '#ffffff')
  }, [s.settings.theme, s.settings.reducedMotion, s.settings.fontScale])
  useEffect(() => { window.scrollTo({ top: 0 }) }, [loc.pathname])

  // las lecciones se muestran a pantalla completa, sin menús
  if (loc.pathname.startsWith('/leccion')) return <><Toasts />{children}</>
  const rail = loc.pathname === '/' || loc.pathname === '/repaso'

  return (
    <div className="min-h-dvh">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:rounded-xl focus:bg-brand2 focus:px-3 focus:py-2 focus:text-white">Saltar al contenido</a>
      <Toasts />
      {/* barra lateral */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r-2 border-line bg-bg px-4 py-6 lg:flex">
        <div className="px-3"><Logo /></div>
        <nav className="mt-8 grid gap-1.5" aria-label="Principal">
          {[...NAV, { to: '/configuracion', label: 'Más', icon: 'settings' as IconName, color: 'text-muted' }].map((n) => (
            <NavLink key={n.to} to={n.to} end={n.to === '/'} className={({ isActive }) => 'flex items-center gap-4 rounded-2xl border-2 px-4 py-2.5 text-[0.95rem] font-extrabold uppercase tracking-wide transition ' + (isActive ? 'border-brand2/60 bg-selbg text-brand2' : 'border-transparent text-muted hover:bg-surface2')}>
              <Icon name={n.icon} className={'h-7 w-7 ' + n.color} />{n.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      {/* barra superior (celular) */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b-2 border-line bg-bg/95 px-4 py-2 backdrop-blur lg:hidden">
        <Logo />
        <div className="flex items-center gap-3"><StatsRow /><Link to="/configuracion" className="text-muted" aria-label="Más opciones"><Icon name="settings" className="h-6 w-6" /></Link></div>
      </header>
      <div className="lg:pl-64">
        <div className="mx-auto flex w-full max-w-[72rem] gap-10 px-4 pb-28 pt-5 sm:px-6 lg:pb-12 lg:pt-8">
          <main id="main" className="min-w-0 flex-1">{children}</main>
          {rail && <SideRail />}
        </div>
      </div>
      {/* barra inferior (celular) */}
      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-6 border-t-2 border-line bg-bg pb-[env(safe-area-inset-bottom)] lg:hidden" aria-label="Principal">
        {NAV.map((n) => (
          <NavLink key={n.to} to={n.to} end={n.to === '/'} aria-label={n.label} className={({ isActive }) => 'flex flex-col items-center gap-0.5 py-2 text-[0.6rem] font-extrabold uppercase ' + (isActive ? 'text-brand2' : 'text-muted')}>
            {({ isActive }) => (<><span className={'grid h-9 w-11 place-items-center rounded-xl border-2 ' + (isActive ? 'border-brand2/60 bg-selbg' : 'border-transparent')}><Icon name={n.icon} className={'h-6 w-6 ' + n.color} /></span><span className="truncate">{n.short ?? n.label}</span></>)}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}

export function PageHeader({ title, subtitle, back, right }: { title: ReactNode; subtitle?: ReactNode; back?: { to: string; label: string }; right?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div className="min-w-0">
        {back && <Link to={back.to} className="mb-2 inline-flex items-center gap-1 text-sm font-bold uppercase text-muted hover:text-ink"><Icon name="back" className="h-4 w-4" />{back.label}</Link>}
        <h1 className="text-2xl sm:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1 max-w-2xl font-semibold text-muted">{subtitle}</p>}
      </div>
      {right}
    </div>
  )
}

export function ProgressBar({ value, color = 'brand', label }: { value: number; color?: string; label?: string }) {
  const pct = Math.round(Math.max(0, Math.min(1, value)) * 100)
  return (
    <div className="h-2.5 w-full overflow-hidden rounded-full bg-line" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={label}>
      <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: `rgb(var(--${color === 'brand' ? 'brand' : color.startsWith('a') && color.length === 4 ? 'a-' + color.slice(1) : color}))` }} />
    </div>
  )
}
