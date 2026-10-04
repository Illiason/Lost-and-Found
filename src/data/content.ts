import { trip } from './trip'

/** Replace {key} placeholders. Unknown keys are left as-is so gaps are visible in the demo. */
export function fill(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in vars ? String(vars[key]) : match,
  )
}

export type MatchReason = { text: string; type: 'ok' | 'pending' }

export const content = {
  appName: 'Lostline',

  ownerMessage:
    'Last night I took the DART from Malahide to Tara St around 22:30. Left my grey Lenovo laptop on it.',

  parsedTag: 'AI-extracted',
  parsedFields: [
    { label: 'Item', value: 'Laptop · Lenovo · Grey' },
    { label: 'Line', value: 'DART' },
    { label: 'Route', value: 'Malahide → Tara Street' },
    { label: 'Time', value: '~22:30 last night' },
  ],

  callouts: {
    gotOff: 'You got off here.',
    didnt: "Your laptop didn't.",
    likely: 'Most likely here',
  },

  lostPropertyRule: {
    text: 'Items found on Irish Rail services are held for 30 days',
    sourceUrl: 'https://transportforireland.ie/support/lost-property',
  },

  rewards: [10, 20, 50],
  defaultReward: 20,
  rewardLabel: 'Simulated payment · released only after verified return',

  postedToast: 'Posted. Watching for matches along your route.',

  finderPhoto: '/found-laptop.jpg',
  finderAI: 'Laptop · Lenovo · Grey · stickers on lid',
  /** Percent of the image. */
  blurBoxes: [
    { label: 'serial', x: 62, y: 78, w: 22, h: 8 },
    { label: 'sticker', x: 30, y: 35, w: 18, h: 14 },
  ],
  privacyCaption: 'Hidden for privacy — used to verify the owner.',

  /** Vars: terminus, reward */
  handInText: "Hand it to station staff at {terminus}. You'll get the €{reward} thank-you when the owner collects.",

  /** Vars: terminus */
  notification: 'Possible match at {terminus} station',

  matchReasons: [
    { text: 'Same line and direction', type: 'ok' },
    { text: "Found at your train's terminus shortly after you got off", type: 'ok' },
    { text: 'Grey Lenovo laptop', type: 'ok' },
    { text: 'One hidden detail to confirm', type: 'pending' },
  ] as MatchReason[],

  verifyQuestion: "What's on the lid?",
  verifyAnswer: 'Lambda Dublin sticker',

  finaleBanner: 'Returned. No forms, no phone calls.',

  /** Vars: terminus */
  pickup: {
    place: '{terminus} station',
    hours: 'Collection details confirmed by Irish Rail',
  },

  evidence: {
    sources: [
      { name: trip.source.name, url: trip.source.url, note: `Downloaded ${trip.source.downloaded}` },
      { name: 'Transport for Ireland · Lost property', url: 'https://transportforireland.ie/support/lost-property' },
      { name: 'Basemap © OpenStreetMap contributors, © CARTO', url: 'https://carto.com/attributions' },
    ],
    disclaimer: 'Scripted demo — transport data is real; people and items are simulated.',
  },
}
