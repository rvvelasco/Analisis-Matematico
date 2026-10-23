/** Álgebra de matrices con fracciones exactas. */
import { F0, F1, fadd, fdiv, feq, fisZero, fmul, fneg, frac, fsub, ftex, fstr, type Frac } from './fraction'

export type Mat = Frac[][]

export const M = (rows: number[][]): Mat => rows.map((r) => r.map((v) => frac(v)))
export const dims = (A: Mat): [number, number] => [A.length, A[0]?.length ?? 0]
export const clone = (A: Mat): Mat => A.map((r) => r.slice())

export function identity(n: number): Mat {
  return Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (i === j ? F1 : F0)))
}

export function madd(A: Mat, B: Mat): Mat {
  const [m, n] = dims(A)
  const [p, q] = dims(B)
  if (m !== p || n !== q) throw new Error('Para sumar, las matrices deben tener la misma dimensión.')
  return A.map((r, i) => r.map((v, j) => fadd(v, B[i][j])))
}
export function msub(A: Mat, B: Mat): Mat {
  return madd(A, B.map((r) => r.map(fneg)))
}
export function mscale(k: Frac, A: Mat): Mat {
  return A.map((r) => r.map((v) => fmul(k, v)))
}
export function mmul(A: Mat, B: Mat): Mat {
  const [m, n] = dims(A)
  const [p, q] = dims(B)
  if (n !== p) throw new Error(`No se puede multiplicar: A es ${m}×${n} y B es ${p}×${q} (las columnas de A deben igualar las filas de B).`)
  return Array.from({ length: m }, (_, i) =>
    Array.from({ length: q }, (_, j) => {
      let s = F0
      for (let k = 0; k < n; k++) s = fadd(s, fmul(A[i][k], B[k][j]))
      return s
    }),
  )
}
export function transpose(A: Mat): Mat {
  const [m, n] = dims(A)
  return Array.from({ length: n }, (_, j) => Array.from({ length: m }, (_, i) => A[i][j]))
}
export function mequal(A: Mat, B: Mat): boolean {
  const [m, n] = dims(A)
  const [p, q] = dims(B)
  return m === p && n === q && A.every((r, i) => r.every((v, j) => feq(v, B[i][j])))
}

/** Determinante por eliminación (exacto). */
export function det(A: Mat): Frac {
  const [m, n] = dims(A)
  if (m !== n) throw new Error('El determinante solo existe para matrices cuadradas.')
  const a = clone(A)
  let d = F1
  for (let c = 0; c < n; c++) {
    let p = c
    while (p < n && fisZero(a[p][c])) p++
    if (p === n) return F0
    if (p !== c) { [a[p], a[c]] = [a[c], a[p]]; d = fneg(d) }
    d = fmul(d, a[c][c])
    for (let r = c + 1; r < n; r++) {
      const f = fdiv(a[r][c], a[c][c])
      for (let k = c; k < n; k++) a[r][k] = fsub(a[r][k], fmul(f, a[c][k]))
    }
  }
  return d
}

/** Cofactor C_ij (índices desde 0). */
export function minor(A: Mat, i: number, j: number): Mat {
  return A.filter((_, r) => r !== i).map((row) => row.filter((_, c) => c !== j))
}
export function cofactor(A: Mat, i: number, j: number): Frac {
  const m = det(minor(A, i, j))
  return (i + j) % 2 ? fneg(m) : m
}

export function inverse(A: Mat): Mat | null {
  const [m, n] = dims(A)
  if (m !== n) return null
  const r = rref(A.map((row, i) => row.concat(identity(n)[i])))
  for (let i = 0; i < n; i++) if (!feq(r.matrix[i][i], F1)) return null
  return r.matrix.map((row) => row.slice(n))
}

export type RowOp =
  | { t: 'swap'; i: number; j: number }
  | { t: 'scale'; i: number; k: Frac }
  | { t: 'addMul'; i: number; j: number; k: Frac } // R_i ← R_i + k·R_j

export function applyRowOp(A: Mat, op: RowOp): Mat {
  const a = clone(A)
  if (op.t === 'swap') [a[op.i], a[op.j]] = [a[op.j], a[op.i]]
  else if (op.t === 'scale') {
    if (fisZero(op.k)) throw new Error('No se puede multiplicar una fila por 0: perdés información.')
    a[op.i] = a[op.i].map((v) => fmul(op.k, v))
  } else {
    if (op.i === op.j) throw new Error('No se puede sumar una fila a sí misma.')
    a[op.i] = a[op.i].map((v, c) => fadd(v, fmul(op.k, a[op.j][c])))
  }
  return a
}

export function rowOpTeX(op: RowOp): string {
  const R = (i: number) => `F_{${i + 1}}`
  if (op.t === 'swap') return `${R(op.i)} \\leftrightarrow ${R(op.j)}`
  if (op.t === 'scale') return `${R(op.i)} \\leftarrow ${ftex(op.k)}\\,${R(op.i)}`
  const k = op.k
  const sign = k.n < 0 ? '-' : '+'
  const abs = frac(Math.abs(k.n), k.d)
  return `${R(op.i)} \\leftarrow ${R(op.i)} ${sign} ${feq(abs, F1) ? '' : ftex(abs) + '\\,'}${R(op.j)}`
}

/** Forma escalonada reducida con registro de pasos (Gauss-Jordan). `cols` limita las columnas pivote (matriz ampliada). */
export function rref(A: Mat, cols?: number): { matrix: Mat; steps: { op: RowOp; after: Mat }[]; pivots: number[] } {
  let a = clone(A)
  const [m, n] = dims(a)
  const maxC = cols ?? n
  const steps: { op: RowOp; after: Mat }[] = []
  const pivots: number[] = []
  let row = 0
  for (let c = 0; c < maxC && row < m; c++) {
    let p = row
    while (p < m && fisZero(a[p][c])) p++
    if (p === m) continue
    if (p !== row) { const op: RowOp = { t: 'swap', i: row, j: p }; a = applyRowOp(a, op); steps.push({ op, after: a }) }
    if (!feq(a[row][c], F1)) { const op: RowOp = { t: 'scale', i: row, k: fdiv(F1, a[row][c]) }; a = applyRowOp(a, op); steps.push({ op, after: a }) }
    for (let r = 0; r < m; r++) {
      if (r !== row && !fisZero(a[r][c])) {
        const op: RowOp = { t: 'addMul', i: r, j: row, k: fneg(a[r][c]) }
        a = applyRowOp(a, op)
        steps.push({ op, after: a })
      }
    }
    pivots.push(c)
    row++
  }
  return { matrix: a, steps, pivots }
}

export function rank(A: Mat): number {
  return rref(A).pivots.length
}

export type SystemKind = 'SCD' | 'SCI' | 'SI'
/** Clasifica y resuelve A·x = b (Rouché–Frobenius). */
export function solveSystem(A: Mat, b: Frac[]): { kind: SystemKind; solution?: Frac[]; rankA: number; rankAb: number; freeVars: number } {
  const n = dims(A)[1]
  const Ab = A.map((r, i) => r.concat([b[i]]))
  const rA = rank(A)
  const rAb = rank(Ab)
  if (rA !== rAb) return { kind: 'SI', rankA: rA, rankAb: rAb, freeVars: 0 }
  if (rA < n) return { kind: 'SCI', rankA: rA, rankAb: rAb, freeVars: n - rA }
  const R = rref(Ab, n).matrix
  return { kind: 'SCD', solution: R.slice(0, n).map((r) => r[n]), rankA: rA, rankAb: rAb, freeVars: 0 }
}

export function matTeX(A: Mat, augmentAt?: number): string {
  const [, n] = dims(A)
  const spec = augmentAt ? 'c'.repeat(augmentAt) + '|' + 'c'.repeat(n - augmentAt) : 'c'.repeat(n)
  const body = A.map((r) => r.map(ftex).join(' & ')).join(' \\\\ ')
  return augmentAt ? `\\left(\\begin{array}{${spec}}${body}\\end{array}\\right)` : `\\begin{pmatrix}${body}\\end{pmatrix}`
}
export function matStr(A: Mat): string {
  return '[' + A.map((r) => r.map(fstr).join(' ')).join(' ; ') + ']'
}
