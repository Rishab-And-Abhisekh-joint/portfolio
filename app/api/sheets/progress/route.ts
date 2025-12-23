import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

// GET - Get user's progress
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const result = await query(
      `SELECT question_id, is_completed, is_review 
       FROM user_sheet_progress 
       WHERE user_id = $1`,
      [user.id]
    );

    const completed: Record<string, boolean> = {};
    const review: Record<string, boolean> = {};

    result.rows.forEach((row: any) => {
      if (row.is_completed) completed[row.question_id] = true;
      if (row.is_review) review[row.question_id] = true;
    });

    return NextResponse.json({ completed, review });

  } catch (error) {
    console.error('Progress fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch progress' }, { status: 500 });
  }
}

// POST - Update progress for a question
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { questionId, type, value } = await request.json();

    if (!questionId || !type) {
      return NextResponse.json({ error: 'questionId and type required' }, { status: 400 });
    }

    const column = type === 'done' ? 'is_completed' : 'is_review';

    await query(
      `INSERT INTO user_sheet_progress (user_id, question_id, ${column})
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, question_id) 
       DO UPDATE SET ${column} = $3, updated_at = NOW()`,
      [user.id, questionId, value]
    );

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Progress update error:', error);
    return NextResponse.json({ error: 'Failed to update progress' }, { status: 500 });
  }
}

// PUT - Bulk import progress
export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { questionIds } = await request.json();

    if (!questionIds || !Array.isArray(questionIds)) {
      return NextResponse.json({ error: 'questionIds array required' }, { status: 400 });
    }

    for (const qId of questionIds) {
      await query(
        `INSERT INTO user_sheet_progress (user_id, question_id, is_completed)
         VALUES ($1, $2, true)
         ON CONFLICT (user_id, question_id) 
         DO UPDATE SET is_completed = true, updated_at = NOW()`,
        [user.id, qId]
      );
    }

    return NextResponse.json({ success: true, imported: questionIds.length });

  } catch (error) {
    console.error('Bulk import error:', error);
    return NextResponse.json({ error: 'Failed to import progress' }, { status: 500 });
  }
}