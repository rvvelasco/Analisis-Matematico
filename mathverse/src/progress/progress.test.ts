import { describe, expect, it } from 'vitest'
import { defaultState, parseImport, sanitize, serializeExport } from './schema'
import { conceptStatus, isUnlocked, unitStatus, updateConcept, addDays, dayKey } from './mastery'
import { missionsFor, playerLevel, xpForAttempt } from './gamification'
import { unitById } from '../content/curriculum'
import { instantiate } from '../engine/registry'
import { __setState, getState, recordAttempt, recordReview } from './store'

describe('esquema y validación', () => {
  it('sanitize nunca falla y descarta basura', () => {
    for (const raw of [null, 3, 'hola', [], { concepts: 'x' }, { concepts: { 'f1.dominio': { attempts: 'muchos', mastery: 7 } }, xp: -5, streak: { lastDay: 'ayer' } }]) {
      const s = sanitize(raw)
      expect(s.version).toBe(1)
      expect(s.xp).toBeGreaterThanOrEqual(0)
    }
    const s = sanitize({ concepts: { 'f1.dominio': { attempts: 'muchos', mastery: 7 }, 'malo': {} } })
    expect(s.concepts['f1.dominio'].attempts).toBe(0)
    expect(s.concepts['f1.dominio'].mastery).toBe(1)
    expect(s.concepts['malo']).toBeUndefined()
  })
  it('exportar e importar conserva el progreso', () => {
    const s = defaultState()
    s.xp = 420
    s.concepts['d6.cadena'] = { ...updateConcept(undefined, { level: 3, score: 1, hintsUsed: 0, solutionShown: false, timeMs: 1000 }, 1) }
    const r = parseImport(serializeExport(s))
    expect(r.ok).toBe(true)
    if (r.ok) {
      expect(r.state.xp).toBe(420)
      expect(r.state.concepts['d6.cadena'].correct).toBe(1)
    }
  })
  it('rechaza archivos que no son de MathVerse', () => {
    expect(parseImport('no es json').ok).toBe(false)
    expect(parseImport('{"a":1}').ok).toBe(false)
  })
})

describe('dominio', () => {
  it('practicar solo nivel 1 no alcanza para dominar', () => {
    let c = undefined
    for (let i = 0; i < 30; i++) c = updateConcept(c, { level: 1, score: 1, hintsUsed: 0, solutionShown: false, timeMs: 1000 }, Date.now())
    expect(c!.mastery).toBeLessThan(0.6)
    expect(conceptStatus(c)).toBe('practicado')
  })
  it('resolver niveles altos sin ayuda lleva a dominado', () => {
    let c = undefined
    for (let i = 0; i < 8; i++) c = updateConcept(c, { level: 4, score: 1, hintsUsed: 0, solutionShown: false, timeMs: 1000 }, Date.now())
    expect(conceptStatus(c)).toBe('dominado')
  })
  it('ver la solución no suma dominio', () => {
    const c = updateConcept(undefined, { level: 4, score: 1, hintsUsed: 0, solutionShown: true, timeMs: 1000 }, Date.now())
    expect(c.mastery).toBe(0)
  })
  it('las unidades se desbloquean por dominio de los prerrequisitos', () => {
    const s = defaultState()
    const f2 = unitById('f2')!
    expect(isUnlocked(s, unitById('f1')!)).toBe(true)
    expect(unitStatus(s, f2)).toBe('bloqueada')
    for (const c of unitById('f1')!.concepts) {
      let st = undefined
      for (let i = 0; i < 6; i++) st = updateConcept(st, { level: 3, score: 1, hintsUsed: 0, solutionShown: false, timeMs: 1000 }, Date.now())
      s.concepts[c] = st!
    }
    expect(isUnlocked(s, f2)).toBe(true)
  })
})

describe('gamificación', () => {
  it('XP y niveles', () => {
    expect(xpForAttempt(1, 1, 0, false)).toBeGreaterThan(xpForAttempt(1, 1, 2, false))
    expect(xpForAttempt(4, 1, 0, false)).toBeGreaterThan(xpForAttempt(1, 1, 0, false))
    expect(playerLevel(0).level).toBe(1)
    expect(playerLevel(100).level).toBe(2)
    expect(playerLevel(300).level).toBe(3)
  })
  it('las misiones diarias son estables por fecha', () => {
    expect(missionsFor('2026-01-01').map((m) => m.id)).toEqual(missionsFor('2026-01-01').map((m) => m.id))
    expect(missionsFor('2026-01-01')).toHaveLength(3)
  })
  it('fechas', () => {
    expect(addDays('2026-02-28', 1)).toBe('2026-03-01')
    expect(addDays('2026-01-01', -1)).toBe('2025-12-31')
  })
})

describe('acciones del almacén', () => {
  it('un intento fallado entra al repaso y sale tras repasarlo bien varias veces', () => {
    __setState(defaultState())
    const ex = instantiate('d3.power', 5, 1)
    recordAttempt(ex, 0, { hintsUsed: 0, solutionShown: false, timeMs: 2000, message: 'mal' })
    const s = getState()
    expect(s.errors).toHaveLength(1)
    expect(s.errors[0].due).toBe(dayKey())
    for (let i = 0; i < 4; i++) recordReview(s.errors[0].id, true)
    expect(getState().errors).toHaveLength(0)
    expect(getState().resolvedErrors).toBe(1)
  })
  it('un intento correcto suma XP, racha y totales', () => {
    __setState(defaultState())
    const ex = instantiate('d3.power', 2, 2)
    const { xp } = recordAttempt(ex, 1, { hintsUsed: 0, solutionShown: false, timeMs: 5000 })
    const s = getState()
    expect(xp).toBeGreaterThan(0)
    expect(s.xp).toBeGreaterThanOrEqual(xp)
    expect(s.streak.current).toBe(1)
    expect(s.totals.correct).toBe(1)
    expect(s.achievements.first).toBeDefined()
  })
})
