/** Currículo: áreas, unidades (con prerrequisitos) y nombres de conceptos. */
import type { AreaId } from '../engine/types'
import type { AreaInfo, Unit } from './types'
import { FUNCIONES_UNITS } from './lessons/funciones'
import { MATRICES_UNITS } from './lessons/matrices'
import { VECTORES_UNITS } from './lessons/vectores'
import { DERIVADAS_UNITS } from './lessons/derivadas'
import { INTEGRALES_UNITS } from './lessons/integrales'

/** Orden pedagógico: Funciones → Matrices → Vectores → Derivadas → Integrales. */
export const AREAS: AreaInfo[] = [
  { id: 'funciones', name: 'Funciones', tagline: 'El lenguaje de todo lo que cambia', description: 'Dominio, gráficos, rectas, parábolas, exponenciales, trigonométricas, transformaciones, límites y continuidad.', color: 'afun', icon: 'ƒ', prereqAreas: [] },
  { id: 'matrices', name: 'Matrices', tagline: 'Tablas que transforman el espacio', description: 'Operaciones, producto, determinantes, inversa, sistemas de ecuaciones y transformaciones lineales.', color: 'amat', icon: '▦', prereqAreas: [] },
  { id: 'vectores', name: 'Vectores', tagline: 'Flechas con dirección y sentido', description: 'Módulo, operaciones, producto escalar y vectorial, proyecciones, dependencia lineal y bases.', color: 'avec', icon: '→', prereqAreas: ['matrices'] },
  { id: 'derivadas', name: 'Derivadas', tagline: 'La matemática de la velocidad', description: 'Tasa de cambio, definición, reglas, cadena, tangentes, extremos, concavidad, optimización y L\'Hôpital.', color: 'ader', icon: '∂', prereqAreas: ['funciones'] },
  { id: 'integrales', name: 'Integrales', tagline: 'Acumular y medir áreas', description: 'Acumulación, Riemann, primitivas, sustitución, partes, Barrow, áreas y aplicaciones.', color: 'aint', icon: '∫', prereqAreas: ['derivadas'] },
]

export const UNITS: Unit[] = [...FUNCIONES_UNITS, ...MATRICES_UNITS, ...VECTORES_UNITS, ...DERIVADAS_UNITS, ...INTEGRALES_UNITS]

const unitMap = new Map(UNITS.map((u) => [u.id, u]))
export const unitById = (id: string): Unit | undefined => unitMap.get(id)
export const unitsOfArea = (a: AreaId): Unit[] => UNITS.filter((u) => u.area === a)
export const areaById = (a: AreaId): AreaInfo => AREAS.find((x) => x.id === a)!

export const CONCEPT_NAMES: Record<string, string> = {
  'f1.concepto': 'Concepto de función', 'f1.evaluar': 'Evaluar funciones', 'f1.dominio': 'Dominio', 'f1.imagen': 'Imagen',
  'f2.lectura': 'Lectura de gráficos', 'f2.ceros': 'Ceros y ordenada', 'f2.crecimiento': 'Crecimiento en gráficos',
  'f3.pendiente': 'Pendiente', 'f3.ecuacion': 'Ecuación de la recta',
  'f4.vertice': 'Vértice', 'f4.raices': 'Raíces de la cuadrática',
  'f5.polinomios': 'Polinomios', 'f5.asintotas': 'Asíntotas',
  'f6.log': 'Logaritmos', 'f6.ecuaciones': 'Ecuaciones exponenciales',
  'f7.valores': 'Valores trigonométricos', 'f7.graficos': 'Gráficos trigonométricos',
  'f8.transformaciones': 'Transformaciones de funciones',
  'f9.composicion': 'Composición', 'f9.inversa': 'Función inversa',
  'f10.limites': 'Límites', 'f10.continuidad': 'Continuidad',
  'm1.concepto': 'Concepto de matriz', 'm1.igualdad': 'Igualdad de matrices',
  'm2.suma': 'Suma y escalar', 'm2.traspuesta': 'Traspuesta',
  'm3.producto': 'Producto de matrices',
  'm4.determinante': 'Determinantes', 'm4.propiedades': 'Propiedades del determinante',
  'm5.inversa': 'Matriz inversa',
  'm6.sistemas': 'Sistemas de ecuaciones', 'm6.gauss': 'Método de Gauss', 'm6.clasificacion': 'Clasificación (Rouché)',
  'm7.transformaciones': 'Transformaciones lineales',
  'v1.concepto': 'Concepto de vector', 'v1.modulo': 'Módulo y versor',
  'v2.operaciones': 'Operaciones con vectores',
  'v3.escalar': 'Producto escalar', 'v3.angulo': 'Ángulo entre vectores',
  'v4.proyeccion': 'Proyecciones', 'v4.vectorial': 'Producto vectorial',
  'v5.combinacion': 'Combinación lineal', 'v5.dependencia': 'Dependencia lineal',
  'v6.base': 'Bases y dimensión',
  'd1.tasa': 'Tasa de cambio', 'd1.tangente': 'Secante y tangente',
  'd2.definicion': 'Definición de derivada', 'd2.derivable': 'Derivabilidad',
  'd3.potencia': 'Regla de la potencia', 'd4.tabla': 'Tabla de derivadas',
  'd5.producto': 'Regla del producto', 'd5.cociente': 'Regla del cociente', 'd6.cadena': 'Regla de la cadena',
  'd7.implicita': 'Derivación implícita', 'd7.orden': 'Derivadas sucesivas',
  'd8.tangente': 'Recta tangente', 'd8.fisica': 'Velocidad y aceleración',
  'd9.crecimiento': 'Crecimiento', 'd9.extremos': 'Máximos y mínimos', 'd10.concavidad': 'Concavidad e inflexión',
  'd11.optimizacion': 'Optimización', 'd11.lhopital': "Regla de L'Hôpital",
  'i1.acumulacion': 'Acumulación', 'i1.area': 'Área con signo', 'i2.riemann': 'Sumas de Riemann',
  'i3.primitiva': 'Primitivas', 'i3.constante': 'Constante de integración',
  'i4.potencia': 'Integral de potencias', 'i4.tabla': 'Integrales inmediatas',
  'i5.sustitucion': 'Sustitución', 'i6.partes': 'Integración por partes',
  'i7.barrow': 'Regla de Barrow', 'i7.propiedades': 'Propiedades de la integral', 'i7.tfc': 'Teorema fundamental',
  'i8.area': 'Área bajo la curva', 'i8.entre': 'Área entre curvas', 'i9.aplicaciones': 'Aplicaciones de la integral',
}

export const conceptName = (id: string): string => CONCEPT_NAMES[id] ?? id
/** Unidad a la que pertenece un concepto (por su prefijo). */
export const conceptUnit = (id: string): string => id.split('.')[0]
