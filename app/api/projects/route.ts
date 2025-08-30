import { NextResponse } from "next/server";
import { getProjects } from "@/lib/db";

export const runtime = "nodejs"

export async function GET() {
  try {
    const rows = await getProjects();
    return NextResponse.json({ projects: rows });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
