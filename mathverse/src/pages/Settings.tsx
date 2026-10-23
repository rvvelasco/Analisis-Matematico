import { useRef, useState } from 'react'
import { exportProgress, importProgress, isStorageOk, resetProgress, updateSettings, useProgress } from '../progress/store'
import { PageHeader } from '../ui/Layout'

function Toggle({ checked, onChange, label, desc }: { checked: boolean; onChange: (v: boolean) => void; label: string; desc?: string }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-line bg-surface2/40 p-4">
      <span><span className="block font-medium">{label}</span>{desc && <span className="block text-sm text-muted">{desc}</span>}</span>
      <input type="checkbox" role="switch" className="h-5 w-9 cursor-pointer accent-[rgb(var(--brand))]" checked={checked} onChange={(e) => onChange(e.target.checked)} />
    </label>
  )
}

export default function Settings() {
  const s = useProgress()
  const file = useRef<HTMLInputElement>(null)
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const [confirmReset, setConfirmReset] = useState(false)

  const doExport = () => {
    const blob = new Blob([exportProgress()], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `mathverse-progreso-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
    setMsg({ ok: true, text: 'Archivo descargado. Guardalo para restaurar tu progreso en otro dispositivo o navegador.' })
  }
  const doImport = async (f: File) => {
    const text = await f.text()
    const r = importProgress(text)
    setMsg(r.ok ? { ok: true, text: 'Progreso importado correctamente.' } : { ok: false, text: r.error ?? 'No se pudo importar.' })
  }

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Configuración" />
      <div className="grid gap-6">
        <section className="card-pad grid gap-3">
          <h2 className="text-lg font-semibold">Perfil</h2>
          <label className="grid gap-1 text-sm">¿Cómo querés que te llamemos?<input className="input font-sans" maxLength={40} value={s.settings.name} onChange={(e) => updateSettings({ name: e.target.value })} placeholder="Tu nombre (opcional)" /></label>
        </section>
        <section className="card-pad grid gap-3">
          <h2 className="text-lg font-semibold">Apariencia y accesibilidad</h2>
          <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Tema">
            {(['dark', 'light'] as const).map((t) => <button key={t} type="button" role="radio" aria-checked={s.settings.theme === t} onClick={() => updateSettings({ theme: t })} className={'btn border ' + (s.settings.theme === t ? 'border-brand bg-brand/15' : 'border-line bg-surface2/50')}>{t === 'dark' ? '🌙 Oscuro' : '☀️ Claro'}</button>)}
          </div>
          <Toggle checked={s.settings.reducedMotion} onChange={(v) => updateSettings({ reducedMotion: v })} label="Reducir animaciones" desc="Desactiva transiciones y movimientos." />
          <Toggle checked={s.settings.showTimer} onChange={(v) => updateSettings({ showTimer: v })} label="Mostrar tiempo estimado" desc="Indica cuántos minutos lleva cada ejercicio." />
          <label className="grid gap-2 rounded-xl border border-line bg-surface2/40 p-4">
            <span className="flex justify-between font-medium"><span>Tamaño del texto</span><span className="font-mono text-brand">{Math.round(s.settings.fontScale * 100)}%</span></span>
            <input type="range" min={0.85} max={1.4} step={0.05} value={s.settings.fontScale} onChange={(e) => updateSettings({ fontScale: Number(e.target.value) })} className="accent-[rgb(var(--brand))]" aria-label="Tamaño del texto" />
          </label>
        </section>
        <section className="card-pad grid gap-3">
          <h2 className="text-lg font-semibold">Tus datos</h2>
          <p className="text-sm text-muted">Tu progreso se guarda solo en este navegador (no se envía a ningún servidor). Exportalo para tener una copia o pasarlo a otro dispositivo.</p>
          {!isStorageOk() && <p className="text-sm text-warn">Atención: el navegador no está permitiendo guardar datos (¿modo privado?). El progreso se perderá al cerrar.</p>}
          <div className="flex flex-wrap gap-2">
            <button type="button" className="btn-primary" onClick={doExport}>Exportar progreso</button>
            <button type="button" className="btn-ghost" onClick={() => file.current?.click()}>Importar progreso</button>
            <input ref={file} type="file" accept="application/json,.json" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) void doImport(f); e.target.value = '' }} />
          </div>
          {msg && <p className={'text-sm ' + (msg.ok ? 'text-ok' : 'text-bad')} role="status">{msg.text}</p>}
          <div className="mt-2 rounded-xl border border-bad/40 p-4">
            <div className="font-medium text-bad">Borrar todo el progreso</div>
            <p className="text-sm text-muted">Se pierden XP, rachas, dominio y logros. La configuración se mantiene.</p>
            {!confirmReset ? <button type="button" className="btn-ghost mt-2 !border-bad/50" onClick={() => setConfirmReset(true)}>Borrar progreso…</button> : (
              <div className="mt-2 flex flex-wrap gap-2"><button type="button" className="btn mt-0 bg-bad text-white" onClick={() => { resetProgress(); setConfirmReset(false); setMsg({ ok: true, text: 'Progreso borrado.' }) }}>Sí, borrar todo</button><button type="button" className="btn-ghost" onClick={() => setConfirmReset(false)}>Cancelar</button></div>
            )}
          </div>
        </section>
        <section className="card-pad text-sm text-muted">
          <h2 className="mb-2 text-lg font-semibold text-ink">Acerca de MathVerse</h2>
          <p>Versión 1.0 · Funciona sin conexión una vez cargada. Las fórmulas se dibujan con KaTeX. Los ejercicios se generan a partir de plantillas con parámetros controlados y se corrigen comparando expresiones por equivalencia matemática (no por texto).</p>
        </section>
      </div>
    </div>
  )
}
