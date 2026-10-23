import type { Unit } from '../types'

const A = 'derivadas' as const

export const DERIVADAS_UNITS: Unit[] = [
  {
    id: 'd1', area: A, n: 1, title: 'Tasa de cambio', short: 'Qué tan rápido cambia algo', prereqs: ['f3'], concepts: ['d1.tasa', 'd1.tangente'],
    lesson: {
      hook: { question: 'Hiciste 120 km en 2 horas. ¿Eso significa que el velocímetro marcó 60 km/h todo el viaje?', reveal: 'No: 60 km/h es la velocidad **media**. En cada instante el velocímetro marcaba otra cosa (la velocidad **instantánea**). La derivada es justamente esa velocidad instantánea, para cualquier función.' },
      intuition: [
        'La **tasa de variación media** de $f$ entre $a$ y $b$ es $\\frac{f(b) - f(a)}{b - a}$: cuánto cambió $f$ por cada unidad de $x$. Geométricamente, es la pendiente de la recta **secante** que une los dos puntos.',
        'Si acercás $b$ a $a$, el intervalo se achica y la secante gira hasta convertirse en la recta **tangente**. Su pendiente es la tasa de cambio **instantánea**: la derivada.',
        'Moraleja: **la derivada es una pendiente**. Dice qué tan empinada está la curva en cada punto.',
      ],
      visual: { widget: { type: 'secant', f: 'x^2', x0: 1, x: [-2, 4], y: [-1, 9] }, caption: 'Achicá h y mirá cómo la secante (punteada) se convierte en la tangente.', tasks: ['¿A qué valor se acerca la pendiente de la secante?', 'Cambiá el punto x₀ y repetí.'] },
      theory: [
        { title: 'Tasa de variación media', text: '', formulas: ['\\text{TVM}_{[a, b]} = \\frac{f(b) - f(a)}{b - a}'] },
        { title: 'Tasa instantánea (derivada)', text: '', formulas: ["f'(a) = \\lim_{b\\to a}\\frac{f(b) - f(a)}{b - a}"] },
      ],
      example: { prompt: 'TVM de $f(x) = x^2$ en $[1, 3]$.', steps: [{ text: '', tex: '\\frac{f(3) - f(1)}{3 - 1} = \\frac{9 - 1}{2} = 4' }, { text: 'En promedio, $f$ sube 4 por cada unidad de $x$ en ese tramo.' }] },
      summary: ['TVM = pendiente de la secante.', 'Derivada = pendiente de la tangente = tasa instantánea.'],
      pitfalls: ['Olvidar dividir por $b - a$.'],
      game: 'lab',
    },
  },
  {
    id: 'd2', area: A, n: 2, title: 'Definición de derivada', short: 'El límite del cociente incremental', prereqs: ['d1', 'f10'], concepts: ['d2.definicion', 'd2.derivable'],
    lesson: {
      hook: { question: 'Si $h$ es "casi cero", ¿cuánto vale $\\frac{(1 + h)^2 - 1}{h}$?', reveal: 'Reemplazar $h = 0$ da $\\frac00$. Pero simplificando: $\\frac{2h + h^2}{h} = 2 + h \\to 2$. Ese límite es $f\'(1)$ para $f(x) = x^2$: la definición de derivada.' },
      intuition: [
        'La derivada en $x$ es el límite del **cociente incremental** $\\frac{f(x + h) - f(x)}{h}$ cuando $h \\to 0$.',
        'Siempre aparece $\\frac00$ al reemplazar: hay que desarrollar, simplificar la $h$ y recién después tomar el límite.',
        'Si el límite no existe (picos, saltos, tangentes verticales), la función **no es derivable** ahí. Derivable implica continua, pero no al revés.',
      ],
      visual: { widget: { type: 'tangent', f: 'abs(x - 1) + 1', x0: 1, x: [-2, 4], y: [-1, 4] }, caption: 'En un pico no hay una única recta tangente: por izquierda la pendiente es −1 y por derecha 1.', tasks: ['Mové el punto lejos del pico: ahí sí hay tangente.'] },
      theory: [
        { title: 'Definición', text: '', formulas: ["f'(x) = \\lim_{h\\to 0}\\frac{f(x + h) - f(x)}{h}"] },
        { title: 'Derivabilidad y continuidad', text: 'Si $f$ es derivable en $a$, entonces es continua en $a$. La recíproca es falsa ($|x|$ en 0).' },
      ],
      example: { prompt: 'Derivá $f(x) = x^2$ por definición.', steps: [{ text: '', tex: '\\frac{(x + h)^2 - x^2}{h} = \\frac{2xh + h^2}{h} = 2x + h' }, { text: '', tex: "f'(x) = \\lim_{h\\to0}(2x + h) = 2x" }] },
      summary: ['Cociente incremental → límite.', 'Simplificar antes de reemplazar.', 'Derivable ⇒ continua.'],
      pitfalls: ['Reemplazar $h = 0$ antes de simplificar.'],
      game: 'cazador',
    },
  },
  {
    id: 'd3', area: A, n: 3, title: 'Reglas básicas', short: 'Potencia, constante y suma', prereqs: ['d2'], concepts: ['d3.potencia'],
    lesson: {
      hook: { question: 'Hacer la definición cada vez es largo. ¿Hay un patrón en las derivadas de $x^2$, $x^3$, $x^4$...?', reveal: '$(x^2)\' = 2x$, $(x^3)\' = 3x^2$, $(x^4)\' = 4x^3$: **el exponente baja adelante y se le resta 1**. Esa es la regla de la potencia.' },
      intuition: [
        'Regla de la potencia: $(x^n)\' = n x^{n-1}$. Vale para cualquier exponente: negativos, fracciones, raíces.',
        'Las constantes multiplicativas "esperan afuera": $(5x^3)\' = 5\\cdot 3x^2$.',
        'La derivada de una suma es la suma de las derivadas. Y la derivada de una constante es 0 (una recta horizontal no tiene pendiente).',
      ],
      visual: { widget: { type: 'derivGraph', f: 'x^3 - 3*x', x: [-3, 3], y: [-5, 5] }, caption: 'Arriba f, abajo f\'. Donde f tiene pendiente 0, f\' corta el eje.', tasks: ['Ubicá dónde f crece y mirá el signo de f\'.'] },
      theory: [
        { title: 'Reglas', text: '', formulas: ["(k)' = 0", "(x^n)' = n\\,x^{n-1}", "(k\\,f)' = k\\,f'", "(f \\pm g)' = f' \\pm g'"] },
        { title: 'Reescribir antes de derivar', text: '', formulas: ['\\sqrt{x} = x^{1/2}', '\\frac{1}{x^n} = x^{-n}', '\\sqrt[m]{x^n} = x^{n/m}'] },
      ],
      example: { prompt: 'Derivá $f(x) = 4x^3 - \\frac{2}{x} + \\sqrt x$.', steps: [{ text: 'Reescribimos:', tex: '4x^3 - 2x^{-1} + x^{1/2}' }, { text: 'Derivamos término a término:', tex: "f'(x) = 12x^2 + 2x^{-2} + \\tfrac12 x^{-1/2} = 12x^2 + \\frac{2}{x^2} + \\frac{1}{2\\sqrt x}" }] },
      summary: ['Baja el exponente, se le resta 1.', 'Constantes sueltas: 0.', 'Reescribir raíces y fracciones.'],
      pitfalls: ['A un exponente negativo "restarle 1" lo hace más negativo.', 'Derivar $\\frac1{x^2}$ como $\\frac{1}{2x}$.'],
      game: 'fabrica',
    },
  },
  {
    id: 'd4', area: A, n: 4, title: 'Exponenciales, logaritmos y trigonométricas', short: 'La tabla de derivadas', prereqs: ['d3', 'f6', 'f7'], concepts: ['d4.tabla'],
    lesson: {
      hook: { question: '¿Existe una función que sea igual a su propia derivada (que en cada punto su pendiente sea igual a su altura)?', reveal: 'Sí: $e^x$. Por eso el número $e$ es tan importante. Y $\\ln x$, su inversa, tiene derivada $\\frac1x$.' },
      intuition: [
        '$(e^x)\' = e^x$: cuanto más alta, más empinada.',
        '$(\\ln x)\' = \\frac1x$: crece cada vez más despacio.',
        '$(\\operatorname{sen}x)\' = \\cos x$ y $(\\cos x)\' = -\\operatorname{sen}x$: mirá el gráfico del seno; donde está en su pico, la pendiente es 0, y ahí el coseno vale 0.',
      ],
      visual: { widget: { type: 'derivGraph', f: 'sin(x)', x: [-7, 7], y: [-2, 2] }, caption: 'La derivada del seno (abajo) tiene la forma del coseno.', tasks: ['¿Dónde la pendiente del seno es máxima?'] },
      theory: [
        { title: 'Tabla', text: '', formulas: ["(e^x)' = e^x", "(a^x)' = a^x\\ln a", "(\\ln x)' = \\frac1x", "(\\operatorname{sen}x)' = \\cos x", "(\\cos x)' = -\\operatorname{sen}x", "(\\operatorname{tg}x)' = \\frac{1}{\\cos^2 x}"] },
      ],
      example: { prompt: 'Derivá $f(x) = 3e^x - 2\\ln x + \\cos x$.', steps: [{ text: '', tex: "f'(x) = 3e^x - \\frac{2}{x} - \\operatorname{sen}x" }] },
      summary: ['$e^x$ es su propia derivada.', 'Ojo con el menos de $(\\cos x)\'$.'],
      pitfalls: ['Derivar $e^x$ como potencia: $x e^{x-1}$ (¡no!).'],
      game: 'fabrica',
    },
  },
  {
    id: 'd5', area: A, n: 5, title: 'Producto y cociente', short: 'Cuando hay funciones multiplicadas', prereqs: ['d4'], concepts: ['d5.producto', 'd5.cociente'],
    lesson: {
      hook: { question: 'El área de un rectángulo que se agranda es $A = b\\cdot h$. Si crecen la base y la altura, ¿la velocidad con que crece el área es (velocidad de b)·(velocidad de h)?', reveal: 'No: el área crece porque crece $b$ (con $h$ fija) **y** porque crece $h$ (con $b$ fija). Son dos aportes que se suman: $(bh)\' = b\'h + bh\'$.' },
      intuition: [
        'Regla del producto: $(uv)\' = u\'v + uv\'$. "Derivo el primero por el segundo sin derivar, más el primero sin derivar por la derivada del segundo".',
        'Regla del cociente: $\\left(\\frac uv\\right)\' = \\frac{u\'v - uv\'}{v^2}$. El orden del numerador importa (empieza por la derivada de arriba).',
        'Error clásico: $(uv)\' = u\'v\'$. ¡Falso! Probá con $x\\cdot x$: daría $1$, pero $(x^2)\' = 2x$.',
      ],
      visual: { widget: { type: 'derivGraph', f: 'x*sin(x)', x: [-7, 7], y: [-6, 6] }, caption: 'f(x) = x·sen x y su derivada.', tasks: ['Comprobá que f\' = sen x + x cos x evaluando en un punto.'] },
      theory: [
        { title: 'Reglas', text: '', formulas: ["(u\\,v)' = u'v + u\\,v'", "\\left(\\frac{u}{v}\\right)' = \\frac{u'v - u\\,v'}{v^2}"] },
      ],
      example: { prompt: 'Derivá $f(x) = \\dfrac{x^2}{x + 1}$.', steps: [{ text: '$u = x^2$, $u\' = 2x$; $v = x + 1$, $v\' = 1$.' }, { text: '', tex: "f'(x) = \\frac{2x(x + 1) - x^2}{(x + 1)^2} = \\frac{x^2 + 2x}{(x + 1)^2}" }] },
      summary: ['Producto: dos términos.', 'Cociente: $u\'v - uv\'$ sobre $v^2$.'],
      pitfalls: ['$(uv)\' = u\'v\'$.', 'Invertir el orden del numerador del cociente.'],
      game: 'fabrica',
    },
  },
  {
    id: 'd6', area: A, n: 6, title: 'Regla de la cadena', short: 'Derivar funciones compuestas', prereqs: ['d5', 'f9'], concepts: ['d6.cadena'],
    lesson: {
      hook: { question: 'Un engranaje A gira 3 veces más rápido que B, y B gira 2 veces más rápido que C. ¿Cuántas veces más rápido que C gira A?', reveal: '$3\\cdot 2 = 6$: las tasas de cambio **se multiplican**. Esa es la regla de la cadena.' },
      intuition: [
        'Si $f(x) = g(u(x))$ (una función "adentro" de otra), su derivada es $g\'(u(x))\\cdot u\'(x)$: derivo la de afuera **dejando lo de adentro igual**, y multiplico por la derivada de lo de adentro.',
        'Ejemplo: $(x^2 + 1)^5$. Afuera: "algo a la 5". Adentro: $x^2 + 1$. Derivada: $5(x^2 + 1)^4\\cdot 2x$.',
        'Con varias capas se aplica varias veces: de afuera hacia adentro, multiplicando todo.',
      ],
      visual: { widget: { type: 'derivGraph', f: 'sin(x^2)', x: [-3.5, 3.5], y: [-8, 8] }, caption: 'sen(x²) oscila cada vez más rápido: su derivada 2x·cos(x²) crece en amplitud por el factor 2x.', tasks: ['¿Por qué la derivada es 0 en x = 0?'] },
      theory: [
        { title: 'Regla de la cadena', text: '', formulas: ["[g(u(x))]' = g'(u(x))\\cdot u'(x)", '\\frac{dy}{dx} = \\frac{dy}{du}\\cdot\\frac{du}{dx}'] },
        { title: 'Casos frecuentes', text: '', formulas: ["[u^n]' = n u^{n-1} u'", "[e^u]' = e^u u'", "[\\ln u]' = \\frac{u'}{u}", "[\\operatorname{sen}u]' = \\cos u\\cdot u'"] },
      ],
      example: { prompt: 'Derivá $f(x) = e^{\\operatorname{sen}(3x)}$.', steps: [{ text: 'Tres capas: $e^{(\\cdot)}$, $\\operatorname{sen}(\\cdot)$, $3x$.' }, { text: '', tex: "f'(x) = e^{\\operatorname{sen}(3x)}\\cdot\\cos(3x)\\cdot 3" }] },
      summary: ['Afuera (con lo de adentro intacto) × derivada de adentro.'],
      pitfalls: ['Olvidar multiplicar por la derivada de adentro.'],
      game: 'fabrica',
    },
  },
  {
    id: 'd7', area: A, n: 7, title: 'Implícita y orden superior', short: 'Derivar sin despejar; derivar dos veces', prereqs: ['d6'], concepts: ['d7.implicita', 'd7.orden'],
    lesson: {
      hook: { question: 'La circunferencia $x^2 + y^2 = 25$ no es una función de $x$. ¿Podemos calcular igual la pendiente de su tangente en $(3, 4)$?', reveal: 'Sí, derivando **implícitamente**: tratamos a $y$ como función de $x$ y usamos la cadena. Da $y\' = -\\frac xy = -\\frac34$.' },
      intuition: [
        'Derivación implícita: se deriva todo respecto de $x$; cada vez que se deriva algo con $y$, aparece un factor $y\'$ (regla de la cadena). Después se despeja $y\'$.',
        'La **derivada segunda** $f\'\'$ es la derivada de la derivada: mide cómo cambia la pendiente. En física, si $s(t)$ es la posición, $s\'$ es la velocidad y $s\'\'$ la aceleración.',
      ],
      visual: { widget: { type: 'derivGraph', f: 'x^4 - 4*x^2', x: [-3, 3], y: [-6, 6] }, caption: 'Compará f con f\': la derivada segunda es la pendiente de f\'.', tasks: ['¿Dónde f\' tiene pendiente 0?'] },
      theory: [
        { title: 'Implícita', text: 'Ejemplo:', formulas: ["x^2 + y^2 = 25 \\Rightarrow 2x + 2y\\,y' = 0 \\Rightarrow y' = -\\frac{x}{y}"] },
        { title: 'Orden superior', text: '', formulas: ["f''(x) = (f'(x))'", 'f^{(n)}(x)'] },
      ],
      example: { prompt: 'Calculá $f\'\'$ para $f(x) = x^3 - 6x^2$.', steps: [{ text: '', tex: "f'(x) = 3x^2 - 12x, \\quad f''(x) = 6x - 12" }] },
      summary: ['Implícita: derivar ambos lados y despejar $y\'$.', '$f\'\'$ = cambio de la pendiente.'],
      pitfalls: ['Olvidar el $y\'$ al derivar términos con $y$.'],
      game: 'fabrica',
    },
  },
  {
    id: 'd8', area: A, n: 8, title: 'Recta tangente y movimiento', short: 'Aplicaciones directas', prereqs: ['d6'], concepts: ['d8.tangente', 'd8.fisica'],
    lesson: {
      hook: { question: 'Si hacés zoom muchísimas veces sobre un punto de una curva suave, ¿qué ves?', reveal: 'Una recta: la **recta tangente**. Por eso la derivada sirve para aproximar funciones complicadas por rectas cerca de un punto.' },
      intuition: [
        'La recta tangente a $f$ en $x_0$ pasa por $(x_0, f(x_0))$ y tiene pendiente $f\'(x_0)$.',
        'La normal es perpendicular a la tangente: pendiente $-\\frac{1}{f\'(x_0)}$.',
        'Si $s(t)$ es la posición, $v(t) = s\'(t)$ y $a(t) = v\'(t) = s\'\'(t)$.',
      ],
      visual: { widget: { type: 'tangent', f: 'x^3/3 - x', x0: 1.5, x: [-3, 3], y: [-3, 3] }, caption: 'Arrastrá el punto: la tangente se mueve con él. La pendiente es f\'(x₀).', tasks: ['Encontrá los puntos con tangente horizontal.'] },
      theory: [
        { title: 'Recta tangente', text: '', formulas: ["y = f(x_0) + f'(x_0)(x - x_0)"] },
        { title: 'Recta normal', text: '', formulas: ["y = f(x_0) - \\frac{1}{f'(x_0)}(x - x_0)"] },
      ],
      example: { prompt: 'Tangente a $f(x) = x^2$ en $x_0 = 3$.', steps: [{ text: '$f(3) = 9$, $f\'(x) = 2x$, $f\'(3) = 6$.' }, { text: '', tex: 'y = 9 + 6(x - 3) = 6x - 9' }] },
      summary: ['Punto: $(x_0, f(x_0))$; pendiente: $f\'(x_0)$.'],
      pitfalls: ['Usar $f(x_0)$ como pendiente.'],
      game: 'lab',
    },
  },
  {
    id: 'd9', area: A, n: 9, title: 'Crecimiento y extremos', short: 'Máximos y mínimos', prereqs: ['d8'], concepts: ['d9.crecimiento', 'd9.extremos'],
    lesson: {
      hook: { question: 'En la cima de una montaña, ¿cuánto vale la pendiente del terreno?', reveal: 'Cero: en un máximo (o mínimo) suave la tangente es horizontal. Por eso los extremos se buscan donde $f\'(x) = 0$.' },
      intuition: [
        'Si $f\' > 0$, $f$ crece; si $f\' < 0$, decrece.',
        'Los **puntos críticos** son donde $f\' = 0$ o no existe. Ahí **puede** haber un extremo.',
        'Si $f\'$ pasa de $+$ a $-$ hay un máximo; de $-$ a $+$, un mínimo; si no cambia de signo, no hay extremo (ej.: $x^3$ en 0).',
      ],
      visual: { widget: { type: 'derivGraph', f: 'x^3 - 3*x', x: [-3, 3], y: [-5, 5] }, caption: 'Los extremos de f están donde f\' cambia de signo.', tasks: ['Identificá el máximo y el mínimo de f.'] },
      theory: [
        { title: 'Criterio de la primera derivada', text: 'Analizar el signo de $f\'$ alrededor de cada punto crítico.' },
        { title: 'Criterio de la segunda derivada', text: 'Si $f\'(c) = 0$ y $f\'\'(c) < 0$: máximo; $f\'\'(c) > 0$: mínimo.' },
        { title: 'Extremos absolutos en $[a, b]$', text: 'Comparar $f$ en los puntos críticos y en los extremos del intervalo.' },
      ],
      example: { prompt: 'Extremos de $f(x) = x^3 - 3x$.', steps: [{ text: '$f\'(x) = 3x^2 - 3 = 0 \\Rightarrow x = \\pm1$.' }, { text: '$f\'\' = 6x$: $f\'\'(-1) < 0$ máximo $(-1, 2)$; $f\'\'(1) > 0$ mínimo $(1, -2)$.' }] },
      summary: ['$f\' = 0$: candidatos.', 'Cambio de signo de $f\'$: extremo.'],
      pitfalls: ['Creer que todo punto crítico es extremo.', 'Dar la abscisa cuando piden el valor.'],
      game: 'cazador',
    },
  },
  {
    id: 'd10', area: A, n: 10, title: 'Concavidad y estudio completo', short: 'La forma de la curva', prereqs: ['d9', 'f5'], concepts: ['d10.concavidad'],
    lesson: {
      hook: { question: 'Dos autos aceleran: uno cada vez más rápido y otro cada vez más despacio. Si graficás la posición, ¿en qué se diferencian las curvas?', reveal: 'Una se curva hacia arriba (cóncava hacia arriba, $f\'\' > 0$) y la otra hacia abajo ($f\'\' < 0$). El punto donde cambia la curvatura es un **punto de inflexión**.' },
      intuition: [
        '$f\'\' > 0$: la pendiente aumenta, la curva tiene forma de "taza" (cóncava hacia arriba).',
        '$f\'\' < 0$: la pendiente disminuye, forma de "gorro" (cóncava hacia abajo).',
        'El **estudio completo** junta todo: dominio, asíntotas, ceros, crecimiento, extremos, concavidad e inflexión, para dibujar la función con precisión.',
      ],
      visual: { widget: { type: 'derivGraph', f: 'x^3 - 3*x^2 + 1', x: [-2, 4], y: [-5, 5] }, caption: 'La inflexión está donde la pendiente de f deja de bajar y empieza a subir.', tasks: ['Ubicá el punto de inflexión (x = 1).'] },
      theory: [
        { title: 'Concavidad', text: '$f\'\' > 0$ en $I$ ⇒ cóncava hacia arriba en $I$; $f\'\' < 0$ ⇒ hacia abajo.' },
        { title: 'Punto de inflexión', text: 'Punto **del dominio** donde $f$ es continua y cambia la concavidad.' },
        { title: 'Pasos del estudio completo', text: '1) Dominio. 2) Asíntotas. 3) Ceros. 4) $f\'$: crecimiento y extremos. 5) $f\'\'$: concavidad e inflexión. 6) Gráfico.' },
      ],
      example: { prompt: 'Concavidad de $f(x) = x^3 - 3x^2 + 1$.', steps: [{ text: '$f\'\'(x) = 6x - 6$: negativa para $x < 1$, positiva para $x > 1$.' }, { text: 'Inflexión en $(1, f(1)) = (1, -1)$.' }] },
      summary: ['$f\'\'$ decide la concavidad.', 'Inflexión: cambio de concavidad dentro del dominio.'],
      pitfalls: ['Poner inflexión donde $f\'\' = 0$ sin cambio de signo ($x^4$).', 'Poner inflexión en una asíntota vertical.'],
      game: 'arena',
    },
  },
  {
    id: 'd11', area: A, n: 11, title: "Optimización y L'Hôpital", short: 'Problemas reales y límites difíciles', prereqs: ['d10'], concepts: ['d11.optimizacion', 'd11.lhopital'],
    lesson: {
      hook: { question: 'Con 40 m de alambre, ¿qué rectángulo encierra la mayor área?', reveal: 'Planteando $A(x) = x(20 - x)$ y buscando dónde $A\'(x) = 0$: un cuadrado de 10×10. Optimizar es encontrar extremos de funciones que salen de un problema.' },
      intuition: [
        'Para optimizar: 1) elegir variables, 2) escribir lo que se quiere maximizar/minimizar, 3) usar la restricción para dejarlo en **una** variable, 4) derivar e igualar a 0, 5) verificar que sea máximo/mínimo y que tenga sentido.',
        "La regla de **L'Hôpital** resuelve límites $\\frac00$ o $\\frac\\infty\\infty$: el límite del cociente es el límite del cociente de las derivadas.",
      ],
      visual: { widget: { type: 'family', expr: 'x*(p/2 - x)', params: [{ name: 'p', min: 8, max: 60, step: 4, init: 40, label: 'perímetro' }], x: [-2, 32], y: [-20, 240], note: 'Área del rectángulo según el ancho x' }, caption: 'El área en función del ancho es una parábola: su vértice da el máximo.', tasks: ['¿Dónde está el máximo para p = 40?'] },
      theory: [
        { title: "L'Hôpital", text: 'Si $\\lim \\frac{f}{g}$ es $\\frac00$ o $\\frac{\\infty}{\\infty}$:', formulas: ["\\lim_{x\\to a}\\frac{f(x)}{g(x)} = \\lim_{x\\to a}\\frac{f'(x)}{g'(x)}"] },
      ],
      example: { prompt: "Calculá $\\lim_{x\\to 0}\\frac{\\operatorname{sen}(3x)}{x}$.", steps: [{ text: 'Es $\\frac00$. Derivamos arriba y abajo por separado:', tex: '\\lim_{x\\to0}\\frac{3\\cos(3x)}{1} = 3' }] },
      summary: ['Optimizar: modelar en una variable y derivar.', "L'Hôpital: solo con $\\frac00$ o $\\frac\\infty\\infty$, derivando por separado."],
      pitfalls: ["Usar la regla del cociente en L'Hôpital.", 'No verificar que el resultado tenga sentido físico.'],
      game: 'arena',
    },
  },
]
