import { AnimatePresence, motion } from 'framer-motion'
import { content } from '../../data/content'
import { useStep } from '../../state/StepContext'
import { ACT_LABELS, STEPS } from '../../steps'
import { LogoMark } from './LogoMark'

export function TopBar() {
  const { index, step, direction } = useStep()

  return (
    <header className="flex h-16 shrink-0 items-center gap-6 border-b border-border px-6">
      <div className="flex w-56 items-center gap-2.5">
        <LogoMark />
        <span className="text-lg font-semibold tracking-tight">{content.appName}</span>
      </div>

      <div className="flex min-w-0 flex-1 items-center justify-center gap-4">
        <span className="shrink-0 rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-muted">
          {ACT_LABELS[step.act]}
        </span>
        <div className="relative h-7 min-w-0 flex-1 overflow-hidden">
          <AnimatePresence mode="popLayout" initial={false} custom={direction}>
            <motion.h1
              key={step.id}
              custom={direction}
              initial={{ y: direction * 16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: direction * -16, opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="absolute inset-0 truncate text-lg font-medium"
            >
              {step.title}
            </motion.h1>
          </AnimatePresence>
        </div>
      </div>

      <div className="flex w-56 items-center justify-end gap-3">
        <div className="flex items-center gap-1.5" aria-label={`Step ${index + 1} of ${STEPS.length}`}>
          {STEPS.map((s, i) => (
            <span
              key={s.id}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === index ? 'w-5 bg-accent' : i < index ? 'w-2 bg-accent/50' : 'w-2 bg-border'
              }`}
            />
          ))}
        </div>
        <span className="w-10 text-right text-xs tabular-nums text-muted">
          {index + 1}/{STEPS.length}
        </span>
      </div>
    </header>
  )
}
