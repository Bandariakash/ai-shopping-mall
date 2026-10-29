const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const { supabaseAdmin } = require('./supabase');

// ─── PostgreSQL Pool (via pg) ────────────────────────────────────────────────
// Used for complex raw SQL queries, JOINs, and multi-step transactions.
// Points to Supabase's PostgreSQL over the Session-mode pooler (port 5432).
// SSL is always required by Supabase.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },  // Supabase uses a self-signed cert
  max: 10,                             // Stay within Supabase free-tier limit
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

// Log first successful connection
pool.once('connect', () => {
  console.log('✅ PostgreSQL pool connected to Supabase');
});

pool.on('error', (err) => {
  console.error('❌ PostgreSQL pool error:', err.message);
});

// ─── Schema Initializer ──────────────────────────────────────────────────────
/**
 * Run schema.sql against Supabase.
 * Supabase's transaction-mode pooler (port 6543) does NOT support multi-statement
 * queries, so we split the SQL file on semicolons and run each statement
 * individually through the SESSION pooler pool (port 5432).
 */
async function initializeDatabase() {
  const client = await pool.connect();
  try {
    console.log('🔧 Running database schema + seed via Supabase PostgreSQL...');
    const sqlPath = path.join(__dirname, 'schema.sql');
    const rawSql = fs.readFileSync(sqlPath, 'utf-8');

    // Split on semicolons, strip empty statements
    const statements = rawSql
      .split(';')
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !s.startsWith('--'));

    for (const stmt of statements) {
      await client.query(stmt);
    }

    console.log('✅ Supabase database initialized successfully');
  } catch (err) {
    // Non-fatal: tables may already exist (IF NOT EXISTS guards) or
    // user may have applied schema manually in the Supabase SQL editor.
    console.warn('⚠️  DB init warning (may be safe to ignore):', err.message);
  } finally {
    client.release();
  }
}

// ─── Parameterized Query Helper ──────────────────────────────────────────────
/**
 * Execute a parameterized SQL query against Supabase PostgreSQL.
 * Always uses $1, $2 ... positional placeholders — never string interpolation.
 *
 * @param {string} text   - Parameterized SQL string
 * @param {Array}  params - Query parameter values
 * @returns {Promise<import('pg').QueryResult>}
 */
async function query(text, params) {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    if (process.env.NODE_ENV === 'development') {
      const ms = Date.now() - start;
      console.log(`📊 [Supabase SQL] ${ms}ms | rows:${result.rowCount} | ${text.slice(0, 70).replace(/\s+/g, ' ')}`);
    }
    return result;
  } catch (err) {
    console.error('❌ [Supabase SQL] Error:', err.message, '| Query:', text.slice(0, 80));
    throw err;
  }
}

// ─── Health Check ────────────────────────────────────────────────────────────
/**
 * Ping Supabase PostgreSQL to verify connectivity.
 * Called during server startup.
 */
async function checkDatabaseConnection() {
  try {
    const result = await query('SELECT NOW() as current_time');
    console.log(`✅ Supabase DB ping OK — server time: ${result.rows[0].current_time}`);
    return true;
  } catch (err) {
    console.error('❌ Supabase DB connection failed:', err.message);
    return false;
  }
}

module.exports = { pool, query, initializeDatabase, checkDatabaseConnection, supabaseAdmin };
