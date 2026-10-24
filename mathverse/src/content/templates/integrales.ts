import type { ExerciseDraft, Level, Template } from '../../engine/types'
import { compile, diff, parse, simplify, toTeX } from '../../math/expr'
import { fmt, riemannSum, simpson, type RiemannMode } from '../../math/numeric'
import { autoDomain, fixed, LV, make, mc, par, poly, polyEval, polyIntEval, polyIntText, sgn, T } from './helpers'

const A = 'integrales' as const

/** Comprueba (numéricamente) que la derivada de la primitiva propuesta sea el integrando. */
function isAntiderivative(F: string, f: string): boolean {
  const dF = compile(diff(parse(F)))
  const g = compile(parse(f))
  const [a, b] = autoDomain(`${F} + ${f}`)
  for (let i = 0; i <= 10; i++) {
    const x = a + ((b - a) * i) / 10
    const u = dF(x), w = g(x)
    if (!isFinite(u) || !isFinite(w)) continue
    if (Math.abs(u - w) > 1e-6 * Math.max(1, Math.abs(w))) return false
  }
  return true
}

function integExercise(meta: { f: string; F: string; level: Level; subtopic: string; concepts: string[]; levelWhy: string; hints: string[]; steps: { text: string; tex?: string }[]; explanation: string; wrong?: { expr: string; why: string; errorTag?: string }[]; commonErrors?: string[]; estMinutes?: number }): ExerciseDraft {
  return make({
    subtopic: meta.subtopic, concepts: meta.concepts, level: meta.level, levelWhy: meta.levelWhy,
    prompt: `Calculá $\\displaystyle\\int ${T(meta.f)}\\,dx$.`,
    hints: meta.hints,
    solution: [...meta.steps, { text: 'Resultado:', tex: `\\int ${T(meta.f)}\\,dx = ${T(meta.F)} + C` }, { text: 'Control: derivando el resultado se vuelve al integrando.' }],
    explanation: meta.explanation,
    commonErrors: meta.commonErrors ?? ['Olvidar la constante $+C$.'],
    estMinutes: meta.estMinutes,
    noCalc: true,
  }, { kind: 'expression', answer: meta.F, v: 'x', mode: 'upToConstant', domain: autoDomain(`${meta.F} + ${meta.f}`), wrong: meta.wrong ?? [], source: { f: meta.f, op: 'integral' }, prefix: '∫ … dx =' })
}

/** Verificación independiente para las plantillas de primitivas. */
const verifyAntiderivative = (ex: { kind: string } & Record<string, unknown>): string | null => {
  if (ex.kind !== 'expression') return null
  const src = ex.source as { f: string } | undefined
  if (!src) return null
  return isAntiderivative(ex.answer as string, src.f) ? null : `La derivada de ${ex.answer as string} no es ${src.f}`
}

const MODE_NAME: Record<RiemannMode, string> = { izq: 'extremo izquierdo', der: 'extremo derecho', medio: 'punto medio', trapecio: 'trapecios' }

export const INTEGRALES: Template[] = [
  /* ============ i1 · Acumulación ============ */
  {
    id: 'i1.distance', area: A, unit: 'i1', title: 'Distancia como área', levels: [1, 2],
    gen: (r, level) => {
      const v1 = r.pick([40, 60, 80, 90, 100]), t1 = r.pick([1, 2, 3])
      if (level === 1) {
        return make({
          subtopic: 'Acumulación', concepts: ['i1.acumulacion'], level, levelWhy: 'Nivel Explorador: el área de un rectángulo bajo una velocidad constante.',
          prompt: `Un auto va a velocidad constante de ${v1} km/h durante ${t1} h. Mirando el gráfico velocidad–tiempo, ¿cuánto vale el **área** del rectángulo sombreado y qué representa? Escribí el número (en km).`,
          plot: { fns: [{ expr: String(v1), label: 'v(t)' }], shade: [{ expr: String(v1), a: 0, b: t1 }], x: [-0.5, t1 + 1.5], y: [-10, v1 + 30] },
          hints: ['Área de un rectángulo = base × altura.', 'La base es el tiempo y la altura, la velocidad.'],
          solution: [{ text: '', tex: `${t1}\\ \\text{h}\\cdot ${v1}\\ \\tfrac{\\text{km}}{\\text{h}} = ${v1 * t1}\\ \\text{km}` }, { text: 'El área bajo la velocidad es la **distancia recorrida**.' }],
          explanation: 'Esta es la idea de fondo de la integral: **acumular** una tasa (km/h) a lo largo del tiempo da una cantidad total (km).',
        }, { kind: 'numeric', answer: v1 * t1, unit: 'km', wrong: [{ value: v1 + t1, why: 'Sumaste base y altura: el área de un rectángulo es base **por** altura.' }] })
      }
      const v2 = r.pick([20, 30, 50, 70]), t2 = r.pick([1, 2])
      const d = v1 * t1 + v2 * t2
      return make({
        subtopic: 'Acumulación', concepts: ['i1.acumulacion'], level, levelWhy: LV[2],
        prompt: `Un auto va a ${v1} km/h durante ${t1} h y después a ${v2} km/h durante ${t2} h. ¿Qué distancia recorrió en total (km)?`,
        plot: { fns: [{ expr: `${v1}`, domain: [0, t1] }, { expr: `${v2}`, domain: [t1, t1 + t2] }], shade: [{ expr: String(v1), a: 0, b: t1 }, { expr: String(v2), a: t1, b: t1 + t2 }], x: [-0.5, t1 + t2 + 1], y: [-10, Math.max(v1, v2) + 30] },
        hints: ['Partí el gráfico en dos rectángulos.', 'Calculá cada área y sumalas.'],
        solution: [{ text: '', tex: `${v1}\\cdot ${t1} + ${v2}\\cdot ${t2} = ${d}\\ \\text{km}` }],
        explanation: 'Cuando la velocidad cambia, se suman las áreas de cada tramo. Si cambia todo el tiempo, se parte en muchísimos tramos chiquitos: eso es una integral.',
      }, { kind: 'numeric', answer: d, unit: 'km', wrong: [{ value: v1 + v2, why: 'Sumaste velocidades: hay que multiplicar cada una por su tiempo.' }, { value: ((v1 + v2) / 2) * (t1 + t2), why: 'Promediaste las velocidades sin tener en cuenta cuánto tiempo duró cada tramo.', errorTag: 'promedio' }] })
    },
  },
  {
    id: 'i1.trapezoid', area: A, unit: 'i1', title: 'Área bajo una recta', levels: [2],
    gen: (r) => {
      const m = r.pick([1, 2, 3, -1]), b0 = r.int(4, 8), a = r.int(0, 1), b = a + r.int(2, 3)
      const f = poly([m, b0])
      const area = polyIntEval([m, b0], b) - polyIntEval([m, b0], a)
      const ya = polyEval([m, b0], a), yb = polyEval([m, b0], b)
      return make({
        subtopic: 'Área bajo una curva', concepts: ['i1.acumulacion', 'i1.area'], level: 2, levelWhy: LV[2],
        prompt: `Calculá, usando geometría, el área bajo $f(x) = ${T(f)}$ entre $x = ${a}$ y $x = ${b}$ (la función es positiva en ese intervalo).`,
        plot: { fns: [{ expr: f, label: 'f' }], shade: [{ expr: f, a, b }], x: [a - 1, b + 1], y: [-1, Math.max(ya, yb) + 2] },
        hints: ['La figura es un trapecio.', 'Área del trapecio = (base mayor + base menor) / 2 × altura. Acá las "bases" son $f(a)$ y $f(b)$.'],
        solution: [{ text: '', tex: `\\frac{f(${a}) + f(${b})}{2}\\cdot(${b} - ${a}) = \\frac{${ya} + ${yb}}{2}\\cdot ${b - a} = ${fmt(area)}` }],
        explanation: 'Para rectas se puede usar geometría; la integral generaliza esto a cualquier curva.',
      }, { kind: 'numeric', answer: area, wrong: [{ value: (ya + yb) * (b - a), why: 'Te faltó dividir por 2 en la fórmula del trapecio.' }] })
    },
  },
  fixed('i1.tf.signed', A, 'i1', 'Área con signo', (r) => make({
    subtopic: 'Área con signo', concepts: ['i1.area'], level: 2, levelWhy: 'Nivel Aprendiz: intuición clave sobre qué mide la integral definida.',
    prompt: 'Mirá el gráfico de $\\operatorname{sen} x$ entre $0$ y $2\\pi$ y decidí:',
    plot: { fns: [{ expr: 'sin(x)', label: 'sen x' }], shade: [{ expr: 'sin(x)', a: 0, b: 6.2832 }], x: [-0.5, 7], y: [-1.5, 1.5] },
    hints: ['La parte de arriba del eje suma, la de abajo resta.', 'Por simetría, ¿son iguales las dos partes?'],
    solution: [{ text: '$\\int_0^{2\\pi}\\operatorname{sen}x\\,dx = 0$, pero el área sombreada es $2 + 2 = 4$.' }],
    explanation: 'La integral definida da el **área con signo**: lo que está debajo del eje cuenta negativo. Para el área geométrica hay que separar en tramos y tomar valor absoluto.',
    commonErrors: ['Creer que la integral siempre es el área.'],
  }, { kind: 'tf', statement: '$\\displaystyle\\int_0^{2\\pi}\\operatorname{sen}x\\,dx$ es igual al área total sombreada.', answer: false, reasons: r.shuffle([
    { text: 'Falso: la integral vale 0 porque la parte bajo el eje resta; el área es 4.', correct: true },
    { text: 'Verdadero: la integral definida siempre es un área.', why: 'Es un área **con signo**.', errorTag: 'area-con-signo' },
    { text: 'Falso: la integral vale 4 y el área vale 0.', why: 'Al revés.' },
  ]) })),

  /* ============ i2 · Sumas de Riemann ============ */
  {
    id: 'i2.sum', area: A, unit: 'i2', title: 'Calcular una suma de Riemann', levels: [2, 3],
    gen: (r, level) => {
      const n = level === 2 ? r.pick([2, 4]) : r.pick([4, 5, 6])
      const b = level === 2 ? n : r.pick([2, 3])
      const mode: RiemannMode = level === 2 ? r.pick(['izq', 'der'] as RiemannMode[]) : r.pick(['izq', 'der', 'medio', 'trapecio'] as RiemannMode[])
      const c = level === 2 ? [1, 0, 1] : [r.pick([1, -1]), r.int(0, 3), r.int(4, 8)]
      const f = poly(c)
      const fn = compile(parse(f))
      const S = riemannSum(fn, 0, b, n, mode)
      const exact = polyIntEval(c, b)
      const h = b / n
      const pts = Array.from({ length: n }, (_, i) => (mode === 'izq' ? i * h : mode === 'der' ? (i + 1) * h : mode === 'medio' ? (i + 0.5) * h : i * h))
      return make({
        data: { kind: 'riemann', f, a: 0, b, n, mode }, subtopic: 'Sumas de Riemann', concepts: ['i2.riemann'], level, levelWhy: level === 2 ? LV[2] : 'Nivel Analista: hay que elegir bien los puntos según el método y sumar sin errores.',
        prompt: `Aproximá $\\int_0^{${b}} ${T(f)}\\,dx$ con ${n} subintervalos iguales usando ${mode === 'trapecio' ? 'la regla de los **trapecios**' : `rectángulos con altura en el **${MODE_NAME[mode]}**`}.`,
        plot: { fns: [{ expr: f, label: 'f' }], shade: [{ expr: f, a: 0, b }], x: [-0.5, b + 0.5], y: [Math.min(0, ...pts.map(fn)) - 1, Math.max(...pts.map(fn), fn(b)) + 2] },
        hints: [`Ancho de cada rectángulo: $\\Delta x = \\frac{${b} - 0}{${n}} = ${fmt(h)}$.`, mode === 'trapecio' ? 'Trapecios: $\\frac{\\Delta x}{2}[f(x_0) + 2f(x_1) + \\dots + 2f(x_{n-1}) + f(x_n)]$.' : `Puntos donde se mide la altura: ${pts.map((p) => fmt(p)).join('; ')}.`, 'Suma de (altura × ancho).'],
        solution: [{ text: `$\\Delta x = ${fmt(h)}$.` }, { text: mode === 'trapecio' ? 'Aplicamos la fórmula de trapecios.' : `Alturas: ${pts.map((p) => `$f(${fmt(p)}) = ${fmt(fn(p))}$`).join(', ')}.` }, { text: '', tex: `S = ${fmt(S)} \\quad(\\text{valor exacto: } ${fmt(exact)})` }],
        explanation: 'Una suma de Riemann aproxima el área con rectángulos. Al aumentar la cantidad de rectángulos, la suma se acerca a la integral.',
        commonErrors: ['Olvidarse de multiplicar por $\\Delta x$.', 'Usar $n + 1$ rectángulos.'],
        estMinutes: level === 2 ? 4 : 7,
      }, { kind: 'numeric', answer: S, tol: { abs: 1e-6, rel: 1e-6 }, wrong: [{ value: S / h, why: 'Sumaste las alturas pero te faltó multiplicar por el ancho $\\Delta x$.', errorTag: 'riemann-sin-ancho' }, ...(Math.abs(exact - S) > 1e-6 ? [{ value: exact, why: 'Ese es el valor exacto de la integral; te pedían la **aproximación** con rectángulos.' }] : [])] })
    },
  },
  {
    id: 'i2.over', area: A, unit: 'i2', title: '¿Sobreestima o subestima?', levels: [3],
    gen: (r) => {
      const inc = r.chance(0.5)
      const left = r.chance(0.5)
      const f = inc ? 'x^2 + 1' : '9 - x^2'
      const over = inc !== left // creciente + derecha = sobreestima
      return make({
        subtopic: 'Sumas de Riemann', concepts: ['i2.riemann'], level: 3, levelWhy: 'Nivel Analista: razonar con el gráfico sin hacer cuentas.',
        prompt: `$f(x) = ${T(f)}$ es ${inc ? 'creciente' : 'decreciente'} en $[0, 3]$. Si aproximás $\\int_0^3 f$ con rectángulos de altura en el **extremo ${left ? 'izquierdo' : 'derecho'}**, el resultado…`,
        plot: { fns: [{ expr: f }], shade: [{ expr: f, a: 0, b: 3 }], x: [-0.5, 3.5], y: [-1, 11] },
        hints: ['Dibujá un rectángulo: ¿su techo queda arriba o abajo de la curva?', `En una función ${inc ? 'creciente' : 'decreciente'}, el extremo ${left ? 'izquierdo' : 'derecho'} es el punto ${over ? 'más alto' : 'más bajo'} del subintervalo.`],
        solution: [{ text: `Cada rectángulo ${over ? 'sobresale por encima' : 'queda por debajo'} de la curva: la suma ${over ? 'sobreestima' : 'subestima'} la integral.` }],
        explanation: 'Para funciones monótonas, extremo izquierdo y derecho dan cotas inferior y superior del área. Su promedio es la regla de los trapecios.',
      }, mc(r, [
        { text: over ? 'es mayor que la integral (sobreestima).' : 'es menor que la integral (subestima).', correct: true },
        { text: over ? 'es menor que la integral (subestima).' : 'es mayor que la integral (sobreestima).', why: 'Mirá dónde queda el techo de cada rectángulo respecto de la curva.' },
        { text: 'es exactamente la integral.', why: 'Solo pasaría si la función fuera constante.' },
      ]))
    },
  },
  fixed('i2.order', A, 'i2', 'De la suma a la integral', (r) => {
    void r
    return make({
      subtopic: 'Sumas de Riemann', concepts: ['i2.riemann'], level: 2, levelWhy: 'Nivel Aprendiz: comprender el procedimiento que define la integral.',
      prompt: 'Ordená los pasos que definen $\\int_a^b f(x)\\,dx$ con sumas de Riemann.',
      hints: ['Antes de sumar hay que tener rectángulos; antes de rectángulos, subintervalos.'],
      solution: [{ text: '1. Partir $[a,b]$ en $n$ subintervalos de ancho $\\Delta x$. 2. Elegir un punto en cada uno. 3. Formar rectángulos de altura $f(x_i^*)$. 4. Sumar $\\sum f(x_i^*)\\Delta x$. 5. Tomar el límite $n \\to \\infty$.' }],
      explanation: 'La integral **es** el límite de las sumas de Riemann; la regla de Barrow es un atajo para calcularlo.',
    }, { kind: 'order', items: ['Partir $[a, b]$ en $n$ subintervalos de ancho $\\Delta x = \\frac{b - a}{n}$', 'Elegir un punto $x_i^*$ en cada subintervalo', 'Formar rectángulos de altura $f(x_i^*)$', 'Sumar las áreas: $\\sum f(x_i^*)\\,\\Delta x$', 'Tomar el límite cuando $n \\to \\infty$'] })
  }),

  /* ============ i3 · Antiderivadas ============ */
  {
    id: 'i3.concept', area: A, unit: 'i3', title: '¿Qué es una primitiva?', levels: [1],
    gen: (r) => {
      const n = r.int(3, 6), k = r.int(1, 9)
      return make({
        subtopic: 'Primitivas', concepts: ['i3.primitiva'], level: 1, levelWhy: 'Nivel Explorador: reconocer la definición (la derivada de la primitiva es la función).',
        prompt: `¿Cuál de estas funciones es una primitiva de $f(x) = ${T(`${n}*x^${n - 1}`)}$?`,
        hints: ['$F$ es primitiva de $f$ si $F\'(x) = f(x)$.', 'Derivá cada opción y mirá cuál da $f$.'],
        solution: [{ text: `$(x^{${n}} + ${k})' = ${n}x^{${n - 1}}$. ✔` }],
        explanation: 'Integrar es "derivar al revés". Por eso siempre se puede comprobar una primitiva derivándola.',
      }, mc(r, [
        { text: `$x^{${n}} + ${k}$`, correct: true, why: 'La constante desaparece al derivar, así que también es primitiva.' },
        { text: `$${T(`${n * (n - 1)}*x^${n - 2}`)}$`, why: 'Esa es la **derivada** de $f$, no su primitiva.', errorTag: 'derivo-en-vez-de-integrar' },
        { text: `$${n}x^{${n}}$`, why: `Derivá: $(${n}x^{${n}})' = ${n * n}x^{${n - 1}}$, no da $f$.`, errorTag: 'factor' },
        { text: `$\\frac{${n}x^{${n}}}{${n - 1}}$`, why: 'Dividiste por el exponente viejo: se divide por el **nuevo**.', errorTag: 'exponente-viejo' },
      ]))
    },
  },
  {
    id: 'i3.check', area: A, unit: 'i3', title: 'Verificar derivando', levels: [2],
    gen: (r) => {
      const cases = [
        { F: 'x*e^x', f: '(x + 1)*e^x', ok: true },
        { F: 'x*e^x', f: 'e^x', ok: false },
        { F: 'x*ln(x) - x', f: 'ln(x)', ok: true },
        { F: 'x*ln(x)', f: 'ln(x)', ok: false },
        { F: 'sin(x)^2/2', f: 'sin(x)*cos(x)', ok: true },
        { F: 'e^(x^2)', f: 'e^(x^2)', ok: false },
        { F: 'e^(x^2)/2', f: 'x*e^(x^2)', ok: true },
        { F: 'ln(x^2 + 1)', f: '1/(x^2 + 1)', ok: false },
      ]
      const c = r.pick(cases)
      const dF = diff(parse(c.F))
      return make({
        subtopic: 'Primitivas', concepts: ['i3.primitiva'], level: 2, levelWhy: 'Nivel Aprendiz: aplicar la definición derivando, sin necesidad de integrar.',
        prompt: 'Decidí sin integrar, solo derivando:',
        hints: ['Derivá $F$.', '¿Te dio exactamente $f$?'],
        solution: [{ text: '', tex: `F'(x) = \\left(${T(c.F)}\\right)' = ${toTeX(simplify(dF))}` }, { text: c.ok ? 'Coincide con $f$: es primitiva.' : 'No coincide con $f$: no es primitiva.' }],
        explanation: 'Para controlar una integral no hace falta volver a integrar: alcanza con derivar el resultado.',
      }, { kind: 'tf', statement: `$F(x) = ${T(c.F)}$ es una primitiva de $f(x) = ${T(c.f)}$.`, answer: c.ok, reasons: r.shuffle([
        { text: c.ok ? "Verdadero: al derivar $F$ se obtiene exactamente $f$." : "Falso: al derivar $F$ no se obtiene $f$.", correct: true },
        { text: c.ok ? 'Falso: para saberlo hay que integrar $f$ y comparar.' : 'Verdadero: se parecen mucho.', why: 'El criterio es $F\' = f$; derivar alcanza.' },
        { text: c.ok ? 'Falso: a $F$ le falta la constante $C$.' : 'Verdadero: basta con que $F$ y $f$ tengan las mismas funciones.', why: 'Cada función $F + C$ es primitiva; no hace falta escribir la $C$ para que $F$ lo sea.' },
      ]) })
    },
  },
  {
    id: 'i3.initial', area: A, unit: 'i3', title: 'Primitiva con condición inicial', levels: [2, 3],
    gen: (r, level) => {
      const c = level === 2 ? [2 * r.nonZero(-3, 3), r.int(-4, 4)] : [3 * r.nonZero(-2, 2), 2 * r.int(-3, 3), r.int(-4, 4)]
      const x0 = r.int(-2, 2), y0 = r.int(-6, 8)
      const C = y0 - polyIntEval(c, x0)
      return make({
        subtopic: 'Primitivas', concepts: ['i3.primitiva', 'i3.constante'], level, levelWhy: level === 2 ? LV[2] : 'Nivel Analista: integrar y después usar el dato para hallar la constante.',
        prompt: `Sabiendo que $F'(x) = ${T(poly(c))}$ y que $F(${x0}) = ${y0}$, ¿cuánto vale la constante $C$ en $F(x) = ${T(polyIntText(c))} + C$?`,
        hints: ['Reemplazá $x$ por ' + x0 + ' en $F$ e igualá a ' + y0 + '.', `$${T(polyIntText(c))}$ evaluado en ${x0} da ${fmt(polyIntEval(c, x0))}.`],
        solution: [{ text: '', tex: `F(${x0}) = ${fmt(polyIntEval(c, x0))} + C = ${y0} \\Rightarrow C = ${fmt(C)}` }],
        explanation: 'Todas las primitivas difieren en una constante (son la misma curva desplazada verticalmente). El dato $F(x_0) = y_0$ elige **una** de esas curvas.',
      }, { kind: 'numeric', answer: C, wrong: [{ value: y0, why: 'Ese es $F(' + x0 + ')$; falta restar lo que vale la parte sin $C$.' }] })
    },
  },

  /* ============ i4 · Integrales inmediatas ============ */
  {
    id: 'i4.power', area: A, unit: 'i4', title: 'Regla de la potencia para integrar', levels: [1, 2, 3],
    gen: (r, level) => {
      let f: string, F: string, hints: string[], steps: { text: string; tex?: string }[], wrong: { expr: string; why: string; errorTag?: string }[]
      if (level === 1) {
        const n = r.int(1, 6), a = r.nonZero(-6, 6) * (n + 1)
        f = `${a}*x^${n}`; F = `${a / (n + 1)}*x^${n + 1}`
        hints = ['$\\int x^n\\,dx = \\dfrac{x^{n+1}}{n+1} + C$', 'Sumá 1 al exponente y dividí por el exponente **nuevo**.']
        steps = [{ text: `Exponente nuevo: ${n + 1}. Dividimos por ${n + 1}:`, tex: `\\frac{${a}}{${n + 1}}x^{${n + 1}} = ${a / (n + 1)}x^{${n + 1}}` }]
        wrong = [{ expr: `${a * n}*x^${n - 1}`, why: 'Eso es **derivar**. Para integrar, el exponente sube (+1) y se divide por el nuevo.', errorTag: 'derivo-en-vez-de-integrar' }, { expr: `${a}*x^${n + 1}`, why: `Subiste el exponente pero no dividiste por ${n + 1}.`, errorTag: 'sin-dividir' }]
      } else if (level === 2) {
        const c = [3 * r.nonZero(-2, 2), 2 * r.int(-3, 3), r.nonZero(-5, 5)]
        f = poly(c); F = polyIntText(c)
        hints = ['Integrá término a término.', 'La integral de una constante $k$ es $kx$.']
        steps = [{ text: 'Término a término:', tex: T(F) + ' + C' }]
        wrong = [{ expr: polyIntText(c.slice(0, 2)) , why: `Te olvidaste de integrar el término constante: $\\int ${c[2]}\\,dx = ${c[2]}x$.`, errorTag: 'constante-integral' }]
      } else {
        const a = 3 * r.nonZero(-2, 2), k = r.pick([2, 3]), b = r.nonZero(-4, 4) * (k - 1), c = r.nonZero(-5, 5)
        f = `${a}*sqrt(x) ${sgn(b)}/x^${k} ${sgn(c)}/x`
        F = `${(2 * a) / 3}*x^(3/2) ${sgn(-b / (k - 1))}*x^(-${k - 1}) ${sgn(c)}*ln(x)`
        hints = ['Reescribí como potencias: $\\sqrt x = x^{1/2}$, $\\frac{1}{x^k} = x^{-k}$.', 'Ojo: $\\int \\frac1x\\,dx$ **no** sale con la regla de la potencia (dividirías por 0). Da $\\ln|x|$.', `$\\int x^{-${k}}dx = \\frac{x^{-${k - 1}}}{-${k - 1}}$.`]
        steps = [{ text: 'Reescribimos:', tex: `${a}x^{1/2} ${sgn(b)}x^{-${k}} ${sgn(c)}\\frac1x` }, { text: 'Integramos cada término:', tex: `${a}\\frac{x^{3/2}}{3/2} ${sgn(b)}\\frac{x^{-${k - 1}}}{-${k - 1}} ${sgn(c)}\\ln|x|` }]
        wrong = [{ expr: `${(2 * a) / 3}*x^(3/2) ${sgn(-b / (k - 1))}*x^(-${k - 1}) ${sgn(c)}*x^0`, why: '$\\int \\frac1x\\,dx = \\ln|x|$: es la excepción de la regla de la potencia.', errorTag: 'uno-sobre-x' }, { expr: `${(2 * a) / 3}*x^(3/2) ${sgn(b / (k + 1))}*x^(-${k + 1}) ${sgn(c)}*ln(x)`, why: `Con exponente negativo también se **suma** 1: $-${k} + 1 = -${k - 1}$.`, errorTag: 'exponente-negativo' }]
      }
      return integExercise({ f, F, level, subtopic: 'Integrales inmediatas', concepts: ['i4.potencia'], levelWhy: level === 1 ? LV[1] : level === 2 ? LV[2] : 'Nivel Analista: reescribir raíces y fracciones y reconocer el caso especial $1/x$.', hints, steps, wrong, explanation: 'La regla $\\int x^n dx = \\frac{x^{n+1}}{n+1}$ es la de derivar "al revés": si derivás $\\frac{x^{n+1}}{n+1}$, el $n+1$ baja y se cancela. Vale para todo $n \\neq -1$.' })
    },
    verify: (ex) => verifyAntiderivative(ex as never),
  },
  {
    id: 'i4.table', area: A, unit: 'i4', title: 'Exponencial y trigonométricas', levels: [2],
    gen: (r) => {
      const a = r.nonZero(-4, 4), b = r.nonZero(-4, 4), c = r.nonZero(-4, 4)
      const f = `${a}*e^x ${sgn(b)}*cos(x) ${sgn(c)}*sin(x)`
      const F = `${a}*e^x ${sgn(b)}*sin(x) ${sgn(-c)}*cos(x)`
      return integExercise({
        f, F, level: 2, subtopic: 'Integrales inmediatas', concepts: ['i4.tabla'], levelWhy: LV[2],
        hints: ['$\\int e^x dx = e^x$, $\\int \\cos x\\,dx = \\operatorname{sen} x$, $\\int \\operatorname{sen} x\\,dx = -\\cos x$.', 'Para no confundir signos: pensá qué hay que **derivar** para obtener cada término.'],
        steps: [{ text: 'Término a término con la tabla.' }],
        explanation: 'Cada fórmula de la tabla de integrales es una fórmula de derivadas leída al revés.',
        wrong: [{ expr: `${a}*e^x ${sgn(b)}*sin(x) ${sgn(c)}*cos(x)`, why: '$\\int \\operatorname{sen}x\\,dx = -\\cos x$ (derivá $-\\cos x$ y vas a obtener $\\operatorname{sen} x$).', errorTag: 'signo-seno' }],
      })
    },
    verify: (ex) => verifyAntiderivative(ex as never),
  },
  {
    id: 'i4.match', area: A, unit: 'i4', title: 'Relacioná integrandos y primitivas', levels: [1],
    gen: (r) => {
      const pairs = r.shuffle([
        { left: '$\\int x^3\\,dx$', right: '$\\frac{x^4}{4} + C$' },
        { left: '$\\int \\frac{1}{x}\\,dx$', right: '$\\ln|x| + C$' },
        { left: '$\\int e^x\\,dx$', right: '$e^x + C$' },
        { left: '$\\int \\cos x\\,dx$', right: '$\\operatorname{sen} x + C$' },
        { left: '$\\int \\operatorname{sen} x\\,dx$', right: '$-\\cos x + C$' },
        { left: '$\\int 5\\,dx$', right: '$5x + C$' },
      ]).slice(0, 4)
      return make({
        subtopic: 'Integrales inmediatas', concepts: ['i4.tabla', 'i4.potencia'], level: 1, levelWhy: LV[1],
        prompt: 'Relacioná cada integral con su resultado.',
        hints: ['Si dudás, derivá cada resultado y mirá a qué integrando vuelve.'],
        solution: pairs.map((p) => ({ text: `${p.left} = ${p.right}` })),
        explanation: 'Estas son las integrales inmediatas: todas salen de leer la tabla de derivadas al revés.',
      }, { kind: 'match', pairs })
    },
  },
  {
    id: 'i4.error', area: A, unit: 'i4', title: 'Cazá el error: integral de un producto', levels: [3],
    gen: (r) => {
      const c = r.int(1, 5)
      return make({
        subtopic: 'Linealidad', concepts: ['i4.potencia'], level: 3, levelWhy: 'Nivel Analista: detectar el uso de una "propiedad" que no existe.',
        prompt: `Un estudiante resolvió $\\int x(x + ${c})\\,dx$ así. ¿Cuál es el primer paso incorrecto?`,
        hints: ['¿Existe una regla que diga $\\int f\\cdot g = \\int f\\cdot\\int g$?', 'Probá derivar el resultado final.'],
        solution: [{ text: `El paso 1 está mal: la integral de un producto **no** es el producto de las integrales. Lo correcto es distribuir: $\\int (x^2 + ${c}x)\\,dx = \\frac{x^3}{3} + \\frac{${c}x^2}{2} + C$.` }],
        explanation: 'La integral es lineal (sumas y constantes salen), pero **no** se reparte en productos. Para productos hay que distribuir, sustituir o usar partes.',
      }, { kind: 'errorStep', steps: [`$\\int x(x + ${c})\\,dx = \\int x\\,dx \\cdot \\int (x + ${c})\\,dx$`, `$= \\frac{x^2}{2}\\cdot\\left(\\frac{x^2}{2} + ${c}x\\right)$`, `$= \\frac{x^4}{4} + \\frac{${c}x^3}{2} + C$`], wrongIndex: 0, ruleOptions: r.shuffle([
        { text: 'La integral de un producto no es el producto de las integrales.', correct: true },
        { text: 'Faltó la constante $C$ en el paso 1.', why: 'La constante no es el problema: el método está mal.' },
        { text: 'Hay un error de distributiva en el paso 3.', why: 'El paso 3 está bien hecho a partir del 2; el error es anterior.' },
      ]), fix: { answer: `x^3/3 + ${c}*x^2/2`, v: 'x', domain: [0.3, 2.5], mode: 'upToConstant' } })
    },
  },

  /* ============ i5 · Sustitución ============ */
  {
    id: 'i5.sub', area: A, unit: 'i5', title: 'Sustitución', levels: [2, 3, 4],
    gen: (r, level) => {
      const a = r.pick([2, 3, 4, 5]), b = r.int(1, 6), n = r.pick([2, 3, 4]), c = r.int(1, 6)
      const cases2 = [
        { f: `(${a}*x + ${b})^${n}`, F: `(${a}*x + ${b})^${n + 1}/${a * (n + 1)}`, u: `${a}x + ${b}`, du: `${a}\\,dx`, miss: `(${a}*x + ${b})^${n + 1}/${n + 1}` },
        { f: `e^(${a}*x)`, F: `e^(${a}*x)/${a}`, u: `${a}x`, du: `${a}\\,dx`, miss: `e^(${a}*x)` },
        { f: `cos(${a}*x + ${b})`, F: `sin(${a}*x + ${b})/${a}`, u: `${a}x + ${b}`, du: `${a}\\,dx`, miss: `sin(${a}*x + ${b})` },
      ]
      const cases3 = [
        { f: `x*(x^2 + ${c})^${n}`, F: `(x^2 + ${c})^${n + 1}/${2 * (n + 1)}`, u: `x^2 + ${c}`, du: '2x\\,dx', miss: `(x^2 + ${c})^${n + 1}/${n + 1}` },
        { f: `x*e^(x^2)`, F: 'e^(x^2)/2', u: 'x^2', du: '2x\\,dx', miss: 'e^(x^2)' },
        { f: `${2 * a}*x/(x^2 + ${c})`, F: `${a}*ln(x^2 + ${c})`, u: `x^2 + ${c}`, du: '2x\\,dx', miss: `${2 * a}*ln(x^2 + ${c})` },
        { f: 'x^2*cos(x^3)', F: 'sin(x^3)/3', u: 'x^3', du: '3x^2\\,dx', miss: 'sin(x^3)' },
      ]
      const cases4 = [
        { f: `sin(x)^${n}*cos(x)`, F: `sin(x)^${n + 1}/${n + 1}`, u: '\\operatorname{sen} x', du: '\\cos x\\,dx', miss: `-sin(x)^${n + 1}/${n + 1}` },
        { f: 'ln(x)/x', F: 'ln(x)^2/2', u: '\\ln x', du: '\\frac{1}{x}dx', miss: 'ln(x)^2' },
        { f: `e^x/(e^x + ${c})`, F: `ln(e^x + ${c})`, u: `e^x + ${c}`, du: 'e^x\\,dx', miss: `e^x*ln(e^x + ${c})` },
        { f: 'sin(x)/cos(x)', F: '-ln(cos(x))', u: '\\cos x', du: '-\\operatorname{sen} x\\,dx', miss: 'ln(cos(x))' },
        { f: `x/sqrt(x^2 + ${c})`, F: `sqrt(x^2 + ${c})`, u: `x^2 + ${c}`, du: '2x\\,dx', miss: `2*sqrt(x^2 + ${c})` },
      ]
      const cs = r.pick(level === 2 ? cases2 : level === 3 ? cases3 : cases4)
      return integExercise({
        f: cs.f, F: cs.F, level, subtopic: 'Sustitución', concepts: ['i5.sustitucion'],
        levelWhy: level === 2 ? 'Nivel Aprendiz: el interior es lineal y solo hay que compensar una constante.' : level === 3 ? 'Nivel Analista: hay que reconocer que la derivada del interior está (casi) presente.' : 'Nivel Experto: la sustitución no es evidente (funciones trascendentes o cocientes).',
        hints: ['Buscá una función cuya derivada también aparezca multiplicando.', `Probá $u = ${cs.u}$.`, `Entonces $du = ${cs.du}$: reemplazá y compensá las constantes.`],
        steps: [{ text: `Sustitución $u = ${cs.u}$, $du = ${cs.du}$.` }, { text: 'Se integra en $u$ y se vuelve a $x$.' }],
        explanation: 'La sustitución es la regla de la cadena al revés: si el integrando tiene la forma $f(g(x))\\,g\'(x)$, la primitiva es $F(g(x))$.',
        wrong: [{ expr: cs.miss, why: 'Revisá la compensación: al cambiar $dx$ por $du$ aparece (o falta) un factor. Derivá tu resultado y vas a ver que no da el integrando.', errorTag: 'sustitucion-factor' }],
        commonErrors: ['No compensar la constante de $du$.', 'Dejar la respuesta en función de $u$.'],
        estMinutes: level + 1,
      })
    },
    verify: (ex) => verifyAntiderivative(ex as never),
  },
  {
    id: 'i5.chooseU', area: A, unit: 'i5', title: '¿Qué conviene llamar u?', levels: [1],
    gen: (r) => {
      const c = r.int(1, 7), n = r.pick([3, 4, 5])
      return make({
        subtopic: 'Sustitución', concepts: ['i5.sustitucion'], level: 1, levelWhy: 'Nivel Explorador: reconocer la estructura antes de calcular.',
        prompt: `Para resolver $\\int 2x\\,(x^2 + ${c})^{${n}}\\,dx$ por sustitución, ¿qué conviene llamar $u$?`,
        hints: ['Elegí como $u$ algo cuya derivada aparezca multiplicando.'],
        solution: [{ text: `$u = x^2 + ${c}$, porque $du = 2x\\,dx$ está justo en la integral.` }],
        explanation: 'La buena elección de $u$ hace "desaparecer" la $x$ que sobra: queda $\\int u^n\\,du$.',
      }, mc(r, [
        { text: `$u = x^2 + ${c}$`, correct: true },
        { text: '$u = 2x$', why: `Entonces $du = 2\\,dx$ y no te sirve para $(x^2 + ${c})^{${n}}$.` },
        { text: `$u = (x^2 + ${c})^{${n}}$`, why: 'Su derivada es complicada y no aparece en la integral.' },
      ]))
    },
  },
  {
    id: 'i5.fill', area: A, unit: 'i5', title: 'Completá la sustitución', levels: [2],
    gen: (r) => {
      const c = r.int(1, 7), n = r.pick([2, 3, 4, 5])
      return make({
        subtopic: 'Sustitución', concepts: ['i5.sustitucion'], level: 2, levelWhy: LV[2],
        prompt: `Completá los pasos de $\\int 2x\\,(x^2 + ${c})^{${n}}\\,dx$.`,
        hints: ['$u$ es lo de adentro del paréntesis.', `$\\int u^{${n}}\\,du = \\frac{u^{${n + 1}}}{${n + 1}}$.`],
        solution: [{ text: `$u = x^2 + ${c}$, $du = 2x\\,dx$; $\\int u^{${n}}du = \\frac{u^{${n + 1}}}{${n + 1}} + C = \\frac{(x^2 + ${c})^{${n + 1}}}{${n + 1}} + C$.` }],
        explanation: 'Con la sustitución correcta la integral se vuelve inmediata.',
      }, { kind: 'fill', parts: ['$u =$', { blank: true, id: 'u', answer: `x^2 + ${c}`, mode: 'expression', size: 7 }, ', $du =$', { blank: true, id: 'du', answer: '2*x', mode: 'expression', size: 4 }, '$dx$. Queda $\\int u^{' + n + '}\\,du = \\dfrac{u^{\\square}}{\\square}$ con exponente', { blank: true, id: 'e', answer: String(n + 1), mode: 'number', size: 3 }, 'y denominador', { blank: true, id: 'd', answer: String(n + 1), mode: 'number', size: 3 }] })
    },
  },

  /* ============ i6 · Integración por partes ============ */
  {
    id: 'i6.parts', area: A, unit: 'i6', title: 'Integración por partes', levels: [3, 4],
    gen: (r, level) => {
      const a = r.pick([2, 3])
      const cases3 = [
        { f: 'x*e^x', F: '(x - 1)*e^x', u: 'x', dv: 'e^x\\,dx', bad: 'x*e^x - e^x*x' },
        { f: `x*e^(${a}*x)`, F: `e^(${a}*x)*(x/${a} - 1/${a * a})`, u: 'x', dv: `e^{${a}x}dx`, bad: `x*e^(${a}*x)/${a}` },
        { f: 'x*cos(x)', F: 'x*sin(x) + cos(x)', u: 'x', dv: '\\cos x\\,dx', bad: 'x*sin(x) - cos(x)' },
        { f: 'x*sin(x)', F: 'sin(x) - x*cos(x)', u: 'x', dv: '\\operatorname{sen} x\\,dx', bad: 'x*cos(x) - sin(x)' },
        { f: 'ln(x)', F: 'x*ln(x) - x', u: '\\ln x', dv: 'dx', bad: '1/x' },
      ]
      const cases4 = [
        { f: 'x^2*e^x', F: 'e^x*(x^2 - 2*x + 2)', u: 'x^2', dv: 'e^x\\,dx', bad: 'e^x*(x^2 - 2*x)' },
        { f: 'x*ln(x)', F: 'x^2*ln(x)/2 - x^2/4', u: '\\ln x', dv: 'x\\,dx', bad: 'x^2*ln(x)/2' },
        { f: 'e^x*sin(x)', F: 'e^x*(sin(x) - cos(x))/2', u: '\\operatorname{sen} x', dv: 'e^x\\,dx', bad: 'e^x*(sin(x) - cos(x))' },
        { f: 'x^2*ln(x)', F: 'x^3*ln(x)/3 - x^3/9', u: '\\ln x', dv: 'x^2\\,dx', bad: 'x^3*ln(x)/3 - x^3/3' },
      ]
      const cs = r.pick(level === 3 ? cases3 : cases4)
      return integExercise({
        f: cs.f, F: cs.F, level, subtopic: 'Integración por partes', concepts: ['i6.partes'],
        levelWhy: level === 3 ? 'Nivel Analista: elegir bien $u$ y $dv$ y aplicar la fórmula una vez.' : 'Nivel Experto: hay que aplicar partes dos veces o resolver una integral "cíclica".',
        hints: ['$\\int u\\,dv = u\\,v - \\int v\\,du$', `Elegí $u = ${cs.u}$ y $dv = ${cs.dv}$ (regla LIATE: Logaritmos, Inversas, Algebraicas, Trigonométricas, Exponenciales).`, level === 4 ? 'Si después de aplicar partes te queda una integral parecida, aplicá partes otra vez (o despejá si vuelve la original).' : 'Calculá $du$ y $v$ y armá $uv - \\int v\\,du$.'],
        steps: [{ text: `$u = ${cs.u}$, $dv = ${cs.dv}$.` }, { text: 'Fórmula de partes:', tex: 'uv - \\int v\\,du' }],
        explanation: 'Partes es la regla del producto al revés: $(uv)\' = u\'v + uv\'$. Sirve cuando $\\int v\\,du$ es más fácil que la integral original.',
        wrong: [{ expr: cs.bad, why: 'Revisá el término $\\int v\\,du$: es fácil equivocarse en el signo o en una constante. Derivá tu resultado para controlar.', errorTag: 'partes' }],
        commonErrors: ['Elegir $u$ y $dv$ al revés (la integral empeora).', 'Errar el signo del $-\\int v\\,du$.'],
        estMinutes: level === 3 ? 5 : 8,
      })
    },
    verify: (ex) => verifyAntiderivative(ex as never),
  },
  {
    id: 'i6.chooseU', area: A, unit: 'i6', title: 'Elegir u y dv', levels: [2],
    gen: (r) => {
      const q = r.pick([
        { f: 'x\\,e^{x}', u: '$u = x$, $dv = e^x\\,dx$', bad: '$u = e^x$, $dv = x\\,dx$', why: 'Con esa elección $\\int v\\,du = \\int \\frac{x^2}{2}e^x dx$: empeora.' },
        { f: 'x\\ln x', u: '$u = \\ln x$, $dv = x\\,dx$', bad: '$u = x$, $dv = \\ln x\\,dx$', why: 'Necesitarías integrar $\\ln x$ como primer paso, que es más difícil.' },
        { f: 'x\\cos x', u: '$u = x$, $dv = \\cos x\\,dx$', bad: '$u = \\cos x$, $dv = x\\,dx$', why: 'El exponente de $x$ sube y la integral se complica.' },
      ])
      return make({
        subtopic: 'Integración por partes', concepts: ['i6.partes'], level: 2, levelWhy: 'Nivel Aprendiz: aplicar el criterio LIATE.',
        prompt: `Para $\\int ${q.f}\\,dx$ por partes, ¿qué elección conviene?`,
        hints: ['LIATE: se elige como $u$ lo que aparece primero en Logaritmo, Inversa trig., Algebraica, Trigonométrica, Exponencial.', 'Conviene que $u$ se simplifique al derivar.'],
        solution: [{ text: `${q.u}. ${q.why}` }],
        explanation: 'La idea es que $u$ "mejore" al derivar (los polinomios bajan de grado, $\\ln x$ se vuelve $\\frac1x$) y que $dv$ sea fácil de integrar.',
      }, mc(r, [{ text: q.u, correct: true }, { text: q.bad, why: q.why, errorTag: 'partes-eleccion' }, { text: 'No se puede hacer por partes.', why: 'Es el caso típico de partes.' }]))
    },
  },

  /* ============ i7 · Integral definida y TFC ============ */
  {
    id: 'i7.barrow', area: A, unit: 'i7', title: 'Regla de Barrow', levels: [2, 3],
    gen: (r, level) => {
      if (level === 2) {
        const c = [3 * r.nonZero(-2, 2), 2 * r.int(-3, 3), r.int(-4, 4)]
        const a = r.int(-2, 1), b = a + r.int(1, 3)
        const val = polyIntEval(c, b) - polyIntEval(c, a)
        return make({
          data: { kind: 'integral', f: poly(c), a, b }, subtopic: 'Regla de Barrow', concepts: ['i7.barrow'], level, levelWhy: LV[2],
          prompt: `Calculá $\\displaystyle\\int_{${a}}^{${b}} \\left(${T(poly(c))}\\right) dx$.`,
          hints: ['Buscá una primitiva $F$.', '$\\int_a^b f = F(b) - F(a)$ (arriba menos abajo).'],
          solution: [{ text: 'Primitiva:', tex: `F(x) = ${T(polyIntText(c))}` }, { text: '', tex: `F(${b}) - F(${a}) = ${fmt(polyIntEval(c, b))} - \\left(${fmt(polyIntEval(c, a))}\\right) = ${fmt(val)}` }],
          explanation: 'La regla de Barrow conecta la integral (un área, un límite de sumas) con las primitivas. La constante $C$ se cancela al restar.',
          commonErrors: ['Restar al revés: $F(a) - F(b)$.'],
          noCalc: true,
        }, { kind: 'numeric', answer: val, wrong: [{ value: polyIntEval(c, b), why: 'Te faltó restar $F(' + a + ')$.' }] })
      }
      const q = r.pick([
        { f: 'cos(x)', a: '0', b: '\\frac{\\pi}{2}', av: 0, bv: Math.PI / 2, F: '\\operatorname{sen} x', val: 1 },
        { f: 'sin(x)', a: '0', b: '\\pi', av: 0, bv: Math.PI, F: '-\\cos x', val: 2 },
        { f: '1/x', a: '1', b: 'e', av: 1, bv: Math.E, F: '\\ln|x|', val: 1 },
        { f: 'e^x', a: '0', b: '\\ln 3', av: 0, bv: Math.log(3), F: 'e^x', val: 2 },
        { f: 'e^(2*x)', a: '0', b: '\\ln 2', av: 0, bv: Math.log(2), F: '\\tfrac12 e^{2x}', val: 1.5 },
        { f: '1/(x^2)', a: '1', b: '4', av: 1, bv: 4, F: '-\\tfrac1x', val: 0.75 },
      ])
      return make({
        data: { kind: 'integral', f: q.f, a: q.av, b: q.bv }, subtopic: 'Regla de Barrow', concepts: ['i7.barrow', 'i4.tabla'], level, levelWhy: 'Nivel Analista: la primitiva sale de la tabla y hay que evaluar logaritmos o funciones trigonométricas.',
        prompt: `Calculá $\\displaystyle\\int_{${q.a}}^{${q.b}} ${T(q.f)}\\,dx$.`,
        hints: [`Una primitiva es $${q.F}$.`, 'Evaluá arriba menos abajo.'],
        solution: [{ text: '', tex: `\\left[${q.F}\\right]_{${q.a}}^{${q.b}} = ${fmt(q.val)}` }],
        explanation: 'Valores útiles: $\\operatorname{sen}0 = 0$, $\\cos\\frac\\pi2 = 0$, $\\ln 1 = 0$, $\\ln e = 1$, $e^{\\ln a} = a$.',
        noCalc: true,
      }, { kind: 'numeric', answer: q.val })
    },
  },
  {
    id: 'i7.props', area: A, unit: 'i7', title: 'Propiedades de la integral definida', levels: [2, 3],
    gen: (r, level) => {
      const p = r.int(-6, 9), q = r.int(-6, 9), k = r.pick([2, 3, -2])
      if (level === 2) {
        const ask = r.pick(['sum', 'swap'] as const)
        const ans = ask === 'sum' ? p + q : -(p + q)
        return make({
          subtopic: 'Propiedades', concepts: ['i7.propiedades'], level, levelWhy: LV[2],
          prompt: `Sabiendo que $\\int_0^2 f(x)\\,dx = ${p}$ y $\\int_2^5 f(x)\\,dx = ${q}$, calculá $\\displaystyle\\int_{${ask === 'sum' ? 0 : 5}}^{${ask === 'sum' ? 5 : 0}} f(x)\\,dx$.`,
          hints: ['Los intervalos consecutivos se suman: $\\int_a^b + \\int_b^c = \\int_a^c$.', ask === 'swap' ? 'Invertir los límites cambia el signo.' : 'No hace falta conocer $f$.'],
          solution: [{ text: '', tex: ask === 'sum' ? `\\int_0^5 f = ${p} + ${par(q)} = ${p + q}` : `\\int_5^0 f = -\\int_0^5 f = -(${p + q}) = ${-(p + q)}` }],
          explanation: 'La integral es aditiva respecto del intervalo, y $\\int_b^a f = -\\int_a^b f$ (recorrer al revés cambia el signo de $\\Delta x$).',
        }, { kind: 'numeric', answer: ans, wrong: ask === 'swap' ? [{ value: p + q, why: 'Los límites están invertidos (de 5 a 0): el signo cambia.', errorTag: 'limites-invertidos' }] : [] })
      }
      const ans = k * (p + q) + 5 * 3
      return make({
        subtopic: 'Propiedades', concepts: ['i7.propiedades'], level, levelWhy: 'Nivel Analista: combinar linealidad y aditividad.',
        prompt: `Si $\\int_0^2 f = ${p}$ y $\\int_2^5 f = ${q}$, calculá $\\displaystyle\\int_0^5 \\big(${k}f(x) + 3\\big)\\,dx$.`,
        hints: ['Separá: $\\int (kf + 3) = k\\int f + \\int 3$.', '$\\int_0^5 3\\,dx = 3\\cdot 5$.'],
        solution: [{ text: '', tex: `${k}\\,(${p} + ${par(q)}) + 3\\cdot 5 = ${ans}` }],
        explanation: 'Linealidad: las constantes salen y las sumas se separan. La integral de una constante es constante × longitud del intervalo.',
        commonErrors: ['Calcular $\\int_0^5 3\\,dx = 3$.'],
      }, { kind: 'numeric', answer: ans, wrong: [{ value: k * (p + q) + 3, why: '$\\int_0^5 3\\,dx = 15$, no 3 (es un rectángulo de base 5).', errorTag: 'integral-constante' }] })
    },
  },
  {
    id: 'i7.tfc', area: A, unit: 'i7', title: 'Teorema fundamental del cálculo', levels: [3, 4],
    gen: (r, level) => {
      const g = r.pick([{ g: 't^2 + 1', gx: (t: number) => t * t + 1, tex: 't^2 + 1' }, { g: 'e^(t^2)', gx: (t: number) => Math.exp(t * t), tex: 'e^{t^2}' }, { g: 'sqrt(t^3 + 1)', gx: (t: number) => Math.sqrt(t ** 3 + 1), tex: '\\sqrt{t^3 + 1}' }, { g: 'ln(t^2 + 1)', gx: (t: number) => Math.log(t * t + 1), tex: '\\ln(t^2 + 1)' }])
      const x0 = r.pick([0, 1, 2])
      if (level === 3) {
        const v = g.gx(x0)
        return make({
          data: { kind: 'tfc', g: g.g, upper: 'x', x: x0 }, subtopic: 'Teorema fundamental', concepts: ['i7.tfc'], level, levelWhy: 'Nivel Analista: usar el TFC en lugar de intentar integrar (muchas de estas funciones no tienen primitiva elemental).',
          prompt: `Sea $F(x) = \\displaystyle\\int_0^x ${g.tex}\\,dt$. Calculá $F'(${x0})$.`,
          hints: ['No intentes integrar.', 'TFC: si $F(x) = \\int_a^x g(t)\\,dt$ entonces $F\'(x) = g(x)$.'],
          solution: [{ text: '', tex: `F'(x) = ${g.tex.replace(/t/g, 'x')} \\Rightarrow F'(${x0}) = ${fmt(v)}` }],
          explanation: 'El TFC dice que derivar e integrar son operaciones inversas: la tasa a la que crece el área acumulada es la altura de la curva en el borde.',
        }, { kind: 'numeric', answer: v, tol: { rel: 1e-4 }, wrong: x0 === 0 ? [] : [{ value: 0, why: 'La derivada de $F$ no es 0: $F$ depende de $x$ a través del límite superior.' }] })
      }
      const x1 = r.pick([1, 2])
      const v = g.gx(x1 * x1) * 2 * x1
      return make({
        data: { kind: 'tfc', g: g.g, upper: 'x^2', x: x1 }, subtopic: 'Teorema fundamental', concepts: ['i7.tfc', 'd6.cadena'], level, levelWhy: 'Nivel Experto: combina el TFC con la regla de la cadena (límite superior no lineal).',
        prompt: `Sea $G(x) = \\displaystyle\\int_0^{x^2} ${g.tex}\\,dt$. Calculá $G'(${x1})$.`,
        hints: ['$G(x) = F(x^2)$ con $F(u) = \\int_0^u g(t)\\,dt$.', 'Cadena: $G\'(x) = g(x^2)\\cdot 2x$.'],
        solution: [{ text: '', tex: `G'(x) = g(x^2)\\cdot 2x \\Rightarrow G'(${x1}) = g(${x1 * x1})\\cdot ${2 * x1} = ${fmt(v)}` }],
        explanation: 'Cuando el límite superior es una función $h(x)$, la derivada es $g(h(x))\\,h\'(x)$.',
        commonErrors: ['Olvidar el factor $h\'(x)$.'],
      }, { kind: 'numeric', answer: v, tol: { rel: 1e-4 }, wrong: [{ value: g.gx(x1 * x1), why: 'Te faltó multiplicar por la derivada del límite superior, $(x^2)\' = 2x$.', errorTag: 'cadena-interior' }, { value: g.gx(x1), why: 'Evaluaste $g$ en $x$ en vez de en $x^2$, y falta el factor $2x$.' }] })
    },
  },
  fixed('i7.tf.improper', A, 'i7', 'Barrow necesita continuidad', (r) => make({
    subtopic: 'Hipótesis del TFC', concepts: ['i7.barrow'], level: 4, levelWhy: 'Nivel Experto: trampa clásica de examen: aplicar una fórmula sin revisar las hipótesis.',
    prompt: 'Un estudiante calculó $\\displaystyle\\int_{-1}^{1}\\frac{1}{x^2}dx = \\left[-\\frac1x\\right]_{-1}^{1} = -1 - 1 = -2$. Decidí:',
    plot: { fns: [{ expr: '1/x^2' }], x: [-2, 2], y: [-1, 8], vlines: [{ x: 0 }] },
    hints: ['El integrando es siempre positivo: ¿puede dar negativo?', 'Mirá qué pasa en $x = 0$.'],
    solution: [{ text: '$\\frac{1}{x^2}$ no está definida (ni acotada) en $x = 0$, que está dentro de $[-1, 1]$. Barrow no se puede aplicar; la integral es impropia y diverge.' }],
    explanation: 'Barrow exige que $f$ sea continua en todo $[a, b]$. Un integrando positivo nunca puede dar integral negativa: es una alarma.',
  }, { kind: 'tf', statement: 'El resultado $-2$ es correcto.', answer: false, reasons: r.shuffle([
    { text: 'Falso: el integrando no es continuo en $x = 0$, así que Barrow no se puede usar (la integral diverge).', correct: true },
    { text: 'Verdadero: la primitiva está bien calculada.', why: 'La primitiva sí, pero la regla no se puede aplicar.', errorTag: 'hipotesis' },
    { text: 'Falso: el resultado correcto es $+2$.', why: 'El problema no es el signo: la integral no existe como número.' },
  ]) })),

  /* ============ i8 · Áreas ============ */
  {
    id: 'i8.area', area: A, unit: 'i8', title: 'Área entre la curva y el eje', levels: [3, 4],
    gen: (r, level) => {
      if (level === 3) {
        const p = r.int(-3, 0), q = p + r.int(2, 4), s = r.pick([1, -1])
        const fe = `${s}*(x - (${p}))*(x - (${q}))`
        const area = ((q - p) ** 3) / 6
        const signed = -s * area
        return make({
          data: { kind: 'absArea', f: fe, a: p, b: q }, subtopic: 'Áreas', concepts: ['i8.area'], level, levelWhy: 'Nivel Analista: hallar los cortes y tener en cuenta el signo.',
          prompt: `Calculá el área encerrada entre $f(x) = ${T(fe)}$ y el eje $x$.`,
          plot: { fns: [{ expr: fe }], shade: [{ expr: fe, a: p, b: q }], x: [p - 2, q + 2], y: [-(area * 1.2 + 2), area * 1.2 + 2] },
          hints: [`Los cortes con el eje son $x = ${p}$ y $x = ${q}$.`, `Entre ellos la función es ${s > 0 ? 'negativa' : 'positiva'}.`, 'Área $= \\left|\\int_a^b f\\right|$ (si no cambia de signo en el medio).'],
          solution: [{ text: `Raíces: ${p} y ${q}.` }, { text: '', tex: `\\int_{${p}}^{${q}} f\\,dx = ${fmt(signed)} \\Rightarrow \\text{Área} = ${fmt(area)}` }],
          explanation: 'El área geométrica nunca es negativa. Si la curva queda debajo del eje, la integral da negativa y el área es su valor absoluto.',
          commonErrors: ['Dar el área negativa.'],
          estMinutes: 6,
        }, { kind: 'numeric', answer: area, tol: { rel: 1e-6 }, wrong: s > 0 ? [{ value: signed, why: 'La función está debajo del eje: la integral es negativa, pero el **área** es positiva.', errorTag: 'area-negativa' }] : [] })
      }
      const c = r.pick([1, 2]), d = c + r.pick([1, 2])
      const fe = `x^2 - ${c * c}`
      const g = compile(parse(fe))
      const area = simpson((x) => Math.abs(g(x)), 0, d, 4000)
      const exact = (2 * c ** 3) / 3 + ((d ** 3 - c ** 3) / 3 - c * c * (d - c))
      const signed = d ** 3 / 3 - c * c * d
      return make({
        data: { kind: 'absArea', f: fe, a: 0, b: d }, subtopic: 'Áreas', concepts: ['i8.area'], level, levelWhy: 'Nivel Experto: la función cambia de signo dentro del intervalo; integrar de una sola vez da un resultado incorrecto.',
        prompt: `Calculá el área entre $f(x) = ${T(fe)}$, el eje $x$ y las rectas $x = 0$ y $x = ${d}$.`,
        plot: { fns: [{ expr: fe }], shade: [{ expr: fe, a: 0, b: d }], x: [-1, d + 1], y: [-(c * c) - 2, d * d - c * c + 2] },
        hints: ['¿La función cambia de signo en $[0, ' + d + ']$?', `Corta el eje en $x = ${c}$: partí la integral ahí.`, 'Área $= \\left|\\int_0^{' + c + '} f\\right| + \\left|\\int_{' + c + '}^{' + d + '} f\\right|$'],
        solution: [{ text: '', tex: `\\left|\\int_0^{${c}}\\right| = ${fmt((2 * c ** 3) / 3)}, \\quad \\int_{${c}}^{${d}} = ${fmt((d ** 3 - c ** 3) / 3 - c * c * (d - c))}` }, { text: `Área total $= ${fmt(exact)}$.` }],
        explanation: 'Si la función cambia de signo, hay que separar el intervalo en los ceros y sumar los valores absolutos. Integrar de corrido resta la parte de abajo.',
        commonErrors: ['Integrar de 0 a ' + d + ' sin partir.'],
        estMinutes: 8,
      }, { kind: 'numeric', answer: exact, tol: { rel: 1e-6 }, wrong: Math.abs(area - exact) < 1e-6 ? [{ value: signed, why: 'Integraste de corrido: la parte debajo del eje se restó. Partí en $x = ' + c + '$.', errorTag: 'area-sin-partir' }, { value: Math.abs(signed), why: 'Tomar valor absoluto **al final** no alcanza: hay que partir el intervalo en $x = ' + c + '$.', errorTag: 'area-sin-partir' }] : [] })
    },
  },
  {
    id: 'i8.between', area: A, unit: 'i8', title: 'Área entre dos curvas', levels: [3, 4],
    gen: (r, level) => {
      if (level === 3) {
        const m = r.pick([1, 2, 3, 4])
        const area = m ** 3 / 6
        return make({
          data: { kind: 'between', f: `${m}*x`, g: 'x^2', a: 0, b: m }, subtopic: 'Área entre curvas', concepts: ['i8.entre'], level, levelWhy: 'Nivel Analista: buscar intersecciones y decidir cuál función va arriba.',
          prompt: `Calculá el área encerrada entre $y = x^2$ y $y = ${m === 1 ? '' : m}x$.`,
          plot: { fns: [{ expr: 'x^2', label: 'x²' }, { expr: `${m}*x`, label: `${m}x` }], shade: [{ expr: `${m}*x`, under: 'x^2', a: 0, b: m }], x: [-1, m + 1], y: [-1, m * m + 2] },
          hints: [`Intersecciones: $x^2 = ${m}x \\Rightarrow x = 0$ o $x = ${m}$.`, `Entre 0 y ${m}, la recta está arriba.`, `Área $= \\int_0^{${m}} (${m}x - x^2)\\,dx$.`],
          solution: [{ text: '', tex: `\\int_0^{${m}}(${m}x - x^2)dx = \\left[\\tfrac{${m}x^2}{2} - \\tfrac{x^3}{3}\\right]_0^{${m}} = ${fmt(area)}` }],
          explanation: 'Área entre curvas $= \\int_a^b(\\text{arriba} - \\text{abajo})\\,dx$, entre las intersecciones.',
          estMinutes: 6,
        }, { kind: 'numeric', answer: area, wrong: [{ value: -area, why: 'Restaste al revés (abajo − arriba).', errorTag: 'arriba-abajo' }, { value: m ** 3 / 2, why: 'Esa es solo el área bajo la recta: falta restar la parábola.' }] })
      }
      const k = r.pick([1, 4, 9]), s = Math.sqrt(k)
      const area = (8 / 3) * k * s
      return make({
        data: { kind: 'between', f: `${k} - x^2`, g: `x^2 - ${k}`, a: -s, b: s }, subtopic: 'Área entre curvas', concepts: ['i8.entre'], level, levelWhy: 'Nivel Experto: dos parábolas, simetría y cálculo con raíces.',
        prompt: `Calculá el área encerrada entre $f(x) = ${k} - x^2$ y $g(x) = x^2 - ${k}$.`,
        plot: { fns: [{ expr: `${k} - x^2` }, { expr: `x^2 - ${k}` }], shade: [{ expr: `${k} - x^2`, under: `x^2 - ${k}`, a: -s, b: s }], x: [-s - 1.5, s + 1.5], y: [-k - 2, k + 2] },
        hints: [`Intersecciones: $${k} - x^2 = x^2 - ${k} \\Rightarrow x = \\pm${s}$.`, '$f$ queda arriba.', `Área $= \\int_{-${s}}^{${s}} (${2 * k} - 2x^2)\\,dx$ (podés usar simetría: el doble de 0 a ${s}).`],
        solution: [{ text: '', tex: `2\\int_0^{${s}}(${2 * k} - 2x^2)\\,dx = 2\\left[${2 * k}x - \\tfrac{2x^3}{3}\\right]_0^{${s}} = ${fmt(area)}` }],
        explanation: 'Con simetría, integrar de $0$ a $a$ y duplicar ahorra cuentas y errores de signo.',
        estMinutes: 8,
      }, { kind: 'numeric', answer: area, wrong: [{ value: area / 2, why: 'Calculaste solo la mitad (de 0 a ' + s + '): duplicá por simetría.', errorTag: 'simetria' }] })
    },
  },
  fixed('i8.tf.zero', A, 'i8', 'Integral cero no es área cero', (r) => make({
    subtopic: 'Áreas', concepts: ['i8.area', 'i1.area'], level: 3, levelWhy: 'Nivel Analista: distinguir integral (con signo) de área.',
    prompt: 'Desafiá tu intuición:',
    plot: { fns: [{ expr: 'x^3' }], shade: [{ expr: 'x^3', a: -1, b: 1 }], x: [-2, 2], y: [-2, 2] },
    hints: ['Pensá en $f(x) = x^3$ entre $-1$ y $1$.'],
    solution: [{ text: '$\\int_{-1}^1 x^3dx = 0$, pero el área es $\\frac14 + \\frac14 = \\frac12$.' }],
    explanation: 'Las partes positiva y negativa se cancelan en la integral, no en el área.',
  }, { kind: 'tf', statement: 'Si $\\int_a^b f(x)\\,dx = 0$, entonces el área entre $f$ y el eje $x$ en $[a, b]$ es 0.', answer: false, reasons: r.shuffle([
    { text: 'Falso: con $x^3$ en $[-1, 1]$ la integral es 0 y el área es $\\frac12$.', correct: true },
    { text: 'Verdadero: la integral mide el área.', why: 'Mide el área **con signo**.', errorTag: 'area-con-signo' },
    { text: 'Falso: porque la integral nunca puede valer 0.', why: 'Sí puede (como en el ejemplo).' },
  ]) })),

  /* ============ i9 · Aplicaciones ============ */
  {
    id: 'i9.motion', area: A, unit: 'i9', title: 'Desplazamiento y distancia', levels: [3, 4],
    gen: (r, level) => {
      if (level === 3) {
        const a = r.int(1, 4), b = r.int(1, 6), T0 = r.int(2, 5)
        const dist = (a * T0 * T0) / 2 + b * T0
        return make({
          data: { kind: 'absArea', f: `${a}*x + ${b}`, a: 0, b: T0 }, subtopic: 'Movimiento', concepts: ['i9.aplicaciones', 'i1.acumulacion'], level, levelWhy: 'Nivel Analista: modelar con integrales una situación física.',
          prompt: `Un móvil tiene velocidad $v(t) = ${a}t + ${b}$ (m/s). ¿Cuántos metros recorre entre $t = 0$ y $t = ${T0}$?`,
          hints: ['La distancia es la integral de la velocidad (si es positiva).', `$\\int_0^{${T0}}(${a}t + ${b})\\,dt$`],
          solution: [{ text: '', tex: `\\left[\\tfrac{${a}t^2}{2} + ${b}t\\right]_0^{${T0}} = ${fmt(dist)}\\ \\text{m}` }],
          explanation: 'Integrar la velocidad acumula los pequeños desplazamientos $v\\,dt$.',
        }, { kind: 'numeric', answer: dist, unit: 'm', wrong: [{ value: a * T0 + b, why: 'Esa es la velocidad final, no la distancia.' }, { value: a, why: 'Esa es la aceleración (derivaste en lugar de integrar).', errorTag: 'derivo-en-vez-de-integrar' }] })
      }
      const c = r.int(1, 3), T0 = c + r.int(1, 3)
      const disp = (T0 * T0) / 2 - c * T0
      const dist = (c * c) / 2 + ((T0 - c) ** 2) / 2
      return make({
        data: { kind: 'absArea', f: `x - ${c}`, a: 0, b: T0 }, subtopic: 'Movimiento', concepts: ['i9.aplicaciones', 'i8.area'], level, levelWhy: 'Nivel Experto: la velocidad cambia de signo; hay que distinguir desplazamiento de distancia recorrida.',
        prompt: `Un móvil tiene velocidad $v(t) = t - ${c}$ (m/s). ¿Qué **distancia total recorrida** tiene entre $t = 0$ y $t = ${T0}$?`,
        plot: { fns: [{ expr: `x - ${c}`, label: 'v(t)' }], shade: [{ expr: `x - ${c}`, a: 0, b: T0 }], x: [-0.5, T0 + 1], y: [-c - 1, T0 - c + 1] },
        hints: [`La velocidad es negativa hasta $t = ${c}$: ahí el móvil retrocede.`, 'Distancia = $\\int |v(t)|\\,dt$. Partí en $t = ' + c + '$.'],
        solution: [{ text: '', tex: `\\int_0^{${c}}|t - ${c}|dt + \\int_{${c}}^{${T0}}(t - ${c})dt = ${fmt((c * c) / 2)} + ${fmt(((T0 - c) ** 2) / 2)} = ${fmt(dist)}` }, { text: `(El desplazamiento neto es ${fmt(disp)} m.)` }],
        explanation: 'El desplazamiento es $\\int v$ (con signo); la distancia recorrida es $\\int |v|$ (siempre suma).',
        estMinutes: 7,
      }, { kind: 'numeric', answer: dist, unit: 'm', wrong: disp !== dist ? [{ value: disp, why: 'Ese es el **desplazamiento** (con signo). La distancia recorrida suma también lo que retrocedió.', errorTag: 'desplazamiento-vs-distancia' }] : [] })
    },
  },
  {
    id: 'i9.mean', area: A, unit: 'i9', title: 'Valor medio de una función', levels: [3],
    gen: (r) => {
      const b = r.int(1, 4), k = r.int(1, 3)
      const c = [k, 0, 0]
      const mean = polyIntEval(c, b) / b
      return make({
        data: { kind: 'mean', f: poly(c), a: 0, b }, subtopic: 'Valor medio', concepts: ['i9.aplicaciones'], level: 3, levelWhy: 'Nivel Analista: aplicar la fórmula del valor medio integral.',
        prompt: `Calculá el valor medio de $f(x) = ${T(poly(c))}$ en $[0, ${b}]$.`,
        hints: ['$\\bar f = \\dfrac{1}{b - a}\\displaystyle\\int_a^b f(x)\\,dx$', 'Es la altura de un rectángulo con la misma área que la curva.'],
        solution: [{ text: '', tex: `\\frac{1}{${b}}\\int_0^{${b}} ${T(poly(c))}\\,dx = \\frac{1}{${b}}\\cdot ${fmt(polyIntEval(c, b))} = ${fmt(mean)}` }],
        explanation: 'El valor medio "aplana" la curva: un rectángulo de altura $\\bar f$ sobre $[a, b]$ tiene la misma área.',
      }, { kind: 'numeric', answer: mean, wrong: [{ value: polyIntEval(c, b), why: 'Te faltó dividir por la longitud del intervalo.' }, { value: (polyEval(c, 0) + polyEval(c, b)) / 2, why: 'Promediaste solo los extremos: el valor medio usa toda la curva.', errorTag: 'promedio' }] })
    },
  },
  {
    id: 'i9.volume', area: A, unit: 'i9', title: 'Volumen de revolución', levels: [4],
    gen: (r) => {
      const q = r.pick([{ f: 'x', tex: 'x', V: (b: number) => (Math.PI * b ** 3) / 3, F: (b: number) => `\\pi\\frac{${b}^3}{3}` }, { f: 'sqrt(x)', tex: '\\sqrt x', V: (b: number) => (Math.PI * b * b) / 2, F: (b: number) => `\\pi\\frac{${b}^2}{2}` }, { f: 'x^2', tex: 'x^2', V: (b: number) => (Math.PI * b ** 5) / 5, F: (b: number) => `\\pi\\frac{${b}^5}{5}` }])
      const b = r.int(1, 3)
      const V = q.V(b)
      return make({
        data: { kind: 'volume', f: q.f, a: 0, b }, subtopic: 'Volumen de revolución', concepts: ['i9.aplicaciones'], level: 4, levelWhy: 'Nivel Experto: modelar un volumen como suma de discos.',
        prompt: `Calculá el volumen del sólido que se obtiene al girar $y = ${q.tex}$, $0 \\le x \\le ${b}$, alrededor del eje $x$. (Podés escribir $\\pi$ como pi.)`,
        plot: { fns: [{ expr: q.f }, { expr: `-(${q.f})`, dashed: true }], shade: [{ expr: q.f, a: 0, b }], x: [-0.5, b + 1], y: [-(b * b) - 1, b * b + 1] },
        hints: ['Cada corte es un disco de radio $f(x)$.', '$V = \\pi\\displaystyle\\int_a^b f(x)^2\\,dx$'],
        solution: [{ text: '', tex: `V = \\pi\\int_0^{${b}} (${q.tex})^2\\,dx = ${q.F(b)} = ${fmt(V)}` }],
        explanation: 'Se suman infinitos discos de área $\\pi r^2$ y espesor $dx$.',
        commonErrors: ['Olvidar elevar al cuadrado.', 'Olvidar el $\\pi$.'],
      }, { kind: 'numeric', answer: V, tol: { rel: 1e-4 }, wrong: [{ value: V / Math.PI, why: 'Te faltó multiplicar por $\\pi$.', errorTag: 'sin-pi' }] })
    },
  },
  {
    id: 'i9.parcial', area: A, unit: 'i9', title: 'Problema tipo parcial', levels: [5],
    gen: (r) => {
      const a = r.pick([2, 3, 4, 6])
      const f = `x^2 - ${a}*x`
      return make({
        subtopic: 'Integrador de integrales', concepts: ['i7.barrow', 'i8.area', 'i4.potencia'], level: 5, levelWhy: LV[5],
        prompt: `Sea $f(x) = x^2 - ${a}x$.`,
        plot: { fns: [{ expr: f }], shade: [{ expr: f, a: 0, b: a }], x: [-1, a + 1], y: [-(a * a) / 4 - 2, a + 2] },
        hints: ['a) Integrá término a término y sumá $C$.', `b) Usá Barrow con la primitiva de (a).`, 'c) El área no puede ser negativa.'],
        solution: [{ text: '', tex: `\\text{a) } \\frac{x^3}{3} - ${T(`${a / 2}*x^2`)} + C` }, { text: '', tex: `\\text{b) } \\int_0^{${a}} f = ${fmt(-(a ** 3) / 6)}` }, { text: `c) Área $= ${fmt(a ** 3 / 6)}$ (la curva está debajo del eje entre 0 y ${a}).` }],
        explanation: 'Un parcial típico encadena: primitiva → integral definida → interpretación geométrica.',
        estMinutes: 12, noCalc: true,
      }, { kind: 'multi', parts: [
        { label: 'a', prompt: `Una primitiva de $f$:`, points: 1, kind: 'expression', answer: `x^3/3 - ${a / 2}*x^2`, v: 'x', mode: 'upToConstant', domain: [0.3, 2.5], wrong: [{ expr: `2*x - ${a}`, why: 'Derivaste en vez de integrar.', errorTag: 'derivo-en-vez-de-integrar' }], source: { f, op: 'integral' } },
        { label: 'b', prompt: `$\\int_0^{${a}} f(x)\\,dx =$`, points: 1, kind: 'numeric', answer: -(a ** 3) / 6 },
        { label: 'c', prompt: `Área entre $f$ y el eje $x$ en $[0, ${a}]$:`, points: 1, kind: 'numeric', answer: a ** 3 / 6, wrong: [{ value: -(a ** 3) / 6, why: 'El área es positiva: tomá valor absoluto.', errorTag: 'area-negativa' }] },
        { label: 'd', prompt: 'Interpretación:', points: 1, kind: 'tf', statement: `Como $\\int_0^{${a}} f < 0$, la función es negativa en todo $(0, ${a})$.`, answer: true, reasons: r.shuffle([{ text: `Verdadero, pero por otro motivo: $f(x) = x(x - ${a}) < 0$ para $0 < x < ${a}$ (la integral negativa sola no lo garantiza).`, correct: true }, { text: 'Verdadero: si la integral es negativa, la función es negativa en todo el intervalo.', why: 'Eso no vale en general: puede tener partes positivas más chicas.', errorTag: 'integral-signo' }, { text: 'Falso: la función es positiva en todo el intervalo.', why: `Probá $x = ${a / 2}$.` }]) },
      ] })
    },
  },
  {
    id: 'i9.final', area: A, unit: 'i9', title: 'Problema tipo final', levels: [6],
    gen: (r) => {
      // F(x) = ∫_0^x t e^{k t} dt, con k y el punto b sorteados
      const k = r.pick([1, 2, 3]), b = r.pick([1, 2])
      const ek = k === 1 ? 'e^{t}' : `e^{${k}t}`
      const F = (x: number) => Math.exp(k * x) * (x / k - 1 / (k * k)) + 1 / (k * k)
      const prim = k === 1 ? '(x - 1)*e^x' : `e^(${k}*x)*(x/${k} - 1/${k * k})`
      return make({
        subtopic: 'Integrador final', concepts: ['i6.partes', 'i7.tfc', 'd9.extremos', 'i8.area'], level: 6, levelWhy: LV[6] + ' Combina partes, TFC y extremos (Derivadas).',
        prompt: `Sea $F(x) = \\displaystyle\\int_0^x t\\,${ek}\\,dt$.`,
        hints: [`a) Por partes con $u = t$, $dv = ${ek}dt$.`, `b) TFC: $F'(x) = x\\,${ek.replace(/t/g, 'x')}$.`, "c) Puntos críticos: $F'(x) = 0$, y mirá el signo de $F'$ alrededor.", 'd) Evaluá la primitiva de (a) entre 0 y ' + b + ' (Barrow).'],
        solution: [
          { text: '', tex: `\\text{a) } \\int x\\,${ek.replace(/t/g, 'x')}dx = ${T(prim)} + C` },
          { text: '', tex: `\\text{b) } F'(${b}) = ${b === 1 ? '' : b}e^{${k * b}} \\approx ${fmt(b * Math.exp(k * b), 4)}` },
          { text: `c) $F'(x) = x\\,${ek.replace(/t/g, 'x')}$ tiene el signo de $x$: pasa de $-$ a $+$ en $x = 0$, mínimo relativo.` },
          { text: '', tex: `\\text{d) } F(${b}) = \\left[${T(prim.replace(/x/g, 't'), ['t'])}\\right]_0^{${b}} \\approx ${fmt(F(b), 4)}` },
        ],
        explanation: 'El TFC permite estudiar $F$ (crecimiento, extremos) **sin** calcular la integral; partes permite calcularla explícitamente. Las dos vías tienen que ser coherentes: la derivada de la primitiva de (a) es el integrando.',
        commonErrors: ['Olvidar el factor $\\frac1k$ al integrar $e^{kx}$.', 'Confundir $F(b)$ con $F\'(b)$.'],
        estMinutes: 18, noCalc: false,
      }, { kind: 'multi', parts: [
        { label: 'a', prompt: `Una primitiva de $x\\,${ek.replace(/t/g, 'x')}$:`, points: 1, kind: 'expression', answer: prim, v: 'x', mode: 'upToConstant', domain: [0.2, 1.5], wrong: [{ expr: k === 1 ? 'x*e^x' : `x*e^(${k}*x)`, why: 'Esa es la misma función.' }, { expr: k === 1 ? 'x*e^x - e^x' : `x*e^(${k}*x)/${k} - e^(${k}*x)`, why: `Al integrar $e^{${k}x}$ en el segundo término hay que dividir por ${k}.`, errorTag: 'factor' }], source: { f: k === 1 ? 'x*e^x' : `x*e^(${k}*x)`, op: 'integral' } },
        { label: 'b', prompt: `$F'(${b}) =$`, points: 1, kind: 'numeric', answer: b * Math.exp(k * b), tol: { rel: 1e-4 }, wrong: [{ value: 0, why: `Por el TFC, $F'(x) = x\\,${ek.replace(/t/g, 'x')}$.` }, { value: F(b), why: `Ese es $F(${b})$; te piden la derivada.` }] },
        { label: 'c', prompt: '$F$ tiene en $x = 0$…', points: 1, kind: 'mc', options: r.shuffle([{ text: 'un mínimo relativo', correct: true }, { text: 'un máximo relativo', why: "$F'$ pasa de negativa a positiva.", errorTag: 'max-vs-min' }, { text: 'un punto de inflexión sin extremo', why: "$F'$ cambia de signo, así que es extremo." }]) },
        { label: 'd', prompt: `$F(${b}) =$`, points: 1, kind: 'numeric', answer: F(b), tol: { rel: 1e-4 }, wrong: [{ value: b * Math.exp(k * b), why: `Ese es $F'(${b})$; te piden $F(${b})$.` }] },
      ] })
    },
  },
]
