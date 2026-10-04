import { AnimatePresence, motion } from 'framer-motion'
import { ExternalLink, FileText, X } from 'lucide-react'
import { content } from '../../data/content'
import { alightStop, boardStop, terminus, trip } from '../../data/trip'
import { useEvidence } from '../../state/StepContext'

export function EvidenceButton() {
  const { open, toggle } = useEvidence()
  return (
    <button
      type="button"
      onClick={toggle}
      aria-expanded={open}
      className="flex items-center gap-2 rounded-xl border border-border bg-surface px-3.5 py-2 text-sm font-medium text-text shadow-soft transition-colors hover:border-accent/50"
    >
      <FileText size={16} className="text-accent" />
      Evidence
    </button>
  )
}

export function EvidenceDrawer() {
  const { open, setOpen } = useEvidence()

  const service: [string, string][] = [
    ['Service', `${trip.service.route} → ${trip.service.headsign}`],
    ['Date', trip.service.date],
    ['Trip ID', trip.service.tripId],
    ['Boarded', boardStop ? `${boardStop.name} · ${boardStop.time}` : trip.ownerBoard],
    ['Alighted', alightStop ? `${alightStop.name} · ${alightStop.time}` : trip.ownerAlight],
    ['Terminus', `${terminus.name} · ${terminus.time}`],
    ['Stops', String(trip.stops.length)],
  ]

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="scrim"
            className="fixed inset-0 z-40 bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          />
          <motion.aside
            key="drawer"
            className="fixed bottom-0 left-0 top-0 z-50 flex w-[420px] flex-col gap-6 overflow-y-auto border-r border-border bg-surface p-6 shadow-soft"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 34 }}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Evidence</h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg p-1.5 text-muted hover:bg-border hover:text-text"
                aria-label="Close evidence"
              >
                <X size={18} />
              </button>
            </div>

            <section className="rounded-2xl border border-border bg-bg p-4">
              <h3 className="mb-3 text-xs font-medium uppercase tracking-wider text-muted">Matched service</h3>
              <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-sm">
                {service.map(([k, v]) => (
                  <div key={k} className="contents">
                    <dt className="text-muted">{k}</dt>
                    <dd className="truncate tabular-nums">{v}</dd>
                  </div>
                ))}
              </dl>
            </section>

            <section className="rounded-2xl border border-border bg-bg p-4">
              <h3 className="mb-2 text-xs font-medium uppercase tracking-wider text-muted">Lost property rule</h3>
              <p className="text-sm">{content.lostPropertyRule.text}</p>
            </section>

            <section>
              <h3 className="mb-3 text-xs font-medium uppercase tracking-wider text-muted">Sources</h3>
              <ul className="flex flex-col gap-2">
                {content.evidence.sources.map((s) => (
                  <li key={s.url}>
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-start gap-2 rounded-xl border border-border p-3 text-sm transition-colors hover:border-accent/50"
                    >
                      <ExternalLink size={14} className="mt-0.5 shrink-0 text-accent" />
                      <span className="min-w-0">
                        <span className="block">{s.name}</span>
                        <span className="block truncate text-xs text-muted">{s.url}</span>
                        {'note' in s && s.note && <span className="block text-xs text-muted">{s.note}</span>}
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </section>

            <p className="mt-auto rounded-xl border border-amber/30 bg-amber/10 p-3 text-xs text-amber">
              {content.evidence.disclaimer}
            </p>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
