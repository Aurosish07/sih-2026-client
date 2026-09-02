import { NextRequest, NextResponse } from "next/server";
import { buildLiveMonitoring } from "@/lib/live/service";

export async function GET(request: NextRequest) {
  const storm = request.nextUrl.searchParams.get("storm") ?? undefined;
  const data = await buildLiveMonitoring({ stormId: storm });

  return NextResponse.json(data, {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}