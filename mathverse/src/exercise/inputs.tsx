/** Controles de respuesta para cada tipo de ejercicio. */
import { useMemo, useRef, useState } from 'react'
import type { Answer, ExerciseBody, Feedback, Verdict } from '../engine/types'
import { parse, ParseError, stripIntegralDecorations, toTeX } from '../math/expr'
import { makeRand } from '../math/numeric'
import { withParams } from '../engine/sliderChecks'
import { Md, TeX } from '../ui/Md'
import { Plot } from '../ui/Plot'

export type Draft = Answer

export function emptyDraft(ex: ExerciseBody, seed = 1): Draft {
  switch (ex.kind) {
    case 'mc': return { kind: 'mc', index: -1 }
    case 'tf': return { kind: 'tf', value: null, reason: -1 }
    case 'numeric': return { kind: 'numeric', text: '' }
    case 'expression': return { kind: 'expression', text: '' }
    case 'fill': return { kind: 'fill', values: {} }
    case 'order': return { kind: 'order', order: shuffledOrder(ex.items.length, seed) }
    case 'match': return { kind: 'match', map: ex.pairs.map(() => -1) }
    case 'matrix': return { kind: 'matrix', cells: Array.from({ length: ex.rows }, () => Array.from({ length: ex.cols }, () => '')) }
    case 'errorStep': return { kind: 'errorStep', step: -1, rule: -1, fix: ex.fix ? '' : undefined }
    case 'multi': return { kind: 'multi', parts: ex.parts.map((p, i) => emptyDraft(p, seed + i)) }
    case 'slider': return { kind: 'slider', values: ex.params.map((p) => p.init) }
  }
}

function shuffledOrder(n: number, seed: number): number[] {
  const r = makeRand(seed * 31 + 7)
  let o = Array.from({ length: n }, (_, i) => i)
  for (let k = 0; k < 6 && o.every((v, i) => v === i); k++) o = r.shuffle(o)
  if (o.every((v, i) => v === i) && n > 1) o = [o[1], o[0], ...o.slice(2)]
  return o
}

/** ¿El borrador tiene algo para corregir? */
export function isDraftReady(ex: ExerciseBody, d: Draft): boolean {
  switch (d.kind) {
    case 'mc': return d.index >= 0
    case 'tf': return d.value !== null && d.reason >= 0
    case 'numeric': return d.text.trim() !== ''
    case 'expression': return d.text.trim() !== ''
    case 'fill': return ex.kind === 'fill' && ex.parts.every((p) => typeof p === 'string' || (d.values[p.id] ?? '').trim() !== '')
    case 'order': return true
    case 'match': return d.map.every((m) => m >= 0)
    case 'matrix': return d.cells.every((r) => r.every((c) => c.trim() !== ''))
    case 'errorStep': return d.step >= 0
    case 'multi': return ex.kind === 'multi' && ex.parts.some((p, i) => isDraftReady(p, d.parts[i]))
    case 'slider': return true
  }
}

const verdictRing = (v?: Verdict) => (v === 'correct' ? 'border-ok ring-2 ring-ok/30' : v === 'incorrect' || v === 'partial' ? 'border-bad ring-2 ring-bad/30' : '')

interface InputProps {
  ex: ExerciseBody
  draft: Draft
  onChange: (d: Draft) => void
  disabled?: boolean
  feedback?: Feedback | null
  /** revelar la respuesta correcta en los controles */
  reveal?: boolean
  seed?: number
}

export function AnswerInput(props: InputProps) {
  const { ex, draft } = props
  switch (ex.kind) {
    case 'mc': return <MCInput {...props} ex={ex} draft={draft as Extract<Draft, { kind: 'mc' }>} />
    case 'tf': return <TFInput {...props} ex={ex} draft={draft as Extract<Draft, { kind: 'tf' }>} />
    case 'numeric': return <NumericInput {...props} ex={ex} draft={draft as Extract<Draft, { kind: 'numeric' }>} />
    case 'expression': return <ExpressionInput {...props} ex={ex} draft={draft as Extract<Draft, { kind: 'expression' }>} />
    case 'fill': return <FillInput {...props} ex={ex} draft={draft as Extract<Draft, { kind: 'fill' }>} />
    case 'order': return <OrderInput {...props} ex={ex} draft={draft as Extract<Draft, { kind: 'order' }>} />
    case 'match': return <MatchInput {...props} ex={ex} draft={draft as Extract<Draft, { kind: 'match' }>} />
    case 'matrix': return <MatrixInput {...props} ex={ex} draft={draft as Extract<Draft, { kind: 'matrix' }>} />
    case 'errorStep': return <ErrorStepInput {...props} ex={ex} draft={draft as Extract<Draft, { kind: 'errorStep' }>} />
    case 'multi': return <MultiInput {...props} ex={ex} draft={draft as Extract<Draft, { kind: 'multi' }>} />
    case 'slider': return <SliderInput {...props} ex={ex} draft={draft as Extract<Draft, { kind: 'slider' }>} />
  }
}

type P<K extends ExerciseBody['kind']> = Omit<InputProps, 'ex' | 'draft'> & { ex: Extract<ExerciseBody, { kind: K }>; draft: Extract<Draft, { kind: K }> }

function Option({ selected, onClick, disabled, children, state }: { selected: boolean; onClick: () => void; disabled?: boolean; children: React.ReactNode; state?: 'ok' | 'bad' }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      disabled={disabled}
      onClick={onClick}
      className={
        'flex w-full items-start gap-3 rounded-xl border px-4 py-3 text-left transition ' +
        (state === 'ok' ? 'border-ok bg-ok/10' : state === 'bad' ? 'border-bad bg-bad/10' : selected ? 'border-brand bg-brand/10' : 'border-line bg-surface2/50 hover:border-brand/50')
      }
    >
      <span className={'mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border-2 ' + (selected ? 'border-brand' : 'border-line')}>{selected && <span className="h-2.5 w-2.5 rounded-full bg-brand" />}</span>
      <span className="min-w-0 flex-1">{children}</span>
    </button>
  )
}

function MCInput({ ex, draft, onChange, disabled, reveal, feedback }: P<'mc'>) {
  return (
    <div role="radiogroup" aria-label="Opciones" className="grid gap-2">
      {ex.options.map((o, i) => (
        <Option key={i} selected={draft.index === i} disabled={disabled} onClick={() => onChange({ kind: 'mc', index: i })} state={reveal && o.correct ? 'ok' : feedback && draft.index === i ? (o.correct ? 'ok' : 'bad') : undefined}>
          <Md text={o.text} />
        </Option>
      ))}
    </div>
  )
}

function TFInput({ ex, draft, onChange, disabled, reveal }: P<'tf'>) {
  return (
    <div className="grid gap-3">
      <div className="rounded-xl border border-line bg-surface2/50 p-4"><Md text={ex.statement} /></div>
      <div className="flex gap-2" role="radiogroup" aria-label="Verdadero o falso">
        {[true, false].map((v) => (
          <button key={String(v)} type="button" role="radio" aria-checked={draft.value === v} disabled={disabled} onClick={() => onChange({ ...draft, value: v })}
            className={'btn flex-1 border ' + (draft.value === v ? 'border-brand bg-brand/15 text-ink' : 'border-line bg-surface2/50 text-muted') + (reveal && ex.answer === v ? ' !border-ok' : '')}>
            {v ? 'Verdadero' : 'Falso'}
          </button>
        ))}
      </div>
      <div className="label">Justificación</div>
      <div role="radiogroup" aria-label="Justificación" className="grid gap-2">
        {ex.reasons.map((o, i) => (
          <Option key={i} selected={draft.reason === i} disabled={disabled} onClick={() => onChange({ ...draft, reason: i })} state={reveal && o.correct ? 'ok' : undefined}>
            <Md text={o.text} />
          </Option>
        ))}
      </div>
    </div>
  )
}

function NumericInput({ ex, draft, onChange, disabled, feedback }: P<'numeric'>) {
  return (
    <div className="flex items-center gap-2">
      <input className={'input max-w-xs ' + verdictRing(feedback?.verdict)} inputMode="text" autoComplete="off" spellCheck={false} aria-label="Tu respuesta (número)" placeholder="Ej: -3/4, 2.5, sqrt(2), pi" value={draft.text} disabled={disabled} onChange={(e) => onChange({ kind: 'numeric', text: e.target.value })} />
      {ex.unit && <span className="text-muted">{ex.unit}</span>}
    </div>
  )
}

const KEYS: { label: string; ins: string; tex?: string }[] = [
  { label: 'x²', ins: '^2' }, { label: 'xⁿ', ins: '^' }, { label: '√', ins: 'sqrt(' }, { label: '÷', ins: '/' }, { label: '( )', ins: '()' },
  { label: 'π', ins: 'pi' }, { label: 'e', ins: 'e^' }, { label: 'ln', ins: 'ln(' }, { label: 'sen', ins: 'sen(' }, { label: 'cos', ins: 'cos(' }, { label: '|x|', ins: 'abs(' },
]

/** Vista previa de lo que escribió el estudiante, o el error de lectura. */
export function exprPreview(text: string, v: string, integral: boolean): { tex?: string; error?: string } {
  if (!text.trim()) return {}
  try {
    const src = integral ? stripIntegralDecorations(text).text : text
    return { tex: toTeX(parse(src, { vars: [v], ignoreConstants: integral ? ['c', 'k'] : [] })) + (integral && /\bC\b|\+\s*c\b/i.test(text) ? ' + C' : '') }
  } catch (e) {
    return { error: e instanceof ParseError ? e.message : 'No pude leer la expresión.' }
  }
}

export function ExprField({ value, onChange, v = 'x', integral = false, disabled, prefix, ring, label = 'Tu respuesta (expresión)' }: { value: string; onChange: (s: string) => void; v?: string; integral?: boolean; disabled?: boolean; prefix?: string; ring?: string; label?: string }) {
  const ref = useRef<HTMLInputElement>(null)
  const prev = useMemo(() => exprPreview(value, v, integral), [value, v, integral])
  const insert = (ins: string) => {
    const el = ref.current
    if (!el) return onChange(value + ins)
    const a = el.selectionStart ?? value.length, b = el.selectionEnd ?? value.length
    const next = value.slice(0, a) + ins + value.slice(b)
    onChange(next)
    const pos = a + (ins === '()' ? 1 : ins.length)
    requestAnimationFrame(() => { el.focus(); el.setSelectionRange(pos, pos) })
  }
  return (
    <div className="grid gap-2">
      <div className="flex items-center gap-2">
        {prefix && <span className="shrink-0 font-mono text-muted">{prefix}</span>}
        <input ref={ref} className={'input ' + (ring ?? '')} autoComplete="off" autoCapitalize="off" spellCheck={false} aria-label={label} placeholder={integral ? 'Ej: x^3/3 + 2x + C' : 'Ej: 3x^2 - 2/x'} value={value} disabled={disabled} onChange={(e) => onChange(e.target.value)} />
      </div>
      {!disabled && (
        <div className="flex flex-wrap gap-1" aria-label="Teclado matemático">
          {KEYS.map((k) => <button key={k.label} type="button" className="btn-ghost btn-sm min-w-[2.4rem] font-mono" onClick={() => insert(k.ins)} aria-label={`Insertar ${k.label}`}>{k.label}</button>)}
          {integral && <button type="button" className="btn-ghost btn-sm font-mono" onClick={() => insert(' + C')}>+C</button>}
        </div>
      )}
      <div className="min-h-[1.75rem] text-sm" aria-live="polite">
        {prev.tex && <span className="text-muted">Interpreto: <TeX tex={prev.tex} /></span>}
        {prev.error && <span className="text-warn">{prev.error}</span>}
      </div>
    </div>
  )
}

function ExpressionInput({ ex, draft, onChange, disabled, feedback }: P<'expression'>) {
  return <ExprField value={draft.text} onChange={(t) => onChange({ kind: 'expression', text: t })} v={ex.v} integral={ex.mode === 'upToConstant'} disabled={disabled} prefix={ex.prefix} ring={verdictRing(feedback?.verdict)} />
}

function FillInput({ ex, draft, onChange, disabled, feedback, reveal }: P<'fill'>) {
  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-3 text-lg leading-loose">
      {ex.parts.map((p, i) => {
        if (typeof p === 'string') return <Md key={i} text={p} />
        const st = feedback?.parts?.find((x) => x.label === p.id)?.verdict
        return (
          <input key={i} aria-label={`Casillero ${p.id}`} className={'input inline-block !w-auto !py-1.5 text-center ' + verdictRing(st)} style={{ width: `${Math.max(3, p.size ?? 4) + 2}ch` }} autoComplete="off" spellCheck={false} disabled={disabled}
            value={reveal ? p.answer : draft.values[p.id] ?? ''} onChange={(e) => onChange({ kind: 'fill', values: { ...draft.values, [p.id]: e.target.value } })} />
        )
      })}
    </div>
  )
}

function OrderInput({ ex, draft, onChange, disabled, reveal }: P<'order'>) {
  const [dragIdx, setDragIdx] = useState<number | null>(null)
  const order = reveal ? ex.items.map((_, i) => i) : draft.order
  const move = (from: number, to: number) => {
    if (to < 0 || to >= order.length) return
    const o = order.slice()
    const [x] = o.splice(from, 1)
    o.splice(to, 0, x)
    onChange({ kind: 'order', order: o })
  }
  return (
    <ol className="grid gap-2" aria-label="Pasos para ordenar">
      {order.map((item, pos) => (
        <li key={item} draggable={!disabled} onDragStart={() => setDragIdx(pos)} onDragOver={(e) => e.preventDefault()} onDrop={() => { if (dragIdx !== null) move(dragIdx, pos); setDragIdx(null) }}
          className={'flex items-center gap-3 rounded-xl border border-line bg-surface2/50 px-3 py-2.5 ' + (dragIdx === pos ? 'opacity-50' : '')}>
          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-brand/15 font-mono text-sm font-bold text-brand">{pos + 1}</span>
          <span className="min-w-0 flex-1 cursor-grab"><Md text={ex.items[item]} /></span>
          {!disabled && (
            <span className="flex shrink-0 flex-col gap-0.5">
              <button type="button" className="btn-ghost btn-sm !px-2 !py-0.5" onClick={() => move(pos, pos - 1)} aria-label="Subir paso" disabled={pos === 0}>▲</button>
              <button type="button" className="btn-ghost btn-sm !px-2 !py-0.5" onClick={() => move(pos, pos + 1)} aria-label="Bajar paso" disabled={pos === order.length - 1}>▼</button>
            </span>
          )}
        </li>
      ))}
    </ol>
  )
}

function MatchInput({ ex, draft, onChange, disabled, reveal, seed = 1 }: P<'match'>) {
  const rightOrder = useMemo(() => makeRand(seed * 13 + 5).shuffle(ex.pairs.map((_, i) => i)), [ex.pairs, seed])
  const [active, setActive] = useState<number | null>(null)
  const map = reveal ? ex.pairs.map((_, i) => i) : draft.map
  const assign = (left: number, right: number) => {
    const m = map.map((v) => (v === right ? -1 : v))
    m[left] = right
    onChange({ kind: 'match', map: m })
    setActive(null)
  }
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div className="grid gap-2">
        <div className="label">Elegí un elemento…</div>
        {ex.pairs.map((p, i) => (
          <button key={i} type="button" disabled={disabled} onClick={() => setActive(i)} aria-pressed={active === i}
            className={'flex items-center justify-between gap-2 rounded-xl border px-3 py-2.5 text-left ' + (active === i ? 'border-brand bg-brand/10' : 'border-line bg-surface2/50')}>
            <Md text={p.left} />
            <span className="chip">{map[i] >= 0 ? <Md text={ex.pairs[map[i]].right} /> : '—'}</span>
          </button>
        ))}
      </div>
      <div className="grid content-start gap-2">
        <div className="label">…y después su pareja</div>
        {rightOrder.map((ri) => (
          <button key={ri} type="button" disabled={disabled || active === null} onClick={() => active !== null && assign(active, ri)}
            className={'rounded-xl border px-3 py-2.5 text-left transition ' + (map.includes(ri) ? 'border-line/50 bg-surface2/30 text-muted' : 'border-line bg-surface2/60 hover:border-brand/60')}>
            <Md text={ex.pairs[ri].right} />
          </button>
        ))}
      </div>
    </div>
  )
}

function MatrixInput({ ex, draft, onChange, disabled, reveal }: P<'matrix'>) {
  const cells = reveal ? ex.answer : draft.cells
  return (
    <div className="flex items-center gap-3">
      {ex.prefix && <span className="font-mono text-muted">{ex.prefix}</span>}
      <div className="relative inline-grid gap-1.5 px-3 py-1" style={{ gridTemplateColumns: `repeat(${ex.cols}, minmax(3.2rem, 4.5rem))` }}>
        <span className="pointer-events-none absolute inset-y-0 left-0 w-2 rounded-l-lg border-y-2 border-l-2 border-ink/70" />
        <span className="pointer-events-none absolute inset-y-0 right-0 w-2 rounded-r-lg border-y-2 border-r-2 border-ink/70" />
        {cells.map((row, i) => row.map((c, j) => (
          <input key={`${i}-${j}`} aria-label={`Elemento fila ${i + 1}, columna ${j + 1}`} className="input !px-1 !py-1.5 text-center" autoComplete="off" disabled={disabled} value={c}
            onChange={(e) => { const nc = draft.cells.map((r) => r.slice()); nc[i][j] = e.target.value; onChange({ kind: 'matrix', cells: nc }) }} />
        )))}
      </div>
    </div>
  )
}

function ErrorStepInput({ ex, draft, onChange, disabled, reveal }: P<'errorStep'>) {
  const step = reveal ? ex.wrongIndex : draft.step
  return (
    <div className="grid gap-3">
      <div className="label">1. Tocá el paso con el primer error</div>
      <ol className="grid gap-2">
        {ex.steps.map((s, i) => (
          <li key={i}>
            <button type="button" disabled={disabled} onClick={() => onChange({ ...draft, step: i })} aria-pressed={step === i}
              className={'flex w-full items-start gap-3 rounded-xl border px-3 py-2.5 text-left ' + (step === i ? (reveal ? 'border-ok bg-ok/10' : 'border-bad bg-bad/10') : 'border-line bg-surface2/50 hover:border-brand/50')}>
              <span className="font-mono text-sm text-muted">Paso {i + 1}</span><Md text={s} />
            </button>
          </li>
        ))}
      </ol>
      {step >= 0 && (
        <>
          <div className="label">2. ¿Qué está mal?</div>
          <div role="radiogroup" className="grid gap-2">
            {ex.ruleOptions.map((o, i) => (
              <Option key={i} selected={(reveal ? ex.ruleOptions.findIndex((x) => x.correct) : draft.rule) === i} disabled={disabled} onClick={() => onChange({ ...draft, rule: i })}><Md text={o.text} /></Option>
            ))}
          </div>
        </>
      )}
      {ex.fix && step >= 0 && (
        <>
          <div className="label">3. (Opcional) Escribí el resultado correcto</div>
          <ExprField value={reveal ? ex.fix.answer : draft.fix ?? ''} onChange={(t) => onChange({ ...draft, fix: t })} v={ex.fix.v} integral={ex.fix.mode === 'upToConstant'} disabled={disabled} />
        </>
      )}
    </div>
  )
}

function MultiInput({ ex, draft, onChange, disabled, feedback, reveal, seed = 1 }: P<'multi'>) {
  return (
    <div className="grid gap-4">
      {ex.parts.map((p, i) => {
        const pf = feedback?.parts?.[i]
        return (
          <div key={i} className={'rounded-xl border p-4 ' + (pf ? (pf.verdict === 'correct' ? 'border-ok/60' : 'border-bad/60') : 'border-line')}>
            <div className="mb-2 flex items-baseline gap-2"><span className="font-display text-lg font-bold text-brand">{p.label})</span><Md text={p.prompt} /><span className="ml-auto chip">{p.points} pt</span></div>
            <AnswerInput ex={p} draft={draft.parts[i]} onChange={(d) => { const parts = draft.parts.slice(); parts[i] = d; onChange({ kind: 'multi', parts }) }} disabled={disabled} reveal={reveal} seed={seed + i} />
            {pf && <div className={'mt-2 text-sm ' + (pf.verdict === 'correct' ? 'text-ok' : 'text-bad')}><Md text={pf.message} /></div>}
          </div>
        )
      })}
    </div>
  )
}

function SliderInput({ ex, draft, onChange, disabled }: P<'slider'>) {
  const f = useMemo(() => { try { return withParams(ex.base, draft.values) } catch { return () => NaN } }, [ex.base, draft.values])
  return (
    <div className="grid gap-3">
      <Plot fns={[{ f, label: 'tu función' }]} x={[-8, 8]} y={[-8, 8]} equal />
      <div className="grid gap-3 sm:grid-cols-2">
        {ex.params.map((p, i) => (
          <label key={p.name} className="grid gap-1">
            <span className="flex justify-between text-sm"><span className="font-mono font-bold">{p.name}</span><span className="font-mono">{draft.values[i]}</span></span>
            <input type="range" min={p.min} max={p.max} step={p.step} value={draft.values[i]} disabled={disabled} onChange={(e) => { const v = draft.values.slice(); v[i] = Number(e.target.value); onChange({ kind: 'slider', values: v }) }} className="accent-[rgb(var(--brand))]" />
          </label>
        ))}
      </div>
      <div className="text-sm text-muted">Objetivo: <Md text={ex.target} /></div>
    </div>
  )
}
