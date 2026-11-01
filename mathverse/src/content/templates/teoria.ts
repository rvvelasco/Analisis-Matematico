/**
 * Teoría de cálculo integral: verdadero/falso con justificación y cambio de variable en integrales definidas.
 * Los V/F reúnen preguntas típicas de parcial (relación entre derivar, integrar, continuidad y dominio).
 */
import type { MCOption, Template } from '../../engine/types'
import { fmt } from '../../math/numeric'
import { fixed, fracStr, make, T } from './helpers'

interface Afirmacion { s: string; v: boolean; ok: string; bad: MCOption[]; concepts: string[]; hint: string; expl: string }

const AFIRMACIONES: Afirmacion[] = [
  {
    s: 'Toda función integrable en un intervalo $[a, b]$ es derivable en ese intervalo.', v: false, concepts: ['i7.barrow', 'd2.derivable'],
    ok: 'Falso: $|x|$ es integrable en $[-1, 1]$ y no es derivable en $x = 0$ (tiene un pico). Una función escalonada es integrable y ni siquiera es continua.',
    bad: [{ text: 'Verdadero: derivar e integrar son operaciones inversas, así que si existe una existe la otra.', why: 'El TFC relaciona las dos operaciones, pero no dice que toda integrable sea derivable.', errorTag: 'reciproca' }, { text: 'Falso: las funciones integrables nunca son continuas.', why: 'Muchas lo son (todo polinomio es integrable y continuo).' }],
    hint: 'Pensá en una función con un pico, como $|x|$: ¿se puede calcular el área debajo?', expl: 'Integrar pide poco (alcanza con que la función sea acotada y "no demasiado discontinua"); derivar pide mucho (que no haya picos ni saltos). Por eso integrable no implica derivable.',
  },
  {
    s: 'Si $f$ es integrable en todo su dominio, entonces es derivable en todo su dominio.', v: false, concepts: ['i7.barrow', 'd2.derivable'],
    ok: 'Falso: $f(x) = |x|$ es integrable en cualquier intervalo de su dominio y no es derivable en $x = 0$.',
    bad: [{ text: 'Verdadero: lo que vale en un intervalo vale en todo el dominio.', why: 'Ya en un intervalo es falso; con más razón en todo el dominio.' }, { text: 'Verdadero: la primitiva siempre es derivable, así que $f$ también.', why: 'Que la primitiva $F$ sea derivable dice que existe $F\' = f$, no que exista $f\'$.', errorTag: 'F-vs-f' }],
    hint: 'Buscá un contraejemplo sencillo.', expl: 'Para refutar un "para todo" alcanza un solo contraejemplo.',
  },
  {
    s: 'La derivada mide una variación (una tasa de cambio) y la integral mide una acumulación.', v: true, concepts: ['d1.tasa', 'i1.acumulacion'],
    ok: 'Verdadero: $f\'(x)$ es la tasa de cambio instantánea de $f$; $\\int_a^b f(x)\\,dx$ acumula los aportes $f(x)\\,dx$ (distancia a partir de velocidad, agua a partir de caudal).',
    bad: [{ text: 'Falso: es al revés, la integral mide la variación y la derivada la acumulación.', why: 'La derivada es una tasa (por unidad); la integral suma aportes.' }, { text: 'Falso: las dos miden áreas.', why: 'La derivada mide pendientes, no áreas.' }],
    hint: 'Velocidad y distancia: ¿cuál sale de derivar y cuál de integrar?', expl: 'El TFC dice justamente que acumular una tasa y después derivar devuelve la tasa: son operaciones inversas.',
  },
  {
    s: 'La integral definida se evalúa en un intervalo $[a, b]$.', v: true, concepts: ['i7.barrow', 'i1.area'],
    ok: 'Verdadero: $\\int_a^b f(x)\\,dx$ es un número que depende de $f$ y del intervalo. (La integral **indefinida**, en cambio, no es un número: es la familia de primitivas $F + C$.)',
    bad: [{ text: 'Falso: la integral siempre da una función.', why: 'Eso es la integral indefinida.', errorTag: 'definida-vs-indefinida' }, { text: 'Falso: se evalúa en un solo punto, como la derivada.', why: 'En un solo punto la integral vale 0: $\\int_a^a f = 0$.' }],
    hint: 'Distinguí integral definida e indefinida.', expl: 'Definida: número (área con signo). Indefinida: conjunto de funciones.',
  },
  {
    s: 'La derivada de $f$ en $x = a$ se calcula en un punto.', v: true, concepts: ['d2.definicion'],
    ok: 'Verdadero: $f\'(a) = \\lim_{h\\to 0}\\frac{f(a + h) - f(a)}{h}$ es un límite en el punto $a$. La **función** derivada $f\'(x)$ sale de hacer eso en cada punto.',
    bad: [{ text: 'Falso: la derivada siempre se calcula en un intervalo.', why: 'La tasa media sí usa un intervalo; la derivada es su límite en un punto.', errorTag: 'tvm-vs-derivada' }, { text: 'Falso: la derivada no depende del punto.', why: 'En general cambia de punto a punto (salvo en una recta).' }],
    hint: 'Recordá la definición con el límite del cociente incremental.', expl: 'La tasa de variación **media** necesita dos puntos; la derivada es lo que queda cuando el segundo punto se pega al primero.',
  },
  {
    s: 'La integral definida es un límite de una suma.', v: true, concepts: ['i2.riemann'],
    ok: 'Verdadero: $\\int_a^b f(x)\\,dx = \\lim_{n\\to\\infty}\\sum_{k=1}^{n} f(x_k)\\,\\Delta_k x$ (suma de Riemann). Si $f$ es continua y no negativa, ese límite es el área bajo la curva.',
    bad: [{ text: 'Falso: la integral se define como una primitiva evaluada.', why: 'Eso es la regla de Barrow, que es un teorema para **calcularla**; la definición es el límite de sumas.', errorTag: 'definicion-vs-barrow' }, { text: 'Falso: es un límite de un cociente.', why: 'Eso es la derivada.' }],
    hint: 'Pensá en los rectángulos de Riemann.', expl: 'Definición (Riemann): límite de sumas. Cálculo práctico (Barrow): primitiva evaluada. El TFC garantiza que coinciden.',
  },
  {
    s: 'Si $f$ y $g$ son integrables en $[a, b]$, la integral de la suma es la suma de las integrales.', v: true, concepts: ['i7.propiedades'],
    ok: 'Verdadero: $\\int_a^b (f + g) = \\int_a^b f + \\int_a^b g$ (linealidad: también salen las constantes).',
    bad: [{ text: 'Falso: solo vale para el producto.', why: 'Para el producto es justamente **falso**: $\\int fg \\neq \\int f\\cdot\\int g$.', errorTag: 'producto' }, { text: 'Falso: solo vale para integrales indefinidas.', why: 'Vale para las dos.' }],
    hint: 'Sumar áreas de rectángulos: ¿importa el orden en que sumás?', expl: 'En cada suma de Riemann, $\\sum (f + g)\\Delta x = \\sum f\\Delta x + \\sum g\\Delta x$; al tomar el límite se mantiene.',
  },
  {
    s: 'Toda función derivable en $[a, b]$ es integrable en $[a, b]$.', v: true, concepts: ['d2.derivable', 'i7.barrow'],
    ok: 'Verdadero: derivable $\\Rightarrow$ continua, y toda función continua en un intervalo cerrado y acotado es integrable.',
    bad: [{ text: 'Falso: hay funciones derivables que no tienen área.', why: 'En un intervalo cerrado y acotado, una derivable es continua y el área existe.' }, { text: 'Verdadero: porque derivar e integrar son lo mismo.', why: 'Son operaciones inversas, no iguales; la razón correcta es la cadena derivable ⇒ continua ⇒ integrable.' }],
    hint: '¿Qué implica ser derivable respecto de la continuidad?', expl: 'Cadena de implicaciones: derivable ⇒ continua ⇒ integrable (en $[a, b]$). Ninguna flecha vale al revés.',
  },
  {
    s: 'Si $f$ es derivable en todo su dominio $\\mathbb{R}$, entonces existe $\\int_{-\\infty}^{+\\infty} f(x)\\,dx$.', v: false, concepts: ['i7.barrow', 'd2.derivable'],
    ok: 'Falso: $f(x) = x$ es derivable en todo $\\mathbb{R}$ pero $\\int_{-\\infty}^{+\\infty} x\\,dx$ diverge. Lo que se garantiza es la integral en cada intervalo **cerrado y acotado**.',
    bad: [{ text: 'Verdadero: derivable implica integrable.', why: 'Solo en intervalos cerrados y acotados; en todo $\\mathbb{R}$ la integral es impropia y puede no existir.', errorTag: 'impropia' }, { text: 'Verdadero: porque la primitiva existe en todo $\\mathbb{R}$.', why: 'Que exista primitiva no hace que el límite en $\\pm\\infty$ sea finito.' }],
    hint: 'Probá con $f(x) = x$ o con $f(x) = 1$.', expl: 'Sobre un dominio no acotado la integral es impropia: hace falta que el límite exista y sea finito.',
  },
  {
    s: 'Si $F$ es una primitiva de $f$ (es decir, $\\int f = F + C$), entonces $F$ es derivable y $F\' = f$.', v: true, concepts: ['i3.primitiva'],
    ok: 'Verdadero: es la definición de primitiva: $F\'(x) = f(x)$. Cualquier $F + C$ también lo cumple.',
    bad: [{ text: 'Falso: $F$ solo es derivable si $f$ también lo es.', why: 'La derivabilidad de $F$ no depende de la de $f$.', errorTag: 'F-vs-f' }, { text: 'Falso: la constante $C$ impide derivar.', why: 'La derivada de una constante es 0.' }],
    hint: 'Releé qué significa "primitiva".', expl: 'Primitiva: función cuya derivada es $f$. Por eso las primitivas se controlan derivando.',
  },
  {
    s: 'Si $f$ tiene una primitiva $F + C$, entonces $f$ es derivable.', v: false, concepts: ['i3.primitiva', 'd2.derivable'],
    ok: 'Falso: $f(x) = |x|$ tiene primitiva $F(x) = \\frac{x|x|}{2}$ (porque $F\'(x) = |x|$) y $f$ no es derivable en 0. Lo que es derivable es $F$, no $f$.',
    bad: [{ text: 'Verdadero: si se puede integrar, se puede derivar.', why: 'Integrable no implica derivable.', errorTag: 'reciproca' }, { text: 'Verdadero: porque $F\' = f$.', why: 'Eso dice que $F$ es derivable; sobre $f$ no dice nada.', errorTag: 'F-vs-f' }],
    hint: 'No confundas la derivabilidad de $F$ con la de $f$.', expl: 'Tener primitiva es una propiedad "hacia atrás"; ser derivable es "hacia adelante". Son independientes.',
  },
  {
    s: 'La integral de un producto es el producto de las integrales.', v: false, concepts: ['i4.potencia', 'i6.partes'],
    ok: 'Falso: $\\int_0^1 x\\cdot x\\,dx = \\frac13$, pero $\\int_0^1 x\\,dx\\cdot\\int_0^1 x\\,dx = \\frac14$. Para productos se usa sustitución o partes.',
    bad: [{ text: 'Verdadero: la integral es lineal.', why: 'Lineal significa que respeta **sumas** y constantes, no productos.', errorTag: 'producto' }, { text: 'Verdadero, pero solo para integrales definidas.', why: 'Tampoco: el ejemplo es una integral definida.' }],
    hint: 'Probá con $f = g = x$ en $[0, 1]$.', expl: 'Así como $(fg)\' \\neq f\'g\'$, tampoco $\\int fg = \\int f\\int g$.',
  },
  {
    s: 'Al hacer el cambio de variable $u = g(x)$ en $\\int_a^b f(g(x))\\,g\'(x)\\,dx$, los límites de integración pasan a ser $g(a)$ y $g(b)$.', v: true, concepts: ['i5.sustitucion', 'i7.barrow'],
    ok: 'Verdadero: $\\int_a^b f(g(x))g\'(x)\\,dx = \\int_{g(a)}^{g(b)} f(u)\\,du$. O se cambian los límites, o se vuelve a $x$ antes de evaluar: lo que no se puede es evaluar en $u$ con los límites de $x$.',
    bad: [{ text: 'Falso: los límites no cambian nunca.', why: 'Si $x$ va de $a$ a $b$, la nueva variable $u$ va de $g(a)$ a $g(b)$.', errorTag: 'limites-sustitucion' }, { text: 'Falso: hay que reemplazarlos por 0 y 1.', why: 'Dependen de $g$.' }],
    hint: 'Si $x$ recorre $[a, b]$, ¿qué valores recorre $u = g(x)$?', expl: 'En una integral definida, cada símbolo tiene que estar en la misma variable: integrando, diferencial **y** límites.',
  },
  {
    s: '$\\int_a^b f(x)\\,dx = \\lim_{n\\to\\infty}\\sum_{k=1}^{n} f(x_k)\\,\\Delta_k x$ es el área entre la curva y el eje $x$, cualquiera sea el signo de $f$.', v: false, concepts: ['i2.riemann', 'i8.area'],
    ok: 'Falso: es el área solo si $f \\ge 0$ en $[a, b]$ (como pide la definición de área). Donde $f < 0$ los términos $f(x_k)\\Delta_k x$ son negativos y restan: la integral es un área **con signo**.',
    bad: [{ text: 'Verdadero: toda integral definida es un área.', why: 'Es área **con signo**; para el área hay que usar $|f|$.', errorTag: 'area-con-signo' }, { text: 'Falso: ese límite no existe si $f$ es negativa.', why: 'Existe igual (si $f$ es continua); solo deja de ser un área geométrica.' }],
    hint: 'Si $f(x_k) < 0$, ¿cómo es el término $f(x_k)\\,\\Delta_k x$?', expl: 'Por eso la definición de "área como límite de una suma" pide $f$ continua y **no negativa** en $[a, b]$.',
  },
]

/** Integrales definidas por sustitución (con cambio de límites). Valores calculados a mano. */
function casoDefinido(k: number, n: number) {
  const casos = [
    // ∫_0^b 2x (x²+1)^n dx, u = x²+1 ∈ [1, b²+1]
    { f: `2*x*(x^2 + 1)^${n}`, a: 0, b: k, aTeX: '0', bTeX: String(k), u: 'x^2 + 1', du: '2x\\,dx', ua: 1, ub: k * k + 1, uaTeX: '1', ubTeX: String(k * k + 1), prim: `u^${n + 1}/${n + 1}`, val: ((k * k + 1) ** (n + 1) - 1) / (n + 1), valText: fracStr((k * k + 1) ** (n + 1) - 1, n + 1) },
    // ∫_0^{π/2} sen^n x cos x dx, u = sen x ∈ [0, 1]
    { f: `sin(x)^${n}*cos(x)`, a: 0, b: Math.PI / 2, aTeX: '0', bTeX: '\\frac{\\pi}{2}', u: '\\operatorname{sen} x', du: '\\cos x\\,dx', ua: 0, ub: 1, uaTeX: '0', ubTeX: '1', prim: `u^${n + 1}/${n + 1}`, val: 1 / (n + 1), valText: `1/${n + 1}` },
    // ∫_1^e (ln x)^n / x dx, u = ln x ∈ [0, 1]
    { f: `ln(x)^${n}/x`, a: 1, b: Math.E, aTeX: '1', bTeX: 'e', u: '\\ln x', du: '\\frac{1}{x}dx', ua: 0, ub: 1, uaTeX: '0', ubTeX: '1', prim: `u^${n + 1}/${n + 1}`, val: 1 / (n + 1), valText: `1/${n + 1}` },
    // ∫_0^k x e^{x²} dx, u = x² ∈ [0, k²]  →  (e^{k²} − 1)/2
    { f: 'x*e^(x^2)', a: 0, b: k, aTeX: '0', bTeX: String(k), u: 'x^2', du: '2x\\,dx', ua: 0, ub: k * k, uaTeX: '0', ubTeX: String(k * k), prim: 'e^u/2', val: (Math.exp(k * k) - 1) / 2, valText: undefined as string | undefined },
  ]
  return casos
}

export const TEORIA: Template[] = [
  fixed('i7.tf.teoria', 'integrales', 'i7', 'Teoría: derivar, integrar, continuidad', (r) => {
    const a = r.pick(AFIRMACIONES)
    return make({
      subtopic: 'Teoría de derivadas e integrales', concepts: a.concepts, level: 3, levelWhy: 'Nivel Analista: pregunta de teoría de parcial; hay que justificar con una definición, un teorema o un contraejemplo.',
      prompt: 'Decidí si es verdadero o falso y elegí la justificación correcta:',
      hints: [a.hint, 'Para mostrar que algo es **falso** alcanza un contraejemplo; para que sea **verdadero** hace falta una razón general (definición o teorema).'],
      solution: [{ text: a.ok }],
      explanation: a.expl,
      commonErrors: ['Dar por válida la recíproca de un teorema (derivable ⇒ integrable no implica integrable ⇒ derivable).'],
    }, { kind: 'tf', statement: a.s, answer: a.v, reasons: r.shuffle([{ text: a.ok, correct: true }, ...a.bad]) })
  }),
  {
    id: 'i5.definite', area: 'integrales', unit: 'i5', title: 'Cambio de variable en integrales definidas', levels: [3, 4],
    gen: (r, level) => {
      const k = r.pick([1, 2]), n = r.pick([1, 2, 3])
      const c = r.pick(casoDefinido(k, n))
      const cambios = `u = ${c.u},\\ du = ${c.du};\\quad x = ${c.aTeX} \\Rightarrow u = ${c.uaTeX},\\ x = ${c.bTeX} \\Rightarrow u = ${c.ubTeX}`
      const valTeX = c.valText ? T(c.valText) : `\\frac{e^{${c.ub}} - 1}{2}`
      const meta = {
        data: { kind: 'integral', f: c.f, a: c.a, b: c.b },
        subtopic: 'Sustitución en integrales definidas', concepts: ['i5.sustitucion', 'i7.barrow'],
        prompt: `Calculá $\\displaystyle\\int_{${c.aTeX}}^{${c.bTeX}} ${T(c.f)}\\,dx$ por sustitución.${c.valText ? '' : ' (Podés escribir $e$ y potencias, por ejemplo (e^4 - 1)/2.)'}`,
        hints: [`Proponé $u = ${c.u}$.`, 'Cambiá también los **límites**: si $x$ va de $a$ a $b$, $u$ va de $u(a)$ a $u(b)$.', `Queda $\\int_{${c.uaTeX}}^{${c.ubTeX}} \\ldots\\,du$: integrá en $u$ y evaluá en los límites nuevos (sin volver a $x$).`],
        solution: [
          { text: 'Cambio de variable y de límites:', tex: cambios },
          { text: '', tex: `\\int_{${c.uaTeX}}^{${c.ubTeX}} ${c.prim === 'e^u/2' ? '\\tfrac12 e^u' : `u^{${n}}`}\\,du = \\left[${T(c.prim, ['u'])}\\right]_{${c.uaTeX}}^{${c.ubTeX}} = ${valTeX}${c.valText ? '' : ` \\approx ${fmt(c.val, 4)}`}` },
        ],
        explanation: 'Con los límites cambiados no hace falta volver a $x$: la integral en $u$ ya es el número buscado. Si preferís volver a $x$, entonces hay que evaluar con los límites **originales**. Lo que nunca se puede es mezclar (función en $u$ con límites de $x$).',
        commonErrors: ['Integrar en $u$ y evaluar con los límites de $x$.', 'Olvidar compensar la constante de $du$.'],
        estMinutes: level === 3 ? 5 : 7,
      }
      if (level === 3) return make({ ...meta, level: 3, levelWhy: 'Nivel Analista: sustitución con cambio de límites.' }, { kind: 'numeric', answer: c.val, answerText: c.valText, tol: { rel: 1e-6 } })
      return make({ ...meta, level: 4, levelWhy: 'Nivel Experto: hay que justificar cada parte del cambio de variable (nuevos límites y valor).', prompt: meta.prompt + ' Respondé por partes.' }, { kind: 'multi', parts: [
        { label: 'a', prompt: 'Nuevo límite **inferior** (en $u$):', points: 1, kind: 'numeric', answer: c.ua, wrong: c.ua !== c.a ? [{ value: c.a, why: 'Ese es el límite en $x$; hay que calcular $u$ en ese valor.', errorTag: 'limites-sustitucion' }] : [] },
        { label: 'b', prompt: 'Nuevo límite **superior** (en $u$):', points: 1, kind: 'numeric', answer: c.ub, wrong: Math.abs(c.ub - c.b) > 1e-9 ? [{ value: c.b, why: 'Ese es el límite en $x$; hay que calcular $u$ en ese valor.', errorTag: 'limites-sustitucion' }] : [] },
        { label: 'c', prompt: 'Valor de la integral:', points: 2, kind: 'numeric', answer: c.val, answerText: c.valText, tol: { rel: 1e-6 } },
      ] })
    },
  },
  {
    id: 'i5.limitsError', area: 'integrales', unit: 'i5', title: 'Cazá el error: límites en la sustitución', levels: [3],
    gen: (r) => {
      const n = r.pick([1, 2, 3])
      // correcto: ∫_0^1 2x(x²+1)^n dx = ∫_1^2 u^n du = (2^{n+1} − 1)/(n+1)
      const right = fracStr(2 ** (n + 1) - 1, n + 1)
      return make({
        data: { kind: 'integral', f: `2*x*(x^2 + 1)^${n}`, a: 0, b: 1 },
        subtopic: 'Sustitución en integrales definidas', concepts: ['i5.sustitucion', 'i7.barrow'], level: 3, levelWhy: 'Nivel Analista: detectar el error más común de la sustitución en integrales definidas.',
        prompt: `Un estudiante calculó $\\int_0^1 2x\\,(x^2 + 1)^{${n}}\\,dx$ así. ¿Dónde está el primer error?`,
        hints: ['Revisá qué valores toma $u = x^2 + 1$ cuando $x$ va de 0 a 1.', 'En el paso 2 el integrando ya está en $u$: ¿los límites también?'],
        solution: [{ text: `El paso 2 conserva los límites de $x$ (0 y 1). Con $u = x^2 + 1$: $x = 0 \\Rightarrow u = 1$ y $x = 1 \\Rightarrow u = 2$. Lo correcto es $\\int_1^2 u^{${n}}\\,du = \\frac{2^{${n + 1}} - 1}{${n + 1}} = ${T(right)}$.` }],
        explanation: 'El cambio de variable cambia **todo**: el integrando, el diferencial y los límites.',
      }, { kind: 'errorStep', steps: [
        '$u = x^2 + 1$, entonces $du = 2x\\,dx$.',
        `$\\int_0^1 2x\\,(x^2 + 1)^{${n}}\\,dx = \\int_0^1 u^{${n}}\\,du$`,
        `$= \\left[\\frac{u^{${n + 1}}}{${n + 1}}\\right]_0^1 = \\frac{1}{${n + 1}}$`,
      ], wrongIndex: 1, ruleOptions: r.shuffle([
        { text: 'No cambió los límites de integración: en $u$ van de 1 a 2.', correct: true },
        { text: 'El diferencial está mal: $du = x\\,dx$.', why: 'Es correcto: $(x^2 + 1)\' = 2x$.' },
        { text: 'La primitiva de $u^n$ está mal calculada.', why: 'La primitiva está bien; el problema son los límites.' },
      ]), fix: { answer: right, v: 'x', domain: [0.3, 2], mode: 'exact' } })
    },
  },
]
