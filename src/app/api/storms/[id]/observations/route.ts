import { NextResponse } from "next/server";
import { getStormObservations } from "@/lib/stormsense/service";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_: Request, { params }: RouteContext) {
  const { id } = await params;
  const observations = await getStormObservations(id);
  return NextResponse.json(observations, {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
