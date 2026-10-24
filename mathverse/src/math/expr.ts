/**
 * Motor de expresiones de MathVerse.
 * - parse(): convierte texto escrito por un estudiante en un árbol (AST).
 * - evaluate()/compile(): evalúa numéricamente.
 * - diff(): derivada simbólica.
 * - simplify(): simplificación algebraica básica (para mostrar resultados legibles).
 * - toTeX()/toText(): impresión.
 */

export type FnName =
  | 'sin' | 'cos' | 'tan' | 'ln' | 'log' | 'sqrt' | 'cbrt' | 'exp' | 'abs' | 'asin' | 'acos' | 'atan'

export type Node =
  | { k: 'num'; v: number }
  | { k: 'var'; n: string }
  | { k: 'const'; n: 'e' | 'pi' }
  | { k: 'neg'; a: Node }
  | { k: 'add'; l: Node; r: Node }
  | { k: 'sub'; l: Node; r: Node }
  | { k: 'mul'; l: Node; r: Node }
  | { k: 'div'; l: Node; r: Node }
  | { k: 'pow'; l: Node; r: Node }
  | { k: 'fn'; f: FnName; a: Node }

export class ParseError extends Error {
  pos: number
  constructor(msg: string, pos = -1) {
    super(msg)
    this.pos = pos
  }
}

/* ------------------------------------------------------------------ */
/* Constructores                                                       */
/* ------------------------------------------------------------------ */
export const num = (v: number): Node => ({ k: 'num', v })
export const vr = (n = 'x'): Node => ({ k: 'var', n })
export const add = (l: Node, r: Node): Node => ({ k: 'add', l, r })
export const sub = (l: Node, r: Node): Node => ({ k: 'sub', l, r })
export const mul = (l: Node, r: Node): Node => ({ k: 'mul', l, r })
export const div = (l: Node, r: Node): Node => ({ k: 'div', l, r })
export const pow = (l: Node, r: Node): Node => ({ k: 'pow', l, r })
export const neg = (a: Node): Node => ({ k: 'neg', a })
export const fn = (f: FnName, a: Node): Node => ({ k: 'fn', f, a })
export const E: Node = { k: 'const', n: 'e' }
export const PI: Node = { k: 'const', n: 'pi' }

/* ------------------------------------------------------------------ */
/* Tokenizador                                                          */
/* ------------------------------------------------------------------ */
type Tok =
  | { t: 'num'; v: number; p: number }
  | { t: 'id'; v: string; p: number }
  | { t: 'op'; v: string; p: number }

const SUP: Record<string, string> = {
  '⁰': '0', '¹': '1', '²': '2', '³': '3', '⁴': '4', '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9', '⁻': '-', '⁄': '/', 'ᐟ': '/',
}
const FUNC_WORDS: Record<string, FnName> = {
  arcsen: 'asin', arcsin: 'asin', asin: 'asin', arccos: 'acos', acos: 'acos', arctg: 'atan', arctan: 'atan', atan: 'atan',
  sqrt: 'sqrt', raiz: 'sqrt', cbrt: 'cbrt', sen: 'sin', sin: 'sin', cos: 'cos', tg: 'tan', tan: 'tan',
  exp: 'exp', abs: 'abs', ln: 'ln', log: 'log',
}
const WORD_LIST = Object.keys(FUNC_WORDS).concat(['pi']).sort((a, b) => b.length - a.length)

/** Normaliza la escritura informal (superíndices, ·, ×, coma decimal, "+ C", "f(x) =", "dx"). */
export function normalizeInput(src: string): string {
  let s = String(src).toLowerCase()
  s = s.replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹⁻⁄ᐟ]+/g, (m) => '^(' + m.split('').map((c) => SUP[c]).join('') + ')')
  s = s.replace(/[−–—]/g, '-').replace(/[·×∙⋅]/g, '*').replace(/÷/g, '/').replace(/π/g, 'pi').replace(/raíz/g, 'raiz')
  s = s.replace(/(\d),(\d)/g, '$1.$2')
  if (s.includes('=')) s = s.slice(s.lastIndexOf('=') + 1)
  return s.trim()
}

/** Quita "+ C" / "dx" del final de una respuesta de integral. Devuelve si tenía la constante. */
export function stripIntegralDecorations(src: string): { text: string; hadC: boolean } {
  let s = normalizeInput(src)
  s = s.replace(/\s*d[a-z]\s*$/, '')
  const hadC = /[+-]\s*[ck]\s*$/.test(s)
  s = s.replace(/[+-]\s*[ck]\s*$/, '')
  return { text: s.trim(), hadC }
}

function tokenize(s: string, vars: string[]): Tok[] {
  const out: Tok[] = []
  let i = 0
  while (i < s.length) {
    const c = s[i]
    if (/\s/.test(c)) { i++; continue }
    const m = /^(\d+\.?\d*|\.\d+)/.exec(s.slice(i))
    if (m) { out.push({ t: 'num', v: parseFloat(m[1]), p: i }); i += m[1].length; continue }
    if (/[a-zñ]/.test(c)) {
      const run = /^[a-zñ]+/.exec(s.slice(i))![0]
      let j = 0
      while (j < run.length) {
        // primero, nombres de variables de más de una letra (si las hay)
        const multi = vars.find((v) => v.length > 1 && run.startsWith(v, j))
        if (multi) { out.push({ t: 'id', v: multi, p: i + j }); j += multi.length; continue }
        const w = WORD_LIST.find((word) => run.startsWith(word, j))
        if (w) { out.push({ t: 'id', v: w, p: i + j }); j += w.length; continue }
        out.push({ t: 'id', v: run[j], p: i + j })
        j++
      }
      i += run.length
      continue
    }
    if ('+-*/^()|√∛'.includes(c)) { out.push({ t: 'op', v: c, p: i }); i++; continue }
    if (c === '[' || c === '{') { out.push({ t: 'op', v: '(', p: i }); i++; continue }
    if (c === ']' || c === '}') { out.push({ t: 'op', v: ')', p: i }); i++; continue }
    throw new ParseError(`No entiendo el símbolo "${c}".`, i)
  }
  return out
}

/* ------------------------------------------------------------------ */
/* Parser (descenso recursivo)                                          */
/* ------------------------------------------------------------------ */
export interface ParseOptions {
  /** letras permitidas como variables (por defecto ['x']) */
  vars?: string[]
  /** letras que se aceptan como constantes desconocidas (ej. C de integración) y valen 0 */
  ignoreConstants?: string[]
}

export function parse(src: string, opts: ParseOptions = {}): Node {
  const vars = opts.vars ?? ['x']
  const ignore = opts.ignoreConstants ?? []
  const text = normalizeInput(src)
  if (!text) throw new ParseError('Escribí una expresión.')
  const T = tokenize(text, vars)
  let p = 0
  let absDepth = 0

  const peek = () => T[p]
  const isOp = (v: string) => T[p]?.t === 'op' && T[p].v === v
  const expect = (v: string) => {
    if (!isOp(v)) throw new ParseError(v === ')' ? 'Falta cerrar un paréntesis.' : v === '|' ? 'Falta cerrar la barra del valor absoluto.' : `Falta "${v}".`, T[p]?.p ?? text.length)
    p++
  }
  const startsPrimary = (t: Tok | undefined): boolean => {
    if (!t) return false
    if (t.t === 'num' || t.t === 'id') return true
    if (t.t === 'op') return t.v === '(' || t.v === '√' || t.v === '∛' || (t.v === '|' && absDepth === 0)
    return false
  }

  function expr(): Node {
    let a = term()
    while (isOp('+') || isOp('-')) {
      const o = T[p++].v
      const b = term()
      a = o === '+' ? add(a, b) : sub(a, b)
    }
    return a
  }
  function term(): Node {
    let a = unary()
    for (;;) {
      if (isOp('*') || isOp('/')) {
        const o = T[p++].v
        const b = unary()
        a = o === '*' ? mul(a, b) : div(a, b)
      } else if (startsPrimary(peek())) {
        a = mul(a, power()) // multiplicación implícita: 2x, 3(x+1), x sen x
      } else break
    }
    return a
  }
  function unary(): Node {
    if (isOp('-')) { p++; return neg(unary()) }
    if (isOp('+')) { p++; return unary() }
    return power()
  }
  function power(): Node {
    const b = primary()
    if (isOp('^')) { p++; return pow(b, unary()) }
    return b
  }
  function primary(): Node {
    const t = peek()
    if (!t) throw new ParseError('La expresión quedó incompleta.', text.length)
    if (t.t === 'num') { p++; return num(t.v) }
    if (t.t === 'op') {
      if (t.v === '(') { p++; const a = expr(); expect(')'); return a }
      if (t.v === '|') { p++; absDepth++; const a = expr(); absDepth--; expect('|'); return fn('abs', a) }
      if (t.v === '√') { p++; return fn('sqrt', primaryWithPow()) }
      if (t.v === '∛') { p++; return fn('cbrt', primaryWithPow()) }
      throw new ParseError(`El signo "${t.v}" está fuera de lugar.`, t.p)
    }
    // identificador
    p++
    const id = t.v
    if (id === 'pi') return PI
    if (FUNC_WORDS[id]) {
      const f = FUNC_WORDS[id]
      // sen^2 x  →  (sen x)^2
      if (isOp('^')) {
        p++
        const ex = unary()
        const arg = isOp('(') ? primary() : power()
        return pow(fn(f, arg), ex)
      }
      const arg = isOp('(') ? primary() : power()
      return fn(f, arg)
    }
    if (vars.includes(id)) return vr(id)
    if (id === 'e') return E
    if (ignore.includes(id)) return num(0)
    throw new ParseError(`Apareció la letra "${id}", pero acá la variable es ${vars.map((v) => `"${v}"`).join(' o ')}.`, t.p)
  }
  function primaryWithPow(): Node {
    // √x³ se entiende como √(x³)
    const b = primary()
    if (isOp('^')) { p++; return pow(b, unary()) }
    return b
  }

  const result = expr()
  if (p < T.length) {
    const t = T[p]
    throw new ParseError(t.t === 'op' && t.v === ')' ? 'Sobra un paréntesis de cierre.' : `Sobra algo al final ("${t.t === 'num' ? t.v : t.v}"). Revisá paréntesis y signos.`, t.p)
  }
  return result
}

/** Intenta parsear; devuelve null si falla. */
export function tryParse(src: string, opts?: ParseOptions): Node | null {
  try { return parse(src, opts) } catch { return null }
}

/* ------------------------------------------------------------------ */
/* Evaluación                                                           */
/* ------------------------------------------------------------------ */
export type Env = Record<string, number>

function realPow(a: number, b: number): number {
  // raíces impares de negativos: (−8)^(1/3) = −2
  if (a < 0 && !Number.isInteger(b)) {
    for (const d of [3, 5, 7, 9]) {
      const n = Math.round(b * d)
      if (Math.abs(n / d - b) < 1e-12 && n % d !== 0) {
        const r = Math.pow(-a, b)
        return n % 2 !== 0 ? -r : r
      }
    }
    return NaN
  }
  return Math.pow(a, b)
}

const FN_IMPL: Record<FnName, (v: number) => number> = {
  sin: Math.sin, cos: Math.cos, tan: Math.tan,
  ln: (v) => (v > 0 ? Math.log(v) : NaN),
  log: (v) => (v > 0 ? Math.log10(v) : NaN),
  sqrt: (v) => (v >= 0 ? Math.sqrt(v) : NaN),
  cbrt: Math.cbrt, exp: Math.exp, abs: Math.abs,
  asin: Math.asin, acos: Math.acos, atan: Math.atan,
}

export function evaluate(n: Node, env: Env): number {
  switch (n.k) {
    case 'num': return n.v
    case 'var': return env[n.n] ?? NaN
    case 'const': return n.n === 'e' ? Math.E : Math.PI
    case 'neg': return -evaluate(n.a, env)
    case 'add': return evaluate(n.l, env) + evaluate(n.r, env)
    case 'sub': return evaluate(n.l, env) - evaluate(n.r, env)
    case 'mul': return evaluate(n.l, env) * evaluate(n.r, env)
    case 'div': {
      const d = evaluate(n.r, env)
      return d === 0 ? NaN : evaluate(n.l, env) / d
    }
    case 'pow': return realPow(evaluate(n.l, env), evaluate(n.r, env))
    case 'fn': return FN_IMPL[n.f](evaluate(n.a, env))
  }
}

/** Compila a una función de una variable. */
export function compile(n: Node, v = 'x'): (x: number) => number {
  return (x: number) => evaluate(n, { [v]: x })
}

/** Compila desde texto (devuelve null si no se puede leer). */
export function compileText(src: string, v = 'x'): ((x: number) => number) | null {
  const n = tryParse(src, { vars: [v] })
  return n ? compile(n, v) : null
}

/* ------------------------------------------------------------------ */
/* Utilidades estructurales                                             */
/* ------------------------------------------------------------------ */
export function dependsOn(n: Node, v: string): boolean {
  switch (n.k) {
    case 'num': case 'const': return false
    case 'var': return n.n === v
    case 'neg': case 'fn': return dependsOn(n.a, v)
    default: return dependsOn(n.l, v) || dependsOn(n.r, v)
  }
}

export function equalsStruct(a: Node, b: Node): boolean {
  if (a.k !== b.k) return false
  switch (a.k) {
    case 'num': return a.v === (b as typeof a).v
    case 'var': return a.n === (b as typeof a).n
    case 'const': return a.n === (b as typeof a).n
    case 'neg': return equalsStruct(a.a, (b as typeof a).a)
    case 'fn': return a.f === (b as typeof a).f && equalsStruct(a.a, (b as typeof a).a)
    default: {
      const bb = b as typeof a
      return equalsStruct(a.l, bb.l) && equalsStruct(a.r, bb.r)
    }
  }
}

export function substitute(n: Node, v: string, by: Node): Node {
  switch (n.k) {
    case 'var': return n.n === v ? by : n
    case 'num': case 'const': return n
    case 'neg': return neg(substitute(n.a, v, by))
    case 'fn': return fn(n.f, substitute(n.a, v, by))
    default: return { k: n.k, l: substitute(n.l, v, by), r: substitute(n.r, v, by) }
  }
}

/* ------------------------------------------------------------------ */
/* Simplificación (orientada a legibilidad, no a forma canónica)        */
/* ------------------------------------------------------------------ */
const isNum = (n: Node): n is { k: 'num'; v: number } => n.k === 'num'
const isV = (n: Node, v: number): boolean => n.k === 'num' && n.v === v

function roundNice(v: number): number {
  const r = Math.round(v * 1e10) / 1e10
  return Object.is(r, -0) ? 0 : r
}

export function simplify(n: Node): Node {
  let prev = ''
  let cur = n
  for (let i = 0; i < 12; i++) {
    cur = simp(cur)
    const s = toText(cur)
    if (s === prev) break
    prev = s
  }
  return normPoly(cur)
}

/* ---------- normalización de polinomios (exponentes racionales en x) ---------- */
type Poly = Map<number, number> // exponente → coeficiente
const PV = 'x'
const keyOf = (e: number) => Math.round(e * 1e9) / 1e9

function polyAdd(a: Poly, b: Poly, sign = 1): Poly {
  const r = new Map(a)
  for (const [e, c] of b) r.set(e, (r.get(e) ?? 0) + sign * c)
  return r
}
const isMonomial = (p: Poly) => p.size <= 1

/**
 * Intenta ver el nodo como suma de términos c·x^e. Devuelve null si aparece cualquier otra cosa
 * (funciones de x, potencias de binomios, productos de dos sumas): esas formas se conservan.
 */
function asPoly(n: Node): Poly | null {
  switch (n.k) {
    case 'num': return new Map([[0, n.v]])
    case 'var': return n.n === PV ? new Map([[1, 1]]) : null
    case 'const': return null
    case 'neg': { const a = asPoly(n.a); return a && polyAdd(new Map(), a, -1) }
    case 'add': case 'sub': { const a = asPoly(n.l), b = asPoly(n.r); return a && b ? polyAdd(a, b, n.k === 'add' ? 1 : -1) : null }
    case 'mul': {
      const a = asPoly(n.l), b = asPoly(n.r)
      if (!a || !b || (!isMonomial(a) && !isMonomial(b))) return null
      const r: Poly = new Map()
      for (const [e1, c1] of a) for (const [e2, c2] of b) { const k = keyOf(e1 + e2); r.set(k, (r.get(k) ?? 0) + c1 * c2) }
      return r
    }
    case 'div': {
      const a = asPoly(n.l), b = asPoly(n.r)
      if (!a || !b || !isMonomial(b) || b.size === 0) return null
      const [[e2, c2]] = [...b]
      if (c2 === 0) return null
      const r: Poly = new Map()
      for (const [e1, c1] of a) r.set(keyOf(e1 - e2), c1 / c2)
      return r
    }
    case 'pow': {
      if (n.l.k === 'var' && n.l.n === PV && n.r.k === 'num') return new Map([[keyOf(n.r.v), 1]])
      if (n.l.k === 'num' && n.r.k === 'num') return new Map([[0, Math.pow(n.l.v, n.r.v)]])
      if (n.r.k === 'num' && Number.isInteger(n.r.v)) {
        const b = asPoly(n.l)
        if (b && b.size === 1) { const [[e, c]] = [...b]; return new Map([[keyOf(e * n.r.v), Math.pow(c, n.r.v)]]) }
      }
      return null
    }
    case 'fn':
      if (n.f === 'sqrt' && n.a.k === 'var' && n.a.n === PV) return new Map([[0.5, 1]])
      if (n.f === 'cbrt' && n.a.k === 'var' && n.a.n === PV) return new Map([[keyOf(1 / 3), 1]])
      return null
  }
}

function termNode(c: number, e: number): Node {
  const x = vr(PV)
  let base: Node | null
  let inv = false
  const ae = Math.abs(e)
  if (e === 0) return num(roundNice(c))
  if (e < 0) inv = true
  if (ae === 1) base = x
  else if (ae === 0.5) base = fn('sqrt', x)
  else base = pow(x, num(ae))
  const f = niceFrac(c, 1000)
  if (inv) {
    // c/x^e con c = n/d  →  n / (d·x^e)
    if (f && f.d !== 1) return div(num(f.n), mul(num(f.d), base))
    return div(num(roundNice(c)), base)
  }
  return c === 1 ? base : mul(num(roundNice(c)), base)
}

function buildPoly(p: Poly): Node {
  const terms = [...p].filter(([, c]) => Math.abs(c) > 1e-12).sort((a, b) => b[0] - a[0])
  if (!terms.length) return num(0)
  let out: Node | null = null
  for (const [e, c] of terms) {
    if (!out) { out = c < 0 ? neg(termNode(-c, e)) : termNode(c, e); continue }
    out = c < 0 ? sub(out, termNode(-c, e)) : add(out, termNode(c, e))
  }
  return out!
}

/** Cantidad de nodos (para decidir si la forma normalizada es más simple). */
function size(n: Node): number {
  switch (n.k) {
    case 'num': case 'var': case 'const': return 1
    case 'neg': case 'fn': return 1 + size(n.a)
    default: return 1 + size(n.l) + size(n.r)
  }
}

function normPoly(n: Node): Node {
  if (n.k === 'num' || n.k === 'var' || n.k === 'const') return n
  const p = n.k === 'fn' && n.f !== 'sqrt' && n.f !== 'cbrt' ? null : asPoly(n)
  if (p) {
    const b = buildPoly(p)
    // solo si queda igual o más simple (evita, por ejemplo, convertir 1/(2√x) en algo más largo)
    if (size(b) <= size(n) + 3) return b
  }
  switch (n.k) {
    case 'neg': return neg(normPoly(n.a))
    case 'fn': return fn(n.f, normPoly(n.a))
    case 'add': return add(normPoly(n.l), normPoly(n.r))
    case 'sub': return sub(normPoly(n.l), normPoly(n.r))
    case 'mul': return mul(normPoly(n.l), normPoly(n.r))
    case 'div': return div(normPoly(n.l), normPoly(n.r))
    case 'pow': return pow(normPoly(n.l), normPoly(n.r))
  }
}

function simp(n: Node): Node {
  switch (n.k) {
    case 'num': case 'var': case 'const': return n
    case 'neg': {
      const a = simp(n.a)
      if (isNum(a)) return num(roundNice(-a.v))
      if (a.k === 'neg') return a.a
      if (a.k === 'mul' && isNum(a.l)) return mul(num(-a.l.v), a.r)
      if (a.k === 'div' && isNum(a.l)) return div(num(-a.l.v), a.r)
      return neg(a)
    }
    case 'fn': {
      const a = simp(n.a)
      if (isNum(a)) {
        if (n.f === 'ln' && a.v === 1) return num(0)
        if (n.f === 'sqrt' && Number.isInteger(Math.sqrt(a.v))) return num(Math.sqrt(a.v))
        if ((n.f === 'sin' || n.f === 'tan') && a.v === 0) return num(0)
        if (n.f === 'cos' && a.v === 0) return num(1)
        if (n.f === 'exp' && a.v === 0) return num(1)
      }
      if (n.f === 'ln' && a.k === 'const' && a.n === 'e') return num(1)
      if (n.f === 'exp') return pow(E, a)
      return fn(n.f, a)
    }
    case 'add': {
      const l = simp(n.l), r = simp(n.r)
      if (isNum(l) && isNum(r)) return num(roundNice(l.v + r.v))
      if (isV(l, 0)) return r
      if (isV(r, 0)) return l
      if (r.k === 'neg') return sub(l, r.a)
      if (isNum(r) && r.v < 0) return sub(l, num(-r.v))
      if (r.k === 'mul' && isNum(r.l) && r.l.v < 0) return sub(l, mul(num(-r.l.v), r.r))
      if (r.k === 'div' && isNum(r.l) && r.l.v < 0) return sub(l, div(num(-r.l.v), r.r))
      if (equalsStruct(l, r)) return mul(num(2), l)
      const cl = coeff(l), cr = coeff(r)
      if (equalsStruct(cl.rest, cr.rest) && !isNum(cl.rest)) return mkCoeff(cl.c + cr.c, cl.rest)
      return add(l, r)
    }
    case 'sub': {
      const l = simp(n.l), r = simp(n.r)
      if (isNum(l) && isNum(r)) return num(roundNice(l.v - r.v))
      if (isV(r, 0)) return l
      if (isV(l, 0)) return simp(neg(r))
      if (r.k === 'neg') return add(l, r.a)
      if (isNum(r) && r.v < 0) return add(l, num(-r.v))
      if (r.k === 'div' && isNum(r.l) && r.l.v < 0) return add(l, div(num(-r.l.v), r.r))
      if (r.k === 'mul' && isNum(r.l) && r.l.v < 0) return add(l, mul(num(-r.l.v), r.r))
      if (equalsStruct(l, r)) return num(0)
      const cl = coeff(l), cr = coeff(r)
      if (equalsStruct(cl.rest, cr.rest) && !isNum(cl.rest)) return mkCoeff(cl.c - cr.c, cl.rest)
      return sub(l, r)
    }
    case 'mul': {
      const l = simp(n.l), r = simp(n.r)
      if (isNum(l) && isNum(r)) return num(roundNice(l.v * r.v))
      if (isV(l, 0) || isV(r, 0)) return num(0)
      if (isV(l, 1)) return r
      if (isV(r, 1)) return l
      if (isV(l, -1)) return simp(neg(r))
      if (isV(r, -1)) return simp(neg(l))
      if (isNum(r) && !isNum(l)) return simp(mul(r, l)) // número adelante
      if (l.k === 'neg') return simp(neg(mul(l.a, r)))
      if (r.k === 'neg') return simp(neg(mul(l, r.a)))
      if (isNum(l) && r.k === 'mul' && isNum(r.l)) return mul(num(roundNice(l.v * r.l.v)), r.r)
      if (isNum(l) && r.k === 'div' && isNum(r.l)) return div(num(roundNice(l.v * r.l.v)), r.r)
      if (l.k === 'mul' && isNum(l.l) && !isNum(r)) return simp(mul(l.l, mul(l.r, r)))
      if (r.k === 'mul' && isNum(r.l) && !isNum(l)) return simp(mul(r.l, mul(l, r.r)))
      // x * x^n  → x^(n+1)
      const bl = baseExp(l), br = baseExp(r)
      if (equalsStruct(bl.base, br.base) && isNum(bl.exp) && isNum(br.exp)) return simp(pow(bl.base, num(roundNice(bl.exp.v + br.exp.v))))
      if (r.k === 'div' && isV(r.l, 1)) return div(l, r.r)
      if (isNum(l) && r.k === 'div') return simp(div(mul(l, r.l), r.r))
      if (l.k === 'div' && !isNum(r) && r.k !== 'div') return simp(div(mul(l.l, r), l.r))
      if (r.k === 'div' && !isNum(l) && l.k !== 'div') return simp(div(mul(l, r.l), r.r))
      return mul(l, r)
    }
    case 'div': {
      const l = simp(n.l), r = simp(n.r)
      if (isV(r, 1)) return l
      if (isV(l, 0)) return num(0)
      if (isNum(l) && isNum(r) && r.v !== 0) {
        const q = l.v / r.v
        if (Number.isInteger(q)) return num(q)
        return div(l, r)
      }
      if (equalsStruct(l, r)) return num(1)
      if (l.k === 'neg') return simp(neg(div(l.a, r)))
      if (l.k === 'mul' && isNum(l.l) && isNum(r) && r.v !== 0) {
        const q = l.l.v / r.v
        if (Number.isInteger(q)) return simp(mul(num(q), l.r))
      }
      // coeficientes numéricos arriba y abajo: se simplifican
      const cl = coeff(l), cr = coeff(r)
      if (!isNum(cr.rest) && cr.c !== 1 && cr.c !== 0 && Number.isInteger(cl.c) && Number.isInteger(cr.c)) {
        const g = gcdInt(cl.c, cr.c) * (cr.c < 0 ? -1 : 1)
        if (g !== 1) return simp(div(mkCoeff(cl.c / g, cl.rest), mkCoeff(cr.c / g, cr.rest)))
      }
      return div(l, r)
    }
    case 'pow': {
      const l = simp(n.l), r = simp(n.r)
      if (isV(r, 0)) return num(1)
      if (isV(r, 1)) return l
      if (isNum(l) && isNum(r) && Number.isInteger(r.v) && Math.abs(r.v) <= 6 && Number.isInteger(l.v)) {
        if (r.v >= 0) return num(Math.pow(l.v, r.v))
        return div(num(1), num(Math.pow(l.v, -r.v)))
      }
      if (l.k === 'pow' && isNum(l.r) && isNum(r)) return pow(l.l, num(roundNice(l.r.v * r.v)))
      return pow(l, r)
    }
  }
}

function gcdInt(a: number, b: number): number {
  a = Math.abs(a); b = Math.abs(b)
  while (b) [a, b] = [b, a % b]
  return a || 1
}
function coeff(n: Node): { c: number; rest: Node } {
  if (n.k === 'mul' && isNum(n.l)) return { c: n.l.v, rest: n.r }
  if (n.k === 'neg') { const q = coeff(n.a); return { c: -q.c, rest: q.rest } }
  if (isNum(n)) return { c: n.v, rest: num(1) }
  return { c: 1, rest: n }
}
function mkCoeff(c: number, rest: Node): Node {
  c = roundNice(c)
  if (c === 0) return num(0)
  if (c === 1) return rest
  if (c === -1) return neg(rest)
  return mul(num(c), rest)
}
function baseExp(n: Node): { base: Node; exp: Node } {
  if (n.k === 'pow') return { base: n.l, exp: n.r }
  return { base: n, exp: num(1) }
}

/* ------------------------------------------------------------------ */
/* Derivada simbólica                                                   */
/* ------------------------------------------------------------------ */
export function diff(n: Node, v = 'x'): Node {
  return simplify(d(n, v))
}

function d(n: Node, v: string): Node {
  if (!dependsOn(n, v)) return num(0)
  switch (n.k) {
    case 'var': return num(1)
    case 'num': case 'const': return num(0)
    case 'neg': return neg(d(n.a, v))
    case 'add': return add(d(n.l, v), d(n.r, v))
    case 'sub': return sub(d(n.l, v), d(n.r, v))
    case 'mul': {
      if (!dependsOn(n.l, v)) return mul(n.l, d(n.r, v))
      if (!dependsOn(n.r, v)) return mul(d(n.l, v), n.r)
      return add(mul(d(n.l, v), n.r), mul(n.l, d(n.r, v)))
    }
    case 'div': {
      if (!dependsOn(n.r, v)) return div(d(n.l, v), n.r)
      return div(sub(mul(d(n.l, v), n.r), mul(n.l, d(n.r, v))), pow(n.r, num(2)))
    }
    case 'pow': {
      const bDep = dependsOn(n.l, v), eDep = dependsOn(n.r, v)
      if (bDep && !eDep) return mul(mul(n.r, pow(n.l, sub(n.r, num(1)))), d(n.l, v))
      if (!bDep && eDep) {
        const lnb = n.l.k === 'const' && n.l.n === 'e' ? num(1) : fn('ln', n.l)
        return mul(mul(n, lnb), d(n.r, v))
      }
      // f^g = e^(g ln f)
      return mul(n, add(mul(d(n.r, v), fn('ln', n.l)), mul(n.r, div(d(n.l, v), n.l))))
    }
    case 'fn': {
      const u = n.a, du = d(u, v)
      let outer: Node
      switch (n.f) {
        case 'sin': outer = fn('cos', u); break
        case 'cos': outer = neg(fn('sin', u)); break
        case 'tan': outer = div(num(1), pow(fn('cos', u), num(2))); break
        case 'ln': outer = div(num(1), u); break
        case 'log': outer = div(num(1), mul(u, fn('ln', num(10)))); break
        case 'sqrt': outer = div(num(1), mul(num(2), fn('sqrt', u))); break
        case 'cbrt': outer = div(num(1), mul(num(3), pow(fn('cbrt', u), num(2)))); break
        case 'exp': outer = pow(E, u); break
        case 'abs': outer = div(u, fn('abs', u)); break
        case 'asin': outer = div(num(1), fn('sqrt', sub(num(1), pow(u, num(2))))); break
        case 'acos': outer = neg(div(num(1), fn('sqrt', sub(num(1), pow(u, num(2)))))); break
        case 'atan': outer = div(num(1), add(num(1), pow(u, num(2)))); break
      }
      return mul(outer, du)
    }
  }
}

/* ------------------------------------------------------------------ */
/* Impresión                                                            */
/* ------------------------------------------------------------------ */
function fmtNum(v: number): string {
  if (Number.isInteger(v)) return String(v)
  const r = Math.round(v * 1e6) / 1e6
  return String(r)
}

/** Fracción "linda" para mostrar decimales comunes (0.5 → 1/2). */
export function niceFrac(v: number, maxDen = 12): { n: number; d: number } | null {
  for (let den = 1; den <= maxDen; den++) {
    const nn = Math.round(v * den)
    if (Math.abs(nn / den - v) < 1e-9) return { n: nn, d: den }
  }
  return null
}

const FN_TEX: Record<FnName, string> = {
  sin: '\\operatorname{sen}', cos: '\\cos', tan: '\\operatorname{tg}', ln: '\\ln', log: '\\log', sqrt: '', cbrt: '',
  exp: '\\exp', abs: '', asin: '\\operatorname{arcsen}', acos: '\\arccos', atan: '\\operatorname{arctg}',
}

export function toTeX(n: Node): string {
  return tex(n, 0)
}

function numTeX(v: number): string {
  if (Number.isInteger(v)) return String(v)
  const f = niceFrac(v, 1000)
  if (f) return (f.n < 0 ? '-' : '') + `\\tfrac{${Math.abs(f.n)}}{${f.d}}`
  return fmtNum(v).replace('.', '{,}')
}

/** −(número) → número negativo (solo para imprimir). */
const nnum = (n: Node): Node => (n.k === 'neg' && n.a.k === 'num' ? { k: 'num', v: -n.a.v } : n)
const isZero = (n: Node): boolean => { const m = nnum(n); return (m.k === 'num' && m.v === 0) || (m.k === 'mul' && (isZero(m.l) || isZero(m.r))) }
/** Quita sumandos nulos (x + 0 → x) para imprimir. */
const stripZero = (n: Node): Node => ((n.k === 'add' || n.k === 'sub') && isZero(n.r) ? stripZero(n.l) : n.k === 'add' && isZero(n.l) ? stripZero(n.r) : n)
/** Si el nodo es "negativo" a simple vista (−3, −2x, −f), devuelve su versión positiva. */
function negated(n0: Node): Node | null {
  const n = nnum(n0)
  if (n.k === 'num' && n.v < 0) return { k: 'num', v: -n.v }
  if (n.k === 'neg') return n.a
  if (n.k === 'mul') {
    const l = nnum(n.l)
    if (l.k === 'num' && l.v < 0) return l.v === -1 ? n.r : { k: 'mul', l: { k: 'num', v: -l.v }, r: n.r }
  }
  if (n.k === 'div') {
    const p = negated(n.l)
    if (p) return { k: 'div', l: p, r: n.r }
  }
  return null
}

function tex(n: Node, parentPrec: number): string {
  const wrap = (s: string, myPrec: number) => (myPrec < parentPrec ? `\\left(${s}\\right)` : s)
  switch (n.k) {
    case 'num': return n.v < 0 && parentPrec > 1 ? `\\left(${numTeX(n.v)}\\right)` : numTeX(n.v)
    case 'var': return n.n
    case 'const': return n.n === 'e' ? 'e' : '\\pi'
    case 'neg': {
      const a = nnum(n.a)
      if (a.k === 'num') return tex({ k: 'num', v: -a.v }, parentPrec)
      return wrap('-' + tex(a, a.k === 'mul' || a.k === 'div' || a.k === 'pow' || a.k === 'fn' ? 2 : 3), 3)
    }
    case 'add': {
      if (isZero(n.r)) return tex(n.l, parentPrec)
      if (isZero(n.l)) return tex(n.r, parentPrec)
      const pos = negated(n.r)
      return pos ? wrap(`${tex(n.l, 1)} - ${tex(pos, 1.5)}`, 1) : wrap(`${tex(n.l, 1)} + ${tex(n.r, 1.5)}`, 1)
    }
    case 'sub': {
      if (isZero(n.r)) return tex(n.l, parentPrec)
      const pos = negated(n.r)
      return pos ? wrap(`${tex(n.l, 1)} + ${tex(pos, 1.5)}`, 1) : wrap(`${tex(n.l, 1)} - ${tex(n.r, 1.5)}`, 1)
    }
    case 'mul': {
      // producto aplanado: coeficiente numérico adelante, después potencias de x, funciones y paréntesis
      const fs: Node[] = []
      const walk = (m: Node) => { if (m.k === 'mul') { walk(m.l); walk(m.r) } else fs.push(nnum(m)) }
      walk(n)
      let c = 1
      const rest: Node[] = []
      for (const f of fs) { if (f.k === 'num') c *= f.v; else rest.push(f) }
      if (!rest.length) return tex({ k: 'num', v: c }, parentPrec)
      if (c === 0) return '0'
      const rank = (f: Node): number => {
        if (f.k === 'var' || (f.k === 'pow' && f.l.k === 'var')) return 1
        if (f.k === 'fn' && (f.f === 'sqrt' || f.f === 'cbrt' || f.f === 'abs')) return 2
        if (f.k === 'const' || (f.k === 'pow' && f.l.k === 'const')) return 3
        if (f.k === 'fn' || f.k === 'pow') return 4
        if (f.k === 'div') return 6
        return 5
      }
      rest.sort((p, q) => rank(p) - rank(q))
      let body = ''
      rest.forEach((f, i) => {
        const t = tex(f, 2.1)
        if (i === 0) { body = t; return }
        const prev = rest[i - 1]
        const sep = prev.k === 'fn' && prev.f !== 'sqrt' && prev.f !== 'cbrt' && prev.f !== 'abs' ? '\\,' : /^[0-9]/.test(t) ? ' \\cdot ' : ''
        body += sep + t
      })
      if (c === 1) return wrap(body, 2)
      if (c === -1) return wrap('-' + body, 3)
      const ct = numTeX(Math.abs(c))
      const needsDot = /^[0-9]/.test(body)
      return wrap((c < 0 ? '-' : '') + ct + (needsDot ? ' \\cdot ' : '') + body, c < 0 ? 3 : 2)
    }
    case 'div': {
      const p = negated(n.l)
      if (p) return wrap(`-\\frac{${tex(p, 0)}}{${tex(n.r, 0)}}`, 3)
      return wrap(`\\frac{${tex(n.l, 0)}}{${tex(n.r, 0)}}`, 5)
    }
    case 'pow': {
      if (n.l.k === 'fn' && n.l.f !== 'sqrt' && n.l.f !== 'abs' && n.l.f !== 'cbrt' && n.r.k === 'num' && Number.isInteger(n.r.v) && n.r.v > 0) {
        return `${FN_TEX[n.l.f]}^{${n.r.v}}\\left(${tex(n.l.a, 0)}\\right)`
      }
      if (n.r.k === 'num' && n.r.v === 1) return tex(n.l, parentPrec)
      const b = stripZero(n.l)
      const base = (b.k === 'num' && b.v >= 0) || b.k === 'var' || b.k === 'const' ? tex(b, 6) : `\\left(${tex(b, 0)}\\right)`
      return wrap(`${base}^{${tex(n.r, 0)}}`, 4)
    }
    case 'fn': {
      if (n.f === 'sqrt') return `\\sqrt{${tex(n.a, 0)}}`
      if (n.f === 'cbrt') return `\\sqrt[3]{${tex(n.a, 0)}}`
      if (n.f === 'abs') return `\\left|${tex(n.a, 0)}\\right|`
      const simpleArg = n.a.k === 'var' || n.a.k === 'num' || n.a.k === 'const'
      if (n.f === 'exp') return `e^{${tex(n.a, 0)}}`
      return simpleArg ? `${FN_TEX[n.f]} ${tex(n.a, 6)}` : `${FN_TEX[n.f]}\\left(${tex(n.a, 0)}\\right)`
    }
  }
}

const FN_TXT: Record<FnName, string> = {
  sin: 'sen', cos: 'cos', tan: 'tg', ln: 'ln', log: 'log', sqrt: 'sqrt', cbrt: 'cbrt', exp: 'exp', abs: 'abs', asin: 'arcsen', acos: 'arccos', atan: 'arctg',
}

/** Texto plano re-parseable (útil para claves y depuración). */
export function toText(n: Node, parentPrec = 0): string {
  const wrap = (s: string, my: number) => (my < parentPrec ? `(${s})` : s)
  switch (n.k) {
    case 'num': return n.v < 0 ? `(${fmtNum(n.v)})` : fmtNum(n.v)
    case 'var': return n.n
    case 'const': return n.n === 'e' ? 'e' : 'pi'
    case 'neg': return wrap('-' + toText(n.a, 3), 3)
    case 'add': return wrap(`${toText(n.l, 1)} + ${toText(n.r, 1.5)}`, 1)
    case 'sub': return wrap(`${toText(n.l, 1)} - ${toText(n.r, 1.5)}`, 1)
    case 'mul': return wrap(`${toText(n.l, 2)}*${toText(n.r, 2.1)}`, 2)
    case 'div': return wrap(`${toText(n.l, 2)}/${toText(n.r, 2.1)}`, 2)
    case 'pow': return wrap(`${toText(n.l, 4.5)}^${toText(n.r, 4.5)}`, 4)
    case 'fn': return `${FN_TXT[n.f]}(${toText(n.a, 0)})`
  }
}

/** Atajo: texto → TeX (si no se puede leer, devuelve el texto escapado). */
export function texOf(src: string, vars: string[] = ['x']): string {
  const n = tryParse(src, { vars })
  return n ? toTeX(n) : `\\text{${src.replace(/[{}\\]/g, '')}}`
}
