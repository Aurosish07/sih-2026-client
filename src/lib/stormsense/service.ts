import type { Prediction, StormDetail, TrendData } from "@/lib/types";
import { derivePrediction, deriveTrend } from "./data";
import { getStormProvider } from "./providers";

export async function listStorms() {
  const provider = getStormProvider();
  return provider.getStorms();
}

export async function getStormDetail(id: string): Promise<StormDetail | null> {
  const provider = getStormProvider();
  return provider.getStorm(id);
}

export async function getStormTrack(id: string) {
  const provider = getStormProvider();
  return provider.getTrack(id);
}

export async function getStormObservations(id: string) {
  const provider = getStormProvider();
  return provider.getObservations(id);
}

export async function getStormSatellite(id: string) {
  const provider = getStormProvider();
  return provider.getSatellite(id);
}

export async function getStormTrend(id: string): Promise<TrendData | null> {
  return deriveTrend(id);
}

export async function getStormPrediction(id: string): Promise<Prediction | null> {
  return derivePrediction(id);
}
