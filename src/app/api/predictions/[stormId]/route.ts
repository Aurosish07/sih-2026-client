import { NextResponse } from "next/server";
import { getStormPrediction } from "@/lib/stormsense/service";

interface RouteContext {
  params: Promise<{ stormId: string }>;
}

export async function GET(_: Request, { params }: RouteContext) {
  const { stormId } = await params;
  const prediction = await getStormPrediction(stormId);
  if (!prediction) {
    return NextResponse.json({ error: "Storm not found" }, { status: 404 });
  }
  return NextResponse.json(prediction, {
    headers: { "Cache-Control": "no-store" },
  });
}
