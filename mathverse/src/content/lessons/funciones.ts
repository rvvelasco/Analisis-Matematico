import type { Unit } from '../types'

const A = 'funciones' as const

export const FUNCIONES_UNITS: Unit[] = [
  {
    id: 'f1', area: A, n: 1, title: 'Qué es una función', short: 'Entrada → salida, dominio e imagen', prereqs: [], concepts: ['f1.concepto', 'f1.evaluar', 'f1.dominio', 'f1.imagen'],
    lesson: {
      hook: { question: 'Una máquina expendedora: apretás un botón y sale una gaseosa. ¿Podría pasar que el mismo botón te dé a veces una cosa y a veces otra? ¿Te parecería una máquina "confiable"?', reveal: 'Una función es exactamente una máquina confiable: **a cada entrada le corresponde una sola salida**. Puede haber dos botones que den lo mismo, pero un botón nunca da dos cosas distintas.' },
      intuition: [
        'Pensá en una función como una **regla** que transforma números: le das un $x$ y te devuelve $f(x)$. Por ejemplo $f(x) = 2x + 1$ "duplica y suma uno": $f(3) = 7$.',
        'El **dominio** es el conjunto de entradas permitidas. Algunas cuentas no se pueden hacer: no se divide por cero y (en los reales) no hay raíz cuadrada de un negativo. Por eso $\\frac{1}{x}$ no acepta $x = 0$ y $\\sqrt{x}$ no acepta negativos.',
        'La **imagen** es el conjunto de salidas que realmente aparecen. $x^2$ acepta cualquier número, pero nunca devuelve negativos: su imagen es $[0, +\\infty)$.',
      ],
      visual: { widget: { type: 'family', expr: 'a*x + b', params: [{ name: 'a', min: -3, max: 3, step: 0.5, init: 2 }, { name: 'b', min: -5, max: 5, step: 1, init: 1 }] }, caption: 'Mové los parámetros y mirá cómo cambia la regla y su gráfico. Cada punto del gráfico es un par (entrada, salida).', tasks: ['Poné a = 0: ¿qué pasa con las salidas?', 'Buscá valores de a y b para que la recta pase por (0, 3).'] },
      theory: [
        { title: 'Definición', text: 'Una función $f: A \\to B$ asigna a **cada** elemento $x$ de $A$ **un único** elemento $f(x)$ de $B$.', formulas: ['x \\mapsto f(x)'] },
        { title: 'Dominio', text: 'Es el conjunto de valores de $x$ para los que la fórmula tiene sentido. Restricciones típicas:', formulas: ['\\frac{p(x)}{q(x)}:\\ q(x) \\neq 0', '\\sqrt{g(x)}:\\ g(x) \\ge 0', '\\ln(g(x)):\\ g(x) > 0'] },
        { title: 'Prueba de la recta vertical', text: 'Un gráfico representa una función si **toda recta vertical** lo corta a lo sumo en un punto.' },
      ],
      example: { prompt: 'Hallá el dominio de $f(x) = \\dfrac{\\sqrt{x - 1}}{x - 3}$.', steps: [{ text: 'La raíz pide $x - 1 \\ge 0$, o sea $x \\ge 1$.' }, { text: 'El denominador no puede ser 0: $x \\neq 3$.' }, { text: 'Juntamos las dos condiciones:', tex: '\\operatorname{Dom} f = [1, 3) \\cup (3, +\\infty)' }] },
      summary: ['Función: cada entrada tiene **una sola** salida.', 'Dominio: entradas permitidas (cuidado con divisiones, raíces y logaritmos).', 'Imagen: salidas que efectivamente aparecen.'],
      pitfalls: ['Pensar que dos entradas no pueden tener la misma salida (sí pueden).', 'Olvidar que el denominador no puede anularse.'],
      game: 'lab',
    },
  },
  {
    id: 'f2', area: A, n: 2, title: 'Leer gráficos', short: 'Ceros, signo, crecimiento', prereqs: ['f1'], concepts: ['f2.lectura', 'f2.ceros', 'f2.crecimiento'],
    lesson: {
      hook: { question: 'En un gráfico de la temperatura a lo largo del día, ¿cómo te darías cuenta de en qué momento hizo más calor y cuándo estuvo "bajo cero"?', reveal: 'El punto más alto del gráfico es la temperatura máxima; los momentos bajo cero son donde la curva está **debajo del eje horizontal**. Leer un gráfico es traducir formas en información.' },
      intuition: [
        'En el gráfico de $f$, la altura del punto sobre $x$ es $f(x)$. Si la curva está arriba del eje, $f$ es positiva; si está abajo, negativa.',
        'Los **ceros** (o raíces) son los $x$ donde la curva toca o cruza el eje $x$: ahí $f(x) = 0$. La **ordenada al origen** es donde corta el eje $y$: $f(0)$.',
        'Una función **crece** en un intervalo si al moverte a la derecha la curva sube, y **decrece** si baja. Los "picos" y "valles" son los máximos y mínimos.',
      ],
      visual: { widget: { type: 'family', expr: 'a*(x - h)^2 + k', params: [{ name: 'a', min: -2, max: 2, step: 0.25, init: 1 }, { name: 'h', min: -4, max: 4, step: 0.5, init: 1 }, { name: 'k', min: -5, max: 5, step: 0.5, init: -4 }] }, caption: 'Modificá la parábola y observá dónde corta los ejes, dónde es positiva y dónde crece.', tasks: ['Lográ que tenga un solo cero.', 'Lográ que sea negativa para todo x.'] },
      theory: [
        { title: 'Conjuntos de positividad y negatividad', text: '$C^+ = \\{x : f(x) > 0\\}$, $C^- = \\{x : f(x) < 0\\}$, $C^0 = \\{x : f(x) = 0\\}$.' },
        { title: 'Crecimiento', text: '$f$ es creciente en $I$ si $x_1 < x_2 \\Rightarrow f(x_1) < f(x_2)$ para todo $x_1, x_2 \\in I$.' },
        { title: 'Extremos', text: 'Un máximo relativo es un punto más alto que todos sus vecinos cercanos; el máximo absoluto es el más alto de todos.' },
      ],
      example: { prompt: 'Para $f(x) = x^2 - 4$, hallá ceros, ordenada al origen y conjuntos de positividad.', steps: [{ text: 'Ceros: $x^2 - 4 = 0 \\Rightarrow x = \\pm 2$.' }, { text: 'Ordenada al origen: $f(0) = -4$.' }, { text: 'Es una parábola que abre hacia arriba: es positiva afuera de los ceros.', tex: 'C^+ = (-\\infty, -2) \\cup (2, +\\infty), \\quad C^- = (-2, 2)' }] },
      summary: ['Arriba del eje: positiva. Abajo: negativa.', 'Ceros: cortes con el eje $x$. Ordenada al origen: $f(0)$.', 'Crece si sube al ir hacia la derecha.'],
      pitfalls: ['Confundir el valor máximo ($y$) con dónde se alcanza ($x$).', 'Leer crecimiento de derecha a izquierda.'],
      game: 'cazador',
    },
  },
  {
    id: 'f3', area: A, n: 3, title: 'Función lineal', short: 'Pendiente y ordenada', prereqs: ['f2'], concepts: ['f3.pendiente', 'f3.ecuacion'],
    lesson: {
      hook: { question: 'Un taxi cobra una bajada de bandera y después un monto fijo por kilómetro. Si hacés el doble de kilómetros, ¿pagás el doble?', reveal: 'No: la bajada de bandera se paga una sola vez. El precio es $P = m\\cdot \\text{km} + b$: una **función lineal**, donde $m$ es lo que aumenta por cada km (la pendiente) y $b$ lo que pagás al subir (la ordenada).' },
      intuition: [
        'En $f(x) = mx + b$, la **pendiente** $m$ dice cuánto sube $y$ cuando $x$ aumenta 1. Si $m > 0$ la recta sube, si $m < 0$ baja, si $m = 0$ es horizontal.',
        'La **ordenada al origen** $b$ es donde la recta corta al eje $y$.',
        'Con dos puntos alcanza para conocer una recta: la pendiente es "lo que subió dividido lo que avanzó".',
      ],
      visual: { widget: { type: 'family', expr: 'm*x + b', params: [{ name: 'm', min: -4, max: 4, step: 0.25, init: 1 }, { name: 'b', min: -6, max: 6, step: 0.5, init: 0 }] }, caption: 'La pendiente controla la inclinación; la ordenada, la altura.', tasks: ['¿Qué valor de m hace la recta horizontal?', 'Hacé pasar la recta por (2, 5) y (0, 1).'] },
      theory: [
        { title: 'Pendiente entre dos puntos', text: 'Dados $(x_1, y_1)$ y $(x_2, y_2)$ con $x_1 \\neq x_2$:', formulas: ['m = \\frac{y_2 - y_1}{x_2 - x_1}'] },
        { title: 'Ecuación punto-pendiente', text: 'La recta de pendiente $m$ que pasa por $(x_1, y_1)$:', formulas: ['y - y_1 = m(x - x_1)'] },
        { title: 'Paralelas y perpendiculares', text: 'Paralelas: misma pendiente. Perpendiculares: $m_1\\cdot m_2 = -1$.' },
      ],
      example: { prompt: 'Hallá la recta que pasa por $(1, 3)$ y $(4, 9)$.', steps: [{ text: 'Pendiente:', tex: 'm = \\frac{9 - 3}{4 - 1} = 2' }, { text: 'Punto-pendiente con $(1, 3)$:', tex: 'y - 3 = 2(x - 1) \\Rightarrow y = 2x + 1' }, { text: 'Control con $(4, 9)$: $2\\cdot 4 + 1 = 9$ ✔' }] },
      summary: ['$m$ = cambio de $y$ por unidad de $x$.', '$b = f(0)$.', 'Perpendiculares: $m_1 m_2 = -1$.'],
      pitfalls: ['Hacer $\\frac{x_2 - x_1}{y_2 - y_1}$ (al revés).', 'Restar en distinto orden arriba y abajo.'],
      game: 'duelo',
    },
  },
  {
    id: 'f4', area: A, n: 4, title: 'Función cuadrática', short: 'Parábolas, vértice y raíces', prereqs: ['f3'], concepts: ['f4.vertice', 'f4.raices'],
    lesson: {
      hook: { question: 'Si tirás una pelota hacia arriba, ¿qué forma dibuja su altura en función del tiempo? ¿En qué momento llega más alto?', reveal: 'Dibuja una **parábola**. El punto más alto es el **vértice**, y los momentos en que la pelota está en el piso son las **raíces**.' },
      intuition: [
        'Una cuadrática es $f(x) = ax^2 + bx + c$. El signo de $a$ dice si la parábola abre hacia arriba ($a > 0$, "carita feliz") o hacia abajo ($a < 0$).',
        'El **vértice** es el punto más bajo (o más alto). Su $x$ es el promedio de las raíces, o directamente $x_v = -\\frac{b}{2a}$.',
        'Las **raíces** salen de la fórmula resolvente. El **discriminante** $\\Delta = b^2 - 4ac$ te dice cuántas hay sin calcularlas.',
      ],
      visual: { widget: { type: 'family', expr: 'a*x^2 + b*x + c', params: [{ name: 'a', min: -3, max: 3, step: 0.25, init: 1 }, { name: 'b', min: -6, max: 6, step: 0.5, init: -2 }, { name: 'c', min: -6, max: 6, step: 0.5, init: -3 }] }, caption: 'Observá cómo cada coeficiente cambia la parábola. El discriminante se actualiza solo.', tasks: ['Hacé que el discriminante sea 0: ¿cuántas raíces ves?', 'Con a = 1, ¿qué hace b con el vértice?'] },
      theory: [
        { title: 'Fórmula resolvente', text: 'Las raíces de $ax^2 + bx + c = 0$ son:', formulas: ['x_{1,2} = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}'] },
        { title: 'Discriminante', text: '$\\Delta > 0$: dos raíces reales. $\\Delta = 0$: una (doble). $\\Delta < 0$: ninguna real.' },
        { title: 'Forma canónica', text: 'Completando cuadrados, con vértice $(x_v, y_v)$:', formulas: ['f(x) = a(x - x_v)^2 + y_v'] },
      ],
      example: { prompt: 'Hallá vértice y raíces de $f(x) = x^2 - 6x + 5$.', steps: [{ text: 'Vértice:', tex: 'x_v = -\\frac{-6}{2} = 3, \\quad y_v = 9 - 18 + 5 = -4' }, { text: 'Raíces:', tex: 'x = \\frac{6 \\pm \\sqrt{36 - 20}}{2} = \\frac{6 \\pm 4}{2} \\Rightarrow x_1 = 1,\\ x_2 = 5' }, { text: 'Control: el vértice está en el medio de las raíces ($\\frac{1 + 5}{2} = 3$) ✔' }] },
      summary: ['$a$: hacia dónde abre.', '$x_v = -b/(2a)$.', '$\\Delta$ cuenta las raíces reales.'],
      pitfalls: ['Olvidar el signo de $b$ en la resolvente.', 'Dividir solo la raíz por $2a$.'],
      game: 'lab',
    },
  },
  {
    id: 'f5', area: A, n: 5, title: 'Polinomios y racionales', short: 'Raíces, factorización y asíntotas', prereqs: ['f4'], concepts: ['f5.polinomios', 'f5.asintotas'],
    lesson: {
      hook: { question: '¿Qué le pasa a $\\frac{1}{x}$ cuando $x$ se acerca mucho a 0? ¿Y cuando $x$ es enorme?', reveal: 'Cerca de 0 se dispara (hacia $+\\infty$ o $-\\infty$ según el lado); para $x$ enorme se aplasta contra 0. Esas rectas a las que la curva "se pega" sin tocarlas son las **asíntotas**.' },
      intuition: [
        'Un polinomio se puede escribir como producto de factores $(x - r)$, uno por cada raíz $r$. Encontrar raíces y factorizar son la misma tarea.',
        'Una función racional es un cociente de polinomios. Donde el denominador se anula (y el numerador no), aparece una **asíntota vertical**.',
        'Para $x$ muy grande mandan los términos de mayor grado: eso decide la **asíntota horizontal** (u oblicua).',
      ],
      visual: { widget: { type: 'family', expr: '(a*x + b)/(x - c)', params: [{ name: 'a', min: -3, max: 3, step: 0.5, init: 1 }, { name: 'b', min: -5, max: 5, step: 0.5, init: 1 }, { name: 'c', min: -4, max: 4, step: 0.5, init: 2 }] }, caption: 'La asíntota vertical está en x = c; la horizontal en y = a.', tasks: ['Mové c y seguí la asíntota vertical.', '¿Qué pasa si b = −a·c? (pista: se simplifica)'] },
      theory: [
        { title: 'Teorema del resto', text: 'El resto de dividir $P(x)$ por $(x - a)$ es $P(a)$. Si $P(a) = 0$, $(x - a)$ es factor.' },
        { title: 'Asíntota vertical', text: '$x = a$ es AV si $\\lim_{x\\to a} f(x) = \\pm\\infty$ (típicamente, el denominador se anula y el numerador no).' },
        { title: 'Asíntota horizontal', text: 'Si los grados son iguales, $y = \\frac{\\text{coef. principal num.}}{\\text{coef. principal den.}}$. Si el grado del numerador es menor, $y = 0$.' },
      ],
      example: { prompt: 'Asíntotas de $f(x) = \\dfrac{2x + 1}{x - 3}$.', steps: [{ text: 'El denominador se anula en $x = 3$ y el numerador vale $7 \\neq 0$: AV $x = 3$.' }, { text: 'Grados iguales: AH $y = \\frac{2}{1} = 2$.' }] },
      summary: ['Raíz $r$ ⇔ factor $(x - r)$.', 'AV: donde se anula el denominador (y no el numerador).', 'AH: comparar grados.'],
      pitfalls: ['Poner AV donde numerador y denominador se anulan juntos (puede ser un "agujero").'],
      game: 'cazador',
    },
  },
  {
    id: 'f6', area: A, n: 6, title: 'Exponencial y logaritmo', short: 'Crecimiento explosivo y su inversa', prereqs: ['f4'], concepts: ['f6.log', 'f6.ecuaciones'],
    lesson: {
      hook: { question: 'Si doblás una hoja de papel por la mitad 42 veces (suponiendo que se pudiera), ¿qué tan grueso quedaría?', reveal: 'Cada doblez duplica el grosor: $0{,}1\\text{ mm}\\cdot 2^{42}$ ≈ ¡440.000 km, más que la distancia a la Luna! Eso es el **crecimiento exponencial**. El logaritmo responde la pregunta inversa: ¿cuántas veces hay que duplicar?' },
      intuition: [
        'En $a^x$ la variable está en el **exponente**. Si $a > 1$ crece muy rápido; si $0 < a < 1$ decrece hacia 0. Siempre es positiva.',
        'El logaritmo es la operación inversa: $\\log_a y$ es "a qué hay que elevar $a$ para obtener $y$". Por ejemplo $\\log_2 8 = 3$.',
        'El número $e \\approx 2{,}718$ es la base "natural"; su logaritmo se escribe $\\ln$.',
      ],
      visual: { widget: { type: 'inverseFn', f: 'e^x', finv: 'ln(x)', x: [-4, 6] }, caption: 'La exponencial y el logaritmo son simétricos respecto de la recta y = x: uno deshace lo que hace el otro.', tasks: ['Mové el punto: ¿qué relación tienen sus coordenadas en cada curva?'] },
      theory: [
        { title: 'Definición de logaritmo', text: '', formulas: ['\\log_a y = x \\iff a^x = y \\quad (a > 0,\\ a \\neq 1,\\ y > 0)'] },
        { title: 'Propiedades', text: '', formulas: ['\\log(xy) = \\log x + \\log y', '\\log\\frac{x}{y} = \\log x - \\log y', '\\log(x^n) = n\\log x'] },
        { title: 'Ecuaciones exponenciales', text: 'Para despejar una incógnita del exponente, se aplica logaritmo a ambos lados.' },
      ],
      example: { prompt: 'Resolvé $3\\cdot 2^x = 48$.', steps: [{ text: 'Dividimos por 3: $2^x = 16$.' }, { text: 'Como $16 = 2^4$: $x = 4$.' }, { text: 'En general: $x = \\log_2 16 = \\frac{\\ln 16}{\\ln 2} = 4$.' }] },
      summary: ['$a^x > 0$ siempre.', '$\\log_a$ deshace $a^x$.', 'El log de un producto es la suma de logs.'],
      pitfalls: ['$\\log(x + y) = \\log x + \\log y$ (¡falso!).', 'Tomar logaritmo de números negativos.'],
      game: 'duelo',
    },
  },
  {
    id: 'f7', area: A, n: 7, title: 'Trigonométricas', short: 'Seno, coseno, período', prereqs: ['f4'], concepts: ['f7.valores', 'f7.graficos'],
    lesson: {
      hook: { question: 'Una vuelta al mundo (la rueda de la plaza) gira a velocidad constante. Si graficás la altura de tu asiento en función del tiempo, ¿qué forma tiene?', reveal: 'Una onda que se repite: sube, baja, vuelve a subir. Esa es la función **seno**. Todo lo que se repite periódicamente (sonido, mareas, corriente alterna) se describe con seno y coseno.' },
      intuition: [
        'En la circunferencia de radio 1, un punto que gira un ángulo $x$ tiene coordenadas $(\\cos x, \\operatorname{sen} x)$.',
        'Los ángulos se miden en **radianes**: una vuelta completa es $2\\pi$. Por eso seno y coseno se repiten cada $2\\pi$ (su **período**).',
        'En $A\\operatorname{sen}(Bx)$, $A$ es la **amplitud** (qué tan alta es la onda) y el período pasa a ser $\\frac{2\\pi}{B}$.',
      ],
      visual: { widget: { type: 'family', expr: 'a*sin(b*x)', params: [{ name: 'a', min: -3, max: 3, step: 0.25, init: 1 }, { name: 'b', min: 0.25, max: 4, step: 0.25, init: 1 }], x: [-7, 7], y: [-4, 4] }, caption: 'a estira la onda verticalmente; b la comprime horizontalmente (cambia el período).', tasks: ['¿Qué b hace que el período sea π?', '¿Qué hace un a negativo?'] },
      theory: [
        { title: 'Valores notables', text: '', formulas: ['\\operatorname{sen}0 = 0,\\ \\operatorname{sen}\\tfrac{\\pi}{6} = \\tfrac12,\\ \\operatorname{sen}\\tfrac{\\pi}{2} = 1', '\\cos 0 = 1,\\ \\cos\\tfrac{\\pi}{3} = \\tfrac12,\\ \\cos\\tfrac{\\pi}{2} = 0'] },
        { title: 'Identidad fundamental', text: '', formulas: ['\\operatorname{sen}^2 x + \\cos^2 x = 1'] },
        { title: 'Período', text: '$\\operatorname{sen}(Bx)$ y $\\cos(Bx)$ tienen período $\\frac{2\\pi}{|B|}$.' },
      ],
      example: { prompt: 'Resolvé $\\operatorname{sen} x = \\frac12$ en $[0, 2\\pi]$.', steps: [{ text: 'Un ángulo conocido: $x = \\frac{\\pi}{6}$.' }, { text: 'El seno también es positivo en el segundo cuadrante: $x = \\pi - \\frac{\\pi}{6} = \\frac{5\\pi}{6}$.' }, { text: 'Soluciones: $\\frac{\\pi}{6}$ y $\\frac{5\\pi}{6}$.' }] },
      summary: ['Radianes: vuelta $= 2\\pi$.', 'Período de $\\operatorname{sen}(Bx)$: $2\\pi/B$.', '$\\operatorname{sen}^2 + \\cos^2 = 1$.'],
      pitfalls: ['Mezclar grados y radianes.', 'Olvidar la segunda solución de una ecuación trigonométrica.'],
      game: 'lab',
    },
  },
  {
    id: 'f8', area: A, n: 8, title: 'Transformaciones', short: 'Desplazar, estirar, reflejar', prereqs: ['f4'], concepts: ['f8.transformaciones'],
    lesson: {
      hook: { question: 'Si conocés el gráfico de $x^2$, ¿podés dibujar $(x - 3)^2 + 1$ sin hacer ninguna tabla de valores?', reveal: 'Sí: es la misma parábola corrida 3 a la derecha y 1 hacia arriba. Con unas pocas reglas, de un gráfico conocido sacás muchísimos.' },
      intuition: [
        '$f(x) + k$ mueve el gráfico verticalmente $k$ unidades.',
        '$f(x - h)$ lo mueve **horizontalmente** $h$ unidades... ¡hacia la derecha si $h > 0$! Es contraintuitivo: el gráfico llega a la misma altura "más tarde".',
        '$a\\cdot f(x)$ lo estira verticalmente (y si $a < 0$, lo refleja respecto del eje $x$). $f(-x)$ lo refleja respecto del eje $y$.',
      ],
      visual: { widget: { type: 'family', expr: 'a*abs(x - h) + k', ghost: 'abs(x)', params: [{ name: 'a', min: -3, max: 3, step: 0.25, init: 1 }, { name: 'h', min: -5, max: 5, step: 0.5, init: 0 }, { name: 'k', min: -5, max: 5, step: 0.5, init: 0 }] }, caption: 'La curva punteada es |x| original; la llena, la transformada.', tasks: ['Llevá el vértice a (−2, 3).', 'Dala vuelta como una "V" invertida.'] },
      theory: [
        { title: 'Reglas', text: '', formulas: ['f(x) + k:\\ \\text{vertical}', 'f(x - h):\\ \\text{horizontal (derecha si } h > 0)', 'a f(x):\\ \\text{estiramiento vertical}', '-f(x):\\ \\text{reflexión en el eje } x', 'f(-x):\\ \\text{reflexión en el eje } y'] },
      ],
      example: { prompt: 'Describí $g(x) = -2(x + 1)^2 + 4$ a partir de $x^2$.', steps: [{ text: '$x + 1 = x - (-1)$: corrimiento 1 a la izquierda.' }, { text: '$-2$: estirada ×2 y reflejada (abre hacia abajo).' }, { text: '$+4$: sube 4. Vértice en $(-1, 4)$.' }] },
      summary: ['Afuera de $f$: vertical. Adentro: horizontal (y al revés de lo que parece).'],
      pitfalls: ['Mover hacia la izquierda con $f(x - 3)$.'],
      game: 'puzzle',
    },
  },
  {
    id: 'f9', area: A, n: 9, title: 'Composición e inversa', short: 'Encadenar y deshacer funciones', prereqs: ['f6', 'f8'], concepts: ['f9.composicion', 'f9.inversa'],
    lesson: {
      hook: { question: 'Para ponerte las medias y las zapatillas hay un orden. ¿Y para sacártelas? ¿Importa el orden?', reveal: 'Para "deshacer" hay que ir al revés: primero zapatillas, después medias. Componer funciones es encadenarlas; la inversa las deshace en orden inverso.' },
      intuition: [
        '$(f\\circ g)(x) = f(g(x))$: primero se aplica $g$ y al resultado se le aplica $f$. El orden importa: en general $f\\circ g \\neq g\\circ f$.',
        'La inversa $f^{-1}$ deshace lo que hace $f$: si $f(a) = b$, entonces $f^{-1}(b) = a$. Solo existe si $f$ es **inyectiva** (no repite salidas).',
        'Para calcularla: escribí $y = f(x)$ y despejá $x$.',
      ],
      visual: { widget: { type: 'inverseFn', f: '2*x + 1', finv: '(x - 1)/2', x: [-6, 6] }, caption: 'El gráfico de la inversa es el reflejo respecto de y = x.', tasks: ['Mové el punto sobre f y mirá su reflejo sobre f⁻¹.'] },
      theory: [
        { title: 'Composición', text: 'Dominio de $f\\circ g$: los $x$ del dominio de $g$ tales que $g(x)$ está en el dominio de $f$.', formulas: ['(f\\circ g)(x) = f(g(x))'] },
        { title: 'Inversa', text: '', formulas: ['f(f^{-1}(x)) = x, \\quad f^{-1}(f(x)) = x'] },
      ],
      example: { prompt: 'Hallá la inversa de $f(x) = \\frac{x - 3}{2}$.', steps: [{ text: '$y = \\frac{x - 3}{2}$' }, { text: 'Despejamos: $2y = x - 3 \\Rightarrow x = 2y + 3$.' }, { text: 'Renombramos:', tex: 'f^{-1}(x) = 2x + 3' }] },
      summary: ['$f\\circ g$: primero $g$.', 'Inversa: despejar $x$.', 'Gráfico de $f^{-1}$: simétrico respecto de $y = x$.'],
      pitfalls: ['Confundir $f^{-1}(x)$ con $\\frac{1}{f(x)}$.'],
      game: 'puzzle',
    },
  },
  {
    id: 'f10', area: A, n: 10, title: 'Límites y continuidad', short: 'Acercarse sin llegar', prereqs: ['f5', 'f9'], concepts: ['f10.limites', 'f10.continuidad'],
    lesson: {
      hook: { question: '¿Cuánto vale $\\frac{x^2 - 1}{x - 1}$ en $x = 1$? ¿Y en $x = 0{,}999$?', reveal: 'En $x = 1$ da $\\frac00$: no está definida. Pero en $0{,}999$ da $1{,}999$, y cuanto más te acercás a 1, más se acerca a 2. Ese "valor al que se acerca" es el **límite**.' },
      intuition: [
        '$\\lim_{x\\to a} f(x) = L$ significa que $f(x)$ se acerca a $L$ tanto como quieras, si tomás $x$ suficientemente cerca de $a$ (sin importar qué pasa **exactamente** en $a$).',
        'Si al reemplazar aparece $\\frac{0}{0}$, es una indeterminación: hay que simplificar (factorizar, racionalizar) antes de reemplazar.',
        'Una función es **continua** en $a$ si el límite existe y coincide con $f(a)$: se puede dibujar "sin levantar el lápiz".',
      ],
      visual: { widget: { type: 'limit', f: '(x^2 - 1)/(x - 1)', a: 1, x: [-2, 4], y: [-1, 5] }, caption: 'Acercá x a 1 por izquierda y por derecha: los valores se acercan a 2, aunque en x = 1 la función no está definida.', tasks: ['Probá con valores muy cercanos a 1.', '¿Cambia algo si te acercás por la derecha?'] },
      theory: [
        { title: 'Límites laterales', text: 'El límite existe si y solo si los laterales existen y son iguales.', formulas: ['\\lim_{x\\to a^-} f(x) = \\lim_{x\\to a^+} f(x) = L'] },
        { title: 'Continuidad', text: '$f$ es continua en $a$ si: (1) $f(a)$ existe, (2) $\\lim_{x\\to a} f(x)$ existe, (3) son iguales.' },
        { title: 'Límites al infinito', text: 'En un cociente de polinomios, se divide por la mayor potencia del denominador.' },
      ],
      example: { prompt: 'Calculá $\\lim_{x\\to 3}\\dfrac{x^2 - 9}{x - 3}$.', steps: [{ text: 'Reemplazar da $\\frac00$: indeterminación.' }, { text: 'Factorizamos:', tex: '\\frac{(x - 3)(x + 3)}{x - 3} = x + 3 \\quad (x \\neq 3)' }, { text: 'Ahora sí reemplazamos: $3 + 3 = 6$.' }] },
      summary: ['El límite no depende del valor en el punto.', '$\\frac00$: simplificar primero.', 'Continua = límite igual al valor.'],
      pitfalls: ['Decir que $\\frac00 = 0$ o $= 1$.', 'Creer que si $f(a)$ no existe, el límite tampoco.'],
      game: 'cazador',
    },
  },
]
