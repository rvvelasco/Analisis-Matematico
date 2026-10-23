import type { Unit } from '../types'

const A = 'vectores' as const

export const VECTORES_UNITS: Unit[] = [
  {
    id: 'v1', area: A, n: 1, title: 'Qué es un vector', short: 'Flechas, componentes y módulo', prereqs: [], concepts: ['v1.concepto', 'v1.modulo'],
    lesson: {
      hook: { question: 'Si te digo "caminá 5 cuadras", ¿llegás a un lugar preciso?', reveal: 'No: falta saber **hacia dónde**. Un vector guarda las dos cosas: cuánto (módulo) y hacia dónde (dirección y sentido).' },
      intuition: [
        'Un vector es una flecha: tiene longitud, dirección y sentido. En el plano se describe con dos componentes $(x, y)$: cuánto se mueve en horizontal y cuánto en vertical.',
        'El vector que va de $P$ a $Q$ es $Q - P$ ("punta menos cola").',
        'El **módulo** es la longitud de la flecha, y sale de Pitágoras.',
      ],
      visual: { widget: { type: 'vectors' }, caption: 'Arrastrá las puntas de los vectores y mirá sus componentes y módulos.', tasks: ['Armá un vector de módulo 5 con componentes enteras.'] },
      theory: [
        { title: 'Módulo', text: '', formulas: ['|(x, y)| = \\sqrt{x^2 + y^2}', '|(x, y, z)| = \\sqrt{x^2 + y^2 + z^2}'] },
        { title: 'Versor', text: 'Vector de módulo 1 en la misma dirección:', formulas: ['\\hat v = \\frac{\\vec v}{|\\vec v|}'] },
      ],
      example: { prompt: 'Hallá $\\vec{PQ}$ y su módulo para $P = (1, 2)$, $Q = (4, 6)$.', steps: [{ text: '', tex: '\\vec{PQ} = (4 - 1, 6 - 2) = (3, 4)' }, { text: '', tex: '|\\vec{PQ}| = \\sqrt{9 + 16} = 5' }] },
      summary: ['Vector = módulo + dirección + sentido.', '$\\vec{PQ} = Q - P$.'],
      pitfalls: ['Hacer $P - Q$.', 'Sumar componentes para el módulo.'],
      game: 'sandbox',
    },
  },
  {
    id: 'v2', area: A, n: 2, title: 'Operaciones con vectores', short: 'Sumar, restar y escalar', prereqs: ['v1'], concepts: ['v2.operaciones'],
    lesson: {
      hook: { question: 'Un avión vuela hacia el norte a 800 km/h y hay viento hacia el este a 60 km/h. ¿Hacia dónde se mueve realmente?', reveal: 'La velocidad real es la **suma** de los dos vectores: un poco desviado al noreste. Sumar vectores es encadenar desplazamientos.' },
      intuition: [
        'Para sumar: se suman componente a componente. Gráficamente, se pone la cola del segundo en la punta del primero (o se arma un paralelogramo).',
        'Multiplicar por un número $k$ estira el vector $|k|$ veces; si $k < 0$, además lo da vuelta.',
        'Restar $\\vec u - \\vec v$ es sumar el opuesto: la flecha que va de la punta de $\\vec v$ a la de $\\vec u$.',
      ],
      visual: { widget: { type: 'vectors' }, caption: 'La flecha verde es la suma. Arrastrá los vectores y mirá la regla del paralelogramo.', tasks: ['Lográ que la suma sea el vector nulo.'] },
      theory: [
        { title: 'Operaciones', text: '', formulas: ['(a, b) + (c, d) = (a + c, b + d)', 'k(a, b) = (ka, kb)'] },
        { title: 'Desigualdad triangular', text: '', formulas: ['|\\vec u + \\vec v| \\le |\\vec u| + |\\vec v|'] },
      ],
      example: { prompt: 'Calculá $2\\vec u - \\vec v$ con $\\vec u = (1, -2)$, $\\vec v = (3, 1)$.', steps: [{ text: '', tex: '2(1, -2) - (3, 1) = (2 - 3, -4 - 1) = (-1, -5)' }] },
      summary: ['Componente a componente.', 'Escalar negativo: invierte el sentido.'],
      pitfalls: ['Creer que $|\\vec u + \\vec v| = |\\vec u| + |\\vec v|$.'],
      game: 'sandbox',
    },
  },
  {
    id: 'v3', area: A, n: 3, title: 'Producto escalar y ángulo', short: 'Cuánto apuntan para el mismo lado', prereqs: ['v2'], concepts: ['v3.escalar', 'v3.angulo'],
    lesson: {
      hook: { question: 'Empujás un carrito con una fuerza inclinada. ¿Toda la fuerza sirve para moverlo hacia adelante?', reveal: 'No: solo la parte de la fuerza en la dirección del movimiento. El **producto escalar** mide justamente eso: cuánto de un vector "va en la dirección" del otro.' },
      intuition: [
        'El producto escalar $\\vec u\\cdot\\vec v$ es un **número**: se multiplican componentes y se suman.',
        'También vale $|\\vec u||\\vec v|\\cos\\theta$: es positivo si el ángulo es agudo, cero si son perpendiculares, negativo si es obtuso.',
        'Despejando, se obtiene el ángulo entre dos vectores.',
      ],
      visual: { widget: { type: 'dot' }, caption: 'Mové los vectores: el producto escalar cambia de signo al pasar por 90°.', tasks: ['Encontrá una posición con producto escalar 0.'] },
      theory: [
        { title: 'Definición', text: '', formulas: ['\\vec u\\cdot\\vec v = u_1v_1 + u_2v_2 (+ u_3v_3)', '\\vec u\\cdot\\vec v = |\\vec u||\\vec v|\\cos\\theta'] },
        { title: 'Perpendicularidad', text: '', formulas: ['\\vec u \\perp \\vec v \\iff \\vec u\\cdot\\vec v = 0'] },
      ],
      example: { prompt: 'Ángulo entre $(1, 0)$ y $(1, 1)$.', steps: [{ text: '', tex: '\\cos\\theta = \\frac{1}{1\\cdot\\sqrt2} = \\frac{\\sqrt2}{2} \\Rightarrow \\theta = 45°' }] },
      summary: ['Da un número.', 'Signo ↔ tipo de ángulo.', '0 ⇔ perpendiculares.'],
      pitfalls: ['Dar un vector como resultado.'],
      game: 'duelo',
    },
  },
  {
    id: 'v4', area: A, n: 4, title: 'Proyecciones y producto vectorial', short: 'Sombras y perpendiculares', prereqs: ['v3'], concepts: ['v4.proyeccion', 'v4.vectorial'],
    lesson: {
      hook: { question: 'Al mediodía tu sombra es cortita; a la tarde, larguísima. ¿De qué depende el largo de la sombra?', reveal: 'Del ángulo con que llega la luz. La **proyección** de un vector sobre otro es su "sombra" sobre la dirección del otro.' },
      intuition: [
        'La proyección escalar de $\\vec a$ sobre $\\vec b$ es el largo (con signo) de la sombra: $\\frac{\\vec a\\cdot\\vec b}{|\\vec b|}$.',
        'La proyección vectorial es esa sombra como vector, apuntando como $\\vec b$.',
        'En el espacio, el producto vectorial $\\vec u\\times\\vec v$ da un vector **perpendicular** a ambos, cuyo módulo es el área del paralelogramo que forman.',
      ],
      visual: { widget: { type: 'dot' }, caption: 'La flecha punteada es la proyección de u sobre v.', tasks: ['¿Cuándo la proyección es nula?', '¿Cuándo es igual a u?'] },
      theory: [
        { title: 'Proyecciones', text: '', formulas: ['\\operatorname{comp}_{\\vec b}\\vec a = \\frac{\\vec a\\cdot\\vec b}{|\\vec b|}', '\\operatorname{proy}_{\\vec b}\\vec a = \\frac{\\vec a\\cdot\\vec b}{|\\vec b|^2}\\vec b'] },
        { title: 'Producto vectorial', text: '', formulas: ['\\vec u\\times\\vec v = \\begin{vmatrix}\\hat i & \\hat j & \\hat k\\\\ u_1 & u_2 & u_3 \\\\ v_1 & v_2 & v_3\\end{vmatrix}', '|\\vec u\\times\\vec v| = |\\vec u||\\vec v|\\operatorname{sen}\\theta'] },
      ],
      example: { prompt: 'Calculá $(1, 0, 0)\\times(0, 1, 0)$.', steps: [{ text: '', tex: '(0\\cdot0 - 0\\cdot1,\\ 0\\cdot0 - 1\\cdot0,\\ 1\\cdot1 - 0\\cdot0) = (0, 0, 1)' }, { text: '$\\hat i\\times\\hat j = \\hat k$ (regla de la mano derecha).' }] },
      summary: ['Proyección = sombra.', '$\\vec u\\times\\vec v$ ⟂ a ambos; módulo = área.'],
      pitfalls: ['Olvidar el signo de la componente $\\hat j$.', 'Confundir $|\\vec b|$ con $|\\vec b|^2$.'],
      game: 'sandbox',
    },
  },
  {
    id: 'v5', area: A, n: 5, title: 'Combinación lineal y dependencia', short: 'Qué se puede construir con ciertos vectores', prereqs: ['v3', 'm4'], concepts: ['v5.combinacion', 'v5.dependencia'],
    lesson: {
      hook: { question: 'Si solo podés moverte en múltiplos de $(1, 0)$ y de $(1, 1)$, ¿podés llegar a cualquier punto del plano?', reveal: 'Sí: cualquier punto se escribe como $\\alpha(1, 0) + \\beta(1, 1)$. Pero si tuvieras $(1, 1)$ y $(2, 2)$, solo podrías moverte sobre una recta: esos vectores son **dependientes**.' },
      intuition: [
        'Una **combinación lineal** de $\\vec u$ y $\\vec v$ es $\\alpha\\vec u + \\beta\\vec v$: estirar cada uno y sumarlos.',
        'Los vectores son **linealmente dependientes** si alguno se puede armar con los otros (no aporta nada nuevo).',
        'En el plano, dos vectores son LD si son paralelos, o sea si su determinante es 0.',
      ],
      visual: { widget: { type: 'span' }, caption: 'Mové α y β para llegar al punto objetivo. Si u y v son paralelos, solo cubrís una recta.', tasks: ['Llegá al punto objetivo.', 'Hacé u y v paralelos: ¿qué zona cubrís?'] },
      theory: [
        { title: 'Independencia lineal', text: '$\\{\\vec v_1, \\dots, \\vec v_k\\}$ es LI si la única combinación que da $\\vec 0$ es la que tiene todos los coeficientes 0.' },
        { title: 'Criterio con determinantes', text: '$n$ vectores de $\\mathbb R^n$ son LI ⇔ el determinante de la matriz que forman es distinto de 0.' },
      ],
      example: { prompt: '¿Son LI $(1, 2)$ y $(3, 6)$?', steps: [{ text: '$\\det = 1\\cdot 6 - 2\\cdot 3 = 0$: son LD.' }, { text: 'De hecho $(3, 6) = 3(1, 2)$.' }] },
      summary: ['Combinación lineal: $\\alpha\\vec u + \\beta\\vec v$.', 'LD ⇔ uno es combinación de otros.'],
      pitfalls: ['Pensar que el conjunto con el vector nulo puede ser LI.'],
      game: 'sandbox',
    },
  },
  {
    id: 'v6', area: A, n: 6, title: 'Bases y dimensión', short: 'Sistemas de coordenadas', prereqs: ['v5'], concepts: ['v6.base'],
    lesson: {
      hook: { question: 'Un mismo lugar se puede describir como "3 cuadras al norte y 2 al este" o con otro sistema de calles diagonales. ¿Cambia el lugar?', reveal: 'No cambia el punto, cambian las **coordenadas**, porque cambió la **base** (las direcciones de referencia).' },
      intuition: [
        'Una **base** es un conjunto de vectores LI que genera todo el espacio: con ellos se arma cualquier vector de **una sola manera**.',
        'La **dimensión** es la cantidad de vectores de cualquier base: 2 en el plano, 3 en el espacio.',
        'Las coordenadas de un vector en una base son los coeficientes de esa única combinación.',
      ],
      visual: { widget: { type: 'span' }, caption: 'Con dos vectores no paralelos, la grilla que generan cubre todo el plano: son una base.', tasks: ['Elegí otra base y hallá las coordenadas del punto objetivo.'] },
      theory: [
        { title: 'Base', text: '$B$ es base de $V$ si es LI y genera $V$.' },
        { title: 'Dimensión', text: '$\\dim\\mathbb R^n = n$. Más de $n$ vectores en $\\mathbb R^n$ siempre son LD; menos de $n$ no generan.' },
      ],
      example: { prompt: 'Coordenadas de $(5, 3)$ en la base $\\{(1, 1), (1, -1)\\}$.', steps: [{ text: '$\\alpha + \\beta = 5$, $\\alpha - \\beta = 3$.' }, { text: '$\\alpha = 4$, $\\beta = 1$: coordenadas $(4, 1)$.' }] },
      summary: ['Base = LI + generador.', 'Dimensión = tamaño de una base.'],
      pitfalls: ['Contar vectores en lugar de vectores independientes.'],
      game: 'sandbox',
    },
  },
]
