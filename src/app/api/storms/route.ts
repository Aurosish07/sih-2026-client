import { NextResponse } from "next/server";
import { listStorms } from "@/lib/stormsense/service";

export async function GET() {
  const storms = await listStorms();
  return NextResponse.json(storms, {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
