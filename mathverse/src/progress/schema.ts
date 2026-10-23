/** Esquema versionado del progreso del usuario y validación al cargar/importar. */
import type { AreaId, Level } from '../engine/types'

export const STORAGE_KEY = 'mathverse:v1'
export const SCHEMA_VERSION = 1

export interface ConceptStats {
  attempts: number
  correct: number
  incorrect: number
  hints: number
  solutions: number
  timeMs: number
  /** última práctica (ms epoch) */
  last: number
  /** nivel más alto resuelto correctamente */
  levelMax: number
  /** dominio estimado, de 0 a 1 */
  mastery: number
  /** lo vio en una lección */
  seen: boolean
}

export interface ErrorEntry {
  id: string
  templateId: string
  seed: number
  level: Level
  concept: string
  errorTag?: string
  message: string
  created: number
  /** fecha (YYYY-MM-DD) en la que toca repasar */
  due: string
  /** caja de Leitner (0 = recién fallado) */
  box: number
}

export interface ExamRecord {
  date: number
  title: string
  areas: AreaId[]
  level: Level
  total: number
  score: number
  timeMs: number
  byConcept: Record<string, { ok: number; total: number }>
}

export interface Settings {
  theme: 'dark' | 'light'
  reducedMotion: boolean
  fontScale: number
  showTimer: boolean
  name: string
}

export interface State {
  version: number
  created: number
  settings: Settings
  concepts: Record<string, ConceptStats>
  /** etapas visitadas por unidad */
  stages: Record<string, string[]>
  /** unidades desbloqueadas por prueba de nivel */
  unlocked: string[]
  xp: number
  /** XP ganada por día (YYYY-MM-DD) */
  xpByDay: Record<string, number>
  streak: { current: number; best: number; lastDay: string }
  daily: { date: string; missions: { id: string; progress: number }[]; claimed: string[] }
  dailyChallenges: Record<string, { score: number; total: number }>
  achievements: Record<string, number>
  errors: ErrorEntry[]
  resolvedErrors: number
  records: { duelBest: number; puzzleBest: number; noHintRun: number; bestNoHintRun: number; gamesPlayed: Record<string, number> }
  exams: ExamRecord[]
  totals: { attempts: number; correct: number; timeMs: number }
}

export function defaultSettings(): Settings {
  const prefersLight = typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: light)').matches
  const reduced = typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  return { theme: prefersLight ? 'light' : 'dark', reducedMotion: reduced, fontScale: 1, showTimer: true, name: '' }
}

export function defaultState(now = Date.now()): State {
  return {
    version: SCHEMA_VERSION,
    created: now,
    settings: defaultSettings(),
    concepts: {},
    stages: {},
    unlocked: [],
    xp: 0,
    xpByDay: {},
    streak: { current: 0, best: 0, lastDay: '' },
    daily: { date: '', missions: [], claimed: [] },
    dailyChallenges: {},
    achievements: {},
    errors: [],
    resolvedErrors: 0,
    records: { duelBest: 0, puzzleBest: 0, noHintRun: 0, bestNoHintRun: 0, gamesPlayed: {} },
    exams: [],
    totals: { attempts: 0, correct: 0, timeMs: 0 },
  }
}

export function emptyConcept(): ConceptStats {
  return { attempts: 0, correct: 0, incorrect: 0, hints: 0, solutions: 0, timeMs: 0, last: 0, levelMax: 0, mastery: 0, seen: false }
}

/* ---------- validación ---------- */
const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v)
const num = (v: unknown, d = 0, min = -Infinity, max = Infinity): number => (typeof v === 'number' && isFinite(v) ? Math.min(max, Math.max(min, v)) : d)
const str = (v: unknown, d = ''): string => (typeof v === 'string' ? v.slice(0, 500) : d)
const bool = (v: unknown, d = false): boolean => (typeof v === 'boolean' ? v : d)
const DAY = /^\d{4}-\d{2}-\d{2}$/
const AREA_IDS: AreaId[] = ['funciones', 'matrices', 'vectores', 'derivadas', 'integrales']

function numRecord(v: unknown, keyOk: (k: string) => boolean = () => true): Record<string, number> {
  const out: Record<string, number> = {}
  if (isObj(v)) for (const [k, x] of Object.entries(v)) if (keyOk(k) && typeof x === 'number' && isFinite(x)) out[k] = x
  return out
}

/**
 * Convierte cualquier cosa (lo guardado o un archivo importado) en un estado válido.
 * Descarta los campos inválidos en vez de fallar, y nunca inventa progreso.
 */
export function sanitize(raw: unknown): State {
  const d = defaultState()
  if (!isObj(raw)) return d
  const s: State = { ...d }
  s.created = num(raw.created, d.created, 0)
  const st = isObj(raw.settings) ? raw.settings : {}
  s.settings = {
    theme: st.theme === 'light' || st.theme === 'dark' ? st.theme : d.settings.theme,
    reducedMotion: bool(st.reducedMotion, d.settings.reducedMotion),
    fontScale: num(st.fontScale, 1, 0.85, 1.4),
    showTimer: bool(st.showTimer, true),
    name: str(st.name).slice(0, 40),
  }
  if (isObj(raw.concepts)) {
    for (const [k, v] of Object.entries(raw.concepts)) {
      if (!isObj(v) || !/^[a-z]\d+\.[A-Za-z]+$/.test(k)) continue
      s.concepts[k] = {
        attempts: num(v.attempts, 0, 0), correct: num(v.correct, 0, 0), incorrect: num(v.incorrect, 0, 0), hints: num(v.hints, 0, 0), solutions: num(v.solutions, 0, 0),
        timeMs: num(v.timeMs, 0, 0), last: num(v.last, 0, 0), levelMax: num(v.levelMax, 0, 0, 6), mastery: num(v.mastery, 0, 0, 1), seen: bool(v.seen),
      }
    }
  }
  if (isObj(raw.stages)) for (const [k, v] of Object.entries(raw.stages)) if (Array.isArray(v)) s.stages[k] = v.filter((x): x is string => typeof x === 'string').slice(0, 20)
  s.unlocked = Array.isArray(raw.unlocked) ? raw.unlocked.filter((x): x is string => typeof x === 'string').slice(0, 100) : []
  s.xp = num(raw.xp, 0, 0)
  s.xpByDay = numRecord(raw.xpByDay, (k) => DAY.test(k))
  const sk = isObj(raw.streak) ? raw.streak : {}
  s.streak = { current: num(sk.current, 0, 0), best: num(sk.best, 0, 0), lastDay: DAY.test(str(sk.lastDay)) ? str(sk.lastDay) : '' }
  const dl = isObj(raw.daily) ? raw.daily : {}
  s.daily = {
    date: DAY.test(str(dl.date)) ? str(dl.date) : '',
    missions: Array.isArray(dl.missions) ? dl.missions.filter(isObj).map((m) => ({ id: str(m.id), progress: num(m.progress, 0, 0) })).filter((m) => m.id) : [],
    claimed: Array.isArray(dl.claimed) ? dl.claimed.filter((x): x is string => typeof x === 'string') : [],
  }
  if (isObj(raw.dailyChallenges)) for (const [k, v] of Object.entries(raw.dailyChallenges)) if (DAY.test(k) && isObj(v)) s.dailyChallenges[k] = { score: num(v.score, 0, 0), total: num(v.total, 0, 0) }
  s.achievements = numRecord(raw.achievements)
  s.errors = Array.isArray(raw.errors)
    ? raw.errors.filter(isObj).map((e) => ({
        id: str(e.id), templateId: str(e.templateId), seed: num(e.seed), level: num(e.level, 1, 1, 6) as Level, concept: str(e.concept), errorTag: typeof e.errorTag === 'string' ? e.errorTag : undefined,
        message: str(e.message), created: num(e.created, 0, 0), due: DAY.test(str(e.due)) ? str(e.due) : '', box: num(e.box, 0, 0, 10),
      })).filter((e) => e.id && e.templateId).slice(-300)
    : []
  s.resolvedErrors = num(raw.resolvedErrors, 0, 0)
  const rc = isObj(raw.records) ? raw.records : {}
  s.records = { duelBest: num(rc.duelBest, 0, 0), puzzleBest: num(rc.puzzleBest, 0, 0), noHintRun: num(rc.noHintRun, 0, 0), bestNoHintRun: num(rc.bestNoHintRun, 0, 0), gamesPlayed: numRecord(rc.gamesPlayed) }
  s.exams = Array.isArray(raw.exams)
    ? raw.exams.filter(isObj).map((e) => ({
        date: num(e.date, 0, 0), title: str(e.title), areas: Array.isArray(e.areas) ? (e.areas.filter((a) => AREA_IDS.includes(a as AreaId)) as AreaId[]) : [], level: num(e.level, 1, 1, 6) as Level,
        total: num(e.total, 0, 0), score: num(e.score, 0, 0), timeMs: num(e.timeMs, 0, 0),
        byConcept: isObj(e.byConcept) ? Object.fromEntries(Object.entries(e.byConcept).filter(([, v]) => isObj(v)).map(([k, v]) => [k, { ok: num((v as Record<string, unknown>).ok, 0, 0), total: num((v as Record<string, unknown>).total, 0, 0) }])) : {},
      })).slice(-100)
    : []
  const tt = isObj(raw.totals) ? raw.totals : {}
  s.totals = { attempts: num(tt.attempts, 0, 0), correct: num(tt.correct, 0, 0), timeMs: num(tt.timeMs, 0, 0) }
  return s
}

/** Valida un archivo importado: devuelve el estado o un mensaje de error claro. */
export function parseImport(text: string): { ok: true; state: State } | { ok: false; error: string } {
  let raw: unknown
  try {
    raw = JSON.parse(text)
  } catch {
    return { ok: false, error: 'El archivo no es un JSON válido.' }
  }
  if (!isObj(raw) || raw.app !== 'mathverse' || !isObj(raw.data)) return { ok: false, error: 'Este archivo no parece una exportación de MathVerse.' }
  if (typeof raw.version === 'number' && raw.version > SCHEMA_VERSION) return { ok: false, error: 'El archivo es de una versión más nueva de MathVerse.' }
  return { ok: true, state: sanitize(raw.data) }
}

export function serializeExport(s: State): string {
  return JSON.stringify({ app: 'mathverse', version: SCHEMA_VERSION, exported: new Date().toISOString(), data: s }, null, 2)
}
