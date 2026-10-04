import confetti from 'canvas-confetti'
import { motion } from 'framer-motion'
import { Check, HandHeart, MapPin } from 'lucide-react'
import { useEffect } from 'react'
import { content, fill } from '../../data/content'
import { Appear, Card } from './atoms'
import { ownerCopy } from './ownerCopy'
import { terminus } from './ownerTrip'
import type { Mode } from './playback'

const CONFETTI_AT = 350
const CONFETTI_COLORS = ['#3DDC84', '#8FF0B8', '#1FA463', '#FFFFFF', '#E8F0EC']

/** Step 12: returned. Confetti fires once on forward entry, never on back or reset. */
export function FinaleScreen({ mode }: { mode: Mode }) {
  const play = mode === 'play'

  useEffect(() => {
    if (mode !== 'play') return
    const id = window.setTimeout(() => {
      void confetti({
        particleCount: 160,
        spread: 100,
        startVelocity: 42,
        origin: { x: 0.5, y: 0.65 },
        colors: CONFETTI_COLORS,
        disableForReducedMotion: true,
      })
    }, CONFETTI_AT)
    return () => {
      window.clearTimeout(id)
      confetti.reset()
    }
  }, [mode])

  return (
    <div className="flex h-full flex-col gap-3 px-4 pt-8">
      <div className="flex flex-col items-center text-center">
        <motion.span
          initial={play ? { scale: 0.3, opacity: 0 } : false}
          animate={{ scale: 1, opacity: 1 }}
          transition={play ? { type: 'spring', stiffness: 260, damping: 16 } : { duration: 0 }}
          className="grid h-20 w-20 place-items-center rounded-full bg-accent text-bg shadow-[0_0_48px_-6px_rgb(61_220_132/0.7)]"
        >
          <Check size={40} strokeWidth={3} />
        </motion.span>
        <Appear play={play} delay={0.2} className="mt-5">
          <div className="text-2xl font-semibold leading-tight tracking-tight">{content.finaleBanner}</div>
        </Appear>
      </div>

      <Appear play={play} delay={0.4} className="mt-3">
        <Card>
          <div className="flex gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-accent/12 text-accent">
              <MapPin size={22} />
            </span>
            <div className="min-w-0 text-base">
              <div className="text-muted">{ownerCopy.pickupLabel}</div>
              <div className="text-lg font-semibold">{fill(content.pickup.place, { terminus: terminus.name })}</div>
              <div className="text-muted">{content.pickup.hours}</div>
            </div>
          </div>
        </Card>
      </Appear>

      <Appear play={play} delay={0.6}>
        <Card className="flex items-center gap-3">
          <HandHeart size={22} className="shrink-0 text-accent" />
          <span className="flex-1 text-base font-medium">
            {fill(ownerCopy.released, { reward: content.defaultReward })}
          </span>
          <Check size={20} strokeWidth={3} className="shrink-0 text-accent" />
        </Card>
      </Appear>
    </div>
  )
}
