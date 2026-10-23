import type { Unit } from '../types'

const A = 'matrices' as const

export const MATRICES_UNITS: Unit[] = [
  {
    id: 'm1', area: A, n: 1, title: 'Qué es una matriz', short: 'Tablas de números, notación y tipos', prereqs: [], concepts: ['m1.concepto', 'm1.igualdad'],
    lesson: {
      hook: { question: 'Una planilla con las notas de 3 alumnos en 4 materias: ¿cómo dirías rápido "la nota del segundo alumno en la tercera materia"?', reveal: 'Con dos números: fila 2, columna 3. Una **matriz** es justamente una tabla de números ordenada en filas y columnas, y $a_{23}$ es "fila 2, columna 3".' },
      intuition: [
        'Una matriz de $m\\times n$ tiene $m$ filas (renglones horizontales) y $n$ columnas (verticales). Siempre se dice primero filas y después columnas.',
        'Las matrices organizan información: datos de una planilla, coeficientes de un sistema de ecuaciones, o una transformación del plano.',
        'Dos matrices son iguales solo si tienen la misma dimensión y coinciden **posición por posición**.',
      ],
      visual: { widget: { type: 'matrixTransform' }, caption: 'Una matriz 2×2 también es una "máquina" que transforma el plano. Explorá: cada columna dice adónde va un vector de la base.', tasks: ['Probá con la identidad: ¿qué pasa?', 'Cambiá un solo número y mirá el efecto.'] },
      theory: [
        { title: 'Notación', text: '$A = (a_{ij})$ con $i$ = fila, $j$ = columna.', formulas: ['A = \\begin{pmatrix} a_{11} & a_{12} \\\\ a_{21} & a_{22} \\end{pmatrix}'] },
        { title: 'Tipos', text: 'Cuadrada ($m = n$), diagonal, triangular, identidad $I$ (unos en la diagonal), nula, simétrica ($A = A^T$).' },
      ],
      example: { prompt: 'Si $\\begin{pmatrix} x + 1 & 2 \\\\ 0 & y \\end{pmatrix} = \\begin{pmatrix} 4 & 2 \\\\ 0 & -1 \\end{pmatrix}$, hallá $x$ e $y$.', steps: [{ text: 'Igualamos posición por posición: $x + 1 = 4$ y $y = -1$.' }, { text: '$x = 3$, $y = -1$.' }] },
      summary: ['$m\\times n$: filas × columnas.', '$a_{ij}$: fila $i$, columna $j$.'],
      pitfalls: ['Decir primero columnas.'],
      game: 'arquitecto',
    },
  },
  {
    id: 'm2', area: A, n: 2, title: 'Suma, escalar y traspuesta', short: 'Operaciones posición a posición', prereqs: ['m1'], concepts: ['m2.suma', 'm2.traspuesta'],
    lesson: {
      hook: { question: 'Tenés las ventas de enero y de febrero de tres sucursales en dos tablas iguales. ¿Cómo obtenés las ventas totales del bimestre?', reveal: 'Sumando cada casillero con el que está en la misma posición. Así se suman matrices.' },
      intuition: [
        'Sumar matrices es sumar posición a posición: por eso tienen que tener la misma dimensión.',
        'Multiplicar por un número $k$ multiplica **todos** los elementos: si todo sube un 10%, multiplicás la tabla por 1,1.',
        'La **traspuesta** $A^T$ intercambia filas por columnas: la fila 1 pasa a ser la columna 1.',
      ],
      visual: { widget: { type: 'matrixTransform' }, caption: 'Multiplicar la matriz por un número escala toda la transformación.', tasks: ['Multiplicá mentalmente por 2 y comprobalo.'] },
      theory: [
        { title: 'Propiedades', text: '', formulas: ['A + B = B + A', 'k(A + B) = kA + kB', '(A^T)^T = A', '(A + B)^T = A^T + B^T'] },
      ],
      example: { prompt: 'Calculá $2A - B$ con $A = \\begin{pmatrix}1 & 0\\\\ 3 & -1\\end{pmatrix}$, $B = \\begin{pmatrix}2 & 1\\\\ 1 & 1\\end{pmatrix}$.', steps: [{ text: '', tex: '2A = \\begin{pmatrix}2 & 0\\\\ 6 & -2\\end{pmatrix}' }, { text: '', tex: '2A - B = \\begin{pmatrix}0 & -1\\\\ 5 & -3\\end{pmatrix}' }] },
      summary: ['Suma y escalar: posición a posición.', 'Traspuesta: filas ↔ columnas.'],
      pitfalls: ['Sumar matrices de distinta dimensión.'],
      game: 'arquitecto',
    },
  },
  {
    id: 'm3', area: A, n: 3, title: 'Producto de matrices', short: 'Fila por columna', prereqs: ['m2'], concepts: ['m3.producto'],
    lesson: {
      hook: { question: 'Un local vende 3 productos; tenés una tabla con cantidades vendidas por día y otra con precios y costos por producto. ¿Cómo calculás la recaudación y el costo de cada día de una sola vez?', reveal: 'Con un producto de matrices: cada elemento del resultado es una "fila de cantidades" por una "columna de precios" (multiplicar y sumar).' },
      intuition: [
        'El elemento $(i, j)$ de $AB$ se obtiene recorriendo la fila $i$ de $A$ y la columna $j$ de $B$, multiplicando pares y sumando.',
        'Para que se pueda, la cantidad de columnas de $A$ tiene que ser igual a la cantidad de filas de $B$. Un $2\\times 3$ por un $3\\times 4$ da un $2\\times 4$.',
        'El producto **no es conmutativo**: en general $AB \\neq BA$. Representa componer transformaciones, y el orden importa.',
      ],
      visual: { widget: { type: 'matrixProduct' }, caption: 'Tocá un casillero del resultado para ver qué fila y qué columna se combinan.', tasks: ['Calculá vos un elemento y comprobalo.'] },
      theory: [
        { title: 'Definición', text: 'Si $A$ es $m\\times n$ y $B$ es $n\\times p$:', formulas: ['(AB)_{ij} = \\sum_{k=1}^{n} a_{ik} b_{kj}'] },
        { title: 'Propiedades', text: 'Asociativa: $(AB)C = A(BC)$. Distributiva. $AI = IA = A$. **No** conmutativa. $(AB)^T = B^T A^T$.' },
      ],
      example: { prompt: 'Calculá $\\begin{pmatrix}1 & 2\\\\ 0 & 1\\end{pmatrix}\\begin{pmatrix}3 & 1\\\\ 1 & 0\\end{pmatrix}$.', steps: [{ text: '$(1,1)$: $1\\cdot 3 + 2\\cdot 1 = 5$. $(1,2)$: $1\\cdot 1 + 2\\cdot 0 = 1$.' }, { text: '$(2,1)$: $0\\cdot 3 + 1\\cdot 1 = 1$. $(2,2)$: $0\\cdot 1 + 1\\cdot 0 = 0$.' }, { text: '', tex: '\\begin{pmatrix}5 & 1\\\\ 1 & 0\\end{pmatrix}' }] },
      summary: ['Fila por columna.', 'Columnas de A = filas de B.', '$AB \\neq BA$.'],
      pitfalls: ['Multiplicar posición a posición.'],
      game: 'arquitecto',
    },
  },
  {
    id: 'm4', area: A, n: 4, title: 'Determinantes', short: 'Un número que dice mucho', prereqs: ['m3'], concepts: ['m4.determinante', 'm4.propiedades'],
    lesson: {
      hook: { question: 'Una matriz 2×2 transforma el cuadrado unidad en un paralelogramo. ¿Se podría saber su área con una sola cuenta?', reveal: 'Sí: el área es $|\\det A|$. Y si el determinante es 0, el cuadrado se "aplasta" en una línea: la transformación pierde información y no se puede deshacer.' },
      intuition: [
        'El determinante es un número asociado a una matriz cuadrada. En 2×2: $ad - bc$.',
        'Geométricamente es el factor por el que se multiplican las áreas (en 3×3, los volúmenes). El signo dice si se invierte la orientación.',
        'Si $\\det A = 0$ la matriz **no es invertible**: aplasta el espacio y no se puede volver atrás.',
      ],
      visual: { widget: { type: 'matrixTransform' }, caption: 'Mirá el área del paralelogramo: coincide con |det|. Lográ que el determinante sea 0.', tasks: ['¿Qué pasa con la figura cuando det = 0?', 'Hacé que det sea negativo: ¿qué cambió?'] },
      theory: [
        { title: '2×2', text: '', formulas: ['\\det\\begin{pmatrix}a & b\\\\ c & d\\end{pmatrix} = ad - bc'] },
        { title: '3×3 (Laplace por la fila 1)', text: 'Signos alternados $+\\,-\\,+$:', formulas: ['\\det A = a_{11}M_{11} - a_{12}M_{12} + a_{13}M_{13}'] },
        { title: 'Propiedades', text: '', formulas: ['\\det(AB) = \\det A\\,\\det B', '\\det(A^T) = \\det A', '\\det(kA) = k^n\\det A', '\\text{intercambiar dos filas cambia el signo}'] },
      ],
      example: { prompt: 'Calculá $\\det\\begin{pmatrix}2 & 1 & 0\\\\ 1 & 3 & 1\\\\ 0 & 1 & 2\\end{pmatrix}$.', steps: [{ text: 'Laplace por la fila 1:', tex: '2(3\\cdot 2 - 1\\cdot 1) - 1(1\\cdot 2 - 1\\cdot 0) + 0 = 10 - 2 = 8' }] },
      summary: ['$\\det = 0$ ⇔ no invertible.', '$|\\det|$ = factor de área.', '$\\det(kA) = k^n \\det A$.'],
      pitfalls: ['Olvidar el signo menos en Laplace.', '$\\det(A + B) = \\det A + \\det B$ (falso).'],
      game: 'duelo',
    },
  },
  {
    id: 'm5', area: A, n: 5, title: 'Matriz inversa', short: 'Deshacer una matriz', prereqs: ['m4'], concepts: ['m5.inversa'],
    lesson: {
      hook: { question: 'Con números, para despejar $x$ en $3x = 12$ dividís por 3. ¿Cómo "dividís" por una matriz en $AX = B$?', reveal: 'No se divide: se multiplica por la **inversa** $A^{-1}$, la matriz que cumple $A^{-1}A = I$. Entonces $X = A^{-1}B$.' },
      intuition: [
        'La inversa deshace la transformación: si $A$ rota 30°, $A^{-1}$ rota −30°.',
        'Existe solo si $\\det A \\neq 0$.',
        'Siempre se puede verificar: $A\\cdot A^{-1}$ tiene que dar la identidad.',
      ],
      visual: { widget: { type: 'matrixTransform' }, caption: 'Aplicá una matriz y pensá qué matriz te devolvería al cuadrado original.', tasks: ['Probá con una rotación de 90°: ¿cuál es su inversa?'] },
      theory: [
        { title: 'Fórmula 2×2', text: '', formulas: ['\\begin{pmatrix}a & b\\\\ c & d\\end{pmatrix}^{-1} = \\frac{1}{ad - bc}\\begin{pmatrix}d & -b\\\\ -c & a\\end{pmatrix}'] },
        { title: 'Gauss-Jordan', text: 'Se arma $(A\\mid I)$ y con operaciones de fila se lleva a $(I\\mid A^{-1})$.' },
        { title: 'Propiedades', text: '', formulas: ['(AB)^{-1} = B^{-1}A^{-1}', '(A^{-1})^{-1} = A'] },
      ],
      example: { prompt: 'Calculá la inversa de $\\begin{pmatrix}2 & 1\\\\ 5 & 3\\end{pmatrix}$.', steps: [{ text: '$\\det = 6 - 5 = 1$.' }, { text: '', tex: 'A^{-1} = \\begin{pmatrix}3 & -1\\\\ -5 & 2\\end{pmatrix}' }, { text: 'Control: $AA^{-1} = I$ ✔' }] },
      summary: ['$A^{-1}$ existe ⇔ $\\det A \\neq 0$.', '$AX = B \\Rightarrow X = A^{-1}B$ (a la izquierda).'],
      pitfalls: ['Escribir $X = BA^{-1}$ cuando la ecuación es $AX = B$.'],
      game: 'arquitecto',
    },
  },
  {
    id: 'm6', area: A, n: 6, title: 'Sistemas y método de Gauss', short: 'Resolver y clasificar sistemas', prereqs: ['m5'], concepts: ['m6.sistemas', 'm6.gauss', 'm6.clasificacion'],
    lesson: {
      hook: { question: 'Dos rectas en el plano: ¿de cuántas formas distintas se pueden "encontrar"?', reveal: 'Tres: se cortan en un punto (una solución), son la misma recta (infinitas) o son paralelas (ninguna). Todo sistema lineal cae en uno de esos tres casos.' },
      intuition: [
        'Un sistema de ecuaciones lineales se puede escribir como $AX = b$. La matriz ampliada $(A\\mid b)$ guarda toda la información.',
        'El **método de Gauss** usa operaciones de fila (intercambiar, multiplicar por un número no nulo, sumar un múltiplo de otra) para escalonar. Esas operaciones no cambian las soluciones.',
        'Comparando rangos se clasifica el sistema (teorema de Rouché–Frobenius).',
      ],
      visual: { widget: { type: 'systemLines' }, caption: 'Cada ecuación es una recta. Modificá los coeficientes y mirá cómo cambia la cantidad de soluciones.', tasks: ['Hacé que las rectas sean paralelas.', 'Hacé que sean la misma recta.'] },
      theory: [
        { title: 'Rouché–Frobenius', text: 'Con $n$ incógnitas:', formulas: ['\\operatorname{rg}A \\neq \\operatorname{rg}(A|b) \\Rightarrow \\text{SI}', '\\operatorname{rg}A = \\operatorname{rg}(A|b) = n \\Rightarrow \\text{SCD}', '\\operatorname{rg}A = \\operatorname{rg}(A|b) < n \\Rightarrow \\text{SCI}'] },
        { title: 'Operaciones de fila', text: '$F_i \\leftrightarrow F_j$, $F_i \\to kF_i$ ($k \\neq 0$), $F_i \\to F_i + kF_j$.' },
      ],
      example: { prompt: 'Resolvé $\\begin{cases} x + y = 5 \\\\ 2x - y = 1\\end{cases}$.', steps: [{ text: '', tex: '\\left(\\begin{array}{cc|c} 1 & 1 & 5 \\\\ 2 & -1 & 1\\end{array}\\right) \\xrightarrow{F_2 - 2F_1} \\left(\\begin{array}{cc|c} 1 & 1 & 5 \\\\ 0 & -3 & -9\\end{array}\\right)' }, { text: '$-3y = -9 \\Rightarrow y = 3$; $x = 5 - 3 = 2$.' }] },
      summary: ['Gauss: escalonar y despejar de abajo hacia arriba.', 'SCD / SCI / SI según rangos.'],
      pitfalls: ['No aplicar la operación a la columna ampliada.'],
      game: 'arquitecto',
    },
  },
  {
    id: 'm7', area: A, n: 7, title: 'Transformaciones y aplicaciones', short: 'Matrices que mueven el plano', prereqs: ['m6'], concepts: ['m7.transformaciones'],
    lesson: {
      hook: { question: '¿Cómo hace un videojuego para rotar un personaje o hacerlo más grande?', reveal: 'Multiplica las coordenadas de cada punto por una matriz. Rotar, reflejar, estirar y deformar son todas **transformaciones lineales**.' },
      intuition: [
        'Una matriz 2×2 manda el vector $(1, 0)$ a su primera columna y el $(0, 1)$ a la segunda. Con eso queda determinado todo lo demás.',
        'Rotación de ángulo $\\theta$: columnas $(\\cos\\theta, \\operatorname{sen}\\theta)$ y $(-\\operatorname{sen}\\theta, \\cos\\theta)$.',
        'Componer transformaciones = multiplicar matrices (la que se aplica primero va a la derecha).',
      ],
      visual: { widget: { type: 'matrixTransform' }, caption: 'Elegí transformaciones predefinidas o escribí tu matriz y mirá cómo se deforma la cuadrícula.', tasks: ['Construí una rotación de 90°.', 'Construí una simetría respecto de y = x.'] },
      theory: [
        { title: 'Matrices clásicas', text: '', formulas: ['R_{90°} = \\begin{pmatrix}0 & -1\\\\ 1 & 0\\end{pmatrix}', 'S_x = \\begin{pmatrix}1 & 0\\\\ 0 & -1\\end{pmatrix}', 'H_k = \\begin{pmatrix}k & 0\\\\ 0 & k\\end{pmatrix}'] },
        { title: 'Área', text: 'Toda figura se transforma en otra de área multiplicada por $|\\det A|$.' },
      ],
      example: { prompt: '¿Adónde manda $\\begin{pmatrix}0 & -1\\\\ 1 & 0\\end{pmatrix}$ al punto $(2, 1)$?', steps: [{ text: '', tex: '\\begin{pmatrix}0 & -1\\\\ 1 & 0\\end{pmatrix}\\binom{2}{1} = \\binom{-1}{2}' }, { text: 'Es una rotación de 90° antihoraria.' }] },
      summary: ['Columnas = imágenes de la base.', 'Componer = multiplicar.', '$|\\det|$ = factor de área.'],
      pitfalls: ['Aplicar las transformaciones en el orden equivocado.'],
      game: 'arquitecto',
    },
  },
]
