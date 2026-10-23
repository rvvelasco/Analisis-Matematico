import type { GameId } from '../content/types'

export const GAMES: { id: GameId; name: string; icon: string; desc: string; skills: string }[] = [
  { id: 'lab', name: 'Laboratorio de funciones', icon: '🧪', desc: 'Ajustá los parámetros hasta que tu función coincida con la curva objetivo.', skills: 'Funciones · transformaciones' },
  { id: 'cazador', name: 'Cazador de errores', icon: '🕵️', desc: 'Resoluciones con trampa: decidí si están bien y encontrá dónde falla el razonamiento.', skills: 'Todas las áreas' },
  { id: 'duelo', name: 'Duelo contra reloj', icon: '⚔️', desc: '90 segundos para responder la mayor cantidad posible. Cada racha multiplica puntos.', skills: 'Cálculo rápido' },
  { id: 'puzzle', name: 'Puzzle algebraico', icon: '🧩', desc: 'Ordená los pasos de una resolución hasta que el razonamiento cierre.', skills: 'Procedimientos' },
  { id: 'constructor', name: 'Constructor de integrales', icon: '🏗️', desc: 'Estimá áreas con rectángulos de Riemann y descubrí el área con signo.', skills: 'Integrales' },
  { id: 'fabrica', name: 'Fábrica de derivadas', icon: '🏭', desc: 'Identificá qué regla corresponde y armá la derivada pieza por pieza.', skills: 'Derivadas' },
  { id: 'arquitecto', name: 'Arquitecto de matrices', icon: '📐', desc: 'Construí la matriz que transforma la figura en la figura objetivo.', skills: 'Matrices · transformaciones' },
  { id: 'arena', name: 'Arena de parciales', icon: '🏟️', desc: 'Simulacros configurables con tiempo, nivel y resultados detallados por tema.', skills: 'Examen' },
  { id: 'diario', name: 'Desafío diario', icon: '📆', desc: 'Cinco ejercicios nuevos por día, iguales para todos. ¿Lo completás perfecto?', skills: 'Todas las áreas' },
  { id: 'sandbox', name: 'Sandbox', icon: '🪐', desc: 'Espacio libre: graficá, derivá, integrá, resolvé sistemas y operá con matrices y vectores.', skills: 'Exploración libre' },
]
