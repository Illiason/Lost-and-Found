import { BadgeCheck, Laptop } from 'lucide-react'
import type { PositionAnchor } from 'maplibre-gl'
import type { CSSProperties, ReactNode } from 'react'
import { Marker } from 'react-map-gl/maplibre'
import type { Stop } from '../../types'

type Tone = 'amber' | 'accent' | 'muted'

const DOT: Record<Tone, string> = {
  amber: 'bg-amber shadow-[0_0_12px_rgb(245_181_71/0.7)]',
  accent: 'bg-accent shadow-[0_0_12px_rgb(61_220_132/0.7)]',
  muted: 'bg-muted',
}

const GLASS = 'rounded-2xl border border-white/5 bg-surface/80 shadow-soft backdrop-blur-md'

const pop = (animate: boolean, delayMs = 0): { className: string; style?: CSSProperties } =>
  animate ? { className: 'll-pop', style: { animationDelay: `${delayMs}ms` } } : { className: '' }

/** A station dot with a name label on one side. */
export function StationLabel({
  stop,
  tone,
  side,
  animate = false,
  delayMs = 0,
}: {
  stop: Stop
  tone: Tone
  side: 'left' | 'right' | 'below'
  animate?: boolean
  delayMs?: number
}) {
  const anim = pop(animate, delayMs)
  const label = (
    <span className={`${GLASS} whitespace-nowrap px-2.5 py-1 text-[15px] font-medium text-text`}>{stop.name}</span>
  )
  const dot = <span className={`h-3.5 w-3.5 shrink-0 rounded-full border-2 border-bg ${DOT[tone]}`} />

  // The dot sits exactly on the coordinate; the label hangs off it on the chosen side.
  const anchor = side === 'left' ? 'right' : side === 'right' ? 'left' : 'top'
  const offset: [number, number] = side === 'left' ? [7, 0] : side === 'right' ? [-7, 0] : [0, -7]

  return (
    <Marker longitude={stop.lon} latitude={stop.lat} anchor={anchor} offset={offset} style={{ zIndex: 2 }}>
      <div
        className={`flex items-center gap-2 ${side === 'below' ? 'flex-col' : ''} ${anim.className}`}
        style={anim.style}
      >
        {side === 'left' ? (
          <>
            {label}
            {dot}
          </>
        ) : (
          <>
            {dot}
            {label}
          </>
        )}
      </div>
    </Marker>
  )
}

/** Glass callout card. 20px headline, optional smaller second line. */
export function Callout({
  lon,
  lat,
  anchor,
  offset,
  tone,
  kicker,
  title,
  sub,
  animate = false,
  zIndex = 3,
}: {
  lon: number
  lat: number
  anchor: PositionAnchor
  offset: [number, number]
  tone: 'amber' | 'accent'
  kicker?: string
  title: string
  sub?: string
  animate?: boolean
  zIndex?: number
}) {
  const anim = pop(animate)
  const bar = tone === 'amber' ? 'bg-amber' : 'bg-accent'
  const text = tone === 'amber' ? 'text-amber' : 'text-accent'
  return (
    <Marker longitude={lon} latitude={lat} anchor={anchor} offset={offset} style={{ zIndex }}>
      <div className={`${GLASS} flex items-stretch gap-3 px-4 py-3 ${anim.className}`} style={anim.style}>
        <span className={`w-1 shrink-0 rounded-full ${bar}`} />
        <div className="whitespace-nowrap">
          {kicker && <div className="text-[13px] font-medium uppercase tracking-wider text-muted">{kicker}</div>}
          <div className={`text-[20px] font-semibold leading-tight ${text}`}>{title}</div>
          {sub && <div className="mt-0.5 text-[15px] tabular-nums text-muted">{sub}</div>}
        </div>
      </div>
    </Marker>
  )
}

/** Green map pin for where the laptop most likely is. */
export function TerminusPin({
  stop,
  breathe,
  animate,
}: {
  stop: Stop
  breathe: boolean
  animate: boolean
}) {
  return (
    <Marker longitude={stop.lon} latitude={stop.lat} anchor="bottom" offset={[0, 4]} style={{ zIndex: 4 }}>
      <div className={animate ? 'll-pop' : ''}>
        <svg width="34" height="44" viewBox="0 0 34 44" className={breathe ? 'll-breathe' : ''} aria-hidden>
          <path
            d="M17 43C17 43 32 27.5 32 17A15 15 0 0 0 2 17C2 27.5 17 43 17 43Z"
            className="fill-accent stroke-bg"
            strokeWidth="2"
          />
          <circle cx="17" cy="17" r="6" className="fill-bg" />
        </svg>
      </div>
    </Marker>
  )
}

/** Expanding rings centred on a stop. `once` plays a short pulse; otherwise loops. */
export function PulseRings({ stop, tone, once = false }: { stop: Stop; tone: 'amber' | 'accent'; once?: boolean }) {
  const border = tone === 'amber' ? 'border-amber' : 'border-accent'
  const rings = once ? [0] : [0, 800, 1600]
  return (
    <Marker longitude={stop.lon} latitude={stop.lat} anchor="center" style={{ zIndex: 1 }}>
      <div className="relative h-8 w-8">
        {rings.map((d) => (
          <span
            key={d}
            className={`absolute inset-0 rounded-full border-2 ${border} ${once ? 'll-ring-once' : 'll-ring'}`}
            style={{ animationDelay: `${d}ms` }}
          />
        ))}
      </div>
    </Marker>
  )
}

/** "Found here" marker placed beside the terminus pin, with an optional hand-in badge. */
export function FoundMarker({
  stop,
  label,
  badge,
  animate,
  badgeAnimate,
}: {
  stop: Stop
  label: string
  badge?: string
  animate: boolean
  badgeAnimate: boolean
}) {
  return (
    <Marker longitude={stop.lon} latitude={stop.lat} anchor="right" offset={[-30, -26]} style={{ zIndex: 5 }}>
      <div className={`flex flex-col items-end gap-1.5 ${animate ? 'll-pop' : ''}`}>
        <div className={`${GLASS} flex items-center gap-2.5 py-2 pl-2 pr-4`}>
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-amber/15 text-amber">
            <Laptop size={20} />
          </span>
          <span className="whitespace-nowrap text-[20px] font-semibold text-text">{label}</span>
        </div>
        {badge && (
          <span
            className={`flex items-center gap-1.5 rounded-full border border-accent/30 bg-accent/15 px-3 py-1 text-[15px] font-medium text-accent backdrop-blur-md ${
              badgeAnimate ? 'll-pop' : ''
            }`}
          >
            <BadgeCheck size={16} />
            {badge}
          </span>
        )}
      </div>
    </Marker>
  )
}

export function GlassCard({ className = '', children }: { className?: string; children: ReactNode }) {
  return <div className={`${GLASS} ${className}`}>{children}</div>
}
