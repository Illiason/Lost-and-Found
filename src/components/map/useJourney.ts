import { useLayoutEffect, useState } from 'react'
import { useStep } from '../../state/StepContext'
import { at, boardKm, terminusKm } from './geometry'
import { ALIGHT_MS, DEPART_ALIGHT_MS, JOURNEY_MS, kmAt } from './schedule'

export type Phase = 'none' | 'leg1' | 'pause' | 'leg2' | 'arrived'

export interface Journey {
  /** Distance along the route reached by the train, or null before the journey step. */
  km: number | null
  phase: Phase
  /** True only while the step-4 entry animation is running (or just finished it). */
  playing: boolean
}

const JOURNEY = at('map-journey')
const NONE: Journey = { km: null, phase: 'none', playing: false }
const DONE: Journey = { km: terminusKm, phase: 'arrived', playing: false }

const phaseAt = (t: number): Phase =>
  t < ALIGHT_MS ? 'leg1' : t < DEPART_ALIGHT_MS ? 'pause' : t < JOURNEY_MS ? 'leg2' : 'arrived'

/**
 * Drives the train along the route on a forward entry into map-journey, following the
 * timing contract in schedule.ts. Any other arrival (backward, jump, reset, later steps)
 * gets the settled state instantly.
 */
export function useJourney(): Journey {
  const { index, direction, resetCount } = useStep()
  const [state, setState] = useState<Journey>(index < JOURNEY ? NONE : DONE)

  // Layout effect so a step change never paints one frame of the previous journey state.
  // Cleanup cancels the frame loop, so StrictMode's double run and fast key presses are safe.
  useLayoutEffect(() => {
    if (index !== JOURNEY || direction === -1) {
      setState(index < JOURNEY ? NONE : DONE)
      return
    }

    let raf = 0
    const start = performance.now()
    const tick = (now: number) => {
      const t = now - start
      if (t >= JOURNEY_MS) {
        setState({ ...DONE, playing: true })
        return
      }
      setState({ km: kmAt(t), phase: phaseAt(t), playing: true })
      raf = requestAnimationFrame(tick)
    }
    setState({ km: boardKm, phase: 'leg1', playing: true })
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
    // direction is read on purpose without being a dependency: it only matters at the moment the step changes.
  }, [index, resetCount])

  return state
}
