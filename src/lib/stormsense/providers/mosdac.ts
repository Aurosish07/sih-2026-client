import type { StormProvider } from "@/lib/types";
import { mockProvider } from "./mock";

const MOSDAC_BASE_URL = process.env.MOSDAC_API_URL;

export const mosdacProvider: StormProvider = {
  name: "mosdac",
  async getStorms() {
    return fetchStormList("/storms", mockProvider.getStorms);
  },
  async getStorm(id: string) {
    return fetchStormDetail(`/storms/${id}`, mockProvider.getStorm.bind(mockProvider, id));
  },
  async getTrack(id: string) {
    return fetchJson(`/storms/${id}/track`, mockProvider.getTrack.bind(mockProvider, id));
  },
  async getObservations(id: string) {
    return fetchJson(`/storms/${id}/observations`, mockProvider.getObservations.bind(mockProvider, id));
  },
  async getSatellite(id: string) {
    return fetchJson(`/storms/${id}/satellite`, mockProvider.getSatellite.bind(mockProvider, id));
  },
};

async function fetchJson<T>(path: string, fallback: () => Promise<T>): Promise<T> {
  if (!MOSDAC_BASE_URL) return fallback();
  try {
    const res = await fetch(`${MOSDAC_BASE_URL}${path}`, { cache: "no-store" });
    if (!res.ok) return fallback();
    return (await res.json()) as T;
  } catch {
    return fallback();
  }
}

async function fetchStormList<T>(path: string, fallback: () => Promise<T>): Promise<T> {
  return fetchJson(path, fallback);
}

async function fetchStormDetail<T>(path: string, fallback: () => Promise<T>): Promise<T> {
  return fetchJson(path, fallback);
}
