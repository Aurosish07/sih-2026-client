"use client";

import dynamic from "next/dynamic";
import type { Storm, TrackPoint } from "@/lib/types";

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
  storms?: Storm[];
  onSelectStorm?: (stormId: string) => void;
  className?: string;
  hideOverlays?: boolean;
}

export default function CycloneMapWrapper(props: CycloneMapWrapperProps) {
  return <CycloneMap {...props} />;
}
