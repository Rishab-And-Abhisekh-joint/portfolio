// app/api/db-test/route.ts
// Test endpoint to verify database connection
import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  const results: any = {
    timestamp: new Date().toISOString(),
    checks: {}
  };

  // Check 1: DATABASE_URL exists
  results.checks.databaseUrlSet = !!process.env.DATABASE_URL;
  if (!process.env.DATABASE_URL) {
    results.error = 'DATABASE_URL is not set in .env.local';
    return NextResponse.json(results, { status: 500 });
  }

  // Mask the URL for display
  const url = process.env.DATABASE_URL;
  results.checks.databaseUrlPreview = url.substring(0, 30) + '...';

  // Check 2: Can connect to database
  try {
    const connectResult = await query('SELECT NOW() as time');
    results.checks.canConnect = true;
    results.checks.serverTime = connectResult.rows[0].time;
  } catch (error: any) {
    results.checks.canConnect = false;
    results.checks.connectionError = error.message;
    results.error = `Connection failed: ${error.message}`;
    return NextResponse.json(results, { status: 500 });
  }

  // Check 3: Users table exists
  try {
    const tableResult = await query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'users'
      ) as exists
    `);
    results.checks.usersTableExists = tableResult.rows[0].exists;
  } catch (error: any) {
    results.checks.usersTableExists = false;
    results.checks.tableError = error.message;
  }

  // Check 4: Admin user exists
  try {
    const userResult = await query(`
      SELECT email, username, name, profile_complete 
      FROM users 
      WHERE email = 'rishab.acharjee12345@gmail.com'
    `);
    results.checks.adminUserExists = userResult.rows.length > 0;
    if (userResult.rows.length > 0) {
      results.checks.adminUser = {
        email: userResult.rows[0].email,
        username: userResult.rows[0].username,
        name: userResult.rows[0].name
      };
    }
  } catch (error: any) {
    results.checks.adminUserExists = false;
    results.checks.userError = error.message;
  }

  // Summary
  const allPassed = results.checks.canConnect && 
                    results.checks.usersTableExists && 
                    results.checks.adminUserExists;
  
  results.status = allPassed ? 'All checks passed! ✅' : 'Some checks failed ❌';
  results.nextSteps = [];

  if (!results.checks.usersTableExists) {
    results.nextSteps.push('Run schema.sql in your Render database console');
  }
  if (!results.checks.adminUserExists && results.checks.usersTableExists) {
    results.nextSteps.push('Run the INSERT statement from schema.sql to create admin user');
  }

  return NextResponse.json(results, { 
    status: allPassed ? 200 : 500 
  });
}
