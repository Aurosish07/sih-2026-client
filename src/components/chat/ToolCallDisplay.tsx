"use client";

import type { ToolCall } from "@/lib/types";

interface ToolCallDisplayProps {
  toolCalls: ToolCall[];
}

const TOOL_LABELS: Record<string, string> = {
  get_current_storm: "Fetching storm data",
  get_track: "Loading track history",
  get_recent_observations: "Reading recent observations",
  get_satellite_images: "Fetching satellite imagery",
  analyze_satellite: "Running SigLIP visual analysis",
  get_trend: "Calculating trends",
  get_prediction: "Running prediction model",
  search_official_sources: "Searching IMD/JTWC bulletins",
};

export default function ToolCallDisplay({ toolCalls }: ToolCallDisplayProps) {
  if (toolCalls.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5 mb-2">
      {toolCalls.map((tc) => (
        <div
          key={tc.id}
          className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-medium border ${
            tc.status === "running"
              ? "bg-sky-50 border-sky-300 text-sky-700 animate-pulse"
              : tc.status === "completed"
              ? "bg-emerald-50 border-emerald-300 text-emerald-700"
              : "bg-red-50 border-red-300 text-red-700"
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              tc.status === "running"
                ? "bg-yellow-400"
                : tc.status === "completed"
                ? "bg-green-400"
                : "bg-red-400"
            }`}
          />
          {TOOL_LABELS[tc.name] ?? tc.name}
        </div>
      ))}
    </div>
  );
}
