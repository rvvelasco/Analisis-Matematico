/** Registro de plantillas: instancia ejercicios reproducibles (plantilla + semilla + nivel). */
import { makeRand } from '../math/numeric'
import { compile, parse } from '../math/expr'
import { compareFunctions } from '../math/equivalence'
import type { Exercise, ExerciseBody, Level, Template } from './types'
import { ALL_TEMPLATES } from '../content/templates'

const byId = new Map<string, Template>()
for (const t of ALL_TEMPLATES) {
  if (byId.has(t.id)) throw new Error(`Plantilla duplicada: ${t.id}`)
  byId.set(t.id, t)
}

export function getTemplate(id: string): Template | undefined {
  return byId.get(id)
}

export function templatesForUnit(unit: string): Template[] {
  return ALL_TEMPLATES.filter((t) => t.unit === unit)
}

export function templatesForArea(area: string): Template[] {
  return ALL_TEMPLATES.filter((t) => t.area === area)
}

/** Nivel más cercano disponible en la plantilla. */
export function closestLevel(t: Template, level: Level): Level {
  if (t.levels.includes(level)) return level
  return t.levels.reduce((best, l) => (Math.abs(l - level) < Math.abs(best - level) ? l : best), t.levels[0])
}

export function instantiate(templateId: string, seed: number, level?: Level): Exercise {
  const t = byId.get(templateId)
  if (!t) throw new Error(`No existe la plantilla ${templateId}`)
  const lv = closestLevel(t, level ?? t.levels[0])
  const r = makeRand(seed * 7919 + lv * 104729 + 17)
  const draft = sanitize(t.gen(r, lv) as ExerciseBody)
  return { ...draft, id: `${templateId}#${seed}@${lv}`, templateId, seed, area: t.area, unit: t.unit } as Exercise
}

/**
 * Descarta "errores típicos" que, para los parámetros sorteados, coinciden con la respuesta correcta
 * (por ejemplo, invertir una pendiente que vale −1). Así nunca se marca como error algo correcto.
 */
function sanitize<B extends ExerciseBody>(b: B): B {
  if (b.kind === 'numeric' && b.wrong) {
    return { ...b, wrong: b.wrong.filter((w) => Math.abs(w.value - b.answer) > 1e-9 * Math.max(1, Math.abs(b.answer))) }
  }
  if (b.kind === 'expression' && b.wrong) {
    const ans = compile(parse(b.answer, { vars: [b.v] }), b.v)
    return {
      ...b,
      wrong: b.wrong.filter((w) => {
        try {
          return compareFunctions(compile(parse(w.expr, { vars: [b.v] }), b.v), ans, { mode: b.mode, domain: b.domain }).status !== 'equal'
        } catch {
          return false
        }
      }),
    }
  }
  if (b.kind === 'multi') return { ...b, parts: b.parts.map((p) => sanitize(p)) }
  return b
}

export function newSeed(): number {
  return Math.floor(Math.random() * 1e9)
}

export { ALL_TEMPLATES }
