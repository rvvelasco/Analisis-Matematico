import type { Template } from '../../engine/types'
import { fixed, fracStr, fracTeX, LV, make, mc, par, poly, sgn, T } from './helpers'

const A = 'funciones' as const

export const FUNCIONES: Template[] = [
  /* ============ f1 · Concepto de función ============ */
  {
    id: 'f1.eval', area: A, unit: 'f1', title: 'Evaluar una función', levels: [1, 2],
    gen: (r, level) => {
      const a = r.nonZero(-4, 4), b = r.int(-6, 6), c = r.int(-5, 5)
      const x0 = level === 1 ? r.int(0, 4) : r.int(-4, -1)
      const f = level === 1 ? poly([a, b]) : poly([a, b, c])
      const val = level === 1 ? a * x0 + b : a * x0 * x0 + b * x0 + c
      const wrongSq = level === 2 ? a * -(x0 * x0) + b * x0 + c : null
      return make({
        subtopic: 'Notación funcional y evaluación', concepts: ['f1.evaluar'], level,
        levelWhy: level === 1 ? LV[1] : 'Nivel Aprendiz: hay que reemplazar un número negativo y respetar el orden de las operaciones (trampa del signo).',
        prompt: `Si $f(x) = ${T(f)}$, calculá $f(${x0})$.`,
        hints: ['Evaluar es **reemplazar** cada $x$ por el número, entre paréntesis.', `Escribí $f(${x0})$ reemplazando: cada $x$ pasa a ser $(${x0})$.`, level === 2 ? `Cuidado: $(${x0})^2 = ${x0 * x0}$ (menos por menos da más).` : 'Primero la multiplicación, después la suma.'],
        solution: [
          { text: 'Reemplazamos $x$ por el valor, entre paréntesis:', tex: `f(${x0}) = ${T(f.replace(/x/g, `(${x0})`))}` },
          ...(level === 2 ? [{ text: `Primero la potencia: $(${x0})^2 = ${x0 * x0}$.` }] : []),
          { text: `Resolvemos las operaciones respetando el orden: resultado **${val}**.` },
        ],
        explanation: 'La notación $f(a)$ significa "lo que devuelve la función cuando entra $a$". No es una multiplicación $f\\cdot a$.',
        commonErrors: ['Olvidar los paréntesis al reemplazar un negativo: $-3^2 \\neq (-3)^2$.'],
        noCalc: true,
      }, { kind: 'numeric', answer: val, wrong: wrongSq !== null && wrongSq !== val ? [{ value: wrongSq, why: `Calculaste $x^2$ como $-${x0 * x0}$. Al reemplazar un negativo hay que usar paréntesis: $(${x0})^2 = ${x0 * x0}$, positivo.`, errorTag: 'potencia-negativo' }] : [] })
    },
  },
  {
    id: 'f1.isFunction', area: A, unit: 'f1', title: '¿Es una función?', levels: [1],
    gen: (r) => {
      const xs = r.shuffle([1, 2, 3, 4, 5]).slice(0, 3)
      const ys = () => r.int(0, 9)
      const good = xs.map((x) => `(${x}, ${ys()})`)
      const dupX = xs[0]
      const bad1 = [`(${dupX}, ${ys()})`, `(${dupX}, ${ys() + 10})`, `(${xs[1]}, ${ys()})`]
      const sameY = r.int(1, 9)
      const okSameY = xs.map((x) => `(${x}, ${sameY})`)
      return make({
        subtopic: 'Concepto de función', concepts: ['f1.concepto'], level: 1, levelWhy: LV[1],
        prompt: `Cada conjunto es una relación de $A$ en $B$ dada por pares $(x, y)$. ¿Cuál **no** puede ser una función?`,
        hints: ['Una función le asigna a cada $x$ **un único** $y$.', 'Buscá un mismo $x$ que aparezca con dos $y$ distintos.', 'Que dos $x$ distintos tengan el mismo $y$ **no** es un problema.'],
        solution: [{ text: `En $\\{${bad1.join(', ')}\\}$ el valor $x = ${dupX}$ tiene dos imágenes distintas: eso viola la unicidad.` }],
        explanation: 'Función = cada entrada tiene exactamente una salida. Pueden repetirse salidas (varias $x$ con la misma $y$), pero nunca una entrada con dos salidas.',
        commonErrors: ['Pensar que si dos $x$ tienen la misma imagen ya no es función.'],
      }, mc(r, [
        { text: `$\\{${bad1.join(', ')}\\}$`, correct: true, why: `El $x = ${dupX}$ aparece con dos valores de $y$.` },
        { text: `$\\{${good.join(', ')}\\}$`, why: 'Cada $x$ aparece una sola vez: sí es función.' },
        { text: `$\\{${okSameY.join(', ')}\\}$`, why: 'Todas tienen la misma imagen, pero cada $x$ tiene una sola: es una función constante.', errorTag: 'unicidad-al-reves' },
      ]))
    },
  },
  {
    id: 'f1.domain', area: A, unit: 'f1', title: 'Dominio natural', levels: [2, 3],
    gen: (r, level) => {
      const a = r.int(-5, 5)
      if (level === 2) {
        const kind = r.pick(['sqrt', 'frac', 'ln'] as const)
        const f = kind === 'sqrt' ? `sqrt(x ${sgn(-a)})` : kind === 'frac' ? `1/(x ${sgn(-a)})` : `ln(x ${sgn(-a)})`
        const right = kind === 'sqrt' ? `[${a}, +\\infty)` : kind === 'frac' ? `\\mathbb{R} - \\{${a}\\}` : `(${a}, +\\infty)`
        return make({
          subtopic: 'Dominio', concepts: ['f1.dominio'], level, levelWhy: LV[2],
          prompt: `¿Cuál es el dominio natural de $f(x) = ${T(f)}$?`,
          hints: ['El dominio son los $x$ para los que la fórmula **se puede calcular**.', kind === 'sqrt' ? 'Una raíz cuadrada necesita lo de adentro $\\geq 0$.' : kind === 'frac' ? 'No se puede dividir por 0.' : 'El logaritmo necesita lo de adentro **estrictamente** positivo.', `Planteá la condición sobre $x ${sgn(-a)}$ y despejá.`],
          solution: [
            { text: kind === 'sqrt' ? `Condición: $x ${sgn(-a)} \\geq 0 \\Rightarrow x \\geq ${a}$.` : kind === 'frac' ? `Condición: $x ${sgn(-a)} \\neq 0 \\Rightarrow x \\neq ${a}$.` : `Condición: $x ${sgn(-a)} > 0 \\Rightarrow x > ${a}$.` },
            { text: `Dominio: $${right}$.` },
          ],
          explanation: 'El dominio natural se obtiene descartando lo que "rompe" la fórmula: divisiones por cero, raíces pares de negativos y logaritmos de números $\\leq 0$.',
          commonErrors: ['Usar $>$ en la raíz (el 0 sí está permitido) o $\\geq$ en el logaritmo ($\\ln 0$ no existe).'],
          noCalc: true,
        }, mc(r, [
          { text: `$${right}$`, correct: true },
          { text: kind === 'sqrt' ? `$(${a}, +\\infty)$` : kind === 'ln' ? `$[${a}, +\\infty)$` : `$(${a}, +\\infty)$`, why: kind === 'sqrt' ? 'En la raíz el 0 está permitido: $\\sqrt{0} = 0$. El extremo va incluido.' : kind === 'ln' ? '$\\ln 0$ no existe: el extremo no se incluye.' : 'Solo hay que sacar el valor que anula el denominador; los menores también sirven.', errorTag: 'extremo-dominio' },
          { text: kind === 'frac' ? `$\\mathbb{R} - \\{${-a}\\}$` : `$(-\\infty, ${a}]$`, why: 'Revisá el signo al despejar.', errorTag: 'signo' },
          { text: '$\\mathbb{R}$', why: 'Hay valores de $x$ para los que la fórmula no se puede calcular.' },
        ]))
      }
      // nivel 3: raíz y denominador combinados
      const b = a + r.int(1, 4)
      const f = `sqrt(x ${sgn(-a)})/(x ${sgn(-b)})`
      const right = `[${a}, ${b}) \\cup (${b}, +\\infty)`
      return make({
        subtopic: 'Dominio', concepts: ['f1.dominio'], level, levelWhy: 'Nivel Analista: hay que combinar dos condiciones (raíz y denominador) y unir intervalos.',
        prompt: `Hallá el dominio de $f(x) = ${T(f)}$.`,
        hints: ['Hay **dos** condiciones: una por la raíz y otra por el denominador.', `Raíz: $x ${sgn(-a)} \\geq 0$. Denominador: $x ${sgn(-b)} \\neq 0$.`, `Del intervalo $[${a}, +\\infty)$ sacá el punto $x = ${b}$.`],
        solution: [
          { text: `Raíz: $x ${sgn(-a)} \\geq 0 \\Rightarrow x \\geq ${a}$.` },
          { text: `Denominador: $x \\neq ${b}$, y ${b} está dentro de $[${a}, +\\infty)$.` },
          { text: `Dominio: $${right}$.` },
        ],
        explanation: 'Cuando hay varias restricciones, el dominio es la **intersección** de todas las condiciones.',
        commonErrors: ['Olvidar una de las dos condiciones.', 'Excluir el extremo de la raíz.'],
        noCalc: true,
      }, mc(r, [
        { text: `$${right}$`, correct: true },
        { text: `$[${a}, +\\infty)$`, why: `Te faltó sacar $x = ${b}$, que anula el denominador.`, errorTag: 'falta-condicion' },
        { text: `$(${a}, ${b}) \\cup (${b}, +\\infty)$`, why: `En $x = ${a}$ la raíz vale 0 y el denominador no se anula: ese punto **sí** está.`, errorTag: 'extremo-dominio' },
        { text: `$\\mathbb{R} - \\{${b}\\}$`, why: 'Te faltó la condición de la raíz.', errorTag: 'falta-condicion' },
      ]))
    },
  },
  {
    id: 'f1.image', area: A, unit: 'f1', title: 'Imagen de una cuadrática', levels: [3],
    gen: (r) => {
      const a = r.pick([-3, -2, -1, 1, 2, 3]), h = r.int(-4, 4), k = r.int(-5, 5)
      const f = `${a}*(x ${sgn(-h)})^2 ${sgn(k)}`
      const right = a > 0 ? `[${k}, +\\infty)` : `(-\\infty, ${k}]`
      return make({
        subtopic: 'Imagen', concepts: ['f1.imagen'], level: 3, levelWhy: 'Nivel Analista: hay que razonar sobre todos los valores posibles, no calcular uno.',
        prompt: `¿Cuál es la imagen de $f(x) = ${T(f)}$, con dominio $\\mathbb{R}$?`,
        hints: ['La imagen es el conjunto de **todas las salidas** posibles.', '$(x - h)^2$ es siempre $\\geq 0$ y vale 0 en $x = h$.', a > 0 ? `Con $a = ${a} > 0$, el mínimo valor de $f$ es ${k}.` : `Con $a = ${a} < 0$, el máximo valor de $f$ es ${k}.`],
        solution: [
          { text: `$(x ${sgn(-h)})^2 \\geq 0$ para todo $x$, con mínimo $0$ en $x = ${h}$.` },
          { text: `Multiplicado por $${a}$: ${a > 0 ? 'sigue siendo $\\geq 0$' : 'queda $\\leq 0$'}. Sumando $${k}$: $f(x) ${a > 0 ? '\\geq' : '\\leq'} ${k}$.` },
          { text: `Y todo valor ${a > 0 ? 'mayor' : 'menor'} se alcanza (la parábola es continua). Imagen: $${right}$.` },
        ],
        explanation: 'En la forma canónica $a(x-h)^2+k$ el vértice $(h, k)$ da el valor extremo; el signo de $a$ dice si es mínimo o máximo.',
        commonErrors: ['Confundir dominio con imagen.', 'Ignorar el signo de $a$.'],
        noCalc: true,
      }, mc(r, [
        { text: `$${right}$`, correct: true },
        { text: a > 0 ? `$(-\\infty, ${k}]$` : `$[${k}, +\\infty)$`, why: `Mirá el signo de $a = ${a}$: decide si la parábola abre hacia arriba o hacia abajo.`, errorTag: 'signo-a' },
        { text: '$\\mathbb{R}$', why: 'Ese es el dominio. La imagen de una parábola está acotada por un lado.', errorTag: 'dominio-vs-imagen' },
        { text: a > 0 ? `$[${h}, +\\infty)$` : `$(-\\infty, ${h}]$`, why: 'Usaste la coordenada $x$ del vértice; la imagen habla de valores de $y$.', errorTag: 'dominio-vs-imagen' },
      ]))
    },
  },
  fixed('f1.tf.repeat', A, 'f1', 'Intuición: imágenes repetidas', (r) => make({
    subtopic: 'Concepto de función', concepts: ['f1.concepto'], level: 2, levelWhy: 'Nivel Aprendiz: hay que distinguir dos ideas parecidas (unicidad vs. inyectividad).',
    prompt: 'Decidí y justificá:',
    hints: ['Releé la definición de función: ¿qué tiene que ser único?', 'Pensá en $f(x) = x^2$: $f(2) = f(-2)$.'],
    solution: [{ text: 'Una función exige que cada **entrada** tenga una sola salida. Que dos entradas compartan la salida está permitido: $x^2$ es función y $f(2) = f(-2) = 4$.' }],
    explanation: 'Lo que se pide es unicidad de la imagen para cada $x$. Que $f$ no repita imágenes es otra propiedad: la **inyectividad**.',
    commonErrors: ['Confundir "función" con "función inyectiva".'],
  }, { kind: 'tf', statement: 'Si $f(2) = f(3)$, entonces $f$ no es una función.', answer: false, reasons: r.shuffle([
    { text: 'Falso: dos entradas distintas pueden tener la misma salida; lo prohibido es que una entrada tenga dos salidas.', correct: true },
    { text: 'Verdadero: cada salida debe venir de una sola entrada.', why: 'Eso describe a una función **inyectiva**, no a cualquier función.', errorTag: 'unicidad-al-reves' },
    { text: 'Falso: porque 2 y 3 son números distintos.', why: 'La razón no explica nada sobre la definición de función.' },
  ]) })),

  /* ============ f2 · Gráficos ============ */
  {
    id: 'f2.read', area: A, unit: 'f2', title: 'Leer un gráfico', levels: [1, 2],
    gen: (r, level) => {
      const p = r.int(-4, 0), q = r.int(1, 4)
      const s = r.pick([1, -1])
      const f = `${s}*(x ${sgn(-p)})*(x ${sgn(-q)})`
      const ask = level === 1 ? 'f0' : 'roots'
      const f0 = s * p * q
      const vx = (p + q) / 2
      const vy = s * (vx - p) * (vx - q)
      return make({
        subtopic: 'Representación gráfica', concepts: ['f2.lectura'], level, levelWhy: level === 1 ? LV[1] : 'Nivel Aprendiz: hay que leer dos datos del gráfico y operarlos.',
        prompt: ask === 'f0' ? 'Observá el gráfico de $f$. ¿Cuánto vale $f(0)$?' : 'Observá el gráfico de $f$. ¿Cuánto vale la **suma** de los valores de $x$ donde la gráfica corta al eje $x$?',
        plot: { fns: [{ expr: f, label: 'f' }], points: [{ x: p, y: 0 }, { x: q, y: 0 }, { x: 0, y: f0 }], x: [-6, 6], y: [Math.min(-6, vy - 1), Math.max(6, vy + 1)] },
        hints: ask === 'f0' ? ['$f(0)$ es la altura de la curva cuando $x = 0$.', 'Buscá dónde la curva corta al eje $y$.'] : ['Los cortes con el eje $x$ son los puntos donde $y = 0$.', 'Hay dos: mirá sus coordenadas $x$ (los puntos marcados).'],
        solution: ask === 'f0' ? [{ text: `La curva corta al eje $y$ a la altura ${f0}: $f(0) = ${f0}$.` }] : [{ text: `La curva corta el eje $x$ en $x = ${p}$ y $x = ${q}$. Suma: ${p + q}.` }],
        explanation: 'En el gráfico, el punto $(a, f(a))$ está "parado" sobre $x = a$ a altura $f(a)$. Los cortes con el eje $x$ son los ceros de $f$.',
        commonErrors: ['Confundir el corte con el eje $x$ (ceros) con el corte con el eje $y$ ($f(0)$).'],
      }, { kind: 'numeric', answer: ask === 'f0' ? f0 : p + q, wrong: ask === 'f0' ? [{ value: p, why: 'Ese es un corte con el eje $x$; $f(0)$ es donde corta al eje $y$.', errorTag: 'ejes' }] : [{ value: f0, why: 'Ese es el corte con el eje $y$.', errorTag: 'ejes' }] })
    },
  },
  {
    id: 'f2.intercepts', area: A, unit: 'f2', title: 'Intersecciones con los ejes', levels: [2],
    gen: (r) => {
      const p = r.int(-5, 0), q = r.int(1, 6)
      const b = -(p + q), c = p * q
      const f = poly([1, b, c])
      return make({
        subtopic: 'Intersecciones con los ejes', concepts: ['f2.ceros'], level: 2, levelWhy: LV[2],
        prompt: `Hallá las intersecciones de $f(x) = ${T(f)}$ con los ejes.`,
        hints: ['Corte con el eje $y$: calculá $f(0)$.', 'Cortes con el eje $x$: resolvé $f(x) = 0$.', `Buscá dos números que sumen ${-b} y multipliquen ${c}, o usá la fórmula resolvente.`],
        solution: [
          { text: `Eje $y$: $f(0) = ${c}$.` },
          { text: `Eje $x$: $${T(f)} = 0$. Factorizando: $(x ${sgn(-p)})(x ${sgn(-q)}) = 0$.` },
          { text: `Raíces: $x = ${p}$ y $x = ${q}$.` },
        ],
        explanation: 'Sobre el eje $x$ los puntos tienen $y = 0$; sobre el eje $y$, $x = 0$. Por eso se iguala a cero cada coordenada.',
        noCalc: true,
      }, { kind: 'fill', parts: ['Corte con eje $y$: $f(0) =$', { blank: true, id: 'y0', answer: String(c), mode: 'number' }, '· Raíz menor: $x_1 =$', { blank: true, id: 'x1', answer: String(p), mode: 'number' }, '· Raíz mayor: $x_2 =$', { blank: true, id: 'x2', answer: String(q), mode: 'number' }] })
    },
  },
  {
    id: 'f2.monotony', area: A, unit: 'f2', title: 'Crecimiento de una parábola', levels: [3],
    gen: (r) => {
      const a = r.pick([-2, -1, 1, 2]), h = r.int(-3, 3), k = r.int(-4, 4)
      const f = `${a}*(x ${sgn(-h)})^2 ${sgn(k)}`
      const right = a > 0 ? `(${h}, +\\infty)` : `(-\\infty, ${h})`
      return make({
        subtopic: 'Crecimiento y decrecimiento', concepts: ['f2.crecimiento'], level: 3, levelWhy: 'Nivel Analista: hay que relacionar la forma algebraica con el comportamiento global.',
        plot: { fns: [{ expr: f, label: 'f' }], points: [{ x: h, y: k, label: 'V' }], x: [-7, 7], y: [-8, 8] },
        prompt: `¿En qué intervalo es **creciente** $f(x) = ${T(f)}$?`,
        hints: ['Creciente: al aumentar $x$, aumenta $f(x)$ (la curva sube, leyendo de izquierda a derecha).', `El vértice está en $x = ${h}$: ahí cambia el comportamiento.`, `Con $a ${a > 0 ? '> 0' : '< 0'}$ la parábola ${a > 0 ? 'baja y después sube' : 'sube y después baja'}.`],
        solution: [{ text: `Vértice en $x = ${h}$. Como $a = ${a}$, la parábola ${a > 0 ? 'decrece y luego crece' : 'crece y luego decrece'}.` }, { text: `Creciente en $${right}$.` }],
        explanation: 'Una parábola cambia de crecer a decrecer (o al revés) exactamente en el vértice.',
      }, mc(r, [
        { text: `$${right}$`, correct: true },
        { text: a > 0 ? `$(-\\infty, ${h})$` : `$(${h}, +\\infty)$`, why: 'Ese es el intervalo donde decrece.', errorTag: 'signo-a' },
        { text: `$(${k}, +\\infty)$`, why: `${k} es la altura del vértice ($y$). El crecimiento se describe con valores de $x$.`, errorTag: 'dominio-vs-imagen' },
        { text: '$\\mathbb{R}$', why: 'Una parábola nunca es creciente en todo $\\mathbb{R}$.' },
      ]))
    },
  },

  /* ============ f3 · Lineales ============ */
  {
    id: 'f3.slope', area: A, unit: 'f3', title: 'Pendiente entre dos puntos', levels: [1, 2],
    gen: (r, level) => {
      const x1 = r.int(-4, 3), x2 = x1 + r.int(1, 4)
      const y1 = r.int(-5, 5)
      const num = level === 1 ? (x2 - x1) * r.nonZero(-3, 3) : r.nonZero(-7, 7)
      const y2 = y1 + num
      const m = num / (x2 - x1)
      return make({
        subtopic: 'Pendiente', concepts: ['f3.pendiente'], level, levelWhy: level === 1 ? LV[1] : 'Nivel Aprendiz: la pendiente puede dar fraccionaria y hay que restar con signos.',
        prompt: `¿Cuál es la pendiente de la recta que pasa por $(${x1}, ${y1})$ y $(${x2}, ${y2})$?`,
        plot: { points: [{ x: x1, y: y1, label: 'P' }, { x: x2, y: y2, label: 'Q' }], fns: [{ expr: `${y1} + (${num})/(${x2 - x1})*(x - (${x1}))`, dashed: true }], x: [-7, 8], y: [Math.min(y1, y2) - 3, Math.max(y1, y2) + 3] },
        hints: ['Pendiente = cuánto sube dividido cuánto avanza.', '$m = \\dfrac{y_2 - y_1}{x_2 - x_1}$', `Subió $${y2} - ${par(y1)} = ${num}$ y avanzó $${x2} - ${par(x1)} = ${x2 - x1}$.`],
        solution: [{ text: 'Usamos', tex: `m = \\frac{y_2 - y_1}{x_2 - x_1} = \\frac{${y2} - ${par(y1)}}{${x2} - ${par(x1)}} = \\frac{${num}}{${x2 - x1}} = ${fracTeX(num, x2 - x1)}` }],
        explanation: 'La pendiente mide la variación de $y$ por cada unidad de $x$. Es constante en toda la recta, por eso se puede calcular con cualquier par de puntos.',
        commonErrors: ['Restar en distinto orden arriba y abajo.', 'Invertir el cociente: $\\Delta x / \\Delta y$.'],
        noCalc: true,
      }, { kind: 'numeric', answer: m, answerText: fracStr(num, x2 - x1), wrong: [{ value: (x2 - x1) / num, why: 'Invertiste el cociente: es $\\Delta y / \\Delta x$ (cuánto sube sobre cuánto avanza).', errorTag: 'pendiente-invertida' }] })
    },
  },
  {
    id: 'f3.lineEq', area: A, unit: 'f3', title: 'Ecuación de la recta', levels: [2, 3],
    gen: (r, level) => {
      const x1 = r.int(-3, 3), y1 = r.int(-4, 4)
      let m: number, statement: string, sol: { text: string; tex?: string }[]
      if (level === 2) {
        m = r.nonZero(-4, 4)
        statement = `Escribí la ecuación de la recta de pendiente $${m}$ que pasa por $(${x1}, ${y1})$, en la forma $y = mx + b$.`
        sol = [{ text: 'Punto-pendiente:', tex: `y - ${par(y1)} = ${m}(x - ${par(x1)})` }, { text: 'Despejando:', tex: `y = ${T(poly([m, y1 - m * x1]))}` }]
      } else {
        const dx = r.int(1, 3), dy = r.nonZero(-6, 6)
        m = dy / dx
        const x2 = x1 + dx, y2 = y1 + dy
        statement = `Escribí la ecuación de la recta que pasa por $(${x1}, ${y1})$ y $(${x2}, ${y2})$, en la forma $y = mx + b$.`
        sol = [{ text: 'Pendiente:', tex: `m = \\frac{${y2} - ${par(y1)}}{${x2} - ${par(x1)}} = ${fracTeX(dy, dx)}` }, { text: 'Punto-pendiente con el primer punto:', tex: `y - ${par(y1)} = ${fracTeX(dy, dx)}(x - ${par(x1)})` }]
      }
      const b = y1 - m * x1
      const answer = `(${m})*x + (${b})`
      return make({
        subtopic: 'Ecuación de la recta', concepts: ['f3.ecuacion'], level, levelWhy: level === 2 ? LV[2] : 'Nivel Analista: primero hay que obtener la pendiente y después la ordenada.',
        prompt: statement,
        hints: ['Usá la forma punto-pendiente: $y - y_0 = m(x - x_0)$.', level === 3 ? 'Primero calculá la pendiente con los dos puntos.' : 'Reemplazá $m$, $x_0$ e $y_0$.', 'Distribuí y despejá $y$.'],
        solution: [...sol, { text: `Resultado: $y = ${T(answer.replace(/\(([-\d.]+)\)/g, '$1'))}$ (cualquier forma equivalente es correcta).` }],
        explanation: 'Una recta queda determinada por un punto y su inclinación. La forma punto-pendiente sale de la definición de pendiente: $\\frac{y - y_0}{x - x_0} = m$.',
        commonErrors: ['Equivocar el signo al distribuir: $-m\\cdot(-x_0) = +m x_0$.'],
        noCalc: true,
      }, { kind: 'expression', answer, v: 'x', mode: 'exact', domain: [-5, 5], prefix: 'y =', wrong: x1 !== 0 ? [{ expr: `(${m})*x + (${y1 + m * x1})`, why: 'Error de signo al distribuir: en $y - y_0 = m(x - x_0)$, el término $-m\\cdot(-x_0)$ queda $+m\\,x_0$. Revisá el término independiente.', errorTag: 'signo' }] : [] })
    },
  },
  {
    id: 'f3.slider', area: A, unit: 'f3', title: 'Ajustá la recta', levels: [1],
    gen: (r) => {
      const m = r.pick([-2, -1, -0.5, 0.5, 1, 2, 3]), b = r.int(-3, 3)
      return make({
        subtopic: 'Pendiente y ordenada', concepts: ['f3.pendiente'], level: 1, levelWhy: 'Nivel Explorador: se experimenta con los parámetros y se observa el efecto en el gráfico.',
        prompt: `Mové los controles para que la recta $y = a\\,x + b$ tenga **pendiente ${String(m).replace('.', ',')}** y **corte al eje $y$ en ${b}**.`,
        hints: ['$a$ controla la inclinación; $b$ sube o baja la recta.', 'El corte con el eje $y$ ocurre en $x = 0$: ahí $y = b$.'],
        solution: [{ text: `Hay que poner $a = ${String(m).replace('.', ',')}$ y $b = ${b}$.` }],
        explanation: 'En $y = mx + b$: $m$ es la pendiente (cuánto sube por cada paso a la derecha) y $b$ es la ordenada al origen.',
      }, { kind: 'slider', params: [{ name: 'a', min: -4, max: 4, step: 0.5, init: 1 }, { name: 'b', min: -5, max: 5, step: 1, init: 0 }], base: 'a*x + b', target: `pendiente ${m}, ordenada ${b}`, checkId: 'line', checkArgs: [m, b] })
    },
  },
  {
    id: 'f3.perp', area: A, unit: 'f3', title: 'Recta perpendicular', levels: [3],
    gen: (r) => {
      const m = r.pick([-3, -2, 2, 3, 0.5, -0.5]), b0 = r.int(-3, 3)
      const x1 = r.int(-3, 3), y1 = r.int(-3, 3)
      const mp = -1 / m
      const b = y1 - mp * x1
      return make({
        subtopic: 'Rectas paralelas y perpendiculares', concepts: ['f3.ecuacion'], level: 3, levelWhy: 'Nivel Analista: combina la condición de perpendicularidad con la ecuación por un punto.',
        prompt: `Hallá la recta **perpendicular** a $y = ${T(`${m}*x ${sgn(b0)}`)}$ que pasa por $(${x1}, ${y1})$.`,
        hints: ['Dos rectas son perpendiculares si $m_1 \\cdot m_2 = -1$.', `La pendiente buscada es $-\\frac{1}{${String(m).replace('.', ',')}}$.`, 'Después usá punto-pendiente.'],
        solution: [{ text: `Pendiente perpendicular: $m_\\perp = -1/(${String(m).replace('.', ',')}) = ${String(mp).replace('.', ',')}$.` }, { text: 'Punto-pendiente:', tex: `y - ${par(y1)} = ${String(mp).replace('.', '{,}')}(x - ${par(x1)})` }],
        explanation: 'Girar una recta 90° cambia "sube $m$ por cada 1" en "baja 1 por cada $m$": por eso la pendiente pasa a $-1/m$.',
        commonErrors: ['Usar $-m$ o $1/m$ en vez de $-1/m$.'],
        noCalc: true,
      }, { kind: 'expression', answer: `${mp}*x + (${b})`, v: 'x', mode: 'exact', domain: [-5, 5], prefix: 'y =', wrong: [{ expr: `${-m}*x + (${y1 + m * x1})`, why: 'Usaste $-m$. La perpendicular tiene pendiente $-1/m$ (opuesta **e** inversa).', errorTag: 'perpendicular' }, { expr: `${1 / m}*x + (${y1 - x1 / m})`, why: 'Usaste $1/m$: falta cambiar el signo.', errorTag: 'perpendicular' }, { expr: `${m}*x + (${y1 - m * x1})`, why: 'Esa recta es **paralela** (misma pendiente), no perpendicular.', errorTag: 'perpendicular' }] })
    },
  },

  /* ============ f4 · Cuadráticas ============ */
  {
    id: 'f4.vertex', area: A, unit: 'f4', title: 'Vértice de una parábola', levels: [2],
    gen: (r) => {
      const a = r.pick([-2, -1, 1, 2, 3]), h = r.int(-4, 4), k = r.int(-6, 6)
      const b = -2 * a * h, c = a * h * h + k
      const f = poly([a, b, c])
      return make({
        subtopic: 'Vértice', concepts: ['f4.vertice'], level: 2, levelWhy: LV[2],
        prompt: `Hallá las coordenadas del vértice de $f(x) = ${T(f)}$.`,
        hints: ['La coordenada $x$ del vértice es $x_v = -\\dfrac{b}{2a}$.', `Acá $a = ${a}$ y $b = ${b}$.`, 'La coordenada $y$ es $f(x_v)$.'],
        solution: [{ text: 'Abscisa:', tex: `x_v = -\\frac{${b}}{2\\cdot ${par(a)}} = ${h}` }, { text: 'Ordenada:', tex: `y_v = f(${h}) = ${k}` }],
        explanation: 'La parábola es simétrica respecto de la recta vertical que pasa por el vértice; $x_v$ es el promedio de las raíces (cuando existen).',
        commonErrors: ['Olvidar el signo menos en $-b/2a$.'],
        noCalc: true,
      }, { kind: 'fill', parts: ['Vértice $= ($', { blank: true, id: 'h', answer: String(h), mode: 'number' }, ',', { blank: true, id: 'k', answer: String(k), mode: 'number' }, '$)$'] })
    },
  },
  {
    id: 'f4.roots', area: A, unit: 'f4', title: 'Raíces con la fórmula resolvente', levels: [2, 3],
    gen: (r, level) => {
      const a = level === 2 ? 1 : r.pick([2, 3, -1, -2])
      const p = r.int(-5, 2), q = p + r.int(1, 6)
      const f = poly([a, -a * (p + q), a * p * q])
      return make({
        subtopic: 'Raíces', concepts: ['f4.raices'], level, levelWhy: level === 2 ? LV[2] : 'Nivel Analista: $a \\neq 1$ y hay que manejar la fórmula completa con signos.',
        prompt: `Resolvé $${T(f)} = 0$.`,
        hints: ['Usá $x = \\dfrac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$.', `Discriminante: $b^2 - 4ac = ${(a * (p + q)) ** 2 - 4 * a * a * p * q}$.`, 'Calculá las dos soluciones (con $+$ y con $-$).'],
        solution: [{ text: `$a = ${a}$, $b = ${-a * (p + q)}$, $c = ${a * p * q}$.` }, { text: 'Discriminante:', tex: `\\Delta = ${(a * (p + q)) ** 2 - 4 * a * a * p * q}` }, { text: `Soluciones: $x_1 = ${p}$, $x_2 = ${q}$.` }],
        explanation: 'La fórmula sale de completar cuadrados en $ax^2 + bx + c = 0$; el discriminante decide cuántas raíces reales hay.',
        noCalc: true,
      }, { kind: 'fill', parts: ['Raíz menor $=$', { blank: true, id: 'p', answer: String(p), mode: 'number' }, '· Raíz mayor $=$', { blank: true, id: 'q', answer: String(q), mode: 'number' }] })
    },
  },
  {
    id: 'f4.slider', area: A, unit: 'f4', title: 'Construí la parábola', levels: [2],
    gen: (r) => {
      const h = r.int(-3, 3), k = r.int(-3, 3), a = r.pick([-2, -1, 1, 2])
      const px = h + r.pick([1, 2]), py = a * (px - h) ** 2 + k
      return make({
        subtopic: 'Forma canónica', concepts: ['f4.vertice'], level: 2, levelWhy: 'Nivel Aprendiz: hay que coordinar tres parámetros para cumplir dos condiciones.',
        prompt: `Ajustá $y = a(x - b)^2 + c$ para que el **vértice sea $(${h}, ${k})$** y la parábola **pase por $(${px}, ${py})$**.`,
        hints: ['En la forma canónica, el vértice es $(b, c)$.', `Primero ubicá el vértice. Después, ajustá $a$ hasta que en $x = ${px}$ la curva valga ${py}.`],
        solution: [{ text: `Vértice: $b = ${h}$, $c = ${k}$. Con el punto: $${py} = a(${px} - ${par(h)})^2 + ${par(k)}$, de donde $a = ${a}$.` }],
        explanation: '$a$ controla la apertura y el sentido; $b$ y $c$ trasladan el vértice.',
      }, { kind: 'slider', params: [{ name: 'a', min: -3, max: 3, step: 1, init: 1 }, { name: 'b', min: -5, max: 5, step: 1, init: 0 }, { name: 'c', min: -5, max: 5, step: 1, init: 0 }], base: 'a*(x-b)^2 + c', target: `vértice (${h}, ${k}) y pasa por (${px}, ${py})`, checkId: 'vertex', checkArgs: [h, k, px, py] })
    },
  },
  {
    id: 'f4.discriminant', area: A, unit: 'f4', title: 'Discriminante con parámetro', levels: [3, 4],
    gen: (r, level) => {
      const c = r.pick([1, 4, 9, 16])
      const k = 2 * Math.sqrt(c)
      if (level === 3)
        return make({
          subtopic: 'Discriminante', concepts: ['f4.raices'], level, levelWhy: 'Nivel Analista: hay que plantear una condición sobre el discriminante en lugar de resolver.',
          prompt: `¿Para qué valores de $k$ la ecuación $x^2 + kx + ${c} = 0$ tiene **una única raíz real** (raíz doble)?`,
          hints: ['Raíz doble $\\Leftrightarrow$ discriminante igual a 0.', `$\\Delta = k^2 - 4\\cdot 1 \\cdot ${c}$.`, `$k^2 = ${4 * c}$ tiene dos soluciones.`],
          solution: [{ text: 'Condición:', tex: `k^2 - ${4 * c} = 0 \\Rightarrow k = \\pm ${k}` }],
          explanation: 'El discriminante decide: $>0$ dos raíces, $=0$ una doble, $<0$ ninguna real.',
          commonErrors: ['Quedarse solo con la solución positiva de $k^2 = c$.'],
          noCalc: true,
        }, mc(r, [
          { text: `$k = ${k}$ o $k = -${k}$`, correct: true },
          { text: `$k = ${k}$`, why: `$k^2 = ${4 * c}$ tiene **dos** soluciones: también $-${k}$.`, errorTag: 'raiz-cuadrada-signo' },
          { text: `$k = ${4 * c}$`, why: `Eso es $k^2$, no $k$.` },
          { text: `$|k| > ${k}$`, why: 'Esa condición da dos raíces distintas.' },
        ]))
      return make({
        subtopic: 'Discriminante', concepts: ['f4.raices'], level, levelWhy: 'Nivel Experto: hay que traducir una condición geométrica (no cortar el eje) a una desigualdad y resolverla.',
        prompt: `¿Para qué valores de $k$ la parábola $y = x^2 + kx + ${c}$ **no corta** al eje $x$?`,
        hints: ['No cortar al eje $x$ = no tener raíces reales.', 'Eso pasa si el discriminante es negativo.', `$k^2 - ${4 * c} < 0 \\Leftrightarrow |k| < ${k}$.`],
        solution: [{ text: 'Sin raíces reales:', tex: `k^2 - ${4 * c} < 0 \\iff k^2 < ${4 * c} \\iff -${k} < k < ${k}` }],
        explanation: 'Una desigualdad cuadrática $k^2 < a$ (con $a>0$) se resuelve como $|k| < \\sqrt a$: es un intervalo centrado en 0.',
        commonErrors: ['Escribir $k < \\pm\\sqrt a$, que no tiene sentido.', 'Concluir solo $k < ' + k + '$.'],
        noCalc: true,
      }, mc(r, [
        { text: `$-${k} < k < ${k}$`, correct: true },
        { text: `$k < ${k}$`, why: `Con $k = -${k + 5}$, por ejemplo, $k^2$ es grande y sí hay raíces.`, errorTag: 'desigualdad-cuadratica' },
        { text: `$k < -${k}$ o $k > ${k}$`, why: 'Esa es la condición para que corte en dos puntos.', errorTag: 'desigualdad-cuadratica' },
        { text: 'Ningún valor de $k$', why: `Probá $k = 0$: $x^2 + ${c}$ nunca se anula.` },
      ]))
    },
  },

  /* ============ f5 · Polinómicas y racionales ============ */
  {
    id: 'f5.asymptotes', area: A, unit: 'f5', title: 'Asíntotas de una función racional', levels: [2, 3],
    gen: (r, level) => {
      const a = r.nonZero(-4, 4), c = r.int(-4, 4)
      const b = r.int(-5, 5)
      const d = level === 3 ? r.pick([2, 3]) : 1
      const okNum = a * c + b !== 0
      const bb = okNum ? b : b + 1
      const fx = `(${a}*x ${sgn(bb)})/(${d}*x ${sgn(-d * c)})`
      return make({
        subtopic: 'Funciones racionales y asíntotas', concepts: ['f5.asintotas'], level, levelWhy: level === 2 ? LV[2] : 'Nivel Analista: el coeficiente del denominador no es 1 y hay que interpretar ambos límites.',
        prompt: `Hallá las asíntotas vertical y horizontal de $f(x) = ${T(fx)}$.`,
        plot: { fns: [{ expr: fx, label: 'f' }], x: [-10, 10], y: [-10, 10] },
        hints: ['Vertical: donde se anula el denominador (y no el numerador).', 'Horizontal: mirá qué pasa cuando $x \\to \\pm\\infty$. Con igual grado, es el cociente de los coeficientes principales.', `Asíntota horizontal: $y = \\frac{${a}}{${d}}$.`],
        solution: [{ text: `Denominador nulo: $${d}x ${sgn(-d * c)} = 0 \\Rightarrow x = ${c}$ (el numerador ahí vale ${a * c + bb} ≠ 0). AV: $x = ${c}$.` }, { text: 'Para $x \\to \\pm\\infty$:', tex: `\\lim_{x\\to\\pm\\infty}\\frac{${a}x ${sgn(bb)}}{${d}x ${sgn(-d * c)}} = \\frac{${a}}{${d}}` }],
        explanation: 'Cerca de un cero del denominador la función se dispara (asíntota vertical). Para $x$ enorme, solo importan los términos de mayor grado.',
        commonErrors: ['Poner la AV donde se anula el numerador.'],
        noCalc: true,
      }, { kind: 'fill', parts: ['AV: $x =$', { blank: true, id: 'av', answer: String(c), mode: 'number' }, '· AH: $y =$', { blank: true, id: 'ah', answer: fracStr(a, d), mode: 'number' }] })
    },
  },
  {
    id: 'f5.rootsCubic', area: A, unit: 'f5', title: 'Raíces de una cúbica', levels: [3, 4],
    gen: (r, level) => {
      const roots = r.shuffle([-3, -2, -1, 1, 2, 3, 4]).slice(0, 3).sort((x, y) => x - y)
      const [p, q, s] = roots
      const coeffs = [1, -(p + q + s), p * q + p * s + q * s, -p * q * s]
      const f = poly(coeffs)
      const known = roots[level === 3 ? 0 : 1]
      return make({
        subtopic: 'Polinomios: raíces y factorización', concepts: ['f5.polinomios'], level, levelWhy: level === 3 ? 'Nivel Analista: Ruffini + cuadrática, varios pasos encadenados.' : 'Nivel Experto: la raíz conocida no es la menor y hay que reorganizar el resultado.',
        prompt: `Sabiendo que $x = ${known}$ es raíz de $P(x) = ${T(f)}$, hallá las otras dos raíces.`,
        hints: [`Si $${known}$ es raíz, $P(x)$ es divisible por $(x ${sgn(-known)})$.`, 'Dividí por Ruffini y obtené un polinomio de grado 2.', 'Resolvé la cuadrática que queda.'],
        solution: [{ text: `Ruffini con $${known}$: $P(x) = (x ${sgn(-known)})\\cdot Q(x)$, con $Q$ de grado 2.` }, { text: `Raíces de $Q$: ${roots.filter((t) => t !== known).join(' y ')}.` }],
        explanation: 'Teorema del resto: $a$ es raíz de $P$ si y solo si $(x - a)$ divide a $P$. Así se baja el grado.',
        noCalc: true,
      }, { kind: 'fill', parts: ['Otra raíz (la menor) $=$', { blank: true, id: 'r1', answer: String(roots.filter((t) => t !== known)[0]), mode: 'number' }, '· la mayor $=$', { blank: true, id: 'r2', answer: String(roots.filter((t) => t !== known)[1]), mode: 'number' }] })
    },
  },
  fixed('f5.tf.asymptote', A, 'f5', 'Intuición: ¿la gráfica cruza la asíntota?', (r) => make({
    subtopic: 'Asíntotas', concepts: ['f5.asintotas'], level: 3, levelWhy: 'Nivel Analista: desafía una "regla" falsa muy difundida.',
    prompt: 'Decidí y justificá:',
    plot: { fns: [{ expr: 'x/(x^2+1)', label: 'f' }], x: [-6, 6], y: [-1.5, 1.5] },
    hints: ['Mirá $f(x) = \\frac{x}{x^2+1}$: su asíntota horizontal es $y = 0$.', '¿Cuánto vale $f(0)$?'],
    solution: [{ text: 'La AH de $\\frac{x}{x^2+1}$ es $y = 0$, y sin embargo $f(0) = 0$: la gráfica la cruza.' }],
    explanation: 'Una asíntota horizontal describe el comportamiento **para $x$ muy grandes**. En la zona del medio la gráfica puede cruzarla. Las asíntotas verticales, en cambio, no se cruzan (la función no está definida ahí).',
  }, { kind: 'tf', statement: 'La gráfica de una función nunca puede cortar a su asíntota horizontal.', answer: false, reasons: r.shuffle([
    { text: 'Falso: la asíntota horizontal habla del comportamiento en $\\pm\\infty$; en valores intermedios la gráfica puede cruzarla.', correct: true },
    { text: 'Verdadero: una asíntota es una recta a la que la curva se acerca sin tocarla.', why: 'Es la "definición escolar" incorrecta. Mirá el gráfico: $f(0) = 0$ está sobre la asíntota.', errorTag: 'asintota-mito' },
    { text: 'Falso: porque las asíntotas verticales sí se pueden cruzar.', why: 'Al revés: las verticales no se cruzan (la función no está definida ahí).' },
  ]) })),

  /* ============ f6 · Exponenciales y logarítmicas ============ */
  {
    id: 'f6.eval', area: A, unit: 'f6', title: 'Exponenciales y logaritmos', levels: [1, 2],
    gen: (r, level) => {
      const b = r.pick([2, 3, 5, 10]), k = level === 1 ? r.int(1, 4) : r.int(-3, -1)
      const kind = r.pick(['log', 'exp'] as const)
      const val = kind === 'log' ? k : Math.pow(b, k)
      const prompt = kind === 'log' ? `Calculá $\\log_{${b}}\\left(${level === 1 ? Math.pow(b, k) : `\\frac{1}{${Math.pow(b, -k)}}`}\\right)$.` : `Calculá $${b}^{${k}}$.`
      return make({
        subtopic: 'Exponenciales y logaritmos', concepts: ['f6.log'], level, levelWhy: level === 1 ? LV[1] : 'Nivel Aprendiz: aparecen exponentes negativos (fracciones).',
        prompt,
        hints: kind === 'log' ? [`$\\log_{${b}}(N)$ pregunta: "¿a qué número hay que elevar ${b} para obtener $N$?"`, level === 2 ? `Un exponente negativo da una fracción: $${b}^{-1} = \\frac{1}{${b}}$.` : `Probá potencias de ${b}.`] : ['Exponente negativo = dar vuelta la base.', `$${b}^{${k}} = \\frac{1}{${b}^{${-k}}}$`],
        solution: [{ text: kind === 'log' ? `Como $${b}^{${k}} = ${level === 1 ? Math.pow(b, k) : `\\frac{1}{${Math.pow(b, -k)}}`}$, el logaritmo vale ${k}.` : `$${b}^{${k}} = ${k < 0 ? `\\frac{1}{${Math.pow(b, -k)}}` : Math.pow(b, k)}$.` }],
        explanation: 'El logaritmo es la operación inversa de la exponencial: $\\log_b(b^k) = k$ y $b^{\\log_b N} = N$.',
        commonErrors: ['Pensar que un exponente negativo da un resultado negativo.'],
        noCalc: true,
      }, { kind: 'numeric', answer: val, answerText: kind === 'exp' && k < 0 ? `1/${Math.pow(b, -k)}` : undefined, wrong: kind === 'exp' && k < 0 ? [{ value: -Math.pow(b, -k), why: 'Un exponente negativo **no** da un número negativo: da una fracción ($b^{-n} = 1/b^n$).', errorTag: 'exponente-negativo' }] : [] })
    },
  },
  {
    id: 'f6.solve', area: A, unit: 'f6', title: 'Ecuaciones exponenciales y logarítmicas', levels: [2, 3],
    gen: (r, level) => {
      if (level === 2) {
        const a = r.int(-3, 3), k = r.int(1, 3)
        return make({
          subtopic: 'Ecuaciones logarítmicas', concepts: ['f6.ecuaciones'], level, levelWhy: LV[2],
          prompt: `Resolvé $\\ln(x ${sgn(-a)}) = ${k}$. (Podés escribir el resultado con $e$, por ejemplo $3 + e^2$.)`,
          hints: ['Para "sacar" el logaritmo, aplicá la exponencial a ambos lados.', `$e^{\\ln(u)} = u$.`, `$x ${sgn(-a)} = e^{${k}}$`],
          solution: [{ text: 'Aplicamos $e$ a ambos lados:', tex: `x ${sgn(-a)} = e^{${k}} \\Rightarrow x = ${a === 0 ? '' : a + ' + '}e^{${k}}` }, { text: `Verificamos el dominio: $x ${sgn(-a)} = e^{${k}} > 0$ ✓.` }],
          explanation: '$\\ln$ y $e^{(\\cdot)}$ son inversas: una deshace a la otra. Siempre hay que chequear que la solución esté en el dominio del logaritmo.',
          noCalc: true,
        }, { kind: 'numeric', answer: a + Math.exp(k), answerText: `${a === 0 ? '' : a + ' + '}e^${k}`, tol: { rel: 1e-4 } })
      }
      const P0 = r.pick([100, 200, 500]), T = r.pick([2, 3, 5]), mult = r.pick([4, 8, 16])
      const t = T * Math.log2(mult)
      return make({
        subtopic: 'Crecimiento exponencial', concepts: ['f6.ecuaciones'], level, levelWhy: 'Nivel Analista: problema con enunciado que hay que modelar antes de resolver.',
        prompt: `Una población de ${P0} bacterias se **duplica cada ${T} horas**. ¿Cuántas horas tardará en multiplicarse por ${mult}?`,
        hints: [`El modelo es $P(t) = ${P0}\\cdot 2^{t/${T}}$.`, `Planteá $${P0}\\cdot 2^{t/${T}} = ${P0 * mult}$ y simplificá.`, `$2^{t/${T}} = ${mult} = 2^{${Math.log2(mult)}}$.`],
        solution: [{ text: 'Modelo:', tex: `P(t) = ${P0}\\cdot 2^{t/${T}}` }, { text: 'Condición:', tex: `2^{t/${T}} = ${mult} = 2^{${Math.log2(mult)}} \\Rightarrow \\frac{t}{${T}} = ${Math.log2(mult)} \\Rightarrow t = ${t}` }],
        explanation: 'En el crecimiento exponencial lo que se mantiene constante es el **factor** por unidad de tiempo, no la cantidad que se suma.',
        commonErrors: ['Pensar que se suma una cantidad fija (modelo lineal): multiplicar por 8 no es tardar 8 veces más.'],
        noCalc: true,
      }, { kind: 'numeric', answer: t, unit: 'h', wrong: [{ value: T * mult, why: 'Eso sería si creciera linealmente. Duplicarse $n$ veces multiplica por $2^n$: para multiplicar por ' + mult + ' alcanzan ' + Math.log2(mult) + ' duplicaciones.', errorTag: 'lineal-vs-exponencial' }, { value: T * mult / 2, why: 'Razonamiento lineal: no es "la mitad de veces".', errorTag: 'lineal-vs-exponencial' }] })
    },
  },
  fixed('f6.props', A, 'f6', 'Propiedades del logaritmo', (r) => make({
    subtopic: 'Propiedades del logaritmo', concepts: ['f6.log'], level: 2, levelWhy: 'Nivel Aprendiz: reconocer qué propiedades valen y cuáles son errores típicos.',
    prompt: '¿Cuál de estas igualdades es correcta para todo $a, b > 0$?',
    hints: ['El logaritmo convierte **productos en sumas**.', 'No hay ninguna regla para $\\ln(a + b)$.'],
    solution: [{ text: '$\\ln(ab) = \\ln a + \\ln b$ porque $e^{\\ln a + \\ln b} = e^{\\ln a} e^{\\ln b} = ab$.' }],
    explanation: 'Las propiedades del logaritmo vienen de las de las potencias: $b^{m}b^{n} = b^{m+n}$.',
    commonErrors: ['$\\ln(a+b) = \\ln a + \\ln b$ (falso).', '$\\ln(a)\\ln(b) = \\ln(ab)$ (falso).'],
  }, mc(r, [
    { text: '$\\ln(ab) = \\ln a + \\ln b$', correct: true },
    { text: '$\\ln(a + b) = \\ln a + \\ln b$', why: 'Probá $a = b = 1$: $\\ln 2 \\neq 0$. No hay regla para el log de una suma.', errorTag: 'log-suma' },
    { text: '$\\ln(ab) = \\ln a \\cdot \\ln b$', why: 'El log de un producto es una **suma** de logs, no un producto.', errorTag: 'log-producto' },
    { text: '$\\ln(a^b) = (\\ln a)^b$', why: 'El exponente sale **multiplicando**: $\\ln(a^b) = b \\ln a$.', errorTag: 'log-potencia' },
  ]))),

  /* ============ f7 · Trigonométricas ============ */
  {
    id: 'f7.values', area: A, unit: 'f7', title: 'Valores notables', levels: [1, 2],
    gen: (r, level) => {
      const angles = [
        { tex: '0', s: '0', c: '1', sv: 0, cv: 1 },
        { tex: '\\frac{\\pi}{6}', s: '1/2', c: 'sqrt(3)/2', sv: 0.5, cv: Math.sqrt(3) / 2 },
        { tex: '\\frac{\\pi}{4}', s: 'sqrt(2)/2', c: 'sqrt(2)/2', sv: Math.SQRT2 / 2, cv: Math.SQRT2 / 2 },
        { tex: '\\frac{\\pi}{3}', s: 'sqrt(3)/2', c: '1/2', sv: Math.sqrt(3) / 2, cv: 0.5 },
        { tex: '\\frac{\\pi}{2}', s: '1', c: '0', sv: 1, cv: 0 },
        { tex: '\\pi', s: '0', c: '-1', sv: 0, cv: -1 },
      ]
      const ang = level === 1 ? r.pick([angles[0], angles[4], angles[5]]) : r.pick(angles.slice(1, 4))
      const which = r.pick(['sen', 'cos'] as const)
      const val = which === 'sen' ? ang.sv : ang.cv
      return make({
        subtopic: 'Funciones trigonométricas', concepts: ['f7.valores'], level, levelWhy: level === 1 ? LV[1] : 'Nivel Aprendiz: hay que recordar o deducir valores con raíces.',
        prompt: `Calculá $\\${which === 'sen' ? 'operatorname{sen}' : 'cos'}\\left(${ang.tex}\\right)$. (Podés escribir raíces como sqrt(3)/2.)`,
        hints: ['Pensá en la circunferencia unitaria: el coseno es la coordenada $x$ y el seno la $y$.', 'Recordá los triángulos de 30°-60°-90° y 45°-45°-90°.'],
        solution: [{ text: `$\\${which === 'sen' ? 'operatorname{sen}' : 'cos'}(${ang.tex}) = ${(which === 'sen' ? ang.s : ang.c).replace('sqrt(3)', '\\sqrt3').replace('sqrt(2)', '\\sqrt2')}$.` }],
        explanation: 'En la circunferencia de radio 1, el punto correspondiente al ángulo $t$ es $(\\cos t, \\operatorname{sen} t)$.',
        noCalc: true,
      }, { kind: 'numeric', answer: val, answerText: which === 'sen' ? ang.s : ang.c, tol: { abs: 1e-6 } })
    },
  },
  {
    id: 'f7.period', area: A, unit: 'f7', title: 'Amplitud, período e imagen', levels: [2, 3],
    gen: (r, level) => {
      const Aamp = r.pick([2, 3, 4]), B = r.pick([1, 2, 3, 4]), D = level === 3 ? r.int(-3, 3) : 0
      const f = `${Aamp}*sin(${B}*x) ${D ? sgn(D) : ''}`
      return make({
        subtopic: 'Funciones trigonométricas', concepts: ['f7.graficos'], level, levelWhy: level === 2 ? LV[2] : 'Nivel Analista: además hay un desplazamiento vertical que modifica la imagen.',
        prompt: `Para $f(x) = ${T(f)}$, hallá la amplitud, el período y el valor máximo.`,
        plot: { fns: [{ expr: f, label: 'f' }], x: [-1, 7], y: [-8, 8] },
        hints: ['Amplitud = $|A|$ en $A\\operatorname{sen}(Bx) + D$.', 'Período = $\\dfrac{2\\pi}{|B|}$.', 'Máximo = $D + |A|$.'],
        solution: [{ text: `Amplitud $= ${Aamp}$. Período $= \\frac{2\\pi}{${B}}${B === 1 ? '' : B === 2 ? ' = \\pi' : ''}$. Máximo $= ${D} + ${Aamp} = ${D + Aamp}$.` }],
        explanation: '$B$ comprime horizontalmente (más oscilaciones), $A$ estira verticalmente y $D$ traslada hacia arriba o abajo.',
        commonErrors: ['Período $= 2\\pi B$ en vez de $2\\pi/B$.'],
        noCalc: true,
      }, { kind: 'fill', parts: ['Amplitud:', { blank: true, id: 'A', answer: String(Aamp), mode: 'number' }, '· Período:', { blank: true, id: 'P', answer: B === 1 ? '2*pi' : B === 2 ? 'pi' : `2*pi/${B}`, mode: 'number' }, '· Máximo:', { blank: true, id: 'M', answer: String(D + Aamp), mode: 'number' }] })
    },
  },
  fixed('f7.solve', A, 'f7', 'Ecuación trigonométrica', (r) => make({
    subtopic: 'Ecuaciones trigonométricas', concepts: ['f7.valores'], level: 3, levelWhy: 'Nivel Analista: hay que encontrar todas las soluciones en un intervalo, no solo una.',
    prompt: '¿Cuáles son **todas** las soluciones de $\\operatorname{sen} x = \\frac12$ en $[0, 2\\pi]$?',
    plot: { fns: [{ expr: 'sin(x)', label: 'sen x' }, { expr: '0.5', dashed: true }], x: [-0.5, 7], y: [-1.5, 1.5] },
    hints: ['Mirá el gráfico: la recta $y = 1/2$ corta la onda más de una vez.', 'El seno es positivo en el primer y segundo cuadrante.', '$\\operatorname{sen}(\\pi - t) = \\operatorname{sen} t$.'],
    solution: [{ text: '$\\operatorname{sen}(\\pi/6) = 1/2$ y, por simetría, $\\operatorname{sen}(\\pi - \\pi/6) = \\operatorname{sen}(5\\pi/6) = 1/2$.' }],
    explanation: 'Las funciones trigonométricas no son inyectivas: una ecuación suele tener varias soluciones en cada período.',
    commonErrors: ['Dar solo la solución que devuelve la calculadora ($\\arcsin$).'],
  }, mc(r, [
    { text: '$x = \\frac{\\pi}{6}$ y $x = \\frac{5\\pi}{6}$', correct: true },
    { text: '$x = \\frac{\\pi}{6}$', why: 'Falta otra: mirá el segundo corte en el gráfico.', errorTag: 'solucion-unica' },
    { text: '$x = \\frac{\\pi}{3}$ y $x = \\frac{2\\pi}{3}$', why: 'Esas son las soluciones de $\\cos$... no: son de $\\operatorname{sen} x = \\frac{\\sqrt3}{2}$.' },
    { text: '$x = \\frac{\\pi}{6}$ y $x = \\frac{7\\pi}{6}$', why: 'En $7\\pi/6$ el seno es negativo ($-1/2$).' },
  ]))),

  /* ============ f8 · Transformaciones ============ */
  {
    id: 'f8.build', area: A, unit: 'f8', title: 'Construir una transformación', levels: [2, 3],
    gen: (r, level) => {
      const h = r.nonZero(-4, 4), k = r.nonZero(-4, 4)
      const base = r.pick([{ f: 'x^2', name: 'x^2' }, { f: 'sqrt(x)', name: '\\sqrt{x}' }, { f: 'abs(x)', name: '|x|' }])
      const refl = level === 3 && r.chance(0.6)
      const inner = `(x ${sgn(-h)})`
      const g = (refl ? '-' : '') + base.f.replace('x', inner) + ` ${sgn(k)}`
      const desc = `${refl ? 'reflejala respecto del eje $x$, ' : ''}trasladala ${Math.abs(h)} unidad${Math.abs(h) > 1 ? 'es' : ''} hacia la ${h > 0 ? 'derecha' : 'izquierda'} y ${Math.abs(k)} hacia ${k > 0 ? 'arriba' : 'abajo'}`
      const wrongH = (refl ? '-' : '') + base.f.replace('x', `(x ${sgn(h)})`) + ` ${sgn(k)}`
      const dom: [number, number] = base.f === 'sqrt(x)' ? [Math.max(h, 0) + 0.5, Math.max(h, 0) + 6] : [-4, 4]
      return make({
        subtopic: 'Transformaciones de gráficos', concepts: ['f8.transformaciones'], level, levelWhy: level === 2 ? LV[2] : 'Nivel Analista: combina reflexión y traslaciones; el orden importa.',
        prompt: `Partiendo de $f(x) = ${base.name}$: ${desc}. Escribí la fórmula de la nueva función $g$.`,
        hints: ['Trasladar $h$ a la **derecha** es reemplazar $x$ por $(x - h)$ (¡con menos!).', 'Trasladar $k$ hacia arriba es sumar $k$ afuera.', refl ? 'Reflejar respecto del eje $x$ es cambiar el signo de toda la función (antes de sumar $k$).' : 'Primero el cambio adentro, después el de afuera.'],
        solution: [{ text: `Traslación horizontal: $x \\to x ${sgn(-h)}$.` }, ...(refl ? [{ text: 'Reflexión: multiplicamos la función por $-1$.' }] : []), { text: `Traslación vertical: sumamos $${k}$.`, tex: `g(x) = ${T(g)}` }],
        explanation: 'Los cambios **adentro** (en $x$) actúan sobre el eje horizontal y "al revés" de lo que parece; los cambios **afuera** actúan sobre el eje vertical y en el sentido esperado.',
        commonErrors: ['Hacia la derecha = $x + h$ (es al revés).'],
        plot: { fns: [{ expr: base.f, label: 'f', dashed: true }], x: [-7, 7], y: [-7, 7] },
        noCalc: true,
      }, { kind: 'expression', answer: g, v: 'x', mode: 'exact', domain: dom, prefix: 'g(x) =', wrong: [{ expr: wrongH, why: 'Corriste hacia el lado contrario: para ir a la **derecha** se reemplaza $x$ por $(x - h)$.', errorTag: 'traslacion-horizontal' }] })
    },
  },
  {
    id: 'f8.identify', area: A, unit: 'f8', title: 'Identificar la transformación', levels: [1, 2],
    gen: (r, level) => {
      const h = r.nonZero(-3, 3), k = level === 2 ? r.nonZero(-3, 3) : 0
      const g = `(x ${sgn(-h)})^2 ${k ? sgn(k) : ''}`
      const right = `${Math.abs(h)} hacia la ${h > 0 ? 'derecha' : 'izquierda'}${k ? ` y ${Math.abs(k)} hacia ${k > 0 ? 'arriba' : 'abajo'}` : ''}`
      const wrong = `${Math.abs(h)} hacia la ${h > 0 ? 'izquierda' : 'derecha'}${k ? ` y ${Math.abs(k)} hacia ${k > 0 ? 'arriba' : 'abajo'}` : ''}`
      return make({
        subtopic: 'Transformaciones de gráficos', concepts: ['f8.transformaciones'], level, levelWhy: level === 1 ? 'Nivel Explorador: reconocer una traslación en el gráfico.' : LV[2],
        prompt: `El gráfico punteado es $f(x) = x^2$ y el sólido es $g(x) = ${T(g)}$. ¿Cómo se obtiene $g$ a partir de $f$?`,
        plot: { fns: [{ expr: 'x^2', dashed: true, label: 'f' }, { expr: g, label: 'g' }], points: [{ x: h, y: k, label: 'V' }], x: [-7, 7], y: [-5, 9] },
        hints: ['Seguí el vértice: ¿dónde estaba y dónde quedó?', 'Mirá el signo dentro del paréntesis con cuidado.'],
        solution: [{ text: `El vértice pasa de $(0,0)$ a $(${h}, ${k})$: se trasladó ${right}.` }],
        explanation: '$(x - h)^2$ vale 0 cuando $x = h$: el vértice se mueve a $x = h$.',
        commonErrors: ['Leer el signo de adentro al revés.'],
      }, mc(r, [
        { text: `Se traslada ${right}.`, correct: true },
        { text: `Se traslada ${wrong}.`, why: 'El signo dentro del paréntesis engaña: $(x - 2)^2$ se anula en $x = 2$, a la **derecha**.', errorTag: 'traslacion-horizontal' },
        { text: 'Se refleja respecto del eje $y$.', why: 'Una reflexión no cambia el vértice de lugar sobre el eje.' },
      ]))
    },
  },

  /* ============ f9 · Composición e inversa ============ */
  {
    id: 'f9.compose', area: A, unit: 'f9', title: 'Composición de funciones', levels: [1, 2, 3],
    gen: (r, level) => {
      // g nunca es la identidad (a = 1, b = 0 haría trivial la composición)
      const a = r.pick([-3, -2, -1, 2, 3]), b = r.int(-4, 4), c = r.int(-3, 3)
      const f = `x^2 ${sgn(c)}`, g = `${a}*x ${sgn(b)}`
      if (level === 1) {
        const x0 = r.int(-2, 3)
        const gx = a * x0 + b
        return make({
          subtopic: 'Composición', concepts: ['f9.composicion'], level, levelWhy: LV[1],
          prompt: `Con $f(x) = ${T(f)}$ y $g(x) = ${T(g)}$, calculá $(f \\circ g)(${x0})$.`,
          hints: ['$(f\\circ g)(a) = f(g(a))$: primero $g$, después $f$.', `$g(${x0}) = ${gx}$. Ahora calculá $f(${gx})$.`],
          solution: [{ text: `$g(${x0}) = ${gx}$.` }, { text: `$f(${gx}) = ${par(gx)}^2 ${sgn(c)} = ${gx * gx + c}$.` }],
          explanation: 'En $f\\circ g$ la función de la derecha actúa primero: "$f$ de $g$ de $x$".',
          commonErrors: ['Aplicar primero $f$ y después $g$.'],
          noCalc: true,
        }, { kind: 'numeric', answer: gx * gx + c, wrong: [{ value: a * (x0 * x0 + c) + b, why: 'Calculaste $g(f(x))$: en $f\\circ g$ primero actúa $g$.', errorTag: 'orden-composicion' }] })
      }
      const which = level === 2 ? 'fg' : r.pick(['fg', 'gf'] as const)
      const ans = which === 'fg' ? `(${g})^2 ${sgn(c)}` : `${a}*(${f}) ${sgn(b)}`
      const other = which === 'fg' ? `${a}*(${f}) ${sgn(b)}` : `(${g})^2 ${sgn(c)}`
      return make({
        subtopic: 'Composición', concepts: ['f9.composicion'], level, levelWhy: level === 2 ? LV[2] : 'Nivel Analista: hay que distinguir $f\\circ g$ de $g \\circ f$ y operar con expresiones.',
        prompt: `Con $f(x) = ${T(f)}$ y $g(x) = ${T(g)}$, hallá $(${which === 'fg' ? 'f\\circ g' : 'g \\circ f'})(x)$.`,
        hints: [which === 'fg' ? 'Reemplazá cada $x$ de $f$ por la fórmula entera de $g$.' : 'Reemplazá cada $x$ de $g$ por la fórmula de $f$.', 'Usá paréntesis al reemplazar.'],
        solution: [{ text: 'Reemplazamos:', tex: `(${which === 'fg' ? 'f\\circ g' : 'g\\circ f'})(x) = ${T(ans)}` }],
        explanation: 'En general $f\\circ g \\neq g \\circ f$: la composición no es conmutativa.',
        commonErrors: ['Multiplicar $f\\cdot g$ en vez de componer.'],
        noCalc: true,
      }, { kind: 'expression', answer: ans, v: 'x', mode: 'exact', domain: [-3, 3], wrong: [{ expr: other, why: 'Compusiste en el orden contrario.', errorTag: 'orden-composicion' }, { expr: `(${f})*(${g})`, why: 'Eso es el **producto** $f\\cdot g$, no la composición.', errorTag: 'composicion-producto' }] })
    },
  },
  {
    id: 'f9.inverse', area: A, unit: 'f9', title: 'Función inversa', levels: [2, 3],
    gen: (r, level) => {
      if (level === 2) {
        const a = r.nonZero(-5, 5), b = r.int(-6, 6)
        return make({
          data: { kind: 'inverseFn', f: `${a}*x ${sgn(b)}` }, subtopic: 'Función inversa', concepts: ['f9.inversa'], level, levelWhy: LV[2],
          prompt: `Hallá la inversa de $f(x) = ${T(`${a}*x ${sgn(b)}`)}$.`,
          hints: ['Escribí $y = f(x)$ y despejá $x$.', `$y = ${a}x ${sgn(b)} \\Rightarrow x = \\frac{y ${sgn(-b)}}{${a}}$.`, 'Al final renombrá la variable como $x$.'],
          solution: [{ text: 'Despejamos:', tex: `y = ${a}x ${sgn(b)} \\Rightarrow x = \\frac{y ${sgn(-b)}}{${a}}` }, { text: 'Renombramos:', tex: `f^{-1}(x) = \\frac{x ${sgn(-b)}}{${a}}` }],
          explanation: 'La inversa "deshace" lo que hace $f$: $f^{-1}(f(x)) = x$. Su gráfico es el reflejo del de $f$ respecto de $y = x$.',
          commonErrors: ['Confundir $f^{-1}$ con $1/f$.'],
          noCalc: true,
        }, { kind: 'expression', answer: `(x ${sgn(-b)})/(${a})`, v: 'x', mode: 'exact', domain: [-4, 4], prefix: 'f⁻¹(x) =', wrong: [{ expr: `1/(${a}*x ${sgn(b)})`, why: 'Eso es $1/f(x)$. La inversa se obtiene **despejando**, no dando vuelta la fracción.', errorTag: 'inversa-reciproca' }] })
      }
      const a = r.nonZero(1, 4), b = r.int(1, 5), d = r.int(-4, -1)
      // f(x) = (a x + b)/(x + d)  → f^{-1}(x) = (b - d x)/(x - a)
      return make({
        data: { kind: 'inverseFn', f: `(${a}*x + ${b})/(x ${sgn(d)})` }, subtopic: 'Función inversa', concepts: ['f9.inversa'], level, levelWhy: 'Nivel Analista: el despeje requiere agrupar los términos con $x$ y sacar factor común.',
        prompt: `Hallá la inversa de $f(x) = ${T(`(${a}*x + ${b})/(x ${sgn(d)})`)}$.`,
        hints: ['$y(x ' + sgn(d) + ') = ' + a + 'x + ' + b + '$: distribuí.', 'Pasá todos los términos con $x$ de un lado y sacá factor común.', `$x(y - ${a}) = ${b} ${sgn(-d)}y$`],
        solution: [{ text: 'Multiplicamos por el denominador:', tex: `y x ${sgn(d)}y = ${a}x + ${b}` }, { text: 'Agrupamos:', tex: `x(y - ${a}) = ${b} ${sgn(-d)}y \\Rightarrow x = \\frac{${b} ${sgn(-d)}y}{y - ${a}}` }, { text: 'Renombramos:', tex: `f^{-1}(x) = ${T(`(${b} ${sgn(-d)}*x)/(x - ${a})`)}` }],
        explanation: 'El dominio de $f^{-1}$ es la imagen de $f$: acá $x \\neq ' + a + '$, que es la asíntota horizontal de $f$.',
        noCalc: true,
      }, { kind: 'expression', answer: `(${b} ${sgn(-d)}*x)/(x - ${a})`, v: 'x', mode: 'exact', domain: [a + 0.5, a + 5], prefix: 'f⁻¹(x) =', wrong: [{ expr: `(x ${sgn(d)})/(${a}*x + ${b})`, why: 'Diste vuelta la fracción: eso es $1/f$, no $f^{-1}$.', errorTag: 'inversa-reciproca' }] })
    },
  },
  fixed('f9.domainComp', A, 'f9', 'Dominio de una composición', (r) => make({
    subtopic: 'Composición y dominio', concepts: ['f9.composicion', 'f1.dominio'], level: 4, levelWhy: 'Nivel Experto: la fórmula simplificada "esconde" una restricción de dominio (trampa conceptual).',
    prompt: 'Sean $f(x) = x^2$ y $g(x) = \\sqrt{x - 1}$. ¿Cuál es el dominio de $f\\circ g$?',
    hints: ['$(f\\circ g)(x) = (\\sqrt{x-1})^2$. ¿Se puede simplificar a $x - 1$ **para todo** $x$?', 'Para calcular $f(g(x))$ primero tiene que existir $g(x)$.'],
    solution: [{ text: '$(f\\circ g)(x) = (\\sqrt{x - 1})^2 = x - 1$, pero **solo** donde existe $\\sqrt{x-1}$: $x \\geq 1$.' }, { text: 'Dominio: $[1, +\\infty)$.' }],
    explanation: 'El dominio de $f\\circ g$ son los $x$ del dominio de $g$ tales que $g(x)$ está en el dominio de $f$. Simplificar la fórmula no "agrega" puntos al dominio.',
    commonErrors: ['Simplificar a $x - 1$ y decir que el dominio es $\\mathbb{R}$.'],
  }, mc(r, [
    { text: '$[1, +\\infty)$', correct: true },
    { text: '$\\mathbb{R}$', why: 'La fórmula simplificada $x - 1$ engaña: para $x < 1$ ni siquiera existe $g(x)$.', errorTag: 'dominio-composicion' },
    { text: '$(1, +\\infty)$', why: '$g(1) = \\sqrt0 = 0$ existe, y $f(0) = 0$: el 1 está incluido.' },
    { text: '$[0, +\\infty)$', why: 'Ese es el dominio de $\\sqrt{x}$, no de $\\sqrt{x - 1}$.' },
  ]))),

  /* ============ f10 · Límites y continuidad ============ */
  {
    id: 'f10.factor', area: A, unit: 'f10', title: 'Límites 0/0 por factorización', levels: [2, 3],
    gen: (r, level) => {
      const a = r.nonZero(-4, 4)
      if (level === 2) {
        const b = r.int(-4, 4)
        // (x - a)(x - b)/(x - a)
        const num = poly([1, -(a + b), a * b])
        return make({
          data: { kind: 'limit', e: `(${num})/(x ${sgn(-a)})`, at: a }, subtopic: 'Límites', concepts: ['f10.limites'], level, levelWhy: LV[2],
          prompt: `Calculá $\\displaystyle\\lim_{x\\to ${a}} \\frac{${T(num)}}{x ${sgn(-a)}}$.`,
          plot: { fns: [{ expr: `x ${sgn(-b)}`, label: 'f' }], points: [{ x: a, y: a - b, open: true }], x: [a - 5, a + 5], y: [a - b - 5, a - b + 5] },
          hints: ['Reemplazar da $0/0$: es una indeterminación, no un resultado.', `Factorizá el numerador: tiene a $(x ${sgn(-a)})$ como factor.`, 'Simplificá y recién después reemplazá.'],
          solution: [{ text: 'Al reemplazar: $0/0$ (indeterminado).' }, { text: 'Factorizamos y simplificamos (vale porque $x \\neq ' + a + '$ mientras $x \\to ' + a + '$):', tex: `\\frac{(x ${sgn(-a)})(x ${sgn(-b)})}{x ${sgn(-a)}} = x ${sgn(-b)}` }, { text: `Límite: $${a} ${sgn(-b)} = ${a - b}$.` }],
          explanation: 'El límite mira qué pasa **cerca** de $a$, no en $a$. Por eso se puede cancelar $(x - a)$: cerca de $a$ ese factor no es cero.',
          commonErrors: ['Decir que el límite "no existe" porque da $0/0$.', 'Decir que vale 0.'],
          noCalc: true,
        }, { kind: 'numeric', answer: a - b, wrong: [{ value: 0, why: '$0/0$ no es 0: es una indeterminación. Hay que simplificar primero.', errorTag: 'cero-sobre-cero' }] })
      }
      const sq = a * a
      const aa = Math.abs(a)
      return make({
        data: { kind: 'limit', e: `(sqrt(x) - ${aa})/(x - ${sq})`, at: sq }, subtopic: 'Límites', concepts: ['f10.limites'], level, levelWhy: 'Nivel Analista: hay que racionalizar (multiplicar por el conjugado) antes de simplificar.',
        prompt: `Calculá $\\displaystyle\\lim_{x\\to ${sq}} \\frac{\\sqrt{x} - ${aa}}{x - ${sq}}$.`,
        hints: ['Da $0/0$. Con raíces, multiplicá por el conjugado.', `Conjugado de $\\sqrt x - ${aa}$: $\\sqrt x + ${aa}$.`, `$(\\sqrt x - ${aa})(\\sqrt x + ${aa}) = x - ${sq}$.`],
        solution: [{ text: 'Multiplicamos y dividimos por el conjugado:', tex: `\\frac{\\sqrt x - ${aa}}{x - ${sq}}\\cdot\\frac{\\sqrt x + ${aa}}{\\sqrt x + ${aa}} = \\frac{x - ${sq}}{(x - ${sq})(\\sqrt x + ${aa})} = \\frac{1}{\\sqrt x + ${aa}}` }, { text: `Límite: $\\frac{1}{${2 * aa}}$.` }],
        explanation: 'El conjugado usa $(p - q)(p + q) = p^2 - q^2$ para "sacar" la raíz y hacer aparecer el factor que se cancela.',
        noCalc: true,
      }, { kind: 'numeric', answer: 1 / (2 * aa), answerText: `1/${2 * aa}` })
    },
  },
  {
    id: 'f10.infinity', area: A, unit: 'f10', title: 'Límites al infinito', levels: [2, 3],
    gen: (r, level) => {
      const p = r.nonZero(-5, 5), q = r.pick([1, 2, 3, 4])
      const degN = level === 2 ? 2 : r.pick([1, 2, 3])
      const degD = 2
      const num = degN === 3 ? `${p}*x^3 + x` : degN === 2 ? `${p}*x^2 - 3*x + 1` : `${p}*x + 7`
      const den = `${q}*x^2 + 5`
      const opts = [
        { text: degN === 2 ? `$${fracTeX(p, q)}$` : degN === 1 ? '$0$' : p > 0 ? '$+\\infty$' : '$-\\infty$', correct: true },
        { text: '$0$', why: 'Comparar los grados: el de arriba no es menor.' },
        { text: `$${fracTeX(p, q)}$`, why: 'Solo con grados iguales da el cociente de coeficientes principales.' },
        { text: '$+\\infty$', why: 'Comparar los grados de numerador y denominador.' },
        { text: '$-\\infty$', why: 'Comparar los grados y el signo del coeficiente principal.' },
      ]
      return make({
        subtopic: 'Límites al infinito', concepts: ['f10.limites'], level, levelWhy: level === 2 ? LV[2] : 'Nivel Analista: los grados no siempre coinciden y hay que decidir el caso.',
        prompt: `Calculá $\\displaystyle\\lim_{x\\to +\\infty} \\frac{${T(num)}}{${T(den)}}$.`,
        hints: ['Para $x$ enorme dominan los términos de mayor grado.', 'Dividí numerador y denominador por $x^2$ (la mayor potencia del denominador).', 'Compará los grados: igual, menor o mayor.'],
        solution: [{ text: `Grado del numerador ${degN}, del denominador ${degD}.` }, { text: degN === 2 ? `Grados iguales: cociente de coeficientes principales $= ${fracTeX(p, q)}$.` : degN === 1 ? 'Numerador de menor grado: el límite es 0.' : `Numerador de mayor grado: el límite es infinito, con el signo de $${p}/${q}$.` }],
        explanation: 'Al dividir por $x^2$, todos los términos de grado menor tienden a 0 y solo sobreviven los dominantes.',
        noCalc: true,
      }, mc(r, opts.filter((o, i) => i === 0 || o.text !== opts[0].text).slice(0, 4)))
    },
  },
  {
    id: 'f10.continuity', area: A, unit: 'f10', title: 'Continuidad con parámetro', levels: [3, 4],
    gen: (r, level) => {
      const c = r.int(-2, 3), m = r.nonZero(-3, 3), b = r.int(-3, 3)
      // f(x) = x^2 + k si x <= c ; m x + b si x > c → k = m c + b - c^2
      const k = m * c + b - c * c
      if (level === 3)
        return make({
          subtopic: 'Continuidad', concepts: ['f10.continuidad'], level, levelWhy: 'Nivel Analista: hay que traducir "continua" en una ecuación sobre los límites laterales.',
          prompt: `Hallá $k$ para que sea continua en $\\mathbb{R}$: $f(x) = \\begin{cases} x^2 + k & x \\leq ${c} \\\\ ${T(`${m}*x ${sgn(b)}`)} & x > ${c}\\end{cases}$`,
          hints: [`Cada tramo es continuo; el único punto a revisar es $x = ${c}$.`, 'Continua en $c$: límite por izquierda = límite por derecha = $f(c)$.', `Igualá $${c}^2 + k$ con $${m}\\cdot ${par(c)} ${sgn(b)}$.`],
          solution: [{ text: 'Por izquierda (y valor):', tex: `f(${c}) = ${c * c} + k` }, { text: 'Por derecha:', tex: `\\lim_{x\\to ${c}^+} f(x) = ${m * c + b}` }, { text: `Igualando: $k = ${k}$.` }],
          explanation: 'Continuidad en $c$ significa: $f(c)$ existe, el límite existe (laterales iguales) y coinciden. "Se dibuja sin levantar el lápiz".',
          noCalc: true,
        }, { kind: 'numeric', answer: k })
      // derivable: x^2 + k (x<=c) and a x + b2 (x>c): continuity + derivative match: a = 2c, b2 = c^2 + k - 2c*c
      const kk = r.int(-3, 3)
      const aa = 2 * c, bb = c * c + kk - aa * c
      return make({
        subtopic: 'Continuidad y derivabilidad', concepts: ['f10.continuidad', 'd2.derivable'], level, levelWhy: 'Nivel Experto: dos condiciones (continuidad y derivabilidad) para dos incógnitas; adelanta la idea de derivada.',
        prompt: `Hallá $a$ y $b$ para que $f(x) = \\begin{cases} x^2 ${sgn(kk)} & x \\leq ${c} \\\\ a x + b & x > ${c}\\end{cases}$ sea continua **y** su gráfica no tenga "pico" en $x = ${c}$ (las pendientes de ambos lados coinciden).`,
        hints: ['Sin pico: la recta tiene que ser **tangente** a la parábola en $x = ' + c + '$.', `La pendiente de $x^2$ en $x = c$ es $2c = ${2 * c}$.`, 'Con la pendiente, usá la continuidad para hallar $b$.'],
        solution: [{ text: `Pendiente de la parábola en $${c}$: $2\\cdot ${par(c)} = ${aa}$, entonces $a = ${aa}$.` }, { text: `Continuidad: $${c * c + kk} = ${aa}\\cdot ${par(c)} + b \\Rightarrow b = ${bb}$.` }],
        explanation: 'Continuidad no alcanza para que no haya pico: además las pendientes laterales tienen que coincidir (eso es ser **derivable**).',
        commonErrors: ['Pedir solo continuidad (queda una ecuación con dos incógnitas).'],
        noCalc: true,
      }, { kind: 'fill', parts: ['$a =$', { blank: true, id: 'a', answer: String(aa), mode: 'number' }, '$b =$', { blank: true, id: 'b', answer: String(bb), mode: 'number' }] })
    },
  },
  {
    id: 'f10.lateral', area: A, unit: 'f10', title: 'Límites laterales en un gráfico', levels: [1, 2],
    gen: (r, level) => {
      const c = r.int(-2, 2), L1 = r.int(-3, 1), L2 = L1 + r.int(1, 3), fc = r.pick([L1, L2, L1 - 1])
      const left = `x ${sgn(L1 - c)}`, right = `${-1}*(x - ${par(c)}) ${sgn(L2)}`
      return make({
        subtopic: 'Límites laterales', concepts: ['f10.limites'], level, levelWhy: level === 1 ? 'Nivel Explorador: leer límites laterales en un gráfico.' : 'Nivel Aprendiz: distinguir límite de valor de la función.',
        prompt: level === 1 ? `Mirando el gráfico, ¿cuánto vale $\\displaystyle\\lim_{x\\to ${c}^-} f(x)$?` : `Mirando el gráfico, ¿cuánto vale $f(${c})$? (El punto lleno pertenece al gráfico, el vacío no.)`,
        plot: { fns: [{ expr: left, domain: [-8, c], label: 'f' }, { expr: right, domain: [c, 8] }], points: [{ x: c, y: L1, open: fc !== L1 }, { x: c, y: L2, open: fc !== L2 }, ...(fc !== L1 && fc !== L2 ? [{ x: c, y: fc }] : [])], x: [-6, 6], y: [-6, 6] },
        hints: level === 1 ? ['$x \\to c^-$: acercate a $c$ por la **izquierda**.', 'Seguí la curva de la izquierda hasta llegar a $x = ' + c + '$.'] : ['El valor $f(c)$ es la altura del punto **lleno** sobre $x = c$.', 'El límite y el valor pueden ser distintos.'],
        solution: [{ text: level === 1 ? `Por izquierda la curva llega a altura ${L1}.` : `El punto lleno sobre $x = ${c}$ está a altura ${fc}.` }],
        explanation: 'El límite describe hacia dónde se acerca la función; $f(c)$ es dónde está. Que no coincidan es justamente una discontinuidad.',
      }, { kind: 'numeric', answer: level === 1 ? L1 : fc, wrong: level === 1 ? [{ value: L2, why: 'Ese es el límite por la **derecha**.', errorTag: 'lateral' }] : [{ value: fc === L1 ? L2 : L1, why: 'Ese es un límite lateral, no el valor de la función (mirá cuál punto está lleno).', errorTag: 'limite-vs-valor' }] })
    },
  },
  fixed('f10.tf.cont', A, 'f10', 'Intuición: límite y valor', (r) => make({
    subtopic: 'Continuidad', concepts: ['f10.continuidad'], level: 3, levelWhy: 'Nivel Analista: distinguir conceptos que suelen confundirse.',
    prompt: 'Decidí y justificá:',
    hints: ['Pensá en una función con un "agujero" en $x = 2$ que después se "rellena" con otro valor.'],
    solution: [{ text: 'Ejemplo: $f(x) = x$ si $x \\neq 2$ y $f(2) = 5$. El límite en 2 existe (vale 2) pero $f$ no es continua en 2.' }],
    explanation: 'Continuidad pide tres cosas: que exista $f(a)$, que exista el límite y que **coincidan**.',
  }, { kind: 'tf', statement: 'Si $\\lim_{x\\to a} f(x)$ existe, entonces $f$ es continua en $a$.', answer: false, reasons: r.shuffle([
    { text: 'Falso: el límite puede existir y ser distinto de $f(a)$ (o $f(a)$ puede no existir).', correct: true },
    { text: 'Verdadero: si el límite existe, la función no tiene saltos.', why: 'Puede tener un punto "corrido" o un agujero.', errorTag: 'limite-vs-continuidad' },
    { text: 'Falso: porque además $f$ tiene que ser derivable.', why: 'La derivabilidad no forma parte de la definición de continuidad.' },
  ]) })),
]
