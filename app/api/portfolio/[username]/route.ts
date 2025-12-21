// app/api/portfolio/[username]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// GET - Get public portfolio by username
export async function GET(
  request: NextRequest,
  { params }: { params: { username: string } }
) {
  try {
    const { username } = params;

    // Find user by username
    const userResult = await query(
      'SELECT id, username, name, theme, profile_complete FROM users WHERE username = $1',
      [username]
    );

    if (userResult.rows.length === 0) {
      return NextResponse.json({ error: 'Portfolio not found' }, { status: 404 });
    }

    const user = userResult.rows[0];

    // Check if profile is complete
    if (!user.profile_complete) {
      return NextResponse.json({ error: 'Portfolio not yet published' }, { status: 404 });
    }

    // Fetch all public profile data
    const [
      profileResult,
      experiencesResult,
      projectsResult,
      skillsResult,
      skillProgressResult,
      achievementsResult,
      codingProfilesResult,
      contactResult,
      featureCardsResult
    ] = await Promise.all([
      query('SELECT * FROM user_profiles WHERE user_id = $1', [user.id]),
      query('SELECT * FROM experiences WHERE user_id = $1 ORDER BY display_order', [user.id]),
      query('SELECT * FROM projects WHERE user_id = $1 ORDER BY display_order', [user.id]),
      query('SELECT * FROM skills WHERE user_id = $1 ORDER BY display_order', [user.id]),
      query('SELECT * FROM skill_progress WHERE user_id = $1 ORDER BY category, display_order', [user.id]),
      query('SELECT * FROM achievements WHERE user_id = $1 ORDER BY display_order', [user.id]),
      query('SELECT * FROM coding_profiles WHERE user_id = $1', [user.id]),
      query('SELECT * FROM contact_info WHERE user_id = $1', [user.id]),
      query('SELECT * FROM feature_cards WHERE user_id = $1 ORDER BY display_order', [user.id])
    ]);

    // Transform data for frontend
    const profile = profileResult.rows[0];
    const contact = contactResult.rows[0];

    // Transform skills from array to object format
    const skillsObject: Record<string, any> = {};
    for (const skill of skillsResult.rows) {
      skillsObject[skill.category] = {
        icon: skill.icon,
        items: skill.items
      };
    }

    // Transform skill progress
    const skillProgressObject: Record<string, any> = {};
    for (const sp of skillProgressResult.rows) {
      if (!skillProgressObject[sp.category]) {
        skillProgressObject[sp.category] = { skills: [] };
      }
      skillProgressObject[sp.category].skills.push({
        name: sp.skill_name,
        percentage: sp.percentage
      });
    }

    // Transform coding profiles to handles format
    const handles: Record<string, string> = {};
    for (const cp of codingProfilesResult.rows) {
      handles[cp.platform] = cp.username;
    }

    return NextResponse.json({
      user: {
        username: user.username,
        name: user.name,
        theme: user.theme
      },
      profile: profile ? {
        headline: profile.headline,
        bio: profile.bio,
        location: profile.location,
        university: profile.university,
        degree: profile.degree,
        graduationYear: profile.graduation_year,
        sgpa: profile.sgpa,
        profilePhotoUrl: profile.profile_photo_url,
        resumeUrl: profile.resume_url,
        openToOpportunities: profile.open_to_opportunities
      } : null,
      experiences: experiencesResult.rows.map(exp => ({
        company: exp.company,
        role: exp.role,
        period: exp.period,
        location: exp.location,
        type: exp.type,
        certificationLink: exp.certification_link,
        highlights: exp.highlights
      })),
      projects: projectsResult.rows.map(proj => ({
        title: proj.title,
        date: proj.date,
        description: proj.description,
        tech: proj.tech,
        highlights: proj.highlights,
        github: proj.github_url,
        demo: proj.demo_url,
        image: proj.image_url,
        color: proj.color
      })),
      skills: skillsObject,
      skillsWithProgress: skillProgressObject,
      achievements: achievementsResult.rows.map(ach => ({
        title: ach.title,
        description: ach.description,
        highlight: ach.highlight,
        subtext: ach.subtext,
        icon: ach.icon,
        color: ach.color
      })),
      handles,
      contact: contact ? {
        email: contact.email,
        phone: contact.phone,
        linkedin: contact.linkedin_url,
        github: contact.github_url,
        twitter: contact.twitter_url,
        website: contact.website_url
      } : null,
      featureCards: featureCardsResult.rows.map(card => ({
        icon: card.icon,
        title: card.title,
        description: card.description
      }))
    });

  } catch (error) {
    console.error('Portfolio fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch portfolio' }, { status: 500 });
  }
}