# OnlyFounds shared contract

This file is the contract every later round builds on.
Read it before touching anything.

## Rules

- Only edit files in your owned folder.
- Never edit package.json.
- If you must change a shared file, keep it minimal and say so in the commit message.
- Never hardcode values that can be computed from `trip.json` (terminus, alight time, stop count and so on).
- Never create or modify anything inside `/pipeline` from the app side.

## Folder ownership

| Path | Owner |
| --- | --- |
| `src/components/map/**` | MapStage round |
| `src/components/owner/**` | OwnerPhone round |
| `src/components/finder/**` | FinderPhone round |
| `src/components/ui/**` | Shared |
| `src/state/**` | Shared |
| `src/types.ts`, `src/steps.ts` | Shared |
| `src/data/**` | Shared (`trip.json` is replaced by `/pipeline` output) |
| `src/App.tsx` | Shared |
| `pipeline/**` | Pipeline machine only |

Each feature component derives its own visuals from `stepId` inside its own folder.
There is no central "what to show" table.

## Steps

Defined in `src/steps.ts` as `STEPS: Step[]`, in this order.

| # | id | act | activePhone | title |
| --- | --- | --- | --- | --- |
| 1 | `lost-message` | 1 | owner | Report a lost item |
| 2 | `lost-parsed` | 1 | owner | AI understands the report |
| 3 | `map-service` | 1 | owner | Matching the exact train |
| 4 | `map-journey` | 1 | owner | Where the laptop went |
| 5 | `owner-post` | 1 | owner | Add a thank-you reward |
| 6 | `finder-photo` | 2 | finder | Someone finds it |
| 7 | `finder-scan` | 2 | finder | AI describes it and hides private details |
| 8 | `finder-handin` | 2 | finder | Handed to station staff |
| 9 | `owner-notified` | 3 | owner | Possible match |
| 10 | `owner-match` | 3 | owner | Why it's a match |
| 11 | `owner-verify` | 3 | owner | Prove it's yours |
| 12 | `finale` | 3 | both | Returned |

`ACT_LABELS` in the same file maps act number to the top bar label.

## Types (`src/types.ts`)

```ts
Stop     { id: string; name: string; lat: number; lon: number; time: string } // time "HH:MM"
Trip     // see trip.json schema below
StepId   // union of the 12 ids above
Step     { id: StepId; title: string; act: 1 | 2 | 3; activePhone: 'owner' | 'finder' | 'both' }
```

## Step engine (`src/state/StepContext.tsx`)

`<StepProvider>` wraps the app in `App.tsx`.

```ts
const { index, step, stepId, direction, next, prev, reset, resetCount } = useStep()
```

- `index`: 0-based position in `STEPS`.
- `step`, `stepId`: the current step and its id.
- `direction`: `1` means play the step's entry animation; `-1` means render its finished state instantly.
  It is `1` after `next()` and when the intro is dismissed.
  It is `-1` after `prev()`, a digit jump, and `reset()`.
- `next()`, `prev()`: clamped at both ends, so they never wrap.
  `next()` on the intro dismisses it; `next()` on step 12 opens the outro; `prev()` on the outro closes it.
- `reset()`: back to step 1 under the intro, closes the evidence drawer, increments `resetCount`.
- `resetCount`: increments on reset and again when the intro is dismissed.
  Use it as a React `key` (or effect dependency) to restart animations.

Presenter state lives in the same provider:

```ts
const { overlay, jump, hintVisible, toggleHint } = usePresenter()
```

- `overlay`: `'intro' | 'outro' | null`.
  The intro shows on load and after reset; the outro after `next()` on step 12.
  They are overlays, not steps: `index` stays 0 under the intro and 11 under the outro.
- `jump(index)`: go to a step, closing any overlay, with `direction = -1`.

Evidence drawer state lives in the same provider, exposed separately so `useStep` stays exactly as specified:

```ts
const { open, setOpen, toggle } = useEvidence()
```

Keyboard (global, ignored while typing in inputs or with Ctrl/Alt/Meta held):

| Key | Action |
| --- | --- |
| ArrowRight, Space, PageDown | next |
| ArrowLeft, PageUp | prev |
| 1-9, 0 | jump to step 1-9, 0 is step 10 (finished state) |
| r | reset (back to intro) |
| e | toggle evidence |
| f | toggle fullscreen |
| h | hide or show the presenter hint |

Auto-repeat (a held key) is ignored, so a clicker or a held arrow moves exactly one step.

## Step-4 timing contract (`src/components/map/schedule.ts`)

The map and the owner phone's timeline must agree on when the train reaches each stop.

- `T` = minutes from the board time to the terminus time in trip.json (wraps past midnight).
- The train reaches stop `s` at `(minutes(s) - minutes(board)) / T * 7000` ms after step 4 starts.
- It pauses 700 ms at the alight stop, so every stop after it is 700 ms later.
- Total is about 7700 ms.
- Between stops it moves along the shape at constant speed by distance.

`schedule.ts` exports `RIDE_MS`, `PAUSE_MS`, `arrivalMs(stopIndex)`, `ALIGHT_MS`, `DEPART_ALIGHT_MS`, `JOURNEY_MS` and `kmAt(t)`.

## trip.json schema (`src/data/trip.json`)

The current file is a placeholder.
`/pipeline` will replace it with real NTA GTFS data using this identical schema.

```jsonc
{
  "source": { "name": string, "url": string, "downloaded": "YYYY-MM-DD" },
  "service": { "route": string, "headsign": string, "tripId": string, "date": "YYYY-MM-DD" },
  "ownerBoard": string,   // must equal a stops[].name
  "ownerAlight": string,  // must equal a stops[].name
  "stops": [ { "id": string, "name": string, "lat": number, "lon": number, "time": "HH:MM" } ],
  "shape": [ [lon, lat], ... ]   // may be [] ; then draw straight lines between stops
}
```

Import it through `src/data/trip.ts`, not directly, to get derived values:

- `trip`: the typed `Trip`.
- `terminus`: last stop.
- `boardStop`, `alightStop`: stops matching `ownerBoard` and `ownerAlight` (may be `undefined` if names do not match).
- `routeCoords`: `[lon, lat][]`, the shape if it has at least two points, otherwise the stop coordinates.

## content.ts (`src/data/content.ts`)

All user-facing copy and demo config.
Templates use `{name}` placeholders, filled with `fill(template, vars)`.
Unknown placeholders are left as-is so gaps are visible.

```ts
import { content, fill } from '../../data/content'
import { terminus } from '../../data/trip'
fill(content.notification, { terminus: terminus.name })
```

| Key | Type | Notes |
| --- | --- | --- |
| `appName` | string | |
| `ownerMessage` | string | |
| `parsedTag` | string | "AI-extracted" |
| `parsedFields` | `{ label, value }[]` | Item, Line, Route, Time |
| `callouts` | `{ gotOff, didnt, likely }` | |
| `lostPropertyRule` | `{ text, contact, sourceUrl, checked }` | wording checked against the TFI page on `checked` |
| `rewards` | number[] | `[10, 20, 50]` |
| `defaultReward` | number | |
| `rewardLabel` | string | |
| `postedToast` | string | |
| `finderPhoto` | string | `/found-laptop.jpg` in `public/`; show a grey placeholder if it fails to load |
| `finderAI` | string | |
| `blurBoxes` | `{ label, x, y, w, h }[]` | percent of the image |
| `privacyCaption` | string | |
| `handInText` | template | vars: `terminus`, `reward` |
| `notification` | template | vars: `terminus` |
| `matchReasons` | `{ text, type: 'ok' \| 'pending' }[]` | |
| `verifyQuestion`, `verifyAnswer` | string | |
| `finaleBanner` | string | |
| `pickup` | `{ place, hours }` | `place` is a template, vars: `terminus` |
| `evidence` | `{ sources: { name, url, note }[], disclaimer }` | `note` holds the source date |
| `presenterHint` | string | footer hint |
| `intro` | `{ tagline, line, event, team, start }` | `team` is a placeholder |
| `outro` | `{ columns: { title, tone, items: { head, body, note? }[] }[], thanks }` | |

## Shared UI (`src/components/ui`)

- `PhoneFrame({ active, label?, children })`: 360x740 device with status bar.
  Inactive phones dim and scale down.
  The whole device scales down to fit shorter screens, so design screen content in exact pixels.
  The screen area below the status bar is 340x676 and clips overflow.
- `Stage`: the fixed 1920x1080 stage, scaled uniformly to fit the window and letterboxed.
  Design everything in 1080p pixels.
  `position: fixed` inside the stage is relative to the stage.
  `useStageScale()` returns the current scale.
- `Overlays`: intro and outro screens.
- `TopBar`, `EvidenceButton`, `EvidenceDrawer`, `LogoMark`, `RouteSketch`.

## Theme tokens (`src/index.css`)

Use as Tailwind classes, for example `bg-surface`, `text-muted`, `border-border`, `text-accent`.

| Token | Value |
| --- | --- |
| `bg` | #0B0F0E |
| `surface` | #121816 |
| `border` | #1F2A26 |
| `text` | #E8F0EC |
| `muted` | #8FA39A |
| `accent` | #3DDC84 |
| `amber` | #F5B547 |

Also `shadow-soft`, `shadow-device`, and a `glass` utility for map overlays.

## Map notes

MapStage sets the MapLibre worker URL explicitly and passes its own `maplibregl` instance to `<Map mapLib>`.
Keep both, or the map goes blank under Vite.
It raises the canvas pixel ratio when the stage is scaled above 1, so the map stays sharp on large screens.
If the basemap style cannot load (offline), it switches to a plain dark style and still draws the route, stops and callouts.
