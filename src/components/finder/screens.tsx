import { motion } from 'framer-motion'
import { BellRing, Camera, Check, Clock, Euro, Lock, MapPin, UserCheck } from 'lucide-react'
import type { ReactNode } from 'react'
import { content, fill } from '../../data/content'
import { terminus } from '../../data/trip'
import { finderCopy } from './copy'
import { FoundPhoto } from './FoundPhoto'
import { useFrozen, usePhase } from './hooks'

export interface ScreenProps {
  /** True when the step was entered going forward. Read once on mount. */
  animate: boolean
  photo: string | null
}

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

/** Fade-and-rise entry, or the finished state straight away when not animating. */
function rise(animate: boolean, delay = 0) {
  return {
    initial: animate ? { opacity: 0, y: 12 } : false,
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4, ease: EASE, delay },
  }
}

function Chip({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-border bg-surface px-3.5 py-2 text-base text-text">
      <MapPin size={16} className="shrink-0 text-amber" />
      <span className="truncate">{children}</span>
    </span>
  )
}

function AnimatedCheck({ animate, size = 24, delay = 0 }: { animate: boolean; size?: number; delay?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <motion.path
        d="M5 12.5l4.5 4.5L19 7.5"
        stroke="currentColor"
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={animate ? { pathLength: 0 } : false}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.35, ease: 'easeOut', delay }}
      />
    </svg>
  )
}

/** Thumbnail plus AI description: the item this finder reported. */
function ItemRow({ photo }: { photo: string | null }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-3">
      <FoundPhoto src={photo} blur className="!w-24 !rounded-xl" />
      <div className="min-w-0 text-base font-medium leading-snug">{content.finderAI}</div>
    </div>
  )
}

/* Steps 1–5: idle home */

export function IdleScreen(props: ScreenProps) {
  const animate = useFrozen(props.animate)
  return (
    <div className="flex h-full flex-col items-center justify-center gap-7 px-6 pb-8 text-center">
      <motion.div {...rise(animate)}>
        <h2 className="text-2xl font-semibold tracking-tight">{finderCopy.idleTitle}</h2>
        <p className="mt-2 text-base text-muted">{finderCopy.idleHint}</p>
      </motion.div>

      <motion.div {...rise(animate, 0.1)} className="relative grid h-36 w-36 place-items-center">
        <motion.span
          className="absolute inset-0 rounded-full border-2 border-amber/40"
          animate={{ scale: [0.85, 1.1], opacity: [0.7, 0] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeOut' }}
        />
        <span className="grid h-28 w-28 place-items-center rounded-full bg-amber text-bg shadow-soft">
          <Camera size={44} strokeWidth={2} />
        </span>
      </motion.div>

      <motion.div {...rise(animate, 0.2)} className="max-w-full">
        <Chip>{fill(finderCopy.idleLocation, { terminus: terminus.name })}</Chip>
      </motion.div>
    </div>
  )
}

/* Step 6: finder-photo */

// viewfinder → shutter pressed → flash + photo → controls
const PHOTO_PHASES = [700, 950, 1500] as const

export function PhotoScreen(props: ScreenProps) {
  const animate = useFrozen(props.animate)
  const phase = usePhase(PHOTO_PHASES, animate)
  const taken = phase >= 2

  return (
    <div className="flex h-full flex-col gap-4 p-4">
      {taken ? (
        <FoundPhoto src={props.photo} animate={animate}>
          {animate && (
            <motion.div
              className="absolute inset-0 bg-white"
              initial={{ opacity: 1 }}
              animate={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            />
          )}
        </FoundPhoto>
      ) : (
        <Viewfinder />
      )}

      <div className="flex items-center justify-between gap-3">
        <Chip>{fill(finderCopy.photoLocation, { terminus: terminus.name })}</Chip>
      </div>

      {phase >= 3 && (
        <motion.div {...rise(animate)} className="rounded-2xl border border-border bg-surface p-4">
          <div className="flex items-center gap-2 text-lg font-semibold">
            <span className="text-accent">
              <AnimatedCheck animate={animate} size={22} delay={0.15} />
            </span>
            {finderCopy.photoTaken}
          </div>
          <div className="mt-1 text-base text-muted">{finderCopy.photoTakenHint}</div>
        </motion.div>
      )}

      <div className="mt-auto flex h-20 items-center justify-center">
        {!taken && (
          <motion.span
            className="grid h-[72px] w-[72px] place-items-center rounded-full border-4 border-text/80"
            animate={{ scale: phase === 1 ? 0.86 : 1 }}
            transition={{ duration: 0.15 }}
          >
            <span className="h-14 w-14 rounded-full bg-text" />
          </motion.span>
        )}
        {phase >= 3 && (
          <motion.div
            {...rise(animate, 0.1)}
            className="flex h-14 w-full items-center justify-center rounded-2xl bg-amber text-lg font-semibold text-bg shadow-soft"
          >
            {finderCopy.reportButton}
          </motion.div>
        )}
      </div>
    </div>
  )
}

function Viewfinder() {
  const corner = 'absolute h-7 w-7 border-text/80'
  return (
    <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-[#1a2421] to-[#0d1312]">
      <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 opacity-20">
        {Array.from({ length: 9 }, (_, i) => (
          <span key={i} className="border-[0.5px] border-text/60" />
        ))}
      </div>
      <div className="absolute inset-5">
        <span className={`${corner} left-0 top-0 rounded-tl-lg border-l-2 border-t-2`} />
        <span className={`${corner} right-0 top-0 rounded-tr-lg border-r-2 border-t-2`} />
        <span className={`${corner} bottom-0 left-0 rounded-bl-lg border-b-2 border-l-2`} />
        <span className={`${corner} bottom-0 right-0 rounded-br-lg border-b-2 border-r-2`} />
      </div>
      <div className="absolute inset-0 grid place-items-center">
        <span className="rounded-full bg-bg/70 px-3.5 py-1.5 text-base text-text">{finderCopy.viewfinderHint}</span>
      </div>
    </div>
  )
}

/* Step 7: finder-scan */

const SCAN_SECONDS = 1.5
// scanning → AI card + blur boxes → privacy caption
const SCAN_PHASES = [SCAN_SECONDS * 1000, SCAN_SECONDS * 1000 + 1100] as const

export function ScanScreen(props: ScreenProps) {
  const animate = useFrozen(props.animate)
  const phase = usePhase(SCAN_PHASES, animate)
  const scanned = phase >= 1

  return (
    <div className="flex h-full flex-col gap-4 p-4">
      <FoundPhoto src={props.photo} blur={scanned} labels animate={animate} blurDelay={0.25}>
        {!scanned && (
          <motion.div
            className="absolute inset-x-0 h-20 border-b-2 border-accent bg-gradient-to-b from-transparent to-accent/35"
            style={{ boxShadow: '0 6px 22px 2px rgb(61 220 132 / 0.55), 0 1px 4px rgb(61 220 132 / 0.9)' }}
            initial={{ top: '-35%' }}
            animate={{ top: '100%' }}
            transition={{ duration: SCAN_SECONDS, ease: 'linear' }}
          />
        )}
      </FoundPhoto>

      {scanned ? (
        <motion.div {...rise(animate)} className="rounded-2xl border border-border bg-surface p-4 shadow-soft">
          <span className="inline-block rounded-md bg-accent/15 px-2 py-0.5 text-base font-semibold leading-snug text-accent">
            {finderCopy.aiTag}
          </span>
          <div className="mt-2 text-lg font-medium leading-snug">{content.finderAI}</div>
        </motion.div>
      ) : (
        <motion.div
          className="px-1 text-base text-muted"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.2, repeat: Infinity }}
        >
          {finderCopy.scanning}
        </motion.div>
      )}

      {phase >= 2 && (
        <motion.div {...rise(animate)} className="flex items-start gap-2.5 px-1 text-base leading-snug text-muted">
          <Lock size={18} className="mt-0.5 shrink-0 text-accent" />
          {content.privacyCaption}
        </motion.div>
      )}
    </div>
  )
}

/* Step 8: finder-handin */

// instructions → button pressed (held 250 ms) → checked → owner notified
const HANDIN_PHASES = [1400, 1650, 2350] as const

export function HandInScreen(props: ScreenProps) {
  const animate = useFrozen(props.animate)
  const phase = usePhase(HANDIN_PHASES, animate)
  const done = phase >= 2

  return (
    <div className="flex h-full flex-col gap-4 p-4">
      <ItemRow photo={props.photo} />

      <motion.div {...rise(animate)} className="rounded-2xl border border-border bg-surface p-4 shadow-soft">
        <span className="grid h-12 w-12 place-items-center rounded-full bg-amber/15 text-amber">
          <UserCheck size={24} />
        </span>
        <p className="mt-3 text-lg leading-snug">
          {fill(content.handInText, { terminus: terminus.name, reward: content.defaultReward })}
        </p>
      </motion.div>

      <div className="mt-auto flex flex-col gap-3">
        <div className="flex h-7 items-center justify-center">
          {phase >= 3 && (
            <motion.div {...rise(animate)} className="flex items-center gap-2 text-base text-accent">
              <BellRing size={18} />
              {finderCopy.ownerNotified}
            </motion.div>
          )}
        </div>
        <motion.div
          className={`flex h-14 items-center justify-center gap-2 rounded-2xl border text-lg font-semibold transition-colors duration-200 ${
            done
              ? 'border-accent bg-accent text-bg'
              : phase === 1
                ? 'border-accent/70 bg-accent/20 text-text'
                : 'border-border bg-surface text-text'
          }`}
          animate={{ scale: phase === 1 ? 0.94 : 1 }}
          transition={{ duration: 0.12 }}
        >
          {done && <AnimatedCheck animate={animate} />}
          {finderCopy.handedIn}
        </motion.div>
      </div>
    </div>
  )
}

/* Steps 9–11: waiting for the owner */

export function WaitingScreen(props: ScreenProps) {
  const animate = useFrozen(props.animate)
  return (
    <div className="flex h-full flex-col gap-4 p-4">
      <ItemRow photo={props.photo} />

      <motion.div {...rise(animate)} className="rounded-2xl border border-border bg-surface p-4 shadow-soft">
        <div className="flex items-center gap-2 text-lg font-semibold text-accent">
          <Check size={22} strokeWidth={3} />
          {finderCopy.waitingTitle}
        </div>
        <div className="mt-2 flex items-center gap-2 text-base text-muted">
          <Clock size={18} className="shrink-0" />
          {finderCopy.waitingText}
        </div>
        <div className="relative mt-4 h-1.5 overflow-hidden rounded-full bg-border">
          <motion.span
            className="absolute inset-y-0 w-1/3 rounded-full bg-gradient-to-r from-transparent via-accent/70 to-transparent"
            animate={{ left: ['-35%', '100%'] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>
      </motion.div>

      <div className="max-w-full">
        <Chip>{fill(finderCopy.photoLocation, { terminus: terminus.name })}</Chip>
      </div>
    </div>
  )
}

/* Step 12: finale */

// coin lands → check + text
const REWARD_PHASES = [650] as const

export function RewardScreen(props: ScreenProps) {
  const animate = useFrozen(props.animate)
  const phase = usePhase(REWARD_PHASES, animate)

  return (
    <div className="flex h-full flex-col justify-center p-4 pb-10">
      <motion.div
        {...rise(animate)}
        className="flex flex-col items-center rounded-2xl border border-border bg-surface px-4 py-8 text-center shadow-soft"
      >
        <div className="relative h-28 w-28">
          {animate && (
            <motion.span
              className="absolute inset-0 rounded-full border-2 border-amber"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1.7, opacity: [0, 0.7, 0] }}
              transition={{ duration: 0.9, delay: 0.55, ease: 'easeOut' }}
            />
          )}
          <motion.span
            className="absolute inset-0 grid place-items-center rounded-full border-4 border-amber/50 bg-amber text-bg shadow-soft"
            initial={animate ? { scale: 0, rotateY: -360 } : false}
            animate={{ scale: 1, rotateY: 0 }}
            transition={{ type: 'spring', stiffness: 170, damping: 15, delay: 0.1 }}
          >
            <Euro size={52} strokeWidth={2.5} />
          </motion.span>
          {phase >= 1 && (
            <motion.span
              className="absolute -bottom-1 -right-1 grid h-11 w-11 place-items-center rounded-full border-4 border-surface bg-accent text-bg"
              initial={animate ? { scale: 0 } : false}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 420, damping: 18 }}
            >
              <AnimatedCheck animate={animate} size={22} delay={0.15} />
            </motion.span>
          )}
        </div>

        {/* Reserve the text block's height so the coin does not jump when it appears. */}
        <div className="mt-6 min-h-[132px]">
          {phase >= 1 && (
            <motion.div {...rise(animate, 0.1)}>
              <div className="text-2xl font-semibold leading-tight tracking-tight">
                {fill(finderCopy.rewardReleased, { reward: content.defaultReward })}
              </div>
              <div className="mt-2 text-lg text-muted">{finderCopy.rewardThanks}</div>
              <div className="mt-3 text-base leading-snug text-muted/80">{content.rewardLabel}</div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  )
}
