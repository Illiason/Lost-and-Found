# Pipeline: real DART trip data

Builds the journey data for the web app from the official Irish Rail GTFS timetable
([NTA GTFS – Irish Rail](https://www.transportforireland.ie/transitData/Data/GTFS_Irish_Rail.zip)).

## Run

```bash
python3 pipeline/fetch_trip.py
```

Python 3 standard library only, nothing to install. The feed (~7.7 MB) is downloaded to
`pipeline/raw/` on the first run and reused afterwards (`raw/` is git-ignored; delete it to refresh).

## What it does

- Uses service date **Saturday 2026-10-03** (`calendar.txt` + `calendar_dates.txt`). If that date is
  outside the feed's range it uses the nearest Saturday inside it and prints a `WARNING`.
- Picks the DART trip that calls at **Malahide** and later at **Tara Street** whose Malahide
  departure is closest to 22:30 (preferring 22:15–22:45).
- Writes the stops from Malahide to the end of the trip, with the route shape trimmed to that segment.
- Validates the output and prints a summary (chosen trip, times, stop count, nearest alternatives).

## Outputs

- `pipeline/out/trip.json` – the trip in the schema the app imports (`source`, `service`,
  `ownerBoard`, `ownerAlight`, `stops[]` with `id/name/lat/lon/time`, `shape` as `[lon, lat]` pairs,
  at most 400 points; `[]` if the trip has no shape).
- `pipeline/out/route.geojson` – the shape as a LineString plus a Point per stop; drop it on
  [geojson.io](https://geojson.io) to check it visually.

## Use in the app

Copy `pipeline/out/trip.json` to `src/data/trip.json`.
