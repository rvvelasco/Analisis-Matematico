/** Efectos de sonido cortos generados con Web Audio (sin archivos, funcionan sin conexión). */
import { getState } from '../progress/store'

let ctx: AudioContext | null = null

function tone(freqs: number[], dur = 0.12, type: OscillatorType = 'sine', gap = 0.09, vol = 0.12): void {
  if (!getState().settings.sound) return
  try {
    ctx = ctx ?? new AudioContext()
    const t0 = ctx.currentTime
    freqs.forEach((f, i) => {
      const o = ctx!.createOscillator(), g = ctx!.createGain()
      o.type = type
      o.frequency.value = f
      const s = t0 + i * gap
      g.gain.setValueAtTime(0.0001, s)
      g.gain.exponentialRampToValueAtTime(vol, s + 0.015)
      g.gain.exponentialRampToValueAtTime(0.0001, s + dur)
      o.connect(g).connect(ctx!.destination)
      o.start(s)
      o.stop(s + dur + 0.02)
    })
  } catch {
    /* sin audio disponible: se ignora */
  }
}

export const sfx = {
  correct: () => tone([660, 880], 0.14, 'sine', 0.09),
  wrong: () => tone([220, 180], 0.18, 'triangle', 0.12, 0.1),
  finish: () => tone([523, 659, 784, 1047], 0.18, 'sine', 0.11),
  tap: () => tone([440], 0.05, 'sine', 0, 0.05),
}
