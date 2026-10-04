import { Search } from 'lucide-react'
import { useStep } from '../../state/StepContext'
import { PhoneFrame } from '../ui/PhoneFrame'

export function FinderPhone() {
  const { step, stepId } = useStep()
  const active = step.activePhone === 'finder' || step.activePhone === 'both'

  return (
    <PhoneFrame active={active} label="Finder phone">
      <div className="flex h-full flex-col">
        <div className="flex items-center gap-2.5 border-b border-border px-5 py-3">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-amber/15 text-amber">
            <Search size={16} />
          </span>
          <div>
            <div className="text-sm font-semibold">Lostline</div>
            <div className="text-xs text-muted">Finder</div>
          </div>
        </div>
        <div className="p-5">
          <div className="rounded-2xl border border-border bg-surface p-4 shadow-soft">
            <div className="text-xs text-muted">Current step</div>
            <div className="mt-1 font-mono text-sm text-amber">{stepId}</div>
          </div>
        </div>
      </div>
    </PhoneFrame>
  )
}
