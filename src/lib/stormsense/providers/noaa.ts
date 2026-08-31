import type {
  Observation,
  SatelliteImage,
  Storm,
  StormDetail,
  StormProvider,
  TrackPoint,
} from "@/lib/types";
import { windToCategory } from "@/lib/types";
import {
  getMockObservations,
  getMockSatellite,
  getMockStorm,
  getMockStorms,
  getMockTrack,
} from "../data";

/** NOAA NHC live active-storm feed (no API key required). */
const NHC_LIVE_URL = "https://www.nhc.noaa.gov/CurrentStorms.json";
const CACHE_TTL_MS = 5 * 60 * 1000;
const FAIL_TTL_MS = 30 * 1000;
const FETCH_TIMEOUT_MS = 8000;

let liveCache: { at: number; storms: Storm[] } | null = null;

interface NhcActiveStorm {
  id: string;
  name: string;
  classification: string;
  intensity: string | number;
  pressure: string | number;
  latitude: string;
  longitude: string;
  latitudeNumeric?: number;
  longitudeNumeric?: number;
  movementDir?: number | null;
  movementSpeed?: number | null;
  lastUpdate?: string;
}

export const noaaProvider: StormProvider = {
  name: "noaa/live+historical",

  async getStorms() {
    const live = await fetchLiveStorms();
    const historical = getMockStorms();
    if (live.length === 0) return historical;

    const ids = new Set(live.map((s) => s.id));
    return [...live, ...historical.filter((s) => !ids.has(s.id))];
  },

  async getStorm(id: string) {
    const live = await fetchLiveStorms();
    const current = live.find((s) => s.id === id);
    if (current) {
      const detail: StormDetail = {
        storm: current,
        track: toLiveTrack(current),
        observations: toLiveObservations(current),
        satellite: [],
        forecast_track: [],
      };
      return detail;
    }
    return getMockStorm(id);
  },

  async getTrack(id: string) {
    const live = await fetchLiveStorms();
    const current = live.find((s) => s.id === id);
    return current ? toLiveTrack(current) : getMockTrack(id);
  },

  async getObservations(id: string) {
    const live = await fetchLiveStorms();
    const current = live.find((s) => s.id === id);
    return current ? toLiveObservations(current) : getMockObservations(id);
  },

  async getSatellite(id: string): Promise<SatelliteImage[]> {
    const live = await fetchLiveStorms();
    const isLive = live.some((s) => s.id === id);
    return isLive ? [] : getMockSatellite(id);
  },
};

async function fetchLiveStorms(): Promise<Storm[]> {
  if (liveCache) {
    const fresh = Date.now() - liveCache.at;
    const hasData = liveCache.storms.length > 0;
    const ttl = hasData ? CACHE_TTL_MS : FAIL_TTL_MS;
    if (fresh < ttl) return liveCache.storms;
  }

  try {
    const res = await fetch(NHC_LIVE_URL, {
      cache: "no-store",
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    if (!res.ok) throw new Error(`NOAA NHC ${res.status}`);
    const data = (await res.json()) as { activeStorms?: NhcActiveStorm[] };
    const list = Array.isArray(data.activeStorms) ? data.activeStorms : [];
    const storms = list
      .map(parseNhcStorm)
      .filter((s): s is Storm => s !== null);
    liveCache = { at: Date.now(), storms };
    return storms;
  } catch {
    liveCache = { at: Date.now(), storms: [] };
    return [];
  }
}

function parseNhcStorm(raw: NhcActiveStorm): Storm | null {
  const lat = toNumber(raw.latitudeNumeric ?? parseDms(raw.latitude));
  const lon = toNumber(raw.longitudeNumeric ?? parseDms(raw.longitude));
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;

  const wind = Math.max(0, toNumber(raw.intensity));
  const pressure = toNumber(raw.pressure) || 1005;
  const speedKt = Math.round((toNumber(raw.movementSpeed) || 0) * 0.868976);
  const direction = bearingToDirection(toNumber(raw.movementDir) || 0);
  const category = windToCategory(wind);
  const basin = inferBasin(lon);
  const subbasin = inferSubbasin(raw.id, lon);
  const timestamp = raw.lastUpdate ?? new Date().toISOString();

  return {
    id: `live-${raw.id}`,
    sid: raw.id,
    name: raw.name ? `Cyclone ${raw.name}` : "Tropical Disturbance",
    lat,
    lon,
    wind_kt: wind,
    pressure_hpa: pressure,
    movement_direction: direction,
    movement_speed: speedKt,
    timestamp,
    basin,
    subbasin,
    category,
    status: "live",
    season: new Date().getUTCFullYear(),
    source: "NOAA live",
    maxWind: wind,
  };
}

function toLiveTrack(s: Storm): TrackPoint[] {
  return [
    {
      id: `${s.id}-now`,
      timestamp: s.timestamp,
      lat: s.lat,
      lon: s.lon,
      wind_kt: s.wind_kt,
      pressure_hpa: s.pressure_hpa,
      movement_direction: s.movement_direction,
      movement_speed: s.movement_speed,
      source: "NOAA live",
      category: s.category ?? windToCategory(s.wind_kt),
      windSpeed: s.wind_kt,
      pressure: s.pressure_hpa,
      nature: s.category ?? windToCategory(s.wind_kt),
      stormSpeed: s.movement_speed,
      stormDir: 0,
    },
  ];
}

function toLiveObservations(s: Storm): Observation[] {
  return [
    {
      id: `${s.id}-now`,
      timestamp: s.timestamp,
      lat: s.lat,
      lon: s.lon,
      wind_kt: s.wind_kt,
      pressure_hpa: s.pressure_hpa,
      movement_direction: s.movement_direction,
      movement_speed: s.movement_speed,
      distance_to_land_km: 0,
      source: "NOAA live",
      satellite_hint: "ir",
      windSpeed: s.wind_kt,
      pressure: s.pressure_hpa,
      nature: s.category ?? windToCategory(s.wind_kt),
      distanceToLand: 0,
      stormSpeed: s.movement_speed,
      stormDir: 0,
    },
  ];
}

function toNumber(value: string | number | null | undefined): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : Number.NaN;
}

function parseDms(value: string): number {
  const match = /([+-]?\d+(?:\.\d+)?)([NSEW])/i.exec(value ?? "");
  if (!match) return Number.NaN;
  const magnitude = Number(match[1]);
  const dir = match[2].toUpperCase();
  if (dir === "S" || dir === "W") return -magnitude;
  return magnitude;
}

function bearingToDirection(deg: number): string {
  const dirs = [
    "north",
    "north-northeast",
    "northeast",
    "east-northeast",
    "east",
    "east-southeast",
    "southeast",
    "south-southeast",
    "south",
    "south-southwest",
    "southwest",
    "west-southwest",
    "west",
    "west-northwest",
    "northwest",
    "north-northwest",
  ];
  const index = Math.round(((deg % 360) / 22.5)) % 16;
  return dirs[index];
}

function inferBasin(lon: number): string {
  if (lon < -150) return "Central Pacific";
  if (lon < -95) return "East Pacific";
  if (lon < -20) return "Atlantic";
  if (lon > 30 && lon < 130 && lon > 60) return "North Indian Ocean";
  if (lon > 130) return "Northwest Pacific";
  return "Atlantic";
}

function inferSubbasin(id: string, lon: number): string {
  const prefix = (id || "").slice(0, 2).toUpperCase();
  if (prefix === "NI") return "North Indian Ocean";
  if (prefix === "AL") return "Atlantic";
  if (prefix === "EP") return "East Pacific";
  if (prefix === "CP") return "Central Pacific";
  if (lon > 130) return "Northwest Pacific";
  return "Global basin";
}