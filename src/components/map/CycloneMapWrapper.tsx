"use client";

import dynamic from "next/dynamic";
import type { Storm, TrackPoint } from "@/lib/types";
import type { BasemapKind, ConeCircle } from "./CycloneMap";

const CycloneMap = dynamic(() => import("./CycloneMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-[#081018] text-sm text-slate-400">
      Loading map...
    </div>
  ),
});

interface CycloneMapWrapperProps {
  storm: Storm | null;
  track: TrackPoint[];
  forecastTrack?: TrackPoint[];
  cone?: ConeCircle[];
  storms?: Storm[];
  onSelectStorm?: (stormId: string) => void;
  className?: string;
  hideOverlays?: boolean;
  basemap?: BasemapKind;
}

export default function CycloneMapWrapper(props: CycloneMapWrapperProps) {
  return <CycloneMap {...props} />;
}
