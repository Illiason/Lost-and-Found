import { motion } from 'framer-motion'
import { Check, MapPin } from 'lucide-react'
import type { ReactNode } from 'react'
import { content } from '../../data/content'
import { LogoMark } from '../ui/LogoMark'
import { ownerCopy } from './ownerCopy'
import { ALIGHT_AT_MS, ALIGHT_PAUSE_MS, alight, board, TERMINUS_AT_MS, terminus } from './ownerTrip'
import { clamp01, EASE_OUT } from './playback'

export function AppHeader() {
  return (
    <div className="flex h-14 shrink-0 items-center gap-2.5 border-b border-border px-4">
      <LogoMark size={30} />
      <span className="text-lg font-semibold tracking-tight">{content.appName}</span>
      <span className="ml-auto grid h-9 w-9 place-items-center rounded-full bg-accent/15 text-base font-semibold text-accent">
        A
      </span>
    </div>
  )
}

export function Card({ className = '', children }: { className?: string; children: ReactNode }) {
  return <div className={`rounded-2xl border border-border bg-surface p-4 shadow-soft ${className}`}>{children}</div>
}

export function Tag({
  icon,
  tone = 'accent',
  children,
}: {
  icon?: ReactNode
  tone?: 'accent' | 'amber' | 'muted'
  children: ReactNode
}) {
  const tones = {
    accent: 'bg-accent/12 text-accent',
    amber: 'bg-amber/12 text-amber',
    muted: 'bg-white/5 text-muted',
  }
  return (
    <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-0.5 text-base font-medium ${tones[tone]}`}>
      {icon}
      {children}
    </span>
  )
}

/** Fades and lifts in when `play`; otherwise renders in place instantly. Glides when siblings move. */
export function Appear({
  play,
  delay = 0,
  className = '',
  children,
}: {
  play: boolean
  delay?: number
  className?: string
  children: ReactNode
}) {
  return (
    <motion.div
      layout="position"
      initial={play ? { opacity: 0, y: 14 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={play ? { duration: 0.4, delay, ease: EASE_OUT } : { duration: 0 }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

/**
 * A button that "presses itself": while `pressed` it shrinks slightly and brightens, so the
 * audience sees the tap about 250 ms before the action happens.
 */
export function SelfPress({
  pressed,
  className = '',
  children,
}: {
  pressed: boolean
  className?: string
  children: ReactNode
}) {
  return (
    <motion.div
      animate={
        pressed
          ? { scale: 0.97, filter: 'brightness(1.25)', boxShadow: '0 0 0 4px rgb(61 220 132 / 0.28)' }
          : { scale: 1, filter: 'brightness(1)', boxShadow: '0 0 0 0px rgb(61 220 132 / 0)' }
      }
      transition={{ duration: 0.14, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

/** Green tick or amber question mark in a small circle. */
export function StatusDot({ ok }: { ok: boolean }) {
  return ok ? (
    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-accent/15 text-accent">
      <Check size={17} strokeWidth={3} />
    </span>
  ) : (
    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-amber/15 text-base font-bold text-amber">
      ?
    </span>
  )
}

/** A circled check whose strokes draw themselves when `play`. */
export function DrawnCheck({ play, size = 24 }: { play: boolean; size?: number }) {
  const draw = (delay: number, duration: number) =>
    play ? { duration, delay, ease: EASE_OUT } : { duration: 0 }
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <motion.circle
        cx="12"
        cy="12"
        r="10"
        initial={play ? { pathLength: 0 } : false}
        animate={{ pathLength: 1 }}
        transition={draw(0, 0.4)}
      />
      <motion.path
        d="M7.5 12.5l3 3 6-6.5"
        initial={play ? { pathLength: 0 } : false}
        animate={{ pathLength: 1 }}
        transition={draw(0.3, 0.3)}
      />
    </svg>
  )
}

/** Blinking text caret. */
export function Caret() {
  return (
    <motion.span
      aria-hidden
      className="ml-px inline-block h-5 w-[2px] translate-y-1 rounded bg-accent"
      animate={{ opacity: [1, 1, 0, 0] }}
      transition={{ duration: 0.9, repeat: Infinity, times: [0, 0.5, 0.5, 1] }}
    />
  )
}

/** Text with a light sweeping across it, for "thinking" states. */
export function Shimmer({ children }: { children: ReactNode }) {
  return (
    <motion.span
      className="bg-clip-text text-base font-medium text-transparent"
      style={{
        backgroundImage: 'linear-gradient(90deg, #8FA39A 0%, #8FA39A 35%, #E8F0EC 50%, #8FA39A 65%, #8FA39A 100%)',
        backgroundSize: '200% 100%',
      }}
      animate={{ backgroundPosition: ['100% 0%', '-100% 0%'] }}
      transition={{ duration: 1.3, repeat: Infinity, ease: 'linear' }}
    >
      {children}
    </motion.span>
  )
}

/**
 * Board → alight → terminus. `t` is ms since step 4 started (DONE when finished). Each row lights
 * up when the map's train reaches that stop (see the timing contract in ownerTrip.ts) and the
 * green line fills between them, holding at the alight stop during the train's pause.
 */
export function JourneyTimeline({ t }: { t: number }) {
  const seg1 = ALIGHT_AT_MS > 0 ? clamp01(t / ALIGHT_AT_MS) : 1
  const leaveAt = ALIGHT_AT_MS + ALIGHT_PAUSE_MS
  const seg2 = TERMINUS_AT_MS > leaveAt ? clamp01((t - leaveAt) / (TERMINUS_AT_MS - leaveAt)) : t >= TERMINUS_AT_MS ? 1 : 0

  const rows = [
    { stop: board, note: ownerCopy.boarded, tone: 'muted' as const, lit: t >= 0 },
    { stop: alight, note: content.callouts.gotOff, tone: 'amber' as const, lit: t >= ALIGHT_AT_MS },
    { stop: terminus, note: ownerCopy.likelyHere, tone: 'accent' as const, lit: t >= TERMINUS_AT_MS },
  ]
  const fills = [seg1, seg2]
  const dotColor = { muted: 'bg-text', amber: 'bg-amber', accent: 'bg-accent' }
  const noteColor = { muted: 'text-muted', amber: 'text-amber', accent: 'text-accent' }

  return (
    <div>
      {rows.map((r, i) => (
        <div key={r.stop.id} className="flex gap-3">
          <div className="flex w-5 flex-col items-center">
            <span className="relative mt-1 grid h-5 w-5 place-items-center">
              {i === 2 && r.lit && (
                <motion.span
                  className="absolute inset-0 rounded-full bg-accent/40"
                  animate={{ scale: [1, 2.2], opacity: [0.6, 0] }}
                  transition={{ duration: 1.6, repeat: Infinity, ease: 'easeOut' }}
                />
              )}
              <motion.span
                className={`relative h-3.5 w-3.5 rounded-full border-2 transition-colors duration-300 ${
                  r.lit ? `${dotColor[r.tone]} border-transparent` : 'border-border bg-bg'
                }`}
                animate={{ scale: r.lit ? 1 : 0.85 }}
                transition={{ type: 'spring', stiffness: 500, damping: 15 }}
              />
            </span>
            {i < 2 && (
              <span className="relative my-1 w-[3px] flex-1 overflow-hidden rounded-full bg-border">
                <span className="absolute inset-x-0 top-0 rounded-full bg-accent" style={{ height: `${fills[i] * 100}%` }} />
              </span>
            )}
          </div>
          <div className={i < 2 ? 'pb-4' : ''}>
            <div className={`flex items-baseline gap-2 text-base transition-colors duration-300 ${r.lit ? 'text-text' : 'text-muted'}`}>
              <span className="font-semibold tabular-nums">{r.stop.time}</span>
              <span className="font-medium">{r.stop.name}</span>
            </div>
            <div
              className={`flex items-center gap-1 text-base transition-opacity duration-300 ${noteColor[r.tone]} ${
                r.lit ? 'opacity-100' : 'opacity-0'
              }`}
            >
              {i === 2 && <MapPin size={16} />}
              {r.note}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
