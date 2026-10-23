/** Tipos del currículo: áreas, unidades y lecciones. */
import type { AreaId, SolutionStep } from '../engine/types'

export type GameId = 'lab' | 'cazador' | 'duelo' | 'puzzle' | 'constructor' | 'fabrica' | 'arquitecto' | 'arena' | 'diario' | 'sandbox'

export interface SliderParam { name: string; min: number; max: number; step: number; init: number; label?: string }

/** Visualizaciones interactivas disponibles en las lecciones y el laboratorio. */
export type WidgetSpec =
  | { type: 'family'; expr: string; params: SliderParam[]; x?: [number, number]; y?: [number, number]; ghost?: string; note?: string }
  | { type: 'tangent'; f: string; x0: number; x?: [number, number]; y?: [number, number] }
  | { type: 'secant'; f: string; x0: number; x?: [number, number]; y?: [number, number] }
  | { type: 'limit'; f: string; a: number; x?: [number, number]; y?: [number, number] }
  | { type: 'derivGraph'; f: string; x?: [number, number]; y?: [number, number] }
  | { type: 'riemann'; f: string; a: number; b: number; y?: [number, number] }
  | { type: 'area'; f: string; a: number; b: number; x?: [number, number]; y?: [number, number] }
  | { type: 'accumulation'; f: string; x?: [number, number]; y?: [number, number] }
  | { type: 'inverseFn'; f: string; finv: string; x?: [number, number] }
  | { type: 'vectors' }
  | { type: 'dot' }
  | { type: 'span' }
  | { type: 'matrixTransform' }
  | { type: 'matrixProduct' }
  | { type: 'systemLines' }
  | { type: 'gauss' }

export interface Lesson {
  /** Descubrí: una pregunta para despertar la curiosidad */
  hook: { question: string; reveal: string }
  /** Entendé: explicación intuitiva, en criollo */
  intuition: string[]
  /** Visualizá */
  visual: { widget: WidgetSpec; caption: string; tasks: string[] }
  /** Teoría formal */
  theory: { title: string; text: string; formulas?: string[] }[]
  /** Ejemplo resuelto paso a paso */
  example: { prompt: string; steps: SolutionStep[] }
  /** Repasá */
  summary: string[]
  pitfalls: string[]
  /** juego recomendado para la unidad */
  game: GameId
}

export interface Unit {
  id: string
  area: AreaId
  n: number
  title: string
  short: string
  /** unidades que conviene dominar antes */
  prereqs: string[]
  concepts: string[]
  lesson: Lesson
}

export interface AreaInfo {
  id: AreaId
  name: string
  tagline: string
  description: string
  /** color de Tailwind (clase de texto/fondo) */
  color: 'afun' | 'amat' | 'avec' | 'ader' | 'aint'
  icon: string
  prereqAreas: AreaId[]
}
