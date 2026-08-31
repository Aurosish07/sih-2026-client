import { create } from "zustand";
import type { TrendData, Prediction } from "@/lib/types";
import { fetchJson } from "@/lib/api";

interface PredictionState {
  trend: TrendData | null;
  prediction: Prediction | null;
  isLoading: boolean;
  error: string | null;

  fetchTrend: (stormId: string) => Promise<void>;
  fetchPrediction: (stormId: string) => Promise<void>;
}

export const usePredictionStore = create<PredictionState>((set) => ({
  trend: null,
  prediction: null,
  isLoading: false,
  error: null,

  fetchTrend: async (stormId) => {
    set({ isLoading: true, error: null });
    try {
      const trend = await fetchJson<TrendData>(`/api/predictions/${stormId}/trend`);
      set({ trend, isLoading: false });
    } catch (err) {
      set({ error: (err as Error).message, isLoading: false });
    }
  },

  fetchPrediction: async (stormId) => {
    set({ isLoading: true, error: null });
    try {
      const prediction = await fetchJson<Prediction>(`/api/predictions/${stormId}`);
      set({ prediction, isLoading: false });
    } catch (err) {
      set({ error: (err as Error).message, isLoading: false });
    }
  },
}));
