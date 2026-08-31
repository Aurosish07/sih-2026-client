import type { StormProvider } from "@/lib/types";
import { imdProvider } from "./imd";
import { mockProvider } from "./mock";
import { mosdacProvider } from "./mosdac";
import { noaaProvider } from "./noaa";

export function getStormProvider(): StormProvider {
  const provider = (process.env.STORMSENSE_PROVIDER ?? "noaa").toLowerCase();
  if (provider === "mosdac") return mosdacProvider;
  if (provider === "imd") return imdProvider;
  if (provider === "noaa") return noaaProvider;
  return mockProvider;
}

export async function withFallback<T>(
  live: () => Promise<T>,
  fallback: () => Promise<T>,
): Promise<T> {
  try {
    return await live();
  } catch {
    return fallback();
  }
}