# Lostline

You got off. Your laptop didn't.

Lostline tells people who lost something on Dublin public transport where their item most likely went, and connects them with whoever found it.
An item left on a train keeps travelling to the end of the line, so the place to look is the vehicle's terminus, not the owner's stop.
Lostline uses the real timetable to trace the exact service to its terminus, lets a finder photograph the item with private details blurred, explains each match with reasons, and verifies the owner with a hidden detail before handover at an official point.

**Team sentence:** We're helping people who lose things on public transport in Dublin find out where their item went and get it back, using NTA timetable data, TFI lost-property rules and an AI matcher.

This is a scripted, frontend-only demo built for Build for Ireland.
The transport data is real; the people, the laptop, the AI outputs and the reward are simulated.

## Run locally

Needs Node 22 or newer (Node 19 cannot run the build tools).

```bash
npm install
npm run dev
```

Open the URL Vite prints (normally http://localhost:5173).

For the stage, use the production build:

```bash
npm run build && npm run preview
```

## Presenter keys

| Key | Action |
| --- | --- |
| → / Space / PageDown | Next step |
| ← / PageUp | Back one step |
| 1–9, 0 | Jump to steps 1–10 |
| F | Fullscreen |
| E | Evidence drawer (data sources) |
| H | Hint |
| R | Reset to step 1 |

Going forward plays each step's animation.
Going back, jumping and resetting show the finished state straight away.
The stage script is in [docs/PITCH.md](docs/PITCH.md).

## Regenerate the real data

The app reads one real DART trip from `src/data/trip.json`.
To rebuild it from the official timetable:

```bash
python3 pipeline/fetch_trip.py
cp pipeline/out/trip.json src/data/trip.json
```

The script uses only the Python standard library.
Terminus, times and stop names all come from this file; nothing is hardcoded.

## Data sources

| Data | Publisher | Used for |
| --- | --- | --- |
| [Irish Rail GTFS timetable](https://www.transportforireland.ie/transitData/Data/GTFS_Irish_Rail.zip) | NTA / Transport for Ireland | The service, its stops, times, terminus and the line on the map |
| [TFI lost property rules](https://transportforireland.ie/support/lost-property) | Transport for Ireland | Where items go and how long they are held |
| Basemap | [OpenStreetMap](https://www.openstreetmap.org/copyright) contributors via [CARTO](https://carto.com/attributions) | The map |
| Owner, finder, laptop photo, reward | Our team | The story (simulated) |

Background on the problem:
[Dublin Bus lost property](https://www.dublinbus.ie/lost-property-department),
[Luas lost property](https://www.luas.ie/lost-property/),
[Criminal Justice (Theft and Fraud Offences) Act 2001, s.4](https://revisedacts.lawreform.ie/eli/2001/act/50/section/4/revised/en/html).

## Troubleshooting

**The map is blank or grey.**
Map tiles need internet.
The route line, stops and train still draw offline, so the demo still works; only the street background is missing.

**`npm run build` fails with `ERR_UNKNOWN_FILE_EXTENSION` or "Cannot find native binding".**
Node is too old.
Install Node 22, delete `node_modules`, and run `npm install` again.

**Swap the found-item photo.**
Replace `public/found-laptop.jpg`.
The finder phone falls back to the drawn placeholder `public/found-laptop.svg` if the JPEG is missing.
The photo is shown in a 4:3 frame; a photo with another shape is cropped to fill it.

**Retune the blur boxes.**
Edit `src/components/finder/blurConfig.ts`:

1. If the photo is not 4:3, set `photoFocus` (a CSS `object-position`, such as `'50% 30%'`) so the laptop is in frame.
2. Set `override` to the boxes for the details to hide. Each box is `{ label, x, y, w, h }` in percent of the frame, measured from the top-left corner. The label picks the pill text: `serial` shows "serial hidden", `login` shows "login hidden", anything else shows "detail hidden".
3. Go to step 7 (press `7`) and check both boxes cover their targets.

Leave `override` as `null` to use the defaults from `src/data/content.ts`.
