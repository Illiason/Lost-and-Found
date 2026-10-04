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

/** Share of the board → terminus ride that happens before the owner gets off (0..1). */
export const alightShare = (() => {
  const total = span(board.time, terminus.time)
  return total > 0 ? span(board.time, alight.time) / total : 0.5
})()

/** "Sat 3 Oct" for the service date. */
export const serviceDay = new Date(`${trip.service.date}T12:00:00`).toLocaleDateString('en-IE', {
  weekday: 'short',
  day: 'numeric',
  month: 'short',
})
