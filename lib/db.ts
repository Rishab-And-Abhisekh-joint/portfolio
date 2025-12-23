// lib/db.ts
import { Pool } from 'pg';

// Check if DATABASE_URL exists
if (!process.env.DATABASE_URL) {
  console.warn('WARNING: DATABASE_URL is not set. Database features will not work.');
}

// Create connection pool with proper SSL for Render
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Render requires SSL
  ssl: process.env.DATABASE_URL ? {
    rejectUnauthorized: false  // Required for Render PostgreSQL
  } : false,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,  // 10 second timeout
});

// Test connection
pool.on('connect', () => {
  console.log('✅ Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('❌ Database pool error:', err.message);
});

// Query helper with error handling
export async function query(text: string, params?: any[]) {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Query executed', { 
      query: text.substring(0, 50) + '...', 
      duration: `${duration}ms`, 
      rows: res.rowCount 
    });
    return res;
  } catch (error: any) {
    console.error('❌ Database query error:', error.message);
    throw error;
  }
}

// Get a client from the pool for transactions
export async function getClient() {
  const client = await pool.connect();
  return client;
}

// Helper to run transactions
export async function transaction<T>(callback: (client: any) => Promise<T>): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
// Add this function to your existing lib/db.ts

export function isDatabaseConfigured(): boolean {
  return !!(
    process.env.DATABASE_URL || 
    (process.env.PGHOST && process.env.PGDATABASE && process.env.PGUSER)
  );
}

// Test database connection
export async function testConnection(): Promise<boolean> {
  try {
    const result = await pool.query('SELECT NOW()');
    console.log('✅ Database connection test successful:', result.rows[0].now);
    return true;
  } catch (error: any) {
    console.error('❌ Database connection test failed:', error.message);
    return false;
  }
}

export default pool;
