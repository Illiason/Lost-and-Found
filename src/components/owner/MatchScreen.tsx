import { AnimatePresence, motion } from 'framer-motion'
import { Laptop } from 'lucide-react'
import { useState } from 'react'
import { content, fill, type MatchReason } from '../../data/content'
import { Appear, Caret, Card, DrawnCheck, SelfPress, StatusDot } from './atoms'
import { ownerCopy } from './ownerCopy'
import { terminus } from './ownerTrip'
import { DONE, typedCount, useElapsed, type Mode } from './playback'

const reasons = content.matchReasons
const answer = content.verifyAnswer

// Step 10: reasons appear one by one and settle.
const REASON_START = 450
const REASON_GAP = 400
const STEP10_MS = REASON_START + reasons.length * REASON_GAP + 400
// Step 11: the answer types itself, Confirm presses itself, then Verified.
const TYPE_START = 600
const CHAR_MS = 35
const VERIFIED_AT = TYPE_START + answer.length * CHAR_MS + 650
const PRESS_LEAD = 250
const STEP11_MS = VERIFIED_AT + 900

/** Same image as the finder phone: the real photo once it exists, else the bundled placeholder. */
const PHOTO_SOURCES = [content.finderPhoto, '/found-laptop.svg']

interface Props {
  modes: { match: Mode; verify: Mode }
}

/** Steps 10–11: why it's a match, then prove it's yours. */
export function MatchScreen({ modes }: Props) {
  const tm = useElapsed(modes.match, STEP10_MS)
  const tv = useElapsed(modes.verify, STEP11_MS)
  const verifyPlay = modes.verify === 'play'

  const shown = tm === DONE ? reasons.length : Math.max(0, Math.floor((tm - REASON_START) / REASON_GAP) + 1)
  const typed = typedCount(tv, answer, TYPE_START, CHAR_MS)
  const typing = tv >= TYPE_START && tv < VERIFIED_AT
  const pressing = tv >= VERIFIED_AT - PRESS_LEAD && tv < VERIFIED_AT
  const verified = tv >= VERIFIED_AT

  return (
    <div className="flex h-full flex-col gap-3 px-4 pt-4">
      <h2 className="text-xl font-semibold tracking-tight">{ownerCopy.matchTitle}</h2>

      <Card className="flex items-center gap-3 p-3!">
        <Thumbnail />
        <div className="min-w-0 text-base">
          <div className="font-semibold leading-snug">{fill(ownerCopy.foundAt, { terminus: terminus.name })}</div>
          <div className="text-muted">{ownerCopy.heldBy}</div>
        </div>
      </Card>

      <Card>
        <div className="mb-3 text-base font-semibold">{ownerCopy.reasonsTitle}</div>
        <div className="space-y-2.5">
          {reasons.slice(0, shown).map((r) => (
            <ReasonRow
              key={r.text}
              reason={r}
              play={modes.match === 'play'}
              confirmed={verified}
              confirmPlay={verifyPlay}
            />
          ))}
        </div>
      </Card>

      {tv >= 0 && (
        <Appear play={verifyPlay}>
          <Card>
            <div className="text-lg font-semibold">{content.verifyQuestion}</div>
            <div className="text-base text-muted">{ownerCopy.verifyHint}</div>
            <div className="mt-3 flex h-12 items-center rounded-xl border border-border bg-bg px-3.5 text-base">
              {typed > 0 || typing ? (
                <>
                  {answer.slice(0, typed)}
                  {!verified && <Caret />}
                </>
              ) : (
                <span className="text-muted">{ownerCopy.verifyPlaceholder}</span>
              )}
            </div>
            <div className="relative mt-3 h-12">
              <AnimatePresence initial={false}>
                {verified ? (
                  <motion.div
                    key="verified"
                    initial={verifyPlay ? { opacity: 0, scale: 0.92 } : false}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={verifyPlay ? { type: 'spring', stiffness: 420, damping: 24 } : { duration: 0 }}
                    className="absolute inset-0 flex items-center justify-center gap-2 rounded-xl bg-accent/15 text-lg font-semibold text-accent"
                  >
                    <DrawnCheck play={verifyPlay} size={24} />
                    {ownerCopy.verified}
                  </motion.div>
                ) : (
                  <motion.div key="confirm" exit={{ opacity: 0, transition: { duration: 0.12 } }} className="absolute inset-0">
                    <SelfPress
                      pressed={pressing}
                      className={`flex h-full items-center justify-center rounded-xl bg-accent text-lg font-semibold text-bg transition-opacity duration-200 ${
                        typed === answer.length ? 'opacity-100' : 'opacity-50'
                      }`}
                    >
                      {ownerCopy.confirm}
                    </SelfPress>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </Card>
        </Appear>
      )}
    </div>
  )
}

/** One reason: slides in and settles with a spring; its mark pops in just after the text. */
function ReasonRow({
  reason,
  play,
  confirmed,
  confirmPlay,
}: {
  reason: MatchReason
  play: boolean
  confirmed: boolean
  confirmPlay: boolean
}) {
  const ok = reason.type === 'ok' || confirmed
  const flipping = reason.type === 'pending' && confirmed && confirmPlay
  return (
    <motion.div
      layout="position"
      initial={play ? { opacity: 0, x: -10, y: 6 } : false}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={play ? { type: 'spring', stiffness: 380, damping: 26 } : { duration: 0 }}
      className="flex items-start gap-3"
    >
      <motion.span
        key={ok ? 'ok' : 'pending'}
        initial={play || flipping ? { scale: 0.3, opacity: 0 } : false}
        animate={{ scale: 1, opacity: 1 }}
        transition={
          play || flipping ? { type: 'spring', stiffness: 520, damping: 16, delay: play ? 0.08 : 0 } : { duration: 0 }
        }
      >
        <StatusDot ok={ok} />
      </motion.span>
      <span className={`pt-0.5 text-base leading-snug transition-colors duration-300 ${ok ? '' : 'text-amber'}`}>
        {reason.text}
      </span>
    </motion.div>
  )
}

/** The finder's photo (4:3, so the blur-box percentages hold) with the same privacy blur boxes. */
function Thumbnail() {
  const [attempt, setAttempt] = useState(0)
  const src = PHOTO_SOURCES[attempt]
  return (
    <div className="relative aspect-[4/3] w-20 shrink-0 overflow-hidden rounded-xl border border-border bg-[#1a2320]">
      {src ? (
        <>
          <img
            src={src}
            alt=""
            onError={() => setAttempt((a) => a + 1)}
            className="absolute inset-0 h-full w-full object-cover"
          />
          {content.blurBoxes.map((b) => (
            <span
              key={b.label}
              className="absolute rounded-sm backdrop-blur-[3px]"
              style={{ left: `${b.x}%`, top: `${b.y}%`, width: `${b.w}%`, height: `${b.h}%` }}
            />
          ))}
        </>
      ) : (
        <div className="grid h-full w-full place-items-center text-muted">
          <Laptop size={26} />
        </div>
      )}
    </div>
  )
}
