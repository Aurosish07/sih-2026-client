import { create } from "zustand";
import type { SatelliteImage, SatelliteAnalysis } from "@/lib/types";
import { fetchSatelliteImages, fetchSatelliteAnalysis } from "@/lib/api";

interface SatelliteState {
  images: SatelliteImage[];
  analysis: SatelliteAnalysis | null;
  isLoading: boolean;
  error: string | null;

  fetchImages: (stormId: string) => Promise<void>;
  fetchAnalysis: (stormId: string) => Promise<void>;
  setAnalysis: (analysis: SatelliteAnalysis) => void;
  clearAnalysis: () => void;
}

export const useSatelliteStore = create<SatelliteState>((set) => ({
  images: [],
  analysis: null,
  isLoading: false,
  error: null,

  fetchImages: async (stormId) => {
    set({ isLoading: true, error: null });
    try {
      const images = await fetchSatelliteImages(stormId);
      set({ images, isLoading: false });
    } catch (err) {
      set({ error: (err as Error).message, isLoading: false });
    }
  },

  fetchAnalysis: async (stormId) => {
    try {
      const analysis = await fetchSatelliteAnalysis(stormId);
      set({ analysis });
    } catch (err) {
      set({ error: (err as Error).message });
    }
  },

  setAnalysis: (analysis) => set({ analysis }),

  clearAnalysis: () => set({ analysis: null }),
}));
