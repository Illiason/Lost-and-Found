import { AnimatePresence, motion } from 'framer-motion'
import { Laptop, ShieldCheck } from 'lucide-react'
import { useState } from 'react'
import { content, fill } from '../../data/content'
import { Appear, Caret, Card, StatusDot } from './atoms'
import { ownerCopy } from './ownerCopy'
import { terminus } from './ownerTrip'
import { DONE, EASE_OUT, typedCount, useElapsed, type Mode } from './playback'

const reasons = content.matchReasons
const answer = content.verifyAnswer

// Step 10: reasons appear one by one.
const REASON_START = 450
const REASON_GAP = 400
const STEP10_MS = REASON_START + reasons.length * REASON_GAP + 300
// Step 11: the answer types itself, Confirm presses itself, then Verified.
const TYPE_START = 600
const CHAR_MS = 35
const PRESS_AT = TYPE_START + answer.length * CHAR_MS + 400
const VERIFIED_AT = PRESS_AT + 220
const STEP11_MS = VERIFIED_AT + 600

interface Props {
  modes: { match: Mode; verify: Mode }
}

/** Steps 10–11: why it's a match, then prove it's yours. */
export function MatchScreen({ modes }: Props) {
  const tm = useElapsed(modes.match, STEP10_MS)
  const tv = useElapsed(modes.verify, STEP11_MS)

  const shown = tm === DONE ? reasons.length : Math.max(0, Math.floor((tm - REASON_START) / REASON_GAP) + 1)
  const typed = typedCount(tv, answer, TYPE_START, CHAR_MS)
  const typing = tv >= TYPE_START && tv < PRESS_AT
  const pressing = tv >= PRESS_AT && tv < VERIFIED_AT
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
          {reasons.slice(0, shown).map((r) => {
            const ok = r.type === 'ok' || verified
            return (
              <Appear key={r.text} play={modes.match === 'play'} className="flex items-start gap-3">
                <motion.span
                  key={ok ? 'ok' : 'pending'}
                  initial={verified && r.type === 'pending' && modes.verify === 'play' ? { scale: 0.4 } : false}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 18 }}
                >
                  <StatusDot ok={ok} />
                </motion.span>
                <span className={`pt-0.5 text-base leading-snug ${ok ? '' : 'text-amber'}`}>
                  {r.text}
                </span>
              </Appear>
            )
          })}
        </div>
      </Card>

      {tv >= 0 && (
        <Appear play={modes.verify === 'play'}>
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
                    initial={modes.verify === 'play' ? { opacity: 0, scale: 0.9 } : false}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, ease: EASE_OUT }}
                    className="absolute inset-0 flex items-center justify-center gap-2 rounded-xl bg-accent/15 text-lg font-semibold text-accent"
                  >
                    <ShieldCheck size={22} />
                    {ownerCopy.verified}
                  </motion.div>
                ) : (
                  <motion.div
                    key="confirm"
                    exit={{ opacity: 0, transition: { duration: 0.15 } }}
                    animate={{ scale: pressing ? 0.95 : 1, opacity: typed === answer.length ? 1 : 0.5 }}
                    transition={{ duration: 0.12 }}
                    className="absolute inset-0 flex items-center justify-center rounded-xl bg-accent text-lg font-semibold text-bg"
                  >
                    {ownerCopy.confirm}
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

/** The finder's photo with the same privacy blur boxes; a dark placeholder until the photo exists. */
function Thumbnail() {
  const [failed, setFailed] = useState(false)
  return (
    <div className="relative h-16 w-20 shrink-0 overflow-hidden rounded-xl border border-border bg-[#1a2320]">
      {failed ? (
        <div className="grid h-full w-full place-items-center text-muted">
          <Laptop size={26} />
        </div>
      ) : (
        <>
          <img
            src={content.finderPhoto}
            alt=""
            onError={() => setFailed(true)}
            className="h-full w-full object-cover"
          />
          {content.blurBoxes.map((b) => (
            <span
              key={b.label}
              className="absolute rounded-sm backdrop-blur-md"
              style={{ left: `${b.x}%`, top: `${b.y}%`, width: `${b.w}%`, height: `${b.h}%` }}
            />
          ))}
        </>
      )}
    </div>
  )
}
