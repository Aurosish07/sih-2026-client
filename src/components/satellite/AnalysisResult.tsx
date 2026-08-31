"use client";

import type { SatelliteAnalysis } from "@/lib/types";

interface AnalysisResultProps {
  analysis: SatelliteAnalysis | null;
}

const LABEL_NAMES: Record<string, string> = {
  disturbance: "Disturbance",
  organizing: "Organizing",
  organized_storm: "Organized Storm",
  mature_cyclone: "Mature Cyclone",
  weakening: "Weakening",
  dissipating: "Dissipating",
  clear: "Clear Sky",
};

export default function AnalysisResult({ analysis }: AnalysisResultProps) {
  if (!analysis) {
    return (
      <div className="rounded-lg bg-white border border-slate-200 p-4 shadow-sm">
        <div className="text-slate-500 text-sm">
          No satellite analysis available
        </div>
      </div>
    );
  }

  const sorted = Object.entries(analysis.scores).sort(([, a], [, b]) => b - a);

  return (
    <div className="rounded-lg bg-white border border-slate-200 p-4 space-y-3 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
        Visual Pattern Analysis
      </h3>

      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-500">Dominant Pattern</span>
        <span className="text-sm font-bold text-slate-900">
          {LABEL_NAMES[analysis.dominantPattern] ?? analysis.dominantPattern}
        </span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-500">Confidence</span>
        <span className="text-sm text-slate-600">
          {(analysis.confidence * 100).toFixed(1)}%
        </span>
      </div>

      <div className="space-y-1.5">
        {sorted.map(([pattern, score]) => (
          <div key={pattern} className="flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-orange-500/70 rounded-full transition-all"
                style={{ width: `${score * 100}%` }}
              />
            </div>
            <span className="text-[10px] text-slate-500 w-24 text-right">
              {LABEL_NAMES[pattern] ?? pattern}
            </span>
            <span className="text-[10px] text-slate-500 w-10 text-right">
              {(score * 100).toFixed(0)}%
            </span>
          </div>
        ))}
      </div>

      <div className="text-[10px] text-slate-400 mt-2">
        Powered by SigLIP zero-shot classification
      </div>
    </div>
  );
}
