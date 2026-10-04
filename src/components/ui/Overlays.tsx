import { AnimatePresence, motion } from 'framer-motion'
import { content } from '../../data/content'
import { usePresenter } from '../../state/StepContext'
import { Wordmark } from './LogoMark'
import { RouteSketch } from './RouteSketch'

const FADE = { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const }

/** Intro and outro screens. They sit over the whole stage and are driven by StepContext's overlay state. */
export function Overlays() {
  const { overlay } = usePresenter()
  return (
    <AnimatePresence>
      {overlay === 'intro' && (
        <motion.div
          key="intro"
          className="absolute inset-0 z-[60] bg-bg"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={FADE}
        >
          <Intro />
        </motion.div>
      )}
      {overlay === 'outro' && (
        <motion.div
          key="outro"
          className="absolute inset-0 z-[60] bg-bg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={FADE}
        >
          <Outro />
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function Intro() {
  const { intro } = content
  const [first, ...rest] = intro.tagline.split('. ')
  return (
    <div className="relative flex h-full items-center overflow-hidden px-[160px]">
      <div className="pointer-events-none absolute -right-[60px] top-1/2 h-[1000px] w-[700px] -translate-y-1/2 opacity-80">
        <div className="absolute inset-0 rounded-full bg-accent/5 blur-3xl" />
        <RouteSketch className="relative h-full w-full" />
      </div>

      <div className="relative max-w-[1150px]">
        <Wordmark height={92} />

        <h1 className="mt-16 text-[112px] font-semibold leading-[1.02] tracking-[-0.03em]">
          {first}.
          <br />
          <span className="text-accent">{rest.join('. ')}</span>
        </h1>

        <p className="mt-10 max-w-[900px] text-[34px] leading-snug text-muted">{intro.line}</p>

        <div className="mt-24 flex items-center gap-6 text-[22px] text-muted">
          <span className="rounded-full border border-border bg-surface px-5 py-2 font-medium text-text">
            {intro.event}
          </span>
          <span>{intro.team}</span>
        </div>
      </div>

      <div className="absolute bottom-12 left-[160px] text-[18px] text-muted/60">{intro.start}</div>
    </div>
  )
}

const TONE: Record<string, { title: string; dot: string }> = {
  accent: { title: 'text-accent', dot: 'bg-accent' },
  amber: { title: 'text-amber', dot: 'bg-amber' },
  text: { title: 'text-text', dot: 'bg-muted' },
}

function Outro() {
  const { outro } = content
  return (
    <div className="flex h-full flex-col px-[120px] pb-[90px] pt-[100px]">
      <Wordmark height={64} />

      <div className="mt-14 grid grid-cols-3 gap-8">
        {outro.columns.map((col, i) => {
          const tone = TONE[col.tone] ?? TONE.text
          return (
            <motion.section
              key={col.title}
              className="rounded-[28px] border border-border bg-surface p-9 shadow-soft"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...FADE, delay: 0.2 + i * 0.15 }}
            >
              <h2 className={`text-[34px] font-semibold tracking-tight ${tone.title}`}>{col.title}</h2>
              <ul className="mt-7 flex flex-col gap-6">
                {col.items.map((item) => (
                  <li key={item.head} className="flex gap-4">
                    <span className={`mt-[13px] h-2.5 w-2.5 shrink-0 rounded-full ${tone.dot}`} />
                    <div className="min-w-0">
                      <div className="text-[24px] font-medium leading-snug">{item.head}</div>
                      <div className="mt-1 break-words text-[19px] leading-snug text-muted">{item.body}</div>
                      {'note' in item && <div className="mt-1 text-[17px] text-muted/70">{item.note}</div>}
                    </div>
                  </li>
                ))}
              </ul>
            </motion.section>
          )
        })}
      </div>

      <motion.div
        className="mt-auto text-center text-[120px] font-semibold leading-none tracking-[-0.03em]"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...FADE, delay: 0.75 }}
      >
        {outro.thanks}
      </motion.div>
    </div>
  )
}
