import { alightStop, routeCoords, trip } from '../../data/trip'

const W = 600
const H = 900
const PAD = 40

/** The real route drawn as a decorative SVG line: amber to where the owner got off, green after. */
export function RouteSketch({ className = '' }: { className?: string }) {
  const lons = routeCoords.map((c) => c[0])
  const lats = routeCoords.map((c) => c[1])
  const [minLon, maxLon, minLat, maxLat] = [Math.min(...lons), Math.max(...lons), Math.min(...lats), Math.max(...lats)]
  // Shrink longitude by cos(latitude) so the shape is not stretched sideways.
  const kx = Math.cos((((minLat + maxLat) / 2) * Math.PI) / 180)
  const scale = Math.min((W - 2 * PAD) / ((maxLon - minLon) * kx || 1), (H - 2 * PAD) / (maxLat - minLat || 1))
  const pt = ([lon, lat]: [number, number]) =>
    `${(PAD + (lon - minLon) * kx * scale).toFixed(1)},${(PAD + (maxLat - lat) * scale).toFixed(1)}`

  const alight = alightStop ?? trip.stops[0]
  let split = 0
  let best = Infinity
  routeCoords.forEach(([lon, lat], i) => {
    const d = (lon - alight.lon) ** 2 + (lat - alight.lat) ** 2
    if (d < best) [best, split] = [d, i]
  })

  const owner = routeCoords.slice(0, split + 1).map(pt).join(' ')
  const item = routeCoords.slice(split).map(pt).join(' ')
  const [first, last] = [routeCoords[0], routeCoords[routeCoords.length - 1]]

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={className} aria-hidden>
      <defs>
        <filter id="sketch-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="6" />
        </filter>
      </defs>
      <g fill="none" strokeLinecap="round" strokeLinejoin="round">
        <polyline points={owner} className="stroke-amber" strokeWidth="14" opacity="0.35" filter="url(#sketch-glow)" />
        <polyline points={item} className="stroke-accent" strokeWidth="14" opacity="0.35" filter="url(#sketch-glow)" />
        <polyline points={owner} className="stroke-amber" strokeWidth="5" />
        <polyline points={item} className="stroke-accent" strokeWidth="5" />
      </g>
      {[first, routeCoords[split], last].map((c, i) => {
        const [x, y] = pt(c).split(',').map(Number)
        return <circle key={i} cx={x} cy={y} r="9" className={i === 2 ? 'fill-accent' : 'fill-amber'} />
      })}
    </svg>
  )
}
