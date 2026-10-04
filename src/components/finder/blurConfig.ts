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
const override: BlurBox[] | null = null

export const blurBoxes: BlurBox[] = override ?? content.blurBoxes
