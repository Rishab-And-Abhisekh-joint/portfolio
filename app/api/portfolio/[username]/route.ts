// app/api/portfolio/[username]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// GET - Get public portfolio by username
export async function GET(
  request: NextRequest,
  { params }: { params: { username: string } }
) {
  try {
    const { username } = params;

    // Find user by username
    const userResult = await pool.query(
      'SELECT id, username, name, email, theme, profile_complete FROM users WHERE username = $1',
      [username]
    );

    if (userResult.rows.length === 0) {
      return NextResponse.json({ error: 'Portfolio not found' }, { status: 404 });
    }

    const user = userResult.rows[0];

    // Initialize response data with user basics
    const responseData: any = {
      id: user.id,
      username: user.username,
      name: user.name,
      email: user.email,
      theme: user.theme || 'ocean',
      profileComplete: user.profile_complete
    };

    // Try to fetch profile data - handle missing tables gracefully
    try {
      const profileResult = await pool.query(
        'SELECT * FROM user_profiles WHERE user_id = $1',
        [user.id]
      );
      if (profileResult.rows.length > 0) {
        const profile = profileResult.rows[0];
        responseData.headline = profile.headline;
        responseData.bio = profile.bio;
        responseData.location = profile.location;
        responseData.website = profile.website;
        responseData.github = profile.github;
        responseData.linkedin = profile.linkedin;
        responseData.twitter = profile.twitter;
        responseData.leetcode = profile.leetcode;
        responseData.codeforces = profile.codeforces;
        responseData.codechef = profile.codechef;
      }
    } catch (e) {
      // Table might not exist yet
    }

    // Try to fetch experiences
    try {
      const expResult = await pool.query(
        'SELECT * FROM experiences WHERE user_id = $1 ORDER BY start_date DESC',
        [user.id]
      );
      responseData.experiences = expResult.rows;
    } catch (e) {
      responseData.experiences = [];
    }

    // Try to fetch projects
    try {
      const projResult = await pool.query(
        'SELECT * FROM projects WHERE user_id = $1 ORDER BY created_at DESC',
        [user.id]
      );
      responseData.projects = projResult.rows;
    } catch (e) {
      responseData.projects = [];
    }

    // Try to fetch skills
    try {
      const skillsResult = await pool.query(
        'SELECT * FROM skills WHERE user_id = $1',
        [user.id]
      );
      responseData.skills = skillsResult.rows;
    } catch (e) {
      responseData.skills = [];
    }

    // Try to fetch coding profiles
    try {
      const codingResult = await pool.query(
        'SELECT * FROM coding_profiles WHERE user_id = $1',
        [user.id]
      );
      if (codingResult.rows.length > 0) {
        const coding = codingResult.rows[0];
        responseData.leetcode = responseData.leetcode || coding.leetcode;
        responseData.codeforces = responseData.codeforces || coding.codeforces;
        responseData.codechef = responseData.codechef || coding.codechef;
        responseData.github = responseData.github || coding.github;
      }
    } catch (e) {
      // Table might not exist
    }

    // Try to fetch contact info
    try {
      const contactResult = await pool.query(
        'SELECT * FROM contact_info WHERE user_id = $1',
        [user.id]
      );
      if (contactResult.rows.length > 0) {
        const contact = contactResult.rows[0];
        responseData.phone = contact.phone;
        responseData.location = responseData.location || contact.location;
        responseData.linkedin = responseData.linkedin || contact.linkedin_url;
        responseData.github = responseData.github || contact.github_url;
        responseData.website = responseData.website || contact.website_url;
      }
    } catch (e) {
      // Table might not exist
    }

    return NextResponse.json(responseData);

  } catch (error) {
    console.error('Portfolio fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch portfolio' }, { status: 500 });
  }
}