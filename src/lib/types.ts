export interface Storm {
  id: string;
  sid?: string;
  name: string;
  lat: number;
  lon: number;
  wind_kt: number;
  pressure_hpa: number;
  movement_direction: string;
  movement_speed: number;
  timestamp: string;
  basin?: string;
  subbasin?: string;
  category?: string;
  status?: string;
  season?: number;
  source?: string;
  maxWind?: number;
  endTime?: string;
  startTime?: string;
}

export interface TrackPoint {
  id?: string;
  storm_id?: string;
  timestamp: string;
  lat: number;
  lon: number;
  wind_kt: number;
  pressure_hpa: number;
  movement_direction: string;
  movement_speed: number;
  source?: string;
  category?: string;
  forecast?: boolean;
  windSpeed?: number;
  pressure?: number;
  nature?: string;
  stormSpeed?: number;
  stormDir?: number;
}

export interface Observation {
  id?: string;
  storm_id?: string;
  timestamp: string;
  lat: number;
  lon: number;
  wind_kt: number;
  pressure_hpa: number;
  movement_direction: string;
  movement_speed: number;
  distance_to_land_km: number;
  source?: string;
  satellite_hint?: string;
  windSpeed?: number;
  pressure?: number;
  nature?: string;
  distanceToLand?: number;
  stormSpeed?: number;
  stormDir?: number;
}

export interface SatelliteImage {
  id?: string;
  storm_id?: string;
  source: string;
  timestamp: string;
  image: string;
  url?: string;
  location?: string;
  bounds?: [number, number, number, number];
  channel?: string;
  product?: string;
  resolution?: string;
}

export interface SatelliteAnalysis {
  scores: Record<string, number>;
  dominantPattern: string;
  confidence: number;
  timestamp: string;
}

export interface TrendData {
  windTrend: "increasing" | "decreasing" | "steady" | "rapid_intensification";
  pressureTrend: "increasing" | "decreasing" | "steady";
  windSlope: number;
  pressureSlope: number;
  movementDirection: number;
  speedChange: number;
  overallAssessment: string;
}

export interface Prediction {
  currentStage: string;
  predictedNextStage: string;
  probabilities: Record<string, number>;
  confidence: number;
  timeframe: string;
}

export interface StormDetail {
  storm: Storm;
  track: TrackPoint[];
  observations: Observation[];
  satellite: SatelliteImage[];
  forecast_track?: TrackPoint[];
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  toolCalls?: ToolCall[];
}

export interface ToolCall {
  id: string;
  name: string;
  input: Record<string, unknown>;
  output: string;
  status: "running" | "completed" | "error";
}

export type StormCategory =
  | "LOW"
  | "DEPRESSION"
  | "DEEP_DEPRESSION"
  | "CYCLONE"
  | "SEVERE_CYCLONE"
  | "VERY_SEVERE_CYCLONE"
  | "SUPER_CYCLONE";

export interface StormProvider {
  name: string;
  getStorms(): Promise<Storm[]>;
  getStorm(id: string): Promise<StormDetail | null>;
  getTrack(id: string): Promise<TrackPoint[]>;
  getObservations(id: string): Promise<Observation[]>;
  getSatellite(id: string): Promise<SatelliteImage[]>;
}

export function getCategoryColor(category: string): string {
  const map: Record<string, string> = {
    LOW: "#4B9CD3",
    DEPRESSION: "#5DADE2",
    DEEP_DEPRESSION: "#F4D03F",
    CYCLONE: "#FFA500",
    SEVERE_CYCLONE: "#FF8C00",
    VERY_SEVERE_CYCLONE: "#FF4500",
    SUPER_CYCLONE: "#DC143C",
    TD: "#4B9CD3",
    TS: "#F4D03F",
    CAT1: "#FFA500",
    CAT2: "#FF8C00",
    CAT3: "#FF4500",
    CAT4: "#DC143C",
    CAT5: "#8B0000",
  };
  return map[category] ?? "#808080";
}

export function windToCategory(windKnots: number): string {
  if (windKnots < 17) return "LOW";
  if (windKnots < 28) return "DEPRESSION";
  if (windKnots < 34) return "DEEP_DEPRESSION";
  if (windKnots < 48) return "CYCLONE";
  if (windKnots < 64) return "SEVERE_CYCLONE";
  if (windKnots < 120) return "VERY_SEVERE_CYCLONE";
  return "SUPER_CYCLONE";
}
