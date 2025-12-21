// app/api/sheets/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

// GET - Get all sheets or a specific sheet
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sheetId = searchParams.get('id');
    const category = searchParams.get('category');

    let result;

    if (sheetId) {
      // Get specific sheet with its problems
      result = await query(
        `SELECT s.*, 
          (SELECT COUNT(*) FROM sheet_problems WHERE sheet_id = s.id) as problem_count,
          json_agg(
            json_build_object(
              'id', sp.id,
              'name', sp.problem_name,
              'url', sp.problem_url,
              'platform', sp.platform,
              'difficulty', sp.difficulty,
              'topic', sp.topic,
              'number', sp.problem_number
            ) ORDER BY sp.problem_number
          ) FILTER (WHERE sp.id IS NOT NULL) as problems
        FROM sheets s
        LEFT JOIN sheet_problems sp ON sp.sheet_id = s.id
        WHERE s.id = $1
        GROUP BY s.id`,
        [sheetId]
      );

      if (result.rows.length === 0) {
        return NextResponse.json({ error: 'Sheet not found' }, { status: 404 });
      }

      return NextResponse.json(result.rows[0]);
    }

    // Get all sheets
    let queryText = `
      SELECT s.*, 
        (SELECT COUNT(*) FROM sheet_problems WHERE sheet_id = s.id) as problem_count
      FROM sheets s
    `;
    const params: any[] = [];

    if (category) {
      queryText += ' WHERE s.category = $1';
      params.push(category);
    }

    queryText += ' ORDER BY s.created_at DESC';

    result = await query(queryText, params);

    return NextResponse.json({ sheets: result.rows });

  } catch (error) {
    console.error('Sheets fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sheets' },
      { status: 500 }
    );
  }
}

// POST - Create a new sheet (admin only in future)
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { name, description, category, difficulty, problems } = await request.json();

    if (!name) {
      return NextResponse.json({ error: 'Sheet name is required' }, { status: 400 });
    }

    // Create the sheet
    const sheetResult = await query(
      `INSERT INTO sheets (name, description, category, difficulty, total_problems)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [name, description, category, difficulty, problems?.length || 0]
    );

    const sheet = sheetResult.rows[0];

    // Add problems if provided
    if (problems && problems.length > 0) {
      for (let i = 0; i < problems.length; i++) {
        const p = problems[i];
        await query(
          `INSERT INTO sheet_problems 
           (sheet_id, problem_name, problem_url, platform, difficulty, topic, problem_number)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [sheet.id, p.name, p.url, p.platform, p.difficulty, p.topic, i + 1]
        );
      }
    }

    return NextResponse.json({ success: true, sheet });

  } catch (error) {
    console.error('Sheet creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create sheet' },
      { status: 500 }
    );
  }
}