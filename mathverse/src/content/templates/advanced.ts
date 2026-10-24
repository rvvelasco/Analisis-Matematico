/**
 * Problemas de nivel Parcial (N5) y Final (N6) que integran varias ideas.
 * Cada uno tiene parámetros sorteados y su resolución se deduce a mano (ver comentarios).
 */
import type { Template } from '../../engine/types'
import { fmt } from '../../math/numeric'
import { fracStr, LV, make, sgn, T } from './helpers'

export const AVANZADOS: Template[] = [
  /* ---------- Funciones · N5: función homográfica completa ---------- */
  {
    id: 'f5.parcial', area: 'funciones', unit: 'f5', title: 'Parcial: función homográfica', levels: [5],
    gen: (r) => {
      // f(x) = (a x + b)/(x − c), con a·(−c) − b ≠ 0 para que no se simplifique
      let a = 0, b = 0, c = 0
      do { a = r.pick([-3, -2, -1, 1, 2, 3]); b = r.int(-6, 6); c = r.pick([-3, -2, -1, 1, 2, 3]) } while (-a * c - b === 0 || b === 0)
      const f = `(${a}*x ${sgn(b)})/(x ${sgn(-c)})`
      // inversa: y(x − c) = a x + b ⇒ x(y − a) = c y + b ⇒ f⁻¹(x) = (c x + b)/(x − a)
      const inv = `(${c}*x ${sgn(b)})/(x ${sgn(-a)})`
      const root = -b / a
      return make({
        data: { kind: 'homographic', a, b, c }, subtopic: 'Función homográfica', concepts: ['f5.asintotas', 'f1.dominio', 'f9.inversa', 'f2.ceros'], level: 5, levelWhy: LV[5] + ' Junta dominio, asíntotas, ceros e inversa en una misma función.',
        prompt: `Sea $f(x) = ${T(f)}$.`,
        plot: { fns: [{ expr: f, label: 'f' }], vlines: [{ x: c, label: `x = ${c}` }], x: [c - 8, c + 8], y: [a - 8, a + 8] },
        hints: ['a) La asíntota vertical está donde se anula el denominador (y no el numerador).', 'b) Para $x \\to \\pm\\infty$ mandan los términos de mayor grado: $\\frac{ax}{x}$.', 'c) Un cociente es 0 cuando lo es el numerador.', 'd) Escribí $y = f(x)$ y despejá $x$.'],
        solution: [
          { text: `a) El denominador se anula en $x = ${c}$ y ahí el numerador vale $${a * c + b} \\neq 0$: AV $x = ${c}$ (y $x = ${c}$ queda fuera del dominio).` },
          { text: `b) AH: $y = \\frac{${a}}{1} = ${a}$.` },
          { text: `c) $${a}x ${sgn(b)} = 0 \\Rightarrow x = ${fracStr(-b, a)}$.` },
          { text: '', tex: `\\text{d) } y(x ${sgn(-c)}) = ${a}x ${sgn(b)} \\Rightarrow x(y ${sgn(-a)}) = ${c}y ${sgn(b)} \\Rightarrow f^{-1}(x) = ${T(inv)}` },
          { text: `e) Las asíntotas se intercambian en la inversa: AV $x = ${a}$ y AH $y = ${c}$.` },
        ],
        explanation: 'En una homográfica, la inversa también es homográfica y sus asíntotas son las de $f$ intercambiadas (el gráfico se refleja en $y = x$).',
        commonErrors: ['Poner la AH en el cociente de los términos independientes.', 'Al despejar la inversa, olvidar sacar $x$ de factor común.'],
        estMinutes: 15, noCalc: true,
      }, { kind: 'multi', parts: [
        { label: 'a', prompt: 'Asíntota vertical: $x =$', points: 1, kind: 'numeric', answer: c, wrong: [{ value: -c, why: 'Revisá el signo: el denominador se anula cuando $x$ es igual al número que se resta.', errorTag: 'signo' }] },
        { label: 'b', prompt: 'Asíntota horizontal: $y =$', points: 1, kind: 'numeric', answer: a, wrong: [{ value: -b / c, why: 'La AH sale de los coeficientes principales, no de los términos independientes.' }] },
        { label: 'c', prompt: 'Cero de $f$: $x =$', points: 1, kind: 'numeric', answer: root, answerText: fracStr(-b, a) },
        { label: 'd', prompt: '$f^{-1}(x) =$', points: 2, kind: 'expression', answer: inv, v: 'x', mode: 'exact', domain: [a + 0.5, a + 4], prefix: 'f⁻¹(x) =', wrong: [{ expr: `(x ${sgn(-c)})/(${a}*x ${sgn(b)})`, why: 'Eso es $\\frac{1}{f(x)}$, no la inversa: hay que despejar $x$.', errorTag: 'inversa-reciproca' }] },
        { label: 'e', prompt: 'La asíntota vertical de $f^{-1}$ es…', points: 1, kind: 'mc', options: r.shuffle([{ text: `$x = ${a}$`, correct: true }, { text: `$x = ${c}$`, why: 'Esa es la de $f$; en la inversa se intercambian.' }, { text: `$x = ${-c}$`, why: 'Revisá el signo y recordá que las asíntotas se intercambian.' }].filter((o, i, arr) => arr.findIndex((p) => p.text === o.text) === i)) },
      ] })
    },
  },

  /* ---------- Funciones · N6: exponencial, logaritmo e inversa ---------- */
  {
    id: 'f6.final', area: 'funciones', unit: 'f6', title: 'Final: exponencial y su inversa', levels: [6],
    gen: (r) => {
      // f(x) = 2^(x − a) + b con b < 0 y −b potencia de 2: cero en x = a + log2(−b)
      const a = r.int(-2, 3), m = r.pick([1, 2, 3]), b = -(2 ** m)
      const f = `2^(x ${sgn(-a)}) ${sgn(b)}`
      return make({
        data: { kind: 'expShift', a, b }, subtopic: 'Exponencial y logaritmo', concepts: ['f6.log', 'f6.ecuaciones', 'f9.inversa', 'f8.transformaciones'], level: 6, levelWhy: LV[6] + ' Integra transformaciones, ecuaciones exponenciales, logaritmos e inversa.',
        prompt: `Sea $f(x) = 2^{x ${sgn(-a)}} ${sgn(b)}$.`,
        plot: { fns: [{ expr: f, label: 'f' }], x: [a - 6, a + 6], y: [b - 3, b + 10] },
        hints: ['a) $2^{(\\cdot)} > 0$ siempre: ¿cuál es el menor valor al que se acerca $f$?', `b) $2^{x ${sgn(-a)}} = ${-b} = 2^{${m}}$.`, 'c) Despejá: $y - b = 2^{x - a}$ y aplicá $\\log_2$.', 'd) La AH de $f$ se convierte en una AV de $f^{-1}$.'],
        solution: [
          { text: `a) $2^{x ${sgn(-a)}} > 0 \\Rightarrow f(x) > ${b}$: imagen $(${b}, +\\infty)$, asíntota horizontal $y = ${b}$.` },
          { text: `b) $2^{x ${sgn(-a)}} = 2^{${m}} \\Rightarrow x = ${a + m}$.` },
          { text: '', tex: `\\text{c) } y ${sgn(-b)} = 2^{x ${sgn(-a)}} \\Rightarrow f^{-1}(x) = ${a === 0 ? '' : a + ' + '}\\log_2(x ${sgn(-b)})` },
          { text: `d) $f^{-1}$ tiene dominio $(${b}, +\\infty)$ y asíntota vertical $x = ${b}$.` },
        ],
        explanation: 'Trasladar una exponencial mueve su asíntota; la inversa (un logaritmo) hereda esa asíntota rotada: la horizontal $y = b$ pasa a ser la vertical $x = b$.',
        commonErrors: ['Creer que la imagen de una exponencial trasladada sigue siendo $(0, +\\infty)$.', 'Escribir $\\log_2(x) - b$ en lugar de $\\log_2(x - b)$.'],
        estMinutes: 15, noCalc: true,
      }, { kind: 'multi', parts: [
        { label: 'a', prompt: 'La imagen de $f$ es…', points: 1, kind: 'mc', options: r.shuffle([{ text: `$(${b}, +\\infty)$`, correct: true }, { text: '$(0, +\\infty)$', why: 'Esa es la imagen de $2^x$ sin trasladar.', errorTag: 'transformaciones' }, { text: `$[${b}, +\\infty)$`, why: `$f$ nunca alcanza el valor ${b}: se acerca indefinidamente.` }, { text: '$\\mathbb{R}$', why: 'Una exponencial está acotada inferiormente.' }]) },
        { label: 'b', prompt: 'Cero de $f$: $x =$', points: 1, kind: 'numeric', answer: a + m, wrong: [{ value: m, why: `Faltó sumar el corrimiento horizontal: $x - ${a} = ${m}$.` }] },
        { label: 'c', prompt: '$f^{-1}(x) =$ (podés escribir $\\log_2 u$ como ln(u)/ln(2))', points: 2, kind: 'expression', answer: `${a} + ln(x ${sgn(-b)})/ln(2)`, v: 'x', mode: 'exact', domain: [b + 0.5, b + 6], prefix: 'f⁻¹(x) =', wrong: [{ expr: `${a} + ln(x)/ln(2) ${sgn(-b)}`, why: `El ${-b} va **dentro** del logaritmo: primero se despeja $2^{x - a} = x ${sgn(-b)}$.`, errorTag: 'transformaciones' }] },
        { label: 'd', prompt: 'Asíntota vertical de $f^{-1}$: $x =$', points: 1, kind: 'numeric', answer: b, wrong: [{ value: 0, why: 'El logaritmo trasladado tiene la asíntota corrida.' }, { value: a, why: 'Ese es el corrimiento horizontal de $f$, no su asíntota.' }] },
      ] })
    },
  },

  /* ---------- Derivadas · N5: optimización (lata de volumen fijo) ---------- */
  {
    id: 'd11.parcial', area: 'derivadas', unit: 'd11', title: 'Parcial: optimización con justificación', levels: [5],
    gen: (r) => {
      // V = 2π k³; A(ρ) = 2πρ² + 2V/ρ ⇒ A'(ρ) = 4πρ − 2V/ρ² = 0 ⇒ ρ³ = V/(2π) = k³ ⇒ ρ = k, h = V/(πk²) = 2k, A = 6πk²
      const k = r.pick([2, 3, 4, 5])
      const V = 2 * k ** 3
      return make({
        data: { kind: 'can', V }, subtopic: 'Optimización', concepts: ['d11.optimizacion', 'd9.extremos'], level: 5, levelWhy: LV[5] + ' Hay que modelar, reducir a una variable, derivar y justificar que es mínimo.',
        prompt: `Se quiere fabricar una lata cilíndrica cerrada de volumen $${V}\\pi$ cm³ usando la menor cantidad de chapa posible.`,
        hints: ['Volumen: $V = \\pi\\rho^2 h$. Área total: $A = 2\\pi\\rho^2 + 2\\pi\\rho h$.', `Despejá $h = \\frac{${V}}{\\rho^2}$ y reemplazá: $A(\\rho) = 2\\pi\\rho^2 + \\frac{${2 * V}\\pi}{\\rho}$.`, `$A'(\\rho) = 4\\pi\\rho - \\frac{${2 * V}\\pi}{\\rho^2} = 0$.`],
        solution: [
          { text: '', tex: `h = \\frac{${V}\\pi}{\\pi\\rho^2} = \\frac{${V}}{\\rho^2}, \\quad A(\\rho) = 2\\pi\\rho^2 + \\frac{${2 * V}\\pi}{\\rho}` },
          { text: '', tex: `A'(\\rho) = 4\\pi\\rho - \\frac{${2 * V}\\pi}{\\rho^2} = 0 \\Rightarrow \\rho^3 = ${k ** 3} \\Rightarrow \\rho = ${k}` },
          { text: `$A''(\\rho) = 4\\pi + \\frac{${4 * V}\\pi}{\\rho^3} > 0$: es mínimo. Entonces $h = ${2 * k}$ y $A = 2\\pi\\cdot${k * k} + 2\\pi\\cdot${k}\\cdot${2 * k} = ${6 * k * k}\\pi$ cm².` },
        ],
        explanation: 'La lata óptima tiene la altura igual al diámetro ($h = 2\\rho$). No hace falta memorizarlo: sale de que $\\rho^3 = \\frac{V}{2\\pi}$, y entonces $h = \\frac{V}{\\pi\\rho^2} = 2\\rho$.',
        commonErrors: ['Optimizar sin usar la restricción (quedan dos variables).', 'No verificar que el punto crítico es un mínimo.'],
        estMinutes: 15,
      }, { kind: 'multi', parts: [
        { label: 'a', prompt: 'Radio óptimo $\\rho$ (cm):', points: 2, kind: 'numeric', answer: k, wrong: [{ value: Math.cbrt(V), why: 'Revisá la derivada: $\\rho^3 = \\frac{V}{2\\pi}$, no $V$.' }] },
        { label: 'b', prompt: 'Altura óptima $h$ (cm):', points: 1, kind: 'numeric', answer: 2 * k, wrong: [{ value: k, why: 'Ese es el radio. La altura sale de $h = V/(\\pi\\rho^2)$.' }] },
        { label: 'c', prompt: 'Área mínima (cm²; podés escribir pi):', points: 1, kind: 'numeric', answer: 6 * Math.PI * k * k, tol: { rel: 1e-4 }, wrong: [{ value: 4 * Math.PI * k * k, why: 'Te faltó sumar las dos tapas o la superficie lateral.' }] },
        { label: 'd', prompt: 'Justificación:', points: 1, kind: 'tf', statement: 'El punto crítico encontrado es un mínimo de $A$.', answer: true, reasons: r.shuffle([{ text: "Verdadero: $A''(\\rho) > 0$ para $\\rho > 0$.", correct: true }, { text: "Verdadero: porque $A'(\\rho) = 0$ en ese punto.", why: "$A' = 0$ solo dice que es punto crítico; hace falta el signo de $A''$ (o de $A'$ alrededor).", errorTag: 'criterio' }, { text: 'Falso: es un máximo, porque la lata más grande gasta más chapa.', why: 'El volumen está fijo; se minimiza la chapa.' }]) },
      ] })
    },
  },

  /* ---------- Derivadas · N6: curva implícita ---------- */
  {
    id: 'd7.final', area: 'derivadas', unit: 'd7', title: 'Final: tangentes a una curva implícita', levels: [6],
    gen: (r) => {
      // x² + xy + y² = c. y' = −(2x + y)/(x + 2y). Tangente horizontal: y = −2x ⇒ 3x² = c.
      const [p, q, m] = r.pick([[1, 1, 1], [2, 2, 2], [1, -2, 1], [-1, 2, 1], [2, -4, 2], [-2, 4, 2]] as const)
      const c = p * p + p * q + q * q
      const sl = -(2 * p + q) / (p + 2 * q)
      return make({
        data: { kind: 'implicitFinal', p, q, c }, subtopic: 'Derivación implícita', concepts: ['d7.implicita', 'd8.tangente'], level: 6, levelWhy: LV[6] + ' Derivación implícita, recta tangente y análisis de dónde la tangente es horizontal.',
        prompt: `Considerá la curva $x^2 + xy + y^2 = ${c}$ (una elipse rotada) y el punto $P = (${p}, ${q})$.`,
        hints: ['Derivá ambos miembros respecto de $x$; $xy$ se deriva con la regla del producto.', "$2x + y + x\\,y' + 2y\\,y' = 0$.", "Tangente horizontal: $y' = 0 \\Rightarrow 2x + y = 0$. Reemplazá $y = -2x$ en la ecuación de la curva."],
        solution: [
          { text: "Derivando:", tex: "2x + y + x\\,y' + 2y\\,y' = 0 \\Rightarrow y' = -\\frac{2x + y}{x + 2y}" },
          { text: `a) En $P$: $y' = -\\frac{${2 * p + q}}{${p + 2 * q}} = ${fracStr(-(2 * p + q), p + 2 * q)}$.` },
          { text: '', tex: `\\text{b) } y = ${q} ${sl < 0 ? '-' : '+'} ${fracStr(Math.abs(2 * p + q), Math.abs(p + 2 * q))}(x ${sgn(-p)})` },
          { text: `c) $y = -2x$ en la curva: $x^2 - 2x^2 + 4x^2 = 3x^2 = ${c} \\Rightarrow x = \\pm ${m}$. Con $x = ${m}$, $y = ${-2 * m}$.` },
        ],
        explanation: 'La derivación implícita da la pendiente sin despejar $y$. Las tangentes horizontales están donde se anula el numerador de $y\'$ y las verticales donde se anula el denominador.',
        commonErrors: ['Derivar $xy$ como $y$ (olvidar la regla del producto).', 'Olvidar el factor $y\'$ al derivar $y^2$.'],
        estMinutes: 18,
      }, { kind: 'multi', parts: [
        { label: 'a', prompt: "$y'$ en $P$:", points: 1, kind: 'numeric', answer: sl, answerText: fracStr(-(2 * p + q), p + 2 * q), wrong: [{ value: -(2 * p) / (2 * q), why: 'Olvidaste el término $xy$ (regla del producto).', errorTag: 'producto' }] },
        { label: 'b', prompt: 'Recta tangente en $P$: $y =$', points: 1, kind: 'expression', answer: `${q} + (${sl})*(x - (${p}))`, v: 'x', mode: 'exact', domain: [-3, 3], prefix: 'y =' },
        { label: 'c', prompt: 'Abscisa positiva donde la tangente es horizontal: $x =$', points: 1, kind: 'numeric', answer: m, wrong: [{ value: m * m, why: 'Despejá bien: $3x^2 = c$.' }] },
        { label: 'd', prompt: 'Teoría:', points: 1, kind: 'tf', statement: 'En los puntos de la curva donde $x + 2y = 0$ la recta tangente es vertical.', answer: true, reasons: r.shuffle([{ text: "Verdadero: ahí se anula el denominador de $y'$ (y no el numerador), así que la pendiente no está definida: tangente vertical.", correct: true }, { text: "Falso: ahí $y' = 0$, la tangente es horizontal.", why: "$y' = 0$ cuando se anula el **numerador** $2x + y$.", errorTag: 'horizontal-vertical' }, { text: 'Falso: una elipse no tiene tangentes verticales.', why: 'Toda elipse tiene dos puntos con tangente vertical.' }]) },
      ] })
    },
  },

  /* ---------- Integrales · N5: TFC y extremos de una función integral ---------- */
  {
    id: 'i7.parcial', area: 'integrales', unit: 'i7', title: 'Parcial: función definida por una integral', levels: [5],
    gen: (r) => {
      // F(x) = ∫_1^x (t² − a²) dt = x³/3 − a²x − (1/3 − a²); F' = x² − a²: máx en −a, mín en a
      const a = r.pick([2, 3])
      const F = (x: number) => x ** 3 / 3 - a * a * x - (1 / 3 - a * a)
      return make({
        data: { kind: 'tfcParcial', a }, subtopic: 'Teorema fundamental', concepts: ['i7.tfc', 'i7.barrow', 'd9.extremos'], level: 5, levelWhy: LV[5] + ' Usa el TFC para estudiar una función sin conocerla y Barrow para calcularla.',
        prompt: `Sea $F(x) = \\displaystyle\\int_1^x (t^2 - ${a * a})\\,dt$.`,
        hints: ['a) La integral de $a$ a $a$ vale 0.', "b) TFC: $F'(x) = x^2 - " + a * a + '$.', "c) Puntos críticos: $F'(x) = 0$; el signo de $F'$ dice si es máximo o mínimo.", 'd) Barrow con la primitiva $\\frac{t^3}{3} - ' + a * a + 't$.'],
        solution: [
          { text: 'a) $F(1) = \\int_1^1 = 0$.' },
          { text: `b) $F'(x) = x^2 - ${a * a}$ (TFC).` },
          { text: `c) $F'(x) = 0 \\Rightarrow x = \\pm ${a}$. $F'$ es negativa entre $-${a}$ y $${a}$: mínimo relativo en $x = ${a}$, máximo en $x = -${a}$.` },
          { text: '', tex: `\\text{d) } F(${a}) = \\left[\\tfrac{t^3}{3} - ${a * a}t\\right]_1^{${a}} = ${fmt(F(a), 4)}` },
        ],
        explanation: 'Gracias al TFC, los extremos de $F(x) = \\int_a^x f$ están donde el integrando cambia de signo: $F$ crece donde $f > 0$ y decrece donde $f < 0$.',
        commonErrors: ['Pensar que hay que calcular la integral para encontrar los extremos.', 'Olvidar restar el valor en el límite inferior (1).'],
        estMinutes: 14, noCalc: true,
      }, { kind: 'multi', parts: [
        { label: 'a', prompt: '$F(1) =$', points: 1, kind: 'numeric', answer: 0 },
        { label: 'b', prompt: "$F'(x) =$", points: 1, kind: 'expression', answer: `x^2 - ${a * a}`, v: 'x', mode: 'exact', domain: [-3, 3], prefix: "F'(x) =", wrong: [{ expr: `x^3/3 - ${a * a}*x`, why: 'Ese es $F$ (salvo una constante); por el TFC, $F\'$ es el integrando evaluado en $x$.', errorTag: 'tfc' }, { expr: '2*x', why: 'Derivaste el integrando; el TFC dice que $F\'$ **es** el integrando.', errorTag: 'tfc' }] },
        { label: 'c', prompt: 'Abscisa del mínimo relativo de $F$:', points: 1, kind: 'numeric', answer: a, wrong: [{ value: -a, why: `En $x = -${a}$, $F'$ pasa de $+$ a $-$: es el máximo.`, errorTag: 'max-vs-min' }] },
        { label: 'd', prompt: `$F(${a}) =$`, points: 2, kind: 'numeric', answer: F(a), answerText: fracStr(Math.round(F(a) * 3), 3), wrong: [{ value: a ** 3 / 3 - a * a * a, why: 'Faltó restar el valor de la primitiva en el límite inferior $t = 1$.', errorTag: 'barrow' }] },
      ] })
    },
  },

  /* ---------- Integrales · N6: área con parámetro ---------- */
  {
    id: 'i8.final', area: 'integrales', unit: 'i8', title: 'Final: área entre curvas con parámetro', levels: [6],
    gen: (r) => {
      // Área entre y = x² e y = kx (k > 0): ∫_0^k (kx − x²) dx = k³/6. Si el área es A, k = (6A)^{1/3}.
      const k = r.pick([3, 6])
      const A = k ** 3 / 6
      return make({
        data: { kind: 'paramArea', k, A }, subtopic: 'Área entre curvas', concepts: ['i8.entre', 'i7.barrow'], level: 6, levelWhy: LV[6] + ' Plantear el área en función de un parámetro y resolver una ecuación con ella.',
        prompt: `Para $k > 0$, sea $R_k$ la región encerrada entre $y = x^2$ e $y = kx$.`,
        plot: { fns: [{ expr: 'x^2', label: 'x²' }, { expr: `${k}*x`, label: `kx (k = ${k})`, dashed: true }], shade: [{ expr: `${k}*x`, under: 'x^2', a: 0, b: k }], x: [-1, k + 1], y: [-1, k * k + 2] },
        hints: ['a) Las curvas se cortan cuando $x^2 = kx$.', 'b) Entre las intersecciones la recta está arriba: $\\int_0^k (kx - x^2)\\,dx$.', `c) Igualá la expresión de (b) a ${A} y despejá $k$.`],
        solution: [
          { text: 'a) $x^2 = kx \\Rightarrow x = 0$ o $x = k$.' },
          { text: '', tex: '\\text{b) } \\int_0^k (kx - x^2)\\,dx = \\left[\\tfrac{kx^2}{2} - \\tfrac{x^3}{3}\\right]_0^k = \\tfrac{k^3}{2} - \\tfrac{k^3}{3} = \\tfrac{k^3}{6}' },
          { text: `c) $\\frac{k^3}{6} = ${A} \\Rightarrow k^3 = ${k ** 3} \\Rightarrow k = ${k}$.` },
        ],
        explanation: 'Cuando el problema tiene un parámetro, se calcula el área "en general" (como función de $k$) y después se usa el dato para hallarlo. Es el mismo procedimiento de siempre, con letras.',
        commonErrors: ['Restar al revés (parábola menos recta) y obtener un área negativa.', 'Integrar de $-k$ a $k$.'],
        estMinutes: 16, noCalc: true,
      }, { kind: 'multi', parts: [
        { label: 'a', prompt: 'Intersección distinta de 0 (en función de $k$): $x =$', points: 1, kind: 'expression', answer: 'k', v: 'k', mode: 'exact', domain: [0.5, 4], wrong: [{ expr: 'k^2', why: 'De $x^2 = kx$ con $x \\neq 0$ sale $x = k$.' }] },
        { label: 'b', prompt: 'Área de $R_k$ en función de $k$:', points: 2, kind: 'expression', answer: 'k^3/6', v: 'k', mode: 'exact', domain: [0.5, 4], wrong: [{ expr: '-k^3/6', why: 'Restaste al revés: arriba está la recta $kx$.', errorTag: 'arriba-abajo' }, { expr: 'k^3/2', why: 'Te faltó restar el área bajo la parábola.' }] },
        { label: 'c', prompt: `Valor de $k$ para que el área sea ${A}:`, points: 1, kind: 'numeric', answer: k, wrong: [{ value: Math.sqrt(6 * A), why: 'El área depende de $k^3$, no de $k^2$.' }] },
        { label: 'd', prompt: 'Teoría:', points: 1, kind: 'tf', statement: 'Si se duplica $k$, el área se multiplica por 8.', answer: true, reasons: r.shuffle([{ text: 'Verdadero: el área es $\\frac{k^3}{6}$ y $(2k)^3 = 8k^3$.', correct: true }, { text: 'Falso: se duplica, porque el área es proporcional a $k$.', why: 'El área es cúbica en $k$.', errorTag: 'proporcionalidad' }, { text: 'Falso: se multiplica por 4.', why: 'Eso pasaría si dependiera de $k^2$.' }]) },
      ] })
    },
  },
]
