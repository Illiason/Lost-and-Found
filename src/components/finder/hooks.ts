import { useEffect, useState } from 'react'
import { content } from '../../data/content'

const FALLBACK_PHOTO = '/found-laptop.svg'

/** The value from the first render. Screens use it to lock in "animate or not" for their lifetime. */
export function useFrozen<T>(value: T): T {
  const [frozen] = useState(value)
  return frozen
}

/**
 * Walks through sub-phases of a step on timers.
 * `delays` are cumulative ms; phase n starts at delays[n - 1].
 * When not animating it starts at the last phase, so the finished state renders instantly.
 * Timers are cleared on unmount, which is how a step change or reset cancels them.
 */
export function usePhase(delays: readonly number[], animate: boolean): number {
  const [phase, setPhase] = useState(animate ? 0 : delays.length)

  useEffect(() => {
    if (!animate) return
    const timers = delays.map((ms, i) => window.setTimeout(() => setPhase(i + 1), ms))
    return () => timers.forEach((t) => window.clearTimeout(t))
  }, [animate, delays])

  return phase
}

/** content.finderPhoto if it loads, else the bundled placeholder, else null (grey box). */
export function usePhotoSrc(): string | null {
  const [src, setSrc] = useState<string | null>(null)

  useEffect(() => {
    let live = true
    const probe = (url: string, onFail: () => void) => {
      const img = new Image()
      img.onload = () => live && setSrc(url)
      img.onerror = () => live && onFail()
      img.src = url
    }
    probe(content.finderPhoto, () => probe(FALLBACK_PHOTO, () => {}))
    return () => {
      live = false
    }
  }, [])

  return src
}
