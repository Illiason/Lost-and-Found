// Owner-phone strings that are not in src/data/content.ts. Placeholders are filled with fill().
export const ownerCopy = {
  assistantPrompt: 'What did you lose, and where?',
  inputPlaceholder: 'Message',
  understanding: 'Understanding…',
  parsedTitle: 'Your report',

  matchedTitle: 'Matched service',
  timetableTag: 'From NTA timetable',
  serviceMeta: '{day} · {stops} stops',

  journeyTitle: 'Where it went',
  boarded: 'You got on',
  likelyHere: 'Laptop most likely here',

  postTitle: 'Post your report',
  rewardTitle: 'Add a thank-you',
  ruleSource: 'Source: {host}',
  postButton: 'Post',
  postedButton: 'Posted',

  myReports: 'My reports',
  searching: 'Searching',
  possibleMatch: 'Possible match',
  thankYou: '€{reward} thank-you',
  routeTitle: 'Your route',

  bannerTime: 'now',

  matchTitle: 'Possible match',
  foundAt: 'Handed in at {terminus}',
  heldBy: 'Held by station staff',
  reasonsTitle: "Why it's a match",

  verifyHint: 'Only the real owner knows this.',
  verifyPlaceholder: 'Your answer',
  confirm: 'Confirm',
  verified: 'Verified',

  pickupLabel: 'Collect from',
  released: '€{reward} thank-you released to finder',
}

/**
 * Step 2 "show the AI's work": phrases in content.ownerMessage and the parsed field (by label in
 * content.parsedFields) each one fed. Listed in the order they light up. A phrase missing from the
 * message, or a field label missing from parsedFields, is simply skipped.
 */
export const sourceHighlights: { phrase: string; field: string }[] = [
  { phrase: 'black Dell laptop', field: 'Item' },
  { phrase: 'DART', field: 'Line' },
  { phrase: 'Malahide', field: 'Route' },
  { phrase: 'Tara St', field: 'Route' },
  { phrase: 'around 22:30', field: 'Time' },
]

/** One subtle colour per parsed field, shared by the phrase underline and the field's dot. */
export const fieldColors: Record<string, string> = {
  Item: '#F5B547',
  Line: '#60A5FA',
  Route: '#3DDC84',
  Time: '#C084FC',
}
