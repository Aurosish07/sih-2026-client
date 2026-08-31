import type {
  Observation,
  SatelliteImage,
  TrendData,
  Storm,
  StormDetail,
  TrackPoint,
} from "@/lib/types";
import { windToCategory } from "@/lib/types";
import { additionalStorms } from "./nio_storms";

type FrameKey = "T-2" | "T-1" | "NOW";

type StormSeed = {
  storm: Storm;
  track: TrackPoint[];
  observations: Observation[];
  forecast_track: TrackPoint[];
  bounds: [number, number, number, number];
  source: string;
};

const storms: StormSeed[] = [
  {
    storm: {
      id: "biparjoy-2023",
      sid: "biparjoy-2023",
      name: "Cyclone Biparjoy",
      lat: 21.9,
      lon: 66.7,
      wind_kt: 65,
      pressure_hpa: 975,
      movement_direction: "north-northeast",
      movement_speed: 8,
      timestamp: "2023-06-15T06:00:00Z",
      basin: "North Indian Ocean",
      subbasin: "Arabian Sea",
      category: "VERY_SEVERE_CYCLONE",
      status: "historical",
      season: 2023,
      source: "mock/historical",
      maxWind: 65,
      startTime: "2023-06-06T00:00:00Z",
      endTime: "2023-06-15T12:00:00Z",
    },
    track: [
      makeTrackPoint("2023-06-11T00:00:00Z", 13.2, 67.8, 25, 1000, "west-northwest", 12),
      makeTrackPoint("2023-06-12T00:00:00Z", 15.1, 67.4, 35, 992, "northwest", 10),
      makeTrackPoint("2023-06-13T00:00:00Z", 17.4, 67.0, 45, 984, "north-northwest", 9),
      makeTrackPoint("2023-06-14T00:00:00Z", 19.7, 66.8, 58, 978, "north", 8),
      makeTrackPoint("2023-06-15T06:00:00Z", 21.9, 66.7, 65, 975, "north-northeast", 8),
    ],
    observations: [
      makeObservation("2023-06-14T21:00:00Z", 20.8, 66.9, 61, 977, "north", 8, 120, "ir"),
      makeObservation("2023-06-15T03:00:00Z", 21.4, 66.8, 64, 976, "north-northeast", 8, 95, "vis"),
      makeObservation("2023-06-15T06:00:00Z", 21.9, 66.7, 65, 975, "north-northeast", 8, 60, "ir"),
    ],
    forecast_track: [
      makeTrackPoint("2023-06-15T12:00:00Z", 23.2, 66.8, 62, 977, "north-northeast", 8, true),
      makeTrackPoint("2023-06-15T18:00:00Z", 24.5, 67.0, 55, 981, "north-northeast", 7, true),
      makeTrackPoint("2023-06-16T00:00:00Z", 25.6, 67.2, 45, 987, "north", 6, true),
    ],
    bounds: [13, 66, 26, 68],
    source: "mock/historical",
  },
  {
    storm: {
      id: "remal-2024",
      sid: "remal-2024",
      name: "Cyclone Remal",
      lat: 21.4,
      lon: 88.3,
      wind_kt: 55,
      pressure_hpa: 980,
      movement_direction: "north-northeast",
      movement_speed: 12,
      timestamp: "2024-05-26T06:00:00Z",
      basin: "North Indian Ocean",
      subbasin: "Bay of Bengal",
      category: "SEVERE_CYCLONE",
      status: "historical",
      season: 2024,
      source: "mock/historical",
      maxWind: 55,
      startTime: "2024-05-24T00:00:00Z",
      endTime: "2024-05-27T12:00:00Z",
    },
    track: [
      makeTrackPoint("2024-05-24T06:00:00Z", 15.3, 85.2, 28, 999, "northwest", 10),
      makeTrackPoint("2024-05-24T18:00:00Z", 16.5, 85.8, 34, 994, "north-northwest", 11),
      makeTrackPoint("2024-05-25T06:00:00Z", 18.0, 86.7, 42, 989, "north", 12),
      makeTrackPoint("2024-05-26T00:00:00Z", 20.1, 87.8, 50, 983, "north-northeast", 12),
      makeTrackPoint("2024-05-26T06:00:00Z", 21.4, 88.3, 55, 980, "north-northeast", 12),
    ],
    observations: [
      makeObservation("2024-05-25T18:00:00Z", 19.3, 87.1, 47, 985, "north", 12, 140, "ir"),
      makeObservation("2024-05-26T03:00:00Z", 20.8, 88.0, 53, 981, "north-northeast", 12, 90, "ir"),
      makeObservation("2024-05-26T06:00:00Z", 21.4, 88.3, 55, 980, "north-northeast", 12, 55, "vis"),
    ],
    forecast_track: [
      makeTrackPoint("2024-05-26T12:00:00Z", 22.4, 89.0, 53, 982, "north-northeast", 11, true),
      makeTrackPoint("2024-05-26T18:00:00Z", 23.0, 89.8, 48, 986, "north-northeast", 10, true),
      makeTrackPoint("2024-05-27T00:00:00Z", 23.6, 90.5, 42, 990, "north-northeast", 9, true),
    ],
    bounds: [15, 84.5, 24, 91],
    source: "mock/historical",
  },
  {
    storm: {
      id: "asna-2024",
      sid: "asna-2024",
      name: "Cyclone Asna",
      lat: 17.2,
      lon: 60.8,
      wind_kt: 40,
      pressure_hpa: 988,
      movement_direction: "west-northwest",
      movement_speed: 9,
      timestamp: "2024-08-31T00:00:00Z",
      basin: "North Indian Ocean",
      subbasin: "Arabian Sea",
      category: "CYCLONE",
      status: "historical",
      season: 2024,
      source: "mock/historical",
      maxWind: 40,
      startTime: "2024-08-27T00:00:00Z",
      endTime: "2024-08-31T12:00:00Z",
    },
    track: [
      makeTrackPoint("2024-08-27T18:00:00Z", 14.6, 64.5, 20, 1002, "west", 10),
      makeTrackPoint("2024-08-28T18:00:00Z", 15.4, 63.2, 28, 998, "west-northwest", 10),
      makeTrackPoint("2024-08-29T18:00:00Z", 16.3, 61.9, 35, 992, "west-northwest", 9),
      makeTrackPoint("2024-08-31T00:00:00Z", 17.2, 60.8, 40, 988, "west-northwest", 9),
    ],
    observations: [
      makeObservation("2024-08-30T12:00:00Z", 16.7, 61.4, 37, 990, "west-northwest", 9, 180, "ir"),
      makeObservation("2024-08-31T00:00:00Z", 17.2, 60.8, 40, 988, "west-northwest", 9, 145, "vis"),
    ],
    forecast_track: [
      makeTrackPoint("2024-08-31T06:00:00Z", 17.6, 60.0, 38, 989, "west-northwest", 9, true),
      makeTrackPoint("2024-08-31T12:00:00Z", 18.0, 59.2, 32, 993, "west", 8, true),
      makeTrackPoint("2024-08-31T18:00:00Z", 18.4, 58.5, 26, 997, "west", 8, true),
    ],
    bounds: [14, 58, 19, 65],
    source: "mock/historical",
  },
];

const allStorms: typeof storms = [...storms, ...additionalStorms];

export function getMockStorms(): Storm[] {
  return allStorms
    .map((entry) => ({
      ...entry.storm,
      sid: entry.storm.id,
      maxWind: entry.storm.wind_kt,
    }))
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export function getMockStorm(id: string): StormDetail | null {
  const entry = allStorms.find((storm) => storm.storm.id === id);
  if (!entry) return null;

  return {
    storm: {
      ...entry.storm,
      sid: entry.storm.id,
      maxWind: entry.storm.wind_kt,
    },
    track: entry.track.map(normalizeTrackPoint),
    observations: entry.observations.map(normalizeObservation),
    satellite: buildSatelliteTimeline(entry),
    forecast_track: entry.forecast_track.map(normalizeTrackPoint),
  };
}

export function getMockTrack(id: string): TrackPoint[] {
  return getMockStorm(id)?.track ?? [];
}

export function getMockObservations(id: string): Observation[] {
  return getMockStorm(id)?.observations ?? [];
}

export function getMockSatellite(id: string): SatelliteImage[] {
  return getMockStorm(id)?.satellite ?? [];
}

export function getMockForecastTrack(id: string): TrackPoint[] {
  return getMockStorm(id)?.forecast_track ?? [];
}

export function getMockProviderName() {
  return "mock/historical";
}

export function deriveTrend(stormId: string): TrendData | null {
  const track = getMockTrack(stormId);
  if (track.length < 2) {
    return null;
  }

  const first = track[0];
  const last = track[track.length - 1];
  const previous = track[track.length - 2];
  const windSlope = last.wind_kt - first.wind_kt;
  const pressureSlope = first.pressure_hpa - last.pressure_hpa;
  const speedChange = last.movement_speed - previous.movement_speed;

  return {
    windTrend:
      windSlope > 12
        ? "rapid_intensification"
        : windSlope > 0
          ? "increasing"
          : windSlope < 0
            ? "decreasing"
            : "steady",
    pressureTrend:
      pressureSlope > 0 ? "decreasing" : pressureSlope < 0 ? "increasing" : "steady",
    windSlope,
    pressureSlope,
    movementDirection: movementBearing(last.movement_direction),
    speedChange,
    overallAssessment:
      windSlope > 8 && pressureSlope > 6
        ? "strengthening"
        : windSlope < -5 || pressureSlope < -5
          ? "weakening"
          : "steady",
  } as TrendData;
}

export function derivePrediction(stormId: string) {
  const storm = getMockStorm(stormId);
  if (!storm) return null;
  const trend = deriveTrend(stormId);
  const currentStage = storm.storm.category ?? windToCategory(storm.storm.wind_kt);
  const predictedNextStage =
    storm.storm.wind_kt >= 55
      ? "VERY_SEVERE_CYCLONE"
      : storm.storm.wind_kt >= 40
        ? "SEVERE_CYCLONE"
        : storm.storm.wind_kt >= 28
          ? "CYCLONE"
          : "DEEP_DEPRESSION";

  return {
    currentStage,
    predictedNextStage,
    probabilities: {
      LOW: storm.storm.wind_kt < 17 ? 0.15 : 0.02,
      DEPRESSION: storm.storm.wind_kt < 28 ? 0.24 : 0.08,
      DEEP_DEPRESSION: storm.storm.wind_kt < 34 ? 0.2 : 0.12,
      CYCLONE: storm.storm.wind_kt < 48 ? 0.18 : 0.18,
      SEVERE_CYCLONE: storm.storm.wind_kt >= 40 ? 0.2 : 0.15,
      VERY_SEVERE_CYCLONE: storm.storm.wind_kt >= 55 ? 0.18 : 0.08,
      SUPER_CYCLONE: storm.storm.wind_kt >= 90 ? 0.1 : 0.02,
    },
    confidence: trend?.windTrend === "rapid_intensification" ? 0.88 : 0.71,
    timeframe: "Next 12-24 hours",
  };
}

function makeTrackPoint(
  timestamp: string,
  lat: number,
  lon: number,
  wind_kt: number,
  pressure_hpa: number,
  movement_direction: string,
  movement_speed: number,
  forecast = false,
): TrackPoint {
  return {
    id: `${timestamp}-${lat}-${lon}`,
    timestamp,
    lat,
    lon,
    wind_kt,
    pressure_hpa,
    movement_direction,
    movement_speed,
    source: "mock/historical",
    category: windToCategory(wind_kt),
    forecast,
    windSpeed: wind_kt,
    pressure: pressure_hpa,
    nature: windToCategory(wind_kt),
    stormSpeed: movement_speed,
    stormDir: movementBearing(movement_direction),
  };
}

function makeObservation(
  timestamp: string,
  lat: number,
  lon: number,
  wind_kt: number,
  pressure_hpa: number,
  movement_direction: string,
  movement_speed: number,
  distance_to_land_km: number,
  satellite_hint: string,
): Observation {
  return {
    id: `${timestamp}-${lat}-${lon}`,
    timestamp,
    lat,
    lon,
    wind_kt,
    pressure_hpa,
    movement_direction,
    movement_speed,
    distance_to_land_km,
    source: "mock/historical",
    satellite_hint,
    windSpeed: wind_kt,
    pressure: pressure_hpa,
    nature: windToCategory(wind_kt),
    distanceToLand: distance_to_land_km,
    stormSpeed: movement_speed,
    stormDir: movementBearing(movement_direction),
  };
}

function normalizeTrackPoint(point: TrackPoint): TrackPoint {
  return {
    ...point,
    windSpeed: point.windSpeed ?? point.wind_kt,
    pressure: point.pressure ?? point.pressure_hpa,
    nature: point.nature ?? point.category ?? windToCategory(point.wind_kt),
    stormSpeed: point.stormSpeed ?? point.movement_speed,
    stormDir: point.stormDir ?? movementBearing(point.movement_direction),
  };
}

function normalizeObservation(observation: Observation): Observation {
  return {
    ...observation,
    windSpeed: observation.windSpeed ?? observation.wind_kt,
    pressure: observation.pressure ?? observation.pressure_hpa,
    nature: observation.nature ?? windToCategory(observation.wind_kt),
    distanceToLand: observation.distanceToLand ?? observation.distance_to_land_km,
    stormSpeed: observation.stormSpeed ?? observation.movement_speed,
    stormDir: observation.stormDir ?? movementBearing(observation.movement_direction),
  };
}

function buildSatelliteTimeline(entry: StormSeed): SatelliteImage[] {
  const frames: FrameKey[] = ["T-2", "T-1", "NOW"];
  const selectedPoints = [
    entry.track[Math.max(0, entry.track.length - 3)],
    entry.track[Math.max(0, entry.track.length - 2)],
    entry.track[entry.track.length - 1],
  ];

  return frames.map((frame, index) => {
    const point = selectedPoints[index] ?? entry.track[entry.track.length - 1];
    const timestamp = point.timestamp;
    return {
      id: `${entry.storm.id}-${frame.toLowerCase()}`,
      storm_id: entry.storm.id,
      source: index === 2 ? "mock-nowcast" : "mock-history",
      timestamp,
      image: makeStormSvgDataUrl({
        name: entry.storm.name,
        frame,
        source: index === 2 ? "mock-nowcast" : "mock-history",
        timestamp,
        lat: point.lat,
        lon: point.lon,
        wind: point.wind_kt,
        pressure: point.pressure_hpa,
        category: point.category ?? windToCategory(point.wind_kt),
      }),
      url: undefined,
      location: `${Math.abs(point.lat).toFixed(1)}${point.lat >= 0 ? "N" : "S"}, ${Math.abs(point.lon).toFixed(1)}${point.lon >= 0 ? "E" : "W"}`,
      bounds: entry.bounds,
      channel: index === 2 ? "IR/Enhanced" : "Visible",
      product: "Cyclone convective cloud-top composite",
      resolution: "2 km",
    };
  });
}

function makeStormSvgDataUrl(input: {
  name: string;
  frame: FrameKey;
  source: string;
  timestamp: string;
  lat: number;
  lon: number;
  wind: number;
  pressure: number;
  category: string;
}): string {
  const accent =
    input.category === "SUPER_CYCLONE"
      ? "#b91c1c"
      : input.category === "VERY_SEVERE_CYCLONE"
        ? "#ea580c"
        : input.category === "SEVERE_CYCLONE"
          ? "#f97316"
          : "#0ea5e9";

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720">
      <defs>
        <radialGradient id="glow" cx="50%" cy="45%" r="60%">
          <stop offset="0%" stop-color="#eafff0" stop-opacity="0.95" />
          <stop offset="45%" stop-color="#66d77a" stop-opacity="0.85" />
          <stop offset="80%" stop-color="#1f5c2b" stop-opacity="0.72" />
          <stop offset="100%" stop-color="#0b2e13" stop-opacity="0.95" />
        </radialGradient>
        <radialGradient id="band" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#052e12" stop-opacity="0" />
          <stop offset="60%" stop-color="#1e5d2a" stop-opacity="0.6" />
          <stop offset="100%" stop-color="#0a2812" stop-opacity="0.9" />
        </radialGradient>
        <linearGradient id="haze" x1="0%" x2="100%" y1="0%" y2="100%">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="0.06" />
          <stop offset="100%" stop-color="#ddffe0" stop-opacity="0.02" />
        </linearGradient>
      </defs>
      <rect width="1280" height="720" fill="#08210c" />
      <rect width="1280" height="720" fill="url(#haze)" />
      <circle cx="640" cy="360" r="280" fill="url(#band)" />
      <circle cx="640" cy="360" r="250" fill="url(#glow)" />
      <g fill="none" stroke="#9dffad" stroke-opacity="0.28" stroke-width="2">
        <circle cx="640" cy="360" r="80" />
        <circle cx="640" cy="360" r="150" />
        <circle cx="640" cy="360" r="220" />
      </g>
      <g fill="none" stroke="#2f8f40" stroke-opacity="0.5" stroke-width="6" stroke-linecap="round">
        <path d="M 520 200 Q 600 150 700 190" />
        <path d="M 500 430 Q 620 500 760 440" />
        <path d="M 330 320 Q 400 420 460 520" />
        <path d="M 940 300 Q 880 400 840 500" />
      </g>
      <g fill="#eafff0" fill-opacity="0.92" font-family="Inter, Arial, sans-serif">
        <text x="64" y="96" font-size="44" font-weight="700">${escapeXml(input.name)}</text>
        <text x="64" y="146" font-size="24" fill="#c6f5d0">${input.frame} • ${escapeXml(input.source)}</text>
        <text x="64" y="190" font-size="22" fill="#c6f5d0">${new Date(input.timestamp).toUTCString()}</text>
        <text x="64" y="610" font-size="24">Lat ${input.lat.toFixed(1)}°  Lon ${input.lon.toFixed(1)}°</text>
        <text x="64" y="654" font-size="24">Wind ${Math.round(input.wind)} kt  Pressure ${Math.round(input.pressure)} hPa</text>
        <text x="64" y="698" font-size="24">Category ${escapeXml(input.category)}</text>
      </g>
      <g fill="#d7ffe0" fill-opacity="0.6" font-family="Inter, Arial, sans-serif">
        <text x="1060" y="92" font-size="20" text-anchor="end">StormSense Satellite — GREEN IR</text>
        <text x="1060" y="120" font-size="18" text-anchor="end">Common format preview</text>
      </g>
      <circle cx="940" cy="230" r="18" fill="#ffffff" fill-opacity="0.85" />
      <circle cx="940" cy="230" r="42" fill="none" stroke="#eafff0" stroke-opacity="0.4" stroke-width="6" />
      <circle cx="940" cy="230" r="76" fill="none" stroke="${accent}" stroke-opacity="0.4" stroke-width="4" />
    </svg>
  `;

  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function movementBearing(direction: string): number {
  const normalized = direction.toLowerCase();
  if (normalized.includes("north-northeast")) return 22;
  if (normalized.includes("northeast")) return 45;
  if (normalized.includes("east-northeast")) return 68;
  if (normalized.includes("east")) return 90;
  if (normalized.includes("east-southeast")) return 112;
  if (normalized.includes("southeast")) return 135;
  if (normalized.includes("south-southeast")) return 158;
  if (normalized.includes("south")) return 180;
  if (normalized.includes("south-southwest")) return 202;
  if (normalized.includes("southwest")) return 225;
  if (normalized.includes("west-southwest")) return 248;
  if (normalized.includes("west")) return 270;
  if (normalized.includes("west-northwest")) return 292;
  if (normalized.includes("northwest")) return 315;
  if (normalized.includes("north-northwest")) return 338;
  if (normalized.includes("north")) return 0;
  return 0;
}
