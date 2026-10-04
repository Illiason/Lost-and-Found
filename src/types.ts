export interface Stop {
  id: string
  name: string
  lat: number
  lon: number
  /** "HH:MM", 24h, local Dublin time */
  time: string
}

export interface Trip {
  source: { name: string; url: string; downloaded: string }
  service: { route: string; headsign: string; tripId: string; date: string }
  ownerBoard: string
  ownerAlight: string
  stops: Stop[]
  /** [lon, lat] pairs. May be empty: fall back to straight lines between stops. */
  shape: [number, number][]
}

export type StepId =
  | 'lost-message'
  | 'lost-parsed'
  | 'map-service'
  | 'map-journey'
  | 'owner-post'
  | 'finder-photo'
  | 'finder-scan'
  | 'finder-handin'
  | 'owner-notified'
  | 'owner-match'
  | 'owner-verify'
  | 'finale'

export type ActivePhone = 'owner' | 'finder' | 'both'

export interface Step {
  id: StepId
  title: string
  act: 1 | 2 | 3
  activePhone: ActivePhone
}
