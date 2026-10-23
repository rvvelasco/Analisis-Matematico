/** Almacén del progreso: persistencia local, acciones y avisos (logros, XP). */
import { useSyncExternalStore } from 'react'
import type { Exercise } from '../engine/types'
import { addDays, dayKey, effectiveMastery, REVIEW_INTERVALS, updateConcept } from './mastery'
import { missionsFor, newAchievements, xpForAttempt, type MissionEvent } from './gamification'
import { defaultState, parseImport, sanitize, serializeExport, STORAGE_KEY, type ExamRecord, type Settings, type State } from './schema'

type Listener = () => void
export interface Toast { id: number; kind: 'xp' | 'achievement' | 'mission' | 'info'; title: string; text?: string; icon?: string }

let state: State = load()
const listeners = new Set<Listener>()
const toastListeners = new Set<(t: Toast) => void>()
let toastId = 0
let storageOk = true

function load(): State {
  try {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null
    return raw ? sanitize(JSON.parse(raw)) : defaultState()
  } catch {
    return defaultState()
  }
}

function persist(): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    storageOk = true
  } catch {
    storageOk = false
  }
}

export const isStorageOk = () => storageOk

function emit(): void {
  listeners.forEach((l) => l())
}

function toast(t: Omit<Toast, 'id'>): void {
  const full = { ...t, id: ++toastId }
  toastListeners.forEach((l) => l(full))
}

export function onToast(fn: (t: Toast) => void): () => void {
  toastListeners.add(fn)
  return () => toastListeners.delete(fn)
}

function commit(next: State): void {
  // logros nuevos
  const fresh = newAchievements(next)
  if (fresh.length) {
    next = { ...next, achievements: { ...next.achievements } }
    for (const a of fresh) {
      next.achievements[a.id] = Date.now()
      toast({ kind: 'achievement', title: `¡Logro: ${a.name}!`, text: a.desc, icon: a.icon })
    }
  }
  state = next
  persist()
  emit()
}

export function getState(): State {
  return state
}

export function subscribe(l: Listener): () => void {
  listeners.add(l)
  return () => listeners.delete(l)
}

export function useProgress(): State {
  return useSyncExternalStore(subscribe, getState, getState)
}

/* ---------- misiones ---------- */
function ensureDaily(s: State, today: string): State {
  if (s.daily.date === today) return s
  return { ...s, daily: { date: today, missions: missionsFor(today).map((m) => ({ id: m.id, progress: 0 })), claimed: [] } }
}

function bumpMissions(s: State, events: MissionEvent[], today: string): State {
  let next = ensureDaily(s, today)
  const defs = missionsFor(today)
  const missions = next.daily.missions.map((m) => {
    const def = defs.find((d) => d.id === m.id)
    if (!def || !events.includes(def.event)) return m
    return { ...m, progress: Math.min(def.goal, m.progress + events.filter((e) => e === def.event).length) }
  })
  let xp = 0
  const claimed = [...next.daily.claimed]
  for (const m of missions) {
    const def = defs.find((d) => d.id === m.id)!
    if (m.progress >= def.goal && !claimed.includes(m.id)) {
      claimed.push(m.id)
      xp += def.xp
      toast({ kind: 'mission', title: 'Misión cumplida', text: `${def.text} (+${def.xp} XP)`, icon: '🎯' })
    }
  }
  next = { ...next, daily: { ...next.daily, missions, claimed } }
  return xp ? addXp(next, xp, today) : next
}

function addXp(s: State, xp: number, today: string): State {
  return { ...s, xp: s.xp + xp, xpByDay: { ...s.xpByDay, [today]: (s.xpByDay[today] ?? 0) + xp } }
}

function touchStreak(s: State, today: string): State {
  if (s.streak.lastDay === today) return s
  const current = s.streak.lastDay === addDays(today, -1) ? s.streak.current + 1 : 1
  return { ...s, streak: { current, best: Math.max(s.streak.best, current), lastDay: today } }
}

/* ---------- acciones ---------- */
export interface AttemptMeta {
  hintsUsed: number
  solutionShown: boolean
  timeMs: number
  /** de dónde viene el intento */
  source?: 'leccion' | 'practica' | 'repaso' | 'juego' | 'examen' | 'diario'
  /** mensaje del diagnóstico (para el registro de errores) */
  message?: string
  errorTag?: string
}

export function recordAttempt(ex: Exercise, score: number, meta: AttemptMeta): { xp: number } {
  const now = Date.now()
  const today = dayKey(now)
  let s = { ...state, concepts: { ...state.concepts } }
  const info = { level: ex.level, score, hintsUsed: meta.hintsUsed, solutionShown: meta.solutionShown, timeMs: meta.timeMs }
  const wasWeak = ex.concepts.some((c) => (s.concepts[c]?.attempts ?? 0) >= 2 && effectiveMastery(s.concepts[c], now) < 0.5)
  for (const c of ex.concepts) s.concepts[c] = updateConcept(s.concepts[c], info, now)
  const correct = score >= 0.999 && !meta.solutionShown
  s.totals = { attempts: s.totals.attempts + 1, correct: s.totals.correct + (correct ? 1 : 0), timeMs: s.totals.timeMs + Math.min(meta.timeMs, 30 * 60 * 1000) }
  const run = correct && meta.hintsUsed === 0 ? s.records.noHintRun + 1 : 0
  s.records = { ...s.records, noHintRun: run, bestNoHintRun: Math.max(s.records.bestNoHintRun, run) }
  const xp = meta.source === 'examen' ? 0 : xpForAttempt(ex.level, score, meta.hintsUsed, meta.solutionShown)
  if (xp) s = addXp(s, xp, today)
  if (correct) s = touchStreak(s, today)
  // registro de errores (repaso espaciado)
  const key = `${ex.templateId}#${ex.seed}@${ex.level}`
  if (!correct && meta.source !== 'repaso') {
    const entry = { id: key, templateId: ex.templateId, seed: ex.seed, level: ex.level, concept: ex.concepts[0] ?? ex.unit, errorTag: meta.errorTag, message: meta.message ?? '', created: now, due: today, box: 0 }
    s.errors = [...s.errors.filter((e) => e.id !== key), entry].slice(-300)
  }
  const events: MissionEvent[] = ['attempt']
  if (correct) {
    events.push('correct')
    if (meta.hintsUsed === 0) events.push('noHint')
    if (ex.level >= 3) events.push('highLevel')
    if (wasWeak) events.push('weak')
  }
  s = bumpMissions(s, events, today)
  commit(s)
  return { xp }
}

/** Resultado de un repaso: sube de caja si acertó, vuelve a la caja 0 si falló. */
export function recordReview(errorId: string, correct: boolean): void {
  const today = dayKey()
  let s = { ...state }
  const e = s.errors.find((x) => x.id === errorId)
  if (!e) return
  if (correct) {
    const box = e.box + 1
    if (box >= REVIEW_INTERVALS.length - 1) {
      s.errors = s.errors.filter((x) => x.id !== errorId)
      s.resolvedErrors++
      toast({ kind: 'info', title: 'Error superado', text: 'Ya lo resolviste varias veces en días distintos: sale del repaso.', icon: '✅' })
    } else s.errors = s.errors.map((x) => (x.id === errorId ? { ...x, box, due: addDays(today, REVIEW_INTERVALS[box]) } : x))
  } else s.errors = s.errors.map((x) => (x.id === errorId ? { ...x, box: 0, due: addDays(today, 1) } : x))
  s = bumpMissions(s, ['review'], today)
  commit(s)
}

export function markStage(unitId: string, stage: string): void {
  const cur = state.stages[unitId] ?? []
  if (cur.includes(stage)) return
  let s = { ...state, stages: { ...state.stages, [unitId]: [...cur, stage] } }
  s = bumpMissions(s, ['lesson'], dayKey())
  commit(s)
}

export function markConceptsSeen(concepts: string[]): void {
  if (concepts.every((c) => state.concepts[c]?.seen)) return
  const s = { ...state, concepts: { ...state.concepts } }
  for (const c of concepts) s.concepts[c] = { ...(s.concepts[c] ?? { attempts: 0, correct: 0, incorrect: 0, hints: 0, solutions: 0, timeMs: 0, last: 0, levelMax: 0, mastery: 0 }), seen: true }
  commit(s)
}

export function recordGame(gameId: string, result: { score?: number; xp?: number; duel?: boolean; puzzle?: number }): void {
  const today = dayKey()
  let s = { ...state, records: { ...state.records, gamesPlayed: { ...state.records.gamesPlayed, [gameId]: (state.records.gamesPlayed[gameId] ?? 0) + 1 } } }
  if (result.duel && result.score !== undefined) s.records.duelBest = Math.max(s.records.duelBest, result.score)
  if (result.puzzle !== undefined) s.records.puzzleBest = Math.max(s.records.puzzleBest, result.puzzle)
  if (result.xp) s = addXp(s, result.xp, today)
  const ev: MissionEvent[] = ['game']
  if (result.duel) ev.push('duel')
  s = bumpMissions(s, ev, today)
  commit(s)
}

export function recordDaily(day: string, score: number, total: number): void {
  if (state.dailyChallenges[day]) return
  const today = dayKey()
  let s = { ...state, dailyChallenges: { ...state.dailyChallenges, [day]: { score, total } } }
  s = addXp(s, 15 * score, today)
  s = bumpMissions(s, ['daily'], today)
  commit(s)
}

export function recordExam(e: ExamRecord): void {
  commit({ ...state, exams: [...state.exams, e].slice(-100) })
}

export function unlockUnit(unitId: string): void {
  if (state.unlocked.includes(unitId)) return
  toast({ kind: 'info', title: 'Unidad desbloqueada', text: 'Demostraste que tenés la base necesaria.', icon: '🔓' })
  commit({ ...state, unlocked: [...state.unlocked, unitId] })
}

export function updateSettings(p: Partial<Settings>): void {
  commit({ ...state, settings: { ...state.settings, ...p } })
}

/** Asegura que las misiones del día existan (al abrir la app). */
export function refreshDay(): void {
  const today = dayKey()
  if (state.daily.date !== today) commit(ensureDaily(state, today))
}

export function exportProgress(): string {
  return serializeExport(state)
}

export function importProgress(text: string): { ok: boolean; error?: string } {
  const r = parseImport(text)
  if (!r.ok) return { ok: false, error: r.error }
  state = r.state
  persist()
  emit()
  return { ok: true }
}

export function resetProgress(): void {
  const settings = state.settings
  state = { ...defaultState(), settings }
  persist()
  emit()
}

/** Solo para pruebas: reemplaza el estado en memoria. */
export function __setState(s: State): void {
  state = s
  emit()
}
