"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { TrackPoint } from "@/lib/types";

interface TrendChartProps {
  track: TrackPoint[];
}

export default function TrendChart({ track }: TrendChartProps) {
  if (track.length < 2) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-400">
        Not enough data for trend chart
      </div>
    );
  }

  const data = track.map((p) => ({
    time: new Date(p.timestamp).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
    }),
    wind: Math.round(p.wind_kt ?? p.windSpeed ?? 0),
    pressure: Math.round(p.pressure_hpa ?? p.pressure ?? 0),
  }));

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis
            dataKey="time"
            tick={{ fill: "#64748b", fontSize: 11 }}
            tickLine={false}
          />
          <YAxis
            yAxisId="wind"
            orientation="left"
            tick={{ fill: "#ea580c", fontSize: 11 }}
            tickLine={false}
            label={{ value: "Wind (kt)", angle: -90, position: "insideLeft", fill: "#ea580c", fontSize: 11 }}
          />
          <YAxis
            yAxisId="pressure"
            orientation="right"
            tick={{ fill: "#2563eb", fontSize: 11 }}
            tickLine={false}
            label={{ value: "Pressure (hPa)", angle: 90, position: "insideRight", fill: "#2563eb", fontSize: 11 }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
              fontSize: "12px",
            }}
            labelStyle={{ color: "#475569" }}
          />
          <Line
            yAxisId="wind"
            type="monotone"
            dataKey="wind"
            stroke="#ea580c"
            strokeWidth={2}
            dot={false}
          />
          <Line
            yAxisId="pressure"
            type="monotone"
            dataKey="pressure"
            stroke="#2563eb"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
