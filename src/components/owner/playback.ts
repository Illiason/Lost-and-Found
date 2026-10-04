import { useEffect, useRef, useState } from 'react'
import { STEPS } from '../../steps'
import type { StepId } from '../../types'

/** How a step's UI should render: not reached yet, playing its entry animation, or already finished. */
export type Mode = 'hidden' | 'play' | 'done'

/** Elapsed value meaning "animation finished or skipped". Every `t >= x` check passes. */
export const DONE = Number.POSITIVE_INFINITY
/** Elapsed value for a hidden step. Every `t >= x` check (x >= 0) fails. */
const HIDDEN = -1

export const STEP_INDEX = Object.fromEntries(STEPS.map((s, i) => [s.id, i])) as Record<StepId, number>

/**
 * True when the current step should play its entry animation: only a single forward step
 * (next()), plus step 1 right after the owner tree mounts (first load, or a reset, which remounts
 * it). Any other move (back, a digit-key jump, a jump forward by more than one) renders the target
 * step finished, whatever `direction` says.
 */
export function usePlay(index: number, direction: number): boolean {
  const lastIndex = useRef(index)
  const play = useRef(true)
  if (index !== lastIndex.current) {
    play.current = direction === 1 && index === lastIndex.current + 1
    lastIndex.current = index
  }
  return play.current
}

export function modeFor(id: StepId, current: number, play: boolean): Mode {
  const i = STEP_INDEX[id]
  if (i < current) return 'done'
  if (i > current) return 'hidden'
  return play ? 'play' : 'done'
}

/**
 * Milliseconds since a step's entry animation started. DONE once finished (or when the step is
 * already done), -1 while hidden. Timers are cancelled on unmount and whenever the mode changes.
 */
export function useElapsed(mode: Mode, duration: number): number {
  const [t, setT] = useState(mode === 'play' ? 0 : mode === 'done' ? DONE : HIDDEN)

  useEffect(() => {
    if (mode !== 'play') {
      setT(mode === 'done' ? DONE : HIDDEN)
      return
    }
    setT(0)
    const start = performance.now()
    let raf = 0
    const tick = (now: number) => {
      const elapsed = now - start
      if (elapsed >= duration) {
        setT(DONE)
        return
      }
      setT(elapsed)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [mode, duration])

  // Render the right state on the very render where the mode changes, before the effect runs.
  if (mode === 'done') return DONE
  if (mode === 'hidden') return HIDDEN
  return t
}

/** Characters of `text` typed after `t` ms, starting at `start`, one every `perChar` ms. */
export function typedCount(t: number, text: string, start: number, perChar: number): number {
  if (t === DONE) return text.length
  return Math.max(0, Math.min(text.length, Math.floor((t - start) / perChar)))
}

export const clamp01 = (x: number) => Math.max(0, Math.min(1, x))

export const EASE_OUT = [0.22, 1, 0.36, 1] as const
