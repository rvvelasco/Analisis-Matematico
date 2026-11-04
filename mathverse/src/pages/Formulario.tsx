/** Simulacro de examen del formulario del profe: estudiar cada pregunta y rendirlo como en el examen. */
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { FORM, TEMAS, type FQ, type Tema } from '../content/formulario'
import { instantiate } from '../engine/registry'
import type { Exercise } from '../engine/types'
import { SessionPlayer } from '../exercise/Session'
import { Md, TeX } from '../ui/Md'
import { Mascot, Speech } from '../ui/Mascot'
import { Bar } from '../ui/Layout'
import { Icon } from '../ui/icons'
import { sfx } from '../ui/sfx'

const KEY = 'mathverse:formulario'
const listas = FORM.filter((q) => !q.img)
const pendientes = FORM.filter((q) => q.img)

function loadBest(): { best: number; total: number } | null {
  try { const v = JSON.parse(localStorage.getItem(KEY) || 'null'); return v && typeof v.best === 'number' ? v : null } catch { return null }
}

export default function Formulario() {
  const best = loadBest()
  const [open, setOpen] = useState<number | null>(null)
  const orden: Tema[] = ['relacion', 'derivada', 'calculo', 'integral', 'calcint', 'metodos']
  return (
    <div className="mx-auto grid max-w-3xl grid-cols-[minmax(0,1fr)] gap-6">
      <section className="card-pad grid grid-cols-[minmax(0,1fr)] gap-4">
        <div className="flex items-center gap-4">
          <Mascot mood="happy" size={80} />
          <div className="min-w-0">
            <Link to="/parcial" className="label !text-brand2 hover:underline">← Parcial del jueves</Link>
            <h1 className="text-2xl sm:text-3xl">Simulacro del formulario</h1>
            <p className="font-semibold text-muted">Las {FORM.length} preguntas del formulario del profe, con la respuesta y la explicación de cada una.</p>
          </div>
        </div>
        {best && <div><div className="mb-1 flex justify-between text-sm font-extrabold"><span>Tu mejor resultado</span><span>{best.best} de {best.total}</span></div><Bar value={best.best / best.total} color="gold" /></div>}
        <div className="grid gap-3 sm:grid-cols-2">
          <Link to="/formulario/simulacro" className="btn-primary">🏆 Simulacro completo ({listas.length})</Link>
          <Link to="/formulario/simulacro?n=15" className="btn-blue">⚡ Simulacro corto (15 al azar)</Link>
          <Link to="/formulario/practicar" className="btn-ghost sm:col-span-2">✏️ Practicar V/F de derivadas e integrales (con otros números)</Link>
        </div>
        <Speech mood="think" size={56}><span className="text-sm">Ojo: en el formulario puede haber <b>más de una opción correcta</b>, y a veces la respuesta es una opción que no dice "Verdadero" ni "Falso". Leé todas antes de marcar.</span></Speech>
      </section>

      {orden.map((t) => {
        const qs = listas.filter((q) => q.tema === t).sort((a, b) => a.n - b.n)
        if (!qs.length) return null
        return (
          <section key={t} className="grid grid-cols-[minmax(0,1fr)] gap-2">
            <h2 className="flex items-center gap-2 text-xl"><span aria-hidden>{TEMAS[t].icon}</span>{TEMAS[t].t}<span className="text-sm font-bold text-muted">· {qs.length}</span></h2>
            {qs.map((q) => <QCard key={q.n} q={q} open={open === q.n} onToggle={() => setOpen(open === q.n ? null : q.n)} />)}
          </section>
        )
      })}

      {pendientes.length > 0 && (
        <section className="card-pad text-sm font-semibold text-muted">
          🖼️ Falta la imagen de la pregunta {pendientes.map((q) => q.n).join(', ')}: todavía no está cargada.
        </section>
      )}
    </div>
  )
}

function Answer({ q }: { q: FQ }) {
  const ok = q.opts.filter((o) => o.ok)
  return <span className="font-black text-ok">{ok.map((o) => o.t).join(' + ')}</span>
}

function QCard({ q, open, onToggle }: { q: FQ; open: boolean; onToggle: () => void }) {
  const multi = q.opts.filter((o) => o.ok).length > 1
  return (
    <article className="card overflow-hidden">
      <button type="button" onClick={onToggle} aria-expanded={open} className="flex w-full items-start gap-3 p-4 text-left hover:bg-surface2">
        <span className="grid h-9 min-w-[2.25rem] shrink-0 place-items-center rounded-full bg-brand2 px-1 text-sm font-black text-white">{q.n}</span>
        <span className="min-w-0 flex-1">
          <span className="block font-bold leading-snug">{q.tex ? <TeX tex={q.tex} /> : q.q}</span>
          {!open && <span className="mt-1 block text-sm">Respuesta: <Answer q={q} />{multi && <span className="ml-1 chip">varias</span>}</span>}
        </span>
        <span className={'text-xl text-muted transition-transform ' + (open ? 'rotate-180' : '')} aria-hidden>⌄</span>
      </button>
      {open && (
        <div className="grid grid-cols-[minmax(0,1fr)] gap-3 border-t-2 border-line p-4 anim-up">
          {q.tex && <div className="overflow-x-auto rounded-2xl bg-surface2 px-3"><TeX tex={q.tex} display /></div>}
          <ul className="grid gap-1.5">
            {q.opts.map((o, i) => <li key={i} className={'flex items-start gap-2 rounded-xl border-2 px-3 py-2 text-sm font-semibold ' + (o.ok ? 'border-ok bg-okbg' : 'border-line text-muted')}><span aria-hidden>{o.ok ? '✅' : '▫️'}</span><span>{o.t}</span></li>)}
          </ul>
          <div className="rounded-2xl bg-surface2 p-3 font-semibold"><span className="label !text-brand">Por qué</span><Md as="div" text={q.exp} className="mt-1" /></div>
          {q.trampa && <div className="rounded-2xl bg-badbg p-3 text-sm font-semibold"><span className="label !text-bad">⚠️ Trampa</span><Md as="div" text={q.trampa} className="mt-1" /></div>}
          {q.otro && <div className="rounded-2xl bg-selbg p-3 text-sm font-semibold"><span className="label !text-brand2">✍️ Para escribir en "Otro"</span><p className="mt-1">{q.otro}</p></div>}
        </div>
      )}
    </article>
  )
}

/* ---------- simulacro (como el formulario: una o varias opciones) ---------- */
function shuffle<T>(a: T[]): T[] { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]] } return b }

export function FormularioSimulacro() {
  const nav = useNavigate()
  const [params] = useSearchParams()
  const n = Number(params.get('n')) || listas.length
  const [seed, setSeed] = useState(0)
  const preguntas = useMemo(() => shuffle(listas).slice(0, Math.min(n, listas.length)), [n, seed]) // eslint-disable-line react-hooks/exhaustive-deps
  const [i, setI] = useState(0)
  const [sel, setSel] = useState<number[]>([])
  const [checked, setChecked] = useState(false)
  const [res, setRes] = useState<{ q: FQ; ok: boolean; sel: number[] }[]>([])
  const [askExit, setAskExit] = useState(false)
  const contRef = useRef<HTMLButtonElement>(null)
  useEffect(() => { if (checked) contRef.current?.focus() }, [checked])
  const done = i >= preguntas.length
  const exit = () => nav('/formulario')

  useEffect(() => {
    if (!done) return
    sfx.finish()
    const ok = res.filter((r) => r.ok).length
    const prev = loadBest()
    if (n >= listas.length && (!prev || ok > prev.best)) try { localStorage.setItem(KEY, JSON.stringify({ best: ok, total: preguntas.length })) } catch { /* nada */ }
  }, [done]) // eslint-disable-line react-hooks/exhaustive-deps

  if (done) {
    const ok = res.filter((r) => r.ok).length
    const mal = res.filter((r) => !r.ok)
    const pct = Math.round((ok / preguntas.length) * 100)
    return (
      <div className="fixed inset-0 z-40 flex flex-col bg-bg">
        <div className="flex-1 overflow-y-auto px-4 py-8">
          <div className="mx-auto grid max-w-2xl gap-5 text-center anim-pop">
            <Mascot mood={pct >= 80 ? 'party' : pct >= 60 ? 'happy' : 'think'} size={120} className="mx-auto" />
            <h2 className={'text-3xl ' + (pct >= 60 ? 'text-gold' : 'text-bad')}>{ok} de {preguntas.length} bien ({pct}%)</h2>
            <p className="font-semibold text-muted">{pct >= 80 ? '¡Muy bien! Estás listo.' : pct >= 60 ? 'Bien. Repasá las que fallaste y volvé a hacerlo.' : 'Leé las explicaciones de las que fallaste y repetilo: vas a ver cómo mejora.'}</p>
            {mal.length > 0 && (
              <div className="grid gap-2 text-left">
                <div className="label">Para repasar</div>
                {mal.map((r) => (
                  <div key={r.q.n} className="card p-3 text-sm">
                    <div className="font-extrabold">{r.q.n}. {r.q.tex ? <TeX tex={r.q.tex} /> : r.q.q}</div>
                    <div className="mt-1 font-semibold">Correcta: <Answer q={r.q} /></div>
                    <div className="mt-1 font-semibold text-muted"><Md as="div" text={r.q.exp} /></div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <footer className="border-t-2 border-line px-4 py-4">
          <div className="mx-auto flex max-w-3xl justify-end gap-3">
            <button type="button" className="btn-ghost flex-1 sm:flex-none" onClick={() => { setSeed(seed + 1); setI(0); setRes([]); setSel([]); setChecked(false) }}>Otra vez</button>
            <button type="button" className="btn-primary flex-1 sm:flex-none sm:min-w-[12rem]" onClick={exit} autoFocus>Listo</button>
          </div>
        </footer>
      </div>
    )
  }

  const q = preguntas[i]
  const correctas = q.opts.map((o, k) => (o.ok ? k : -1)).filter((k) => k >= 0)
  const isOk = checked && sel.length === correctas.length && correctas.every((k) => sel.includes(k))
  const toggle = (k: number) => { if (!checked) setSel((s) => (s.includes(k) ? s.filter((x) => x !== k) : [...s, k])) }
  const check = () => {
    if (!sel.length || checked) return
    const ok = sel.length === correctas.length && correctas.every((k) => sel.includes(k))
    if (ok) sfx.correct(); else sfx.wrong()
    setChecked(true)
    setRes((r) => [...r, { q, ok, sel }])
  }
  const next = () => { setI(i + 1); setSel([]); setChecked(false) }

  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-bg">
      <header className="flex items-center gap-4 px-4 pb-2 pt-4 sm:px-6 sm:pt-6">
        <button type="button" onClick={() => (res.length ? setAskExit(true) : exit())} className="text-muted hover:text-ink" aria-label="Salir del simulacro"><Icon name="close" className="h-7 w-7" /></button>
        <Bar value={i / preguntas.length} className="flex-1" />
        <span className="shrink-0 text-sm font-extrabold text-muted">{i + 1}/{preguntas.length}</span>
      </header>
      <main className="flex-1 overflow-y-auto px-4 pb-6 sm:px-6" onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); if (checked) next(); else check() } }}>
        <div className="mx-auto grid max-w-2xl gap-5 pt-5">
          <div className="text-sm font-extrabold uppercase tracking-wide text-amat">Pregunta {q.n} · {TEMAS[q.tema].t}</div>
          <div className="text-xl font-bold leading-relaxed">{q.tex ? <><p className="mb-2 text-base text-muted">{q.q}</p><div className="overflow-x-auto"><TeX tex={q.tex} display /></div></> : q.q}</div>
          <p className="text-sm font-semibold text-muted">Marcá todas las que consideres correctas.</p>
          <div className="grid gap-2" role="group" aria-label="Opciones">
            {q.opts.map((o, k) => {
              const on = sel.includes(k)
              const st = checked ? (o.ok ? 'ok' : on ? 'bad' : '') : ''
              return (
                <button key={k} type="button" role="checkbox" aria-checked={on} disabled={checked} onClick={() => toggle(k)}
                  className={'choice !items-start ' + (st === 'ok' ? '!border-ok !bg-okbg' : st === 'bad' ? '!border-bad !bg-badbg' : on ? 'choice-on' : '')}>
                  <span className={'mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-md border-2 text-xs font-black ' + (st === 'ok' ? 'border-ok bg-ok text-white' : st === 'bad' ? 'border-bad bg-bad text-white' : on ? 'border-brand2 bg-brand2 text-white' : 'border-line')}>{st === 'ok' ? '✓' : st === 'bad' ? '✕' : on ? '✓' : ''}</span>
                  <span className="min-w-0 flex-1">{o.t}</span>
                </button>
              )
            })}
          </div>
        </div>
      </main>
      <footer className={'border-t-2 ' + (checked ? (isOk ? 'border-transparent bg-okbg' : 'border-transparent bg-badbg') + ' anim-sheet' : 'border-line')} role={checked ? 'status' : undefined}>
        <div className="mx-auto max-w-3xl px-4 py-4 sm:py-5">
          {checked && (
            <div className="mb-3 max-h-[40vh] overflow-y-auto">
              <div className={'text-2xl font-black ' + (isOk ? 'text-ok' : 'text-bad')}>{isOk ? '¡Muy bien!' : 'No es así'}</div>
              {!isOk && <div className="mt-1 font-bold text-bad">Correcta: <Answer q={q} /></div>}
              <div className="mt-2 rounded-2xl bg-surface p-3 text-sm font-semibold"><Md as="div" text={q.exp} /></div>
              {q.trampa && <div className="mt-2 text-sm font-semibold text-ink/80"><b>Trampa: </b><Md text={q.trampa} /></div>}
            </div>
          )}
          <div className="flex justify-end">
            {!checked
              ? <button type="button" className="btn-primary min-w-[12rem] flex-1 sm:flex-none" onClick={check} disabled={!sel.length}>Comprobar</button>
              : <button ref={contRef} type="button" className={(isOk ? 'btn-primary' : 'btn-danger') + ' min-w-[12rem] flex-1 sm:flex-none'} onClick={next}>Continuar</button>}
          </div>
        </div>
      </footer>
      {askExit && (
        <div className="fixed inset-0 z-50 grid place-items-end bg-black/40 sm:place-items-center" role="dialog" aria-modal="true" aria-label="¿Salir?">
          <div className="w-full max-w-md rounded-t-3xl bg-surface p-6 text-center anim-sheet sm:rounded-3xl">
            <Mascot mood="sad" size={80} className="mx-auto" />
            <h3 className="mt-2 text-xl">¿Salir del simulacro?</h3>
            <p className="mt-1 font-semibold text-muted">Vas a perder lo que llevás respondido.</p>
            <div className="mt-5 grid gap-3"><button type="button" className="btn-primary" onClick={() => setAskExit(false)} autoFocus>Seguir</button><button type="button" className="btn-soft !text-bad" onClick={exit}>Salir</button></div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ---------- práctica con otros números ---------- */
export function FormularioPractica() {
  const nav = useNavigate()
  const [seed, setSeed] = useState(() => Math.floor(Math.random() * 1e9))
  const items = useMemo(() => {
    const plan: [string, number][] = [['px.derivVF', 2], ['px.derivVF', 2], ['px.constante', 1], ['i7.tf.teoria', 3], ['px.derivVF', 2], ['px.cero', 1], ['px.vfIntegral', 3], ['px.raiz', 3], ['px.derivVF', 2], ['i7.tf.teoria', 3]]
    return plan.map(([id, lv], k): Exercise | null => { try { return instantiate(id, seed + k * 7919, lv as 1 | 2 | 3) } catch { return null } }).filter((x): x is Exercise => !!x)
  }, [seed])
  return <SessionPlayer key={seed} items={items} title="Práctica del formulario" source="practica" requeue onExit={() => nav('/formulario')} onRestart={() => setSeed(Math.floor(Math.random() * 1e9))} />
}
