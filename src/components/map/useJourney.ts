import { useLayoutEffect, useState } from 'react'
import { useStep } from '../../state/StepContext'
import { alightKm, at, boardKm, terminusKm } from './geometry'

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

const LEAD_IN_MS = 400
const TRAVEL_MS = 6200
const PAUSE_MS = 700

const easeInOut = (t: number) => -(Math.cos(Math.PI * t) - 1) / 2

/**
 * Drives the train along the route on a forward entry into map-journey.
 * Any other arrival (backward, reset, later steps) gets the settled state instantly.
 */
export function useJourney(): Journey {
  const { index, direction, resetCount } = useStep()
  const [state, setState] = useState<Journey>(index < JOURNEY ? NONE : DONE)

  // Layout effect so a step change never paints one frame of the previous journey state.
  useLayoutEffect(() => {
    if (index !== JOURNEY || direction === -1) {
      setState(index < JOURNEY ? NONE : DONE)
      return
    }

    const leg1Km = alightKm - boardKm
    const leg2Km = terminusKm - alightKm
    const leg1Ms = (TRAVEL_MS * leg1Km) / (leg1Km + leg2Km)
    const leg2Ms = TRAVEL_MS - leg1Ms
    const t1 = LEAD_IN_MS + leg1Ms
    const t2 = t1 + PAUSE_MS
    const t3 = t2 + leg2Ms

    let raf = 0
    const start = performance.now()
    const tick = (now: number) => {
      const t = now - start
      if (t < t1) {
        const p = Math.max(0, t - LEAD_IN_MS) / leg1Ms
        setState({ km: boardKm + leg1Km * easeInOut(p), phase: 'leg1', playing: true })
      } else if (t < t2) {
        setState({ km: alightKm, phase: 'pause', playing: true })
      } else if (t < t3) {
        setState({ km: alightKm + leg2Km * easeInOut((t - t2) / leg2Ms), phase: 'leg2', playing: true })
      } else {
        setState({ ...DONE, playing: true })
        return
      }
      raf = requestAnimationFrame(tick)
    }
    setState({ km: boardKm, phase: 'leg1', playing: true })
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
    // direction is read on purpose without being a dependency: it only matters at the moment the step changes.
  }, [index, resetCount])

  return state
}
