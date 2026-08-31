"use client";

import { useEffect, useMemo, useState } from "react";
import type { SatelliteImage } from "@/lib/types";
import { formatDateTime } from "@/lib/formatters";

interface ImageGridProps {
  images: SatelliteImage[];
  isLoading: boolean;
}

const TIMELINE_LABELS = ["T-2", "T-1", "NOW"] as const;

export default function ImageGrid({ images, isLoading }: ImageGridProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (!playing || images.length < 2) return;
    const timer = setInterval(() => {
      setActiveIndex((index) => (index + 1) % images.length);
    }, 1800);
    return () => clearInterval(timer);
  }, [images.length, playing]);

  const activeImage = images[activeIndex] ?? null;

  const timeline = useMemo(
    () =>
      images.map((image, index) => ({
        ...image,
        label: TIMELINE_LABELS[index] ?? `T-${Math.max(0, images.length - index - 1)}`,
      })),
    [images],
  );

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="h-72 animate-pulse rounded-2xl bg-slate-200" />
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-sm">
        <div className="text-sm text-slate-500">No satellite imagery available</div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-[10px] uppercase tracking-[0.24em] text-sky-600">
            Satellite Timeline
          </div>
          <h3 className="mt-1 text-lg font-semibold text-slate-900">
            {activeImage?.source ?? "Unknown source"}
          </h3>
        </div>
        <button
          type="button"
          onClick={() => setPlaying((value) => !value)}
          className="rounded-full border border-slate-300 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"
        >
          {playing ? "Pause" : "Replay"}
        </button>
      </div>

      <div className="mt-4 overflow-hidden rounded-[1.25rem] border border-slate-200 bg-slate-100">
        <div className="relative aspect-[16/10] w-full">
          <img
            src={activeImage?.image ?? activeImage?.url ?? ""}
            alt={`${activeImage?.source ?? "Satellite"} image`}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent p-4">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-100">
              <span>{formatDateTime(activeImage?.timestamp ?? new Date().toISOString())}</span>
              <span>{activeImage?.channel ?? "N/A"}</span>
              <span>{activeImage?.product ?? "StormSense composite"}</span>
            </div>
            <div className="mt-1 text-xs text-slate-300">
              {activeImage?.location ?? "Location unavailable"}
              {activeImage?.bounds ? ` • Bounds ${activeImage.bounds.join(", ")}` : ""}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        {timeline.map((image, index) => (
          <button
            key={`${image.source}-${image.timestamp}-${index}`}
            type="button"
            onClick={() => setActiveIndex(index)}
            className={`rounded-xl border p-2 text-left transition ${
              index === activeIndex
                ? "border-sky-400 bg-sky-50"
                : "border-slate-200 bg-white hover:bg-slate-50"
            }`}
          >
            <div className="text-[10px] uppercase tracking-[0.2em] text-slate-500">
              {image.label}
            </div>
            <div className="mt-1 text-sm font-medium text-slate-900">
              {formatDateTime(image.timestamp)}
            </div>
            <div className="mt-1 text-xs text-slate-500">{image.source}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
