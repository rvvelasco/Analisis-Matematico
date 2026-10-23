export { makeRand } from '../math/numeric'

/** Semilla aleatoria (para iniciar partidas). */
export function newSeedSafe(): number {
  return Math.floor(Math.random() * 1e9) + 1
}
