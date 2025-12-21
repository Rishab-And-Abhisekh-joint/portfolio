// app/api/progress/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

// GET - Get user's progress on sheets
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const sheetId = searchParams.get('sheetId');

    if (sheetId) {
      // Get progress for a specific sheet including all problems
      const sheetProgress = await query(
        `SELECT 
          usp.problems_solved,
          usp.last_solved_at,
          usp.started_at,
          s.name as sheet_name,
          s.total_problems,
          s.category,
          ROUND((usp.problems_solved::numeric / NULLIF(s.total_problems, 0)) * 100, 2) as completion_percentage
        FROM user_sheet_progress usp
        JOIN sheets s ON s.id = usp.sheet_id
        WHERE usp.user_id = $1 AND usp.sheet_id = $2`,
        [user.id, sheetId]
      );

      // Get problem-level progress
      const problemProgress = await query(
        `SELECT 
          upp.problem_id,
          upp.status,
          upp.solved_at,
          upp.notes,
          upp.time_taken_minutes,
          upp.attempts,
          sp.problem_name,
          sp.problem_url,
          sp.platform,
          sp.difficulty,
          sp.topic,
          sp.problem_number
        FROM user_problem_progress upp
        JOIN sheet_problems sp ON sp.id = upp.problem_id
        WHERE upp.user_id = $1 AND upp.sheet_id = $2
        ORDER BY sp.problem_number`,
        [user.id, sheetId]
      );

      return NextResponse.json({
        sheetProgress: sheetProgress.rows[0] || null,
        problems: problemProgress.rows
      });
    }

    // Get overall progress across all sheets
    const overallProgress = await query(
      `SELECT 
        usp.sheet_id,
        s.name as sheet_name,
        s.category,
        s.total_problems,
        usp.problems_solved,
        usp.last_solved_at,
        usp.started_at,
        ROUND((usp.problems_solved::numeric / NULLIF(s.total_problems, 0)) * 100, 2) as completion_percentage
      FROM user_sheet_progress usp
      JOIN sheets s ON s.id = usp.sheet_id
      WHERE usp.user_id = $1
      ORDER BY usp.last_solved_at DESC`,
      [user.id]
    );

    // Get total stats
    const totalStats = await query(
      `SELECT 
        COALESCE(SUM(usp.problems_solved), 0) as total_solved,
        COUNT(DISTINCT usp.sheet_id) as sheets_started,
        MAX(usp.last_solved_at) as last_activity
      FROM user_sheet_progress usp
      WHERE usp.user_id = $1`,
      [user.id]
    );

    return NextResponse.json({
      sheets: overallProgress.rows,
      stats: totalStats.rows[0]
    });

  } catch (error) {
    console.error('Progress fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch progress' },
      { status: 500 }
    );
  }
}

// POST - Update problem progress
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { problemId, sheetId, status, notes, timeTaken } = await request.json();

    if (!problemId || !sheetId || !status) {
      return NextResponse.json(
        { error: 'Problem ID, Sheet ID, and status are required' },
        { status: 400 }
      );
    }

    // Validate status
    const validStatuses = ['unsolved', 'attempted', 'solved', 'revisit'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be: unsolved, attempted, solved, or revisit' },
        { status: 400 }
      );
    }

    // Upsert problem progress
    const result = await query(
      `INSERT INTO user_problem_progress 
       (user_id, problem_id, sheet_id, status, solved_at, notes, time_taken_minutes, attempts)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 1)
       ON CONFLICT (user_id, problem_id)
       DO UPDATE SET 
         status = $4,
         solved_at = CASE WHEN $4 = 'solved' THEN CURRENT_TIMESTAMP ELSE user_problem_progress.solved_at END,
         notes = COALESCE($6, user_problem_progress.notes),
         time_taken_minutes = COALESCE($7, user_problem_progress.time_taken_minutes),
         attempts = user_problem_progress.attempts + 1,
         updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [
        user.id,
        problemId,
        sheetId,
        status,
        status === 'solved' ? new Date() : null,
        notes,
        timeTaken
      ]
    );

    return NextResponse.json({
      success: true,
      progress: result.rows[0]
    });

  } catch (error) {
    console.error('Progress update error:', error);
    return NextResponse.json(
      { error: 'Failed to update progress' },
      { status: 500 }
    );
  }
}

// PATCH - Bulk update progress (e.g., mark multiple as solved)
export async function PATCH(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { sheetId, problemIds, status } = await request.json();

    if (!sheetId || !problemIds || !Array.isArray(problemIds) || !status) {
      return NextResponse.json(
        { error: 'Sheet ID, problem IDs array, and status are required' },
        { status: 400 }
      );
    }

    // Update each problem
    for (const problemId of problemIds) {
      await query(
        `INSERT INTO user_problem_progress 
         (user_id, problem_id, sheet_id, status, solved_at, attempts)
         VALUES ($1, $2, $3, $4, $5, 1)
         ON CONFLICT (user_id, problem_id)
         DO UPDATE SET 
           status = $4,
           solved_at = CASE WHEN $4 = 'solved' THEN CURRENT_TIMESTAMP ELSE user_problem_progress.solved_at END,
           attempts = user_problem_progress.attempts + 1,
           updated_at = CURRENT_TIMESTAMP`,
        [
          user.id,
          problemId,
          sheetId,
          status,
          status === 'solved' ? new Date() : null
        ]
      );
    }

    return NextResponse.json({
      success: true,
      updated: problemIds.length
    });

  } catch (error) {
    console.error('Bulk progress update error:', error);
    return NextResponse.json(
      { error: 'Failed to update progress' },
      { status: 500 }
    );
  }
}