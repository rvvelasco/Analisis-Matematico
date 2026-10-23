import type { Unit } from '../types'

const A = 'integrales' as const

export const INTEGRALES_UNITS: Unit[] = [
  {
    id: 'i1', area: A, n: 1, title: 'Acumulación y área', short: 'Sumar lo que se va juntando', prereqs: ['d1'], concepts: ['i1.acumulacion', 'i1.area'],
    lesson: {
      hook: { question: 'Una canilla larga 2 litros por minuto durante 10 minutos. ¿Cuánta agua juntaste? ¿Y si el caudal fuera cambiando todo el tiempo?', reveal: 'Con caudal constante: $2\\cdot 10 = 20$ litros, el área de un rectángulo en el gráfico caudal–tiempo. Si el caudal cambia, igual el total es **el área bajo la curva**. Calcular esa área es integrar.' },
      intuition: [
        'Si conocés una **tasa** (velocidad, caudal, potencia) y querés el **total acumulado**, tenés que sumar tasa × tiempo en cada pedacito: eso es el área bajo el gráfico de la tasa.',
        'La integral es la operación inversa de la derivada: la derivada pasa del total a la tasa; la integral, de la tasa al total.',
        'Ojo: la integral cuenta el área **con signo**: lo que está debajo del eje resta.',
      ],
      visual: { widget: { type: 'accumulation', f: 'sin(x) + 0.5', x: [0, 10], y: [-2, 6] }, caption: 'Mové el borde derecho: abajo se dibuja el área acumulada. Donde la función es negativa, el acumulado baja.', tasks: ['¿Dónde el acumulado es máximo?'] },
      theory: [
        { title: 'Integral definida', text: '$\\int_a^b f(x)\\,dx$ es el área con signo entre la curva y el eje $x$, desde $a$ hasta $b$.' },
        { title: 'Notación', text: 'El $\\int$ es una "S" alargada (de **suma**) y $dx$ es el ancho de cada rectangulito.' },
      ],
      example: { prompt: 'Un auto va a 60 km/h durante 2 h y después a 90 km/h durante 1 h. Distancia total.', steps: [{ text: 'Dos rectángulos:', tex: '60\\cdot 2 + 90\\cdot 1 = 210\\ \\text{km}' }] },
      summary: ['Integral = acumulación = área con signo.'],
      pitfalls: ['Pensar que la integral siempre es un área positiva.'],
      game: 'constructor',
    },
  },
  {
    id: 'i2', area: A, n: 2, title: 'Sumas de Riemann', short: 'Aproximar áreas con rectángulos', prereqs: ['i1'], concepts: ['i2.riemann'],
    lesson: {
      hook: { question: 'No hay fórmula de geometría para el área bajo una parábola. ¿Cómo la estimarías con lo que sabés?', reveal: 'Con rectángulos: partís el intervalo, en cada pedazo levantás un rectángulo hasta la curva y sumás. Con más rectángulos, más precisión. En el límite, el área exacta.' },
      intuition: [
        'Se parte $[a, b]$ en $n$ pedazos de ancho $\\Delta x = \\frac{b - a}{n}$. En cada uno se toma una altura (extremo izquierdo, derecho o punto medio).',
        'La suma de Riemann es $\\sum f(x_i^*)\\,\\Delta x$. Cuando $n \\to \\infty$, tiende a la integral.',
        'Para una función creciente, el extremo izquierdo subestima y el derecho sobreestima.',
      ],
      visual: { widget: { type: 'riemann', f: 'x^2', a: 0, b: 2, y: [-0.5, 4.5] }, caption: 'Cambiá la cantidad de rectángulos y el método. Compará la suma con el valor exacto (8/3).', tasks: ['¿Con cuántos rectángulos el error es menor que 0,01?', '¿Qué método converge más rápido?'] },
      theory: [
        { title: 'Suma de Riemann', text: '', formulas: ['S_n = \\sum_{i=1}^{n} f(x_i^*)\\,\\Delta x', '\\int_a^b f(x)\\,dx = \\lim_{n\\to\\infty} S_n'] },
        { title: 'Trapecios', text: '', formulas: ['T_n = \\frac{\\Delta x}{2}\\left[f(x_0) + 2f(x_1) + \\dots + 2f(x_{n-1}) + f(x_n)\\right]'] },
      ],
      example: { prompt: 'Aproximá $\\int_0^2 x^2dx$ con 2 rectángulos (extremo derecho).', steps: [{ text: '$\\Delta x = 1$, alturas $f(1) = 1$, $f(2) = 4$.' }, { text: '$S = (1 + 4)\\cdot 1 = 5$ (el exacto es $8/3 \\approx 2{,}67$: sobreestima).' }] },
      summary: ['Rectángulos de ancho $\\Delta x$.', 'Más rectángulos, mejor aproximación.'],
      pitfalls: ['Olvidar multiplicar por $\\Delta x$.'],
      game: 'constructor',
    },
  },
  {
    id: 'i3', area: A, n: 3, title: 'Primitivas', short: 'Derivar al revés', prereqs: ['i1', 'd4'], concepts: ['i3.primitiva', 'i3.constante'],
    lesson: {
      hook: { question: 'Si la derivada de una función es $2x$, ¿qué función era?', reveal: 'Puede ser $x^2$... pero también $x^2 + 5$ o $x^2 - 3$: todas tienen derivada $2x$. Por eso se escribe $\\int 2x\\,dx = x^2 + C$.' },
      intuition: [
        'Una **primitiva** (o antiderivada) de $f$ es una función $F$ con $F\' = f$.',
        'Si $F$ es primitiva, también lo es $F + C$ para cualquier constante $C$: son la misma curva subida o bajada.',
        'Para controlar una integral, **derivá el resultado**: tiene que dar el integrando.',
      ],
      visual: { widget: { type: 'family', expr: 'x^2 + c', ghost: '2*x', params: [{ name: 'c', min: -5, max: 5, step: 0.5, init: 0 }], x: [-4, 4], y: [-6, 10] }, caption: 'Todas las curvas x² + C tienen la misma pendiente en cada x: son todas primitivas de 2x (punteada).', tasks: ['Elegí c para que la primitiva pase por (1, 4).'] },
      theory: [
        { title: 'Integral indefinida', text: '', formulas: ["\\int f(x)\\,dx = F(x) + C \\iff F'(x) = f(x)"] },
        { title: 'Linealidad', text: '', formulas: ['\\int (af + bg) = a\\int f + b\\int g'] },
      ],
      example: { prompt: 'Hallá $F$ con $F\'(x) = 2x$ y $F(1) = 4$.', steps: [{ text: '$F(x) = x^2 + C$.' }, { text: '$F(1) = 1 + C = 4 \\Rightarrow C = 3$: $F(x) = x^2 + 3$.' }] },
      summary: ['Primitiva: $F\' = f$.', 'Siempre $+C$.', 'Se controla derivando.'],
      pitfalls: ['Olvidar la constante.'],
      game: 'fabrica',
    },
  },
  {
    id: 'i4', area: A, n: 4, title: 'Integrales inmediatas', short: 'La tabla al revés', prereqs: ['i3'], concepts: ['i4.potencia', 'i4.tabla'],
    lesson: {
      hook: { question: 'Para derivar $x^n$ el exponente baja y se resta 1. ¿Qué habrá que hacer para integrar?', reveal: 'Lo contrario, en orden inverso: **sumar 1 al exponente y dividir por el exponente nuevo**. $\\int x^3dx = \\frac{x^4}{4} + C$.' },
      intuition: [
        'Regla de la potencia: $\\int x^n dx = \\frac{x^{n+1}}{n + 1} + C$ para $n \\neq -1$.',
        'El caso $n = -1$ es especial: $\\int \\frac1x dx = \\ln|x| + C$.',
        'El resto de la tabla se lee de la tabla de derivadas al revés: $\\int e^x = e^x$, $\\int\\cos x = \\operatorname{sen} x$, $\\int \\operatorname{sen}x = -\\cos x$.',
      ],
      visual: { widget: { type: 'accumulation', f: 'x^2', x: [0, 3], y: [-1, 10] }, caption: 'El área acumulada bajo x² desde 0 crece como x³/3.', tasks: ['Comprobá: con x = 3, ¿el área es 9?'] },
      theory: [
        { title: 'Tabla de integrales', text: '', formulas: ['\\int x^n dx = \\frac{x^{n+1}}{n+1} + C\\ (n \\neq -1)', '\\int \\frac{1}{x}dx = \\ln|x| + C', '\\int e^x dx = e^x + C', '\\int \\cos x\\,dx = \\operatorname{sen}x + C', '\\int \\operatorname{sen}x\\,dx = -\\cos x + C'] },
      ],
      example: { prompt: 'Calculá $\\int\\left(6x^2 - \\frac{4}{x} + 2\\sqrt x\\right)dx$.', steps: [{ text: '', tex: '6\\frac{x^3}{3} - 4\\ln|x| + 2\\frac{x^{3/2}}{3/2} + C = 2x^3 - 4\\ln|x| + \\tfrac43 x^{3/2} + C' }] },
      summary: ['Sube 1 y divide por el nuevo.', '$\\int \\frac1x = \\ln|x|$.'],
      pitfalls: ['Dividir por el exponente viejo.', 'Integrar un producto como producto de integrales.'],
      game: 'fabrica',
    },
  },
  {
    id: 'i5', area: A, n: 5, title: 'Sustitución', short: 'La cadena al revés', prereqs: ['i4', 'd6'], concepts: ['i5.sustitucion'],
    lesson: {
      hook: { question: 'La derivada de $(x^2 + 1)^5$ es $5(x^2 + 1)^4\\cdot 2x$. Entonces, ¿cuánto da $\\int 10x(x^2 + 1)^4 dx$?', reveal: 'Exactamente $(x^2 + 1)^5 + C$. Cuando el integrando parece el resultado de una regla de la cadena, se integra con **sustitución**.' },
      intuition: [
        'Si ves una función "de adentro" $u(x)$ **y también su derivada** multiplicando, llamá $u$ a lo de adentro: $du = u\'(x)dx$.',
        'La integral queda en términos de $u$, más simple. Al final, se vuelve a $x$.',
        'Si la derivada de adentro aparece multiplicada por una constante distinta, se compensa (multiplicando y dividiendo).',
      ],
      visual: { widget: { type: 'derivGraph', f: '(x^2 + 1)^3/6', x: [-2, 2], y: [-1, 8] }, caption: 'Arriba una primitiva; abajo su derivada x(x²+1)², el integrando original.', tasks: ['Verificá derivando con la cadena.'] },
      theory: [
        { title: 'Método', text: '', formulas: ["\\int f(u(x))\\,u'(x)\\,dx = \\int f(u)\\,du"] },
      ],
      example: { prompt: 'Calculá $\\int x\\,e^{x^2}dx$.', steps: [{ text: '$u = x^2$, $du = 2x\\,dx \\Rightarrow x\\,dx = \\frac{du}{2}$.' }, { text: '', tex: '\\int e^u\\frac{du}{2} = \\frac{e^u}{2} + C = \\frac{e^{x^2}}{2} + C' }] },
      summary: ['Buscar "función + su derivada".', 'Compensar constantes.', 'Volver a $x$.'],
      pitfalls: ['Dejar la respuesta en $u$.', 'No compensar el factor de $du$.'],
      game: 'puzzle',
    },
  },
  {
    id: 'i6', area: A, n: 6, title: 'Integración por partes', short: 'El producto al revés', prereqs: ['i5'], concepts: ['i6.partes'],
    lesson: {
      hook: { question: '¿Cómo integrarías $x\\,e^x$? No es una sustitución evidente...', reveal: 'Con **partes**: $\\int u\\,dv = uv - \\int v\\,du$. Eligiendo $u = x$ (que al derivar se simplifica) sale $(x - 1)e^x + C$.' },
      intuition: [
        'Viene de la regla del producto: $(uv)\' = u\'v + uv\'$, integrando y despejando.',
        'Se elige $u$ algo que se simplifique al derivar (polinomios, logaritmos) y $dv$ algo fácil de integrar (exponenciales, senos).',
        'Regla mnemotécnica LIATE para elegir $u$: **L**ogaritmos, **I**nversas, **A**lgebraicas, **T**rigonométricas, **E**xponenciales.',
      ],
      visual: { widget: { type: 'derivGraph', f: '(x - 1)*e^x', x: [-4, 2], y: [-2, 6] }, caption: 'La derivada de (x − 1)eˣ es x·eˣ: el integrando.', tasks: ['Comprobá con la regla del producto.'] },
      theory: [
        { title: 'Fórmula', text: '', formulas: ['\\int u\\,dv = u\\,v - \\int v\\,du'] },
        { title: 'Casos', text: 'A veces hay que aplicarla dos veces ($x^2e^x$) o aparece la integral original y se despeja ($e^x\\operatorname{sen}x$).' },
      ],
      example: { prompt: 'Calculá $\\int x\\cos x\\,dx$.', steps: [{ text: '$u = x$, $dv = \\cos x\\,dx$ ⇒ $du = dx$, $v = \\operatorname{sen} x$.' }, { text: '', tex: 'x\\operatorname{sen}x - \\int\\operatorname{sen}x\\,dx = x\\operatorname{sen}x + \\cos x + C' }] },
      summary: ['$uv - \\int v\\,du$.', 'LIATE para elegir $u$.'],
      pitfalls: ['Elegir $u$ al revés (la integral empeora).', 'Errar el signo de $-\\int v\\,du$.'],
      game: 'puzzle',
    },
  },
  {
    id: 'i7', area: A, n: 7, title: 'Integral definida y TFC', short: 'Barrow y el teorema fundamental', prereqs: ['i2', 'i4'], concepts: ['i7.barrow', 'i7.propiedades', 'i7.tfc'],
    lesson: {
      hook: { question: 'Calcular áreas sumando infinitos rectángulos parece imposible a mano. ¿Habrá un atajo?', reveal: 'Sí, y es uno de los resultados más importantes de la matemática: **el área se calcula con una primitiva**. $\\int_a^b f = F(b) - F(a)$ (regla de Barrow).' },
      intuition: [
        'Teorema fundamental: si $A(x) = \\int_a^x f(t)\\,dt$ es el área acumulada, entonces $A\'(x) = f(x)$. La velocidad con que crece el área es la altura de la curva.',
        'Por eso el área acumulada es una primitiva, y $\\int_a^b f = F(b) - F(a)$ para cualquier primitiva $F$ (la $C$ se cancela).',
        'Requisito: $f$ continua en $[a, b]$. Si no, Barrow puede dar cualquier cosa.',
      ],
      visual: { widget: { type: 'area', f: 'x^2 - 1', a: 0, b: 2, x: [-2, 3], y: [-2, 5] }, caption: 'Arrastrá a y b. El área con signo coincide con F(b) − F(a).', tasks: ['Buscá a y b para que la integral dé 0.'] },
      theory: [
        { title: 'Teorema fundamental del cálculo', text: '', formulas: ["\\frac{d}{dx}\\int_a^x f(t)\\,dt = f(x)", "\\frac{d}{dx}\\int_a^{h(x)} f(t)\\,dt = f(h(x))\\,h'(x)"] },
        { title: 'Regla de Barrow', text: '', formulas: ['\\int_a^b f(x)\\,dx = F(b) - F(a)'] },
        { title: 'Propiedades', text: '', formulas: ['\\int_a^b f = -\\int_b^a f', '\\int_a^b f + \\int_b^c f = \\int_a^c f'] },
      ],
      example: { prompt: 'Calculá $\\int_1^3 (2x + 1)\\,dx$.', steps: [{ text: 'Primitiva: $F(x) = x^2 + x$.' }, { text: '', tex: 'F(3) - F(1) = 12 - 2 = 10' }] },
      summary: ['Barrow: $F(b) - F(a)$.', 'TFC: derivar el área da la función.'],
      pitfalls: ['Restar al revés.', 'Aplicar Barrow con discontinuidades en el intervalo.'],
      game: 'constructor',
    },
  },
  {
    id: 'i8', area: A, n: 8, title: 'Cálculo de áreas', short: 'Áreas reales, siempre positivas', prereqs: ['i7'], concepts: ['i8.area', 'i8.entre'],
    lesson: {
      hook: { question: '$\\int_{-1}^{1} x^3dx = 0$. ¿Significa que no hay área entre la curva y el eje?', reveal: 'No: hay dos regiones de área $\\frac14$ cada una, pero una suma y la otra resta. Para el **área** hay que separar donde cambia el signo y sumar valores absolutos.' },
      intuition: [
        'Área entre $f$ y el eje: buscar los ceros, partir el intervalo y sumar $\\left|\\int\\right|$ de cada parte.',
        'Área entre dos curvas: $\\int (\\text{arriba} - \\text{abajo})\\,dx$ entre las intersecciones.',
        'Siempre conviene hacer un dibujo primero.',
      ],
      visual: { widget: { type: 'area', f: 'x^3 - x', a: -1, b: 1, x: [-2, 2], y: [-2, 2] }, caption: 'Compará la integral (con signo) y el área (siempre positiva).', tasks: ['Lográ integral 0 con área positiva.'] },
      theory: [
        { title: 'Área con el eje', text: '', formulas: ['\\text{Área} = \\int_a^b |f(x)|\\,dx'] },
        { title: 'Área entre curvas', text: '', formulas: ['\\text{Área} = \\int_a^b \\big(f(x) - g(x)\\big)\\,dx \\quad (f \\ge g)'] },
      ],
      example: { prompt: 'Área entre $y = x^2$ e $y = 2x$.', steps: [{ text: 'Intersecciones: $x^2 = 2x \\Rightarrow x = 0, 2$. Arriba está $2x$.' }, { text: '', tex: '\\int_0^2(2x - x^2)\\,dx = \\left[x^2 - \\tfrac{x^3}{3}\\right]_0^2 = \\tfrac43' }] },
      summary: ['Partir en los ceros.', 'Arriba menos abajo.'],
      pitfalls: ['Dar un área negativa.', 'Integrar de corrido cuando hay cambio de signo.'],
      game: 'constructor',
    },
  },
  {
    id: 'i9', area: A, n: 9, title: 'Aplicaciones', short: 'Movimiento, promedios y volúmenes', prereqs: ['i8'], concepts: ['i9.aplicaciones'],
    lesson: {
      hook: { question: 'El velocímetro de un auto registró la velocidad durante una hora. ¿Podés saber cuántos km hizo sin mirar el cuentakilómetros?', reveal: 'Sí: integrando la velocidad. Las integrales reconstruyen totales a partir de tasas: distancia, trabajo, volumen, valor promedio...' },
      intuition: [
        'Desplazamiento: $\\int v\\,dt$ (con signo). Distancia recorrida: $\\int |v|\\,dt$.',
        'Valor medio de $f$ en $[a, b]$: $\\frac{1}{b - a}\\int_a^b f$, la altura del rectángulo con la misma área.',
        'Volumen de revolución (discos): $V = \\pi\\int_a^b f(x)^2dx$.',
      ],
      visual: { widget: { type: 'accumulation', f: 'x - 2', x: [0, 5], y: [-3, 4] }, caption: 'Si f es la velocidad, el acumulado es la posición: baja mientras v < 0 y sube después.', tasks: ['¿En qué momento vuelve al punto de partida?'] },
      theory: [
        { title: 'Fórmulas', text: '', formulas: ['\\bar f = \\frac{1}{b - a}\\int_a^b f(x)\\,dx', 'V = \\pi\\int_a^b f(x)^2\\,dx'] },
      ],
      example: { prompt: 'Valor medio de $x^2$ en $[0, 3]$.', steps: [{ text: '', tex: '\\frac13\\int_0^3 x^2dx = \\frac13\\cdot 9 = 3' }] },
      summary: ['Tasa integrada = total.', 'Distancia: integrar $|v|$.'],
      pitfalls: ['Confundir desplazamiento con distancia.', 'Olvidar el $\\pi$ o el cuadrado en volúmenes.'],
      game: 'arena',
    },
  },
]
