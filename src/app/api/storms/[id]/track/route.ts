import { NextResponse } from "next/server";
import { getStormTrack } from "@/lib/stormsense/service";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_: Request, { params }: RouteContext) {
  const { id } = await params;
  const track = await getStormTrack(id);
  return NextResponse.json(track, {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
