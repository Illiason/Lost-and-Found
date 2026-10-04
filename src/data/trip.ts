import type { Stop, Trip } from '../types'
import raw from './trip.json'

export const trip = raw as Trip

/** Last stop of the service. Always derived, never hardcoded. */
export const terminus: Stop = trip.stops[trip.stops.length - 1]

export const boardStop: Stop | undefined = trip.stops.find((s) => s.name === trip.ownerBoard)
export const alightStop: Stop | undefined = trip.stops.find((s) => s.name === trip.ownerAlight)

/** Line coordinates as [lon, lat]. Uses the GTFS shape when present, else straight lines between stops. */
export const routeCoords: [number, number][] =
  trip.shape.length > 1 ? trip.shape : trip.stops.map((s) => [s.lon, s.lat])
