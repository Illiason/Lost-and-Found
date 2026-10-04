import { motion } from 'framer-motion'
import { ArrowUp, Database, Sparkles, TrainFront } from 'lucide-react'
import { content, fill } from '../../data/content'
import { trip } from '../../data/trip'
import { Appear, Caret, Card, JourneyTimeline, SelfPress, Shimmer, Tag } from './atoms'
import { fieldColors, ownerCopy, sourceHighlights } from './ownerCopy'
import { board, route, serviceDay, TERMINUS_AT_MS, terminus } from './ownerTrip'
import { EASE_OUT, typedCount, useElapsed, type Mode } from './playback'

const message = content.ownerMessage

// Step 1: the report types itself, the send button presses itself, then it sends.
const TYPE_START = 700
const CHAR_MS = 35
const SEND_AT = TYPE_START + message.length * CHAR_MS + 450
const PRESS_LEAD = 250
const STEP1_MS = SEND_AT + 600

// Step 2: "Understanding…", then the parsed card, then each source phrase lights up with its field.
const THINK_MS = 1000
const HL_START = THINK_MS + 450
const HL_GAP = 150

// Step 3: matched service card.
const STEP3_MS = 800
// Step 4: rows light up in sync with the map's train (timing contract in ownerTrip.ts).
const STEP4_MS = TERMINUS_AT_MS + 600

/* ---------- step 2 highlights, worked out once from the copy ---------- */

const rgba = (hex: string, a: number) => {
  const n = parseInt(hex.slice(1), 16)
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`
}

interface Highlight {
  start: number
  end: number
  field: string
  color: string
  /** Light-up order (0-based). */
  order: number
}

const fieldLabels = new Set(content.parsedFields.map((f) => f.label))
const lowerMessage = message.toLowerCase()
const highlights: Highlight[] = []
for (const h of sourceHighlights) {
  const start = lowerMessage.indexOf(h.phrase.toLowerCase())
  const color = fieldColors[h.field]
  if (start < 0 || !color || !fieldLabels.has(h.field)) continue
  highlights.push({ start, end: start + h.phrase.length, field: h.field, color, order: highlights.length })
}

/** The message split into plain runs and highlighted phrases, in reading order. */
const segments: { text: string; hl?: Highlight }[] = []
{
  let pos = 0
  for (const h of [...highlights].sort((a, b) => a.start - b.start)) {
    if (h.start < pos) continue // overlapping phrase; keep the earlier one
    if (h.start > pos) segments.push({ text: message.slice(pos, h.start) })
    segments.push({ text: message.slice(h.start, h.end), hl: h })
    pos = h.end
  }
  if (pos < message.length) segments.push({ text: message.slice(pos) })
}

/** When each field's dot appears: with the first phrase that feeds it. */
const fieldOrder: Record<string, number> = {}
for (const h of highlights) fieldOrder[h.field] ??= h.order

const STEP2_MS = HL_START + highlights.length * HL_GAP + 600
const hlAt = (order: number) => HL_START + order * HL_GAP

/* ---------- screen ---------- */

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
  const pressing = t1 >= SEND_AT - PRESS_LEAD && t1 < SEND_AT

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
            <div className="rounded-2xl rounded-br-md border border-accent/30 bg-accent/15 px-4 py-2.5 text-base leading-relaxed">
              {segments.map((s, i) =>
                s.hl ? (
                  <SourcePhrase key={i} color={s.hl.color} mode={modes.parsed} shown={t2 >= hlAt(s.hl.order)}>
                    {s.text}
                  </SourcePhrase>
                ) : (
                  <span key={i}>{s.text}</span>
                ),
              )}
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
                {content.parsedFields.map((f) => {
                  const order = fieldOrder[f.label]
                  return (
                    <div key={f.label} className="flex items-center gap-3 text-base">
                      <dt className="flex w-[4.5rem] shrink-0 items-center gap-2 text-muted">
                        <span className="grid h-2.5 w-2.5 shrink-0 place-items-center">
                          {order !== undefined && (
                            <motion.span
                              className="h-2.5 w-2.5 rounded-full"
                              style={{ backgroundColor: fieldColors[f.label] }}
                              initial={modes.parsed === 'play' ? { scale: 0 } : false}
                              animate={{ scale: t2 >= hlAt(order) ? 1 : 0 }}
                              transition={
                                modes.parsed === 'play' ? { type: 'spring', stiffness: 520, damping: 18 } : { duration: 0 }
                              }
                            />
                          )}
                        </span>
                        {f.label}
                      </dt>
                      <dd className="font-medium">{f.value}</dd>
                    </div>
                  )
                })}
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
              <JourneyTimeline t={t4} />
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
        <SelfPress
          pressed={pressing}
          className={`grid h-12 w-12 shrink-0 place-items-center rounded-full bg-accent text-bg transition-opacity duration-200 ${
            draft ? 'opacity-100' : 'opacity-40'
          }`}
        >
          <ArrowUp size={22} strokeWidth={2.5} />
        </SelfPress>
      </div>
    </div>
  )
}

/** A phrase in the sent message that the AI used: tinted, with an underline drawing left to right. */
function SourcePhrase({
  color,
  mode,
  shown,
  children,
}: {
  color: string
  mode: Mode
  shown: boolean
  children: string
}) {
  const off = { backgroundSize: '0% 2px', backgroundColor: rgba(color, 0) }
  const on = { backgroundSize: '100% 2px', backgroundColor: rgba(color, 0.16) }
  return (
    <motion.span
      className="rounded-[4px]"
      style={{ backgroundImage: `linear-gradient(${color}, ${color})`, backgroundRepeat: 'no-repeat', backgroundPosition: '0 100%' }}
      initial={mode === 'done' ? false : off}
      animate={shown ? on : off}
      transition={mode === 'play' ? { duration: 0.35, ease: EASE_OUT } : { duration: 0 }}
    >
      {children}
    </motion.span>
  )
}
