const fs = require('fs');
const path = require('path');

// Load environment variables from .env.local if present
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
      // Strip outer quotes if any
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
  console.error("DATABASE_URL environment variable is not defined.");
  process.exit(1);
}


const client = new Client({
  connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});

async function main() {
  try {
    await client.connect();
    console.log("Connected successfully to PostgreSQL database. Checking column types...");
    
    const res1 = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'profiles';
    `);
    console.log("Profiles columns:", res1.rows);

    const res2 = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'bookings';
    `);
    console.log("Bookings columns:", res2.rows);

    const res3 = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'products';
    `);
    console.log("Products columns:", res3.rows);

    const res4 = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'inventory_units';
    `);
    console.log("Inventory Units columns:", res4.rows);

    const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '20260717120000_admin_features.sql');

    const sql = fs.readFileSync(migrationPath, 'utf8');
    
    console.log("Applying schema queries...");
    await client.query(sql);
    console.log("Database migration 20260717120000_admin_features applied successfully!");
  } catch (err) {
    console.error("Fatal error during migration execution:", err);
    process.exit(1);
  } finally {
    await client.end();
  }
}



main();
