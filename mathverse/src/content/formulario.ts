/**
 * Simulacro de examen (formulario de Google del profe): las preguntas tal cual, con su respuesta y explicación.
 * Las que tienen imagen quedan pendientes hasta tener la imagen.
 */

export interface FOpt { t: string; ok?: boolean }
export interface FQ {
  n: number
  tema: Tema
  q: string
  opts: FOpt[]
  /** explicación en simple (markdown con $…$) */
  exp: string
  /** por qué conviene sospechar / la trampa */
  trampa?: string
  /** fórmula de la imagen (TeX) */
  tex?: string
  /** pregunta con imagen todavía no cargada */
  img?: boolean
  /** sugerencia para el campo "Otro" */
  otro?: string
}

export type Tema = 'derivada' | 'calculo' | 'integral' | 'relacion' | 'metodos' | 'calcint'
export const TEMAS: Record<Tema, { t: string; icon: string }> = {
  relacion: { t: 'Derivar vs. integrar (la cadena de oro)', icon: '🔗' },
  derivada: { t: 'Qué es la derivada', icon: '📈' },
  calculo: { t: 'Calcular derivadas', icon: '🧮' },
  integral: { t: 'Qué es la integral', icon: '🧱' },
  metodos: { t: 'Métodos de integración', icon: '🛠️' },
  calcint: { t: 'Calcular integrales (V o F)', icon: '✍️' },
}

const VF = (v: boolean, tercera = 'Los opciones de arriba son ciertas.'): FOpt[] => [{ t: 'Verdadero', ok: v }, { t: 'Falso', ok: !v }, { t: tercera }]
const VFN = (v: boolean): FOpt[] => [{ t: 'Verdadero', ok: v }, { t: 'Falso', ok: !v }, { t: 'Ninguna de las opciones es correcta' }]

const Q = 'Elegir la respuesta o las respuestas que considere correctas para el enunciado.'

const CADENA = 'Cadena de oro: **derivable ⇒ continua ⇒ integrable** (en un intervalo $[a, b]$). Las flechas **no** valen al revés.'

export const FORM: FQ[] = [
  /* ---------- derivar vs. integrar ---------- */
  { n: 1, tema: 'relacion', q: 'Una función integrable es derivable para todo su dominio.', opts: VF(false),
    exp: `**Falso.** ${CADENA} Contraejemplo: $f(x) = |x|$ es integrable (tiene área) pero en $x = 0$ tiene un pico, así que no es derivable ahí.`,
    trampa: 'Es la cadena dada vuelta: integrable **no** implica derivable.' },
  { n: 2, tema: 'relacion', q: 'Una función   derivable es    integrable para todo su dominio.', opts: VF(false),
    exp: '**Falso** (tomando "todo su dominio" en serio). En cada intervalo cerrado $[a, b]$ sí es integrable (derivable ⇒ continua ⇒ integrable). Pero si el dominio es infinito no alcanza: $f(x) = x$ es derivable en todo $\\mathbb{R}$ y $\\int_{-\\infty}^{\\infty} x\\,dx$ no existe.',
    trampa: 'El profe separa "todo su dominio" (pregunta 12) de "parte de su dominio" (pregunta 13). Si tenés dudas, usá **Otro** y escribí: "En cada intervalo [a, b] sí; en todo ℝ no necesariamente (integral impropia)".',
    otro: 'En cada intervalo cerrado [a, b] sí (derivable ⇒ continua ⇒ integrable); en todo un dominio infinito no necesariamente: f(x) = x en ℝ.' },
  { n: 12, tema: 'relacion', q: 'Una función derivable en todo su dominio es integrable en todo su dominio.', opts: VF(false),
    exp: '**Falso.** Contraejemplo: $f(x) = x$ es derivable en todo $\\mathbb{R}$, pero $\\int_{-\\infty}^{+\\infty} x\\,dx$ no existe (la integral en un intervalo infinito es impropia y puede no dar un número).',
    otro: 'Es integrable en cada intervalo cerrado [a, b] del dominio, pero no necesariamente en todo el dominio si es infinito (ej.: f(x) = x).' },
  { n: 13, tema: 'relacion', q: 'Una función derivable en todo su dominio es integrable en parte de su dominio.', opts: VF(true),
    exp: '**Verdadero.** En cualquier pedazo cerrado $[a, b]$ del dominio es integrable: derivable ⇒ continua ⇒ integrable.' },
  { n: 3, tema: 'relacion', q: 'La derivada es una  acumulación   y la integración una variación  .', opts: VF(false),
    exp: '**Falso:** está al revés. La derivada es una **variación** (cuánto cambia, como la velocidad) y la integral una **acumulación** (cuánto se juntó, como la distancia recorrida).', trampa: 'Leé despacio: son las mismas palabras que la pregunta 4, pero cambiadas de lugar.' },
  { n: 4, tema: 'relacion', q: 'La derivada es una variación y la integración una acumulación.', opts: VF(true),
    exp: '**Verdadero.** Derivada = tasa de cambio (variación). Integral = suma de aportes (acumulación).' },
  { n: 14, tema: 'relacion', q: 'Si una función f es integrable con Primitiva F+C (constante de integración), existe la derivada de F y de C.', opts: VF(true),
    exp: '**Verdadero.** Que $F$ sea primitiva de $f$ quiere decir justamente que $F$ es derivable y $F\' = f$. Y $C$ es una constante: su derivada existe y vale 0.' },

  /* ---------- qué es la derivada ---------- */
  { n: 7, tema: 'derivada', q: 'La derivada se calcula en un punto.', opts: [{ t: 'Falso' }, { t: 'Verdadero', ok: true }, { t: 'Los opciones de arriba son ciertas.' }],
    exp: '**Verdadero.** $f\'(x_0) = \\lim_{\\Delta x \\to 0}\\frac{f(x_0 + \\Delta x) - f(x_0)}{\\Delta x}$ es un límite **en el punto** $x_0$.', trampa: 'Ojo: acá "Falso" está primero y "Verdadero" segundo.' },
  { n: 8, tema: 'derivada', q: 'La derivada se calcula en un intervalo .', opts: VF(false),
    exp: '**Falso.** La que usa un intervalo es la **tasa de variación media** $\\frac{f(b) - f(a)}{b - a}$. La derivada es su límite cuando el intervalo se achica a un punto.' },
  { n: 43, tema: 'derivada', q: 'La derivada de una función es el cálculo de un límite.', opts: VFN(true),
    exp: '**Verdadero.** Es el límite del cociente incremental: $f\'(x) = \\lim_{\\Delta x \\to 0}\\frac{f(x + \\Delta x) - f(x)}{\\Delta x}$.' },
  { n: 35, tema: 'derivada', q: 'La derivada de una función representa la variación de la función respecto a la variable independiente.', opts: [{ t: 'Falso' }, { t: 'Verdadero', ok: true }, { t: 'Representa la variación de la función con respecto a la variable independiente.', ok: true }, { t: 'Ninguna de las opciones es correcta' }],
    exp: '**Verdadero**, y la tercera opción dice lo mismo con otras palabras, así que también es correcta: marcá **las dos**. La derivada mide cuánto cambia $y = f(x)$ cuando cambia $x$ (la variable independiente).', trampa: 'Pregunta de varias respuestas: hay dos opciones correctas.' },
  { n: 36, tema: 'derivada', q: 'La derivada de una función es el valor de la pendiente de la recta secante.', opts: [{ t: 'Verdadero' }, { t: 'La recta secante da la variación de la constante que contenga la función.' }, { t: 'Ninguna de las opciones es correcta', ok: true }],
    exp: 'Es **falso**, pero no hay opción "Falso": la respuesta es **"Ninguna de las opciones es correcta"** (o "Otro" con la aclaración). La derivada es la pendiente de la recta **tangente**. La secante (que corta la curva en dos puntos) da la variación **media**; la tangente es el límite de las secantes cuando los dos puntos se juntan.',
    trampa: 'Secante ≠ tangente. Y fijate que no hay opción "Falso".', otro: 'Falso: es la pendiente de la recta tangente (el límite de las pendientes de las secantes).' },
  { n: 45, tema: 'derivada', q: 'Una función es derivable si es  continua en el punto de interés como única condición.', opts: VFN(false),
    exp: '**Falso.** Continua no alcanza: $|x|$ es continua en $0$ y no es derivable (tiene un pico: las pendientes por izquierda y por derecha son $-1$ y $1$). La continuidad es **necesaria** pero no **suficiente**.' },
  { n: 44, tema: 'derivada', q: 'La derivada de una función del tipo F(x) = f(x) * g(x) puede resolverse si y sólo si f(x) y g(x) son derivables.', opts: VFN(false),
    exp: '**Falso**, por el "si y sólo si". Si $f$ y $g$ son derivables, el producto es derivable (regla del producto: $(fg)\' = f\'g + fg\'$): esa ida vale. Pero la vuelta no: $f(x) = |x|$ y $g(x) = |x|$ no son derivables en 0, y su producto $|x|\\cdot|x| = x^2$ sí lo es.',
    trampa: '"Si y sólo si" pide que valgan **las dos** direcciones. Con que una falle, es falso.' },

  /* ---------- calcular derivadas ---------- */
  { n: 37, tema: 'calculo', q: 'La derivada de una función constante , F(x) = C, C es una contante, es dF/dx = 0', opts: VFN(true),
    exp: '**Verdadero.** Una constante no cambia: su gráfico es una recta horizontal y su pendiente es 0.' },
  { n: 38, tema: 'calculo', q: 'La derivada de una función constante , F(x) = C, C es una contante, es dF/dx = (C-C)', opts: VFN(true),
    exp: '**Verdadero.** $C - C = 0$, así que es lo mismo que decir $\\frac{dF}{dx} = 0$. Está escrito "disfrazado".', trampa: 'Parece raro, pero $(C - C)$ vale 0.' },
  { n: 39, tema: 'calculo', q: 'La derivada de la función, F(x) = 4 x +C, C es una contante, es dF/dx = 4', opts: VFN(true),
    exp: '**Verdadero.** $(4x)\' = 4$ y $(C)\' = 0$. Total: $4$.' },
  { n: 40, tema: 'calculo', q: 'La derivada de la función, F(x) = 6 sen x + 2 cos x es dF/dx = 2 * (3 cos x - sen x)', opts: VFN(true),
    exp: '**Verdadero.** $(\\operatorname{sen} x)\' = \\cos x$ y $(\\cos x)\' = -\\operatorname{sen} x$. Entonces $F\'(x) = 6\\cos x - 2\\operatorname{sen} x$. Sacando factor común 2: $2(3\\cos x - \\operatorname{sen} x)$. ✓' },
  { n: 41, tema: 'calculo', q: 'La derivada de la función, F(x) = 6 sen x + 2 cos x es dF/dx = (-2) * (sen x -3 cos x)', opts: VFN(true),
    exp: '**Verdadero.** Distribuí: $(-2)(\\operatorname{sen} x - 3\\cos x) = -2\\operatorname{sen} x + 6\\cos x$, que es exactamente $F\'(x) = 6\\cos x - 2\\operatorname{sen} x$. Es la misma derivada, con factor común $-2$.',
    trampa: 'Parece distinta a la de la pregunta 40, pero si distribuís da lo mismo. ¡Siempre distribuí antes de decidir!' },
  { n: 42, tema: 'calculo', q: 'La función, F(x) = 3 ln x + 2 cos x tiene por dF/dx = 3/x -2 sen x', opts: VFN(true),
    exp: '**Verdadero.** $(\\ln x)\' = \\frac1x$, así que $(3\\ln x)\' = \\frac3x$. Y $(2\\cos x)\' = -2\\operatorname{sen} x$. Total: $\\frac3x - 2\\operatorname{sen} x$.' },

  /* ---------- qué es la integral ---------- */
  { n: 5, tema: 'integral', q: 'La integración de una función continua es evaluada en un intervalo.', opts: VF(true),
    exp: '**Verdadero.** La integral definida $\\int_a^b f(x)\\,dx$ se evalúa en el intervalo $[a, b]$ y da un número (con Barrow: $F(b) - F(a)$).' },
  { n: 6, tema: 'integral', q: 'La integración de una función continua es evaluada en un punto.', opts: VF(false),
    exp: '**Falso.** En un solo punto no hay ancho: $\\int_a^a f(x)\\,dx = 0$ siempre. La integral necesita un intervalo. (La que se evalúa en un punto es la derivada.)' },
  { n: 9, tema: 'integral', q: 'La integral es un límite de una suma.', opts: VF(true),
    exp: '**Verdadero.** Es el límite de las sumas de Riemann: $\\int_a^b f = \\lim_{n\\to\\infty}\\sum f(x_i)\\,\\Delta x_i$ (rectángulos cada vez más finitos).' },
  { n: 10, tema: 'integral', q: 'La suma de dos integrales no es la integral de la suma.', opts: VF(false),
    exp: '**Falso.** Sí lo es (linealidad): $\\int f + \\int g = \\int (f + g)$.', trampa: 'Es la pregunta 11 con un "no" agregado.' },
  { n: 11, tema: 'integral', q: 'La suma de dos integrales es la integral de la suma.', opts: VF(true),
    exp: '**Verdadero** (linealidad): $\\int f + \\int g = \\int (f + g)$. Ojo: con el **producto** no vale: $\\int f\\cdot g \\neq \\int f\\cdot\\int g$.' },
  { n: 34, tema: 'integral', q: 'La integral de una función representa el área bajo su curva.', opts: [{ t: 'Falso' }, { t: 'Verdadero', ok: true }, { t: 'Representa la variación de la función con respecto a la variable independiente.' }, { t: 'Ninguna de las opciones es correcta' }],
    exp: '**Verdadero** (la idea que se pide). Detalle fino: es el área si $f \\ge 0$; si la función pasa por debajo del eje, esas partes restan (es un área **con signo**). La tercera opción describe a la **derivada**, no a la integral.' },
  { n: 33, tema: 'integral', q: 'La integral de una función no representa el área bajo su curva.', opts: [{ t: 'Falso', ok: true }, { t: 'Verdadero' }, { t: 'Representa la variación de la función con respecto a la variable independiente.' }, { t: 'Ninguna de las opciones es correcta' }],
    exp: '**Falso:** la integral sí representa el área bajo la curva (con signo). Es la pregunta 34 con un "no" agregado.' },

  /* ---------- métodos ---------- */
  { n: 28, tema: 'metodos', q: 'El método de descomposición en fracciones simples es un método de resolución de integrales.', opts: [{ t: 'Falso' }, { t: 'Verdadero', ok: true }, { t: 'Este método sirve para calcular funciones trigonométricas.' }, { t: 'En la materia lo vimos como una solución para escribir poesías.' }, { t: 'Ninguna de las opciones es correcta' }],
    exp: '**Verdadero.** Sirve para integrar cocientes de polinomios, por ejemplo $\\int\\frac{dx}{x^2 - 4} = \\int\\left(\\frac{1/4}{x - 2} - \\frac{1/4}{x + 2}\\right)dx$.' },
  { n: 30, tema: 'metodos', q: 'El método de cambio de variable  es un método de resolución de integrales.', opts: [{ t: 'Falso' }, { t: 'Verdadero', ok: true }, { t: 'Este método sirve para calcular funciones trigonométricas.' }, { t: 'En la materia lo vimos como una solución para escribir novelas.' }, { t: 'Ninguna de las opciones es correcta' }, { t: 'El método de cambio de variables el libro de Ayres lo presenta, entre otras, para resolver integrales de funciones trigonométricas.', ok: true }],
    exp: '**Verdadero**, y la última opción también es cierta: el libro de Ayres (Schaum) usa el cambio de variable, entre otras cosas, para integrales trigonométricas, como $\\int\\operatorname{sen}^n x\\cos x\\,dx$ con $u = \\operatorname{sen} x$. Marcá **las dos**. "Sirve para calcular funciones trigonométricas" es falsa: sirve para **integrar**, no para calcular el seno o el coseno.',
    trampa: 'Pregunta de varias respuestas.' },
  { n: 29, tema: 'metodos', q: 'El método de cambio de variable no es un método de resolución de integrales.', opts: [{ t: 'Falso', ok: true }, { t: 'Verdadero' }, { t: 'Este método sirve para calcular funciones trigonométricas.' }, { t: 'En la materia lo vimos como una solución para escribir poesías.' }, { t: 'Ninguna de las opciones es correcta' }],
    exp: '**Falso:** sí es un método de integración (la pregunta 30 con un "no").' },
  { n: 31, tema: 'metodos', q: 'El método de integración por partes  es un método de resolución de integrales que resulta muy útil para la integración de productos en el integrando.', opts: [{ t: 'Falso' }, { t: 'Verdadero', ok: true }, { t: 'Este método sirve para calcular funciones trigonométricas.' }, { t: 'En la materia lo vimos como una solución para escribir novelas.' }, { t: 'Ninguna de las opciones es correcta' }, { t: 'El método de cambio de variables el libro de Ayres lo presenta, entre otras, para resolver integrales de funciones trigonométricas.' }, { t: 'Permite resolver integrales con integrandos del tipo ( y Cos(y) )', ok: true }],
    exp: '**Verdadero**, y también es correcta la última: $\\int y\\cos y\\,dy$ sale por partes ($u = y$, $dv = \\cos y\\,dy$): $y\\operatorname{sen} y + \\cos y + C$. Marcá **las dos**. La opción del Ayres habla del **cambio de variable**, no de partes, así que no responde a este enunciado.',
    trampa: 'Varias respuestas. Ojo con la opción que es cierta, pero habla de otro método.' },
  { n: 32, tema: 'metodos', q: 'El método de integración por partes no  es un método de resolución de integrales ya que resulta inútil para la integración de productos en el integrando.', opts: [{ t: 'Falso', ok: true }, { t: 'Verdadero' }, { t: 'Este método no sirve para calcular funciones trigonométricas.' }, { t: 'En la materia lo vimos como una solución para escribir novelas.' }, { t: 'Ninguna de las opciones es correcta' }],
    exp: '**Falso:** partes sí es un método, y justamente sirve para productos: $\\int u\\,dv = uv - \\int v\\,du$.' },

  /* ---------- calcular integrales (preguntas con imagen) ---------- */
  { n: 16, tema: 'calcint', q: Q, tex: '\\int (a + x)^3\\,dx = \\tfrac{1}{4}(a + x)^4 + C', opts: [{ t: 'Verdadero', ok: true }, { t: 'Falso' }, { t: 'Los opciones de arriba están escritas en inglés.' }],
    exp: '**Verdadero.** Cambio de variable $u = a + x$, $du = dx$: $\\int u^3\\,du = \\frac{u^4}{4} + C = \\frac14(a + x)^4 + C$. Control derivando: $\\left(\\frac14(a + x)^4\\right)\' = \\frac14\\cdot 4(a + x)^3 = (a + x)^3$ ✓' },
  { n: 17, tema: 'calcint', q: Q, tex: '\\int_0^{2\\pi}\\operatorname{sen}\\tfrac12 t\\,dt =', opts: [{ t: 'El resultado no es 5.', ok: true }, { t: 'El resultado es mayor a 3 y menor a 16.', ok: true }, { t: 'Los opciones de arriba están escritas en francés.' }, { t: 'El resultado es 4.', ok: true }],
    exp: 'Da **4**, así que son correctas **tres** opciones: "no es 5", "mayor a 3 y menor a 16" y "es 4". Cuenta: con $u = \\frac t2$, $dt = 2\\,du$, la primitiva es $-2\\cos\\frac t2$. Barrow: $-2\\cos\\pi - (-2\\cos 0) = -2(-1) + 2 = 4$.',
    trampa: 'Varias respuestas: todas las que dicen algo cierto del 4 cuentan.' },
  { n: 18, tema: 'calcint', q: Q, tex: '0\\cdot\\int_0^{2\\pi}\\operatorname{sen}\\tfrac12 t\\,dt = 0', opts: [{ t: 'El resultado es 0 (cero)', ok: true }, { t: 'Verdadero', ok: true }, { t: 'Los opciones de arriba NO son ciertas.' }, { t: 'No es 0 es det(C) = 5' }, { t: 'Falso' }, { t: 'Es verdadero porque toda multiplicación por cero da cero.', ok: true }],
    exp: '**Verdadero.** La integral vale 4 (es la pregunta 17), y $0\\cdot 4 = 0$. Son correctas **tres** opciones: "el resultado es 0", "Verdadero" y "es verdadero porque toda multiplicación por cero da cero". Lo de $\\det(C)$ no tiene nada que ver: es de matrices.',
    trampa: 'Varias respuestas. Y hay opciones de relleno que hablan de matrices.' },
  { n: 19, tema: 'calcint', q: Q, tex: '\\int_0^2 (2 - x)^2\\,dx = \\tfrac{8}{3}', opts: [{ t: 'Falso' }, { t: 'Verdadero', ok: true }, { t: 'Los opciones de arriba son ciertas.' }, { t: 'No es 0 es det(C) = 5' }],
    exp: '**Verdadero.** Desarrollo: $(2 - x)^2 = 4 - 4x + x^2$. Primitiva: $4x - 2x^2 + \\frac{x^3}{3}$. En 2: $8 - 8 + \\frac83 = \\frac83$. En 0: 0. Resultado $\\frac83$ ✓. (Otro camino: $u = 2 - x$ da $\\left[-\\frac{(2 - x)^3}{3}\\right]_0^2 = 0 + \\frac83$.)' },
  { n: 20, tema: 'calcint', q: Q, tex: '4\\cdot\\int_0^2 (2 - x)^2\\,dx = \\tfrac{32}{9}', opts: [{ t: 'Falso', ok: true }, { t: 'Verdadero' }, { t: 'Todas las opciones de abajo son ciertas' }, { t: 'Todas lasopciones de arriba son ciertas.' }, { t: 'No es 32/9 la respuesta', ok: true }, { t: 'El resultado de la integral es 64/9' }],
    exp: '**Falso.** La integral vale $\\frac83$ (pregunta 19), y $4\\cdot\\frac83 = \\frac{32}{3}$, no $\\frac{32}{9}$. Son correctas **dos**: "Falso" y "No es 32/9 la respuesta". "64/9" también es falsa, así que "todas las de abajo son ciertas" no vale.',
    trampa: 'Es fácil confundir $\\frac{32}{3}$ con $\\frac{32}{9}$: el 4 multiplica al numerador, no cambia el denominador.' },
  { n: 21, tema: 'calcint', q: Q, tex: '\\int_1^1 x^2\\sqrt{4 - x^2}\\,dx = 0', opts: [{ t: 'Verdadero', ok: true }, { t: 'Falso' }, { t: 'Los opciones de arriba son 1/8 de ciertas.' }, { t: 'No es 0, el resultado correcto es 4 * det(B) = -12' }],
    exp: '**Verdadero.** Los límites son iguales (de 1 a 1): no hay ancho, no hay área. $\\int_a^a f = 0$ siempre, sin importar la función.' },
  { n: 22, tema: 'calcint', q: Q, tex: '\\int_2^2 \\sqrt{1 + 3x}\\,dx = 26', opts: [{ t: 'Verdadero' }, { t: 'Falso', ok: true }, { t: 'Los opciones de arriba son 1/8 de ciertas.' }, { t: 'El resultado de la integral es igual al resultado de la cuenta (9-9). Debe leerse "nueve menos nueve".', ok: true }],
    exp: '**Falso:** los límites son iguales (de 2 a 2), así que da **0**, no 26. Y la opción de "$9 - 9$" también es correcta, porque $9 - 9 = 0$. Marcá **las dos**.',
    trampa: 'Es la misma función que la pregunta 23, pero con los límites iguales.' },
  { n: 23, tema: 'calcint', q: Q, tex: '\\int_1^8 \\sqrt{1 + 3x}\\,dx = 26', opts: [{ t: 'Falso' }, { t: 'Verdadero', ok: true }, { t: 'No, el resultado correcto es 54' }, { t: 'El resultado de la integral es mayor a 15', ok: true }],
    exp: '**Verdadero.** Cambio $u = 1 + 3x$, $du = 3\\,dx$. Límites: $x = 1 \\to u = 4$, $x = 8 \\to u = 25$. $\\frac13\\int_4^{25} u^{1/2}\\,du = \\frac13\\cdot\\frac23\\left[u^{3/2}\\right]_4^{25} = \\frac29(125 - 8) = \\frac29\\cdot 117 = 26$ ✓. Como $26 > 15$, "mayor a 15" también es correcta: marcá **las dos**.' },
  { n: 24, tema: 'calcint', q: Q, tex: '\\int_{-1}^{2} (1 - t^2)\\,t\\,dt = -\\tfrac{9}{4}', opts: [{ t: 'Verdadero', ok: true }, { t: 'Falso' }],
    exp: '**Verdadero.** Primero distribuyo: $(1 - t^2)\\,t = t - t^3$. Primitiva: $\\frac{t^2}{2} - \\frac{t^4}{4}$. En 2: $2 - 4 = -2$. En $-1$: $\\frac12 - \\frac14 = \\frac14$. Resto: $-2 - \\frac14 = -\\frac94$ ✓.' },
  { n: 25, tema: 'calcint', q: Q, tex: '\\int_{-1}^{2} (1 - t^2)\\,t\\,dt = -\\tfrac{18}{8}', opts: [{ t: 'Falso' }, { t: 'Verdadero', ok: true }, { t: 'Los sistemas de ecuaciones lineales no pueden representarse por matrices.' }, { t: 'La matriz A es correcta.' }],
    exp: '**Verdadero.** Da $-\\frac94$ (pregunta 24), y $-\\frac{18}{8}$ simplificado (dividiendo por 2) es $-\\frac94$. Es el mismo número escrito sin simplificar.',
    trampa: 'Siempre simplificá la fracción antes de decir "falso".' },
  { n: 26, tema: 'calcint', q: Q, tex: '\\int \\operatorname{sen}\\sqrt{x}\\,dx = -2\\sqrt{x}\\cos\\sqrt{x} + 2\\operatorname{sen}\\sqrt{x} + C', opts: [{ t: 'Falso' }, { t: 'Verdadero', ok: true }, { t: 'Las integrales de funciones trigonométrica dan por resultado funciones lineale.' }],
    exp: '**Verdadero.** Con $u = \\sqrt x$ ($dx = 2u\\,du$) queda $2\\int u\\operatorname{sen} u\\,du$, y por partes: $2(-u\\cos u + \\operatorname{sen} u) = -2\\sqrt x\\cos\\sqrt x + 2\\operatorname{sen}\\sqrt x + C$ ✓. (Está explicado completo en el video del ejercicio 11.)' },
  { n: 27, tema: 'calcint', q: Q, tex: '\\int \\operatorname{sen}\\sqrt{x}\\,dx = 2\\sqrt{x}\\cos\\sqrt{x} + 2\\operatorname{sen}\\sqrt{x} + C', opts: [{ t: 'Falso', ok: true }, { t: 'Verdadero' }],
    exp: '**Falso.** Es la pregunta 26 con el primer signo cambiado: lo correcto es $-2\\sqrt x\\cos\\sqrt x$. Si derivás lo propuesto, no vuelve $\\operatorname{sen}\\sqrt x$.', trampa: 'Compará con la 26: cambia un solo signo.' },
  { n: 15, tema: 'calcint', img: true, q: Q + ' (Falta la imagen de esta pregunta.)', opts: [{ t: 'Verdadero' }, { t: 'Falso' }, { t: 'Los opciones de arriba son ciertas.' }], exp: '' },
]

/** Valores de las integrales (para el control automático en las pruebas). */
export const INT_CHECKS: { n: number; f: string; a: number; b: number; value: number }[] = [
  { n: 17, f: 'sin(x/2)', a: 0, b: 2 * Math.PI, value: 4 },
  { n: 19, f: '(2-x)^2', a: 0, b: 2, value: 8 / 3 },
  { n: 20, f: '4*(2-x)^2', a: 0, b: 2, value: 32 / 3 },
  { n: 23, f: 'sqrt(1+3*x)', a: 1, b: 8, value: 26 },
  { n: 24, f: '(1-x^2)*x', a: -1, b: 2, value: -9 / 4 },
]
