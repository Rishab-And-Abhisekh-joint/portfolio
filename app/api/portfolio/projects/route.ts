// app/api/portfolio/projects/route.ts
import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { isAuthenticated } from '@/lib/auth';

// GET - Fetch all projects
export async function GET() {
  try {
    const result = await query(`
      SELECT p.* FROM projects p
      JOIN users u ON p.user_id = u.id
      ORDER BY p.sort_order
    `);
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Projects fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
  }
}

// POST - Create new project (protected)
export async function POST(request: Request) {
  try {
    const { authenticated, user } = await isAuthenticated(request);
    if (!authenticated || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const data = await request.json();
    
    const result = await query(`
      INSERT INTO projects (user_id, title, date, description, highlights, tech_stack, image_url, github_url, demo_url, color, sort_order)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `, [
      user.id,
      data.title,
      data.date,
      data.description,
      JSON.stringify(data.highlights || []),
      JSON.stringify(data.tech_stack || []),
      data.image_url,
      data.github_url,
      data.demo_url,
      data.color || 'from-cyan-500 to-blue-600',
      data.sort_order || 0
    ]);

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Project create error:', error);
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
  }
}

// PUT - Update project (protected)
export async function PUT(request: Request) {
  try {
    const { authenticated, user } = await isAuthenticated(request);
    if (!authenticated || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const data = await request.json();
    
    if (!data.id) {
      return NextResponse.json({ error: 'Project ID required' }, { status: 400 });
    }

    const result = await query(`
      UPDATE projects SET
        title = COALESCE($1, title),
        date = COALESCE($2, date),
        description = COALESCE($3, description),
        highlights = COALESCE($4, highlights),
        tech_stack = COALESCE($5, tech_stack),
        image_url = COALESCE($6, image_url),
        github_url = COALESCE($7, github_url),
        demo_url = COALESCE($8, demo_url),
        color = COALESCE($9, color),
        sort_order = COALESCE($10, sort_order)
      WHERE id = $11 AND user_id = $12
      RETURNING *
    `, [
      data.title, data.date, data.description,
      data.highlights ? JSON.stringify(data.highlights) : null,
      data.tech_stack ? JSON.stringify(data.tech_stack) : null,
      data.image_url, data.github_url, data.demo_url, data.color,
      data.sort_order,
      data.id, user.id
    ]);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Project update error:', error);
    return NextResponse.json({ error: 'Failed to update project' }, { status: 500 });
  }
}

// DELETE - Delete project (protected)
export async function DELETE(request: Request) {
  try {
    const { authenticated, user } = await isAuthenticated(request);
    if (!authenticated || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Project ID required' }, { status: 400 });
    }

    await query('DELETE FROM projects WHERE id = $1 AND user_id = $2', [id, user.id]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Project delete error:', error);
    return NextResponse.json({ error: 'Failed to delete project' }, { status: 500 });
  }
}
