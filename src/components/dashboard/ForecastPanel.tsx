"use client";

import type { Prediction, TrendData } from "@/lib/types";
import { categoryLabel, trendArrow, trendColor } from "@/lib/formatters";
import { getCategoryColor } from "@/lib/types";

interface ForecastPanelProps {
  prediction: Prediction | null;
  trend: TrendData | null;
  isLoading: boolean;
}

export default function ForecastPanel({
  prediction,
  trend,
  isLoading,
}: ForecastPanelProps) {
  if (isLoading) {
    return (
      <div className="rounded-lg bg-white border border-slate-200 p-4 shadow-sm">
        <div className="text-slate-500 text-sm">Loading forecast...</div>
      </div>
    );
  }

  if (!prediction && !trend) {
    return (
      <div className="rounded-lg bg-white border border-slate-200 p-4 shadow-sm">
        <div className="text-slate-500 text-sm">Select a storm to view forecast</div>
      </div>
    );
  }

  return (
    <div className="rounded-lg bg-white border border-slate-200 p-4 space-y-4 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
        Forecast & Trends
      </h3>

      {prediction && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">Current Stage</span>
            <span className="text-sm font-medium text-slate-900">
              {categoryLabel(prediction.currentStage)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">Predicted Next</span>
            <span
              className="text-sm font-bold"
              style={{ color: getCategoryColor(prediction.predictedNextStage) }}
            >
              {categoryLabel(prediction.predictedNextStage)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">Confidence</span>
            <span className="text-sm text-slate-600">
              {(prediction.confidence * 100).toFixed(1)}%
            </span>
          </div>

          {Object.keys(prediction.probabilities).length > 0 && (
            <div className="mt-2 space-y-1">
              {Object.entries(prediction.probabilities)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 4)
                .map(([stage, prob]) => (
                  <div key={stage} className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${prob * 100}%`,
                          backgroundColor: getCategoryColor(stage),
                        }}
                      />
                    </div>
                    <span className="text-[10px] text-slate-500 w-16 text-right">
                      {stage.replace("_", " ")}
                    </span>
                    <span className="text-[10px] text-slate-500 w-10 text-right">
                      {(prob * 100).toFixed(0)}%
                    </span>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {trend && (
        <div className="border-t border-slate-200 pt-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">Wind Trend</span>
            <span className={`text-sm font-medium ${trendColor(trend.windTrend)}`}>
              {trend.windTrend.replace("_", " ")} {trendArrow(trend.windTrend)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">Pressure Trend</span>
            <span
              className={`text-sm font-medium ${trendColor(trend.pressureTrend)}`}
            >
              {trend.pressureTrend} {trendArrow(trend.pressureTrend)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">Overall</span>
            <span
              className={`text-sm font-bold ${trendColor(trend.overallAssessment)}`}
            >
              {trend.overallAssessment.replace("_", " ")}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
