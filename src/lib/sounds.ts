/**
 * Sonidos cute generados con Web Audio API.
 * Sin archivos externos — todo programático y liviano.
 */

function ctx(): AudioContext | null {
  if (typeof window === 'undefined') return null
  try {
    return new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
  } catch {
    return null
  }
}

function playTone(
  freqs: number[],
  opts: {
    type?: OscillatorType
    duration?: number
    gap?: number
    gain?: number
    fadeOut?: number
  } = {}
) {
  const ac = ctx()
  if (!ac) return

  const {
    type = 'sine',
    duration = 0.12,
    gap = 0.08,
    gain = 0.18,
    fadeOut = 0.06,
  } = opts

  freqs.forEach((freq, i) => {
    const osc = ac.createOscillator()
    const gainNode = ac.createGain()

    osc.connect(gainNode)
    gainNode.connect(ac.destination)

    osc.type = type
    osc.frequency.value = freq

    const start = ac.currentTime + i * (duration + gap)
    const end   = start + duration

    gainNode.gain.setValueAtTime(0, start)
    gainNode.gain.linearRampToValueAtTime(gain, start + 0.01)
    gainNode.gain.setValueAtTime(gain, end - fadeOut)
    gainNode.gain.linearRampToValueAtTime(0, end)

    osc.start(start)
    osc.stop(end)
  })
}

// ─── Sonidos individuales ─────────────────────────────────────────────────────

/** Pedido creado — dos notas elegantes */
export function soundPedidoOk() {
  playTone([440, 554], { type: 'sine', duration: 0.13, gap: 0.06, gain: 0.14 })
}

/** Producto / cliente creado — pop limpio */
export function soundCreado() {
  playTone([660, 880], { type: 'sine', duration: 0.09, gap: 0.04, gain: 0.11 })
}

/** Guardado / actualizado — nota única precisa */
export function soundGuardado() {
  playTone([587], { type: 'sine', duration: 0.16, gain: 0.12, fadeOut: 0.08 })
}

/** Eliminado — nota descendente suave */
export function soundEliminado() {
  playTone([440, 330], { type: 'sine', duration: 0.10, gap: 0.05, gain: 0.09 })
}

/** Login bienvenida — tres notas elegantes */
export function soundBienvenida() {
  playTone([440, 554, 659], { type: 'sine', duration: 0.12, gap: 0.07, gain: 0.13 })
}

/** Celebración / hito — acorde limpio */
export function soundCelebracion() {
  playTone([440, 554, 659, 880], { type: 'sine', duration: 0.13, gap: 0.05, gain: 0.12 })
}

/** Easter egg — escalita rápida y juguetona */
export function soundEasterEgg() {
  playTone([440, 494, 554, 587, 659, 740, 880, 988], {
    type: 'sine', duration: 0.07, gap: 0.03, gain: 0.11,
  })
}

/** Estado actualizado — click preciso */
export function soundEstado() {
  playTone([660], { type: 'sine', duration: 0.08, gain: 0.08, fadeOut: 0.04 })
}
