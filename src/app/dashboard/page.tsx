"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useCycloneStore } from "@/stores/cycloneStore";
import { usePredictionStore } from "@/stores/predictionStore";
import StormCard from "@/components/dashboard/StormCard";
import TrendChart from "@/components/dashboard/TrendChart";
import ForecastPanel from "@/components/dashboard/ForecastPanel";

export default function DashboardPage() {
  const {
    activeStorm,
    stormList,
    track,
    observations,
    isLoading,
    setActiveStorm,
    fetchStorms,
    fetchTrack,
    fetchObservations,
  } = useCycloneStore();

  const { trend, prediction, fetchTrend, fetchPrediction } =
    usePredictionStore();

  useEffect(() => {
    fetchStorms();
  }, [fetchStorms]);

  useEffect(() => {
    if (activeStorm) {
      fetchTrack(activeStorm.id);
      fetchObservations(activeStorm.id);
      fetchTrend(activeStorm.id);
      fetchPrediction(activeStorm.id);
    }
  }, [activeStorm, fetchTrack, fetchObservations, fetchTrend, fetchPrediction]);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Nav */}
      <nav className="border-b border-slate-200 bg-white/70 px-6 py-3 backdrop-blur">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/" className="text-xl hover:opacity-80">
              🌀
            </Link>
            <Link href="/" className="font-bold text-slate-900 hover:opacity-80">
              CycloneGPT
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="text-sm text-orange-600 font-medium"
            >
              Dashboard
            </Link>
            <Link
              href="/monitor"
              className="text-sm text-slate-500 hover:text-slate-900 transition-colors"
            >
              Monitor
            </Link>
            <Link
              href="/chat"
              className="text-sm text-slate-500 hover:text-slate-900 transition-colors"
            >
              Chat
            </Link>
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Sidebar - Storm List */}
          <div className="lg:col-span-3 space-y-3">
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
              Storms {stormList.length > 0 && `(${stormList.length})`}
            </h2>
            {isLoading && stormList.length === 0 ? (
              <div className="space-y-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="h-24 rounded-lg bg-slate-200 animate-pulse"
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-2 max-h-[calc(100vh-200px)] overflow-y-auto">
                {stormList.map((storm) => (
                  <StormCard
                    key={storm.id}
                    storm={storm}
                    isActive={activeStorm?.id === storm.id}
                    onClick={() => setActiveStorm(storm)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Main Content */}
          <div className="lg:col-span-9 space-y-6">
            {activeStorm ? (
              <>
                {/* Storm Header */}
                <div className="rounded-lg bg-white border border-slate-200 p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <h1 className="text-xl font-bold text-slate-900">
                        {activeStorm.name}
                      </h1>
                      <p className="text-sm text-slate-500">
                        {activeStorm.subbasin ?? activeStorm.basin ?? "North Indian Ocean"} &middot; {activeStorm.season ?? "N/A"} &middot;{" "}
                        {observations.length > 0 && (
                          <>
                            Latest: {Math.round(observations[observations.length - 1].wind_kt ?? observations[observations.length - 1].windSpeed ?? 0)} kt
                            / {Math.round(observations[observations.length - 1].pressure_hpa ?? observations[observations.length - 1].pressure ?? 0)} hPa
                          </>
                        )}
                      </p>
                    </div>
                    <Link
                      href={`/monitor?storm=${activeStorm.id}`}
                      className="text-xs px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200 border border-slate-300 transition-colors"
                    >
                      Open in Monitor
                    </Link>
                  </div>
                </div>

                {/* Trend Chart */}
                <div className="rounded-lg bg-white border border-slate-200 p-4 shadow-sm">
                  <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
                    Wind & Pressure Trend
                  </h3>
                  <TrendChart track={track} />
                </div>

                {/* Forecast */}
                <ForecastPanel
                  prediction={prediction}
                  trend={trend}
                  isLoading={false}
                />
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-96 text-center">
                <div className="text-4xl mb-4">🌀</div>
                <h2 className="text-lg font-semibold text-slate-900 mb-2">
                  Select a Cyclone
                </h2>
                <p className="text-sm text-slate-500 max-w-sm">
                  Choose a storm from the sidebar to view its track, satellite
                  analysis, trends, and predictions.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
