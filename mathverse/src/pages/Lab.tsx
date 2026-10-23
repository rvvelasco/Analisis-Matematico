/** Laboratorio: todas las visualizaciones interactivas en un solo lugar. */
import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { WidgetSpec } from '../content/types'
import { Widget } from '../viz/Widget'
import { PageHeader } from '../ui/Layout'

const ITEMS: { id: string; group: string; name: string; desc: string; spec: WidgetSpec }[] = [
  { id: 'familia', group: 'Funciones', name: 'Familias de funciones', desc: 'Cuadráticas con parámetros: vértice, discriminante y raíces.', spec: { type: 'family', expr: 'a*x^2 + b*x + c', params: [{ name: 'a', min: -3, max: 3, step: 0.25, init: 1 }, { name: 'b', min: -6, max: 6, step: 0.5, init: -2 }, { name: 'c', min: -6, max: 6, step: 0.5, init: -3 }] } },
  { id: 'trig', group: 'Funciones', name: 'Ondas', desc: 'Amplitud, frecuencia y desplazamiento de a·sen(b(x − c)).', spec: { type: 'family', expr: 'a*sin(b*(x - c))', params: [{ name: 'a', min: -3, max: 3, step: 0.25, init: 1 }, { name: 'b', min: 0.25, max: 4, step: 0.25, init: 1 }, { name: 'c', min: -3, max: 3, step: 0.25, init: 0 }], x: [-7, 7], y: [-4, 4] } },
  { id: 'inversa', group: 'Funciones', name: 'Función inversa', desc: 'Exponencial y logaritmo reflejados en y = x.', spec: { type: 'inverseFn', f: 'e^x', finv: 'ln(x)', x: [-4, 6] } },
  { id: 'limite', group: 'Funciones', name: 'Límites', desc: 'Acercate a un punto donde la función no está definida.', spec: { type: 'limit', f: 'sin(x)/x', a: 0, x: [-8, 8], y: [-0.6, 1.4] } },
  { id: 'secante', group: 'Derivadas', name: 'Secante → tangente', desc: 'Cómo nace la derivada.', spec: { type: 'secant', f: 'x^2', x0: 1, x: [-2, 4], y: [-1, 9] } },
  { id: 'tangente', group: 'Derivadas', name: 'Mover la tangente', desc: 'Arrastrá el punto y mirá la pendiente.', spec: { type: 'tangent', f: 'x^3/3 - x', x0: 1.5, x: [-3, 3], y: [-3, 3] } },
  { id: 'fyfp', group: 'Derivadas', name: 'f y su derivada', desc: 'Crecimiento, extremos y signo de f′ en simultáneo.', spec: { type: 'derivGraph', f: 'x^3 - 3*x', x: [-3, 3], y: [-5, 5] } },
  { id: 'riemann', group: 'Integrales', name: 'Sumas de Riemann', desc: 'Más rectángulos, mejor aproximación.', spec: { type: 'riemann', f: 'x^2', a: 0, b: 2, y: [-0.5, 4.5] } },
  { id: 'area', group: 'Integrales', name: 'Área con signo', desc: 'Integral vs. área geométrica.', spec: { type: 'area', f: 'x^3 - x', a: -1, b: 1.5, x: [-2, 2], y: [-2, 2] } },
  { id: 'acum', group: 'Integrales', name: 'Función acumulada', desc: 'El teorema fundamental en movimiento.', spec: { type: 'accumulation', f: 'sin(x) + 0.5', x: [0, 10], y: [-2, 6] } },
  { id: 'vectores', group: 'Vectores', name: 'Suma y escalar', desc: 'Regla del paralelogramo.', spec: { type: 'vectors' } },
  { id: 'escalar', group: 'Vectores', name: 'Producto escalar', desc: 'Ángulo y proyección.', spec: { type: 'dot' } },
  { id: 'span', group: 'Vectores', name: 'Combinación lineal', desc: 'Llegá al objetivo con αu + βv.', spec: { type: 'span' } },
  { id: 'transf', group: 'Matrices', name: 'Transformaciones', desc: 'Una matriz deforma el plano.', spec: { type: 'matrixTransform' } },
  { id: 'producto', group: 'Matrices', name: 'Producto fila × columna', desc: 'Cómo se calcula cada elemento.', spec: { type: 'matrixProduct' } },
  { id: 'sistemas', group: 'Matrices', name: 'Sistemas como rectas', desc: 'SCD, SCI o SI a la vista.', spec: { type: 'systemLines' } },
  { id: 'gauss', group: 'Matrices', name: 'Gauss paso a paso', desc: 'Operaciones de fila con ayuda.', spec: { type: 'gauss' } },
]

export default function Lab() {
  const [sel, setSel] = useState(ITEMS[0].id)
  const it = ITEMS.find((x) => x.id === sel)!
  const groups = [...new Set(ITEMS.map((x) => x.group))]
  return (
    <div>
      <PageHeader title="Laboratorio" subtitle="Visualizaciones interactivas para experimentar sin miedo a equivocarte. Nada de lo que hagas acá afecta tu progreso." right={<Link to="/juegos/sandbox" className="btn-ghost">🪐 Abrir el Sandbox</Link>} />
      <div className="grid gap-5 lg:grid-cols-[15rem_minmax(0,1fr)]">
        <nav aria-label="Visualizaciones" className="grid content-start gap-4">
          {groups.map((g) => (
            <div key={g}>
              <div className="label mb-1.5">{g}</div>
              <div className="flex flex-wrap gap-1.5 lg:grid">
                {ITEMS.filter((x) => x.group === g).map((x) => <button key={x.id} type="button" aria-pressed={sel === x.id} onClick={() => setSel(x.id)} className={'rounded-xl px-3 py-2 text-left text-sm transition ' + (sel === x.id ? 'bg-brand text-white' : 'bg-surface2/60 text-muted hover:text-ink')}>{x.name}</button>)}
              </div>
            </div>
          ))}
        </nav>
        <section className="card-pad min-w-0" aria-live="polite">
          <h2 className="text-xl font-semibold">{it.name}</h2>
          <p className="mb-4 text-sm text-muted">{it.desc}</p>
          <Widget key={it.id} spec={it.spec} />
        </section>
      </div>
    </div>
  )
}
