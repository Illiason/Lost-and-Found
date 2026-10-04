#!/usr/bin/env python3
"""Extract one real DART journey (Malahide -> Tara Street and on to the terminus)
from the official Irish Rail GTFS feed and write it as pipeline/out/trip.json.

Standard library only. Run from anywhere:  python3 pipeline/fetch_trip.py
"""

import csv
import datetime as dt
import io
import json
import math
import os
import re
import sys
import urllib.request
import zipfile

FEED_NAME = "NTA GTFS – Irish Rail (Transport for Ireland)"
FEED_URL = "https://www.transportforireland.ie/transitData/Data/GTFS_Irish_Rail.zip"

HERE = os.path.dirname(os.path.abspath(__file__))
RAW_DIR = os.path.join(HERE, "raw")
OUT_DIR = os.path.join(HERE, "out")
ZIP_PATH = os.path.join(RAW_DIR, "GTFS_Irish_Rail.zip")

SERVICE_DATE = dt.date(2026, 10, 3)  # Saturday
SATURDAY = 5  # date.weekday()
TARGET_DEP = 22 * 3600 + 30 * 60  # 22:30
WINDOW = (22 * 3600 + 15 * 60, 22 * 3600 + 45 * 60)  # 22:15-22:45

BOARD_NAME = "Malahide"
ALIGHT_NAME = "Tara Street"
MAX_SHAPE_POINTS = 400

WEEKDAY_COLS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]


def warn(msg):
    print(f"WARNING: {msg}")


# ---------------------------------------------------------------- download / read

def download_feed():
    os.makedirs(RAW_DIR, exist_ok=True)
    if os.path.exists(ZIP_PATH):
        print(f"Using cached feed {os.path.relpath(ZIP_PATH)}")
        return
    print(f"Downloading {FEED_URL} ...")
    req = urllib.request.Request(FEED_URL, headers={"User-Agent": "Mozilla/5.0 (hackathon pipeline)"})
    tmp = ZIP_PATH + ".part"
    with urllib.request.urlopen(req, timeout=120) as resp, open(tmp, "wb") as f:
        while chunk := resp.read(1 << 16):
            f.write(chunk)
    os.replace(tmp, ZIP_PATH)
    print(f"Saved {os.path.getsize(ZIP_PATH):,} bytes")


def read_table(zf, name):
    if name not in zf.namelist():
        return []
    with zf.open(name) as fh:
        return list(csv.DictReader(io.TextIOWrapper(fh, encoding="utf-8-sig")))


def parse_ymd(s):
    return dt.datetime.strptime(s.strip(), "%Y%m%d").date()


# ---------------------------------------------------------------- calendar

def feed_range(feed_info, calendar):
    if feed_info and feed_info[0].get("feed_start_date") and feed_info[0].get("feed_end_date"):
        return parse_ymd(feed_info[0]["feed_start_date"]), parse_ymd(feed_info[0]["feed_end_date"])
    starts = [parse_ymd(c["start_date"]) for c in calendar]
    ends = [parse_ymd(c["end_date"]) for c in calendar]
    return min(starts), max(ends)


def choose_date(start, end):
    if start <= SERVICE_DATE <= end:
        return SERVICE_DATE
    if SERVICE_DATE < start:
        d = start + dt.timedelta(days=(SATURDAY - start.weekday()) % 7)
    else:
        d = end - dt.timedelta(days=(end.weekday() - SATURDAY) % 7)
    warn(f"{SERVICE_DATE} is outside the feed range {start}..{end}; using nearest Saturday {d} instead.")
    return d


def active_services(date, calendar, calendar_dates):
    active = set()
    col = WEEKDAY_COLS[date.weekday()]
    for c in calendar:
        if c[col] == "1" and parse_ymd(c["start_date"]) <= date <= parse_ymd(c["end_date"]):
            active.add(c["service_id"])
    for cd in calendar_dates:
        if parse_ymd(cd["date"]) != date:
            continue
        if cd["exception_type"] == "1":
            active.add(cd["service_id"])
        elif cd["exception_type"] == "2":
            active.discard(cd["service_id"])
    return active


# ---------------------------------------------------------------- names / times

def name_key(name):
    """Loose matching key: 'Dublin Tara St.' -> 'tara street'."""
    words = re.findall(r"[a-z0-9]+", name.lower())
    words = ["street" if w == "st" else w for w in words if w not in ("dublin", "station", "stn")]
    return " ".join(words)


def name_matches(stop_name, wanted):
    key, want = name_key(stop_name), name_key(wanted)
    return key == want or re.search(rf"\b{re.escape(want)}\b", key) is not None


def clean_name(raw):
    """Display name: drop '(Daly)'-style suffixes, 'Stn'/'Station' and a 'Dublin ' prefix."""
    name = re.sub(r"\s*\(.*?\)\s*", " ", raw)
    name = re.sub(r"\s+(Stn|Station)$", "", name.strip(), flags=re.I)
    name = re.sub(r"^Dublin\s+", "", name)
    return re.sub(r"\s+", " ", name).strip() or raw.strip()


def to_seconds(t):
    h, m, s = (int(x) for x in t.strip().split(":"))
    return h * 3600 + m * 60 + s


def hhmm(seconds):
    return f"{(seconds // 3600) % 24:02d}:{(seconds % 3600) // 60:02d}"


def stop_time_secs(st):
    return to_seconds(st["departure_time"] or st["arrival_time"])


# ---------------------------------------------------------------- shape

def nearest_index(points, lat, lon):
    k = math.cos(math.radians(lat))
    return min(range(len(points)), key=lambda i: ((points[i][0] - lat) ** 2 + ((points[i][1] - lon) * k) ** 2))


def downsample(points, limit):
    if len(points) <= limit:
        return points
    step = (len(points) - 1) / (limit - 1)
    return [points[round(i * step)] for i in range(limit)]


def load_shape(zf, shape_id):
    pts = []
    with zf.open("shapes.txt") as fh:
        for row in csv.DictReader(io.TextIOWrapper(fh, encoding="utf-8-sig")):
            if row["shape_id"] == shape_id:
                pts.append((int(row["shape_pt_sequence"]), float(row["shape_pt_lat"]), float(row["shape_pt_lon"])))
    pts.sort()
    return [(lat, lon) for _, lat, lon in pts]


def build_shape(zf, shape_id, first_stop, last_stop):
    if not shape_id:
        warn("trip has no shape_id; shape will be [] (the app falls back to straight lines).")
        return []
    pts = load_shape(zf, shape_id) if "shapes.txt" in zf.namelist() else []
    if not pts:
        warn(f"shape {shape_id} has no points; shape will be [] (the app falls back to straight lines).")
        return []
    i0 = nearest_index(pts, first_stop["lat"], first_stop["lon"])
    i1 = nearest_index(pts, last_stop["lat"], last_stop["lon"])
    seg = pts[i0:i1 + 1] if i0 <= i1 else pts[i1:i0 + 1][::-1]
    seg = downsample(seg, MAX_SHAPE_POINTS)
    return [[round(lon, 5), round(lat, 5)] for lat, lon in seg]


# ---------------------------------------------------------------- main

def main():
    download_feed()
    downloaded = dt.date.fromtimestamp(os.path.getmtime(ZIP_PATH)).isoformat()
    zf = zipfile.ZipFile(ZIP_PATH)

    calendar = read_table(zf, "calendar.txt")
    calendar_dates = read_table(zf, "calendar_dates.txt")
    start, end = feed_range(read_table(zf, "feed_info.txt"), calendar)
    date = choose_date(start, end)
    services = active_services(date, calendar, calendar_dates)
    print(f"Feed range {start}..{end}; service date {date} ({date:%A}); {len(services)} active service_ids")

    routes = {r["route_id"]: r for r in read_table(zf, "routes.txt")}
    dart_routes = {rid for rid, r in routes.items()
                   if "dart" in (r.get("route_short_name", "") + " " + r.get("route_long_name", "")).lower()}
    trips = {t["trip_id"]: t for t in read_table(zf, "trips.txt") if t["service_id"] in services}
    candidates = {tid: t for tid, t in trips.items() if t["route_id"] in dart_routes}
    if not candidates:
        warn("no active trips on a route named DART; considering all trips.")
        candidates = trips

    stops = {s["stop_id"]: s for s in read_table(zf, "stops.txt")}
    board_ids = {sid for sid, s in stops.items() if name_matches(s["stop_name"], BOARD_NAME)}
    alight_ids = {sid for sid, s in stops.items() if name_matches(s["stop_name"], ALIGHT_NAME)}
    if not board_ids or not alight_ids:
        sys.exit(f"ERROR: could not find stops for {BOARD_NAME!r} ({board_ids}) or {ALIGHT_NAME!r} ({alight_ids})")

    stop_times = {}
    for st in read_table(zf, "stop_times.txt"):
        if st["trip_id"] in candidates:
            stop_times.setdefault(st["trip_id"], []).append(st)

    # Trips that call at Malahide and later at Tara Street (southbound).
    matches = []
    for tid, sts in stop_times.items():
        sts.sort(key=lambda s: int(s["stop_sequence"]))
        b = next((i for i, s in enumerate(sts) if s["stop_id"] in board_ids), None)
        if b is None:
            continue
        a = next((i for i in range(b + 1, len(sts)) if sts[i]["stop_id"] in alight_ids), None)
        if a is None:
            continue
        dep = stop_time_secs(sts[b])
        in_window = WINDOW[0] <= dep <= WINDOW[1]
        matches.append(((not in_window, abs(dep - TARGET_DEP)), tid, b, a, dep))
    if not matches:
        sys.exit(f"ERROR: no trip on {date} calls at {BOARD_NAME} and later at {ALIGHT_NAME}")
    matches.sort()

    _, trip_id, b, a, dep = matches[0]
    trip = candidates[trip_id]
    sts = stop_times[trip_id]
    if not (WINDOW[0] <= dep <= WINDOW[1]):
        warn(f"no departure from {BOARD_NAME} between 22:15 and 22:45; closest is {hhmm(dep)}.")

    # Stops from Malahide to the end of the trip.
    out_stops = []
    print("\nStop names (raw -> clean):")
    for i, st in enumerate(sts[b:], start=b):
        s = stops[st["stop_id"]]
        raw = s["stop_name"]
        name = BOARD_NAME if i == b else ALIGHT_NAME if i == a else clean_name(raw)
        print(f"  {raw!r:40} -> {name!r}")
        out_stops.append({
            "id": st["stop_id"],
            "name": name,
            "lat": round(float(s["stop_lat"]), 5),
            "lon": round(float(s["stop_lon"]), 5),
            "time": hhmm(stop_time_secs(st)),
        })

    terminus = out_stops[-1]["name"]
    shape = build_shape(zf, trip.get("shape_id", ""), out_stops[0], out_stops[-1])

    result = {
        "source": {"name": FEED_NAME, "url": FEED_URL, "downloaded": downloaded},
        "service": {
            "route": "DART",
            "headsign": (trip.get("trip_headsign") or "").strip() or terminus,
            "tripId": trip_id,
            "date": date.isoformat(),
        },
        "ownerBoard": BOARD_NAME,
        "ownerAlight": ALIGHT_NAME,
        "stops": out_stops,
        "shape": shape,
    }
    validate(result)

    os.makedirs(OUT_DIR, exist_ok=True)
    text = json.dumps(result, indent=2, ensure_ascii=False)
    text = re.sub(r"\[\s+(-?[\d.]+),\s+(-?[\d.]+)\s+\]", r"[\1, \2]", text)  # one [lon, lat] pair per line
    with open(os.path.join(OUT_DIR, "trip.json"), "w", encoding="utf-8", newline="\n") as f:
        f.write(text + "\n")
    with open(os.path.join(OUT_DIR, "route.geojson"), "w", encoding="utf-8", newline="\n") as f:
        json.dump(to_geojson(result), f, ensure_ascii=False)
        f.write("\n")

    term_arr = sts[-1]["arrival_time"] or sts[-1]["departure_time"]
    print("\n========== SUMMARY ==========")
    print(f"Feed date range   : {start} .. {end}")
    print(f"Chosen date       : {date} ({date:%A})")
    print(f"Trip ID           : {trip_id}")
    print(f"Headsign          : {result['service']['headsign']}")
    print(f"Terminus          : {terminus}")
    print(f"Malahide depart   : {out_stops[0]['time']}")
    print(f"Tara Street       : {out_stops[a - b]['time']}")
    print(f"Terminus arrival  : {hhmm(to_seconds(term_arr))}")
    print(f"Stops             : {len(out_stops)}")
    print(f"Shape points      : {len(shape)}")
    print("Nearest alternatives:")
    for _, tid, ab, aa, adep in matches[1:4]:
        t, ss = candidates[tid], stop_times[tid]
        print(f"  {tid:12} dep Malahide {hhmm(adep)}  Tara St {hhmm(stop_time_secs(ss[aa]))}"
              f"  -> {t.get('trip_headsign') or clean_name(stops[ss[-1]['stop_id']]['stop_name'])}")
    print(f"\nWrote {os.path.relpath(os.path.join(OUT_DIR, 'trip.json'))} and route.geojson")


def to_geojson(result):
    features = []
    if result["shape"]:
        features.append({"type": "Feature", "properties": {"name": "shape"},
                         "geometry": {"type": "LineString", "coordinates": result["shape"]}})
    for s in result["stops"]:
        features.append({"type": "Feature", "properties": {"id": s["id"], "name": s["name"], "time": s["time"]},
                         "geometry": {"type": "Point", "coordinates": [s["lon"], s["lat"]]}})
    return {"type": "FeatureCollection", "features": features}


def validate(r):
    errors = []
    for key in ("source", "service", "ownerBoard", "ownerAlight", "stops", "shape"):
        if key not in r:
            errors.append(f"missing key {key}")
    for key in ("name", "url", "downloaded"):
        if not r.get("source", {}).get(key):
            errors.append(f"missing source.{key}")
    for key in ("route", "headsign", "tripId", "date"):
        if not r.get("service", {}).get(key):
            errors.append(f"missing service.{key}")
    stops = r.get("stops") or []
    if not stops:
        errors.append("stops is empty")
    for s in stops:
        if set(s) != {"id", "name", "lat", "lon", "time"} or not re.fullmatch(r"\d\d:\d\d", s["time"]):
            errors.append(f"bad stop entry {s}")
    names = [s["name"] for s in stops]
    if r.get("ownerBoard") not in names:
        errors.append(f"ownerBoard {r.get('ownerBoard')!r} not in stops")
    if r.get("ownerAlight") not in names:
        errors.append(f"ownerAlight {r.get('ownerAlight')!r} not in stops")
    if not errors and names.index(r["ownerAlight"]) <= names.index(r["ownerBoard"]):
        errors.append("Tara Street does not come after Malahide")
    if errors:
        sys.exit("VALIDATION FAILED:\n  " + "\n  ".join(errors))
    print("\nValidation passed.")


if __name__ == "__main__":
    main()
