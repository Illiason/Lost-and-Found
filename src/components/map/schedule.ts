import { nearestPointOnLine, point } from '@turf/turf'
import { trip } from '../../data/trip'
import { alight, board, minutesBetween, route, terminus } from './geometry'

/**
 * Step-4 timing contract, shared with the owner phone's timeline (see CONTRACT.md):
 *   T = minutes from board time to terminus time (midnight-safe)
 *   the train reaches stop s at (minutes(s) - minutes(board)) / T * RIDE_MS after step 4 starts,
 *   it pauses PAUSE_MS at the alight stop, so every later stop is PAUSE_MS later.
 * Between stops it moves along the shape at constant speed by distance.
 */
export const RIDE_MS = 7000
export const PAUSE_MS = 700

const stops = trip.stops
const boardIdx = stops.findIndex((s) => s.id === board.id)
const alightIdx = stops.findIndex((s) => s.id === alight.id)
const terminusIdx = stops.findIndex((s) => s.id === terminus.id)
const T = minutesBetween(board.time, terminus.time) || 1

/** Ms after step 4 starts when the train reaches stops[i]. */
export function arrivalMs(i: number): number {
  const base = (minutesBetween(board.time, stops[i].time) / T) * RIDE_MS
  return i > alightIdx ? base + PAUSE_MS : base
}

export const ALIGHT_MS = arrivalMs(alightIdx)
export const DEPART_ALIGHT_MS = ALIGHT_MS + PAUSE_MS
export const JOURNEY_MS = arrivalMs(terminusIdx)

/** Distance along the route of every stop from board to terminus, forced non-decreasing. */
const keyframes: { t: number; km: number }[] = []
let lastKm = 0
for (let i = boardIdx; i <= terminusIdx; i++) {
  const s = stops[i]
  const km = nearestPointOnLine(route, point([s.lon, s.lat]), { units: 'kilometers' }).properties.location
  lastKm = Math.max(lastKm, km)
  keyframes.push({ t: arrivalMs(i), km: lastKm })
  if (i === alightIdx) keyframes.push({ t: DEPART_ALIGHT_MS, km: lastKm })
}

/** Train position (km along the route) at `t` ms into step 4. */
export function kmAt(t: number): number {
  if (t <= keyframes[0].t) return keyframes[0].km
  for (let k = 1; k < keyframes.length; k++) {
    const a = keyframes[k - 1]
    const b = keyframes[k]
    if (t < b.t) return b.t === a.t ? b.km : a.km + ((b.km - a.km) * (t - a.t)) / (b.t - a.t)
  }
  return keyframes[keyframes.length - 1].km
}
