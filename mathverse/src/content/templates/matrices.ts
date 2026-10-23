import type { ExerciseBody, Template } from '../../engine/types'
import { det, inverse, M, matTeX, mmul, solveSystem, transpose, type Mat } from '../../math/matrix'
import { frac, fstr, fval } from '../../math/fraction'
import type { Rand } from '../../math/numeric'
import { fixed, LV, make, mc, par, sgn } from './helpers'

const A = 'matrices' as const

const rmat = (r: Rand, m: number, n: number, lo = -5, hi = 5): number[][] => Array.from({ length: m }, () => Array.from({ length: n }, () => r.int(lo, hi)))
const S = (X: number[][]) => matTeX(M(X))
const cells = (X: Mat): string[][] => X.map((row) => row.map(fstr))
const matBody = (X: Mat, prefix?: string): ExerciseBody => ({ kind: 'matrix', rows: X.length, cols: X[0].length, answer: cells(X), prefix })
const detN = (X: number[][]) => fval(det(M(X)))

/** Matriz 3×3 entera con determinante ±1 (inversa entera): producto de triangulares unitarias. */
function unimodular3(r: Rand): number[][] {
  const L = [[1, 0, 0], [r.int(-2, 2), 1, 0], [r.int(-2, 2), r.int(-2, 2), 1]]
  const U = [[1, r.int(-2, 2), r.int(-2, 2)], [0, 1, r.int(-2, 2)], [0, 0, 1]]
  const P = mmul(M(L), M(U)).map((row) => row.map(fval))
  return r.chance(0.5) ? P : [P[1], P[0], P[2]]
}

/** Sistema 3×3 en texto TeX. */
function systemTeX(Am: number[][], b: number[], vars = ['x', 'y', 'z']): string {
  const rows = Am.map((row, i) => {
    let s = ''
    row.forEach((c, j) => {
      if (c === 0) return
      const abs = Math.abs(c)
      const coef = abs === 1 ? '' : String(abs)
      if (!s) s = (c < 0 ? '-' : '') + coef + vars[j]
      else s += ` ${c < 0 ? '-' : '+'} ${coef}${vars[j]}`
    })
    return `${s || '0'} &= ${b[i]}`
  })
  return `\\begin{cases} ${rows.join(' \\\\ ')} \\end{cases}`.replace(/&= /g, '= ')
}

const NAMES = (k: number) => ['Rotación de 90° (antihoraria)', 'Simetría respecto del eje $x$', 'Simetría respecto del eje $y$', 'Simetría respecto de la recta $y = x$', `Homotecia (agrandar ×${k})`, 'Cizalladura horizontal']

const KIND_TEXT = { SCD: 'Compatible determinado (solución única)', SCI: 'Compatible indeterminado (infinitas soluciones)', SI: 'Incompatible (sin solución)' } as const

export const MATRICES: Template[] = [
  /* ============ m1 · Concepto ============ */
  {
    id: 'm1.entry', area: A, unit: 'm1', title: 'Elementos y dimensión', levels: [1],
    gen: (r) => {
      const m = r.int(2, 4), n = r.int(2, 4)
      const X = rmat(r, m, n, -9, 9)
      const i = r.int(1, m), j = r.int(1, n)
      const swapOk = i <= n && j <= m && X[j - 1]?.[i - 1] !== X[i - 1][j - 1]
      return make({
        subtopic: 'Notación', concepts: ['m1.concepto'], level: 1, levelWhy: LV[1],
        prompt: `Dada $A = ${S(X)}$, ¿cuánto vale $a_{${i}${j}}$?`,
        hints: ['$a_{ij}$: primero la **fila** $i$, después la **columna** $j$.', `Bajá hasta la fila ${i} y avanzá hasta la columna ${j}.`],
        solution: [{ text: `Fila ${i}, columna ${j}: $a_{${i}${j}} = ${X[i - 1][j - 1]}$. ($A$ es de ${m}×${n}: ${m} filas y ${n} columnas.)` }],
        explanation: 'Las matrices se indexan "fila, columna" (como en una planilla: renglón y después columna).',
        commonErrors: ['Leer columna y después fila.'],
      }, { kind: 'numeric', answer: X[i - 1][j - 1], wrong: swapOk ? [{ value: X[j - 1][i - 1], why: `Ese es $a_{${j}${i}}$: invertiste fila y columna.`, errorTag: 'fila-columna' }] : [] })
    },
  },
  {
    id: 'm1.equal', area: A, unit: 'm1', title: 'Igualdad de matrices', levels: [2],
    gen: (r) => {
      const x = r.int(-5, 6), y = r.int(-5, 6), a = r.int(1, 4), b = r.int(-4, 4)
      return make({
        subtopic: 'Igualdad', concepts: ['m1.igualdad'], level: 2, levelWhy: LV[2],
        prompt: `Hallá $x$ e $y$ para que $\\begin{pmatrix} ${a}x ${sgn(b)} & 3 \\\\ 1 & x + y \\end{pmatrix} = \\begin{pmatrix} ${a * x + b} & 3 \\\\ 1 & ${x + y} \\end{pmatrix}$.`,
        hints: ['Dos matrices son iguales si tienen la misma dimensión y **cada** elemento coincide.', `De la posición (1,1): $${a}x ${sgn(b)} = ${a * x + b}$.`],
        solution: [{ text: '', tex: `${a}x ${sgn(b)} = ${a * x + b} \\Rightarrow x = ${x}; \\quad x + y = ${x + y} \\Rightarrow y = ${y}` }],
        explanation: 'Igualar matrices es plantear una ecuación por cada posición.',
      }, { kind: 'fill', parts: ['$x =$', { blank: true, id: 'x', answer: String(x), mode: 'number', size: 4 }, ', $y =$', { blank: true, id: 'y', answer: String(y), mode: 'number', size: 4 }] })
    },
  },
  {
    id: 'm1.types', area: A, unit: 'm1', title: 'Tipos de matrices', levels: [1],
    gen: (r) => {
      const a = r.nonZero(-5, 5), b = r.nonZero(-5, 5), c = r.nonZero(-5, 5), d = r.nonZero(-5, 5)
      const q = r.pick([
        { X: [[a, 0, 0], [0, b, 0], [0, 0, c]], ok: 'Diagonal', why: 'Solo tiene elementos no nulos en la diagonal principal.' },
        { X: [[a, b, c], [0, d, a], [0, 0, b]], ok: 'Triangular superior', why: 'Debajo de la diagonal todo es 0.' },
        { X: [[a, b, c], [b, d, a], [c, a, b]], ok: 'Simétrica', why: 'Es igual a su traspuesta: $a_{ij} = a_{ji}$.' },
        { X: [[1, 0, 0], [0, 1, 0], [0, 0, 1]], ok: 'Identidad', why: 'Diagonal con unos.' },
      ])
      return make({
        subtopic: 'Tipos de matrices', concepts: ['m1.concepto'], level: 1, levelWhy: LV[1],
        prompt: `¿Qué tipo de matriz es $${S(q.X)}$? (Elegí la descripción más específica.)`,
        hints: ['Mirá dónde están los ceros.', 'Compará la fila 1 con la columna 1.'],
        solution: [{ text: `${q.ok}: ${q.why}` }],
        explanation: 'Reconocer el tipo de matriz ahorra cuentas: el determinante de una triangular es el producto de la diagonal, la inversa de una diagonal se obtiene invirtiendo cada elemento, etc.',
      }, mc(r, ['Diagonal', 'Triangular superior', 'Simétrica', 'Identidad'].map((t) => (t === q.ok ? { text: t, correct: true } : { text: t, why: 'Revisá la definición.' }))))
    },
  },

  /* ============ m2 · Suma, escalar, traspuesta ============ */
  {
    id: 'm2.linear', area: A, unit: 'm2', title: 'Combinación lineal de matrices', levels: [1, 2],
    gen: (r, level) => {
      const P = rmat(r, 2, level === 1 ? 2 : 3), Q = rmat(r, 2, level === 1 ? 2 : 3)
      const k = level === 1 ? 1 : r.pick([2, 3, -2]), l = level === 1 ? 1 : r.pick([1, -1, 2, -3])
      const R = P.map((row, i) => row.map((v, j) => k * v + l * Q[i][j]))
      const lbl = level === 1 ? 'A + B' : `${k}A ${l < 0 ? '-' : '+'} ${Math.abs(l) === 1 ? '' : Math.abs(l)}B`
      return make({
        subtopic: 'Suma y producto por escalar', concepts: ['m2.suma'], level, levelWhy: level === 1 ? 'Nivel Explorador: se suma posición por posición.' : LV[2],
        prompt: `Con $A = ${S(P)}$ y $B = ${S(Q)}$, calculá $${lbl}$.`,
        hints: ['Se opera **elemento a elemento**.', level === 1 ? 'Sumá cada número con el que está en la misma posición.' : `Primero multiplicá cada matriz por su número; después sumá posición a posición.`],
        solution: [{ text: '', tex: `${lbl} = ${S(R)}` }],
        explanation: 'La suma y el producto por escalar son "posición a posición". Por eso solo se pueden sumar matrices de la misma dimensión.',
      }, matBody(M(R), `${lbl} =`))
    },
  },
  {
    id: 'm2.transpose', area: A, unit: 'm2', title: 'Traspuesta', levels: [2],
    gen: (r) => {
      const X = rmat(r, 2, 3, -6, 6)
      const Tt = transpose(M(X))
      return make({
        subtopic: 'Traspuesta', concepts: ['m2.traspuesta'], level: 2, levelWhy: LV[2],
        prompt: `Calculá la traspuesta de $A = ${S(X)}$.`,
        hints: ['Las filas pasan a ser columnas.', 'Si $A$ es 2×3, $A^T$ es 3×2.'],
        solution: [{ text: '', tex: `A^T = ${matTeX(Tt)}` }],
        explanation: '$(A^T)_{ij} = a_{ji}$. Propiedad útil: $(AB)^T = B^T A^T$ (se invierte el orden).',
      }, matBody(Tt, 'Aᵀ ='))
    },
  },

  /* ============ m3 · Producto ============ */
  {
    id: 'm3.product', area: A, unit: 'm3', title: 'Producto de matrices', levels: [2, 3],
    gen: (r, level) => {
      const P = level === 2 ? rmat(r, 2, 2, -4, 4) : rmat(r, 2, 3, -3, 3)
      const Q = level === 2 ? rmat(r, 2, 2, -4, 4) : rmat(r, 3, 2, -3, 3)
      const R = mmul(M(P), M(Q))
      return make({
        subtopic: 'Producto', concepts: ['m3.producto'], level, levelWhy: level === 2 ? LV[2] : 'Nivel Analista: matrices no cuadradas; hay que controlar dimensiones y hacer varias sumas de productos.',
        prompt: `Calculá $A\\cdot B$ con $A = ${S(P)}$ y $B = ${S(Q)}$.`,
        hints: ['Elemento $(i, j)$ = fila $i$ de $A$ "por" columna $j$ de $B$ (multiplicar y sumar).', `$(AB)_{11} = ${P[0].map((v, k) => `${par(v)}\\cdot ${par(Q[k][0])}`).join(' + ')}$`, `El resultado es de ${P.length}×${Q[0].length}.`],
        solution: [{ text: 'Fila por columna:', tex: `AB = ${matTeX(R)}` }],
        explanation: 'El producto no es posición a posición: combina filas de $A$ con columnas de $B$. Representa **componer** transformaciones.',
        commonErrors: ['Multiplicar posición a posición.', 'Hacer columna por fila.'],
        estMinutes: level === 2 ? 3 : 5,
      }, matBody(R, 'AB ='))
    },
  },
  {
    id: 'm3.dims', area: A, unit: 'm3', title: '¿Se puede multiplicar?', levels: [2],
    gen: (r) => {
      const m = r.int(1, 4), n = r.int(1, 4), q = r.int(1, 4)
      const p = r.chance(0.6) ? n : r.pick([1, 2, 3, 4].filter((x) => x !== n))
      const ok = p === n
      const options = [
        { text: `Sí, y el resultado es de ${m}×${q}`, correct: ok, why: ok ? undefined : `Las columnas de $A$ (${n}) no coinciden con las filas de $B$ (${p}).` },
        { text: `Sí, y el resultado es de ${n}×${p}`, why: 'Las dimensiones "de adentro" deben coincidir y el resultado toma las "de afuera".', errorTag: 'dimensiones' },
        { text: 'No se puede multiplicar', correct: !ok, why: ok ? `Columnas de $A$ = filas de $B$ = ${n}: sí se puede.` : undefined },
      ]
      return make({
        subtopic: 'Producto', concepts: ['m3.producto'], level: 2, levelWhy: 'Nivel Aprendiz: aplicar la condición de compatibilidad.',
        prompt: `$A$ es de ${m}×${n} y $B$ es de ${p}×${q}. ¿Se puede calcular $A\\cdot B$?`,
        hints: ['$(m\\times n)\\cdot(p\\times q)$ se puede si $n = p$.', 'El resultado es $m\\times q$.'],
        solution: [{ text: ok ? `Sí: $n = p = ${n}$; resultado ${m}×${q}.` : `No: ${n} ≠ ${p}.` }],
        explanation: 'Para hacer "fila por columna", cada fila de $A$ tiene que tener tantos elementos como cada columna de $B$.',
      }, mc(r, options.filter((_o, i) => !(i === 1 && m === n && q === p))))
    },
  },
  fixed('m3.tf.commute', A, 'm3', 'El producto no conmuta', (r) => make({
    subtopic: 'Propiedades del producto', concepts: ['m3.producto'], level: 3, levelWhy: 'Nivel Analista: intuición que viene de los números y falla con matrices.',
    prompt: 'Desafiá tu intuición:',
    hints: ['Probá con $A = \\begin{pmatrix}1&1\\\\0&1\\end{pmatrix}$, $B = \\begin{pmatrix}1&0\\\\1&1\\end{pmatrix}$.'],
    solution: [{ text: '$AB = \\begin{pmatrix}2&1\\\\1&1\\end{pmatrix}$ pero $BA = \\begin{pmatrix}1&1\\\\1&2\\end{pmatrix}$.' }],
    explanation: 'El producto de matrices representa componer transformaciones, y el orden importa (no es lo mismo rotar y después estirar que al revés).',
  }, { kind: 'tf', statement: 'Para matrices cuadradas del mismo tamaño, siempre vale $AB = BA$.', answer: false, reasons: r.shuffle([
    { text: 'Falso: hay ejemplos 2×2 en los que $AB \\neq BA$.', correct: true },
    { text: 'Verdadero: el producto es conmutativo como con los números.', why: 'Con matrices el orden importa.', errorTag: 'conmutativa' },
    { text: 'Falso: porque $AB$ nunca está definido.', why: 'Para cuadradas del mismo tamaño sí está definido.' },
  ]) })),

  /* ============ m4 · Determinantes ============ */
  {
    id: 'm4.det', area: A, unit: 'm4', title: 'Calcular determinantes', levels: [1, 2, 3],
    gen: (r, level) => {
      if (level <= 2) {
        const X = rmat(r, 2, 2, level === 1 ? 0 : -6, level === 1 ? 6 : 6)
        const d = detN(X)
        return make({
          subtopic: 'Determinante 2×2', concepts: ['m4.determinante'], level, levelWhy: level === 1 ? 'Nivel Explorador: aplicar la fórmula con números positivos.' : LV[2],
          prompt: `Calculá $\\det ${S(X)}$.`,
          hints: ['$\\det\\begin{pmatrix}a&b\\\\c&d\\end{pmatrix} = ad - bc$', 'Diagonal principal menos diagonal secundaria.'],
          solution: [{ text: '', tex: `${par(X[0][0])}\\cdot ${par(X[1][1])} - ${par(X[0][1])}\\cdot ${par(X[1][0])} = ${d}` }],
          explanation: 'El determinante 2×2 mide cuánto escala las áreas la transformación (y si invierte la orientación, por el signo).',
        }, { kind: 'numeric', answer: d, wrong: [{ value: X[0][0] * X[1][1] + X[0][1] * X[1][0], why: 'Es diagonal principal **menos** la secundaria.', errorTag: 'det-signo' }, { value: X[0][1] * X[1][0] - X[0][0] * X[1][1], why: 'Restaste al revés: principal menos secundaria.', errorTag: 'signo' }] })
      }
      const X = rmat(r, 3, 3, -3, 4)
      const d = detN(X)
      return make({
        subtopic: 'Determinante 3×3', concepts: ['m4.determinante'], level, levelWhy: 'Nivel Analista: Sarrus o Laplace, muchas cuentas con signos.',
        prompt: `Calculá $\\det ${S(X)}$.`,
        hints: ['Podés usar la regla de Sarrus o desarrollar por una fila (Laplace).', 'Laplace por la fila 1: $a_{11}M_{11} - a_{12}M_{12} + a_{13}M_{13}$ (signos alternados).', 'Si una fila tiene ceros, desarrollá por esa fila.'],
        solution: [{ text: 'Por la fila 1:', tex: `${X[0][0]}\\cdot(${X[1][1] * X[2][2] - X[1][2] * X[2][1]}) - ${par(X[0][1])}\\cdot(${X[1][0] * X[2][2] - X[1][2] * X[2][0]}) + ${par(X[0][2])}\\cdot(${X[1][0] * X[2][1] - X[1][1] * X[2][0]}) = ${d}` }],
        explanation: 'El determinante 3×3 es el volumen (con signo) del paralelepípedo que forman las filas.',
        commonErrors: ['Olvidar el signo menos del segundo término en Laplace.'],
        estMinutes: 5,
      }, { kind: 'numeric', answer: d, wrong: [{ value: X[0][0] * (X[1][1] * X[2][2] - X[1][2] * X[2][1]) + X[0][1] * (X[1][0] * X[2][2] - X[1][2] * X[2][0]) + X[0][2] * (X[1][0] * X[2][1] - X[1][1] * X[2][0]), why: 'En Laplace los signos se alternan: $+\\,-\\,+$. Te faltó el menos del segundo término.', errorTag: 'laplace-signo' }] })
    },
  },
  {
    id: 'm4.props', area: A, unit: 'm4', title: 'Propiedades del determinante', levels: [3, 4],
    gen: (r, level) => {
      const d = r.nonZero(-5, 5), e = r.nonZero(-4, 4), k = r.pick([2, 3, -2]), n = r.pick([2, 3])
      const q = level === 3
        ? r.pick([
          { ask: `\\det(${k}A)`, val: frac(k ** n * d), wrongV: k * d, wrongWhy: `Al multiplicar la matriz por ${k} se multiplica **cada fila**: sale $${k}^{${n}}$, no ${k}.`, hint: `$\\det(kA) = k^n\\det A$ para $A$ de $n\\times n$.` },
          { ask: '\\det(A^T)', val: frac(d), wrongV: -d, wrongWhy: 'Trasponer no cambia el determinante.', hint: 'Trasponer no cambia el determinante.' },
          { ask: '\\det(A^{-1})', val: frac(1, d), wrongV: -d, wrongWhy: '$\\det(A^{-1}) = 1/\\det A$.', hint: '$\\det(A)\\det(A^{-1}) = \\det(I) = 1$.' },
        ])
        : r.pick([
          { ask: '\\det(AB)', val: frac(d * e), wrongV: d + e, wrongWhy: 'El determinante es multiplicativo: $\\det(AB) = \\det A\\cdot\\det B$.', hint: '$\\det(AB) = \\det A\\,\\det B$.' },
          { ask: `\\det(${k}A^{-1}B)`, val: frac(k ** n * e, d), wrongV: (k * e) / d, wrongWhy: `Ojo con el escalar: $\\det(kM) = k^{${n}}\\det M$.`, hint: 'Combiná: $\\det(kM) = k^n \\det M$, $\\det(A^{-1}) = 1/\\det A$, $\\det(MN) = \\det M\\det N$.' },
        ])
      return make({
        subtopic: 'Propiedades', concepts: ['m4.propiedades'], level, levelWhy: level === 3 ? 'Nivel Analista: usar propiedades en vez de calcular.' : 'Nivel Experto: combinar varias propiedades a la vez.',
        prompt: `$A$ y $B$ son matrices de ${n}×${n} con $\\det A = ${d}$${level === 4 ? ` y $\\det B = ${e}$` : ''}. Calculá $${q.ask}$.`,
        hints: [q.hint],
        solution: [{ text: '', tex: `${q.ask} = ${fstr(q.val)}` }],
        explanation: 'Las propiedades del determinante permiten calcular sin conocer las matrices. En particular, $A$ es invertible si y solo si $\\det A \\neq 0$.',
      }, { kind: 'numeric', answer: fval(q.val), answerText: fstr(q.val), wrong: Math.abs(q.wrongV - fval(q.val)) > 1e-9 ? [{ value: q.wrongV, why: q.wrongWhy, errorTag: 'det-propiedad' }] : [] })
    },
  },
  {
    id: 'm4.param', area: A, unit: 'm4', title: '¿Para qué k el determinante es 0?', levels: [3],
    gen: (r) => {
      const aa = r.pick([1, -1, 2, -2]), bb = r.nonZero(-4, 4), c = r.nonZero(-4, 4)
      const X = [[aa, bb], [c, 0]]
      const kF = frac(bb * c, aa)
      const kVal = fval(kF)
      return make({
        subtopic: 'Determinante con parámetro', concepts: ['m4.determinante', 'm5.inversa'], level: 3, levelWhy: 'Nivel Analista: plantear y resolver una ecuación a partir del determinante.',
        prompt: `¿Para qué valor de $k$ la matriz $\\begin{pmatrix} ${X[0][0]} & ${X[0][1]} \\\\ ${X[1][0]} & k \\end{pmatrix}$ **no** es invertible?`,
        hints: ['No es invertible ⇔ determinante 0.', `$\\det = ${X[0][0]}k - (${X[0][1]})(${X[1][0]})$`],
        solution: [{ text: '', tex: `${X[0][0]}k - ${par(X[0][1] * X[1][0])} = 0 \\Rightarrow k = ${fstr(kF)}` }],
        explanation: 'Una matriz cuadrada es invertible exactamente cuando su determinante no es 0.',
      }, { kind: 'numeric', answer: kVal, answerText: fstr(kF) })
    },
  },

  /* ============ m5 · Inversa ============ */
  {
    id: 'm5.inverse', area: A, unit: 'm5', title: 'Matriz inversa', levels: [2, 3, 4],
    gen: (r, level) => {
      let X: number[][]
      if (level === 2) {
        do X = rmat(r, 2, 2, -4, 4); while (Math.abs(detN(X)) !== 1)
      } else if (level === 3) {
        do X = rmat(r, 2, 2, -5, 5); while (detN(X) === 0 || Math.abs(detN(X)) === 1)
      } else X = unimodular3(r)
      const Inv = inverse(M(X))!
      const d = detN(X)
      return make({
        subtopic: 'Inversa', concepts: ['m5.inversa'], level, levelWhy: level === 2 ? 'Nivel Aprendiz: fórmula 2×2 con determinante ±1.' : level === 3 ? 'Nivel Analista: la inversa tiene fracciones.' : 'Nivel Experto: inversa 3×3 por Gauss-Jordan o adjunta.',
        prompt: `Calculá $A^{-1}$ para $A = ${S(X)}$.`,
        hints: X.length === 2 ? ['Primero el determinante: si es 0, no hay inversa.', '$\\begin{pmatrix}a&b\\\\c&d\\end{pmatrix}^{-1} = \\dfrac{1}{ad - bc}\\begin{pmatrix}d&-b\\\\-c&a\\end{pmatrix}$', `$\\det A = ${d}$.`] : ['Armá $(A \\mid I)$ y llevá $A$ a la identidad con operaciones de fila.', 'Lo que queda a la derecha es $A^{-1}$.', `$\\det A = ${d}$, así que existe la inversa.`],
        solution: [{ text: `$\\det A = ${d}$.` }, { text: '', tex: `A^{-1} = ${matTeX(Inv)}` }, { text: 'Control: $A\\cdot A^{-1} = I$.' }],
        explanation: 'La inversa "deshace" lo que hace $A$. Siempre se puede verificar multiplicando: $AA^{-1} = I$.',
        commonErrors: ['Olvidar dividir por el determinante.', 'Cambiar de signo la diagonal en vez de la antidiagonal.'],
        estMinutes: level === 4 ? 9 : 4,
      }, matBody(Inv, 'A⁻¹ ='))
    },
  },
  {
    id: 'm5.equation', area: A, unit: 'm5', title: 'Ecuación matricial', levels: [4],
    gen: (r) => {
      let X: number[][]
      do X = rmat(r, 2, 2, -3, 3); while (Math.abs(detN(X)) !== 1)
      const B = rmat(r, 2, 2, -4, 4)
      const left = r.chance(0.5)
      const Inv = inverse(M(X))!
      const Sol = left ? mmul(Inv, M(B)) : mmul(M(B), Inv)
      return make({
        subtopic: 'Ecuaciones matriciales', concepts: ['m5.inversa', 'm3.producto'], level: 4, levelWhy: 'Nivel Experto: despejar respetando el orden del producto (no conmutativo).',
        prompt: `Resolvé $${left ? 'AX' : 'XA'} = B$ con $A = ${S(X)}$ y $B = ${S(B)}$.`,
        hints: ['No se "divide" por una matriz: se multiplica por la inversa.', left ? 'Multiplicá por $A^{-1}$ **a la izquierda** en ambos lados: $X = A^{-1}B$.' : 'Multiplicá por $A^{-1}$ **a la derecha**: $X = BA^{-1}$.'],
        solution: [{ text: '', tex: `A^{-1} = ${matTeX(Inv)}` }, { text: '', tex: `X = ${left ? 'A^{-1}B' : 'BA^{-1}'} = ${matTeX(Sol)}` }],
        explanation: 'Como $AB \\neq BA$ en general, el lado por el que se multiplica la inversa importa.',
        commonErrors: [left ? 'Escribir $X = BA^{-1}$.' : 'Escribir $X = A^{-1}B$.'],
        estMinutes: 8,
      }, matBody(Sol, 'X ='))
    },
  },

  /* ============ m6 · Sistemas ============ */
  {
    id: 'm6.solve', area: A, unit: 'm6', title: 'Resolver un sistema', levels: [2, 3],
    gen: (r, level) => {
      const n = level === 2 ? 2 : 3
      let X: number[][]
      do X = rmat(r, n, n, -3, 3); while (detN(X) === 0)
      const sol = Array.from({ length: n }, () => r.int(-4, 4))
      const b = X.map((row) => row.reduce((s, v, j) => s + v * sol[j], 0))
      const vars = ['x', 'y', 'z'].slice(0, n)
      return make({
        subtopic: 'Sistemas de ecuaciones', concepts: ['m6.sistemas', 'm6.gauss'], level, levelWhy: level === 2 ? LV[2] : 'Nivel Analista: Gauss en 3×3, muchas operaciones encadenadas.',
        prompt: `Resolvé el sistema $${systemTeX(X, b, vars)}$`,
        hints: ['Armá la matriz ampliada $(A \\mid b)$.', 'Con operaciones de fila, hacé ceros debajo de cada pivote.', 'Despejá desde la última ecuación hacia arriba (sustitución hacia atrás).'],
        solution: [{ text: 'Matriz ampliada:', tex: matTeX(M(X.map((row, i) => row.concat([b[i]]))), n) }, { text: `Eliminando y sustituyendo: ${vars.map((v, i) => `$${v} = ${sol[i]}$`).join(', ')}.` }, { text: 'Control: reemplazando en las ecuaciones originales se verifican todas.' }],
        explanation: 'Las operaciones de fila no cambian las soluciones del sistema; por eso se puede simplificar hasta despejar.',
        estMinutes: n === 2 ? 4 : 8,
      }, { kind: 'fill', parts: vars.flatMap((v, i) => [`${i ? ', ' : ''}$${v} =$`, { blank: true as const, id: v, answer: String(sol[i]), mode: 'number' as const, size: 4 }]) })
    },
  },
  {
    id: 'm6.classify', area: A, unit: 'm6', title: 'Clasificar un sistema (Rouché–Frobenius)', levels: [3, 4],
    gen: (r, level) => {
      const target = r.pick(['SCD', 'SCI', 'SI'] as const)
      const r1 = [r.nonZero(-3, 3), r.int(-3, 3), r.int(-3, 3)], r2 = [r.int(-3, 3), r.nonZero(-3, 3), r.int(-3, 3)]
      const b1 = r.int(-5, 5), b2 = r.int(-5, 5)
      let Am: number[][], b: number[]
      if (target === 'SCD') {
        do { Am = [r1, r2, [r.int(-3, 3), r.int(-3, 3), r.nonZero(-3, 3)]] } while (detN(Am) === 0)
        b = [b1, b2, r.int(-5, 5)]
      } else {
        const p = r.pick([1, 2, -1]), q = r.pick([1, -1, 2])
        Am = [r1, r2, r1.map((v, j) => p * v + q * r2[j])]
        b = [b1, b2, p * b1 + q * b2 + (target === 'SI' ? r.pick([1, 2, -3]) : 0)]
      }
      const res = solveSystem(M(Am), b.map((v) => frac(v)))
      const kind = res.kind
      return make({
        subtopic: 'Clasificación de sistemas', concepts: ['m6.clasificacion'], level, levelWhy: level === 3 ? 'Nivel Analista: escalonar y comparar rangos.' : 'Nivel Experto: hay que justificar con rangos, no "a ojo".',
        prompt: `Clasificá el sistema $${systemTeX(Am, b)}$`,
        hints: ['Escalona la matriz ampliada.', 'Rouché–Frobenius: si $\\operatorname{rg}A \\neq \\operatorname{rg}(A|b)$ es incompatible; si son iguales a la cantidad de incógnitas, determinado; si son iguales pero menores, indeterminado.', 'Mirá si alguna fila es combinación de las otras.'],
        solution: [{ text: `$\\operatorname{rg}A = ${res.rankA}$, $\\operatorname{rg}(A|b) = ${res.rankAb}$, incógnitas: 3.` }, { text: `Es **${KIND_TEXT[kind]}**.` }],
        explanation: 'Geométricamente: tres planos que se cortan en un punto (SCD), en una recta (SCI) o que no tienen un punto común a los tres (SI).',
        estMinutes: 7,
      }, mc(r, (['SCD', 'SCI', 'SI'] as const).map((k) => (k === kind ? { text: KIND_TEXT[k], correct: true } : { text: KIND_TEXT[k], why: k === 'SCD' ? 'Para ser determinado el rango debería ser 3.' : k === 'SCI' ? 'Para ser indeterminado los dos rangos tendrían que coincidir y ser menores que 3.' : 'Para ser incompatible los rangos tendrían que ser distintos.', errorTag: 'rouche' }))))
    },
  },
  {
    id: 'm6.gaussError', area: A, unit: 'm6', title: 'Cazá el error en Gauss', levels: [3],
    gen: (r) => {
      const a = r.pick([2, 3]), b = r.int(1, 4), c = r.int(1, 6), d = r.int(1, 6)
      return make({
        subtopic: 'Método de Gauss', concepts: ['m6.gauss'], level: 3, levelWhy: 'Nivel Analista: auditar operaciones de fila.',
        prompt: `Un estudiante escalonó $\\left(\\begin{array}{cc|c} 1 & ${b} & ${c} \\\\ ${a} & 1 & ${d} \\end{array}\\right)$. ¿Dónde está el primer error?`,
        hints: [`Revisá la operación $F_2 \\to F_2 - ${a}F_1$ en **todas** las columnas, incluida la de términos independientes.`],
        solution: [{ text: `El paso 2: al hacer $F_2 - ${a}F_1$ la última columna debía quedar $${d} - ${a * c} = ${d - a * c}$, pero quedó sin cambiar.` }],
        explanation: 'Una operación de fila se aplica a la fila entera, incluida la columna ampliada; si no, se cambia el sistema.',
      }, { kind: 'errorStep', steps: [`Elijo el pivote $1$ en la fila 1.`, `$F_2 \\to F_2 - ${a}F_1$: $\\left(\\begin{array}{cc|c} 1 & ${b} & ${c} \\\\ 0 & ${1 - a * b} & ${d} \\end{array}\\right)$`, `Despejo: $y = \\frac{${d}}{${1 - a * b}}$`], wrongIndex: 1, ruleOptions: r.shuffle([
        { text: 'No aplicó la operación a la columna de términos independientes.', correct: true },
        { text: 'El pivote debía ser el ' + a + '.', why: 'Cualquier elemento no nulo sirve de pivote; el 1 es la mejor elección.' },
        { text: `$1 - ${a}\\cdot ${b}$ está mal calculado.`, why: 'Esa cuenta está bien.' },
      ]) })
    },
  },
  {
    id: 'm6.order', area: A, unit: 'm6', title: 'Pasos del método de Gauss', levels: [2],
    gen: (r) => {
      void r
      return make({
        subtopic: 'Método de Gauss', concepts: ['m6.gauss'], level: 2, levelWhy: 'Nivel Aprendiz: conocer el algoritmo.',
        prompt: 'Ordená los pasos para resolver un sistema por Gauss.',
        hints: ['Primero se escribe la información en una matriz; al final se despeja.'],
        solution: [{ text: '1. Matriz ampliada. 2. Pivote en la fila 1. 3. Ceros debajo del pivote. 4. Repetir con la submatriz. 5. Sustitución hacia atrás.' }],
        explanation: 'El objetivo es una matriz escalonada: cada ecuación tiene una incógnita menos que la anterior.',
      }, { kind: 'order', items: ['Escribir la matriz ampliada $(A \\mid b)$', 'Elegir un pivote no nulo en la primera columna', 'Hacer ceros debajo del pivote con operaciones de fila', 'Repetir con las filas y columnas restantes', 'Despejar desde la última ecuación hacia arriba'] })
    },
  },

  /* ============ m7 · Transformaciones y aplicaciones ============ */
  {
    id: 'm7.transform', area: A, unit: 'm7', title: 'Transformaciones lineales del plano', levels: [2, 3],
    gen: (r, level) => {
      const k = r.pick([2, 3])
      const T = r.pick([
        { X: [[0, -1], [1, 0]], name: 'Rotación de 90° (antihoraria)' },
        { X: [[1, 0], [0, -1]], name: 'Simetría respecto del eje $x$' },
        { X: [[-1, 0], [0, 1]], name: 'Simetría respecto del eje $y$' },
        { X: [[0, 1], [1, 0]], name: 'Simetría respecto de la recta $y = x$' },
        { X: [[k, 0], [0, k]], name: `Homotecia (agrandar ×${k})` },
        { X: [[1, k], [0, 1]], name: 'Cizalladura horizontal' },
      ])
      const v = [r.nonZero(-3, 3), r.nonZero(-3, 3)]
      const w = mmul(M(T.X), M([[v[0]], [v[1]]]))
      if (level === 2) {
        return make({
          subtopic: 'Matriz por vector', concepts: ['m7.transformaciones', 'm3.producto'], level, levelWhy: LV[2],
          prompt: `Aplicá $A = ${S(T.X)}$ al vector $v = (${v[0]}, ${v[1]})$: calculá $Av$ (como columna).`,
          plot: { vectors: [{ to: [v[0], v[1]], label: 'v' }], x: [-5, 5], y: [-5, 5] },
          hints: ['Matriz 2×2 por columna 2×1: queda una columna.', 'Primera componente: fila 1 por $v$.'],
          solution: [{ text: '', tex: `Av = ${matTeX(w)}` }, { text: `Geométricamente: ${T.name.toLowerCase()}.` }],
          explanation: 'Toda matriz 2×2 es una transformación del plano: manda cada vector a otro. Sus columnas dicen adónde van $(1,0)$ y $(0,1)$.',
        }, matBody(w, 'Av ='))
      }
      return make({
        subtopic: 'Interpretación geométrica', concepts: ['m7.transformaciones'], level, levelWhy: 'Nivel Analista: interpretar una matriz por el efecto sobre los vectores básicos.',
        prompt: `¿Qué transformación del plano representa $${S(T.X)}$?`,
        hints: ['Mirá las columnas: son las imágenes de $(1,0)$ y $(0,1)$.', 'Dibujá adónde va cada eje.'],
        solution: [{ text: `$(1,0) \\mapsto (${T.X[0][0]}, ${T.X[1][0]})$ y $(0,1) \\mapsto (${T.X[0][1]}, ${T.X[1][1]})$: ${T.name}.` }],
        explanation: 'El determinante cuenta cuánto se escalan las áreas: las rotaciones y simetrías tienen $|\\det| = 1$.',
      }, mc(r, [{ text: T.name, correct: true }, ...r.shuffle(NAMES(k).filter((t) => t !== T.name)).slice(0, 3).map((t) => ({ text: t, why: 'Probá con $(1,0)$ y $(0,1)$ y mirá dónde terminan.' }))]))
    },
  },
  {
    id: 'm7.area', area: A, unit: 'm7', title: 'El determinante como factor de área', levels: [4],
    gen: (r) => {
      let X: number[][]
      do X = rmat(r, 2, 2, -4, 4); while (detN(X) === 0)
      const s = r.pick([1, 2, 3])
      const area = Math.abs(detN(X)) * s * s
      return make({
        subtopic: 'Interpretación del determinante', concepts: ['m7.transformaciones', 'm4.determinante'], level: 4, levelWhy: 'Nivel Experto: conectar álgebra (determinante) con geometría (áreas).',
        prompt: `Un cuadrado de lado ${s} se transforma con $A = ${S(X)}$. ¿Cuál es el área de la figura resultante?`,
        hints: ['Las transformaciones lineales multiplican todas las áreas por el mismo número.', 'Ese número es $|\\det A|$.'],
        solution: [{ text: '', tex: `|\\det A|\\cdot ${s * s} = ${Math.abs(detN(X))}\\cdot ${s * s} = ${area}` }],
        explanation: 'El signo del determinante indica si la transformación invierte la orientación; su valor absoluto, el factor de área.',
      }, { kind: 'numeric', answer: area, wrong: [{ value: detN(X) * s * s, why: 'El área no puede ser negativa: tomá valor absoluto del determinante.', errorTag: 'area-negativa' }, { value: Math.abs(detN(X)), why: `Ese es el factor; falta multiplicarlo por el área original (${s * s}).` }] })
    },
  },
  {
    id: 'm7.parcial', area: A, unit: 'm7', title: 'Problema tipo parcial: sistema con parámetro', levels: [5],
    gen: (r) => {
      const a = r.pick([2, 3, 4])
      const k0 = 2 * a - 1
      const b1 = r.int(-3, 3), b2 = r.int(-3, 3)
      const sci = r.chance(0.5)
      const b3 = 2 * b2 - b1 + (sci ? 0 : r.pick([1, 2]))
      const k1 = k0 + r.pick([1, -1])
      const Am = (k: number) => [[1, 1, 1], [1, 2, a], [1, 3, k]]
      const kind0 = solveSystem(M(Am(k0)), [b1, b2, b3].map((v) => frac(v))).kind
      const sol1 = solveSystem(M(Am(k1)), [b1, b2, b3].map((v) => frac(v))).solution!
      return make({
        subtopic: 'Sistemas con parámetro', concepts: ['m6.clasificacion', 'm4.determinante', 'm6.gauss'], level: 5, levelWhy: LV[5],
        prompt: `Dado el sistema $\\begin{cases} x + y + z = ${b1} \\\\ x + 2y + ${a}z = ${b2} \\\\ x + 3y + kz = ${b3} \\end{cases}$`,
        hints: ['a) El sistema es SCD si y solo si $\\det A \\neq 0$.', `$\\det A = k - ${k0}$.`, `b) Reemplazá $k = ${k0}$ y escalona.`, `c) Con $k = ${k1}$ resolvé por Gauss.`],
        solution: [{ text: '', tex: `\\det A = 1(2k - ${3 * a}) - 1(k - ${a}) + 1(3 - 2) = k - ${k0}` }, { text: `a) Es SCD para $k \\neq ${k0}$.` }, { text: `b) Con $k = ${k0}$: $F_2 - F_1$ y $F_3 - F_2$ dan la misma parte izquierda; ${sci ? 'los términos independientes también coinciden → SCI' : 'los términos independientes no coinciden → SI'}.` }, { text: `c) Con $k = ${k1}$: $x = ${fstr(sol1[0])}$, $y = ${fstr(sol1[1])}$, $z = ${fstr(sol1[2])}$.` }],
        explanation: 'La estrategia estándar: el determinante decide cuándo hay solución única; los valores críticos se estudian aparte con rangos.',
        estMinutes: 15,
      }, { kind: 'multi', parts: [
        { label: 'a', prompt: 'Valor de $k$ para el cual $\\det A = 0$:', points: 1, kind: 'numeric', answer: k0 },
        { label: 'b', prompt: `Para ese valor de $k$, el sistema es:`, points: 1, kind: 'mc', options: r.shuffle((['SCD', 'SCI', 'SI'] as const).map((k) => (k === kind0 ? { text: KIND_TEXT[k], correct: true } : { text: KIND_TEXT[k], why: k === 'SCD' ? 'Con determinante 0 no puede ser determinado.' : 'Compará los rangos de $A$ y $(A|b)$.', errorTag: 'rouche' }))) },
        { label: 'c', prompt: `Para $k = ${k1}$, el valor de $z$:`, points: 1, kind: 'numeric', answer: fval(sol1[2]), answerText: fstr(sol1[2]) },
        { label: 'd', prompt: 'Teoría:', points: 1, kind: 'tf', statement: `Para cualquier $k \\neq ${k0}$ el sistema tiene solución única.`, answer: true, reasons: r.shuffle([{ text: 'Verdadero: $\\det A \\neq 0$ ⇒ rango 3 = incógnitas ⇒ SCD.', correct: true }, { text: 'Falso: depende de los términos independientes.', why: 'Si $\\det A \\neq 0$, $\\operatorname{rg}A = \\operatorname{rg}(A|b) = 3$ siempre.', errorTag: 'rouche' }, { text: 'Verdadero: porque todo sistema 3×3 tiene solución única.', why: 'No: con determinante 0 puede ser SCI o SI.' }]) },
      ] })
    },
  },
  {
    id: 'm7.final', area: A, unit: 'm7', title: 'Problema tipo final: matriz con parámetro', levels: [6],
    gen: (r) => {
      const a = r.pick([1, 2, 3])
      // A = [[k, a], [a, k]] → det = k² − a²
      const k1 = a + r.pick([1, 2])
      const X = [[k1, a], [a, k1]]
      const Inv = inverse(M(X))!
      const d1 = detN(X)
      return make({
        subtopic: 'Integrador de matrices', concepts: ['m4.determinante', 'm5.inversa', 'm7.transformaciones', 'm6.clasificacion'], level: 6, levelWhy: LV[6] + ' Combina determinante, inversa, sistemas y transformaciones.',
        prompt: `Sea $A_k = \\begin{pmatrix} k & ${a} \\\\ ${a} & k \\end{pmatrix}$.`,
        hints: [`$\\det A_k = k^2 - ${a * a}$.`, 'No invertible ⇔ determinante 0: hay **dos** valores.', 'El factor de área es $|\\det|$.'],
        solution: [{ text: `a) $k^2 - ${a * a} = 0 \\Rightarrow k = \\pm${a}$; el mayor es ${a}.` }, { text: '', tex: `\\text{b) } A_{${k1}}^{-1} = ${matTeX(Inv)}` }, { text: `c) Factor de área: $|\\det A_{${k1}}| = ${Math.abs(d1)}$.` }, { text: `d) Con $k = ${a}$ el sistema homogéneo $A_k X = 0$ tiene infinitas soluciones (determinante 0 y siempre es compatible).` }],
        explanation: 'Un sistema homogéneo siempre tiene la solución trivial; si el determinante es 0, además tiene infinitas.',
        estMinutes: 18,
      }, { kind: 'multi', parts: [
        { label: 'a', prompt: 'El **mayor** valor de $k$ para el que $A_k$ no es invertible:', points: 1, kind: 'numeric', answer: a, wrong: [{ value: a * a, why: 'Ese es $k^2$; despejá $k$.' }] },
        { label: 'b', prompt: `$A_{${k1}}^{-1} =$`, points: 1, ...matBody(Inv) } as ExerciseBody & { label: string; prompt: string; points: number },
        { label: 'c', prompt: `¿Por cuánto multiplica las áreas $A_{${k1}}$?`, points: 1, kind: 'numeric', answer: Math.abs(d1) },
        { label: 'd', prompt: `Con $k = ${a}$, el sistema $A_k\\binom{x}{y} = \\binom00$:`, points: 1, kind: 'mc', options: r.shuffle([{ text: 'Tiene infinitas soluciones', correct: true }, { text: 'Solo tiene la solución trivial', why: 'Eso pasa cuando el determinante **no** es 0.', errorTag: 'homogeneo' }, { text: 'No tiene solución', why: 'Un homogéneo siempre tiene al menos la solución $(0,0)$.', errorTag: 'homogeneo' }]) },
      ] })
    },
  },
]

