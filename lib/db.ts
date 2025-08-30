// lib/db.ts
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
const isLocal = /localhost|127\.0\.0\.1/.test(url);
const onVercel = process.env.VERCEL === "1";

export async function getProjects(): Promise<Row[]> {
  if (isLocal) {
    // Local dev with pg over TCP
    const { Pool } = await import("pg");
    const pool = new Pool({ connectionString: url, ssl: false });
    const res = await pool.query<Row>(`
      SELECT
        id, title, description, image_url, github_url, demo_url,
        TO_CHAR(date, 'YYYY-MM-DD') AS date
      FROM projects
      ORDER BY date ASC;
    `);
    await pool.end();
    return res.rows;
  }

  if (onVercel) {
    // Vercel: serverless driver
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

  // Other environments (e.g., remote Neon from laptop with SSL)
  const { Pool } = await import("pg");
  const pool = new Pool({ connectionString: url, ssl: { rejectUnauthorized: false } });
  const res = await pool.query<Row>(`
    SELECT
      id, title, description, image_url, github_url, demo_url,
      TO_CHAR(date, 'YYYY-MM-DD') AS date
    FROM projects
    ORDER BY date ASC;
  `);
  await pool.end();
  return res.rows;
}
