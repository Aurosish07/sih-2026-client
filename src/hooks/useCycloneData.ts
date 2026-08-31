"use client";

import { useEffect, useRef, useCallback } from "react";
import { useCycloneStore } from "@/stores/cycloneStore";

export function useCycloneData() {
  const { fetchStorms, fetchTrack, fetchObservations, activeStorm } =
    useCycloneStore();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const startPolling = useCallback(
    (stormId: string, intervalMs = 60_000) => {
      stopPolling();
      fetchTrack(stormId);
      fetchObservations(stormId);
      intervalRef.current = setInterval(() => {
        fetchTrack(stormId);
        fetchObservations(stormId);
      }, intervalMs);
    },
    [fetchObservations, fetchTrack, stopPolling],
  );

  useEffect(() => {
    return () => stopPolling();
  }, [stopPolling]);

  useEffect(() => {
    fetchStorms();
  }, [fetchStorms]);

  useEffect(() => {
    if (activeStorm) {
      startPolling(activeStorm.id);
    } else {
      stopPolling();
    }
  }, [activeStorm, startPolling, stopPolling]);

  return { startPolling, stopPolling };
}
