import { AnimatePresence, motion } from 'framer-motion'
import { useRef } from 'react'
import { useStep } from '../../state/StepContext'
import { PhoneFrame } from '../ui/PhoneFrame'
import { AppHeader } from './atoms'
import { FinaleScreen } from './FinaleScreen'
import { HomeScreen } from './HomeScreen'
import { MatchScreen } from './MatchScreen'
import { EASE_OUT, modeFor, STEP_INDEX, usePlay } from './playback'
import { PushBanner } from './PushBanner'
import { ReportScreen } from './ReportScreen'

export function OwnerPhone() {
  const { step, resetCount } = useStep()
  const active = step.activePhone === 'owner' || step.activePhone === 'both'

  return (
    <PhoneFrame active={active} label="Owner phone">
      {/* Remounting on reset cancels every timer and animation and returns to step 1. */}
      <OwnerApp key={resetCount} />
    </PhoneFrame>
  )
}

type View = 'report' | 'home' | 'match' | 'finale'

function viewFor(index: number): View {
  if (index < STEP_INDEX['owner-post']) return 'report'
  if (index < STEP_INDEX['owner-match']) return 'home'
  if (index < STEP_INDEX.finale) return 'match'
  return 'finale'
}

const screenVariants = {
  // `custom` is true going forward: push in from the right like iOS navigation; going back is instant.
  enter: { x: '100%' },
  center: (forward: boolean) => ({ x: 0, transition: forward ? { duration: 0.45, ease: EASE_OUT } : { duration: 0 } }),
  exit: (forward: boolean) =>
    forward ? { x: '-28%', opacity: 0, transition: { duration: 0.45, ease: EASE_OUT } } : { opacity: 0, transition: { duration: 0 } },
}

function OwnerApp() {
  const { index, direction } = useStep()
  const play = usePlay(index, direction)
  const mode = (id: Parameters<typeof modeFor>[0]) => modeFor(id, index, play)

  // The screen shown on first mount appears in place; later screens slide in going forward.
  const firstView = useRef(viewFor(index))
  const view = viewFor(index)
  const slideIn = play && view !== firstView.current

  return (
    <div className="relative flex h-full flex-col">
      <AppHeader />
      <div className="relative min-h-0 flex-1 overflow-hidden">
        <AnimatePresence custom={play}>
          <motion.div
            key={view}
            custom={play}
            variants={screenVariants}
            initial={slideIn ? 'enter' : false}
            animate="center"
            exit="exit"
            className="absolute inset-0 bg-bg"
          >
            {view === 'report' && (
              <ReportScreen
                modes={{
                  message: mode('lost-message'),
                  parsed: mode('lost-parsed'),
                  service: mode('map-service'),
                  journey: mode('map-journey'),
                }}
              />
            )}
            {view === 'home' && <HomeScreen modes={{ post: mode('owner-post'), notified: mode('owner-notified') }} />}
            {view === 'match' && <MatchScreen modes={{ match: mode('owner-match'), verify: mode('owner-verify') }} />}
            {view === 'finale' && <FinaleScreen mode={mode('finale')} />}
          </motion.div>
        </AnimatePresence>
      </div>

      <AnimatePresence custom={play}>
        {index === STEP_INDEX['owner-notified'] && <PushBanner key="banner" play={play} />}
      </AnimatePresence>
    </div>
  )
}
