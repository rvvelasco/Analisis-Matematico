/** Respuestas equivalentes que deben aceptarse (y no equivalentes que deben rechazarse). */
import { describe, expect, it } from 'vitest'
import { validate } from './validate'
import type { Exercise, ExerciseBody } from './types'

const base = { id: 't', templateId: 't', seed: 1, area: 'derivadas', unit: 'd3', subtopic: '', concepts: [], level: 2, levelWhy: '', prompt: '', hints: [], solution: [], explanation: '', commonErrors: [], prereqs: [], estMinutes: 1 }
const exExpr = (answer: string, mode: 'exact' | 'upToConstant', domain: [number, number] = [0.3, 2.5], source?: { f: string; op: 'derivative' | 'integral' }): Exercise =>
  ({ ...base, kind: 'expression', answer, v: 'x', mode, domain, source } as unknown as Exercise)
const exNum = (answer: number, extra: Partial<Extract<ExerciseBody, { kind: 'numeric' }>> = {}): Exercise => ({ ...base, kind: 'numeric', answer, ...extra } as unknown as Exercise)
const verdict = (ex: Exercise, text: string) => validate(ex, ex.kind === 'numeric' ? { kind: 'numeric', text } : { kind: 'expression', text }).verdict

describe('equivalencia de expresiones', () => {
  it('derivadas escritas de formas distintas', () => {
    const ex = exExpr('2*x*cos(x^2 + 3)', 'exact', [0.3, 2.5], { f: 'sin(x^2+3)', op: 'derivative' })
    for (const t of ['2x cos(x^2+3)', 'cos(x²+3)·2x', '2*x*cos(3 + x^2)', 'x*2*cos(x^2+3)', '2x*cos(x^2+3)']) expect(verdict(ex, t), t).toBe('correct')
    for (const t of ['cos(x^2+3)', '2*cos(x^2+3)', '-2x cos(x^2+3)']) expect(verdict(ex, t), t).toBe('incorrect')
  })
  it('cociente: forma desarrollada y factorizada', () => {
    const ex = exExpr('1/(x + 2)^2', 'exact', [0.3, 2.5], { f: '(x+1)/(x+2)', op: 'derivative' })
    for (const t of ['(x+2-(x+1))/(x+2)^2', '1/(x^2+4x+4)', '(x+2)^(-2)']) expect(verdict(ex, t), t).toBe('correct')
  })
  it('raíces, potencias fraccionarias y sen/sin', () => {
    const ex = exExpr('1/(2*sqrt(x))', 'exact')
    for (const t of ['0.5*x^(-1/2)', '1/(2√x)', 'x^(-0.5)/2', '(1/2)x^(-1/2)']) expect(verdict(ex, t), t).toBe('correct')
    const ex2 = exExpr('cos(x)', 'exact')
    for (const t of ['cos x', 'cos(x)', 'sen(x + pi/2)', 'sin(pi/2 + x)']) expect(verdict(ex2, t), t).toBe('correct')
  })
  it('identidades trigonométricas y logarítmicas', () => {
    expect(verdict(exExpr('2*sin(x)*cos(x)', 'exact'), 'sin(2x)')).toBe('correct')
    expect(verdict(exExpr('1 - cos(x)^2', 'exact'), 'sin(x)^2')).toBe('correct')
    expect(verdict(exExpr('ln(x^2)', 'exact'), '2ln(x)')).toBe('correct')
    expect(verdict(exExpr('e^(2*x)', 'exact'), '(e^x)^2')).toBe('correct')
  })
  it('integrales: salvo constante, con o sin +C', () => {
    const ex = exExpr('x^3/3 + x^2', 'upToConstant', [0.3, 2.5], { f: 'x^2 + 2x', op: 'integral' })
    for (const t of ['x^3/3 + x^2 + C', '(1/3)x³ + x² + 7', 'x^3/3 + x^2', '(x^3 + 3x^2)/3 + k']) expect(verdict(ex, t), t).not.toBe('incorrect')
    expect(verdict(ex, 'x^3/3 + x^2')).toBe('correct')
    expect(verdict(ex, 'x^3 + x^2')).toBe('incorrect')
    expect(verdict(ex, '2x + 2')).toBe('incorrect')
    const ex2 = exExpr('-cos(x)', 'upToConstant', [0.3, 2.5], { f: 'sin(x)', op: 'integral' })
    expect(verdict(ex2, '-cos(x) + C')).toBe('correct')
    expect(verdict(ex2, '1 - cos(x)')).toBe('correct')
    expect(verdict(ex2, 'cos(x)')).toBe('incorrect')
  })
  it('ln|x| equivale a ln(x) en un dominio positivo', () => {
    expect(verdict(exExpr('ln(x)', 'upToConstant'), 'ln|x| + C')).toBe('correct')
  })
  it('expresión que no se puede evaluar en el dominio: "no lo puedo decidir", nunca incorrecto', () => {
    expect(verdict(exExpr('x', 'exact', [0.3, 2.5]), 'sqrt(-1 - x^2)')).toBe('unknown')
  })
})

describe('respuestas numéricas', () => {
  it('fracciones, decimales y expresiones exactas', () => {
    const ex = exNum(4 / 3)
    for (const t of ['4/3', '1,3333333', '8/6', '1+1/3']) expect(verdict(ex, t), t).toBe('correct')
  })
  it('redondeos razonables se aceptan; los groseros no', () => {
    expect(verdict(exNum(4 / 3), '1,33')).toBe('correct')
    expect(verdict(exNum(4 / 3), '1.333')).toBe('correct')
    expect(verdict(exNum(4 / 3), '1,3')).toBe('incorrect')
    expect(verdict(exNum(4 / 3), '1,34')).toBe('incorrect')
    expect(verdict(exNum(Math.sqrt(18)), '4,24')).toBe('correct')
    expect(verdict(exNum(Math.sqrt(18)), '3*sqrt(2)')).toBe('correct')
    expect(verdict(exNum(Math.sqrt(18)), '4,25')).toBe('incorrect')
    expect(verdict(exNum(6 * Math.PI), '6pi')).toBe('correct')
    expect(verdict(exNum(6 * Math.PI), '18,85')).toBe('correct')
  })
  it('los enteros exigen el valor exacto', () => {
    expect(verdict(exNum(5), '5,0')).toBe('correct')
    expect(verdict(exNum(5), '4,99')).toBe('incorrect')
  })
})
