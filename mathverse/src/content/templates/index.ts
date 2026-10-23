import type { Template } from '../../engine/types'
import { FUNCIONES } from './funciones'
import { DERIVADAS } from './derivadas'
import { INTEGRALES } from './integrales'
import { MATRICES } from './matrices'
import { VECTORES } from './vectores'

/** Banco completo, en el orden pedagógico de las áreas. */
export const ALL_TEMPLATES: Template[] = [...FUNCIONES, ...MATRICES, ...VECTORES, ...DERIVADAS, ...INTEGRALES]
