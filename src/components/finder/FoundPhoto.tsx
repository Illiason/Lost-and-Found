import { motion } from 'framer-motion'
import { Fragment, type CSSProperties, type ReactNode } from 'react'
import { blurBoxes, type BlurBox } from './blurConfig'
import { blurLabel } from './copy'

const HATCH =
  'repeating-linear-gradient(135deg, rgb(255 255 255 / 0.16) 0 2px, transparent 2px 7px)'

interface FoundPhotoProps {
  src: string | null
  /** Show the privacy blur boxes. */
  blur?: boolean
  /** Show the "serial hidden" pills next to the boxes. */
  labels?: boolean
  /** Animate the photo and boxes in. False renders the finished state. */
  animate?: boolean
  /** Seconds before the first blur box appears. */
  blurDelay?: number
  className?: string
  /** Overlays drawn above the photo (scan line, flash). */
  children?: ReactNode
}

/** The found-item photo in a 4:3 frame, so blur-box percentages stay valid. */
export function FoundPhoto({
  src,
  blur = false,
  labels = false,
  animate = false,
  blurDelay = 0,
  className = '',
  children,
}: FoundPhotoProps) {
  return (
    <div
      className={`relative aspect-[4/3] w-full shrink-0 overflow-hidden rounded-2xl border border-border bg-surface ${className}`}
    >
      {src && (
        <motion.img
          src={src}
          alt="Found item"
          draggable={false}
          className="absolute inset-0 h-full w-full object-cover"
          initial={animate && !blur ? { scale: 1.08 } : false}
          animate={{ scale: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      )}

      {blur &&
        blurBoxes.map((box, i) => {
          const delay = animate ? blurDelay + i * 0.3 : 0
          return (
            <Fragment key={box.label}>
              {/* backdrop-filter sits on the animated element itself: an ancestor with opacity < 1 would cut it off from the photo. */}
              <motion.div
                className="absolute rounded-md border border-white/40 backdrop-blur-md"
                style={{
                  left: `${box.x}%`,
                  top: `${box.y}%`,
                  width: `${box.w}%`,
                  height: `${box.h}%`,
                  backgroundImage: HATCH,
                }}
                initial={animate ? { opacity: 0, scale: 1.5 } : false}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.35, ease: 'easeOut', delay }}
              />
              {labels && (
                <motion.span
                  className="absolute whitespace-nowrap rounded-md bg-bg/85 px-2 py-1 text-base font-medium leading-none text-text"
                  style={labelPosition(box)}
                  initial={animate ? { opacity: 0 } : false}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, delay: delay + 0.2 }}
                >
                  {blurLabel(box.label)}
                </motion.span>
              )}
            </Fragment>
          )
        })}

      {children}
    </div>
  )
}

/** Put the pill on whichever side of the box has more room, so it stays inside the frame. */
function labelPosition(box: BlurBox): CSSProperties {
  const lower = box.y + box.h / 2 > 50
  const rightSide = box.x + box.w / 2 > 50
  return {
    ...(lower
      ? { bottom: `${100 - box.y}%`, marginBottom: 4 }
      : { top: `${box.y + box.h}%`, marginTop: 4 }),
    ...(rightSide ? { right: `${100 - box.x - box.w}%` } : { left: `${box.x}%` }),
  }
}
