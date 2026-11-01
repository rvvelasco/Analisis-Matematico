/** Camino de aprendizaje: cada unidad se recorre en "paradas" (nodos) en orden. */
import type { State } from '../progress/schema'
import type { Unit } from './types'
import { unitStatus } from '../progress/mastery'

export type NodeId = 'aprender' | 'practica' | 'desafio' | 'juego' | 'examen' | 'repaso'

export interface PathNode {
  id: NodeId
  icon: string
  title: string
  desc: string
  /** etapa que se marca al completarla */
  stage: string
}

export const NODES: PathNode[] = [
  { id: 'aprender', icon: '📖', title: 'La idea', desc: 'Una explicación cortita, con dibujos y un ejemplo resuelto.', stage: 'ejemplo' },
  { id: 'practica', icon: '✏️', title: 'Practicá', desc: '6 ejercicios que se adaptan a cómo te va.', stage: 'practica' },
  { id: 'desafio', icon: '🧠', title: 'Desafío', desc: 'Preguntas con trampa: pensá antes de responder.', stage: 'intuicion' },
  { id: 'juego', icon: '🎮', title: 'A jugar', desc: 'Un juego para usar lo que aprendiste.', stage: 'juga' },
  { id: 'examen', icon: '🏆', title: 'Prueba final', desc: '4 ejercicios difíciles y sin pistas. ¡Demostrá lo que sabés!', stage: 'demostra' },
  { id: 'repaso', icon: '🎁', title: 'Repaso', desc: 'Lo más importante y tus errores de esta unidad.', stage: 'repasa' },
]

export const nodeById = (id: string): PathNode | undefined => NODES.find((n) => n.id === id)

export function nodeDone(s: State, unitId: string, n: PathNode): boolean {
  return (s.stages[unitId] ?? []).includes(n.stage)
}

export type NodeState = 'done' | 'current' | 'open' | 'locked'

/** Estado de cada parada de una unidad: se habilitan en orden. */
export function nodeStates(s: State, u: Unit): NodeState[] {
  if (unitStatus(s, u) === 'bloqueada') return NODES.map(() => 'locked')
  let currentGiven = false
  return NODES.map((n, i) => {
    if (nodeDone(s, u.id, n)) return 'done'
    const prevOk = i === 0 || nodeDone(s, u.id, NODES[i - 1])
    if (!prevOk) return 'locked'
    if (!currentGiven) { currentGiven = true; return 'current' }
    return 'open'
  })
}

export function unitProgress(s: State, u: Unit): number {
  return NODES.filter((n) => nodeDone(s, u.id, n)).length / NODES.length
}
