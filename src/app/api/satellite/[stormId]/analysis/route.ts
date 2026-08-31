import { NextResponse } from "next/server";
import { getStormSatellite } from "@/lib/stormsense/service";

interface RouteContext {
  params: Promise<{ stormId: string }>;
}

export async function GET(_: Request, { params }: RouteContext) {
  const { stormId } = await params;
  const images = await getStormSatellite(stormId);
  if (images.length === 0) {
    return NextResponse.json({ error: "Storm not found" }, { status: 404 });
  }

  const analysis = {
    scores: {
      disturbance: 0.08,
      organizing: 0.17,
      organized_storm: 0.29,
      mature_cyclone: 0.31,
      weakening: 0.09,
      dissipating: 0.02,
      clear: 0.04,
    },
    dominantPattern: "mature_cyclone",
    confidence: 0.84,
    timestamp: images[images.length - 1].timestamp,
  };

  return NextResponse.json(analysis, {
    headers: { "Cache-Control": "no-store" },
  });
}
