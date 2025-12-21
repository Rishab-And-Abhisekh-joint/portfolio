// app/api/leaderboard/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// GET - Get leaderboard
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sheetId = searchParams.get('sheetId');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const timeframe = searchParams.get('timeframe'); // 'week', 'month', 'all'

    let result;

    if (sheetId) {
      // Leaderboard for a specific sheet
      let queryText = `
        SELECT 
          u.id as user_id,
          u.username,
          u.name,
          p.avatar_url,
          usp.problems_solved,
          usp.last_solved_at,
          s.total_problems,
          ROUND((usp.problems_solved::numeric / NULLIF(s.total_problems, 0)) * 100, 2) as completion_percentage,
          RANK() OVER (ORDER BY usp.problems_solved DESC, usp.last_solved_at ASC) as rank
        FROM user_sheet_progress usp
        JOIN users u ON u.id = usp.user_id
        JOIN sheets s ON s.id = usp.sheet_id
        LEFT JOIN profiles p ON p.user_id = u.id
        WHERE usp.sheet_id = $1
      `;

      const params: any[] = [sheetId];

      // Add timeframe filter
      if (timeframe === 'week') {
        queryText += ` AND usp.last_solved_at >= NOW() - INTERVAL '7 days'`;
      } else if (timeframe === 'month') {
        queryText += ` AND usp.last_solved_at >= NOW() - INTERVAL '30 days'`;
      }

      queryText += `
        ORDER BY usp.problems_solved DESC, usp.last_solved_at ASC
        LIMIT $2 OFFSET $3
      `;
      params.push(limit, offset);

      result = await query(queryText, params);

      // Get total count
      const countResult = await query(
        `SELECT COUNT(*) as total FROM user_sheet_progress WHERE sheet_id = $1`,
        [sheetId]
      );

      return NextResponse.json({
        leaderboard: result.rows,
        total: parseInt(countResult.rows[0].total),
        limit,
        offset
      });
    }

    // Overall leaderboard
    let queryText = `
      SELECT 
        u.id as user_id,
        u.username,
        u.name,
        p.avatar_url,
        COALESCE(SUM(usp.problems_solved), 0) as total_solved,
        COUNT(DISTINCT usp.sheet_id) as sheets_completed,
        MAX(usp.last_solved_at) as last_activity,
        RANK() OVER (ORDER BY COALESCE(SUM(usp.problems_solved), 0) DESC) as rank
      FROM users u
      LEFT JOIN profiles p ON p.user_id = u.id
      LEFT JOIN user_sheet_progress usp ON usp.user_id = u.id
    `;

    const params: any[] = [];
    let paramIndex = 1;

    // Add timeframe filter
    if (timeframe === 'week') {
      queryText += ` WHERE usp.last_solved_at >= NOW() - INTERVAL '7 days'`;
    } else if (timeframe === 'month') {
      queryText += ` WHERE usp.last_solved_at >= NOW() - INTERVAL '30 days'`;
    }

    queryText += `
      GROUP BY u.id, u.username, u.name, p.avatar_url
      HAVING COALESCE(SUM(usp.problems_solved), 0) > 0
      ORDER BY total_solved DESC, last_activity ASC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    params.push(limit, offset);

    result = await query(queryText, params);

    // Get total active users count
    const countResult = await query(
      `SELECT COUNT(DISTINCT user_id) as total FROM user_sheet_progress`
    );

    return NextResponse.json({
      leaderboard: result.rows,
      total: parseInt(countResult.rows[0].total),
      limit,
      offset
    });

  } catch (error) {
    console.error('Leaderboard fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard' },
      { status: 500 }
    );
  }
}

// GET user's rank
export async function POST(request: NextRequest) {
  try {
    const { userId, sheetId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    let result;

    if (sheetId) {
      // Get rank in specific sheet
      result = await query(
        `SELECT rank FROM (
          SELECT 
            user_id,
            RANK() OVER (ORDER BY problems_solved DESC, last_solved_at ASC) as rank
          FROM user_sheet_progress
          WHERE sheet_id = $1
        ) ranked
        WHERE user_id = $2`,
        [sheetId, userId]
      );
    } else {
      // Get overall rank
      result = await query(
        `SELECT rank FROM (
          SELECT 
            user_id,
            RANK() OVER (ORDER BY SUM(problems_solved) DESC) as rank
          FROM user_sheet_progress
          GROUP BY user_id
        ) ranked
        WHERE user_id = $1`,
        [userId]
      );
    }

    if (result.rows.length === 0) {
      return NextResponse.json({ rank: null, message: 'User not ranked yet' });
    }

    return NextResponse.json({ rank: parseInt(result.rows[0].rank) });

  } catch (error) {
    console.error('Rank fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch rank' },
      { status: 500 }
    );
  }
}