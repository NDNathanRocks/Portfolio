// lib/db.ts
import type { QueryResult } from "pg";

const url = process.env.POSTGRES_URL || "";
const isLocal = /localhost|127\.0\.0\.1/i.test(url);

type Row = {
  id: string;
  title: string;
  description: string;
  image_url: string;
  github_url: string | null;
  demo_url: string | null;
  date: string;
};

async function queryLocal(sqlText: string): Promise<QueryResult<Row>> {
  const { Pool } = await import("pg");
  const pool = new Pool({
    connectionString: url,
    ssl: false, // local
  });
  const res = await pool.query<Row>(`
    SELECT
      id,
      title,
      description,
      image_url,
      github_url,
      demo_url,
      TO_CHAR(date, 'YYYY-MM-DD') AS date
    FROM projects
    ORDER BY date ASC;
  `);
  await pool.end();
  return res;
}

async function queryServerless(sqlText: string): Promise<{ rows: Row[] }> {
  // Used on Vercel/Neon
  const { sql } = await import("@vercel/postgres");
  const { rows } = await sql<Row>`SELECT 1`; // warm-up (optional)
  // Re-run actual query using @vercel/postgres' tagged template:
  const result = await (async () => {
    // Manually map to tagged template style for one static query:
    const { sql } = await import("@vercel/postgres");
    // NOTE: since our query is static below, we just inline it again
    // and rely on serverless driver in production.
    const { rows } = await sql<Row>`
      SELECT id, title, description, image_url, github_url, demo_url, date
      FROM projects
      ORDER BY date ASC;
    `;
    return { rows };
  })();
  return result;
}

export async function getProjects(): Promise<Row[]> {
  if (isLocal) {
    const { rows } = await queryLocal(`
      SELECT id, title, description, image_url, github_url, demo_url, date
      FROM projects
      ORDER BY date ASC;
    `);
    return rows;
  }
  const { rows } = await queryServerless(`
    SELECT id, title, description, image_url, github_url, demo_url, date
    FROM projects
    ORDER BY date ASC;
  `);
  return rows;
}
