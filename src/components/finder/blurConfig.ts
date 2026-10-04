import { content } from '../../data/content'

export interface BlurBox {
  label: string
  /** Percent of the photo (4:3 frame). */
  x: number
  y: number
  w: number
  h: number
}

/**
 * Retune blur positions to the real photo here, without touching content.ts.
 * Leave as null to use content.blurBoxes.
 *
 * Example:
 *   const override: BlurBox[] | null = [
 *     { label: 'serial', x: 60, y: 76, w: 24, h: 9 },
 *     { label: 'sticker', x: 28, y: 33, w: 20, h: 16 },
 *   ]
 */
// Tuned to public/found-laptop.jpg (3:4 portrait, cropped by photoFocus below).
// The photo shows no serial label, so the boxes cover the joke login sticker
// and the Lambda Dublin sticker (the hidden detail the owner is asked about).
const override: BlurBox[] | null = [
  { label: 'login', x: 9.3, y: 26.7, w: 13, h: 17.3 },
  { label: 'sticker', x: 54.2, y: 44.9, w: 14.5, h: 18.7 },
]

export const blurBoxes: BlurBox[] = override ?? content.blurBoxes

/**
 * Focal point of the photo inside the 4:3 frame (CSS object-position).
 * Only matters when the photo is not 4:3: the frame crops it with object-fit: cover,
 * and this picks which part stays visible. '50% 50%' is centre; '50% 0%' keeps the top.
 * Set this first, then tune the blur boxes, because moving the crop moves the boxes' targets.
 */
export const photoFocus = '50% 57%'
