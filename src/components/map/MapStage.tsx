import { useMemo } from 'react'
import type { Feature, FeatureCollection, LineString, Point } from 'geojson'
import * as maplibregl from 'maplibre-gl'
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url'
import Map, { Layer, Source } from 'react-map-gl/maplibre'
import { routeCoords, terminus, trip } from '../../data/trip'

// MapLibre finds its worker next to its own module file, which Vite's bundling moves.
// Point it at a Vite-bundled copy instead, and pass this same instance to <Map mapLib>
// because react-map-gl's own lazy import can resolve to a separate module instance in dev.
maplibregl.setWorkerUrl(workerUrl)

const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json'

export function MapStage() {
  const lineGeo = useMemo<Feature<LineString>>(
    () => ({ type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: routeCoords } }),
    [],
  )
  const stopsGeo = useMemo<FeatureCollection<Point>>(
    () => ({
      type: 'FeatureCollection',
      features: trip.stops.map((s) => ({
        type: 'Feature',
        properties: { name: s.name },
        geometry: { type: 'Point', coordinates: [s.lon, s.lat] },
      })),
    }),
    [],
  )

  return (
    <div className="relative h-full w-full overflow-hidden rounded-2xl border border-border shadow-soft">
      <Map
        initialViewState={{ longitude: -6.17, latitude: 53.33, zoom: 10.2 }}
        mapLib={maplibregl}
        mapStyle={MAP_STYLE}
        attributionControl={{ compact: false }}
        style={{ width: '100%', height: '100%' }}
      >
        <Source id="route" type="geojson" data={lineGeo}>
          <Layer id="route-line" type="line" paint={{ 'line-color': '#3DDC84', 'line-width': 3, 'line-opacity': 0.8 }} />
        </Source>
        <Source id="stops" type="geojson" data={stopsGeo}>
          <Layer
            id="stops-dot"
            type="circle"
            paint={{
              'circle-radius': 4,
              'circle-color': '#0B0F0E',
              'circle-stroke-color': '#3DDC84',
              'circle-stroke-width': 2,
            }}
          />
        </Source>
      </Map>

      <div className="glass pointer-events-none absolute left-4 top-4 rounded-2xl px-4 py-3 shadow-soft">
        <div className="text-xs text-muted">Service</div>
        <div className="text-sm font-medium">
          {trip.service.route} → {trip.service.headsign}
        </div>
        <div className="text-xs tabular-nums text-muted">
          {trip.stops[0].time}–{terminus.time} · {trip.stops.length} stops
        </div>
      </div>
    </div>
  )
}
