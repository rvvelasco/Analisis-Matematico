/** Estructura general: barra lateral (escritorio), barra inferior (celular), avisos y tema. */
import { useEffect, useState, type ReactNode } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { onToast, refreshDay, updateSettings, useProgress, type Toast } from '../progress/store'
import { playerLevel } from '../progress/gamification'
import { Icon, type IconName } from './icons'

export const NAV: { to: string; label: string; icon: IconName }[] = [
  { to: '/', label: 'Inicio', icon: 'home' },
  { to: '/aprender', label: 'Aprender', icon: 'learn' },
  { to: '/juegos', label: 'Juegos', icon: 'games' },
  { to: '/laboratorio', label: 'Laboratorio', icon: 'lab' },
  { to: '/simulacros', label: 'Simulacros', icon: 'exam' },
  { to: '/progreso', label: 'Mi progreso', icon: 'progress' },
]

function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2.5" aria-label="MathVerse, inicio">
      <svg viewBox="0 0 64 64" className="h-9 w-9" aria-hidden>
        <defs><linearGradient id="lg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="rgb(var(--brand))" /><stop offset="1" stopColor="rgb(var(--brand2))" /></linearGradient></defs>
        <rect width="64" height="64" rx="16" fill="url(#lg)" />
        <path d="M12 44c8 0 10-24 20-24s12 24 20 24" fill="none" stroke="white" strokeWidth="5" strokeLinecap="round" />
        <circle cx="32" cy="20" r="4" fill="white" />
      </svg>
      <span className="font-display text-xl font-bold tracking-tight">Math<span className="text-brand">Verse</span></span>
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
    <div className="pointer-events-none fixed inset-x-0 top-3 z-50 flex flex-col items-center gap-2 px-3" aria-live="polite">
      {list.map((t) => (
        <div key={t.id} className="pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl border border-line bg-surface/95 p-3 shadow-2xl backdrop-blur anim-up">
          <span className="text-2xl" aria-hidden>{t.icon ?? '✨'}</span>
          <div className="min-w-0 flex-1"><div className="font-semibold">{t.title}</div>{t.text && <div className="text-sm text-muted">{t.text}</div>}</div>
          <button type="button" onClick={() => setList((l) => l.filter((x) => x.id !== t.id))} className="text-muted hover:text-ink" aria-label="Cerrar aviso"><Icon name="close" className="h-4 w-4" /></button>
        </div>
      ))}
    </div>
  )
}

export function Layout({ children }: { children: ReactNode }) {
  const s = useProgress()
  const loc = useLocation()
  const lv = playerLevel(s.xp)
  useEffect(() => { refreshDay() }, [])
  useEffect(() => {
    const el = document.documentElement
    el.dataset.theme = s.settings.theme
    el.dataset.reducedMotion = String(s.settings.reducedMotion)
    el.style.setProperty('--font-scale', String(s.settings.fontScale))
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', s.settings.theme === 'dark' ? '#0a0d18' : '#f5f6fb')
  }, [s.settings.theme, s.settings.reducedMotion, s.settings.fontScale])
  useEffect(() => { window.scrollTo({ top: 0 }) }, [loc.pathname])

  const toggleTheme = () => updateSettings({ theme: s.settings.theme === 'dark' ? 'light' : 'dark' })

  return (
    <div className="min-h-dvh bg-aurora">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:rounded-lg focus:bg-brand focus:px-3 focus:py-2 focus:text-white">Saltar al contenido</a>
      <Toasts />
      {/* barra lateral */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-line/60 bg-surface/70 px-4 py-5 backdrop-blur lg:flex">
        <Logo />
        <nav className="mt-8 grid gap-1" aria-label="Principal">
          {NAV.map((n) => (
            <NavLink key={n.to} to={n.to} end={n.to === '/'} className={({ isActive }) => 'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ' + (isActive ? 'bg-brand/15 text-ink' : 'text-muted hover:bg-surface2 hover:text-ink')}>
              <Icon name={n.icon} />{n.label}
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto grid gap-3">
          <Link to="/progreso" className="rounded-2xl border border-line bg-surface2/60 p-3 hover:border-brand/50">
            <div className="flex items-center justify-between text-sm"><span className="font-semibold">Nivel {lv.level} · {lv.title}</span><span className="flex items-center gap-1 text-ader"><Icon name="fire" className="h-4 w-4" />{s.streak.current}</span></div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-line"><div className="h-full rounded-full bg-gradient-to-r from-brand to-brand2" style={{ width: `${(lv.into / lv.need) * 100}%` }} /></div>
            <div className="mt-1 text-xs text-muted">{lv.into} / {lv.need} XP</div>
          </Link>
          <div className="flex gap-2">
            <NavLink to="/configuracion" className={({ isActive }) => 'btn-ghost flex-1 ' + (isActive ? '!border-brand' : '')}><Icon name="settings" className="h-4 w-4" />Configuración</NavLink>
            <button type="button" className="btn-ghost !px-3" onClick={toggleTheme} aria-label={s.settings.theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}><Icon name={s.settings.theme === 'dark' ? 'sun' : 'moon'} className="h-4 w-4" /></button>
          </div>
        </div>
      </aside>
      {/* barra superior (celular) */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-line/60 bg-bg/80 px-4 py-2.5 backdrop-blur lg:hidden">
        <Logo />
        <div className="flex items-center gap-1">
          <span className="chip !text-ader"><Icon name="fire" className="h-3.5 w-3.5" />{s.streak.current}</span>
          <button type="button" className="btn-ghost !px-2.5 !py-2" onClick={toggleTheme} aria-label="Cambiar tema"><Icon name={s.settings.theme === 'dark' ? 'sun' : 'moon'} className="h-4 w-4" /></button>
          <Link to="/configuracion" className="btn-ghost !px-2.5 !py-2" aria-label="Configuración"><Icon name="settings" className="h-4 w-4" /></Link>
        </div>
      </header>
      <main id="main" className="mx-auto w-full max-w-6xl px-4 pb-28 pt-5 sm:px-6 lg:pb-12 lg:pl-[18.5rem] lg:pr-8 lg:pt-8 xl:max-w-[86rem]">
        {children}
      </main>
      {/* barra inferior */}
      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-6 border-t border-line/60 bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden" aria-label="Principal">
        {NAV.map((n) => (
          <NavLink key={n.to} to={n.to} end={n.to === '/'} className={({ isActive }) => 'flex flex-col items-center gap-0.5 py-2 text-[0.65rem] font-medium ' + (isActive ? 'text-brand' : 'text-muted')}>
            <Icon name={n.icon} className="h-5 w-5" /><span className="truncate">{n.label.replace('Mi progreso', 'Progreso')}</span>
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
        {back && <Link to={back.to} className="mb-2 inline-flex items-center gap-1 text-sm text-muted hover:text-ink"><Icon name="back" className="h-4 w-4" />{back.label}</Link>}
        <h1 className="text-2xl font-bold sm:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1 max-w-2xl text-muted">{subtitle}</p>}
      </div>
      {right}
    </div>
  )
}

export function ProgressBar({ value, color = 'brand', label }: { value: number; color?: string; label?: string }) {
  const pct = Math.round(Math.max(0, Math.min(1, value)) * 100)
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-line/70" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={label}>
      <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: `rgb(var(--${color === 'brand' ? 'brand' : color.startsWith('a') ? 'a-' + color.slice(1) : color}))` }} />
    </div>
  )
}
