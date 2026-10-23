/** Juego 4 · Puzzle algebraico: ordenar los pasos de una resolución. */
import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import type { AreaId, Exercise, Level } from '../engine/types'
import { instantiate } from '../engine/registry'
import { unitById } from '../content/curriculum'
import { recordGame } from '../progress/store'
import { ExerciseView } from '../exercise/ExerciseView'
import { GameOver, GameShell, ScoreBar } from './common'
import { makeRand, newSeedSafe } from './util'
import type { Rand } from '../math/numeric'

const ROUNDS = 6
const sg = (v: number) => (v < 0 ? `- ${-v}` : `+ ${v}`)
const pr = (v: number) => (v < 0 ? `(${v})` : String(v))

interface Puzzle { area: AreaId; unit: string; concept: string; title: string; prompt: string; steps: string[]; level: Level; why: string }

const GENERATORS: ((r: Rand) => Puzzle)[] = [
  (r) => {
    const a = r.pick([2, 3, 4, 5]), b = r.int(-6, 6) || 2, x0 = r.int(-5, 6)
    const c = a * (x0 + b)
    return { area: 'funciones', unit: 'f3', concept: 'f3.ecuacion', level: 2, title: 'Ecuación lineal', why: 'Despejar exige deshacer las operaciones en orden inverso.',
      prompt: `Ordená los pasos para resolver $${a}(x ${sg(b)}) = ${c}$.`,
      steps: [`Distribuir: $${a}x ${sg(a * b)} = ${c}$`, `Pasar ${pr(a * b)} restando: $${a}x = ${c - a * b}$`, `Dividir por ${a}: $x = \\frac{${c - a * b}}{${a}}$`, `Calcular: $x = ${x0}$`, `Verificar: $${a}(${x0} ${sg(b)}) = ${c}$ ✓`] }
  },
  (r) => {
    const p = r.int(-5, 5) || 1, q = r.int(-5, 5) || -2
    return { area: 'funciones', unit: 'f4', concept: 'f4.raices', level: 3, title: 'Cuadrática por factorización', why: 'Primero se busca la factorización y después se aplica la propiedad del producto cero.',
      prompt: `Ordená los pasos para resolver $x^2 ${sg(-(p + q))}x ${sg(p * q)} = 0$ factorizando.`,
      steps: [`Buscar dos números que sumen ${p + q} y multipliquen ${p * q}: son ${p} y ${q}`, `Factorizar: $(x ${sg(-p)})(x ${sg(-q)}) = 0$`, 'Un producto es 0 si algún factor es 0', `Soluciones: $x = ${p}$ o $x = ${q}$`] }
  },
  (r) => {
    const a = r.pick([2, 3, 5]), b = r.int(1, 7), n = r.pick([3, 4, 5])
    return { area: 'derivadas', unit: 'd6', concept: 'd6.cadena', level: 3, title: 'Regla de la cadena', why: 'Hay que identificar la estructura antes de derivar cada capa.',
      prompt: `Ordená los pasos para derivar $f(x) = (${a}x + ${b})^{${n}}$.`,
      steps: [`Identificar: afuera "algo a la ${n}", adentro $u = ${a}x + ${b}$`, `Derivar la de afuera sin tocar lo de adentro: $${n}(${a}x + ${b})^{${n - 1}}$`, `Derivar lo de adentro: $u' = ${a}$`, `Multiplicar: $f'(x) = ${n}(${a}x + ${b})^{${n - 1}}\\cdot ${a}$`, `Simplificar: $f'(x) = ${n * a}(${a}x + ${b})^{${n - 1}}$`] }
  },
  (r) => {
    const a = r.pick([2, 3])
    return { area: 'integrales', unit: 'i6', concept: 'i6.partes', level: 3, title: 'Integración por partes', why: 'La fórmula de partes exige elegir, derivar e integrar antes de armar el resultado.',
      prompt: `Ordená los pasos para calcular $\\int x\\,e^{${a}x}\\,dx$.`,
      steps: ['Elegir $u = x$ y $dv = e^{' + a + 'x}dx$ (LIATE)', `Calcular $du = dx$ y $v = \\frac{1}{${a}}e^{${a}x}$`, `Aplicar $uv - \\int v\\,du$: $\\frac{x}{${a}}e^{${a}x} - \\int \\frac{1}{${a}}e^{${a}x}dx$`, `Integrar lo que queda: $\\frac{x}{${a}}e^{${a}x} - \\frac{1}{${a * a}}e^{${a}x} + C$`, 'Verificar derivando el resultado'] }
  },
  (r) => {
    const x = r.int(-3, 4), y = r.int(-3, 4), a = r.pick([2, 3])
    return { area: 'matrices', unit: 'm6', concept: 'm6.gauss', level: 2, title: 'Sistema 2×2 por Gauss', why: 'Primero se escalona, después se despeja de abajo hacia arriba.',
      prompt: `Ordená los pasos para resolver $\\begin{cases} x + y = ${x + y} \\\\ ${a}x - y = ${a * x - y}\\end{cases}$.`,
      steps: ['Escribir la matriz ampliada', `$F_2 \\leftarrow F_2 - ${a}F_1$ para anular el ${a} de abajo`, `Despejar $y$ de la segunda fila: $y = ${y}$`, `Reemplazar en la primera: $x = ${x + y} - ${pr(y)} = ${x}$`, 'Verificar en ambas ecuaciones'] }
  },
  (r) => {
    const a = r.int(1, 6), b = r.int(1, 5)
    return { area: 'funciones', unit: 'f1', concept: 'f1.dominio', level: 2, title: 'Dominio', why: 'Se juntan las restricciones de cada operación.',
      prompt: `Ordená los pasos para hallar el dominio de $f(x) = \\dfrac{\\sqrt{x - ${a}}}{x - ${a + b}}$.`,
      steps: [`La raíz pide $x - ${a} \\ge 0$`, `Entonces $x \\ge ${a}$`, `El denominador no puede ser 0: $x \\neq ${a + b}$`, `Juntar: $\\operatorname{Dom} f = [${a}, ${a + b}) \\cup (${a + b}, +\\infty)$`] }
  },
  (r) => {
    const k = r.pick([2, 3]), c = r.int(1, 5)
    return { area: 'integrales', unit: 'i5', concept: 'i5.sustitucion', level: 3, title: 'Sustitución', why: 'El cambio de variable se elige, se aplica y al final se deshace.',
      prompt: `Ordená los pasos para calcular $\\int 2x\\,(x^2 + ${c})^{${k}}dx$.`,
      steps: [`Elegir $u = x^2 + ${c}$`, 'Calcular $du = 2x\\,dx$', `Reemplazar: $\\int u^{${k}}\\,du$`, `Integrar: $\\frac{u^{${k + 1}}}{${k + 1}} + C$`, `Volver a $x$: $\\frac{(x^2 + ${c})^{${k + 1}}}{${k + 1}} + C$`] }
  },
]

function toExercise(p: Puzzle, seed: number): Exercise {
  return {
    id: `puzzle:${p.unit}:${seed}`, templateId: `puzzle.${p.unit}`, seed, area: p.area, unit: p.unit, subtopic: p.title, concepts: [p.concept], level: p.level,
    levelWhy: `Nivel ${p.level === 2 ? 'Aprendiz' : 'Analista'}: ${p.why}`, prompt: p.prompt,
    hints: [`El primer paso es: ${p.steps[0]}`, `El último paso es: ${p.steps[p.steps.length - 1]}`],
    solution: p.steps.map((s, i) => ({ text: `${i + 1}. ${s}` })), explanation: p.why, commonErrors: [], prereqs: [], estMinutes: 2,
    kind: 'order', items: p.steps,
  }
}

const ORDER_TEMPLATES: { id: string; level: Level; area: AreaId }[] = [{ id: 'd2.limitDef', level: 3, area: 'derivadas' }, { id: 'i2.order', level: 2, area: 'integrales' }, { id: 'm6.order', level: 2, area: 'matrices' }]

function makeRound(seed: number, area: string | null): Exercise {
  const r = makeRand(seed)
  const gens = GENERATORS.map((g) => g(makeRand(r.int(1, 1e9)))).filter((p) => !area || p.area === area)
  const tpl = ORDER_TEMPLATES.filter((t) => !area || t.area === area)
  if (tpl.length && (r.chance(0.25) || !gens.length)) { const t = r.pick(tpl); return instantiate(t.id, r.int(1, 1e9), t.level) }
  return toExercise(r.pick(gens.length ? gens : GENERATORS.map((g) => g(r))), seed)
}

export default function Puzzle() {
  const [sp] = useSearchParams()
  const unit = sp.get('unidad')
  const area = unit ? unitById(unit)?.area ?? null : null
  const [seed, setSeed] = useState(newSeedSafe)
  const [i, setI] = useState(0)
  const [score, setScore] = useState(0)
  const [solved, setSolved] = useState(0)
  const [answered, setAnswered] = useState(false)
  const ex = useMemo(() => makeRound(seed + i * 4241, area), [seed, i, area])
  if (i >= ROUNDS)
    return <GameShell id="puzzle"><GameOver title={`${score} puntos`} lines={[`Armaste ${solved} de ${ROUNDS} razonamientos al primer intento.`]} onAgain={() => { setSeed(newSeedSafe()); setI(0); setScore(0); setSolved(0) }} /></GameShell>
  return (
    <GameShell id="puzzle">
      <ScoreBar items={[{ label: 'Puzzle', value: `${i + 1}/${ROUNDS}` }, { label: 'Puntos', value: score, tone: 'brand' }]} />
      <ExerciseView key={ex.id + i} ex={ex} source="juego"
        onResult={(_fb, meta) => {
          if (answered) return
          setAnswered(true)
          const pts = meta.score >= 0.999 ? Math.max(5, 20 - 5 * meta.hintsUsed) : 0
          setScore((s) => s + pts)
          if (meta.score >= 0.999) setSolved((x) => x + 1)
        }}
        onNext={answered ? () => { setAnswered(false); const n = i + 1; if (n >= ROUNDS) recordGame('puzzle', { puzzle: solved, xp: Math.round(score / 4) }); setI(n) } : undefined}
        nextLabel={i + 1 < ROUNDS ? 'Siguiente puzzle' : 'Ver resultado'} />
    </GameShell>
  )
}
