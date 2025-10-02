import fs from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';
import pg from 'pg';
const { Pool } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const sql = fs.readFileSync(path.join(__dirname, '../db/schema.sql'), 'utf8');
  const client = await pool.connect();
  try {
    await client.query(sql);
    console.log('Schema criado/atualizado.');
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
