# Lostline stage script

About 3 minutes. The demo block is 90 seconds and is the part to protect.

## Roles

| Role | Who | Job |
| --- | --- | --- |
| Presenter | _name_ | Speaks every line below, faces the audience |
| Driver | _name_ | Presses the keys, watches the screen, never speaks |
| Backup | _name_ | Has the screen recording ready on a second window |

The driver presses on the presenter's first word of each line, not before.

## Timing budget

| Beat | Length | Running total |
| --- | --- | --- |
| 1. Hook | 15 s | 0:15 |
| 2. Problem | 20 s | 0:35 |
| 3. Demo | 90 s | 2:05 |
| 4. Data | 20 s | 2:25 |
| 5. Trust | 15 s | 2:40 |
| 6. Next | 20 s | 3:00 |

If time is cut, drop beat 6 first, then shorten beat 2 to one sentence. Never cut the demo.

## Before going on

1. Run `npm run build && npm run preview` and open the page.
2. Press `F` for fullscreen, then `R` so the demo is on step 1.
3. Check the map background has loaded. If not, carry on: the line still draws.
4. Open the Evidence drawer once (`E`) and read the terminus name, so the presenter says the right station. Close it (`E`).

## 1. Hook (15 s)

Screen: step 1, nothing pressed yet.

> "Who's left something on a bus, a Luas or the DART? Did you know where to look?"

## 2. Problem (20 s)

Screen: still step 1.

> "In Dublin there are six transport services and six different lost-property rules. Items are held for 30 days, and an enquiry can take 15. If you left a bag on a train last night, you don't know which rule applies or where the train ended up."

## 3. Demo (90 s)

Each row: the driver presses the key, waits for the screen to settle, and the presenter says the line.
Steps 6, 7 and 8 animate for two to three seconds; let them finish before the next press.

| Step | Key | On screen | Presenter says | Time |
| --- | --- | --- | --- | --- |
| 1 | (already showing) | Owner phone: Aoife types that she took the DART from Malahide to Tara Street around 22:30 and left her grey Lenovo laptop on it | "Aoife left her laptop on the DART last night." | 6 s |
| 2 | → | Card of extracted fields: Laptop · Lenovo · Grey, DART, Malahide → Tara Street, about 22:30, tagged "AI-extracted" | "She just writes it the way she'd say it." | 6 s |
| 3 | → | Map draws the DART line and the matched service, tagged "From NTA timetable" | "The timetable tells us exactly which train that was." | 7 s |
| 4 | → | The train runs past Tara Street: "You got off here." then "Your laptop didn't." then a pin at the terminus | "She got off. Her laptop didn't. It's at the end of the line." | 12 s |
| 5 | → | "Held for 30 days" rule, a €20 thank-you (simulated), Post | "She can add a thank-you, paid only after a verified return." | 8 s |
| 6 | → | Finder phone: camera viewfinder, shutter, flash, the photo of the laptop at the terminus station | "A passenger spots it at the last stop." | 7 s |
| 7 | → | Green scan line over the photo, then "Laptop · Lenovo · Grey · stickers on lid" and blur boxes over the login sticker and one other sticker | "AI describes it and hides anything private." | 9 s |
| 8 | → | "Hand it to station staff", the Handed in button presses itself, "Owner notified" | "No meeting strangers: it goes to station staff." | 7 s |
| 9 | → | Owner phone: notification "Possible match at (terminus) station" | "Aoife gets a notification." | 5 s |
| 10 | → | Match reasons appear one by one, no percentage | "Every match explains itself." | 8 s |
| 11 | → | "What's on the lid?" → "Lambda Dublin sticker" → Verified | "Only the real owner knows the hidden detail." | 7 s |
| 12 | → | Pickup card, "€20 thank-you released", confetti, the map shows the whole journey | "Returned. No forms, no phone calls." | 8 s |

The line to land is step 4. Pause for a beat after "Her laptop didn't."

## 4. Data (20 s)

Key: `E` to open the Evidence drawer.

Screen: the matched service (trip id, boarding, alighting and terminus times), the lost-property rule and the list of sources.

> "The train is real. This is the Irish Rail timetable published by the NTA, and the lost-property rules are from Transport for Ireland. The people and the laptop are simulated, and the app says so."

Key: `E` to close.

## 5. Trust (15 s)

Screen: step 12 behind the closed drawer.

> "The thank-you is never a ransom: handing the item to station staff still earns it. Private details are blurred, and handover happens at official points, so nobody has to meet a stranger."

## 6. Next (20 s)

Screen: step 12.

> "Next is live buses, where the NTA realtime feed already gives vehicle positions. Then pre-filled TFI reports, and routing street finds to the nearest open Garda station."

## If something breaks

| Problem | What the driver does | What the presenter does |
| --- | --- | --- |
| A step looks wrong or an animation stalls | Press the digit for that step (`1`–`9`, `0` for step 10). It shows the finished state at once. For step 11 or 12, press `0` then → | Keep talking; say the line for that step |
| Pressed → too many times | Press ← to go back. Going back never replays an animation | Carry on |
| The whole demo is in a bad state | Press `R` to restart from step 1, then use the digit keys to get back to where you were | "Let me show you that again." |
| The map background is missing (no internet) | Nothing. The line, stops and train still draw | Do not mention it |
| The app will not load or the laptop freezes | Switch to the backup screen recording (Alt+Tab) and press play | Narrate over the recording with the same lines |

Record the backup at 15:30: one clean run of all 12 steps in fullscreen, about 90 seconds, saved locally and already open before going on stage.
