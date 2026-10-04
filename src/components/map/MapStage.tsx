import type { StyleSpecification } from 'maplibre-gl'
import * as maplibregl from 'maplibre-gl'
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url'
import { useEffect, useMemo, useRef, useState } from 'react'
import Map, { Layer, Source, type MapRef } from 'react-map-gl/maplibre'
import { content } from '../../data/content'
import { trip } from '../../data/trip'
import { useStep } from '../../state/StepContext'
import type { StepId } from '../../types'
import { useStageScale } from '../ui/Stage'
import {
  alight,
  alightKm,
  at,
  board,
  boardKm,
  connectorGeo,
  connectorMid,
  EMPTY,
  onwardBounds,
  onwardMinutes,
  onwardStops,
  pointAt,
  slice,
  stopsGeo,
  terminus,
  terminusKm,
  tripBounds,
  type Bounds,
} from './geometry'
import './map.css'
import { Callout, FoundMarker, GlassCard, PulseRings, StationLabel, TerminusPin } from './overlays'
import { useJourney } from './useJourney'

// MapLibre finds its worker next to its own module file, which Vite's bundling moves.
// Point it at a Vite-bundled copy instead, and pass this same instance to <Map mapLib>
// because react-map-gl's own lazy import can resolve to a separate module instance in dev.
maplibregl.setWorkerUrl(workerUrl)

const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json'

/** Used when the basemap style cannot be fetched: our layers and overlays still draw on a plain background. */
const FALLBACK_STYLE: StyleSpecification = {
  version: 8,
  sources: {},
  layers: [{ id: 'background', type: 'background', paint: { 'background-color': '#0B0F0E' } }],
}

const AMBER = '#F5B547'
const ACCENT = '#3DDC84'
const MUTED = '#8FA39A'
const BG = '#0B0F0E'

// Map-only copy that has no slot in content.ts yet.
const COPY = {
  timetableTag: 'From NTA timetable',
  foundHere: 'Found here',
  handedToStaff: 'Handed to staff',
}

const DUBLIN_BAY = { center: [-6.17, 53.345] as [number, number], zoom: 10.1 }
type Padding = { top: number; bottom: number; left: number; right: number }
// Trip view leaves room left of the alight stop and above the terminus for the step-4 callouts.
const TRIP_PADDING: Padding = { top: 150, bottom: 90, left: 270, right: 140 }
const ONWARD_PADDING: Padding = { top: 170, bottom: 100, left: 150, right: 80 }
// On narrow stages the finale chips wrap to two rows, so keep the route clear of them.
const finalePadding = (width: number): Padding => ({ top: 150, bottom: width < 1000 ? 250 : 160, left: 150, right: 80 })

type Camera = { center: [number, number]; zoom: number } | { bounds: Bounds; padding: Padding }

function cameraFor(stepId: StepId, width: number): Camera {
  switch (stepId) {
    case 'lost-message':
    case 'lost-parsed':
      return DUBLIN_BAY
    case 'map-service':
    case 'map-journey':
    case 'owner-post':
      return { bounds: tripBounds, padding: TRIP_PADDING }
    case 'finder-photo':
    case 'finder-scan':
    case 'finder-handin':
      return { center: [terminus.lon, terminus.lat], zoom: 13.5 }
    case 'owner-notified':
    case 'owner-match':
    case 'owner-verify':
      return { bounds: onwardBounds, padding: ONWARD_PADDING }
    case 'finale':
      return { bounds: tripBounds, padding: finalePadding(width) }
  }
}

const vis = (on: boolean) => ({ visibility: on ? ('visible' as const) : ('none' as const) })
const ROUND = { 'line-cap': 'round', 'line-join': 'round' } as const

export function MapStage() {
  const { index, stepId, direction, resetCount } = useStep()
  const journey = useJourney()
  const mapRef = useRef<MapRef>(null)
  const [loaded, setLoaded] = useState(false)
  // Known offline (e.g. DevTools offline): skip the doomed basemap request entirely.
  const [mapStyle, setMapStyle] = useState<string | StyleSpecification>(() =>
    navigator.onLine ? MAP_STYLE : FALLBACK_STYLE,
  )

  const forward = direction === 1
  const entering = (id: StepId) => forward && stepId === id

  const showEndpoints = index >= at('lost-parsed')
  const showService = index >= at('map-service')
  const showJourney = index >= at('map-journey')
  const arrived = journey.phase === 'arrived'
  const showCallouts = showJourney && index <= at('owner-post')
  // The found marker belongs to the finder's act; from step 9 the pin and rings carry the story.
  const showFound = index >= at('finder-photo') && index <= at('finder-handin')
  const showHanded = index >= at('finder-handin')
  const showRings = stepId === 'owner-notified'
  const showConnector = index >= at('owner-match') && index <= at('owner-verify')
  const finale = stepId === 'finale'

  // Camera: fly on forward entry, jump on backward or reset. Steps 1-2 drift slowly.
  const cameraReady = useRef(false)
  useEffect(() => {
    const map = mapRef.current?.getMap()
    if (!loaded || !map) return
    const firstRun = !cameraReady.current
    cameraReady.current = true

    // Steps 1-2 share one view. Moving forward into them (1 -> 2, or leaving the intro onto step 1)
    // keeps the running drift instead of snapping back.
    if ((stepId === 'lost-message' || stepId === 'lost-parsed') && forward && !firstRun) return

    map.stop()
    const cam = cameraFor(stepId, map.getContainer().clientWidth)
    const target =
      'bounds' in cam
        ? map.cameraForBounds(cam.bounds, { padding: cam.padding })
        : { center: cam.center, zoom: cam.zoom }
    if (!target) return

    if (forward && !firstRun) {
      map.flyTo({ ...target, bearing: 0, pitch: 0, duration: 1800, curve: 1.3, essential: true })
    } else {
      map.jumpTo({ ...target, bearing: 0, pitch: 0 })
      if (stepId === 'lost-message' || stepId === 'lost-parsed') {
        map.easeTo({ zoom: DUBLIN_BAY.zoom + 0.5, duration: 90000, easing: (t) => t, essential: true })
      }
    }
    // stepId and direction always change together with index, so index is the trigger.
  }, [index, resetCount, loaded])

  // The stage is CSS-scaled, so MapLibre's layout size never changes. When the stage is scaled up
  // (big screens) raise the canvas pixel ratio so tiles and lines stay sharp.
  const stageScale = useStageScale()
  useEffect(() => {
    const map = mapRef.current?.getMap()
    if (!loaded || !map) return
    map.setPixelRatio(Math.min(3, window.devicePixelRatio * Math.max(1, stageScale)))
    map.resize()
  }, [stageScale, loaded])

  // If the style never arrives, fall back to a plain background so lines and callouts still show.
  useEffect(() => {
    if (loaded) return
    const timer = window.setTimeout(() => {
      setMapStyle(FALLBACK_STYLE)
      setLoaded(true)
    }, 8000)
    return () => window.clearTimeout(timer)
  }, [loaded])

  const fullLine = useMemo(() => slice(boardKm, terminusKm), [])
  const ownerTrail = useMemo(
    () => (journey.km === null || finale ? EMPTY : slice(boardKm, Math.min(journey.km, alightKm))),
    [journey.km, finale],
  )
  const itemTrail = useMemo(
    () => (journey.km === null || finale || journey.km <= alightKm ? EMPTY : slice(alightKm, journey.km)),
    [journey.km, finale],
  )
  const trainMoving = journey.km !== null && journey.playing && !arrived
  const train = useMemo(
    () => (trainMoving && journey.km !== null ? pointAt(journey.km) : EMPTY),
    [trainMoving, journey.km],
  )
  const trainColor = journey.phase === 'leg1' || journey.phase === 'pause' ? AMBER : ACCENT

  const fade = { duration: forward ? 600 : 0, delay: 0 }
  const timeline = [
    `Boarded ${board.name} ${board.time}`,
    `Got off ${alight.name} ${alight.time}`,
    `Laptop arrived ${terminus.name} ${terminus.time}`,
  ]

  return (
    <div
      className="relative h-full w-full overflow-hidden rounded-2xl border border-border shadow-soft"
      style={{ background: BG }}
    >
      <Map
        ref={mapRef}
        mapLib={maplibregl}
        initialViewState={{ longitude: DUBLIN_BAY.center[0], latitude: DUBLIN_BAY.center[1], zoom: DUBLIN_BAY.zoom }}
        mapStyle={mapStyle}
        // A diff against a style that never loaded only produces a warning; always rebuild instead.
        styleDiffing={false}
        attributionControl={{ compact: false }}
        style={{ width: '100%', height: '100%', background: BG }}
        interactive={false}
        onLoad={() => setLoaded(true)}
        onError={(e) => {
          // Only a missing style document is fatal; individual tile errors leave our layers intact.
          if (!loaded && !e.target.isStyleLoaded()) {
            setMapStyle(FALLBACK_STYLE)
            setLoaded(true)
          }
        }}
      >
        {/* All sources and layers stay mounted so their draw order never changes; visibility and data do the work. */}
        <Source id="ll-route" type="geojson" data={fullLine}>
          <Layer
            id="ll-route-glow"
            type="line"
            layout={{ ...vis(showService), ...ROUND }}
            paint={{
              'line-opacity-transition': fade,
              'line-color': ACCENT,
              'line-width': 16,
              'line-blur': 10,
              'line-opacity': finale ? 0.45 : 0,
            }}
          />
          <Layer
            id="ll-route-line"
            type="line"
            layout={{ ...vis(showService), ...ROUND }}
            paint={{
              'line-color-transition': fade,
              'line-opacity-transition': fade,
              'line-color': finale ? ACCENT : MUTED,
              'line-width': finale ? 4.5 : 3,
              'line-opacity': finale ? 1 : 0.5,
            }}
          />
        </Source>

        <Source id="ll-owner-trail" type="geojson" data={ownerTrail}>
          <Layer
            id="ll-owner-trail-glow"
            type="line"
            layout={ROUND}
            paint={{ 'line-color': AMBER, 'line-width': 14, 'line-blur': 9, 'line-opacity': 0.35 }}
          />
          <Layer id="ll-owner-trail" type="line" layout={ROUND} paint={{ 'line-color': AMBER, 'line-width': 5 }} />
        </Source>

        <Source id="ll-item-trail" type="geojson" data={itemTrail}>
          <Layer
            id="ll-item-trail-glow"
            type="line"
            layout={ROUND}
            paint={{ 'line-color': ACCENT, 'line-width': 14, 'line-blur': 9, 'line-opacity': 0.35 }}
          />
          <Layer id="ll-item-trail" type="line" layout={ROUND} paint={{ 'line-color': ACCENT, 'line-width': 5 }} />
        </Source>

        <Source id="ll-stops" type="geojson" data={stopsGeo}>
          <Layer
            id="ll-stops"
            type="circle"
            layout={vis(showService)}
            paint={{
              'circle-radius': 3.5,
              'circle-color': BG,
              'circle-stroke-color': finale ? ACCENT : MUTED,
              'circle-stroke-width': 1.5,
            }}
          />
        </Source>

        <Source id="ll-connector" type="geojson" data={connectorGeo}>
          <Layer
            id="ll-connector"
            type="line"
            layout={{ ...vis(showConnector), 'line-cap': 'round' }}
            paint={{ 'line-color': ACCENT, 'line-width': 3, 'line-dasharray': [1.5, 2] }}
          />
        </Source>

        <Source id="ll-train" type="geojson" data={train}>
          <Layer
            id="ll-train-glow"
            type="circle"
            paint={{ 'circle-radius': 18, 'circle-color': trainColor, 'circle-blur': 1, 'circle-opacity': 0.7 }}
          />
          <Layer
            id="ll-train-core"
            type="circle"
            paint={{
              'circle-radius': 7,
              'circle-color': '#ffffff',
              'circle-stroke-color': trainColor,
              'circle-stroke-width': 3,
            }}
          />
        </Source>

        {showEndpoints && (
          <>
            <StationLabel stop={board} tone="amber" side="left" animate={entering('lost-parsed')} />
            <StationLabel stop={alight} tone="amber" side="left" animate={entering('lost-parsed')} delayMs={250} />
          </>
        )}
        {showService && !arrived && (
          <StationLabel stop={terminus} tone="muted" side="below" animate={entering('map-service')} delayMs={600} />
        )}

        {journey.playing && journey.phase === 'pause' && <PulseRings stop={alight} tone="amber" once />}

        {showCallouts && journey.phase !== 'leg1' && (
          <Callout
            lon={alight.lon}
            lat={alight.lat}
            anchor="top-right"
            offset={[-2, 26]}
            tone="amber"
            title={content.callouts.gotOff}
            sub={`${alight.name} · ${alight.time}`}
            animate={journey.playing}
          />
        )}
        {showCallouts && (journey.phase === 'leg2' || arrived) && (
          <Callout
            lon={alight.lon}
            lat={alight.lat}
            anchor="top-right"
            offset={[-2, 112]}
            tone="accent"
            title={content.callouts.didnt}
            animate={journey.playing}
          />
        )}

        {showJourney && arrived && (
          <>
            <TerminusPin stop={terminus} breathe={index >= at('owner-post')} animate={journey.playing} />
            <StationLabel stop={terminus} tone="accent" side="below" />
          </>
        )}
        {showCallouts && arrived && (
          <Callout
            lon={terminus.lon}
            lat={terminus.lat}
            anchor="bottom"
            offset={[0, -54]}
            tone="accent"
            title={content.callouts.likely}
            sub={`arrived ${terminus.time}`}
            animate={journey.playing}
          />
        )}

        {showFound && (
          <FoundMarker
            stop={terminus}
            label={COPY.foundHere}
            badge={showHanded ? COPY.handedToStaff : undefined}
            animate={entering('finder-photo')}
            badgeAnimate={entering('finder-handin')}
          />
        )}

        {showRings && <PulseRings stop={terminus} tone="accent" />}

        {showConnector && (
          <Callout
            lon={connectorMid[0]}
            lat={connectorMid[1]}
            anchor="bottom-left"
            offset={[14, -8]}
            tone="accent"
            kicker="Onward journey"
            title={`${onwardStops} stops, ${onwardMinutes} min`}
            sub={`${alight.name} → ${terminus.name}`}
            animate={entering('owner-match')}
          />
        )}
      </Map>

      {showService && (
        <GlassCard className={`absolute left-4 top-4 px-5 py-4 ${entering('map-service') ? 'll-pop' : ''}`}>
          <div className="text-[20px] font-semibold tabular-nums">
            {board.time} {board.name} → {terminus.name} · {trip.service.route}
          </div>
          <div className="mt-1.5 flex items-center gap-2">
            <span className="rounded-full bg-accent/15 px-2.5 py-0.5 text-[13px] font-medium text-accent">
              {COPY.timetableTag}
            </span>
            <span className="font-mono text-[11px] text-muted">trip {trip.service.tripId}</span>
          </div>
        </GlassCard>
      )}

      {finale && (
        <div className="pointer-events-none absolute inset-x-4 bottom-10 flex flex-wrap items-center justify-center gap-2.5">
          {timeline.map((text, i) => (
            <div
              key={text}
              className={`flex items-center gap-2.5 ${forward ? 'll-pop' : ''}`}
              style={forward ? { animationDelay: `${500 + i * 300}ms` } : undefined}
            >
              {i > 0 && <span className="text-[20px] text-muted">→</span>}
              <GlassCard
                className={`px-4 py-2.5 text-[20px] font-medium tabular-nums ${i === 2 ? 'text-accent' : 'text-text'}`}
              >
                {text}
              </GlassCard>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
