// app/portfolio/[username]/page.tsx
// This is a PAGE component - publicly accessible without auth
import { Metadata } from 'next';
import { Pool } from 'pg';
import { notFound } from 'next/navigation';
import PublicPortfolio from './PublicPortfolio';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// Generate metadata for SEO
export async function generateMetadata({ 
  params 
}: { 
  params: { username: string } 
}): Promise<Metadata> {
  try {
    const result = await pool.query(
      'SELECT name, username FROM users WHERE username = $1',
      [params.username]
    );
    
    if (result.rows.length === 0) {
      return { title: 'Portfolio Not Found' };
    }
    
    const user = result.rows[0];
    return {
      title: `${user.name} | Portfolio`,
      description: `View ${user.name}'s developer portfolio`,
    };
  } catch {
    return { title: 'Portfolio' };
  }
}

// Server component that fetches data and renders the portfolio
// NO AUTHENTICATION REQUIRED - This is a public page
export default async function PortfolioPage({ 
  params 
}: { 
  params: { username: string } 
}) {
  const { username } = params;

  try {
    // Fetch user
    const userResult = await pool.query(
      'SELECT id, username, name, email, theme, profile_complete FROM users WHERE username = $1',
      [username]
    );

    if (userResult.rows.length === 0) {
      notFound();
    }

    const user = userResult.rows[0];

    // Build portfolio data
    const portfolioData: any = {
      id: user.id,
      username: user.username,
      name: user.name,
      email: user.email,
      theme: user.theme || 'ocean',
      profileComplete: user.profile_complete,
      experiences: [],
      projects: [],
      skills: [],
    };

    // Fetch profile data
    try {
      const profileResult = await pool.query(
        'SELECT * FROM user_profiles WHERE user_id = $1',
        [user.id]
      );
      if (profileResult.rows.length > 0) {
        const profile = profileResult.rows[0];
        portfolioData.headline = profile.headline;
        portfolioData.bio = profile.bio;
        portfolioData.location = profile.location;
        portfolioData.university = profile.university;
        portfolioData.degree = profile.degree;
        portfolioData.graduationYear = profile.graduation_year;
        portfolioData.sgpa = profile.sgpa;
        portfolioData.website = profile.website;
        portfolioData.github = profile.github;
        portfolioData.linkedin = profile.linkedin;
        portfolioData.leetcode = profile.leetcode;
        portfolioData.codeforces = profile.codeforces;
        portfolioData.codechef = profile.codechef;
        portfolioData.openToOpportunities = profile.open_to_opportunities;
      }
    } catch (e) {
      console.error('Error fetching profile:', e);
    }

    // Fetch experiences
    try {
      const expResult = await pool.query(
        'SELECT * FROM experiences WHERE user_id = $1 ORDER BY display_order, created_at DESC',
        [user.id]
      );
      portfolioData.experiences = expResult.rows.map(exp => ({
        id: exp.id,
        company: exp.company,
        title: exp.role || exp.title,
        role: exp.role || exp.title,
        period: exp.period,
        location: exp.location,
        type: exp.type,
        description: exp.description,
        highlights: exp.highlights || [],
        start_date: exp.start_date,
        end_date: exp.end_date
      }));
    } catch (e) {
      console.error('Error fetching experiences:', e);
    }

    // Fetch projects
    try {
      const projResult = await pool.query(
        'SELECT * FROM projects WHERE user_id = $1 ORDER BY display_order',
        [user.id]
      );
      portfolioData.projects = projResult.rows.map(proj => ({
        id: proj.id,
        title: proj.title,
        description: proj.description,
        technologies: proj.tech || proj.technologies,
        github_url: proj.github_url,
        live_url: proj.demo_url || proj.live_url,
        image_url: proj.image_url,
        date: proj.date
      }));
    } catch (e) {
      console.error('Error fetching projects:', e);
    }

    // Fetch skills
    try {
      const skillsResult = await pool.query(
        'SELECT * FROM skills WHERE user_id = $1 ORDER BY display_order',
        [user.id]
      );
      portfolioData.skills = skillsResult.rows.map(skill => ({
        id: skill.id,
        name: skill.category,
        category: skill.category,
        items: skill.items || []
      }));
    } catch (e) {
      console.error('Error fetching skills:', e);
    }

    // Fetch achievements
    try {
      const achResult = await pool.query(
        'SELECT * FROM achievements WHERE user_id = $1 ORDER BY display_order',
        [user.id]
      );
      portfolioData.achievements = achResult.rows;
    } catch (e) {
      console.error('Error fetching achievements:', e);
    }

    // Fetch coding profiles
    try {
      const codingResult = await pool.query(
        'SELECT * FROM coding_profiles WHERE user_id = $1',
        [user.id]
      );
      for (const cp of codingResult.rows) {
        portfolioData[cp.platform] = cp.username;
      }
    } catch (e) {
      console.error('Error fetching coding profiles:', e);
    }

    // Fetch contact info
    try {
      const contactResult = await pool.query(
        'SELECT * FROM contact_info WHERE user_id = $1',
        [user.id]
      );
      if (contactResult.rows.length > 0) {
        const contact = contactResult.rows[0];
        portfolioData.email = contact.email || portfolioData.email;
        portfolioData.phone = contact.phone;
        portfolioData.linkedin = contact.linkedin_url || portfolioData.linkedin;
        portfolioData.github = contact.github_url || portfolioData.github;
        portfolioData.twitter = contact.twitter_url;
        portfolioData.website = contact.website_url || portfolioData.website;
      }
    } catch (e) {
      console.error('Error fetching contact:', e);
    }

    return <PublicPortfolio data={portfolioData} />;

  } catch (error) {
    console.error('Portfolio page error:', error);
    notFound();
  }
}