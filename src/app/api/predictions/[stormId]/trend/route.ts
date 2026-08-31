import { NextResponse } from "next/server";
import { getStormTrend } from "@/lib/stormsense/service";

interface RouteContext {
  params: Promise<{ stormId: string }>;
}

export async function GET(_: Request, { params }: RouteContext) {
  const { stormId } = await params;
  const trend = await getStormTrend(stormId);
  if (!trend) {
    return NextResponse.json({ error: "Storm not found" }, { status: 404 });
  }
  return NextResponse.json(trend, {
    headers: { "Cache-Control": "no-store" },
  });
}
