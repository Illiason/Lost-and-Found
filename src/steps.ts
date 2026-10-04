import type { Step } from './types'

export const STEPS: Step[] = [
  { id: 'lost-message', title: 'Report a lost item', act: 1, activePhone: 'owner' },
  { id: 'lost-parsed', title: 'AI understands the report', act: 1, activePhone: 'owner' },
  { id: 'map-service', title: 'Matching the exact train', act: 1, activePhone: 'owner' },
  { id: 'map-journey', title: 'Where the laptop went', act: 1, activePhone: 'owner' },
  { id: 'owner-post', title: 'Add a thank-you reward', act: 1, activePhone: 'owner' },
  { id: 'finder-photo', title: 'Someone finds it', act: 2, activePhone: 'finder' },
  { id: 'finder-scan', title: 'AI describes it and hides private details', act: 2, activePhone: 'finder' },
  { id: 'finder-handin', title: 'Handed to station staff', act: 2, activePhone: 'finder' },
  { id: 'owner-notified', title: 'Possible match', act: 3, activePhone: 'owner' },
  { id: 'owner-match', title: "Why it's a match", act: 3, activePhone: 'owner' },
  { id: 'owner-verify', title: "Prove it's yours", act: 3, activePhone: 'owner' },
  { id: 'finale', title: 'Returned', act: 3, activePhone: 'both' },
]

export const ACT_LABELS: Record<Step['act'], string> = {
  1: 'Act 1 · I lost it',
  2: 'Act 2 · I found it',
  3: 'Act 3 · Reunited',
}
