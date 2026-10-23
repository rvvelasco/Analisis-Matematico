/** Selección adaptativa de ejercicios, simulacros y desafío diario. */
import type { AreaId, Exercise, Level, Template } from './types'
import { ALL_TEMPLATES, closestLevel, instantiate, newSeed, templatesForUnit } from './registry'
import { hashSeed, makeRand, type Rand } from '../math/numeric'
import { unitById, UNITS } from '../content/curriculum'
import { effectiveMastery, unitMastery } from '../progress/mastery'
import type { State } from '../progress/schema'

/** Nivel sugerido según el dominio actual de la unidad. */
export function suggestedLevel(s: State, unitId: string): Level {
  const u = unitById(unitId)
  const m = u ? unitMastery(s, u) : 0
  return m < 0.2 ? 1 : m < 0.45 ? 2 : m < 0.65 ? 3 : 4
}

const isFixedTF = (t: Template) => t.id.includes('.tf.')

/** Próximo ejercicio de práctica para una unidad: prioriza conceptos con menos dominio y evita repetir. */
export function nextPractice(s: State, unitId: string, opts: { level?: Level; recent?: string[]; rand?: Rand } = {}): Exercise {
  const r = opts.rand ?? makeRand(newSeed())
  const base = opts.level ?? suggestedLevel(s, unitId)
  const pool = templatesForUnit(unitId).filter((t) => t.levels.some((l) => l <= 4))
  const candidates = pool.filter((t) => !(opts.recent ?? []).slice(-2).includes(t.id))
  const list = candidates.length ? candidates : pool
  // peso: más peso a conceptos poco dominados y a plantillas con el nivel buscado
  const weights = list.map((t) => {
    const ex = instantiate(t.id, 1, closestLevel(t, base))
    const m = ex.concepts.reduce((a, c) => a + effectiveMastery(s.concepts[c]), 0) / Math.max(1, ex.concepts.length)
    const gap = Math.min(...t.levels.map((l) => Math.abs(l - base)))
    const lvFit = gap === 0 ? 1.6 : gap === 1 ? 1 : 0.3
    return (1.2 - m) * lvFit * (isFixedTF(t) ? 0.5 : 1)
  })
  const total = weights.reduce((a, b) => a + b, 0)
  let x = r.next() * total
  let chosen = list[0]
  for (let i = 0; i < list.length; i++) { x -= weights[i]; if (x <= 0) { chosen = list[i]; break } }
  const lv = closestLevel(chosen, base > 4 ? 4 : base)
  return instantiate(chosen.id, r.int(1, 1e9), lv)
}

/** Ejercicios de "Desafiá tu intuición": verdadero/falso conceptuales y opciones con trampa. */
export function intuitionSet(unitId: string, seed: number): Exercise[] {
  const ts = templatesForUnit(unitId)
  const tf = ts.filter((t) => isFixedTF(t))
  const r = makeRand(seed)
  const out = tf.map((t) => instantiate(t.id, r.int(1, 1e9)))
  // si no hay V/F propios, se usan opciones múltiples o ejercicios de nivel alto de la unidad
  if (out.length < 2) {
    const others = r.shuffle(ts.filter((t) => !isFixedTF(t)))
    for (const t of others) {
      if (out.length >= 2) break
      const lv = closestLevel(t, 4)
      const ex = instantiate(t.id, r.int(1, 1e9), lv)
      if (ex.kind === 'mc' || ex.kind === 'tf' || lv >= 3) out.push(ex)
    }
  }
  return out
}

/** Prueba de dominio: ejercicios de nivel 3 y 4 de la unidad, sin ayuda. */
export function masteryCheck(unitId: string, seed: number, n = 4): Exercise[] {
  const r = makeRand(seed)
  const ts = r.shuffle(templatesForUnit(unitId).filter((t) => t.levels.some((l) => l >= 2 && l <= 4)))
  const out: Exercise[] = []
  for (let i = 0; out.length < n && i < n * 3; i++) {
    const t = ts[i % ts.length]
    if (!t) break
    const lv = closestLevel(t, i % 2 === 0 ? 3 : 4)
    out.push(instantiate(t.id, r.int(1, 1e9), lv))
  }
  return out
}

/** Prueba de nivel para desbloquear una unidad: evalúa sus prerrequisitos. */
export function placementTest(unitId: string, seed: number): Exercise[] {
  const u = unitById(unitId)
  if (!u) return []
  const r = makeRand(seed)
  const out: Exercise[] = []
  const pre = u.prereqs.length ? u.prereqs : [unitId]
  for (let i = 0; out.length < 4 && i < 12; i++) {
    const unit = pre[i % pre.length]
    const ts = templatesForUnit(unit).filter((t) => t.levels.some((l) => l >= 2 && l <= 4))
    if (!ts.length) continue
    const t = r.pick(ts)
    out.push(instantiate(t.id, r.int(1, 1e9), closestLevel(t, 3)))
  }
  return out
}

export interface ExamConfig {
  areas: AreaId[]
  units?: string[]
  level: Level
  count: number
  seed: number
}

/** Arma un simulacro: reparte preguntas entre unidades y niveles cercanos al elegido. */
export function buildExam(cfg: ExamConfig): Exercise[] {
  const r = makeRand(cfg.seed)
  const units = (cfg.units?.length ? cfg.units : UNITS.filter((u) => cfg.areas.includes(u.area)).map((u) => u.id))
  let pool = ALL_TEMPLATES.filter((t) => units.includes(t.unit))
  // en niveles altos se priorizan plantillas que llegan a ese nivel
  const high = pool.filter((t) => t.levels.some((l) => Math.abs(l - cfg.level) <= 1))
  if (high.length >= Math.min(cfg.count, 4)) pool = high
  const out: Exercise[] = []
  const used = new Set<string>()
  let order = r.shuffle(pool)
  for (let i = 0; out.length < cfg.count && i < cfg.count * 6; i++) {
    if (i > 0 && i % order.length === 0) order = r.shuffle(pool)
    const t = order[i % order.length]
    if (!t) break
    if (used.has(t.id) && used.size < pool.length) continue
    used.add(t.id)
    // variación de ±1 nivel para que no sea monótono
    const target = Math.max(1, Math.min(6, cfg.level + (r.chance(0.3) ? -1 : 0))) as Level
    out.push(instantiate(t.id, r.int(1, 1e9), closestLevel(t, target)))
  }
  return out
}

/** Desafío diario: 5 ejercicios iguales para todos ese día, de distintas áreas. */
export function dailyChallenge(day: string): Exercise[] {
  const r = makeRand(hashSeed('diario:' + day))
  const areas: AreaId[] = r.shuffle(['funciones', 'matrices', 'vectores', 'derivadas', 'integrales'])
  return areas.map((a, i) => {
    const ts = ALL_TEMPLATES.filter((t) => t.area === a && t.levels.some((l) => l >= 2 && l <= 4) && !isFixedTF(t))
    const t = r.pick(ts)
    return instantiate(t.id, r.int(1, 1e9), closestLevel(t, (2 + (i % 3)) as Level))
  })
}

/** Plantillas aptas para respuestas rápidas (duelo). */
export function quickTemplates(areas?: AreaId[]): Template[] {
  return ALL_TEMPLATES.filter((t) => (!areas || areas.includes(t.area)) && t.levels.some((l) => l <= 2))
}
