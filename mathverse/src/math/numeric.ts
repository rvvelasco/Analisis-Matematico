/** Utilidades numéricas: integración, derivada numérica, raíces, aleatoriedad reproducible. */

/** Generador pseudoaleatorio reproducible (mulberry32). */
export function rng(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Hash de texto a semilla entera (para desafíos diarios, etc.). */
export function hashSeed(s: string): number {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

export interface Rand {
  next: () => number
  int: (a: number, b: number) => number
  pick: <T>(arr: readonly T[]) => T
  nonZero: (a: number, b: number) => number
  shuffle: <T>(arr: readonly T[]) => T[]
  chance: (p: number) => boolean
}

export function makeRand(seed: number): Rand {
  const next = rng(seed)
  const int = (a: number, b: number) => a + Math.floor(next() * (b - a + 1))
  return {
    next,
    int,
    pick: (arr) => arr[Math.floor(next() * arr.length)],
    nonZero: (a, b) => {
      let v = 0
      while (v === 0) v = int(a, b)
      return v
    },
    shuffle: (arr) => {
      const out = arr.slice()
      for (let i = out.length - 1; i > 0; i--) {
        const j = Math.floor(next() * (i + 1))
        ;[out[i], out[j]] = [out[j], out[i]]
      }
      return out
    },
    chance: (p) => next() < p,
  }
}

/** Simpson compuesto (n par). Ignora puntos no finitos tomando el promedio de vecinos. */
export function simpson(f: (x: number) => number, a: number, b: number, n = 2000): number {
  if (a === b) return 0
  if (n % 2) n++
  const h = (b - a) / n
  let s = 0
  for (let i = 0; i <= n; i++) {
    const x = a + i * h
    let y = f(x)
    if (!isFinite(y)) {
      const y1 = f(x - h * 1e-3), y2 = f(x + h * 1e-3)
      y = isFinite(y1) && isFinite(y2) ? (y1 + y2) / 2 : isFinite(y1) ? y1 : isFinite(y2) ? y2 : 0
    }
    s += y * (i === 0 || i === n ? 1 : i % 2 ? 4 : 2)
  }
  return (s * h) / 3
}

export type RiemannMode = 'izq' | 'der' | 'medio' | 'trapecio'

export function riemannSum(f: (x: number) => number, a: number, b: number, n: number, mode: RiemannMode): number {
  const dx = (b - a) / n
  let s = 0
  for (let i = 0; i < n; i++) {
    const x0 = a + i * dx, x1 = x0 + dx
    if (mode === 'trapecio') s += ((f(x0) + f(x1)) / 2) * dx
    else s += f(mode === 'izq' ? x0 : mode === 'der' ? x1 : (x0 + x1) / 2) * dx
  }
  return s
}

/** Derivada numérica centrada. */
export function numDeriv(f: (x: number) => number, x: number, h = 1e-5): number {
  return (f(x + h) - f(x - h)) / (2 * h)
}

/** Raíces aproximadas de f en [a,b] por cambio de signo + bisección. */
export function findRoots(f: (x: number) => number, a: number, b: number, steps = 800): number[] {
  const roots: number[] = []
  let x0 = a, y0 = f(a)
  for (let i = 1; i <= steps; i++) {
    const x1 = a + ((b - a) * i) / steps
    const y1 = f(x1)
    if (isFinite(y0) && isFinite(y1)) {
      if (y0 === 0) roots.push(x0)
      else if (y0 * y1 < 0 && Math.abs(y1 - y0) < 1e3) {
        let lo = x0, hi = x1, flo = y0
        for (let k = 0; k < 60; k++) {
          const m = (lo + hi) / 2, fm = f(m)
          if (flo * fm <= 0) hi = m
          else { lo = m; flo = fm }
        }
        roots.push((lo + hi) / 2)
      }
    }
    x0 = x1
    y0 = y1
  }
  return roots.filter((r, i) => i === 0 || Math.abs(r - roots[i - 1]) > 1e-6)
}

export function round(v: number, d = 4): number {
  const p = Math.pow(10, d)
  return Math.round(v * p) / p
}

/** Formatea con coma decimal (estilo rioplatense). */
export function fmt(v: number, d = 4): string {
  if (!isFinite(v)) return v > 0 ? '∞' : v < 0 ? '−∞' : 'indef.'
  const r = round(v, d)
  return (Object.is(r, -0) ? 0 : r).toString().replace('.', ',').replace('-', '−')
}

export function clamp(v: number, a: number, b: number): number {
  return Math.max(a, Math.min(b, v))
}

export function gcd(a: number, b: number): number {
  a = Math.abs(a); b = Math.abs(b)
  while (b) [a, b] = [b, a % b]
  return a || 1
}
