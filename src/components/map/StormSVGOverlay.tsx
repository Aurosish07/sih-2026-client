"use client";

import { useMemo } from "react";
import type { Storm } from "@/lib/types";
import { getCategoryColor, windToCategory } from "@/lib/types";

interface StormSVGOverlayProps {
  storm: Storm;
  size?: number;
}

const CATEGORY_EXTENT_KM: Record<string, number> = {
  LOW: 90,
  DEPRESSION: 170,
  DEEP_DEPRESSION: 240,
  CYCLONE: 320,
  SEVERE_CYCLONE: 420,
  VERY_SEVERE_CYCLONE: 540,
  SUPER_CYCLONE: 680,
  TD: 120,
  TS: 240,
  CAT1: 320,
  CAT2: 420,
  CAT3: 540,
  CAT4: 650,
  CAT5: 760,
};

export default function StormSVGOverlay({ storm, size = 300 }: StormSVGOverlayProps) {
  const category = storm.category ?? windToCategory(storm.wind_kt);
  const color = getCategoryColor(category);
  const extentKm =
    CATEGORY_EXTENT_KM[category.toUpperCase()] ??
    CATEGORY_EXTENT_KM[windToCategory(storm.wind_kt).toUpperCase()] ??
    260;

  const uid = `ss-${size}`;
  const c = size / 2;

  const eyeR = Math.max(size * 0.05, 7);

  const spiralClouds = useMemo(() => {
    const arms: { d: string; w: number; o: number; c: string }[] = [];
    const seeds = [0.15, 0.55, 0.35, 0.8, 0.05, 0.65];
    const warm = ["#ffffff", "#fee2c2", "#fde68a", "#ffffff", "#fed7aa", "#fef3c7"];
    for (let i = 0; i < 6; i++) {
      let d = "";
      const start = (i / 6) * Math.PI * 2 + seeds[i] * 0.4;
      const turns = 1.5 + seeds[i] * 0.8;
      const maxR = size * 0.46;
      const steps = 46;
      for (let t = 0; t <= 1; t += 1 / steps) {
        const angle = start + t * turns * Math.PI * 2;
        const r = eyeR + (maxR - eyeR) * Math.pow(t, 0.7);
        const x = c + Math.cos(angle) * r;
        const y = c + Math.sin(angle) * r;
        d += (t === 0 ? "M" : "L") + `${x.toFixed(1)},${y.toFixed(1)}`;
      }
      arms.push({
        d,
        w: size * (0.045 + i * 0.011),
        o: 0.18 + seeds[i] * 0.3,
        c: warm[i % warm.length],
      });
    }
    return arms;
  }, [size, eyeR, c]);

  const outerRings = useMemo(
    () => [
      { r: size * 0.42, o: 0.14, w: 3 },
      { r: size * 0.32, o: 0.22, w: 3.5 },
      { r: size * 0.24, o: 0.3, w: 4 },
      { r: size * 0.18, o: 0.4, w: 2.5 },
    ],
    [size],
  );

  const isHistorical = storm.status === "historical";

  return (
    <div
      style={{
        width: size,
        height: size,
        pointerEvents: "none",
        filter: `drop-shadow(0 0 ${size * 0.1}px ${color}55)`,
      }}
    >
      <svg
        viewBox={`0 0 ${size} ${size}`}
        width={size}
        height={size}
        xmlns="http://www.w3.org/2000/svg"
        style={{ transformBox: "fill-box", transformOrigin: "center", overflow: "visible" }}
      >
        <defs>
          <radialGradient id={`${uid}-halo`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={color} stopOpacity="0.5" />
            <stop offset="40%" stopColor={color} stopOpacity="0.2" />
            <stop offset="70%" stopColor={color} stopOpacity="0.06" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </radialGradient>

          <radialGradient id={`${uid}-body`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
            <stop offset="20%" stopColor="#eef2ff" stopOpacity="0.95" />
            <stop offset="42%" stopColor={color} stopOpacity="0.55" />
            <stop offset="68%" stopColor={color} stopOpacity="0.28" />
            <stop offset="100%" stopColor={color} stopOpacity="0.02" />
          </radialGradient>

          <filter id={`${uid}-blur`} x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation={Math.max(size * 0.015, 1.2)} />
          </filter>
        </defs>

        <circle
          cx={c}
          cy={c}
          r={size * 0.5}
          fill={`url(#${uid}-halo)`}
        />

        <circle
          cx={c}
          cy={c}
          r={size * 0.46}
          fill="none"
          stroke={color}
          strokeWidth={1}
          strokeDasharray="3 6"
          opacity={0.25}
          className="ss-spin"
        />

        <g
          className="ss-spin"
          style={{ transformBox: "fill-box", transformOrigin: "center" }}
        >
          {spiralClouds.map((a, i) => (
            <path
              key={`cloud-${i}`}
              d={a.d}
              fill="none"
              stroke={a.c}
              strokeWidth={a.w}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={a.o}
              filter={`url(#${uid}-blur)`}
            />
          ))}
        </g>

        <circle
          cx={c}
          cy={c}
          r={size * 0.4}
          fill="none"
          stroke="#ffffff"
          strokeWidth={1.2}
          opacity={0.18}
          strokeDasharray="5 7"
          className="ss-spin-slow"
        />

        <g
          className="ss-spin-slow"
          style={{ transformBox: "fill-box", transformOrigin: "center" }}
        >
          {outerRings.map((ring, i) => (
            <circle
              key={`ring-${i}`}
              cx={c}
              cy={c}
              r={ring.r}
              fill="none"
              stroke={i % 2 === 0 ? color : "#ffffff"}
              strokeWidth={ring.w}
              opacity={ring.o}
              strokeDasharray={`${10 + i * 4} ${8 + i * 3}`}
            />
          ))}
        </g>

        <circle
          cx={c}
          cy={c}
          r={size * 0.34}
          fill="none"
          stroke={color}
          strokeWidth={1.5}
          opacity={0.25}
          className="ss-spin"
        />

        <circle
          cx={c}
          cy={c}
          r={eyeR * 1.9}
          fill={`url(#${uid}-body)`}
          className="ss-eye"
        />

        <circle
          cx={c}
          cy={c}
          r={eyeR}
          fill="#ffffff"
          stroke="#e2e8f0"
          strokeWidth={1}
        />

        <text
          x={c}
          y={size - 12}
          textAnchor="middle"
          fill="white"
          fontSize="11"
          fontFamily="system-ui, sans-serif"
          fontWeight="700"
          opacity="0.85"
          style={{ textShadow: "0 1px 4px rgba(0,0,0,0.9)" }}
        >
          {storm.name} · {Math.round(storm.wind_kt ?? storm.maxWind ?? 0)} kt · {extentKm} km dia
        </text>

        <text
          x={c}
          y={16}
          textAnchor="middle"
          fill={color}
          fontSize="10"
          fontFamily="system-ui, sans-serif"
          fontWeight="800"
          opacity="0.9"
          style={{ textShadow: "0 1px 3px rgba(0,0,0,0.85)" }}
        >
          {category.replace(/_/g, " ")}
          {isHistorical ? " · ARCHIVE" : ""}
        </text>
      </svg>

      <style>{`
        .ss-spin {
          animation: ss-rotate 55s linear infinite;
          transform-box: fill-box;
          transform-origin: center;
        }
        .ss-spin-slow {
          animation: ss-rotate 80s linear infinite;
          transform-box: fill-box;
          transform-origin: center;
        }
        .ss-eye {
          animation: ss-eye-pulse 4s ease-in-out infinite alternate;
          transform-box: fill-box;
          transform-origin: center;
        }
        @keyframes ss-rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes ss-eye-pulse {
          0% { opacity: 0.75; transform: scale(0.95); }
          100% { opacity: 1; transform: scale(1.06); }
        }
      `}</style>
    </div>
  );
}
