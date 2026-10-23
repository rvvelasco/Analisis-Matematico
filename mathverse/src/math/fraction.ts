/** Fracciones exactas (para matrices y sistemas sin errores de redondeo). */
import { gcd } from './numeric'

export interface Frac {
  n: number
  d: number
}

export function frac(n: number, d = 1): Frac {
  if (d === 0) throw new Error('Denominador cero')
  if (!Number.isInteger(n) || !Number.isInteger(d)) {
    // aproximar decimales a fracción (para entradas como 0.5)
    const den = 1_000_000
    return frac(Math.round((n / d) * den), den)
  }
  if (d < 0) { n = -n; d = -d }
  const g = gcd(n, d)
  return { n: n / g, d: d / g }
}

export const F0 = frac(0)
export const F1 = frac(1)
export const fadd = (a: Frac, b: Frac) => frac(a.n * b.d + b.n * a.d, a.d * b.d)
export const fsub = (a: Frac, b: Frac) => frac(a.n * b.d - b.n * a.d, a.d * b.d)
export const fmul = (a: Frac, b: Frac) => frac(a.n * b.n, a.d * b.d)
export const fdiv = (a: Frac, b: Frac) => {
  if (b.n === 0) throw new Error('División por cero')
  return frac(a.n * b.d, a.d * b.n)
}
export const fneg = (a: Frac) => frac(-a.n, a.d)
export const fisZero = (a: Frac) => a.n === 0
export const feq = (a: Frac, b: Frac) => a.n === b.n && a.d === b.d
export const fval = (a: Frac) => a.n / a.d

export function fstr(a: Frac): string {
  return a.d === 1 ? String(a.n) : `${a.n}/${a.d}`
}
export function ftex(a: Frac): string {
  if (a.d === 1) return String(a.n)
  return `${a.n < 0 ? '-' : ''}\\frac{${Math.abs(a.n)}}{${a.d}}`
}

/** Lee "3", "-2/5", "0,5", "1.25" → Frac (o null). */
export function parseFrac(text: string): Frac | null {
  const s = text.trim().replace(/[−–]/g, '-').replace(',', '.')
  if (!s) return null
  const m = /^(-?\d+(?:\.\d+)?)\s*(?:\/\s*(-?\d+(?:\.\d+)?))?$/.exec(s)
  if (!m) return null
  const a = parseFloat(m[1])
  const b = m[2] !== undefined ? parseFloat(m[2]) : 1
  if (b === 0 || !isFinite(a) || !isFinite(b)) return null
  return frac(a, b)
}
