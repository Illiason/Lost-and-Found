import { motion } from 'framer-motion'
import { content, fill } from '../../data/content'
import { LogoMark } from '../ui/LogoMark'
import { ownerCopy } from './ownerCopy'
import { terminus } from './ownerTrip'

/** iOS-style notification that springs down over the top of the screen (step 9). */
export function PushBanner({ play }: { play: boolean }) {
  return (
    <motion.div
      initial={play ? { y: -150, opacity: 0, scale: 0.96 } : false}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      variants={{
        // `custom` comes from the parent AnimatePresence: slide away going forward, vanish otherwise.
        exit: (forward: boolean) =>
          forward
            ? { y: -150, opacity: 0, transition: { duration: 0.3, ease: 'easeIn' } }
            : { opacity: 0, transition: { duration: 0 } },
      }}
      exit="exit"
      transition={play ? { type: 'spring', stiffness: 360, damping: 26, mass: 0.9, delay: 0.25 } : { duration: 0 }}
      className="absolute inset-x-2.5 top-2 z-30 flex items-start gap-3 rounded-[22px] border border-white/10 bg-[#1b2421]/92 px-3.5 py-3 shadow-[0_18px_40px_-12px_rgb(0_0_0/0.7),0_4px_12px_-4px_rgb(0_0_0/0.45)] backdrop-blur-xl"
    >
      <LogoMark size={38} />
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-base font-semibold">{content.appName}</span>
          <span className="text-base text-muted">{ownerCopy.bannerTime}</span>
        </div>
        <div className="text-base leading-snug">{fill(content.notification, { terminus: terminus.name })}</div>
      </div>
    </motion.div>
  )
}
