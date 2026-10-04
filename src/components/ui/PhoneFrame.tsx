import { motion } from 'framer-motion'
import { BatteryFull, Signal, Wifi } from 'lucide-react'
import { useEffect, useRef, useState, type ReactNode } from 'react'

const DEVICE_W = 360
const DEVICE_H = 740

interface PhoneFrameProps {
  active: boolean
  label?: string
  children: ReactNode
}

/**
 * A fixed 360x740 device. It is scaled down as a whole when the column is shorter,
 * so screen content can be designed in exact pixels and still fit 1440x900.
 */
export function PhoneFrame({ active, label, children }: PhoneFrameProps) {
  const fitRef = useRef<HTMLDivElement>(null)
  const [fit, setFit] = useState(1)

  useEffect(() => {
    const el = fitRef.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      setFit(Math.min(1, width / DEVICE_W, height / DEVICE_H))
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  return (
    <div ref={fitRef} className="flex h-full w-full flex-col items-center justify-center">
      <motion.div
        style={{ width: DEVICE_W, height: DEVICE_H, transformOrigin: 'center' }}
        initial={false}
        animate={{ opacity: active ? 1 : 0.35, scale: fit * (active ? 1 : 0.96) }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="relative shrink-0 rounded-[44px] bg-[#050706] p-[10px] shadow-device ring-1 ring-border"
        aria-label={label}
      >
        <div className="relative flex h-full w-full flex-col overflow-hidden rounded-[34px] bg-bg">
          <StatusBar />
          <div className="relative min-h-0 flex-1 overflow-hidden">{children}</div>
        </div>
      </motion.div>
    </div>
  )
}

function StatusBar() {
  return (
    <div className="relative flex h-11 shrink-0 items-center justify-between px-7 text-[13px] font-semibold text-text">
      <span className="tabular-nums">22:41</span>
      <span className="absolute left-1/2 top-2.5 h-[26px] w-[96px] -translate-x-1/2 rounded-full bg-black" />
      <span className="flex items-center gap-1.5">
        <Signal size={14} strokeWidth={2.5} />
        <Wifi size={14} strokeWidth={2.5} />
        <BatteryFull size={18} strokeWidth={2} />
      </span>
    </div>
  )
}
