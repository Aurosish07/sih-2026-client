export interface LivePosition {
  lat: number;
  lon: number;
}

export interface LiveTrackPoint {
  timestamp: string;
  lat: number;
  lon: number;
  wind_kt: number | null;
  pressure_hpa: number | null;
  category?: string;
}

export interface LiveConeCircle {
  timestamp: string;
  lat: number;
  lon: number;
  radiusKm: number;
}

export interface LiveForecastPoint {
  timestamp: string;
  lat: number;
  lon: number;
  wind_kt: number | null;
  category?: string;
}

/**
 * Aggregated payload for the /live cyclone monitoring page.
 * Fields that are not available from the real source are simply
 * omitted / null and the UI renders only what exists.
 */
export interface LiveMonitoringData {
  active: boolean;
  cycloneName: string | null;
  basin: string | null;
  status: string | null;
  intensity: string | null;
  /** ISO timestamp of the cyclone's latest advisory / position fix */
  lastCycloneUpdate: string | null;
  /** ISO timestamp of when this response was assembled */
  serverTime: string;
  currentPosition: LivePosition | null;
  windSpeed: number | null;
  pressure: number | null;
  movementDirection: string | null;
  movementSpeed: number | null;
  historicalTrack: LiveTrackPoint[];
  forecastTrack: LiveForecastPoint[];
  forecastTimes: string[];
  uncertaintyCone: LiveConeCircle[] | null;
  satellite: {
    label: string;
    source: string;
    lastUpdate: string | null;
  };
  forecastSource: string | null;
  error: {
    cyclone: string | null;
    satellite: string | null;
  };
}
