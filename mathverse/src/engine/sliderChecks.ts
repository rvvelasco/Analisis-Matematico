/** Criterios de los desafíos con controles deslizantes (serializables por id). */
import { compile, parse, substitute, num, type Node } from '../math/expr'

export type SliderCheck = (values: number[], args: number[]) => { ok: boolean; msg: string }

/** Construye f(x) reemplazando a, b, c, d por los valores de los controles. */
export function withParams(base: string, values: number[]): (x: number) => number {
  let n: Node = parse(base, { vars: ['x', 'a', 'b', 'c', 'd'] })
  ;['a', 'b', 'c', 'd'].forEach((p, i) => {
    if (values[i] !== undefined) n = substitute(n, p, num(values[i]))
  })
  return compile(n, 'x')
}

const close = (a: number, b: number, t = 1e-6) => Math.abs(a - b) <= t

export const SLIDER_CHECKS: Record<string, SliderCheck> = {
  /** y = a x + b con pendiente args[0] y ordenada args[1] */
  line: (v, [m, b]) => {
    const ok = close(v[0], m) && close(v[1], b)
    if (ok) return { ok, msg: '¡Exacto! La pendiente y la ordenada al origen coinciden.' }
    if (!close(v[0], m)) return { ok, msg: `La inclinación no es la pedida: tu pendiente es ${v[0]}. Mirá cuánto sube la recta por cada paso de 1.` }
    return { ok, msg: `La pendiente está bien, pero la recta corta al eje y en ${v[1]}, no en ${b}.` }
  },
  /** y = a (x − b)² + c con vértice (args[0], args[1]) que pasa por (args[2], args[3]) */
  vertex: (v, [h, k, px, py]) => {
    const f = (x: number) => v[0] * (x - v[1]) ** 2 + v[2]
    const vOk = close(v[1], h) && close(v[2], k)
    const pOk = close(f(px), py, 1e-6)
    if (vOk && pOk) return { ok: true, msg: '¡Perfecto! Vértice y punto coinciden.' }
    if (!vOk) return { ok: false, msg: `El vértice de tu parábola es (${v[1]}, ${v[2]}). En la forma a(x − h)² + k, el vértice es (h, k).` }
    return { ok: false, msg: `El vértice está bien, pero en x = ${px} tu parábola vale ${f(px)}, no ${py}. Ajustá la apertura a.` }
  },
}
