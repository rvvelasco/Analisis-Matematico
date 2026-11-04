/** Modelo de 2.º parcial: cada ejercicio explicado en simple, con la base teórica, y práctica con ejercicios parecidos. */
import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import type { Exercise, Level } from '../engine/types'
import { getTemplate, instantiate } from '../engine/registry'
import { unitById } from '../content/curriculum'
import { SessionPlayer } from '../exercise/Session'
import { Md, TeX } from '../ui/Md'
import { Plot } from '../ui/Plot'
import { Mascot, Speech } from '../ui/Mascot'
import { Bar } from '../ui/Layout'
import { NotFound } from './Learn'
import { VIDEOS } from '../videos/scripts'

interface Paso { t: string; tex?: string }
interface Ej {
  n: number
  titulo: string
  tema: string
  enunciado: string
  pide: string
  saber: string[]
  guias: string[]
  pasos: Paso[]
  resultado: string
  trampa: string
  extra?: ReactNode
  practica: { id: string; level?: Level }[]
}

const V = ({ v }: { v: boolean }) => <span className={'mr-2 inline-grid h-7 min-w-[1.75rem] place-items-center rounded-lg px-1.5 text-sm font-black text-white ' + (v ? 'bg-ok' : 'bg-bad')}>{v ? 'V' : 'F'}</span>

const VF_TEORIA: { s: string; v: boolean | 'depende'; why: string }[] = [
  { s: '1. Una función integrable es derivable (en un intervalo dado / en todo su dominio).', v: false, why: 'Falso las dos. $|x|$ es integrable (tiene área) pero en $x = 0$ tiene un pico: no es derivable. Integrar pide poco; derivar pide mucho.' },
  { s: '2. La derivada es una variación y la integral una acumulación.', v: true, why: 'Verdadero. Derivada = cuánto cambia (velocidad). Integral = cuánto se juntó (distancia recorrida).' },
  { s: '3. La integración es evaluada en un intervalo.', v: true, why: 'Verdadero para la integral **definida**: $\\int_a^b$ usa el intervalo $[a, b]$ y da un número. (La indefinida da una familia de funciones $F + C$.)' },
  { s: '4. La derivada se calcula en un punto.', v: true, why: 'Verdadero: $f\'(x_0) = \\lim_{\\Delta x \\to 0}\\frac{f(x_0 + \\Delta x) - f(x_0)}{\\Delta x}$ es un límite **en el punto** $x_0$.' },
  { s: '5. La integral es un límite de una suma.', v: true, why: 'Verdadero: es el límite de las sumas de Riemann (rectángulos cada vez más finitos): $\\int_a^b f = \\lim \\sum f(x_i)\\,\\Delta x_i$.' },
  { s: '6. La suma de dos integrales es la integral de la suma.', v: true, why: 'Verdadero: $\\int f + \\int g = \\int (f + g)$ (linealidad). Ojo: con el **producto** no vale.' },
  { s: '7. Una función derivable es integrable.', v: true, why: 'Verdadero (en un intervalo $[a, b]$): derivable ⇒ continua ⇒ integrable.' },
  { s: '8. Si $f$ es integrable con primitiva $F + C$, existe la derivada.', v: 'depende', why: 'Si habla de la derivada de la primitiva $F$: **Verdadero**, $F\' = f$ (eso significa ser primitiva). Si habla de la derivada de la función $f$: **Falso** ($|x|$ tiene primitiva y no es derivable en 0). En el examen aclará cuál interpretás.' },
  { s: '9. Una función derivable es integrable (para un intervalo dado / para todo su dominio).', v: 'depende', why: 'En un intervalo dado $[a, b]$: **Verdadero**. En todo su dominio: **Falso** si el dominio no es acotado: $f(x) = x$ es derivable en todo $\\mathbb{R}$ pero $\\int_{-\\infty}^{\\infty} x\\,dx$ no existe.' },
]

const EJERCICIOS: Ej[] = [
  {
    n: 1, titulo: 'Gráfico, intervalo de análisis y derivabilidad', tema: 'Derivada en un punto',
    enunciado: 'Dado el gráfico de $f$, trabajar en el intervalo de análisis $$I = \\left[-2\\pi;\\ -\\tfrac{4}{5}\\right] \\cup \\left(\\pi;\\ \\tfrac{8\\pi}{2}\\right)$$ y analizar la derivabilidad en los puntos marcados (por ejemplo $x_0 = \\frac{\\pi}{2}$), usando $$f\'(x_0) = \\lim_{\\Delta x \\to 0}\\frac{f(x_0 + \\Delta x) - f(x_0)}{\\Delta x},\\qquad \\Delta x = x - x_0$$',
    pide: 'Dos cosas: (1) leer bien el intervalo, para saber **qué puntos importan**, y (2) decidir si en cada punto marcado la función es derivable o no.',
    saber: [
      '**Corchete** $[\\ ]$: el borde entra. **Paréntesis** $(\\ )$: el borde **no** entra. $\\cup$ = "unión": son dos pedazos separados.',
      'Pasá todo a decimales: $-2\\pi \\approx -6{,}28$, $-\\frac45 = -0{,}8$, $\\pi \\approx 3{,}14$, $\\frac{8\\pi}{2} = 4\\pi \\approx 12{,}57$.',
      'La derivada en $x_0$ es la **pendiente** de la recta tangente. Existe si el límite da lo mismo acercándote por izquierda y por derecha.',
      'Una función **no** es derivable en: un **pico** (forma de V), un **salto**, o una tangente **vertical**.',
      'Continua no alcanza: $|x|$ es continua en 0 y ahí no es derivable.',
    ],
    guias: ['f2', 'd2'],
    pasos: [
      { t: 'Ubico los puntos marcados. $x_0 = \\frac{\\pi}{2} \\approx 1{,}57$ está **entre** $-0{,}8$ y $3{,}14$: cae en el **hueco** del intervalo, así que no se analiza (o se dice que queda fuera del intervalo de análisis).' },
      { t: 'En los puntos que sí están adentro (en el pedazo $(\\pi;\\ 4\\pi)$), miro la forma de la curva: donde es suave (redondeada), es derivable. Donde hace una **punta**, no.' },
      { t: 'En una punta, las pendientes por izquierda y por derecha son distintas. Ejemplo con $f(x) = |x - x_0|$:', tex: '\\lim_{\\Delta x \\to 0^-}\\frac{|\\Delta x|}{\\Delta x} = -1 \\quad\\neq\\quad \\lim_{\\Delta x \\to 0^+}\\frac{|\\Delta x|}{\\Delta x} = 1' },
      { t: 'Como los límites laterales no coinciden, el límite no existe: **no es derivable** en ese punto (aunque sea continua).' },
    ],
    resultado: 'Solo se estudian los puntos dentro de $I$. En los picos: **no derivable** (las derivadas laterales no coinciden). En los máximos y mínimos **redondeados**: derivable, y la derivada vale 0.',
    trampa: 'El profe marca puntos que quedan **fuera** del intervalo (como $\\frac{\\pi}{2}$) para ver si te das cuenta. Y ojo: el borde $\\pi$ va con paréntesis, así que no entra.',
    extra: <Plot fns={[{ f: '1.2 + 0.6*sin(x) + 0.35*abs(x - 3*pi/2) - 0.02*x', label: 'f' }]} vlines={[{ x: -2 * Math.PI, label: '−2π' }, { x: -0.8, label: '−4/5' }, { x: Math.PI, label: 'π' }, { x: 4 * Math.PI, label: '4π' }]} points={[{ x: Math.PI / 2, y: 1.2 + 0.6 + 0.35 * Math.PI - 0.02 * Math.PI / 2, label: 'π/2 (fuera)' }, { x: 1.5 * Math.PI, y: 1.2 - 0.6 - 0.03 * Math.PI, label: 'pico' }]} x={[-7, 13.5]} y={[-1, 4]} />,
    practica: [{ id: 'px.intervalo' }, { id: 'px.pico', level: 2 }, { id: 'px.pico', level: 3 }],
  },
  {
    n: 2, titulo: 'Verdadero o falso de teoría', tema: 'Teoría derivada / integral',
    enunciado: 'Responder V o F las 9 afirmaciones sobre derivadas e integrales (abajo está la lista completa, con la respuesta de cada una).',
    pide: 'Que decidas si cada frase es cierta **siempre**. Si encontrás un solo ejemplo donde falla, es falsa.',
    saber: [
      'La cadena de oro: **derivable ⇒ continua ⇒ integrable** (en un intervalo $[a, b]$). Las flechas **no** valen al revés.',
      'Contraejemplo comodín: $|x|$ es continua e integrable, pero en $x = 0$ **no** es derivable.',
      'Integral definida $\\int_a^b f$ = número (área con signo). Integral indefinida $\\int f = F + C$ = familia de funciones.',
      '"Para todo su dominio" puede ser un intervalo infinito: ahí la integral puede no existir.',
    ],
    guias: ['d2', 'i2', 'i7'],
    pasos: [{ t: 'Leé cada frase y preguntate: ¿hay alguna función que la rompa? Si la hay, es F. Si es una definición o un teorema, es V.' }],
    resultado: 'Están en la lista de arriba: **F, V, V, V, V, V, V**; la 8 y la 9 dependen de cómo se lean (está explicado en cada una).',
    trampa: 'Las frases con "para todo su dominio" y las que dan vuelta un teorema (integrable ⇒ derivable) suelen ser falsas.',
    extra: (
      <ul className="grid gap-2">
        {VF_TEORIA.map((x, i) => (
          <li key={i} className="rounded-2xl border-2 border-line p-3">
            <div className="flex items-start font-bold">{x.v === 'depende' ? <span className="mr-2 inline-grid h-7 place-items-center rounded-lg bg-gold px-1.5 text-xs font-black text-white">V/F</span> : <V v={x.v} />}<Md text={x.s} /></div>
            <div className="mt-1 text-sm font-semibold text-muted"><Md text={x.why} /></div>
          </li>
        ))}
      </ul>
    ),
    practica: [{ id: 'i7.tf.teoria' }],
  },
  {
    n: 3, titulo: 'Integral con límites iguales y sumas de Riemann', tema: 'Propiedades',
    enunciado: '$$\\int_{10}^{10} \\left(\\cos^2 x + \\operatorname{sen} x\\right)dx$$',
    pide: 'El valor de la integral, **sin hacer cuentas**.',
    saber: [
      'La integral es un **límite de sumas de rectángulos**: $\\int_a^b f \\approx \\sum f(x_i)\\,\\Delta x_i$ (altura × base).',
      'Si $a = b$, no hay ancho: la base de cada rectángulo es 0, y el área es 0.',
      'Con Barrow: $\\int_a^a f = F(a) - F(a) = 0$.',
    ],
    guias: ['i2', 'i7'],
    pasos: [{ t: 'Miro los límites: arriba 10, abajo 10. Son iguales.' }, { t: 'Entonces:', tex: '\\int_{10}^{10} (\\cos^2 x + \\operatorname{sen} x)\\,dx = F(10) - F(10) = 0' }],
    resultado: '$0$.',
    trampa: 'La función es fea a propósito, para que te pongas a integrar. Mirá siempre primero los límites.',
    practica: [{ id: 'px.cero', level: 1 }],
  },
  {
    n: 4, titulo: 'Límites: qué puede dar', tema: 'Límites',
    enunciado: '$$\\lim_{x \\to\\, ?} f(x) = \;?$$',
    pide: 'Saber reconocer **qué tipo de resultado** da un límite cuando reemplazás.',
    saber: [
      'Un límite puede dar: un **número**, $+\\infty$ o $-\\infty$.',
      '$\\frac{\\text{número} \\neq 0}{0}$ → el límite da $\\pm\\infty$ (asíntota vertical).',
      '$\\frac{0}{0}$ y $\\frac{\\infty}{\\infty}$ son **indeterminaciones**: no son un resultado, te avisan que hay que trabajar (factorizar, simplificar, dividir por la mayor potencia).',
      '$\\frac{0}{\\text{número} \\neq 0} = 0$ (eso sí es un resultado).',
    ],
    guias: ['f10'],
    pasos: [
      { t: 'Reemplazo $x$ por el valor al que tiende.' },
      { t: 'Si da número/número (abajo no es 0): listo.' },
      { t: 'Si da número/0: es $\\pm\\infty$.' },
      { t: 'Si da $\\frac00$: factorizo y simplifico. Ejemplo:', tex: '\\lim_{x\\to 2}\\frac{x^2 - 4}{x - 2} = \\lim_{x\\to 2}\\frac{(x - 2)(x + 2)}{x - 2} = \\lim_{x\\to 2}(x + 2) = 4' },
      { t: 'Si da $\\frac{\\infty}{\\infty}$: divido todo por la mayor potencia de $x$.' },
    ],
    resultado: 'Número, $+\\infty$, $-\\infty$, o indeterminación ($\\frac00$, $\\frac\\infty\\infty$) que hay que salvar.',
    trampa: '$\\frac00$ **no** es 0 ni 1. Y $\\frac{5}{0}$ **no** es 0.',
    practica: [{ id: 'px.limiteTipo', level: 2 }, { id: 'px.limiteTipo', level: 3 }, { id: 'f10.factor' }],
  },
  {
    n: 5, titulo: 'Antes de calcular, mirá el álgebra', tema: 'Dominio y ceros',
    enunciado: '$$\\frac{1}{x - a};\\quad \\frac{1}{x^2 - 2x + 7};\\quad \\frac{1}{\\operatorname{sen} x};\\quad \\frac{1}{\\cos x};\\quad \\operatorname{tg}(4x^2 + 8x - 7)$$',
    pide: 'Encontrar dónde **se anula el denominador** (donde la función tiene problemas), antes de calcular límites, derivadas o integrales.',
    saber: [
      '$x - a = 0 \\iff x = a$.',
      '$x^2 - 2x + 7$: discriminante $b^2 - 4ac = 4 - 28 = -24 < 0$ → **nunca** se anula.',
      '$\\operatorname{sen} x = 0 \\iff x = n\\pi$, $n \\in \\mathbb{Z}$ (… $-\\pi, 0, \\pi, 2\\pi$ …).',
      '$\\cos x = 0 \\iff x = \\frac{\\pi}{2} + n\\pi$, $n \\in \\mathbb{Z}$ (… $-\\frac\\pi2, \\frac\\pi2, \\frac{3\\pi}2$ …).',
      '$\\operatorname{tg} u = \\frac{\\operatorname{sen} u}{\\cos u}$ falla donde $\\cos u = 0$: $u = \\frac{\\pi}{2} + n\\pi$.',
    ],
    guias: ['f1', 'f4', 'f7'],
    pasos: [
      { t: 'Para cada función, igualo a 0 lo que está **dividiendo**.' },
      { t: 'Para $\\operatorname{tg}(4x^2 + 8x - 7)$ los problemas están cuando', tex: '4x^2 + 8x - 7 = \\frac{\\pi}{2} + n\\pi' },
    ],
    resultado: '$x = a$; nunca; $x = n\\pi$; $x = \\frac{\\pi}{2} + n\\pi$; $4x^2 + 8x - 7 = \\frac{\\pi}{2} + n\\pi$.',
    trampa: 'Ojo con lo que quedó escrito en la pizarra: "$\\cos x = 0 \\iff x = \\frac{n\\pi}{2}$" **no es correcto**: incluye $x = 0$ y $x = \\pi$, donde el coseno vale 1 y −1. Lo correcto es $x = \\frac{\\pi}{2} + n\\pi$ (los múltiplos **impares** de $\\frac\\pi2$).',
    practica: [{ id: 'px.ceros' }],
  },
  {
    n: 6, titulo: 'V o F con integrales', tema: 'Propiedades',
    enunciado: '**a)** $\\int(\\cos x + \\operatorname{sen} x)\\,dx = \\int\\cos x\\,dx - 2\\int\\operatorname{sen} x\\,dx + \\int\\operatorname{sen} x\\,dx$\n\n**b)** $\\int_{-2}^{1}\\frac{x^2}{3}dx = \\int_{-2}^{0}\\frac{x^2}{3}dx + \\int_{0}^{1}\\frac{x^2}{3}dx$\n\n**c)** $\\int_{-2\\pi}^{2\\pi}\\operatorname{sen} x\\,dx = 0$',
    pide: 'Decidir V o F en cada una, con justificación.',
    saber: [
      '**Linealidad:** $\\int (f + g) = \\int f + \\int g$ y $\\int k f = k\\int f$. Por eso $a\\int f + b\\int f = (a + b)\\int f$.',
      '**Aditiva:** $\\int_a^b f = \\int_a^c f + \\int_c^b f$ (partir el camino en un punto).',
      '**Barrow:** $\\int_a^b f = F(b) - F(a)$. $\\int \\operatorname{sen} x\\,dx = -\\cos x$.',
      'Si $f$ es **impar** (como $\\operatorname{sen} x$, $x^3$), en un intervalo simétrico $[-L, L]$ la integral da 0.',
    ],
    guias: ['i4', 'i7'],
    pasos: [
      { t: '**a)** Junto lo del seno: $-2 + 1 = -1$. Queda $\\int\\cos x\\,dx - \\int\\operatorname{sen} x\\,dx$, pero a la izquierda había $+\\int\\operatorname{sen} x\\,dx$.', tex: '\\int\\cos x\\,dx - \\int \\operatorname{sen} x\\,dx \\neq \\int \\cos x\\,dx + \\int \\operatorname{sen} x\\,dx \\quad\\Rightarrow\\quad \\textbf{F}' },
      { t: '**b)** Es partir el intervalo $[-2, 1]$ en el punto 0: propiedad aditiva → **V**.' },
      { t: '**c)** Barrow:', tex: '\\int_{-2\\pi}^{2\\pi}\\operatorname{sen} x\\,dx = [-\\cos x]_{-2\\pi}^{2\\pi} = -\\cos(2\\pi) + \\cos(-2\\pi) = -1 + 1 = 0 \\quad\\Rightarrow\\quad \\textbf{V}' },
    ],
    resultado: 'a) **F** · b) **V** · c) **V**.',
    trampa: 'En a) el profe "disfraza" la integral: parece la propiedad, pero los números del seno suman −1, no 1.',
    practica: [{ id: 'px.vfIntegral' }],
  },
  {
    n: 7, titulo: 'Cambio de variable en una integral definida', tema: 'Sustitución',
    enunciado: '$$\\int_0^{\\pi/2}\\operatorname{sen}\\left(\\tfrac{1}{2}t\\right)dt$$ Y en el recuadro: $\\displaystyle\\int_0^{2\\pi}\\operatorname{sen}\\left(\\tfrac12 x\\right)dt$ (¡ojo con la variable!).',
    pide: 'Calcular la integral con cambio de variable, y darte cuenta en el recuadro de **respecto de qué letra** se integra.',
    saber: [
      'Cambio de variable: elijo $u$ = lo de adentro, calculo $du$ y despejo $dt$.',
      '$\\int \\operatorname{sen} u\\,du = -\\cos u + C$ (¡el menos!).',
      'Atajo: $\\int\\operatorname{sen}(a t)\\,dt = -\\frac{1}{a}\\cos(at) + C$.',
      'Valores: $\\cos 0 = 1$, $\\cos\\frac\\pi4 = \\frac{\\sqrt2}{2}$, $\\cos\\frac\\pi2 = 0$, $\\cos\\pi = -1$.',
      'El $d\\square$ dice **quién se mueve**. Lo que no tenga esa letra es una constante.',
    ],
    guias: ['i5', 'i7', 'f7'],
    pasos: [
      { t: 'Cambio: $u = \\frac{t}{2}$ → $du = \\frac12 dt$ → $dt = 2\\,du$.', tex: '\\int\\operatorname{sen}\\left(\\tfrac t2\\right)dt = \\int 2\\operatorname{sen}(u)\\,du = -2\\cos u = -2\\cos\\left(\\tfrac t2\\right) + C' },
      { t: 'Barrow con los límites de $t$:', tex: '\\left[-2\\cos\\left(\\tfrac t2\\right)\\right]_0^{\\pi/2} = -2\\left[\\cos\\tfrac{\\pi}{4} - \\cos 0\\right] = -2\\left[\\tfrac{\\sqrt2}{2} - 1\\right] = 2 - \\sqrt2 \\approx 0{,}586' },
      { t: '**Recuadro:** el diferencial es $dt$, pero adentro hay $x$. Para $t$, $\\operatorname{sen}\\left(\\frac x2\\right)$ es un número fijo:', tex: '\\int_0^{2\\pi}\\operatorname{sen}\\left(\\tfrac x2\\right)dt = \\operatorname{sen}\\left(\\tfrac x2\\right)\\cdot t\\,\\Big|_0^{2\\pi} = 2\\pi\\operatorname{sen}\\left(\\tfrac x2\\right)' },
    ],
    resultado: '$\\int_0^{\\pi/2}\\operatorname{sen}(\\frac t2)\\,dt = 2 - \\sqrt2 \\approx 0{,}586$. Recuadro: $2\\pi\\operatorname{sen}(\\frac x2)$.',
    trampa: 'Tres trampas: el **menos** de $-\\cos$; que el 2 **multiplica** (no divide); y en el recuadro, que se integra en $t$, no en $x$.',
    practica: [{ id: 'px.senLineal', level: 3 }, { id: 'px.senLineal', level: 4 }, { id: 'px.variableMuda' }],
  },
  {
    n: 8, titulo: 'Multiplicar por cero', tema: 'Propiedades',
    enunciado: '$$0\\cdot\\int_{-\\pi/2}^{\\pi}\\operatorname{arctg}\\left(\\ln\\frac{x^3}{(x - 4)^5}\\right)dx$$',
    pide: 'El resultado, sin calcular la integral.',
    saber: ['Cualquier número multiplicado por 0 da 0.', 'Una integral definida (si existe) es un número.'],
    guias: ['i7'],
    pasos: [{ t: 'Antes de hacer nada, miro lo que está adelante: un 0.', tex: '0\\cdot(\\text{número}) = 0' }],
    resultado: '$0$ (es la respuesta que espera el profe).',
    trampa: 'La función es horrible a propósito. **Detalle fino** (por si te lo preguntan): $\\frac{x^3}{(x - 4)^5}$ es negativa para $0 < x < 4$, y el logaritmo de un negativo no existe; así que en rigor esa integral no existe en ese intervalo. En el parcial, la idea que se evalúa es "mirá el 0 antes de calcular".',
    practica: [{ id: 'px.cero', level: 2 }],
  },
  {
    n: 9, titulo: 'Otra vez límites iguales', tema: 'Propiedades',
    enunciado: '$$4\\cdot\\int_2^2 (2 - x)^2\\,dx$$',
    pide: 'El resultado.',
    saber: ['$\\int_a^a f(x)\\,dx = 0$: si los límites son iguales, no hay área.'],
    guias: ['i7'],
    pasos: [{ t: 'Los límites son 2 y 2:', tex: '4\\cdot\\int_2^2 (2 - x)^2\\,dx = 4\\cdot 0 = 0' }],
    resultado: '$0$.',
    trampa: 'El 4 de adelante y el cuadrado te invitan a hacer cuentas. No hace falta.',
    practica: [{ id: 'px.cero', level: 1 }],
  },
  {
    n: 10, titulo: 'Constante por una integral de un cuadrado', tema: 'Barrow',
    enunciado: '$$\\frac{5}{2}\\int_0^2 (3 - x)^2\\,dx$$',
    pide: 'Calcular el valor exacto.',
    saber: [
      '**Cuadrado de un binomio:** $(a - b)^2 = a^2 - 2ab + b^2$.',
      '**Potencia:** $\\int x^n\\,dx = \\frac{x^{n+1}}{n + 1}$.',
      'Las constantes salen afuera: $\\int k f = k\\int f$.',
      '**Barrow:** $\\int_a^b f = F(b) - F(a)$.',
    ],
    guias: ['i4', 'i7'],
    pasos: [
      { t: 'Desarrollo el cuadrado:', tex: '(3 - x)^2 = 9 - 2\\cdot 3\\cdot x + x^2 = 9 - 6x + x^2' },
      { t: 'Integro término a término:', tex: '\\frac52\\int_0^2 (9 - 6x + x^2)\\,dx = \\frac52\\left[9x - \\frac{6}{2}x^2 + \\frac{x^3}{3}\\right]_0^2' },
      { t: 'Evalúo en 2 y en 0:', tex: '\\frac52\\left[18 - 12 + \\frac83 - 0\\right] = \\frac52\\cdot\\frac{26}{3} = \\frac{130}{6} = \\frac{65}{3}' },
      { t: 'Control con otro camino (sustitución $u = 3 - x$, $du = -dx$):', tex: '\\int_0^2 (3 - x)^2dx = \\left[-\\frac{(3 - x)^3}{3}\\right]_0^2 = -\\frac13 + 9 = \\frac{26}{3}\\ \\checkmark' },
    ],
    resultado: '$\\frac{65}{3} \\approx 21{,}67$.',
    trampa: 'Olvidarse del **doble producto** ($-6x$), olvidarse de multiplicar por $\\frac52$ al final, o de dividir $x^3$ por 3.',
    practica: [{ id: 'px.cuadrado', level: 2 }, { id: 'px.cuadrado', level: 3 }],
  },
  {
    n: 11, titulo: 'V o F: ∫ sen(√x) dx', tema: 'Sustitución + partes',
    enunciado: '$$\\int\\operatorname{sen}(\\sqrt{x})\\,dx = 2\\sqrt{x}\\cos\\sqrt{x} + 2\\operatorname{sen}\\sqrt{x} + C\\qquad (V\\ \\text{o}\\ F)$$',
    pide: 'Decidir si es verdadero. Hay dos caminos: integrar, o **derivar** el resultado propuesto y ver si da $\\operatorname{sen}\\sqrt x$.',
    saber: [
      'Cambio de variable: $u = \\sqrt{x}$ → $x = u^2$ → $dx = 2u\\,du$.',
      '**Por partes:** $\\int u\\,dv = u\\,v - \\int v\\,du$.',
      '$\\int u\\operatorname{sen} u\\,du = -u\\cos u + \\operatorname{sen} u + C$.',
      'Una primitiva siempre se controla **derivándola**.',
    ],
    guias: ['i5', 'i6'],
    pasos: [
      { t: 'Cambio $u = \\sqrt x$, $dx = 2u\\,du$:', tex: '\\int\\operatorname{sen}(\\sqrt x)\\,dx = \\int 2u\\operatorname{sen}(u)\\,du = 2\\int u\\operatorname{sen} u\\,du' },
      { t: 'Partes con $p = u$ (se deriva: $dp = du$) y $dv = \\operatorname{sen} u\\,du$ ($v = -\\cos u$):', tex: '\\int u\\operatorname{sen} u\\,du = -u\\cos u - \\int(-\\cos u)\\,du = -u\\cos u + \\operatorname{sen} u' },
      { t: 'Multiplico por 2 y vuelvo a $x$:', tex: '\\int\\operatorname{sen}(\\sqrt x)\\,dx = -2\\sqrt x\\cos\\sqrt x + 2\\operatorname{sen}\\sqrt x + C' },
      { t: 'Comparo con lo propuesto: el primer término tiene el **signo cambiado**.' },
    ],
    resultado: '**FALSO**. Lo correcto es $-2\\sqrt x\\cos\\sqrt x + 2\\operatorname{sen}\\sqrt x + C$.',
    trampa: 'Todo el procedimiento "parece" bien; el error está en un solo signo. Por eso conviene derivar el resultado para controlar.',
    practica: [{ id: 'px.raiz', level: 3 }, { id: 'px.raiz', level: 4 }],
  },
  {
    n: 12, titulo: 'La derivada de una constante', tema: 'Derivadas',
    enunciado: '$$f(x) = c\\ (\\text{constante})\\quad\\Rightarrow\\quad \\frac{df}{dx} = \\frac{dc}{dx} = \;?$$',
    pide: 'La derivada de una función constante.',
    saber: ['La derivada mide cuánto cambia $f$ cuando cambia $x$.', 'Una constante no cambia: su gráfico es una recta **horizontal**, de pendiente 0.'],
    guias: ['d3', 'd4'],
    pasos: [{ t: 'El gráfico de $f(x) = c$ es una recta horizontal. Su pendiente es 0:', tex: '\\frac{d}{dx}(c) = 0' }],
    resultado: '$f\'(x) = 0$.',
    trampa: 'Constantes "disfrazadas": $\\operatorname{sen}(2)$, $\\pi^2$, $e^3$, $\\ln 5$ son **números**. Su derivada también es 0.',
    practica: [{ id: 'px.constante' }],
  },
]

const MACHETE: { t: string; tex: string }[] = [
  { t: 'Derivada en un punto', tex: "f'(x_0) = \\lim_{\\Delta x \\to 0}\\frac{f(x_0 + \\Delta x) - f(x_0)}{\\Delta x}" },
  { t: 'Integral como límite de una suma', tex: '\\int_a^b f(x)\\,dx = \\lim_{n\\to\\infty}\\sum_{i=1}^{n} f(x_i)\\,\\Delta x_i' },
  { t: 'Barrow', tex: '\\int_a^b f(x)\\,dx = F(b) - F(a)' },
  { t: 'Límites iguales', tex: '\\int_a^a f(x)\\,dx = 0' },
  { t: 'Linealidad', tex: '\\int (k f + g) = k\\int f + \\int g' },
  { t: 'Aditiva', tex: '\\int_a^b f = \\int_a^c f + \\int_c^b f' },
  { t: 'Potencia', tex: '\\int x^n\\,dx = \\frac{x^{n+1}}{n + 1} + C\\quad (n \\neq -1)' },
  { t: 'Seno y coseno', tex: '\\int\\operatorname{sen} x\\,dx = -\\cos x + C \\qquad \\int\\cos x\\,dx = \\operatorname{sen} x + C' },
  { t: 'Partes', tex: '\\int u\\,dv = u\\,v - \\int v\\,du' },
  { t: 'Cadena de oro', tex: '\\text{derivable} \\Rightarrow \\text{continua} \\Rightarrow \\text{integrable}' },
  { t: 'Ceros', tex: '\\operatorname{sen} x = 0 \\iff x = n\\pi \\qquad \\cos x = 0 \\iff x = \\tfrac{\\pi}{2} + n\\pi' },
  { t: 'Constante', tex: '\\frac{d}{dx}(c) = 0' },
]

const KEY = 'mathverse:parcial'
function loadDone(): number[] { try { const v = JSON.parse(localStorage.getItem(KEY) || '[]'); return Array.isArray(v) ? v.filter((x) => typeof x === 'number') : [] } catch { return [] } }

function daysToThursday(): number { const d = new Date().getDay(); return (4 - d + 7) % 7 }

export default function Parcial() {
  const [done, setDone] = useState<number[]>(loadDone)
  const [open, setOpen] = useState<number | null>(null)
  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(done)) } catch { /* sin almacenamiento */ } }, [done])
  const toggle = (n: number) => setDone((d) => (d.includes(n) ? d.filter((x) => x !== n) : [...d, n]))
  const dias = daysToThursday()
  return (
    <div className="mx-auto grid max-w-3xl grid-cols-[minmax(0,1fr)] gap-6">
      <section className="card-pad grid gap-4">
        <div className="flex items-center gap-4">
          <Mascot mood={done.length === EJERCICIOS.length ? 'party' : 'happy'} size={86} />
          <div className="min-w-0">
            <div className="label !text-ader">{dias === 0 ? '¡Es hoy!' : `Faltan ${dias} día${dias > 1 ? 's' : ''} para el jueves`}</div>
            <h1 className="text-2xl sm:text-3xl">Modelo de 2.º parcial</h1>
            <p className="font-semibold text-muted">Repaso del 29/10/26: los 12 ejercicios, explicados en simple.</p>
          </div>
        </div>
        <div>
          <div className="mb-1 flex justify-between text-sm font-extrabold"><span>Entendidos</span><span>{done.length} de {EJERCICIOS.length}</span></div>
          <Bar value={done.length / EJERCICIOS.length} color="gold" />
        </div>
      </section>

      <section className="card-pad grid grid-cols-[minmax(0,1fr)] gap-3">
        <h2 className="text-xl">🗺️ Cómo estudiar</h2>
        <ol className="grid gap-3">
          {[
            ['🎬', 'Mirá el video del ejercicio (si tiene).', 'Es la explicación completa en el pizarrón, con voz y subtítulos.'],
            ['📖', 'Abrí cada ejercicio, leé "Lo que tenés que saber" y seguí la resolución.', 'Si algo de la base no te cierra, tocá la guía del tema.'],
            ['✏️', 'Tocá "Practicar parecidos" hasta que te salgan sin pistas.', 'Son ejercicios iguales pero con otros números, y se corrigen solos.'],
            ['✅', 'Cuando lo entiendas, marcalo con "Lo entendí".', 'Así ves cuánto te falta.'],
            ['🏆', 'Al final, hacé el simulacro: uno de cada tipo, sin pistas.', 'Si fallás alguno, volvé a ese ejercicio.'],
          ].map(([i, t, s]) => <li key={t} className="flex gap-3"><span className="text-2xl" aria-hidden>{i}</span><div><div className="font-extrabold">{t}</div><div className="text-sm font-semibold text-muted">{s}</div></div></li>)}
        </ol>
        <div className="mt-1 grid gap-3 sm:grid-cols-2">
          <Link to="/videos" className="btn-blue">🎬 Ver los videos</Link>
          <Link to="/formulario" className="btn-danger sm:col-span-2">📋 Simulacro del formulario (45 preguntas)</Link>
          <Link to="/parcial/practicar/simulacro" className="btn-primary">🏆 Hacer el simulacro</Link>
        </div>
      </section>

      <section className="grid grid-cols-[minmax(0,1fr)] gap-3" aria-label="Ejercicios">
        {EJERCICIOS.map((e) => <EjCard key={e.n} e={e} open={open === e.n} onToggle={() => setOpen(open === e.n ? null : e.n)} done={done.includes(e.n)} onDone={() => toggle(e.n)} />)}
      </section>

      <section className="card-pad grid grid-cols-[minmax(0,1fr)] gap-3">
        <h2 className="text-xl">📝 Machete para el jueves</h2>
        <p className="text-sm font-semibold text-muted">Todo lo que hay que tener en la cabeza, en una sola pantalla.</p>
        <div className="grid grid-cols-[minmax(0,1fr)] gap-2 sm:grid-cols-2">
          {MACHETE.map((m) => <div key={m.t} className="rounded-2xl border-2 border-line p-3"><div className="label">{m.t}</div><div className="overflow-x-auto"><TeX display tex={m.tex} /></div></div>)}
        </div>
      </section>
    </div>
  )
}

function EjCard({ e, open, onToggle, done, onDone }: { e: Ej; open: boolean; onToggle: () => void; done: boolean; onDone: () => void }) {
  return (
    <article className={'card overflow-hidden ' + (done ? '!border-ok/60' : '')}>
      <button type="button" onClick={onToggle} aria-expanded={open} className="flex w-full items-center gap-3 p-4 text-left hover:bg-surface2">
        <span className={'grid h-11 w-11 shrink-0 place-items-center rounded-full text-lg font-black text-white ' + (done ? 'bg-ok' : 'bg-brand2')}>{done ? '✓' : e.n}</span>
        <span className="min-w-0 flex-1"><span className="block font-extrabold leading-tight">{e.titulo}</span><span className="text-sm font-semibold text-muted">{e.tema}</span></span>
        <span className={'text-xl text-muted transition-transform ' + (open ? 'rotate-180' : '')} aria-hidden>⌄</span>
      </button>
      {open && (
        <div className="grid grid-cols-[minmax(0,1fr)] gap-4 border-t-2 border-line p-4 anim-up sm:p-5">
          <Block icon="📋" title="El ejercicio"><div className="prose-mv overflow-x-auto"><Md as="div" text={e.enunciado} /></div></Block>
          <Block icon="🤔" title="Qué te piden"><Md as="p" text={e.pide} /></Block>
          <Block icon="🧠" title="Lo que tenés que saber">
            <ul className="grid list-disc gap-1.5 pl-5">{e.saber.map((s, i) => <li key={i}><Md text={s} /></li>)}</ul>
            <div className="mt-3 flex flex-wrap gap-2">{e.guias.map((g) => { const u = unitById(g); return u ? <Link key={g} to={`/unidad/${g}?etapa=teoria`} className="chip !border-brand2/40 !text-brand2 hover:bg-selbg">📒 {u.title}</Link> : null })}</div>
          </Block>
          {e.extra && <div>{e.extra}</div>}
          <Block icon="✍️" title="Resolución, paso a paso">
            <ol className="grid grid-cols-[minmax(0,1fr)] gap-3">
              {e.pasos.map((p, i) => (
                <li key={i} className="flex gap-3"><span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-brand text-sm font-black text-white">{i + 1}</span><div className="min-w-0 flex-1"><Md as="div" text={p.t} />{p.tex && <div className="overflow-x-auto"><TeX display tex={p.tex} /></div>}</div></li>
              ))}
            </ol>
          </Block>
          <div className="rounded-2xl bg-okbg p-4 font-semibold"><span className="label !text-ok">✅ Resultado</span><Md as="div" text={e.resultado} className="mt-1" /></div>
          <div className="rounded-2xl bg-badbg p-4 font-semibold"><span className="label !text-bad">⚠️ La trampa</span><Md as="div" text={e.trampa} className="mt-1" /></div>
          <div className="flex flex-wrap gap-3">
            {VIDEOS.filter((v) => v.ej.includes(e.n)).map((v) => <Link key={v.id} to={`/videos/${v.id}`} className="btn-ghost flex-1 sm:flex-none">🎬 Ver video</Link>)}
            <Link to={`/parcial/practicar/${e.n}`} className="btn-primary flex-1 sm:flex-none">✏️ Practicar parecidos</Link>
            <button type="button" onClick={onDone} className={(done ? 'btn-ghost' : 'btn-blue') + ' flex-1 sm:flex-none'}>{done ? 'Desmarcar' : '✓ Lo entendí'}</button>
          </div>
        </div>
      )}
    </article>
  )
}

function Block({ icon, title, children }: { icon: string; title: string; children: ReactNode }) {
  return <section className="min-w-0"><h3 className="mb-2 flex items-center gap-2 text-lg"><span aria-hidden>{icon}</span>{title}</h3><div className="font-semibold">{children}</div></section>
}

/* ---------- práctica ---------- */
const rnd = () => Math.floor(Math.random() * 1e9)

function build(list: { id: string; level?: Level }[], n: number, seed: number): Exercise[] {
  const out: Exercise[] = []
  for (let i = 0; i < n; i++) {
    const p = list[i % list.length]
    const t = getTemplate(p.id)
    if (!t) continue
    const lv = p.level ?? t.levels[(seed + i) % t.levels.length]
    try { out.push(instantiate(p.id, seed + i * 7919, lv)) } catch { /* sigue */ }
  }
  return out
}

export function ParcialPractice() {
  const { ej = '' } = useParams()
  const nav = useNavigate()
  const [seed, setSeed] = useState(rnd)
  const sim = ej === 'simulacro'
  const e = EJERCICIOS.find((x) => String(x.n) === ej)
  const items = useMemo(() => {
    if (sim) {
      // uno de cada ejercicio del modelo, en orden
      return EJERCICIOS.flatMap((x, i) => build([x.practica[x.practica.length - 1]], 1, seed + i * 104729))
    }
    return e ? build(e.practica, Math.max(5, e.practica.length * 2), seed) : []
  }, [sim, e, seed])
  if (!sim && !e) return <NotFound />
  const exit = () => nav('/parcial')
  return (
    <SessionPlayer key={seed} items={items} title={sim ? 'Simulacro' : `Ejercicio ${e!.n}`} source={sim ? 'examen' : 'practica'} allowHelp={!sim} requeue={!sim}
      onExit={exit} onRestart={() => setSeed(rnd())}
      endTitle={(r) => { const ok = r.filter((x) => x.score >= 0.999).length; return sim ? `Simulacro: ${ok} de ${r.length}` : ok === r.length ? '¡Te salieron todos!' : '¡Práctica completada!' }}
      endView={(r) => {
        const ok = r.filter((x) => x.score >= 0.999).length
        const mal = sim ? EJERCICIOS.filter((_, i) => r[i] && r[i].score < 0.999) : []
        return (
          <div className="grid gap-3">
            <Speech mood={ok === r.length ? 'party' : ok >= r.length * 0.6 ? 'happy' : 'think'} size={70}>
              {ok === r.length ? '¡Impecable! Estás listo para este tipo de ejercicio.' : ok >= r.length * 0.6 ? 'Vas muy bien. Repetí una vez más para que salga sin pensar.' : 'Releé la explicación del ejercicio y volvé a intentarlo: con cada intento cambian los números.'}
            </Speech>
            {mal.length > 0 && (
              <div className="card p-4 text-left">
                <div className="label mb-2">Para repasar</div>
                <ul className="grid gap-1 text-sm font-bold">{mal.map((x) => <li key={x.n}><Link to={`/parcial/practicar/${x.n}`} className="text-brand2 hover:underline">Ejercicio {x.n}: {x.titulo}</Link></li>)}</ul>
              </div>
            )}
          </div>
        )
      }} />
  )
}
