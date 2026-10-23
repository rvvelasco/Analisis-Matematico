/** Íconos SVG propios (sin dependencias externas). */
const P = {
  home: 'M3 11.5 12 4l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z',
  learn: 'M12 3 2 8l10 5 10-5-10-5Zm-6 7.5V15c0 1.7 2.7 3.5 6 3.5s6-1.8 6-3.5v-4.5',
  games: 'M6 9h4M8 7v4M15 9.5h.01M18 8h.01M7 5h10a4 4 0 0 1 4 4v3.5a3.5 3.5 0 0 1-6.3 2.1L14 14h-4l-.7.6A3.5 3.5 0 0 1 3 12.5V9a4 4 0 0 1 4-4Z',
  lab: 'M9 3h6M10 3v6L4.5 18.5A1.7 1.7 0 0 0 6 21h12a1.7 1.7 0 0 0 1.5-2.5L14 9V3M7 15h10',
  exam: 'M8 3h8l4 4v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h3Zm0 8h8M8 15h5M8 7h4',
  progress: 'M4 20V10M10 20V4M16 20v-7M22 20H2',
  settings: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm7.4-3a7.4 7.4 0 0 0-.1-1.2l2-1.6-2-3.4-2.4 1a7.6 7.6 0 0 0-2-1.2L14.5 3h-4l-.4 2.6a7.6 7.6 0 0 0-2 1.2l-2.4-1-2 3.4 2 1.6a7.4 7.4 0 0 0 0 2.4l-2 1.6 2 3.4 2.4-1a7.6 7.6 0 0 0 2 1.2l.4 2.6h4l.4-2.6a7.6 7.6 0 0 0 2-1.2l2.4 1 2-3.4-2-1.6c.1-.4.1-.8.1-1.2Z',
  lock: 'M7 11V8a5 5 0 0 1 10 0v3M5 11h14v10H5z',
  check: 'M5 12.5 10 17 19 7',
  fire: 'M12 3s5 4.5 5 9.5a5 5 0 0 1-10 0c0-2 1-3.5 1-3.5s.5 2 2 2.5C10 9 12 3 12 3Z',
  star: 'm12 3 2.8 5.7 6.2.9-4.5 4.4 1 6.2L12 17.3 6.5 20.2l1-6.2L3 9.6l6.2-.9z',
  review: 'M4 4v6h6M20 20v-6h-6M5.5 15a7 7 0 0 0 12.3 2M18.5 9A7 7 0 0 0 6.2 7',
  play: 'M7 4v16l13-8z',
  arrow: 'M5 12h14M13 6l6 6-6 6',
  back: 'M19 12H5M11 6l-6 6 6 6',
  sun: 'M12 4V2M12 22v-2M4 12H2M22 12h-2M5.6 5.6 4.2 4.2M19.8 19.8l-1.4-1.4M5.6 18.4l-1.4 1.4M19.8 4.2l-1.4 1.4M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z',
  moon: 'M20 14.5A8.5 8.5 0 1 1 9.5 4 7 7 0 0 0 20 14.5Z',
  clock: 'M12 7v5l3 2M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z',
  target: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0-4a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm0-4a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z',
  map: 'M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2Zm0 0v14m6-12v14',
  close: 'M6 6l12 12M18 6 6 18',
}
export type IconName = keyof typeof P

export function Icon({ name, className = 'h-5 w-5', title }: { name: IconName; className?: string; title?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" aria-hidden={title ? undefined : true} role={title ? 'img' : undefined}>
      {title && <title>{title}</title>}
      <path d={P[name]} />
    </svg>
  )
}
