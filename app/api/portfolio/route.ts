// app/api/portfolio/route.ts
import { NextResponse } from 'next/server';
import { query, isDatabaseConfigured } from '@/lib/db';
import { isAuthenticated } from '@/lib/auth';

// GET - Fetch portfolio data (public)
export async function GET() {
  try {
    // Return default data if database is not configured
    if (!isDatabaseConfigured()) {
      return NextResponse.json({
        portfolio: null,
        experiences: [],
        projects: [],
        skills: [],
        skillsProgress: [],
        achievements: [],
        featureCards: []
      });
    }

    // Get the first user's portfolio data (single admin user)
    const portfolioResult = await query(`
      SELECT pd.*, u.name as user_name, u.theme
      FROM portfolio_data pd
      JOIN users u ON pd.user_id = u.id
      LIMIT 1
    `);

    if (portfolioResult.rows.length === 0) {
      // Return default data if not set up
      return NextResponse.json({
        portfolio: null,
        experiences: [],
        projects: [],
        skills: [],
        skillsProgress: [],
        achievements: [],
        featureCards: []
      });
    }

    const portfolio = portfolioResult.rows[0];
    const userId = portfolio.user_id;

    // Fetch related data
    const [experiences, projects, skills, skillsProgress, achievements, featureCards] = await Promise.all([
      query('SELECT * FROM experiences WHERE user_id = $1 ORDER BY sort_order', [userId]),
      query('SELECT * FROM projects WHERE user_id = $1 ORDER BY sort_order', [userId]),
      query('SELECT * FROM skills WHERE user_id = $1 ORDER BY sort_order', [userId]),
      query('SELECT * FROM skills_progress WHERE user_id = $1 ORDER BY category, sort_order', [userId]),
      query('SELECT * FROM achievements WHERE user_id = $1 ORDER BY sort_order', [userId]),
      query('SELECT * FROM feature_cards WHERE user_id = $1 ORDER BY sort_order', [userId]),
    ]);

    return NextResponse.json({
      portfolio,
      experiences: experiences.rows,
      projects: projects.rows,
      skills: skills.rows,
      skillsProgress: skillsProgress.rows,
      achievements: achievements.rows,
      featureCards: featureCards.rows
    });
  } catch (error) {
    console.error('Portfolio fetch error:', error);
    // Return empty data instead of error to prevent loading issues
    return NextResponse.json({
      portfolio: null,
      experiences: [],
      projects: [],
      skills: [],
      skillsProgress: [],
      achievements: [],
      featureCards: []
    });
  }
}

// PUT - Update portfolio data (protected)
export async function PUT(request: Request) {
  try {
    if (!isDatabaseConfigured()) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 503 }
      );
    }

    const { authenticated, user } = await isAuthenticated(request);

    if (!authenticated || !user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const data = await request.json();

    // Update portfolio_data
    if (data.portfolio) {
      const p = data.portfolio;
      await query(`
        UPDATE portfolio_data SET
          hero_title = COALESCE($1, hero_title),
          hero_subtitle = COALESCE($2, hero_subtitle),
          hero_description = COALESCE($3, hero_description),
          hero_status = COALESCE($4, hero_status),
          about_title = COALESCE($5, about_title),
          about_paragraphs = COALESCE($6, about_paragraphs),
          profile_image_url = COALESCE($7, profile_image_url),
          sgpa = COALESCE($8, sgpa),
          internships_count = COALESCE($9, internships_count),
          github_url = COALESCE($10, github_url),
          linkedin_url = COALESCE($11, linkedin_url),
          email = COALESCE($12, email),
          phone = COALESCE($13, phone),
          resume_url = COALESCE($14, resume_url),
          leetcode_handle = COALESCE($15, leetcode_handle),
          codeforces_handle = COALESCE($16, codeforces_handle),
          codechef_handle = COALESCE($17, codechef_handle)
        WHERE user_id = $18
      `, [
        p.hero_title, p.hero_subtitle, p.hero_description, p.hero_status,
        p.about_title, JSON.stringify(p.about_paragraphs || []), p.profile_image_url,
        p.sgpa, p.internships_count,
        p.github_url, p.linkedin_url, p.email, p.phone, p.resume_url,
        p.leetcode_handle, p.codeforces_handle, p.codechef_handle,
        user.id
      ]);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Portfolio update error:', error);
    return NextResponse.json(
      { error: 'Failed to update portfolio' },
      { status: 500 }
    );
  }
}
