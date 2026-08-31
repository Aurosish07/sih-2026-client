"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import CycloneMapWrapper from "@/components/map/CycloneMapWrapper";
import { fetchStorm } from "@/lib/api";
import { categoryLabel, formatCoord, formatDateTime, formatPressure, formatWind, trendArrow, windToKmh } from "@/lib/formatters";
import { getCategoryColor, type Storm, type TrackPoint, type Observation, windToCategory } from "@/lib/types";
import { useCycloneStore } from "@/stores/cycloneStore";
import { usePredictionStore } from "@/stores/predictionStore";

const SIDEBAR_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: "◫" },
  { href: "/monitor", label: "Monitor", icon: "◎" },
  { href: "/chat", label: "AI", icon: "◇" },
  { href: "/", label: "Storms", icon: "◌" },
];

const LAYER_ITEMS = [
  { id: "wind", label: "Wind", accent: "from-cyan-400 to-emerald-400" },
  { id: "radar", label: "Weather radar", accent: "from-amber-400 to-rose-500" },
  { id: "satellite", label: "Satellite", accent: "from-sky-500 to-indigo-500" },
  { id: "tracker", label: "Hurricane tracker", accent: "from-red-500 to-orange-500" },
  { id: "pressure", label: "Pressure", accent: "from-slate-400 to-cyan-500" },
  { id: "clouds", label: "Clouds", accent: "from-slate-300 to-slate-500" },
  { id: "waves", label: "Waves", accent: "from-violet-500 to-fuchsia-500" },
  { id: "attention", label: "AI Attention", accent: "from-fuchsia-500 to-yellow-400" },
  { id: "basemap", label: "Dark Basemap", accent: "from-cyan-500 to-blue-700" },
] as const;

function toTrackPoints(track: TrackPoint[], observations: Observation[]): TrackPoint[] {
  if (track.length > 0) return track;

  return observations.map((observation) => ({
    timestamp: observation.timestamp,
    lat: observation.lat,
    lon: observation.lon,
    wind_kt: observation.wind_kt,
    pressure_hpa: observation.pressure_hpa,
    movement_direction: observation.movement_direction,
    movement_speed: observation.movement_speed,
    source: observation.source,
    category: observation.nature ?? observation.satellite_hint,
  }));
}

function trendLabel(value?: string | null): string {
  if (!value) return "Steady";
  if (value === "rapid_intensification") return "Strengthening";
  if (value === "increasing") return "Strengthening";
  if (value === "decreasing") return "Weakening";
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function utcNowLabel(): string {
  return `${new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZone: "UTC",
  }).format(new Date())} UTC`;
}

function timelineLabel(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "UTC",
  }).format(new Date(iso));
}

function getStormCategory(storm: Storm | null): string {
  if (!storm) return "LOW";
  return storm.category ?? windToCategory(storm.wind_kt ?? storm.maxWind ?? 0);
}

export default function Home() {
  const searchParams = useSearchParams();
  const [activeLayer, setActiveLayer] = useState<(typeof LAYER_ITEMS)[number]["id"]>("wind");
  const [isPlaying, setIsPlaying] = useState(true);
  const [forecastTrack, setForecastTrack] = useState<TrackPoint[]>([]);

  const {
    activeStorm,
    stormList,
    track,
    observations,
    isLoading,
    error,
    setActiveStorm,
    fetchStorms,
    fetchTrack,
    fetchObservations,
  } = useCycloneStore();
  const { trend, prediction, fetchTrend, fetchPrediction } = usePredictionStore();

  useEffect(() => {
    fetchStorms();
  }, [fetchStorms]);

  useEffect(() => {
    const stormId = searchParams.get("storm");
    if (!stormId) return;

    const selected = stormList.find((storm) => storm.id === stormId);
    if (selected && selected.id !== activeStorm?.id) {
      setActiveStorm(selected);
    }
  }, [activeStorm?.id, searchParams, setActiveStorm, stormList]);

  useEffect(() => {
    if (!activeStorm) return;

    fetchTrack(activeStorm.id);
    fetchObservations(activeStorm.id);
    fetchTrend(activeStorm.id);
    fetchPrediction(activeStorm.id);

    fetchStorm(activeStorm.id)
      .then((detail) => {
        setForecastTrack(detail.forecast_track ?? []);
      })
      .catch(() => {
        setForecastTrack([]);
      });
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
  const predictionStatus = prediction
    ? `${prediction.currentStage} -> ${prediction.predictedNextStage}`
    : "Model warming up";

  const topMetrics = [
    {
      label: "Storm",
      value: activeStorm?.name ?? "Waiting for feed",
      tone: "text-white",
    },
    {
      label: "Category",
      value: categoryLabel(category),
      tone: "text-rose-300",
    },
    {
      label: "MSW",
      value: `${formatWind(stormWind)} (${windToKmh(stormWind)} km/h)`,
      tone: "text-cyan-200",
    },
    {
      label: "Heading",
      value: `${stormHeading} (${Math.round(stormHeadingSpeed)} kt)`,
      tone: "text-emerald-200",
    },
    {
      label: "Trend",
      value: `${trendArrow(trend?.windTrend ?? "steady")} ${trendStatus}`,
      tone: trend?.windTrend === "decreasing" ? "text-sky-200" : "text-amber-200",
    },
  ];

  const timelineSlices = timeline.slice(-9);

  return (
    <div className="min-h-screen overflow-hidden bg-[#020406] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.18),_transparent_30%),radial-gradient(circle_at_top_right,_rgba(251,146,60,0.14),_transparent_30%),radial-gradient(circle_at_bottom,_rgba(15,118,110,0.16),_transparent_28%),linear-gradient(180deg,_#071017_0%,_#04070a_60%,_#020406_100%)]" />

      <div className="relative flex min-h-screen flex-col gap-3 px-0 py-2">
        <header className="grid gap-3 rounded-[28px] border border-white/10 bg-black/70 px-4 py-3 shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl lg:grid-cols-[auto_minmax(0,1fr)_auto] lg:items-center">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-400/30 bg-cyan-400/10 text-cyan-300 shadow-[0_0_30px_rgba(34,211,238,0.18)]">
              ◉
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-[0.35em] text-cyan-300/80">
                StormSense AI
              </div>
              <div className="text-sm text-white/70">
                North Indian Ocean cyclone operations
              </div>
            </div>
          </div>

          <div className="grid gap-2 xl:grid-cols-5">
            {topMetrics.map((metric) => (
              <div
                key={metric.label}
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2"
              >
                <div className="text-[10px] uppercase tracking-[0.25em] text-white/40">
                  {metric.label}
                </div>
                <div className={`mt-1 text-sm font-semibold ${metric.tone}`}>
                  {metric.value}
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs text-white/60">
            <label className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
              <span className="text-[10px] uppercase tracking-[0.2em] text-white/40">
                Storm
              </span>
              <select
                value={activeStorm?.id ?? ""}
                onChange={(e) => {
                  const next = stormList.find((s) => s.id === e.target.value);
                  if (next) setActiveStorm(next);
                }}
                className="max-w-[140px] cursor-pointer bg-transparent text-xs text-white/80 outline-none [&>option]:bg-[#0a1017] [&>option]:text-white"
              >
                <option value="" disabled>
                  {stormList.length} active
                </option>
                {stormList.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </label>
            <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
              {utcNowLabel()}
            </div>
            <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
              {predictionStatus}
            </div>
          </div>
        </header>

        <div className="grid flex-1 gap-3 lg:grid-cols-[72px_minmax(0,1fr)_276px]">
          <aside className="hidden flex-col items-center gap-4 rounded-[28px] border border-white/10 bg-black/65 py-4 shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl lg:flex">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-400/30 bg-cyan-400/10 text-cyan-300">
              ◉
            </div>
            <div className="h-px w-8 bg-white/10" />
            {SIDEBAR_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-sm text-white/65 transition hover:border-cyan-400/30 hover:bg-cyan-400/10 hover:text-cyan-200"
                title={item.label}
              >
                <span className="transition group-hover:scale-110">{item.icon}</span>
              </Link>
            ))}
            <div className="mt-auto flex flex-col items-center gap-2 text-[10px] uppercase tracking-[0.25em] text-white/30">
              <div className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.8)]" />
              live
            </div>
          </aside>

          <section className="relative min-h-[calc(100vh-170px)] overflow-hidden rounded-[32px] border border-white/10 bg-[#081018] shadow-[0_34px_120px_rgba(0,0,0,0.6)]">
            <div className="absolute inset-0">
              {activeStorm ? (
                <CycloneMapWrapper
                  className="h-full min-h-[calc(100vh-170px)] rounded-none border-0 bg-transparent shadow-none"
                  storm={activeStorm}
                  track={timeline}
                  forecastTrack={forecastTrack}
                  storms={stormList}
                  hideOverlays
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <div className="rounded-[28px] border border-white/10 bg-black/60 px-6 py-5 text-center backdrop-blur-xl">
                    <div className="text-sm text-white/60">
                      Loading cyclone feed...
                    </div>
                    <div className="mt-2 text-xs text-white/35">
                      Building the storm console
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(56,189,248,0.10),_transparent_45%),linear-gradient(180deg,_rgba(2,6,23,0.12),_rgba(2,6,23,0.38))]" />

            <div className="absolute left-4 top-4 z-20 max-w-xl rounded-[24px] border border-white/10 bg-black/65 p-4 shadow-[0_20px_50px_rgba(0,0,0,0.35)] backdrop-blur-xl">
              <div className="text-[10px] uppercase tracking-[0.35em] text-cyan-300/70">
                Live Cyclone View
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-semibold text-white">
                  {activeStorm?.name ?? "Storm feed"}
                </h1>
                <span
                  className="rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.25em]"
                  style={{
                    backgroundColor: `${categoryColor}20`,
                    borderColor: `${categoryColor}44`,
                    color: categoryColor,
                  }}
                >
                  {category}
                </span>
              </div>
              <p className="mt-2 text-sm text-white/60">
                {activeStorm
                  ? `${activeStorm.subbasin ?? activeStorm.basin ?? "North Indian Ocean"} · ${formatCoord(activeStorm.lat, activeStorm.lon)} · Updated ${formatDateTime(activeStorm.timestamp)}`
                  : "Waiting for the first storm record to arrive."}
              </p>
              <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                <MiniStat label="Wind" value={formatWind(stormWind)} />
                <MiniStat label="Pressure" value={formatPressure(stormPressure)} />
                <MiniStat label="Motion" value={stormHeading} />
                <MiniStat label="Fix" value={latestPoint ? formatCoord(latestPoint.lat, latestPoint.lon) : "—"} />
              </div>
            </div>

            <div className="absolute inset-x-3 bottom-3 z-20 rounded-[24px] border border-white/10 bg-black/75 px-4 py-3 shadow-[0_16px_50px_rgba(0,0,0,0.38)] backdrop-blur-xl sm:inset-x-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsPlaying((value) => !value)}
                    className="flex items-center gap-2 rounded-full bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
                  >
                    <span>{isPlaying ? "❚❚" : "▶"}</span>
                    {isPlaying ? "Pause" : "Play"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveLayer("wind")}
                    className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 transition hover:border-white/20 hover:bg-white/10"
                  >
                    1x
                  </button>
                  <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/75">
                    Time: {latestPoint ? formatDateTime(latestPoint.timestamp) : utcNowLabel()}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-white/10 bg-rose-500/20 px-4 py-2 text-sm text-rose-200">
                    NOW (06Z)
                  </span>
                  <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80">
                    {formatWind(stormWind)} ({windToKmh(stormWind)} km/h)
                  </span>
                </div>
              </div>

              <div className="mt-3 h-1.5 rounded-full bg-white/10">
                <div
                  className="h-1.5 rounded-full bg-gradient-to-r from-cyan-400 via-sky-400 to-amber-300"
                  style={{
                    width: `${Math.max(18, timelineSlices.length ? (timelineSlices.length / 9) * 100 : 18)}%`,
                  }}
                />
              </div>

              <div className="mt-3 flex items-center justify-between gap-3 overflow-x-auto pb-1">
                {timelineSlices.map((point, index) => {
                  const selected = index === timelineSlices.length - 1;
                  const label = timelineLabel(point.timestamp);
                  const color = getCategoryColor(point.category ?? windToCategory(point.wind_kt));
                  return (
                    <div
                      key={`${point.timestamp}-${index}`}
                      className="flex min-w-[64px] flex-col items-center gap-2 text-[11px] text-white/55"
                    >
                      <span
                        className={`h-3 w-3 rounded-full border border-white/80 ${
                          selected ? "ring-4 ring-cyan-300/35" : ""
                        }`}
                        style={{ backgroundColor: color }}
                      />
                      <span>{label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          <aside className="hidden flex-col gap-3 lg:flex">
            <div className="rounded-[28px] border border-white/10 bg-black/65 p-3 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-xl">
              <div className="text-[10px] uppercase tracking-[0.3em] text-white/40">
                Controls
              </div>
              <div className="mt-3 space-y-2">
                {LAYER_ITEMS.map((layer) => {
                  const selected = activeLayer === layer.id;
                  return (
                    <button
                      key={layer.id}
                      type="button"
                      onClick={() => setActiveLayer(layer.id)}
                      className={`flex w-full items-center justify-between rounded-full px-3 py-2 text-sm transition ${
                        selected
                          ? "bg-white/12 text-white"
                          : "bg-white/5 text-white/72 hover:bg-white/8"
                      }`}
                    >
                      <span>{layer.label}</span>
                      <span
                        className={`h-7 w-7 rounded-full bg-gradient-to-br ${layer.accent} ${
                          selected ? "ring-2 ring-white/35" : ""
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="rounded-[28px] border border-white/10 bg-black/65 p-4 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-xl">
              <div className="text-[10px] uppercase tracking-[0.3em] text-white/40">
                Situation
              </div>
              <div className="mt-3 space-y-3 text-sm text-white/75">
                <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2">
                  <div className="text-[10px] uppercase tracking-[0.25em] text-white/35">
                    Latest fix
                  </div>
                  <div className="mt-1 text-white">
                    {latestPoint ? formatCoord(latestPoint.lat, latestPoint.lon) : "No coordinates yet"}
                  </div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2">
                  <div className="text-[10px] uppercase tracking-[0.25em] text-white/35">
                    Forecast
                  </div>
                  <div className="mt-1 text-white">
                    {forecastTrack.length > 0
                      ? `${forecastTrack.length} points ready`
                      : "Forecast track pending"}
                  </div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2">
                  <div className="text-[10px] uppercase tracking-[0.25em] text-white/35">
                    Signal
                  </div>
                  <div className="mt-1 text-white">
                    {prediction?.probabilities
                      ? `${Object.keys(prediction.probabilities).length} outcome paths`
                      : "Model initializing"}
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[28px] border border-white/10 bg-black/65 p-4 text-sm text-white/65 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-xl">
              <div className="text-[10px] uppercase tracking-[0.3em] text-white/40">
                Feed
              </div>
              <div className="mt-3 space-y-2">
                <div>{activeStorm?.status ?? "Operational storm tracking"}</div>
                <div>{prediction?.timeframe ?? "Next update in the coming cycle"}</div>
                <div>{error ?? "No errors reported"}</div>
                <div>{isLoading ? "Refreshing storm list..." : `${stormList.length} active systems`}</div>
              </div>
            </div>
          </aside>
        </div>

        <div className="grid gap-2 lg:hidden">
          <div className="grid grid-cols-2 gap-2">
            {SIDEBAR_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-2xl border border-white/10 bg-black/65 px-4 py-3 text-sm text-white/80 backdrop-blur-xl"
              >
                {item.icon} {item.label}
              </Link>
            ))}
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/65 p-3 text-sm text-white/70 backdrop-blur-xl">
            {activeStorm ? `${activeStorm.name} is selected` : "No storm selected yet"}
          </div>
        </div>
      </div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2">
      <div className="text-[10px] uppercase tracking-[0.25em] text-white/35">
        {label}
      </div>
      <div className="mt-1 text-sm text-white">{value}</div>
    </div>
  );
}
