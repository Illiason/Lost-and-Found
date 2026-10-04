/** Finder-only copy that content.ts does not have. Templates use fill() from content.ts. */
export const finderCopy = {
  role: 'Finder',

  idleTitle: 'Found something?',
  idleHint: 'Take a photo and we’ll find its owner.',
  /** Vars: terminus */
  idleLocation: 'Near {terminus} station',

  viewfinderHint: 'Point at the item',
  /** Vars: terminus */
  photoLocation: '{terminus} station',
  photoTaken: 'Photo captured',
  photoTakenHint: 'Found just now',
  reportButton: 'Report found item',

  scanning: 'Scanning photo…',
  aiTag: 'AI',
  serialHidden: 'serial hidden',
  loginHidden: 'login hidden',
  detailHidden: 'detail hidden',

  handedIn: 'Handed in',
  ownerNotified: 'Owner notified',

  waitingTitle: 'Handed in',
  waitingText: 'Waiting for the owner to verify',

  /** Vars: reward */
  rewardReleased: '€{reward} thank-you released',
  rewardThanks: 'Thanks for returning it.',
}

export function blurLabel(label: string): string {
  if (label === 'serial') return finderCopy.serialHidden
  if (label === 'login') return finderCopy.loginHidden
  return finderCopy.detailHidden
}
