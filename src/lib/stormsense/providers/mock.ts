import type { StormProvider } from "@/lib/types";
import {
  derivePrediction,
  deriveTrend,
  getMockObservations,
  getMockSatellite,
  getMockStorm,
  getMockStorms,
  getMockTrack,
} from "../data";

export const mockProvider: StormProvider = {
  name: "mock/historical",
  async getStorms() {
    return getMockStorms();
  },
  async getStorm(id: string) {
    return getMockStorm(id);
  },
  async getTrack(id: string) {
    return getMockTrack(id);
  },
  async getObservations(id: string) {
    return getMockObservations(id);
  },
  async getSatellite(id: string) {
    return getMockSatellite(id);
  },
};

export async function getMockTrend(stormId: string) {
  return deriveTrend(stormId);
}

export async function getMockPrediction(stormId: string) {
  return derivePrediction(stormId);
}
