/** Utilidades para escribir plantillas de ejercicios. */
import { compile, parse, simplify, toTeX } from '../../math/expr'
import { gcd, type Rand } from '../../math/numeric'
import type { ExerciseBody, ExerciseDraft, Level, MCOption, PlotSpec, SolutionStep, Template, AreaId } from '../../engine/types'

export interface Meta {
  subtopic: string
  concepts: string[]
  level: Level
  levelWhy: string
  prompt: string
  hints: string[]
  solution: SolutionStep[]
  explanation: string
  commonErrors?: string[]
  prereqs?: string[]
  estMinutes?: number
  plot?: PlotSpec
  noCalc?: boolean
}

export function make(meta: Meta, body: ExerciseBody): ExerciseDraft {
  return {
    ...body,
    subtopic: meta.subtopic,
    concepts: meta.concepts,
    level: meta.level,
    levelWhy: meta.levelWhy,
    prompt: meta.prompt,
    hints: meta.hints,
    solution: meta.solution,
    explanation: meta.explanation,
    commonErrors: meta.commonErrors ?? [],
    prereqs: meta.prereqs ?? [],
    estMinutes: meta.estMinutes ?? Math.max(1, meta.level),
    plot: meta.plot,
    noCalc: meta.noCalc,
  } as ExerciseDraft
}

/** Mezcla opciones y elimina repetidas (por texto), conservando la correcta. */
export function mc(r: Rand, options: MCOption[]): ExerciseBody {
  const seen = new Set<string>()
  const uniq = options.filter((o) => {
    if (seen.has(o.text)) return false
    seen.add(o.text)
    return true
  })
  return { kind: 'mc', options: r.shuffle(uniq) }
}

/** Plantilla de contenido fijo (preguntas conceptuales escritas a mano). */
export function fixed(id: string, area: AreaId, unit: string, title: string, draft: (r: Rand) => ExerciseDraft): Template {
  const d0 = draft({ next: () => 0.5, int: (a) => a, pick: (a) => a[0], nonZero: (a) => a || 1, shuffle: (a) => a.slice(), chance: () => false })
  return { id, area, unit, title, levels: [d0.level], gen: (r) => draft(r) }
}

/** TeX de una expresión escrita como texto. */
export const T = (s: string, vars: string[] = ['x']): string => toTeX(parse(s, { vars }))
/** TeX simplificado. */
export const TS = (s: string, vars: string[] = ['x']): string => toTeX(simplify(parse(s, { vars })))

/** Coeficiente con signo para armar polinomios en texto: " + 3x", " - x" … */
export function poly(coeffs: number[], v = 'x'): string {
  // coeffs de mayor a menor grado
  const n = coeffs.length - 1
  const terms: string[] = []
  coeffs.forEach((c, i) => {
    const p = n - i
    if (c === 0) return
    const abs = Math.abs(c)
    const sign = c < 0 ? '-' : '+'
    const coef = abs === 1 && p > 0 ? '' : String(abs)
    const varPart = p === 0 ? '' : p === 1 ? v : `${v}^${p}`
    terms.push(`${sign} ${coef}${coef && varPart ? '*' : ''}${varPart}`)
  })
  if (!terms.length) return '0'
  let s = terms.join(' ')
  s = s.startsWith('+ ') ? s.slice(2) : '-' + s.slice(2)
  return s
}

/** Evalúa un polinomio (coeficientes de mayor a menor). */
export function polyEval(coeffs: number[], x: number): number {
  return coeffs.reduce((acc, c) => acc * x + c, 0)
}
/** Derivada de un polinomio. */
export function polyDer(coeffs: number[]): number[] {
  const n = coeffs.length - 1
  return coeffs.slice(0, -1).map((c, i) => c * (n - i))
}

/** Número como fracción simplificada en texto ("3/4", "-2", "5"). */
export function fracStr(n: number, d = 1): string {
  if (d < 0) { n = -n; d = -d }
  const g = gcd(n, d)
  n /= g; d /= g
  return d === 1 ? String(n) : `${n}/${d}`
}
export function fracTeX(n: number, d = 1): string {
  if (d < 0) { n = -n; d = -d }
  const g = gcd(n, d)
  n /= g; d /= g
  return d === 1 ? String(n) : `${n < 0 ? '-' : ''}\\frac{${Math.abs(n)}}{${d}}`
}

/** "+ 3" / "- 3" para pegar en expresiones TeX. */
export const sgn = (v: number): string => (v < 0 ? `- ${Math.abs(v)}` : `+ ${v}`)
/** Número entre paréntesis si es negativo. */
export const par = (v: number): string => (v < 0 ? `(${v})` : String(v))

export const LV = {
  1: 'Nivel Explorador: reconocer el concepto o leerlo de un gráfico, un solo paso.',
  2: 'Nivel Aprendiz: aplicar una regla o fórmula conocida en uno o dos pasos.',
  3: 'Nivel Analista: varios pasos encadenados o elegir el método adecuado.',
  4: 'Nivel Experto: problema no rutinario, combina ideas y tiene distractores con errores típicos.',
  5: 'Nivel Parcial: desarrollo completo con varias partes de la misma unidad.',
  6: 'Nivel Final: integra contenidos de varias unidades y exige justificar.',
} as const

/** Intervalo positivo donde la expresión existe en todos los puntos de prueba (para comparar funciones). */
export function autoDomain(expr: string): [number, number] {
  const g = compile(parse(expr))
  const candidates: [number, number][] = [[0.3, 2.5], [1.2, 4], [2.5, 6], [0.05, 0.9], [4, 9]]
  for (const c of candidates) {
    let ok = 0
    for (let i = 0; i <= 20; i++) if (isFinite(g(c[0] + ((c[1] - c[0]) * i) / 20))) ok++
    if (ok === 21) return c
  }
  return [0.3, 2.5]
}

/** Primitiva de un polinomio (coeficientes de mayor a menor) como texto, sin constante. */
export function polyIntText(coeffs: number[], v = 'x'): string {
  const n = coeffs.length - 1
  const terms: string[] = []
  coeffs.forEach((c, i) => {
    if (c === 0) return
    const p = n - i + 1
    terms.push(`(${fracStr(c, p)})*${v}${p === 1 ? '' : '^' + p}`)
  })
  return terms.length ? terms.join(' + ') : '0'
}
/** Primitiva de un polinomio evaluada. */
export function polyIntEval(coeffs: number[], x: number): number {
  const n = coeffs.length - 1
  return coeffs.reduce((s, c, i) => s + (c * x ** (n - i + 1)) / (n - i + 1), 0)
}
