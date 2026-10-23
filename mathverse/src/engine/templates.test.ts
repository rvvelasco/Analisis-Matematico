/**
 * Validación automática del banco de ejercicios.
 * Para cada plantilla, nivel y muchas semillas verifica que:
 *  - la respuesta correcta sea válida y legible por el corrector,
 *  - la propia respuesta correcta sea aceptada por el validador,
 *  - ningún distractor/errores típicos coincida con la respuesta correcta,
 *  - las opciones múltiples tengan exactamente una correcta,
 *  - existan pistas, resolución y explicación,
 *  - la verificación independiente de la plantilla (si existe) no reporte problemas.
 */
import { describe, expect, it } from 'vitest'
import { ALL_TEMPLATES, instantiate } from './registry'
import { validate } from './validate'
import { compareFunctions, parseNumber } from '../math/equivalence'
import { compile, parse } from '../math/expr'
import { parseFrac } from '../math/fraction'
import type { Answer, Exercise, ExerciseBody } from './types'
import { SLIDER_CHECKS } from './sliderChecks'

const SEEDS = Array.from({ length: 40 }, (_, i) => i + 1)

function correctAnswer(ex: ExerciseBody): Answer {
  switch (ex.kind) {
    case 'mc': return { kind: 'mc', index: ex.options.findIndex((o) => o.correct) }
    case 'tf': return { kind: 'tf', value: ex.answer, reason: ex.reasons.findIndex((o) => o.correct) }
    case 'numeric': return { kind: 'numeric', text: ex.answerText ?? String(ex.answer) }
    case 'expression': return { kind: 'expression', text: ex.mode === 'upToConstant' ? ex.answer + ' + C' : ex.answer }
    case 'fill': return { kind: 'fill', values: Object.fromEntries(ex.parts.filter((p) => typeof p !== 'string').map((p) => [(p as { id: string }).id, (p as { answer: string }).answer])) }
    case 'order': return { kind: 'order', order: ex.items.map((_, i) => i) }
    case 'match': return { kind: 'match', map: ex.pairs.map((_, i) => i) }
    case 'matrix': return { kind: 'matrix', cells: ex.answer }
    case 'errorStep': return { kind: 'errorStep', step: ex.wrongIndex, rule: ex.ruleOptions.findIndex((o) => o.correct), fix: ex.fix?.answer }
    case 'multi': return { kind: 'multi', parts: ex.parts.map((p) => correctAnswer(p)) }
    case 'slider': return { kind: 'slider', values: [] }
  }
}

function checkBody(ex: ExerciseBody, where: string): void {
  switch (ex.kind) {
    case 'mc': {
      expect(ex.options.filter((o) => o.correct).length, `${where}: una sola correcta`).toBe(1)
      expect(ex.options.length, `${where}: al menos 2 opciones`).toBeGreaterThanOrEqual(2)
      expect(new Set(ex.options.map((o) => o.text)).size, `${where}: opciones distintas`).toBe(ex.options.length)
      break
    }
    case 'tf':
      expect(ex.reasons.filter((o) => o.correct).length, `${where}: una justificación correcta`).toBe(1)
      break
    case 'numeric': {
      expect(isFinite(ex.answer), `${where}: respuesta finita`).toBe(true)
      if (ex.answerText) expect(parseNumber(ex.answerText), `${where}: answerText legible (${ex.answerText})`).not.toBeNull()
      if (ex.answerText) expect(Math.abs((parseNumber(ex.answerText) ?? NaN) - ex.answer) < 1e-6 * Math.max(1, Math.abs(ex.answer)), `${where}: answerText = answer`).toBe(true)
      for (const w of ex.wrong ?? []) expect(Math.abs(w.value - ex.answer) > 1e-9, `${where}: distractor numérico igual a la respuesta (${w.value})`).toBe(true)
      break
    }
    case 'expression': {
      const ans = compile(parse(ex.answer, { vars: [ex.v] }), ex.v)
      let valid = 0
      for (let i = 0; i <= 20; i++) if (isFinite(ans(ex.domain[0] + ((ex.domain[1] - ex.domain[0]) * i) / 20))) valid++
      expect(valid, `${where}: la respuesta se puede evaluar en el dominio`).toBeGreaterThan(14)
      for (const w of ex.wrong ?? []) {
        const wf = compile(parse(w.expr, { vars: [ex.v] }), ex.v)
        expect(compareFunctions(wf, ans, { mode: ex.mode, domain: ex.domain }).status, `${where}: error típico equivalente a la respuesta (${w.expr})`).not.toBe('equal')
      }
      break
    }
    case 'fill':
      for (const p of ex.parts) if (typeof p !== 'string') {
        if (p.mode === 'number') expect(parseNumber(p.answer), `${where}: casillero ${p.id}`).not.toBeNull()
        else expect(() => parse(p.answer, { vars: [p.v ?? 'x'] }), `${where}: casillero ${p.id}`).not.toThrow()
      }
      break
    case 'matrix':
      expect(ex.answer.length).toBe(ex.rows)
      for (const row of ex.answer) { expect(row.length).toBe(ex.cols); for (const c of row) expect(parseFrac(c), `${where}: celda ${c}`).not.toBeNull() }
      break
    case 'order':
      expect(ex.items.length).toBeGreaterThanOrEqual(3)
      expect(new Set(ex.items).size).toBe(ex.items.length)
      break
    case 'match':
      expect(new Set(ex.pairs.map((p) => p.right)).size, `${where}: lados derechos distintos`).toBe(ex.pairs.length)
      break
    case 'errorStep':
      expect(ex.wrongIndex).toBeGreaterThanOrEqual(0)
      expect(ex.wrongIndex).toBeLessThan(ex.steps.length)
      expect(ex.ruleOptions.filter((o) => o.correct).length).toBe(1)
      break
    case 'multi':
      ex.parts.forEach((p, i) => checkBody(p, `${where} parte ${i + 1}`))
      break
    case 'slider':
      expect(SLIDER_CHECKS[ex.checkId], `${where}: criterio ${ex.checkId}`).toBeDefined()
      break
  }
}

describe('banco de ejercicios', () => {
  it('hay plantillas para todas las áreas cargadas', () => {
    expect(ALL_TEMPLATES.length).toBeGreaterThan(10)
  })
  for (const t of ALL_TEMPLATES) {
    it(`plantilla ${t.id}`, () => {
      for (const level of t.levels) {
        for (const seed of SEEDS) {
          const ex: Exercise = instantiate(t.id, seed, level)
          const where = `${t.id} N${level} semilla ${seed}`
          expect(ex.prompt.length, `${where}: enunciado`).toBeGreaterThan(5)
          expect(ex.hints.length, `${where}: pistas`).toBeGreaterThanOrEqual(1)
          expect(ex.solution.length, `${where}: resolución`).toBeGreaterThanOrEqual(1)
          expect(ex.explanation.length, `${where}: explicación`).toBeGreaterThan(10)
          expect(ex.levelWhy.length, `${where}: justificación del nivel`).toBeGreaterThan(10)
          checkBody(ex, where)
          if (ex.kind !== 'slider') {
            const fb = validate(ex, correctAnswer(ex))
            expect(fb.verdict, `${where}: la respuesta correcta debe ser aceptada (${fb.message})`).toBe('correct')
          }
          const v = t.verify?.(ex)
          expect(v ?? null, `${where}: verificación independiente`).toBeNull()
        }
      }
    })
  }
})
