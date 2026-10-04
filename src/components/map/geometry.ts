import { along, lineSliceAlong, lineString, nearestPointOnLine, point } from '@turf/turf'
import type { Feature, FeatureCollection, LineString, Point } from 'geojson'
import { alightStop, boardStop, routeCoords, terminus, trip } from '../../data/trip'
import { STEPS } from '../../steps'
import type { Stop, StepId } from '../../types'

/** Everything the map draws is derived here from trip.json. No station names or times are hardcoded. */

export const board: Stop = boardStop ?? trip.stops[0]
export const alight: Stop = alightStop ?? trip.stops[Math.floor(trip.stops.length / 2)]
export { terminus }

export const route: Feature<LineString> = lineString(routeCoords)

const kmAlong = (s: Stop) =>
  nearestPointOnLine(route, point([s.lon, s.lat]), { units: 'kilometers' }).properties.location

export const boardKm = kmAlong(board)
export const alightKm = kmAlong(alight)
export const terminusKm = kmAlong(terminus)

export const EMPTY: FeatureCollection = { type: 'FeatureCollection', features: [] }

/** Part of the route between two distances, or EMPTY if the span is zero. */
export function slice(fromKm: number, toKm: number): Feature<LineString> | FeatureCollection {
  if (toKm - fromKm < 0.001) return EMPTY
  return lineSliceAlong(route, fromKm, toKm, { units: 'kilometers' })
}

export function pointAt(km: number): Feature<Point> {
  return along(route, km, { units: 'kilometers' })
}

export const stopsGeo: FeatureCollection<Point> = {
  type: 'FeatureCollection',
  features: trip.stops.map((s) => ({
    type: 'Feature',
    properties: { name: s.name },
    geometry: { type: 'Point', coordinates: [s.lon, s.lat] },
  })),
}

export const connectorGeo: Feature<LineString> = lineString([
  [alight.lon, alight.lat],
  [terminus.lon, terminus.lat],
])

export const connectorMid: [number, number] = [(alight.lon + terminus.lon) / 2, (alight.lat + terminus.lat) / 2]

function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number)
  return h * 60 + m
}

/** Minutes from a to b, wrapping past midnight. */
export function minutesBetween(a: string, b: string): number {
  return (toMinutes(b) - toMinutes(a) + 1440) % 1440
}

const indexOfStop = (s: Stop) => trip.stops.findIndex((x) => x.id === s.id)
export const onwardStops = indexOfStop(terminus) - indexOfStop(alight)
export const onwardMinutes = minutesBetween(alight.time, terminus.time)

export type Bounds = [[number, number], [number, number]]

function boundsOf(coords: [number, number][]): Bounds {
  let [minX, minY, maxX, maxY] = [Infinity, Infinity, -Infinity, -Infinity]
  for (const [x, y] of coords) {
    minX = Math.min(minX, x)
    minY = Math.min(minY, y)
    maxX = Math.max(maxX, x)
    maxY = Math.max(maxY, y)
  }
  return [
    [minX, minY],
    [maxX, maxY],
  ]
}

const coordsOf = (f: Feature<LineString> | FeatureCollection) =>
  'geometry' in f ? (f.geometry.coordinates as [number, number][]) : []

export const tripBounds = boundsOf(coordsOf(slice(boardKm, terminusKm)))
export const onwardBounds = boundsOf(coordsOf(slice(alightKm, terminusKm)))

/** Step position by id, so visibility rules survive any reordering of STEPS. */
export const at = (id: StepId) => STEPS.findIndex((s) => s.id === id)
