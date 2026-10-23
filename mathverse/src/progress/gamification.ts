/** XP, niveles de jugador, logros y misiones diarias. */
import type { Level } from '../engine/types'
import { hashSeed, makeRand } from '../math/numeric'
import { UNITS, AREAS } from '../content/curriculum'
import { conceptStatus, unitStatus } from './mastery'
import type { State } from './schema'

export function xpForAttempt(level: Level, score: number, hintsUsed: number, solutionShown: boolean): number {
  if (solutionShown) return 1
  const base = 6 + 6 * level
  return Math.round(base * score * (1 - 0.2 * Math.min(hintsUsed, 3)) + (score >= 1 && hintsUsed === 0 ? 4 : 0))
}

const TITLES = ['Curioso', 'Explorador', 'Aprendiz', 'Calculista', 'Analista', 'Estratega', 'Experto', 'Maestro', 'Sabio', 'Leyenda']

/** Nivel de jugador: cada nivel pide 100 XP más que el anterior. */
export function playerLevel(xp: number): { level: number; title: string; into: number; need: number } {
  let level = 1, need = 100, rest = xp
  while (rest >= need) { rest -= need; level++; need += 100 }
  return { level, title: TITLES[Math.min(TITLES.length - 1, Math.floor((level - 1) / 2))], into: rest, need }
}

/* ---------- logros ---------- */
export interface Achievement { id: string; name: string; desc: string; icon: string; check: (s: State) => boolean }

const dominated = (s: State) => Object.values(s.concepts).filter((c) => conceptStatus(c) === 'dominado').length

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'first', name: 'Primer paso', desc: 'Resolvé tu primer ejercicio correctamente.', icon: '🌱', check: (s) => s.totals.correct >= 1 },
  { id: 'c25', name: 'Calentando motores', desc: '25 ejercicios correctos.', icon: '🔥', check: (s) => s.totals.correct >= 25 },
  { id: 'c100', name: 'Centenario', desc: '100 ejercicios correctos.', icon: '💯', check: (s) => s.totals.correct >= 100 },
  { id: 'c300', name: 'Imparable', desc: '300 ejercicios correctos.', icon: '🚀', check: (s) => s.totals.correct >= 300 },
  { id: 'streak3', name: 'Constancia', desc: 'Racha de 3 días.', icon: '📅', check: (s) => s.streak.best >= 3 },
  { id: 'streak7', name: 'Una semana entera', desc: 'Racha de 7 días.', icon: '🗓️', check: (s) => s.streak.best >= 7 },
  { id: 'streak30', name: 'Hábito de hierro', desc: 'Racha de 30 días.', icon: '🏆', check: (s) => s.streak.best >= 30 },
  { id: 'nohint10', name: 'Sin rueditas', desc: '10 correctos seguidos sin pistas.', icon: '🚲', check: (s) => s.records.bestNoHintRun >= 10 },
  { id: 'master1', name: 'Primer dominio', desc: 'Dominá tu primer concepto.', icon: '⭐', check: (s) => dominated(s) >= 1 },
  { id: 'master10', name: 'Coleccionista', desc: 'Dominá 10 conceptos.', icon: '🌟', check: (s) => dominated(s) >= 10 },
  { id: 'unit1', name: 'Unidad conquistada', desc: 'Dominá una unidad completa.', icon: '🏅', check: (s) => UNITS.some((u) => unitStatus(s, u) === 'dominada') },
  ...AREAS.map((a) => ({ id: `area-${a.id}`, name: `Maestría en ${a.name}`, desc: `Dominá todas las unidades de ${a.name}.`, icon: a.icon, check: (s: State) => UNITS.filter((u) => u.area === a.id).every((u) => unitStatus(s, u) === 'dominada') })),
  { id: 'review5', name: 'Aprender del error', desc: 'Resolvé 5 errores en el repaso.', icon: '🔁', check: (s) => s.resolvedErrors >= 5 },
  { id: 'duel15', name: 'Duelista', desc: 'Hacé 15 puntos en un duelo.', icon: '⚔️', check: (s) => s.records.duelBest >= 15 },
  { id: 'exam80', name: 'Listo para el parcial', desc: 'Sacá 80% o más en un simulacro.', icon: '📝', check: (s) => s.exams.some((e) => e.total > 0 && e.score / e.total >= 0.8) },
  { id: 'daily3', name: 'Desafío aceptado', desc: 'Completá 3 desafíos diarios.', icon: '📆', check: (s) => Object.keys(s.dailyChallenges).length >= 3 },
  { id: 'games5', name: 'Jugador', desc: 'Probá 5 juegos distintos.', icon: '🎮', check: (s) => Object.keys(s.records.gamesPlayed).length >= 5 },
  { id: 'explorer', name: 'Lección completa', desc: 'Recorré todas las etapas de una lección.', icon: '🧭', check: (s) => Object.values(s.stages).some((st) => st.length >= 10) },
]

/** Logros nuevos (que se cumplen y no estaban registrados). */
export function newAchievements(s: State): Achievement[] {
  return ACHIEVEMENTS.filter((a) => !s.achievements[a.id] && a.check(s))
}

/* ---------- misiones diarias ---------- */
export type MissionEvent = 'attempt' | 'correct' | 'noHint' | 'highLevel' | 'review' | 'game' | 'duel' | 'lesson' | 'daily' | 'weak'

export interface MissionDef { id: string; text: string; goal: number; event: MissionEvent; xp: number }

export const MISSION_POOL: MissionDef[] = [
  { id: 'solve5', text: 'Resolvé 5 ejercicios correctamente', goal: 5, event: 'correct', xp: 30 },
  { id: 'solve10', text: 'Resolvé 10 ejercicios correctamente', goal: 10, event: 'correct', xp: 50 },
  { id: 'nohint3', text: 'Acertá 3 ejercicios sin pedir pistas', goal: 3, event: 'noHint', xp: 30 },
  { id: 'high2', text: 'Resolvé 2 ejercicios de nivel Analista o superior', goal: 2, event: 'highLevel', xp: 40 },
  { id: 'review2', text: 'Repasá 2 errores anteriores', goal: 2, event: 'review', xp: 35 },
  { id: 'game1', text: 'Jugá una partida de cualquier juego', goal: 1, event: 'game', xp: 20 },
  { id: 'duel1', text: 'Jugá un duelo contra reloj', goal: 1, event: 'duel', xp: 25 },
  { id: 'lesson3', text: 'Recorré 3 etapas de una lección', goal: 3, event: 'lesson', xp: 20 },
  { id: 'daily', text: 'Completá el desafío diario', goal: 1, event: 'daily', xp: 40 },
  { id: 'weak2', text: 'Practicá 2 veces un concepto con dominio bajo', goal: 2, event: 'weak', xp: 35 },
]

/** Las 3 misiones del día (siempre las mismas para una fecha). */
export function missionsFor(day: string): MissionDef[] {
  const r = makeRand(hashSeed('misiones:' + day))
  return r.shuffle(MISSION_POOL).slice(0, 3)
}
