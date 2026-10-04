export function LogoMark({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden>
      <rect width="32" height="32" rx="9" className="fill-surface stroke-border" strokeWidth="1" />
      <path d="M6 20 Q12 8 16 16 T26 12" fill="none" className="stroke-accent" strokeWidth="3" strokeLinecap="round" />
      <circle cx="26" cy="12" r="3" className="fill-amber" />
    </svg>
  )
}
