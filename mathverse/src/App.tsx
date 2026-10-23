import { lazy, Suspense, Component, type ReactNode } from 'react'
import { HashRouter, Navigate, Route, Routes, useParams } from 'react-router-dom'
import { Layout } from './ui/Layout'
import Home from './pages/Home'
import { AreaPage, LearnMap, NotFound } from './pages/Learn'

const UnitPage = lazy(() => import('./pages/UnitPage'))
const Games = lazy(() => import('./pages/Games'))
const Lab = lazy(() => import('./pages/Lab'))
const Exams = lazy(() => import('./pages/Exams'))
const Progress = lazy(() => import('./pages/Progress'))
const Review = lazy(() => import('./pages/Review'))
const Settings = lazy(() => import('./pages/Settings'))

const GAME_PAGES = {
  lab: lazy(() => import('./games/FunctionLab')),
  cazador: lazy(() => import('./games/ErrorHunter')),
  duelo: lazy(() => import('./games/Duel')),
  puzzle: lazy(() => import('./games/Puzzle')),
  constructor: lazy(() => import('./games/IntegralBuilder')),
  fabrica: lazy(() => import('./games/DerivFactory')),
  arquitecto: lazy(() => import('./games/MatrixArchitect')),
  diario: lazy(() => import('./games/Daily')),
  sandbox: lazy(() => import('./games/Sandbox')),
} as const

function GameRoute() {
  const { id = '' } = useParams()
  if (id === 'arena') return <Navigate to="/simulacros" replace />
  const G = GAME_PAGES[id as keyof typeof GAME_PAGES]
  return G ? <G /> : <NotFound />
}

/** Si algo falla al dibujar una pantalla, se muestra un aviso en lugar de una página en blanco. */
class Boundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null }
  static getDerivedStateFromError(error: Error) { return { error } }
  render() {
    if (this.state.error)
      return (
        <div className="card-pad mx-auto max-w-lg text-center">
          <div className="text-4xl">🛠️</div>
          <h1 className="mt-2 text-xl font-bold">Algo salió mal en esta pantalla</h1>
          <p className="mt-1 text-sm text-muted">{this.state.error.message}</p>
          <button type="button" className="btn-primary mt-4" onClick={() => { this.setState({ error: null }); window.location.hash = '#/' }}>Volver al inicio</button>
        </div>
      )
    return this.props.children
  }
}

const Loading = () => <div className="grid h-40 place-items-center text-muted" role="status">Cargando…</div>

export default function App() {
  return (
    <HashRouter>
      <Layout>
        <Boundary>
          <Suspense fallback={<Loading />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/aprender" element={<LearnMap />} />
              <Route path="/area/:id" element={<AreaPage />} />
              <Route path="/unidad/:id" element={<UnitPage />} />
              <Route path="/juegos" element={<Games />} />
              <Route path="/juegos/:id" element={<GameRoute />} />
              <Route path="/laboratorio" element={<Lab />} />
              <Route path="/simulacros" element={<Exams />} />
              <Route path="/progreso" element={<Progress />} />
              <Route path="/repaso" element={<Review />} />
              <Route path="/configuracion" element={<Settings />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </Boundary>
      </Layout>
    </HashRouter>
  )
}
