import { AnimatePresence, motion } from 'framer-motion'
import { Check, CircleCheck, Clock, ExternalLink, Gift, Laptop, TrainFront } from 'lucide-react'
import { content, fill } from '../../data/content'
import { Appear, Card, JourneyTimeline } from './atoms'
import { ownerCopy } from './ownerCopy'
import { board, route, terminus } from './ownerTrip'
import { EASE_OUT, useElapsed, type Mode } from './playback'

// Step 5: the Post button presses itself, a toast confirms, then the listing appears.
const PRESS_AT = 2200
const POSTED_AT = PRESS_AT + 180
const TOAST_AT = PRESS_AT + 250
const SWITCH_AT = PRESS_AT + 1000
const TOAST_END = SWITCH_AT + 1900
const STEP5_MS = TOAST_END + 400
// Step 9: the listing status flips as the push banner lands.
const MATCH_FLIP_AT = 450

const ruleHost = new URL(content.lostPropertyRule.sourceUrl).hostname.replace(/^www\./, '')
const itemName = content.parsedFields[0]?.value ?? ''

interface Props {
  modes: { post: Mode; notified: Mode }
}

/** Steps 5–9: post the report, then the "My reports" listing that keeps watching. */
export function HomeScreen({ modes }: Props) {
  const t = useElapsed(modes.post, STEP5_MS)
  const tn = useElapsed(modes.notified, MATCH_FLIP_AT + 200)
  const play = modes.post === 'play'

  const showForm = t < SWITCH_AT
  const pressing = t >= PRESS_AT && t < POSTED_AT
  const posted = t >= POSTED_AT
  const toast = t >= TOAST_AT && t < TOAST_END
  const matched = tn >= MATCH_FLIP_AT

  return (
    <div className="relative h-full">
      <AnimatePresence initial={false}>
        {showForm ? (
          <motion.div
            key="form"
            exit={{ opacity: 0, y: -24, transition: { duration: 0.35, ease: EASE_OUT } }}
            className="absolute inset-0 flex flex-col gap-3 px-4 pt-4"
          >
            <h2 className="text-xl font-semibold tracking-tight">{ownerCopy.postTitle}</h2>

            <Card className="flex items-center gap-3 p-3!">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white/5 text-text">
                <Laptop size={22} />
              </span>
              <div className="min-w-0 text-base">
                <div className="font-semibold">{itemName}</div>
                <div className="text-muted">
                  {route} · {board.name} → {terminus.name}
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex gap-3">
                <Clock size={20} className="mt-0.5 shrink-0 text-amber" />
                <div className="text-base">
                  <div className="font-medium leading-snug">{content.lostPropertyRule.text}</div>
                  <a
                    href={content.lostPropertyRule.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-1 inline-flex items-center gap-1 text-muted underline-offset-2 hover:underline"
                  >
                    {fill(ownerCopy.ruleSource, { host: ruleHost })}
                    <ExternalLink size={14} />
                  </a>
                </div>
              </div>
            </Card>

            <Card>
              <div className="mb-3 flex items-center gap-2 text-base font-semibold">
                <Gift size={18} className="text-accent" />
                {ownerCopy.rewardTitle}
              </div>
              <div className="flex gap-2">
                {content.rewards.map((r) => (
                  <span
                    key={r}
                    className={`flex-1 rounded-xl border py-2 text-center text-base font-semibold tabular-nums ${
                      r === content.defaultReward
                        ? 'border-accent bg-accent/15 text-accent'
                        : 'border-border text-muted'
                    }`}
                  >
                    €{r}
                  </span>
                ))}
              </div>
              <div className="mt-2.5 text-base leading-snug text-muted">{content.rewardLabel}</div>
            </Card>

            <motion.div
              animate={{ scale: pressing ? 0.95 : 1 }}
              transition={{ duration: 0.12 }}
              className={`flex h-13 items-center justify-center gap-2 rounded-2xl text-lg font-semibold transition-colors ${
                posted ? 'bg-accent/20 text-accent' : 'bg-accent text-bg'
              }`}
            >
              {posted && <Check size={20} strokeWidth={3} />}
              {posted ? ownerCopy.postedButton : ownerCopy.postButton}
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key="listing"
            initial={play ? { opacity: 0, y: 24 } : false}
            animate={{ opacity: 1, y: 0 }}
            transition={play ? { duration: 0.45, ease: EASE_OUT } : { duration: 0 }}
            className="absolute inset-0 flex flex-col gap-3 px-4 pt-4"
          >
            <h2 className="text-xl font-semibold tracking-tight">{ownerCopy.myReports}</h2>
            <Listing matched={matched} />
            <Appear play={play} delay={0.15}>
              <Card>
                <div className="mb-3 text-base font-semibold">{ownerCopy.routeTitle}</div>
                <JourneyTimeline progress={1} />
              </Card>
            </Appear>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toast && (
          <motion.div
            key="toast"
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, transition: { duration: 0.25 } }}
            transition={{ duration: 0.35, ease: EASE_OUT }}
            className="glass absolute inset-x-4 bottom-5 z-10 flex items-center gap-2.5 rounded-2xl px-4 py-3 text-base shadow-soft"
          >
            <CircleCheck size={20} className="shrink-0 text-accent" />
            {content.postedToast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function Listing({ matched }: { matched: boolean }) {
  return (
    <Card>
      <div className="flex items-start gap-3">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white/5">
          <Laptop size={22} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-base font-semibold">{itemName}</div>
          <div className="mt-0.5 flex items-start gap-1.5 text-base text-muted">
            <TrainFront size={16} className="mt-1 shrink-0" />
            <span className="leading-snug">
              {route} {board.name} → {terminus.name}
            </span>
          </div>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3">
        <span
          className={`inline-flex items-center gap-2 whitespace-nowrap rounded-full px-3 py-1 text-base font-medium transition-colors duration-300 ${
            matched ? 'bg-amber/12 text-amber' : 'bg-accent/12 text-accent'
          }`}
        >
          <span className="relative grid h-2.5 w-2.5 place-items-center">
            {!matched && (
              <motion.span
                className="absolute inset-0 rounded-full bg-accent"
                animate={{ scale: [1, 3.2], opacity: [0.55, 0] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut' }}
              />
            )}
            <span className={`relative h-2.5 w-2.5 rounded-full ${matched ? 'bg-amber' : 'bg-accent'}`} />
          </span>
          {matched ? ownerCopy.possibleMatch : ownerCopy.searching}
        </span>
        <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-base text-muted">
          <Gift size={16} />
          {fill(ownerCopy.thankYou, { reward: content.defaultReward })}
        </span>
      </div>
    </Card>
  )
}
