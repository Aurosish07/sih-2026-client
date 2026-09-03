"use client";

import Link from "next/link";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import CycloneMapWrapper from "@/components/map/CycloneMapWrapper";
import type { BasemapKind } from "@/components/map/CycloneMap";
import { fetchStorm } from "@/lib/api";
import { categoryLabel, formatCoord, formatDateTime, formatPressure, formatWind, trendArrow, windToKmh } from "@/lib/formatters";
import { getCategoryColor, type Storm, type TrackPoint, type Observation, windToCategory } from "@/lib/types";
import { useCycloneStore } from "@/stores/cycloneStore";
import { usePredictionStore } from "@/stores/predictionStore";

const SIDEBAR_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: "◫" },
  { href: "/monitor", label: "Monitor", icon: "◎" },
  { href: "/live", label: "Live", icon: "●" },
  { href: "/chat", label: "AI", icon: "◇" },
  { href: "/", label: "Storms", icon: "◌" },
];

const LAYER_ITEMS: { id: BasemapKind; label: string; color: string }[] = [
  { id: "satellite", label: "Esri Satellite", color: "#6366f1" },
  { id: "streets", label: "Streets", color: "#10b981" },
  { id: "dark", label: "Dark Basemap", color: "#06b6d4" },
] as const;

function toTrackPoints(track: TrackPoint[], observations: Observation[]): TrackPoint[] {
  if (track.length > 0) return track;
  return observations.map((o) => ({
    timestamp: o.timestamp, lat: o.lat, lon: o.lon, wind_kt: o.wind_kt,
    pressure_hpa: o.pressure_hpa, movement_direction: o.movement_direction,
    movement_speed: o.movement_speed, source: o.source,
    category: o.nature ?? o.satellite_hint,
  }));
}

function trendLabel(value?: string | null): string {
  if (!value) return "Steady";
  if (value === "rapid_intensification") return "Strengthening";
  if (value === "increasing") return "Strengthening";
  if (value === "decreasing") return "Weakening";
  return value.split("_").map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(" ");
}

function utcNowLabel(): string {
  return `${new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit", minute: "2-digit", second: "2-digit",
    hour12: false, timeZone: "UTC",
  }).format(new Date())} UTC`;
}

function timelineLabel(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit", month: "2-digit", hour: "2-digit",
    minute: "2-digit", hour12: false, timeZone: "UTC",
  }).format(new Date(iso));
}

function getStormCategory(storm: Storm | null): string {
  if (!storm) return "LOW";
  return storm.category ?? windToCategory(storm.wind_kt ?? storm.maxWind ?? 0);
}

export default function Home() {
  return (
    <Suspense fallback={null}>
      <HomeContent />
    </Suspense>
  );
}

function HomeContent() {
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);
  const [activeLayer, setActiveLayer] = useState<BasemapKind>("satellite");
  const [liveMode, setLiveMode] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [forecastTrack, setForecastTrack] = useState<TrackPoint[]>([]);

  useEffect(() => { setMounted(true); }, []);

  const { activeStorm, stormList, track, observations, isLoading, error, setActiveStorm, fetchStorms, fetchTrack, fetchObservations } = useCycloneStore();
  const { trend, prediction, fetchTrend, fetchPrediction } = usePredictionStore();

  useEffect(() => { fetchStorms(); }, [fetchStorms]);

  useEffect(() => {
    const stormId = searchParams.get("storm");
    if (!stormId) return;
    const selected = stormList.find((s) => s.id === stormId);
    if (selected && selected.id !== activeStorm?.id) setActiveStorm(selected);
  }, [activeStorm?.id, searchParams, setActiveStorm, stormList]);

  useEffect(() => {
    if (!activeStorm) return;
    fetchTrack(activeStorm.id);
    fetchObservations(activeStorm.id);
    fetchTrend(activeStorm.id);
    fetchPrediction(activeStorm.id);
    fetchStorm(activeStorm.id).then((d) => setForecastTrack(d.forecast_track ?? [])).catch(() => setForecastTrack([]));
  }, [activeStorm, fetchObservations, fetchPrediction, fetchTrack, fetchTrend]);

  const timeline = useMemo(() => toTrackPoints(track, observations), [observations, track]);
  const latestPoint = timeline[timeline.length - 1] ?? null;
  const category = getStormCategory(activeStorm);
  const categoryColor = getCategoryColor(category);
  const stormWind = latestPoint?.wind_kt ?? activeStorm?.wind_kt ?? activeStorm?.maxWind ?? 0;
  const stormPressure = latestPoint?.pressure_hpa ?? activeStorm?.pressure_hpa ?? 0;
  const stormHeading = activeStorm?.movement_direction ?? latestPoint?.movement_direction ?? "—";
  const stormHeadingSpeed = activeStorm?.movement_speed ?? latestPoint?.movement_speed ?? 0;
  const trendStatus = trendLabel(trend?.windTrend);
  const predictionStatus = prediction ? `${prediction.currentStage} → ${prediction.predictedNextStage}` : "Model warming up";
  const timelineSlices = timeline.slice(-9);

  const topMetrics = [
    { label: "Storm", value: activeStorm?.name ?? "Waiting for feed", color: "#6366f1" },
    { label: "Category", value: categoryLabel(category), color: "#f43f5e" },
    { label: "MSW", value: `${formatWind(stormWind)} (${windToKmh(stormWind)} km/h)`, color: "#06b6d4" },
    { label: "Heading", value: `${stormHeading} (${Math.round(stormHeadingSpeed)} kt)`, color: "#10b981" },
    { label: "Trend", value: `${trendArrow(trend?.windTrend ?? "steady")} ${trendStatus}`, color: trend?.windTrend === "decreasing" ? "#06b6d4" : "#f59e0b" },
  ];

  return (
    <div className="min-h-screen overflow-hidden" style={{ background: "linear-gradient(135deg, #eef0f8 0%, #f0f2f7 50%, #edf0f8 100%)" }}>
      {/* Funky background blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full opacity-20" style={{ background: "radial-gradient(circle, #6366f1, transparent)" }} />
        <div className="absolute -top-20 right-0 h-80 w-80 rounded-full opacity-10" style={{ background: "radial-gradient(circle, #f59e0b, transparent)" }} />
        <div className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full opacity-10" style={{ background: "radial-gradient(circle, #10b981, transparent)" }} />
      </div>

      <div className="relative flex min-h-screen flex-col gap-3 px-2 py-2">
        {/* Header */}
        <header className="rounded-2xl border px-4 py-3 shadow-lg" style={{ background: "#ffffff", borderColor: "#e4e8f0", boxShadow: "0 4px 20px rgba(99,102,241,0.1)" }}>
          <div className="grid gap-3 lg:grid-cols-[auto_minmax(0,1fr)_auto] lg:items-center">
            {/* Brand */}
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl text-white text-lg shadow-lg" style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
                ◉
              </div>
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.3em]" style={{ color: "#6366f1" }}>
                  StormSense AI
                </div>
                <div className="text-sm" style={{ color: "#5a6380" }}>
                  North Indian Ocean cyclone operations
                </div>
              </div>
            </div>

            {/* Metrics */}
            <div className="grid gap-2 xl:grid-cols-5">
              {topMetrics.map((m) => (
                <div key={m.label} className="rounded-xl border px-3 py-2" style={{ background: "#f8f9ff", borderColor: "#e4e8f0", borderLeft: `3px solid ${m.color}` }}>
                  <div className="text-[10px] font-medium uppercase tracking-[0.25em]" style={{ color: "#8b95b0" }}>{m.label}</div>
                  <div className="mt-1 text-sm font-semibold" style={{ color: m.color }}>{m.value}</div>
                </div>
              ))}
            </div>

            {/* Controls */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <label className="flex items-center gap-2 rounded-full border px-3 py-1.5 cursor-pointer" style={{ background: "#f4f6fb", borderColor: "#e4e8f0" }}>
                <span className="text-[10px] font-medium uppercase tracking-[0.2em]" style={{ color: "#8b95b0" }}>Storm</span>
                <select
                  value={activeStorm?.id ?? ""}
                  onChange={(e) => { const n = stormList.find((s) => s.id === e.target.value); if (n) setActiveStorm(n); }}
                  className="max-w-[140px] cursor-pointer bg-transparent text-xs outline-none"
                  style={{ color: "#1a2035" }}
                >
                  <option value="" disabled>{stormList.length} active</option>
                  {stormList.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </label>

              <button
                type="button"
                onClick={() => setLiveMode((v) => !v)}
                className="flex items-center gap-2 rounded-full border px-3 py-1.5 transition-all"
                style={liveMode ? { background: "#ecfdf5", borderColor: "#6ee7b7", color: "#059669" } : { background: "#f4f6fb", borderColor: "#e4e8f0", color: "#8b95b0" }}
                title="Toggle live map footage"
              >
                <span className="h-2 w-2 rounded-full pulse-live" style={{ background: liveMode ? "#10b981" : "#c4c9dc" }} />
                <span className="text-[10px] font-medium uppercase tracking-[0.2em]">Live {liveMode ? "ON" : "OFF"}</span>
              </button>

              <div className="rounded-full border px-3 py-1.5 text-[10px] font-medium" style={{ background: "#f4f6fb", borderColor: "#e4e8f0", color: "#5a6380" }}>
                {mounted ? utcNowLabel() : "—"}
              </div>
              <div className="rounded-full border px-3 py-1.5 text-[10px] font-medium max-w-[200px] truncate" style={{ background: "#fef9f0", borderColor: "#fed7aa", color: "#92400e" }}>
                {predictionStatus}
              </div>
            </div>
          </div>
        </header>

        {/* Body */}
        <div className="grid flex-1 gap-3 lg:grid-cols-[72px_minmax(0,1fr)_276px]">

          {/* Sidebar */}
          <aside className="hidden flex-col items-center gap-4 rounded-2xl border py-4 shadow-sm lg:flex" style={{ background: "#ffffff", borderColor: "#e4e8f0" }}>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl text-white text-base shadow" style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>◉</div>
            <div className="h-px w-8" style={{ background: "#e4e8f0" }} />
            {SIDEBAR_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group flex h-11 w-11 items-center justify-center rounded-xl border text-sm transition-all hover:scale-105"
                style={{ background: "#f4f6fb", borderColor: "#e4e8f0", color: "#5a6380" }}
                title={item.label}
              >
                <span className="transition group-hover:scale-110">{item.icon}</span>
              </Link>
            ))}
            <div className="mt-auto flex flex-col items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.25em]" style={{ color: "#10b981" }}>
              <div className="h-2 w-2 rounded-full pulse-live" style={{ background: "#10b981" }} />
              live
            </div>
          </aside>

          {/* Map */}
          <section className="relative min-h-[calc(100vh-180px)] overflow-hidden rounded-2xl border shadow-lg" style={{ borderColor: "#e4e8f0", background: "#081018" }}>
            <div className="absolute inset-0">
              {activeStorm ? (
                <CycloneMapWrapper
                  className="h-full min-h-[calc(100vh-180px)] rounded-none border-0 bg-transparent shadow-none"
                  storm={activeStorm} track={timeline} forecastTrack={forecastTrack}
                  storms={stormList} hideOverlays basemap={activeLayer}
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <div className="rounded-2xl border px-6 py-5 text-center backdrop-blur-xl" style={{ background: "rgba(255,255,255,0.08)", borderColor: "rgba(255,255,255,0.12)" }}>
                    <div className="text-sm text-white/70">Loading cyclone feed...</div>
                    <div className="mt-2 text-xs text-white/40">Building the storm console</div>
                  </div>
                </div>
              )}
            </div>

            {/* Overlay gradient */}
            <div className="pointer-events-none absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(2,6,23,0.05) 0%, rgba(2,6,23,0.25) 100%)" }} />

            {/* Storm info card */}
            <div className="absolute left-4 top-4 z-20 max-w-xs rounded-2xl border p-4 backdrop-blur-xl" style={{ background: "rgba(255,255,255,0.92)", borderColor: "#e4e8f0", boxShadow: "0 8px 32px rgba(99,102,241,0.15)" }}>
              <div className="text-[10px] font-semibold uppercase tracking-[0.35em]" style={{ color: "#6366f1" }}>Live Cyclone View</div>
              <div className="mt-2 flex items-center gap-3">
                <h1 className="text-xl font-bold" style={{ color: "#1a2035" }}>{activeStorm?.name ?? "Storm feed"}</h1>
                <span className="rounded-full border px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide" style={{ background: `${categoryColor}18`, borderColor: `${categoryColor}44`, color: categoryColor }}>
                  {category}
                </span>
              </div>
              <p className="mt-1 text-xs" style={{ color: "#5a6380" }}>
                {activeStorm ? `${activeStorm.subbasin ?? activeStorm.basin ?? "North Indian Ocean"} · ${formatCoord(activeStorm.lat, activeStorm.lon)} · ${formatDateTime(activeStorm.timestamp)}` : "Waiting for the first storm record."}
              </p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <MiniStat label="Wind" value={formatWind(stormWind)} />
                <MiniStat label="Pressure" value={formatPressure(stormPressure)} />
                <MiniStat label="Motion" value={stormHeading} />
                <MiniStat label="Fix" value={latestPoint ? formatCoord(latestPoint.lat, latestPoint.lon) : "—"} />
              </div>
            </div>

            {/* Bottom timeline bar */}
            <div className="absolute inset-x-3 bottom-3 z-20 rounded-2xl border px-4 py-3 backdrop-blur-xl sm:inset-x-4" style={{ background: "rgba(255,255,255,0.90)", borderColor: "#e4e8f0", boxShadow: "0 8px 32px rgba(99,102,241,0.12)" }}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <button type="button" onClick={() => setIsPlaying((v) => !v)}
                    className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
                    style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
                    <span>{isPlaying ? "❚❚" : "▶"}</span>
                    {isPlaying ? "Pause" : "Play"}
                  </button>
                  <button type="button" onClick={() => setActiveLayer("satellite")}
                    className="rounded-full border px-4 py-2 text-sm font-medium transition hover:opacity-80"
                    style={{ background: "#f4f6fb", borderColor: "#e4e8f0", color: "#5a6380" }}>
                    1x
                  </button>
                  <div className="rounded-full border px-4 py-2 text-sm" style={{ background: "#f4f6fb", borderColor: "#e4e8f0", color: "#5a6380" }}>
                    {latestPoint ? formatDateTime(latestPoint.timestamp) : (mounted ? utcNowLabel() : "—")}
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full border px-4 py-2 text-sm font-semibold" style={{ background: "#fff1f2", borderColor: "#fecdd3", color: "#f43f5e" }}>NOW (06Z)</span>
                  <span className="rounded-full border px-4 py-2 text-sm" style={{ background: "#f0fdf4", borderColor: "#bbf7d0", color: "#059669" }}>
                    {formatWind(stormWind)} ({windToKmh(stormWind)} km/h)
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mt-3 h-1.5 rounded-full" style={{ background: "#e4e8f0" }}>
                <div className="h-1.5 rounded-full" style={{ background: "linear-gradient(90deg, #6366f1, #8b5cf6, #f59e0b)", width: `${Math.max(18, timelineSlices.length ? (timelineSlices.length / 9) * 100 : 18)}%` }} />
              </div>

              {/* Timeline dots */}
              <div className="mt-3 flex items-center justify-between gap-3 overflow-x-auto pb-1">
                {timelineSlices.map((point, index) => {
                  const selected = index === timelineSlices.length - 1;
                  const color = getCategoryColor(point.category ?? windToCategory(point.wind_kt));
                  return (
                    <div key={`${point.timestamp}-${index}`} className="flex min-w-[64px] flex-col items-center gap-1.5 text-[11px]" style={{ color: "#8b95b0" }}>
                      <span className={`h-3 w-3 rounded-full border-2 border-white shadow-sm ${selected ? "ring-4 ring-indigo-300/40" : ""}`} style={{ background: color }} />
                      <span>{timelineLabel(point.timestamp)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Right panel */}
          <aside className="hidden flex-col gap-3 lg:flex">
            {/* Storm systems list */}
            <div className="flex max-h-[46vh] flex-col rounded-2xl border p-3 shadow-sm" style={{ background: "#ffffff", borderColor: "#e4e8f0" }}>
              <div className="flex items-center justify-between px-1">
                <div className="text-[10px] font-semibold uppercase tracking-[0.3em]" style={{ color: "#8b95b0" }}>Storm Systems</div>
                <span className="text-[10px] font-semibold" style={{ color: "#6366f1" }}>{stormList.length}</span>
              </div>
              <div className="mt-2 flex-1 space-y-1.5 overflow-y-auto pr-1" style={{ maxHeight: "38vh" }}>
                {stormList.length === 0 && (
                  <div className="px-2 py-4 text-center text-xs text-slate-400">No systems yet</div>
                )}
                {stormList.map((s) => {
                  const sel = activeStorm?.id === s.id;
                  const scat = s.category ?? windToCategory(s.wind_kt ?? s.maxWind ?? 0);
                  const scur = getCategoryColor(scat);
                  const historical = s.status === "historical";
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setActiveStorm(s)}
                      className="flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-left transition-all"
                      style={sel
                        ? { background: `${scur}14`, border: `1.5px solid ${scur}55` }
                        : { background: "#f8f9ff", border: "1.5px solid #e8ecf5" }}
                    >
                      <span
                        className="h-3.5 w-3.5 shrink-0 rounded-full border"
                        style={{ background: scur, borderColor: sel ? scur : "#d0d7e8" }}
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold" style={{ color: "#1a2035" }}>
                          {s.name}
                        </span>
                        <span className="block truncate text-[11px]" style={{ color: "#8b95b0" }}>
                          {scat.replace(/_/g, " ")} · {Math.round(s.wind_kt ?? s.maxWind ?? 0)} kt
                        </span>
                      </span>
                      <span
                        className="shrink-0 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider"
                        style={historical
                          ? { background: "#f4f6fb", color: "#94a3b8", border: "1px solid #e2e8f0" }
                          : { background: "#ecfdf5", color: "#059669", border: "1px solid #a7f3d0" }}
                      >
                        {historical ? "Archive" : "Live"}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Compact basemap toggle */}
              <div className="mt-2 flex gap-1.5 border-t pt-2" style={{ borderColor: "#e4e8f0" }}>
                {LAYER_ITEMS.map((layer) => {
                  const sel = activeLayer === layer.id;
                  return (
                    <button
                      key={layer.id}
                      type="button"
                      onClick={() => setActiveLayer(layer.id)}
                      className="flex-1 rounded-lg px-2 py-1.5 text-[11px] font-semibold transition-all"
                      style={sel
                        ? { background: `${layer.color}18`, color: layer.color, border: `1.5px solid ${layer.color}50` }
                        : { background: "#f4f6fb", color: "#8b95b0", border: "1.5px solid #e4e8f0" }}
                    >
                      {layer.label.split(" ")[0]}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Situation */}
            <div className="rounded-2xl border p-4 shadow-sm" style={{ background: "#ffffff", borderColor: "#e4e8f0" }}>
              <div className="text-[10px] font-semibold uppercase tracking-[0.3em]" style={{ color: "#8b95b0" }}>Situation</div>
              <div className="mt-3 space-y-2">
                {[
                  { label: "Latest fix", val: latestPoint ? formatCoord(latestPoint.lat, latestPoint.lon) : "No coordinates yet" },
                  { label: "Forecast", val: forecastTrack.length > 0 ? `${forecastTrack.length} points ready` : "Pending" },
                  { label: "Signal", val: prediction?.probabilities ? `${Object.keys(prediction.probabilities).length} paths` : "Initializing" },
                ].map((r) => (
                  <div key={r.label} className="rounded-xl border px-3 py-2" style={{ background: "#f8f9ff", borderColor: "#e4e8f0" }}>
                    <div className="text-[10px] font-medium uppercase tracking-[0.2em]" style={{ color: "#8b95b0" }}>{r.label}</div>
                    <div className="mt-1 text-sm font-medium" style={{ color: "#1a2035" }}>{r.val}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Feed */}
            <div className="rounded-2xl border p-4 shadow-sm text-sm" style={{ background: "#ffffff", borderColor: "#e4e8f0", color: "#5a6380" }}>
              <div className="text-[10px] font-semibold uppercase tracking-[0.3em]" style={{ color: "#8b95b0" }}>Feed</div>
              <div className="mt-3 space-y-1.5">
                <div>{activeStorm?.status ?? "Operational storm tracking"}</div>
                <div>{prediction?.timeframe ?? "Next update incoming"}</div>
                <div style={{ color: error ? "#f43f5e" : "#5a6380" }}>{error ?? "No errors reported"}</div>
                <div className="font-medium" style={{ color: "#6366f1" }}>{isLoading ? "Refreshing…" : `${stormList.length} active systems`}</div>
              </div>
            </div>
          </aside>
        </div>

        {/* Mobile nav */}
        <div className="grid gap-2 lg:hidden">
          <div className="grid grid-cols-2 gap-2">
            {SIDEBAR_ITEMS.map((item) => (
              <Link key={item.href} href={item.href} className="rounded-xl border px-4 py-3 text-sm font-medium transition" style={{ background: "#ffffff", borderColor: "#e4e8f0", color: "#5a6380" }}>
                {item.icon} {item.label}
              </Link>
            ))}
          </div>
          <div className="rounded-xl border p-3 text-sm" style={{ background: "#ffffff", borderColor: "#e4e8f0", color: "#5a6380" }}>
            {activeStorm ? `${activeStorm.name} is selected` : "No storm selected"}
          </div>
        </div>
      </div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border px-3 py-2" style={{ background: "#f4f6fb", borderColor: "#e4e8f0" }}>
      <div className="text-[10px] font-medium uppercase tracking-[0.2em]" style={{ color: "#8b95b0" }}>{label}</div>
      <div className="mt-0.5 text-sm font-semibold" style={{ color: "#1a2035" }}>{value}</div>
    </div>
  );
}
