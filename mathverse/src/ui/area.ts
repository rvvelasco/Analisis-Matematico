import type { AreaId } from '../engine/types'

/** Clases de Tailwind por área (escritas completas para que el compilador las detecte). */
export const AREA_CLS: Record<AreaId, { text: string; bg: string; border: string; soft: string; color: string }> = {
  funciones: { text: 'text-afun', bg: 'bg-afun', border: 'border-afun/50', soft: 'bg-afun/15', color: 'afun' },
  matrices: { text: 'text-amat', bg: 'bg-amat', border: 'border-amat/50', soft: 'bg-amat/15', color: 'amat' },
  vectores: { text: 'text-avec', bg: 'bg-avec', border: 'border-avec/50', soft: 'bg-avec/15', color: 'avec' },
  derivadas: { text: 'text-ader', bg: 'bg-ader', border: 'border-ader/50', soft: 'bg-ader/15', color: 'ader' },
  integrales: { text: 'text-aint', bg: 'bg-aint', border: 'border-aint/50', soft: 'bg-aint/15', color: 'aint' },
}

export const STATUS_TEXT = {
  bloqueada: 'Bloqueada',
  disponible: 'Disponible',
  vista: 'En curso',
  practicada: 'Practicada',
  dominada: 'Dominada',
} as const

export const CONCEPT_STATUS_TEXT = { nuevo: 'Nuevo', visto: 'Visto', practicado: 'Practicado', dominado: 'Dominado' } as const
