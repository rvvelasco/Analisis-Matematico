/** Modelo de los videos explicativos: pasos con narración y cosas que aparecen en el pizarrón. */
import type { Mood } from '../ui/Mascot'

export interface PlotSpec {
  x: [number, number]
  y: [number, number]
  fns?: { f: string; color?: string; label?: string; dash?: boolean; domain?: [number, number] }[]
  /** rectángulos de Riemann */
  rects?: { f: string; a: number; b: number; n: number; color?: string; mode?: 'left' | 'mid' | 'right' }
  shade?: { f: string; a: number; b: number; color?: string }[]
  pts?: { x: number; y: number; color?: string; label?: string; open?: boolean }[]
  segs?: { x1: number; y1: number; x2: number; y2: number; color?: string; dash?: boolean; label?: string }[]
  vlines?: { x: number; label?: string; color?: string }[]
  /** tramos de una recta numérica (intervalos) */
  bands?: { a: number; b: number; color?: string; openA?: boolean; openB?: boolean }[]
  /** marcas propias del eje x (por ejemplo, múltiplos de π) */
  ticks?: { x: number; label: string }[]
  /** sin eje y (recta numérica) */
  line?: boolean
  h?: number
}

export type El =
  | { k: 'h'; text: string; id?: string }
  | { k: 'tex'; tex: string; id?: string; small?: boolean }
  | { k: 'md'; text: string; id?: string }
  | { k: 'box'; text: string; tone: 'tip' | 'ok' | 'bad' | 'key'; id?: string }
  | { k: 'plot'; id: string; spec: PlotSpec }
  | { k: 'clear' }
  | { k: 'update'; id: string; spec: Partial<PlotSpec> }
  | { k: 'remove'; id: string }

export interface Step {
  /** lo que dice el narrador (texto para leer en voz alta y para el subtítulo) */
  say: string
  add?: El[]
  /** elementos a resaltar durante este paso */
  mark?: string[]
  mood?: Mood
}

export interface Video {
  id: string
  /** ejercicio del modelo de parcial al que corresponde */
  ej: number[]
  emoji: string
  title: string
  short: string
  steps: Step[]
}

/** Colores de tiza. */
export const CH = { white: '#f4f1e8', yellow: '#ffd84d', pink: '#ff7eb6', cyan: '#5fd3ff', green: '#9be15d', orange: '#ffa64d', red: '#ff6b6b', violet: '#c9a0ff' }
/** TeX coloreado. */
export const c = (color: keyof typeof CH, tex: string) => `\\textcolor{${CH[color]}}{${tex}}`
