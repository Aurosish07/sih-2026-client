export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  }) + " UTC";
}

export function formatDateTime(iso: string): string {
  return `${formatDate(iso)} ${formatTime(iso)}`;
}

export function formatWind(knots: number): string {
  return `${Math.round(knots)} kt`;
}

export function formatPressure(hpa: number): string {
  return `${Math.round(hpa)} hPa`;
}

export function formatCoord(lat: number, lon: number): string {
  const latDir = lat >= 0 ? "N" : "S";
  const lonDir = lon >= 0 ? "E" : "W";
  return `${Math.abs(lat).toFixed(1)}${latDir}, ${Math.abs(lon).toFixed(1)}${lonDir}`;
}

export function windToKmh(knots: number): number {
  return Math.round(knots * 1.852);
}

export function categoryLabel(cat: string): string {
  const labels: Record<string, string> = {
    LOW: "Low Pressure",
    DEPRESSION: "Depression",
    DEEP_DEPRESSION: "Deep Depression",
    CYCLONE: "Cyclonic Storm",
    SEVERE_CYCLONE: "Severe Cyclonic Storm",
    VERY_SEVERE_CYCLONE: "Very Severe Cyclonic Storm",
    SUPER_CYCLONE: "Super Cyclonic Storm",
  };
  return labels[cat] ?? cat;
}

export function trendArrow(trend: string): string {
  if (trend === "increasing" || trend === "strengthening") return "↑";
  if (trend === "decreasing" || trend === "weakening") return "↓";
  if (trend === "rapid_intensification") return "↑↑";
  return "→";
}

export function trendColor(trend: string): string {
  if (trend === "increasing" || trend === "strengthening" || trend === "rapid_intensification")
    return "text-red-600";
  if (trend === "decreasing" || trend === "weakening") return "text-blue-600";
  return "text-slate-500";
}
