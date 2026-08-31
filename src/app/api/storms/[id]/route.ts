import { NextResponse } from "next/server";
import { getStormDetail } from "@/lib/stormsense/service";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_: Request, { params }: RouteContext) {
  const { id } = await params;
  const storm = await getStormDetail(id);
  if (!storm) {
    return NextResponse.json({ error: "Storm not found" }, { status: 404 });
  }

  return NextResponse.json(storm, {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
