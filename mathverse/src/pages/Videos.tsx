/** Videos explicativos del modelo de parcial: lista y reproductor. */
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { VIDEOS, videoById } from '../videos/scripts'
import { ejList, Player, stepMs } from '../videos/Player'
import { PageHeader } from '../ui/Layout'
import { Speech } from '../ui/Mascot'
import { NotFound } from './Learn'

const minutos = (v: (typeof VIDEOS)[number]) => Math.max(1, Math.round(v.steps.reduce((s, st) => s + stepMs(st.say), 0) / 60000))

export default function Videos() {
  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="🎬 Videos" subtitle="Ejercicios completos del modelo de parcial, explicados en el pizarrón, paso a paso." back={{ to: '/parcial', label: 'Parcial del jueves' }} />
      <div className="mb-5"><Speech mood="happy" size={70}>Los videos se narran con la voz en español de tu dispositivo. Si no tiene, avanzan solos con subtítulos. Podés pausar, ir para atrás y cambiar la velocidad. Tip: en el celular, ponelo <b>horizontal</b>.</Speech></div>
      <ul className="grid gap-3 sm:grid-cols-2">
        {VIDEOS.map((v) => (
          <li key={v.id}>
            <Link to={`/videos/${v.id}`} className="card flex h-full items-start gap-3 p-4 hover:bg-surface2" style={{ boxShadow: '0 4px 0 rgb(var(--line))' }}>
              <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-[#1d2b2f] text-3xl" aria-hidden>{v.emoji}</span>
              <span className="min-w-0 flex-1">
                <span className="block text-xs font-black uppercase tracking-wide text-ader">Ejercicio{v.ej.length > 1 ? 's' : ''} {ejList(v.ej)} · {minutos(v)} min</span>
                <span className="block font-extrabold leading-tight">{v.title}</span>
                <span className="mt-1 block text-sm font-semibold text-muted">{v.short}</span>
              </span>
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand text-white" aria-hidden>▶</span>
            </Link>
          </li>
        ))}
      </ul>
      <p className="mt-6 text-center text-sm font-semibold text-muted">También están en MP4 (con subtítulos) en la carpeta <code>videos-parcial</code> del repositorio.</p>
    </div>
  )
}

export function VideoPage() {
  const { id = '' } = useParams()
  const [q] = useSearchParams()
  const nav = useNavigate()
  const v = videoById(id)
  if (!v) return <NotFound />
  return <Player key={v.id} video={v} exportMode={q.get('export') === '1'} onClose={() => nav('/videos')} />
}
