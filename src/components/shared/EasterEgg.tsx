'use client'

import { useEffect, useCallback } from 'react'
import { triggerConfetti } from './Celebrations'
import { soundEasterEgg } from '@/lib/sounds'

// Easter egg: long press 800ms en cualquier elemento con data-easter-egg
export function EasterEgg() {
  const trigger = useCallback(() => {
    soundEasterEgg()
    triggerConfetti('¡Encontraste un secreto! 🖤', 'ByMik tiene sus misterios 💄')
  }, [])

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>

    function onStart(e: MouseEvent | TouchEvent) {
      const target = e.target as HTMLElement
      if (!target.closest('[data-easter-egg]')) return
      timer = setTimeout(trigger, 800)
    }

    function onEnd() { clearTimeout(timer) }

    window.addEventListener('mousedown', onStart)
    window.addEventListener('touchstart', onStart, { passive: true })
    window.addEventListener('mouseup', onEnd)
    window.addEventListener('touchend', onEnd)
    window.addEventListener('mouseleave', onEnd)

    return () => {
      clearTimeout(timer)
      window.removeEventListener('mousedown', onStart)
      window.removeEventListener('touchstart', onStart)
      window.removeEventListener('mouseup', onEnd)
      window.removeEventListener('touchend', onEnd)
      window.removeEventListener('mouseleave', onEnd)
    }
  }, [trigger])

  return null
}
