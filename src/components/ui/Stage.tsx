import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

export const STAGE_W = 1920
export const STAGE_H = 1080

const fit = () => Math.min(window.innerWidth / STAGE_W, window.innerHeight / STAGE_H)

const ScaleCtx = createContext(1)

/** Current stage scale. The map uses it to keep its canvas sharp when the stage is scaled up. */
export const useStageScale = () => useContext(ScaleCtx)

/**
 * A fixed 1920x1080 stage, scaled uniformly to fit the window and letterboxed.
 * Everything inside lays out in exact 1080p pixels, so a laptop and a projector look identical.
 * Note: position: fixed inside the stage is relative to the stage, because it has a transform.
 */
export function Stage({ children }: { children: ReactNode }) {
  const [scale, setScale] = useState(fit)

  useEffect(() => {
    const onResize = () => setScale(fit())
    window.addEventListener('resize', onResize)
    document.addEventListener('fullscreenchange', onResize)
    return () => {
      window.removeEventListener('resize', onResize)
      document.removeEventListener('fullscreenchange', onResize)
    }
  }, [])

  return (
    <ScaleCtx.Provider value={scale}>
      <div className="fixed inset-0 overflow-hidden bg-bg">
        <div
          className="absolute left-1/2 top-1/2 overflow-hidden bg-bg"
          style={{
            width: STAGE_W,
            height: STAGE_H,
            transform: `translate(-50%, -50%) scale(${scale})`,
            transformOrigin: 'center',
          }}
        >
          {children}
        </div>
      </div>
    </ScaleCtx.Provider>
  )
}
