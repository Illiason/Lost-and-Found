import type { ComponentType } from 'react'
import { content } from '../../data/content'
import { useStep } from '../../state/StepContext'
import type { StepId } from '../../types'
import { LogoMark } from '../ui/LogoMark'
import { PhoneFrame } from '../ui/PhoneFrame'
import { finderCopy } from './copy'
import { usePhotoSrc } from './hooks'
import {
  HandInScreen,
  IdleScreen,
  PhotoScreen,
  RewardScreen,
  ScanScreen,
  WaitingScreen,
  type ScreenProps,
} from './screens'

type ScreenName = 'idle' | 'photo' | 'scan' | 'handin' | 'waiting' | 'reward'

const SCREEN_FOR_STEP: Record<StepId, ScreenName> = {
  'lost-message': 'idle',
  'lost-parsed': 'idle',
  'map-service': 'idle',
  'map-journey': 'idle',
  'owner-post': 'idle',
  'finder-photo': 'photo',
  'finder-scan': 'scan',
  'finder-handin': 'handin',
  'owner-notified': 'waiting',
  'owner-match': 'waiting',
  'owner-verify': 'waiting',
  finale: 'reward',
}

const SCREENS: Record<ScreenName, ComponentType<ScreenProps>> = {
  idle: IdleScreen,
  photo: PhotoScreen,
  scan: ScanScreen,
  handin: HandInScreen,
  waiting: WaitingScreen,
  reward: RewardScreen,
}

export function FinderPhone() {
  const { step, stepId, direction, resetCount } = useStep()
  const active = step.activePhone === 'finder' || step.activePhone === 'both'
  const photo = usePhotoSrc()

  const screen = SCREEN_FOR_STEP[stepId]
  const Screen = SCREENS[screen]

  return (
    <PhoneFrame active={active} label="Finder phone">
      <div className="flex h-full flex-col">
        <div className="flex shrink-0 items-center gap-2.5 border-b border-border px-5 py-3">
          <LogoMark size={32} />
          <div className="text-lg font-semibold tracking-tight">{content.appName}</div>
          <span className="ml-auto rounded-full bg-amber/15 px-3 py-1 text-base font-medium text-amber">
            {finderCopy.role}
          </span>
        </div>
        <div className="relative min-h-0 flex-1 overflow-hidden">
          {/* Remounting on screen change or reset is what cancels a screen's timers and animations. */}
          <Screen key={`${screen}-${resetCount}`} animate={direction === 1} photo={photo} />
        </div>
      </div>
    </PhoneFrame>
  )
}
