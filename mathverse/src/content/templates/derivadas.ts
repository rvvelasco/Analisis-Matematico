import type { ExerciseDraft, Level, Template } from '../../engine/types'
import { diff, parse, toTeX, toText, simplify } from '../../math/expr'
import { fmt, type Rand } from '../../math/numeric'
import { autoDomain, fixed, fracStr, LV, make, mc, par, poly, polyDer, polyEval, sgn, T } from './helpers'

const A = 'derivadas' as const
const D = (s: string) => toText(diff(parse(s)))
const DT = (s: string) => toTeX(diff(parse(s)))

/** Funciones "atómicas" con su derivada (texto) para armar productos y cocientes. */
const ATOMS = [
  { f: 'x^2', d: '2*x', tex: 'x^2' },
  { f: 'x^3', d: '3*x^2', tex: 'x^3' },
  { f: 'e^x', d: 'e^x', tex: 'e^x' },
  { f: 'ln(x)', d: '1/x', tex: '\\ln x' },
  { f: 'sin(x)', d: 'cos(x)', tex: '\\operatorname{sen} x' },
  { f: 'cos(x)', d: '-sin(x)', tex: '\\cos x' },
  { f: 'sqrt(x)', d: '1/(2*sqrt(x))', tex: '\\sqrt x' },
]

/** Funciones compuestas: exterior + interior. */
function chainCase(r: Rand, level: Level) {
  const a = r.pick([2, 3, 4, 5]), b = r.int(-5, 5), n = r.pick([3, 4, 5]), c = r.int(1, 6)
  const inners = level <= 2
    ? [{ u: `${a}*x ${sgn(b)}`, du: `${a}` }, { u: `${a}*x`, du: `${a}` }]
    : [{ u: `x^2 + ${c}`, du: '2*x' }, { u: `x^3 ${sgn(b || 1)}`, du: '3*x^2' }, { u: `${a}*x^2 ${sgn(b)}`, du: `${2 * a}*x` }]
  const inner = r.pick(inners)
  const outers = [
    { name: 'potencia', f: (u: string) => `(${u})^${n}`, outerD: (u: string) => `${n}*(${u})^${n - 1}`, desc: `"algo a la ${n}"` },
    { name: 'exponencial', f: (u: string) => `e^(${u})`, outerD: (u: string) => `e^(${u})`, desc: 'la exponencial $e^{(\\cdot)}$' },
    { name: 'seno', f: (u: string) => `sin(${u})`, outerD: (u: string) => `cos(${u})`, desc: 'el seno' },
    { name: 'coseno', f: (u: string) => `cos(${u})`, outerD: (u: string) => `-sin(${u})`, desc: 'el coseno' },
    { name: 'raíz', f: (u: string) => `sqrt(${u})`, outerD: (u: string) => `1/(2*sqrt(${u}))`, desc: 'la raíz cuadrada' },
    { name: 'logaritmo', f: (u: string) => `ln(${u})`, outerD: (u: string) => `1/(${u})`, desc: 'el logaritmo' },
  ]
  // raíz y ln necesitan interior positivo en el dominio de prueba
  const outer = r.pick(outers)
  return { inner, outer, f: outer.f(inner.u) }
}

function derivExercise(meta: { f: string; level: Level; subtopic: string; concepts: string[]; levelWhy: string; hints: string[]; steps: { text: string; tex?: string }[]; explanation: string; wrong: { expr: string; why: string; errorTag?: string }[]; commonErrors?: string[] }): ExerciseDraft {
  const ans = D(meta.f)
  return make({
    subtopic: meta.subtopic, concepts: meta.concepts, level: meta.level, levelWhy: meta.levelWhy,
    prompt: `Derivá $f(x) = ${T(meta.f)}$.`,
    hints: meta.hints,
    solution: [...meta.steps, { text: 'Resultado (simplificado):', tex: `f'(x) = ${DT(meta.f)}` }],
    explanation: meta.explanation,
    commonErrors: meta.commonErrors,
    noCalc: true,
  }, { kind: 'expression', answer: ans, v: 'x', mode: 'exact', domain: autoDomain(meta.f + ' + ' + ans), wrong: meta.wrong, source: { f: meta.f, op: 'derivative' }, prefix: "f'(x) =" })
}

export const DERIVADAS: Template[] = [
  /* ============ d1 · Tasa de cambio ============ */
  {
    id: 'd1.tvm', area: A, unit: 'd1', title: 'Tasa de variación media', levels: [1, 2],
    gen: (r, level) => {
      const a = r.nonZero(-2, 3), b = r.int(-4, 4), c = r.int(-5, 5)
      const x1 = r.int(-2, 2), x2 = x1 + r.int(1, 3)
      const f = poly([a, b, c])
      const y1 = polyEval([a, b, c], x1), y2 = polyEval([a, b, c], x2)
      const tvm = (y2 - y1) / (x2 - x1)
      return make({
        data: { kind: 'tvm', f, a: x1, b: x2 }, subtopic: 'Tasa de cambio media', concepts: ['d1.tasa'], level, levelWhy: level === 1 ? 'Nivel Explorador: es la pendiente de una secante, una sola cuenta.' : LV[2],
        prompt: `Calculá la tasa de variación media de $f(x) = ${T(f)}$ en el intervalo $[${x1}, ${x2}]$.`,
        plot: { fns: [{ expr: f, label: 'f' }, { expr: `${y1} + (${tvm})*(x - (${x1}))`, dashed: true, label: 'secante' }], points: [{ x: x1, y: y1 }, { x: x2, y: y2 }], x: [x1 - 3, x2 + 3], y: [Math.min(y1, y2) - 6, Math.max(y1, y2) + 6] },
        hints: ['TVM = cuánto cambió $f$ dividido cuánto cambió $x$.', '$\\text{TVM} = \\dfrac{f(b) - f(a)}{b - a}$', `$f(${x2}) = ${y2}$ y $f(${x1}) = ${y1}$.`],
        solution: [{ text: 'Evaluamos los extremos:', tex: `f(${x1}) = ${y1}, \\quad f(${x2}) = ${y2}` }, { text: 'Cociente:', tex: `\\frac{${y2} - ${par(y1)}}{${x2} - ${par(x1)}} = ${fracStr(y2 - y1, x2 - x1).replace(/(-?\d+)\/(\d+)/, '\\frac{$1}{$2}')}` }],
        explanation: 'La tasa de variación media es la **pendiente de la recta secante** que une los dos puntos de la curva. Es un "promedio" del cambio en el intervalo.',
        commonErrors: ['Dividir por $f(b) - f(a)$ en vez de por $b - a$.'],
        noCalc: true,
      }, { kind: 'numeric', answer: tvm, answerText: fracStr(y2 - y1, x2 - x1), wrong: [{ value: y2 - y1, why: 'Te faltó dividir por el ancho del intervalo $b - a$.', errorTag: 'tvm-sin-dividir' }] })
    },
  },
  {
    id: 'd1.secants', area: A, unit: 'd1', title: 'Secantes que se acercan a la tangente', levels: [2, 3],
    gen: (r, level) => {
      const a = r.int(1, 3)
      const k = r.pick([1, 2])
      const f = k === 1 ? 'x^2' : 'x^3'
      const slope = k === 1 ? 2 * a : 3 * a * a
      const hs = [1, 0.1, 0.01]
      const sec = hs.map((h) => (k === 1 ? 2 * a + h : 3 * a * a + 3 * a * h + h * h))
      return make({
        subtopic: 'De la secante a la tangente', concepts: ['d1.tangente'], level, levelWhy: level === 2 ? 'Nivel Aprendiz: se interpreta una tabla de pendientes de secantes.' : 'Nivel Analista: hay que conjeturar un límite a partir de datos y justificarlo.',
        prompt: `Para $f(x) = ${T(f)}$ se calcularon las pendientes de las secantes entre $x = ${a}$ y $x = ${a} + h$: con $h = 1$ da ${fmt(sec[0])}, con $h = 0{,}1$ da ${fmt(sec[1])} y con $h = 0{,}01$ da ${fmt(sec[2])}. ¿A qué valor se acercan, y qué representa?`,
        hints: ['Mirá hacia qué número tiende la sucesión cuando $h$ se achica.', 'Cuando el segundo punto se pega al primero, la secante se convierte en…'],
        solution: [{ text: `Las pendientes tienden a ${slope}.` }, { text: `Ese límite es la pendiente de la **recta tangente** en $x = ${a}$, o sea $f'(${a}) = ${slope}$.` }],
        explanation: 'La derivada se define exactamente así: el límite de las pendientes de las secantes cuando el segundo punto se acerca al primero.',
      }, mc(r, [
        { text: `A ${slope}: es la pendiente de la recta tangente en $x = ${a}$.`, correct: true },
        { text: `A ${slope}: es el valor de $f(${a})$.`, why: `$f(${a}) = ${k === 1 ? a * a : a ** 3}$; las pendientes hablan de la inclinación, no de la altura.`, errorTag: 'derivada-vs-valor' },
        { text: `A ${fmt(sec[0])}: es la pendiente de la secante más larga.`, why: 'El valor que importa es hacia dónde **tienden** cuando $h \\to 0$.' },
        { text: 'A 0, porque la secante se convierte en un punto.', why: 'La secante no desaparece: se convierte en la tangente, que tiene pendiente propia.', errorTag: 'h-cero' },
      ]))
    },
  },
  {
    id: 'd1.context', area: A, unit: 'd1', title: 'Velocidad media e instantánea', levels: [2],
    gen: (r) => {
      const a = r.pick([2, 3, 4, 5]), t1 = r.int(0, 2), t2 = t1 + r.int(1, 3)
      const s = (t: number) => a * t * t
      const vm = (s(t2) - s(t1)) / (t2 - t1)
      return make({
        subtopic: 'Interpretación física', concepts: ['d1.tasa'], level: 2, levelWhy: LV[2],
        prompt: `Un objeto se mueve según $s(t) = ${a}t^2$ (metros, $t$ en segundos). ¿Cuál es su velocidad **media** entre $t = ${t1}$ y $t = ${t2}$ (en m/s)?`,
        hints: ['Velocidad media = distancia recorrida / tiempo transcurrido.', `$\\dfrac{s(${t2}) - s(${t1})}{${t2} - ${t1}}$`],
        solution: [{ text: '', tex: `v_m = \\frac{${s(t2)} - ${s(t1)}}{${t2 - t1}} = ${fmt(vm)}\\ \\text{m/s}` }],
        explanation: 'La velocidad media es la tasa de variación media de la posición. La velocidad **instantánea** es el límite cuando el intervalo se achica: la derivada.',
        noCalc: true,
      }, { kind: 'numeric', answer: vm, unit: 'm/s', wrong: [{ value: s(t2) - s(t1), why: 'Ese es el desplazamiento; falta dividir por el tiempo.', errorTag: 'tvm-sin-dividir' }] })
    },
  },

  /* ============ d2 · Definición ============ */
  {
    id: 'd2.limitDef', area: A, unit: 'd2', title: 'Derivada por definición', levels: [2, 3],
    gen: (r, level) => {
      const a = r.nonZero(-3, 3), b = r.int(-5, 5), x0 = r.int(-2, 3)
      if (level === 2) {
        const val = 2 * a * x0 + b
        return make({
          subtopic: 'Definición de derivada', concepts: ['d2.definicion'], level, levelWhy: LV[2],
          prompt: `Usando la definición, $f'(${x0}) = \\displaystyle\\lim_{h\\to0}\\frac{f(${x0}+h) - f(${x0})}{h}$, calculá $f'(${x0})$ para $f(x) = ${T(poly([a, b, 0]))}$.`,
          hints: [`Calculá $f(${x0} + h)$ desarrollando el cuadrado.`, 'Restá $f(' + x0 + ')$: los términos sin $h$ se cancelan.', 'Sacá $h$ de factor común, simplificá y hacé $h \\to 0$.'],
          solution: [
            { text: 'Numerador:', tex: `f(${x0}+h) - f(${x0}) = ${a}(${x0}+h)^2 ${sgn(b)}(${x0}+h) - (${polyEval([a, b, 0], x0)})` },
            { text: 'Desarrollando y cancelando:', tex: `= ${T(`${2 * a * x0 + b}*h + ${a}*h^2`, ['h'])}` },
            { text: 'Dividiendo por $h$ (que no es 0 mientras tiende a 0):', tex: `${val} + ${a}h \\xrightarrow[h\\to0]{} ${val}` },
          ],
          explanation: 'La definición calcula la pendiente de la secante entre $x_0$ y $x_0 + h$ y hace que el segundo punto se acerque. Los términos con $h^2$ desaparecen al dividir y tomar el límite.',
          commonErrors: ['Reemplazar $h = 0$ antes de simplificar (da 0/0).', 'Desarrollar mal $(x_0 + h)^2$.'],
          noCalc: true,
        }, { kind: 'numeric', answer: val })
      }
      const steps = [
        `Escribir el cociente incremental $\\dfrac{f(x+h) - f(x)}{h}$`,
        `Calcular $f(x+h) = ${a}(x+h)^2 ${sgn(b)}(x+h)$`,
        `Desarrollar y restar $f(x)$: queda $${2 * a}xh + ${a}h^2 ${sgn(b)}h$`,
        'Sacar $h$ de factor común y simplificar con el denominador',
        `Tomar el límite $h \\to 0$: queda $f'(x) = ${T(poly([2 * a, b]))}$`,
      ]
      return make({
        subtopic: 'Definición de derivada', concepts: ['d2.definicion'], level, levelWhy: 'Nivel Analista: hay que entender por qué cada paso va antes que el siguiente.',
        prompt: `Ordená los pasos para derivar por definición $f(x) = ${T(poly([a, b, 0]))}$.`,
        hints: ['No se puede simplificar algo que todavía no se calculó.', 'El límite se toma **al final**, cuando ya no hay $h$ en el denominador.'],
        solution: steps.map((s, i) => ({ text: `${i + 1}. ${s}` })),
        explanation: 'Si se toma el límite antes de simplificar, aparece $0/0$. Simplificar es posible porque mientras $h \\to 0$, $h \\neq 0$.',
      }, { kind: 'order', items: steps })
    },
  },
  fixed('d2.tf.cont', A, 'd2', 'Continuidad no implica derivabilidad', (r) => make({
    subtopic: 'Derivabilidad', concepts: ['d2.derivable'], level: 3, levelWhy: 'Nivel Analista: trampa conceptual clásica (la recíproca de un teorema).',
    prompt: 'Decidí y justificá:',
    plot: { fns: [{ expr: 'abs(x)', label: '|x|' }], x: [-4, 4], y: [-1, 4] },
    hints: ['Mirá el gráfico de $|x|$ en $x = 0$.', '¿Las pendientes por izquierda y por derecha coinciden?'],
    solution: [{ text: '$|x|$ es continua en 0 (no tiene saltos), pero su pendiente vale $-1$ a la izquierda y $1$ a la derecha: no hay una única recta tangente. No es derivable en 0.' }],
    explanation: 'Vale **derivable ⇒ continua**, pero no al revés. Picos (puntos angulosos), tangentes verticales y oscilaciones rompen la derivabilidad sin romper la continuidad.',
    commonErrors: ['Creer que "sin saltos" alcanza para ser derivable.'],
  }, { kind: 'tf', statement: 'Si $f$ es continua en $x = a$, entonces $f$ es derivable en $x = a$.', answer: false, reasons: r.shuffle([
    { text: 'Falso: $|x|$ es continua en 0 y no es derivable ahí (tiene un pico).', correct: true },
    { text: 'Verdadero: ser continua significa no tener saltos, y entonces se puede trazar la tangente.', why: 'En un pico no hay una única tangente.', errorTag: 'continua-implica-derivable' },
    { text: 'Falso: porque las funciones derivables nunca son continuas.', why: 'Al revés: toda derivable es continua.' },
  ]) })),

  /* ============ d3 · Reglas básicas ============ */
  {
    id: 'd3.power', area: A, unit: 'd3', title: 'Potencias y polinomios', levels: [1, 2, 3],
    gen: (r, level) => {
      let f: string, hints: string[], steps: { text: string; tex?: string }[], wrong: { expr: string; why: string; errorTag?: string }[]
      if (level === 1) {
        const n = r.int(2, 9), a = r.nonZero(-6, 6)
        f = `${a}*x^${n}`
        hints = ['Regla de la potencia: $(x^n)' + "'" + ' = n\\,x^{n-1}$.', 'El número que multiplica espera afuera.']
        steps = [{ text: `Baja el exponente ${n} y se le resta 1:`, tex: `${a}\\cdot ${n}x^{${n - 1}}` }]
        wrong = [{ expr: `${a}*x^${n + 1}/${n + 1}`, why: 'Eso es **integrar**. Para derivar, el exponente baja y se le resta 1.', errorTag: 'integro-en-vez-de-derivar' }, { expr: `${a * n}*x^${n}`, why: 'Bajaste el exponente pero no le restaste 1.', errorTag: 'potencia-sin-restar' }]
      } else if (level === 2) {
        const c = [r.nonZero(-4, 4), r.int(-5, 5), r.int(-6, 6), r.int(-9, 9)]
        f = poly(c)
        hints = ['Derivá término a término (la derivada de una suma es la suma de las derivadas).', 'Las constantes sueltas tienen derivada 0.']
        steps = [{ text: 'Término a término:', tex: `f'(x) = ${T(poly(polyDer(c)))}` }]
        wrong = [{ expr: poly(polyDer(c)) + ` + ${Math.abs(c[3]) || 1}`, why: 'El término independiente desaparece: la derivada de una constante es 0.', errorTag: 'constante' }]
      } else {
        const a = r.nonZero(-4, 4), k = r.pick([1, 2, 3]), b = r.nonZero(-5, 5)
        f = `${a}*sqrt(x) ${sgn(b)}/x^${k}`
        hints = ['Antes de derivar, escribí todo como potencias: $\\sqrt x = x^{1/2}$, $\\frac{1}{x^k} = x^{-k}$.', `Al exponente $-${k}$ se le resta 1: queda $-${k + 1}$.`, '$(x^{1/2})\' = \\frac12 x^{-1/2} = \\frac{1}{2\\sqrt x}$.']
        steps = [{ text: 'Reescribimos:', tex: `f(x) = ${a}x^{1/2} ${sgn(b)}x^{-${k}}` }, { text: 'Regla de la potencia en cada término:', tex: `f'(x) = ${a}\\cdot\\tfrac12 x^{-1/2} ${sgn(-b * k)}x^{-${k + 1}}` }]
        wrong = [{ expr: `${a}/(2*sqrt(x)) ${sgn(-b * k)}*x^(-${k - 1})`, why: `Al exponente negativo $-${k}$ le **sumaste** 1. Restar 1 a un negativo lo hace más negativo: $-${k} - 1 = -${k + 1}$.`, errorTag: 'exponente-negativo' }, { expr: `${a}/(2*sqrt(x)) ${sgn(b * k)}*x^(-${k + 1})`, why: 'Revisá el signo: baja un exponente negativo.', errorTag: 'signo' }]
      }
      return derivExercise({ f, level, subtopic: 'Regla de la potencia', concepts: ['d3.potencia'], levelWhy: level === 1 ? LV[1] : level === 2 ? LV[2] : 'Nivel Analista: hay que reescribir raíces y fracciones como potencias antes de derivar.', hints, steps, explanation: 'La regla $(x^n)\' = n x^{n-1}$ vale para **cualquier** exponente real (positivo, negativo o fraccionario). Por eso conviene reescribir raíces y fracciones como potencias.', wrong, commonErrors: ['Derivar $\\frac1{x^2}$ como $\\frac{1}{2x}$.'] })
    },
  },
  {
    id: 'd3.evalDeriv', area: A, unit: 'd3', title: 'Pendiente en un punto', levels: [2],
    gen: (r) => {
      const c = [r.nonZero(-3, 3), r.int(-4, 4), r.int(-5, 5), r.int(-5, 5)]
      const x0 = r.int(-2, 2)
      const val = polyEval(polyDer(c), x0)
      return make({
        data: { kind: 'derivAt', f: poly(c), x: x0 }, subtopic: 'Pendiente de la tangente', concepts: ['d3.potencia', 'd1.tangente'], level: 2, levelWhy: LV[2],
        prompt: `¿Cuál es la pendiente de la recta tangente a $f(x) = ${T(poly(c))}$ en $x = ${x0}$?`,
        hints: ['La pendiente de la tangente es $f\'(x_0)$.', 'Primero derivá, **después** reemplazá.'],
        solution: [{ text: 'Derivamos:', tex: `f'(x) = ${T(poly(polyDer(c)))}` }, { text: 'Evaluamos:', tex: `f'(${x0}) = ${val}` }],
        explanation: 'La derivada es una función que, en cada $x$, da la pendiente de la tangente.',
        commonErrors: ['Reemplazar en $f$ en vez de en $f\'$.', 'Reemplazar antes de derivar (la derivada de un número es 0).'],
        noCalc: true,
      }, { kind: 'numeric', answer: val, wrong: [{ value: polyEval(c, x0), why: 'Ese es $f(' + x0 + ')$, la altura del punto. La pendiente es $f\'(' + x0 + ')$.', errorTag: 'derivada-vs-valor' }] })
    },
  },
  {
    id: 'd3.match', area: A, unit: 'd3', title: 'Relacioná funciones y derivadas', levels: [1],
    gen: (r) => {
      const a = r.int(2, 5), n = r.int(3, 6)
      const pairs = r.shuffle([
        { left: `$${a}x$`, right: `$${a}$` },
        { left: `$x^{${n}}$`, right: `$${n}x^{${n - 1}}$` },
        { left: '$\\sqrt{x}$', right: '$\\dfrac{1}{2\\sqrt{x}}$' },
        { left: '$\\dfrac{1}{x}$', right: '$-\\dfrac{1}{x^2}$' },
        { left: `$${a + 3}$`, right: '$0$' },
      ]).slice(0, 4)
      return make({
        subtopic: 'Regla de la potencia', concepts: ['d3.potencia'], level: 1, levelWhy: LV[1],
        prompt: 'Relacioná cada función con su derivada.',
        hints: ['$(x^n)\' = n x^{n-1}$, también para $n = \\frac12$ y $n = -1$.', 'La derivada de una constante es 0.'],
        solution: pairs.map((p) => ({ text: `${p.left} → ${p.right}` })),
        explanation: 'Todas salen de la regla de la potencia: $\\sqrt x = x^{1/2}$ y $\\frac1x = x^{-1}$.',
      }, { kind: 'match', pairs })
    },
  },

  /* ============ d4 · Exponenciales, logaritmos, trigonométricas ============ */
  {
    id: 'd4.table', area: A, unit: 'd4', title: 'Exponencial, logaritmo y trigonométricas', levels: [1, 2],
    gen: (r, level) => {
      if (level === 1) {
        const q = r.pick([
          { f: '\\cos x', ok: '$-\\operatorname{sen} x$', bad: ['$\\operatorname{sen} x$', '$-\\cos x$'], why: 'Cuando el coseno "pasa la pelota", se le cae un menos.' },
          { f: '\\operatorname{sen} x', ok: '$\\cos x$', bad: ['$-\\cos x$', '$-\\operatorname{sen} x$'], why: '' },
          { f: 'e^x', ok: '$e^x$', bad: ['$x\\,e^{x-1}$', '$e$'], why: '$e^x$ es la única función (no nula) que es igual a su derivada.' },
          { f: '\\ln x', ok: '$\\dfrac{1}{x}$', bad: ['$\\dfrac{1}{\\ln x}$', '$e^x$'], why: '' },
        ])
        return make({
          subtopic: 'Derivadas de la tabla', concepts: ['d4.tabla'], level: 1, levelWhy: LV[1],
          prompt: `¿Cuál es la derivada de $${q.f}$?`,
          hints: ['Es un dato de la tabla de derivadas.', 'Pensá en el gráfico: ¿dónde la pendiente es positiva?'],
          solution: [{ text: `$(${q.f})' = ${q.ok.replace(/\$/g, '')}$. ${q.why}` }],
          explanation: 'Estas derivadas salen de la definición (límites notables). Conviene saberlas de memoria.',
        }, mc(r, [{ text: q.ok, correct: true }, { text: q.bad[0], why: 'Revisá la tabla.' + (q.f === 'e^x' ? ' $e^x$ no se deriva como una potencia: la variable está en el exponente.' : ''), errorTag: q.f === 'e^x' ? 'exp-como-potencia' : 'tabla' }, { text: q.bad[1], why: 'Revisá la tabla.', errorTag: 'tabla' }]))
      }
      const a = r.nonZero(-4, 4), b = r.nonZero(-4, 4), c = r.nonZero(-4, 4)
      const f = `${a}*e^x ${sgn(b)}*ln(x) ${sgn(c)}*cos(x)`
      return derivExercise({
        f, level: 2, subtopic: 'Derivadas de la tabla', concepts: ['d4.tabla'], levelWhy: LV[2],
        hints: ['Derivá cada término por separado.', "$(e^x)' = e^x$, $(\\ln x)' = 1/x$, $(\\cos x)' = -\\operatorname{sen} x$."],
        steps: [{ text: 'Término a término con la tabla.' }],
        explanation: 'La derivada de una suma es la suma de las derivadas, y las constantes multiplicativas salen afuera.',
        wrong: [{ expr: `${a}*e^x ${sgn(b)}/x ${sgn(c)}*sin(x)`, why: 'La derivada del coseno es $-\\operatorname{sen} x$: falta el signo menos.', errorTag: 'signo-coseno' }],
      })
    },
  },

  /* ============ d5 · Producto y cociente ============ */
  {
    id: 'd5.product', area: A, unit: 'd5', title: 'Regla del producto', levels: [2, 3],
    gen: (r, level) => {
      const [p, q] = r.shuffle(ATOMS).slice(0, 2)
      const k = level === 3 ? r.pick([2, 3]) : 1
      const f = `${k === 1 ? '' : k + '*'}${p.f}*${q.f}`
      return derivExercise({
        f, level, subtopic: 'Regla del producto', concepts: ['d5.producto'], levelWhy: level === 2 ? LV[2] : 'Nivel Analista: producto con constante y simplificación del resultado.',
        hints: ['Es un producto de dos funciones con $x$: regla del producto.', "$(u\\cdot v)' = u'\\,v + u\\,v'$", `$u = ${p.tex}$, $v = ${q.tex}$.`],
        steps: [{ text: `$u = ${p.tex}$, $u' = ${T(p.d)}$; $v = ${q.tex}$, $v' = ${T(q.d)}$.` }, { text: 'Regla del producto:', tex: `${k === 1 ? '' : k + '\\left['}${T(p.d)}\\cdot ${q.tex} + ${p.tex}\\cdot ${T(q.d)}${k === 1 ? '' : '\\right]'}` }],
        explanation: 'Si las dos funciones cambian, el producto cambia por dos motivos: porque cambia $u$ (con $v$ fijo) y porque cambia $v$ (con $u$ fijo). Por eso hay dos términos.',
        wrong: [{ expr: `${k}*(${p.d})*(${q.d})`, why: 'Derivaste los dos factores y los multiplicaste: $(uv)\' \\neq u\'v\'$. La regla del producto tiene **dos términos**.', errorTag: 'producto-de-derivadas' }, { expr: `${k}*(${p.d})*(${q.f})`, why: 'Te faltó el segundo término: $u\\,v\'$.', errorTag: 'producto-incompleto' }],
        commonErrors: ['$(uv)\' = u\'v\'$ (falso).'],
      })
    },
  },
  {
    id: 'd5.quotient', area: A, unit: 'd5', title: 'Regla del cociente', levels: [2, 3],
    gen: (r, level) => {
      let f: string, u: string, v: string, du: string, dv: string
      if (level === 2) {
        const a = r.nonZero(-3, 3), b = r.int(-4, 4), c = r.nonZero(-4, 4)
        u = `x ${sgn(a)}`; v = `x ${sgn(c === -a ? c + 1 : c)}`; du = '1'; dv = '1'
        f = `(${u})/(${v})`
        void b
      } else {
        const atom = r.pick(ATOMS.filter((x) => x.f !== 'sqrt(x)'))
        const c = r.int(1, 4)
        u = atom.f; du = atom.d; v = `x^2 + ${c}`; dv = '2*x'
        f = `(${u})/(${v})`
      }
      return derivExercise({
        f, level, subtopic: 'Regla del cociente', concepts: ['d5.cociente'], levelWhy: level === 2 ? LV[2] : 'Nivel Analista: el numerador combina una función de la tabla con un polinomio.',
        hints: ["$\\left(\\dfrac{u}{v}\\right)' = \\dfrac{u'v - uv'}{v^2}$", 'El orden importa: **primero** la derivada de arriba.', `$u = ${T(u)}$, $v = ${T(v)}$.`],
        steps: [{ text: `$u' = ${T(du)}$, $v' = ${T(dv)}$.` }, { text: 'Cociente:', tex: `\\frac{${T(du)}\\cdot(${T(v)}) - (${T(u)})\\cdot ${T(dv)}}{(${T(v)})^2}` }],
        explanation: 'La regla del cociente sale de escribir $\\frac uv = u\\cdot v^{-1}$ y usar producto + cadena. El signo menos y el orden vienen de derivar $v^{-1}$.',
        wrong: [{ expr: `((${u})*(${dv}) - (${du})*(${v}))/(${v})^2`, why: 'Invertiste el orden del numerador: es $u\'v - uv\'$ (primero la derivada de arriba). Al revés, el resultado queda con el signo cambiado.', errorTag: 'cociente-orden' }, { expr: `(${du})/(${dv})`, why: 'Derivaste arriba y abajo por separado. Eso no es la derivada de un cociente.', errorTag: 'cociente-separado' }],
        commonErrors: ['Invertir el orden del numerador.', 'Olvidar elevar el denominador al cuadrado.'],
      })
    },
  },

  /* ============ d6 · Cadena ============ */
  {
    id: 'd6.chain', area: A, unit: 'd6', title: 'Regla de la cadena', levels: [2, 3, 4],
    gen: (r, level) => {
      let cse = chainCase(r, level)
      // evitar raíces y logaritmos de interiores que se anulan en todos lados del dominio
      for (let i = 0; i < 5 && (cse.outer.name === 'raíz' || cse.outer.name === 'logaritmo') && !/x\^2 \+|\+/.test(cse.inner.u); i++) cse = chainCase(r, level)
      let f = cse.f
      let extra: { text: string; tex?: string }[] = []
      if (level === 4) {
        // cadena doble: (sen(...))^n o e^(sen(...))
        const n = r.pick([2, 3])
        const inner = cse.inner
        f = r.chance(0.5) ? `sin(${inner.u})^${n}` : `e^(sin(${inner.u}))`
        extra = [{ text: 'Hay **tres capas**: se aplica la cadena dos veces, de afuera hacia adentro.' }]
      }
      const missingInner = level === 4 ? null : cse.outer.outerD(cse.inner.u)
      return derivExercise({
        f, level, subtopic: 'Regla de la cadena', concepts: ['d6.cadena'], levelWhy: level === 2 ? LV[2] : level === 3 ? 'Nivel Analista: el interior no es lineal y su derivada depende de $x$.' : 'Nivel Experto: composición de tres funciones; un descuido en cualquier capa arruina el resultado.',
        hints: ['Identificá la función de afuera y la de adentro.', 'Derivá la de afuera **dejando lo de adentro igual**, y multiplicá por la derivada de lo de adentro.', level === 4 ? 'Con tres capas: afuera → medio → adentro, multiplicando las tres derivadas.' : `Adentro: $u = ${T(cse.inner.u)}$, con $u' = ${T(cse.inner.du)}$.`],
        steps: [...extra, { text: `Afuera: ${level === 4 ? 'la potencia o la exponencial' : cse.outer.desc}. Adentro: $${T(cse.inner.u)}$.` }, { text: 'Cadena:', tex: `f'(x) = \\underbrace{${level === 4 ? '\\ldots' : T(cse.outer.outerD(cse.inner.u))}}_{\\text{afuera}}\\cdot\\underbrace{${level === 4 ? '\\ldots' : T(cse.inner.du)}}_{\\text{adentro}}` }],
        explanation: 'Si $y = f(u)$ y $u = g(x)$, cuando $x$ cambia un poquito, $u$ cambia $g\'(x)$ veces eso, y $y$ cambia $f\'(u)$ veces el cambio de $u$: las tasas se **multiplican**.',
        wrong: missingInner ? [{ expr: missingInner, why: `Te faltó multiplicar por la **derivada de lo de adentro**, $(${T(cse.inner.u)})' = ${T(cse.inner.du)}$.`, errorTag: 'cadena-interior' }] : [],
        commonErrors: ['Olvidar multiplicar por la derivada interior.', 'Derivar también lo de adentro "dentro" de la función exterior.'],
      })
    },
  },
  {
    id: 'd6.identify', area: A, unit: 'd6', title: 'Identificar exterior e interior', levels: [1],
    gen: (r) => {
      const cse = chainCase(r, 3)
      return make({
        subtopic: 'Regla de la cadena', concepts: ['d6.cadena'], level: 1, levelWhy: 'Nivel Explorador: reconocer la estructura de la composición antes de derivar.',
        prompt: `En $f(x) = ${T(cse.f)}$, ¿cuál es la función **interior** $u(x)$?`,
        hints: ['La función interior es "lo que está adentro" de la otra.', '¿Qué cuenta harías **primero** si tuvieras que calcular $f(2)$?'],
        solution: [{ text: `Primero se calcula $${T(cse.inner.u)}$ y después se le aplica ${cse.outer.desc}. Interior: $u = ${T(cse.inner.u)}$.` }],
        explanation: 'La función interior es la que se evalúa primero; la exterior actúa sobre su resultado.',
      }, mc(r, [
        { text: `$${T(cse.inner.u)}$`, correct: true },
        { text: `$${T(cse.f)}$`, why: 'Esa es la función completa.' },
        { text: `$${T(cse.inner.du)}$`, why: 'Esa es la derivada del interior.', errorTag: 'cadena-interior' },
      ]))
    },
  },
  {
    id: 'd6.fill', area: A, unit: 'd6', title: 'Completá la cadena', levels: [2],
    gen: (r) => {
      const a = r.pick([2, 3, 4]), c = r.int(1, 5), n = r.pick([3, 4, 5])
      return make({
        subtopic: 'Regla de la cadena', concepts: ['d6.cadena'], level: 2, levelWhy: LV[2],
        prompt: `Completá la derivada de $f(x) = (${a}x^2 + ${c})^{${n}}$.`,
        hints: ['El exponente baja y se le resta 1 (afuera).', `La derivada de adentro es $(${a}x^2 + ${c})' = ${2 * a}x$.`],
        solution: [{ text: '', tex: `f'(x) = ${n}(${a}x^2 + ${c})^{${n - 1}}\\cdot ${2 * a}x` }],
        explanation: 'Afuera: regla de la potencia sobre el paréntesis completo. Adentro: la derivada del contenido.',
      }, { kind: 'fill', parts: [`$f'(x) = $`, { blank: true, id: 'n', answer: String(n), mode: 'number', size: 3 }, `$\\cdot(${a}x^2 + ${c})^{\\square}$ con exponente`, { blank: true, id: 'e', answer: String(n - 1), mode: 'number', size: 3 }, '$\\cdot$', { blank: true, id: 'du', answer: `${2 * a}*x`, mode: 'expression', size: 6 }] })
    },
  },
  {
    id: 'd6.error', area: A, unit: 'd6', title: 'Cazá el error en la cadena', levels: [3],
    gen: (r) => {
      const a = r.pick([2, 3, 5]), c = r.int(1, 6)
      return make({
        subtopic: 'Regla de la cadena', concepts: ['d6.cadena'], level: 3, levelWhy: 'Nivel Analista: hay que auditar un razonamiento ajeno, no solo calcular.',
        prompt: `Un estudiante derivó $f(x) = \\operatorname{sen}(${a}x^2 + ${c})$ así. ¿En qué paso está el **primer** error?`,
        hints: ['Revisá paso por paso: ¿cada igualdad es verdadera?', 'Después de derivar el seno, ¿se multiplicó por la derivada del argumento?'],
        solution: [{ text: `El paso 2 olvida multiplicar por $(${a}x^2 + ${c})' = ${2 * a}x$. Lo correcto: $f'(x) = ${2 * a}x\\cos(${a}x^2 + ${c})$.` }],
        explanation: 'La regla de la cadena siempre agrega el factor "derivada de lo de adentro". Sin él, la derivada solo es correcta si lo de adentro es $x$.',
      }, { kind: 'errorStep', steps: [`$f(x) = \\operatorname{sen}(${a}x^2 + ${c})$ es una composición: afuera $\\operatorname{sen}$, adentro $${a}x^2 + ${c}$.`, `$f'(x) = \\cos(${a}x^2 + ${c})$`, `Entonces $f'(0) = \\cos(${c})$.`], wrongIndex: 1, ruleOptions: r.shuffle([
        { text: 'Falta multiplicar por la derivada del argumento (regla de la cadena).', correct: true, why: `Debería ser $\\cos(${a}x^2 + ${c})\\cdot ${2 * a}x$.` },
        { text: 'La derivada del seno es $-\\cos$.', why: 'No: $(\\operatorname{sen} u)\' = \\cos u\\cdot u\'$.', errorTag: 'tabla' },
        { text: 'Había que usar la regla del producto.', why: 'No hay un producto de funciones: es una composición.' },
      ]), fix: { answer: `${2 * a}*x*cos(${a}*x^2 + ${c})`, v: 'x', domain: [0.2, 2], mode: 'exact' } })
    },
  },

  /* ============ d7 · Implícita y orden superior ============ */
  {
    id: 'd7.second', area: A, unit: 'd7', title: 'Derivada segunda', levels: [2, 3],
    gen: (r, level) => {
      const f = level === 2 ? poly([r.nonZero(-3, 3), r.int(-4, 4), r.int(-4, 4), r.int(-5, 5)]) : `${r.pick([1, 2, 3])}*e^(${r.pick([2, 3, -1, -2])}*x)`
      const d2 = toText(diff(diff(parse(f))))
      return make({
        subtopic: 'Derivadas de orden superior', concepts: ['d7.orden'], level, levelWhy: level === 2 ? LV[2] : 'Nivel Analista: hay que aplicar la cadena dos veces seguidas.',
        prompt: `Calculá $f''(x)$ para $f(x) = ${T(f)}$.`,
        hints: ["$f''$ es la derivada de $f'$: derivás dos veces.", 'Hacé primero $f\'$ y simplificá antes de volver a derivar.'],
        solution: [{ text: 'Primera derivada:', tex: `f'(x) = ${DT(f)}` }, { text: 'Segunda derivada:', tex: `f''(x) = ${toTeX(diff(diff(parse(f))))}` }],
        explanation: "La derivada segunda mide cómo cambia la pendiente. En física, si $s$ es la posición, $s''$ es la aceleración.",
        noCalc: true,
      }, { kind: 'expression', answer: d2, v: 'x', mode: 'exact', domain: [-2, 2], prefix: "f''(x) =", wrong: [{ expr: D(f), why: 'Esa es $f\'$: derivaste una sola vez.', errorTag: 'orden' }] })
    },
  },
  {
    id: 'd7.implicit', area: A, unit: 'd7', title: 'Derivación implícita', levels: [3, 4],
    gen: (r, level) => {
      if (level === 3) {
        const trip = r.pick([[3, 4, 5], [5, 12, 13], [6, 8, 10], [8, 6, 10]])
        const sx = r.pick([1, -1]), sy = r.pick([1, -1])
        const x0 = sx * trip[0], y0 = sy * trip[1], R2 = trip[2] ** 2
        return make({
          data: { kind: 'implicit', F: `x^2 + y^2 - ${R2}`, p: x0, q: y0 }, subtopic: 'Derivación implícita', concepts: ['d7.implicita'], level, levelWhy: 'Nivel Analista: hay que derivar tratando a $y$ como función de $x$ (regla de la cadena oculta).',
          prompt: `Hallá la pendiente de la recta tangente a $x^2 + y^2 = ${R2}$ en el punto $(${x0}, ${y0})$.`,
          plot: { fns: [{ expr: `sqrt(${R2} - x^2)` }, { expr: `-sqrt(${R2} - x^2)` }], points: [{ x: x0, y: y0, label: 'P' }], x: [-trip[2] - 3, trip[2] + 3], y: [-trip[2] - 3, trip[2] + 3] },
          hints: ['Derivá los dos miembros respecto de $x$.', "$\\frac{d}{dx}(y^2) = 2y\\,y'$ (cadena: $y$ depende de $x$).", "Despejá $y'$ y reemplazá el punto."],
          solution: [{ text: 'Derivando:', tex: "2x + 2y\\,y' = 0 \\Rightarrow y' = -\\frac{x}{y}" }, { text: 'En el punto:', tex: `y' = -\\frac{${x0}}{${y0}} = ${fracStr(-x0, y0).replace(/(-?\d+)\/(\d+)/, '\\frac{$1}{$2}')}` }],
          explanation: 'Aunque $y$ no esté despejada, sigue siendo (localmente) una función de $x$; al derivar $y^2$ aparece $y\'$ por la regla de la cadena.',
          commonErrors: ["Derivar $y^2$ como $2y$ (sin $y'$)."],
          noCalc: true,
        }, { kind: 'numeric', answer: -x0 / y0, answerText: fracStr(-x0, y0), wrong: [{ value: x0 / y0, why: 'Revisá el signo: $y\' = -x/y$.', errorTag: 'signo' }, { value: -y0 / x0, why: 'Invertiste el cociente: es $-x/y$.', errorTag: 'implicita' }] })
      }
      // x²y + xy² = c en un punto entero (p, q): y' = −(2xy + y²)/(x² + 2xy)
      const [p, q] = r.pick([[1, 2], [2, 1], [1, 3], [3, 1], [2, 3], [1, -3], [-1, 3], [3, -1]] as const)
      const c = p * p * q + p * q * q
      const num = 2 * p * q + q * q, den = p * p + 2 * p * q
      return make({
        data: { kind: 'implicit', F: `x^2*y + x*y^2 - (${c})`, p, q }, subtopic: 'Derivación implícita', concepts: ['d7.implicita'], level, levelWhy: 'Nivel Experto: hay productos $x^2y$ y $xy^2$ que requieren la regla del producto dentro de la derivación implícita.',
        prompt: `Hallá la pendiente de la recta tangente a la curva $x^2y + xy^2 = ${c}$ en el punto $(${p}, ${q})$.`,
        hints: ['Derivá ambos miembros respecto de $x$. Cada término es un **producto**.', "$\\frac{d}{dx}(x^2y) = 2xy + x^2y'$ y $\\frac{d}{dx}(xy^2) = y^2 + 2xy\\,y'$.", "Agrupá los términos con $y'$, despejá y recién después reemplazá el punto."],
        solution: [
          { text: `Primero se comprueba que el punto está en la curva: $${p * p}\\cdot ${par(q)} + ${par(p)}\\cdot ${q * q} = ${c}$ ✓.` },
          { text: 'Derivando:', tex: "2xy + x^2y' + y^2 + 2xy\\,y' = 0 \\Rightarrow y' = -\\frac{2xy + y^2}{x^2 + 2xy}" },
          { text: `En $(${p}, ${q})$:`, tex: `y' = -\\frac{${num}}{${den}} = ${fracStr(-num, den)}` },
        ],
        explanation: 'Aunque $y$ no esté despejada, cerca del punto sigue siendo una función de $x$; por eso al derivar $y^2$ aparece $2y\\,y\'$ (cadena) y al derivar $x^2y$ se usa la regla del producto.',
        commonErrors: ["Derivar $x^2y$ como $2xy$ (olvidar el término $x^2y'$).", 'Reemplazar el punto antes de despejar y confundirse con los signos.'],
        noCalc: true,
      }, { kind: 'numeric', answer: -num / den, answerText: fracStr(-num, den), wrong: [{ value: num / den, why: 'Revisá el signo: al pasar de miembro queda un menos.', errorTag: 'signo' }, { value: -(2 * p * q) / (p * p), why: "Olvidaste los términos que vienen de $xy^2$.", errorTag: 'producto' }] })
    },
  },

  /* ============ d8 · Tangente, normal y física ============ */
  {
    id: 'd8.tangent', area: A, unit: 'd8', title: 'Recta tangente y normal', levels: [2, 3],
    gen: (r, level) => {
      const c = [r.pick([1, -1, 2]), r.int(-3, 3), r.int(-4, 4), r.int(-3, 3)]
      const f = poly(c)
      const x0 = r.int(-2, 2)
      const y0 = polyEval(c, x0), m = polyEval(polyDer(c), x0)
      const normal = level === 3 && m !== 0
      const slope = normal ? -1 / m : m
      const ans = `${slope}*(x - (${x0})) + (${y0})`
      return make({
        data: { kind: normal ? 'normalLine' : 'tangentLine', f: poly(c), x: x0 }, subtopic: normal ? 'Recta normal' : 'Recta tangente', concepts: ['d8.tangente'], level: normal ? 3 : 2, levelWhy: normal ? 'Nivel Analista: combina tangente con perpendicularidad.' : LV[2],
        prompt: `Hallá la ecuación de la recta ${normal ? '**normal**' : 'tangente'} a $f(x) = ${T(f)}$ en $x_0 = ${x0}$.`,
        plot: { fns: [{ expr: f, label: 'f' }], points: [{ x: x0, y: y0, label: 'P' }], x: [x0 - 4, x0 + 4], y: [y0 - 8, y0 + 8] },
        hints: ['Necesitás un punto y una pendiente.', `Punto: $(${x0}, f(${x0}))$. Pendiente de la tangente: $f'(${x0})$.`, normal ? 'La normal es perpendicular a la tangente: pendiente $-1/f\'(x_0)$.' : 'Usá $y - y_0 = m(x - x_0)$.'],
        solution: [{ text: `Punto: $f(${x0}) = ${y0}$.` }, { text: 'Pendiente de la tangente:', tex: `f'(x) = ${T(poly(polyDer(c)))} \\Rightarrow f'(${x0}) = ${m}` }, ...(normal ? [{ text: `Pendiente de la normal: $-1/${par(m)} = ${fracStr(-1, m).replace(/(-?\d+)\/(\d+)/, '\\frac{$1}{$2}')}$.` }] : []), { text: 'Recta (punto-pendiente):', tex: `y = ${T(`${y0} + (${slope})*(x - (${x0}))`)}` }],
        explanation: 'La tangente es la recta que mejor aproxima a la curva cerca del punto. La normal es la perpendicular a la tangente en ese punto.',
        commonErrors: ['Usar $f(x_0)$ como pendiente.', 'Usar la fórmula general $f\'(x)$ en lugar del número $f\'(x_0)$.'],
        noCalc: true,
      }, { kind: 'expression', answer: ans, v: 'x', mode: 'exact', domain: [-4, 4], prefix: 'y =', wrong: normal ? [{ expr: `${m}*(x - (${x0})) + (${y0})`, why: 'Esa es la **tangente**. La normal tiene pendiente $-1/m$.', errorTag: 'normal-vs-tangente' }] : [{ expr: `${y0}*(x - (${x0})) + (${m})`, why: 'Intercambiaste el valor de la función con la pendiente.', errorTag: 'derivada-vs-valor' }] })
    },
  },
  {
    id: 'd8.motion', area: A, unit: 'd8', title: 'Velocidad y aceleración', levels: [2, 3],
    gen: (r, level) => {
      const t1 = r.int(1, 2), t2 = t1 + r.int(1, 3)
      // s(t) = t^3 - 3(t1+t2)/2 t^2 + 3 t1 t2 t → v = 3(t - t1)(t - t2)
      const c2 = -1.5 * (t1 + t2), c1 = 3 * t1 * t2
      const s = `t^3 ${sgn(c2)}*t^2 ${sgn(c1)}*t`
      if (level === 2) {
        const t0 = r.int(0, 4)
        const v = 3 * t0 * t0 + 2 * c2 * t0 + c1, a = 6 * t0 + 2 * c2
        return make({
          subtopic: 'Interpretación física', concepts: ['d8.fisica'], level, levelWhy: LV[2],
          prompt: `La posición de un móvil es $s(t) = ${T(s, ['t'])}$ (m, s). Calculá su velocidad y su aceleración en $t = ${t0}$.`,
          hints: ["$v(t) = s'(t)$ y $a(t) = v'(t) = s''(t)$.", 'Derivá dos veces y reemplazá.'],
          solution: [{ text: '', tex: `v(t) = ${T(`3*t^2 ${sgn(2 * c2)}*t ${sgn(c1)}`, ['t'])}, \\quad a(t) = ${T(`6*t ${sgn(2 * c2)}`, ['t'])}` }, { text: `$v(${t0}) = ${v}$ m/s, $a(${t0}) = ${a}$ m/s².` }],
          explanation: 'La velocidad es la tasa de cambio de la posición; la aceleración, la tasa de cambio de la velocidad.',
          noCalc: true,
        }, { kind: 'fill', parts: [`$v(${t0}) =$`, { blank: true, id: 'v', answer: String(v), mode: 'number' }, 'm/s · $a(' + t0 + ') =$', { blank: true, id: 'a', answer: String(a), mode: 'number' }, 'm/s²'] })
      }
      return make({
        subtopic: 'Interpretación física', concepts: ['d8.fisica'], level, levelWhy: 'Nivel Analista: interpretar los ceros de la velocidad y el sentido del movimiento.',
        prompt: `Con $s(t) = ${T(s, ['t'])}$, ¿en qué instantes el móvil está **detenido**? Escribí el menor y el mayor.`,
        plot: { fns: [{ expr: s.replace(/t/g, 'x'), label: 's(t)' }], x: [-0.5, t2 + 2], y: [-5, 20] },
        hints: ['Detenido = velocidad cero.', "$v(t) = s'(t)$: derivá e igualá a 0.", `$v(t) = 3(t - ${t1})(t - ${t2})$`],
        solution: [{ text: '', tex: `v(t) = 3t^2 ${sgn(2 * c2)}t ${sgn(c1)} = 3(t - ${t1})(t - ${t2}) = 0` }, { text: `Detenido en $t = ${t1}$ y $t = ${t2}$. Entre ambos, $v < 0$: el móvil retrocede.` }],
        explanation: 'En el gráfico de la posición, los instantes con velocidad 0 son los de tangente horizontal (máximos y mínimos de $s$).',
        noCalc: true,
      }, { kind: 'fill', parts: ['$t_1 =$', { blank: true, id: 't1', answer: String(t1), mode: 'number' }, 's · $t_2 =$', { blank: true, id: 't2', answer: String(t2), mode: 'number' }, 's'] })
    },
  },

  /* ============ d9 · Crecimiento y extremos ============ */
  {
    id: 'd9.critical', area: A, unit: 'd9', title: 'Puntos críticos y extremos', levels: [2, 3],
    gen: (r, level) => {
      const p = r.int(-3, 0), q = p + r.int(1, 4)
      const k = r.pick([1, 2])
      // f' = 3k(x - p)(x - q) → f = k x^3 - 1.5k(p+q) x^2 + 3k p q x + d
      const d0 = r.int(-3, 3)
      const c = [k, -1.5 * k * (p + q), 3 * k * p * q, d0]
      const f = poly(c)
      const fp = polyEval(c, p), fq = polyEval(c, q)
      if (level === 2)
        return make({
          subtopic: 'Puntos críticos', concepts: ['d9.extremos'], level, levelWhy: LV[2],
          prompt: `Hallá los puntos críticos de $f(x) = ${T(f)}$ (las abscisas, de menor a mayor).`,
          hints: ["Puntos críticos: donde $f'(x) = 0$ (o no existe).", 'Derivá y resolvé la cuadrática.', `$f'(x) = ${3 * k}(x ${sgn(-p)})(x ${sgn(-q)})$`],
          solution: [{ text: '', tex: `f'(x) = ${T(poly(polyDer(c)))} = ${3 * k}(x ${sgn(-p)})(x ${sgn(-q)})` }, { text: `Críticos: $x = ${p}$ y $x = ${q}$.` }],
          explanation: 'En un máximo o mínimo relativo (de una función derivable) la tangente es horizontal: $f\'(x) = 0$. Pero no todo punto crítico es extremo.',
          noCalc: true,
        }, { kind: 'fill', parts: ['$x_1 =$', { blank: true, id: 'p', answer: String(p), mode: 'number' }, '· $x_2 =$', { blank: true, id: 'q', answer: String(q), mode: 'number' }] })
      return make({
        data: { kind: 'localMax', f, a: Math.min(p, q) - 3, b: Math.max(p, q) + 3 }, subtopic: 'Máximos y mínimos', concepts: ['d9.extremos', 'd9.crecimiento'], level, levelWhy: 'Nivel Analista: además de hallar los críticos hay que clasificarlos con el signo de $f\'$.',
        prompt: `Para $f(x) = ${T(f)}$: ¿cuál es el **valor** del máximo relativo?`,
        plot: { fns: [{ expr: f, label: 'f' }], x: [p - 2, q + 2], y: [Math.min(fp, fq) - 6, Math.max(fp, fq) + 6] },
        hints: ["Derivá, igualá a 0 y obtené los críticos.", "Mirá el signo de $f'$: el máximo está donde $f'$ pasa de $+$ a $-$.", `Con $a = ${k} > 0$ en la cúbica, el máximo está en el crítico de la izquierda, $x = ${p}$.`],
        solution: [{ text: `Críticos: $x = ${p}$ y $x = ${q}$.` }, { text: `$f'$ es positiva antes de ${p}, negativa entre ${p} y ${q}, positiva después: máximo en $x = ${p}$.` }, { text: `Valor: $f(${p}) = ${fp}$.` }],
        explanation: 'Criterio de la derivada primera: si $f\'$ cambia de $+$ a $-$, hay un máximo relativo; de $-$ a $+$, un mínimo.',
        commonErrors: ['Responder la abscisa en lugar del valor.', 'Confundir máximo con mínimo.'],
        noCalc: true,
      }, { kind: 'numeric', answer: fp, wrong: [{ value: p, why: 'Esa es la **abscisa** del máximo. Te piden el valor $f(x)$.', errorTag: 'abscisa-vs-valor' }, { value: fq, why: 'Ese es el valor del **mínimo** relativo.', errorTag: 'max-vs-min' }] })
    },
  },
  {
    id: 'd9.fprimeGraph', area: A, unit: 'd9', title: 'Leer f′ para entender f', levels: [3],
    gen: (r) => {
      const p = r.int(-3, -1), q = r.int(1, 3)
      const s = r.pick([1, -1])
      const fp = `${s}*(x ${sgn(-p)})*(x ${sgn(-q)})`
      const maxAt = s > 0 ? p : q
      return make({
        subtopic: 'Crecimiento y decrecimiento', concepts: ['d9.crecimiento'], level: 3, levelWhy: 'Nivel Analista: interpretación gráfica cruzada (se ve $f\'$ y se pregunta por $f$).',
        prompt: "El gráfico muestra la **derivada** $f'$ (¡no $f$!). ¿En qué $x$ tiene $f$ un máximo relativo?",
        plot: { fns: [{ expr: fp, label: "f'" }], points: [{ x: p, y: 0 }, { x: q, y: 0 }], x: [-5, 5], y: [-8, 8] },
        hints: ["Donde $f' > 0$ (curva arriba del eje), $f$ crece.", "Máximo de $f$: $f'$ pasa de positiva a negativa.", 'Buscá el corte con el eje donde la curva **baja**.'],
        solution: [{ text: `$f'$ cambia de $+$ a $-$ en $x = ${maxAt}$: ahí $f$ deja de crecer y empieza a decrecer. Máximo relativo en $x = ${maxAt}$.` }],
        explanation: 'El gráfico de $f\'$ no muestra alturas de $f$: muestra sus **pendientes**. Arriba del eje: $f$ sube; abajo: $f$ baja; cortes: posibles extremos.',
        commonErrors: ['Buscar el punto más alto del gráfico de $f\'$.'],
      }, { kind: 'numeric', answer: maxAt, wrong: [{ value: s > 0 ? q : p, why: 'Ahí $f\'$ pasa de negativa a positiva: es un **mínimo** de $f$.', errorTag: 'max-vs-min' }, { value: (p + q) / 2, why: 'Ese es el extremo de $f\'$, no de $f$. Fijate dónde $f\'$ **cambia de signo**.', errorTag: 'grafico-derivada' }] })
    },
  },
  {
    id: 'd9.absolute', area: A, unit: 'd9', title: 'Extremos absolutos en un intervalo', levels: [3, 4],
    gen: (r, level) => {
      // f = x^3 - 3 a^2 x en [lo, hi]
      const a = r.pick([1, 2])
      const c = [1, 0, -3 * a * a, 0]
      const lo = level === 3 ? 0 : -a - r.int(1, 2), hi = a + r.int(1, 2)
      const cands = [lo, hi, -a, a].filter((x) => x >= lo && x <= hi)
      const vals = cands.map((x) => polyEval(c, x))
      const mx = Math.max(...vals), mn = Math.min(...vals)
      return make({
        data: { kind: 'absExtrema', f: poly(c), a: lo, b: hi }, subtopic: 'Extremos absolutos', concepts: ['d9.extremos'], level, levelWhy: level === 3 ? 'Nivel Analista: candidatos interiores y bordes del intervalo.' : 'Nivel Experto: hay varios candidatos y alguno del borde puede ganarle al extremo relativo.',
        prompt: `Hallá el máximo y el mínimo **absolutos** de $f(x) = ${T(poly(c))}$ en $[${lo}, ${hi}]$.`,
        hints: ['Candidatos: puntos críticos **dentro** del intervalo y los **extremos** del intervalo.', `$f'(x) = 3x^2 - ${3 * a * a} = 0 \\Rightarrow x = \\pm ${a}$.`, 'Evaluá $f$ en todos los candidatos y compará.'],
        solution: [{ text: `Candidatos: ${cands.join(', ')}.` }, { text: cands.map((x, i) => `$f(${x}) = ${vals[i]}$`).join(', ') }, { text: `Máximo absoluto ${mx}, mínimo absoluto ${mn}.` }],
        explanation: 'Teorema de Weierstrass: una función continua en un intervalo cerrado alcanza máximo y mínimo absolutos, y están en puntos críticos o en los bordes.',
        commonErrors: ['Olvidar evaluar en los extremos del intervalo.'],
        noCalc: true,
      }, { kind: 'fill', parts: ['Máximo absoluto:', { blank: true, id: 'M', answer: String(mx), mode: 'number' }, '· Mínimo absoluto:', { blank: true, id: 'm', answer: String(mn), mode: 'number' }] })
    },
  },

  /* ============ d10 · Concavidad y estudio completo ============ */
  {
    id: 'd10.inflection', area: A, unit: 'd10', title: 'Punto de inflexión', levels: [2, 3],
    gen: (r, level) => {
      const h = r.int(-2, 2)
      const k = r.pick([1, -1, 2])
      // f = k x^3 - 3 k h x^2 + b x + d ; f'' = 6k(x - h)
      const b = r.int(-4, 4), d0 = r.int(-3, 3)
      const c = [k, -3 * k * h, b, d0]
      const f = poly(c)
      return make({
        data: { kind: 'inflection', f }, subtopic: 'Concavidad e inflexión', concepts: ['d10.concavidad'], level, levelWhy: level === 2 ? LV[2] : 'Nivel Analista: hay que justificar el cambio de concavidad, no solo resolver $f\'\' = 0$.',
        prompt: `¿En qué abscisa tiene $f(x) = ${T(f)}$ un punto de inflexión?`,
        hints: ["La concavidad la decide el signo de $f''$.", "Calculá $f''$ e igualá a 0.", "Verificá que $f''$ cambie de signo ahí."],
        solution: [{ text: '', tex: `f''(x) = ${T(poly(polyDer(polyDer(c))))} = ${6 * k}(x ${sgn(-h)})` }, { text: `$f''$ cambia de signo en $x = ${h}$: punto de inflexión.` }],
        explanation: "Un punto de inflexión es donde la curva cambia de \"sonrisa\" ($f'' > 0$) a \"tristeza\" ($f'' < 0$) o al revés.",
        commonErrors: ["Igualar $f'$ a cero (eso da puntos críticos, no inflexiones)."],
        noCalc: true,
      }, { kind: 'numeric', answer: h })
    },
  },
  fixed('d10.tf.inflection', A, 'd10', "Intuición: f'' = 0 no alcanza", (r) => make({
    subtopic: 'Concavidad e inflexión', concepts: ['d10.concavidad'], level: 4, levelWhy: 'Nivel Experto: condición necesaria vs. suficiente.',
    prompt: 'Decidí y justificá:',
    plot: { fns: [{ expr: 'x^4', label: 'x⁴' }], x: [-2, 2], y: [-0.5, 4] },
    hints: ["Probá con $f(x) = x^4$: ¿cuánto vale $f''(0)$?", '¿Cambia la concavidad en 0?'],
    solution: [{ text: "$f(x) = x^4$ tiene $f''(x) = 12x^2$, que vale 0 en $x = 0$, pero es $\\geq 0$ a ambos lados: la curva es cóncava hacia arriba en todo $\\mathbb{R}$. No hay inflexión." }],
    explanation: "$f''(a) = 0$ es una condición **necesaria** (si $f''$ existe) pero no **suficiente**: hace falta que $f''$ cambie de signo.",
  }, { kind: 'tf', statement: "Si $f''(a) = 0$, entonces $f$ tiene un punto de inflexión en $x = a$.", answer: false, reasons: r.shuffle([
    { text: "Falso: hace falta que $f''$ cambie de signo; $x^4$ tiene $f''(0) = 0$ y no tiene inflexión.", correct: true },
    { text: "Verdadero: es la definición de punto de inflexión.", why: 'La definición es el **cambio** de concavidad.', errorTag: 'inflexion-condicion' },
    { text: "Falso: porque en un punto de inflexión $f'$ tiene que valer 0.", why: '$f\'$ no tiene por qué anularse en una inflexión (pensá en $x^3 + x$).' },
  ]) })),
  {
    id: 'd10.study', area: A, unit: 'd10', title: 'Estudio completo de una función', levels: [5, 6],
    gen: (r, level) => {
      if (level === 5) {
        const p = r.int(-2, 0), q = p + r.int(2, 3)
        const c = [1, -1.5 * (p + q), 3 * p * q, r.int(-2, 2)]
        const f = poly(c)
        const infl = (p + q) / 2
        return make({
          subtopic: 'Estudio completo', concepts: ['d9.extremos', 'd10.concavidad', 'd9.crecimiento'], level, levelWhy: LV[5],
          prompt: `Estudio completo de $f(x) = ${T(f)}$. Respondé cada parte.`,
          hints: ['Organizate: $f\'$ → críticos → signo de $f\'$ → $f\'\'$ → inflexión.', `$f'(x) = 3(x ${sgn(-p)})(x ${sgn(-q)})$`],
          solution: [{ text: '', tex: `f'(x) = 3(x ${sgn(-p)})(x ${sgn(-q)}), \\quad f''(x) = 6x ${sgn(-3 * (p + q))}` }, { text: `Crece en $(-\\infty, ${p})\\cup(${q}, +\\infty)$, decrece en $(${p}, ${q})$.` }, { text: `Máximo relativo en $x = ${p}$ (valor ${polyEval(c, p)}), mínimo en $x = ${q}$ (valor ${polyEval(c, q)}). Inflexión en $x = ${fmt(infl)}$.` }],
          explanation: 'En un estudio completo, cada derivada responde una pregunta: $f\'$ dónde sube o baja, $f\'\'$ cómo se curva.',
          estMinutes: 12, noCalc: true,
        }, { kind: 'multi', parts: [
          { label: 'a', prompt: 'Abscisa del máximo relativo:', points: 1, kind: 'numeric', answer: p, wrong: [{ value: q, why: 'Ese es el mínimo: ahí $f\'$ pasa de $-$ a $+$.', errorTag: 'max-vs-min' }] },
          { label: 'b', prompt: 'Valor del mínimo relativo:', points: 1, kind: 'numeric', answer: polyEval(c, q), wrong: [{ value: q, why: 'Esa es la abscisa: te piden $f(x)$.', errorTag: 'abscisa-vs-valor' }] },
          { label: 'c', prompt: 'Abscisa del punto de inflexión:', points: 1, kind: 'numeric', answer: infl },
          { label: 'd', prompt: '¿En qué intervalo $f$ es cóncava hacia abajo?', points: 1, kind: 'mc', options: r.shuffle([{ text: `$(-\\infty, ${fmt(infl)})$`, correct: true }, { text: `$(${fmt(infl)}, +\\infty)$`, why: "Ahí $f'' > 0$: cóncava hacia arriba.", errorTag: 'concavidad' }, { text: `$(${p}, ${q})$`, why: 'Ese es el intervalo de decrecimiento (signo de $f\'$, no de $f\'\'$).', errorTag: 'crecimiento-vs-concavidad' }]) },
        ] })
      }
      // nivel 6: racional x^2/(x - a), con a sorteado
      const q = r.pick([1, 2, 3])
      const fr = `x^2/(x - ${q})`
      return make({
        subtopic: 'Estudio completo', concepts: ['d9.extremos', 'd10.concavidad', 'f5.asintotas'], level, levelWhy: LV[6] + ' Combina dominio, asíntotas (Funciones) con derivadas.',
        prompt: `Estudio completo de $f(x) = \\dfrac{x^2}{x - ${q}}$.`,
        plot: { fns: [{ expr: fr, label: 'f' }, { expr: `x + ${q}`, dashed: true }], x: [q - 6, q + 7], y: [-6 * q - 2, 6 * q + 8], vlines: [{ x: q, label: `x = ${q}` }] },
        hints: [`Dominio: $\\mathbb{R} - \\{${q}\\}$.`, `Dividí: $\\frac{x^2}{x - ${q}} = x + ${q} + \\frac{${q * q}}{x - ${q}}$ (asíntota oblicua).`, `$f'(x) = \\frac{x(x - ${2 * q})}{(x - ${q})^2}$, $f''(x) = \\frac{${2 * q * q}}{(x - ${q})^3}$.`],
        solution: [{ text: `Dominio $\\mathbb{R}-\\{${q}\\}$; AV $x = ${q}$; AO $y = x + ${q}$ (porque $\\frac{${q * q}}{x - ${q}} \\to 0$).` }, { text: `$f'(x) = \\frac{x(x - ${2 * q})}{(x - ${q})^2}$: $f'$ pasa de $+$ a $-$ en $x = 0$ (máx. relativo $(0, 0)$) y de $-$ a $+$ en $x = ${2 * q}$ (mín. relativo $(${2 * q}, ${4 * q})$).` }, { text: `$f''(x) = \\frac{${2 * q * q}}{(x - ${q})^3}$: cóncava hacia abajo en $(-\\infty, ${q})$, hacia arriba en $(${q}, +\\infty)$; sin inflexión porque $x = ${q}$ no está en el dominio.` }],
        explanation: `El máximo relativo (valor 0) es **menor** que el mínimo relativo (valor ${4 * q}): "relativo" significa que es el mayor o el menor **de su zona**, no de toda la función.`,
        commonErrors: [`Poner un punto de inflexión en $x = ${q}$ (no está en el dominio).`, 'Confundir la asíntota oblicua con la recta $y = x$.'],
        estMinutes: 18, noCalc: true,
      }, { kind: 'multi', parts: [
        { label: 'a', prompt: 'Asíntota vertical: $x =$', points: 1, kind: 'numeric', answer: q },
        { label: 'b', prompt: 'Asíntota oblicua $y = mx + b$:', points: 1, kind: 'expression', answer: `x + ${q}`, v: 'x', mode: 'exact', domain: [-3, 3], prefix: 'y =', wrong: [{ expr: 'x', why: `Falta la ordenada: al dividir, el cociente es $x + ${q}$.` }] },
        { label: 'c', prompt: 'Valor del mínimo relativo:', points: 1, kind: 'numeric', answer: 4 * q, wrong: [{ value: 2 * q, why: 'Esa es la abscisa del mínimo; te piden el valor $f(x)$.', errorTag: 'abscisa-vs-valor' }] },
        { label: 'd', prompt: '¿Tiene punto de inflexión?', points: 1, kind: 'tf', statement: `$f$ tiene un punto de inflexión en $x = ${q}$.`, answer: false, reasons: r.shuffle([{ text: `Falso: aunque cambia la concavidad, $x = ${q}$ no pertenece al dominio.`, correct: true }, { text: `Verdadero: $f''$ cambia de signo en $x = ${q}$.`, why: 'Para que haya inflexión, el punto tiene que estar en la gráfica.', errorTag: 'dominio' }, { text: "Falso: porque $f''$ nunca cambia de signo.", why: `Sí cambia: $(x - ${q})^3$ es negativo a la izquierda y positivo a la derecha.` }]) },
      ] })
    },
  },

  /* ============ d11 · Optimización y L'Hôpital ============ */
  {
    id: 'd11.fence', area: A, unit: 'd11', title: 'Optimizar un área', levels: [3, 4],
    gen: (r, level) => {
      const P = r.pick([40, 60, 80, 100, 120])
      if (level === 3) {
        const x = P / 4, y = P / 2
        return make({
          data: { kind: 'maximize', obj: `x*(${P} - 2*x)`, a: 0, b: P / 2, ask: 'value' }, subtopic: 'Optimización', concepts: ['d11.optimizacion'], level, levelWhy: 'Nivel Analista: hay que modelar (elegir variables, restricción y función) antes de derivar.',
          prompt: `Con ${P} m de alambre se quiere cercar un terreno rectangular junto a un río (el lado del río no se cerca). ¿Cuál es el **área máxima** posible (en m²)?`,
          hints: ['Llamá $x$ a los lados perpendiculares al río e $y$ al paralelo.', `Restricción: $2x + y = ${P}$. Despejá $y$.`, `$A(x) = x(${P} - 2x)$: derivá e igualá a 0.`],
          solution: [{ text: 'Restricción y área:', tex: `y = ${P} - 2x, \\quad A(x) = ${P}x - 2x^2` }, { text: '', tex: `A'(x) = ${P} - 4x = 0 \\Rightarrow x = ${x}, \\; y = ${y}` }, { text: `$A''(x) = -4 < 0$: es un máximo. Área $= ${x}\\cdot ${y} = ${x * y}$ m².` }],
          explanation: 'Optimizar = escribir la cantidad a maximizar en función de **una** variable (usando la restricción) y buscar sus puntos críticos.',
          commonErrors: ['Cercar los cuatro lados (da un cuadrado, que no es la respuesta).'],
          estMinutes: 6, noCalc: true,
        }, { kind: 'numeric', answer: x * y, unit: 'm²', wrong: [{ value: (P / 4) ** 2, why: 'Ese sería el cuadrado de perímetro ' + P + ', pero el lado del río **no** se cerca.', errorTag: 'modelado' }] })
      }
      const L = r.pick([12, 18, 24, 30])
      const x = L / 6
      return make({
        data: { kind: 'maximize', obj: `x*(${L} - 2*x)^2`, a: 0, b: L / 2, ask: 'arg' }, subtopic: 'Optimización', concepts: ['d11.optimizacion'], level, levelWhy: 'Nivel Experto: el modelo es cúbico, hay que descartar una solución sin sentido físico y justificar que es máximo.',
        prompt: `De una lámina cuadrada de ${L} cm de lado se cortan cuadrados de lado $x$ en las esquinas y se doblan los bordes para armar una caja sin tapa. ¿Qué valor de $x$ (en cm) da el **volumen máximo**?`,
        hints: [`La base queda de $(${L} - 2x)$ por $(${L} - 2x)$ y la altura es $x$.`, `$V(x) = x(${L} - 2x)^2$, con $0 < x < ${L / 2}$.`, `$V'(x) = (${L} - 2x)(${L} - 6x)$.`],
        solution: [{ text: '', tex: `V(x) = x(${L} - 2x)^2, \\quad V'(x) = (${L} - 2x)^2 - 4x(${L} - 2x) = (${L} - 2x)(${L} - 6x)` }, { text: `Críticos: $x = ${L / 2}$ (caja sin base: se descarta) y $x = ${x}$.` }, { text: `$V'$ pasa de $+$ a $-$ en $x = ${x}$: máximo. $V(${x}) = ${x * (L - 2 * x) ** 2}$ cm³.` }],
        explanation: 'Siempre hay que chequear que la solución tenga sentido en el problema (dominio físico) y que sea realmente un máximo.',
        estMinutes: 10, noCalc: true,
      }, { kind: 'numeric', answer: x, unit: 'cm', wrong: [{ value: L / 2, why: `Con $x = ${L / 2}$ la base mide 0: es un mínimo (volumen 0), no un máximo.`, errorTag: 'solucion-sin-sentido' }] })
    },
  },
  {
    id: 'd11.lhopital', area: A, unit: 'd11', title: "Regla de L'Hôpital", levels: [3, 4],
    gen: (r, level) => {
      const k = r.pick([2, 3, 4, 5])
      const cases = level === 3
        ? [
            { e: `(e^(${k}*x) - 1)/x`, tex: `\\lim_{x\\to0}\\frac{e^{${k}x} - 1}{x}`, val: k, steps: [`0/0. Derivando arriba y abajo: $\\lim \\frac{${k}e^{${k}x}}{1} = ${k}$.`] },
            { e: `sin(${k}*x)/x`, tex: `\\lim_{x\\to0}\\frac{\\operatorname{sen}(${k}x)}{x}`, val: k, steps: [`0/0. L'Hôpital: $\\lim \\frac{${k}\\cos(${k}x)}{1} = ${k}$.`] },
            { e: `ln(1 + ${k}*x)/x`, tex: `\\lim_{x\\to0}\\frac{\\ln(1 + ${k}x)}{x}`, val: k, steps: [`0/0. L'Hôpital: $\\lim \\frac{${k}/(1 + ${k}x)}{1} = ${k}$.`] },
          ]
        : [
            { e: `(1 - cos(${k}*x))/x^2`, tex: `\\lim_{x\\to0}\\frac{1 - \\cos(${k}x)}{x^2}`, val: (k * k) / 2, steps: [`0/0. L'Hôpital: $\\frac{${k}\\operatorname{sen}(${k}x)}{2x}$, otra vez 0/0.`, `L'Hôpital de nuevo: $\\frac{${k * k}\\cos(${k}x)}{2} \\to ${fracStr(k * k, 2)}$.`] },
            { e: '(e^x - 1 - x)/x^2', tex: `\\lim_{x\\to0}\\frac{e^{x} - 1 - x}{x^2}`, val: 0.5, steps: ['0/0. L\'Hôpital: $\\frac{e^x - 1}{2x}$, otra vez 0/0.', 'Otra vez: $\\frac{e^x}{2} \\to \\frac12$.'] },
          ]
      const c = r.pick(cases)
      return make({
        data: { kind: 'limit', e: c.e, at: 0 }, subtopic: "Regla de L'Hôpital", concepts: ['d11.lhopital'], level, levelWhy: level === 3 ? 'Nivel Analista: reconocer la indeterminación y aplicar la regla.' : 'Nivel Experto: hay que aplicar la regla más de una vez, verificando la indeterminación cada vez.',
        prompt: `Calculá $\\displaystyle ${c.tex}$.`,
        hints: ['Reemplazá: ¿es $0/0$ o $\\infty/\\infty$?', "L'Hôpital: derivá numerador y denominador **por separado** (no es la regla del cociente).", 'Si vuelve a dar $0/0$, se puede aplicar otra vez.'],
        solution: c.steps.map((s) => ({ text: s })),
        explanation: "L'Hôpital: si $\\frac{f}{g}$ da $0/0$ o $\\infty/\\infty$ (y se cumplen sus hipótesis), $\\lim \\frac fg = \\lim \\frac{f'}{g'}$. Compara las velocidades con que $f$ y $g$ se van a 0.",
        commonErrors: ["Usar la regla del cociente.", "Aplicar L'Hôpital cuando no hay indeterminación."],
        noCalc: true,
      }, { kind: 'numeric', answer: c.val, answerText: Number.isInteger(c.val) ? undefined : fracStr(Math.round(c.val * 2), 2), wrong: [{ value: 0, why: 'No se puede concluir 0 de $0/0$: es una indeterminación.', errorTag: 'cero-sobre-cero' }, { value: 1, why: 'Revisá la derivada del numerador: la regla de la cadena agrega un factor.', errorTag: 'cadena-interior' }] })
    },
  },
]

/** Plantilla de "cazador de errores" usada también en el juego. */
export function derivErrorCases(r: Rand): ExerciseDraft {
  const k = r.pick([2, 3, 4])
  return make({
    subtopic: 'Regla del producto', concepts: ['d5.producto'], level: 3, levelWhy: 'Nivel Analista.',
    prompt: `¿En qué paso está el error al derivar $f(x) = x^${k}\\,e^x$?`,
    hints: ['Revisá la regla del producto.'],
    solution: [{ text: `$(x^${k} e^x)' = ${k}x^${k - 1}e^x + x^${k}e^x$.` }],
    explanation: 'La derivada de un producto no es el producto de las derivadas.',
  }, { kind: 'errorStep', steps: [`$f(x) = x^${k}\\cdot e^x$`, `$f'(x) = ${k}x^{${k - 1}}\\cdot e^x$`, `$f'(1) = ${k}e$`], wrongIndex: 1, ruleOptions: r.shuffle([{ text: 'Se aplicó $(uv)\' = u\'v\'$ en lugar de la regla del producto.', correct: true }, { text: 'La derivada de $e^x$ es $x e^{x-1}$.', why: 'No: $(e^x)\' = e^x$.' }, { text: 'No se puede evaluar en 1.', why: 'Sí se puede.' }]) })
}

/** Para el juego Fábrica de derivadas y simulacros: una función aleatoria con su derivada. */
export function randomDerivable(r: Rand, level: Level): { f: string; d: string } {
  const f = level <= 2 ? poly([r.nonZero(-3, 3), r.int(-4, 4), r.int(-5, 5)]) : chainCase(r, level).f
  return { f, d: toText(simplify(diff(parse(f)))) }
}
