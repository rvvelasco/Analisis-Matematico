/** Corrección y diagnóstico de respuestas para cada tipo de ejercicio. */
import { compile, diff, parse, ParseError, stripIntegralDecorations, toTeX, type Node } from '../math/expr'
import { compareFunctions, numbersClose, parseNumber } from '../math/equivalence'
import { parseFrac, feq } from '../math/fraction'
import { fmt, numDeriv, simpson } from '../math/numeric'
import { SLIDER_CHECKS } from './sliderChecks'
import type { Answer, Exercise, ExerciseBody, Feedback, Verdict } from './types'

const ok = (message = '¡Correcto!'): Feedback => ({ verdict: 'correct', message, score: 1 })
const no = (message: string, errorTag?: string): Feedback => ({ verdict: 'incorrect', message, score: 0, errorTag })

function fracText(k: number): string {
  for (let d = 1; d <= 24; d++) {
    const n = Math.round(k * d)
    if (Math.abs(n / d - k) < 1e-6) return d === 1 ? String(n) : `${n}/${d}`
  }
  return fmt(k, 3)
}

/** Diagnóstico genérico de expresiones (derivadas e integrales). */
function diagnoseExpression(user: (x: number) => number, ex: Extract<ExerciseBody, { kind: 'expression' }>): { msg: string; tag?: string } | null {
  const v = ex.v
  const domain = ex.domain
  const expected = compile(parse(ex.answer, { vars: [v] }), v)
  // signo cambiado
  const neg = compareFunctions(user, (x) => -expected(x), { mode: ex.mode, domain })
  if (neg.status === 'equal') return { msg: 'Tu resultado tiene el **signo cambiado**. Revisá los signos: exponentes negativos, la derivada del coseno (−sen) y el orden en la regla del cociente.', tag: 'signo' }
  if (ex.mode === 'exact') {
    // factor constante distinto
    const xs = [0.13, 0.37, 0.61, 0.89, 1.17].map((t) => domain[0] + (domain[1] - domain[0]) * t)
    const ks = xs.map((x) => user(x) / expected(x)).filter((k) => isFinite(k))
    if (ks.length >= 4 && ks.every((k) => Math.abs(k - ks[0]) < 1e-6 * Math.max(1, Math.abs(ks[0]))) && Math.abs(ks[0] - 1) > 1e-6 && Math.abs(ks[0]) > 1e-9) {
      return { msg: `Vas bien encaminado: tu resultado está **multiplicado por ${fracText(ks[0])}** respecto del correcto. Suele pasar por olvidarse de multiplicar por la derivada de lo de adentro (regla de la cadena) o por el exponente que baja.`, tag: 'factor' }
    }
    if (compareFunctions(user, expected, { mode: 'upToConstant', domain }).status === 'equal') {
      return { msg: 'Tu resultado difiere del correcto en un número suelto. Recordá que la derivada de una constante es 0.', tag: 'constante' }
    }
  } else {
    // integrales: comparar derivadas
    const xs = [0.13, 0.37, 0.61, 0.89].map((t) => domain[0] + (domain[1] - domain[0]) * t)
    const ks = xs.map((x) => numDeriv(user, x) / numDeriv(expected, x)).filter((k) => isFinite(k))
    if (ks.length >= 3 && ks.every((k) => Math.abs(k - ks[0]) < 1e-4 * Math.max(1, Math.abs(ks[0]))) && Math.abs(ks[0] - 1) > 1e-4 && Math.abs(ks[0]) > 1e-6) {
      return { msg: `Casi: tu resultado está **multiplicado por ${fracText(ks[0])}** respecto del correcto. Lo típico: olvidarse de dividir por el exponente nuevo, o no compensar el número que aparece en $du$.`, tag: 'factor' }
    }
  }
  if (ex.source) {
    const f = parse(ex.source.f, { vars: [v] })
    const fF = compile(f, v)
    if (compareFunctions(user, fF, { mode: ex.mode, domain }).status === 'equal')
      return { msg: ex.source.op === 'derivative' ? 'Escribiste la **misma función** del enunciado: falta derivarla.' : 'Escribiste la **misma función** que había que integrar. Integrar es encontrar una función cuya derivada sea esa.', tag: 'copia' }
    const fp = compile(diff(f, v), v)
    if (ex.source.op === 'integral' && compareFunctions(user, fp, { mode: 'exact', domain }).status === 'equal')
      return { msg: '**Derivaste en vez de integrar.** Para integrar una potencia se *suma* 1 al exponente y se *divide* por el exponente nuevo.', tag: 'derivo-en-vez-de-integrar' }
    if (ex.source.op === 'derivative') {
      // ¿integró en vez de derivar?
      const xs = [0.2, 0.5, 0.8].map((t) => domain[0] + (domain[1] - domain[0]) * t)
      const integratedLike = xs.every((x) => Math.abs(numDeriv(user, x) - fF(x)) < 1e-4 * Math.max(1, Math.abs(fF(x))))
      if (integratedLike) return { msg: '**Integraste en vez de derivar.** Para derivar una potencia, el exponente *baja* adelante y se le *resta* 1.', tag: 'integro-en-vez-de-derivar' }
    }
  }
  return null
}

function checkExpressionBody(ex: Extract<ExerciseBody, { kind: 'expression' }>, text: string): Feedback {
  let src = text
  let hadC = false
  if (ex.mode === 'upToConstant') {
    const s = stripIntegralDecorations(text)
    src = s.text
    hadC = s.hadC
  }
  let node: Node
  try {
    node = parse(src, { vars: [ex.v], ignoreConstants: ex.mode === 'upToConstant' ? ['c', 'k'] : [] })
  } catch (e) {
    return { verdict: 'invalid', message: e instanceof ParseError ? e.message : 'No pude leer tu respuesta.', score: 0 }
  }
  const user = compile(node, ex.v)
  const expected = compile(parse(ex.answer, { vars: [ex.v] }), ex.v)
  const r = compareFunctions(user, expected, { mode: ex.mode, domain: ex.domain })
  if (r.status === 'equal') {
    if (ex.mode === 'upToConstant' && !hadC) return { verdict: 'correct', message: '¡Correcto! Acordate de escribir **+ C**: en una integral indefinida siempre va (en el examen te lo descuentan).', score: 1, errorTag: 'sin-constante' }
    return ok()
  }
  if (r.status === 'unknown') {
    return { verdict: 'unknown', message: 'No puedo asegurar si tu expresión es equivalente: casi no se puede evaluar en el dominio del ejercicio (¿una raíz de un negativo o una división por cero?). Revisala o usá "comprobar en un punto" para compararla vos.', score: 0 }
  }
  for (const w of ex.wrong ?? []) {
    try {
      const wf = compile(parse(w.expr, { vars: [ex.v] }), ex.v)
      if (compareFunctions(user, wf, { mode: ex.mode, domain: ex.domain }).status === 'equal') return no(w.why, w.errorTag)
    } catch { /* ignorar */ }
  }
  const d = diagnoseExpression(user, ex)
  if (d) return no(d.msg, d.tag)
  const x0 = r.at ?? ex.domain[0]
  if (ex.mode === 'upToConstant')
    return no(`No coincide. **Comprobalo derivando tu resultado**: si estuviera bien, su derivada daría la función a integrar. En ${ex.v} = ${fmt(x0, 3)}, la derivada de tu respuesta vale ${fmt(numDeriv(user, x0), 3)}.`)
  return no(`No coincide. En ${ex.v} = ${fmt(x0, 3)} tu expresión vale ${fmt(r.got ?? NaN, 4)} y debería valer ${fmt(r.expected ?? NaN, 4)}.`)
}

/** Valor exacto legible: fracción, múltiplo de π o raíz cuadrada si se reconoce. */
function exactText(v: number): string {
  for (let d = 1; d <= 60; d++) { const n = Math.round(v * d); if (Math.abs(n / d - v) < 1e-9) return d === 1 ? String(n) : `${n}/${d}` }
  for (let d = 1; d <= 12; d++) { const n = Math.round((v / Math.PI) * d); if (n && Math.abs((n * Math.PI) / d - v) < 1e-9) return `${n === 1 ? '' : n === -1 ? '-' : n}π${d === 1 ? '' : '/' + d}` }
  for (let d = 1; d <= 12; d++) for (let r = 2; r <= 200; r++) {
    if (Number.isInteger(Math.sqrt(r))) continue
    const n = Math.round((v * d) / Math.sqrt(r))
    if (n && Math.abs((n * Math.sqrt(r)) / d - v) < 1e-9) return `${n === 1 ? '' : n === -1 ? '-' : n}√${r}${d === 1 ? '' : '/' + d}`
  }
  return fmt(v, 6)
}

function checkNumber(text: string, answer: number, tol: { abs?: number; rel?: number } | undefined, wrong?: { value: number; why: string; errorTag?: string }[]): Feedback {
  const v = parseNumber(text)
  if (v === null) return { verdict: 'invalid', message: 'Escribí un número (podés usar fracciones como 3/4, raíces como sqrt(2) o π).', score: 0 }
  const t = tol ?? { rel: 1e-6, abs: 1e-9 }
  if (numbersClose(v, answer, t)) return ok()
  // redondeos: si escribió un decimal con 2 o más cifras decimales, se acepta si es el valor exacto bien redondeado
  const dec = /^\s*[-−]?\d+[.,](\d+)\s*$/.exec(text)
  if (dec && dec[1].length >= 2 && !Number.isInteger(answer)) {
    const half = 0.5 * Math.pow(10, -dec[1].length)
    if (Math.abs(v - answer) <= half * 1.0001 + 1e-12) return ok(`¡Correcto! Es el valor redondeado; el exacto es ${exactText(answer)}.`)
  }
  for (const w of wrong ?? []) if (numbersClose(v, w.value, { rel: 1e-6, abs: 1e-9 })) return no(w.why, w.errorTag)
  if (numbersClose(v, -answer, t) && answer !== 0) return no('Revisá el **signo**: el valor absoluto es correcto, pero el signo no.', 'signo')
  return no('No es correcto. Revisá el procedimiento o pedí una pista.')
}

export function validate(ex: Exercise | (ExerciseBody & { label?: string }), ans: Answer): Feedback {
  switch (ex.kind) {
    case 'mc': {
      if (ans.kind !== 'mc' || ans.index < 0) return { verdict: 'invalid', message: 'Elegí una opción.', score: 0 }
      const o = ex.options[ans.index]
      return o.correct ? ok(o.why ? `¡Correcto! ${o.why}` : '¡Correcto!') : no(o.why ?? 'Esa no es. Pensá qué dice la definición.', o.errorTag)
    }
    case 'tf': {
      if (ans.kind !== 'tf' || ans.value === null || ans.reason < 0) return { verdict: 'invalid', message: 'Elegí verdadero o falso **y** una justificación.', score: 0 }
      const valueOk = ans.value === ex.answer
      const reason = ex.reasons[ans.reason]
      if (valueOk && reason.correct) return ok(reason.why ? `¡Correcto! ${reason.why}` : '¡Correcto, y bien justificado!')
      if (valueOk) return { verdict: 'partial', message: `Acertaste el valor de verdad, pero la justificación no es la adecuada. ${reason.why ?? ''}`, score: 0.5, errorTag: reason.errorTag }
      return no(reason.why && !reason.correct ? reason.why : `La afirmación es ${ex.answer ? 'verdadera' : 'falsa'}. Volvé a leerla con cuidado.`, reason.errorTag)
    }
    case 'numeric':
      if (ans.kind !== 'numeric') return { verdict: 'invalid', message: 'Escribí un número.', score: 0 }
      return checkNumber(ans.text, ex.answer, ex.tol, ex.wrong)
    case 'expression':
      if (ans.kind !== 'expression' || !ans.text.trim()) return { verdict: 'invalid', message: 'Escribí una expresión.', score: 0 }
      return checkExpressionBody(ex, ans.text)
    case 'fill': {
      if (ans.kind !== 'fill') return { verdict: 'invalid', message: 'Completá los casilleros.', score: 0 }
      const blanks = ex.parts.filter((p): p is Exclude<typeof p, string> => typeof p !== 'string')
      const parts: { label: string; verdict: Verdict; message: string }[] = []
      const anyFilled = blanks.some((b) => (ans.values[b.id] ?? '').trim() !== '')
      for (const b of blanks) {
        const val = ans.values[b.id] ?? ''
        if (!val.trim()) { parts.push({ label: b.id, verdict: anyFilled ? 'incorrect' : 'invalid', message: 'Casillero vacío.' }); continue }
        if (b.mode === 'number') {
          const f = checkNumber(val, parseNumber(b.answer) ?? NaN, undefined)
          parts.push({ label: b.id, verdict: f.verdict, message: f.message })
        } else {
          const f = checkExpressionBody({ kind: 'expression', answer: b.answer, v: b.v ?? 'x', mode: 'exact', domain: b.domain ?? [0.3, 3] }, val)
          parts.push({ label: b.id, verdict: f.verdict, message: f.message })
        }
      }
      const good = parts.filter((p) => p.verdict === 'correct').length
      if (good === blanks.length) return { verdict: 'correct', message: '¡Todos los casilleros están bien!', score: 1, parts }
      if (parts.some((p) => p.verdict === 'invalid')) return { verdict: 'invalid', message: 'Hay casilleros vacíos o que no puedo leer.', score: 0, parts }
      return { verdict: good ? 'partial' : 'incorrect', message: `Tenés ${good} de ${blanks.length} casilleros bien. Revisá los marcados.`, score: good / blanks.length, parts }
    }
    case 'order': {
      if (ans.kind !== 'order') return { verdict: 'invalid', message: 'Ordená los pasos.', score: 0 }
      const firstBad = ans.order.findIndex((v, i) => v !== i)
      if (firstBad === -1) return ok('¡Ordenaste bien el procedimiento!')
      const correctAt = ans.order.filter((v, i) => v === i).length
      return { verdict: correctAt ? 'partial' : 'incorrect', message: `El paso ${firstBad + 1} no va ahí. Preguntate: ¿qué necesito tener resuelto antes de poder hacer este paso?`, score: correctAt / ex.items.length * 0.5 }
    }
    case 'match': {
      if (ans.kind !== 'match') return { verdict: 'invalid', message: 'Relacioná todos los elementos.', score: 0 }
      if (ans.map.some((m) => m < 0)) return { verdict: 'invalid', message: 'Te falta relacionar algún elemento.', score: 0 }
      const good = ans.map.filter((m, i) => m === i).length
      if (good === ex.pairs.length) return ok('¡Todas las relaciones son correctas!')
      return { verdict: good ? 'partial' : 'incorrect', message: `${good} de ${ex.pairs.length} relaciones son correctas.`, score: good / ex.pairs.length * 0.6 }
    }
    case 'matrix': {
      if (ans.kind !== 'matrix') return { verdict: 'invalid', message: 'Completá la matriz.', score: 0 }
      let bad = 0, empty = 0
      const wrongCells: string[] = []
      for (let i = 0; i < ex.rows; i++)
        for (let j = 0; j < ex.cols; j++) {
          const t = ans.cells[i]?.[j] ?? ''
          if (!t.trim()) { empty++; continue }
          const f = parseFrac(t)
          const target = parseFrac(ex.answer[i][j])!
          if (!f || !feq(f, target)) { bad++; wrongCells.push(`(${i + 1},${j + 1})`) }
        }
      if (empty) return { verdict: 'invalid', message: `Faltan completar ${empty} casillero(s). Podés usar fracciones como -3/4.`, score: 0 }
      if (!bad) return ok('¡La matriz es correcta!')
      return { verdict: bad < ex.rows * ex.cols ? 'partial' : 'incorrect', message: `Hay ${bad} elemento(s) mal: ${wrongCells.join(', ')}. Recordá: el elemento (i, j) sale de la fila i de la primera matriz y la columna j de la segunda.`, score: (1 - bad / (ex.rows * ex.cols)) * 0.6 }
    }
    case 'errorStep': {
      if (ans.kind !== 'errorStep') return { verdict: 'invalid', message: 'Marcá el paso con el error.', score: 0 }
      if (ans.step !== ex.wrongIndex) return no(ans.step < ex.wrongIndex ? 'Ese paso está bien. El error aparece **después**: seguí revisando.' : 'El error aparece **antes**: los pasos siguientes arrastran un error previo.', 'no-detecta-error')
      if (ans.rule < 0) return { verdict: 'partial', message: '¡Bien, ese es el paso incorrecto! Ahora elegí qué regla se aplicó mal.', score: 0.4 }
      const rule = ex.ruleOptions[ans.rule]
      if (!rule.correct) return { verdict: 'partial', message: `Encontraste el paso, pero el problema no es ese. ${rule.why ?? ''}`, score: 0.4, errorTag: rule.errorTag }
      if (ex.fix && ans.fix !== undefined) {
        const f = checkExpressionBody({ kind: 'expression', answer: ex.fix.answer, v: ex.fix.v, mode: ex.fix.mode, domain: ex.fix.domain }, ans.fix)
        if (f.verdict !== 'correct') return { verdict: 'partial', message: `Encontraste el error y la regla. La corrección todavía no está bien: ${f.message}`, score: 0.7 }
      }
      return ok(rule.why ? `¡Exacto! ${rule.why}` : '¡Exacto, ese es el error!')
    }
    case 'multi': {
      if (ans.kind !== 'multi') return { verdict: 'invalid', message: 'Respondé las partes.', score: 0 }
      const total = ex.parts.reduce((s, p) => s + p.points, 0)
      let got = 0
      const parts = ex.parts.map((p, i) => {
        const f = validate(p, ans.parts[i] ?? ({ kind: p.kind } as Answer))
        got += f.score * p.points
        return { label: p.label, verdict: f.verdict, message: f.message }
      })
      const score = total ? got / total : 0
      const verdict: Verdict = score >= 0.999 ? 'correct' : score > 0 ? 'partial' : 'incorrect'
      return { verdict, message: verdict === 'correct' ? '¡Todas las partes están bien!' : `Puntaje: ${Math.round(score * 100)}%. Revisá las partes marcadas.`, score, parts }
    }
    case 'slider': {
      if (ans.kind !== 'slider') return { verdict: 'invalid', message: 'Mové los controles.', score: 0 }
      const chk = SLIDER_CHECKS[ex.checkId]
      if (!chk) return { verdict: 'unknown', message: 'No hay un criterio para este desafío.', score: 0 }
      const r = chk(ans.values, ex.checkArgs)
      return r.ok ? ok(r.msg) : no(r.msg)
    }
  }
}

/** Texto de la respuesta correcta (para mostrar tras ver la solución). */
export function correctAnswerText(ex: Exercise | ExerciseBody): string {
  switch (ex.kind) {
    case 'mc': return ex.options.find((o) => o.correct)?.text ?? ''
    case 'tf': {
      const r = ex.reasons.find((o) => o.correct)?.text ?? ''
      const w = ex.answer ? 'Verdadero' : 'Falso'
      return r.startsWith(w) ? r : `${w}: ${r}`
    }
    case 'numeric': if (!ex.answerText) return exactText(ex.answer); return ex.answerText
    case 'expression': return `$${toTeXSafe(ex.answer, ex.v)}${ex.mode === 'upToConstant' ? ' + C' : ''}$`
    case 'fill': return ex.parts.map((p) => (typeof p === 'string' ? p : ` **${p.answer}** `)).join(' ')
    case 'order': return ex.items.map((t, i) => `${i + 1}. ${t}`).join('  ')
    case 'match': return ex.pairs.map((p) => `${p.left} → ${p.right}`).join(' · ')
    case 'matrix': return ex.answer.map((r) => r.join('  ')).join(' ; ')
    case 'errorStep': return `Paso ${ex.wrongIndex + 1}: ${ex.ruleOptions.find((r) => r.correct)?.text ?? ''}`
    case 'multi': return ex.parts.map((p) => `${p.label}) ${correctAnswerText(p)}`).join('  ')
    case 'slider': return ex.target
  }
}

function toTeXSafe(s: string, v: string): string {
  try { return toTeX(parse(s, { vars: [v] })) } catch { return s }
}

/** Utilidad para plantillas: integral definida numérica de una expresión en texto. */
export function definiteIntegral(expr: string, a: number, b: number, v = 'x'): number {
  return simpson(compile(parse(expr, { vars: [v] }), v), a, b, 4000)
}

