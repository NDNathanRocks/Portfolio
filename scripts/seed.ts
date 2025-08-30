// scripts/seed.ts
import { config as load } from "dotenv";
load({ path: ".env.local" });

import { Pool } from "pg";

const connectionString = process.env.POSTGRES_URL!;
if (!connectionString) {
  throw new Error("POSTGRES_URL is missing");
}

const isLocal = /localhost|127\.0\.0\.1/i.test(connectionString);

const pool = new Pool({
  connectionString,
  ssl: isLocal ? false : { rejectUnauthorized: false },
});

async function main() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      image_url TEXT NOT NULL,
      github_url TEXT,
      demo_url TEXT,
      date DATE NOT NULL
    );
  `);

  await pool.query(`DELETE FROM projects;`);

  await pool.query(`
    INSERT INTO projects (id, title, description, image_url, github_url, demo_url, date) VALUES
    ('2023-01-binit', 'BinIt! (Smart Sorting App)', 'Gamified waste sorting using CV & React Native.', 'https://images.unsplash.com/photo-1556761175-b413da4baf72?q=80&w=800&auto=format&fit=crop', 'https://github.com/', null, '2023-03-01'),
    ('2023-10-wecare', 'WeCare Medicine Scheduler', 'Medication scheduling app with reminders and analytics.', 'https://images.unsplash.com/photo-1517705008128-361805f42e86?q=80&w=800&auto=format&fit=crop', 'https://github.com/', null, '2023-10-15'),
    ('2024-04-helpinghands', 'HelpingHands Assistive Glove', 'Assistive glove prototype; prize-winning social innovation.', 'https://images.unsplash.com/photo-1520975916090-3105956dac38?q=80&w=800&auto=format&fit=crop', 'https://github.com/', null, '2024-04-21'),
    ('2024-11-rfp-utility', 'RFP Utility (Fraser Health)', 'PySide6 app automating RFPs, invoices & audits; ~90% productivity lift.', 'https://images.unsplash.com/photo-1587620962725-abab7fe55159?q=80&w=800&auto=format&fit=crop', 'https://github.com/', null, '2024-11-10'),
    ('2025-03-404-sanity', '404-Sanity-Not-Found (Game)', 'Mountain Madness 2025 winner: puzzle game built in 24h.', 'https://images.unsplash.com/photo-1526948128573-703ee1aeb6fa?q=80&w=800&auto=format&fit=crop', 'https://github.com/', null, '2025-03-01'),
    ('2025-05-ocr-audit', 'OCR Audit Toolkit', 'Python + EasyOCR automated operational audits (+65% efficiency).', 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?q=80&w=800&auto=format&fit=crop', 'https://github.com/', null, '2025-05-15')
  `);

  console.log("Seed complete ✅");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await pool.end();
  });
