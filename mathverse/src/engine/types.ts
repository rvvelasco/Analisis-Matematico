/** Modelo de datos del motor de ejercicios. */

export type AreaId = 'funciones' | 'matrices' | 'vectores' | 'derivadas' | 'integrales'
export type Level = 1 | 2 | 3 | 4 | 5 | 6

export const LEVEL_INFO: Record<Level, { name: string; short: string; desc: string }> = {
  1: { name: 'Explorador', short: 'N1', desc: 'Conceptos fundamentales, reconocimiento e interpretación visual.' },
  2: { name: 'Aprendiz', short: 'N2', desc: 'Aplicar fórmulas y reglas en problemas de uno o dos pasos.' },
  3: { name: 'Analista', short: 'N3', desc: 'Varios pasos, combinar conceptos y elegir el método.' },
  4: { name: 'Experto', short: 'N4', desc: 'Problemas no rutinarios, justificar, distractores con errores habituales.' },
  5: { name: 'Parcial', short: 'N5', desc: 'Exigencia de parcial universitario: desarrollo completo y tiempo limitado.' },
  6: { name: 'Final', short: 'N6', desc: 'Problemas integradores, trampas conceptuales legítimas y teoría.' },
}

export interface SolutionStep {
  /** texto con $tex$ inline y **negritas** */
  text: string
  /** fórmula destacada (TeX) */
  tex?: string
}

/** Gráfico que acompaña al enunciado (se renderiza interactivo: zoom y desplazamiento). */
export interface PlotSpec {
  fns?: { expr: string; color?: string; label?: string; dashed?: boolean; domain?: [number, number] }[]
  points?: { x: number; y: number; label?: string; open?: boolean; color?: string }[]
  vectors?: { from?: [number, number]; to: [number, number]; label?: string; color?: string }[]
  shade?: { expr: string; a: number; b: number; under?: string }[]
  x?: [number, number]
  y?: [number, number]
  vlines?: { x: number; label?: string }[]
}

interface Base {
  id: string
  templateId: string
  seed: number
  area: AreaId
  unit: string
  /** subtema legible */
  subtopic: string
  /** conceptos que evalúa (para el seguimiento de dominio) */
  concepts: string[]
  level: Level
  /** por qué este ejercicio pertenece a este nivel */
  levelWhy: string
  /** enunciado: texto con $tex$ inline, $$tex$$ en bloque y **negrita** */
  prompt: string
  plot?: PlotSpec
  /** pistas progresivas: de sutil a concreta */
  hints: string[]
  solution: SolutionStep[]
  /** explicación conceptual de por qué funciona el procedimiento */
  explanation: string
  /** errores frecuentes que este ejercicio entrena */
  commonErrors: string[]
  prereqs: string[]
  estMinutes: number
  /** si el ejercicio está pensado para hacerse sin calculadora */
  noCalc?: boolean
}

export interface MCOption {
  text: string
  correct?: boolean
  /** explicación de por qué esta opción es incorrecta (o correcta) */
  why?: string
  errorTag?: string
}

export interface WrongExpr {
  expr: string
  why: string
  errorTag?: string
}

export type Blank = { blank: true; id: string; answer: string; mode: 'number' | 'expression'; v?: string; domain?: [number, number]; size?: number }
export type FillPart = string | Blank

export type ExerciseBody =
  | { kind: 'mc'; options: MCOption[] }
  | { kind: 'tf'; statement: string; answer: boolean; reasons: MCOption[] }
  | { kind: 'numeric'; answer: number; tol?: { abs?: number; rel?: number }; unit?: string; wrong?: { value: number; why: string; errorTag?: string }[]; answerText?: string }
  | {
      kind: 'expression'
      answer: string
      v: string
      mode: 'exact' | 'upToConstant'
      domain: [number, number]
      wrong?: WrongExpr[]
      /** para diagnósticos genéricos: de qué función sale la respuesta */
      source?: { f: string; op: 'derivative' | 'integral' }
      prefix?: string
    }
  | { kind: 'fill'; parts: FillPart[] }
  | { kind: 'order'; items: string[]; intro?: string }
  | { kind: 'match'; pairs: { left: string; right: string }[] }
  | { kind: 'matrix'; rows: number; cols: number; answer: string[][]; prefix?: string }
  | { kind: 'errorStep'; steps: string[]; wrongIndex: number; ruleOptions: MCOption[]; fix?: { answer: string; v: string; domain: [number, number]; mode: 'exact' | 'upToConstant' } }
  | { kind: 'multi'; parts: (ExerciseBody & { label: string; prompt: string; points: number })[] }
  | { kind: 'slider'; params: { name: string; min: number; max: number; step: number; init: number }[]; base: string; target: string; checkId: string; checkArgs: number[] }

export type Exercise = Base & ExerciseBody
export type ExerciseKind = ExerciseBody['kind']

export type Verdict = 'correct' | 'incorrect' | 'partial' | 'unknown' | 'invalid'

export interface Feedback {
  verdict: Verdict
  /** mensaje principal (diagnóstico del error o confirmación) */
  message: string
  errorTag?: string
  /** puntaje entre 0 y 1 (para parciales y ejercicios con partes) */
  score: number
  /** detalle por parte o por casillero */
  parts?: { label: string; verdict: Verdict; message: string }[]
}

/** Lo que el estudiante respondió (depende del tipo). */
export type Answer =
  | { kind: 'mc'; index: number }
  | { kind: 'tf'; value: boolean; reason: number }
  | { kind: 'numeric'; text: string }
  | { kind: 'expression'; text: string }
  | { kind: 'fill'; values: Record<string, string> }
  | { kind: 'order'; order: number[] }
  | { kind: 'match'; map: number[] }
  | { kind: 'matrix'; cells: string[][] }
  | { kind: 'errorStep'; step: number; rule: number; fix?: string }
  | { kind: 'multi'; parts: Answer[] }
  | { kind: 'slider'; values: number[] }

/** Omit que respeta las uniones discriminadas. */
export type DistOmit<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never
export type ExerciseDraft = DistOmit<Exercise, 'id' | 'templateId' | 'seed' | 'area' | 'unit'>

/** Plantilla generadora de ejercicios con parámetros controlados. */
export interface Template {
  id: string
  area: AreaId
  unit: string
  title: string
  levels: Level[]
  /** genera un ejercicio (sin id/seed, los agrega el registro) */
  gen: (r: import('../math/numeric').Rand, level: Level) => ExerciseDraft
  /** verificación independiente: devuelve un mensaje si el ejercicio generado es inconsistente */
  verify?: (ex: Exercise) => string | null
}
