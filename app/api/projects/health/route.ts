// app/api/health/route.ts
export const runtime = "nodejs"; // ensure Node runtime on Vercel

import { NextResponse } from "next/server";

export async function GET() {
  const result: any = {
    vercel: process.env.VERCEL === "1",
    has_POSTGRES_URL: Boolean(process.env.POSTGRES_URL),
    driver: process.env.VERCEL === "1" ? "@vercel/postgres" : "pg",
  };

  try {
    if (process.env.VERCEL === "1") {
      const { sql } = await import("@vercel/postgres");
      const { rows } = await sql<{ count: string }>`SELECT COUNT(*)::text AS count FROM projects;`;
      result.ok = true;
      result.count = rows?.[0]?.count ?? "0";
    } else {
      const { Pool } = await import("pg");
      const pool = new Pool({
        connectionString: process.env.POSTGRES_URL,
        ssl: /localhost|127\.0\.0\.1/i.test(process.env.POSTGRES_URL || "")
          ? false
          : { rejectUnauthorized: false },
      });
      const r = await pool.query<{ count: string }>("SELECT COUNT(*)::text AS count FROM projects;");
      await pool.end();
      result.ok = true;
      result.count = r.rows?.[0]?.count ?? "0";
    }
    return NextResponse.json(result);
  } catch (e: any) {
    result.ok = false;
    result.error = e?.message || String(e);
    return NextResponse.json(result, { status: 500 });
  }
}
