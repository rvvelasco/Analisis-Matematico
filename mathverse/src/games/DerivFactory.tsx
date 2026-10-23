/** Juego 6 · Fábrica de derivadas: reconocer la regla y fabricar la derivada. */
import { useMemo, useState } from 'react'
import { compile, diff, parse, simplify, toTeX } from '../math/expr'
import { compareFunctions } from '../math/equivalence'
import { autoDomain } from '../content/templates/helpers'
import type { Exercise } from '../engine/types'
import { recordAttempt, recordGame } from '../progress/store'
import { ExprField } from '../exercise/inputs'
import { TeX } from '../ui/Md'
import { GameOver, GameShell, ScoreBar } from './common'
import { makeRand, newSeedSafe } from './util'
import type { Rand } from '../math/numeric'

type Rule = 'potencia' | 'suma' | 'producto' | 'cociente' | 'cadena' | 'constante'
const RULES: { id: Rule; label: string; tex: string }[] = [
  { id: 'potencia', label: 'Potencia', tex: "(x^n)' = n x^{n-1}" },
  { id: 'suma', label: 'Suma (término a término)', tex: "(f + g)' = f' + g'" },
  { id: 'constante', label: 'Constante por función', tex: "(k f)' = k f'" },
  { id: 'producto', label: 'Producto', tex: "(uv)' = u'v + uv'" },
  { id: 'cociente', label: 'Cociente', tex: "(u/v)' = \\frac{u'v - uv'}{v^2}" },
  { id: 'cadena', label: 'Cadena', tex: "[g(u)]' = g'(u)\\,u'" },
]
const ATOMS = ['x^2', 'x^3', 'e^x', 'ln(x)', 'sin(x)', 'cos(x)', 'sqrt(x)']
const CONCEPT: Record<Rule, string> = { potencia: 'd3.potencia', suma: 'd3.potencia', constante: 'd3.potencia', producto: 'd5.producto', cociente: 'd5.cociente', cadena: 'd6.cadena' }

function piece(r: Rand, rule: Rule): string {
  const a = r.pick([2, 3, 4, 5]), b = r.int(1, 6), n = r.pick([3, 4, 5])
  const [p, q] = r.shuffle(ATOMS).slice(0, 2)
  switch (rule) {
    case 'potencia': return `x^${r.pick([3, 4, 5, 6, 7])}`
    case 'suma': return `${p} + ${a}*${q}`
    case 'constante': return `${a}*${p}`
    case 'producto': return `${p}*${q}`
    case 'cociente': return `(${p})/(x^2 + ${b})`
    case 'cadena': return r.pick([`(${a}*x + ${b})^${n}`, `sin(${a}*x^2)`, `e^(${a}*x + ${b})`, `ln(x^2 + ${b})`, `sqrt(${a}*x + ${b})`, `cos(x^${n})`])
  }
}

const ROUNDS = 6

export default function DerivFactory() {
  const [seed, setSeed] = useState(newSeedSafe)
  const [i, setI] = useState(0)
  const [score, setScore] = useState(0)
  const [ruleAns, setRuleAns] = useState<Rule | null>(null)
  const [text, setText] = useState('')
  const [res, setRes] = useState<null | { ok: boolean; msg: string }>(null)
  const round = useMemo(() => {
    const r = makeRand(seed + i * 389)
    const rule = r.pick(RULES).id
    const f = piece(r, rule)
    const d = simplify(diff(parse(f)))
    return { rule, f, d, tex: toTeX(parse(f)), dtex: toTeX(d) }
  }, [seed, i])
  if (i >= ROUNDS)
    return <GameShell id="fabrica"><GameOver title={`${score} puntos`} lines={['Cada derivada bien fabricada vale 10 y reconocer la regla al primer intento suma 5 más.']} onAgain={() => { setSeed(newSeedSafe()); setI(0); setScore(0) }} /></GameShell>

  const check = () => {
    let user: (x: number) => number
    try { user = compile(parse(text), 'x') } catch { setRes({ ok: false, msg: 'No pude leer la expresión. Revisá paréntesis y operaciones.' }); return }
    const dom = autoDomain(round.f)
    const c = compareFunctions(user, compile(round.d, 'x'), { domain: dom })
    const ok = c.status === 'equal'
    const fake: Exercise = { id: `fab:${seed}:${i}`, templateId: 'fabrica', seed, area: 'derivadas', unit: CONCEPT[round.rule].split('.')[0], subtopic: 'Fábrica de derivadas', concepts: [CONCEPT[round.rule]], level: round.rule === 'cadena' || round.rule === 'cociente' ? 3 : 2, levelWhy: '', prompt: '', hints: [], solution: [], explanation: '', commonErrors: [], prereqs: [], estMinutes: 1, kind: 'expression', answer: '0', v: 'x', mode: 'exact', domain: dom }
    recordAttempt(fake, ok ? 1 : 0, { hintsUsed: 0, solutionShown: false, timeMs: 0, source: 'juego' })
    if (ok) setScore((s) => s + 10 + (ruleAns === round.rule ? 5 : 0))
    setRes(ok ? { ok, msg: '¡Derivada correcta!' } : { ok, msg: c.status === 'unknown' ? 'No puedo decidir si es equivalente (casi no se puede evaluar).' : `No coincide. En x = ${c.at?.toFixed(2)} tu expresión vale ${c.got?.toFixed(3)} y la derivada vale ${c.expected?.toFixed(3)}.` })
  }
  const next = () => { setI(i + 1); setRuleAns(null); setText(''); setRes(null) }

  return (
    <GameShell id="fabrica">
      <ScoreBar items={[{ label: 'Pieza', value: `${i + 1}/${ROUNDS}` }, { label: 'Puntos', value: score, tone: 'brand' }]} />
      <div className="card-pad grid gap-5">
        <div className="text-center text-2xl"><TeX tex={`f(x) = ${round.tex}`} /></div>
        <div className="grid gap-2">
          <div className="label">Paso 1 · ¿Qué regla se aplica primero (la operación "más de afuera")?</div>
          <div className="grid gap-2 sm:grid-cols-3">
            {RULES.map((r) => (
              <button key={r.id} type="button" disabled={ruleAns !== null} onClick={() => setRuleAns(r.id)}
                className={'rounded-xl border p-3 text-left text-sm transition ' + (ruleAns === null ? 'border-line bg-surface2/50 hover:border-brand/60' : r.id === round.rule ? 'border-ok bg-ok/10' : ruleAns === r.id ? 'border-bad bg-bad/10' : 'border-line/50 opacity-60')}>
                <div className="font-semibold">{r.label}</div><div className="mt-1 text-muted"><TeX tex={r.tex} /></div>
              </button>
            ))}
          </div>
          {ruleAns && <p className={'text-sm ' + (ruleAns === round.rule ? 'text-ok' : 'text-bad')} role="status">{ruleAns === round.rule ? '¡Bien! +5 si además la derivada sale bien.' : `La regla principal es: ${RULES.find((r) => r.id === round.rule)!.label}.`}</p>}
        </div>
        {ruleAns && (
          <div className="grid gap-2 anim-up">
            <div className="label">Paso 2 · Fabricá la derivada</div>
            <ExprField value={text} onChange={setText} disabled={!!res?.ok} prefix="f'(x) =" />
            {!res?.ok && <div className="flex gap-2"><button type="button" className="btn-primary" disabled={!text.trim()} onClick={check}>Comprobar</button>{res && <button type="button" className="btn-ghost" onClick={() => setRes({ ok: false, msg: 'Solución mostrada.' })}>Ver solución</button>}</div>}
            {res && <div className={'rounded-xl border p-3 text-sm ' + (res.ok ? 'border-ok/50 bg-ok/10' : 'border-bad/50 bg-bad/10')} role="status">{res.msg}{(res.ok || res.msg === 'Solución mostrada.') && <div className="mt-2">Derivada: <TeX tex={`f'(x) = ${round.dtex}`} /></div>}</div>}
            {res && (res.ok || res.msg === 'Solución mostrada.') && <div><button type="button" className="btn-primary" onClick={() => { if (i + 1 >= ROUNDS) recordGame('fabrica', { score, xp: Math.round(score / 4) }); next() }}>{i + 1 < ROUNDS ? 'Siguiente pieza →' : 'Ver resultado'}</button></div>}
          </div>
        )}
      </div>
    </GameShell>
  )
}
