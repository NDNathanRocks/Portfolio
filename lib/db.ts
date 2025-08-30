// lib/db.ts
import type { Pool } from "pg";

export type Row = {
  id: string;
  title: string;
  description: string;
  image_url: string;
  github_url: string | null;
  demo_url: string | null;
  date: string;
};

const url = process.env.POSTGRES_URL || "";
const isLocal = /localhost|127\.0\.0\.1/i.test(url);
const onVercel = process.env.VERCEL === "1";

/** Create/reuse a singleton pg Pool in dev to survive HMR */
let _pool: Pool | undefined = (globalThis as any).__pg_pool;

async function getPool(): Promise<Pool> {
  if (_pool) return _pool;
  const { Pool } = await import("pg");
  _pool = new Pool({
    connectionString: url,
    ssl: isLocal ? false : { rejectUnauthorized: false },
    max: 5,
    idleTimeoutMillis: 10_000,
  });
  if (process.env.NODE_ENV !== "production") {
    (globalThis as any).__pg_pool = _pool;
  }
  return _pool;
}

export async function getProjects(): Promise<Row[]> {
  if (onVercel) {
    // Use Vercel Postgres serverless driver in production
    const { sql } = await import("@vercel/postgres");
    const { rows } = await sql<Row>`
      SELECT
        id, title, description, image_url, github_url, demo_url,
        TO_CHAR(date, 'YYYY-MM-DD') AS date
      FROM projects
      ORDER BY date ASC;
    `;
    return rows;
  }

  // Local dev or other environments: use pg over TCP
  const pool = await getPool();
  const res = await pool.query<Row>(`
    SELECT
      id, title, description, image_url, github_url, demo_url,
      TO_CHAR(date, 'YYYY-MM-DD') AS date
    FROM projects
    ORDER BY date ASC;
  `);
  return res.rows;
}
