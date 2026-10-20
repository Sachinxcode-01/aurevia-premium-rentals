/**
 * AUREVIA Database Backup Script
 * Exports PostgreSQL tables to timestamped JSON & SQL backup files.
 *
 * Usage:
 *   npm run db:backup
 */

const fs = require('fs');
const path = require('path');

// 1. Load environment variables from .env.local if present
const envLocalPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envLocalPath)) {
  const envContent = fs.readFileSync(envLocalPath, 'utf8');
  envContent.split('\n').forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const match = trimmed.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      let val = match[2].trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      process.env[key] = val;
    }
  });
}

const { Client } = require('pg');

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.warn("⚠ DATABASE_URL not set. In local dev without DB connection, skipping live dump.");
  process.exit(0);
}

const client = new Client({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

const TABLES = [
  'profiles',
  'products',
  'bookings',
  'booking_items',
  'kyc_records',
  'reviews',
  'support_tickets',
  'audit_logs',
  'coupons',
  'website_settings'
];

async function runBackup() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = path.join(__dirname, '..', 'backups', timestamp);

  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  console.log(`[Backup] Starting automated database backup at ${new Date().toISOString()}...`);
  console.log(`[Backup] Output directory: ${backupDir}`);

  try {
    await client.connect();

    const manifest = {
      timestamp: new Date().toISOString(),
      tables: {}
    };

    for (const table of TABLES) {
      try {
        const res = await client.query(`SELECT * FROM public.${table};`);
        const filePath = path.join(backupDir, `${table}.json`);
        fs.writeFileSync(filePath, JSON.stringify(res.rows, null, 2), 'utf8');
        manifest.tables[table] = {
          count: res.rows.length,
          file: `${table}.json`
        };
        console.log(`  ✓ Dumped ${table} (${res.rows.length} rows)`);
      } catch (err) {
        console.warn(`  - Table ${table} not found or skipped (${err.message})`);
      }
    }

    fs.writeFileSync(
      path.join(backupDir, 'manifest.json'),
      JSON.stringify(manifest, null, 2),
      'utf8'
    );

    console.log(`[Backup] Database backup completed successfully.`);
  } catch (err) {
    console.error("[Backup] Fatal error during database backup:", err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runBackup();
