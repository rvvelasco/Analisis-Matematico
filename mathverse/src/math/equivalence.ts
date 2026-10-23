/**
 * Equivalencia matemática entre expresiones por muestreo numérico.
 * Nunca compara texto: evalúa ambas expresiones en muchos puntos del dominio.
 * Devuelve 'unknown' cuando no hay suficientes puntos válidos para decidir con seguridad.
 */
import { compile, parse, ParseError, stripIntegralDecorations, type Node } from './expr'
import { makeRand } from './numeric'

export type EquivMode = 'exact' | 'upToConstant'
export type EquivStatus = 'equal' | 'different' | 'unknown'

export interface EquivOptions {
  mode?: EquivMode
  v?: string
  /** intervalo donde muestrear (debe estar dentro del dominio de la respuesta esperada) */
  domain?: [number, number]
  samples?: number
}

export interface EquivResult {
  status: EquivStatus
  /** punto donde difieren (si status = different) */
  at?: number
  got?: number
  expected?: number
  validPoints: number
}

function relClose(a: number, b: number, tol = 1e-7): boolean {
  return Math.abs(a - b) <= tol * Math.max(1, Math.abs(a), Math.abs(b))
}

export function compareFunctions(
  user: (x: number) => number,
  expected: (x: number) => number,
  opts: EquivOptions = {},
): EquivResult {
  const mode = opts.mode ?? 'exact'
  const [lo, hi] = opts.domain ?? [-3, 3]
  const n = opts.samples ?? 24
  const r = makeRand(12345)
  const xs: number[] = []
  for (let i = 0; i < n; i++) xs.push(lo + (hi - lo) * (0.03 + 0.94 * r.next()))
  // también algunos puntos "redondos" (excepto donde puedan anularse denominadores)
  const pts: Array<{ x: number; u: number; e: number }> = []
  for (const x of xs) {
    const u = user(x), e = expected(x)
    if (isFinite(u) && isFinite(e) && Math.abs(e) < 1e12 && Math.abs(u) < 1e12) pts.push({ x, u, e })
  }
  if (pts.length < 6) return { status: 'unknown', validPoints: pts.length }
  if (mode === 'exact') {
    for (const p of pts) if (!relClose(p.u, p.e)) return { status: 'different', at: p.x, got: p.u, expected: p.e, validPoints: pts.length }
    return { status: 'equal', validPoints: pts.length }
  }
  const d0 = pts[0].u - pts[0].e
  const scale = Math.max(1, ...pts.map((p) => Math.abs(p.e)))
  for (const p of pts) {
    if (Math.abs(p.u - p.e - d0) > 1e-7 * scale) return { status: 'different', at: p.x, got: p.u, expected: p.e, validPoints: pts.length }
  }
  return { status: 'equal', validPoints: pts.length }
}

export interface CheckExprResult {
  status: EquivStatus | 'syntax'
  message?: string
  node?: Node
  hadC?: boolean
  detail?: EquivResult
}

/** Compara una respuesta escrita por el estudiante con una expresión esperada (texto). */
export function checkExpression(userText: string, expectedText: string, opts: EquivOptions = {}): CheckExprResult {
  const v = opts.v ?? 'x'
  let text = userText
  let hadC = false
  if (opts.mode === 'upToConstant') {
    const s = stripIntegralDecorations(userText)
    text = s.text
    hadC = s.hadC
  }
  let node: Node
  try {
    node = parse(text, { vars: [v], ignoreConstants: opts.mode === 'upToConstant' ? ['c', 'k'] : [] })
  } catch (e) {
    return { status: 'syntax', message: e instanceof ParseError ? e.message : 'No pude leer la expresión.' }
  }
  const exp = parse(expectedText, { vars: [v] })
  const detail = compareFunctions(compile(node, v), compile(exp, v), opts)
  return { status: detail.status, node, hadC, detail }
}

/** ¿El texto del usuario es equivalente a alguno de los candidatos? Devuelve el índice o -1. */
export function matchAny(userNode: Node, candidates: string[], opts: EquivOptions = {}): number {
  const v = opts.v ?? 'x'
  const uf = compile(userNode, v)
  for (let i = 0; i < candidates.length; i++) {
    try {
      const c = parse(candidates[i], { vars: [v] })
      if (compareFunctions(uf, compile(c, v), opts).status === 'equal') return i
    } catch {
      /* candidato inválido: se ignora */
    }
  }
  return -1
}

/** Evalúa una respuesta numérica escrita como expresión (3/4, sqrt(2), 2pi, -1,5). */
export function parseNumber(text: string): number | null {
  try {
    const n = parse(text, { vars: [] })
    const val = compile(n, 'x')(0)
    return isFinite(val) ? val : null
  } catch {
    return null
  }
}

export function numbersClose(a: number, b: number, tol: number | { abs?: number; rel?: number } = 1e-6): boolean {
  if (typeof tol === 'number') return Math.abs(a - b) <= tol * Math.max(1, Math.abs(b))
  if (tol.abs !== undefined && Math.abs(a - b) <= tol.abs) return true
  if (tol.rel !== undefined && Math.abs(a - b) <= tol.rel * Math.max(1, Math.abs(b))) return true
  return false
}
