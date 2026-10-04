import { motion } from 'framer-motion'
import { content, fill } from '../../data/content'
import { LogoMark } from '../ui/LogoMark'
import { ownerCopy } from './ownerCopy'
import { terminus } from './ownerTrip'

/** iOS-style notification that slides down over the top of the screen (step 9). */
export function PushBanner({ play }: { play: boolean }) {
  return (
    <motion.div
      initial={play ? { y: -140, opacity: 0 } : false}
      animate={{ y: 0, opacity: 1 }}
      variants={{
        // `custom` comes from the parent AnimatePresence: slide away going forward, vanish going back.
        exit: (forward: boolean) =>
          forward
            ? { y: -140, opacity: 0, transition: { duration: 0.3, ease: 'easeIn' } }
            : { opacity: 0, transition: { duration: 0 } },
      }}
      exit="exit"
      transition={play ? { type: 'spring', stiffness: 320, damping: 30, delay: 0.25 } : { duration: 0 }}
      className="absolute inset-x-2.5 top-2 z-30 flex items-start gap-3 rounded-[22px] border border-white/10 bg-[#1b2421]/90 px-3.5 py-3 shadow-device backdrop-blur-xl"
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
