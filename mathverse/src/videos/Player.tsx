/** Reproductor de videos explicativos: pizarrón animado, narración con la voz del dispositivo y subtítulos. */
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Md, TeX } from '../ui/Md'
import { Mascot } from '../ui/Mascot'
import { Icon } from '../ui/icons'
import { VPlot } from './VPlot'
import type { El, PlotSpec, Video } from './types'

type BoardEl = Exclude<El, { k: 'clear' } | { k: 'update' } | { k: 'remove' }> & { key: string; born: number }

/** Pizarrón acumulado hasta el paso i (aplicando borrados y cambios). */
function boardAt(v: Video, i: number): BoardEl[] {
  let board: BoardEl[] = []
  v.steps.slice(0, i + 1).forEach((st, si) => {
    st.add?.forEach((e, ei) => {
      if (e.k === 'clear') board = []
      else if (e.k === 'remove') board = board.filter((b) => !('id' in b) || b.id !== e.id)
      else if (e.k === 'update') board = board.map((b) => (b.k === 'plot' && b.id === e.id ? { ...b, spec: { ...b.spec, ...e.spec } as PlotSpec, born: si } : b))
      else board.push({ ...e, key: `${si}-${ei}`, born: si } as BoardEl)
    })
  })
  return board
}

/** Duración estimada de un paso sin voz (lectura cómoda de subtítulos). */
export function stepMs(say: string): number {
  const words = say.trim().split(/\s+/).length
  return Math.max(2800, (words / 2.7) * 1000) + 900
}

/* ---------- voz ---------- */
function pickVoice(): SpeechSynthesisVoice | null {
  const vs = typeof speechSynthesis !== 'undefined' ? speechSynthesis.getVoices() : []
  const es = vs.filter((v) => v.lang.toLowerCase().startsWith('es'))
  if (!es.length) return null
  const score = (v: SpeechSynthesisVoice) => {
    const l = v.lang.toLowerCase(), n = v.name.toLowerCase()
    let s = l === 'es-ar' ? 50 : l === 'es-419' || l === 'es-us' || l === 'es-mx' ? 30 : l === 'es-es' ? 15 : 10
    if (/natural|online|neural|google|premium|enhanced/.test(n)) s += 25
    return s
  }
  return es.sort((a, b) => score(b) - score(a))[0]
}

function speak(text: string, rate: number, onEnd: () => void): () => void {
  const synth = typeof speechSynthesis !== 'undefined' ? speechSynthesis : null
  const voice = synth ? pickVoice() : null
  let done = false
  const finish = () => { if (!done) { done = true; onEnd() } }
  // si no hay voz en español, se usa el tiempo de lectura
  if (!synth || !voice) { const t = setTimeout(finish, stepMs(text) / rate); return () => { done = true; clearTimeout(t) } }
  synth.cancel()
  const parts = text.match(/[^.!?¿¡:;]+[.!?:;]*/g)?.map((p) => p.trim()).filter(Boolean) ?? [text]
  parts.forEach((p, i) => {
    const u = new SpeechSynthesisUtterance(p)
    u.voice = voice; u.lang = voice.lang; u.rate = rate * 1.02; u.pitch = 1.05
    if (i === parts.length - 1) { u.onend = () => setTimeout(finish, 500); u.onerror = () => setTimeout(finish, 500) }
    synth.speak(u)
  })
  // red de seguridad por si el navegador no avisa el final
  const safety = setTimeout(finish, (stepMs(text) * 1.8) / rate + 3000)
  return () => { done = true; clearTimeout(safety); synth.cancel() }
}

/** "3, 8 y 9" */
export const ejList = (e: number[]) => (e.length > 1 ? `${e.slice(0, -1).join(', ')} y ${e[e.length - 1]}` : String(e[0]))

const DW = { land: 1280, port: 720 }, DH = { land: 720, port: 1180 }

export function Player({ video, exportMode = false, onClose }: { video: Video; exportMode?: boolean; onClose?: () => void }) {
  const [i, setI] = useState(0)
  const [playing, setPlaying] = useState(exportMode)
  const [ended, setEnded] = useState(false)
  const [rate, setRate] = useState(1)
  const [voiceOn, setVoiceOn] = useState(!exportMode)
  const [subs, setSubs] = useState(true)
  const [hasVoice, setHasVoice] = useState(false)
  const n = video.steps.length
  const step = video.steps[i]
  const board = useMemo(() => boardAt(video, i), [video, i])

  useEffect(() => {
    if (typeof speechSynthesis === 'undefined') return
    const upd = () => setHasVoice(!!pickVoice())
    upd(); speechSynthesis.addEventListener?.('voiceschanged', upd)
    return () => { speechSynthesis.removeEventListener?.('voiceschanged', upd); speechSynthesis.cancel() }
  }, [])

  // avanzar
  useEffect(() => {
    if (!playing) return
    const next = () => { if (i + 1 < n) setI(i + 1); else { setPlaying(false); setEnded(true); if (exportMode) (window as unknown as { __videoDone: boolean }).__videoDone = true } }
    if (voiceOn && hasVoice && !exportMode) return speak(step.say, rate, next)
    const t = setTimeout(next, stepMs(step.say) / rate)
    return () => clearTimeout(t)
  }, [i, playing, voiceOn, hasVoice, rate, exportMode, n, step.say])

  const go = useCallback((k: number) => { if (typeof speechSynthesis !== 'undefined') speechSynthesis.cancel(); setEnded(false); setI(Math.max(0, Math.min(n - 1, k))) }, [n])
  const toggle = useCallback(() => { if (ended) { setEnded(false); setI(0); setPlaying(true); return } if (playing && typeof speechSynthesis !== 'undefined') speechSynthesis.cancel(); setPlaying((p) => !p) }, [playing, ended])

  useEffect(() => {
    if (exportMode) return
    const k = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'k') { e.preventDefault(); toggle() }
      else if (e.key === 'ArrowRight') go(i + 1)
      else if (e.key === 'ArrowLeft') go(i - 1)
      else if (e.key === 'Escape') onClose?.()
    }
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [toggle, go, i, onClose, exportMode])

  // escenario a escala (diseño fijo, se ajusta a la pantalla)
  const wrap = useRef<HTMLDivElement>(null)
  const [box, setBox] = useState({ w: 1280, h: 720 })
  useLayoutEffect(() => {
    const el = wrap.current
    if (!el) return
    const ro = new ResizeObserver(() => setBox({ w: el.clientWidth, h: el.clientHeight }))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  const mode = box.w / Math.max(1, box.h) < 0.95 ? 'port' : 'land'
  const scale = Math.min(box.w / DW[mode], box.h / DH[mode])

  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-[#111a1d] text-white">
      {!exportMode && (
        <header className="flex items-center gap-3 px-3 py-2 sm:px-5">
          <button type="button" onClick={onClose} className="text-white/70 hover:text-white" aria-label="Cerrar el video"><Icon name="close" className="h-7 w-7" /></button>
          <div className="min-w-0 flex-1"><div className="truncate font-extrabold">{video.emoji} {video.title}</div><div className="truncate text-xs font-semibold text-white/60">{video.short}</div></div>
        </header>
      )}
      <div ref={wrap} className="relative min-h-0 flex-1 overflow-hidden">
        <div className="absolute left-1/2 top-1/2" style={{ width: DW[mode], height: DH[mode], transform: `translate(-50%, -50%) scale(${scale})` }}>
          <Stage video={video} board={board} i={i} mode={mode} subs={subs || exportMode} say={step.say} mark={step.mark ?? []} mood={step.mood} speaking={playing} />
        </div>
      </div>
      {!exportMode && (
        <footer className="grid gap-2 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 sm:px-5">
          <div className="flex gap-1" role="group" aria-label="Pasos del video">
            {video.steps.map((_, k) => <button key={k} type="button" onClick={() => go(k)} aria-label={`Paso ${k + 1}`} className={'h-2.5 flex-1 rounded-full transition ' + (k < i ? 'bg-[#9be15d]' : k === i ? 'bg-[#ffd84d]' : 'bg-white/20 hover:bg-white/40')} />)}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" className="grid h-11 w-11 place-items-center rounded-full bg-white/10 text-xl hover:bg-white/20" onClick={() => go(i - 1)} aria-label="Paso anterior">⏮</button>
            <button type="button" className="grid h-14 w-14 place-items-center rounded-full bg-[#58cc02] text-2xl shadow-[0_4px_0_#46a302] active:translate-y-1 active:shadow-none" onClick={toggle} aria-label={playing ? 'Pausa' : 'Reproducir'} autoFocus>{ended ? '↻' : playing ? '⏸' : '▶'}</button>
            <button type="button" className="grid h-11 w-11 place-items-center rounded-full bg-white/10 text-xl hover:bg-white/20" onClick={() => go(i + 1)} aria-label="Paso siguiente">⏭</button>
            <span className="ml-1 text-sm font-bold text-white/70">{i + 1}/{n}</span>
            <div className="ml-auto flex flex-wrap items-center gap-2 text-sm font-bold">
              <button type="button" onClick={() => setVoiceOn((v) => !v)} className={'rounded-xl px-3 py-2 ' + (voiceOn && hasVoice ? 'bg-white/20' : 'bg-white/5 text-white/60')} title={hasVoice ? '' : 'Este dispositivo no tiene una voz en español instalada: el video avanza con subtítulos.'}>{voiceOn && hasVoice ? '🔊 Voz' : '🔇 Sin voz'}</button>
              <button type="button" onClick={() => setSubs((s) => !s)} className={'rounded-xl px-3 py-2 ' + (subs ? 'bg-white/20' : 'bg-white/5 text-white/60')}>CC</button>
              <button type="button" onClick={() => setRate((r) => (r >= 1.5 ? 0.75 : r + 0.25))} className="rounded-xl bg-white/10 px-3 py-2">{rate}×</button>
            </div>
          </div>
          {!hasVoice && voiceOn && <p className="text-xs font-semibold text-white/50">No encontré una voz en español en este dispositivo: el video avanza solo y podés leer los subtítulos.</p>}
        </footer>
      )}
    </div>
  )
}

function Stage({ video, board, i, mode, subs, say, mark, mood, speaking }: { video: Video; board: BoardEl[]; i: number; mode: 'land' | 'port'; subs: boolean; say: string; mark: string[]; mood?: import('../ui/Mascot').Mood; speaking: boolean }) {
  const plots = board.filter((b) => b.k === 'plot')
  const rest = board.filter((b) => b.k !== 'plot')
  const inner = useRef<HTMLDivElement>(null)
  const area = useRef<HTMLDivElement>(null)
  const [fit, setFit] = useState(1)
  // si el pizarrón se llena, se achica un poco para que entre todo
  useLayoutEffect(() => {
    const a = area.current, c = inner.current
    if (!a || !c) return
    const need = c.scrollHeight, have = a.clientHeight
    setFit(need > have ? Math.max(0.55, have / need) : 1)
  }, [board, mode])
  const marked = (b: BoardEl) => 'id' in b && b.id && mark.includes(b.id)
  return (
    <div className="chalkboard relative flex h-full w-full flex-col overflow-hidden rounded-[28px]">
      <div className="flex items-center gap-4 px-10 pt-7">
        <span className="rounded-xl bg-white/10 px-3 py-1 text-[18px] font-black uppercase tracking-wider text-[#ffd84d]">{video.ej.length ? `Ejercicio${video.ej.length > 1 ? 's' : ''} ${ejList(video.ej)}` : 'Repaso'}</span>
        <span className="truncate text-[22px] font-extrabold text-white/80">{video.title}</span>
      </div>
      <div ref={area} className={'relative min-h-0 flex-1 px-10 pt-5 ' + (mode === 'land' && plots.length ? 'pr-[560px]' : '')}>
        <div ref={inner} style={{ transform: `scale(${fit})`, transformOrigin: 'top left', width: `${100 / fit}%` }} className="grid content-start gap-4">
          {mode === 'port' && plots.map((p) => <div key={p.key} className={'chalk-in rounded-2xl ' + (marked(p) ? 'vmark' : '')}><VPlot spec={(p as Extract<BoardEl, { k: 'plot' }>).spec} /></div>)}
          {rest.map((b) => <Item key={b.key} b={b} fresh={b.born === i} marked={!!marked(b)} />)}
        </div>
        {mode === 'land' && plots.length > 0 && (
          <div className="absolute right-8 top-4 grid w-[520px] gap-3">
            {plots.map((p) => <div key={p.key} className={'chalk-in rounded-2xl ' + (marked(p) ? 'vmark' : '')}><VPlot spec={(p as Extract<BoardEl, { k: 'plot' }>).spec} /></div>)}
          </div>
        )}
      </div>
      {subs && (
        <div className="flex items-end gap-4 bg-black/45 px-8 py-4">
          <Mascot mood={mood ?? 'happy'} size={74} className={'shrink-0 ' + (speaking ? 'anim-talk' : '')} />
          <p key={i} className="chalk-in flex-1 text-[26px] font-bold leading-snug text-white">{say}</p>
        </div>
      )}
    </div>
  )
}

function Item({ b, fresh, marked }: { b: BoardEl; fresh: boolean; marked: boolean }) {
  const cls = (fresh ? 'chalk-in ' : '') + (marked ? 'vmark ' : '')
  switch (b.k) {
    case 'h': return <h2 className={cls + 'chalk-title text-[40px] font-black text-[#ffd84d]'}>{b.text}</h2>
    case 'tex': return <div className={cls + 'chalk-tex overflow-hidden rounded-xl px-2 ' + (b.small ? 'text-[24px]' : 'text-[32px]')}><TeX tex={b.tex} display /></div>
    case 'md': return <div className={cls + 'chalk-md rounded-xl px-1 text-[28px] font-semibold leading-snug text-[#f4f1e8]'}><Md as="div" text={b.text} /></div>
    case 'box': {
      const tone = { tip: 'border-[#5fd3ff] bg-[#5fd3ff]/10', ok: 'border-[#9be15d] bg-[#9be15d]/10', bad: 'border-[#ff6b6b] bg-[#ff6b6b]/12', key: 'border-[#ffd84d] bg-[#ffd84d]/10' }[b.tone]
      const icon = { tip: '💡', ok: '✅', bad: '⚠️', key: '🔑' }[b.tone]
      return <div className={cls + 'chalk-md flex gap-3 rounded-2xl border-[3px] px-5 py-3 text-[26px] font-bold leading-snug ' + tone}><span aria-hidden>{icon}</span><Md as="div" text={b.text} /></div>
    }
    default: return null
  }
}
