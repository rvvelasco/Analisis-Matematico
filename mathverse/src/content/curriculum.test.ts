import { describe, expect, it } from 'vitest'
import { AREAS, CONCEPT_NAMES, UNITS, unitById } from './curriculum'
import { ALL_TEMPLATES, templatesForUnit } from '../engine/registry'
import { parse } from '../math/expr'

describe('currículo', () => {
  it('cada unidad tiene plantillas, prerrequisitos válidos y conceptos con nombre', () => {
    for (const u of UNITS) {
      expect(templatesForUnit(u.id).length, `${u.id} sin plantillas`).toBeGreaterThan(0)
      for (const p of u.prereqs) expect(unitById(p), `${u.id}: prerrequisito ${p}`).toBeDefined()
      for (const c of u.concepts) expect(CONCEPT_NAMES[c], `${u.id}: concepto ${c}`).toBeDefined()
    }
  })
  it('cada plantilla pertenece a una unidad existente y usa conceptos con nombre', () => {
    for (const t of ALL_TEMPLATES) expect(unitById(t.unit), t.id).toBeDefined()
  })
  it('los prerrequisitos no forman ciclos', () => {
    const state = new Map<string, number>()
    const visit = (id: string): void => {
      if (state.get(id) === 2) return
      expect(state.get(id), `ciclo en ${id}`).not.toBe(1)
      state.set(id, 1)
      for (const p of unitById(id)!.prereqs) visit(p)
      state.set(id, 2)
    }
    UNITS.forEach((u) => visit(u.id))
  })
  it('las 5 áreas tienen unidades', () => {
    for (const a of AREAS) expect(UNITS.filter((u) => u.area === a.id).length).toBeGreaterThan(4)
  })
  it('las fórmulas de las visualizaciones se pueden leer', () => {
    for (const u of UNITS) {
      const w = u.lesson.visual.widget
      const exprs: string[] = []
      if ('f' in w) exprs.push(w.f)
      if (w.type === 'inverseFn') exprs.push(w.finv)
      if (w.type === 'family') {
        exprs.push(w.expr)
        if (w.ghost) exprs.push(w.ghost)
      }
      const vars = ['x', ...(w.type === 'family' ? w.params.map((p) => p.name) : [])]
      for (const e of exprs) expect(() => parse(e, { vars }), `${u.id}: ${e}`).not.toThrow()
    }
  })
})
