/** Pi, la mascota de MathVerse (personaje original, dibujado en SVG). */
import type { ReactNode } from 'react'

export type Mood = 'happy' | 'wow' | 'sad' | 'think' | 'party'

export function Mascot({ mood = 'happy', size = 96, className = '' }: { mood?: Mood; size?: number; className?: string }) {
  const mouth = {
    happy: <path d="M40 66 Q50 76 60 66" fill="none" stroke="#3c3c3c" strokeWidth="3.5" strokeLinecap="round" />,
    party: <path d="M38 63 Q50 80 62 63 Z" fill="#7a1f1f" stroke="#3c3c3c" strokeWidth="3" strokeLinejoin="round" />,
    wow: <ellipse cx="50" cy="68" rx="5.5" ry="6.5" fill="#7a1f1f" stroke="#3c3c3c" strokeWidth="3" />,
    sad: <path d="M40 72 Q50 63 60 72" fill="none" stroke="#3c3c3c" strokeWidth="3.5" strokeLinecap="round" />,
    think: <path d="M42 69 L58 66" fill="none" stroke="#3c3c3c" strokeWidth="3.5" strokeLinecap="round" />,
  }[mood]
  const pupil = mood === 'think' ? { dx: 2, dy: -3 } : mood === 'sad' ? { dx: 0, dy: 2 } : { dx: 1, dy: 0 }
  return (
    <svg viewBox="0 0 100 110" width={size} height={size * 1.1} className={className} role="img" aria-label="Pi, la mascota">
      {/* antena con estrella */}
      <path d="M50 22 Q47 12 53 6" fill="none" stroke="rgb(var(--brand-dk))" strokeWidth="3" strokeLinecap="round" />
      <path d="M53 0 l2.2 4.6 5 .7 -3.6 3.5 .9 5 -4.5 -2.4 -4.5 2.4 .9 -5 -3.6 -3.5 5 -.7z" fill="rgb(var(--gold))" />
      {/* brazos */}
      {mood === 'party'
        ? <><path d="M18 58 Q8 40 14 30" fill="none" stroke="rgb(var(--brand-dk))" strokeWidth="7" strokeLinecap="round" /><path d="M82 58 Q92 40 86 30" fill="none" stroke="rgb(var(--brand-dk))" strokeWidth="7" strokeLinecap="round" /></>
        : <><path d="M17 62 Q8 70 12 80" fill="none" stroke="rgb(var(--brand-dk))" strokeWidth="7" strokeLinecap="round" /><path d="M83 62 Q92 70 88 80" fill="none" stroke="rgb(var(--brand-dk))" strokeWidth="7" strokeLinecap="round" /></>}
      {/* pies */}
      <ellipse cx="38" cy="102" rx="10" ry="5" fill="rgb(var(--gold))" />
      <ellipse cx="62" cy="102" rx="10" ry="5" fill="rgb(var(--gold))" />
      {/* cuerpo */}
      <ellipse cx="50" cy="60" rx="35" ry="40" fill="rgb(var(--brand))" />
      <ellipse cx="50" cy="74" rx="22" ry="20" fill="#fff" opacity=".35" />
      {/* π en la panza */}
      <text x="50" y="92" textAnchor="middle" fontSize="15" fontWeight="900" fill="rgb(var(--brand-dk))" fontFamily="serif">π</text>
      {/* ojos */}
      <ellipse cx="37" cy="46" rx="11" ry="12.5" fill="#fff" />
      <ellipse cx="63" cy="46" rx="11" ry="12.5" fill="#fff" />
      {mood === 'party'
        ? <><path d="M30 47 Q37 39 44 47" fill="none" stroke="#3c3c3c" strokeWidth="3.5" strokeLinecap="round" /><path d="M56 47 Q63 39 70 47" fill="none" stroke="#3c3c3c" strokeWidth="3.5" strokeLinecap="round" /></>
        : <><circle cx={37 + pupil.dx} cy={47 + pupil.dy} r="5.5" fill="#3c3c3c" /><circle cx={63 + pupil.dx} cy={47 + pupil.dy} r="5.5" fill="#3c3c3c" /><circle cx={39 + pupil.dx} cy={44 + pupil.dy} r="1.8" fill="#fff" /><circle cx={65 + pupil.dx} cy={44 + pupil.dy} r="1.8" fill="#fff" /></>}
      {mood === 'sad' && <><path d="M27 37 L44 32" stroke="#3c3c3c" strokeWidth="3" strokeLinecap="round" /><path d="M73 37 L56 32" stroke="#3c3c3c" strokeWidth="3" strokeLinecap="round" /></>}
      {mood === 'think' && <path d="M55 31 Q63 26 72 31" fill="none" stroke="#3c3c3c" strokeWidth="3" strokeLinecap="round" />}
      {/* cachetes */}
      <ellipse cx="25" cy="62" rx="5" ry="3" fill="#ff8fa3" opacity=".7" />
      <ellipse cx="75" cy="62" rx="5" ry="3" fill="#ff8fa3" opacity=".7" />
      {mouth}
    </svg>
  )
}

/** Globo de diálogo de la mascota. */
export function Speech({ children, mood = 'happy', size = 84, side = 'left' }: { children: ReactNode; mood?: Mood; size?: number; side?: 'left' | 'right' }) {
  return (
    <div className={'flex items-end gap-3 ' + (side === 'right' ? 'flex-row-reverse' : '')}>
      <Mascot mood={mood} size={size} className="shrink-0" />
      <div className="relative mb-6 rounded-2xl border-2 border-line bg-surface px-4 py-3 font-semibold leading-relaxed">
        {children}
      </div>
    </div>
  )
}
