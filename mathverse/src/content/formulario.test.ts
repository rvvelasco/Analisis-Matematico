import { describe, expect, it } from 'vitest'
import { FORM, INT_CHECKS } from './formulario'
import { compile, parse } from '../math/expr'
import { simpson } from '../math/numeric'

describe('simulacro del formulario', () => {
  it('están las 45 preguntas, sin repetir', () => {
    const ns = FORM.map((q) => q.n).sort((a, b) => a - b)
    expect(ns).toEqual(Array.from({ length: 45 }, (_, i) => i + 1))
  })
  it('cada pregunta cargada tiene al menos una respuesta correcta y su explicación', () => {
    for (const q of FORM.filter((x) => !x.img)) {
      expect(q.opts.some((o) => o.ok), `pregunta ${q.n}`).toBe(true)
      expect(q.exp.length, `pregunta ${q.n}`).toBeGreaterThan(20)
    }
  })
  it('los valores de las integrales verifican numéricamente', () => {
    for (const c of INT_CHECKS) {
      const f = compile(parse(c.f))
      expect(simpson(f, c.a, c.b), `pregunta ${c.n}`).toBeCloseTo(c.value, 6)
    }
  })
})
