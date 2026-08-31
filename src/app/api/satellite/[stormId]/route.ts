import { NextResponse } from "next/server";
import { getStormSatellite } from "@/lib/stormsense/service";

interface RouteContext {
  params: Promise<{ stormId: string }>;
}

export async function GET(_: Request, { params }: RouteContext) {
  const { stormId } = await params;
  const satellite = await getStormSatellite(stormId);
  return NextResponse.json(satellite, {
    headers: { "Cache-Control": "no-store" },
  });
}
