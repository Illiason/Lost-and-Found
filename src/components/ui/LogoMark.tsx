import { content } from '../../data/content'

/**
 * The OnlyFounds magnifier, redrawn as vector from public/logo.jpg so it stays sharp at icon sizes.
 * Coordinates are in the logo's own pixels, cropped to the magnifier (a 241 x 241 box).
 * public/favicon.svg uses the same shapes; keep them in sync.
 */
function Magnifier() {
  return (
    <g fill="none" className="stroke-brand">
      <circle cx="83.8" cy="83.7" r="74" strokeWidth="19.4" />
      <path d="M82.1 35.7A48 48 0 0 1 131.8 84.5" strokeWidth="10.5" strokeLinecap="round" />
      <path d="M136.8 136.7L163.7 163.6" strokeWidth="20" />
      <path d="M163.7 163.6L223.8 223.7" strokeWidth="34" strokeLinecap="round" />
    </g>
  )
}

/** App icon: the magnifier on a dark tile. Used next to the app name in the phones and the notification. */
export function LogoMark({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden>
      <rect x="0.5" y="0.5" width="31" height="31" rx="9" className="fill-surface stroke-border" strokeWidth="1" />
      <g transform="translate(6.5 6.5) scale(0.0788)">
        <Magnifier />
      </g>
    </svg>
  )
}

/** public/logo.png is 923 x 255. */
const WORDMARK_RATIO = 923 / 255

/** Full logo, icon plus name: a transparent PNG made from public/logo.jpg, in the logo blue. */
export function Wordmark({ height }: { height: number }) {
  // Both dimensions are explicit: a flex column would otherwise stretch an auto width.
  const width = Math.round(height * WORDMARK_RATIO)
  return (
    <img
      src="/logo.png"
      alt={content.appName}
      width={width}
      height={height}
      draggable={false}
      className="block shrink-0 select-none"
      style={{ width, height }}
    />
  )
}
