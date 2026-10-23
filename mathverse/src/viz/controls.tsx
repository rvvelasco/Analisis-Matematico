/** Controles compartidos de las visualizaciones. */
import type { ReactNode } from 'react'
import { fmt } from '../math/numeric'

export function Slider({ label, value, min, max, step, onChange, format, id }: { label: ReactNode; value: number; min: number; max: number; step: number; onChange: (v: number) => void; format?: (v: number) => string; id?: string }) {
  return (
    <label className="grid gap-1" htmlFor={id}>
      <span className="flex items-center justify-between gap-2 text-sm"><span className="font-medium">{label}</span><span className="font-mono text-brand">{format ? format(value) : fmt(value, 3)}</span></span>
      <input id={id} type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className="w-full accent-[rgb(var(--brand))]" />
    </label>
  )
}

export function Stat({ label, value, tone }: { label: ReactNode; value: ReactNode; tone?: 'ok' | 'bad' | 'warn' | 'brand' }) {
  const c = tone === 'ok' ? 'text-ok' : tone === 'bad' ? 'text-bad' : tone === 'warn' ? 'text-warn' : tone === 'brand' ? 'text-brand' : 'text-ink'
  return (
    <div className="rounded-xl border border-line bg-surface2/50 px-3 py-2">
      <div className="text-xs text-muted">{label}</div>
      <div className={'font-mono text-lg font-semibold ' + c}>{value}</div>
    </div>
  )
}

export function NumberBox({ value, onChange, label, step = 1 }: { value: number; onChange: (v: number) => void; label: string; step?: number }) {
  return (
    <input type="number" step={step} aria-label={label} value={Number.isFinite(value) ? value : 0} onChange={(e) => onChange(e.target.value === '' ? 0 : Number(e.target.value))}
      className="input !w-16 !px-1.5 !py-1.5 text-center" />
  )
}

export function WidgetFrame({ children, side }: { children: ReactNode; side?: ReactNode }) {
  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_17rem]">
      <div className="min-w-0">{children}</div>
      {side && <div className="grid content-start gap-3">{side}</div>}
    </div>
  )
}
