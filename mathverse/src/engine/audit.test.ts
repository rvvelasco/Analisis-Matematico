/**
 * Auditoría matemática independiente del banco de ejercicios.
 *
 * Las respuestas se recalculan con métodos DISTINTOS a los del motor:
 *  - derivadas: diferencias centrales (no la derivada simbólica),
 *  - integrales y áreas: regla de Simpson propia con muchos puntos,
 *  - determinantes: desarrollo de Laplace recursivo (el motor usa eliminación),
 *  - sistemas: sustitución de la solución y eliminación en punto flotante,
 *  - extremos y optimización: búsqueda exhaustiva en una grilla fina,
 *  - límites: evaluación cerca del punto por ambos lados.
 * Del motor solo se usa el lector de fórmulas (parse/compile) para evaluar expresiones.
 */
import { describe, expect, it } from 'vitest'
import { ALL_TEMPLATES, instantiate } from './registry'
import type { Exercise, ExerciseBody } from './types'
import { compile, parse, evaluate } from '../math/expr'
import { parseFrac } from '../math/fraction'
import { parseNumber } from '../math/equivalence'

const SEEDS = Array.from({ length: 25 }, (_, i) => i + 101)
const fx = (e: string, v = 'x') => compile(parse(e, { vars: [v] }), v)

function dnum(f: (x: number) => number, x: number): number {
  const h = 1e-4 * Math.max(1, Math.abs(x))
  return (f(x - 2 * h) - 8 * f(x - h) + 8 * f(x + h) - f(x + 2 * h)) / (12 * h)
}
function simpson(f: (x: number) => number, a: number, b: number, n = 6000): number {
  if (a === b) return 0
  const h = (b - a) / n
  let s = f(a) + f(b)
  for (let i = 1; i < n; i++) s += (i % 2 ? 4 : 2) * f(a + i * h)
  return (s * h) / 3
}
function laplace(M: number[][]): number {
  if (M.length === 1) return M[0][0]
  if (M.length === 2) return M[0][0] * M[1][1] - M[0][1] * M[1][0]
  return M[0].reduce((acc, v, j) => acc + (j % 2 ? -1 : 1) * v * laplace(M.slice(1).map((row) => row.filter((_, k) => k !== j))), 0)
}
function rankFloat(M: number[][]): number {
  const a = M.map((r) => r.slice())
  let rank = 0
  for (let c = 0; c < a[0].length && rank < a.length; c++) {
    let p = rank
    for (let i = rank; i < a.length; i++) if (Math.abs(a[i][c]) > Math.abs(a[p][c])) p = i
    if (Math.abs(a[p][c]) < 1e-9) continue
    ;[a[p], a[rank]] = [a[rank], a[p]]
    for (let i = 0; i < a.length; i++) if (i !== rank) { const k = a[i][c] / a[rank][c]; for (let j = c; j < a[0].length; j++) a[i][j] -= k * a[rank][j] }
    rank++
  }
  return rank
}
const matMul = (A: number[][], B: number[][]) => A.map((r) => B[0].map((_, j) => r.reduce((s, v, k) => s + v * B[k][j], 0)))
const cells = (m: string[][]) => m.map((r) => r.map((c) => { const f = parseFrac(c)!; return f.n / f.d }))
const close = (a: number, b: number, tol = 1e-6) => Math.abs(a - b) <= tol * Math.max(1, Math.abs(b))
/** extremo por búsqueda en grilla fina */
function gridExt(f: (x: number) => number, a: number, b: number, kind: 'max' | 'min'): { x: number; y: number } {
  let best = { x: a, y: f(a) }
  const N = 20000
  for (let i = 0; i <= N; i++) { const x = a + ((b - a) * i) / N, y = f(x); if (isFinite(y) && (kind === 'max' ? y > best.y : y < best.y)) best = { x, y } }
  return best
}
function fillValues(ex: Extract<ExerciseBody, { kind: 'fill' }>): number[] {
  return ex.parts.filter((p) => typeof p !== 'string').map((p) => parseNumber((p as { answer: string }).answer) ?? NaN)
}
function numAns(ex: ExerciseBody): number {
  if (ex.kind === 'numeric') return ex.answer
  throw new Error('no numérico')
}

/** Comprobación independiente según el tipo de dato. Devuelve un mensaje si algo no cierra. */
function check(ex: Exercise): string | null {
  const d = ex.data as Record<string, any> | undefined // eslint-disable-line @typescript-eslint/no-explicit-any
  // 1) toda derivada o primitiva se verifica numéricamente
  const bodies: ExerciseBody[] = ex.kind === 'multi' ? ex.parts : [ex]
  for (const b of bodies) {
    if (b.kind === 'expression' && b.source) {
      const f = fx(b.source.f, b.v), F = fx(b.answer, b.v)
      for (let i = 1; i <= 9; i++) {
        const x = b.domain[0] + ((b.domain[1] - b.domain[0]) * i) / 10
        const lhs = b.source.op === 'derivative' ? dnum(f, x) : dnum(F, x)
        const rhs = b.source.op === 'derivative' ? F(x) : f(x)
        if (isFinite(lhs) && isFinite(rhs) && !close(lhs, rhs, 1e-5)) return `${b.source.op} no cierra en x=${x}: ${lhs} vs ${rhs}`
      }
    }
  }
  if (!d) return null
  switch (d.kind) {
    case 'det': return close(numAns(ex), laplace(d.M)) ? null : `det ${laplace(d.M)} ≠ ${numAns(ex)}`
    case 'singularK': { const k = numAns(ex); const M = d.M.map((r: number[]) => r.slice()); M[1][1] = k; return Math.abs(laplace(M)) < 1e-9 ? null : `con k=${k} det=${laplace(M)}` }
    case 'inverse': { if (ex.kind !== 'matrix') return 'tipo'; const P = matMul(d.A, cells(ex.answer)); return P.every((r, i) => r.every((v, j) => close(v, i === j ? 1 : 0))) ? null : 'A·A⁻¹ ≠ I' }
    case 'matEq': { if (ex.kind !== 'matrix') return 'tipo'; const X = cells(ex.answer); const P = d.left ? matMul(d.A, X) : matMul(X, d.A); return P.every((r, i) => r.every((v, j) => close(v, d.B[i][j]))) ? null : 'X no resuelve la ecuación' }
    case 'system': { if (ex.kind !== 'fill') return 'tipo'; const x = fillValues(ex); return d.A.every((row: number[], i: number) => close(row.reduce((s, v, j) => s + v * x[j], 0), d.b[i])) ? null : 'la solución no verifica' }
    case 'classify': {
      if (ex.kind !== 'mc') return 'tipo'
      const rA = rankFloat(d.A), rAb = rankFloat(d.A.map((r: number[], i: number) => [...r, d.b[i]]))
      const kind = rA !== rAb ? 'Incompatible' : rA === 3 ? 'Compatible determinado' : 'Compatible indeterminado'
      return ex.options.find((o) => o.correct)!.text.startsWith(kind) ? null : `clasificación esperada ${kind}`
    }
    case 'paramSystem': {
      if (ex.kind !== 'multi') return 'tipo'
      const A = (k: number) => [[1, 1, 1], [1, 2, d.a], [1, 3, k]]
      if (Math.abs(laplace(A(numAns(ex.parts[0])))) > 1e-9) return 'k0 no anula el determinante'
      // z por Cramer con k1
      const M = A(d.k1), Mz = M.map((r, i) => [r[0], r[1], d.b[i]])
      return close(numAns(ex.parts[2]), laplace(Mz) / laplace(M)) ? null : 'z (Cramer) no coincide'
    }
    case 'areaFactor': return close(numAns(ex), Math.abs(laplace(d.M)) * d.side * d.side) ? null : 'área'
    case 'norm': return close(numAns(ex), Math.hypot(...d.v)) ? null : 'módulo'
    case 'angle': { const dt = d.u.reduce((s: number, v: number, i: number) => s + v * d.v[i], 0); const deg = (Math.acos(dt / (Math.hypot(...d.u) * Math.hypot(...d.v))) * 180) / Math.PI; return Math.abs(numAns(ex) - deg) < 1e-6 ? null : 'ángulo' }
    case 'scalarProj': return close(numAns(ex), (d.a[0] * d.b[0] + d.a[1] * d.b[1]) / Math.hypot(...d.b)) ? null : 'proyección'
    case 'vectorProj': { if (ex.kind !== 'fill') return 'tipo'; const k = (d.a[0] * d.b[0] + d.a[1] * d.b[1]) / (d.b[0] ** 2 + d.b[1] ** 2); const got = fillValues(ex); return close(got[0], k * d.b[0]) && close(got[1], k * d.b[1]) ? null : 'proyección vectorial' }
    case 'triangleArea': { const [a, b, c] = d.u, [e, f, g] = d.v; const cr = [b * g - c * f, c * e - a * g, a * f - b * e]; return close(numAns(ex), Math.hypot(...cr) / 2) ? null : 'área del triángulo' }
    case 'combination': { if (ex.kind !== 'fill') return 'tipo'; const [al, be] = fillValues(ex); return close(al * d.u[0] + be * d.v[0], d.w[0]) && close(al * d.u[1] + be * d.v[1], d.w[1]) ? null : 'combinación lineal' }
    case 'riemann': {
      const f = fx(d.f), h = (d.b - d.a) / d.n
      let S = 0
      for (let i = 0; i < d.n; i++) {
        const l = d.a + i * h
        S += d.mode === 'izq' ? f(l) * h : d.mode === 'der' ? f(l + h) * h : d.mode === 'medio' ? f(l + h / 2) * h : ((f(l) + f(l + h)) / 2) * h
      }
      return close(numAns(ex), S) ? null : `Riemann ${S}`
    }
    case 'integral': return close(numAns(ex), simpson(fx(d.f), d.a, d.b), 1e-6) ? null : `integral ${simpson(fx(d.f), d.a, d.b)}`
    case 'absArea': { const f = fx(d.f); const A = simpson((x) => Math.abs(f(x)), d.a, d.b, 60000); return close(numAns(ex), A, 1e-5) ? null : `área ${A}` }
    case 'between': { const f = fx(d.f), g = fx(d.g); const A = simpson((x) => Math.abs(f(x) - g(x)), d.a, d.b, 60000); return close(numAns(ex), A, 1e-5) ? null : `área entre curvas ${A}` }
    case 'mean': return close(numAns(ex), simpson(fx(d.f), d.a, d.b) / (d.b - d.a)) ? null : 'valor medio'
    case 'volume': { const f = fx(d.f); return close(numAns(ex), Math.PI * simpson((x) => f(x) ** 2, d.a, d.b), 1e-6) ? null : 'volumen' }
    case 'tfc': {
      // G(x) = ∫_0^{u(x)} g(t) dt calculada con Simpson y derivada numéricamente
      const g = fx(d.g, 't'), u = d.upper === 'x' ? (x: number) => x : (x: number) => x * x
      const G = (x: number) => simpson(g, 0, u(x), 4000)
      return close(numAns(ex), dnum(G, d.x), 1e-4) ? null : `TFC ${dnum(G, d.x)}`
    }
    case 'tvm': { const f = fx(d.f); return close(numAns(ex), (f(d.b) - f(d.a)) / (d.b - d.a)) ? null : 'TVM' }
    case 'derivAt': return close(numAns(ex), dnum(fx(d.f), d.x), 1e-6) ? null : 'derivada en el punto'
    case 'implicit': {
      const F = (x: number, y: number) => evaluate(parse(d.F, { vars: ['x', 'y'] }), { x, y })
      const h = 1e-5, Fx = (F(d.p + h, d.q) - F(d.p - h, d.q)) / (2 * h), Fy = (F(d.p, d.q + h) - F(d.p, d.q - h)) / (2 * h)
      if (Math.abs(F(d.p, d.q)) > 1e-6) return 'el punto no está en la curva'
      return close(numAns(ex), -Fx / Fy, 1e-5) ? null : `pendiente implícita ${-Fx / Fy}`
    }
    case 'tangentLine': case 'normalLine': {
      if (ex.kind !== 'expression') return 'tipo'
      const f = fx(d.f), m0 = dnum(f, d.x), m = d.kind === 'normalLine' ? -1 / m0 : m0
      const L = fx(ex.answer)
      return [d.x - 1, d.x, d.x + 2].every((x) => close(L(x), f(d.x) + m * (x - d.x), 1e-6)) ? null : 'recta'
    }
    case 'localMax': {
      const f = fx(d.f)
      // máximo relativo: punto donde f' pasa de + a −
      for (let i = 0; i < 4000; i++) {
        const x = d.a + ((d.b - d.a) * i) / 4000, x2 = x + (d.b - d.a) / 4000
        if (dnum(f, x) > 0 && dnum(f, x2) <= 0) { const xm = (x + x2) / 2; return close(numAns(ex), f(xm), 1e-4) ? null : `máximo relativo ${f(xm)}` }
      }
      return 'no se encontró máximo'
    }
    case 'absExtrema': { if (ex.kind !== 'fill') return 'tipo'; const f = fx(d.f); const [mx, mn] = fillValues(ex); return close(mx, gridExt(f, d.a, d.b, 'max').y, 1e-6) && close(mn, gridExt(f, d.a, d.b, 'min').y, 1e-6) ? null : 'extremos absolutos' }
    case 'inflection': {
      const f = fx(d.f), f2 = (x: number) => dnum((t) => dnum(f, t), x), x0 = numAns(ex)
      return Math.sign(f2(x0 - 0.3)) !== Math.sign(f2(x0 + 0.3)) && Math.abs(f2(x0)) < 1e-3 ? null : 'no hay cambio de concavidad'
    }
    case 'maximize': { const best = gridExt(fx(d.obj), d.a, d.b, 'max'); return d.ask === 'value' ? (close(numAns(ex), best.y, 1e-5) ? null : `máximo ${best.y}`) : (Math.abs(numAns(ex) - best.x) < 1e-3 ? null : `argmax ${best.x}`) }
    case 'limit': {
      const f = fx(d.e), L = numAns(ex)
      const ok = [1e-3, 1e-4].every((h) => close(f(d.at + h), L, 2e-2) && close(f(d.at - h), L, 2e-2))
      return ok ? null : `límite ≈ ${f(d.at + 1e-4)}`
    }
    case 'inverseFn': { if (ex.kind !== 'expression') return 'tipo'; const f = fx(d.f), g = fx(ex.answer); return [0.3, 1.7, 2.9, 4.1].every((x) => !isFinite(f(g(x))) || close(f(g(x)), x, 1e-9)) ? null : 'f(f⁻¹(x)) ≠ x' }
    case 'homographic': {
      if (ex.kind !== 'multi') return 'tipo'
      const f = (x: number) => (d.a * x + d.b) / (x - d.c)
      if (!close(f(numAns(ex.parts[2])), 0, 1e-9) && Math.abs(f(numAns(ex.parts[2]))) > 1e-9) return 'el cero no anula f'
      if (!close(f(1e7), numAns(ex.parts[1]), 1e-5)) return 'asíntota horizontal'
      const inv = ex.parts[3]
      if (inv.kind !== 'expression') return 'tipo'
      const g = fx(inv.answer)
      return [d.a + 1, d.a + 2.5].every((x) => close(f(g(x)), x, 1e-9)) ? null : 'inversa'
    }
    case 'expShift': {
      if (ex.kind !== 'multi') return 'tipo'
      const f = (x: number) => 2 ** (x - d.a) + d.b
      if (Math.abs(f(numAns(ex.parts[1]))) > 1e-9) return 'cero'
      const inv = ex.parts[2]
      if (inv.kind !== 'expression') return 'tipo'
      const g = fx(inv.answer)
      return [d.b + 1, d.b + 3].every((x) => close(f(g(x)), x, 1e-9)) ? null : 'inversa'
    }
    case 'can': {
      if (ex.kind !== 'multi') return 'tipo'
      const area = (rho: number) => 2 * Math.PI * rho * rho + (2 * Math.PI * d.V) / rho // V real = V·π
      const best = gridExt(area, 0.1, 20, 'min')
      return Math.abs(numAns(ex.parts[0]) - best.x) < 2e-3 && close(numAns(ex.parts[2]), best.y, 1e-5) && close(numAns(ex.parts[1]), d.V / best.x ** 2, 1e-3) ? null : `lata: ρ=${best.x}`
    }
    case 'implicitFinal': {
      if (ex.kind !== 'multi') return 'tipo'
      const F = (x: number, y: number) => x * x + x * y + y * y - d.c
      const h = 1e-6, sl = -((F(d.p + h, d.q) - F(d.p - h, d.q)) / (F(d.p, d.q + h) - F(d.p, d.q - h)))
      if (!close(numAns(ex.parts[0]), sl, 1e-5)) return 'pendiente'
      const m = numAns(ex.parts[2])
      return Math.abs(F(m, -2 * m)) < 1e-9 ? null : 'punto con tangente horizontal no está en la curva'
    }
    case 'tfcParcial': {
      if (ex.kind !== 'multi') return 'tipo'
      const g = (t: number) => t * t - d.a * d.a
      return close(numAns(ex.parts[3]), simpson(g, 1, d.a)) && close(numAns(ex.parts[2]), gridExt((x) => simpson(g, 1, x, 200), 0, 2 * d.a, 'min').x, 1e-2) ? null : 'TFC parcial'
    }
    case 'paramArea': {
      if (ex.kind !== 'multi') return 'tipo'
      const k = numAns(ex.parts[2])
      return close(simpson((x) => k * x - x * x, 0, k), d.A) ? null : 'área con parámetro'
    }
  }
  return null
}

describe('verificación matemática independiente', () => {
  const withData = ALL_TEMPLATES.filter((t) => { const ex = instantiate(t.id, 1, t.levels[0]); return ex.data || ex.kind === 'expression' || ex.kind === 'multi' })
  it('hay suficientes plantillas auditadas', () => { expect(withData.length).toBeGreaterThan(50) })
  it('el auditor detecta respuestas alteradas (pruebas de mutación)', () => {
    let detected = 0, total = 0
    for (const t of withData) {
      const ex = instantiate(t.id, 7, t.levels[t.levels.length - 1])
      if (!ex.data && ex.kind !== 'expression') continue
      let bad: Exercise | null = null
      if (ex.kind === 'numeric') bad = { ...ex, answer: ex.answer + 1.5 }
      else if (ex.kind === 'expression' && ex.source) bad = { ...ex, answer: `(${ex.answer})*1.1 + x` }
      else if (ex.kind === 'matrix') bad = { ...ex, answer: ex.answer.map((r, i) => r.map((c, j) => (i === 0 && j === 0 ? String((parseFrac(c)!.n / parseFrac(c)!.d) + 1) : c))) }
      else if (ex.kind === 'fill') bad = { ...ex, parts: ex.parts.map((p, i) => (typeof p === 'string' || i > 2 ? p : { ...p, answer: String((parseNumber(p.answer) ?? 0) + 1) })) }
      else if (ex.kind === 'multi') bad = { ...ex, parts: ex.parts.map((p) => (p.kind === 'numeric' ? { ...p, answer: p.answer + 2 } : p)) }
      if (!bad) continue
      total++
      if (check(bad) !== null) detected++
    }
    expect(total).toBeGreaterThan(30)
    expect(detected / total).toBeGreaterThan(0.95)
  })
  for (const t of withData) {
    it(t.id, () => {
      for (const lv of t.levels) for (const seed of SEEDS) {
        const ex = instantiate(t.id, seed, lv)
        expect(check(ex), `${t.id} N${lv} semilla ${seed}`).toBeNull()
      }
    })
  }
})
