"use client";

import type { Storm } from "@/lib/types";
import { formatDateTime, formatPressure, formatWind } from "@/lib/formatters";
import { windToCategory } from "@/lib/types";

interface StormCardProps {
  storm: Storm;
  isActive: boolean;
  onClick: () => void;
}

export default function StormCard({ storm, isActive, onClick }: StormCardProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-4 rounded-lg border transition-all shadow-sm ${
        isActive
          ? "bg-white border-orange-500 shadow-md shadow-orange-100 ring-1 ring-orange-200"
          : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50"
      }`}
    >
      <div className="flex items-center justify-between mb-1">
        <span className="font-semibold text-slate-900">{storm.name}</span>
        <span className="text-xs text-slate-400">{storm.season ?? "N/A"}</span>
      </div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-slate-500">{storm.subbasin ?? storm.basin ?? "North Indian Ocean"}</span>
        <span className="text-slate-400">{formatDateTime(storm.timestamp)}</span>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <span
          className="text-xs px-2 py-0.5 rounded-full font-medium"
          style={{
            backgroundColor: `${getCategoryColorLocal(storm)}20`,
            color: getCategoryColorLocal(storm),
          }}
        >
          {storm.category ?? windToCategory(storm.wind_kt ?? storm.maxWind ?? 0)}
        </span>
        <span className="text-xs text-slate-500">
          Max: {formatWind(storm.wind_kt ?? storm.maxWind ?? 0)}
        </span>
        <span className="text-xs text-slate-500">
          {formatPressure(storm.pressure_hpa ?? 0)}
        </span>
      </div>
    </button>
  );
}

function getCategoryColorLocal(storm: Storm): string {
  const w = storm.wind_kt ?? storm.maxWind ?? 0;
  if (w < 17) return "#4B9CD3";
  if (w < 28) return "#5DADE2";
  if (w < 34) return "#F4D03F";
  if (w < 48) return "#FFA500";
  if (w < 64) return "#FF8C00";
  if (w < 120) return "#FF4500";
  return "#DC143C";
}
