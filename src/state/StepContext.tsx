import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { STEPS } from '../steps'
import type { Step, StepId } from '../types'

interface StepApi {
  index: number
  step: Step
  stepId: StepId
  /** 1 after next(), -1 after prev(). Use for enter/exit animation direction. */
  direction: 1 | -1
  next: () => void
  prev: () => void
  reset: () => void
  /** Increments on every reset. Use as a React key to restart animations. */
  resetCount: number
}

interface EvidenceApi {
  open: boolean
  setOpen: (open: boolean) => void
  toggle: () => void
}

const StepCtx = createContext<StepApi | null>(null)
const EvidenceCtx = createContext<EvidenceApi | null>(null)

const LAST = STEPS.length - 1

export function StepProvider({ children }: { children: ReactNode }) {
  const [index, setIndex] = useState(0)
  const [direction, setDirection] = useState<1 | -1>(1)
  const [resetCount, setResetCount] = useState(0)
  const [evidenceOpen, setEvidenceOpen] = useState(false)

  const next = useCallback(() => {
    setDirection(1)
    setIndex((i) => Math.min(i + 1, LAST))
  }, [])
  const prev = useCallback(() => {
    setDirection(-1)
    setIndex((i) => Math.max(i - 1, 0))
  }, [])
  const reset = useCallback(() => {
    setDirection(-1)
    setIndex(0)
    setEvidenceOpen(false)
    setResetCount((c) => c + 1)
  }, [])
  const toggleEvidence = useCallback(() => setEvidenceOpen((o) => !o), [])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.metaKey || e.ctrlKey || e.altKey || e.repeat) return
      const t = e.target as HTMLElement | null
      if (t && (t.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(t.tagName))) return

      if (e.key === 'ArrowRight' || e.key === ' ') next()
      else if (e.key === 'ArrowLeft') prev()
      else if (e.key === 'r' || e.key === 'R') reset()
      else if (e.key === 'e' || e.key === 'E') toggleEvidence()
      else return
      e.preventDefault()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [next, prev, reset, toggleEvidence])

  const step = STEPS[index]
  const stepApi = useMemo<StepApi>(
    () => ({ index, step, stepId: step.id, direction, next, prev, reset, resetCount }),
    [index, step, direction, next, prev, reset, resetCount],
  )
  const evidenceApi = useMemo<EvidenceApi>(
    () => ({ open: evidenceOpen, setOpen: setEvidenceOpen, toggle: toggleEvidence }),
    [evidenceOpen, toggleEvidence],
  )

  return (
    <StepCtx.Provider value={stepApi}>
      <EvidenceCtx.Provider value={evidenceApi}>{children}</EvidenceCtx.Provider>
    </StepCtx.Provider>
  )
}

export function useStep(): StepApi {
  const ctx = useContext(StepCtx)
  if (!ctx) throw new Error('useStep must be used inside <StepProvider>')
  return ctx
}

export function useEvidence(): EvidenceApi {
  const ctx = useContext(EvidenceCtx)
  if (!ctx) throw new Error('useEvidence must be used inside <StepProvider>')
  return ctx
}
