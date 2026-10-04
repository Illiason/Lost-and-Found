import { trip } from '../../data/trip'
import type { Stop } from '../../types'

// Everything station- or time-related comes from trip.json; nothing here is hardcoded.
const stops = trip.stops

export const board: Stop = stops.find((s) => s.name === trip.ownerBoard) ?? stops[0]
export const alight: Stop =
  stops.find((s) => s.name === trip.ownerAlight) ?? stops[Math.min(1, stops.length - 1)]
export const terminus: Stop = stops[stops.length - 1]
export const route = trip.service.route

const toMinutes = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number)
  return h * 60 + m
}
/** Minutes from a to b, allowing the journey to run past midnight. */
const span = (a: string, b: string) => (((toMinutes(b) - toMinutes(a)) % 1440) + 1440) % 1440

/*
 * Step-4 timing contract, shared with the map's train (MapStage implements the same formula):
 * with T = minutes from board to terminus, the train reaches a stop at
 * (stopMinutes - boardMinutes) / T * RIDE_MS after step 4 starts, and pauses ALIGHT_PAUSE_MS at
 * the alight stop, so every stop after it is that much later.
 */
export const RIDE_MS = 7000
export const ALIGHT_PAUSE_MS = 700

const rideMinutes = span(board.time, terminus.time)
const alightIndex = stops.indexOf(alight)

/** Ms after step 4 starts when the train reaches `stop`. */
export function arrivalMs(stop: Stop): number {
  const at = rideMinutes === 0 ? 0 : (span(board.time, stop.time) / rideMinutes) * RIDE_MS
  return at + (stops.indexOf(stop) > alightIndex ? ALIGHT_PAUSE_MS : 0)
}

export const ALIGHT_AT_MS = arrivalMs(alight)
export const TERMINUS_AT_MS = arrivalMs(terminus)

/** "Sat 3 Oct" for the service date. */
export const serviceDay = new Date(`${trip.service.date}T12:00:00`).toLocaleDateString('en-IE', {
  weekday: 'short',
  day: 'numeric',
  month: 'short',
})
