import { NextResponse } from "next/server";
import { getStormSatellite } from "@/lib/stormsense/service";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_: Request, { params }: RouteContext) {
  const { id } = await params;
  const satellite = await getStormSatellite(id);
  return NextResponse.json(satellite, {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
