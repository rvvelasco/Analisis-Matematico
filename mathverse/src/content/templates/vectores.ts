import type { Template } from '../../engine/types'
import { angleDeg, cross, det2, dot, norm, vecTeX } from '../../math/vector'
import { frac, fstr, fval } from '../../math/fraction'
import { fmt, type Rand } from '../../math/numeric'
import { fixed, LV, make, mc, par } from './helpers'

const A = 'vectores' as const

const rv = (r: Rand, n: number, lo = -5, hi = 5): number[] => Array.from({ length: n }, () => r.int(lo, hi))
const rvNZ = (r: Rand, n: number, lo = -5, hi = 5): number[] => {
  let v: number[]
  do v = rv(r, n, lo, hi); while (v.every((x) => x === 0))
  return v
}
/** Casilleros numéricos para las componentes de un vector. */
const compBlanks = (v: (number | string)[], names = ['x', 'y', 'z']) => v.flatMap((c, i) => [i === 0 ? '$($' : '$,$', { blank: true as const, id: names[i], answer: String(c), mode: 'number' as const, size: 4 }]).concat(['$)$'])
const TRIPLES: [number, number, number][] = [[3, 4, 5], [6, 8, 10], [5, 12, 13], [8, 6, 10], [4, 3, 5], [12, 5, 13]]

export const VECTORES: Template[] = [
  /* ============ v1 · Concepto y módulo ============ */
  {
    id: 'v1.fromPoints', area: A, unit: 'v1', title: 'Vector entre dos puntos', levels: [1],
    gen: (r) => {
      const P = rv(r, 2, -4, 4), Q = rv(r, 2, -4, 4)
      if (P[0] === Q[0] && P[1] === Q[1]) Q[0] += 1
      const v = [Q[0] - P[0], Q[1] - P[1]]
      return make({
        subtopic: 'Vector definido por dos puntos', concepts: ['v1.concepto'], level: 1, levelWhy: LV[1],
        prompt: `Hallá las componentes del vector $\\vec{PQ}$ con $P = (${P[0]}, ${P[1]})$ y $Q = (${Q[0]}, ${Q[1]})$.`,
        plot: { vectors: [{ from: [P[0], P[1]], to: [Q[0], Q[1]], label: 'PQ' }], points: [{ x: P[0], y: P[1], label: 'P' }, { x: Q[0], y: Q[1], label: 'Q' }], x: [-6, 6], y: [-6, 6] },
        hints: ['"Punta menos cola": $\\vec{PQ} = Q - P$.', `Primera componente: $${Q[0]} - ${par(P[0])}$.`],
        solution: [{ text: '', tex: `\\vec{PQ} = (${Q[0]} - ${par(P[0])},\\ ${Q[1]} - ${par(P[1])}) = ${vecTeX(v)}` }],
        explanation: 'Un vector dice **cuánto hay que moverse** en cada dirección para ir de la cola a la punta. No depende de dónde esté dibujado.',
        commonErrors: ['Hacer $P - Q$ (da el vector opuesto).'],
      }, { kind: 'fill', parts: compBlanks(v) })
    },
  },
  {
    id: 'v1.norm', area: A, unit: 'v1', title: 'Módulo de un vector', levels: [1, 2],
    gen: (r, level) => {
      let v: number[]
      if (level === 1) {
        const t = r.pick(TRIPLES)
        v = [t[0] * r.pick([1, -1]), t[1] * r.pick([1, -1])]
      } else v = rvNZ(r, 3, -4, 4)
      const n = norm(v)
      const sq = dot(v, v)
      return make({
        subtopic: 'Módulo', concepts: ['v1.modulo'], level, levelWhy: level === 1 ? 'Nivel Explorador: Pitágoras con números "redondos".' : 'Nivel Aprendiz: módulo en el espacio, el resultado puede quedar con raíz.',
        prompt: `Calculá el módulo de $\\vec v = ${vecTeX(v)}$.${level === 2 ? ' (Podés escribir la raíz como sqrt(…).)' : ''}`,
        plot: v.length === 2 ? { vectors: [{ to: [v[0], v[1]], label: 'v' }], x: [-13, 13], y: [-13, 13] } : undefined,
        hints: ['El módulo es la longitud: teorema de Pitágoras.', `$|\\vec v| = \\sqrt{${v.map((c) => `${par(c)}^2`).join(' + ')}}$`],
        solution: [{ text: '', tex: `|\\vec v| = \\sqrt{${sq}}${Number.isInteger(n) ? ` = ${n}` : ` \\approx ${fmt(n, 3)}`}` }],
        explanation: 'Los signos no importan para el módulo (se elevan al cuadrado): una longitud nunca es negativa.',
        commonErrors: ['Sumar las componentes sin elevar al cuadrado.', 'Olvidar la raíz.'],
      }, { kind: 'numeric', answer: n, wrong: [{ value: sq, why: 'Te faltó sacar la raíz cuadrada.', errorTag: 'sin-raiz' }, { value: Math.abs(v.reduce((a, b) => a + b, 0)), why: 'Hay que elevar cada componente al cuadrado, sumar y sacar raíz.' }] })
    },
  },
  {
    id: 'v1.unit', area: A, unit: 'v1', title: 'Versor (vector unitario)', levels: [3],
    gen: (r) => {
      const t = r.pick(TRIPLES)
      const v = [t[0] * r.pick([1, -1]), t[1] * r.pick([1, -1])]
      const u = v.map((c) => frac(c, t[2]))
      return make({
        subtopic: 'Versor', concepts: ['v1.modulo'], level: 3, levelWhy: 'Nivel Analista: combinar módulo y producto por escalar.',
        prompt: `Hallá el versor (vector de módulo 1) en la dirección de $\\vec v = ${vecTeX(v)}$.`,
        hints: ['Dividí el vector por su módulo.', `$|\\vec v| = ${t[2]}$.`],
        solution: [{ text: '', tex: `\\hat v = \\frac{\\vec v}{|\\vec v|} = \\left(${u.map(fstr).join(',\\ ')}\\right)` }],
        explanation: 'El versor conserva dirección y sentido pero tiene longitud 1. Se usa para indicar "solo la dirección".',
      }, { kind: 'fill', parts: compBlanks(u.map(fstr)) })
    },
  },

  /* ============ v2 · Operaciones ============ */
  {
    id: 'v2.linear', area: A, unit: 'v2', title: 'Combinaciones de vectores', levels: [1, 2],
    gen: (r, level) => {
      const n = level === 1 ? 2 : 3
      const u = rv(r, n), v = rv(r, n)
      const a = level === 1 ? 1 : r.pick([2, 3, -2]), b = level === 1 ? 1 : r.pick([1, -1, -3, 2])
      const w = u.map((c, i) => a * c + b * v[i])
      const lbl = level === 1 ? '\\vec u + \\vec v' : `${a}\\vec u ${b < 0 ? '-' : '+'} ${Math.abs(b) === 1 ? '' : Math.abs(b)}\\vec v`
      return make({
        subtopic: 'Suma y producto por escalar', concepts: ['v2.operaciones'], level, levelWhy: level === 1 ? 'Nivel Explorador: suma componente a componente.' : LV[2],
        prompt: `Con $\\vec u = ${vecTeX(u)}$ y $\\vec v = ${vecTeX(v)}$, calculá $${lbl}$.`,
        plot: n === 2 ? { vectors: [{ to: [u[0], u[1]], label: 'u' }, { to: [v[0], v[1]], label: 'v' }, { to: [w[0], w[1]], label: 'resultado', color: 'ok' }], x: [-12, 12], y: [-12, 12] } : undefined,
        hints: ['Se opera componente a componente.', level === 1 ? 'Gráficamente: poné la cola de $\\vec v$ en la punta de $\\vec u$ (regla del paralelogramo).' : 'Primero multiplicá cada vector por su número.'],
        solution: [{ text: '', tex: `${lbl} = ${vecTeX(w)}` }],
        explanation: 'Sumar vectores es encadenar desplazamientos; multiplicar por un número estira (y si es negativo, da vuelta) el vector.',
      }, { kind: 'fill', parts: compBlanks(w) })
    },
  },
  fixed('v2.tf.triangle', A, 'v2', 'Desigualdad triangular', (r) => make({
    subtopic: 'Módulo de una suma', concepts: ['v2.operaciones', 'v1.modulo'], level: 2, levelWhy: 'Nivel Aprendiz: intuición geométrica que contradice el "sumar por separado".',
    prompt: 'Desafiá tu intuición:',
    plot: { vectors: [{ to: [3, 0], label: 'u' }, { from: [3, 0], to: [3, 4], label: 'v' }, { to: [3, 4], label: 'u+v', color: 'ok' }], x: [-1, 6], y: [-1, 5] },
    hints: ['Probá con $\\vec u = (3, 0)$ y $\\vec v = (0, 4)$.'],
    solution: [{ text: '$|\\vec u| + |\\vec v| = 3 + 4 = 7$, pero $|\\vec u + \\vec v| = |(3, 4)| = 5$.' }],
    explanation: 'Siempre vale $|\\vec u + \\vec v| \\le |\\vec u| + |\\vec v|$ (en un triángulo, un lado es menor que la suma de los otros dos). La igualdad solo ocurre si apuntan en el mismo sentido.',
  }, { kind: 'tf', statement: 'Para todo par de vectores, $|\\vec u + \\vec v| = |\\vec u| + |\\vec v|$.', answer: false, reasons: r.shuffle([
    { text: 'Falso: con $(3,0)$ y $(0,4)$ da $5 \\neq 7$.', correct: true },
    { text: 'Verdadero: el módulo es lineal.', why: 'No lo es: la raíz no se reparte en sumas.', errorTag: 'modulo-lineal' },
    { text: 'Falso: siempre es mayor $|\\vec u + \\vec v|$.', why: 'Al revés: nunca es mayor.' },
  ]) })),

  /* ============ v3 · Producto escalar ============ */
  {
    id: 'v3.dot', area: A, unit: 'v3', title: 'Producto escalar', levels: [1, 2],
    gen: (r, level) => {
      const n = level === 1 ? 2 : 3
      const u = rv(r, n), v = rv(r, n)
      const d = dot(u, v)
      return make({
        subtopic: 'Producto escalar', concepts: ['v3.escalar'], level, levelWhy: level === 1 ? LV[1] : LV[2],
        prompt: `Calculá $\\vec u \\cdot \\vec v$ con $\\vec u = ${vecTeX(u)}$ y $\\vec v = ${vecTeX(v)}$.`,
        hints: ['Multiplicá componente a componente y sumá.', `$${u.map((c, i) => `${par(c)}\\cdot ${par(v[i])}`).join(' + ')}$`],
        solution: [{ text: '', tex: `\\vec u\\cdot\\vec v = ${u.map((c, i) => `${par(c)}\\cdot ${par(v[i])}`).join(' + ')} = ${d}` }],
        explanation: 'El producto escalar da un **número**, no un vector. Mide cuánto "apuntan para el mismo lado" los dos vectores.',
        commonErrors: ['Dar un vector como resultado.'],
      }, { kind: 'numeric', answer: d })
    },
  },
  {
    id: 'v3.sign', area: A, unit: 'v3', title: 'Signo del producto escalar', levels: [1],
    gen: (r) => {
      const q = r.pick([
        { s: 'positivo', ok: 'agudo (menor que 90°)' },
        { s: 'cero', ok: 'recto (90°): son perpendiculares' },
        { s: 'negativo', ok: 'obtuso (mayor que 90°)' },
      ])
      return make({
        subtopic: 'Producto escalar y ángulo', concepts: ['v3.escalar', 'v3.angulo'], level: 1, levelWhy: 'Nivel Explorador: interpretación geométrica, sin cuentas.',
        prompt: `Si $\\vec u \\cdot \\vec v$ es **${q.s}** (y ninguno es nulo), el ángulo entre ellos es…`,
        hints: ['$\\vec u\\cdot\\vec v = |\\vec u||\\vec v|\\cos\\theta$.', 'Los módulos son positivos: el signo lo decide $\\cos\\theta$.'],
        solution: [{ text: `El signo de $\\cos\\theta$ es el del producto escalar: el ángulo es ${q.ok}.` }],
        explanation: 'El producto escalar es una forma rápida de saber si dos vectores forman ángulo agudo, recto u obtuso.',
      }, mc(r, ['agudo (menor que 90°)', 'recto (90°): son perpendiculares', 'obtuso (mayor que 90°)'].map((t) => (t === q.ok ? { text: t, correct: true } : { text: t, why: 'Pensá en el signo del coseno.' }))))
    },
  },
  {
    id: 'v3.angle', area: A, unit: 'v3', title: 'Ángulo entre vectores', levels: [3],
    gen: (r) => {
      const q = r.pick([
        { u: [1, 0], v: [1, 1] }, { u: [1, 1], v: [-1, 1] }, { u: [2, 0], v: [-1, 1] }, { u: [1, 0], v: [-1, 0] },
        { u: [3, 4], v: [4, 3] }, { u: [1, 2], v: [2, -1] }, { u: [1, 0], v: [1, 1.7320508075688772] }, { u: [0, 2], v: [3, 3] }, { u: [1, 2, 2], v: [2, 1, -2] },
      ])
      const deg = angleDeg(q.u, q.v)!
      const show = (v: number[]) => vecTeX(v).replace('1{,}732', '\\sqrt3')
      return make({
        subtopic: 'Ángulo entre vectores', concepts: ['v3.angulo'], level: 3, levelWhy: 'Nivel Analista: combinar producto escalar, módulos y arco coseno.',
        prompt: `Calculá el ángulo (en grados) entre $\\vec u = ${show(q.u)}$ y $\\vec v = ${show(q.v)}$.`,
        hints: ['$\\cos\\theta = \\dfrac{\\vec u\\cdot\\vec v}{|\\vec u|\\,|\\vec v|}$', `$\\vec u\\cdot\\vec v = ${fmt(dot(q.u, q.v))}$.`, 'Después aplicá $\\arccos$ (en grados).'],
        solution: [{ text: '', tex: `\\cos\\theta = \\frac{${fmt(dot(q.u, q.v))}}{${fmt(norm(q.u), 3)}\\cdot ${fmt(norm(q.v), 3)}} \\Rightarrow \\theta \\approx ${fmt(deg, 2)}°` }],
        explanation: 'La fórmula sale de despejar $\\cos\\theta$ en $\\vec u\\cdot\\vec v = |\\vec u||\\vec v|\\cos\\theta$.',
      }, { kind: 'numeric', answer: deg, tol: { abs: 0.6 }, unit: '°', wrong: Math.abs(deg - 90) > 1 ? [{ value: 180 - deg, why: 'Revisá el signo del producto escalar: el coseno negativo da un ángulo obtuso.', errorTag: 'signo' }] : [] })
    },
  },
  {
    id: 'v3.perp', area: A, unit: 'v3', title: 'Condición de perpendicularidad', levels: [3],
    gen: (r) => {
      const a = r.nonZero(-5, 5), b = r.int(-5, 5), c = r.nonZero(-4, 4)
      // (a, b)·(k, c) = 0 → k = -bc/a
      const kF = frac(-b * c, a)
      return make({
        subtopic: 'Perpendicularidad', concepts: ['v3.escalar', 'v3.angulo'], level: 3, levelWhy: 'Nivel Analista: plantear una ecuación a partir de una propiedad geométrica.',
        prompt: `¿Para qué valor de $k$ los vectores $(${a}, ${b})$ y $(k, ${c})$ son perpendiculares?`,
        hints: ['Perpendiculares ⇔ producto escalar 0.', `$${a}k + ${par(b)}\\cdot ${par(c)} = 0$`],
        solution: [{ text: '', tex: `${a}k ${b * c < 0 ? '-' : '+'} ${Math.abs(b * c)} = 0 \\Rightarrow k = ${fstr(kF)}` }],
        explanation: 'Si $\\theta = 90°$, $\\cos\\theta = 0$ y el producto escalar se anula.',
      }, { kind: 'numeric', answer: fval(kF), answerText: fstr(kF), wrong: b * c !== 0 ? [{ value: -fval(kF), why: 'Revisá el despeje: el signo quedó cambiado.', errorTag: 'signo' }] : [] })
    },
  },

  /* ============ v4 · Proyecciones y producto vectorial ============ */
  {
    id: 'v4.proj', area: A, unit: 'v4', title: 'Proyección de un vector', levels: [3, 4],
    gen: (r, level) => {
      const t = r.pick(TRIPLES)
      const b = [t[0] * r.pick([1, -1]), t[1] * r.pick([1, -1])]
      const a = rv(r, 2)
      const scal = frac(dot(a, b), t[2])
      if (level === 3) {
        return make({
          subtopic: 'Proyección escalar', concepts: ['v4.proyeccion'], level, levelWhy: 'Nivel Analista: la fórmula combina producto escalar y módulo.',
          prompt: `Calculá la proyección **escalar** de $\\vec a = ${vecTeX(a)}$ sobre $\\vec b = ${vecTeX(b)}$.`,
          plot: { vectors: [{ to: [a[0], a[1]], label: 'a' }, { to: [b[0], b[1]], label: 'b' }], x: [-13, 13], y: [-13, 13] },
          hints: ['$\\operatorname{comp}_{\\vec b}\\vec a = \\dfrac{\\vec a\\cdot\\vec b}{|\\vec b|}$', `$|\\vec b| = ${t[2]}$.`],
          solution: [{ text: '', tex: `\\frac{${dot(a, b)}}{${t[2]}} = ${fstr(scal)}` }],
          explanation: 'Es "la sombra" de $\\vec a$ sobre la recta de $\\vec b$, con signo (negativa si forman ángulo obtuso).',
        }, { kind: 'numeric', answer: fval(scal), answerText: fstr(scal), wrong: dot(a, b) !== 0 ? [{ value: dot(a, b) / (t[2] * t[2]), why: 'Dividiste por $|\\vec b|^2$: eso es el coeficiente de la proyección **vectorial**.', errorTag: 'proyeccion' }] : [] })
      }
      const k = frac(dot(a, b), t[2] * t[2])
      const pv = b.map((c) => frac(c * k.n, k.d))
      return make({
        subtopic: 'Proyección vectorial', concepts: ['v4.proyeccion'], level, levelWhy: 'Nivel Experto: fracciones y diferencia entre proyección escalar y vectorial.',
        prompt: `Calculá la proyección **vectorial** de $\\vec a = ${vecTeX(a)}$ sobre $\\vec b = ${vecTeX(b)}$.`,
        plot: { vectors: [{ to: [a[0], a[1]], label: 'a' }, { to: [b[0], b[1]], label: 'b' }], x: [-13, 13], y: [-13, 13] },
        hints: ['$\\operatorname{proy}_{\\vec b}\\vec a = \\dfrac{\\vec a\\cdot\\vec b}{|\\vec b|^2}\\,\\vec b$', `$\\vec a\\cdot\\vec b = ${dot(a, b)}$, $|\\vec b|^2 = ${t[2] * t[2]}$.`],
        solution: [{ text: '', tex: `\\frac{${dot(a, b)}}{${t[2] * t[2]}}${vecTeX(b)} = \\left(${pv.map(fstr).join(',\\ ')}\\right)` }],
        explanation: 'La proyección vectorial es un vector paralelo a $\\vec b$ cuyo largo es la proyección escalar.',
        estMinutes: 6,
      }, { kind: 'fill', parts: compBlanks(pv.map(fstr)) })
    },
  },
  {
    id: 'v4.cross', area: A, unit: 'v4', title: 'Producto vectorial', levels: [3, 4],
    gen: (r, level) => {
      const u = rvNZ(r, 3, -3, 3), v = rvNZ(r, 3, -3, 3)
      const c = cross(u, v)
      if (level === 3 || c.every((x) => x === 0)) {
        return make({
          subtopic: 'Producto vectorial', concepts: ['v4.vectorial'], level, levelWhy: 'Nivel Analista: determinante simbólico 3×3 con cuidado en los signos.',
          prompt: `Calculá $\\vec u \\times \\vec v$ con $\\vec u = ${vecTeX(u)}$ y $\\vec v = ${vecTeX(v)}$.`,
          hints: ['$\\vec u\\times\\vec v = \\begin{vmatrix}\\hat i&\\hat j&\\hat k\\\\u_1&u_2&u_3\\\\v_1&v_2&v_3\\end{vmatrix}$', 'Ojo: la componente $\\hat j$ lleva un **menos** adelante.', `$x$: $${par(u[1])}\\cdot ${par(v[2])} - ${par(u[2])}\\cdot ${par(v[1])}$`],
          solution: [{ text: '', tex: `\\vec u\\times\\vec v = ${vecTeX(c)}` }, { text: `Control: es perpendicular a los dos ($\\vec u\\cdot(\\vec u\\times\\vec v) = 0$).` }],
          explanation: 'El producto vectorial da un vector perpendicular a ambos, con módulo igual al área del paralelogramo que forman.',
          commonErrors: ['Olvidar el signo menos de la componente $\\hat j$.'],
          estMinutes: 5,
        }, { kind: 'fill', parts: compBlanks(c) })
      }
      const area = norm(c)
      return make({
        subtopic: 'Área con producto vectorial', concepts: ['v4.vectorial', 'v1.modulo'], level, levelWhy: 'Nivel Experto: producto vectorial + módulo + interpretación geométrica.',
        prompt: `Calculá el área del **triángulo** determinado por $\\vec u = ${vecTeX(u)}$ y $\\vec v = ${vecTeX(v)}$ (con origen común).`,
        hints: ['Área del paralelogramo $= |\\vec u\\times\\vec v|$.', 'El triángulo es la mitad.', `$\\vec u\\times\\vec v = ${vecTeX(c)}$.`],
        solution: [{ text: '', tex: `\\frac{|${vecTeX(c)}|}{2} = \\frac{\\sqrt{${dot(c, c)}}}{2} \\approx ${fmt(area / 2, 3)}` }],
        explanation: 'El módulo del producto vectorial es $|\\vec u||\\vec v|\\operatorname{sen}\\theta$: base por altura del paralelogramo.',
        estMinutes: 7,
      }, { kind: 'numeric', answer: area / 2, tol: { rel: 1e-4 }, wrong: [{ value: area, why: 'Ese es el área del paralelogramo; el triángulo es la mitad.', errorTag: 'triangulo-mitad' }] })
    },
  },

  /* ============ v5 · Combinación lineal y dependencia ============ */
  {
    id: 'v5.combination', area: A, unit: 'v5', title: 'Escribir como combinación lineal', levels: [3],
    gen: (r) => {
      let u: number[], v: number[]
      do { u = rv(r, 2, -3, 3); v = rv(r, 2, -3, 3) } while (det2(u, v) === 0)
      const a = r.int(-3, 3), b = r.int(-3, 3)
      const w = [a * u[0] + b * v[0], a * u[1] + b * v[1]]
      return make({
        subtopic: 'Combinación lineal', concepts: ['v5.combinacion'], level: 3, levelWhy: 'Nivel Analista: plantear y resolver un sistema 2×2.',
        prompt: `Hallá $\\alpha$ y $\\beta$ tales que $${vecTeX(w)} = \\alpha${vecTeX(u)} + \\beta${vecTeX(v)}$.`,
        plot: { vectors: [{ to: [u[0], u[1]], label: 'u' }, { to: [v[0], v[1]], label: 'v' }, { to: [w[0], w[1]], label: 'w', color: 'ok' }], x: [-12, 12], y: [-12, 12] },
        hints: ['Igualá componente a componente: queda un sistema de dos ecuaciones.', `$\\begin{cases}${par(u[0])}\\alpha + ${par(v[0])}\\beta = ${w[0]}\\\\ ${par(u[1])}\\alpha + ${par(v[1])}\\beta = ${w[1]}\\end{cases}$`],
        solution: [{ text: `$\\alpha = ${a}$, $\\beta = ${b}$.` }, { text: 'Control: reemplazá y verificá las dos componentes.' }],
        explanation: 'Como $\\vec u$ y $\\vec v$ no son paralelos, forman una base del plano: cualquier vector se escribe de **una única** forma como combinación de ellos.',
        estMinutes: 5,
      }, { kind: 'fill', parts: ['$\\alpha =$', { blank: true, id: 'a', answer: String(a), mode: 'number', size: 4 }, ', $\\beta =$', { blank: true, id: 'b', answer: String(b), mode: 'number', size: 4 }] })
    },
  },
  {
    id: 'v5.dependent', area: A, unit: 'v5', title: '¿Para qué k son linealmente dependientes?', levels: [3, 4],
    gen: (r, level) => {
      if (level === 3) {
        const a = r.nonZero(-4, 4), b = r.int(-6, 6), m = r.pick([2, 3, -2, -1])
        // (a, b) y (m a, k): LD ⇔ a k − b m a = 0 ⇔ k = m b
        const k = m * b
        return make({
          subtopic: 'Dependencia lineal', concepts: ['v5.dependencia'], level, levelWhy: 'Nivel Analista: traducir "dependientes" a una ecuación.',
          prompt: `¿Para qué $k$ son linealmente dependientes $(${a}, ${b})$ y $(${m * a}, k)$?`,
          hints: ['Dos vectores del plano son LD ⇔ son paralelos ⇔ su determinante es 0.', `$\\det = ${a}k - ${par(b)}\\cdot ${par(m * a)}$`],
          solution: [{ text: '', tex: `${a}k - ${par(b * m * a)} = 0 \\Rightarrow k = ${k}` }, { text: `(El segundo es ${m} veces el primero.)` }],
          explanation: 'Linealmente dependientes = uno es múltiplo del otro (en el plano, apuntan en la misma recta).',
        }, { kind: 'numeric', answer: k })
      }
      const p = r.int(1, 3), q = r.int(1, 3)
      // u = (1, 0, p), v = (0, 1, q), w = (1, 1, k): LD ⇔ det = k − p − q = 0
      const k = p + q
      return make({
        subtopic: 'Dependencia lineal en R³', concepts: ['v5.dependencia', 'm4.determinante'], level, levelWhy: 'Nivel Experto: usa determinantes 3×3 (Matrices) para decidir dependencia.',
        prompt: `¿Para qué $k$ son linealmente dependientes $(1, 0, ${p})$, $(0, 1, ${q})$ y $(1, 1, k)$?`,
        hints: ['Tres vectores de $\\mathbb R^3$ son LD ⇔ el determinante de la matriz que forman es 0.', `$\\det = k - ${p} - ${q}$.`],
        solution: [{ text: '', tex: `\\begin{vmatrix}1&0&${p}\\\\0&1&${q}\\\\1&1&k\\end{vmatrix} = k - ${p + q} = 0 \\Rightarrow k = ${k}` }, { text: 'Con ese $k$, el tercero es la suma de los otros dos.' }],
        explanation: 'Si el determinante es 0, los tres vectores están en un mismo plano: no generan todo el espacio.',
      }, { kind: 'numeric', answer: k })
    },
  },
  fixed('v5.tf.zero', A, 'v5', 'El vector nulo y la dependencia', (r) => make({
    subtopic: 'Dependencia lineal', concepts: ['v5.dependencia'], level: 4, levelWhy: 'Nivel Experto: caso límite de la definición que confunde a muchos.',
    prompt: 'Decidí y justificá:',
    hints: ['Buscá una combinación $\\alpha\\vec u + \\beta\\vec 0 = \\vec 0$ con algún coeficiente no nulo.'],
    solution: [{ text: '$0\\cdot\\vec u + 1\\cdot\\vec 0 = \\vec 0$ es una combinación nula con un coeficiente distinto de 0: el conjunto es LD.' }],
    explanation: 'Cualquier conjunto que contenga al vector nulo es linealmente dependiente.',
  }, { kind: 'tf', statement: 'El conjunto $\\{\\vec u, \\vec 0\\}$ (con $\\vec u \\neq \\vec 0$) es linealmente independiente.', answer: false, reasons: r.shuffle([
    { text: 'Falso: $0\\vec u + 1\\cdot\\vec 0 = \\vec 0$ con un coeficiente no nulo.', correct: true },
    { text: 'Verdadero: $\\vec 0$ no es múltiplo de $\\vec u$.', why: 'Sí lo es: $\\vec 0 = 0\\cdot\\vec u$.', errorTag: 'ld-nulo' },
    { text: 'Verdadero: dos vectores distintos siempre son LI.', why: 'Pueden ser paralelos (y el nulo es paralelo a todos).' },
  ]) })),

  /* ============ v6 · Bases y dimensión ============ */
  {
    id: 'v6.basis', area: A, unit: 'v6', title: '¿Es una base?', levels: [3],
    gen: (r) => {
      let u: number[], v: number[]
      do { u = rvNZ(r, 2, -3, 3); v = rvNZ(r, 2, -3, 3) } while (det2(u, v) === 0)
      const m = r.pick([2, -1, 3])
      const opts = r.shuffle([
        { text: `$\\{${vecTeX(u)},\\ ${vecTeX(v)}\\}$`, correct: true, why: `Determinante $${det2(u, v)} \\neq 0$: son LI y son 2.` },
        { text: `$\\{${vecTeX(u)},\\ ${vecTeX(u.map((c) => m * c))}\\}$`, why: 'Son paralelos (uno es múltiplo del otro): son LD.', errorTag: 'base-ld' },
        { text: `$\\{${vecTeX(u)}\\}$`, why: 'Un solo vector genera una recta, no todo el plano.', errorTag: 'base-generador' },
        { text: `$\\{${vecTeX(u)},\\ ${vecTeX(v)},\\ ${vecTeX([u[0] + v[0], u[1] + v[1]])}\\}$`, why: 'Tres vectores en el plano siempre son LD.', errorTag: 'base-ld' },
      ])
      return make({
        subtopic: 'Bases', concepts: ['v6.base'], level: 3, levelWhy: 'Nivel Analista: verificar las dos condiciones (LI y generador).',
        prompt: '¿Cuál de estos conjuntos es una base de $\\mathbb R^2$?',
        hints: ['Una base de $\\mathbb R^2$ tiene exactamente 2 vectores LI.', 'Dos vectores del plano son LI ⇔ su determinante es distinto de 0.'],
        solution: [{ text: 'Solo el conjunto de dos vectores no paralelos.' }],
        explanation: 'Base = conjunto LI que genera el espacio. En $\\mathbb R^n$, cualquier base tiene exactamente $n$ vectores: esa es la dimensión.',
      }, { kind: 'mc', options: opts })
    },
  },
  {
    id: 'v6.coords', area: A, unit: 'v6', title: 'Coordenadas en otra base', levels: [4],
    gen: (r) => {
      let u: number[], v: number[]
      do { u = rv(r, 2, -2, 3); v = rv(r, 2, -2, 3) } while (Math.abs(det2(u, v)) !== 1)
      const a = r.int(-4, 4), b = r.int(-4, 4)
      const w = [a * u[0] + b * v[0], a * u[1] + b * v[1]]
      return make({
        subtopic: 'Coordenadas', concepts: ['v6.base', 'v5.combinacion'], level: 4, levelWhy: 'Nivel Experto: cambio de base, equivale a resolver un sistema (o invertir una matriz).',
        prompt: `Sea $B = \\{${vecTeX(u)},\\ ${vecTeX(v)}\\}$. Hallá las coordenadas de $\\vec w = ${vecTeX(w)}$ en la base $B$.`,
        hints: ['Las coordenadas son los coeficientes $(\\alpha, \\beta)$ de $\\vec w = \\alpha\\vec b_1 + \\beta\\vec b_2$.', 'Planteá el sistema o usá la inversa de la matriz con los vectores de $B$ como columnas.'],
        solution: [{ text: '', tex: `[\\vec w]_B = (${a},\\ ${b})` }],
        explanation: 'Un mismo vector tiene distintas coordenadas según la base: son las "instrucciones" para armarlo con esos vectores.',
        estMinutes: 7,
      }, { kind: 'fill', parts: compBlanks([a, b], ['a', 'b']) })
    },
  },
  {
    id: 'v6.dim', area: A, unit: 'v6', title: 'Dimensión del espacio generado', levels: [2],
    gen: (r) => {
      const u = rvNZ(r, 3, -3, 3)
      const q = r.pick([
        { set: [u, u.map((c) => 2 * c)], dim: 1, why: 'Son paralelos: generan una recta.' },
        { set: [[1, 0, 0], [0, 1, 0]], dim: 2, why: 'Dos vectores no paralelos: generan un plano.' },
        { set: [[1, 0, 0], [0, 1, 0], [1, 1, 0]], dim: 2, why: 'El tercero es la suma de los otros dos: siguen generando un plano.' },
        { set: [[1, 0, 0], [0, 1, 0], [0, 0, 1]], dim: 3, why: 'Son la base canónica: generan todo $\\mathbb R^3$.' },
      ])
      return make({
        subtopic: 'Dimensión', concepts: ['v6.base'], level: 2, levelWhy: 'Nivel Aprendiz: reconocer combinaciones evidentes.',
        prompt: `¿Cuál es la dimensión del subespacio generado por $${q.set.map(vecTeX).join(',\\ ')}$?`,
        hints: ['Contá cuántos vectores **independientes** hay.', '¿Alguno es combinación de los otros?'],
        solution: [{ text: `Dimensión ${q.dim}. ${q.why}` }],
        explanation: 'La dimensión es la cantidad máxima de vectores LI: sobrar vectores no agranda el espacio generado.',
      }, { kind: 'numeric', answer: q.dim, wrong: q.set.length !== q.dim ? [{ value: q.set.length, why: 'No alcanza con contar vectores: hay que contar los **independientes**.', errorTag: 'dimension-contar' }] : [] })
    },
  },
  {
    id: 'v6.parcial', area: A, unit: 'v6', title: 'Problema tipo parcial de vectores', levels: [5],
    gen: (r) => {
      const t = r.pick(TRIPLES)
      const u = [t[0], t[1]]
      const v = [r.nonZero(-4, 4), r.int(-4, 4)]
      const k = frac(-u[0] * v[0], u[1])
      return make({
        subtopic: 'Integrador de vectores', concepts: ['v1.modulo', 'v3.escalar', 'v3.angulo', 'v4.proyeccion'], level: 5, levelWhy: LV[5],
        prompt: `Sean $\\vec u = ${vecTeX(u)}$ y $\\vec v = ${vecTeX(v)}$.`,
        hints: ['a) Pitágoras.', 'b) Componente a componente.', 'c) Proyección escalar $= \\frac{\\vec v\\cdot\\vec u}{|\\vec u|}$.', `d) $(x, ${v[0]})$… planteá el producto escalar con $\\vec u$ igual a 0.`],
        solution: [{ text: `a) $|\\vec u| = ${t[2]}$.` }, { text: `b) $\\vec u\\cdot\\vec v = ${dot(u, v)}$.` }, { text: `c) $\\operatorname{comp}_{\\vec u}\\vec v = ${fstr(frac(dot(u, v), t[2]))}$.` }, { text: `d) $${u[0]}\\cdot ${par(v[0])} + ${u[1]}k = 0 \\Rightarrow k = ${fstr(k)}$.` }],
        explanation: 'Los problemas de parcial combinan cálculo (módulo, producto escalar) con interpretación (proyección, perpendicularidad).',
        estMinutes: 12,
      }, { kind: 'multi', parts: [
        { label: 'a', prompt: '$|\\vec u| =$', points: 1, kind: 'numeric', answer: t[2], wrong: [{ value: t[2] * t[2], why: 'Falta la raíz.', errorTag: 'sin-raiz' }] },
        { label: 'b', prompt: '$\\vec u\\cdot\\vec v =$', points: 1, kind: 'numeric', answer: dot(u, v) },
        { label: 'c', prompt: 'Proyección escalar de $\\vec v$ sobre $\\vec u$:', points: 1, kind: 'numeric', answer: dot(u, v) / t[2], answerText: fstr(frac(dot(u, v), t[2])) },
        { label: 'd', prompt: `Valor de $k$ para que $(${v[0]}, k)$ sea perpendicular a $\\vec u$:`, points: 1, kind: 'numeric', answer: fval(k), answerText: fstr(k) },
      ] })
    },
  },
  {
    id: 'v6.final', area: A, unit: 'v6', title: 'Problema tipo final de vectores', levels: [6],
    gen: (r) => {
      const p = r.int(1, 3), q = r.int(1, 3)
      const u = [1, 0, p], v = [0, 1, q]
      const n = cross(u, v)
      const k = p + q
      return make({
        subtopic: 'Integrador final', concepts: ['v4.vectorial', 'v5.dependencia', 'v6.base', 'm4.determinante'], level: 6, levelWhy: LV[6] + ' Combina producto vectorial, dependencia, bases y determinantes (Matrices).',
        prompt: `Sean $\\vec u = ${vecTeX(u)}$, $\\vec v = ${vecTeX(v)}$ y $\\vec w = (1, 1, k)$.`,
        hints: ['a) Determinante simbólico.', 'b) LD ⇔ $\\det(\\vec u, \\vec v, \\vec w) = 0$.', 'c) $\\vec n = \\vec u\\times\\vec v$ es perpendicular al plano que generan.', 'd) Una base de $\\mathbb R^3$ necesita 3 vectores LI.'],
        solution: [{ text: '', tex: `\\text{a) } \\vec u\\times\\vec v = ${vecTeX(n)}` }, { text: `b) $\\det = k - ${k}$: LD para $k = ${k}$.` }, { text: `c) $\\vec w\\cdot\\vec n = ${n[0]} + ${n[1]} + k = k - ${k}$: coincide con el determinante (es el producto mixto).` }, { text: `d) Para $k \\neq ${k}$ son LI y forman una base.` }],
        explanation: 'El producto mixto $\\vec w\\cdot(\\vec u\\times\\vec v)$ es el determinante: mide el volumen del paralelepípedo. Volumen 0 ⇔ coplanares ⇔ LD.',
        estMinutes: 18,
      }, { kind: 'multi', parts: [
        { label: 'a', prompt: '$\\vec u\\times\\vec v =$', points: 1, kind: 'fill', parts: compBlanks(n) },
        { label: 'b', prompt: 'Valor de $k$ para el cual son linealmente dependientes:', points: 1, kind: 'numeric', answer: k },
        { label: 'c', prompt: `Con $k = ${k + 1}$, el volumen del paralelepípedo que forman:`, points: 1, kind: 'numeric', answer: 1, wrong: [{ value: 0, why: 'Con ese $k$ el determinante no es 0.' }] },
        { label: 'd', prompt: 'Teoría:', points: 1, kind: 'tf', statement: `Para $k = ${k}$, $\\{\\vec u, \\vec v, \\vec w\\}$ es una base de $\\mathbb R^3$.`, answer: false, reasons: r.shuffle([{ text: 'Falso: con ese $k$ son LD (coplanares) y no generan $\\mathbb R^3$.', correct: true }, { text: 'Verdadero: son tres vectores de $\\mathbb R^3$.', why: 'Tres vectores no alcanzan si son LD.', errorTag: 'base-ld' }, { text: 'Falso: una base de $\\mathbb R^3$ necesita 4 vectores.', why: 'Necesita exactamente 3 (la dimensión).' }]) },
      ] })
    },
  },
]
