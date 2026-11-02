/**
 * Ejercicios del modelo de 2.º parcial (repaso del 29/10/26), con números que cambian en cada intento.
 * Cada plantilla reproduce la idea de un ejercicio de la pizarra.
 */
import type { MCOption, Template } from '../../engine/types'
import type { Rand } from '../../math/numeric'
import { fixed, fracStr, fracTeX, make, mc } from './helpers'

/** Número con coma decimal (entero sin decimales). */
const dec = (v: number): string => (Number.isInteger(v) ? String(v) : v.toFixed(4).replace('.', ','))

/** Valor de un múltiplo racional de π como TeX: (n/d)·π. */
function piTeX(n: number, d: number): string {
  const g = gcdi(Math.abs(n), d)
  n /= g; d /= g
  const s = n < 0 ? '-' : ''
  const a = Math.abs(n)
  const num = a === 1 ? '\\pi' : `${a}\\pi`
  return d === 1 ? `${s}${num}` : `${s}\\frac{${num}}{${d}}`
}
function gcdi(a: number, b: number): number { return b ? gcdi(b, a % b) : a }

/* ---------- 1) intervalo de análisis ---------- */
interface Pt { tex: string; v: number }
const INTERVALOS: { A: Pt; B: Pt; C: Pt; D: Pt; dentro: Pt[]; hueco: Pt; fuera: Pt }[] = [
  { A: { tex: '-2\\pi', v: -2 * Math.PI }, B: { tex: '-\\frac{4}{5}', v: -0.8 }, C: { tex: '\\pi', v: Math.PI }, D: { tex: '\\frac{8\\pi}{2}', v: 4 * Math.PI },
    dentro: [{ tex: '\\frac{3\\pi}{2}', v: 1.5 * Math.PI }, { tex: '-3', v: -3 }, { tex: '-\\pi', v: -Math.PI }, { tex: '3\\pi', v: 3 * Math.PI }],
    hueco: { tex: '\\frac{\\pi}{2}', v: Math.PI / 2 }, fuera: { tex: '5\\pi', v: 5 * Math.PI } },
  { A: { tex: '-\\pi', v: -Math.PI }, B: { tex: '0', v: 0 }, C: { tex: '\\frac{\\pi}{2}', v: Math.PI / 2 }, D: { tex: '3\\pi', v: 3 * Math.PI },
    dentro: [{ tex: '\\pi', v: Math.PI }, { tex: '-\\frac{\\pi}{2}', v: -Math.PI / 2 }, { tex: '2\\pi', v: 2 * Math.PI }],
    hueco: { tex: '\\frac{1}{2}', v: 0.5 }, fuera: { tex: '-2\\pi', v: -2 * Math.PI } },
  { A: { tex: '-3\\pi', v: -3 * Math.PI }, B: { tex: '-\\frac{\\pi}{2}', v: -Math.PI / 2 }, C: { tex: '\\frac{3}{4}', v: 0.75 }, D: { tex: '\\frac{6\\pi}{3}', v: 2 * Math.PI },
    dentro: [{ tex: '-2\\pi', v: -2 * Math.PI }, { tex: '\\pi', v: Math.PI }, { tex: '-\\pi', v: -Math.PI }],
    hueco: { tex: '0', v: 0 }, fuera: { tex: '\\frac{5\\pi}{2}', v: 2.5 * Math.PI } },
]

/* ---------- 6) V/F con propiedades de la integral ---------- */
interface VF { s: string; v: boolean; ok: string; bad: MCOption[]; hint: string; expl: string }
function vfIntegral(r: Rand): VF {
  const tipo = r.pick(['lineal', 'aditiva', 'simetrica'] as const)
  if (tipo === 'lineal') {
    // ∫(cos x + sen x) dx = ∫cos x dx + p∫sen x dx + q∫sen x dx  — vale si p + q = 1
    const p = r.pick([-2, 2, 3, -1])
    const verdadero = r.chance(0.5)
    const q = verdadero ? 1 - p : r.pick([1, 2, -1].filter((x) => x !== 1 - p))
    const term = (c: number) => (c === 1 ? '+ \\int \\operatorname{sen} x\\,dx' : c === -1 ? '- \\int \\operatorname{sen} x\\,dx' : `${c < 0 ? '-' : '+'} ${Math.abs(c)}\\int \\operatorname{sen} x\\,dx`)
    const s = `$\\int (\\cos x + \\operatorname{sen} x)\\,dx = \\int \\cos x\\,dx ${term(p)} ${term(q)}$`
    const suma = p + q
    return verdadero
      ? { s, v: true, ok: `Verdadero: juntando los términos del seno queda $(${p}) + (${q}) = 1$ vez $\\int \\operatorname{sen} x\\,dx$, que es justo lo que hay a la izquierda.`, bad: [{ text: 'Falso: no se puede separar una integral en partes.', why: 'Sí se puede: la integral de una suma es la suma de las integrales.' }, { text: 'Falso: los números delante de la integral no se pueden sumar.', why: 'Sí: $a\\int f + b\\int f = (a + b)\\int f$.' }], hint: 'Sumá los números que acompañan a $\\int \\operatorname{sen} x\\,dx$. ¿Da 1?', expl: 'Truco del profe: escribir lo mismo "disfrazado". Si los coeficientes del seno suman 1, la igualdad es cierta.' }
      : { s, v: false, ok: `Falso: los términos del seno suman $(${p}) + (${q}) = ${suma}$ veces $\\int \\operatorname{sen} x\\,dx$, pero a la izquierda hay **una** vez. Queda $\\int \\cos x\\,dx ${suma === -1 ? '-' : suma < 0 ? `- ${-suma}` : `+ ${suma}`}\\int \\operatorname{sen} x\\,dx \\neq \\int(\\cos x + \\operatorname{sen} x)\\,dx$.`, bad: [{ text: 'Verdadero: la integral de una suma es la suma de las integrales.', why: 'Esa propiedad es cierta, pero acá los números del seno no suman 1.', errorTag: 'lineal' }, { text: 'Verdadero: se sumó y restó lo mismo.', why: `Se sumó ${p} y ${q}, que juntos dan ${suma}, no 1.` }], hint: 'Sumá los números que acompañan a $\\int \\operatorname{sen} x\\,dx$. ¿Da 1?', expl: 'Truco del profe: escribir lo mismo "disfrazado". Si los coeficientes del seno no suman 1, la igualdad es falsa.' }
  }
  if (tipo === 'aditiva') {
    const a = r.pick([-2, -3, -1]), b = r.pick([1, 2, 3]), k = r.pick([2, 3, 5])
    const f = `\\frac{x^2}{${k}}`
    const bien = r.chance(0.5)
    const s = bien
      ? `$\\int_{${a}}^{${b}} ${f}\\,dx = \\int_{${a}}^{0} ${f}\\,dx + \\int_{0}^{${b}} ${f}\\,dx$`
      : `$\\int_{${a}}^{${b}} ${f}\\,dx = \\int_{${a}}^{0} ${f}\\,dx + \\int_{${b}}^{0} ${f}\\,dx$`
    return bien
      ? { s, v: true, ok: 'Verdadero: una integral se puede partir en un punto intermedio (propiedad aditiva): ir de $a$ a $b$ es ir de $a$ a $0$ y después de $0$ a $b$.', bad: [{ text: 'Falso: no se puede partir porque la función cambia de signo en 0.', why: '$x^2$ no cambia de signo; y aunque cambiara, partir siempre vale.' }, { text: 'Falso: solo se puede partir en la mitad exacta del intervalo.', why: 'Se puede partir en cualquier punto.' }], hint: 'Pensá el área como un camino: de $a$ hasta 0, y de 0 hasta $b$.', expl: 'Propiedad aditiva: $\\int_a^b f = \\int_a^c f + \\int_c^b f$.' }
      : { s, v: false, ok: `Falso: el segundo tramo está al revés. Debería ser $\\int_0^{${b}}$; dar vuelta los límites cambia el signo: $\\int_{${b}}^0 f = -\\int_0^{${b}} f$.`, bad: [{ text: 'Verdadero: es la propiedad aditiva.', why: 'La propiedad pide encadenar los tramos: de $a$ a $c$ y de $c$ a $b$. Acá el segundo va de $b$ a $c$.', errorTag: 'limites' }, { text: 'Verdadero: el orden de los límites no importa.', why: 'Sí importa: invertirlos cambia el signo.' }], hint: 'Fijate bien el orden de los límites del segundo tramo.', expl: 'Partir vale, pero los tramos tienen que encadenarse: $a \\to c$ y $c \\to b$.' }
  }
  const caso = r.pick([
    { f: '\\operatorname{sen} x', L: '2\\pi', v: true, ok: 'Verdadero: $\\int_{-2\\pi}^{2\\pi} \\operatorname{sen} x\\,dx = [-\\cos x]_{-2\\pi}^{2\\pi} = -\\cos(2\\pi) + \\cos(-2\\pi) = -1 + 1 = 0$. El seno es impar: lo que suma de un lado lo resta del otro.' },
    { f: 'x^3', L: '2', v: true, ok: 'Verdadero: $\\left[\\frac{x^4}{4}\\right]_{-2}^{2} = 4 - 4 = 0$. $x^3$ es impar: el área de la derecha se cancela con la de la izquierda.' },
    { f: '\\cos x', L: '\\frac{\\pi}{2}', v: false, ok: 'Falso: $[\\operatorname{sen} x]_{-\\pi/2}^{\\pi/2} = 1 - (-1) = 2$. El coseno es **par** (simétrico como un espejo): las dos mitades suman, no se cancelan.' },
    { f: 'x^2', L: '1', v: false, ok: 'Falso: $\\left[\\frac{x^3}{3}\\right]_{-1}^{1} = \\frac13 - \\left(-\\frac13\\right) = \\frac23$. $x^2$ es par y siempre positiva: no se cancela nada.' },
  ])
  return {
    s: `$\\int_{-${caso.L}}^{${caso.L}} ${caso.f}\\,dx = 0$`, v: caso.v, ok: caso.ok,
    bad: caso.v
      ? [{ text: 'Falso: una integral nunca puede dar 0.', why: 'Puede dar 0 si las partes positivas y negativas se cancelan.' }, { text: 'Falso: hay que calcular el área y siempre es positiva.', why: 'La integral es área **con signo**: lo de abajo del eje resta.', errorTag: 'area-con-signo' }]
      : [{ text: 'Verdadero: en un intervalo simétrico toda integral da 0.', why: 'Solo pasa si la función es **impar** (como $x^3$ o $\\operatorname{sen} x$).', errorTag: 'simetria' }, { text: 'Verdadero: el área de la izquierda se resta de la de la derecha.', why: 'Si la función es positiva en los dos lados, las dos áreas suman.' }],
    hint: '¿La función es impar (se da vuelta del otro lado del 0) o par (espejo)? Si dudás, calculá con Barrow.', expl: 'En $[-L, L]$: si $f$ es impar, la integral da 0; si es par, da el doble de la mitad.',
  }
}

/* ---------- 10) ∫ g(√x) dx ---------- */
const RAICES = [
  { g: '\\operatorname{sen}(\\sqrt{x})', f: 'sin(sqrt(x))', ok: '-2*sqrt(x)*cos(sqrt(x)) + 2*sin(sqrt(x))', okTeX: '-2\\sqrt{x}\\cos\\sqrt{x} + 2\\operatorname{sen}\\sqrt{x}', bad: '2*sqrt(x)*cos(sqrt(x)) + 2*sin(sqrt(x))', badTeX: '2\\sqrt{x}\\cos\\sqrt{x} + 2\\operatorname{sen}\\sqrt{x}', inner: 'u\\operatorname{sen} u', parts: '-u\\cos u + \\operatorname{sen} u' },
  { g: '\\cos(\\sqrt{x})', f: 'cos(sqrt(x))', ok: '2*sqrt(x)*sin(sqrt(x)) + 2*cos(sqrt(x))', okTeX: '2\\sqrt{x}\\operatorname{sen}\\sqrt{x} + 2\\cos\\sqrt{x}', bad: '2*sqrt(x)*sin(sqrt(x)) - 2*cos(sqrt(x))', badTeX: '2\\sqrt{x}\\operatorname{sen}\\sqrt{x} - 2\\cos\\sqrt{x}', inner: 'u\\cos u', parts: 'u\\operatorname{sen} u + \\cos u' },
  { g: 'e^{\\sqrt{x}}', f: 'e^(sqrt(x))', ok: '2*sqrt(x)*e^(sqrt(x)) - 2*e^(sqrt(x))', okTeX: '2\\sqrt{x}\\,e^{\\sqrt{x}} - 2e^{\\sqrt{x}}', bad: '2*sqrt(x)*e^(sqrt(x))', badTeX: '2\\sqrt{x}\\,e^{\\sqrt{x}}', inner: 'u\\,e^u', parts: 'u\\,e^u - e^u' },
]

/* ---------- 11) derivada de una constante ---------- */
const CONSTANTES = [
  { tex: '\\operatorname{sen}(2)', f: 'sin(2)', trap: Math.cos(2), why: 'Derivaste como si fuera $\\operatorname{sen} x$, pero $\\operatorname{sen}(2)$ es un **número** (≈ 0,91).' },
  { tex: '\\pi^2', f: 'pi^2', trap: 2 * Math.PI, why: '$\\pi^2$ es un número (≈ 9,87), no $x^2$: no se aplica la regla de la potencia.' },
  { tex: 'e^3', f: 'e^3', trap: 3 * Math.E ** 2, why: '$e^3$ es un número (≈ 20,09): no tiene $x$.' },
  { tex: '\\ln 5', f: 'ln(5)', trap: 1 / 5, why: '$\\ln 5$ es un número (≈ 1,61), no $\\ln x$.' },
  { tex: '\\sqrt{7}', f: 'sqrt(7)', trap: 1 / (2 * Math.sqrt(7)), why: '$\\sqrt 7$ es un número (≈ 2,65), no $\\sqrt x$.' },
  { tex: '\\cos\\left(\\frac{\\pi}{3}\\right)', f: 'cos(pi/3)', trap: -Math.sin(Math.PI / 3), why: '$\\cos(\\pi/3) = 1/2$ es un número.' },
]

export const PARCIAL: Template[] = [
  /* 1a) leer un intervalo de análisis */
  fixed('px.intervalo', 'funciones', 'f2', 'Intervalo de análisis', (r) => {
    const I = r.pick(INTERVALOS)
    const cierra = r.chance(0.5) ? ']' : ')'
    const dentro = r.pick(I.dentro)
    const intTeX = `\\left[${I.A.tex};\\ ${I.B.tex}\\right] \\cup \\left(${I.C.tex};\\ ${I.D.tex}\\right${cierra}`
    return make({
      subtopic: 'Intervalo de análisis', concepts: ['f2.lectura'], level: 1, levelWhy: 'Nivel Explorador: leer un intervalo y ubicar números.',
      prompt: `El intervalo de análisis es $${intTeX}$. ¿Cuál de estos valores **está** dentro del intervalo?`,
      hints: ['Pasá todo a decimales: $\\pi \\approx 3{,}14$.', 'Corchete $[\\,]$: el borde **entra**. Paréntesis $(\\,)$: el borde **no entra**.'],
      solution: [
        { text: `En decimales: $[${I.A.v.toFixed(2).replace('.', '{,}')};\\ ${I.B.v.toFixed(2).replace('.', '{,}')}] \\cup (${I.C.v.toFixed(2).replace('.', '{,}')};\\ ${I.D.v.toFixed(2).replace('.', '{,}')}${cierra}$.` },
        { text: `$${dentro.tex} \\approx ${dentro.v.toFixed(2).replace('.', '{,}')}$ cae adentro. $${I.hueco.tex}$ cae en el hueco entre los dos pedazos, $${I.C.tex}$ es un borde con paréntesis (no entra) y $${I.fuera.tex}$ queda afuera.` },
      ],
      explanation: 'El símbolo $\\cup$ ("unión") quiere decir que el intervalo son **dos pedazos** separados. Lo que está en el medio no se analiza. Antes de estudiar derivabilidad o calcular algo, fijate siempre si el punto está en el intervalo.',
      commonErrors: ['Creer que el borde con paréntesis entra.', 'No pasar $\\pi$ a decimales y confundir el orden.', 'Olvidar el hueco entre los dos pedazos.'],
    }, mc(r, [
      { text: `$${dentro.tex}$`, correct: true, why: `$\\approx ${dentro.v.toFixed(2).replace('.', '{,}')}$ está dentro de uno de los pedazos.` },
      { text: `$${I.hueco.tex}$`, why: 'Cae en el hueco entre los dos pedazos.' },
      { text: `$${I.C.tex}$`, why: 'Es un borde con paréntesis: no entra.', errorTag: 'borde-abierto' },
      { text: `$${I.fuera.tex}$`, why: 'Queda fuera de los dos pedazos.' },
    ]))
  }),

  /* 1b) derivabilidad en un pico */
  {
    id: 'px.pico', area: 'derivadas', unit: 'd2', title: 'Derivable o no: el pico', levels: [2, 3],
    gen: (r, level) => {
      const k = r.pick([1, 2, 3]), b = r.pick([1, 2, -1])
      const P = r.pick([{ v: Math.PI / 2, tex: '\\frac{\\pi}{2}', s: 'pi/2' }, { v: 1, tex: '1', s: '1' }, { v: 2, tex: '2', s: '2' }, { v: -1, tex: '-1', s: '(-1)' }])
      const kTeX = k === 1 ? '' : String(k)
      const fTeX = `f(x) = ${kTeX}\\left|x - ${P.v < 0 ? '(-1)' : P.tex}\\right| ${b < 0 ? '-' : '+'} ${Math.abs(b)}`
      const meta = {
        subtopic: 'Derivabilidad en un punto', concepts: ['d2.derivable', 'd2.definicion'],
        prompt: `Mirá el gráfico de $${fTeX}$ cerca de $x_0 = ${P.tex}$.`,
        plot: { fns: [{ expr: `${k}*abs(x - ${P.s}) + ${b}` }], points: [{ x: P.v, y: b, label: 'x₀' }], x: [P.v - 4, P.v + 4] as [number, number], y: [b - 2, b + 6] as [number, number] },
        hints: ['La derivada es la pendiente de la recta tangente. En una "V" (pico), ¿hay una sola tangente?', `A la izquierda de $${P.tex}$ la función baja con pendiente $-${k}$; a la derecha sube con pendiente $${k}$.`],
        solution: [
          { text: `Por la izquierda ($\\Delta x < 0$), el cociente $\\frac{f(x_0 + \\Delta x) - f(x_0)}{\\Delta x}$ vale siempre $-${k}$.` },
          { text: `Por la derecha ($\\Delta x > 0$) vale siempre $${k}$.` },
          { text: `Como $-${k} \\neq ${k}$, el límite $\\lim_{\\Delta x \\to 0}$ **no existe**: $f$ **no es derivable** en $x_0 = ${P.tex}$ (aunque sí es continua).` },
        ],
        explanation: 'Derivable = la curva es "suave" en ese punto: se puede apoyar una sola recta tangente. En un pico (una "V") se pueden apoyar muchas rectas: las derivadas por izquierda y por derecha no coinciden.',
        commonErrors: ['Pensar que "continua" alcanza para ser derivable.', 'Decir que en el pico la derivada vale 0 (eso pasa en un máximo o mínimo **suave**).'],
      }
      const opciones: MCOption[] = [
        { text: `No es derivable: las pendientes por izquierda ($-${k}$) y por derecha ($${k}$) son distintas (hay un pico).`, correct: true },
        { text: 'Es derivable, porque la función es continua en ese punto.', why: 'Continua no alcanza: $|x|$ es continua y tiene un pico.', errorTag: 'continua-derivable' },
        { text: 'Es derivable y la derivada vale 0, porque es un mínimo.', why: 'En un mínimo **suave** la derivada vale 0; en un pico no existe.', errorTag: 'pico-cero' },
        { text: 'No es derivable porque la función no es continua.', why: 'Sí es continua (no hay saltos); el problema es el pico.' },
      ]
      if (level === 2) return make({ ...meta, level: 2, levelWhy: 'Nivel Aprendiz: reconocer en el gráfico un punto no derivable.', prompt: meta.prompt + ' ¿Es derivable en ese punto?' }, mc(r, opciones))
      return make({ ...meta, level: 3, levelWhy: 'Nivel Analista: calcular las derivadas laterales con la definición y concluir.', prompt: meta.prompt + ' Respondé por partes.' }, { kind: 'multi', parts: [
        { label: 'a', prompt: 'Derivada por **izquierda** en $x_0$ (pendiente del lado izquierdo):', points: 1, kind: 'numeric', answer: -k, wrong: [{ value: k, why: 'Ojo: del lado izquierdo la función **baja**, la pendiente es negativa.', errorTag: 'signo' }] },
        { label: 'b', prompt: 'Derivada por **derecha** en $x_0$:', points: 1, kind: 'numeric', answer: k, wrong: [{ value: -k, why: 'Del lado derecho la función **sube**: la pendiente es positiva.', errorTag: 'signo' }] },
        { label: 'c', prompt: '¿Entonces?', points: 2, ...mc(r, opciones) as { kind: 'mc'; options: MCOption[] } },
      ] })
    },
  },

  /* 3, 8 y 9) límites iguales o multiplicar por 0 */
  {
    id: 'px.cero', area: 'integrales', unit: 'i7', title: 'Integrales que dan 0 sin calcular', levels: [1, 2],
    gen: (r, level) => {
      if (level === 1) {
        const c = r.pick([
          { tex: '\\left(\\cos^2 x + \\operatorname{sen} x\\right)', a: '10', av: 10 },
          { tex: '(2 - x)^2', a: '2', av: 2 },
          { tex: 'e^{x^2}\\,\\operatorname{arctg}(x^3 + 1)', a: '3', av: 3 },
          { tex: '\\sqrt{x^4 + 1}\\,\\ln(x^2 + 5)', a: '-1', av: -1 },
        ])
        const k = r.pick([4, 7, 12, 3])
        return make({
          data: { kind: 'integral', f: '0', a: c.av, b: c.av },
          subtopic: 'Límites de integración iguales', concepts: ['i7.propiedades'], level: 1, levelWhy: 'Nivel Explorador: reconocer una propiedad, sin cuentas.',
          prompt: `Calculá $\\displaystyle ${k}\\cdot\\int_{${c.a}}^{${c.a}} ${c.tex}\\,dx$.`,
          hints: ['Mirá los números de arriba y de abajo de la integral.', 'Si empezás y terminás en el mismo lugar, ¿cuánta área "barrés"?'],
          solution: [{ text: `Los límites son iguales ($a = b = ${c.a}$): no hay ancho, así que no hay área.`, tex: `\\int_{${c.a}}^{${c.a}} f(x)\\,dx = F(${c.a}) - F(${c.a}) = 0 \\quad\\Rightarrow\\quad ${k}\\cdot 0 = 0` }],
          explanation: 'Con Barrow: $\\int_a^a f = F(a) - F(a) = 0$. Con Riemann: los rectángulos tienen base $\\Delta x = 0$. La función puede ser horrible: no importa.',
          commonErrors: ['Ponerse a calcular la primitiva (pierde tiempo y es fácil equivocarse).'],
        }, { kind: 'numeric', answer: 0 })
      }
      const c = r.pick([
        { tex: '\\operatorname{arctg}\\left(x^3 + e^x\\right)', a: '-\\frac{\\pi}{2}', b: '\\pi', av: -Math.PI / 2, bv: Math.PI },
        { tex: '\\ln(x^2 + 1)\\,\\operatorname{sen}(x^5)', a: '1', b: '5', av: 1, bv: 5 },
        { tex: '\\frac{e^{\\cos x}}{x^2 + 4}', a: '-3', b: '2', av: -3, bv: 2 },
      ])
      return make({
        data: { kind: 'integral', f: '0', a: c.av, b: c.bv },
        subtopic: 'Multiplicar por cero', concepts: ['i7.propiedades'], level: 2, levelWhy: 'Nivel Aprendiz: mirar toda la expresión antes de calcular.',
        prompt: `Calculá $\\displaystyle 0\\cdot\\int_{${c.a}}^{${c.b}} ${c.tex}\\,dx$.`,
        hints: ['Antes de hacer cuentas, mirá qué hay **adelante** de la integral.', 'La integral es un número (la función es continua en todo el intervalo, así que existe).'],
        solution: [{ text: 'La integral es un número (existe, porque la función está definida y es continua en todo el intervalo). Cualquier número por 0 da 0.', tex: `0\\cdot\\int_{${c.a}}^{${c.b}} ${c.tex}\\,dx = 0` }],
        explanation: 'Mirá siempre toda la expresión antes de empezar. Detalle fino: hace falta que la integral **exista**; si la función no está definida en parte del intervalo, la integral no existe y la cuenta no tiene sentido.',
        commonErrors: ['Intentar calcular la integral.', 'No fijarse que la función esté definida en todo el intervalo.'],
      }, { kind: 'numeric', answer: 0 })
    },
  },

  /* 4) tipo de límite */
  {
    id: 'px.limiteTipo', area: 'funciones', unit: 'f10', title: 'Qué tipo de límite es', levels: [2, 3],
    gen: (r, level) => {
      const a = r.pick([1, 2, 3])
      const tipo = r.pick(level === 3 ? ['00', 'inf'] as const : ['00', 'k0', 'valor', 'inf'] as const)
      const OPS = {
        valor: 'Da un número: reemplazo y listo.',
        k0: 'Da $+\\infty$ o $-\\infty$: un número distinto de 0 dividido 0.',
        '00': 'Indeterminación $\\frac{0}{0}$: hay que simplificar antes.',
        inf: 'Indeterminación $\\frac{\\infty}{\\infty}$: hay que dividir por la mayor potencia.',
      }
      let lim = '', sol = '', valor = NaN, valText = ''
      if (tipo === '00') { lim = `\\lim_{x\\to ${a}} \\frac{x^2 - ${a * a}}{x - ${a}}`; sol = `Reemplazando: $\\frac{${a * a} - ${a * a}}{${a} - ${a}} = \\frac00$. Factorizo: $\\frac{(x - ${a})(x + ${a})}{x - ${a}} = x + ${a} \\to ${2 * a}$.`; valor = 2 * a; valText = String(2 * a) }
      else if (tipo === 'k0') { const c = r.pick([1, 3, 5]); lim = `\\lim_{x\\to ${a}} \\frac{x + ${c}}{x - ${a}}`; sol = `Reemplazando: $\\frac{${a + c}}{0}$, un número que no es 0 dividido 0: el resultado se va al infinito ($+\\infty$ por derecha, $-\\infty$ por izquierda).` }
      else if (tipo === 'valor') { const c = r.pick([1, 4]), d = r.pick([2, 5]); lim = `\\lim_{x\\to ${a}} \\frac{x + ${c}}{x + ${d}}`; sol = `Reemplazando: $\\frac{${a + c}}{${a + d}}$. El denominador no es 0, así que ese es el resultado.` }
      else { const p = r.pick([2, 3, 6]), q = r.pick([1, 4]); lim = `\\lim_{x\\to \\infty} \\frac{${p}x^2 + 1}{${q}x^2 + x}`; sol = `Arriba y abajo se van a infinito: $\\frac{\\infty}{\\infty}$. Divido todo por $x^2$: $\\frac{${p} + 1/x^2}{${q} + 1/x} \\to \\frac{${p}}{${q}}$.`; valor = p / q; valText = fracStr(p, q) }
      const meta = {
        subtopic: 'Límites e indeterminaciones', concepts: ['f10.limites'],
        hints: ['Primero reemplazá $x$ por el valor al que tiende y fijate qué queda arriba y abajo.', 'Número/número (abajo no es 0) → número. Número/0 → infinito. 0/0 o ∞/∞ → indeterminación: hay que trabajar la expresión.'],
        solution: [{ text: sol }],
        explanation: 'Un límite puede dar un número, $+\\infty$ o $-\\infty$. Las formas $\\frac00$ y $\\frac{\\infty}{\\infty}$ no son resultados: avisan que hay que simplificar, factorizar o dividir por la mayor potencia.',
        commonErrors: ['Decir que $\\frac00 = 0$ o que $\\frac00 = 1$.', 'Decir que $\\frac{k}{0} = 0$.'],
      }
      if (level === 2) return make({ ...meta, level: 2, levelWhy: 'Nivel Aprendiz: reconocer qué pasa al reemplazar.', prompt: `¿Qué pasa con $\\displaystyle ${lim}$?` }, mc(r, (Object.keys(OPS) as (keyof typeof OPS)[]).map((k) => ({ text: OPS[k], correct: k === tipo }))))
      return make({ ...meta, level: 3, levelWhy: 'Nivel Analista: reconocer la indeterminación y salvarla.', prompt: `Calculá $\\displaystyle ${lim}$.` }, { kind: 'numeric', answer: valor, answerText: valText, wrong: [{ value: 0, why: 'Al reemplazar queda una indeterminación, no 0: hay que simplificar.', errorTag: 'indeterminacion' }, { value: 1, why: 'Una indeterminación no vale 1: hay que trabajar la expresión.', errorTag: 'indeterminacion' }] })
    },
  },

  /* 5) dónde se anula el denominador */
  fixed('px.ceros', 'funciones', 'f7', 'Dónde hay problemas: ceros del denominador', (r) => {
    const caso = r.pick([
      { f: '\\frac{1}{\\cos x}', ok: '$x = \\frac{\\pi}{2} + n\\pi$, con $n \\in \\mathbb{Z}$', bad: [{ text: '$x = \\frac{n\\pi}{2}$, con $n \\in \\mathbb{Z}$', why: 'Incluye $x = 0$ y $x = \\pi$, donde $\\cos$ vale 1 y −1 (no 0). Son solo los múltiplos **impares** de $\\frac{\\pi}{2}$.', errorTag: 'npi-2' }, { text: '$x = n\\pi$, con $n \\in \\mathbb{Z}$', why: 'Esos son los ceros del **seno**.' }, { text: 'En ningún punto', why: '$\\cos\\frac{\\pi}{2} = 0$.' }], sol: 'El coseno vale 0 en $\\frac{\\pi}{2}, \\frac{3\\pi}{2}, -\\frac{\\pi}{2}, \\ldots$: cada $\\pi$ a partir de $\\frac{\\pi}{2}$.' },
      { f: '\\frac{1}{\\operatorname{sen} x}', ok: '$x = n\\pi$, con $n \\in \\mathbb{Z}$', bad: [{ text: '$x = \\frac{\\pi}{2} + n\\pi$', why: 'Esos son los ceros del **coseno**.' }, { text: '$x = 2n\\pi$', why: 'Le faltan los múltiplos impares: $\\operatorname{sen}\\pi = 0$ también.' }, { text: 'En ningún punto', why: '$\\operatorname{sen} 0 = 0$.' }], sol: 'El seno vale 0 en $0, \\pi, 2\\pi, -\\pi, \\ldots$: todos los múltiplos de $\\pi$.' },
      { f: '\\frac{x + 1}{x^2 - 2x + 7}', ok: 'En ningún $x$ real: el denominador nunca vale 0', bad: [{ text: '$x = 1$', why: 'Ahí está el vértice de la parábola, pero vale $1 - 2 + 7 = 6 \\neq 0$.' }, { text: '$x = 7$ y $x = -1$', why: 'Reemplazá: no dan 0.' }, { text: '$x = -1$', why: 'Ese es el cero del **numerador**, que no trae problemas.' }], sol: 'Discriminante: $b^2 - 4ac = 4 - 28 = -24 < 0$. La parábola no corta el eje $x$, así que el denominador nunca es 0.' },
      { f: '\\operatorname{tg}(4x^2 + 8x - 7)', ok: 'Cuando $4x^2 + 8x - 7 = \\frac{\\pi}{2} + n\\pi$', bad: [{ text: 'Cuando $4x^2 + 8x - 7 = 0$', why: 'Ahí la tangente vale $\\operatorname{tg} 0 = 0$: no hay problema.', errorTag: 'tg-cero' }, { text: 'Cuando $4x^2 + 8x - 7 = n\\pi$', why: 'Ahí la tangente vale 0 (son los ceros del seno).' }, { text: 'Nunca: la tangente está definida siempre', why: '$\\operatorname{tg} = \\frac{\\operatorname{sen}}{\\cos}$: falla donde el coseno vale 0.' }], sol: '$\\operatorname{tg} u = \\frac{\\operatorname{sen} u}{\\cos u}$ no existe cuando $\\cos u = 0$, o sea $u = \\frac{\\pi}{2} + n\\pi$. Acá $u = 4x^2 + 8x - 7$.' },
    ])
    return make({
      subtopic: 'Ceros del denominador', concepts: ['f7.valores', 'f1.dominio'], level: 2, levelWhy: 'Nivel Aprendiz: mirar el álgebra antes de calcular (dominio).',
      prompt: `Antes de calcular límites, derivadas o integrales: ¿para qué valores de $x$ hay un problema (división por 0) en $${caso.f}$?`,
      hints: ['Buscá dónde se anula lo que está **dividiendo**.', 'Recordá: $\\operatorname{sen} x = 0$ en $n\\pi$; $\\cos x = 0$ en $\\frac{\\pi}{2} + n\\pi$.'],
      solution: [{ text: caso.sol }],
      explanation: 'Antes de cualquier cuenta, mirá el álgebra: el denominador no puede ser 0. Eso marca los puntos "peligrosos" (fuera del dominio, posibles asíntotas).',
      commonErrors: ['Confundir los ceros del seno con los del coseno.', 'Escribir $\\cos x = 0 \\Leftrightarrow x = \\frac{n\\pi}{2}$ (incluye puntos donde el coseno vale ±1).'],
    }, mc(r, [{ text: caso.ok, correct: true }, ...caso.bad]))
  }),

  /* 6) V/F con propiedades */
  {
    id: 'px.vfIntegral', area: 'integrales', unit: 'i7', title: 'V o F: propiedades de la integral', levels: [3],
    gen: (r) => {
      const a = vfIntegral(r)
      return make({
        subtopic: 'Propiedades de la integral', concepts: ['i7.propiedades'], level: 3, levelWhy: 'Nivel Analista: V/F de parcial; hay que justificar con una propiedad o con la cuenta.',
        prompt: 'Decidí si es verdadero o falso y elegí la justificación:',
        hints: [a.hint, 'Si dudás, hacé la cuenta con Barrow.'],
        solution: [{ text: a.ok }], explanation: a.expl,
        commonErrors: ['Confiar en que "parece" la propiedad sin revisar números y límites.'],
      }, { kind: 'tf', statement: a.s, answer: a.v, reasons: r.shuffle([{ text: a.ok, correct: true }, ...a.bad]) })
    },
  },

  /* 7) sustitución lineal en una definida */
  {
    id: 'px.senLineal', area: 'integrales', unit: 'i5', title: 'Cambio de variable: sen(t/k)', levels: [3, 4],
    gen: (r, level) => {
      const k = r.pick([2, 3, 4])
      const th = r.pick([
        { n: 1, d: 4, cos: Math.SQRT1_2, cosTeX: '\\frac{\\sqrt2}{2}' },
        { n: 1, d: 3, cos: 0.5, cosTeX: '\\frac12' },
        { n: 1, d: 2, cos: 0, cosTeX: '0' },
        { n: 1, d: 1, cos: -1, cosTeX: '-1' },
      ])
      const bTeX = piTeX(k * th.n, th.d), thTeX = piTeX(th.n, th.d)
      const bv = (k * th.n * Math.PI) / th.d
      const val = k * (1 - th.cos)
      const valText = th.d === 4 ? `${k} - ${k === 2 ? '' : k + '*'}sqrt(2)/2`.replace('2 - sqrt(2)/2', '2 - sqrt(2)') : th.d === 3 ? fracStr(k, 2) : th.d === 2 ? String(k) : String(2 * k)
      const valTeX = th.d === 4 ? (k === 2 ? '2 - \\sqrt2' : k === 4 ? '4 - 2\\sqrt2' : '3 - \\frac{3\\sqrt2}{2}') : th.d === 3 ? fracTeX(k, 2) : th.d === 2 ? String(k) : String(2 * k)
      const meta = {
        data: { kind: 'integral', f: `sin(x/${k})`, a: 0, b: bv },
        subtopic: 'Cambio de variable en una definida', concepts: ['i5.sustitucion', 'i7.barrow'],
        prompt: `Calculá $\\displaystyle\\int_0^{${bTeX}} \\operatorname{sen}\\left(\\frac{t}{${k}}\\right) dt$.`,
        hints: [`Cambio de variable: $u = \\frac{t}{${k}}$, entonces $du = \\frac{1}{${k}}dt$, o sea $dt = ${k}\\,du$.`, `Primitiva: $\\int \\operatorname{sen}\\left(\\frac{t}{${k}}\\right)dt = -${k}\\cos\\left(\\frac{t}{${k}}\\right) + C$. Ahora Barrow.`, `$\\cos\\left(${thTeX}\\right) = ${th.cosTeX}$ y $\\cos 0 = 1$.`],
        solution: [
          { text: `Cambio: $u = \\frac{t}{${k}} \\Rightarrow dt = ${k}\\,du$.`, tex: `\\int \\operatorname{sen}\\left(\\tfrac{t}{${k}}\\right)dt = ${k}\\int \\operatorname{sen} u\\,du = -${k}\\cos u = -${k}\\cos\\left(\\tfrac{t}{${k}}\\right) + C` },
          { text: 'Barrow (volviendo a $t$, con los límites originales):', tex: `\\left[-${k}\\cos\\left(\\tfrac{t}{${k}}\\right)\\right]_0^{${bTeX}} = -${k}\\left[\\cos\\left(${thTeX}\\right) - \\cos 0\\right] = -${k}\\left[${th.cosTeX} - 1\\right]` },
          { text: 'Resultado:', tex: Number.isInteger(val) ? valTeX : `${valTeX} \\approx ${dec(val)}` },
        ],
        explanation: `El número que divide a $t$ "sale" multiplicando: $\\int \\operatorname{sen}(at)\\,dt = -\\frac{1}{a}\\cos(at)$. Con $a = \\frac1{${k}}$, $\\frac1a = ${k}$. Ojo con el signo: $\\int \\operatorname{sen} = -\\cos$.`,
        commonErrors: ['Olvidar el $-$ de $\\int \\operatorname{sen} = -\\cos$.', `Dividir por ${k} en vez de multiplicar.`, 'Olvidar restar $\\cos 0 = 1$.'],
      }
      if (level === 3) return make({ ...meta, level: 3, levelWhy: 'Nivel Analista: sustitución + Barrow con valores trigonométricos.' }, { kind: 'numeric', answer: val, answerText: valText, tol: { rel: 1e-4 }, wrong: [{ value: val / (k * k), why: `Dividiste por ${k} en vez de multiplicar: $dt = ${k}\\,du$.`, errorTag: 'factor' }, { value: -val, why: 'Te quedó el signo al revés: $\\int \\operatorname{sen} = -\\cos$.', errorTag: 'signo' }] })
      return make({ ...meta, level: 4, levelWhy: 'Nivel Experto: justificar cada paso del cambio de variable.', prompt: meta.prompt + ' Respondé por partes.' }, { kind: 'multi', parts: [
        { label: 'a', prompt: `Si $u = \\frac{t}{${k}}$, entonces $dt = \\square\\,du$. ¿Qué número va en el cuadradito?`, points: 1, kind: 'numeric', answer: k, wrong: [{ value: 1 / k, why: `Si $du = \\frac{1}{${k}}dt$, despejando $dt = ${k}\\,du$.`, errorTag: 'factor' }] },
        { label: 'b', prompt: `Cuando $t = ${bTeX}$, ¿cuánto vale $u$? (podés escribir pi)`, points: 1, kind: 'numeric', answer: (th.n * Math.PI) / th.d, tol: { rel: 1e-4 } },
        { label: 'c', prompt: 'Valor de la integral:', points: 2, kind: 'numeric', answer: val, answerText: valText, tol: { rel: 1e-4 } },
      ] })
    },
  },

  /* 7 bis) variable de integración (recuadro de la pizarra) */
  fixed('px.variableMuda', 'integrales', 'i7', '¿Respecto de qué variable integro?', (r) => {
    const g = r.pick([
      { tex: '\\operatorname{sen}\\left(\\frac{x}{2}\\right)', s: 'sin(x/2)', prim: '-2*cos(x/2)' },
      { tex: 'x^2', s: 'x^2', prim: 'x^3/3' },
      { tex: 'e^x', s: 'e^x', prim: 'e^x' },
      { tex: '\\cos(3x)', s: 'cos(3*x)', prim: 'sin(3*x)/3' },
    ])
    const b = r.pick([{ tex: '2\\pi', s: '2*pi' }, { tex: '3', s: '3' }, { tex: '5', s: '5' }])
    return make({
      subtopic: 'Variable de integración', concepts: ['i7.barrow', 'i3.primitiva'], level: 3, levelWhy: 'Nivel Analista: trampa conceptual; hay que leer el diferencial.',
      prompt: `Calculá $\\displaystyle\\int_0^{${b.tex}} ${g.tex}\\,dt$. (Ojo: mirá bien el diferencial.)`,
      hints: ['¿Qué letra aparece en el $d\\square$ del final?', `Se integra respecto de $t$. Para $t$, la expresión $${g.tex}$ es una **constante**, como si fuera un número.`, '$\\int_0^{b} c\\,dt = c\\cdot t\\big|_0^{b} = c\\cdot b$.'],
      solution: [
        { text: `El diferencial es $dt$: la variable es $t$. La $x$ no cambia mientras $t$ va de 0 a $${b.tex}$, así que $${g.tex}$ es una constante.` },
        { text: '', tex: `\\int_0^{${b.tex}} ${g.tex}\\,dt = ${g.tex}\\cdot t\\,\\Big|_0^{${b.tex}} = ${b.tex}\\cdot ${g.tex}` },
      ],
      explanation: 'El $dx$, $dt$ o $du$ te dice **quién se mueve**. Todo lo que no tenga esa letra se trata como un número que sale afuera de la integral.',
      commonErrors: ['Integrar como si fuera $dx$.', 'Ignorar el diferencial.'],
    }, { kind: 'expression', answer: `${b.s}*${g.s}`, v: 'x', mode: 'exact', domain: [0.5, 3], wrong: [{ expr: g.prim, why: 'Integraste respecto de $x$, pero el diferencial es $dt$: la variable es $t$.', errorTag: 'variable' }] })
  }),

  /* 10) cuadrado de un binomio + Barrow */
  {
    id: 'px.cuadrado', area: 'integrales', unit: 'i7', title: 'Constante · ∫ (a − x)² dx', levels: [2, 3],
    gen: (r, level) => {
      const c = r.pick([{ n: 5, d: 2 }, { n: 3, d: 2 }, { n: 2, d: 1 }, { n: 4, d: 3 }])
      const a = r.pick([2, 3, 4]), b = r.pick([1, 2, 3])
      const cTeX = fracTeX(c.n, c.d)
      const inner = (a ** 3 - (a - b) ** 3) / 3
      const num = c.n * (a ** 3 - (a - b) ** 3), den = c.d * 3
      const val = num / den
      const expand = `${a * a} - ${2 * a}x + x^2`
      if (level === 2)
        return make({
          subtopic: 'Cuadrado de un binomio', concepts: ['i4.potencia'], level: 2, levelWhy: 'Nivel Aprendiz: preparar el integrando (álgebra) antes de integrar.',
          prompt: `Para integrar $(${a} - x)^2$ primero hay que desarrollarlo. Escribí $(${a} - x)^2$ sin paréntesis.`,
          hints: ['$(a - b)^2 = a^2 - 2ab + b^2$.', `El término del medio es $2\\cdot ${a}\\cdot x$, con signo menos.`],
          solution: [{ text: '', tex: `(${a} - x)^2 = ${a}^2 - 2\\cdot ${a}\\cdot x + x^2 = ${expand}` }],
          explanation: 'Cuadrado de un binomio: el primero al cuadrado, menos el doble del primero por el segundo, más el segundo al cuadrado.',
          commonErrors: ['Olvidar el doble producto: $(a - x)^2 \\neq a^2 + x^2$.'],
        }, { kind: 'expression', answer: `${a * a} - ${2 * a}*x + x^2`, v: 'x', mode: 'exact', domain: [-2, 3], wrong: [{ expr: `${a * a} + x^2`, why: 'Te faltó el doble producto $-2\\cdot a\\cdot x$.', errorTag: 'binomio' }, { expr: `${a * a} - x^2`, why: 'El cuadrado de $-x$ es $+x^2$, y falta el doble producto.', errorTag: 'binomio' }, { expr: `${a * a} - ${a}*x + x^2`, why: 'El término del medio es el **doble** producto: $2\\cdot a\\cdot x$.', errorTag: 'binomio' }] })
      return make({
        data: { kind: 'integral', f: `(${c.n}/${c.d})*(${a} - x)^2`, a: 0, b },
        subtopic: 'Barrow con un polinomio', concepts: ['i7.barrow', 'i4.potencia'], level: 3, levelWhy: 'Nivel Analista: desarrollar, integrar término a término y evaluar.',
        prompt: `Calculá $\\displaystyle ${cTeX}\\int_0^{${b}} (${a} - x)^2\\,dx$.`,
        hints: [`Desarrollá: $(${a} - x)^2 = ${expand}$.`, `Primitiva: $${a * a}x - ${a}x^2 + \\frac{x^3}{3}$.`, `Evaluá en ${b}, restá lo que da en 0 (que es 0) y no te olvides de multiplicar por $${cTeX}$.`],
        solution: [
          { text: 'Desarrollo el cuadrado:', tex: `${cTeX}\\int_0^{${b}} \\left(${expand}\\right)dx` },
          { text: 'Integro término a término:', tex: `${cTeX}\\left[${a * a}x - \\frac{${2 * a}}{2}x^2 + \\frac{x^3}{3}\\right]_0^{${b}} = ${cTeX}\\left[${a * a * b} - ${a * b * b} + \\frac{${b ** 3}}{3} - 0\\right]` },
          { text: 'Resultado:', tex: `${cTeX}\\cdot ${fracTeX((a ** 3 - (a - b) ** 3), 3)} = ${fracTeX(num, den)}${Number.isInteger(val) ? '' : ` \\approx ${dec(val)}`}` },
        ],
        explanation: 'Otra forma más rápida: sustitución $u = ' + a + ' - x$, $du = -dx$: $\\int (' + a + ' - x)^2dx = -\\frac{(' + a + ' - x)^3}{3}$. Las dos tienen que dar lo mismo.',
        commonErrors: ['Olvidar el doble producto al desarrollar.', `Olvidar multiplicar por $${cTeX}$ al final.`, 'Olvidar dividir $x^3$ por 3.'],
      }, { kind: 'numeric', answer: val, answerText: fracStr(num, den), tol: { rel: 1e-6 }, wrong: [{ value: inner, why: `Te olvidaste de multiplicar por $${cTeX}$.`, errorTag: 'constante' }, { value: (c.n / c.d) * (a * a * b + b ** 3 / 3), why: 'Te faltó el doble producto al desarrollar el cuadrado.', errorTag: 'binomio' }] })
    },
  },

  /* 11) ∫ g(√x) dx */
  {
    id: 'px.raiz', area: 'integrales', unit: 'i6', title: '∫ sen(√x) dx: sustitución + partes', levels: [3, 4],
    gen: (r, level) => {
      const c = r.pick(RAICES)
      const sol = [
        { text: 'Cambio de variable: $u = \\sqrt{x}$, entonces $x = u^2$ y $dx = 2u\\,du$.' },
        { text: '', tex: `\\int ${c.g}\\,dx = \\int ${c.g.replace(/\\sqrt\{x\}/g, 'u')}\\cdot 2u\\,du = 2\\int ${c.inner}\\,du` },
        { text: 'Por partes ($\\int u\\,dv = uv - \\int v\\,du$, con la $u$ como lo que se deriva):', tex: `2\\int ${c.inner}\\,du = 2\\left(${c.parts}\\right) + C` },
        { text: 'Vuelvo a $x$ ($u = \\sqrt x$):', tex: `${c.okTeX} + C` },
      ]
      const meta = {
        subtopic: 'Sustitución y partes', concepts: ['i5.sustitucion', 'i6.partes'],
        hints: ['Proponé $u = \\sqrt{x}$. Despejá: $x = u^2$, $dx = 2u\\,du$.', 'Te queda $2\\int u\\cdot(\\ldots)\\,du$: eso sale por partes.', 'Para verificar: derivá el resultado y tiene que darte la función original.'],
        solution: sol,
        explanation: 'Siempre se puede controlar una primitiva **derivándola**. Si al derivar no vuelve la función de adentro de la integral, hay un error (en este tipo de ejercicio suele ser un signo).',
        commonErrors: ['Equivocarse el signo en partes: $\\int u\\operatorname{sen} u = -u\\cos u + \\operatorname{sen} u$.', 'Olvidar el 2 de $dx = 2u\\,du$.'],
      }
      if (level === 3) {
        const v = r.chance(0.5)
        const cand = v ? c.okTeX : c.badTeX
        return make({ ...meta, level: 3, levelWhy: 'Nivel Analista: V/F de parcial; se resuelve integrando o derivando el candidato.', prompt: 'Decidí si es verdadero o falso y elegí la justificación:' }, {
          kind: 'tf', statement: `$\\int ${c.g}\\,dx = ${cand} + C$`, answer: v,
          reasons: r.shuffle(v
            ? [{ text: `Verdadero: con $u = \\sqrt x$ y partes da $${c.okTeX} + C$ (y derivándolo vuelve $${c.g}$).`, correct: true }, { text: 'Falso: no se puede integrar porque hay una raíz adentro.', why: 'Se puede, con el cambio $u = \\sqrt x$.' }, { text: 'Falso: falta un signo menos adelante de todo.', why: 'Derivá el candidato: da exactamente la función original.' }]
            : [{ text: `Falso: hay un error de signo; lo correcto es $${c.okTeX} + C$ (derivando el candidato no vuelve $${c.g}$).`, correct: true }, { text: 'Verdadero: es lo que da la sustitución $u = \\sqrt x$.', why: 'El método es ese, pero el resultado tiene un signo mal.', errorTag: 'signo' }, { text: 'Verdadero: la constante $C$ arregla cualquier diferencia.', why: 'La $C$ solo absorbe números sueltos, no términos con $x$.' }]),
        })
      }
      return make({ ...meta, level: 4, levelWhy: 'Nivel Experto: dos técnicas encadenadas (sustitución y partes).', prompt: `Calculá $\\displaystyle\\int ${c.g}\\,dx$ (podés escribir sqrt(x); la $+C$ es opcional).` },
        { kind: 'expression', answer: c.ok, v: 'x', mode: 'upToConstant', domain: [0.5, 4], source: { f: c.f, op: 'integral' }, wrong: [{ expr: c.bad, why: 'Hay un error de signo. Derivá tu resultado para controlarlo.', errorTag: 'signo' }] })
    },
  },

  /* 12) derivada de una constante */
  fixed('px.constante', 'derivadas', 'd4', 'La derivada de una constante', (r) => {
    const c = r.pick(CONSTANTES)
    return make({
      data: { kind: 'derivAt', f: c.f, x: 1 },
      subtopic: 'Derivada de una constante', concepts: ['d4.tabla'], level: 1, levelWhy: 'Nivel Explorador: reconocer que no hay variable.',
      prompt: `Si $f(x) = ${c.tex}$, ¿cuánto vale $f'(x)$?`,
      hints: ['¿Aparece la letra $x$ en la fórmula?', 'Una función constante tiene gráfico horizontal: ¿qué pendiente tiene?'],
      solution: [{ text: `$${c.tex}$ es un número fijo (no tiene $x$): $f$ es constante, su gráfico es una recta horizontal y su pendiente es 0.`, tex: `f'(x) = \\frac{d}{dx}\\left(${c.tex}\\right) = 0` }],
      explanation: 'La derivada mide cuánto cambia $f$ cuando cambia $x$. Si $f$ no depende de $x$, no cambia nada: la derivada es 0.',
      commonErrors: ['Derivar el número como si fuera una función de $x$.'],
    }, { kind: 'numeric', answer: 0, wrong: [{ value: c.trap, why: c.why, errorTag: 'constante' }] })
  }),
]

/** Ejercicios del modelo de parcial, en el orden de la pizarra. */
export const PARCIAL_IDS = PARCIAL.map((t) => t.id)
