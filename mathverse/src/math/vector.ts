/** Vectores en R^n (números reales). */
export type Vec = number[]

export const vadd = (a: Vec, b: Vec): Vec => a.map((v, i) => v + b[i])
export const vsub = (a: Vec, b: Vec): Vec => a.map((v, i) => v - b[i])
export const vscale = (k: number, a: Vec): Vec => a.map((v) => k * v)
export const dot = (a: Vec, b: Vec): number => a.reduce((s, v, i) => s + v * b[i], 0)
export const norm = (a: Vec): number => Math.sqrt(dot(a, a))

/** Ángulo entre vectores en grados (null si alguno es nulo). */
export function angleDeg(a: Vec, b: Vec): number | null {
  const na = norm(a), nb = norm(b)
  if (na === 0 || nb === 0) return null
  const c = Math.max(-1, Math.min(1, dot(a, b) / (na * nb)))
  return (Math.acos(c) * 180) / Math.PI
}

/** Proyección vectorial de a sobre b. */
export function proj(a: Vec, b: Vec): Vec | null {
  const bb = dot(b, b)
  if (bb === 0) return null
  return vscale(dot(a, b) / bb, b)
}

export function cross(a: Vec, b: Vec): Vec {
  return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]
}

/** Determinante 2×2 de dos vectores del plano (área orientada del paralelogramo). */
export const det2 = (a: Vec, b: Vec): number => a[0] * b[1] - a[1] * b[0]

/** Dirección (ángulo con el eje x positivo) en grados, en [0, 360). */
export function directionDeg(a: Vec): number {
  const d = (Math.atan2(a[1], a[0]) * 180) / Math.PI
  return d < 0 ? d + 360 : d
}

export function vecTeX(a: Vec): string {
  return '(' + a.map((v) => (Number.isInteger(v) ? String(v) : String(Math.round(v * 1000) / 1000).replace('.', '{,}'))).join(',\\ ') + ')'
}
