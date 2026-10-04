import { motion } from 'framer-motion'
import { ArrowUp, Database, Sparkles, TrainFront } from 'lucide-react'
import { content, fill } from '../../data/content'
import { trip } from '../../data/trip'
import { Appear, Caret, Card, JourneyTimeline, Shimmer, Tag } from './atoms'
import { ownerCopy } from './ownerCopy'
import { board, route, serviceDay, terminus } from './ownerTrip'
import { clamp01, DONE, typedCount, useElapsed, type Mode } from './playback'

const message = content.ownerMessage

// Step 1: the report types itself, then sends.
const TYPE_START = 700
const CHAR_MS = 35
const SEND_AT = TYPE_START + message.length * CHAR_MS + 350
const STEP1_MS = SEND_AT + 600
// Step 2: "Understanding…", then the parsed card.
const THINK_MS = 1000
const STEP2_MS = THINK_MS + 600
// Step 3: matched service card.
const STEP3_MS = 800
// Step 4: the timeline fill runs alongside the ~7 s train animation on the map.
const FILL_START = 400
const FILL_MS = 7000
const STEP4_MS = FILL_START + FILL_MS + 400

interface Props {
  modes: { message: Mode; parsed: Mode; service: Mode; journey: Mode }
}

/** Steps 1–4: a chat thread, newest at the bottom; older items scroll off the top. */
export function ReportScreen({ modes }: Props) {
  const t1 = useElapsed(modes.message, STEP1_MS)
  const t2 = useElapsed(modes.parsed, STEP2_MS)
  const t3 = useElapsed(modes.service, STEP3_MS)
  const t4 = useElapsed(modes.journey, STEP4_MS)

  const typing = t1 >= TYPE_START && t1 < SEND_AT
  const sent = t1 >= SEND_AT
  const draft = sent ? '' : message.slice(0, typedCount(t1, message, TYPE_START, CHAR_MS))
  const pressing = t1 >= SEND_AT - 140 && t1 < SEND_AT + 80
  const journeyProgress = t4 === DONE ? 1 : clamp01((t4 - FILL_START) / FILL_MS)

  return (
    <div className="flex h-full flex-col">
      <div
        className="flex min-h-0 flex-1 flex-col justify-end gap-3 overflow-hidden px-4 pb-3 pt-6"
        style={{ maskImage: 'linear-gradient(to bottom, transparent 0, black 40px)' }}
      >
        <Appear play={modes.message === 'play'} className="max-w-[85%] self-start">
          <div className="rounded-2xl rounded-bl-md border border-border bg-surface px-4 py-2.5 text-base">
            {ownerCopy.assistantPrompt}
          </div>
        </Appear>

        {sent && (
          <Appear play={modes.message === 'play'} className="max-w-[88%] self-end">
            <div className="rounded-2xl rounded-br-md bg-accent px-4 py-2.5 text-base leading-snug text-bg">
              {message}
            </div>
          </Appear>
        )}

        {t2 >= 0 && t2 < THINK_MS && (
          <Appear play={modes.parsed === 'play'} className="self-start">
            <div className="flex items-center gap-2 rounded-2xl rounded-bl-md border border-border bg-surface px-4 py-2.5">
              <Sparkles size={16} className="text-accent" />
              <Shimmer>{ownerCopy.understanding}</Shimmer>
            </div>
          </Appear>
        )}

        {t2 >= THINK_MS && (
          <Appear play={modes.parsed === 'play'}>
            <Card>
              <div className="mb-3 flex items-center justify-between gap-2">
                <span className="text-base font-semibold">{ownerCopy.parsedTitle}</span>
                <Tag icon={<Sparkles size={15} />}>{content.parsedTag}</Tag>
              </div>
              <dl className="space-y-2">
                {content.parsedFields.map((f) => (
                  <div key={f.label} className="flex gap-3 text-base">
                    <dt className="w-14 shrink-0 text-muted">{f.label}</dt>
                    <dd className="font-medium">{f.value}</dd>
                  </div>
                ))}
              </dl>
            </Card>
          </Appear>
        )}

        {t3 >= 0 && (
          <Appear play={modes.service === 'play'}>
            <Card>
              <div className="mb-2 flex flex-wrap items-center justify-between gap-x-2 gap-y-1.5">
                <span className="text-base font-semibold">{ownerCopy.matchedTitle}</span>
                <Tag icon={<Database size={15} />} tone="muted">
                  {ownerCopy.timetableTag}
                </Tag>
              </div>
              <div className="flex items-start gap-3">
                <span className="mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-accent/12 text-accent">
                  <TrainFront size={20} />
                </span>
                <div className="min-w-0">
                  <div className="text-lg font-semibold leading-snug">
                    <span className="tabular-nums">{board.time}</span> {board.name} → {terminus.name}
                    <span className="whitespace-nowrap font-normal text-muted"> · {route}</span>
                  </div>
                  <div className="text-base text-muted">
                    {fill(ownerCopy.serviceMeta, { day: serviceDay, stops: trip.stops.length })}
                  </div>
                </div>
              </div>
            </Card>
          </Appear>
        )}

        {t4 >= 0 && (
          <Appear play={modes.journey === 'play'}>
            <Card>
              <div className="mb-3 text-base font-semibold">{ownerCopy.journeyTitle}</div>
              <JourneyTimeline progress={journeyProgress} />
            </Card>
          </Appear>
        )}
      </div>

      <div className="flex shrink-0 items-end gap-2 border-t border-border px-3 py-3">
        <div className="min-h-12 flex-1 rounded-3xl border border-border bg-surface px-4 py-2.5 text-base leading-6">
          {draft || typing ? (
            <>
              {draft}
              <Caret />
            </>
          ) : (
            <span className="text-muted">{ownerCopy.inputPlaceholder}</span>
          )}
        </div>
        <motion.span
          animate={{ scale: pressing ? 0.82 : 1, opacity: draft ? 1 : 0.4 }}
          transition={{ duration: 0.12 }}
          className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-accent text-bg"
        >
          <ArrowUp size={22} strokeWidth={2.5} />
        </motion.span>
      </div>
    </div>
  )
}
