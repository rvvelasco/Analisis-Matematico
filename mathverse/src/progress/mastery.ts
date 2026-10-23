/** Modelo de dominio por concepto, estado de unidades, desbloqueos y recomendaciones. Todo puro (sin efectos). */
import type { Level } from '../engine/types'
import { UNITS, unitById, conceptName } from '../content/curriculum'
import type { Unit } from '../content/types'
import { emptyConcept, type ConceptStats, type State } from './schema'

export type ConceptStatus = 'nuevo' | 'visto' | 'practicado' | 'dominado'
export type UnitStatus = 'bloqueada' | 'disponible' | 'vista' | 'practicada' | 'dominada'

/** Tope de dominio que se puede demostrar en cada nivel: para "dominar" hay que resolver niveles altos. */
const LEVEL_CAP: Record<Level, number> = { 1: 0.55, 2: 0.72, 3: 0.88, 4: 1, 5: 1, 6: 1 }

export interface AttemptInfo {
  level: Level
  /** puntaje 0..1 (parcial en ejercicios con partes) */
  score: number
  hintsUsed: number
  solutionShown: boolean
  timeMs: number
}

/** Crédito efectivo de un intento: las pistas y ver la solución reducen lo que se demuestra. */
export function credit(a: AttemptInfo): number {
  if (a.solutionShown) return 0
  return Math.max(0, a.score * (1 - 0.2 * Math.min(a.hintsUsed, 3)))
}

export function updateConcept(c: ConceptStats | undefined, a: AttemptInfo, now: number): ConceptStats {
  const s = { ...(c ?? emptyConcept()) }
  const cr = credit(a)
  const correct = a.score >= 0.999 && !a.solutionShown
  s.attempts++
  if (correct) s.correct++
  else s.incorrect++
  s.hints += a.hintsUsed
  if (a.solutionShown) s.solutions++
  s.timeMs += Math.min(a.timeMs, 30 * 60 * 1000)
  s.last = now
  s.seen = true
  if (correct && a.hintsUsed === 0) s.levelMax = Math.max(s.levelMax, a.level)
  const target = cr * LEVEL_CAP[a.level]
  if (target >= s.mastery) s.mastery += 0.35 * (target - s.mastery)
  else s.mastery += (cr > 0 ? 0.1 : 0.2) * (target - s.mastery)
  s.mastery = Math.min(1, Math.max(0, s.mastery))
  return s
}

/** Decae levemente el dominio estimado si hace mucho que no se practica (sin modificar lo guardado). */
export function effectiveMastery(c: ConceptStats | undefined, now = Date.now()): number {
  if (!c) return 0
  const days = c.last ? (now - c.last) / 86400000 : 0
  const decay = days > 14 ? Math.min(0.25, (days - 14) * 0.005) : 0
  return Math.max(0, c.mastery - decay)
}

export function conceptStatus(c: ConceptStats | undefined, now = Date.now()): ConceptStatus {
  if (!c) return 'nuevo'
  if (effectiveMastery(c, now) >= 0.8 && c.correct >= 4 && c.levelMax >= 3) return 'dominado'
  if (c.attempts >= 3) return 'practicado'
  if (c.seen || c.attempts > 0) return 'visto'
  return 'nuevo'
}

export function unitMastery(s: State, u: Unit, now = Date.now()): number {
  if (!u.concepts.length) return 0
  return u.concepts.reduce((acc, c) => acc + effectiveMastery(s.concepts[c], now), 0) / u.concepts.length
}

/** Dominio mínimo de los prerrequisitos para desbloquear una unidad. */
export const UNLOCK_THRESHOLD = 0.55

export function isUnlocked(s: State, u: Unit, now = Date.now()): boolean {
  if (!u.prereqs.length || s.unlocked.includes(u.id)) return true
  return u.prereqs.every((p) => {
    const pu = unitById(p)
    return !pu || unitMastery(s, pu, now) >= UNLOCK_THRESHOLD
  })
}

export function unitStatus(s: State, u: Unit, now = Date.now()): UnitStatus {
  if (!isUnlocked(s, u, now)) return 'bloqueada'
  const sts = u.concepts.map((c) => conceptStatus(s.concepts[c], now))
  if (sts.length && sts.every((x) => x === 'dominado')) return 'dominada'
  if (unitMastery(s, u, now) >= 0.4 || sts.every((x) => x === 'practicado' || x === 'dominado')) return 'practicada'
  if ((s.stages[u.id]?.length ?? 0) > 0 || sts.some((x) => x !== 'nuevo')) return 'vista'
  return 'disponible'
}

/** Qué le falta a una unidad bloqueada. */
export function missingPrereqs(s: State, u: Unit, now = Date.now()): { unit: Unit; mastery: number }[] {
  return u.prereqs
    .map((p) => unitById(p)!)
    .filter(Boolean)
    .map((pu) => ({ unit: pu, mastery: unitMastery(s, pu, now) }))
    .filter((x) => x.mastery < UNLOCK_THRESHOLD)
}

export interface Recommendation {
  kind: 'repasar' | 'continuar' | 'reforzar' | 'nueva'
  unitId: string
  concept?: string
  title: string
  reason: string
}

/** Recomendaciones basadas en reglas, a partir del progreso real. */
export function recommendations(s: State, now = Date.now(), today = dayKey(now)): Recommendation[] {
  const out: Recommendation[] = []
  const due = s.errors.filter((e) => e.due <= today)
  if (due.length) out.push({ kind: 'repasar', unitId: due[0].concept.split('.')[0], concept: due[0].concept, title: `Repasar ${due.length} error${due.length > 1 ? 'es' : ''} pendiente${due.length > 1 ? 's' : ''}`, reason: 'Volver a un ejercicio que fallaste, en el momento justo, es la forma más eficiente de fijarlo.' })
  // conceptos practicados con dominio bajo
  const weak = Object.entries(s.concepts)
    .filter(([, c]) => c.attempts >= 2 && effectiveMastery(c, now) < 0.5)
    .sort((a, b) => effectiveMastery(a[1], now) - effectiveMastery(b[1], now))
  for (const [id] of weak.slice(0, 2)) out.push({ kind: 'reforzar', unitId: id.split('.')[0], concept: id, title: `Reforzar: ${conceptName(id)}`, reason: 'Lo practicaste, pero el dominio estimado todavía es bajo.' })
  // unidad en curso
  const inProgress = UNITS.find((u) => { const st = unitStatus(s, u, now); return st === 'vista' || st === 'practicada' })
  if (inProgress) out.push({ kind: 'continuar', unitId: inProgress.id, title: `Seguir con ${inProgress.title}`, reason: 'Ya empezaste esta unidad; dominarla desbloquea las siguientes.' })
  // próxima disponible
  const next = UNITS.find((u) => unitStatus(s, u, now) === 'disponible')
  if (next) out.push({ kind: 'nueva', unitId: next.id, title: `Empezar ${next.title}`, reason: next.prereqs.length ? 'Ya tenés los prerrequisitos.' : 'Es un buen punto de partida.' })
  return out.slice(0, 4)
}

export function dayKey(t = Date.now()): string {
  const d = new Date(t)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
export function addDays(day: string, n: number): string {
  const [y, m, d] = day.split('-').map(Number)
  return dayKey(new Date(y, m - 1, d + n, 12).getTime())
}

/** Intervalos de repaso (Leitner) en días según la caja. */
export const REVIEW_INTERVALS = [0, 1, 3, 7, 14]
