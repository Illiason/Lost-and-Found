import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useState, type ReactNode } from 'react'
import { STEPS } from '../steps'
import type { Step, StepId } from '../types'

interface StepApi {
  index: number
  step: Step
  stepId: StepId
  /**
   * 1 after next() or leaving the intro: play the step's entry animation.
   * -1 after prev(), a digit jump or reset: render the step's finished state instantly.
   */
  direction: 1 | -1
  next: () => void
  prev: () => void
  reset: () => void
  /** Increments on reset and when the intro is dismissed. Use as a React key to restart animations. */
  resetCount: number
}

export type Overlay = 'intro' | 'outro' | null

interface PresenterApi {
  /** Full-screen intro (on load and after reset) or outro (next on the last step). Not a step. */
  overlay: Overlay
  /** Jump to a step index, rendering its finished state. */
  jump: (index: number) => void
  hintVisible: boolean
  toggleHint: () => void
}

interface EvidenceApi {
  open: boolean
  setOpen: (open: boolean) => void
  toggle: () => void
}

const StepCtx = createContext<StepApi | null>(null)
const PresenterCtx = createContext<PresenterApi | null>(null)
const EvidenceCtx = createContext<EvidenceApi | null>(null)

const LAST = STEPS.length - 1

interface State {
  index: number
  direction: 1 | -1
  resetCount: number
  overlay: Overlay
}

type Action = { type: 'next' } | { type: 'prev' } | { type: 'jump'; index: number } | { type: 'reset' }

const INITIAL: State = { index: 0, direction: 1, resetCount: 0, overlay: 'intro' }

function reducer(s: State, a: Action): State {
  switch (a.type) {
    case 'next':
      // Leaving the intro starts step 1 fresh, so its entry animation plays now rather than under the intro.
      if (s.overlay === 'intro') return { index: 0, direction: 1, resetCount: s.resetCount + 1, overlay: null }
      if (s.overlay === 'outro') return s
      if (s.index === LAST) return { ...s, overlay: 'outro' }
      return { ...s, index: s.index + 1, direction: 1 }
    case 'prev':
      if (s.overlay === 'outro') return { ...s, overlay: null }
      if (s.overlay === 'intro' || s.index === 0) return s
      return { ...s, index: s.index - 1, direction: -1 }
    case 'jump': {
      const index = Math.max(0, Math.min(a.index, LAST))
      if (s.overlay === null && index === s.index) return s
      return { ...s, index, direction: -1, overlay: null }
    }
    case 'reset':
      return { index: 0, direction: -1, resetCount: s.resetCount + 1, overlay: 'intro' }
  }
}

function toggleFullscreen() {
  if (document.fullscreenElement) document.exitFullscreen().catch(() => {})
  else document.documentElement.requestFullscreen().catch(() => {})
}

export function StepProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, INITIAL)
  const [evidenceOpen, setEvidenceOpen] = useState(false)
  const [hintVisible, setHintVisible] = useState(true)

  const next = useCallback(() => dispatch({ type: 'next' }), [])
  const prev = useCallback(() => dispatch({ type: 'prev' }), [])
  const jump = useCallback((index: number) => dispatch({ type: 'jump', index }), [])
  const reset = useCallback(() => {
    dispatch({ type: 'reset' })
    setEvidenceOpen(false)
  }, [])
  const toggleEvidence = useCallback(() => setEvidenceOpen((o) => !o), [])
  const toggleHint = useCallback(() => setHintVisible((v) => !v), [])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.metaKey || e.ctrlKey || e.altKey || e.repeat) return
      const t = e.target as HTMLElement | null
      if (t && (t.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(t.tagName))) return

      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key
      if (key === 'ArrowRight' || key === ' ' || key === 'PageDown') next()
      else if (key === 'ArrowLeft' || key === 'PageUp') prev()
      // 1-9 jump to steps 1-9, 0 to step 10.
      else if (/^[0-9]$/.test(key)) jump(key === '0' ? 9 : Number(key) - 1)
      else if (key === 'r') reset()
      else if (key === 'e') toggleEvidence()
      else if (key === 'h') toggleHint()
      else if (key === 'f') toggleFullscreen()
      else return
      e.preventDefault()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [next, prev, jump, reset, toggleEvidence, toggleHint])

  const { index, direction, resetCount, overlay } = state
  const step = STEPS[index]
  const stepApi = useMemo<StepApi>(
    () => ({ index, step, stepId: step.id, direction, next, prev, reset, resetCount }),
    [index, step, direction, next, prev, reset, resetCount],
  )
  const presenterApi = useMemo<PresenterApi>(
    () => ({ overlay, jump, hintVisible, toggleHint }),
    [overlay, jump, hintVisible, toggleHint],
  )
  const evidenceApi = useMemo<EvidenceApi>(
    () => ({ open: evidenceOpen, setOpen: setEvidenceOpen, toggle: toggleEvidence }),
    [evidenceOpen, toggleEvidence],
  )

  return (
    <StepCtx.Provider value={stepApi}>
      <PresenterCtx.Provider value={presenterApi}>
        <EvidenceCtx.Provider value={evidenceApi}>{children}</EvidenceCtx.Provider>
      </PresenterCtx.Provider>
    </StepCtx.Provider>
  )
}

export function useStep(): StepApi {
  const ctx = useContext(StepCtx)
  if (!ctx) throw new Error('useStep must be used inside <StepProvider>')
  return ctx
}

export function usePresenter(): PresenterApi {
  const ctx = useContext(PresenterCtx)
  if (!ctx) throw new Error('usePresenter must be used inside <StepProvider>')
  return ctx
}

export function useEvidence(): EvidenceApi {
  const ctx = useContext(EvidenceCtx)
  if (!ctx) throw new Error('useEvidence must be used inside <StepProvider>')
  return ctx
}
