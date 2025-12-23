// app/api/profile/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// Admin user profile data
const ADMIN_PROFILE = {
  id: 1,
  userId: 1,
  headline: 'Full-Stack Developer & Competitive Programmer',
  bio: 'Passionate about building elegant solutions and solving complex problems through competitive programming.',
  location: 'India',
  university: 'Your University',
  degree: 'B.Tech in Computer Science',
  graduationYear: '2025',
  sgpa: '8.5',
  openToOpportunities: true,
  phone: '',
  linkedin: 'https://linkedin.com/in/rishabacharjee',
  github: 'https://github.com/rishabacharjee',
};

const ADMIN_CODING_PROFILES = [
  { platform: 'leetcode', username: 'Rishab_Acharjee' },
  { platform: 'codeforces', username: 'rishab.acharjee12345' },
  { platform: 'codechef', username: 'rishabacharjee' },
  { platform: 'gfg', username: 'rishabacharjee12345' },
];

const ADMIN_USER = {
  id: 1,
  email: 'rishab.acharjee12345@gmail.com',
  username: 'rishab_acharjee',
  name: 'Rishab Acharjee',
  profileComplete: true,
};

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('session_token')?.value;

    if (!sessionToken) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      profile: ADMIN_PROFILE,
      codingProfiles: ADMIN_CODING_PROFILES,
      user: ADMIN_USER
    });

  } catch (error: any) {
    console.error('Profile fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('session_token')?.value;

    if (!sessionToken) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // For now, just acknowledge the save
    // In a real implementation, this would save to a database
    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('Profile save error:', error);
    return NextResponse.json(
      { error: 'Failed to save profile' },
      { status: 500 }
    );
  }
}
