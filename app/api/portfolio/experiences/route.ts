// app/api/portfolio/experiences/route.ts
import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { isAuthenticated } from '@/lib/auth';

// GET - Fetch all experiences
export async function GET() {
  try {
    const result = await query(`
      SELECT e.* FROM experiences e
      JOIN users u ON e.user_id = u.id
      ORDER BY e.sort_order
    `);
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Experiences fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch experiences' }, { status: 500 });
  }
}

// POST - Create new experience (protected)
export async function POST(request: Request) {
  try {
    const { authenticated, user } = await isAuthenticated(request);
    if (!authenticated || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const data = await request.json();
    
    const result = await query(`
      INSERT INTO experiences (user_id, company, role, period, location, type, certification_link, highlights, sort_order)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `, [
      user.id,
      data.company,
      data.role,
      data.period,
      data.location,
      data.type || 'Completed',
      data.certification_link,
      JSON.stringify(data.highlights || []),
      data.sort_order || 0
    ]);

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Experience create error:', error);
    return NextResponse.json({ error: 'Failed to create experience' }, { status: 500 });
  }
}

// PUT - Update experience (protected)
export async function PUT(request: Request) {
  try {
    const { authenticated, user } = await isAuthenticated(request);
    if (!authenticated || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const data = await request.json();
    
    if (!data.id) {
      return NextResponse.json({ error: 'Experience ID required' }, { status: 400 });
    }

    const result = await query(`
      UPDATE experiences SET
        company = COALESCE($1, company),
        role = COALESCE($2, role),
        period = COALESCE($3, period),
        location = COALESCE($4, location),
        type = COALESCE($5, type),
        certification_link = COALESCE($6, certification_link),
        highlights = COALESCE($7, highlights),
        sort_order = COALESCE($8, sort_order)
      WHERE id = $9 AND user_id = $10
      RETURNING *
    `, [
      data.company, data.role, data.period, data.location,
      data.type, data.certification_link,
      data.highlights ? JSON.stringify(data.highlights) : null,
      data.sort_order,
      data.id, user.id
    ]);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Experience not found' }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Experience update error:', error);
    return NextResponse.json({ error: 'Failed to update experience' }, { status: 500 });
  }
}

// DELETE - Delete experience (protected)
export async function DELETE(request: Request) {
  try {
    const { authenticated, user } = await isAuthenticated(request);
    if (!authenticated || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Experience ID required' }, { status: 400 });
    }

    await query('DELETE FROM experiences WHERE id = $1 AND user_id = $2', [id, user.id]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Experience delete error:', error);
    return NextResponse.json({ error: 'Failed to delete experience' }, { status: 500 });
  }
}
